/**
 * 統合メニュー設定
 *
 * 【使い方】
 * 1. このファイルの内容をGASにコピー
 * 2. 他のGASファイル（template-manager.js, old/new-format-export.js）の
 *    onOpen関数を削除し、他の関数のみをコピー
 * 3. すべてを1つのGASプロジェクトに統合
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // ヒアリングシート管理メニュー
  ui.createMenu('📋 ヒアリングシート')
    .addItem('🆕 新規作成（企業別）', 'createNewHearingSheet')
    .addSeparator()
    .addItem('🎨 テンプレート初期設定', 'setupTemplate')
    .addItem('📄 現在のシートをテンプレート化', 'formatCurrentSheet')
    .addToUi();

  // AI出力メニュー（フォーマット自動判定版）
  ui.createMenu('📄 AI出力')
    .addItem('JSONでダウンロード', 'downloadAsJsonAuto')
    .addItem('テキストでダウンロード', 'downloadAsTextAuto')
    .addSeparator()
    .addSubMenu(ui.createMenu('フォーマット指定')
      .addItem('旧フォーマット - JSON', 'downloadAsJson')
      .addItem('旧フォーマット - テキスト', 'downloadAsText')
      .addItem('新フォーマット - JSON', 'downloadAsJsonNew')
      .addItem('新フォーマット - テキスト', 'downloadAsTextNew'))
    .addSeparator()
    .addItem('🔧 シート構造を確認', 'debugSheetDataFull')
    .addToUi();
}

/**
 * シートフォーマットを自動判定してJSON出力
 */
function downloadAsJsonAuto() {
  if (isNewFormat()) {
    downloadAsJsonNew();
  } else {
    downloadAsJson();
  }
}

/**
 * シートフォーマットを自動判定してテキスト出力
 */
function downloadAsTextAuto() {
  if (isNewFormat()) {
    downloadAsTextNew();
  } else {
    downloadAsText();
  }
}

/**
 * 新フォーマットかどうかを判定
 * - ▼マークでセクションが始まる
 * - 列1にフィールド名がある
 */
function isNewFormat() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // 最初の30行をチェック
  for (let i = 0; i < Math.min(30, data.length); i++) {
    const col0 = String(data[i][0] || "").trim();
    // ▼マークがあれば新フォーマット
    if (col0.startsWith("▼")) {
      return true;
    }
    // 旧フォーマットの特徴：列0にセクション名（企業概要、勤務時間など）
    if (col0 === "企業概要" || col0 === "勤務時間" || col0 === "休憩時間") {
      return false;
    }
  }

  // デフォルトは旧フォーマット
  return false;
}
