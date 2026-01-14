/**
 * シート構造ダンプツール
 *
 * 仮説や判定なし。ただ事実を出力する。
 * - 各セルの値
 * - セルの結合情報
 * - 列幅
 * - 行高さ
 * - データ入力規則（ドロップダウンリスト）
 * - 背景色
 */

// ===== メニュー =====
function addDumperMenu(ui) {
  ui.createMenu('📤 ダンプ')
    .addItem('📋 現在のシートをダンプ', 'dumpCurrentSheet')
    .addItem('📊 列幅一覧', 'dumpColumnWidths')
    .addItem('📊 ドロップダウン一覧', 'dumpAllValidations')
    .addToUi();
}

// ===== 現在のシートをダンプ =====
function dumpCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = Math.min(sheet.getLastRow(), 200);
  dumpSheetRange(1, lastRow);
}

// ===== メイン: 範囲をダンプ =====
function dumpSheetRange(startRow, endRow) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  const maxCol = 8; // A-H列
  const numRows = endRow - startRow + 1;

  const dump = {
    sheetName: sheetName,
    range: `${startRow}-${endRow}行`,
    columnWidths: {},
    rows: []
  };

  // 列幅を取得（A-H列）
  for (let col = 1; col <= maxCol; col++) {
    const colLetter = String.fromCharCode(64 + col);
    dump.columnWidths[colLetter] = sheet.getColumnWidth(col);
  }

  // 範囲全体を一括取得
  const range = sheet.getRange(startRow, 1, numRows, maxCol);
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  const backgrounds = range.getBackgrounds();

  // 各行のデータを処理
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const rowData = {
      row: row,
      cells: []
    };

    for (let col = 0; col < maxCol; col++) {
      const colLetter = String.fromCharCode(65 + col);

      const cellData = {
        col: colLetter,
        value: values[i][col],
        displayValue: displayValues[i][col],
        background: backgrounds[i][col],
        validation: null
      };

      rowData.cells.push(cellData);
    }

    dump.rows.push(rowData);
  }

  // HTML表示
  const html = HtmlService.createHtmlOutput(createDumpHtml(dump))
    .setWidth(1200)
    .setHeight(800);

  SpreadsheetApp.getUi().showModalDialog(html, `ダンプ: ${sheetName} (${startRow}-${endRow}行)`);
}

// ===== 列幅一覧 =====
function dumpColumnWidths() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const maxCol = 10;

  let message = `【${sheet.getName()}】列幅一覧\n\n`;

  for (let col = 1; col <= maxCol; col++) {
    const colLetter = String.fromCharCode(64 + col);
    const width = sheet.getColumnWidth(col);
    message += `${colLetter}列: ${width}px\n`;
  }

  SpreadsheetApp.getUi().alert(message);
}

// ===== ドロップダウン一覧 =====
function dumpAllValidations() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = Math.min(sheet.getLastRow(), 150);
  const maxCol = 8;

  const validations = [];

  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= maxCol; col++) {
      const cell = sheet.getRange(row, col);
      const rule = cell.getDataValidation();

      if (rule) {
        const colLetter = String.fromCharCode(64 + col);
        const criteria = rule.getCriteriaType();

        const validationInfo = {
          cell: `${colLetter}${row}`,
          row: row,
          col: colLetter,
          type: criteria.toString(),
          list: null
        };

        if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
          const values = rule.getCriteriaValues();
          if (values && values[0]) {
            validationInfo.list = values[0];
          }
        }

        validations.push(validationInfo);
      }
    }
  }

  // HTML表示
  const html = HtmlService.createHtmlOutput(createValidationsHtml(validations, sheet.getName()))
    .setWidth(900)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, `ドロップダウン一覧: ${sheet.getName()}`);
}

// ===== HTML生成: ダンプ =====
function createDumpHtml(dump) {
  let html = `
    <style>
      body { font-family: monospace; padding: 12px; font-size: 12px; }
      h2 { margin-top: 0; font-family: sans-serif; }
      .info { background: #f5f5f5; padding: 8px; margin-bottom: 12px; border-radius: 4px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; vertical-align: top; }
      th { background: #4A90D9; color: white; font-size: 11px; }
      .row-header { background: #E3F2FD; font-weight: bold; text-align: center; }
      .merged { background: #FFF9C4; }
      .has-validation { background: #C8E6C9; }
      .empty { color: #999; }
      .value { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .validation-badge { font-size: 10px; color: #2E7D32; }
      .merge-badge { font-size: 10px; color: #F57C00; }
      pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
    </style>

    <h2>${dump.sheetName}</h2>

    <div class="info">
      <strong>範囲:</strong> ${dump.range}<br>
      <strong>列幅:</strong>
      ${Object.entries(dump.columnWidths).map(([col, width]) => `${col}=${width}px`).join(', ')}
    </div>

    <table>
      <tr>
        <th>行</th>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
        <th>E</th>
        <th>F</th>
        <th>G</th>
        <th>H</th>
      </tr>
  `;

  for (const row of dump.rows) {
    html += `<tr>`;
    html += `<td class="row-header">${row.row}</td>`;

    for (const cell of row.cells) {
      let cellClass = '';
      if (cell.isMerged) cellClass += ' merged';
      if (cell.validation) cellClass += ' has-validation';
      if (cell.value === '' || cell.value === null) cellClass += ' empty';

      let content = '';

      // 値
      const displayVal = cell.displayValue || cell.value;
      if (displayVal !== '' && displayVal !== null) {
        content += `<div class="value" title="${escapeHtml(String(displayVal))}">${escapeHtml(String(displayVal).substring(0, 30))}</div>`;
      } else {
        content += `<div class="empty">(空)</div>`;
      }

      // 結合情報
      if (cell.mergeInfo) {
        content += `<div class="merge-badge">結合: ${cell.mergeInfo}</div>`;
      }

      // ドロップダウン
      if (cell.validation) {
        content += `<div class="validation-badge">`;
        if (cell.validation.list) {
          const listPreview = cell.validation.list.slice(0, 3).join(', ');
          const more = cell.validation.list.length > 3 ? `... (${cell.validation.list.length}件)` : '';
          content += `DD: ${listPreview}${more}`;
        } else {
          content += `検証: ${cell.validation.type}`;
        }
        content += `</div>`;
      }

      // 背景色（白以外）
      if (cell.background && cell.background !== '#ffffff') {
        content += `<div style="font-size:10px;color:#666;">bg: ${cell.background}</div>`;
      }

      html += `<td class="${cellClass}">${content}</td>`;
    }

    html += `</tr>`;
  }

  html += `</table>`;

  return html;
}

// ===== HTML生成: ドロップダウン一覧 =====
function createValidationsHtml(validations, sheetName) {
  let html = `
    <style>
      body { font-family: sans-serif; padding: 16px; font-size: 13px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #4A90D9; color: white; }
      .list { font-size: 11px; color: #666; max-width: 400px; }
    </style>

    <h2>ドロップダウン一覧: ${sheetName}</h2>
    <p>合計: ${validations.length}件</p>

    <table>
      <tr>
        <th>セル</th>
        <th>行</th>
        <th>列</th>
        <th>タイプ</th>
        <th>リスト内容</th>
      </tr>
  `;

  for (const v of validations) {
    html += `
      <tr>
        <td>${v.cell}</td>
        <td>${v.row}</td>
        <td>${v.col}</td>
        <td>${v.type}</td>
        <td class="list">${v.list ? v.list.join(', ') : '-'}</td>
      </tr>
    `;
  }

  html += `</table>`;

  return html;
}

// ===== HTMLエスケープ =====
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== コンソール出力版 =====
function logSheetDump() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const startRow = 35;
  const endRow = 50;
  const maxCol = 8;

  console.log('=== シートダンプ ===');
  console.log('シート:', sheet.getName());
  console.log('範囲:', startRow, '-', endRow);
  console.log('');

  // 列幅
  console.log('=== 列幅 ===');
  for (let col = 1; col <= maxCol; col++) {
    const colLetter = String.fromCharCode(64 + col);
    console.log(colLetter + '列:', sheet.getColumnWidth(col) + 'px');
  }
  console.log('');

  // 各行
  for (let row = startRow; row <= endRow; row++) {
    console.log(`--- 行${row} (高さ: ${sheet.getRowHeight(row)}px) ---`);

    for (let col = 1; col <= maxCol; col++) {
      const cell = sheet.getRange(row, col);
      const colLetter = String.fromCharCode(64 + col);
      const value = cell.getValue();
      const isMerged = cell.isPartOfMerge();
      const rule = cell.getDataValidation();

      let info = `${colLetter}: "${value}"`;
      if (isMerged) info += ' [結合]';
      if (rule) {
        info += ' [DD]';
        if (rule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
          const list = rule.getCriteriaValues()[0];
          if (list) info += ` (${list.length}件)`;
        }
      }

      console.log(info);
    }
    console.log('');
  }
}
