/**
 * 設定シート管理 GAS（単独ファイル）
 *
 * 【機能】
 * 1. 設定シートの作成・初期化
 * 2. メンバー編集ダイアログ
 * 3. 業務担当者編集ダイアログ
 * 4. フォルダ設定編集ダイアログ
 * 5. getValue系関数（他GASから呼び出し）
 *
 * 【設定シート構造】
 * A列: メンバー名
 * B列: 備考
 * D列: No
 * E列: 業務名
 * F列: 担当者（複数可、カンマ区切り）
 * H列: フォルダ設定（親フォルダID、サブフォルダ1〜）
 * I列: 値（親フォルダIDは案内テキスト表示）
 *
 * 【使用方法】
 * onOpen() に addSettingsMenu(ui); を追加
 */

// ================================================================================
// ===== 定数 =====
// ================================================================================

const SETTINGS_SHEET_NAME = '設定';

// デフォルトメンバー一覧
const DEFAULT_MEMBERS = [
  { name: '渡邉', note: '営業・立ち上げ' },
  { name: '河合', note: '原稿・編集' },
  { name: '中尾文香', note: '原稿' },
  { name: '川崎', note: '企画・撮影' },
  { name: '下脇田', note: 'FB' },
  { name: '紺谷', note: '応募対応' },
  { name: '青柳', note: 'CC' },
];

// デフォルト業務一覧（ツナゲル）
const DEFAULT_TASKS = [
  { no: 0, name: '受注・ワークス立ち上げ', assignee: '渡邉' },
  { no: 1, name: '初回打ち合わせ日程調整', assignee: '渡邉' },
  { no: 2, name: '打ち合わせ前準備', assignee: '河合' },
  { no: 3, name: 'オンライン初回打ち合わせ', assignee: '渡邉, 河合' },
  { no: 4, name: '打ち合わせ後対応', assignee: '河合' },
  { no: 5, name: 'ヒアリング内容整理', assignee: '河合' },
  { no: 6, name: '企画・質問設計', assignee: '川崎' },
  { no: 7, name: '撮影', assignee: '川崎' },
  { no: 8, name: '編集', assignee: '河合' },
  { no: 9, name: '原稿執筆', assignee: '河合, 中尾文香' },
  { no: 10, name: '企業担当へ確認依頼', assignee: '河合' },
  { no: 11, name: '今後の担当者共有・スケジュール共有', assignee: '河合' },
  { no: 12, name: '企業・応募者へ連絡', assignee: '紺谷' },
  { no: 13, name: '週間データ集計・資料作成', assignee: '河合' },
  { no: 14, name: '月次FB打合せ', assignee: '川崎, 下脇田' },
];

// デフォルトフォルダ設定
const DEFAULT_FOLDER_SETTINGS = [
  { key: '親フォルダID', value: '', note: 'Google DriveのフォルダID' },
  { key: 'サブフォルダ1', value: '01_撮影素材', note: '' },
  { key: 'サブフォルダ2', value: '02_企業カンペ', note: '' },
  { key: 'サブフォルダ3', value: '03_完成動画', note: '' },
];

// デフォルトURL設定
const DEFAULT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfOqrC2GITh67P5D-3_iop3v2eU9wIYPW7eiYdhi3r40vTrkA/viewform';

// デフォルト企業情報項目（■で始まる項目はセクション区切り）
const DEFAULT_COMPANY_INFO_HEADERS = [
  '■基本情報',
  '企業名',
  '担当者名',
  '役職・部署',
  '連絡先（電話）',
  '連絡先（メール）',
  '契約開始日',
  '■受注内容',
  '受注商材',
  '契約期間',
  '契約金額',
  '備考',
  '■制作担当',
  'メイン担当',
  'サブ担当'
];

// デフォルト保存キーマッピング（プロンプト名 → Part③保存キー）
// ここに登録されたプロンプトは保存機能付きダイアログになる
// - saveKey: 出力の保存先（従来通り）
// - inputKey: 入力の自動取得元・保存先（オプション）
// ※初期化時のみ使用。その後は設定シートM-N-O列を参照
const DEFAULT_SAVE_KEY_MAPPING = [
  { promptName: '議事録作成', saveKey: '文字起こし原文' },
  { promptName: 'ワークス投稿', saveKey: '議事録' },
  { promptName: 'ヒアリング情報抽出', saveKey: 'ヒアリング抽出JSON', inputKey: '文字起こし原文' },
];

// デフォルトPart③構成（ヒアリングシートのPart③セクション）
// ラベル名と行数を定義
// ※初期化時のみ使用。その後は設定シートP-Q列を参照
const DEFAULT_PART3_CONFIG = [
  { label: '撮影素材フォルダURL', rows: 1 },
  { label: 'メインフォルダURL', rows: 1 },
  { label: '企業カンペURL', rows: 1 },
  { label: '文字起こし原文', rows: 5 },
  { label: '議事録', rows: 8 },
  { label: 'ヒアリング抽出JSON', rows: 8 },
  { label: '構成案', rows: 8 },
  { label: 'ペアソナ/エンゲージ', rows: 8 },
  { label: '撮影指示書', rows: 8 },
];


// ================================================================================
// ===== メニュー =====
// ================================================================================

/**
 * 既存のonOpenに統合する場合
 */
function addSettingsMenu(ui) {
  ui.createMenu('０.⚙️ 設定')
    .addItem('👥 メンバー編集', 'showMemberEditDialog')
    .addItem('📝 業務担当者編集', 'showTaskAssigneeEditDialog')
    .addItem('📁 フォルダ設定編集', 'showFolderSettingsEditDialog')
    .addSeparator()
    .addItem('📄 プロンプト編集', 'showPromptEditDialog')
    .addSeparator()
    .addItem('📋 設定シートを作成', 'initializeSettingsSheet')
    .addItem('📝 プロンプトシートを作成', 'initializePromptSheet')
    .addItem('📊 企業情報一覧を作成', 'initializeCompanyListSheet')
    .addToUi();
}

/**
 * 単独で実行する場合
 */
function addSettingsMenuStandalone() {
  const ui = SpreadsheetApp.getUi();
  addSettingsMenu(ui);
}


// ================================================================================
// ===== 設定シート初期化 =====
// ================================================================================

/**
 * 設定シートを作成・初期化
 */
function initializeSettingsSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  // 既存シートがある場合は確認
  if (sheet) {
    const response = ui.alert(
      '確認',
      '「設定」シートは既に存在します。\n\n初期化すると現在の設定が上書きされます。\n続行しますか？',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) {
      return;
    }
    sheet.clear();
  } else {
    sheet = ss.insertSheet(SETTINGS_SHEET_NAME);
  }

  // ===== メンバー一覧セクション（A列〜B列） =====
  sheet.getRange('A1').setValue('メンバー一覧').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  sheet.getRange('B1').setValue('備考').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');

  const memberData = DEFAULT_MEMBERS.map(m => [m.name, m.note]);
  sheet.getRange(2, 1, memberData.length, 2).setValues(memberData);

  // ===== 業務担当者セクション（D列〜F列） =====
  sheet.getRange('D1').setValue('No').setFontWeight('bold').setBackground('#34a853').setFontColor('#fff');
  sheet.getRange('E1').setValue('業務名').setFontWeight('bold').setBackground('#34a853').setFontColor('#fff');
  sheet.getRange('F1').setValue('担当者').setFontWeight('bold').setBackground('#34a853').setFontColor('#fff');

  const taskData = DEFAULT_TASKS.map(t => [t.no, t.name, t.assignee]);
  sheet.getRange(2, 4, taskData.length, 3).setValues(taskData);

  // ===== フォルダ設定セクション（H列〜I列） =====
  sheet.getRange('H1').setValue('フォルダ設定').setFontWeight('bold').setBackground('#ff9800').setFontColor('#fff');
  sheet.getRange('I1').setValue('値').setFontWeight('bold').setBackground('#ff9800').setFontColor('#fff');

  // 親フォルダID行（案内テキスト付き）
  sheet.getRange(2, 8, 1, 2).setValues([['親フォルダID', '📁撮影フォルダ → 親フォルダを設定']]);
  sheet.getRange(2, 9).setBackground('#666666').setFontColor('#ffffff');

  // サブフォルダ
  const subfolderData = DEFAULT_FOLDER_SETTINGS
    .filter(f => f.key.startsWith('サブフォルダ'))
    .map(f => [f.key, f.value]);
  if (subfolderData.length > 0) {
    sheet.getRange(3, 8, subfolderData.length, 2).setValues(subfolderData);
  }

  // フォームURL（サブフォルダの後）
  const formUrlRow = 3 + subfolderData.length;
  sheet.getRange(formUrlRow, 8, 1, 2).setValues([['フォームURL', DEFAULT_FORM_URL]]);
  sheet.getRange(formUrlRow, 9).setFontColor('#1a73e8');  // リンク色

  // ===== 企業情報項目セクション（K列） =====
  sheet.getRange('K1').setValue('企業情報項目').setFontWeight('bold').setBackground('#9c27b0').setFontColor('#fff');

  // 企業情報項目（■で始まる項目はセクション区切り）
  const companyInfoData = DEFAULT_COMPANY_INFO_HEADERS.map(h => [h]);
  sheet.getRange(2, 11, companyInfoData.length, 1).setValues(companyInfoData);

  // セクション区切り行の背景色
  for (let i = 0; i < DEFAULT_COMPANY_INFO_HEADERS.length; i++) {
    if (DEFAULT_COMPANY_INFO_HEADERS[i].startsWith('■')) {
      sheet.getRange(i + 2, 11).setBackground('#e1bee7').setFontWeight('bold');
    }
  }

  // ===== 保存キーマッピングセクション（M列〜N列） =====
  sheet.getRange('M1').setValue('プロンプト名').setFontWeight('bold').setBackground('#00bcd4').setFontColor('#fff');
  sheet.getRange('N1').setValue('保存キー').setFontWeight('bold').setBackground('#00bcd4').setFontColor('#fff');

  const saveKeyData = DEFAULT_SAVE_KEY_MAPPING.map(m => [m.promptName, m.saveKey]);
  if (saveKeyData.length > 0) {
    sheet.getRange(2, 13, saveKeyData.length, 2).setValues(saveKeyData);
  }

  // ===== Part③構成セクション（P列〜Q列） =====
  sheet.getRange('P1').setValue('Part③ラベル').setFontWeight('bold').setBackground('#607d8b').setFontColor('#fff');
  sheet.getRange('Q1').setValue('行数').setFontWeight('bold').setBackground('#607d8b').setFontColor('#fff');

  const part3Data = DEFAULT_PART3_CONFIG.map(p => [p.label, p.rows]);
  if (part3Data.length > 0) {
    sheet.getRange(2, 16, part3Data.length, 2).setValues(part3Data);
  }

  // ===== 列幅調整 =====
  sheet.setColumnWidth(1, 100);  // メンバー名
  sheet.setColumnWidth(2, 120);  // 備考
  sheet.setColumnWidth(3, 30);   // 区切り
  sheet.setColumnWidth(4, 40);   // No
  sheet.setColumnWidth(5, 250);  // 業務名
  sheet.setColumnWidth(6, 150);  // 担当者
  sheet.setColumnWidth(7, 30);   // 区切り
  sheet.setColumnWidth(8, 120);  // フォルダ設定
  sheet.setColumnWidth(9, 280);  // 値
  sheet.setColumnWidth(10, 30);  // 区切り
  sheet.setColumnWidth(11, 140); // 企業情報項目
  sheet.setColumnWidth(12, 30);  // 区切り
  sheet.setColumnWidth(13, 120); // プロンプト名
  sheet.setColumnWidth(14, 140); // 保存キー
  sheet.setColumnWidth(15, 30);  // 区切り
  sheet.setColumnWidth(16, 160); // Part③ラベル
  sheet.setColumnWidth(17, 50);  // 行数

  ui.alert('完了',
    '設定シートを作成しました。\n\n' +
    '・メンバー一覧: A列〜B列\n' +
    '・業務担当者: D列〜F列（メニューから編集）\n' +
    '・フォルダ設定: H列〜I列\n' +
    '・企業情報項目: K列（■で始まる項目はセクション区切り）\n' +
    '・保存キーマッピング: M列〜N列（プロンプト名→Part③保存先）\n' +
    '・Part③構成: P列〜Q列（ヒアリングシートのPart③セクション）\n\n' +
    '各項目はシートで直接編集できます。',
    ui.ButtonSet.OK
  );
}


// ================================================================================
// ===== getValue系関数（他GASから呼び出し） =====
// ================================================================================

/**
 * メンバー一覧を取得
 * @returns {string[]} メンバー名の配列
 */
function getMemberList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_MEMBERS.map(m => m.name);
  }

  const data = sheet.getRange('A2:A').getValues();
  const members = [];

  for (const row of data) {
    const name = String(row[0] || '').trim();
    if (name) {
      members.push(name);
    }
  }

  return members.length > 0 ? members : DEFAULT_MEMBERS.map(m => m.name);
}


/**
 * 業務Noから担当者を取得
 * @param {number} taskNo - 業務No（0〜14）
 * @returns {string} 担当者名
 */
function getAssigneeByTaskNo(taskNo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    const task = DEFAULT_TASKS.find(t => t.no === taskNo);
    return task ? task.assignee : '';
  }

  const data = sheet.getRange('D2:F').getValues();

  for (const row of data) {
    const no = row[0];
    const assignee = String(row[2] || '').trim();

    if (no === taskNo || String(no) === String(taskNo)) {
      return assignee;
    }
  }

  // 見つからない場合はデフォルト値を返す
  const task = DEFAULT_TASKS.find(t => t.no === taskNo);
  return task ? task.assignee : '';
}


/**
 * 全業務の担当者一覧を取得
 * @returns {Object[]} { no, name, assignee } の配列
 */
function getAllTaskAssignees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_TASKS;
  }

  const data = sheet.getRange('D2:F').getValues();
  const tasks = [];

  for (const row of data) {
    const no = row[0];
    const name = String(row[1] || '').trim();
    const assignee = String(row[2] || '').trim();

    if (name) {
      tasks.push({ no: no, name: name, assignee: assignee });
    }
  }

  return tasks.length > 0 ? tasks : DEFAULT_TASKS;
}


/**
 * 親フォルダIDを取得
 * @returns {string} フォルダID
 */
function getParentFolderIdFromSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    // 設定シートがない場合はPropertiesServiceから取得（後方互換）
    return PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID') || '';
  }

  const data = sheet.getRange('H2:I').getValues();

  for (const row of data) {
    const key = String(row[0] || '').trim();
    const value = String(row[1] || '').trim();

    if (key === '親フォルダID') {
      return value;
    }
  }

  return '';
}


/**
 * サブフォルダ一覧を取得
 * @returns {string[]} サブフォルダ名の配列
 */
function getSubfoldersFromSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_FOLDER_SETTINGS
      .filter(f => f.key.startsWith('サブフォルダ'))
      .map(f => f.value);
  }

  const data = sheet.getRange('H2:I').getValues();
  const subfolders = [];

  for (const row of data) {
    const key = String(row[0] || '').trim();
    const value = String(row[1] || '').trim();

    if (key.startsWith('サブフォルダ') && value) {
      subfolders.push(value);
    }
  }

  return subfolders.length > 0 ? subfolders : ['01_撮影素材', '02_企業カンペ', '03_完成動画'];
}


/**
 * 企業情報項目を取得（設定シートのK列）
 * @returns {string[]} 企業情報項目の配列（■セクション区切り含む）
 */
function getCompanyInfoHeadersFromSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_COMPANY_INFO_HEADERS;
  }

  const data = sheet.getRange('K2:K').getValues();
  const headers = [];

  for (const row of data) {
    const value = String(row[0] || '').trim();
    if (value) {
      headers.push(value);
    }
  }

  return headers.length > 0 ? headers : DEFAULT_COMPANY_INFO_HEADERS;
}


/**
 * ヒアリングフォームURLを取得
 * @returns {string} フォームURL
 */
function getFormUrlFromSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_FORM_URL;
  }

  const data = sheet.getRange('H2:I').getValues();

  for (const row of data) {
    const key = String(row[0] || '').trim();
    const value = String(row[1] || '').trim();

    if (key === 'フォームURL' && value) {
      return value;
    }
  }

  return DEFAULT_FORM_URL;
}


/**
 * 設定シートから担当者情報を取得（compositionDraftGenerator.js互換）
 * @returns {Object} { 原稿担当1: '河合', ... } または { error: 'エラーメッセージ' }
 */
function getSettingsFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return {
      error: '「設定」シートがありません。\n\n' +
             'メニュー「０.⚙️ 設定」→「設定シートを作成」を実行してください。'
    };
  }

  // 業務担当者から役割を推測して返す（後方互換用）
  const tasks = getAllTaskAssignees();
  const settings = {};

  // 役割ベースのマッピング（後方互換）
  // No.9 原稿執筆 → 原稿担当1, 原稿担当2
  const genkoTask = tasks.find(t => t.no === 9 || t.name.includes('原稿'));
  if (genkoTask && genkoTask.assignee) {
    const assignees = genkoTask.assignee.split(/[,、]/).map(s => s.trim());
    settings['原稿担当1'] = assignees[0] || '';
    settings['原稿担当2'] = assignees[1] || '';
  }

  // No.7 撮影 → 撮影担当
  const satsueiTask = tasks.find(t => t.no === 7 || t.name === '撮影');
  if (satsueiTask) {
    settings['撮影担当'] = satsueiTask.assignee.split(/[,、]/)[0].trim();
  }

  // No.6 企画・質問設計 → 動画担当
  const dougaTask = tasks.find(t => t.no === 6 || t.name.includes('企画'));
  if (dougaTask) {
    settings['動画担当'] = dougaTask.assignee.split(/[,、]/)[0].trim();
  }

  // No.8 編集 → 編集担当
  const henshuTask = tasks.find(t => t.no === 8 || t.name === '編集');
  if (henshuTask) {
    settings['編集担当'] = henshuTask.assignee.split(/[,、]/)[0].trim();
  }

  // メンバー一覧からCCを探す
  const members = getMemberListWithNotes();
  const ccMember = members.find(m => m.note && m.note.includes('CC'));
  settings['CC'] = ccMember ? ccMember.name : '';

  return settings;
}


/**
 * プロンプト名から保存キーを取得
 * 設定シートのM列〜N列から取得（設定シートで管理を強制）
 * @param {string} promptName - プロンプト名
 * @returns {string|null} 保存キー（マッピングがなければnull）
 */
function getSaveKeyForPrompt(promptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    // 設定シートがなければnullを返す（保存機能なし）
    console.log('getSaveKeyForPrompt: 設定シートが見つかりません。保存機能を使うには設定シートを作成してください。');
    return null;
  }

  // M列〜N列から取得
  const data = sheet.getRange('M2:N').getValues();

  for (const row of data) {
    const name = String(row[0] || '').trim();
    const key = String(row[1] || '').trim();

    if (name === promptName && key) {
      return key;
    }
  }

  // 見つからなければnullを返す（保存機能なし）
  // ※設定シートのM-N列にマッピングを追加すると保存機能が有効になります
  return null;
}


/**
 * プロンプト名から入力キーを取得
 * inputKeyがあれば入力欄に自動取得 + 保存が可能になる
 * @param {string} promptName - プロンプト名
 * @returns {string|null} 入力キー（マッピングがなければnull）
 */
function getInputKeyForPrompt(promptName) {
  // 現在はDEFAULT_SAVE_KEY_MAPPINGから取得（設定シート拡張時に変更）
  const mapping = DEFAULT_SAVE_KEY_MAPPING.find(m => m.promptName === promptName);
  return mapping && mapping.inputKey ? mapping.inputKey : null;
}


/**
 * 全保存キーマッピングを取得（設定シートから）
 * @returns {Object[]} { promptName, saveKey } の配列（設定シートがなければ空配列）
 */
function getAllSaveKeyMappings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return [];
  }

  const data = sheet.getRange('M2:N').getValues();
  const mappings = [];

  for (const row of data) {
    const promptName = String(row[0] || '').trim();
    const saveKey = String(row[1] || '').trim();

    if (promptName && saveKey) {
      mappings.push({ promptName, saveKey });
    }
  }

  return mappings;
}


/**
 * Part③構成をデバッグ表示（問題調査用）
 * 実行後、「実行ログ」または「ログ」タブで結果を確認
 */
function debugPart3Config() {
  const config = getPart3ConfigFromSettings();

  console.log('=== Part③構成デバッグ ===');
  console.log('件数: ' + config.length);

  if (config.length === 0) {
    console.log('⚠️ Part③構成が空です。設定シートのP-Q列を確認してください。');
  } else {
    config.forEach((item, i) => {
      console.log((i + 1) + '. ' + item.label + ' (' + item.rows + '行)');
    });
  }

  // 設定シートのP-Q列の生データも確認
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');
  if (sheet) {
    const rawData = sheet.getRange('P1:Q10').getValues();
    console.log('\n=== 設定シート P-Q列の生データ ===');
    rawData.forEach((row, i) => {
      console.log('行' + (i + 1) + ': P=' + row[0] + ', Q=' + row[1]);
    });
  } else {
    console.log('⚠️ 設定シートが見つかりません');
  }
}

/**
 * Part③構成を設定シートから取得（P列〜Q列）
 * @returns {Object[]} { label, rows } の配列（設定シートがなければ空配列）
 */
function getPart3ConfigFromSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return [];
  }

  const data = sheet.getRange('P2:Q').getValues();
  const config = [];

  for (const row of data) {
    const label = String(row[0] || '').trim();
    const rows = parseInt(row[1], 10);

    if (label && rows > 0) {
      config.push({ label, rows });
    }
  }

  return config;
}


/**
 * シートが除外対象かどうか判定
 * @param {string} sheetName - 判定するシート名
 * @returns {boolean} 除外対象ならtrue
 */
function isExcludedSheet(sheetName) {
  // 完全一致で除外
  const exactMatch = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧'];
  if (exactMatch.includes(sheetName)) {
    return true;
  }

  // 部分一致で除外（「ヒアリングシート」または「原本」を含む）
  if (sheetName.includes('ヒアリングシート') || sheetName.includes('原本')) {
    return true;
  }

  return false;
}


/**
 * メンバー一覧を備考付きで取得
 * @returns {Object[]} { name, note } の配列
 */
function getMemberListWithNotes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    return DEFAULT_MEMBERS;
  }

  const data = sheet.getRange('A2:B').getValues();
  const members = [];

  for (const row of data) {
    const name = String(row[0] || '').trim();
    const note = String(row[1] || '').trim();

    if (name) {
      members.push({ name: name, note: note });
    }
  }

  return members.length > 0 ? members : DEFAULT_MEMBERS;
}


/**
 * プレースホルダーを担当者情報で置換（compositionDraftGenerator.js互換）
 */
function replacePlaceholders(text, settings) {
  if (!text) return text;
  if (!settings) {
    settings = getSettingsFromSheet();
    if (settings.error) return text;
  }

  let result = text;

  // 単一担当者のプレースホルダー
  const singleKeys = ['原稿担当1', '原稿担当2', '動画担当', '撮影担当', '編集担当', 'CC'];
  for (const key of singleKeys) {
    const value = settings[key] || '';
    result = result.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), value);
    result = result.replace(new RegExp('\\{\\{@' + key + '\\}\\}', 'g'), value ? '@' + value : '');
  }

  // 原稿チーム（複数担当者）
  const genkoTeam = [settings['原稿担当1'], settings['原稿担当2']].filter(v => v).join('・');
  const genkoTeamMention = [settings['原稿担当1'], settings['原稿担当2']].filter(v => v).map(v => '@' + v).join(' ');
  result = result.replace(/\{\{原稿チーム\}\}/g, genkoTeam);
  result = result.replace(/\{\{@原稿チーム\}\}/g, genkoTeamMention);

  return result;
}


// ================================================================================
// ===== メンバー編集ダイアログ =====
// ================================================================================

function showMemberEditDialog() {
  const members = getMemberListWithNotes();

  const html = HtmlService.createHtmlOutput(createMemberEditHTML(members))
    .setWidth(500)
    .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, '👥 メンバー編集');
}

function createMemberEditHTML(members) {
  const membersJson = JSON.stringify(members);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
    .member-list { max-height: 300px; overflow-y: auto; }
    .member-row { display: flex; gap: 10px; margin-bottom: 8px; align-items: center; }
    .member-row input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .member-row input.name { width: 120px; }
    .member-row input.note { flex: 1; }
    .member-row button { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background: #ffebee; color: #c62828; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-secondary { background: #f1f3f4; color: #333; }
    .btn-add { background: #e8f5e9; color: #2e7d32; margin-bottom: 15px; }
    .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
    .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .status.error { display: block; background: #ffebee; color: #c62828; }
  </style>
</head>
<body>
  <p>メンバーを追加・編集できます。変更後は「保存」をクリックしてください。</p>

  <button class="btn btn-add" onclick="addMember()">＋ メンバーを追加</button>

  <div class="member-list" id="memberList"></div>

  <div style="margin-top: 20px;">
    <button class="btn btn-primary" onclick="saveMembers()">保存</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
  </div>

  <div class="status" id="status"></div>

  <script>
    let members = ${membersJson};

    function renderList() {
      const container = document.getElementById('memberList');
      container.innerHTML = members.map((m, i) => \`
        <div class="member-row">
          <input type="text" class="name" value="\${escapeHtml(m.name)}" onchange="updateMember(\${i}, 'name', this.value)" placeholder="名前">
          <input type="text" class="note" value="\${escapeHtml(m.note || '')}" onchange="updateMember(\${i}, 'note', this.value)" placeholder="備考">
          <button onclick="removeMember(\${i})">×</button>
        </div>
      \`).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function addMember() {
      members.push({ name: '', note: '' });
      renderList();
    }

    function removeMember(index) {
      members.splice(index, 1);
      renderList();
    }

    function updateMember(index, field, value) {
      members[index][field] = value;
    }

    function saveMembers() {
      // 空の名前を除外
      const validMembers = members.filter(m => m.name.trim());

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました', 'success');
            setTimeout(() => google.script.host.close(), 1000);
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .saveMemberList(validMembers);
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    renderList();
  </script>
</body>
</html>
`;
}

/**
 * メンバー一覧を保存
 */
function saveMemberList(members) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

    if (!sheet) {
      return { success: false, error: '設定シートがありません。先に設定シートを作成してください。' };
    }

    // 既存のメンバー一覧をクリア（A2:B以降）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
    }

    // 新しいメンバー一覧を書き込み
    if (members.length > 0) {
      const data = members.map(m => [m.name, m.note || '']);
      sheet.getRange(2, 1, data.length, 2).setValues(data);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ================================================================================
// ===== 業務担当者編集ダイアログ =====
// ================================================================================

function showTaskAssigneeEditDialog() {
  const tasks = getAllTaskAssignees();
  const members = getMemberList();

  const html = HtmlService.createHtmlOutput(createTaskAssigneeEditHTML(tasks, members))
    .setWidth(700)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '📝 業務担当者編集');
}

function createTaskAssigneeEditHTML(tasks, members) {
  const tasksJson = JSON.stringify(tasks);
  const membersJson = JSON.stringify(members);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; vertical-align: top; }
    th { background: #f5f5f5; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-secondary { background: #f1f3f4; color: #333; }
    .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
    .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .status.error { display: block; background: #ffebee; color: #c62828; }
    .task-list { max-height: 400px; overflow-y: auto; }
    .note { font-size: 12px; color: #666; margin-bottom: 15px; }
    .assignee-cell { min-width: 200px; position: relative; }
    .assignee-display {
      padding: 6px 10px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .assignee-display:hover { background: #e8e8e8; }
    .assignee-display .placeholder { color: #999; }
    .assignee-display .arrow { color: #666; font-size: 10px; }
    .checkbox-dropdown {
      position: absolute;
      left: 0;
      top: 100%;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      min-width: 180px;
    }
    .checkbox-dropdown label {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      gap: 8px;
    }
    .checkbox-dropdown label:hover { background: #f5f5f5; }
    .checkbox-dropdown input[type="checkbox"] { margin: 0; cursor: pointer; }
    .task-name { max-width: 250px; }
  </style>
</head>
<body>
  <p class="note">各業務の担当者を選択してください。クリックして複数人を選択できます。</p>

  <div class="task-list">
    <table>
      <thead>
        <tr>
          <th style="width:40px">No</th>
          <th>業務名</th>
          <th>担当者</th>
        </tr>
      </thead>
      <tbody id="taskList"></tbody>
    </table>
  </div>

  <div style="margin-top: 20px;">
    <button class="btn btn-primary" onclick="saveTasks()">保存</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
  </div>

  <div class="status" id="status"></div>

  <script>
    let tasks = ${tasksJson};
    const members = ${membersJson};
    let openDropdown = null;

    // 担当者文字列を配列に変換
    function parseAssignees(assigneeStr) {
      if (!assigneeStr) return [];
      return assigneeStr.split(/[,、]/).map(s => s.trim()).filter(s => s);
    }

    // 配列を担当者文字列に変換
    function formatAssignees(assigneeArr) {
      return assigneeArr.join(', ');
    }

    function renderList() {
      const tbody = document.getElementById('taskList');
      tbody.innerHTML = tasks.map((t, i) => {
        const assignees = parseAssignees(t.assignee);
        const displayText = assignees.length > 0 ? assignees.join(', ') : '';
        return \`
          <tr>
            <td>\${t.no}</td>
            <td class="task-name">\${escapeHtml(t.name)}</td>
            <td class="assignee-cell">
              <div class="assignee-display" onclick="toggleDropdown(\${i}, event)">
                <span class="\${displayText ? '' : 'placeholder'}">\${displayText || '-- 選択 --'}</span>
                <span class="arrow">▼</span>
              </div>
              <div id="dropdown-\${i}" class="checkbox-dropdown" style="display:none;">
                \${members.map(m => \`
                  <label>
                    <input type="checkbox"
                           value="\${escapeHtml(m)}"
                           \${assignees.includes(m) ? 'checked' : ''}
                           onchange="updateAssignee(\${i})">
                    \${escapeHtml(m)}
                  </label>
                \`).join('')}
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toggleDropdown(index, event) {
      event.stopPropagation();
      const dropdown = document.getElementById('dropdown-' + index);

      // 他のドロップダウンを閉じる
      if (openDropdown !== null && openDropdown !== index) {
        document.getElementById('dropdown-' + openDropdown).style.display = 'none';
      }

      if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        openDropdown = index;
      } else {
        dropdown.style.display = 'none';
        openDropdown = null;
      }
    }

    function updateAssignee(index) {
      const dropdown = document.getElementById('dropdown-' + index);
      const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
      const selected = Array.from(checkboxes).map(cb => cb.value);
      tasks[index].assignee = formatAssignees(selected);

      // 表示を更新（ドロップダウンは開いたまま）
      const displayEl = dropdown.previousElementSibling.querySelector('span:first-child');
      const displayText = selected.length > 0 ? selected.join(', ') : '';
      displayEl.textContent = displayText || '-- 選択 --';
      displayEl.className = displayText ? '' : 'placeholder';
    }

    // ドロップダウン外クリックで閉じる
    document.addEventListener('click', function(e) {
      if (openDropdown !== null) {
        const dropdown = document.getElementById('dropdown-' + openDropdown);
        if (dropdown && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          openDropdown = null;
        }
      }
    });

    function saveTasks() {
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました', 'success');
            setTimeout(() => google.script.host.close(), 1000);
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .saveTaskAssignees(tasks);
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    renderList();
  </script>
</body>
</html>
`;
}

/**
 * 業務担当者を保存
 */
function saveTaskAssignees(tasks) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

    if (!sheet) {
      return { success: false, error: '設定シートがありません。先に設定シートを作成してください。' };
    }

    // 既存の業務一覧をクリア（D2:F以降）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 4, lastRow - 1, 3).clearContent();
    }

    // 新しい業務一覧を書き込み
    if (tasks.length > 0) {
      const data = tasks.map(t => [t.no, t.name, t.assignee || '']);
      sheet.getRange(2, 4, data.length, 3).setValues(data);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ================================================================================
// ===== フォルダ設定編集ダイアログ =====
// ================================================================================

function showFolderSettingsEditDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  // 親フォルダIDはPropertiesServiceから取得
  const parentFolderId = PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID') || '';

  // フォルダ名を取得（Drive APIが有効な場合）
  let parentFolderName = '';
  if (parentFolderId) {
    try {
      const folder = Drive.Files.get(parentFolderId, { supportsAllDrives: true });
      parentFolderName = folder.title || folder.name || '';
    } catch (e) {
      parentFolderName = '（取得できません）';
    }
  }

  // サブフォルダは設定シートから取得
  let subfolders = [];
  if (sheet) {
    const data = sheet.getRange('H2:I').getValues();

    for (const row of data) {
      const key = String(row[0] || '').trim();
      const value = String(row[1] || '').trim();

      if (key.startsWith('サブフォルダ') && value) {
        subfolders.push(value);
      }
    }
  }

  // デフォルト値（シートにデータがない場合）
  if (subfolders.length === 0) {
    subfolders = DEFAULT_FOLDER_SETTINGS
      .filter(f => f.key.startsWith('サブフォルダ'))
      .map(f => f.value);
  }

  const html = HtmlService.createHtmlOutput(createFolderSettingsEditHTML(parentFolderId, parentFolderName, subfolders))
    .setWidth(600)
    .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, '📁 フォルダ設定編集');
}

function createFolderSettingsEditHTML(parentFolderId, parentFolderName, subfolders) {
  const subfoldersJson = JSON.stringify(subfolders);

  // IDをスライス表示（長い場合は省略）
  let displayId = '';
  if (parentFolderId) {
    if (parentFolderId.length > 20) {
      displayId = parentFolderId.substring(0, 8) + '...' + parentFolderId.substring(parentFolderId.length - 8);
    } else {
      displayId = parentFolderId;
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; margin-bottom: 10px; color: #333; font-size: 14px; }
    .setting-row { margin-bottom: 15px; }
    .setting-row label { display: block; font-weight: bold; margin-bottom: 5px; color: #333; }
    .setting-row .note { font-size: 12px; color: #666; margin-top: 3px; }
    .subfolder-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .subfolder-row input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    .subfolder-row .delete-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #ffebee;
      color: #c62828;
      font-size: 16px;
    }
    .subfolder-row .delete-btn:hover { background: #ffcdd2; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-secondary { background: #f1f3f4; color: #333; }
    .btn-add { background: #e8f5e9; color: #2e7d32; margin-top: 10px; }
    .btn-add:hover { background: #c8e6c9; }
    .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
    .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .status.error { display: block; background: #ffebee; color: #c62828; }
    .parent-folder-box {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 8px;
    }
    .parent-folder-name {
      font-weight: bold;
      color: #333;
      font-size: 14px;
    }
    .parent-folder-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .parent-folder-hint {
      font-size: 12px;
      color: #1976d2;
      margin-top: 8px;
    }
    .not-set {
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">📁 親フォルダ</div>
    <div class="parent-folder-box">
      ${parentFolderId ? `
        <div class="parent-folder-name">📂 ${parentFolderName || '（名前取得中...）'}</div>
        <div class="parent-folder-id">ID: ${displayId}</div>
      ` : `
        <div class="not-set">未設定</div>
      `}
    </div>
    <div class="parent-folder-hint">
      変更する場合: メニュー「📁 撮影フォルダ」→「⚙️ 親フォルダを設定」
    </div>
  </div>

  <div class="section">
    <div class="section-title">📂 サブフォルダ</div>
    <div id="subfolderList"></div>
    <button class="btn btn-add" onclick="addSubfolder()">＋ サブフォルダを追加</button>
  </div>

  <div style="margin-top: 25px;">
    <button class="btn btn-primary" onclick="saveSettings()">保存</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
  </div>

  <div class="status" id="status"></div>

  <script>
    let subfolders = ${subfoldersJson};

    function renderSubfolders() {
      const container = document.getElementById('subfolderList');
      container.innerHTML = subfolders.map((sf, i) => \`
        <div class="subfolder-row">
          <input type="text" value="\${escapeHtml(sf)}" onchange="updateSubfolder(\${i}, this.value)" placeholder="フォルダ名">
          <button class="delete-btn" onclick="removeSubfolder(\${i})" title="削除">×</button>
        </div>
      \`).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function addSubfolder() {
      const num = subfolders.length + 1;
      subfolders.push('0' + num + '_新規フォルダ');
      renderSubfolders();
    }

    function removeSubfolder(index) {
      subfolders.splice(index, 1);
      renderSubfolders();
    }

    function updateSubfolder(index, value) {
      subfolders[index] = value;
    }

    function saveSettings() {
      // 空のサブフォルダを除外
      const validSubfolders = subfolders.filter(sf => sf.trim());

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました', 'success');
            setTimeout(() => google.script.host.close(), 1000);
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .saveSubfoldersOnly(validSubfolders);
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    renderSubfolders();
  </script>
</body>
</html>
`;
}

/**
 * サブフォルダのみ保存（親フォルダIDはPropertiesServiceで管理）
 */
function saveSubfoldersOnly(subfolders) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

    if (!sheet) {
      return { success: false, error: '設定シートがありません。先に設定シートを作成してください。' };
    }

    // 既存のフォルダ設定をクリア（H2:J以降）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 8, lastRow - 1, 3).clearContent();
      sheet.getRange(2, 8, lastRow - 1, 3).setBackground(null).setFontColor(null);
    }

    // 親フォルダID行（案内テキスト付き）
    const parentRow = sheet.getRange(2, 8, 1, 2);
    parentRow.setValues([['親フォルダID', '📁撮影フォルダ → 親フォルダを設定']]);
    sheet.getRange(2, 9).setBackground('#666666').setFontColor('#ffffff');

    // サブフォルダを書き込み
    if (subfolders.length > 0) {
      const data = subfolders.map((sf, i) => ['サブフォルダ' + (i + 1), sf]);
      sheet.getRange(3, 8, data.length, 2).setValues(data);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ================================================================================
// ===== プロンプト編集ダイアログ =====
// ================================================================================

const PROMPT_SHEET_NAME = 'プロンプト';

/**
 * プロンプト編集ダイアログを表示
 */
function showPromptEditDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PROMPT_SHEET_NAME);

  let prompts = [];

  if (sheet) {
    const data = sheet.getRange('A2:F').getValues();

    for (const row of data) {
      const name = String(row[0] || '').trim();
      if (name) {
        prompts.push({
          name: name,
          description: String(row[1] || '').trim(),
          label: String(row[2] || '').trim(),
          placeholder: String(row[3] || '').trim(),
          template: String(row[4] || '').trim(),
          category: String(row[5] || '').trim()
        });
      }
    }
  }

  const html = HtmlService.createHtmlOutput(createPromptEditHTML(prompts))
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '📄 プロンプト編集');
}

function createPromptEditHTML(prompts) {
  const promptsJson = JSON.stringify(prompts);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .header h3 { margin: 0; color: #333; }
    .prompt-list { max-height: 350px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
    .prompt-item {
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .prompt-item:last-child { border-bottom: none; }
    .prompt-item:hover { background: #f9f9f9; }
    .prompt-info { flex: 1; }
    .prompt-name { font-weight: bold; color: #333; }
    .prompt-desc { font-size: 12px; color: #666; margin-top: 2px; }
    .prompt-category { font-size: 11px; color: #fff; background: #9c27b0; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .prompt-actions { display: flex; gap: 8px; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-secondary { background: #f1f3f4; color: #333; }
    .btn-add { background: #e8f5e9; color: #2e7d32; }
    .btn-edit { background: #e3f2fd; color: #1565c0; padding: 6px 12px; }
    .btn-delete { background: #ffebee; color: #c62828; padding: 6px 12px; }
    .btn-small { padding: 6px 12px; font-size: 12px; }
    .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
    .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .status.error { display: block; background: #ffebee; color: #c62828; }
    .empty-message { padding: 40px; text-align: center; color: #999; }

    /* モーダル */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }
    .modal-overlay.show { display: flex; }
    .modal {
      background: white;
      border-radius: 8px;
      padding: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 90%;
      overflow-y: auto;
    }
    .modal h4 { margin: 0 0 15px 0; color: #333; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-weight: bold; margin-bottom: 5px; color: #333; font-size: 13px; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .form-group textarea { min-height: 100px; resize: vertical; font-family: monospace; }
    .form-group .hint { font-size: 11px; color: #888; margin-top: 3px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h3>プロンプト一覧</h3>
    <button class="btn btn-add" onclick="openAddModal()">＋ 新規追加</button>
  </div>

  <div class="prompt-list" id="promptList"></div>

  <div style="margin-top: 20px; display: flex; justify-content: space-between;">
    <div class="status" id="status"></div>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <!-- 編集モーダル -->
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal">
      <h4 id="modalTitle">プロンプト編集</h4>
      <input type="hidden" id="editIndex" value="-1">

      <div class="form-group">
        <label>プロンプト名 *</label>
        <input type="text" id="inputName" placeholder="例：構成案作成">
        <div class="hint">メニューに表示される名前</div>
      </div>

      <div class="form-group">
        <label>説明</label>
        <input type="text" id="inputDescription" placeholder="例：ヒアリング内容から構成案を作成">
        <div class="hint">ダイアログのサブタイトル</div>
      </div>

      <div class="form-group">
        <label>カテゴリ</label>
        <input type="text" id="inputCategory" list="categoryList" placeholder="例：議事録、構成案">
        <datalist id="categoryList">
          <option value="議事録">
          <option value="構成案">
          <option value="連絡">
        </datalist>
        <div class="hint">メニューでのフィルタリングに使用（同じカテゴリのプロンプトが同じメニューに表示）</div>
      </div>

      <div class="form-group">
        <label>入力欄のラベル</label>
        <input type="text" id="inputLabel" placeholder="例：ヒアリング内容">
      </div>

      <div class="form-group">
        <label>入力欄のプレースホルダー</label>
        <input type="text" id="inputPlaceholder" placeholder="例：ここにヒアリング内容を貼り付け...">
      </div>

      <div class="form-group">
        <label>テンプレート *</label>
        <textarea id="inputTemplate" placeholder="{{input}} が入力値に置換されます"></textarea>
        <div class="hint">{{input}} が入力値に置換されます</div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">キャンセル</button>
        <button class="btn btn-primary" onclick="savePrompt()">保存</button>
      </div>
    </div>
  </div>

  <script>
    let prompts = ${promptsJson};

    function renderList() {
      const container = document.getElementById('promptList');

      if (prompts.length === 0) {
        container.innerHTML = '<div class="empty-message">プロンプトがありません</div>';
        return;
      }

      container.innerHTML = prompts.map((p, i) => \`
        <div class="prompt-item">
          <div class="prompt-info">
            <div class="prompt-name">
              \${escapeHtml(p.name)}
              \${p.category ? '<span class="prompt-category">' + escapeHtml(p.category) + '</span>' : ''}
            </div>
            <div class="prompt-desc">\${escapeHtml(p.description) || '（説明なし）'}</div>
          </div>
          <div class="prompt-actions">
            <button class="btn btn-edit btn-small" onclick="openEditModal(\${i})">編集</button>
            <button class="btn btn-delete btn-small" onclick="deletePrompt(\${i})">削除</button>
          </div>
        </div>
      \`).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function openAddModal() {
      document.getElementById('modalTitle').textContent = '新規プロンプト追加';
      document.getElementById('editIndex').value = '-1';
      document.getElementById('inputName').value = '';
      document.getElementById('inputDescription').value = '';
      document.getElementById('inputCategory').value = '';
      document.getElementById('inputLabel').value = '';
      document.getElementById('inputPlaceholder').value = '';
      document.getElementById('inputTemplate').value = '';
      document.getElementById('modalOverlay').classList.add('show');
    }

    function openEditModal(index) {
      const p = prompts[index];
      document.getElementById('modalTitle').textContent = 'プロンプト編集';
      document.getElementById('editIndex').value = index;
      document.getElementById('inputName').value = p.name;
      document.getElementById('inputDescription').value = p.description;
      document.getElementById('inputCategory').value = p.category || '';
      document.getElementById('inputLabel').value = p.label;
      document.getElementById('inputPlaceholder').value = p.placeholder;
      document.getElementById('inputTemplate').value = p.template;
      document.getElementById('modalOverlay').classList.add('show');
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('show');
    }

    function savePrompt() {
      const index = parseInt(document.getElementById('editIndex').value);
      const name = document.getElementById('inputName').value.trim();
      const template = document.getElementById('inputTemplate').value.trim();

      if (!name) {
        alert('プロンプト名を入力してください');
        return;
      }
      if (!template) {
        alert('テンプレートを入力してください');
        return;
      }

      const prompt = {
        name: name,
        description: document.getElementById('inputDescription').value.trim(),
        category: document.getElementById('inputCategory').value.trim(),
        label: document.getElementById('inputLabel').value.trim(),
        placeholder: document.getElementById('inputPlaceholder').value.trim(),
        template: template
      };

      if (index === -1) {
        prompts.push(prompt);
      } else {
        prompts[index] = prompt;
      }

      closeModal();
      renderList();
      saveToSheet();
    }

    function deletePrompt(index) {
      const name = prompts[index].name;
      if (confirm('「' + name + '」を削除しますか？')) {
        prompts.splice(index, 1);
        renderList();
        saveToSheet();
      }
    }

    function saveToSheet() {
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました', 'success');
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .savePrompts(prompts);
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
      setTimeout(() => { status.className = 'status'; }, 3000);
    }

    // モーダル外クリックで閉じる
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    renderList();
  </script>
</body>
</html>
`;
}

// ================================================================================
// ===== Part③ 処理データ マッピング・保存・読み込み =====
// ================================================================================

/**
 * Part③のデータ行を動的に検索
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 対象シート
 * @param {string} label - 検索するラベル（B列の値）
 * @returns {number|null} 行番号（見つからない場合はnull）
 */
function findPart3Row(sheet, label) {
  // B列を取得（最大200行まで検索）
  const data = sheet.getRange('B1:B200').getValues();

  for (let i = 0; i < data.length; i++) {
    const cellValue = String(data[i][0] || '').trim();
    if (cellValue === label) {
      return i + 1; // 行番号は1始まり
    }
  }

  return null;
}

/**
 * Part③のデータをシートに保存（動的行検索版）
 * @param {string} sheetName - 企業シート名
 * @param {string} key - ラベル名（例: '議事録', '文字起こし原文'）
 * @param {string} value - 保存する値
 * @param {boolean} confirmOverwrite - 上書き確認を行うか（デフォルト: true）
 * @returns {Object} { success, overwritten, error }
 */
function savePart3Data(sheetName, key, value, confirmOverwrite) {
  if (confirmOverwrite === undefined) confirmOverwrite = true;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シート「' + sheetName + '」が見つかりません' };
  }

  // 動的に行番号を検索
  const row = findPart3Row(sheet, key);
  if (!row) {
    return { success: false, error: 'ラベル「' + key + '」がシート内に見つかりません。テンプレート初期設定を実行してください。' };
  }

  const col = 3; // C列（値のセル）

  try {
    // 保存前に行の高さを取得
    const originalRowHeight = sheet.getRowHeight(row);

    const existingValue = sheet.getRange(row, col).getValue();
    const existingStr = String(existingValue || '').trim();
    const newStr = String(value || '').trim();

    // 既存データがあり、上書き確認が必要な場合
    if (confirmOverwrite && existingStr && existingStr !== newStr) {
      return {
        success: false,
        needConfirm: true,
        existingValue: existingStr.substring(0, 100) + (existingStr.length > 100 ? '...' : '')
      };
    }

    // 保存実行
    sheet.getRange(row, col).setValue(value);

    // 行の高さを元に戻す
    sheet.setRowHeight(row, originalRowHeight);

    return {
      success: true,
      overwritten: !!existingStr
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Part③のデータを強制的に上書き保存（確認後に呼び出す）
 */
function savePart3DataForce(sheetName, key, value) {
  return savePart3Data(sheetName, key, value, false);
}

/**
 * Part③のデータをシートから読み込み（動的行検索版）
 * @param {string} sheetName - 企業シート名
 * @param {string} key - ラベル名（例: '議事録', '文字起こし原文'）
 * @returns {Object} { success, value, error }
 */
function loadPart3Data(sheetName, key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シート「' + sheetName + '」が見つかりません', value: '' };
  }

  // 動的に行番号を検索
  const row = findPart3Row(sheet, key);
  if (!row) {
    return { success: false, error: 'ラベル「' + key + '」がシート内に見つかりません', value: '' };
  }

  const col = 3; // C列（値のセル）

  try {
    const value = sheet.getRange(row, col).getValue();
    return {
      success: true,
      value: String(value || '')
    };
  } catch (error) {
    return { success: false, error: error.message, value: '' };
  }
}

/**
 * Part③の全データをシートから読み込み（設定シート参照版）
 * @param {string} sheetName - 企業シート名
 * @returns {Object} { success, data: { key: value, ... }, error }
 */
function loadAllPart3Data(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シート「' + sheetName + '」が見つかりません', data: {} };
  }

  // 設定シートからPart③構成を取得
  const part3Config = getPart3ConfigFromSettings();
  if (part3Config.length === 0) {
    return { success: false, error: '設定シートにPart③構成がありません', data: {} };
  }

  try {
    const data = {};
    for (const item of part3Config) {
      const row = findPart3Row(sheet, item.label);
      if (row) {
        const value = sheet.getRange(row, 3).getValue();
        data[item.label] = String(value || '');
      } else {
        data[item.label] = '';
      }
    }
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message, data: {} };
  }
}


/**
 * プロンプト一覧を保存
 */
function savePrompts(prompts) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(PROMPT_SHEET_NAME);

    // シートがなければ作成（カテゴリ列追加）
    if (!sheet) {
      sheet = ss.insertSheet(PROMPT_SHEET_NAME);
      // ヘッダー追加（F列カテゴリ追加）
      sheet.getRange('A1:F1').setValues([['プロンプト名', '説明', '入力欄ラベル', 'プレースホルダー', 'テンプレート', 'カテゴリ']]);
      sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 200);
      sheet.setColumnWidth(3, 120);
      sheet.setColumnWidth(4, 150);
      sheet.setColumnWidth(5, 400);
      sheet.setColumnWidth(6, 100);
    }

    // 既存データをクリア（ヘッダー以外、6列に拡張）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
    }

    // 新しいデータを書き込み（カテゴリ列追加）
    if (prompts.length > 0) {
      const data = prompts.map(p => [p.name, p.description, p.label, p.placeholder, p.template, p.category || '']);
      sheet.getRange(2, 1, data.length, 6).setValues(data);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ================================================================================
// ===== プロンプトシート作成 =====
// ================================================================================

/**
 * プロンプトシートを作成・初期化
 */
function initializePromptSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PROMPT_SHEET_NAME);

  // 既存シートがある場合は確認
  if (sheet) {
    const response = ui.alert(
      '確認',
      '「プロンプト」シートは既に存在します。\n\n初期化すると現在のプロンプトが上書きされます。\n続行しますか？',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) {
      return;
    }
    sheet.clear();
  } else {
    sheet = ss.insertSheet(PROMPT_SHEET_NAME);
  }

  // ヘッダー設定（F列にカテゴリを追加）
  const headers = ['プロンプト名', '説明', '入力欄ラベル', 'プレースホルダー', 'テンプレート', 'カテゴリ'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('#fff');

  // デフォルトプロンプトを追加（カテゴリ付き）
  const defaultPrompts = [
    ['構成案作成', 'ヒアリング内容から構成案を作成', 'ヒアリング内容', 'ここにヒアリング内容を貼り付け...', '以下のヒアリング内容から、採用動画の構成案を作成してください。\n\n{{input}}', '構成案'],
    ['原稿生成', '構成案から原稿を生成', '構成案', 'ここに構成案を貼り付け...', '以下の構成案から、採用動画の原稿を作成してください。\n\n{{input}}', '構成案'],
  ];
  sheet.getRange(2, 1, defaultPrompts.length, 6).setValues(defaultPrompts);

  // 列幅調整
  sheet.setColumnWidth(1, 150);  // プロンプト名
  sheet.setColumnWidth(2, 200);  // 説明
  sheet.setColumnWidth(3, 120);  // 入力欄ラベル
  sheet.setColumnWidth(4, 180);  // プレースホルダー
  sheet.setColumnWidth(5, 400);  // テンプレート
  sheet.setColumnWidth(6, 100);  // カテゴリ

  // 行の高さを自動調整
  sheet.setRowHeights(2, defaultPrompts.length, 60);

  ui.alert('完了',
    'プロンプトシートを作成しました。\n\n' +
    '・A列: プロンプト名\n' +
    '・B列: 説明\n' +
    '・C列: 入力欄ラベル\n' +
    '・D列: プレースホルダー\n' +
    '・E列: テンプレート（{{input}}が入力値に置換）\n' +
    '・F列: カテゴリ（メニューのフィルタ用）\n\n' +
    'メニュー「プロンプト編集」からダイアログで編集できます。',
    ui.ButtonSet.OK
  );
}


// ================================================================================
// ===== 企業情報一覧シート作成 =====
// ================================================================================

const COMPANY_LIST_SHEET_NAME = '企業情報一覧';

/**
 * 企業情報一覧シートを作成（設定シートの企業情報項目から）
 */
function initializeCompanyListSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  // 既存シートがある場合は確認
  if (sheet) {
    const response = ui.alert(
      '確認',
      '「企業情報一覧」シートは既に存在します。\n\n初期化すると現在のデータが上書きされます。\n続行しますか？',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) {
      return;
    }
    sheet.clear();
  } else {
    sheet = ss.insertSheet(COMPANY_LIST_SHEET_NAME);
  }

  // 設定シートから企業情報項目を取得（■セクション区切り含む）
  const allHeaders = getCompanyInfoHeadersFromSettings();

  // ヘッダー設定（セクション区切りも含めて設定）
  sheet.getRange(1, 1, 1, allHeaders.length).setValues([allHeaders]);

  // 全体のスタイル
  sheet.getRange(1, 1, 1, allHeaders.length)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // セクション区切り（■）とデータ項目で色分け
  for (let i = 0; i < allHeaders.length; i++) {
    const cell = sheet.getRange(1, i + 1);
    if (allHeaders[i].startsWith('■')) {
      // セクション区切り: 紫系
      cell.setBackground('#9c27b0').setFontColor('#fff');
    } else {
      // データ項目: 緑系
      cell.setBackground('#34a853').setFontColor('#fff');
    }
  }

  // 列幅調整（動的）
  for (let i = 0; i < allHeaders.length; i++) {
    const header = allHeaders[i];
    if (header.startsWith('■')) {
      sheet.setColumnWidth(i + 1, 100);  // セクション区切り
    } else if (header === '企業名') {
      sheet.setColumnWidth(i + 1, 150);
    } else if (header.includes('メール')) {
      sheet.setColumnWidth(i + 1, 180);
    } else if (header === '備考') {
      sheet.setColumnWidth(i + 1, 150);
    } else {
      sheet.setColumnWidth(i + 1, 100);  // デフォルト
    }
  }

  // ■列のデータエリアをグレーアウト（入力不要を明示）
  for (let i = 0; i < allHeaders.length; i++) {
    if (allHeaders[i].startsWith('■')) {
      sheet.getRange(2, i + 1, 100, 1).setBackground('#d0d0d0');
    }
  }

  // 1行目を固定
  sheet.setFrozenRows(1);

  // データ項目のみ抽出（メッセージ用）
  const dataHeaders = allHeaders.filter(h => !h.startsWith('■'));

  ui.alert('完了',
    '企業情報一覧シートを作成しました。\n\n' +
    '項目: ' + dataHeaders.join('、') + '\n\n' +
    '※ 設定シートのK列で項目を変更できます。',
    ui.ButtonSet.OK
  );
}
