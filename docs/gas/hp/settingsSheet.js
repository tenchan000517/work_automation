/**
 * HP制作 設定シート管理 GAS（シンプル版）
 *
 * 【設計思想】
 * - ツナゲルほど複雑にしない
 * - ダイアログは最小限（シート直接編集を基本）
 * - 必要な関数のみ提供
 *
 * 【設定シート構造】
 * A列: メンバー名
 * B列: 備考
 * D列: フォルダ設定キー
 * E列: フォルダ設定値
 *
 * 【プロンプトシート構造】
 * A列: プロンプト名
 * B列: カテゴリ
 * C列: プロンプト本文
 * D列: 保存キー（Part④のどのラベルに保存するか）
 * E列: 入力キー（Part④のどのラベルから入力を取得するか）
 */

// ================================================================================
// ===== 定数 =====
// ================================================================================

const HP_SETTINGS_SHEET_NAME = '設定';
const HP_PROMPT_SHEET_NAME = 'プロンプト';

// デフォルトメンバー一覧（HP制作用）
const HP_DEFAULT_MEMBERS = [
  { name: '渡邉', note: '受注・立ち上げ' },
  { name: '河合', note: 'メイン担当' },
  { name: '川崎', note: '素材撮影' },
  { name: '青柳', note: 'CC' },
  { name: '先方', note: 'お客様' },
];

// デフォルトフォルダ設定（HP制作用）
const HP_DEFAULT_FOLDER_SETTINGS = [
  { key: 'HP・LPフォルダ', value: '1Zi2zn57JA3wZQvrEUwGN26jZkRDodWe-' },
  { key: 'ヒアリングシートフォルダ', value: '1ug4NtkTNB1Lvnw1GN9wtd07u8nXeBYTk' },
];

// デフォルトプロンプト（HP制作用）
const HP_DEFAULT_PROMPTS = [
  {
    name: '議事録作成',
    category: '文字起こし',
    prompt: `以下の文字起こしを整理して、議事録形式にまとめてください。

【整理のポイント】
- 話者を明確に
- 決定事項を明確に
- TODO項目を抽出
- 次回までの宿題を整理

【文字起こし】
{input}`,
    saveKey: '文字起こし原文',
    inputKey: ''
  },
  {
    name: '構成案作成',
    category: '構成',
    prompt: `以下のヒアリング情報を元に、HPの構成案を作成してください。

【ヒアリング情報】
{input}

【出力形式】
- トップページ構成
- 各ページの構成
- コンテンツ案`,
    saveKey: '構成案',
    inputKey: '文字起こし原文'
  },
];

// ================================================================================
// ===== メニュー =====
// ================================================================================

/**
 * 設定メニューを追加（hearingSheetManager.jsから呼び出し）
 */
function hp_addSettingsMenu(ui) {
  ui.createMenu('⚙️ 設定')
    .addItem('📋 設定シートを作成', 'hp_initializeSettingsSheet')
    .addItem('📝 プロンプトシートを作成', 'hp_initializePromptSheet')
    .addSeparator()
    .addItem('📄 設定を表示', 'hp_showSettings')
    .addToUi();
}

// ================================================================================
// ===== 設定シート初期化 =====
// ================================================================================

/**
 * 設定シートを作成・初期化
 */
function hp_initializeSettingsSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HP_SETTINGS_SHEET_NAME);

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
    sheet = ss.insertSheet(HP_SETTINGS_SHEET_NAME);
  }

  // ===== メンバー一覧セクション（A列〜B列） =====
  sheet.getRange('A1').setValue('【メンバー一覧】').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  sheet.getRange('B1').setValue('備考').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');

  const memberData = HP_DEFAULT_MEMBERS.map(m => [m.name, m.note]);
  sheet.getRange(2, 1, memberData.length, 2).setValues(memberData);

  // ===== フォルダ設定セクション（D列〜E列） =====
  sheet.getRange('D1').setValue('【フォルダ設定】').setFontWeight('bold').setBackground('#ff9800').setFontColor('#fff');
  sheet.getRange('E1').setValue('フォルダID').setFontWeight('bold').setBackground('#ff9800').setFontColor('#fff');

  const folderData = HP_DEFAULT_FOLDER_SETTINGS.map(f => [f.key, f.value]);
  sheet.getRange(2, 4, folderData.length, 2).setValues(folderData);

  // 列幅調整
  sheet.setColumnWidth(1, 100);  // A: メンバー名
  sheet.setColumnWidth(2, 150);  // B: 備考
  sheet.setColumnWidth(3, 30);   // C: 空白
  sheet.setColumnWidth(4, 180);  // D: フォルダ設定キー
  sheet.setColumnWidth(5, 350);  // E: フォルダID

  // 説明を追加
  const lastRow = Math.max(memberData.length, folderData.length) + 3;
  sheet.getRange(lastRow, 1, 1, 5).merge()
    .setValue('※ メンバーやフォルダIDを変更する場合は、このシートを直接編集してください')
    .setFontColor('#666666')
    .setFontSize(11);

  ui.alert('✅ 設定シートを作成しました');
}

// ================================================================================
// ===== プロンプトシート初期化 =====
// ================================================================================

/**
 * プロンプトシートを作成・初期化
 */
function hp_initializePromptSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HP_PROMPT_SHEET_NAME);

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
    sheet = ss.insertSheet(HP_PROMPT_SHEET_NAME);
  }

  // ヘッダー行
  const headers = ['プロンプト名', 'カテゴリ', 'プロンプト本文', '保存キー', '入力キー'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('#fff');

  // デフォルトプロンプトを追加
  const promptData = HP_DEFAULT_PROMPTS.map(p => [p.name, p.category, p.prompt, p.saveKey, p.inputKey]);
  if (promptData.length > 0) {
    sheet.getRange(2, 1, promptData.length, headers.length).setValues(promptData);
  }

  // 列幅調整
  sheet.setColumnWidth(1, 150);  // A: プロンプト名
  sheet.setColumnWidth(2, 100);  // B: カテゴリ
  sheet.setColumnWidth(3, 500);  // C: プロンプト本文
  sheet.setColumnWidth(4, 150);  // D: 保存キー
  sheet.setColumnWidth(5, 150);  // E: 入力キー

  // 行の高さを調整（プロンプト本文が見やすいように）
  for (let i = 2; i <= promptData.length + 1; i++) {
    sheet.setRowHeight(i, 100);
  }

  // テキストの折り返し
  sheet.getRange(2, 3, promptData.length, 1).setWrap(true);

  ui.alert('✅ プロンプトシートを作成しました');
}

// ================================================================================
// ===== 設定取得関数（他GASから呼び出し） =====
// ================================================================================

/**
 * メンバー一覧を取得
 * @returns {string[]} メンバー名の配列
 */
function hp_getMembers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HP_SETTINGS_SHEET_NAME);

  if (!sheet) {
    // 設定シートがない場合はデフォルト値を返す
    return HP_DEFAULT_MEMBERS.map(m => m.name);
  }

  const members = [];
  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const value = sheet.getRange(row, 1).getValue();
    if (value && typeof value === 'string' && value.trim()) {
      members.push(value.trim());
    } else {
      break; // 空行で終了
    }
  }

  return members.length > 0 ? members : HP_DEFAULT_MEMBERS.map(m => m.name);
}

/**
 * フォルダ設定を取得
 * @param {string} key - フォルダ設定キー（例: 'HP・LPフォルダ'）
 * @returns {string} フォルダID
 */
function hp_getFolderSetting(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HP_SETTINGS_SHEET_NAME);

  if (!sheet) {
    // 設定シートがない場合はデフォルト値を返す
    const defaultSetting = HP_DEFAULT_FOLDER_SETTINGS.find(f => f.key === key);
    return defaultSetting ? defaultSetting.value : '';
  }

  const lastRow = sheet.getLastRow();
  for (let row = 2; row <= lastRow; row++) {
    const rowKey = sheet.getRange(row, 4).getValue();
    if (rowKey === key) {
      return sheet.getRange(row, 5).getValue() || '';
    }
  }

  // 見つからない場合はデフォルト値
  const defaultSetting = HP_DEFAULT_FOLDER_SETTINGS.find(f => f.key === key);
  return defaultSetting ? defaultSetting.value : '';
}

/**
 * 親フォルダIDを取得（HP・LPフォルダ）
 * @returns {string} フォルダID
 */
function hp_getParentFolderIdFromSettings() {
  return hp_getFolderSetting('HP・LPフォルダ');
}

/**
 * ヒアリングシートフォルダIDを取得
 * @returns {string} フォルダID
 */
function hp_getHearingSheetFolderId() {
  return hp_getFolderSetting('ヒアリングシートフォルダ');
}

// ================================================================================
// ===== プロンプト取得関数 =====
// ================================================================================

/**
 * 全プロンプトを取得
 * @returns {Object[]} プロンプト配列 [{name, category, prompt, saveKey, inputKey}, ...]
 */
function hp_getAllPrompts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HP_PROMPT_SHEET_NAME);

  if (!sheet) {
    return HP_DEFAULT_PROMPTS;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return HP_DEFAULT_PROMPTS;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const prompts = data
    .filter(row => row[0]) // プロンプト名がある行のみ
    .map(row => ({
      name: row[0],
      category: row[1] || '',
      prompt: row[2] || '',
      saveKey: row[3] || '',
      inputKey: row[4] || ''
    }));

  return prompts.length > 0 ? prompts : HP_DEFAULT_PROMPTS;
}

/**
 * プロンプトを名前で取得
 * @param {string} name - プロンプト名
 * @returns {Object|null} プロンプトオブジェクト
 */
function hp_getPromptByName(name) {
  const prompts = hp_getAllPrompts();
  return prompts.find(p => p.name === name) || null;
}

/**
 * カテゴリ別にプロンプトを取得
 * @param {string} category - カテゴリ名
 * @returns {Object[]} プロンプト配列
 */
function hp_getPromptsByCategory(category) {
  const prompts = hp_getAllPrompts();
  return prompts.filter(p => p.category === category);
}

// ================================================================================
// ===== ユーティリティ =====
// ================================================================================

/**
 * 設定を表示（デバッグ用）
 */
function hp_showSettings() {
  const ui = SpreadsheetApp.getUi();

  const members = hp_getMembers();
  const parentFolderId = hp_getParentFolderIdFromSettings();
  const hearingSheetFolderId = hp_getHearingSheetFolderId();
  const prompts = hp_getAllPrompts();

  const message = `【メンバー一覧】
${members.join(', ')}

【フォルダ設定】
HP・LPフォルダ: ${parentFolderId || '未設定'}
ヒアリングシートフォルダ: ${hearingSheetFolderId || '未設定'}

【プロンプト】
${prompts.map(p => p.name).join(', ')}`;

  ui.alert('現在の設定', message, ui.ButtonSet.OK);
}
