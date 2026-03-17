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
  LOG: 'ログ',
  DONE_LOG: '完了ログ'
};

const TASK_COLUMNS = {
  // --- 一目で見える主要列（左側に集約） ---
  ID: 1,              // A: タスクID
  STATUS: 2,          // B: 状態
  COMPANY: 3,         // C: 企業名
  TITLE: 4,           // D: タスク名
  TASK_TYPE: 5,       // E: 種別
  ASSIGNEE: 6,        // F: 担当者
  REQUESTER: 7,       // G: 依頼者（誰が頼んだか）
  BALL_HOLDER: 8,     // H: ボール（誰で止まってるか）
  DEADLINE: 9,        // I: 期限
  SIZE: 10,           // J: タスク規模（大/中/小）
  // --- 詳細・運用列（右側） ---
  DONE_CRITERIA: 11,  // K: 完了条件
  NOTES: 12,          // L: 備考
  REG_DATE: 13,       // M: 登録日
  INPUT_MODE: 14,     // N: 入力モード
  COMPLETION_COMMENT: 15, // O: 完了報告コメント
  APPROVAL_NOTE: 16,  // P: 承認者/差し戻し理由
  REQUIREMENT_DEF: 17, // Q: 要件定義（JSON文字列）
  PARENT_ID: 18        // R: 親タスクID（空=独立タスク）
};

const TASK_COL_COUNT = 18;

const TASK_SIZES = ['大', '中', '小'];

const TASK_TYPES = ['HP', 'LP', 'パンフレット・カタログ', '月刊Sing', 'ゆめマガ', '動画', '動画撮影', 'SNS関連', 'FB', 'FB資料作成', '営業支援', '採用原稿関連', '応募者対応', '名刺', 'ロゴ', '原稿'];

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
      var val = data[i][1];
      // Sheetsが「10:00」等を時刻Dateに自動変換するため、HH:mm形式に戻す
      if (val instanceof Date) {
        return Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm');
      }
      return String(val || '').trim();
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
      taskData.company || '',                    // C: 企業名
      taskData.title || '',                      // D: タスク名
      taskData.taskType || '',                   // E: 種別
      taskData.assignee || '',                   // F: 担当者
      taskData.requester || '',                  // G: 依頼者
      taskData.ballHolder || taskData.assignee || '', // H: ボール（未指定なら担当者）
      taskData.deadline || '',                   // I: 期限
      taskData.size || '',                       // J: タスク規模
      taskData.doneCriteria || '',               // K: 完了条件
      taskData.notes || '',                      // L: 備考
      now,                                       // M: 登録日
      taskData.inputMode || '',                  // N: 入力モード
      '',                                        // O: 完了報告コメント
      '',                                        // P: 承認者/差し戻し理由
      '',                                        // Q: 要件定義
      taskData.parentId || ''                    // R: 親タスクID
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
        taskData.company || '',
        taskData.title || '',
        taskData.taskType || '',
        taskData.assignee || '',
        taskData.requester || '',
        taskData.ballHolder || taskData.assignee || '',
        taskData.deadline || '',
        taskData.size || '',
        taskData.doneCriteria || '',
        taskData.notes || '',
        now,
        taskData.inputMode || '',
        '',
        '',
        '',
        taskData.parentId || ''
      ]);
    }

    if (rows.length > 0) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, TASK_COL_COUNT).setValues(rows);
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

  var data = sheet.getRange(2, 1, lastRow - 1, TASK_COL_COUNT).getValues();
  var filter = filterOptions || {};
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var tasks = [];
  for (var i = 0; i < data.length; i++) {
    var id = String(data[i][0] || '').trim();       // A: ID
    if (!id) continue;

    var status = String(data[i][1] || '').trim();    // B: 状態
    var company = String(data[i][2] || '').trim();   // C: 企業名
    var assignee = String(data[i][5] || '').trim();  // F: 担当者
    var deadline = data[i][8];                        // I: 期限
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

    var taskType = String(data[i][4] || '').trim();    // E: 種別
    var requester = String(data[i][6] || '').trim();   // G: 依頼者
    var ballHolder = String(data[i][7] || '').trim();  // H: ボール
    var size = String(data[i][9] || '').trim();         // J: タスク規模
    var requirementDefStr = String(data[i][16] || '').trim(); // Q: 要件定義
    var requirementDef = null;
    if (requirementDefStr) {
      try { requirementDef = JSON.parse(requirementDefStr); } catch (e) { /* ignore */ }
    }
    var parentId = String(data[i][17] || '').trim();          // R: 親タスクID

    tasks.push({
      id: id,
      status: status,
      company: company,
      title: String(data[i][3] || '').trim(),       // D: タスク名
      taskType: taskType,
      assignee: assignee,
      requester: requester,
      ballHolder: ballHolder,
      deadline: deadlineDate ? Utilities.formatDate(deadlineDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      size: size,
      doneCriteria: String(data[i][10] || '').trim(),  // K: 完了条件
      notes: String(data[i][11] || '').trim(),         // L: 備考
      regDate: data[i][12] instanceof Date ? Utilities.formatDate(data[i][12], Session.getScriptTimeZone(), 'yyyy-MM-dd') : '', // M: 登録日
      inputMode: String(data[i][13] || '').trim(),     // N: 入力モード
      completionComment: String(data[i][14] || '').trim(), // O: 完了報告コメント
      approvalNote: String(data[i][15] || '').trim(),  // P: 承認者/差し戻し理由
      requirementDef: requirementDef,
      parentId: parentId,
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

        if (comment) {
          if (newStatus === '完了報告済み') {
            sheet.getRange(row, TASK_COLUMNS.COMPLETION_COMMENT).setValue(comment);
          } else if (newStatus === '完了' || newStatus === '差し戻し') {
            sheet.getRange(row, TASK_COLUMNS.APPROVAL_NOTE).setValue(comment);
          }
        }

        // ===== ボール自動切替 =====
        var assignee = String(sheet.getRange(row, TASK_COLUMNS.ASSIGNEE).getValue() || '').trim();
        var requester = String(sheet.getRange(row, TASK_COLUMNS.REQUESTER).getValue() || '').trim();
        var newBallHolder = '';

        if (newStatus === '進行中' || newStatus === '差し戻し') {
          // 担当者が作業中 → ボールは担当者
          newBallHolder = assignee;
        } else if (newStatus === '完了報告済み') {
          // 管理者の承認待ち → ボールは依頼者（不明なら管理者の1人目）
          if (requester) {
            newBallHolder = requester;
          } else {
            var managers = task_getManagers();
            newBallHolder = managers.length > 0 ? managers[0].name : '';
          }
        }

        if (newBallHolder) {
          sheet.getRange(row, TASK_COLUMNS.BALL_HOLDER).setValue(newBallHolder);
        }

        // 完了承認 → 完了ログへ移行して行を削除
        if (newStatus === '完了') {
          sheet.getRange(row, TASK_COLUMNS.STATUS).setValue('完了');
          SpreadsheetApp.flush(); // コメント書き込みを確定

          var rowData = sheet.getRange(row, 1, 1, TASK_COL_COUNT).getValues()[0];
          var doneLogSheet = ss.getSheetByName(TASK_SHEET_NAMES.DONE_LOG);
          if (doneLogSheet) {
            var doneRow = Array.prototype.slice.call(rowData);
            doneRow.push(new Date()); // 最終列に完了日時を追加
            doneLogSheet.appendRow(doneRow);
            var newLogRow = doneLogSheet.getLastRow();
            doneLogSheet.setRowHeight(newLogRow, 21);
          }
          sheet.deleteRow(row);
        } else {
          sheet.getRange(row, TASK_COLUMNS.STATUS).setValue(newStatus);
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
// ===== 要件定義 =====
// ================================================================================

/**
 * タスクの要件定義ステータスを取得
 * @param {Object} task - タスクオブジェクト
 * @returns {string} 'not_applicable' | 'pending' | 'done'
 */
function task_getRequirementStatus(task) {
  if (!task.size || task.size === '小') return 'not_applicable';
  if (task.requirementDef) return 'done';
  return 'pending';
}

/**
 * 要件定義データを保存
 * @param {string} taskId
 * @param {Object} requirementData - 要件定義オブジェクト
 * @returns {{success: boolean, error?: string}}
 */
function task_saveRequirementData(taskId, requirementData) {
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
        requirementData.defined_at = new Date().toISOString();
        sheet.getRange(i + 2, TASK_COLUMNS.REQUIREMENT_DEF).setValue(JSON.stringify(requirementData));
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

/**
 * 要件定義データを取得
 * @param {string} taskId
 * @returns {Object|null}
 */
function task_getRequirementData(taskId) {
  var task = task_getTaskById(taskId);
  if (!task) return null;
  return task.requirementDef || null;
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

    // ヘッダー定義
    var headers = ['ID', '状態', '企業名', 'タスク名', '種別', '担当者', '依頼者', 'ボール', '期限', 'タスク規模', '完了条件', '備考', '登録日', '入力モード', '完了報告コメント', '承認者/差し戻し理由', '要件定義', '親タスクID'];

    // 既存データのマイグレーション（列追加・列順変更に安全に対応）
    var lastRow = taskSheet.getLastRow();
    if (lastRow >= 1) {
      var oldHeaderCount = taskSheet.getLastColumn();
      if (oldHeaderCount > 0) {
        var oldHeaders = taskSheet.getRange(1, 1, 1, oldHeaderCount).getValues()[0].map(String);
        var oldHeadersStr = oldHeaders.join(',');
        var newHeadersStr = headers.join(',');

        // ヘッダーが異なる場合のみマイグレーション実行
        if (oldHeadersStr !== newHeadersStr && lastRow >= 2) {
          // 既存データを読み取り
          var oldData = taskSheet.getRange(2, 1, lastRow - 1, oldHeaderCount).getValues();

          // 旧ヘッダー名 → 旧列インデックスのマップ
          var oldColMap = {};
          for (var h = 0; h < oldHeaders.length; h++) {
            if (oldHeaders[h]) oldColMap[oldHeaders[h]] = h;
          }

          // 新列順にデータを並べ替え
          var newData = [];
          for (var r = 0; r < oldData.length; r++) {
            var newRow = [];
            for (var c = 0; c < headers.length; c++) {
              var headerName = headers[c];
              if (headerName in oldColMap) {
                newRow.push(oldData[r][oldColMap[headerName]]);
              } else {
                newRow.push(''); // 新規列は空
              }
            }
            newData.push(newRow);
          }

          // データエリアをクリアして新データを書き込み
          taskSheet.getRange(2, 1, lastRow - 1, oldHeaderCount).clear();
          if (newData.length > 0) {
            taskSheet.getRange(2, 1, newData.length, headers.length).setValues(newData);
          }
        }
      }
    }

    // ヘッダー書き込み（常に最新に更新）
    taskSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    taskSheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // 列幅設定
    // --- 主要列（一目で見える左側） ---
    taskSheet.setColumnWidth(1, 70);   // A: ID
    taskSheet.setColumnWidth(2, 100);  // B: 状態
    taskSheet.setColumnWidth(3, 150);  // C: 企業名
    taskSheet.setColumnWidth(4, 250);  // D: タスク名
    taskSheet.setColumnWidth(5, 120);  // E: 種別
    taskSheet.setColumnWidth(6, 80);   // F: 担当者
    taskSheet.setColumnWidth(7, 80);   // G: 依頼者
    taskSheet.setColumnWidth(8, 100);  // H: ボール
    taskSheet.setColumnWidth(9, 100);  // I: 期限
    taskSheet.setColumnWidth(10, 80);  // J: タスク規模
    // --- 詳細・運用列（右側） ---
    taskSheet.setColumnWidth(11, 200); // K: 完了条件
    taskSheet.setColumnWidth(12, 200); // L: 備考
    taskSheet.setColumnWidth(13, 100); // M: 登録日
    taskSheet.setColumnWidth(14, 100); // N: 入力モード
    taskSheet.setColumnWidth(15, 200); // O: 完了報告コメント
    taskSheet.setColumnWidth(16, 200); // P: 承認者/差し戻し理由
    taskSheet.setColumnWidth(17, 300); // Q: 要件定義
    taskSheet.setColumnWidth(18, 80);  // R: 親タスクID

    // 行固定
    taskSheet.setFrozenRows(1);

    // 旧ドロップダウンをクリア（列順変更時の残骸対策）
    var maxRow = Math.max(taskSheet.getMaxRows(), 502);
    taskSheet.getRange(2, 1, maxRow - 1, TASK_COL_COUNT).setDataValidation(null);

    // ドロップダウン: 状態（B列）
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(TASK_STATUSES, true)
      .setAllowInvalid(false)
      .build();
    taskSheet.getRange(2, TASK_COLUMNS.STATUS, 500, 1).setDataValidation(statusRule);

    // ドロップダウン: タスク規模（J列）
    var sizeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(TASK_SIZES, true)
      .setAllowInvalid(true)
      .build();
    taskSheet.getRange(2, TASK_COLUMNS.SIZE, 500, 1).setDataValidation(sizeRule);

    // ドロップダウン: 種別（E列）
    var taskTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(TASK_TYPES, true)
      .setAllowInvalid(true)
      .build();
    taskSheet.getRange(2, TASK_COLUMNS.TASK_TYPE, 500, 1).setDataValidation(taskTypeRule);

    // 担当者リスト取得（依頼者・ボールのドロップダウンで共用）
    var memberNames = [];
    try { memberNames = task_getMemberNames(); } catch (e) { /* 初回は設定シート未作成 */ }
    var personOptions = memberNames.concat(['企業', '外部']);

    // ドロップダウン: 担当者（F列）
    if (memberNames.length > 0) {
      var assigneeRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(memberNames, true)
        .setAllowInvalid(true)
        .build();
      taskSheet.getRange(2, TASK_COLUMNS.ASSIGNEE, 500, 1).setDataValidation(assigneeRule);
    }

    // ドロップダウン: 依頼者（G列）- 担当者リスト + 企業 + 外部
    if (personOptions.length > 0) {
      var requesterRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(personOptions, true)
        .setAllowInvalid(true)
        .build();
      taskSheet.getRange(2, TASK_COLUMNS.REQUESTER, 500, 1).setDataValidation(requesterRule);
    }

    // ドロップダウン: ボール（H列）- 担当者リスト + 企業 + 外部
    if (personOptions.length > 0) {
      var ballHolderRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(personOptions, true)
        .setAllowInvalid(true)
        .build();
      taskSheet.getRange(2, TASK_COLUMNS.BALL_HOLDER, 500, 1).setDataValidation(ballHolderRule);
    }

    // 条件付き書式
    var rules = [];

    // 状態「完了」→ 行をグレーアウト
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$B2="完了"')
      .setBackground('#f5f5f5')
      .setFontColor('#9e9e9e')
      .setRanges([taskSheet.getRange(2, 1, 500, TASK_COL_COUNT)])
      .build());

    // タスク規模「大」+ 要件定義未完了 → J列を赤背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2="大", $Q2="")')
      .setBackground('#ffcdd2')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.SIZE, 500, 1)])
      .build());

    // タスク規模「中」+ 要件定義未完了 → J列を黄背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2="中", $Q2="")')
      .setBackground('#fff9c4')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.SIZE, 500, 1)])
      .build());

    // タスク規模「大」or「中」+ 要件定義完了 → J列を緑背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(OR($J2="大", $J2="中"), $Q2<>"")')
      .setBackground('#c8e6c9')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.SIZE, 500, 1)])
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

    // 期限が今日以前 & 未完了 → 期限セル(I列)を赤背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($I2<>"", $I2<=TODAY(), $B2<>"完了", $B2<>"保留")')
      .setBackground('#ffcdd2')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.DEADLINE, 500, 1)])
      .build());

    // 期限が明日 → 期限セル(I列)を黄背景
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($I2<>"", $I2=TODAY()+1, $B2<>"完了", $B2<>"保留")')
      .setBackground('#fff9c4')
      .setRanges([taskSheet.getRange(2, TASK_COLUMNS.DEADLINE, 500, 1)])
      .build());

    taskSheet.setConditionalFormatRules(rules);

    // ===== 2. 設定シート =====
    var settingSheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
    var isNewSettingSheet = !settingSheet;
    if (!settingSheet) {
      settingSheet = ss.insertSheet(TASK_SHEET_NAMES.SETTINGS);
    }

    // エリア1: 担当者設定ヘッダー（A〜D列）- ヘッダーのみ上書き、データは保護
    settingSheet.getRange(1, 1, 1, 4).setValues([['担当者名', 'メールアドレス', 'カレンダーID', '役割']]);
    settingSheet.getRange(1, 1, 1, 4)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // 役割ドロップダウン（D列）- 既存データを消さずにドロップダウンだけ再設定
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

    // デフォルト設定値 - 新規シートの場合のみ書き込み
    if (isNewSettingSheet) {
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
    }

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

    // ===== 4. 完了ログシート =====
    var doneLogSheet = ss.getSheetByName(TASK_SHEET_NAMES.DONE_LOG);
    if (!doneLogSheet) {
      doneLogSheet = ss.insertSheet(TASK_SHEET_NAMES.DONE_LOG);
    }

    // タスク一覧と同じヘッダー + 完了日時
    var doneHeaders = headers.concat(['完了日時']);
    doneLogSheet.getRange(1, 1, 1, doneHeaders.length).setValues([doneHeaders]);
    doneLogSheet.getRange(1, 1, 1, doneHeaders.length)
      .setBackground('#388e3c')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    // 主要列の幅（タスク一覧と同じ）
    doneLogSheet.setColumnWidth(1, 70);   // ID
    doneLogSheet.setColumnWidth(2, 100);  // 状態
    doneLogSheet.setColumnWidth(3, 150);  // 企業名
    doneLogSheet.setColumnWidth(4, 250);  // タスク名
    doneLogSheet.setColumnWidth(5, 120);  // 種別
    doneLogSheet.setColumnWidth(6, 80);   // 担当者
    doneLogSheet.setColumnWidth(7, 80);   // 依頼者
    doneLogSheet.setColumnWidth(8, 100);  // ボール
    doneLogSheet.setColumnWidth(9, 100);  // 期限
    doneLogSheet.setColumnWidth(10, 80);  // タスク規模
    doneLogSheet.setColumnWidth(19, 150); // 完了日時

    doneLogSheet.setFrozenRows(1);

    return { success: true, message: '初期設定が完了しました。4つのシートを作成しました。' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
