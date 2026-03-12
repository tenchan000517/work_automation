/**
 * タスク管理システム - カレンダー連携
 *
 * Googleカレンダーにタスクの期限イベントを作成・更新・削除する。
 * 担当者のカレンダーIDがあればそれを、なければデフォルトカレンダーを使用。
 *
 * 依存: taskSheetManager.js（task_getMembers, task_getSystemSetting）
 */

// ================================================================================
// ===== カレンダーイベント作成 =====
// ================================================================================

/**
 * タスクのカレンダーイベントを作成
 * @param {Object} taskData - {taskId, title, assignee, deadline, doneCriteria, notes, scopeIn, scopeOut}
 * @returns {{success: boolean, eventId?: string, error?: string}}
 */
function task_createCalendarEvent(taskData) {
  try {
    if (!taskData.deadline) {
      return { success: false, error: '期限が設定されていないため、カレンダー登録をスキップしました' };
    }

    var deadlineDate = new Date(taskData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      return { success: false, error: '期限の日付形式が不正です' };
    }

    // 担当者のカレンダーIDを検索
    var calendarId = null;
    if (taskData.assignee) {
      var members = task_getMembers();
      for (var i = 0; i < members.length; i++) {
        if (members[i].name === taskData.assignee && members[i].calendarId) {
          calendarId = members[i].calendarId;
          break;
        }
      }
    }

    // カレンダー取得
    var calendar;
    if (calendarId) {
      calendar = CalendarApp.getCalendarById(calendarId);
    }
    if (!calendar) {
      calendar = CalendarApp.getDefaultCalendar();
    }

    // イベントタイトル
    var eventTitle = '\uD83D\uDCCB ' + taskData.taskId + ' ' + taskData.title;

    // イベント説明
    var description = task_formatEventDescription(taskData);

    // 終日イベントを作成
    var event = calendar.createAllDayEvent(eventTitle, deadlineDate, {
      description: description
    });

    // リマインダー設定
    event.removeAllReminders();
    var reminder1 = task_getSystemSetting('カレンダーリマインド1');
    var reminder2 = task_getSystemSetting('カレンダーリマインド2');

    if (reminder1) {
      var minutes1 = task_parseReminderToMinutes(reminder1);
      if (minutes1 > 0) event.addPopupReminder(minutes1);
    }
    if (reminder2) {
      var minutes2 = task_parseReminderToMinutes(reminder2);
      if (minutes2 > 0) event.addPopupReminder(minutes2);
    }

    return { success: true, eventId: event.getId() };
  } catch (e) {
    return { success: false, error: 'カレンダー登録エラー: ' + e.message };
  }
}

// ================================================================================
// ===== イベント説明フォーマット =====
// ================================================================================

/**
 * カレンダーイベントの説明文をフォーマット
 * @param {Object} taskData
 * @returns {string}
 */
function task_formatEventDescription(taskData) {
  var lines = [];
  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('担当：' + (taskData.assignee || '未定'));
  lines.push('状態：未着手');
  lines.push('');

  if (taskData.doneCriteria) {
    lines.push('【完了条件】');
    lines.push(taskData.doneCriteria);
    lines.push('');
  }

  if (taskData.scopeIn) {
    lines.push('【やること】');
    var scopeInItems = taskData.scopeIn.split(/[、,\n]/);
    for (var i = 0; i < scopeInItems.length; i++) {
      var item = scopeInItems[i].trim();
      if (item) lines.push('・' + item);
    }
    lines.push('');
  }

  if (taskData.scopeOut) {
    lines.push('【やらないこと】');
    var scopeOutItems = taskData.scopeOut.split(/[、,\n]/);
    for (var j = 0; j < scopeOutItems.length; j++) {
      var outItem = scopeOutItems[j].trim();
      if (outItem) lines.push('・' + outItem);
    }
    lines.push('');
  }

  if (taskData.notes) {
    lines.push('【備考】');
    lines.push(taskData.notes);
    lines.push('');
  }

  lines.push('登録日：' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
  lines.push('━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

// ================================================================================
// ===== カレンダーイベント更新・削除 =====
// ================================================================================

/**
 * カレンダーイベントを更新
 * @param {string} taskId
 * @param {string} eventId
 * @param {Object} updates - {title?, status?, deadline?}
 * @returns {{success: boolean, error?: string}}
 */
function task_updateCalendarEvent(taskId, eventId, updates) {
  try {
    if (!eventId) return { success: false, error: 'イベントIDがありません' };

    var event = CalendarApp.getEventById(eventId);
    if (!event) {
      // 担当者カレンダーから検索
      var members = task_getMembers();
      for (var i = 0; i < members.length; i++) {
        if (members[i].calendarId) {
          var cal = CalendarApp.getCalendarById(members[i].calendarId);
          if (cal) {
            event = cal.getEventById(eventId);
            if (event) break;
          }
        }
      }
    }
    if (!event) return { success: false, error: 'カレンダーイベントが見つかりません' };

    if (updates.title) {
      event.setTitle(updates.title);
    }
    if (updates.status === '完了') {
      var currentTitle = event.getTitle();
      if (currentTitle.indexOf('\u2705') === -1) {
        event.setTitle('\u2705 ' + currentTitle);
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: 'カレンダー更新エラー: ' + e.message };
  }
}

/**
 * カレンダーイベントを削除
 * @param {string} eventId
 * @param {string} calendarId
 * @returns {{success: boolean, error?: string}}
 */
function task_deleteCalendarEvent(eventId, calendarId) {
  try {
    if (!eventId) return { success: false, error: 'イベントIDがありません' };

    var calendar;
    if (calendarId) {
      calendar = CalendarApp.getCalendarById(calendarId);
    }
    if (!calendar) {
      calendar = CalendarApp.getDefaultCalendar();
    }

    var event = calendar.getEventById(eventId);
    if (event) {
      event.deleteEvent();
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: 'カレンダー削除エラー: ' + e.message };
  }
}

// ================================================================================
// ===== ヘルパー =====
// ================================================================================

/**
 * リマインド設定文字列を分単位に変換
 * 例: "前日 09:00" → 900 (15時間 = 前日9時 → 当日0時まで)
 *      "当日 09:00" → 540 (9時間)
 * @param {string} reminderStr
 * @returns {number} 分数（0なら無効）
 */
function task_parseReminderToMinutes(reminderStr) {
  if (!reminderStr) return 0;

  var parts = reminderStr.split(/\s+/);
  if (parts.length < 2) return 0;

  var dayPart = parts[0];
  var timePart = parts[1];
  var timeSplit = timePart.split(':');
  if (timeSplit.length < 2) return 0;

  var hours = parseInt(timeSplit[0], 10);
  var mins = parseInt(timeSplit[1], 10);
  if (isNaN(hours) || isNaN(mins)) return 0;

  // 終日イベントのリマインダーは「イベント日の0:00からの分数前」
  // 前日 09:00 → イベント日0:00の15時間前 = 900分前
  // 当日 09:00 → イベント日0:00の-9時間前（GASではイベント当日のリマインダーは正の分数）
  if (dayPart === '前日') {
    return (24 - hours) * 60 - mins;
  } else if (dayPart === '当日') {
    // 終日イベントの当日リマインダーは、イベント日の指定時刻に通知
    // GASでは分数で指定: 当日9:00 = 0分前（終日イベントのデフォルト時刻）
    // 実際にはポップアップリマインダーの分数指定
    return hours * 60 + mins;
  }

  return 0;
}
