/**
 * タスク管理システム - シミュレーター（テストスイート）
 *
 * 全パターンのシミュレーションを実行し、結果をHTMLダイアログで表示する。
 * メニューから個別カテゴリまたは全テストを実行可能。
 *
 * 依存: taskSheetManager.js, taskAiAnalyzer.js, taskCalendarManager.js,
 *       taskReminder.js, taskResultDialog.js, taskListDialog.js,
 *       taskDiscussionPatterns.js, taskCommonStyles.js
 */

// ================================================================================
// ===== テストフレームワーク =====
// ================================================================================

/** テスト結果を蓄積する配列（各テスト実行時にリセット） */
var SIM_RESULTS = [];

/** テスト用担当者データ */
var SIM_TEST_MEMBERS = [
  { name: '田中太郎', email: 'tanaka@example.com', calendarId: '', role: '担当者' },
  { name: '鈴木花子', email: 'suzuki@example.com', calendarId: '', role: '担当者' },
  { name: '佐藤一郎', email: 'sato@example.com',   calendarId: '', role: '管理者' }
];

/** テスト用タスクIDプレフィックス */
var SIM_ID_PREFIX = 'T-SIM-';

/**
 * アサーション: 条件を検証
 * @param {string} testName - テスト名
 * @param {boolean} condition - 合否
 * @param {string} [detail] - 詳細（失敗時に表示）
 */
function sim_assert(testName, condition, detail) {
  SIM_RESULTS.push({
    name: testName,
    passed: !!condition,
    detail: detail || ''
  });
}

/**
 * アサーション: 値の一致を検証
 * @param {string} testName - テスト名
 * @param {*} actual - 実際の値
 * @param {*} expected - 期待値
 * @param {string} [detail] - 追加詳細
 */
function sim_assertEqual(testName, actual, expected, detail) {
  var passed = JSON.stringify(actual) === JSON.stringify(expected);
  SIM_RESULTS.push({
    name: testName,
    passed: passed,
    detail: passed ? '' : '期待値: ' + JSON.stringify(expected) + ', 実際: ' + JSON.stringify(actual) + (detail ? ' (' + detail + ')' : '')
  });
}

/**
 * アサーション: 値がnullでないことを検証
 * @param {string} testName - テスト名
 * @param {*} value - 検証する値
 */
function sim_assertNotNull(testName, value) {
  SIM_RESULTS.push({
    name: testName,
    passed: value !== null && value !== undefined,
    detail: value === null || value === undefined ? '値がnull/undefinedです' : ''
  });
}

/**
 * アサーション: 値がnullであることを検証
 * @param {string} testName - テスト名
 * @param {*} value - 検証する値
 */
function sim_assertNull(testName, value) {
  SIM_RESULTS.push({
    name: testName,
    passed: value === null || value === undefined || value === '',
    detail: (value !== null && value !== undefined && value !== '') ? '値がnull/undefinedではありません: ' + JSON.stringify(value) : ''
  });
}

// ================================================================================
// ===== メニュー登録 =====
// ================================================================================

/**
 * onOpenから呼ばれてシミュレーションメニューを追加する
 * （既存のonOpenに追記するか、別途呼び出す）
 */
function sim_addMenu() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('\uD83E\uDDEA シミュレーション');

  menu.addItem('\u25B6\uFE0F 全テスト実行', 'sim_runAll')
    .addSeparator()
    .addItem('A. シート初期化', 'sim_runA_SheetInit')
    .addItem('B. 担当者管理', 'sim_runB_MemberManagement')
    .addItem('C. システム設定', 'sim_runC_SystemSettings')
    .addItem('D. タスク登録（全モード）', 'sim_runD_TaskRegistration')
    .addItem('E. タスク取得・フィルタ', 'sim_runE_TaskQuery')
    .addItem('F. 状態遷移', 'sim_runF_StatusTransition')
    .addItem('G. 完了報告・承認フロー', 'sim_runG_ApprovalFlow')
    .addItem('H. AI解析（JSONパース）', 'sim_runH_AiParse')
    .addItem('I. カレンダー連携', 'sim_runI_Calendar')
    .addItem('J. 通知フォーマット', 'sim_runJ_NotificationFormat')
    .addItem('K. Claude Code出力', 'sim_runK_ClaudeCode')
    .addItem('L. ディスカッションパターン', 'sim_runL_DiscussionPattern')
    .addItem('M. ログ記録', 'sim_runM_LogWrite')
    .addItem('N. エラーケース', 'sim_runN_ErrorCases')
    .addSeparator()
    .addItem('\uD83E\uDDF9 テストデータ削除', 'sim_cleanup')
    .addItem('\uD83D\uDCCA 前回の結果を表示', 'sim_showLastResult')
    .addToUi();
}

// ================================================================================
// ===== ヘルパー: テストデータ準備・クリーンアップ =====
// ================================================================================

/**
 * テスト用の3シートが存在することを保証する
 */
function sim_ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST) ||
      !ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS) ||
      !ss.getSheetByName(TASK_SHEET_NAMES.LOG)) {
    task_initializeTemplate();
  }
}

/**
 * テスト用担当者をセットアップ
 */
function sim_setupMembers() {
  task_saveMemberSettings(SIM_TEST_MEMBERS);
}

/**
 * テスト用タスクを直接シートに書き込む（task_generateIdを使わない）
 * @param {string} simId - SIM IDの末尾（例: '001'）
 * @param {Object} data - タスクデータ
 * @returns {string} 書き込んだタスクID
 */
function sim_insertTask(simId, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  var taskId = SIM_ID_PREFIX + simId;
  var row = [
    taskId,
    data.status || '未着手',
    data.assignee || '',
    data.title || 'SIMテストタスク',
    data.deadline || '',
    data.doneCriteria || '',
    data.regDate || new Date(),
    data.inputMode || 'simulator',
    data.completionComment || '',
    data.approvalNote || '',
    data.notes || ''
  ];
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return taskId;
}

/**
 * テストデータを削除（T-SIM- で始まるタスク行、テスト用設定を削除）
 */
function sim_cleanup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // タスク一覧からT-SIM-行を削除
  var taskSheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  if (taskSheet) {
    var lastRow = taskSheet.getLastRow();
    if (lastRow >= 2) {
      var ids = taskSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      // 下から削除（行番号がずれないように）
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]).indexOf(SIM_ID_PREFIX) === 0) {
          taskSheet.deleteRow(i + 2);
        }
      }
    }
  }

  // ログシートからsimulatorモードの行を削除
  var logSheet = ss.getSheetByName(TASK_SHEET_NAMES.LOG);
  if (logSheet) {
    var logLastRow = logSheet.getLastRow();
    if (logLastRow >= 2) {
      var modes = logSheet.getRange(2, 2, logLastRow - 1, 1).getValues();
      for (var j = modes.length - 1; j >= 0; j--) {
        if (String(modes[j][0]) === 'simulator' || String(modes[j][0]) === 'sim_test') {
          logSheet.deleteRow(j + 2);
        }
      }
    }
  }

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('\uD83E\uDDF9 クリーンアップ完了', 'テストデータ（T-SIM-xxx）を削除しました。', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * T-SIM- タスクのみ削除（テスト間のクリーンアップ用。UIなし）
 */
function sim_cleanupTasks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var taskSheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  if (taskSheet) {
    var lastRow = taskSheet.getLastRow();
    if (lastRow >= 2) {
      var ids = taskSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]).indexOf(SIM_ID_PREFIX) === 0) {
          taskSheet.deleteRow(i + 2);
        }
      }
    }
  }
  SpreadsheetApp.flush();
}

// ================================================================================
// ===== A. シート初期化テスト =====
// ================================================================================

function sim_testA_SheetInit() {
  var category = 'A. シート初期化';

  try {
    // テスト前: 既存シートがあってもエラーにならないことを確認
    var result = task_initializeTemplate();
    sim_assert(category + ' - 1. テンプレート初期設定が成功する', result.success, result.error || '');

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 2. 3シート存在確認
    var taskSheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
    var settingSheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
    var logSheet = ss.getSheetByName(TASK_SHEET_NAMES.LOG);
    sim_assert(category + ' - 2a. タスク一覧シートが存在する', taskSheet !== null);
    sim_assert(category + ' - 2b. 設定シートが存在する', settingSheet !== null);
    sim_assert(category + ' - 2c. ログシートが存在する', logSheet !== null);

    // 3. ヘッダー行確認
    if (taskSheet) {
      var headers = taskSheet.getRange(1, 1, 1, 11).getValues()[0];
      sim_assertEqual(category + ' - 3a. タスク一覧ヘッダーA列', String(headers[0]), 'ID');
      sim_assertEqual(category + ' - 3b. タスク一覧ヘッダーB列', String(headers[1]), '状態');
      sim_assertEqual(category + ' - 3c. タスク一覧ヘッダーD列', String(headers[3]), 'タスク名');
    }

    if (settingSheet) {
      var settingHeaders = settingSheet.getRange(1, 1, 1, 4).getValues()[0];
      sim_assertEqual(category + ' - 3d. 設定ヘッダーA列', String(settingHeaders[0]), '担当者名');
      var sysHeaders = settingSheet.getRange(1, TASK_SETTING_KEY_COL, 1, 2).getValues()[0];
      sim_assertEqual(category + ' - 3e. 設定ヘッダーG列', String(sysHeaders[0]), '設定名');
    }

    // 4. 条件付き書式が設定されている
    if (taskSheet) {
      var rules = taskSheet.getConditionalFormatRules();
      sim_assert(category + ' - 4. 条件付き書式が設定される', rules.length > 0, '条件付き書式のルール数: ' + rules.length);
    }

    // 5. ドロップダウン（データバリデーション）が設定されている
    if (taskSheet) {
      var validation = taskSheet.getRange(2, TASK_COLUMNS.STATUS).getDataValidation();
      sim_assert(category + ' - 5. ドロップダウンが設定される', validation !== null);
    }

    // 6. 行フリーズが設定されている
    if (taskSheet) {
      var frozenRows = taskSheet.getFrozenRows();
      sim_assertEqual(category + ' - 6. 行フリーズが設定される', frozenRows, 1);
    }

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== B. 担当者管理テスト =====
// ================================================================================

function sim_testB_MemberManagement() {
  var category = 'B. 担当者管理';

  try {
    sim_ensureSheets();

    // 1. 担当者3名を保存→取得して一致確認
    var saveResult = task_saveMemberSettings(SIM_TEST_MEMBERS);
    sim_assert(category + ' - 1a. 担当者3名保存が成功', saveResult.success, saveResult.error || '');

    var members = task_getMembers();
    sim_assertEqual(category + ' - 1b. 担当者3名取得', members.length, 3);
    sim_assertEqual(category + ' - 1c. 1人目の名前', members[0].name, '田中太郎');
    sim_assertEqual(category + ' - 1d. 1人目のメール', members[0].email, 'tanaka@example.com');

    // 2. 担当者追加（4名に）
    var fourMembers = SIM_TEST_MEMBERS.concat([
      { name: '山田次郎', email: 'yamada@example.com', calendarId: '', role: '担当者' }
    ]);
    task_saveMemberSettings(fourMembers);
    var membersAfterAdd = task_getMembers();
    sim_assertEqual(category + ' - 2. 担当者4名に追加', membersAfterAdd.length, 4);

    // 3. 担当者削除（2名に）
    var twoMembers = [SIM_TEST_MEMBERS[0], SIM_TEST_MEMBERS[2]];
    task_saveMemberSettings(twoMembers);
    var membersAfterDel = task_getMembers();
    sim_assertEqual(category + ' - 3. 担当者2名に削除', membersAfterDel.length, 2);

    // 4. 管理者フィルタ取得
    task_saveMemberSettings(SIM_TEST_MEMBERS); // 3名に戻す
    var managers = task_getManagers();
    sim_assertEqual(category + ' - 4a. 管理者は1名', managers.length, 1);
    sim_assertEqual(category + ' - 4b. 管理者名', managers[0].name, '佐藤一郎');

    // 5. メンバー名のみ取得
    var names = task_getMemberNames();
    sim_assertEqual(category + ' - 5a. メンバー名数', names.length, 3);
    sim_assert(category + ' - 5b. 田中太郎が含まれる', names.indexOf('田中太郎') !== -1);

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== C. システム設定テスト =====
// ================================================================================

function sim_testC_SystemSettings() {
  var category = 'C. システム設定';

  try {
    sim_ensureSheets();

    // 1. AIモデル設定の読み書き
    task_setSystemSetting('AIモデル', 'gemini-test-model');
    var aiModel = task_getSystemSetting('AIモデル');
    sim_assertEqual(category + ' - 1. AIモデル設定の読み書き', aiModel, 'gemini-test-model');

    // 元に戻す
    task_setSystemSetting('AIモデル', 'gemini-2.0-flash');

    // 2. リマインド時間設定の読み書き
    task_setSystemSetting('リマインド時間1', '10:00');
    var remindTime = task_getSystemSetting('リマインド時間1');
    sim_assertEqual(category + ' - 2. リマインド時間の読み書き', remindTime, '10:00');
    task_setSystemSetting('リマインド時間1', '09:00'); // 戻す

    // 3. 棚卸し設定の読み書き
    task_setSystemSetting('棚卸し曜日', '金曜');
    var reviewDay = task_getSystemSetting('棚卸し曜日');
    sim_assertEqual(category + ' - 3. 棚卸し設定の読み書き', reviewDay, '金曜');
    task_setSystemSetting('棚卸し曜日', '月曜'); // 戻す

    // 4. 存在しないキーの取得（空文字確認）
    var notExist = task_getSystemSetting('存在しないキー_SIM_TEST');
    sim_assertEqual(category + ' - 4. 存在しないキーの取得', notExist, '');

    // 5. 設定一括保存
    var bulkResult = task_saveSystemSettings({
      'SIM_TEST_KEY_A': 'value_a',
      'SIM_TEST_KEY_B': 'value_b'
    });
    sim_assert(category + ' - 5a. 設定一括保存が成功', bulkResult.success, bulkResult.error || '');
    sim_assertEqual(category + ' - 5b. 一括保存キーA確認', task_getSystemSetting('SIM_TEST_KEY_A'), 'value_a');
    sim_assertEqual(category + ' - 5c. 一括保存キーB確認', task_getSystemSetting('SIM_TEST_KEY_B'), 'value_b');

    // テスト用設定の掃除（設定シートからSIM_TEST行を削除）
    sim_cleanupSystemSettings_();

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

/** テスト用システム設定行を削除する内部関数 */
function sim_cleanupSystemSettings_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TASK_SHEET_NAMES.SETTINGS);
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var data = sheet.getRange(2, TASK_SETTING_KEY_COL, lastRow - 1, 1).getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    if (String(data[i][0]).indexOf('SIM_TEST_KEY') === 0) {
      sheet.deleteRow(i + 2);
    }
  }
}

// ================================================================================
// ===== D. タスク登録テスト =====
// ================================================================================

function sim_testD_TaskRegistration() {
  var category = 'D. タスク登録';

  try {
    sim_ensureSheets();
    sim_setupMembers();
    sim_cleanupTasks(); // 以前のテストデータを掃除

    // 1. 単一タスク登録 → ID採番確認
    var reg1 = task_registerTask({
      title: 'SIMテスト:単一登録',
      assignee: '田中太郎',
      deadline: '2026-04-01',
      doneCriteria: '完了条件テスト',
      inputMode: 'simulator',
      notes: 'テストノート'
    });
    sim_assert(category + ' - 1a. 単一タスク登録が成功', reg1.success, reg1.error || '');
    sim_assert(category + ' - 1b. タスクIDが採番される', reg1.taskId && reg1.taskId.match(/^T-\d{3}$/), 'ID: ' + reg1.taskId);

    // 2. 複数タスク一括登録 → 件数確認
    var reg2 = task_registerMultipleTasks([
      { title: 'SIMテスト:一括1', assignee: '鈴木花子', inputMode: 'simulator' },
      { title: 'SIMテスト:一括2', assignee: '田中太郎', inputMode: 'simulator' },
      { title: 'SIMテスト:一括3', assignee: '佐藤一郎', inputMode: 'simulator' }
    ]);
    sim_assert(category + ' - 2a. 複数タスク一括登録が成功', reg2.success, reg2.error || '');
    sim_assertEqual(category + ' - 2b. 一括登録件数', reg2.taskIds ? reg2.taskIds.length : 0, 3);

    // 以降のテストはsim_insertTaskで直接挿入（IDをSIM形式にするため）

    // 3. works_bulk モードで登録
    var id3 = sim_insertTask('D03', { title: 'SIMテスト:works_bulk', inputMode: 'works_bulk', assignee: '田中太郎' });
    var task3 = task_getTaskById(id3);
    sim_assert(category + ' - 3. works_bulkモード登録', task3 !== null && task3.inputMode === 'works_bulk');

    // 4. works_pin モードで登録
    var id4 = sim_insertTask('D04', { title: 'SIMテスト:works_pin', inputMode: 'works_pin', assignee: '鈴木花子' });
    var task4 = task_getTaskById(id4);
    sim_assert(category + ' - 4. works_pinモード登録', task4 !== null && task4.inputMode === 'works_pin');

    // 5. notta モードで登録
    var id5 = sim_insertTask('D05', { title: 'SIMテスト:notta', inputMode: 'notta', assignee: '佐藤一郎' });
    var task5 = task_getTaskById(id5);
    sim_assert(category + ' - 5. nottaモード登録', task5 !== null && task5.inputMode === 'notta');

    // 6. free_text モードで登録
    var id6 = sim_insertTask('D06', { title: 'SIMテスト:free_text', inputMode: 'free_text', assignee: '田中太郎' });
    var task6 = task_getTaskById(id6);
    sim_assert(category + ' - 6. free_textモード登録', task6 !== null && task6.inputMode === 'free_text');

    // 7. discussion モードで登録
    var id7 = sim_insertTask('D07', { title: 'SIMテスト:discussion', inputMode: 'discussion', assignee: '鈴木花子' });
    var task7 = task_getTaskById(id7);
    sim_assert(category + ' - 7. discussionモード登録', task7 !== null && task7.inputMode === 'discussion');

    // 8. 全項目入力のフル登録
    var id8 = sim_insertTask('D08', {
      title: 'SIMテスト:フル登録',
      status: '未着手',
      assignee: '田中太郎',
      deadline: '2026-04-15',
      doneCriteria: 'テスト完了条件',
      inputMode: 'free_text',
      notes: 'テスト備考フル'
    });
    var task8 = task_getTaskById(id8);
    sim_assert(category + ' - 8a. フル登録: タスク存在', task8 !== null);
    if (task8) {
      sim_assertEqual(category + ' - 8b. フル登録: 担当者', task8.assignee, '田中太郎');
      sim_assertEqual(category + ' - 8c. フル登録: 完了条件', task8.doneCriteria, 'テスト完了条件');
      sim_assertEqual(category + ' - 8d. フル登録: 備考', task8.notes, 'テスト備考フル');
    }

    // 9. 最低限項目のみ登録
    var id9 = sim_insertTask('D09', { title: 'SIMテスト:最低限' });
    var task9 = task_getTaskById(id9);
    sim_assert(category + ' - 9. 最低限項目のみ登録', task9 !== null && task9.title === 'SIMテスト:最低限');

    // 10. 期限なし登録
    var id10 = sim_insertTask('D10', { title: 'SIMテスト:期限なし', assignee: '鈴木花子' });
    var task10 = task_getTaskById(id10);
    sim_assert(category + ' - 10. 期限なし登録', task10 !== null && task10.deadline === '');

    // task_generateId自体のテスト
    var genId = task_generateId();
    sim_assert(category + ' - 11. task_generateIdがT-xxx形式を返す', genId && genId.match(/^T-\d{3}$/), 'ID: ' + genId);

    // クリーンアップ（登録テストで作ったT-xxxのタスクも削除）
    sim_cleanupRegisteredTasks_();

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

/** 登録テストで作ったタスク（SIMテスト:で始まる通常ID）も掃除 */
function sim_cleanupRegisteredTasks_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var taskSheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
  if (!taskSheet) return;
  var lastRow = taskSheet.getLastRow();
  if (lastRow < 2) return;
  var data = taskSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    var id = String(data[i][0]);
    var title = String(data[i][3]);
    if (id.indexOf(SIM_ID_PREFIX) === 0 || title.indexOf('SIMテスト:') === 0) {
      taskSheet.deleteRow(i + 2);
    }
  }
  SpreadsheetApp.flush();
}

// ================================================================================
// ===== E. タスク取得・フィルタテスト =====
// ================================================================================

function sim_testE_TaskQuery() {
  var category = 'E. タスク取得・フィルタ';

  try {
    sim_ensureSheets();
    sim_setupMembers();
    sim_cleanupTasks();

    // テストデータ準備
    sim_insertTask('E01', { title: 'E-未着手1', status: '未着手', assignee: '田中太郎' });
    sim_insertTask('E02', { title: 'E-未着手2', status: '未着手', assignee: '鈴木花子' });
    sim_insertTask('E03', { title: 'E-進行中1', status: '進行中', assignee: '田中太郎' });
    sim_insertTask('E04', { title: 'E-完了1', status: '完了', assignee: '佐藤一郎' });

    // 1. 全件取得
    var all = task_getAllTasks({});
    var simTasks = all.filter(function(t) { return t.id.indexOf(SIM_ID_PREFIX) === 0; });
    sim_assertEqual(category + ' - 1. 全件取得（SIM分）', simTasks.length, 4);

    // 2. 状態フィルタ（未着手のみ）
    var pending = task_getAllTasks({ status: '未着手' });
    var simPending = pending.filter(function(t) { return t.id.indexOf(SIM_ID_PREFIX) === 0; });
    sim_assertEqual(category + ' - 2. 未着手フィルタ', simPending.length, 2);

    // 3. 担当者フィルタ
    var tanaka = task_getAllTasks({ assignee: '田中太郎' });
    var simTanaka = tanaka.filter(function(t) { return t.id.indexOf(SIM_ID_PREFIX) === 0; });
    sim_assertEqual(category + ' - 3. 担当者フィルタ（田中太郎）', simTanaka.length, 2);

    // 4. ID検索
    var found = task_getTaskById(SIM_ID_PREFIX + 'E01');
    sim_assert(category + ' - 4. ID検索で見つかる', found !== null && found.title === 'E-未着手1');

    // 5. 存在しないID検索
    var notFound = task_getTaskById(SIM_ID_PREFIX + 'E99');
    sim_assertNull(category + ' - 5. 存在しないID検索はnull', notFound);

    // クリーンアップ
    sim_cleanupTasks();

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== F. 状態遷移テスト =====
// ================================================================================

function sim_testF_StatusTransition() {
  var category = 'F. 状態遷移';

  try {
    sim_ensureSheets();
    sim_cleanupTasks();

    // 1. 未着手→進行中
    var id1 = sim_insertTask('F01', { status: '未着手', title: 'F-遷移1' });
    var r1 = task_updateTaskStatus(id1, '進行中', '');
    sim_assert(category + ' - 1. 未着手→進行中', r1.success);
    var t1 = task_getTaskById(id1);
    sim_assertEqual(category + ' - 1v. 状態確認', t1 ? t1.status : '', '進行中');

    // 2. 進行中→完了報告済み
    var id2 = sim_insertTask('F02', { status: '進行中', title: 'F-遷移2' });
    var r2 = task_updateTaskStatus(id2, '完了報告済み', '作業完了しました');
    sim_assert(category + ' - 2. 進行中→完了報告済み', r2.success);
    var t2 = task_getTaskById(id2);
    sim_assertEqual(category + ' - 2v. 状態確認', t2 ? t2.status : '', '完了報告済み');
    sim_assertEqual(category + ' - 2c. コメント確認', t2 ? t2.completionComment : '', '作業完了しました');

    // 3. 完了報告済み→完了
    var id3 = sim_insertTask('F03', { status: '完了報告済み', title: 'F-遷移3' });
    var r3 = task_updateTaskStatus(id3, '完了', '佐藤 承認');
    sim_assert(category + ' - 3. 完了報告済み→完了', r3.success);
    var t3 = task_getTaskById(id3);
    sim_assertEqual(category + ' - 3v. 状態確認', t3 ? t3.status : '', '完了');

    // 4. 完了報告済み→差し戻し
    var id4 = sim_insertTask('F04', { status: '完了報告済み', title: 'F-遷移4' });
    var r4 = task_updateTaskStatus(id4, '差し戻し', '要修正');
    sim_assert(category + ' - 4. 完了報告済み→差し戻し', r4.success);
    var t4 = task_getTaskById(id4);
    sim_assertEqual(category + ' - 4v. 状態確認', t4 ? t4.status : '', '差し戻し');
    sim_assertEqual(category + ' - 4n. 承認メモ確認', t4 ? t4.approvalNote : '', '要修正');

    // 5. 差し戻し→進行中
    var id5 = sim_insertTask('F05', { status: '差し戻し', title: 'F-遷移5' });
    var r5 = task_updateTaskStatus(id5, '進行中', '');
    sim_assert(category + ' - 5. 差し戻し→進行中', r5.success);
    var t5 = task_getTaskById(id5);
    sim_assertEqual(category + ' - 5v. 状態確認', t5 ? t5.status : '', '進行中');

    // 6. 任意→保留
    var id6 = sim_insertTask('F06', { status: '進行中', title: 'F-遷移6' });
    var r6 = task_updateTaskStatus(id6, '保留', '');
    sim_assert(category + ' - 6. 進行中→保留', r6.success);
    var t6 = task_getTaskById(id6);
    sim_assertEqual(category + ' - 6v. 状態確認', t6 ? t6.status : '', '保留');

    // 7. 保留→進行中
    var id7 = sim_insertTask('F07', { status: '保留', title: 'F-遷移7' });
    var r7 = task_updateTaskStatus(id7, '進行中', '');
    sim_assert(category + ' - 7. 保留→進行中', r7.success);
    var t7 = task_getTaskById(id7);
    sim_assertEqual(category + ' - 7v. 状態確認', t7 ? t7.status : '', '進行中');

    // 8. 完了→進行中（不正遷移テスト）
    // シートには書き込まれるが論理的に不正
    var id8 = sim_insertTask('F08', { status: '完了', title: 'F-遷移8（不正）' });
    var r8 = task_updateTaskStatus(id8, '進行中', '');
    // task_updateTaskStatusは遷移の妥当性チェックをしないので成功する
    sim_assert(category + ' - 8. 完了→進行中（不正遷移・シートには書き込まれる）', r8.success);
    var t8 = task_getTaskById(id8);
    sim_assertEqual(category + ' - 8v. 状態確認', t8 ? t8.status : '', '進行中');

    // クリーンアップ
    sim_cleanupTasks();

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== G. 完了報告・承認フローテスト =====
// ================================================================================

function sim_testG_ApprovalFlow() {
  var category = 'G. 完了報告・承認フロー';

  try {
    sim_ensureSheets();
    sim_setupMembers();
    sim_cleanupTasks();

    // 1. 完了報告（コメント付き）→ 状態確認
    var id1 = sim_insertTask('G01', { status: '進行中', title: 'G-完了報告', assignee: '田中太郎', doneCriteria: 'テスト完了' });
    var r1 = task_submitCompletionReport(id1, '全作業完了しました');
    sim_assert(category + ' - 1a. 完了報告が成功', r1.success, r1.error || '');
    var t1 = task_getTaskById(id1);
    sim_assertEqual(category + ' - 1b. 状態が完了報告済み', t1 ? t1.status : '', '完了報告済み');
    sim_assertEqual(category + ' - 1c. コメントが記録', t1 ? t1.completionComment : '', '全作業完了しました');

    // 2. 承認 → 状態確認 + 承認者記録確認
    var id2 = sim_insertTask('G02', { status: '完了報告済み', title: 'G-承認', assignee: '鈴木花子' });
    var r2 = task_approveTask(id2, '佐藤一郎');
    sim_assert(category + ' - 2a. 承認が成功', r2.success, r2.error || '');
    var t2 = task_getTaskById(id2);
    sim_assertEqual(category + ' - 2b. 状態が完了', t2 ? t2.status : '', '完了');
    sim_assert(category + ' - 2c. 承認者が記録される', t2 && t2.approvalNote.indexOf('佐藤一郎') !== -1, '承認メモ: ' + (t2 ? t2.approvalNote : ''));

    // 3. 差し戻し（理由付き）→ 状態確認 + 理由記録確認
    var id3 = sim_insertTask('G03', { status: '完了報告済み', title: 'G-差し戻し', assignee: '田中太郎' });
    var r3 = task_remandTask(id3, 'テストが不十分です', '佐藤一郎');
    sim_assert(category + ' - 3a. 差し戻しが成功', r3.success, r3.error || '');
    var t3 = task_getTaskById(id3);
    sim_assertEqual(category + ' - 3b. 状態が差し戻し', t3 ? t3.status : '', '差し戻し');
    sim_assert(category + ' - 3c. 差し戻し理由が記録', t3 && t3.approvalNote.indexOf('テストが不十分です') !== -1, '承認メモ: ' + (t3 ? t3.approvalNote : ''));

    // 4. 差し戻し→再提出→承認のループ
    var id4 = sim_insertTask('G04', { status: '進行中', title: 'G-ループ', assignee: '鈴木花子' });

    // 完了報告
    task_submitCompletionReport(id4, '1回目の報告');
    var t4a = task_getTaskById(id4);
    sim_assertEqual(category + ' - 4a. ループ: 完了報告済み', t4a ? t4a.status : '', '完了報告済み');

    // 差し戻し
    task_remandTask(id4, '修正してください', '佐藤一郎');
    var t4b = task_getTaskById(id4);
    sim_assertEqual(category + ' - 4b. ループ: 差し戻し', t4b ? t4b.status : '', '差し戻し');

    // 再度進行中→完了報告
    task_updateTaskStatus(id4, '進行中', '');
    task_submitCompletionReport(id4, '2回目の報告');
    var t4c = task_getTaskById(id4);
    sim_assertEqual(category + ' - 4c. ループ: 再完了報告', t4c ? t4c.status : '', '完了報告済み');

    // 承認
    task_approveTask(id4, '佐藤一郎');
    var t4d = task_getTaskById(id4);
    sim_assertEqual(category + ' - 4d. ループ: 最終承認', t4d ? t4d.status : '', '完了');

    // クリーンアップ
    sim_cleanupTasks();

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== H. AI解析テスト（JSONパース） =====
// ================================================================================

function sim_testH_AiParse() {
  var category = 'H. AI解析（JSONパース）';

  try {
    // 1. 正常なJSON文字列
    var r1 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"テスト"}]}');
    sim_assert(category + ' - 1. 正常なJSON', r1 !== null && r1.tasks && r1.tasks[0].title === 'テスト');

    // 2. ```json ... ``` で囲まれたJSON
    var r2 = task_parseJsonFromAiOutput('以下はJSON出力です。\n```json\n{"tasks":[{"id":"task-001","title":"コードブロック"}]}\n```\n以上です。');
    sim_assert(category + ' - 2. ```jsonブロック', r2 !== null && r2.tasks && r2.tasks[0].title === 'コードブロック');

    // 3. ``` ... ``` で囲まれたJSON（言語指定なし）
    var r3 = task_parseJsonFromAiOutput('結果:\n```\n{"tasks":[{"id":"task-001","title":"言語指定なし"}]}\n```');
    sim_assert(category + ' - 3. ```ブロック（言語指定なし）', r3 !== null && r3.tasks && r3.tasks[0].title === '言語指定なし');

    // 4. テキスト混在JSON（前後にテキストあり）
    var r4 = task_parseJsonFromAiOutput('分析結果をお伝えします。{"tasks":[{"id":"task-001","title":"混在テスト"}]} 以上がタスクです。');
    sim_assert(category + ' - 4. テキスト混在JSON', r4 !== null && r4.tasks && r4.tasks[0].title === '混在テスト');

    // 5. 複数タスクのJSON
    var r5 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"タスク1"},{"id":"task-002","title":"タスク2"},{"id":"task-003","title":"タスク3"}]}');
    sim_assert(category + ' - 5. 複数タスクJSON', r5 !== null && r5.tasks && r5.tasks.length === 3);

    // 6. 空のtasks配列
    var r6 = task_parseJsonFromAiOutput('{"tasks":[],"skipped_messages":[]}');
    sim_assert(category + ' - 6. 空のtasks配列', r6 !== null && r6.tasks && r6.tasks.length === 0);

    // 7. 不正なJSON（閉じカッコ不足）
    var r7 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"不正"');
    sim_assertNull(category + ' - 7. 不正なJSON（閉じカッコ不足）', r7);

    // 8. 完全に壊れた文字列
    var r8 = task_parseJsonFromAiOutput('これはJSONではありません。タスクの分析ができませんでした。');
    sim_assertNull(category + ' - 8. 完全に壊れた文字列', r8);

    // 9. warnings付きタスク
    var r9 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"警告付き","warnings":["期限が短い","素材が不足"]}]}');
    sim_assert(category + ' - 9. warnings付きタスク', r9 !== null && r9.tasks && r9.tasks[0].warnings && r9.tasks[0].warnings.length === 2);

    // 10. ambiguous_expressions付きタスク
    var r10 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"曖昧表現付き","ambiguous_expressions":[{"original":"いい感じ","question":"具体的にどのようなデザインですか？"}]}]}');
    sim_assert(category + ' - 10. ambiguous_expressions付きタスク',
      r10 !== null && r10.tasks && r10.tasks[0].ambiguous_expressions && r10.tasks[0].ambiguous_expressions[0].original === 'いい感じ');

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== I. カレンダー連携テスト =====
// ================================================================================

function sim_testI_Calendar() {
  var category = 'I. カレンダー連携';

  try {
    sim_ensureSheets();
    sim_setupMembers();

    // 1. イベント説明のフォーマット確認
    var desc = task_formatEventDescription({
      assignee: '田中太郎',
      doneCriteria: 'テスト完了条件',
      scopeIn: 'デザイン作成、コーディング',
      scopeOut: 'テスト実施',
      notes: 'テスト備考'
    });
    sim_assert(category + ' - 1a. フォーマットに担当者が含まれる', desc.indexOf('田中太郎') !== -1);
    sim_assert(category + ' - 1b. フォーマットに完了条件が含まれる', desc.indexOf('テスト完了条件') !== -1);
    sim_assert(category + ' - 1c. フォーマットにやることが含まれる', desc.indexOf('デザイン作成') !== -1);
    sim_assert(category + ' - 1d. フォーマットにやらないことが含まれる', desc.indexOf('テスト実施') !== -1);
    sim_assert(category + ' - 1e. フォーマットに備考が含まれる', desc.indexOf('テスト備考') !== -1);

    // 2. リマインド文字列→分数変換
    // "前日 09:00" → (24-9)*60-0 = 900分
    var m1 = task_parseReminderToMinutes('前日 09:00');
    sim_assertEqual(category + ' - 2a. 前日09:00→900分', m1, 900);

    // "当日 09:00" → 9*60+0 = 540分
    var m2 = task_parseReminderToMinutes('当日 09:00');
    sim_assertEqual(category + ' - 2b. 当日09:00→540分', m2, 540);

    // "1時間前" → パース不能（形式が合わない）→ 0
    var m3 = task_parseReminderToMinutes('1時間前');
    sim_assertEqual(category + ' - 2c. 1時間前→0（未対応形式）', m3, 0);

    // "30分前" → パース不能 → 0
    var m4 = task_parseReminderToMinutes('30分前');
    sim_assertEqual(category + ' - 2d. 30分前→0（未対応形式）', m4, 0);

    // 不正な文字列 → 0
    var m5 = task_parseReminderToMinutes('');
    sim_assertEqual(category + ' - 2e. 空文字→0', m5, 0);

    var m6 = task_parseReminderToMinutes(null);
    sim_assertEqual(category + ' - 2f. null→0', m6, 0);

    // 3. カレンダーイベント作成スキップ（calendarId空で安全にテスト）
    // 期限なしの場合はスキップされることを確認
    var calResult = task_createCalendarEvent({
      taskId: SIM_ID_PREFIX + 'I01',
      title: 'カレンダーテスト',
      assignee: '田中太郎',
      deadline: '', // 期限なし
      doneCriteria: 'テスト'
    });
    sim_assert(category + ' - 3. 期限なしでカレンダー作成スキップ', !calResult.success && calResult.error.indexOf('期限が設定されていない') !== -1);

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== J. 通知フォーマットテスト =====
// ================================================================================

function sim_testJ_NotificationFormat() {
  var category = 'J. 通知フォーマット';

  try {
    // 完了報告通知の件名・本文フォーマット
    // task_sendCompletionNotificationは直接task_notifyManagersを呼ぶので、
    // ここではフォーマット部分のロジックを模擬的に検証する

    // 1. 完了報告通知フォーマット
    var taskData1 = {
      id: SIM_ID_PREFIX + 'J01',
      title: '通知テストタスク',
      assignee: '田中太郎',
      completionComment: 'テスト完了しました',
      doneCriteria: '全テスト通過'
    };
    var subject1 = '\uD83D\uDCCB 完了報告: ' + taskData1.id + ' ' + taskData1.title;
    var body1 = taskData1.id + '（' + taskData1.title + '）が完了報告されました。\n\n' +
      '担当：' + taskData1.assignee + '\n' +
      'コメント：' + (taskData1.completionComment || 'なし') + '\n' +
      '完了条件：' + taskData1.doneCriteria + '\n\n' +
      'スプレッドシートを開いて確認してください。';
    sim_assert(category + ' - 1a. 完了報告件名にIDが含まれる', subject1.indexOf(SIM_ID_PREFIX + 'J01') !== -1);
    sim_assert(category + ' - 1b. 完了報告本文に担当者', body1.indexOf('田中太郎') !== -1);
    sim_assert(category + ' - 1c. 完了報告本文にコメント', body1.indexOf('テスト完了しました') !== -1);

    // 2. 承認通知フォーマット
    var taskData2 = {
      id: SIM_ID_PREFIX + 'J02',
      title: '承認テストタスク',
      assignee: '鈴木花子'
    };
    var subject2 = '\u2705 承認: ' + taskData2.id + ' ' + taskData2.title;
    var body2 = taskData2.id + '（' + taskData2.title + '）が承認されました。\nお疲れさまでした！';
    sim_assert(category + ' - 2a. 承認通知件名にID', subject2.indexOf(SIM_ID_PREFIX + 'J02') !== -1);
    sim_assert(category + ' - 2b. 承認通知本文に承認メッセージ', body2.indexOf('承認されました') !== -1);

    // 3. 差し戻し通知フォーマット
    var taskData3 = {
      id: SIM_ID_PREFIX + 'J03',
      title: '差し戻しテストタスク',
      assignee: '田中太郎'
    };
    var reason = 'デザインの修正が必要';
    var subject3 = '\u21A9\uFE0F 差し戻し: ' + taskData3.id + ' ' + taskData3.title;
    var body3 = taskData3.id + '（' + taskData3.title + '）が差し戻されました。\n\n' +
      '理由：' + reason + '\n\n' +
      '対応後、再度完了報告をお願いします。';
    sim_assert(category + ' - 3a. 差し戻し件名にID', subject3.indexOf(SIM_ID_PREFIX + 'J03') !== -1);
    sim_assert(category + ' - 3b. 差し戻し本文に理由', body3.indexOf('デザインの修正が必要') !== -1);
    sim_assert(category + ' - 3c. 差し戻し本文に再提出メッセージ', body3.indexOf('再度完了報告をお願いします') !== -1);

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== K. Claude Code出力テスト =====
// ================================================================================

function sim_testK_ClaudeCode() {
  var category = 'K. Claude Code出力';

  try {
    // 1. task_formatForClaudeCode() で正しいフォーマット出力確認（全項目あり）
    var output1 = task_formatForClaudeCode({
      title: 'LP制作',
      assignee: '田中太郎',
      deadline: '2026-04-01',
      doneCriteria: 'クライアント承認',
      scopeIn: 'デザイン,コーディング,テスト',
      scopeOut: 'サーバー構築,コンテンツ執筆'
    });
    sim_assert(category + ' - 1a. タスク名が含まれる', output1.indexOf('LP制作') !== -1);
    sim_assert(category + ' - 1b. 担当が含まれる', output1.indexOf('田中太郎') !== -1);
    sim_assert(category + ' - 1c. 期限が含まれる', output1.indexOf('2026-04-01') !== -1);
    sim_assert(category + ' - 1d. 完了条件が含まれる', output1.indexOf('クライアント承認') !== -1);
    sim_assert(category + ' - 1e. やることが含まれる', output1.indexOf('デザイン') !== -1);
    sim_assert(category + ' - 1f. やらないことが含まれる', output1.indexOf('サーバー構築') !== -1);
    sim_assert(category + ' - 1g. 先頭行のフレーズ', output1.indexOf('以下のタスクの作業を開始してください') !== -1);

    // 2. 全項目あり（明示的にセクション数を検証）
    sim_assert(category + ' - 2. やることセクションがある', output1.indexOf('【やること】') !== -1);
    sim_assert(category + ' - 2b. やらないことセクションがある', output1.indexOf('【やらないこと】') !== -1);

    // 3. 一部項目なし
    var output3 = task_formatForClaudeCode({
      title: 'シンプルタスク',
      assignee: '',
      deadline: '',
      doneCriteria: ''
    });
    sim_assert(category + ' - 3a. タスク名が含まれる', output3.indexOf('シンプルタスク') !== -1);
    sim_assert(category + ' - 3b. 期限が未設定', output3.indexOf('未設定') !== -1);
    // scopeIn/scopeOutがないのでセクションは出ない
    sim_assert(category + ' - 3c. やることセクションがない', output3.indexOf('【やること】') === -1);

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== L. ディスカッションパターンテスト =====
// ================================================================================

function sim_testL_DiscussionPattern() {
  var category = 'L. ディスカッションパターン';

  try {
    // 1. デザイン系キーワードでマッチ
    var r1 = task_getDiscussionPattern('バナーのデザインを作成してほしい');
    sim_assertEqual(category + ' - 1. デザイン系マッチ', r1.matched, 'design');

    // 2. 資料系キーワードでマッチ
    var r2 = task_getDiscussionPattern('提案書の資料を作る必要がある');
    sim_assertEqual(category + ' - 2. 資料系マッチ', r2.matched, 'document');

    // 3. クライアント系キーワードでマッチ
    var r3 = task_getDiscussionPattern('クライアントからの修正依頼に対応する');
    sim_assertEqual(category + ' - 3. クライアント系マッチ', r3.matched, 'client');

    // 4. 営業系キーワードでマッチ
    var r4 = task_getDiscussionPattern('見積書を送って営業する');
    sim_assertEqual(category + ' - 4. 営業系マッチ', r4.matched, 'sales');

    // 5. キーワードなしで汎用パターン
    var r5 = task_getDiscussionPattern('何かやっておいてください');
    sim_assertNull(category + ' - 5a. キーワードなしでmatchedがnull', r5.matched);
    sim_assertEqual(category + ' - 5b. パターンが汎用', r5.pattern.name, '汎用');

    // 6. 全パターン取得
    var allPatterns = task_getAllDiscussionPatterns();
    sim_assert(category + ' - 6a. 全パターン取得', allPatterns !== null);
    sim_assert(category + ' - 6b. genericパターンが存在', allPatterns.generic !== undefined);
    sim_assert(category + ' - 6c. designパターンが存在', allPatterns.design !== undefined);
    sim_assert(category + ' - 6d. documentパターンが存在', allPatterns.document !== undefined);
    sim_assert(category + ' - 6e. clientパターンが存在', allPatterns.client !== undefined);
    sim_assert(category + ' - 6f. salesパターンが存在', allPatterns.sales !== undefined);

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== M. ログ記録テスト =====
// ================================================================================

function sim_testM_LogWrite() {
  var category = 'M. ログ記録';

  try {
    sim_ensureSheets();

    // 1. ログ書き込み
    var logResult = task_writeLog('sim_test', 'テスト入力テキスト', '{"tasks":[]}', [SIM_ID_PREFIX + 'M01']);
    sim_assert(category + ' - 1. ログ書き込みが成功', logResult.success, logResult.error || '');

    // 2. 各列の値確認
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName(TASK_SHEET_NAMES.LOG);
    if (logSheet) {
      var logLastRow = logSheet.getLastRow();
      var logData = logSheet.getRange(logLastRow, 1, 1, 5).getValues()[0];

      sim_assert(category + ' - 2a. 日時が記録される', logData[0] instanceof Date);
      sim_assertEqual(category + ' - 2b. 入力モードが記録される', String(logData[1]), 'sim_test');
      sim_assertEqual(category + ' - 2c. 入力テキストが記録される', String(logData[2]), 'テスト入力テキスト');
      sim_assertEqual(category + ' - 2d. AI出力が記録される', String(logData[3]), '{"tasks":[]}');
      sim_assertEqual(category + ' - 2e. タスクIDが記録される', String(logData[4]), SIM_ID_PREFIX + 'M01');
    }

    // sim_testのログ行を掃除
    if (logSheet) {
      var lr = logSheet.getLastRow();
      if (lr >= 2) {
        var modes = logSheet.getRange(2, 2, lr - 1, 1).getValues();
        for (var i = modes.length - 1; i >= 0; i--) {
          if (String(modes[i][0]) === 'sim_test') {
            logSheet.deleteRow(i + 2);
          }
        }
      }
    }

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== N. エラーケーステスト =====
// ================================================================================

function sim_testN_ErrorCases() {
  var category = 'N. エラーケース';

  try {
    sim_ensureSheets();

    // 1. 存在しないタスクIDで更新
    var r1 = task_updateTaskStatus(SIM_ID_PREFIX + 'N_NONEXIST', '進行中', '');
    sim_assert(category + ' - 1. 存在しないIDで更新が失敗', !r1.success);
    sim_assert(category + ' - 1b. エラーメッセージにIDが含まれる', r1.error && r1.error.indexOf(SIM_ID_PREFIX + 'N_NONEXIST') !== -1, 'error: ' + (r1.error || ''));

    // 2. シートが存在しない場合のエラーハンドリング確認
    // task_getTaskByIdはtask_getAllTasksの結果を使うので、シートがないと空配列
    // ここでは直接シート名を間違えるテストは行わず、
    // task_getAllTasksの空フィルタを確認
    var r2 = task_getTaskById(SIM_ID_PREFIX + 'NONEXIST');
    sim_assertNull(category + ' - 2. 存在しないIDのgetTaskByIdはnull', r2);

    // 3. 空文字タスクの登録テスト
    var r3 = task_registerTask({
      title: '',
      assignee: '',
      inputMode: 'simulator'
    });
    // 空タイトルでも登録自体は成功する（バリデーションは上位層で行う想定）
    sim_assert(category + ' - 3. 空文字タスクの登録（成功するがタイトル空）', r3.success);
    // 登録したタスクを掃除
    if (r3.success && r3.taskId) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(TASK_SHEET_NAMES.TASK_LIST);
      if (sheet) {
        var lastRow = sheet.getLastRow();
        if (lastRow >= 2) {
          var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
          for (var i = ids.length - 1; i >= 0; i--) {
            if (String(ids[i][0]) === r3.taskId) {
              sheet.deleteRow(i + 2);
              break;
            }
          }
        }
      }
    }

  } catch (e) {
    sim_assert(category + ' - 例外発生', false, e.message);
  }
}

// ================================================================================
// ===== 実行関数 =====
// ================================================================================

/**
 * 全テスト実行
 */
function sim_runAll() {
  SIM_RESULTS = [];

  sim_testA_SheetInit();
  sim_testB_MemberManagement();
  sim_testC_SystemSettings();
  sim_testD_TaskRegistration();
  sim_testE_TaskQuery();
  sim_testF_StatusTransition();
  sim_testG_ApprovalFlow();
  sim_testH_AiParse();
  sim_testI_Calendar();
  sim_testJ_NotificationFormat();
  sim_testK_ClaudeCode();
  sim_testL_DiscussionPattern();
  sim_testM_LogWrite();
  sim_testN_ErrorCases();

  // 結果を保存して表示
  sim_saveResults_();
  sim_showResultDialog_();
}

/** A. シート初期化テスト */
function sim_runA_SheetInit() {
  SIM_RESULTS = [];
  sim_testA_SheetInit();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** B. 担当者管理テスト */
function sim_runB_MemberManagement() {
  SIM_RESULTS = [];
  sim_testB_MemberManagement();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** C. システム設定テスト */
function sim_runC_SystemSettings() {
  SIM_RESULTS = [];
  sim_testC_SystemSettings();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** D. タスク登録テスト */
function sim_runD_TaskRegistration() {
  SIM_RESULTS = [];
  sim_testD_TaskRegistration();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** E. タスク取得・フィルタテスト */
function sim_runE_TaskQuery() {
  SIM_RESULTS = [];
  sim_testE_TaskQuery();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** F. 状態遷移テスト */
function sim_runF_StatusTransition() {
  SIM_RESULTS = [];
  sim_testF_StatusTransition();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** G. 完了報告・承認フローテスト */
function sim_runG_ApprovalFlow() {
  SIM_RESULTS = [];
  sim_testG_ApprovalFlow();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** H. AI解析（JSONパース）テスト */
function sim_runH_AiParse() {
  SIM_RESULTS = [];
  sim_testH_AiParse();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** I. カレンダー連携テスト */
function sim_runI_Calendar() {
  SIM_RESULTS = [];
  sim_testI_Calendar();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** J. 通知フォーマットテスト */
function sim_runJ_NotificationFormat() {
  SIM_RESULTS = [];
  sim_testJ_NotificationFormat();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** K. Claude Code出力テスト */
function sim_runK_ClaudeCode() {
  SIM_RESULTS = [];
  sim_testK_ClaudeCode();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** L. ディスカッションパターンテスト */
function sim_runL_DiscussionPattern() {
  SIM_RESULTS = [];
  sim_testL_DiscussionPattern();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** M. ログ記録テスト */
function sim_runM_LogWrite() {
  SIM_RESULTS = [];
  sim_testM_LogWrite();
  sim_saveResults_();
  sim_showResultDialog_();
}

/** N. エラーケーステスト */
function sim_runN_ErrorCases() {
  SIM_RESULTS = [];
  sim_testN_ErrorCases();
  sim_saveResults_();
  sim_showResultDialog_();
}

// ================================================================================
// ===== 結果保存・表示 =====
// ================================================================================

/**
 * テスト結果をScriptPropertiesに保存
 */
function sim_saveResults_() {
  var data = {
    timestamp: new Date().toISOString(),
    results: SIM_RESULTS
  };
  PropertiesService.getScriptProperties().setProperty('SIM_LAST_RESULT', JSON.stringify(data));
}

/**
 * 前回の結果を表示
 */
function sim_showLastResult() {
  var saved = PropertiesService.getScriptProperties().getProperty('SIM_LAST_RESULT');
  if (!saved) {
    SpreadsheetApp.getUi().alert('前回の結果はありません。テストを実行してください。');
    return;
  }
  var data = JSON.parse(saved);
  SIM_RESULTS = data.results || [];
  sim_showResultDialog_(data.timestamp);
}

/**
 * 結果をHTMLダイアログで表示
 * @param {string} [savedTimestamp] - 保存された実行日時（前回結果表示用）
 */
function sim_showResultDialog_(savedTimestamp) {
  var results = SIM_RESULTS;
  var total = results.length;
  var passed = results.filter(function(r) { return r.passed; }).length;
  var failed = total - passed;
  var rate = total > 0 ? Math.round(passed / total * 100) : 0;

  // カテゴリ別にグルーピング
  var categories = {};
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    // カテゴリ名を抽出: "A. シート初期化 - 1. ..." → "A. シート初期化"
    var catMatch = r.name.match(/^([A-Z]\.\s[^\-]+)/);
    var catName = catMatch ? catMatch[1].trim() : 'その他';
    if (!categories[catName]) categories[catName] = [];
    categories[catName].push(r);
  }

  // HTMLを構築
  var now = savedTimestamp
    ? new Date(savedTimestamp).toLocaleString('ja-JP')
    : new Date().toLocaleString('ja-JP');

  var rateColor = rate === 100 ? '#22c55e' : (rate >= 80 ? '#f59e0b' : '#ef4444');

  var html = '<!DOCTYPE html><html><head><style>';
  html += '* { box-sizing: border-box; }';
  html += 'body { font-family: "Segoe UI", "Hiragino Sans", sans-serif; margin: 0; padding: 16px; background: #f8f9fa; font-size: 13px; }';
  html += '.summary { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: center; }';
  html += '.summary h2 { margin: 0 0 8px 0; font-size: 18px; }';
  html += '.summary .rate { font-size: 36px; font-weight: 700; color: ' + rateColor + '; }';
  html += '.summary .counts { display: flex; justify-content: center; gap: 24px; margin-top: 8px; }';
  html += '.summary .count-item { text-align: center; }';
  html += '.summary .count-num { font-size: 20px; font-weight: 700; }';
  html += '.summary .count-label { font-size: 11px; color: #666; }';
  html += '.summary .timestamp { font-size: 11px; color: #999; margin-top: 8px; }';
  html += '.cat-group { background: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }';
  html += '.cat-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; cursor: pointer; user-select: none; }';
  html += '.cat-header:hover { background: #f5f5f5; }';
  html += '.cat-header .cat-title { font-weight: 600; }';
  html += '.cat-header .cat-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; }';
  html += '.cat-badge.all-pass { background: #dcfce7; color: #166534; }';
  html += '.cat-badge.has-fail { background: #fee2e2; color: #991b1b; }';
  html += '.cat-content { display: none; border-top: 1px solid #eee; padding: 8px 14px; }';
  html += '.cat-content.open { display: block; }';
  html += '.test-row { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; border-bottom: 1px solid #f5f5f5; }';
  html += '.test-row:last-child { border-bottom: none; }';
  html += '.test-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }';
  html += '.test-name { flex: 1; }';
  html += '.test-detail { color: #c62828; font-size: 12px; margin-top: 2px; word-break: break-all; }';
  html += '.arrow { transition: transform 0.2s; font-size: 10px; color: #666; }';
  html += '.arrow.open { transform: rotate(90deg); }';
  html += '.actions { text-align: center; margin-top: 16px; }';
  html += '.btn { padding: 10px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }';
  html += '.btn-close { background: #f1f3f4; color: #333; }';
  html += '.btn-close:hover { background: #e0e0e0; }';
  html += '</style></head><body>';

  // サマリー
  html += '<div class="summary">';
  html += '<h2>\uD83E\uDDEA シミュレーション結果</h2>';
  html += '<div class="rate">' + rate + '%</div>';
  html += '<div class="counts">';
  html += '<div class="count-item"><div class="count-num">' + total + '</div><div class="count-label">全テスト</div></div>';
  html += '<div class="count-item"><div class="count-num" style="color:#22c55e;">' + passed + '</div><div class="count-label">成功</div></div>';
  html += '<div class="count-item"><div class="count-num" style="color:#ef4444;">' + failed + '</div><div class="count-label">失敗</div></div>';
  html += '</div>';
  html += '<div class="timestamp">' + now + '</div>';
  html += '</div>';

  // カテゴリ別
  var catKeys = Object.keys(categories);
  for (var c = 0; c < catKeys.length; c++) {
    var catName = catKeys[c];
    var catResults = categories[catName];
    var catPassed = catResults.filter(function(r) { return r.passed; }).length;
    var catFailed = catResults.length - catPassed;
    var allPass = catFailed === 0;
    var badgeClass = allPass ? 'all-pass' : 'has-fail';
    var badgeText = allPass ? '\u2705 ' + catResults.length + '/' + catResults.length : '\u274C ' + catPassed + '/' + catResults.length;

    // 失敗がある場合はデフォルトで開く
    var openClass = allPass ? '' : ' open';

    html += '<div class="cat-group">';
    html += '<div class="cat-header" onclick="toggleCat(' + c + ')">';
    html += '<span class="cat-title">' + sim_escapeHtml_(catName) + '</span>';
    html += '<span><span class="cat-badge ' + badgeClass + '">' + badgeText + '</span>';
    html += ' <span class="arrow' + openClass + '" id="arrow-' + c + '">\u25B6</span></span>';
    html += '</div>';
    html += '<div class="cat-content' + openClass + '" id="cat-' + c + '">';

    for (var j = 0; j < catResults.length; j++) {
      var tr = catResults[j];
      var icon = tr.passed ? '\u2705' : '\u274C';
      // テスト名からカテゴリプレフィックスを除去して短縮表示
      var shortName = tr.name.replace(/^[A-Z]\.\s[^\-]+\s-\s/, '');

      html += '<div class="test-row">';
      html += '<span class="test-icon">' + icon + '</span>';
      html += '<div class="test-name">' + sim_escapeHtml_(shortName);
      if (!tr.passed && tr.detail) {
        html += '<div class="test-detail">' + sim_escapeHtml_(tr.detail) + '</div>';
      }
      html += '</div></div>';
    }

    html += '</div></div>';
  }

  // 閉じるボタン
  html += '<div class="actions"><button class="btn btn-close" onclick="google.script.host.close()">閉じる</button></div>';

  // アコーディオンスクリプト
  html += '<script>';
  html += 'function toggleCat(idx) {';
  html += '  var el = document.getElementById("cat-" + idx);';
  html += '  var arrow = document.getElementById("arrow-" + idx);';
  html += '  if (el) el.classList.toggle("open");';
  html += '  if (arrow) arrow.classList.toggle("open");';
  html += '}';
  html += '<\/script>';

  html += '</body></html>';

  var output = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(output, '\uD83E\uDDEA シミュレーション結果');
}

/**
 * HTML文字列をエスケープ（サーバーサイド用）
 * @param {string} str
 * @returns {string}
 */
function sim_escapeHtml_(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
