/**
 * シート構造確認GAS
 *
 * 【目的】
 * 1. フォーム回答シートの列構造を確認
 * 2. ヒアリングシートの構造を確認
 *
 * 【使い方】
 * このスクリプトをヒアリングシートのスプレッドシートに追加し、
 * メニューから実行してください。
 */

// ===== メニュー設定 =====
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 構造確認')
    .addItem('📊 フォーム回答シートの構造を確認', 'checkFormResponseStructure')
    .addItem('📋 ヒアリングシートの構造を確認', 'checkHearingSheetStructure')
    .addSeparator()
    .addItem('📝 マッピング定義を生成', 'generateMappingDefinition')
    .addToUi();
}

// ===== フォーム回答シートの構造確認 =====
function checkFormResponseStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 「フォームの回答 1」シートを探す
  let formSheet = ss.getSheetByName('フォームの回答 1');
  if (!formSheet) {
    formSheet = ss.getSheetByName('フォームの回答1');
  }
  if (!formSheet) {
    // 「フォーム」を含むシート名を探す
    const sheets = ss.getSheets();
    for (const sheet of sheets) {
      if (sheet.getName().includes('フォーム') || sheet.getName().includes('回答')) {
        formSheet = sheet;
        break;
      }
    }
  }

  if (!formSheet) {
    SpreadsheetApp.getUi().alert('フォーム回答シートが見つかりません。\n「フォームの回答 1」という名前のシートを確認してください。');
    return;
  }

  const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];

  let output = '===== フォーム回答シートの構造 =====\n\n';
  output += 'シート名: ' + formSheet.getName() + '\n';
  output += '列数: ' + headers.length + '\n\n';
  output += '--- 列一覧 ---\n\n';

  headers.forEach((header, index) => {
    output += '[' + index + '] ' + (header || '(空)') + '\n';
  });

  // サンプルデータがあれば表示
  if (formSheet.getLastRow() > 1) {
    output += '\n--- 最新の回答データ（サンプル） ---\n\n';
    const lastRow = formSheet.getLastRow();
    const sampleData = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];

    headers.forEach((header, index) => {
      const value = sampleData[index];
      const displayValue = value ? String(value).substring(0, 50) : '(空)';
      output += '[' + index + '] ' + (header || '(空)') + ': ' + displayValue + '\n';
    });
  }

  showOutputDialog(output, 'フォーム回答シートの構造');
}

// ===== ヒアリングシートの構造確認 =====
function checkHearingSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SpreadsheetApp.getActiveSheet();

  const data = sheet.getDataRange().getValues();

  let output = '===== ヒアリングシートの構造 =====\n\n';
  output += 'シート名: ' + sheet.getName() + '\n';
  output += '行数: ' + data.length + '\n';
  output += '列数: ' + (data[0] ? data[0].length : 0) + '\n\n';

  output += '--- セクション・項目一覧 ---\n\n';

  let currentSection = '';
  let currentSubSection = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 1;

    // A列（セクションマーカー）
    const colA = String(row[0] || '').trim();
    // B列（項目名）
    const colB = String(row[1] || '').trim();
    // C列（入力欄1）
    const colC = String(row[2] || '').trim();

    // Part検出
    if (colA.includes('Part') || colA.includes('基本情報') || colA.includes('ヒアリング情報')) {
      output += '\n========== ' + colA + ' (行' + rowNum + ') ==========\n';
      currentSection = colA;
      continue;
    }

    // サブセクション検出（▼マーク）
    if (colA.startsWith('▼') || colB.startsWith('▼')) {
      const subSection = colA.startsWith('▼') ? colA : colB;
      output += '\n【' + subSection.replace('▼', '').trim() + '】(行' + rowNum + ')\n';
      currentSubSection = subSection;
      continue;
    }

    // 項目検出（B列にラベルがある場合）
    if (colB && !colB.includes('No') && colB !== '～') {
      // 入力セルの位置を特定
      let inputCol = 'C';
      let inputColIndex = 2;

      // C列が空でD列以降に値がある場合
      if (!colC && row[3]) {
        inputCol = 'D';
        inputColIndex = 3;
      }

      output += '  行' + rowNum + ' | B列: ' + colB + ' | 入力: ' + inputCol + '列\n';
    }
  }

  showOutputDialog(output, 'ヒアリングシートの構造');
}

// ===== マッピング定義を生成 =====
function generateMappingDefinition() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // フォーム回答シートを探す
  let formSheet = ss.getSheetByName('フォームの回答 1') || ss.getSheetByName('フォームの回答1');

  if (!formSheet) {
    SpreadsheetApp.getUi().alert('フォーム回答シートが見つかりません。');
    return;
  }

  const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];

  let output = '/**\n * フォーム回答 → ヒアリングシート マッピング定義\n * \n * 生成日時: ' + new Date().toLocaleString('ja-JP') + '\n */\n\n';
  output += 'const FORM_COLUMNS = {\n';

  headers.forEach((header, index) => {
    if (header) {
      // 変数名を生成（日本語をローマ字/英語に変換するのは難しいので、コメント付きで番号を使用）
      const varName = 'col_' + index;
      output += '  ' + varName + ': ' + index + ',  // ' + header + '\n';
    }
  });

  output += '};\n\n';
  output += '// 合計 ' + headers.filter(h => h).length + ' 項目\n';

  showOutputDialog(output, 'マッピング定義');
}

// ===== Part②詳細構造確認（文字起こし転記用） =====
function checkPart2Structure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  // 最大200行まで確認
  const maxRows = Math.min(sheet.getLastRow(), 200);
  const data = sheet.getRange(1, 1, maxRows, 10).getValues();

  let output = '===== Part② 詳細構造確認 =====\n\n';
  output += 'シート名: ' + sheetName + '\n';
  output += '確認日時: ' + new Date().toLocaleString('ja-JP') + '\n\n';

  // 検索する項目のキーワード
  const keywords = {
    'Part②': { found: false, row: 0 },
    '会社紹介': { found: false, row: 0 },
    '私たちについて': { found: false, row: 0, col: 0, value: '' },
    '社長挨拶': { found: false, row: 0, col: 0, value: '' },
    '会社の魅力': { found: false, row: 0, col: 0, value: '' },
    '雰囲気': { found: false, row: 0, col: 0, value: '' },
    '社員の声': { found: false, row: 0 },
    '最も打ち出したい': { found: false, row: 0, col: 0, value: '' },
    '募集情報': { found: false, row: 0 },
    '募集背景': { found: false, row: 0, col: 0, value: '' },
    'ペルソナ': { found: false, row: 0, col: 0, value: '' },
    '求める人材像': { found: false, row: 0, col: 0, value: '' },
    'スカウト': { found: false, row: 0 },
  };

  // 社員の声の詳細情報
  const employeeRows = [];

  output += '--- 行ごとのスキャン結果 ---\n\n';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 1;
    const rowText = row.join(' ').toLowerCase();

    // 各列の値
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colC = String(row[2] || '').trim();

    // Part②検出
    if (colA.includes('Part') && colA.includes('②')) {
      keywords['Part②'].found = true;
      keywords['Part②'].row = rowNum;
      output += '★ [行' + rowNum + '] Part② ヒアリング情報 検出\n';
    }

    // 会社紹介セクション
    if (colA.includes('会社紹介') || colB.includes('会社紹介')) {
      keywords['会社紹介'].found = true;
      keywords['会社紹介'].row = rowNum;
      output += '★ [行' + rowNum + '] 会社紹介セクション 検出\n';
    }

    // 私たちについて
    if (colB.includes('私たちについて')) {
      keywords['私たちについて'].found = true;
      keywords['私たちについて'].row = rowNum;
      keywords['私たちについて'].col = 3;
      keywords['私たちについて'].value = colC;
      output += '  [行' + rowNum + '] 私たちについて → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // 社長挨拶
    if (colB.includes('社長挨拶') || colB.includes('社長メッセージ')) {
      keywords['社長挨拶'].found = true;
      keywords['社長挨拶'].row = rowNum;
      keywords['社長挨拶'].col = 3;
      keywords['社長挨拶'].value = colC;
      output += '  [行' + rowNum + '] 社長挨拶 → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // 会社の魅力
    if (colB.includes('会社の魅力') || colB.includes('魅力')) {
      keywords['会社の魅力'].found = true;
      keywords['会社の魅力'].row = rowNum;
      keywords['会社の魅力'].col = 3;
      keywords['会社の魅力'].value = colC;
      output += '  [行' + rowNum + '] 会社の魅力 → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // 雰囲気
    if (colB.includes('雰囲気')) {
      keywords['雰囲気'].found = true;
      keywords['雰囲気'].row = rowNum;
      keywords['雰囲気'].col = 3;
      keywords['雰囲気'].value = colC;
      output += '  [行' + rowNum + '] 雰囲気 → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // 社員の声セクション
    if (colA.includes('社員の声') || colB.includes('社員の声')) {
      keywords['社員の声'].found = true;
      keywords['社員の声'].row = rowNum;
      output += '★ [行' + rowNum + '] 社員の声セクション 検出\n';
    }

    // 社員の声データ行（氏名・部署・年数・インタビュー）
    if (keywords['社員の声'].found && rowNum > keywords['社員の声'].row) {
      // ヘッダー行をスキップ
      if (colB && !colB.includes('氏名') && !colB.includes('社員') && !colB.includes('声')) {
        // データ行の可能性
        if (colC || row[3] || row[4] || row[5]) {
          employeeRows.push({
            row: rowNum,
            name: colC,
            dept: String(row[3] || ''),
            years: String(row[4] || ''),
            interview: String(row[5] || '')
          });
        }
      }
    }

    // 最も打ち出したいポイント
    if (rowText.includes('最も打ち出したい') || rowText.includes('打ち出していきたい')) {
      keywords['最も打ち出したい'].found = true;
      keywords['最も打ち出したい'].row = rowNum;
      output += '★ [行' + rowNum + '] 最も打ち出したいポイント 検出\n';
    }

    // 募集情報セクション
    if (colA.includes('募集情報') || colB.includes('募集情報')) {
      keywords['募集情報'].found = true;
      keywords['募集情報'].row = rowNum;
      output += '★ [行' + rowNum + '] 募集情報セクション 検出\n';
    }

    // 募集背景
    if (colB.includes('募集背景')) {
      keywords['募集背景'].found = true;
      keywords['募集背景'].row = rowNum;
      keywords['募集背景'].col = 3;
      keywords['募集背景'].value = colC;
      output += '  [行' + rowNum + '] 募集背景 → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // ペルソナ
    if (colB.includes('ペルソナ')) {
      keywords['ペルソナ'].found = true;
      keywords['ペルソナ'].row = rowNum;
      output += '  [行' + rowNum + '] ペルソナ 検出\n';
    }

    // 求める人材像
    if (colB.includes('求める人材像') || colB.includes('求める人物像')) {
      keywords['求める人材像'].found = true;
      keywords['求める人材像'].row = rowNum;
      keywords['求める人材像'].col = 3;
      keywords['求める人材像'].value = colC;
      output += '  [行' + rowNum + '] 求める人材像 → C列: ' + (colC ? colC.substring(0, 30) + '...' : '(空)') + '\n';
    }

    // スカウト
    if (colA.includes('スカウト') || colB.includes('スカウト')) {
      keywords['スカウト'].found = true;
      keywords['スカウト'].row = rowNum;
      output += '★ [行' + rowNum + '] スカウトメール設定セクション 検出\n';
    }
  }

  // サマリー
  output += '\n\n===== マッピング修正用サマリー =====\n\n';
  output += '// TRANSCRIPT_TO_SHEET_MAPPING の修正案\n\n';

  if (keywords['私たちについて'].found) {
    output += "'私たちについて': { row: " + keywords['私たちについて'].row + ", col: 3 },\n";
  }
  if (keywords['社長挨拶'].found) {
    output += "'社長挨拶': { row: " + keywords['社長挨拶'].row + ", col: 3 },\n";
  }
  if (keywords['会社の魅力'].found) {
    output += "'会社の魅力': { row: " + keywords['会社の魅力'].row + ", col: 3 },\n";
  }
  if (keywords['雰囲気'].found) {
    output += "'雰囲気': { row: " + keywords['雰囲気'].row + ", col: 3 },\n";
  }

  if (employeeRows.length > 0) {
    output += '\n// 社員の声（' + employeeRows.length + '名分検出）\n';
    employeeRows.slice(0, 4).forEach((emp, idx) => {
      const num = idx + 1;
      output += "'社員" + num + "_氏名': { row: " + emp.row + ", col: 3 },\n";
      output += "'社員" + num + "_部署': { row: " + emp.row + ", col: 4 },\n";
      output += "'社員" + num + "_年数': { row: " + emp.row + ", col: 5 },\n";
      output += "'社員" + num + "_インタビュー': { row: " + emp.row + ", col: 6 },\n";
    });
  }

  if (keywords['最も打ち出したい'].found) {
    // 実際のデータ行は次の行の可能性
    output += "\n'最も打ち出したいポイント': { row: " + (keywords['最も打ち出したい'].row + 1) + ", col: 1 },\n";
  }

  if (keywords['募集背景'].found) {
    output += "\n'募集背景': { row: " + keywords['募集背景'].row + ", col: 3 },\n";
  }
  if (keywords['ペルソナ'].found) {
    output += "'ペルソナ_性別': { row: " + keywords['ペルソナ'].row + ", col: 3 },\n";
    output += "'ペルソナ_年齢': { row: " + keywords['ペルソナ'].row + ", col: 5 },\n";
    output += "'ペルソナ_外国人': { row: " + keywords['ペルソナ'].row + ", col: 7 },\n";
  }
  if (keywords['求める人材像'].found) {
    output += "'求める人材像': { row: " + keywords['求める人材像'].row + ", col: 3 },\n";
  }

  showOutputDialog(output, 'Part② 詳細構造確認');
}

// ===== 転記テスト結果確認 =====
function checkTranscriptTransferResult() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  // 現在のTRANSCRIPT_TO_SHEET_MAPPINGの定義（チェック用）
  // ※transcriptToHearingSheet.jsと同期すること
  const mapping = {
    '私たちについて': { row: 83, col: 3 },
    '社長挨拶': { row: 86, col: 3 },
    '会社の魅力': { row: 89, col: 3 },
    '雰囲気': { row: 92, col: 3 },
    '社員1_氏名': { row: 98, col: 3 },
    '社員1_部署': { row: 98, col: 4 },
    '社員1_年数': { row: 98, col: 5 },
    '社員1_インタビュー': { row: 98, col: 6 },
    '社員2_氏名': { row: 99, col: 3 },
    '社員2_部署': { row: 99, col: 4 },
    '社員2_年数': { row: 99, col: 5 },
    '社員2_インタビュー': { row: 99, col: 6 },
    '社員3_氏名': { row: 100, col: 3 },
    '社員3_部署': { row: 100, col: 4 },
    '社員3_年数': { row: 100, col: 5 },
    '社員3_インタビュー': { row: 100, col: 6 },
    '社員4_氏名': { row: 101, col: 3 },
    '社員4_部署': { row: 101, col: 4 },
    '社員4_年数': { row: 101, col: 5 },
    '社員4_インタビュー': { row: 101, col: 6 },
    '最も打ち出したいポイント': { row: 111, col: 1 },  // 修正: 110→111
    '募集背景': { row: 117, col: 3 },                  // 修正: 116→117
    'ペルソナ_性別': { row: 119, col: 3 },             // 行119, C列
    'ペルソナ_年齢': { row: 119, col: 5 },             // 行119, E列
    'ペルソナ_外国人': { row: 119, col: 7 },           // 行119, G列
    '求める人材像': { row: 120, col: 3 },              // 修正: 119→120
    'スカウト_年齢': { row: 129, col: 3 },             // 修正: 128→129
    'スカウト_エリア': { row: 130, col: 3 },           // 修正: 129→130
    'スカウト_キーワード': { row: 131, col: 3 },       // 修正: 130→131
    'スカウト_備考': { row: 132, col: 3 },             // 修正: 131→132
  };

  let output = '===== 転記テスト結果確認 =====\n\n';
  output += 'シート名: ' + sheetName + '\n';
  output += '確認日時: ' + new Date().toLocaleString('ja-JP') + '\n\n';

  output += '--- 現在のマッピング定義 vs 実際のセル値 ---\n\n';

  let hasIssue = false;

  for (const key in mapping) {
    const m = mapping[key];
    let value = '';
    let rowLabel = '';

    try {
      value = String(sheet.getRange(m.row, m.col).getValue() || '');
      // その行のB列（ラベル）も取得
      rowLabel = String(sheet.getRange(m.row, 2).getValue() || '');
    } catch (e) {
      value = '(エラー: ' + e.message + ')';
    }

    const displayValue = value ? value.substring(0, 40) : '(空)';
    const hasValue = value && value.trim() !== '';

    // 行ラベルがキーと一致するか確認
    const labelMatch = rowLabel.includes(key.split('_')[0]) || key.includes(rowLabel);

    let status = '';
    if (hasValue) {
      status = '✓ データあり';
    } else {
      status = '✗ 空';
    }

    output += '[' + key + '] 行' + m.row + ', 列' + m.col + '\n';
    output += '  B列ラベル: ' + (rowLabel || '(空)') + '\n';
    output += '  値: ' + displayValue + '\n';
    output += '  状態: ' + status + '\n\n';

    // ラベルが期待と違う場合は警告
    if (rowLabel && !labelMatch && !['社員', '氏名', '部署', '年数'].some(w => rowLabel.includes(w) || key.includes(w))) {
      output += '  ⚠️ 警告: B列のラベルが期待と異なる可能性があります\n\n';
      hasIssue = true;
    }
  }

  if (hasIssue) {
    output += '\n===== 注意 =====\n';
    output += '一部の行でラベルが期待と異なる可能性があります。\n';
    output += '「Part② 詳細構造確認」を実行して、正しい行番号を確認してください。\n';
  }

  showOutputDialog(output, '転記テスト結果確認');
}

// ===== メインGAS統合用メニュー追加関数 =====
function addStructureCheckMenuToExisting(ui) {
  ui.createMenu('🔧 構造確認')
    .addItem('📋 Part② 詳細構造確認', 'checkPart2Structure')
    .addItem('📊 転記テスト結果確認', 'checkTranscriptTransferResult')
    .addSeparator()
    .addItem('📄 フォーム回答シートの構造', 'checkFormResponseStructure')
    .addItem('📄 ヒアリングシートの構造', 'checkHearingSheetStructure')
    .addSeparator()
    .addItem('📝 マッピング定義を生成', 'generateMappingDefinition')
    .addToUi();
}

// ===== 出力ダイアログ =====
function showOutputDialog(content, title) {
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: monospace; padding: 10px; }' +
    'textarea { width: 100%; height: 400px; font-size: 12px; }' +
    'button { padding: 10px 20px; margin: 5px; cursor: pointer; }' +
    '.primary { background: #4285f4; color: white; border: none; border-radius: 4px; }' +
    '</style></head><body>' +
    '<textarea id="content">' + escaped + '</textarea>' +
    '<br>' +
    '<button class="primary" onclick="copyToClipboard()">📋 コピー</button>' +
    '<script>' +
    'function copyToClipboard() {' +
    '  const textarea = document.getElementById("content");' +
    '  textarea.select();' +
    '  document.execCommand("copy");' +
    '  alert("コピーしました");' +
    '}' +
    '</script>' +
    '</body></html>'
  ).setWidth(700).setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, title);
}
