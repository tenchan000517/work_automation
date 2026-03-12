/**
 * タスク管理システム - リマインド・通知
 *
 * 毎日のリマインドメール、週次棚卸しサマリー、各種通知を担当。
 * 時限トリガーで自動実行される。
 *
 * 依存: taskSheetManager.js（task_getAllTasks, task_getMembers, task_getManagers, task_getSystemSetting）
 */

// ================================================================================
// ===== トリガー管理 =====
// ================================================================================

/**
 * リマインドトリガーをセットアップ
 * 既存の task_sendDailyReminder トリガーを削除してから再作成
 * @returns {{success: boolean, triggersCreated: number}}
 */
function task_setupRemindTriggers() {
  try {
    // 既存トリガーを削除
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'task_sendDailyReminder') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    var created = 0;
    var timeSlots = [
      task_getSystemSetting('リマインド時間1'),
      task_getSystemSetting('リマインド時間2'),
      task_getSystemSetting('リマインド時間3')
    ];

    for (var j = 0; j < timeSlots.length; j++) {
      var timeStr = timeSlots[j];
      if (!timeStr) continue;

      var parts = timeStr.split(':');
      var hour = parseInt(parts[0], 10);
      if (isNaN(hour)) continue;

      ScriptApp.newTrigger('task_sendDailyReminder')
        .timeBased()
        .atHour(hour)
        .everyDays(1)
        .create();
      created++;
    }

    return { success: true, triggersCreated: created };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * 週次棚卸しトリガーをセットアップ
 * @returns {{success: boolean}}
 */
function task_setupWeeklyReviewTrigger() {
  try {
    // 既存トリガーを削除
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'task_sendWeeklyReview') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    var dayStr = task_getSystemSetting('棚卸し曜日') || '月曜';
    var timeStr = task_getSystemSetting('棚卸し時間') || '08:30';

    var dayMap = {
      '月曜': ScriptApp.WeekDay.MONDAY,
      '火曜': ScriptApp.WeekDay.TUESDAY,
      '水曜': ScriptApp.WeekDay.WEDNESDAY,
      '木曜': ScriptApp.WeekDay.THURSDAY,
      '金曜': ScriptApp.WeekDay.FRIDAY,
      '土曜': ScriptApp.WeekDay.SATURDAY,
      '日曜': ScriptApp.WeekDay.SUNDAY
    };

    var weekDay = dayMap[dayStr] || ScriptApp.WeekDay.MONDAY;
    var hour = parseInt(timeStr.split(':')[0], 10) || 8;

    ScriptApp.newTrigger('task_sendWeeklyReview')
      .timeBased()
      .onWeekDay(weekDay)
      .atHour(hour)
      .create();

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ================================================================================
// ===== 日次リマインド =====
// ================================================================================

/**
 * 日次リマインドメールを送信（トリガーから呼ばれる）
 */
function task_sendDailyReminder() {
  var tasks = task_getAllTasks({ status: '未完了' });
  if (tasks.length === 0) return;

  // 担当者別にグルーピング
  var byAssignee = {};
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (t.urgency !== 'overdue' && t.urgency !== 'today' && t.urgency !== 'tomorrow') continue;
    var key = t.assignee || '未割当';
    if (!byAssignee[key]) byAssignee[key] = { overdue: [], today: [], tomorrow: [] };
    byAssignee[key][t.urgency].push(t);
  }

  var members = task_getMembers();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'M/d');

  var assignees = Object.keys(byAssignee);
  for (var j = 0; j < assignees.length; j++) {
    var assigneeName = assignees[j];
    var group = byAssignee[assigneeName];
    var totalCount = group.overdue.length + group.today.length + group.tomorrow.length;
    if (totalCount === 0) continue;

    var body = '\uD83D\uDCCB タスクリマインド（' + today + '）\n\n';

    if (group.overdue.length > 0) {
      body += '\uD83D\uDD34 期限超過（' + group.overdue.length + '件）\n';
      for (var k = 0; k < group.overdue.length; k++) {
        body += '  ' + group.overdue[k].id + ' ' + group.overdue[k].title + '（期限：' + group.overdue[k].deadline + '）\n';
      }
      body += '\n';
    }

    if (group.today.length > 0) {
      body += '\uD83D\uDFE1 本日期限（' + group.today.length + '件）\n';
      for (var l = 0; l < group.today.length; l++) {
        body += '  ' + group.today[l].id + ' ' + group.today[l].title + '\n';
      }
      body += '\n';
    }

    if (group.tomorrow.length > 0) {
      body += '\uD83D\uDFE2 明日期限（' + group.tomorrow.length + '件）\n';
      for (var m = 0; m < group.tomorrow.length; m++) {
        body += '  ' + group.tomorrow[m].id + ' ' + group.tomorrow[m].title + '\n';
      }
    }

    // 要件定義待ちの大タスクを追加
    var reqPendingTasks = tasks.filter(function(t) {
      return t.assignee === assigneeName && t.size === '大' && !t.requirementDef;
    });
    if (reqPendingTasks.length > 0) {
      body += '\uD83D\uDCDD 要件定義待ち（' + reqPendingTasks.length + '件）\n';
      for (var p = 0; p < reqPendingTasks.length; p++) {
        body += '  ' + reqPendingTasks[p].id + ' ' + reqPendingTasks[p].title + '（大・要件定義してから着手）\n';
      }
      body += '\n';
    }

    task_notifyAssignee(assigneeName, '\uD83D\uDCCB タスクリマインド（' + today + '）', body);
  }
}

// ================================================================================
// ===== 週次棚卸しサマリー =====
// ================================================================================

/**
 * 週次棚卸しサマリーメールを送信（トリガーから呼ばれる）
 */
function task_sendWeeklyReview() {
  var tasks = task_getAllTasks({ status: '未完了' });
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'M/d');

  // 集計
  var overdue = 0;
  var thisWeek = 0;
  var byAssignee = {};

  var now = new Date();
  var weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var assignee = t.assignee || '未割当';
    if (!byAssignee[assignee]) byAssignee[assignee] = 0;
    byAssignee[assignee]++;

    if (t.urgency === 'overdue') overdue++;
    if (t.deadline) {
      var dl = new Date(t.deadline);
      if (dl >= now && dl <= weekEnd) thisWeek++;
    }
  }

  var body = '\uD83D\uDCCB 週次タスク棚卸し（' + today + '）\n\n';
  body += '未完了タスク：' + tasks.length + '件\n';
  body += '\uD83D\uDD34 期限超過：' + overdue + '件\n';
  body += '\uD83D\uDFE1 今週期限：' + thisWeek + '件\n\n';

  body += '【担当者別】\n';
  var assigneeKeys = Object.keys(byAssignee).sort();
  for (var j = 0; j < assigneeKeys.length; j++) {
    body += '  ' + assigneeKeys[j] + '：' + byAssignee[assigneeKeys[j]] + '件\n';
  }

  // 要件定義待ち集計
  var reqPendingLarge = 0, reqPendingMedium = 0;
  for (var r = 0; r < tasks.length; r++) {
    if (!tasks[r].requirementDef) {
      if (tasks[r].size === '大') reqPendingLarge++;
      else if (tasks[r].size === '中') reqPendingMedium++;
    }
  }
  var reqTotal = reqPendingLarge + reqPendingMedium;
  if (reqTotal > 0) {
    var reqDetail = [];
    if (reqPendingLarge > 0) reqDetail.push('大' + reqPendingLarge + '件');
    if (reqPendingMedium > 0) reqDetail.push('中' + reqPendingMedium + '件');
    body += '\uD83D\uDCDD 要件定義待ち：' + reqTotal + '件（' + reqDetail.join('・') + '）\n';
  }
  body += '\n';

  body += '【期限超過タスク】\n';
  for (var k = 0; k < tasks.length; k++) {
    if (tasks[k].urgency === 'overdue') {
      body += '  ' + tasks[k].id + ' ' + tasks[k].title + '（' + tasks[k].assignee + '・期限：' + tasks[k].deadline + '）\n';
    }
  }

  task_notifyManagers('\uD83D\uDCCB 週次タスク棚卸し（' + today + '）', body);
}

// ================================================================================
// ===== 通知ヘルパー =====
// ================================================================================

/**
 * 管理者全員にメール通知
 * @param {string} subject
 * @param {string} body
 */
function task_notifyManagers(subject, body) {
  var managers = task_getManagers();
  if (managers.length === 0) return;

  var quota = MailApp.getRemainingDailyQuota();
  if (quota <= 0) return;

  for (var i = 0; i < managers.length; i++) {
    if (!managers[i].email) continue;
    try {
      MailApp.sendEmail({
        to: managers[i].email,
        subject: subject,
        body: body
      });
    } catch (e) {
      // 個別メール送信エラーは無視して継続
    }
  }
}

/**
 * 担当者にメール通知
 * @param {string} assigneeName
 * @param {string} subject
 * @param {string} body
 */
function task_notifyAssignee(assigneeName, subject, body) {
  var members = task_getMembers();
  for (var i = 0; i < members.length; i++) {
    if (members[i].name === assigneeName && members[i].email) {
      try {
        MailApp.sendEmail({
          to: members[i].email,
          subject: subject,
          body: body
        });
      } catch (e) { /* ignore */ }
      return;
    }
  }
}

/**
 * 完了報告通知（担当者→管理者）
 * @param {Object} taskData
 */
function task_sendCompletionNotification(taskData) {
  var subject = '\uD83D\uDCCB 完了報告: ' + taskData.id + ' ' + taskData.title;
  var body = taskData.id + '（' + taskData.title + '）が完了報告されました。\n\n' +
    '担当：' + taskData.assignee + '\n' +
    'コメント：' + (taskData.completionComment || 'なし') + '\n' +
    '完了条件：' + taskData.doneCriteria + '\n\n' +
    'スプレッドシートを開いて確認してください。';
  task_notifyManagers(subject, body);
}

/**
 * 承認/差し戻し通知（管理者→担当者）
 * @param {Object} taskData
 * @param {boolean} approved
 * @param {string} reason - 差し戻し理由
 */
function task_sendApprovalNotification(taskData, approved, reason) {
  if (approved) {
    var subject = '\u2705 承認: ' + taskData.id + ' ' + taskData.title;
    var body = taskData.id + '（' + taskData.title + '）が承認されました。\nお疲れさまでした！';
    task_notifyAssignee(taskData.assignee, subject, body);
  } else {
    var subjectR = '\u21A9\uFE0F 差し戻し: ' + taskData.id + ' ' + taskData.title;
    var bodyR = taskData.id + '（' + taskData.title + '）が差し戻されました。\n\n' +
      '理由：' + (reason || '（理由なし）') + '\n\n' +
      '対応後、再度完了報告をお願いします。';
    task_notifyAssignee(taskData.assignee, subjectR, bodyR);
  }
}
