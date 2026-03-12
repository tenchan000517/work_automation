/**
 * タスク管理システム - シート操作（データアクセス層）
 *
 * スプレッドシートの読み書き、ID採番、テンプレート初期設定を担当。
 * LockServiceによる競合対策あり。
 *
 * 依存: なし
 */

// ================================================================================
// ===== 定数 =====
// ================================================================================

const TASK_SHEET_NAMES = {
  TASK_LIST: 'タスク一覧',
  SETTINGS: '設定',
  LOG: 'ログ'
};

const TASK_COLUMNS = {
  ID: 1,        // A
  STATUS: 2,    // B
  ASSIGNEE: 3,  // C
  TITLE: 4,     // D
  DEADLINE: 5,  // E
  DONE_CRITERIA: 6, // F
  REG_DATE: 7,  // G
  INPUT_MODE: 8,    // H
  COMPLETION_COMMENT: 9,  // I
  APPROVAL_NOTE: 10,      // J
  NOTES: 11     // K
};

const TASK_STATUSES = ['未着手', '進行中', '完了報告済み', '完了', '差し戻し', '保留'];

// 設定シートのエリア2（システム設定）の列
const TASK_SETTING_KEY_COL = 7;   // G列
const TASK_SETTING_VAL_COL = 8;   // H列

// ================================================================================
// ===== 担当者関連 =====
// ================================================================================

/**
 * 設定シートから担当者一覧を取得
 * @returns {Array<{name:string, email:string, calendarId:string, role:string}>}
 */
function task_getMembers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var members = [];
  for (var i = 0; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (!name) continue;
    members.push({
      name: name,
      email: String(data[i][1] || '').trim(),
      calendarId: String(data[i][2] || '').trim(),
      role: String(data[i][3] || '担当者').trim()
    });
  }
  return members;
}

/**
 * 担当者名の一覧を取得
 * @returns {string[]}
 */
function task_getMemberNames() {
  return task_getMembers().map(function(m) { return m.name; });
}

/**
 * 管理者一覧を取得
 * @returns {Array<{name:string, email:string}>}
 */
function task_getManagers() {
  return task_getMembers().filter(function(m) {
    return m.role === '管理者';
  });
}

// ================================================================================
// ===== システム設定 =====
// ================================================================================

/**
 * システム設定を取得
 * @param {string} key - 設定名
 * @returns {string}
 */
function task_getSystemSetting(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
  if (!sheet) return '';

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return '';

  var data = sheet.getRange(2, TASK_SETTING_KEY_COL, lastRow - 1, 2).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      return String(data[i][1] || '').trim();
    }
  }
  return '';
}

/**
 * システム設定を保存
 * @param {string} key - 設定名
 * @param {string} value - 設定値
 * @returns {{success: boolean}}
 */
function task_setSystemSetting(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
  if (!sheet) return { success: false, error: '設定シートが見つかりません' };

  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var data = sheet.getRange(2, TASK_SETTING_KEY_COL, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        sheet.getRange(i + 2, TASK_SETTING_VAL_COL).setValue(value);
        return { success: true };
      }
    }
  }

  // キーが見つからない場合は新規行に追加
  var newRow = lastRow + 1;
  sheet.getRange(newRow, TASK_SETTING_KEY_COL).setValue(key);
  sheet.getRange(newRow, TASK_SETTING_VAL_COL).setValue(value);
  return { success: true };
}

// ================================================================================
// ===== タスクCRUD =====
// ================================================================================

/**
 * 新しいタスクIDを生成（T-001形式）
 * @returns {string}
 */
function task_generateId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  if (!sheet) return 'T-001';

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'T-001';

  var ids = sheet.getRange(2, TASK_COLUMNS.ID, lastRow - 1, 1).getValues();
  var maxNum = 0;
  for (var i = 0; i < ids.length; i++) {
    var match = String(ids[i][0]).match(/T-(\d+)/);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  var next = maxNum + 1;
  return 'T-' + ('000' + next).slice(-3);
}

/**
 * タスクを1件登録
 * @param {Object} taskData - {title, assignee, deadline, doneCriteria, inputMode, notes}
 * @returns {{success: boolean, taskId?: string, error?: string}}
 */
function task_registerTask(taskData) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, error: '他の処理が実行中です。しばらく待ってから再試行してください。' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
    if (!sheet) return { success: false, error: 'タスク一覧シートが見つかりません' };

    var taskId = task_generateId();
    var now = new Date();
    var row = [
      taskId,                                    // A: ID
      '未着手',                                  // B: 状態
      taskData.assignee || '',                   // C: 担当者
      taskData.title || '',                      // D: タスク名
      taskData.deadline || '',                   // E: 期限
      taskData.doneCriteria || '',               // F: 完了条件
      now,                                       // G: 登録日
      taskData.inputMode || '',                  // H: 入力モード
      '',                                        // I: 完了報告コメント
      '',                                        // J: 承認者/差し戻し理由
      taskData.notes || ''                       // K: 備考
    ];

    sheet.appendRow(row);
    return { success: true, taskId: taskId };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 複数タスクを一括登録
 * @param {Array} tasksArray - taskDataの配列
 * @returns {{success: boolean, taskIds?: string[], error?: string}}
 */
function task_registerMultipleTasks(tasksArray) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, error: '他の処理が実行中です。しばらく待ってから再試行してください。' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
    if (!sheet) return { success: false, error: 'タスク一覧シートが見つかりません' };

    var taskIds = [];
    var now = new Date();
    var rows = [];

    for (var i = 0; i < tasksArray.length; i++) {
      var taskData = tasksArray[i];
      var taskId = task_generateId();
      // generateIdは前の行がまだappendされていないので手動でインクリメント
      if (i > 0) {
        var prevMatch = taskIds[i - 1].match(/T-(\d+)/);
        var nextNum = parseInt(prevMatch[1], 10) + 1;
        taskId = 'T-' + ('000' + nextNum).slice(-3);
      }
      taskIds.push(taskId);
      rows.push([
        taskId,
        '未着手',
        taskData.assignee || '',
        taskData.title || '',
        taskData.deadline || '',
        taskData.doneCriteria || '',
        now,
        taskData.inputMode || '',
        '',
        '',
        taskData.notes || ''
      ]);
    }

    if (rows.length > 0) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, 11).setValues(rows);
    }

    return { success: true, taskIds: taskIds };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * タスク一覧を取得
 * @param {Object} filterOptions - {assignee?, status?, overdueOnly?}
 * @returns {Array} タスクオブジェクトの配列
 */
function task_getAllTasks(filterOptions) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  var filter = filterOptions || {};
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var tasks = [];
  for (var i = 0; i < data.length; i++) {
    var id = String(data[i][0] || '').trim();
    if (!id) continue;

    var status = String(data[i][1] || '').trim();
    var assignee = String(data[i][2] || '').trim();
    var deadline = data[i][4];
    var deadlineDate = deadline instanceof Date ? deadline : (deadline ? new Date(deadline) : null);

    // フィルタ適用
    if (filter.assignee && assignee !== filter.assignee) continue;
    if (filter.status === '未完了' && (status === '完了' || status === '保留')) continue;
    if (filter.status && filter.status !== '未完了' && filter.status !== '全て' && status !== filter.status) continue;
    if (filter.overdueOnly) {
      if (!deadlineDate || deadlineDate >= today || status === '完了' || status === '保留') continue;
    }

    var urgency = 'normal';
    if (deadlineDate && status !== '完了' && status !== '保留') {
      var diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) urgency = 'overdue';
      else if (diffDays === 0) urgency = 'today';
      else if (diffDays === 1) urgency = 'tomorrow';
    }
    if (status === '完了報告済み') urgency = 'reported';

    tasks.push({
      id: id,
      status: status,
      assignee: assignee,
      title: String(data[i][3] || '').trim(),
      deadline: deadlineDate ? Utilities.formatDate(deadlineDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      doneCriteria: String(data[i][5] || '').trim(),
      regDate: data[i][6] instanceof Date ? Utilities.formatDate(data[i][6], Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      inputMode: String(data[i][7] || '').trim(),
      completionComment: String(data[i][8] || '').trim(),
      approvalNote: String(data[i][9] || '').trim(),
      notes: String(data[i][10] || '').trim(),
      urgency: urgency,
      rowIndex: i + 2
    });
  }
  return tasks;
}

/**
 * IDでタスクを取得
 * @param {string} taskId
 * @returns {Object|null}
 */
function task_getTaskById(taskId) {
  var tasks = task_getAllTasks({});
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) return tasks[i];
  }
  return null;
}

/**
 * タスクの状態を更新
 * @param {string} taskId
 * @param {string} newStatus
 * @param {string} comment - 完了報告コメント or 承認者/差し戻し理由
 * @returns {{success: boolean, error?: string}}
 */
function task_updateTaskStatus(taskId, newStatus, comment) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, error: '他の処理が実行中です。' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
    if (!sheet) return { success: false, error: 'タスク一覧シートが見つかりません' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: false, error: 'タスクが見つかりません' };

    var ids = sheet.getRange(2, TASK_COLUMNS.ID, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === taskId) {
        var row = i + 2;
        sheet.getRange(row, TASK_COLUMNS.STATUS).setValue(newStatus);

        if (comment) {
          if (newStatus === '完了報告済み') {
            sheet.getRange(row, TASK_COLUMNS.COMPLETION_COMMENT).setValue(comment);
          } else if (newStatus === '完了' || newStatus === '差し戻し') {
            sheet.getRange(row, TASK_COLUMNS.APPROVAL_NOTE).setValue(comment);
          }
        }
        return { success: true };
      }
    }
    return { success: false, error: 'タスクID ' + taskId + ' が見つかりません' };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

// ================================================================================
// ===== ログ =====
// ================================================================================

/**
 * ログを書き込み
 * @param {string} inputMode
 * @param {string} inputText
 * @param {string} aiOutput
 * @param {string[]} taskIds
 * @returns {{success: boolean}}
 */
function task_writeLog(inputMode, inputText, aiOutput, taskIds) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TASK_SHEET_NAMES.LOG);
    if (!sheet) return { success: false, error: 'ログシートが見つかりません' };

    sheet.appendRow([
      new Date(),
      inputMode || '',
      inputText || '',
      aiOutput || '',
      (taskIds || []).join(', ')
    ]);
    // 行の高さを固定（長いJSONで行が広がるのを防止）
    var newRow = sheet.getLastRow();
    sheet.setRowHeight(newRow, 21);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ================================================================================
// ===== 設定ダイアログ用 =====
// ================================================================================

/**
 * 担当者設定を一括保存
 * @param {Array} membersArray - [{name, email, calendarId, role}]
 * @returns {{success: boolean}}
 */
function task_saveMemberSettings(membersArray) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
    if (!sheet) return { success: false, error: '設定シートが見つかりません' };

    // 既存の担当者データをクリア（A2:D以降）
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
    }

    // 新しいデータを書き込み
    if (membersArray && membersArray.length > 0) {
      var rows = membersArray.map(function(m) {
        return [m.name || '', m.email || '', m.calendarId || '', m.role || '担当者'];
      });
      sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * システム設定を一括保存
 * @param {Object} settingsObj - {key: value, ...}
 * @returns {{success: boolean}}
 */
function task_saveSystemSettings(settingsObj) {
  try {
    var keys = Object.keys(settingsObj);
    for (var i = 0; i < keys.length; i++) {
      task_setSystemSetting(keys[i], settingsObj[keys[i]]);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ================================================================================
// ===== テンプレート初期設定 =====
// ================================================================================

/**
 * テンプレート初期設定（3シート作成 + 条件付き書式 + ドロップダウン）
 * @returns {{success: boolean, message?: string}}
 */
function task_initializeTemplate() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ===== 1. タスク一覧シート =====
    var taskSheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
    if (!taskSheet) {
      taskSheet = ss.insertSheet(TASK_SHEET_NAMES.TASK_LIST);
    }

    // ヘッダー
    var headers = ['ID', '状態', '担当者', 'タスク名', '期限', '完了条件', '登録日', '入力モード', '完了報告コメント', '承認者/差し戻し理由', '備考'];
    taskSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    taskSheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // 列幅設定
    taskSheet.setColumnWidth(1, 70);   // ID
    taskSheet.setColumnWidth(2, 100);  // 状態
    taskSheet.setColumnWidth(3, 80);   // 担当者
    taskSheet.setColumnWidth(4, 250);  // タスク名
    taskSheet.setColumnWidth(5, 100);  // 期限
    taskSheet.setColumnWidth(6, 200);  // 完了条件
    taskSheet.setColumnWidth(7, 100);  // 登録日
    taskSheet.setColumnWidth(8, 100);  // 入力モード
    taskSheet.setColumnWidth(9, 200);  // 完了報告コメント
    taskSheet.setColumnWidth(10, 200); // 承認者/差し戻し理由
    taskSheet.setColumnWidth(11, 200); // 備考

    // 行固定
    taskSheet.setFrozenRows(1);

    // ドロップダウン: 状態（B列）
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(TASK_STATUSES, true)
      .setAllowInvalid(false)
      .build();
    taskSheet.getRange(2, TASK_COLUMNS.STATUS, 500, 1).setDataValidation(statusRule);

    // 条件付き書式
    var rules = [];

    // 状態「完了」→ 行をグレーアウト
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$B2="完了"')
      .setBackground('#f5f5f5')
      .setFontColor('#9e9e9e')
      .setRanges([taskSheet.getRange(2, 1, 500, 11)])
      .build());

    // 状態「完了報告済み」→ B列を青背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('完了報告済み')
      .setBackground('#bbdefb')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.STATUS, 500, 1)])
      .build());

    // 状態「差し戻し」→ B列をオレンジ背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('差し戻し')
      .setBackground('#ffe0b2')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.STATUS, 500, 1)])
      .build());

    // 期限が今日以前 & 未完了 → 期限セルを赤背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($E2<>"", $E2<=TODAY(), $B2<>"完了", $B2<>"保留")')
      .setBackground('#ffcdd2')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.DEADLINE, 500, 1)])
      .build());

    // 期限が明日 → 期限セルを黄背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($E2<>"", $E2=TODAY()+1, $B2<>"完了", $B2<>"保留")')
      .setBackground('#fff9c4')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.DEADLINE, 500, 1)])
      .build());

    taskSheet.setConditionalFormatRules(rules);

    // ===== 2. 設定シート =====
    var settingSheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
    if (!settingSheet) {
      settingSheet = ss.insertSheet(TASK_SHEET_NAMES.SETTINGS);
    }

    // エリア1: 担当者設定ヘッダー（A〜D列）
    settingSheet.getRange(1, 1, 1, 4).setValues([['担当者名', 'メールアドレス', 'カレンダーID', '役割']]);
    settingSheet.getRange(1, 1, 1, 4)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // 役割ドロップダウン（D列）
    var roleRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['管理者', '担当者'], true)
      .setAllowInvalid(false)
      .build();
    settingSheet.getRange(2, 4, 50, 1).setDataValidation(roleRule);

    // エリア2: システム設定ヘッダー（G〜H列）
    settingSheet.getRange(1, TASK_SETTING_KEY_COL, 1, 2).setValues([['設定名', '設定値']]);
    settingSheet.getRange(1, TASK_SETTING_KEY_COL, 1, 2)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // デフォルト設定値
    var defaultSettings = [
      ['AIモデル', 'gemini-2.0-flash'],
      ['リマインド時間1', '09:00'],
      ['リマインド時間2', ''],
      ['リマインド時間3', ''],
      ['カレンダーリマインド1', '前日 09:00'],
      ['カレンダーリマインド2', '当日 09:00'],
      ['棚卸し曜日', '月曜'],
      ['棚卸し時間', '08:30']
    ];
    settingSheet.getRange(2, TASK_SETTING_KEY_COL, defaultSettings.length, 2).setValues(defaultSettings);

    // 列幅
    settingSheet.setColumnWidth(1, 100);
    settingSheet.setColumnWidth(2, 200);
    settingSheet.setColumnWidth(3, 200);
    settingSheet.setColumnWidth(4, 80);
    settingSheet.setColumnWidth(TASK_SETTING_KEY_COL, 150);
    settingSheet.setColumnWidth(TASK_SETTING_VAL_COL, 200);

    // ===== 3. ログシート =====
    var logSheet = ss.getSheetByName(TASK_SHEET_NAMES.LOG);
    if (!logSheet) {
      logSheet = ss.insertSheet(TASK_SHEET_NAMES.LOG);
    }

    var logHeaders = ['日時', '入力モード', '入力テキスト（原文）', 'AI出力（JSON）', '登録されたタスクID'];
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
    logSheet.getRange(1, 1, 1, logHeaders.length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    logSheet.setColumnWidth(1, 150);
    logSheet.setColumnWidth(2, 120);
    logSheet.setColumnWidth(3, 300);
    logSheet.setColumnWidth(4, 300);
    logSheet.setColumnWidth(5, 150);

    return { success: true, message: '初期設定が完了しました。3つのシートを作成しました。' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
