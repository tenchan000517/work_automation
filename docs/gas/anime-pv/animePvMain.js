/**
 * アニメPV制作 - メインメニュー
 *
 * 【設計思想】
 * - シンプルなシート構造（手入力は最小限: 企業名、業種、目的、ターゲット、トンマナ）
 * - 文字起こし → AI抽出 → パースのフロー
 * - 台本生成時に動画プロンプト・ナレーションも生成
 * - ダイアログでの編集・オプション追加
 * - 12シーン + エンディング
 */

// ================================================================================
// ===== 定数 =====
// ================================================================================

const PV_VERSION = '2.0.0';
const PV_SCENE_COUNT = 12;
const PV_CHARACTER_COUNT = 2;

// 除外シート名
const PV_EXCLUDED_SHEETS = ['ヒアリングシート', '設定', 'プロンプト', '進捗一覧', 'テンプレート'];

// ================================================================================
// ===== メニュー =====
// ================================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('📹 アニメPV制作')
    // 1️⃣ ヒアリング
    .addSubMenu(ui.createMenu('1️⃣ ヒアリング')
      .addItem('🆕 新規ヒアリングシート作成', 'pv_createNewSheet')
      .addItem('📂 企業フォルダ作成', 'pv_createCompanyFolder')
      .addSeparator()
      .addItem('📋 文字起こしを整理（プロンプト生成）', 'pv_showTranscriptPromptDialog')
      .addItem('📥 AI出力を転記', 'pv_showTranscriptParseDialog')
    )
    // 2️⃣ 台本生成
    .addSubMenu(ui.createMenu('2️⃣ 台本生成')
      .addItem('📝 台本生成プロンプト', 'pv_showScriptPromptDialog')
      .addItem('📥 台本パース・保存', 'pv_showScriptParseDialog')
    )
    // 3️⃣ キャラクター・シーン編集
    .addSubMenu(ui.createMenu('3️⃣ キャラクター・シーン編集')
      .addItem('👤 キャラクター設定を編集', 'pv_showCharacterEditDialog')
      .addItem('🎬 シーン構成を編集', 'pv_showSceneEditDialog')
      .addItem('🎬 エンディングを編集', 'pv_showEndingEditDialog')
    )
    // 4️⃣ プロンプト生成
    .addSubMenu(ui.createMenu('4️⃣ プロンプト生成')
      .addItem('🎨 キャラクターシートプロンプト', 'pv_showCharacterSheetPromptDialog')
      .addItem('🎬 シーン生成プロンプト', 'pv_showScenePromptDialog')
      .addSeparator()
      .addItem('✏️ 歌詞生成プロンプト', 'pv_showLyricsPromptDialog')
      .addItem('📥 歌詞を貼り付け・保存', 'pv_showLyricsParseDialog')
      .addItem('🎵 SUNO冒頭BGMプロンプト', 'pv_showSunoBgmDialog')
      .addItem('🎤 SUNO歌詞付き楽曲プロンプト', 'pv_showSunoVocalDialog')
      .addItem('🗣️ ナレーションテキスト出力', 'pv_showNarrationOutputDialog')
    )
    // 5️⃣ エフェクトシーン
    .addSubMenu(ui.createMenu('5️⃣ エフェクトシーン')
      .addItem('✨ エフェクトシーンプロンプト生成', 'pv_showEffectSceneDialog')
    )
    // ⚙️ 設定
    .addSubMenu(ui.createMenu('⚙️ 設定')
      .addItem('🎨 テンプレート初期設定', 'pv_setupTemplates')
      .addItem('📁 親フォルダを設定', 'pv_setParentFolder')
      .addSeparator()
      .addItem('📋 進捗一覧', 'pv_showProgressList')
    )
    .addToUi();
}

// ================================================================================
// ===== ユーティリティ: シート判定 =====
// ================================================================================

/**
 * 除外シートかどうかを判定
 */
function pv_isExcludedSheet(sheetName) {
  return PV_EXCLUDED_SHEETS.includes(sheetName);
}

/**
 * 企業シートかどうかを判定
 */
function pv_isCompanySheet(sheetName) {
  return !pv_isExcludedSheet(sheetName);
}

// ================================================================================
// ===== ユーティリティ: HTML・文字列 =====
// ================================================================================

/**
 * HTMLエスケープ
 */
function pv_escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 日時をフォーマット
 */
function pv_formatDateTime(date) {
  return Utilities.formatDate(date || new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
}

// ================================================================================
// ===== ユーティリティ: 設定シート =====
// ================================================================================

/**
 * 設定シートから値を取得
 */
function pv_getSettingValue(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return null;
}

/**
 * 設定シートに値を保存
 */
function pv_setSettingValue(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('設定');

  if (!sheet) {
    sheet = ss.insertSheet('設定');
    sheet.getRange(1, 1, 1, 2).setValues([['キー', '値']]);
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[key, value]]);
}

// ================================================================================
// ===== ユーティリティ: 企業シート操作 =====
// ================================================================================

/**
 * 企業シート一覧を取得
 */
function pv_getCompanySheetList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (pv_isCompanySheet(sheetName)) {
      const companyName = pv_getCompanyNameFromSheet(sheet);
      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        isActive: sheetName === activeSheetName
      });
    }
  });

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: pv_isCompanySheet(activeSheetName),
    companySheets: companySheets
  };
}

/**
 * シートから企業名を取得
 */
function pv_getCompanyNameFromSheet(sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === '企業名') {
      return String(data[i][1] || '').trim();
    }
  }
  return '';
}

/**
 * ラベルでセルを検索して値を取得
 * ※ 数値も文字列として返す（ダイアログ読み込みエラー防止）
 */
function pv_getCellValueByLabel(sheet, label) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === label) {
      const value = data[i][1];
      // 数値や他の型も文字列に変換して返す
      if (value === null || value === undefined) return '';
      return String(value);
    }
  }
  return '';
}

/**
 * ラベルでセルを検索して値を設定
 */
function pv_setCellValueByLabel(sheet, label, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === label) {
      sheet.getRange(i + 1, 2).setValue(value);
      return { success: true };
    }
  }
  return { success: false, error: `「${label}」が見つかりません` };
}

/**
 * ラベルでセルを検索して値を設定（既存値チェック付き）
 */
function pv_setCellValueByLabelWithCheck(sheet, label, value, checkExisting) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === label) {
      const existing = data[i][1];
      if (checkExisting && existing) {
        return { success: false, needConfirm: true };
      }
      sheet.getRange(i + 1, 2).setValue(value);
      return { success: true };
    }
  }
  return { success: false, error: `「${label}」が見つかりません` };
}

// ================================================================================
// ===== ユーティリティ: ヒアリングデータ取得 =====
// ================================================================================

/**
 * シートから基本情報を取得
 */
function pv_getBasicInfoFromSheet(sheet) {
  return {
    companyName: pv_getCellValueByLabel(sheet, '企業名'),
    industry: pv_getCellValueByLabel(sheet, '業種'),
    goal: pv_getCellValueByLabel(sheet, '目的'),
    usage: pv_getCellValueByLabel(sheet, '用途'),
    target: pv_getCellValueByLabel(sheet, 'ターゲット'),
    tone: pv_getCellValueByLabel(sheet, 'トンマナ')
  };
}

/**
 * シートからAI抽出データを取得
 */
function pv_getExtractedDataFromSheet(sheet) {
  return {
    coreMessage: pv_getCellValueByLabel(sheet, 'コアメッセージ'),
    storyIdea: pv_getCellValueByLabel(sheet, 'ストーリーアイデア'),
    safetyEquipment: pv_getCellValueByLabel(sheet, '安全装備'),
    ngElements: pv_getCellValueByLabel(sheet, 'NG要素'),
    setting: pv_getCellValueByLabel(sheet, '舞台・世界観'),
    audioSetting: pv_getCellValueByLabel(sheet, '音声設定')
  };
}

/**
 * シートからキャラクターデータを取得
 */
function pv_getCharacterDataFromSheet(sheet, charNum) {
  const prefix = `キャラクター${charNum}_`;
  return {
    name: pv_getCellValueByLabel(sheet, prefix + '名前'),
    gender: pv_getCellValueByLabel(sheet, prefix + '性別'),
    currentAge: pv_getCellValueByLabel(sheet, prefix + '現在編年齢'),
    pastAge: pv_getCellValueByLabel(sheet, prefix + '過去編年齢'),
    hair: pv_getCellValueByLabel(sheet, prefix + '髪型髪色'),
    eyes: pv_getCellValueByLabel(sheet, prefix + '目の特徴'),
    build: pv_getCellValueByLabel(sheet, prefix + '体格'),
    pastOutfit: pv_getCellValueByLabel(sheet, prefix + '過去編服装'),
    currentOutfit: pv_getCellValueByLabel(sheet, prefix + '現在編服装')
  };
}

/**
 * シートからシーンデータを取得
 */
function pv_getSceneDataFromSheet(sheet, sceneNum) {
  const prefix = `シーン${sceneNum}_`;
  return {
    name: pv_getCellValueByLabel(sheet, prefix + '名前'),
    phase: pv_getCellValueByLabel(sheet, prefix + '時間帯'),
    location: pv_getCellValueByLabel(sheet, prefix + '場所'),
    characters: pv_getCellValueByLabel(sheet, prefix + '登場キャラ'),
    action: pv_getCellValueByLabel(sheet, prefix + '演出動き'),
    mood: pv_getCellValueByLabel(sheet, prefix + 'ムード'),
    narration: pv_getCellValueByLabel(sheet, prefix + 'ナレーション'),
    videoPrompt: pv_getCellValueByLabel(sheet, prefix + '動画プロンプト'),
    startFramePrompt: pv_getCellValueByLabel(sheet, prefix + '開始フレームプロンプト')
  };
}

/**
 * シートからエンディングデータを取得
 */
function pv_getEndingDataFromSheet(sheet) {
  return {
    type: pv_getCellValueByLabel(sheet, 'エンディング_タイプ'),
    sourceObject: pv_getCellValueByLabel(sheet, 'エンディング_変形元'),
    animationType: pv_getCellValueByLabel(sheet, 'エンディング_アニメーション'),
    finalText: pv_getCellValueByLabel(sheet, 'エンディング_最終テキスト'),
    videoPrompt: pv_getCellValueByLabel(sheet, 'エンディング_動画プロンプト')
  };
}

// ================================================================================
// ===== ダイアログ用ラッパー関数 =====
// ================================================================================

/**
 * ダイアログ用に基本情報を取得（シート名で呼び出し）
 */
function pv_getBasicInfoForDialog(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {};
  return pv_getBasicInfoFromSheet(sheet);
}

/**
 * ダイアログ用に抽出データを取得（シート名で呼び出し）
 */
function pv_getExtractedDataForDialog(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {};
  return pv_getExtractedDataFromSheet(sheet);
}

// ================================================================================
// ===== プレースホルダー関数 =====
// ================================================================================

function pv_showProgressList() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('進捗一覧', '今後実装予定です。', ui.ButtonSet.OK);
}
