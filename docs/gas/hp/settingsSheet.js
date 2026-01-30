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
 * 【プロンプトシート構造】（promptDialog.jsと統一）
 * A列: プロンプト名
 * B列: 説明
 * C列: 入力欄ラベル
 * D列: 入力欄プレースホルダー
 * E列: テンプレート（{{input}}が入力値に置換される）
 * F列: カテゴリ
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

// デフォルトプロンプト（HP制作用）- promptDialog.jsと同じ構造
// [プロンプト名, 説明, 入力欄ラベル, プレースホルダー, テンプレート, カテゴリ]
const HP_DEFAULT_PROMPTS = [
  {
    name: '議事録作成',
    description: 'NOTTAの文字起こしからHP制作の議事録を作成',
    inputLabel: 'ここに文字起こしテキストを貼り付け',
    placeholder: 'NOTTAでダウンロードした文字起こしテキストをここに貼り付け...',
    template: `以下の打ち合わせ文字起こしから議事録を作成してください。

【出力フォーマット】
■ 打ち合わせ概要
日時：
参加者：
企業名：

■ HPの目的・ゴール
・メインのコンバージョン：
・ターゲット層：
・HPで達成したいこと：

■ ヒアリング内容の要点
【企業情報・強み】
・

【デザインの方向性】
・参考サイト：
・NGイメージ：
・表現したいキーワード：

【コンテンツ】
・必要なページ：
・既存素材の有無：

【サーバー・ドメイン】
・現在の状況：
・デプロイパターン：

■ 決定事項
・撮影の有無：
・希望公開時期：
・その他：

■ 次のアクション
・

【注意事項】
・要点を箇条書きで簡潔にまとめる
・企業の発言はそのままのニュアンスを残す
・不明点は「要確認」と記載

━━━━━━━━━━━━━━━━━━━━
【文字起こし】
━━━━━━━━━━━━━━━━━━━━
{{input}}`,
    category: '議事録'
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
 * プロンプトシートを作成・初期化（promptDialog.jsと同じ構造）
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

  // ヘッダー行（promptDialog.jsと同じ構造）
  const headers = ['プロンプト名', '説明', '入力欄ラベル', '入力欄プレースホルダー', 'テンプレート', 'カテゴリ'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold')
    .setBackground('#1565C0')
    .setFontColor('#fff');

  // デフォルトプロンプトを追加
  const promptData = HP_DEFAULT_PROMPTS.map(p => [
    p.name,
    p.description,
    p.inputLabel,
    p.placeholder,
    p.template,
    p.category
  ]);

  // compositionPrompt.jsのテンプレートも追加
  // ※ HP_COMPOSITION_PROMPT_TEMPLATE, HP_CLAUDE_CODE_PROMPT_TEMPLATE はcompositionPrompt.jsで定義
  try {
    if (typeof HP_COMPOSITION_PROMPT_TEMPLATE !== 'undefined') {
      promptData.push([
        '構成案プロンプト',
        '3人の専門家による完全な構成案を生成',
        'ヒアリング情報（自動挿入）',
        '※このプロンプトは構成案作成メニューから自動で使用されます',
        HP_COMPOSITION_PROMPT_TEMPLATE,
        '構成案'
      ]);
    }
    if (typeof HP_CLAUDE_CODE_PROMPT_TEMPLATE !== 'undefined') {
      promptData.push([
        'Claude Code指示文',
        '構成案からClaude Code用のHP作成指示文を生成',
        '構成案（自動挿入）',
        '※このプロンプトは構成案作成メニューから自動で使用されます',
        HP_CLAUDE_CODE_PROMPT_TEMPLATE,
        '構成案'
      ]);
    }
  } catch (e) {
    // compositionPrompt.jsが読み込まれていない場合はスキップ
  }

  if (promptData.length > 0) {
    sheet.getRange(2, 1, promptData.length, headers.length).setValues(promptData);
  }

  // 列幅調整
  sheet.setColumnWidth(1, 120);  // A: プロンプト名
  sheet.setColumnWidth(2, 200);  // B: 説明
  sheet.setColumnWidth(3, 180);  // C: 入力欄ラベル
  sheet.setColumnWidth(4, 250);  // D: プレースホルダー
  sheet.setColumnWidth(5, 500);  // E: テンプレート
  sheet.setColumnWidth(6, 100);  // F: カテゴリ

  // 行の高さを調整（テンプレートが見やすいように）
  for (let i = 2; i <= promptData.length + 1; i++) {
    const promptName = sheet.getRange(i, 1).getValue();
    // 構成案プロンプトは長いので高さを大きく
    if (promptName === '構成案プロンプト' || promptName === 'Claude Code指示文') {
      sheet.setRowHeight(i, 300);
    } else {
      sheet.setRowHeight(i, 150);
    }
  }

  // テキストの折り返し（テンプレート列）
  sheet.getRange(2, 5, promptData.length, 1).setWrap(true);

  const compositionCount = (typeof HP_COMPOSITION_PROMPT_TEMPLATE !== 'undefined' ? 1 : 0) +
                          (typeof HP_CLAUDE_CODE_PROMPT_TEMPLATE !== 'undefined' ? 1 : 0);
  const message = compositionCount > 0
    ? '✅ プロンプトシートを作成しました\n\n' +
      '登録されたプロンプト:\n' +
      '・議事録作成\n' +
      (compositionCount > 0 ? '・構成案プロンプト（3人の専門家版）\n・Claude Code指示文\n' : '') +
      '\n※メニューを更新するには、シートを再読み込みしてください。'
    : '✅ プロンプトシートを作成しました\n\n※メニューを更新するには、シートを再読み込みしてください。';

  ui.alert(message);
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
 * 全プロンプトを取得（6列構造）
 * @returns {Object[]} プロンプト配列 [{name, description, inputLabel, placeholder, template, category}, ...]
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

  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const prompts = data
    .filter(row => row[0] && row[4]) // プロンプト名とテンプレートがある行のみ
    .map(row => ({
      name: row[0],
      description: row[1] || '',
      inputLabel: row[2] || 'ここに入力',
      placeholder: row[3] || '',
      template: row[4] || '',
      category: row[5] || ''
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
