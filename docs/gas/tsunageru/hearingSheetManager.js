/**
 * ツナゲル 原稿ヒアリングシート 統合GAS
 *
 * 【機能】
 * 1. 新規作成（フォーム回答から）- フォーム回答を元にシート作成＆データ反映
 * 2. 新規作成（手動）- 企業名を入力して空のシート作成
 * 3. フォーム回答を既存シートに転記
 * 4. AI用データ出力（JSON/テキスト）
 * 5. テンプレート管理
 */

// ===== 定数 =====
const COLORS = {
  HEADER: '#4A90D9',
  HEADER_TEXT: '#FFFFFF',
  COMPANY_INPUT: '#FFFDE7',
  INTERNAL_INPUT: '#E3F2FD',
  LABEL: '#F5F5F5',
  IMPORTANT: '#FFCDD2',
  BORDER: '#BDBDBD'
};

const SHEET_NAME = 'ヒアリングシート';
const FORM_RESPONSE_SHEET_NAME = 'フォームの回答 1';

// ===== フォーム回答 → ヒアリングシート マッピング =====
// フォーム列番号 → ヒアリングシート（行, 列）
const FORM_TO_SHEET_MAPPING = {
  // セクション1: 企業概要
  1:  { row: 5, col: 3 },   // 企業名 → 行5, C列
  2:  { row: 6, col: 3 },   // 代表者名 → 行6, C列
  3:  { row: 7, col: 3 },   // HP URL → 行7, C列
  4:  { row: 8, col: 3 },   // 住所 → 行8, C列
  5:  { row: 9, col: 3 },   // 電話番号 → 行9, C列
  6:  { row: 10, col: 3 },  // メールアドレス → 行10, C列
  7:  { row: 11, col: 3 },  // 許可番号 → 行11, C列
  8:  { row: 12, col: 3 },  // 設立日 → 行12, C列
  9:  { row: 13, col: 3 },  // 担当者名・役職 → 行13, C列
  10: { row: 14, col: 3 },  // 事業内容 → 行14, C列
  11: { row: 15, col: 3 },  // 転勤の有無 → 行15, C列
  12: { row: 15, col: 5 },  // 転勤先 → 行15, E列

  // セクション2: 雇用形態・職種
  13: { row: 18, col: 3 },  // 雇用形態 → 行18, C列
  14: { row: 21, col: 3 },  // 職種 → 行21, C列
  15: { row: 19, col: 3 },  // 試用期間の有無 → 行19, C列
  16: { row: 19, col: 5 },  // 試用期間 → 行19, E列
  17: { row: 20, col: 3 },  // 試用期間中の条件変更 → 行20, C列

  // セクション3: 勤務条件
  18: { row: 24, col: 3 },  // 勤務時間① → 行24, C列（開始～終了を1セルに）
  19: { row: 25, col: 3 },  // 勤務時間② → 行25, C列
  20: { row: 26, col: 3 },  // 勤務時間③ → 行26, C列
  21: { row: 24, col: 7 },  // 実働時間 → 行24, G列
  22: { row: 30, col: 3 },  // 休憩時間 → 行30, C列
  23: { row: 27, col: 3 },  // 勤務時間の備考 → 行27, C列

  // セクション4: 残業
  24: { row: 36, col: 3 },  // 残業の有無 → 行36, C列
  25: { row: 37, col: 6 },  // 月の平均残業時間 → 行37, F列
  26: { row: 38, col: 3 },  // 残業の備考 → 行38, C列

  // セクション5: 休日
  27: { row: 41, col: 3 },  // 休日区分 → 行41, C列
  28: { row: 42, col: 6 },  // 年間休日数 → 行42, F列
  29: { row: 44, col: 3 },  // 長期休暇の有無 → 行44, C列
  30: { row: 44, col: 5 },  // 長期休暇の詳細 → 行44, E列

  // セクション6: 給与
  31: { row: 48, col: 3 },  // 給与形態 → 行48, C列
  32: { row: 49, col: 3 },  // 給与額 → 行49, C列
  33: { row: 50, col: 3 },  // 想定年収 → 行50, C列
  34: { row: 51, col: 3 },  // 賞与の有無 → 行51, C列
  35: { row: 51, col: 5 },  // 賞与詳細 → 行51, E列
  36: { row: 52, col: 3 },  // みなし残業代の有無 → 行52, C列（時間欄）
  37: { row: 52, col: 5 },  // みなし残業代詳細 → 行52, E列（金額欄）
  38: { row: 53, col: 3 },  // 試用期間中給与 → 行53, C列

  // セクション7: 待遇・福利厚生
  39: { row: 56, col: 4 },  // 雇用保険 → 行56, D列
  40: { row: 56, col: 6 },  // 労災保険 → 行56, F列
  41: { row: 57, col: 4 },  // 厚生年金 → 行57, D列
  42: { row: 57, col: 6 },  // 健康保険 → 行57, F列
  43: { row: 58, col: 3 },  // その他待遇 → 行58, C列

  // セクション8: 作業内容
  44: { row: 63, col: 3 },  // 作業内容詳細 → 行63, C列

  // セクション9: サービス・製品
  45: { row: 70, col: 3 },  // サービス・製品① → 行70, C列
  46: { row: 71, col: 3 },  // サービス・製品② → 行71, C列
  47: { row: 72, col: 3 },  // サービス・製品③ → 行72, C列
  48: { row: 73, col: 3 },  // 作業上の注意点 → 行73, C列

  // セクション10: その他
  49: { row: 77, col: 4 },  // 従業員の平均年齢 → 行77, D列
  50: { row: 77, col: 6 },  // 男女比 → 行77, F列
  51: { row: 78, col: 3 },  // 必須資格 → 行78, C列
  52: { row: 79, col: 3 },  // 選考フロー → 行79, C列
};

// ===== メニュー設定 =====
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // ０. 設定メニュー（settingsSheet.jsから）
  addSettingsMenu(ui);

  // １. キックオフ・企業情報入力メニュー（companyInfoManager.jsから）
  addKickoffMenu(ui);

  // ２. ヒアリングシート・撮影フォルダ（統合メニュー）
  ui.createMenu('２.📋 ヒアリングシート・撮影フォルダ')
    .addItem('🆕 新規ヒアリングシート作成（フォーム回答から）', 'createFromFormResponse')
    .addItem('🆕 新規ヒアリングシート作成（手動）', 'createNewHearingSheet')
    .addSeparator()
    .addItem('📂 新規フォルダ作成（企業シートから）', 'createShootingFolderFromSheet')
    .addItem('🆕 新規フォルダ作成（手動）', 'createShootingFolder')
    .addSeparator()
    .addItem('📥 フォーム回答を既存シートに転記', 'transferToExistingSheet')
    .addSeparator()
    .addItem('📋 最近作成した企業フォルダ一覧', 'showRecentFolders')
    .addSeparator()
    .addItem('🎨 テンプレート初期設定', 'setupTemplate')
    .addItem('⚙️ 親フォルダを設定', 'setParentFolder')
    // .addItem('📄 現在のシートをテンプレート化', 'formatCurrentSheet')
    .addToUi();

  // ４. 議事録作成・報告プロンプトメニュー（promptDialog.js + transcriptToHearingSheet.js統合）
  createPromptMenu(ui);

  // ５. 構成案作成メニュー（compositionDraftGenerator.jsから）
  addCompositionMenu(ui);

  // 連絡用フォーマットメニュー（ナンバリングなし）（contactFormats.jsから）
  addContactFormatsMenu(ui);

  // メンテナンス用（必要に応じてコメント解除）
  // addStructureCheckMenuToExisting(ui);
}

// ===== 1. 新規作成（フォーム回答から） =====
function createFromFormResponse() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // フォーム回答シートを取得
  const formSheet = ss.getSheetByName(FORM_RESPONSE_SHEET_NAME) ||
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

  // 回答一覧を取得
  const responses = formSheet.getRange(2, 1, lastRow - 1, formSheet.getLastColumn()).getValues();
  const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];

  // 企業名リストを作成（選択用）
  const companyList = responses.map((row, index) => {
    const timestamp = row[0] ? new Date(row[0]).toLocaleString('ja-JP') : '';
    const companyName = row[1] || '(企業名なし)';
    return {
      index: index + 2, // 実際の行番号（ヘッダー分+1）
      display: `${companyName} (${timestamp})`,
      companyName: companyName,
      data: row
    };
  });

  // 選択ダイアログを表示
  const htmlContent = createSelectionDialog(companyList, 'createFromFormResponse');
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(500)
    .setHeight(500);
  ui.showModalDialog(htmlOutput, 'フォーム回答から新規作成');
}

// フォーム回答から新規作成を実行
function executeCreateFromFormResponse(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(FORM_RESPONSE_SHEET_NAME) ||
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
    const templateSheet = ss.getSheetByName(SHEET_NAME);
    if (!templateSheet) {
      return {
        success: false,
        error: 'テンプレート（ヒアリングシート）が見つかりません。先に「テンプレート初期設定」を実行してください。'
      };
    }

    // 同じスプレッドシート内にシートをコピー
    const newSheet = templateSheet.copyTo(ss);
    newSheet.setName(companyName);

    // データを転記
    transferFormDataToSheet(newSheet, formData);

    // 新しいシートをアクティブにする
    ss.setActiveSheet(newSheet);

    // 成功メッセージ
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
function createNewHearingSheet() {
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
    // テンプレートシートを取得
    const templateSheet = ss.getSheetByName(SHEET_NAME);
    if (!templateSheet) {
      ui.alert('エラー', 'テンプレート（ヒアリングシート）が見つかりません。先に「テンプレート初期設定」を実行してください。', ui.ButtonSet.OK);
      return;
    }

    // 同じスプレッドシート内にシートをコピー
    const newSheet = templateSheet.copyTo(ss);
    newSheet.setName(companyName);

    // 企業名をセルに自動入力
    newSheet.getRange(5, 3).setValue(companyName);

    // 新しいシートをアクティブにする
    ss.setActiveSheet(newSheet);

    ui.alert('作成完了', '✅ 「' + companyName + '」シートを作成しました。', ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('エラー', 'シート作成に失敗しました：' + error.message, ui.ButtonSet.OK);
  }
}

// ===== 3. フォーム回答を既存シートに転記 =====
function transferToExistingSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // フォーム回答シートを取得
  const formSheet = ss.getSheetByName(FORM_RESPONSE_SHEET_NAME) ||
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

  // 回答一覧を取得
  const responses = formSheet.getRange(2, 1, lastRow - 1, formSheet.getLastColumn()).getValues();

  // 企業名リストを作成
  const companyList = responses.map((row, index) => {
    const timestamp = row[0] ? new Date(row[0]).toLocaleString('ja-JP') : '';
    const companyName = row[1] || '(企業名なし)';
    return {
      index: index + 2,
      display: `${companyName} (${timestamp})`,
      companyName: companyName,
      data: row
    };
  });

  // 選択ダイアログを表示
  const htmlContent = createSelectionDialog(companyList, 'transferToExistingSheet');
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(500)
    .setHeight(500);
  ui.showModalDialog(htmlOutput, 'フォーム回答を既存シートに転記');
}

// 既存シートに転記を実行
function executeTransferToExistingSheet(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答1');
  const formData = formSheet.getRange(rowIndex, 1, 1, formSheet.getLastColumn()).getValues()[0];

  // フォーム回答の企業名
  const formCompanyName = String(formData[1] || '').trim();

  // 現在アクティブなシート（または「ヒアリングシート」）に転記
  let targetSheet = ss.getActiveSheet();
  if (targetSheet.getName() === FORM_RESPONSE_SHEET_NAME ||
      targetSheet.getName() === 'フォームの回答1') {
    targetSheet = ss.getSheetByName(SHEET_NAME);
  }

  if (!targetSheet || targetSheet.getName().includes('フォーム')) {
    return {
      success: false,
      error: 'ヒアリングシートが見つかりません。先にヒアリングシートを選択してください。'
    };
  }

  // シートの企業名を取得（行5, C列）
  const sheetCompanyName = String(targetSheet.getRange(5, 3).getValue() || '').trim();

  // 企業名の一致確認
  if (sheetCompanyName && formCompanyName) {
    const isMatch = checkCompanyNameMatch(formCompanyName, sheetCompanyName);
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
    transferFormDataToSheet(targetSheet, formData);
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
function executeTransferForce(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const formSheet = ss.getSheetByName(FORM_RESPONSE_SHEET_NAME) ||
                    ss.getSheetByName('フォームの回答1');
  const formData = formSheet.getRange(rowIndex, 1, 1, formSheet.getLastColumn()).getValues()[0];

  let targetSheet = ss.getActiveSheet();
  if (targetSheet.getName() === FORM_RESPONSE_SHEET_NAME ||
      targetSheet.getName() === 'フォームの回答1') {
    targetSheet = ss.getSheetByName(SHEET_NAME);
  }

  try {
    transferFormDataToSheet(targetSheet, formData);
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

// 企業名の一致確認（部分一致・表記揺れ対応）
function checkCompanyNameMatch(name1, name2) {
  // 正規化：株式会社、（株）、㈱などを除去し、スペースも除去
  const normalize = (str) => {
    return str
      .replace(/株式会社/g, '')
      .replace(/（株）/g, '')
      .replace(/\(株\)/g, '')
      .replace(/㈱/g, '')
      .replace(/有限会社/g, '')
      .replace(/（有）/g, '')
      .replace(/\(有\)/g, '')
      .replace(/㈲/g, '')
      .replace(/合同会社/g, '')
      .replace(/\s+/g, '')
      .trim();
  };

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // 完全一致
  if (n1 === n2) return true;

  // 部分一致（どちらかがもう一方を含む）
  if (n1.includes(n2) || n2.includes(n1)) return true;

  return false;
}

// ===== データ転記関数 =====
function transferFormDataToSheet(sheet, formData) {
  // マッピングに従ってデータを転記
  for (const formCol in FORM_TO_SHEET_MAPPING) {
    const mapping = FORM_TO_SHEET_MAPPING[formCol];
    const value = formData[parseInt(formCol)];

    if (value !== undefined && value !== null && value !== '') {
      sheet.getRange(mapping.row, mapping.col).setValue(value);
    }
  }
}

// ===== 選択ダイアログHTML生成 =====
function createSelectionDialog(companyList, action) {
  let options = companyList.map(item =>
    `<option value="${item.index}">${item.display}</option>`
  ).join('');

  return `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        /* hearingSheetManager固有スタイル */
        select { width: 100%; padding: 10px; font-size: 14px; margin-bottom: 20px; }
        button { padding: 12px 24px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; }
        .primary { background: #4285f4; color: white; }
        .result { margin-top: 20px; padding: 15px; border-radius: 6px; display: none; }
        .success { background: #e6f4ea; color: #1e7e34; }
        .error { background: #fce8e6; color: #c5221f; }
      </style>
    </head>
    <body>
      <p>転記するフォーム回答を選択してください：</p>
      <select id="companySelect" size="10">
        ${options}
      </select>
      <br>
      <button class="primary" onclick="execute()">実行</button>
      <button class="secondary" onclick="google.script.host.close()">キャンセル</button>
      <div id="result" class="result"></div>
      <script>
        function execute() {
          const select = document.getElementById('companySelect');
          const rowIndex = select.value;
          if (!rowIndex) {
            alert('回答を選択してください');
            return;
          }

          const action = '${action}';
          if (action === 'createFromFormResponse') {
            google.script.run
              .withSuccessHandler(handleCreateResult)
              .withFailureHandler(handleError)
              .executeCreateFromFormResponse(parseInt(rowIndex));
          } else if (action === 'transferToExistingSheet') {
            google.script.run
              .withSuccessHandler(handleTransferResult)
              .withFailureHandler(handleError)
              .executeTransferToExistingSheet(parseInt(rowIndex));
          }
        }

        function handleCreateResult(result) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          if (result.success) {
            div.className = 'result success';
            div.innerHTML = '✅ 作成完了: 「' + result.companyName + '」シートを作成しました<br><br>シートに移動しました。<br><br><button class="primary" onclick="google.script.host.close()">閉じる</button>';
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
            div.innerHTML = '✅ 転記完了: ' + result.sheetName + '<br><br><button class="primary" onclick="google.script.host.close()">閉じる</button>';
          } else if (result.needConfirm) {
            div.className = 'result error';
            div.innerHTML = '⚠️ 企業名が一致しません<br><br>' +
              '<strong>フォーム回答:</strong> ' + result.formCompanyName + '<br>' +
              '<strong>シート:</strong> ' + result.sheetCompanyName + '<br><br>' +
              '該当する企業のシートを開いてから実行してください。<br><br>' +
              '<button class="secondary" onclick="forceTransfer()">それでも転記する</button>';
            // rowIndexを保存
            window.lastRowIndex = document.getElementById('companySelect').value;
          } else {
            div.className = 'result error';
            div.innerHTML = '❌ エラー: ' + result.error;
          }
        }

        function forceTransfer() {
          if (window.lastRowIndex) {
            google.script.run
              .withSuccessHandler(handleForceResult)
              .withFailureHandler(handleError)
              .executeTransferForce(parseInt(window.lastRowIndex));
          }
        }

        function handleForceResult(result) {
          const div = document.getElementById('result');
          div.style.display = 'block';
          if (result.success) {
            div.className = 'result success';
            div.innerHTML = '✅ 転記完了: ' + result.sheetName + '<br><br><button class="primary" onclick="google.script.host.close()">閉じる</button>';
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

// ===== テンプレート初期設定（既存コードを維持） =====
function setupTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear();
  }

  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 300);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 200);

  let row = 1;

  // タイトル
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue('原稿ヒアリングシート')
    .setBackground('#1565C0')
    .setFontColor('#FFFFFF')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 40);
  row++;

  // 凡例
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue('🟨 黄色セル：企業様ご記入　🟦 青色セル：打ち合わせ時記入')
    .setFontSize(10)
    .setFontColor('#666666');
  row++;

  // Part① 基本情報
  row = createSectionHeader(sheet, row, 'Part① 基本情報（企業様ご記入）');

  // 企業概要
  row = createSubHeader(sheet, row, '企業概要');
  row = createInputRow(sheet, row, '企業名', true, '（正式名称）');
  row = createInputRow(sheet, row, '代表者', true);
  row = createInputRow(sheet, row, 'HP', true, 'URL');
  row = createInputRow(sheet, row, '住所', true, '〒');
  row = createInputRow(sheet, row, '連絡先', true, '電話番号');
  row = createInputRow(sheet, row, 'メールアドレス', true);
  row = createInputRow(sheet, row, '許可番号', true, '※必要な業種のみ');
  row = createInputRow(sheet, row, '設立日', true);
  row = createInputRow(sheet, row, '担当者名', true, '（役職）');
  row = createInputRow(sheet, row, '事業内容', true);
  row = createInputRowWithOptions(sheet, row, '転勤', true, ['有', '無'], '転勤先：');
  row++;

  // 求人区分・雇用形態
  row = createSubHeader(sheet, row, '求人区分・雇用形態');
  row = createInputRow(sheet, row, '求人区分・雇用形態', true, '例：正社員、契約社員等');
  row = createInputRowWithOptions(sheet, row, '試用期間', true, ['有', '無'], '期間：', 'ヶ月');
  row = createInputRow(sheet, row, '試用期間中の条件', true, '給与等の違いがあれば');
  row = createInputRow(sheet, row, '職種', true);
  row++;

  // 勤務時間
  row = createSubHeader(sheet, row, '勤務時間');
  row = createTimeRow(sheet, row, '勤務時間①', true);
  row = createTimeRow(sheet, row, '勤務時間②', true);
  row = createTimeRow(sheet, row, '勤務時間③', true);
  row = createInputRow(sheet, row, '備考', true);
  row++;

  // 休憩時間
  row = createSubHeader(sheet, row, '休憩時間');
  row = createBreakTimeRow(sheet, row, '休憩時間①', true);
  row = createBreakTimeRow(sheet, row, '休憩時間②', true);
  row = createBreakTimeRow(sheet, row, '休憩時間③', true);
  row = createInputRow(sheet, row, '備考', true, '※サービス休憩など');
  row++;

  // 残業
  row = createSubHeader(sheet, row, '残業');
  row = createInputRowWithOptions(sheet, row, '残業', true, ['有', '無'], '開始時間：');
  row = createOvertimeRow(sheet, row, true);
  row = createInputRow(sheet, row, '備考', true, '※みなし残業込みか必ず確認');
  row++;

  // 休日
  row = createSubHeader(sheet, row, '休日');
  row = createInputRow(sheet, row, '休日区分', true, '※完全週休2日制など詳しく');
  row = createHolidayRow(sheet, row, true);
  row = createInputRowWithOptions(sheet, row, '会社カレンダー回収', true, ['有', '無']);
  row = createInputRowWithOptions(sheet, row, '長期休暇', true, ['有', '無'], '詳細：');
  row = createInputRow(sheet, row, '備考', true);
  row++;

  // 給与
  row = createSubHeader(sheet, row, '給与');
  row = createSalaryTypeRow(sheet, row, true);
  row = createInputRow(sheet, row, '給与額', true, '円　※みなし残業込みか確認必須！');
  row = createInputRow(sheet, row, '想定年収', true, '円');
  row = createInputRowWithOptions(sheet, row, '賞与', true, ['有', '無'], '', 'ヶ月分');
  row = createFixedOvertimeRow(sheet, row, true);
  row = createInputRow(sheet, row, '試用期間中給与', true, '円');
  row++;

  // 待遇・福利厚生
  row = createSubHeader(sheet, row, '待遇・福利厚生');
  row = createInsuranceRow(sheet, row, true);
  row = createInputRowLarge(sheet, row, 'その他待遇（アピールポイント）', true, 3);
  row++;

  // 作業内容
  row = createSubHeader(sheet, row, '作業内容');
  row = createInputRowLarge(sheet, row, '作業内容詳細', true, 5);
  row++;

  // 製品・商品・部品（サービス・製品に変更）
  row = createSubHeader(sheet, row, '製品・商品・部品');
  row = createInputRow(sheet, row, 'サービス・製品①', true);
  row = createInputRow(sheet, row, 'サービス・製品②', true);
  row = createInputRow(sheet, row, 'サービス・製品③', true);
  row = createInputRow(sheet, row, '注意点', true);
  row = createInputRow(sheet, row, '備考', true);
  row++;

  // その他基本情報
  row = createSubHeader(sheet, row, 'その他');
  row = createAgeGenderRow(sheet, row, true);
  row = createInputRow(sheet, row, '必須資格', true);
  row = createInputRow(sheet, row, '選考フロー', true, '例：書類選考→面接1回→内定');
  row++;

  // Part② ヒアリング情報
  row = createSectionHeader(sheet, row, 'Part② ヒアリング情報（打ち合わせ時記入）');

  // 会社紹介
  row = createSubHeader(sheet, row, '会社紹介');
  row = createInputRowLarge(sheet, row, '私たちについて', false, 3);
  row = createInputRowLarge(sheet, row, '社長挨拶', false, 3);
  row = createInputRowLarge(sheet, row, '会社の魅力', false, 3);
  row = createInputRowLarge(sheet, row, '雰囲気', false, 3);
  row++;

  // 社員の声
  row = createSubHeader(sheet, row, '社員の声（最低2名）');
  row = createEmployeeVoiceHeader(sheet, row);
  row = createEmployeeVoiceRow(sheet, row, '①');
  row = createEmployeeVoiceRow(sheet, row, '②');
  row = createEmployeeVoiceRow(sheet, row, '③');
  row = createEmployeeVoiceRow(sheet, row, '④');
  row++;

  row = createInterviewQuestions(sheet, row);
  row++;

  // 求人写真
  row = createSubHeader(sheet, row, '求人写真（チェック）');
  row = createPhotoCheckRow(sheet, row);
  row = createInputRow(sheet, row, 'その他アピール社員', false);
  row++;

  // 重要セクション
  row = createImportantSection(sheet, row);
  row++;

  // 募集情報
  row = createSubHeader(sheet, row, '募集情報');
  row = createInputRowLarge(sheet, row, '募集背景', false, 2);
  row = createPersonaRow(sheet, row);
  row = createInputRowLarge(sheet, row, '求める人材像', false, 2);
  row++;

  // 管理情報
  row = createSubHeader(sheet, row, '管理情報');
  row = createDateRow(sheet, row, '商談日');
  row = createDateRow(sheet, row, '受注日');
  row = createDateRow(sheet, row, '掲載予定日', '（通常3週間以内）');
  row++;

  // スカウトメール
  row = createSubHeader(sheet, row, 'スカウトメール設定');
  row = createInputRow(sheet, row, '年齢', false);
  row = createInputRow(sheet, row, 'エリア', false);
  row = createInputRow(sheet, row, '検索キーワード', false);
  row = createInputRowLarge(sheet, row, '備考', false, 2);
  row++;

  // Part③ 処理データ（GASが自動保存するデータ）
  row = createSectionHeader(sheet, row, 'Part③ 処理データ（システム管理）');
  row = createDataStorageRow(sheet, row, '撮影素材フォルダURL');
  row = createDataStorageRow(sheet, row, 'メインフォルダURL');
  row = createDataStorageRowLarge(sheet, row, '文字起こし原文', 5);
  row = createDataStorageRowLarge(sheet, row, '構成案（原稿用）', 8);
  row = createDataStorageRowLarge(sheet, row, '構成案（動画用）', 8);

  // 罫線
  const lastRow = row;
  sheet.getRange(1, 1, lastRow, 7).setBorder(
    true, true, true, true, true, true,
    COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID
  );

  SpreadsheetApp.getUi().alert('✅ テンプレートの初期設定が完了しました');
}

// ===== ヘルパー関数（既存コードを維持） =====

function createSectionHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue(title)
    .setBackground(COLORS.HEADER)
    .setFontColor(COLORS.HEADER_TEXT)
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 30);
  return row + 1;
}

function createSubHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue('▼ ' + title)
    .setBackground('#E8EAF6')
    .setFontColor('#3949AB')
    .setFontSize(10)
    .setFontWeight('bold');
  sheet.setRowHeight(row, 25);
  return row + 1;
}

function createInputRow(sheet, row, label, isCompanyInput, note) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3, 1, 5).merge().setBackground(bgColor);
  if (note) sheet.getRange(row, 3).setNote(note);
  return row + 1;
}

function createInputRowLarge(sheet, row, label, isCompanyInput, height) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2, height, 1).merge().setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold').setVerticalAlignment('top');
  sheet.getRange(row, 3, height, 5).merge().setBackground(bgColor).setVerticalAlignment('top').setWrap(true);
  return row + height;
}

function createInputRowWithOptions(sheet, row, label, isCompanyInput, options, prefix, suffix) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold');
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(options, true).build();
  sheet.getRange(row, 3).setDataValidation(rule).setBackground(bgColor);
  if (prefix) {
    sheet.getRange(row, 4).setValue(prefix).setBackground(COLORS.LABEL);
    sheet.getRange(row, 5, 1, 3).merge().setBackground(bgColor);
  }
  if (suffix) sheet.getRange(row, 6).setValue(suffix).setBackground(COLORS.LABEL);
  return row + 1;
}

function createTimeRow(sheet, row, label, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setBackground(bgColor).setNote('開始時間');
  sheet.getRange(row, 4).setValue('～').setBackground(COLORS.LABEL).setHorizontalAlignment('center');
  sheet.getRange(row, 5).setBackground(bgColor).setNote('終了時間');
  sheet.getRange(row, 6).setValue('実働').setBackground(COLORS.LABEL);
  sheet.getRange(row, 7).setBackground(bgColor).setNote('時間');
  return row + 1;
}

function createBreakTimeRow(sheet, row, label, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setBackground(bgColor).setNote('開始時間');
  sheet.getRange(row, 4).setValue('～').setBackground(COLORS.LABEL).setHorizontalAlignment('center');
  sheet.getRange(row, 5).setBackground(bgColor).setNote('終了時間');
  sheet.getRange(row, 6).setValue('詳細').setBackground(COLORS.LABEL);
  sheet.getRange(row, 7).setBackground(bgColor);
  return row + 1;
}

function createOvertimeRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('残業時間').setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setValue('日').setBackground(COLORS.LABEL);
  sheet.getRange(row, 4).setBackground(bgColor).setNote('時間');
  sheet.getRange(row, 5).setValue('月').setBackground(COLORS.LABEL);
  sheet.getRange(row, 6).setBackground(bgColor).setNote('時間');
  return row + 1;
}

function createHolidayRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('休日日数').setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setValue('月平均').setBackground(COLORS.LABEL);
  sheet.getRange(row, 4).setBackground(bgColor).setNote('日');
  sheet.getRange(row, 5).setValue('年間').setBackground(COLORS.LABEL);
  sheet.getRange(row, 6).setBackground(bgColor).setNote('日');
  return row + 1;
}

function createSalaryTypeRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('給与区分').setBackground(COLORS.LABEL).setFontWeight('bold');
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(['年俸', '月給', '日給', '時給'], true).build();
  sheet.getRange(row, 3).setDataValidation(rule).setBackground(bgColor);
  return row + 1;
}

function createFixedOvertimeRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('みなし/固定残業代').setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setBackground(bgColor).setNote('時間');
  sheet.getRange(row, 4).setValue('h').setBackground(COLORS.LABEL);
  sheet.getRange(row, 5).setBackground(bgColor).setNote('金額');
  sheet.getRange(row, 6).setValue('円').setBackground(COLORS.LABEL);
  return row + 1;
}

function createInsuranceRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(['有', '無'], true).build();
  sheet.getRange(row, 2).setValue('社会保険').setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setValue('雇用保険').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 4).setDataValidation(rule).setBackground(bgColor);
  sheet.getRange(row, 5).setValue('労災保険').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 6).setDataValidation(rule).setBackground(bgColor);
  row++;
  sheet.getRange(row, 2).setBackground(COLORS.LABEL);
  sheet.getRange(row, 3).setValue('厚生年金').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 4).setDataValidation(rule).setBackground(bgColor);
  sheet.getRange(row, 5).setValue('健康保険').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 6).setDataValidation(rule).setBackground(bgColor);
  return row + 1;
}

function createAgeGenderRow(sheet, row, isCompanyInput) {
  const bgColor = isCompanyInput ? COLORS.COMPANY_INPUT : COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('平均年齢・男女比').setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setValue('平均').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 4).setBackground(bgColor).setNote('歳');
  sheet.getRange(row, 5).setValue('男:女').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 6).setBackground(bgColor);
  return row + 1;
}

function createEmployeeVoiceHeader(sheet, row) {
  sheet.getRange(row, 2).setValue('No').setBackground(COLORS.LABEL).setFontWeight('bold').setFontSize(9);
  sheet.getRange(row, 3).setValue('氏名').setBackground(COLORS.LABEL).setFontWeight('bold').setFontSize(9);
  sheet.getRange(row, 4).setValue('部署').setBackground(COLORS.LABEL).setFontWeight('bold').setFontSize(9);
  sheet.getRange(row, 5).setValue('年数').setBackground(COLORS.LABEL).setFontWeight('bold').setFontSize(9);
  sheet.getRange(row, 6, 1, 2).merge().setValue('インタビュー内容').setBackground(COLORS.LABEL).setFontWeight('bold').setFontSize(9);
  return row + 1;
}

function createEmployeeVoiceRow(sheet, row, num) {
  const bgColor = COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(num).setBackground(COLORS.LABEL);
  sheet.getRange(row, 3).setBackground(bgColor).setNote('さん');
  sheet.getRange(row, 4).setBackground(bgColor);
  sheet.getRange(row, 5).setBackground(bgColor).setNote('年目');
  sheet.getRange(row, 6, 1, 2).merge().setBackground(bgColor);
  return row + 1;
}

function createInterviewQuestions(sheet, row) {
  sheet.getRange(row, 2, 1, 6).merge()
    .setValue('【参考質問】①やりがいを感じるポイント ②会社の雰囲気で良いところ ③働きやすさのポイント')
    .setBackground('#FFF9C4').setFontSize(9).setFontColor('#666666');
  return row + 1;
}

function createPhotoCheckRow(sheet, row) {
  const bgColor = COLORS.INTERNAL_INPUT;
  const items1 = ['若手社員', '女性社員', '製品・部品', '現場'];
  const items2 = ['事務員', '会社ロゴ', 'イベント', '乗り物'];
  sheet.getRange(row, 2).setValue('写真①').setBackground(COLORS.LABEL).setFontWeight('bold');
  let col = 3;
  items1.forEach(item => { sheet.getRange(row, col).setValue('☐ ' + item).setBackground(bgColor).setFontSize(9); col++; });
  row++;
  sheet.getRange(row, 2).setValue('写真②').setBackground(COLORS.LABEL).setFontWeight('bold');
  col = 3;
  items2.forEach(item => { sheet.getRange(row, col).setValue('☐ ' + item).setBackground(bgColor).setFontSize(9); col++; });
  return row + 1;
}

function createImportantSection(sheet, row) {
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue('★★★ 原稿で最も打ち出していきたいポイント ★★★')
    .setBackground(COLORS.IMPORTANT).setFontColor('#C62828').setFontSize(11).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(row, 30);
  row++;
  sheet.getRange(row, 1, 4, 7).merge().setBackground('#FFEBEE').setVerticalAlignment('top').setWrap(true);
  sheet.setRowHeight(row, 25); sheet.setRowHeight(row + 1, 25); sheet.setRowHeight(row + 2, 25); sheet.setRowHeight(row + 3, 25);
  return row + 4;
}

function createPersonaRow(sheet, row) {
  const bgColor = COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue('ペルソナ設定').setBackground(COLORS.LABEL).setFontWeight('bold');
  const genderRule = SpreadsheetApp.newDataValidation().requireValueInList(['男', '女', 'どちらでも'], true).build();
  sheet.getRange(row, 3).setDataValidation(genderRule).setBackground(bgColor);
  sheet.getRange(row, 4).setValue('年齢').setBackground(COLORS.LABEL).setFontSize(9);
  sheet.getRange(row, 5).setBackground(bgColor);
  sheet.getRange(row, 6).setValue('外国人').setBackground(COLORS.LABEL).setFontSize(9);
  const foreignRule = SpreadsheetApp.newDataValidation().requireValueInList(['可', '不可'], true).build();
  sheet.getRange(row, 7).setDataValidation(foreignRule).setBackground(bgColor);
  return row + 1;
}

function createDateRow(sheet, row, label, note) {
  const bgColor = COLORS.INTERNAL_INPUT;
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS.LABEL).setFontWeight('bold');
  sheet.getRange(row, 3).setBackground(bgColor).setNumberFormat('yyyy/mm/dd');
  if (note) sheet.getRange(row, 4, 1, 4).merge().setValue(note).setBackground(COLORS.LABEL).setFontSize(9).setFontColor('#666666');
  return row + 1;
}

// ===== Part③ 処理データ用ヘルパー関数 =====
const COLORS_DATA_STORAGE = {
  HEADER: '#616161',       // ダークグレー
  HEADER_TEXT: '#FFFFFF',
  LABEL: '#9e9e9e',        // グレー
  VALUE: '#e0e0e0',        // ライトグレー
};

function createDataStorageRow(sheet, row, label) {
  sheet.getRange(row, 2).setValue(label).setBackground(COLORS_DATA_STORAGE.LABEL).setFontWeight('bold').setFontColor('#333');
  sheet.getRange(row, 3, 1, 5).merge().setBackground(COLORS_DATA_STORAGE.VALUE).setFontColor('#333');
  return row + 1;
}

function createDataStorageRowLarge(sheet, row, label, height) {
  sheet.getRange(row, 2, height, 1).merge().setValue(label).setBackground(COLORS_DATA_STORAGE.LABEL).setFontWeight('bold').setVerticalAlignment('top').setFontColor('#333');
  sheet.getRange(row, 3, height, 5).merge().setBackground(COLORS_DATA_STORAGE.VALUE).setVerticalAlignment('top').setWrap(true).setFontColor('#333');
  return row + height;
}

function formatCurrentSheet() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert('確認', '現在のシートにテンプレートのフォーマットを適用しますか？\n※既存のデータは保持されます', ui.ButtonSet.YES_NO);
  if (result === ui.Button.YES) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow > 0 && lastCol > 0) {
      sheet.getRange(1, 1, lastRow, lastCol).setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
    }
    ui.alert('✅ フォーマットを適用しました');
  }
}

// ===== AI出力関数（既存コードを維持） =====

function getSheetData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const result = { 出力日時: new Date().toLocaleString('ja-JP'), シート名: sheet.getName(), Part1_基本情報: {}, Part2_ヒアリング情報: {} };
  let currentPart = "", currentSection = "";

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const col0 = clean(row[0]), col1 = clean(row[1]), col2 = clean(row[2]), col3 = clean(row[3]), col4 = clean(row[4]), col5 = clean(row[5]);

    if (col0.includes("Part①") || col0.includes("Part1")) { currentPart = "Part1"; continue; }
    if (col0.includes("Part②") || col0.includes("Part2")) { currentPart = "Part2"; continue; }
    if (col0.startsWith("▼")) {
      currentSection = col0.replace("▼", "").trim();
      if (currentPart === "Part1") result.Part1_基本情報[currentSection] = {};
      else if (currentPart === "Part2") result.Part2_ヒアリング情報[currentSection] = {};
      continue;
    }
    if (col0.includes("🟨") || col0.includes("🟦") || col0.includes("【参考") || col0.includes("原稿ヒアリングシート") || col0.includes("★★★")) continue;
    if (col1 === "No" && col2 === "氏名") continue;
    if (!col0 && !col1) continue;

    if (currentPart === "Part1" && currentSection) parsePart1New(result.Part1_基本情報[currentSection], col1, col2, col3, col4, col5);
    if (currentPart === "Part2" && currentSection) parsePart2New(result.Part2_ヒアリング情報, currentSection, col0, col1, col2, col3, col4, col5);
  }

  cleanupEmptyValues(result);
  return result;
}

function parsePart1New(target, col1, col2, col3, col4, col5) {
  if (!col1 || !target) return;
  if (col1.includes("勤務時間") || col1.includes("休憩時間")) { if (col2 || col4) target[col1] = { "開始": col2, "終了": col4 }; return; }
  if (col1 === "残業時間") { target["残業時間"] = { "日": col2, "月": col4 }; return; }
  if (col1 === "休日日数") { target["休日日数"] = { "月平均": col2, "年間": col4 }; return; }
  if (col1.includes("みなし") || col1.includes("固定残業")) { target["みなし_固定残業代"] = { "時間": col2, "金額": col4 }; return; }
  if (col1 === "雇用保険") { if (!target["社会保険"]) target["社会保険"] = {}; target["社会保険"]["雇用保険"] = col2; target["社会保険"]["労災保険"] = col4; return; }
  if (col1 === "厚生年金") { if (!target["社会保険"]) target["社会保険"] = {}; target["社会保険"]["厚生年金"] = col2; target["社会保険"]["健康保険"] = col4; return; }
  if (col1.startsWith("製品") || col1.startsWith("サービス")) { target[col1] = { "内容": col2, "重さ_サイズ": col4 }; return; }
  if (col1.includes("平均年齢") || col1.includes("男女比")) { target["平均年齢"] = col2; target["男女比"] = col4; return; }
  if (col1 === "試用期間") { target["試用期間"] = { "有無": col2, "期間": col4 }; return; }
  if (col1 === "転勤") { target["転勤"] = col2; if (col4) target["転勤先"] = col4; return; }
  if (col1 === "残業") { target["残業"] = col2; if (col4) target["開始時間"] = col4; return; }
  if (col1 === "長期休暇") { target["長期休暇"] = col2; if (col4) target["長期休暇詳細"] = col4; return; }
  if (col1 === "賞与") { target["賞与"] = col2; if (col4) target["賞与月数"] = col4; return; }
  if (col2) target[col1] = col2;
}

function parsePart2New(target, section, col0, col1, col2, col3, col4, col5) {
  const sectionTarget = target[section];
  if (!sectionTarget) return;
  if (section.includes("社員の声")) {
    if (!target["社員の声"]) target["社員の声"] = [];
    if (col1 === "①" || col1 === "②" || col1 === "③" || col1 === "④") {
      if (col2 || col5) target["社員の声"].push({ "No": col1, "氏名": col2, "部署": col3, "年数": col4, "インタビュー内容": col5 });
    }
    return;
  }
  if (section.includes("求人写真")) {
    if (col1.startsWith("写真")) { const checked = [col2, col3, col4, col5].filter(v => v && v.includes("☑")).join(", "); if (checked) sectionTarget[col1] = checked; }
    else if (col1.includes("その他") || col1.includes("アピール")) { if (col2) sectionTarget["その他アピール"] = col2; }
    return;
  }
  if (col1 === "ペルソナ設定") { sectionTarget["ペルソナ設定"] = { "性別": col2, "年齢": col4, "外国人": col5 || "" }; return; }
  if (col1 && col2) sectionTarget[col1] = col2;
}

function clean(val) {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();
  if (str === "～" || str === "h" || str === "円" || str === "歳" || str === "日" || str === "年目" || str === "さん" || str === "ヶ月" || str === "実働" || str === "詳細" || str === "月平均" || str === "年間") return "";
  return str;
}

function cleanupEmptyValues(obj) {
  for (const key in obj) {
    const val = obj[key];
    if (val === null || val === undefined || val === "") delete obj[key];
    else if (Array.isArray(val)) { if (val.length === 0) delete obj[key]; }
    else if (typeof val === "object") { cleanupEmptyValues(val); if (Object.keys(val).length === 0) delete obj[key]; }
  }
}

function downloadAsJson() {
  const data = getSheetData();
  const json = JSON.stringify(data, null, 2);
  const companyName = data.Part1_基本情報?.企業概要?.企業名 || "未設定";
  const fileName = "ヒアリングシート_" + companyName + "_" + formatDate(new Date()) + ".json";
  showDownloadDialog(json, fileName, 'JSON');
}

function downloadAsText() {
  const data = getSheetData();
  const text = convertToText(data);
  const companyName = data.Part1_基本情報?.企業概要?.企業名 || "未設定";
  const fileName = "ヒアリングシート_" + companyName + "_" + formatDate(new Date()) + ".txt";
  showDownloadDialog(text, fileName, 'テキスト');
}

function showDownloadDialog(content, fileName, formatName) {
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>body{font-family:sans-serif;padding:20px}button{padding:12px 24px;margin:5px;border:none;border-radius:6px;cursor:pointer}.primary{background:#4285f4;color:#fff}.secondary{background:#f1f3f4;color:#333}textarea{width:100%;height:320px;margin-top:15px;font-family:monospace;font-size:12px}.msg{color:#0d904f;margin-top:10px;display:none}</style></head><body><h3>📄 ' + formatName + 'データ出力完了</h3><button class="primary" onclick="dl()">💾 ダウンロード</button><button class="secondary" onclick="cp()">📋 コピー</button><div class="msg" id="msg">✓ コピーしました</div><textarea id="c" readonly>' + escaped + '</textarea><script>const c=' + JSON.stringify(content) + ',f=' + JSON.stringify(fileName) + ';function dl(){const b=new Blob([c],{type:"text/plain;charset=utf-8"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=f;a.click()}function cp(){navigator.clipboard.writeText(c).then(()=>{document.getElementById("msg").style.display="block";setTimeout(()=>{document.getElementById("msg").style.display="none"},2000)})}</script></body></html>'
  ).setWidth(650).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, 'AI用データ出力');
}

function convertToText(data, indent) {
  indent = indent || 0;
  let text = "";
  const pre = "  ".repeat(indent);
  for (const key in data) {
    const val = data[key];
    if (val === null || val === undefined || val === "") continue;
    if (Array.isArray(val)) {
      text += pre + "【" + key + "】\n";
      val.forEach(function(item, i) {
        if (typeof item === "object") text += pre + "  [" + (i + 1) + "]\n" + convertToText(item, indent + 2);
        else text += pre + "  • " + item + "\n";
      });
    } else if (typeof val === "object") {
      text += pre + "【" + key + "】\n" + convertToText(val, indent + 1);
    } else {
      text += pre + key + ": " + val + "\n";
    }
  }
  return text;
}

function formatDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
}

function debugSheetDataFull() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  let output = "=== シート構造確認 ===\n\nシート名: " + sheet.getName() + "\n行数: " + data.length + "\n列数: " + (data[0] ? data[0].length : 0) + "\n\n";
  for (let i = 0; i < Math.min(30, data.length); i++) {
    output += "--- 行" + (i + 1) + " ---\n";
    for (let j = 0; j < Math.min(6, data[i].length); j++) {
      const c = String(data[i][j] || "").trim();
      if (c) output += "  [" + j + "] " + c.substring(0, 50) + "\n";
    }
    output += "\n";
  }
  const html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:400px">' + output.replace(/</g, '&lt;') + '</textarea>').setWidth(700).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'デバッグ');
}
