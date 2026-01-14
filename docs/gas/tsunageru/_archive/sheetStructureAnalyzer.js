/**
 * シート構造分析ツール
 *
 * 既存シートと新テンプレートの構造を比較し、
 * 行番号のずれを正確に把握するためのツール
 */

// ===== メニュー追加 =====
function addStructureAnalyzerMenu(ui) {
  ui.createMenu('🔍 構造分析')
    .addItem('📊 現在のシートを分析', 'analyzeCurrentSheet')
    .addItem('📊 全シートを分析', 'analyzeAllSheets')
    .addSeparator()
    .addItem('🔎 キーセルの位置を確認', 'findKeyCells')
    .addItem('📋 MAPPING検証レポート', 'generateMappingReport')
    .addToUi();
}

// ===== 1. 現在のシートを分析 =====
function analyzeCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const result = analyzeSheetStructure(sheet);

  // 結果をダイアログで表示
  const html = HtmlService.createHtmlOutput(createAnalysisHtml(result))
    .setWidth(800)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, '構造分析: ' + sheet.getName());
}

// ===== 2. 全シートを分析 =====
function analyzeAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const results = [];

  const excludeSheets = ['設定', 'プロンプト', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', '進捗管理'];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (excludeSheets.includes(name) || name.startsWith('_')) continue;

    const result = analyzeSheetStructure(sheet);
    results.push(result);
  }

  // 結果をダイアログで表示
  const html = HtmlService.createHtmlOutput(createAllSheetsAnalysisHtml(results))
    .setWidth(900)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, '全シート構造分析');
}

// ===== 3. シート構造を分析 =====
function analyzeSheetStructure(sheet) {
  const sheetName = sheet.getName();
  const result = {
    sheetName: sheetName,
    totalRows: sheet.getLastRow(),
    structure: [],
    keyFindings: {},
    structureType: 'unknown' // 'legacy', 'new_template', 'hybrid', 'unknown'
  };

  // 最初の20行を詳細分析
  const maxRow = Math.min(20, sheet.getLastRow());
  for (let row = 1; row <= maxRow; row++) {
    const rowData = analyzeRow(sheet, row);
    result.structure.push(rowData);
  }

  // キーセルの位置を特定
  result.keyFindings = findKeyPositions(sheet);

  // 構造タイプを判定
  result.structureType = determineStructureType(result);

  return result;
}

// ===== 4. 行を分析 =====
function analyzeRow(sheet, rowNum) {
  const range = sheet.getRange(rowNum, 1, 1, 8);
  const values = range.getValues()[0];
  const backgrounds = range.getBackgrounds()[0];

  // 各列の値を取得（A〜H列）
  const cells = {
    A: String(values[0] || '').trim(),
    B: String(values[1] || '').trim(),
    C: String(values[2] || '').trim(),
    D: String(values[3] || '').trim(),
    E: String(values[4] || '').trim(),
    F: String(values[5] || '').trim(),
    G: String(values[6] || '').trim(),
    H: String(values[7] || '').trim()
  };

  const cellA = cells.A;
  const cellB = cells.B;
  const cellC = cells.C;

  // 行タイプを判定
  let rowType = 'data';
  let description = '';

  if (cellA.includes('ヒアリングシート') || cellA.includes('原稿')) {
    rowType = 'title';
    description = 'タイトル行';
  } else if (cellA.includes('黄色') || cellA.includes('青色') || cellA.includes('🟨') || cellA.includes('🟦')) {
    rowType = 'legend';
    description = '凡例行';
  } else if (cellA.includes('現在タスク')) {
    rowType = 'status_header';
    description = 'ステータスヘッダー';
  } else if (cellA.match(/^\d+\./)) {
    rowType = 'status_value';
    description = 'ステータス入力';
  } else if (cellA.includes('Part①') || cellA.includes('Part②') || cellA.includes('Part③')) {
    rowType = 'part_header';
    description = cellA.substring(0, 30);
  } else if (cellA.startsWith('▼')) {
    rowType = 'section_header';
    description = cellA;
  } else if (cellB === '企業名' || cellB === '代表者' || cellB === '住所' || cellB === '連絡先') {
    rowType = 'data_row';
    description = cellB;
  } else if (cellA !== '' || cellB !== '' || cellC !== '') {
    rowType = 'data_row';
    description = cellA || cellB || '(データ)';
  } else if (values.every(v => v === '')) {
    rowType = 'empty';
    description = '空行';
  } else {
    rowType = 'other';
    description = cellA.substring(0, 30) || '(その他)';
  }

  return {
    row: rowNum,
    type: rowType,
    description: description,
    cells: cells,
    cellA: cellA.substring(0, 25),
    cellB: cellB.substring(0, 25),
    cellC: cellC.substring(0, 25),
    cellD: cells.D.substring(0, 25),
    cellE: cells.E.substring(0, 25),
    cellF: cells.F.substring(0, 25),
    cellG: cells.G.substring(0, 25),
    bgA: backgrounds[0],
    isEmpty: values.every(v => v === '')
  };
}

// ===== 5. キーポジションを特定 =====
function findKeyPositions(sheet) {
  const findings = {
    titleRow: null,
    legendRow: null,
    statusHeaderRow: null,
    statusValueRow: null,
    part1Row: null,
    companyNameLabelRow: null,
    companyNameDataRow: null,
    part2Row: null,
    part3Row: null
  };

  const maxRow = Math.min(150, sheet.getLastRow());

  for (let row = 1; row <= maxRow; row++) {
    const cellA = String(sheet.getRange(row, 1).getValue() || '').trim();
    const cellC = String(sheet.getRange(row, 3).getValue() || '').trim();

    // タイトル行
    if (findings.titleRow === null && (cellA.includes('ヒアリングシート') || cellA.includes('原稿'))) {
      findings.titleRow = row;
    }

    // 凡例行
    if (findings.legendRow === null && (cellA.includes('黄色') || cellA.includes('🟨'))) {
      findings.legendRow = row;
    }

    // ステータスヘッダー
    if (findings.statusHeaderRow === null && cellA.includes('現在タスク')) {
      findings.statusHeaderRow = row;
    }

    // ステータス入力（ステータスヘッダーの次の行をチェック）
    if (findings.statusValueRow === null && cellA.match(/^\d+\./)) {
      findings.statusValueRow = row;
    }

    // Part①
    if (findings.part1Row === null && cellA.includes('Part①')) {
      findings.part1Row = row;
    }

    // 企業名ラベル（A列に「企業名」）
    if (findings.companyNameLabelRow === null && cellA === '企業名') {
      findings.companyNameLabelRow = row;
    }

    // 企業名データ（C列にデータがある企業名行）
    if (findings.companyNameDataRow === null && cellA === '企業名' && cellC !== '') {
      findings.companyNameDataRow = row;
    }

    // Part②
    if (findings.part2Row === null && cellA.includes('Part②')) {
      findings.part2Row = row;
    }

    // Part③
    if (findings.part3Row === null && cellA.includes('Part③')) {
      findings.part3Row = row;
    }
  }

  // 企業名のデータ位置も確認（ラベル行のC列）
  if (findings.companyNameLabelRow) {
    const dataValue = sheet.getRange(findings.companyNameLabelRow, 3).getValue();
    findings.companyNameValue = String(dataValue || '').substring(0, 30);
  }

  return findings;
}

// ===== 6. 構造タイプを判定 =====
function determineStructureType(result) {
  const findings = result.keyFindings;

  // ステータス欄があるか
  const hasStatusSection = findings.statusHeaderRow !== null;

  // 凡例行があるか
  const hasLegend = findings.legendRow !== null;

  if (hasStatusSection && !hasLegend) {
    return 'new_template'; // 新テンプレート（ステータスあり、凡例なし）
  } else if (!hasStatusSection && hasLegend) {
    return 'legacy'; // 旧構造（凡例あり、ステータスなし）
  } else if (hasStatusSection && hasLegend) {
    return 'hybrid'; // 混在（両方ある）
  } else {
    return 'unknown'; // 判定不能
  }
}

// ===== 7. キーセル位置確認 =====
function findKeyCells() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const findings = findKeyPositions(sheet);

  let message = `【${sheet.getName()}】キーセルの位置\n\n`;
  message += `タイトル行: ${findings.titleRow || '見つからず'}\n`;
  message += `凡例行: ${findings.legendRow || 'なし'}\n`;
  message += `ステータスヘッダー: ${findings.statusHeaderRow || 'なし'}\n`;
  message += `ステータス入力: ${findings.statusValueRow || 'なし'}\n`;
  message += `Part①ヘッダー: ${findings.part1Row || '見つからず'}\n`;
  message += `企業名ラベル行: ${findings.companyNameLabelRow || '見つからず'}\n`;
  message += `Part②ヘッダー: ${findings.part2Row || '見つからず'}\n`;
  message += `Part③ヘッダー: ${findings.part3Row || '見つからず'}\n`;
  message += `\n企業名の値: ${findings.companyNameValue || '(空)'}\n`;

  // MAPPING比較
  const expectedRow = 6; // 新MAPPINGの企業名行
  const actualRow = findings.companyNameLabelRow;

  message += `\n--- MAPPING検証 ---\n`;
  message += `新MAPPING期待値: 行${expectedRow}\n`;
  message += `実際の位置: 行${actualRow}\n`;
  message += `差分: ${actualRow ? (actualRow - expectedRow) : 'N/A'}行\n`;

  SpreadsheetApp.getUi().alert(message);
}

// ===== 8. MAPPINGレポート生成 =====
function generateMappingReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const excludeSheets = ['設定', 'プロンプト', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', '進捗管理', 'ヒアリングシート', 'テンプレート'];

  const report = [];

  // 期待される行番号（新MAPPING）
  const expectedPositions = {
    companyName: 6,
    part1: 4,
    part2: 82, // 推定値
  };

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (excludeSheets.includes(name) || name.startsWith('_')) continue;

    const findings = findKeyPositions(sheet);
    const structureType = determineStructureType({ keyFindings: findings });

    report.push({
      sheetName: name,
      structureType: structureType,
      hasLegend: findings.legendRow !== null,
      hasStatus: findings.statusHeaderRow !== null,
      companyNameRow: findings.companyNameLabelRow,
      part1Row: findings.part1Row,
      expectedCompanyRow: expectedPositions.companyName,
      rowDiff: findings.companyNameLabelRow ? (findings.companyNameLabelRow - expectedPositions.companyName) : null
    });
  }

  // HTML表示
  const html = HtmlService.createHtmlOutput(createMappingReportHtml(report))
    .setWidth(900)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'MAPPING検証レポート');
}

// ===== HTML生成関数 =====

function createAnalysisHtml(result) {
  const typeLabels = {
    'new_template': '🆕 新テンプレート（ステータスあり）',
    'legacy': '📜 旧構造（凡例行あり）',
    'hybrid': '⚠️ 混在（両方あり）',
    'unknown': '❓ 判定不能'
  };

  const typeColors = {
    'new_template': '#4CAF50',
    'legacy': '#FF9800',
    'hybrid': '#F44336',
    'unknown': '#9E9E9E'
  };

  let html = `
    <style>
      body { font-family: sans-serif; padding: 16px; font-size: 13px; }
      h2 { margin-top: 0; }
      .type-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        background: ${typeColors[result.structureType]};
      }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; }
      .row-title { background: #E3F2FD; }
      .row-legend { background: #FFF9C4; }
      .row-status_header { background: #C8E6C9; }
      .row-status_value { background: #DCEDC8; }
      .row-part_header { background: #BBDEFB; }
      .row-section_header { background: #E1F5FE; }
      .row-empty { background: #FAFAFA; color: #999; }
      .key-findings { margin-top: 20px; }
      .key-findings table { width: auto; }
      .key-findings td { min-width: 100px; }
      .highlight { background: #FFEB3B; font-weight: bold; }
    </style>
    <h2>${result.sheetName}</h2>
    <p><span class="type-badge">${typeLabels[result.structureType]}</span></p>

    <h3>キーポジション</h3>
    <div class="key-findings">
      <table>
        <tr><td>タイトル行</td><td><strong>${result.keyFindings.titleRow || '-'}</strong></td></tr>
        <tr><td>凡例行</td><td><strong>${result.keyFindings.legendRow || 'なし'}</strong></td></tr>
        <tr><td>ステータスヘッダー</td><td><strong>${result.keyFindings.statusHeaderRow || 'なし'}</strong></td></tr>
        <tr><td>ステータス入力</td><td><strong>${result.keyFindings.statusValueRow || 'なし'}</strong></td></tr>
        <tr><td>Part①ヘッダー</td><td><strong>${result.keyFindings.part1Row || '-'}</strong></td></tr>
        <tr class="highlight"><td>企業名ラベル行</td><td><strong>${result.keyFindings.companyNameLabelRow || '-'}</strong></td></tr>
        <tr><td>Part②ヘッダー</td><td><strong>${result.keyFindings.part2Row || '-'}</strong></td></tr>
        <tr><td>Part③ヘッダー</td><td><strong>${result.keyFindings.part3Row || '-'}</strong></td></tr>
      </table>
    </div>

    <h3>先頭20行の詳細（A〜G列）</h3>
    <table>
      <tr>
        <th>行</th>
        <th>タイプ</th>
        <th>A列</th>
        <th>B列</th>
        <th>C列</th>
        <th>D列</th>
        <th>E列</th>
        <th>F列</th>
        <th>G列</th>
      </tr>
  `;

  for (const row of result.structure) {
    html += `
      <tr class="row-${row.type}">
        <td>${row.row}</td>
        <td>${row.type}</td>
        <td>${escapeHtml(row.cellA)}</td>
        <td>${escapeHtml(row.cellB)}</td>
        <td>${escapeHtml(row.cellC)}</td>
        <td>${escapeHtml(row.cellD)}</td>
        <td>${escapeHtml(row.cellE)}</td>
        <td>${escapeHtml(row.cellF)}</td>
        <td>${escapeHtml(row.cellG)}</td>
      </tr>
    `;
  }

  html += `</table>`;
  return html;
}

function createAllSheetsAnalysisHtml(results) {
  const typeLabels = {
    'new_template': '🆕 新',
    'legacy': '📜 旧',
    'hybrid': '⚠️ 混在',
    'unknown': '❓'
  };

  let html = `
    <style>
      body { font-family: sans-serif; padding: 16px; font-size: 13px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background: #4A90D9; color: white; }
      .type-new { background: #C8E6C9; }
      .type-legacy { background: #FFE0B2; }
      .type-hybrid { background: #FFCDD2; }
      .type-unknown { background: #EEEEEE; }
      .mismatch { background: #FFCDD2 !important; font-weight: bold; }
      .match { background: #C8E6C9; }
      .summary { margin-bottom: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
    </style>

    <div class="summary">
      <h3>サマリー</h3>
      <p>新テンプレート: ${results.filter(r => r.structureType === 'new_template').length}件</p>
      <p>旧構造: ${results.filter(r => r.structureType === 'legacy').length}件</p>
      <p>混在: ${results.filter(r => r.structureType === 'hybrid').length}件</p>
      <p>不明: ${results.filter(r => r.structureType === 'unknown').length}件</p>
    </div>

    <table>
      <tr>
        <th>シート名</th>
        <th>構造タイプ</th>
        <th>凡例行</th>
        <th>ステータス</th>
        <th>Part①行</th>
        <th>企業名行</th>
        <th>期待値(6)</th>
        <th>差分</th>
      </tr>
  `;

  for (const r of results) {
    const rowDiff = r.keyFindings.companyNameLabelRow ? (r.keyFindings.companyNameLabelRow - 6) : null;
    const diffClass = rowDiff === 0 ? 'match' : (rowDiff !== null ? 'mismatch' : '');

    html += `
      <tr class="type-${r.structureType}">
        <td style="text-align: left;">${r.sheetName}</td>
        <td>${typeLabels[r.structureType]}</td>
        <td>${r.keyFindings.legendRow || '-'}</td>
        <td>${r.keyFindings.statusHeaderRow || '-'}</td>
        <td>${r.keyFindings.part1Row || '-'}</td>
        <td>${r.keyFindings.companyNameLabelRow || '-'}</td>
        <td>6</td>
        <td class="${diffClass}">${rowDiff !== null ? (rowDiff >= 0 ? '+' : '') + rowDiff : '-'}</td>
      </tr>
    `;
  }

  html += `</table>`;
  return html;
}

function createMappingReportHtml(report) {
  let html = `
    <style>
      body { font-family: sans-serif; padding: 16px; font-size: 13px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background: #4A90D9; color: white; }
      .mismatch { background: #FFCDD2; font-weight: bold; }
      .match { background: #C8E6C9; }
      .warning { background: #FFF9C4; }
      h3 { margin-top: 24px; }
      .legend { margin: 16px 0; padding: 12px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <h2>MAPPING検証レポート</h2>

    <div class="legend">
      <strong>凡例:</strong><br>
      <span class="match" style="padding: 2px 8px;">緑</span> = 新MAPPINGと一致（企業名=行6）<br>
      <span class="mismatch" style="padding: 2px 8px;">赤</span> = 新MAPPINGと不一致（行番号がずれている）<br>
      <span class="warning" style="padding: 2px 8px;">黄</span> = 旧構造（ステータス欄なし）
    </div>

    <table>
      <tr>
        <th>シート名</th>
        <th>構造</th>
        <th>凡例</th>
        <th>ステータス</th>
        <th>企業名行</th>
        <th>期待値</th>
        <th>差分</th>
        <th>判定</th>
      </tr>
  `;

  for (const r of report) {
    const diff = r.rowDiff;
    let judgement = '';
    let rowClass = '';

    if (diff === 0) {
      judgement = '✅ OK';
      rowClass = 'match';
    } else if (diff === -1 && !r.hasStatus) {
      judgement = '⚠️ 旧構造';
      rowClass = 'warning';
    } else if (diff !== null) {
      judgement = '❌ ずれ';
      rowClass = 'mismatch';
    } else {
      judgement = '❓ 不明';
    }

    html += `
      <tr>
        <td style="text-align: left;">${r.sheetName}</td>
        <td>${r.structureType}</td>
        <td>${r.hasLegend ? '有' : '-'}</td>
        <td>${r.hasStatus ? '有' : '-'}</td>
        <td>${r.companyNameRow || '-'}</td>
        <td>6</td>
        <td class="${rowClass}">${diff !== null ? (diff >= 0 ? '+' : '') + diff : '-'}</td>
        <td>${judgement}</td>
      </tr>
    `;
  }

  html += `
    </table>

    <h3>結論</h3>
    <p>
      ・差分が <strong>0</strong> → 新MAPPING（row+1）で正しく動作<br>
      ・差分が <strong>-1</strong> かつ旧構造 → 旧MAPPING（元の行番号）が必要<br>
      ・差分がそれ以外 → シート構造が想定外
    </p>
  `;

  return html;
}

// HTML エスケープ
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== コンソール出力版（デバッグ用） =====
function logSheetStructure() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const result = analyzeSheetStructure(sheet);

  console.log('=== シート構造分析 ===');
  console.log('シート名:', result.sheetName);
  console.log('構造タイプ:', result.structureType);
  console.log('');
  console.log('=== キーポジション ===');
  console.log(JSON.stringify(result.keyFindings, null, 2));
  console.log('');
  console.log('=== 先頭20行 ===');
  for (const row of result.structure) {
    console.log(`行${row.row}: [${row.type}] ${row.description} | A="${row.cellA}" C="${row.cellC}"`);
  }
}
