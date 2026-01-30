/**
 * HP制作 ヒアリングシート管理 メインGAS
 *
 * 【機能】
 * 1. ヒアリングシート作成（フォーム回答から/手動）
 * 2. 企業フォルダ作成
 * 3. フォーム転記（既存シートへ）
 *
 * 【設計思想】
 * - ツナゲルほど複雑にしない（不変・シンプル）
 * - commonStyles.jsを使用してUI統一
 *
 * 【ヒアリングシート構造】
 * 1行目: 企業名（タイトル）
 * 2行目: ステータスヘッダー（B〜G列）
 * 3行目: ステータス入力欄
 * H列: 公開URL
 * I〜N列: 更新ログ
 * 4行目〜: Part①〜④
 */

// ===== 定数 =====
const HP_COLORS = {
  HEADER: '#1565C0',        // 青
  HEADER_TEXT: '#FFFFFF',
  PART_HEADER: '#4A90D9',   // 薄青
  SUB_HEADER: '#E8EAF6',    // 薄紫
  LABEL: '#F5F5F5',         // グレー
  FORM_INPUT: '#FFFDE7',    // 黄色（フォーム転記セル）
  HEARING_INPUT: '#E3F2FD', // 水色（ヒアリング記入セル）
  DATA_LABEL: '#9e9e9e',    // グレー（Part④）
  DATA_VALUE: '#e0e0e0',    // ライトグレー（Part④）
  BORDER: '#BDBDBD'
};

const HP_SHEET_NAME = 'ヒアリングシート';
const HP_FORM_RESPONSE_SHEET_NAME = '事前ヒアリング回答';

// ステータス関連定数
const HP_STATUS_STATES = ['対応中', '先方確認', '次の担当へ'];
const HP_STATUS_OVERALL = ['制作中', '運用中', '完了'];
const HP_TASK_HOLDERS = ['渡邉', '河合', '川崎', '青柳', '先方'];

// タスク一覧（HP制作用11タスク）
const HP_TASKS = [
  { no: 0, name: '受注・立ち上げ' },
  { no: 1, name: '打ち合わせ前準備' },
  { no: 2, name: '初回打ち合わせ' },
  { no: 3, name: '文字起こし・転記' },
  { no: 4, name: 'JSON出力・原稿生成' },
  { no: 5, name: 'HP作成' },
  { no: 6, name: '素材撮影' },
  { no: 7, name: '修正・根拠作成' },
  { no: 8, name: 'MVP確認・修正' },
  { no: 9, name: '納品' },
  { no: 10, name: '月次FB' }
];

// 除外シート名（システムシート）
const HP_EXCLUDED_SHEETS = [
  'ヒアリングシート',
  '事前ヒアリング回答',
  'フォームの回答 1',
  'フォームの回答1',
  '設定',
  'プロンプト',
  '進捗一覧',
  '企業情報一覧'
];

// ===== フォーム回答 → ヒアリングシート マッピング =====
// フォーム列番号（0始まり、タイムスタンプ=0） → ヒアリングシート（行, 列）
// ※ページ構成に基づいて設計（formCreator.js参照）
const HP_FORM_TO_SHEET_MAPPING = {
  // ページ1: 担当者情報 + 企業情報（row 5から開始）
  1:  { row: 5, col: 2 },   // 企業名 → Part① 基本情報
  2:  { row: 6, col: 2 },   // 担当者名
  3:  { row: 7, col: 2 },   // 役職
  4:  { row: 8, col: 2 },   // 電話番号（担当者様）
  5:  { row: 9, col: 2 },   // メールアドレス（担当者様）
  6:  { row: 10, col: 2 },  // 会社正式名称
  7:  { row: 11, col: 2 },  // 郵便番号
  8:  { row: 12, col: 2 },  // 住所
  9:  { row: 13, col: 2 },  // 代表電話番号
  10: { row: 14, col: 2 },  // お問い合わせメールアドレス
  11: { row: 15, col: 2 },  // 代表者名
  12: { row: 16, col: 2 },  // 設立年
  13: { row: 17, col: 2 },  // 資本金
  14: { row: 18, col: 2 },  // 従業員数
  15: { row: 19, col: 2 },  // 事業内容
  16: { row: 20, col: 2 },  // 営業時間・定休日

  // ページ2: HPについてのご要望（row 23から開始）
  17: { row: 23, col: 2 },  // HPの主な目的
  18: { row: 23, col: 2, append: true },  // HPの目的「その他」の詳細 → 同じセルに追記
  19: { row: 24, col: 2 },  // メインターゲット
  20: { row: 24, col: 2, append: true },  // メインターゲット「その他」の詳細
  21: { row: 25, col: 2 },  // 競合・意識している会社
  22: { row: 26, col: 2 },  // 自社の強み・アピールポイント
  23: { row: 26, col: 2, append: true },  // 自社の強み詳細
  24: { row: 27, col: 2 },  // 参考にしたいHP
  25: { row: 28, col: 2 },  // 現在のHP URL
  26: { row: 29, col: 2 },  // 現在のHPで気になっている点
  27: { row: 29, col: 2, append: true },  // 気になっている点「その他」の詳細
  28: { row: 30, col: 2 },  // HP新規作成・リニューアルに期待すること
  29: { row: 31, col: 2 },  // 必要なページ
  30: { row: 31, col: 2, append: true },  // 必要なページ「その他」の詳細
  31: { row: 32, col: 2 },  // 既存素材の有無
  32: { row: 33, col: 2 },  // SNSアカウント
  33: { row: 34, col: 2 },  // 希望公開時期

  // ページ3: 会社の詳細情報（row 37から開始）
  34: { row: 37, col: 2 },  // 会社のビジョン・ミッション
  35: { row: 38, col: 2 },  // 代表メッセージ
  36: { row: 39, col: 2 },  // 売上高
  37: { row: 40, col: 2 },  // 会社の雰囲気・文化
  38: { row: 41, col: 2 },  // オフィス・店舗情報
  39: { row: 42, col: 2 },  // 設備・施設

  // ページ4: サービス・商品について（row 45から開始）
  40: { row: 45, col: 2 },  // 主なサービス・商品
  41: { row: 46, col: 2 },  // サービス・商品の強み・特徴
  42: { row: 47, col: 2 },  // 実績・導入事例
  43: { row: 48, col: 2 },  // 参考資料の有無

  // ページ5: 採用関連情報（Part①内に配置するか検討）
  // ※採用関連は多数あるため、必要に応じて追加

  // Part③ サーバー情報（フォーム列64〜78 → シート行103〜118）
  64: { row: 103, col: 2 },  // サーバー管理の希望
  65: { row: 104, col: 2 },  // 現在のドメイン
  66: { row: 105, col: 2 },  // プロバイダ（サーバー会社）
  67: { row: 106, col: 2 },  // 同じドメインでメール使用
  68: { row: 107, col: 2 },  // プロバイダ管理画面のログイン情報
  69: { row: 108, col: 2 },  // ドメイン管理画面のログイン情報
  70: { row: 109, col: 2 },  // AuthCode取得方法
  71: { row: 110, col: 2 },  // DNS設定の確認方法
  72: { row: 111, col: 2 },  // 現在のサーバー管理者
  73: { row: 112, col: 2 },  // 外部委託先への連絡
  74: { row: 113, col: 2 },  // サブドメインの使用
  75: { row: 114, col: 2 },  // FTPサーバー情報
  76: { row: 115, col: 2 },  // 現在のHPアップロード方法
  77: { row: 116, col: 2 },  // メールアカウント数
  78: { row: 117, col: 2 },  // 過去メールの保持希望
  79: { row: 118, col: 2 },  // メールサーバーのログイン情報
};

// ===== メニュー設定 =====
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 設定メニュー（settingsSheet.jsから）
  hp_addSettingsMenu(ui);

  // メインメニュー
  ui.createMenu('1.📋 HP制作')
    .addItem('🆕 新規ヒアリングシート作成（フォーム回答から）', 'hp_createFromFormResponse')
    .addItem('🆕 新規ヒアリングシート作成（手動）', 'hp_createNewHearingSheet')
    .addSeparator()
    .addItem('📂 企業フォルダ作成', 'hp_createCompanyFolder')
    .addSeparator()
    .addItem('📥 フォーム回答を既存シートに転記', 'hp_transferToExistingSheet')
    .addSeparator()
    .addItem('🎨 テンプレート初期設定', 'hp_setupTemplate')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'hp_showStatusUpdateDialog')
    .addToUi();

  // 2.ヒアリング反映メニュー（promptDialog.jsから）
  // ※ 文字起こし転記機能も統合済み
  hp_addPromptMenu(ui);

  // 3.素材フォルダメニュー（createFolder.jsから）
  hp_addFolderMenu(ui);

  // 4.構成案作成メニュー（JSON出力と統合）（compositionPrompt.jsから）
  hp_addCompositionMenu(ui);

  // 進捗管理メニュー（progressManager.jsから）
  hp_addProgressMenu(ui);
}

// ===== ヘルパー関数 =====

/**
 * 除外シートかどうかを判定
 */
function hp_isExcludedSheet(sheetName) {
  return HP_EXCLUDED_SHEETS.includes(sheetName);
}

/**
 * 企業名の一致確認（部分一致・表記揺れ対応）
 */
function hp_checkCompanyNameMatch(name1, name2) {
  const normalize = (str) => {
    return str
      .replace(/株式会社/g, '')
      .replace(/（株）/g, '')
      .replace(/\(株\)/g, '')
      .replace(/㈱/g, '')
      .replace(/有限会社/g, '')
      .replace(/合同会社/g, '')
      .replace(/\s+/g, '')
      .trim();
  };

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  return false;
}

// ===== 1. 新規作成（フォーム回答から） =====
function hp_createFromFormResponse() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // フォーム回答シートを取得
  const formSheet = ss.getSheetByName(HP_FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答 1') ||
                    ss.getSheetByName('フォームの回答1');

  if (!formSheet) {
    ui.alert('エラー', 'フォーム回答シートが見つかりません。', ui.ButtonSet.OK);
    return;
  }

  const lastRow = formSheet.getLastRow();
  if (lastRow <= 1) {
    ui.alert('エラー', 'フォーム回答がありません。', ui.ButtonSet.OK);
    return;
  }

  // アクティブシートの企業名を取得
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  let activeCompanyName = null;
  if (!hp_isExcludedSheet(activeSheetName)) {
    try {
      activeCompanyName = activeSheet.getRange(5, 2).getValue() || activeSheetName;
    } catch (e) {
      activeCompanyName = activeSheetName;
    }
  }

  // 回答一覧を取得
  const responses = formSheet.getRange(2, 1, lastRow - 1, formSheet.getLastColumn()).getValues();

  // 企業名リストを作成
  const companyList = responses.map((row, index) => {
    const timestamp = row[0] ? new Date(row[0]).toLocaleString('ja-JP') : '';
    const companyName = row[1] || '(企業名なし)';
    const isActive = activeCompanyName && companyName === activeCompanyName;
    return {
      index: index + 2,
      display: `${companyName} (${timestamp})`,
      companyName: companyName,
      timestamp: timestamp,
      isActive: isActive,
      data: row
    };
  });

  // ソート: アクティブ最上段、残りは新しい順
  companyList.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.index - a.index;
  });

  // 選択ダイアログを表示
  const htmlContent = hp_createSelectionDialog(companyList, 'createFromFormResponse');
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(700)
    .setHeight(550);
  ui.showModalDialog(htmlOutput, 'フォーム回答から新規作成');
}

// フォーム回答から新規作成を実行
function hp_executeCreateFromFormResponse(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(HP_FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答 1') ||
                    ss.getSheetByName('フォームの回答1');
  const formData = formSheet.getRange(rowIndex, 1, 1, formSheet.getLastColumn()).getValues()[0];

  const companyName = formData[1] || '未設定企業';

  // 同名のシートが既に存在するかチェック
  if (ss.getSheetByName(companyName)) {
    return {
      success: false,
      error: '「' + companyName + '」という名前のシートは既に存在します。'
    };
  }

  try {
    // テンプレートシートを取得
    const templateSheet = ss.getSheetByName(HP_SHEET_NAME);
    if (!templateSheet) {
      return {
        success: false,
        error: 'テンプレート（ヒアリングシート）が見つかりません。先に「テンプレート初期設定」を実行してください。'
      };
    }

    // シートをコピー
    const newSheet = templateSheet.copyTo(ss);
    newSheet.setName(companyName);

    // データを転記
    hp_transferFormDataToSheet(newSheet, formData);

    // タイトル行に企業名を設定
    newSheet.getRange(1, 1).setValue(companyName + ' ヒアリングシート');

    // 新しいシートをアクティブに
    ss.setActiveSheet(newSheet);

    return {
      success: true,
      sheetName: companyName,
      companyName: companyName
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 2. 新規作成（手動） =====
function hp_createNewHearingSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const response = ui.prompt(
    '新規ヒアリングシート作成',
    '企業名を入力してください（例：株式会社○○）：',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const companyName = response.getResponseText().trim();
  if (!companyName) {
    ui.alert('エラー', '企業名を入力してください。', ui.ButtonSet.OK);
    return;
  }

  // 同名のシートが既に存在するかチェック
  if (ss.getSheetByName(companyName)) {
    ui.alert('エラー', '「' + companyName + '」という名前のシートは既に存在します。', ui.ButtonSet.OK);
    return;
  }

  try {
    const templateSheet = ss.getSheetByName(HP_SHEET_NAME);
    if (!templateSheet) {
      ui.alert('エラー', 'テンプレート（ヒアリングシート）が見つかりません。先に「テンプレート初期設定」を実行してください。', ui.ButtonSet.OK);
      return;
    }

    const newSheet = templateSheet.copyTo(ss);
    newSheet.setName(companyName);

    // タイトル行とPart①に企業名を設定
    newSheet.getRange(1, 1).setValue(companyName + ' ヒアリングシート');
    newSheet.getRange(5, 2).setValue(companyName);

    ss.setActiveSheet(newSheet);

    ui.alert('作成完了', '✅ 「' + companyName + '」シートを作成しました。', ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('エラー', 'シート作成に失敗しました：' + error.message, ui.ButtonSet.OK);
  }
}

// ===== 3. フォーム回答を既存シートに転記 =====
function hp_transferToExistingSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(HP_FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答 1') ||
                    ss.getSheetByName('フォームの回答1');

  if (!formSheet) {
    ui.alert('エラー', 'フォーム回答シートが見つかりません。', ui.ButtonSet.OK);
    return;
  }

  const lastRow = formSheet.getLastRow();
  if (lastRow <= 1) {
    ui.alert('エラー', 'フォーム回答がありません。', ui.ButtonSet.OK);
    return;
  }

  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  let activeCompanyName = null;
  if (!hp_isExcludedSheet(activeSheetName)) {
    try {
      activeCompanyName = activeSheet.getRange(5, 2).getValue() || activeSheetName;
    } catch (e) {
      activeCompanyName = activeSheetName;
    }
  }

  const responses = formSheet.getRange(2, 1, lastRow - 1, formSheet.getLastColumn()).getValues();

  const companyList = responses.map((row, index) => {
    const timestamp = row[0] ? new Date(row[0]).toLocaleString('ja-JP') : '';
    const companyName = row[1] || '(企業名なし)';
    const isActive = activeCompanyName && companyName === activeCompanyName;
    return {
      index: index + 2,
      display: `${companyName} (${timestamp})`,
      companyName: companyName,
      timestamp: timestamp,
      isActive: isActive,
      data: row
    };
  });

  companyList.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.index - a.index;
  });

  const htmlContent = hp_createSelectionDialog(companyList, 'transferToExistingSheet');
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(700)
    .setHeight(550);
  ui.showModalDialog(htmlOutput, 'フォーム回答を既存シートに転記');
}

// 既存シートに転記を実行
function hp_executeTransferToExistingSheet(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(HP_FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答 1') ||
                    ss.getSheetByName('フォームの回答1');
  const formData = formSheet.getRange(rowIndex, 1, 1, formSheet.getLastColumn()).getValues()[0];

  const formCompanyName = String(formData[1] || '').trim();

  let targetSheet = ss.getActiveSheet();
  if (hp_isExcludedSheet(targetSheet.getName())) {
    targetSheet = ss.getSheetByName(HP_SHEET_NAME);
  }

  if (!targetSheet) {
    return {
      success: false,
      error: 'ヒアリングシートが見つかりません。先にヒアリングシートを選択してください。'
    };
  }

  // シートの企業名を取得
  const sheetCompanyName = String(targetSheet.getRange(5, 2).getValue() || '').trim();

  // 企業名の一致確認
  if (sheetCompanyName && formCompanyName) {
    const isMatch = hp_checkCompanyNameMatch(formCompanyName, sheetCompanyName);
    if (!isMatch) {
      return {
        success: false,
        needConfirm: true,
        formCompanyName: formCompanyName,
        sheetCompanyName: sheetCompanyName,
        sheetName: targetSheet.getName()
      };
    }
  }

  try {
    hp_transferFormDataToSheet(targetSheet, formData);
    return {
      success: true,
      sheetName: targetSheet.getName()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 強制的に転記を実行（確認後）
function hp_executeTransferForce(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(HP_FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答 1') ||
                    ss.getSheetByName('フォームの回答1');
  const formData = formSheet.getRange(rowIndex, 1, 1, formSheet.getLastColumn()).getValues()[0];

  let targetSheet = ss.getActiveSheet();
  if (hp_isExcludedSheet(targetSheet.getName())) {
    targetSheet = ss.getSheetByName(HP_SHEET_NAME);
  }

  try {
    hp_transferFormDataToSheet(targetSheet, formData);
    return {
      success: true,
      sheetName: targetSheet.getName()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== データ転記関数 =====
function hp_transferFormDataToSheet(sheet, formData) {
  // マッピングに従ってデータを転記
  for (const formCol in HP_FORM_TO_SHEET_MAPPING) {
    const mapping = HP_FORM_TO_SHEET_MAPPING[formCol];
    const value = formData[parseInt(formCol)];

    if (value !== undefined && value !== null && value !== '') {
      const cell = sheet.getRange(mapping.row, mapping.col);

      if (mapping.append) {
        // 既存の値に追記（「その他」詳細用）
        const existingValue = cell.getValue();
        if (existingValue) {
          cell.setValue(existingValue + '\n' + value);
        } else {
          cell.setValue(value);
        }
      } else {
        cell.setValue(value);
      }
    }
  }
}

// ===== 4. 企業フォルダ作成（ダイアログ版） =====

// 標準ページリスト（企業フォルダ内のサブフォルダ候補）
const HP_COMPANY_FOLDER_PAGES = [
  { id: 'top', name: 'TOP', description: 'トップページ素材', default: true },
  { id: 'about', name: 'About', description: '会社概要・私たちについて', default: true },
  { id: 'service', name: 'Service', description: 'サービス・事業内容', default: true },
  { id: 'recruit', name: 'Recruit', description: '採用情報', default: false },
  { id: 'contact', name: 'Contact', description: 'お問い合わせ', default: false },
  { id: 'news', name: 'News', description: 'お知らせ・ニュース', default: false },
  { id: 'blog', name: 'Blog', description: 'ブログ・コラム', default: false },
  { id: 'gallery', name: 'Gallery', description: 'ギャラリー・実績', default: false }
];

function hp_createCompanyFolder() {
  const ui = SpreadsheetApp.getUi();

  // 親フォルダIDの確認
  const parentFolderId = hp_getParentFolderId();
  if (!parentFolderId) {
    ui.alert(
      '⚠️ 親フォルダ未設定',
      '先に設定シートで「HP・LP」フォルダを設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // 企業シート一覧を取得
  const sheetList = hp_getCompanySheetListForCompanyFolder();

  const html = HtmlService.createHtmlOutput(hp_createCompanyFolderDialogHtml(sheetList))
    .setWidth(700)
    .setHeight(700);
  ui.showModalDialog(html, '📂 企業フォルダ作成');
}

/**
 * 企業シート一覧を取得（企業フォルダ作成用）
 * ※会社正式名称（10行目2列目）も取得
 */
function hp_getCompanySheetListForCompanyFolder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (!hp_isExcludedSheet(name)) {
      // 企業名（略称）- 5行目2列目
      let companyName = '';
      try {
        companyName = sheet.getRange(5, 2).getValue() || '';
      } catch (e) {
        companyName = '';
      }

      // 会社正式名称 - 10行目2列目
      let officialName = '';
      try {
        officialName = sheet.getRange(10, 2).getValue() || '';
      } catch (e) {
        officialName = '';
      }

      // Part④の企業フォルダURLを確認（既に作成済みか）
      let hasFolder = false;
      let folderUrl = '';
      const lastRow = sheet.getLastRow();
      for (let row = 1; row <= lastRow; row++) {
        if (sheet.getRange(row, 1).getValue() === '企業フォルダURL') {
          folderUrl = sheet.getRange(row, 2).getValue() || '';
          hasFolder = !!folderUrl;
          break;
        }
      }

      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        officialName: String(officialName).trim(),
        isActive: name === activeSheetName,
        hasFolder: hasFolder,
        folderUrl: folderUrl
      });
    }
  }

  return result;
}

/**
 * 企業フォルダ作成ダイアログHTML
 */
function hp_createCompanyFolderDialogHtml(sheetList) {
  const sheetListJson = JSON.stringify(sheetList);
  const pageOptionsJson = JSON.stringify(HP_COMPANY_FOLDER_PAGES);

  return `
<!DOCTYPE html>
<html>
<head>
  ${CI_DIALOG_STYLES}
  <style>
    h3 { margin: 0 0 15px 0; color: #1565C0; }

    .company-select-wrapper { position: relative; margin-bottom: 20px; }
    .company-select-display {
      width: 100%;
      padding: 12px 36px 12px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    .company-select-display:hover { border-color: #1565C0; }
    .company-select-display.active { border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1); }
    .company-select-display::after {
      content: '▼';
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: #666;
    }
    .company-select-display .placeholder { color: #999; }
    .company-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
      display: none;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
    }
    .company-select-dropdown.show { display: block; }
    .company-item {
      padding: 12px 14px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
    }
    .company-item:last-child { border-bottom: none; }
    .company-item:hover { background: #f5f5f5; }
    .company-item.selected { background: #e3f2fd; }
    .company-item.has-folder { border-left: 3px solid #4CAF50; }

    /* アコーディオン */
    .accordion-section {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .accordion-header {
      background: #f5f5f5;
      padding: 14px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .accordion-header:hover { background: #e8e8e8; }
    .accordion-arrow {
      transition: transform 0.2s;
      color: #666;
    }
    .accordion-arrow.open { transform: rotate(90deg); }
    .accordion-title { font-weight: bold; color: #333; }
    .accordion-subtitle { color: #666; font-size: 12px; margin-left: auto; }
    .accordion-content {
      display: none;
      padding: 16px;
      background: white;
      border-top: 1px solid #ddd;
    }
    .accordion-content.show { display: block; }

    /* ページ選択 */
    .page-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .page-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .page-item:hover { border-color: #1565C0; background: #E3F2FD; }
    .page-item.checked { border-color: #1565C0; background: #E3F2FD; }
    .page-item input { margin-right: 10px; }
    .page-name { font-weight: bold; color: #333; }
    .page-desc { font-size: 11px; color: #666; margin-left: 8px; }

    /* プレビュー */
    .preview-section {
      background: #E8F5E9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .preview-section h4 {
      margin: 0 0 12px 0;
      color: #2E7D32;
      font-size: 14px;
    }
    .preview-tree {
      font-family: monospace;
      font-size: 13px;
      background: white;
      padding: 12px;
      border-radius: 4px;
      max-height: 120px;
      overflow-y: auto;
      white-space: pre;
    }

    .footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .loading { display: none; margin-left: 10px; color: #1565C0; }
    .badge-folder { background: #4CAF50; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
  </style>
</head>
<body>
  <h3>📂 企業フォルダ作成</h3>

  <!-- 企業選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- サブフォルダ作成（アコーディオン） -->
  <div class="accordion-section">
    <div class="accordion-header" onclick="toggleAccordion()">
      <span class="accordion-arrow" id="accordionArrow">▶</span>
      <span class="accordion-title">📁 サブフォルダも一緒に作成する（オプション）</span>
      <span class="accordion-subtitle" id="selectedCount">0件選択中</span>
    </div>
    <div class="accordion-content" id="accordionContent">
      <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">
        ページ構成が決まっている場合、サブフォルダを一緒に作成できます。<br>
        決まっていない場合はスキップして、親フォルダのみ作成できます。
      </p>
      <div class="page-grid" id="pageGrid"></div>
    </div>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <h4>📂 フォルダ構成プレビュー</h4>
    <div class="preview-tree" id="previewTree">（企業を選択してください）</div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-primary" id="createBtn" onclick="createFolder()" disabled>
      📂 フォルダを作成
    </button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    <span class="loading" id="loading">⏳ 処理中...</span>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetList = ${sheetListJson};
    const pageOptions = ${pageOptionsJson};
    let selectedSheet = null;

    window.onload = function() {
      renderPageGrid();
      renderCompanyDropdown();
      updatePreview();

      const activeItem = sheetList.find(item => item.isActive);
      if (activeItem) {
        selectCompany(activeItem);
      }
    };

    // ===== アコーディオン =====
    function toggleAccordion() {
      const arrow = document.getElementById('accordionArrow');
      const content = document.getElementById('accordionContent');
      const isOpen = content.classList.contains('show');

      if (isOpen) {
        content.classList.remove('show');
        arrow.classList.remove('open');
      } else {
        content.classList.add('show');
        arrow.classList.add('open');
      }
    }

    // ===== 企業選択 =====
    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function renderCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      if (!sheetList || sheetList.length === 0) {
        dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
        return;
      }

      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return 0;
      });

      sorted.forEach(item => {
        const div = document.createElement('div');
        let classes = 'company-item';
        if (item.hasFolder) classes += ' has-folder';
        if (selectedSheet && selectedSheet.sheetName === item.sheetName) classes += ' selected';
        div.className = classes;

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        const folderBadge = item.hasFolder ? '<span class="badge-folder">作成済み</span>' : '';

        // 表示名は正式名称優先
        const displayName = item.officialName || item.companyName || item.sheetName;

        div.innerHTML = \`
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:bold;">\${escapeHtml(displayName)}</span>
            \${activeBadge}
            \${folderBadge}
          </div>
          <div style="font-size:12px;color:#666;margin-top:4px;">
            シート名: \${escapeHtml(item.sheetName)}
          </div>
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);
      });
    }

    function selectCompany(item) {
      selectedSheet = item;

      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const folderBadge = item.hasFolder ? '<span class="badge-folder" style="margin-left:8px;">作成済み</span>' : '';

      // 表示名は正式名称優先
      const displayName = item.officialName || item.companyName || item.sheetName;
      display.innerHTML = \`<span>\${escapeHtml(displayName)}\${activeBadge}\${folderBadge}</span>\`;

      document.getElementById('createBtn').disabled = false;

      if (item.hasFolder) {
        showStatus('✅ この企業には既にフォルダが作成されています。URLを開くか、再作成できます。', 'warning');
      } else {
        document.getElementById('status').style.display = 'none';
      }

      updatePreview();
    }

    document.addEventListener('click', function(e) {
      const wrapper = document.querySelector('.company-select-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('companySelectDropdown').classList.remove('show');
        document.getElementById('companySelectDisplay').classList.remove('active');
      }
    });

    // ===== ページ選択 =====
    function renderPageGrid() {
      const grid = document.getElementById('pageGrid');
      grid.innerHTML = '';

      pageOptions.forEach(page => {
        const div = document.createElement('div');
        div.className = 'page-item';
        div.innerHTML = \`
          <input type="checkbox" id="page_\${page.id}" onchange="togglePage('\${page.id}')">
          <span class="page-name">\${escapeHtml(page.name)}</span>
          <span class="page-desc">\${escapeHtml(page.description)}</span>
        \`;
        div.onclick = function(e) {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = div.querySelector('input');
            checkbox.checked = !checkbox.checked;
            togglePage(page.id);
          }
        };
        grid.appendChild(div);
      });

      updateSelectedCount();
    }

    function togglePage(pageId) {
      const checkbox = document.getElementById('page_' + pageId);
      const item = checkbox.closest('.page-item');
      if (checkbox.checked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
      updateSelectedCount();
      updatePreview();
    }

    function updateSelectedCount() {
      const count = getSelectedFolders().length;
      document.getElementById('selectedCount').textContent = count + '件選択中';
    }

    function getSelectedFolders() {
      const folders = [];
      pageOptions.forEach(page => {
        const checkbox = document.getElementById('page_' + page.id);
        if (checkbox && checkbox.checked) {
          folders.push(page.name);
        }
      });
      return folders;
    }

    // ===== プレビュー =====
    function updatePreview() {
      const preview = document.getElementById('previewTree');

      if (!selectedSheet) {
        preview.textContent = '（企業を選択してください）';
        return;
      }

      // 表示名は正式名称優先
      const companyName = selectedSheet.officialName || selectedSheet.companyName || selectedSheet.sheetName;
      const folders = getSelectedFolders();

      let tree = companyName + '/\\n';
      if (folders.length === 0) {
        tree += '  └─ （サブフォルダなし）';
      } else {
        folders.forEach((folder, index) => {
          const prefix = index === folders.length - 1 ? '└─' : '├─';
          tree += '  ' + prefix + ' ' + folder + '/\\n';
        });
      }

      preview.textContent = tree;
    }

    // ===== フォルダ作成 =====
    function createFolder() {
      if (!selectedSheet) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      const folders = getSelectedFolders();

      document.getElementById('loading').style.display = 'inline';
      document.getElementById('createBtn').disabled = true;

      google.script.run
        .withSuccessHandler(handleResult)
        .withFailureHandler(handleError)
        .hp_executeCreateCompanyFolder(selectedSheet.sheetName, selectedSheet.companyName, folders);
    }

    function handleResult(result) {
      document.getElementById('loading').style.display = 'none';

      if (result.success) {
        showStatus('✅ 企業フォルダを作成しました！ URL: ' + result.folderUrl, 'success');
        // 2秒後に閉じる
        setTimeout(() => {
          if (confirm('フォルダを開きますか？')) {
            window.open(result.folderUrl, '_blank');
          }
          google.script.host.close();
        }, 1500);
      } else {
        showStatus('❌ ' + result.error, 'error');
        document.getElementById('createBtn').disabled = false;
      }
    }

    function handleError(error) {
      document.getElementById('loading').style.display = 'none';
      showStatus('❌ エラー: ' + error.message, 'error');
      document.getElementById('createBtn').disabled = false;
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
  `;
}

/**
 * 企業フォルダ作成実行
 * ※フォルダ名には「会社正式名称」を使用（略称ではなく）
 */
function hp_executeCreateCompanyFolder(sheetName, companyName, subfolderNames) {
  const parentFolderId = hp_getParentFolderId();

  if (!parentFolderId) {
    return { success: false, error: '親フォルダが設定されていません' };
  }

  // シートから会社正式名称を取得（フォルダ名に使用）
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    // 10行目2列目 = 会社正式名称
    const officialName = sheet.getRange(10, 2).getValue();
    if (officialName && String(officialName).trim()) {
      companyName = String(officialName).trim();
    }
  }

  if (!companyName) {
    companyName = sheetName;
  }

  try {
    const parentFolder = DriveApp.getFolderById(parentFolderId);

    // 既存フォルダをチェック
    const existingFolders = parentFolder.getFoldersByName(companyName);
    if (existingFolders.hasNext()) {
      const existingFolder = existingFolders.next();
      const folderUrl = existingFolder.getUrl();

      // シートにURL保存
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        hp_saveFolderUrlToSheet(sheet, folderUrl);
      }

      return {
        success: true,
        folderUrl: folderUrl,
        message: '既存フォルダのURLを保存しました',
        isExisting: true
      };
    }

    // 新規フォルダ作成
    const newFolder = parentFolder.createFolder(companyName);
    const folderUrl = newFolder.getUrl();

    // サブフォルダ作成
    if (subfolderNames && subfolderNames.length > 0) {
      for (const name of subfolderNames) {
        newFolder.createFolder(name);
      }
    }

    // シートにURL保存
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      hp_saveFolderUrlToSheet(sheet, folderUrl);
    }

    return {
      success: true,
      folderUrl: folderUrl,
      subfolders: subfolderNames,
      isExisting: false
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 親フォルダIDを取得（設定シートから）
 */
function hp_getParentFolderId() {
  // settingsSheet.jsのhp_getParentFolderIdFromSettings()を使用
  return hp_getParentFolderIdFromSettings();
}

/**
 * フォルダURLをシートのPart④に保存
 * ※ hp_savePart4DataForce（promptDialog.js）を使用
 */
function hp_saveFolderUrlToSheet(sheet, folderUrl) {
  const sheetName = sheet.getName();
  hp_savePart4DataForce(sheetName, '企業フォルダURL', folderUrl);
}

// ===== テンプレート初期設定 =====
function hp_setupTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HP_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(HP_SHEET_NAME);
  } else {
    sheet.clear();
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();
  }

  // 列幅設定
  sheet.setColumnWidth(1, 200);  // A列: ラベル
  sheet.setColumnWidth(2, 400);  // B列: 値
  sheet.setColumnWidth(3, 100);  // C列: タスク保持者等
  sheet.setColumnWidth(4, 80);   // D列: 状態
  sheet.setColumnWidth(5, 80);   // E列: 期限
  sheet.setColumnWidth(6, 80);   // F列: 最終更新日
  sheet.setColumnWidth(7, 80);   // G列: 全体ステータス

  let row = 1;

  // 1行目: タイトル
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue('HP制作ヒアリングシート')
    .setBackground(HP_COLORS.HEADER)
    .setFontColor(HP_COLORS.HEADER_TEXT)
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 40);
  row++;

  // 2-3行目: ステータス欄
  row = hp_createStatusSection(sheet, row);

  // Part① 基本情報
  row = hp_createPartHeader(sheet, row, 'Part① 基本情報（フォームから自動転記）');
  row = hp_createFormInputRow(sheet, row, '企業名');
  row = hp_createFormInputRow(sheet, row, '担当者名');
  row = hp_createFormInputRow(sheet, row, '役職');
  row = hp_createFormInputRow(sheet, row, '電話番号（担当者様）');
  row = hp_createFormInputRow(sheet, row, 'メールアドレス（担当者様）');
  row = hp_createFormInputRow(sheet, row, '会社正式名称');
  row = hp_createFormInputRow(sheet, row, '郵便番号');
  row = hp_createFormInputRow(sheet, row, '住所');
  row = hp_createFormInputRow(sheet, row, '代表電話番号');
  row = hp_createFormInputRow(sheet, row, 'お問い合わせメールアドレス');
  row = hp_createFormInputRow(sheet, row, '代表者名');
  row = hp_createFormInputRow(sheet, row, '設立年');
  row = hp_createFormInputRow(sheet, row, '資本金');
  row = hp_createFormInputRow(sheet, row, '従業員数');
  row = hp_createFormInputRow(sheet, row, '事業内容');
  row = hp_createFormInputRow(sheet, row, '営業時間・定休日');
  row++;

  // HPについてのご要望
  row = hp_createSubHeader(sheet, row, 'HPについてのご要望');
  row = hp_createFormInputRow(sheet, row, 'HPの主な目的');
  row = hp_createFormInputRow(sheet, row, 'メインターゲット');
  row = hp_createFormInputRow(sheet, row, '競合・意識している会社');
  row = hp_createFormInputRow(sheet, row, '自社の強み');
  row = hp_createFormInputRow(sheet, row, '参考にしたいHP');
  row = hp_createFormInputRow(sheet, row, '現在のHP URL');
  row = hp_createFormInputRow(sheet, row, '現在のHPで気になっている点');
  row = hp_createFormInputRow(sheet, row, '期待すること');
  row = hp_createFormInputRow(sheet, row, '必要なページ');
  row = hp_createFormInputRow(sheet, row, '既存素材の有無');
  row = hp_createFormInputRow(sheet, row, 'SNSアカウント');
  row = hp_createFormInputRow(sheet, row, '希望公開時期');
  row++;

  // 会社の詳細情報
  row = hp_createSubHeader(sheet, row, '会社の詳細情報');
  row = hp_createFormInputRow(sheet, row, 'ビジョン・ミッション');
  row = hp_createFormInputRow(sheet, row, '代表メッセージ');
  row = hp_createFormInputRow(sheet, row, '売上高');
  row = hp_createFormInputRow(sheet, row, '会社の雰囲気・文化');
  row = hp_createFormInputRow(sheet, row, 'オフィス・店舗情報');
  row = hp_createFormInputRow(sheet, row, '設備・施設');
  row++;

  // サービス・商品について
  row = hp_createSubHeader(sheet, row, 'サービス・商品について');
  row = hp_createFormInputRow(sheet, row, '主なサービス・商品');
  row = hp_createFormInputRow(sheet, row, 'サービス・商品の強み・特徴');
  row = hp_createFormInputRow(sheet, row, '実績・導入事例');
  row = hp_createFormInputRow(sheet, row, '参考資料の有無');
  row++;

  // Part② ヒアリング情報
  row = hp_createPartHeader(sheet, row, 'Part② ヒアリング情報（打ち合わせで記入）★1行1情報');

  // 1. ゴール・コンバージョン
  row = hp_createSubHeader(sheet, row, '1. ゴール・コンバージョン');
  row = hp_createHearingInputRow(sheet, row, 'メインのコンバージョン');
  row = hp_createHearingInputRow(sheet, row, 'ハードル設定');
  row++;

  // 2. ターゲットの深掘り
  row = hp_createSubHeader(sheet, row, '2. ターゲットの深掘り（ペルソナ設計）');
  row = hp_createHearingInputRow(sheet, row, '年齢層・性別');
  row = hp_createHearingInputRow(sheet, row, '職業・役職・年収帯');
  row = hp_createHearingInputRow(sheet, row, '居住地・勤務地');
  row = hp_createHearingInputRow(sheet, row, '抱えている課題・悩み');
  row = hp_createHearingInputRow(sheet, row, 'どんな状況で検索するか');
  row = hp_createHearingInputRow(sheet, row, '検索しそうなキーワード');
  row = hp_createHearingInputRow(sheet, row, '比較検討時に重視するポイント');
  row = hp_createHearingInputRow(sheet, row, '問い合わせ・応募前の不安・障壁');
  row++;

  // 3. 強みの深掘り
  row = hp_createSubHeader(sheet, row, '3. 強みの深掘り');
  row = hp_createHearingInputRow(sheet, row, '選ばれる理由の具体例');
  row = hp_createHearingInputRow(sheet, row, 'お客様・社員からよく言われる褒め言葉');
  row = hp_createHearingInputRow(sheet, row, 'こだわり・譲れないポイント');
  row = hp_createHearingInputRow(sheet, row, '資格・認定・特許など');
  row = hp_createHearingInputRow(sheet, row, '独自の技術・ノウハウ');
  row = hp_createHearingInputRow(sheet, row, '提出資料で特に使いたい部分');
  row = hp_createHearingInputRow(sheet, row, '募集要項の推しポイント');
  row = hp_createHearingInputRow(sheet, row, '働き方の強み');
  row++;

  // 4. 表現の方向性
  row = hp_createSubHeader(sheet, row, '4. 表現の方向性');
  row = hp_createHearingInputRow(sheet, row, 'キャッチコピー既存案');
  row = hp_createHearingInputRow(sheet, row, 'キャッチコピーイメージ');
  row = hp_createHearingInputRow(sheet, row, '参考キャッチコピー');
  row = hp_createHearingInputRow(sheet, row, 'デザインの深掘り');
  row = hp_createHearingInputRow(sheet, row, 'NGイメージ');
  row = hp_createHearingInputRow(sheet, row, '撮影の雰囲気');
  row = hp_createHearingInputRow(sheet, row, '映したいもの');
  row = hp_createHearingInputRow(sheet, row, '社風の具体例');
  row = hp_createHearingInputRow(sheet, row, '表現したいキーワード');
  row++;

  // 5. SEO・キーワード設計
  row = hp_createSubHeader(sheet, row, '5. SEO・キーワード設計');
  row = hp_createHearingInputRow(sheet, row, '最重要キーワード（3つ）');
  row = hp_createHearingInputRow(sheet, row, 'サブキーワード（5つ程度）');
  row = hp_createHearingInputRow(sheet, row, 'ローカルSEO対象地域');
  row = hp_createHearingInputRow(sheet, row, '現在の検索順位');
  row = hp_createHearingInputRow(sheet, row, '競合キーワード');
  row++;

  // 6. 新規作成の確認
  row = hp_createSubHeader(sheet, row, '6. 新規作成の確認');
  row = hp_createHearingInputRow(sheet, row, '代表メッセージ作成方法');
  row = hp_createHearingInputRow(sheet, row, '代表の強調点');
  row = hp_createHearingInputRow(sheet, row, 'インタビュー対象者');
  row = hp_createHearingInputRow(sheet, row, 'インタビュー人数');
  row = hp_createHearingInputRow(sheet, row, 'インタビュー切り口');
  row = hp_createHearingInputRow(sheet, row, 'よくある質問');
  row = hp_createHearingInputRow(sheet, row, '誤解されたくないこと');
  row++;

  // Part③ サーバー情報
  row = hp_createPartHeader(sheet, row, 'Part③ サーバー情報（フォームから転記 + 補足）');
  row = hp_createFormInputRow(sheet, row, 'サーバー管理の希望');
  row = hp_createFormInputRow(sheet, row, '現在のドメイン');
  row = hp_createFormInputRow(sheet, row, 'プロバイダ');
  row = hp_createFormInputRow(sheet, row, '同じドメインでメール使用');
  row = hp_createFormInputRow(sheet, row, 'プロバイダ管理画面のログイン情報');
  row = hp_createFormInputRow(sheet, row, 'ドメイン管理画面のログイン情報');
  row = hp_createFormInputRow(sheet, row, 'AuthCode取得方法');
  row = hp_createFormInputRow(sheet, row, 'DNS設定の確認方法');
  row = hp_createFormInputRow(sheet, row, '現在のサーバー管理者');
  row = hp_createFormInputRow(sheet, row, '外部委託先への連絡');
  row = hp_createFormInputRow(sheet, row, 'サブドメインの使用');
  row = hp_createFormInputRow(sheet, row, 'FTPサーバー情報');
  row = hp_createFormInputRow(sheet, row, '現在のHPアップロード方法');
  row = hp_createFormInputRow(sheet, row, 'メールアカウント数');
  row = hp_createFormInputRow(sheet, row, '過去メールの保持希望');
  row = hp_createFormInputRow(sheet, row, 'メールサーバーのログイン情報');
  row = hp_createHearingInputRow(sheet, row, 'デプロイパターン（A/B/C）');
  row = hp_createHearingInputRow(sheet, row, '備考');
  row++;

  // Part④ 処理データ
  row = hp_createPartHeader(sheet, row, 'Part④ 処理データ（システム管理）');
  row = hp_createDataStorageRow(sheet, row, '企業フォルダURL');
  row = hp_createDataStorageRow(sheet, row, '選択ページ');
  row = hp_createDataStorageRow(sheet, row, '文字起こし原文');
  row = hp_createDataStorageRow(sheet, row, 'ヒアリング抽出JSON');
  row = hp_createDataStorageRow(sheet, row, '選択テンプレート');
  row = hp_createDataStorageRow(sheet, row, '構成案');
  row = hp_createDataStorageRow(sheet, row, '公開URL');
  row++;

  // 罫線
  const lastRow = row;
  sheet.getRange(1, 1, lastRow, 7).setBorder(
    true, true, true, true, true, true,
    HP_COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID
  );

  // ログヘッダーを作成（I列〜N列）
  hp_createLogHeader(sheet);

  SpreadsheetApp.getUi().alert('✅ テンプレートの初期設定が完了しました');
}

// ===== テンプレートヘルパー関数 =====

/**
 * ステータス欄作成（2-3行目）
 */
function hp_createStatusSection(sheet, startRow) {
  const taskList = HP_TASKS.map(t => t.no + '.' + t.name);

  // メンバー一覧を設定シートから取得（なければデフォルト）
  const members = hp_getMembers();

  const headerRow = startRow;
  const valueRow = startRow + 1;

  // 2行目: ヘッダー
  const headers = ['現在タスク', 'タスク保持者', '状態', '期限', '最終更新日', '全体ステータス'];
  headers.forEach((header, i) => {
    sheet.getRange(headerRow, 2 + i)
      .setValue(header)
      .setBackground('#E3F2FD')
      .setFontWeight('bold')
      .setFontColor('#000000');
  });

  // 3行目: 入力欄
  const inputBg = '#FFFDE7';

  // B列: 現在タスク
  sheet.getRange(valueRow, 2).setValue(taskList[0]).setBackground(inputBg).setFontColor('#000000');
  const taskRule = SpreadsheetApp.newDataValidation().requireValueInList(taskList, true).build();
  sheet.getRange(valueRow, 2).setDataValidation(taskRule);

  // C列: タスク保持者（設定シートから取得したメンバーを使用）
  sheet.getRange(valueRow, 3).setValue(members[0]).setBackground(inputBg).setFontColor('#000000');
  const holderRule = SpreadsheetApp.newDataValidation().requireValueInList(members, true).build();
  sheet.getRange(valueRow, 3).setDataValidation(holderRule);

  // D列: 状態
  sheet.getRange(valueRow, 4).setValue(HP_STATUS_STATES[0]).setBackground(inputBg).setFontColor('#000000');
  const stateRule = SpreadsheetApp.newDataValidation().requireValueInList(HP_STATUS_STATES, true).build();
  sheet.getRange(valueRow, 4).setDataValidation(stateRule);

  // E列: 期限
  sheet.getRange(valueRow, 5).setBackground(inputBg).setFontColor('#000000').setNumberFormat('M/d');

  // F列: 最終更新日（自動）
  sheet.getRange(valueRow, 6).setBackground('#E0E0E0').setFontColor('#666666').setNumberFormat('M/d');

  // G列: 全体ステータス
  sheet.getRange(valueRow, 7).setValue(HP_STATUS_OVERALL[0]).setBackground(inputBg).setFontColor('#000000');
  const overallRule = SpreadsheetApp.newDataValidation().requireValueInList(HP_STATUS_OVERALL, true).build();
  sheet.getRange(valueRow, 7).setDataValidation(overallRule);

  return startRow + 2;
}

/**
 * Partヘッダー作成（A〜G列を結合）
 */
function hp_createPartHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue(title)
    .setBackground(HP_COLORS.PART_HEADER)
    .setFontColor(HP_COLORS.HEADER_TEXT)
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 30);
  return row + 1;
}

/**
 * サブヘッダー作成（A〜G列を結合）
 */
function hp_createSubHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue('▼ ' + title)
    .setBackground(HP_COLORS.SUB_HEADER)
    .setFontColor('#3949AB')
    .setFontSize(10)
    .setFontWeight('bold');
  sheet.setRowHeight(row, 25);
  return row + 1;
}

/**
 * フォーム転記用入力行（黄色背景、B〜G列を結合）
 */
function hp_createFormInputRow(sheet, row, label) {
  sheet.getRange(row, 1).setValue(label).setBackground(HP_COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 2, 1, 6).merge().setBackground(HP_COLORS.FORM_INPUT).setWrap(true);
  return row + 1;
}

/**
 * ヒアリング記入用入力行（水色背景、B〜G列を結合）
 */
function hp_createHearingInputRow(sheet, row, label) {
  sheet.getRange(row, 1).setValue(label).setBackground(HP_COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 2, 1, 6).merge().setBackground(HP_COLORS.HEARING_INPUT).setWrap(true);
  return row + 1;
}

/**
 * Part④ データ保存用行（B〜G列を結合）
 */
function hp_createDataStorageRow(sheet, row, label) {
  sheet.getRange(row, 1).setValue(label).setBackground(HP_COLORS.DATA_LABEL).setFontWeight('bold').setFontColor('#333');
  sheet.getRange(row, 2, 1, 6).merge().setBackground(HP_COLORS.DATA_VALUE).setFontColor('#333').setWrap(true);
  return row + 1;
}

/**
 * ログヘッダー作成（I列〜N列）
 */
function hp_createLogHeader(sheet) {
  // タイトル行
  sheet.getRange(1, 9, 1, 6)
    .setValues([['更新ログ', '', '', '', '', '']])
    .setBackground('#4A90D9')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
  sheet.getRange(1, 9, 1, 6).merge();

  // ヘッダー行
  const headers = ['日時', 'タスク変更', '保持者変更', '状態', 'メモ', '工数'];
  sheet.getRange(2, 9, 1, 6)
    .setValues([headers])
    .setBackground('#E3F2FD')
    .setFontWeight('bold');

  // 列幅調整
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 80);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 80);
  sheet.setColumnWidth(13, 200);
  sheet.setColumnWidth(14, 80);
}

// ===== 選択ダイアログHTML生成 =====
function hp_createSelectionDialog(companyList, action) {
  const companyListJson = JSON.stringify(companyList);

  return `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        .response-select-wrapper { position: relative; margin-bottom: 16px; }
        .response-select-display {
          width: 100%;
          padding: 12px 36px 12px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          background: white;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }
        .response-select-display:hover { border-color: #3b82f6; }
        .response-select-display.active { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .response-select-display::after {
          content: '▼';
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: #666;
        }
        .response-select-display .placeholder { color: #999; }
        .response-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          display: none;
          max-height: 280px;
          overflow-y: auto;
          margin-top: 4px;
        }
        .response-select-dropdown.show { display: block; }
        .response-item {
          padding: 12px 14px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s;
        }
        .response-item:last-child { border-bottom: none; }
        .response-item:hover { background: #f5f5f5; }
        .response-item.selected { background: #e3f2fd; }
        .response-company {
          font-weight: bold;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .response-timestamp { color: #666; font-size: 12px; margin-top: 4px; }
        .result { margin-top: 16px; padding: 12px; border-radius: 6px; display: none; }
        .result.success { display: block; background: #e6f4ea; color: #1e7e34; }
        .result.error { display: block; background: #fce8e6; color: #c5221f; }
        .footer { display: flex; gap: 10px; justify-content: flex-end; }
      </style>
    </head>
    <body>
      <p class="description">転記するフォーム回答を選択してください：</p>

      <div class="response-select-wrapper">
        <div class="response-select-display" id="responseSelectDisplay" onclick="toggleDropdown()">
          <span class="placeholder">フォーム回答を選択してください</span>
        </div>
        <div class="response-select-dropdown" id="responseSelectDropdown"></div>
      </div>

      <div class="footer">
        <button class="btn btn-primary" onclick="execute()" id="executeBtn" disabled>実行</button>
        <button class="btn btn-gray" onclick="google.script.host.close()">キャンセル</button>
      </div>
      <div id="result" class="result"></div>

      ${CI_UI_COMPONENTS}
      <script>
        const companyList = ${companyListJson};
        let selectedIndex = null;
        let selectedItem = null;

        window.onload = function() {
          renderDropdown();
          const activeItem = companyList.find(item => item.isActive);
          if (activeItem) {
            selectResponse(activeItem);
          }
        };

        function toggleDropdown() {
          const display = document.getElementById('responseSelectDisplay');
          const dropdown = document.getElementById('responseSelectDropdown');
          const isOpen = dropdown.classList.contains('show');

          if (isOpen) {
            dropdown.classList.remove('show');
            display.classList.remove('active');
          } else {
            dropdown.classList.add('show');
            display.classList.add('active');
          }
        }

        function renderDropdown() {
          const dropdown = document.getElementById('responseSelectDropdown');
          dropdown.innerHTML = '';

          companyList.forEach(item => {
            const div = document.createElement('div');
            div.className = 'response-item';
            if (selectedIndex === item.index) {
              div.classList.add('selected');
            }

            const badge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';

            div.innerHTML = \`
              <div class="response-company">\${escapeHtml(item.companyName)}\${badge}</div>
              <div class="response-timestamp">\${escapeHtml(item.timestamp || '')}</div>
            \`;

            div.onclick = function(e) {
              e.stopPropagation();
              selectResponse(item);
              toggleDropdown();
            };

            dropdown.appendChild(div);
          });
        }

        function selectResponse(item) {
          selectedIndex = item.index;
          selectedItem = item;

          const display = document.getElementById('responseSelectDisplay');
          const badge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
          display.innerHTML = \`<span>\${escapeHtml(item.companyName)}\${badge}</span>\`;

          document.querySelectorAll('.response-item').forEach(el => el.classList.remove('selected'));
          const items = document.querySelectorAll('.response-item');
          items.forEach(el => {
            const name = el.querySelector('.response-company').textContent.replace('アクティブ', '').trim();
            if (name === item.companyName) {
              el.classList.add('selected');
            }
          });

          document.getElementById('executeBtn').disabled = false;
        }

        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.response-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('responseSelectDropdown').classList.remove('show');
            document.getElementById('responseSelectDisplay').classList.remove('active');
          }
        });

        function execute() {
          if (!selectedIndex) {
            alert('回答を選択してください');
            return;
          }

          const action = '${action}';
          if (action === 'createFromFormResponse') {
            google.script.run
              .withSuccessHandler(handleCreateResult)
              .withFailureHandler(handleError)
              .hp_executeCreateFromFormResponse(selectedIndex);
          } else if (action === 'transferToExistingSheet') {
            google.script.run
              .withSuccessHandler(handleTransferResult)
              .withFailureHandler(handleError)
              .hp_executeTransferToExistingSheet(selectedIndex);
          }
        }

        function handleCreateResult(result) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          if (result.success) {
            div.className = 'result success';
            div.innerHTML = '✅ 作成完了: 「' + result.companyName + '」シートを作成しました<br><br>シートに移動しました。<br><br><button class="btn btn-primary" onclick="google.script.host.close()">閉じる</button>';
          } else {
            div.className = 'result error';
            div.innerHTML = '❌ エラー: ' + result.error;
          }
        }

        function handleTransferResult(result) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          if (result.success) {
            div.className = 'result success';
            div.innerHTML = '✅ 転記完了: ' + result.sheetName + '<br><br><button class="btn btn-primary" onclick="google.script.host.close()">閉じる</button>';
          } else if (result.needConfirm) {
            div.className = 'result error';
            div.innerHTML = '⚠️ 企業名が一致しません<br><br>' +
              '<strong>フォーム回答:</strong> ' + result.formCompanyName + '<br>' +
              '<strong>シート:</strong> ' + result.sheetCompanyName + '<br><br>' +
              '該当する企業のシートを開いてから実行してください。<br><br>' +
              '<button class="btn btn-gray" onclick="forceTransfer()">それでも転記する</button>';
          } else {
            div.className = 'result error';
            div.innerHTML = '❌ エラー: ' + result.error;
          }
        }

        function forceTransfer() {
          if (selectedIndex) {
            google.script.run
              .withSuccessHandler(handleForceResult)
              .withFailureHandler(handleError)
              .hp_executeTransferForce(selectedIndex);
          }
        }

        function handleForceResult(result) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          if (result.success) {
            div.className = 'result success';
            div.innerHTML = '✅ 転記完了: ' + result.sheetName + '<br><br><button class="btn btn-primary" onclick="google.script.host.close()">閉じる</button>';
          } else {
            div.className = 'result error';
            div.innerHTML = '❌ エラー: ' + result.error;
          }
        }

        function handleError(error) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          div.className = 'result error';
          div.innerHTML = '❌ エラー: ' + error.message;
        }
      </script>
    </body>
    </html>
  `;
}
