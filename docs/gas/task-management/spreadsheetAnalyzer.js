/**
 * スプレッドシート完全分析ツール
 *
 * 既存タスク管理スプレッドシートの構造を徹底的に把握するためのGAS
 *
 * 使い方:
 * 1. 対象スプレッドシートのGASエディタにこのコードを貼り付け
 * 2. 保存して実行（初回は認証が必要）
 * 3. メニュー「🔍 分析ツール」から実行
 *
 * メニュー構成:
 * 🔍 分析ツール
 * ├── ①② 全体概要（シート名・データ範囲）→ ダイアログ表示
 * ├── ③ 全シート詳細抽出 → Google Doc作成
 * ├── ③ 個別シート抽出（アクティブシートのみ）
 * └── ④ レポートURL表示
 *
 * 出力ポリシー:
 * - 主観的な取捨選択・整理はしない
 * - 空セルかつ完全デフォルト書式のセルのみ省略（情報量ゼロのため）
 * - それ以外はすべて出力（値、数式、書式、色、入力規則、ノート等）
 */

// ========================================
// メニュー
// ========================================

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🔍 分析ツール')
    .addItem('①② 全体概要（シート名・データ範囲）', 'showOverview')
    .addSeparator()
    .addItem('③ 全シート詳細抽出 → レポート作成', 'extractAllToReport')
    .addItem('③ 個別シート抽出（アクティブシートのみ）', 'extractCurrentSheet')
    .addSeparator()
    .addItem('④ レポートURL表示', 'showReportUrl')
    .addToUi();
}

// ========================================
// ①② 全体概要
// ========================================

function showOverview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  let html = '<style>';
  html += 'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 13px; margin: 12px; }';
  html += 'table { border-collapse: collapse; width: 100%; }';
  html += 'th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-size: 12px; }';
  html += 'th { background: #4A86C8; color: white; white-space: nowrap; }';
  html += 'tr:nth-child(even) { background: #f8f8f8; }';
  html += '.hidden { color: #999; font-style: italic; }';
  html += '.empty { color: #ccc; }';
  html += '.tab-color { width: 20px; height: 20px; border: 1px solid #ccc; display: inline-block; }';
  html += '</style>';

  html += '<h3>📊 ' + escapeHtml_(ss.getName()) + '</h3>';
  html += '<p>URL: <a href="' + ss.getUrl() + '" target="_blank">開く</a></p>';
  html += '<p>シート数: <b>' + sheets.length + '</b></p>';

  // 名前付き範囲
  const namedRanges = ss.getNamedRanges();
  if (namedRanges.length > 0) {
    html += '<h4>名前付き範囲 (' + namedRanges.length + '件)</h4>';
    html += '<table><tr><th>名前</th><th>範囲</th></tr>';
    namedRanges.forEach(function(nr) {
      html += '<tr><td>' + escapeHtml_(nr.getName()) + '</td>';
      html += '<td>' + nr.getRange().getA1Notation() + ' (' + nr.getRange().getSheet().getName() + ')</td></tr>';
    });
    html += '</table><br>';
  }

  // シート一覧
  html += '<table>';
  html += '<tr><th>#</th><th>シート名</th><th>表示</th><th>データ範囲</th>';
  html += '<th>行数</th><th>列数</th><th>最大行</th><th>最大列</th>';
  html += '<th>固定行</th><th>固定列</th><th>タブ色</th></tr>';

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const dataRange = (lastRow > 0 && lastCol > 0)
      ? 'A1:' + sheet.getRange(lastRow, lastCol).getA1Notation()
      : '(空)';
    const hidden = sheet.isSheetHidden();
    const tabColor = sheet.getTabColor() || '';

    html += '<tr' + (hidden ? ' class="hidden"' : '') + '>';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td><b>' + escapeHtml_(sheet.getName()) + '</b></td>';
    html += '<td>' + (hidden ? '非表示' : '表示') + '</td>';
    html += '<td' + (lastRow === 0 ? ' class="empty"' : '') + '>' + dataRange + '</td>';
    html += '<td>' + lastRow + '</td>';
    html += '<td>' + lastCol + '</td>';
    html += '<td>' + sheet.getMaxRows() + '</td>';
    html += '<td>' + sheet.getMaxColumns() + '</td>';
    html += '<td>' + sheet.getFrozenRows() + '</td>';
    html += '<td>' + sheet.getFrozenColumns() + '</td>';
    html += '<td><span class="tab-color" style="background:' + (tabColor || '#fff') + ';"></span> ' + (tabColor || '-') + '</td>';
    html += '</tr>';
  }

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html).setWidth(1000).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(output, '①② 全体概要');
}

// ========================================
// ③ 全シート詳細抽出 → Google Doc
// ========================================

function extractAllToReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const startTime = Date.now();
  const TIME_LIMIT_MS = 330000; // 5分30秒（安全マージン）

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '③ 全シート詳細抽出',
    sheets.length + 'シートの詳細データをGoogle Docに出力します。\n' +
    '処理に数分かかる場合があります。\n\n続行しますか？',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  // Google Doc作成
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmmss');
  const docTitle = '【完全分析】' + ss.getName() + '_' + timestamp;
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Docのデフォルトフォント
  const defaultStyle = {};
  defaultStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Consolas';
  defaultStyle[DocumentApp.Attribute.FONT_SIZE] = 9;
  body.setAttributes(defaultStyle);

  // ====== レポートヘッダー ======
  appendH1_(body, 'スプレッドシート完全分析レポート');
  appendText_(body, [
    '生成日時: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss'),
    'スプレッドシート名: ' + ss.getName(),
    'URL: ' + ss.getUrl(),
    'シート数: ' + sheets.length,
    '',
    '【出力ポリシー】',
    '- 空セルかつ完全デフォルト書式のセルのみ省略',
    '- 値・数式・書式・色・入力規則・ノート・結合等はすべて出力',
    '- 書式はデフォルトと異なる項目のみ表記（デフォルト: bg:#ffffff, font:#000000 Arial 10pt normal）'
  ].join('\n'));

  // ====== 名前付き範囲 ======
  appendH2_(body, '名前付き範囲');
  try {
    const namedRanges = ss.getNamedRanges();
    if (namedRanges.length > 0) {
      const nrLines = namedRanges.map(function(nr) {
        return nr.getName() + ' → ' + nr.getRange().getSheet().getName() + '!' + nr.getRange().getA1Notation();
      });
      appendText_(body, nrLines.join('\n'));
    } else {
      appendText_(body, 'なし');
    }
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ====== シート一覧 ======
  appendH2_(body, 'シート一覧');
  const overviewLines = sheets.map(function(sheet, i) {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const hidden = sheet.isSheetHidden() ? ' 【非表示】' : '';
    const tabColor = sheet.getTabColor() ? ' タブ色:' + sheet.getTabColor() : '';
    return (i + 1) + '. ' + sheet.getName() + hidden + ' (' + lastRow + '行×' + lastCol + '列)' + tabColor;
  });
  appendText_(body, overviewLines.join('\n'));

  // ====== 各シート詳細 ======
  let completedCount = 0;
  let skippedSheets = [];

  for (let i = 0; i < sheets.length; i++) {
    const elapsed = Date.now() - startTime;
    if (elapsed > TIME_LIMIT_MS) {
      skippedSheets = sheets.slice(i).map(function(s) { return s.getName(); });
      appendH2_(body, '⚠️ 時間制限により以下のシートは未処理');
      appendText_(body, skippedSheets.join('\n'));
      appendText_(body, '\n→ 「個別シート抽出」で個別に実行してください');
      break;
    }

    try {
      extractOneSheet_(sheets[i], body, i + 1);
      completedCount++;
    } catch (e) {
      appendH1_(body, '❌ シート ' + (i + 1) + ': ' + sheets[i].getName() + ' - エラー');
      appendText_(body, 'エラー: ' + e.message + '\nスタック: ' + e.stack);
      completedCount++;
    }
  }

  doc.saveAndClose();

  // URL保存
  const props = PropertiesService.getScriptProperties();
  props.setProperty('REPORT_DOC_URL', doc.getUrl());
  props.setProperty('REPORT_DOC_ID', doc.getId());

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  ui.alert(
    '✅ レポート作成完了',
    '処理シート: ' + completedCount + '/' + sheets.length + '\n' +
    '処理時間: ' + elapsedSec + '秒\n' +
    (skippedSheets.length > 0 ? '未処理: ' + skippedSheets.join(', ') + '\n' : '') +
    '\nレポートURL:\n' + doc.getUrl(),
    ui.ButtonSet.OK
  );
}

// ③ 個別シート抽出（アクティブシートのみ）
function extractCurrentSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '個別シート抽出',
    'シート「' + sheet.getName() + '」の詳細データをGoogle Docに出力します。\n続行しますか？',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmmss');
  const docTitle = '【個別分析】' + sheet.getName() + '_' + timestamp;
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  const defaultStyle = {};
  defaultStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Consolas';
  defaultStyle[DocumentApp.Attribute.FONT_SIZE] = 9;
  body.setAttributes(defaultStyle);

  appendH1_(body, '個別シート分析: ' + sheet.getName());
  appendText_(body, [
    '生成日時: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss'),
    'スプレッドシート: ' + ss.getName()
  ].join('\n'));

  try {
    extractOneSheet_(sheet, body, 1);
  } catch (e) {
    appendH2_(body, '❌ エラー');
    appendText_(body, 'エラー: ' + e.message + '\nスタック: ' + e.stack);
  }

  doc.saveAndClose();

  const props = PropertiesService.getScriptProperties();
  props.setProperty('REPORT_DOC_URL', doc.getUrl());
  props.setProperty('REPORT_DOC_ID', doc.getId());

  ui.alert('✅ レポート作成完了\n\n' + doc.getUrl());
}

// ========================================
// シート詳細抽出（メイン処理）
// ========================================

function extractOneSheet_(sheet, body, index) {
  const name = sheet.getName();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  appendH1_(body, '═══ シート ' + index + ': ' + name + ' ═══');

  // ===== 基本情報 =====
  appendH2_(body, '【基本情報】');
  const basicInfo = [
    '表示: ' + (sheet.isSheetHidden() ? '非表示' : '表示'),
    'タブ色: ' + (sheet.getTabColor() || 'なし'),
    'データ最終行: ' + lastRow,
    'データ最終列: ' + lastCol + (lastCol > 0 ? ' (' + colLetter_(lastCol) + '列)' : ''),
    'シート最大行: ' + sheet.getMaxRows(),
    'シート最大列: ' + sheet.getMaxColumns(),
    '固定行: ' + sheet.getFrozenRows(),
    '固定列: ' + sheet.getFrozenColumns()
  ];
  appendText_(body, basicInfo.join('\n'));

  if (lastRow === 0 || lastCol === 0) {
    appendText_(body, '→ データなし（空シート）');
    return;
  }

  const range = sheet.getRange(1, 1, lastRow, lastCol);

  // ===== 非表示の行・列 =====
  appendH2_(body, '【非表示の行・列】');
  const hiddenRows = [];
  for (let r = 1; r <= lastRow; r++) {
    try {
      if (sheet.isRowHiddenByUser(r) || sheet.isRowHiddenByFilter(r)) {
        hiddenRows.push(r);
      }
    } catch (e) {
      // isRowHiddenByFilter may fail if no filter
      try {
        if (sheet.isRowHiddenByUser(r)) hiddenRows.push(r);
      } catch (e2) {}
    }
  }
  const hiddenCols = [];
  for (let c = 1; c <= lastCol; c++) {
    try {
      if (sheet.isColumnHiddenByUser(c)) hiddenCols.push(colLetter_(c));
    } catch (e) {}
  }
  const hiddenInfo = [];
  hiddenInfo.push('非表示行: ' + (hiddenRows.length > 0 ? summarizeNumbers_(hiddenRows) : 'なし'));
  hiddenInfo.push('非表示列: ' + (hiddenCols.length > 0 ? hiddenCols.join(', ') : 'なし'));
  appendText_(body, hiddenInfo.join('\n'));

  // ===== 列幅 =====
  appendH2_(body, '【列幅】');
  const colWidthParts = [];
  for (let c = 1; c <= lastCol; c++) {
    colWidthParts.push(colLetter_(c) + ':' + sheet.getColumnWidth(c) + 'px');
  }
  appendText_(body, colWidthParts.join(' | '));

  // ===== 行高 =====
  appendH2_(body, '【行高】');
  const heightGroups = {};
  for (let r = 1; r <= lastRow; r++) {
    const h = sheet.getRowHeight(r);
    if (!heightGroups[h]) heightGroups[h] = [];
    heightGroups[h].push(r);
  }
  const heightLines = [];
  const heights = Object.keys(heightGroups).sort(function(a, b) { return Number(a) - Number(b); });
  for (let hi = 0; hi < heights.length; hi++) {
    const h = heights[hi];
    heightLines.push(h + 'px: ' + summarizeNumbers_(heightGroups[h]));
  }
  appendText_(body, heightLines.join('\n'));

  // ===== 結合セル =====
  appendH2_(body, '【結合セル】');
  let mergedRanges = [];
  try {
    mergedRanges = range.getMergedRanges();
    if (mergedRanges.length > 0) {
      const mergeLines = mergedRanges.map(function(mr) {
        return mr.getA1Notation() + ' (' + mr.getNumRows() + '行×' + mr.getNumColumns() + '列)';
      });
      appendText_(body, mergeLines.join('\n'));
    } else {
      appendText_(body, 'なし');
    }
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // 結合セルマップ（セルデータ出力時に参照）
  const mergedMap = {};
  mergedRanges.forEach(function(mr) {
    const sRow = mr.getRow();
    const sCol = mr.getColumn();
    const nRows = mr.getNumRows();
    const nCols = mr.getNumColumns();
    for (let r = sRow; r < sRow + nRows; r++) {
      for (let c = sCol; c < sCol + nCols; c++) {
        if (r === sRow && c === sCol) {
          mergedMap[(r - 1) + ',' + (c - 1)] = 'merged-origin:' + mr.getA1Notation();
        } else {
          mergedMap[(r - 1) + ',' + (c - 1)] = 'merged-part:' + mr.getA1Notation();
        }
      }
    }
  });

  // ===== フィルタ =====
  appendH2_(body, '【フィルタ】');
  try {
    const filter = sheet.getFilter();
    if (filter) {
      appendText_(body, 'フィルタ範囲: ' + filter.getRange().getA1Notation());
    } else {
      appendText_(body, 'なし');
    }
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ===== データ入力規則 =====
  appendH2_(body, '【データ入力規則】');
  let validationMap = {};
  try {
    const validations = range.getDataValidations();
    const valLines = [];
    for (let r = 0; r < validations.length; r++) {
      for (let c = 0; c < validations[r].length; c++) {
        const v = validations[r][c];
        if (!v) continue;
        validationMap[r + ',' + c] = true;

        const cellRef = colLetter_(c + 1) + (r + 1);
        const type = v.getCriteriaType().toString();
        let line = cellRef + ': ' + type;

        // 入力規則の値を取得
        try {
          const criteria = v.getCriteriaValues();
          if (criteria && criteria.length > 0) {
            const valStr = criteria.map(function(cv) {
              if (Array.isArray(cv)) return '[' + cv.join(', ') + ']';
              if (cv && typeof cv === 'object' && typeof cv.getA1Notation === 'function') {
                return 'Range:' + cv.getA1Notation();
              }
              if (cv instanceof Date) {
                return Utilities.formatDate(cv, 'Asia/Tokyo', 'yyyy-MM-dd');
              }
              return String(cv);
            }).join(' | ');
            line += ' → ' + valStr;
          }
        } catch (e) {
          line += ' → (値取得エラー)';
        }

        line += ' | 厳格:' + (!v.getAllowInvalid());
        const help = v.getHelpText();
        if (help) line += ' | ヘルプ:"' + help + '"';
        valLines.push(line);
      }
    }
    appendText_(body, valLines.length > 0 ? valLines.join('\n') : 'なし');
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ===== 条件付き書式 =====
  appendH2_(body, '【条件付き書式】');
  try {
    const cfRules = sheet.getConditionalFormatRules();
    if (cfRules.length > 0) {
      const cfLines = [];
      for (let ci = 0; ci < cfRules.length; ci++) {
        const rule = cfRules[ci];
        const ranges = rule.getRanges().map(function(r) { return r.getA1Notation(); }).join(', ');
        let desc = '';

        // Boolean条件
        try {
          const boolCond = rule.getBooleanCondition();
          if (boolCond) {
            desc = 'Boolean: ' + boolCond.getCriteriaType();
            try {
              const cvals = boolCond.getCriteriaValues();
              if (cvals && cvals.length > 0) desc += ' [' + cvals.join(', ') + ']';
            } catch (e) {}
            desc += ' → ';
            try { desc += 'bg:' + (boolCond.getBackground() || '-'); } catch (e) { desc += 'bg:?'; }
            try { desc += ', font:' + (boolCond.getFontColor() || '-'); } catch (e) { desc += ', font:?'; }
            try { if (boolCond.getBold()) desc += ', bold'; } catch (e) {}
            try { if (boolCond.getItalic()) desc += ', italic'; } catch (e) {}
            try { if (boolCond.getStrikethrough()) desc += ', strikethrough'; } catch (e) {}
          }
        } catch (e) {}

        // グラデーション条件
        try {
          const gradCond = rule.getGradientCondition();
          if (gradCond) {
            desc = 'Gradient: ';
            try {
              const minType = gradCond.getMinType();
              const midType = gradCond.getMidType();
              const maxType = gradCond.getMaxType();
              desc += 'min(' + minType + '=' + gradCond.getMinValue() + ',';
              desc += gradCond.getMinColorObject().asRgbColor().asHexString() + ')';
              if (midType) {
                desc += ' mid(' + midType + '=' + gradCond.getMidValue() + ',';
                desc += gradCond.getMidColorObject().asRgbColor().asHexString() + ')';
              }
              desc += ' max(' + maxType + '=' + gradCond.getMaxValue() + ',';
              desc += gradCond.getMaxColorObject().asRgbColor().asHexString() + ')';
            } catch (e) {
              desc += '(詳細取得エラー: ' + e.message + ')';
            }
          }
        } catch (e) {}

        cfLines.push((ci + 1) + '. 範囲: ' + ranges + ' | ' + desc);
      }
      appendText_(body, cfLines.join('\n'));
    } else {
      appendText_(body, 'なし');
    }
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ===== チャート =====
  appendH2_(body, '【チャート】');
  try {
    const charts = sheet.getCharts();
    if (charts.length > 0) {
      const chartLines = charts.map(function(chart, i) {
        let info = (i + 1) + '. タイプ: ' + chart.getChartType();
        try {
          const ranges = chart.getRanges();
          if (ranges.length > 0) {
            info += ' | データ範囲: ' + ranges.map(function(r) { return r.getA1Notation(); }).join(', ');
          }
        } catch (e) {}
        return info;
      });
      appendText_(body, chartLines.join('\n'));
    } else {
      appendText_(body, 'なし');
    }
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ===== 保護範囲 =====
  appendH2_(body, '【保護範囲】');
  try {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    const sheetProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    const allProt = [];
    sheetProtections.forEach(function(p, i) {
      allProt.push('シート保護: ' + (p.getDescription() || '説明なし'));
    });
    protections.forEach(function(p, i) {
      allProt.push('範囲保護: ' + p.getRange().getA1Notation() + ' | ' + (p.getDescription() || '説明なし'));
    });
    appendText_(body, allProt.length > 0 ? allProt.join('\n') : 'なし');
  } catch (e) {
    appendText_(body, '取得エラー: ' + e.message);
  }

  // ===== セルデータ（バッチ取得） =====
  appendH2_(body, '【セルデータ】 範囲: A1:' + colLetter_(lastCol) + lastRow);

  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  const formulas = range.getFormulas();
  const backgrounds = range.getBackgrounds();
  const fontColors = range.getFontColors();
  const fontFamilies = range.getFontFamilies();
  const fontSizes = range.getFontSizes();
  const fontWeights = range.getFontWeights();
  const fontStyles = range.getFontStyles();
  const hAligns = range.getHorizontalAlignments();
  const vAligns = range.getVerticalAlignments();
  const numberFormats = range.getNumberFormats();
  const notes = range.getNotes();

  let wrapStrategies = null;
  try {
    wrapStrategies = range.getWrapStrategies();
  } catch (e) {
    // fallback: getWraps()
    try {
      wrapStrategies = range.getWraps();
    } catch (e2) {}
  }

  // 行ごとに出力（バッファリング）
  const FLUSH_INTERVAL = 30; // 30行ごとにDocに書き込み
  let buffer = '';

  for (let r = 0; r < lastRow; r++) {
    let rowLines = [];
    let rowHasContent = false;

    for (let c = 0; c < lastCol; c++) {
      const val = values[r][c];
      const dispVal = displayValues[r][c];
      const formula = formulas[r][c];
      const bg = backgrounds[r][c];
      const fc = fontColors[r][c];
      const ff = fontFamilies[r][c];
      const fs = fontSizes[r][c];
      const fw = fontWeights[r][c];
      const fst = fontStyles[r][c];
      const ha = hAligns[r][c];
      const va = vAligns[r][c];
      const nf = numberFormats[r][c];
      const note = notes[r][c];
      const ws = wrapStrategies ? wrapStrategies[r][c] : null;
      const hasValidation = validationMap[r + ',' + c];
      const mergeInfo = mergedMap[r + ',' + c];

      // 空セル+完全デフォルト書式 → スキップ
      const isEmpty = (val === '' || val === null || val === undefined);
      const isDefaultBg = (bg === '#ffffff' || bg === '#fff' || bg === 'white');
      const isDefaultFc = (fc === '#000000' || fc === '#000' || fc === 'black');
      const isDefaultFont = isDefaultFc &&
        (ff === 'Arial' || ff === 'arial') &&
        fs === 10 && fw === 'normal' && fst === 'normal';
      const isDefaultAlign = true; // 配置は常に出力（判定が複雑なため）
      const noSpecial = !formula && !note && !hasValidation && !mergeInfo;
      const isDefaultWrap = (ws === null || ws === false || ws === 'OVERFLOW' || ws === SpreadsheetApp.WrapStrategy.OVERFLOW);
      const isDefaultNf = (!nf || nf === '' || nf === '0.###############');

      if (isEmpty && isDefaultBg && isDefaultFont && noSpecial && isDefaultWrap && isDefaultNf) {
        continue;
      }

      rowHasContent = true;
      const cellRef = colLetter_(c + 1) + (r + 1);
      let parts = [cellRef + ':'];

      // --- 値 ---
      if (formula) {
        parts.push('数式=' + formula);
        if (dispVal) parts.push('表示="' + safeStr_(dispVal) + '"');
      } else if (val instanceof Date) {
        parts.push('"' + Utilities.formatDate(val, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss') + '"');
        if (dispVal && dispVal !== parts[parts.length - 1]) parts.push('表示="' + safeStr_(dispVal) + '"');
      } else if (typeof val === 'number') {
        parts.push(String(val));
        if (dispVal !== String(val)) parts.push('表示="' + safeStr_(dispVal) + '"');
      } else if (typeof val === 'boolean') {
        parts.push(String(val).toUpperCase());
      } else {
        parts.push('"' + safeStr_(String(val)) + '"');
      }

      // --- 書式（デフォルトと異なるもののみ） ---
      if (!isDefaultBg) parts.push('bg:' + bg);
      if (!isDefaultFc) parts.push('色:' + fc);
      if (ff !== 'Arial' && ff !== 'arial') parts.push('font:' + ff);
      if (fs !== 10) parts.push('size:' + fs);
      if (fw !== 'normal') parts.push(fw);
      if (fst !== 'normal') parts.push(fst);
      if (ha && ha !== 'general') parts.push('h:' + ha);
      if (va && va !== 'bottom') parts.push('v:' + va);
      if (!isDefaultWrap) parts.push('wrap:' + ws);
      if (!isDefaultNf) parts.push('nf:"' + nf + '"');

      // --- 特殊属性 ---
      if (note) parts.push('note:"' + safeStr_(note) + '"');
      if (hasValidation) parts.push('★入力規則');
      if (mergeInfo) parts.push('★' + mergeInfo);

      rowLines.push(parts.join(' | '));
    }

    if (rowHasContent) {
      buffer += '--- 行' + (r + 1) + ' ---\n' + rowLines.join('\n') + '\n\n';
    }

    // バッファフラッシュ
    if ((r + 1) % FLUSH_INTERVAL === 0 || r === lastRow - 1) {
      if (buffer) {
        appendText_(body, buffer);
        buffer = '';
      }
    }
  }

  appendText_(body, '═══ シート ' + index + ' 終了 ═══');
}

// ========================================
// ④ レポートURL表示
// ========================================

function showReportUrl() {
  const url = PropertiesService.getScriptProperties().getProperty('REPORT_DOC_URL');
  if (url) {
    const html = HtmlService.createHtmlOutput(
      '<p style="font-family:Arial; font-size:14px;">レポートURL:</p>' +
      '<p><a href="' + url + '" target="_blank" style="font-size:13px;">' + url + '</a></p>' +
      '<p style="margin-top:16px;"><button onclick="google.script.host.close()" ' +
      'style="padding:8px 24px; font-size:13px; cursor:pointer;">閉じる</button></p>'
    ).setWidth(550).setHeight(160);
    SpreadsheetApp.getUi().showModalDialog(html, '④ レポートURL');
  } else {
    SpreadsheetApp.getUi().alert('レポートが見つかりません。\n先に「③ 全シート詳細抽出」を実行してください。');
  }
}

// ========================================
// ユーティリティ
// ========================================

/** 列番号 → 列文字（1→A, 27→AA） */
function colLetter_(col) {
  let letter = '';
  while (col > 0) {
    col--;
    letter = String.fromCharCode(65 + (col % 26)) + letter;
    col = Math.floor(col / 26);
  }
  return letter;
}

/** HTML特殊文字エスケープ */
function escapeHtml_(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 文字列の安全化（改行エスケープ、長さ制限） */
function safeStr_(str) {
  if (!str) return '';
  let s = String(str).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  if (s.length > 500) s = s.substring(0, 500) + '...(以下省略、全' + str.length + '文字)';
  return s;
}

/** 数値配列を連番でまとめて表示（例: 行1~5, 行8, 行10~15） */
function summarizeNumbers_(nums) {
  if (!nums || nums.length === 0) return 'なし';
  if (nums.length <= 5) return '行' + nums.join(', ');

  nums.sort(function(a, b) { return a - b; });
  const ranges = [];
  let start = nums[0];
  let end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) {
      end = nums[i];
    } else {
      ranges.push(start === end ? '行' + start : '行' + start + '~' + end);
      start = nums[i];
      end = nums[i];
    }
  }
  ranges.push(start === end ? '行' + start : '行' + start + '~' + end);
  return ranges.join(', ') + ' (計' + nums.length + '行)';
}

/** Doc見出しH1 */
function appendH1_(body, text) {
  body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING1);
}

/** Doc見出しH2 */
function appendH2_(body, text) {
  body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING2);
}

/** Docテキスト追加（長文分割対応） */
function appendText_(body, text) {
  if (!text) return;
  const MAX_PARA_LEN = 40000;
  if (text.length <= MAX_PARA_LEN) {
    body.appendParagraph(text);
    return;
  }
  // 改行位置で分割
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_PARA_LEN) {
      body.appendParagraph(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf('\n', MAX_PARA_LEN);
    if (splitAt === -1 || splitAt === 0) splitAt = MAX_PARA_LEN;
    body.appendParagraph(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt + 1);
  }
}
