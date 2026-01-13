/**
 * シート構成読み取りGAS
 *
 * 【使い方】
 * 1. 読み取りたいスプレッドシートを開く
 * 2. 拡張機能 → Apps Script
 * 3. このコードを貼り付け
 * 4. analyzeCurrentSheet() を実行
 * 5. 「実行ログ」または新規作成された「_構成分析結果」シートを確認
 */

/**
 * 現在のシートの構成を分析して出力
 * GASエディタから直接実行可能
 */
function analyzeCurrentSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  Logger.log('='.repeat(60));
  Logger.log('シート構成分析: ' + sheetName);
  Logger.log('='.repeat(60));

  // 使用範囲を取得
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();

  Logger.log('使用範囲: ' + numRows + '行 × ' + numCols + '列');
  Logger.log('');

  // 結果を格納
  const result = {
    sheetName: sheetName,
    dimensions: { rows: numRows, cols: numCols },
    rowHeights: [],
    colWidths: [],
    mergedRanges: [],
    cells: []
  };

  // 行の高さを取得
  Logger.log('【行の高さ】');
  for (let row = 1; row <= Math.min(numRows, 50); row++) {
    const height = sheet.getRowHeight(row);
    result.rowHeights.push({ row: row, height: height });
    if (height !== 21) { // デフォルト以外のみ表示
      Logger.log('  行' + row + ': ' + height + 'px');
    }
  }
  Logger.log('');

  // 列の幅を取得
  Logger.log('【列の幅】');
  for (let col = 1; col <= Math.min(numCols, 20); col++) {
    const width = sheet.getColumnWidth(col);
    const colLetter = columnToLetter(col);
    result.colWidths.push({ col: col, letter: colLetter, width: width });
    Logger.log('  ' + colLetter + '列: ' + width + 'px');
  }
  Logger.log('');

  // 結合セルを取得
  Logger.log('【結合セル】');
  const mergedRanges = sheet.getRange(1, 1, numRows, numCols).getMergedRanges();
  for (const merged of mergedRanges) {
    const a1 = merged.getA1Notation();
    result.mergedRanges.push(a1);
    Logger.log('  ' + a1);
  }
  Logger.log('');

  // セルごとの情報を取得（最初の50行まで）
  Logger.log('【セル情報】');
  const values = range.getValues();
  const backgrounds = range.getBackgrounds();
  const fontColors = range.getFontColors();
  const fontSizes = range.getFontSizes();
  const fontWeights = range.getFontWeights();
  const horizontalAlignments = range.getHorizontalAlignments();
  const verticalAlignments = range.getVerticalAlignments();
  const wraps = range.getWraps();

  for (let row = 0; row < Math.min(numRows, 50); row++) {
    for (let col = 0; col < numCols; col++) {
      const value = values[row][col];
      const bg = backgrounds[row][col];
      const fontColor = fontColors[row][col];
      const fontSize = fontSizes[row][col];
      const fontWeight = fontWeights[row][col];
      const hAlign = horizontalAlignments[row][col];
      const vAlign = verticalAlignments[row][col];
      const wrap = wraps[row][col];

      // 値があるか、デフォルトでない装飾があるセルのみ記録
      const hasValue = value !== '';
      const hasStyle = bg !== '#ffffff' || fontColor !== '#000000' ||
                       fontSize !== 10 || fontWeight !== 'normal' ||
                       hAlign !== 'general' || wrap;

      if (hasValue || hasStyle) {
        const cellInfo = {
          cell: columnToLetter(col + 1) + (row + 1),
          row: row + 1,
          col: col + 1,
          value: String(value).substring(0, 100), // 長い値は切り詰め
          background: bg,
          fontColor: fontColor,
          fontSize: fontSize,
          fontWeight: fontWeight,
          hAlign: hAlign,
          vAlign: vAlign,
          wrap: wrap
        };
        result.cells.push(cellInfo);

        if (hasValue) {
          let logLine = '  ' + cellInfo.cell + ': "' + cellInfo.value.substring(0, 30) + '"';
          const styles = [];
          if (bg !== '#ffffff') styles.push('背景:' + bg);
          if (fontSize !== 10) styles.push('サイズ:' + fontSize);
          if (fontWeight === 'bold') styles.push('太字');
          if (hAlign !== 'general') styles.push('配置:' + hAlign);
          if (styles.length > 0) {
            logLine += ' [' + styles.join(', ') + ']';
          }
          Logger.log(logLine);
        }
      }
    }
  }

  // 結果をJSONとしても出力
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('【JSON形式（コピー用）】');
  Logger.log('='.repeat(60));
  Logger.log(JSON.stringify(result, null, 2));

  // 結果を新しいシートに出力（オプション）
  outputToSheet(ss, result);

  return result;
}


/**
 * 結果を新しいシートに出力
 */
function outputToSheet(ss, result) {
  const outputSheetName = '_構成分析結果';

  // 既存の出力シートがあれば削除
  let outputSheet = ss.getSheetByName(outputSheetName);
  if (outputSheet) {
    ss.deleteSheet(outputSheet);
  }

  // 新しいシートを作成
  outputSheet = ss.insertSheet(outputSheetName);

  // ヘッダー
  outputSheet.getRange('A1').setValue('シート構成分析結果: ' + result.sheetName);
  outputSheet.getRange('A1').setFontSize(14).setFontWeight('bold');

  let currentRow = 3;

  // 行の高さ（デフォルト以外）
  outputSheet.getRange('A' + currentRow).setValue('【行の高さ（デフォルト21px以外）】').setFontWeight('bold');
  currentRow++;
  for (const rh of result.rowHeights) {
    if (rh.height !== 21) {
      outputSheet.getRange('A' + currentRow).setValue('行' + rh.row);
      outputSheet.getRange('B' + currentRow).setValue(rh.height + 'px');
      currentRow++;
    }
  }
  currentRow++;

  // 列の幅
  outputSheet.getRange('A' + currentRow).setValue('【列の幅】').setFontWeight('bold');
  currentRow++;
  for (const cw of result.colWidths) {
    outputSheet.getRange('A' + currentRow).setValue(cw.letter + '列');
    outputSheet.getRange('B' + currentRow).setValue(cw.width + 'px');
    currentRow++;
  }
  currentRow++;

  // 結合セル
  outputSheet.getRange('A' + currentRow).setValue('【結合セル】').setFontWeight('bold');
  currentRow++;
  for (const mr of result.mergedRanges) {
    outputSheet.getRange('A' + currentRow).setValue(mr);
    currentRow++;
  }
  currentRow++;

  // セル情報
  outputSheet.getRange('A' + currentRow).setValue('【セル情報】').setFontWeight('bold');
  currentRow++;
  outputSheet.getRange('A' + currentRow + ':H' + currentRow).setValues([['セル', '値', '背景色', 'フォントサイズ', '太さ', '配置', '折返し', '']]);
  outputSheet.getRange('A' + currentRow + ':H' + currentRow).setFontWeight('bold').setBackground('#f0f0f0');
  currentRow++;

  for (const cell of result.cells) {
    if (cell.value || cell.background !== '#ffffff') {
      outputSheet.getRange('A' + currentRow + ':G' + currentRow).setValues([[
        cell.cell,
        cell.value.substring(0, 50),
        cell.background,
        cell.fontSize,
        cell.fontWeight,
        cell.hAlign,
        cell.wrap ? 'あり' : ''
      ]]);
      currentRow++;
    }
  }

  // 列幅調整
  outputSheet.setColumnWidth(1, 100);
  outputSheet.setColumnWidth(2, 300);

  Logger.log('');
  Logger.log('結果を「' + outputSheetName + '」シートに出力しました');
}


/**
 * 列番号をアルファベットに変換
 */
function columnToLetter(column) {
  let letter = '';
  while (column > 0) {
    const mod = (column - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    column = Math.floor((column - 1) / 26);
  }
  return letter;
}


/**
 * 特定の範囲だけを詳細分析（大きいシートの場合）
 * 例: analyzeRange('A1:G30')
 */
function analyzeRange(rangeA1) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const range = sheet.getRange(rangeA1);
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const startRow = range.getRow();
  const startCol = range.getColumn();

  Logger.log('='.repeat(60));
  Logger.log('範囲分析: ' + rangeA1);
  Logger.log('='.repeat(60));

  const values = range.getValues();
  const backgrounds = range.getBackgrounds();
  const fontSizes = range.getFontSizes();
  const fontWeights = range.getFontWeights();
  const horizontalAlignments = range.getHorizontalAlignments();

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const value = values[row][col];
      if (value !== '') {
        const cellRef = columnToLetter(startCol + col) + (startRow + row);
        Logger.log(cellRef + ': "' + value + '"');
        Logger.log('  背景: ' + backgrounds[row][col]);
        Logger.log('  サイズ: ' + fontSizes[row][col]);
        Logger.log('  太さ: ' + fontWeights[row][col]);
        Logger.log('  配置: ' + horizontalAlignments[row][col]);
        Logger.log('');
      }
    }
  }
}


/**
 * 罫線情報も取得する詳細版
 */
function analyzeCurrentSheetWithBorders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const range = sheet.getDataRange();

  Logger.log('='.repeat(60));
  Logger.log('詳細分析（罫線含む）: ' + sheet.getName());
  Logger.log('='.repeat(60));

  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();

  // 罫線は個別セルごとに取得する必要がある
  for (let row = 1; row <= Math.min(numRows, 30); row++) {
    for (let col = 1; col <= Math.min(numCols, 10); col++) {
      const cell = sheet.getRange(row, col);
      const value = cell.getValue();

      if (value !== '') {
        const cellRef = columnToLetter(col) + row;
        Logger.log(cellRef + ': "' + value + '"');

        // 罫線（getBorder()はないので、スタイルで推測）
        // 注: GASでは罫線の読み取りに制限がある

        Logger.log('  背景: ' + cell.getBackground());
        Logger.log('  フォント: ' + cell.getFontFamily());
        Logger.log('  サイズ: ' + cell.getFontSize());
        Logger.log('  色: ' + cell.getFontColor());
        Logger.log('  太さ: ' + cell.getFontWeight());
        Logger.log('  斜体: ' + cell.getFontStyle());
        Logger.log('  下線: ' + cell.getFontLine());
        Logger.log('  配置(H): ' + cell.getHorizontalAlignment());
        Logger.log('  配置(V): ' + cell.getVerticalAlignment());
        Logger.log('  折返し: ' + cell.getWrap());
        Logger.log('');
      }
    }
  }
}
