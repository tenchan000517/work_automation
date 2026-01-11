/**
 * 文字起こし → ヒアリングシート転記 GAS
 *
 * 【機能】
 * 1. 文字起こしを整理 - プロンプト生成（文字起こし + テンプレート）
 * 2. AI出力を転記 - JSON形式のAI出力をヒアリングシートに転記
 * 3. 差分確認UI - 既存値との比較・選択的上書き
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 */

// ===== Part② マッピング =====
// 文字起こしから抽出する項目 → ヒアリングシート（行, 列）
// ※setupTemplate()の行番号を追跡して算出
const TRANSCRIPT_TO_SHEET_MAPPING = {
  // 会社紹介セクション（Part② ヒアリング情報）
  // Part② starts at row 81, 会社紹介 subheader at row 82
  '私たちについて': { row: 83, col: 3 },   // 行83
  '社長挨拶': { row: 86, col: 3 },         // 行86
  '会社の魅力': { row: 89, col: 3 },       // 行89
  '雰囲気': { row: 92, col: 3 },           // 行92

  // 社員の声セクション（row 96 header, row 97 column header）
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

  // 最も打ち出したいポイント（row 110 header, row 111 data）
  '最も打ち出したいポイント': { row: 111, col: 1 },

  // 募集情報セクション（row 116 header）
  '募集背景': { row: 117, col: 3 },        // 行117
  'ペルソナ_性別': { row: 119, col: 3 },   // 行119, C列（男/女/どちらでも）
  'ペルソナ_年齢': { row: 119, col: 5 },   // 行119, E列（D列は項目名）
  'ペルソナ_外国人': { row: 119, col: 7 }, // 行119, G列（F列は項目名）
  '求める人材像': { row: 120, col: 3 },    // 行120

  // スカウトメール設定（row 128 header）
  'スカウト_年齢': { row: 129, col: 3 },       // 行129
  'スカウト_エリア': { row: 130, col: 3 },     // 行130
  'スカウト_キーワード': { row: 131, col: 3 }, // 行131
  'スカウト_備考': { row: 132, col: 3 },       // 行132
};


// ===== メニュー追加 =====
function addTranscriptMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('４.📝 文字起こし整理・転記')
    .addItem('📋 文字起こしを整理（プロンプト生成）', 'showTranscriptPromptDialog')
    .addItem('📥 AI出力を転記', 'showTransferFromAIDialog')
    .addSeparator()
    .addItem('🔧 マッピング確認', 'showMappingDebug')
    .addToUi();
}

// 既存のonOpenに統合する場合
function addTranscriptMenuToExisting(ui) {
  ui.createMenu('４.📝 議事録作成・報告プロンプト')
    .addItem('📋 文字起こしを整理（プロンプト生成）', 'showTranscriptPromptDialog')
    .addItem('📥 AI出力を転記', 'showTransferFromAIDialog')
    .addSeparator()
    .addItem('🔧 マッピング確認', 'showMappingDebug')
    .addToUi();
}

// ===== プロンプトシートからテンプレート読み込み =====

/**
 * プロンプトシートから「ヒアリング情報抽出」テンプレートを取得
 * @returns {Object} { success, template, error }
 */
function getTranscriptPromptFromSheet() {
  const PROMPT_NAME = 'ヒアリング情報抽出';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) {
    return {
      success: false,
      error: '「プロンプト」シートがありません。\n\n' +
             'メニュー「📝 プロンプト」→「📄 プロンプトシートを作成」を実行してください。'
    };
  }

  const data = sheet.getDataRange().getValues();

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // A列（プロンプト名）が一致し、E列（テンプレート）が存在する場合
    if (row[0] === PROMPT_NAME && row[4]) {
      return { success: true, template: row[4] };
    }
  }

  // 見つからない場合はエラー
  return {
    success: false,
    error: 'プロンプトシートに「' + PROMPT_NAME + '」がありません。\n\n' +
           'プロンプトシートに以下の行を追加してください：\n' +
           'A列: ヒアリング情報抽出\n' +
           'E列: プロンプトテンプレート'
  };
}

// ===== 1. 文字起こしを整理（プロンプト生成） =====
function showTranscriptPromptDialog() {
  // プロンプトシートからテンプレートを取得
  const promptData = getTranscriptPromptFromSheet();

  // エラーの場合はアラートを表示して終了
  if (!promptData.success) {
    SpreadsheetApp.getUi().alert('エラー', promptData.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // 設定シートから担当者情報を取得してプレースホルダーを置換
  const settings = getSettingsFromSheet();
  if (!settings.error) {
    promptData.template = replacePlaceholders(promptData.template, settings);
  }

  // 企業シート一覧を取得（保存済みデータ含む）
  const sheetData = getCompanySheetListWithNamesAndData();

  const html = HtmlService.createHtmlOutput(createTranscriptPromptHTML(sheetData, promptData.template))
    .setWidth(800)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 文字起こしを整理');
}

/**
 * 企業シート一覧を取得（企業名・保存済みデータ付き）
 */
function getCompanySheetListWithNamesAndData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(5, 3).getValue() || '').trim();

      // Part③から保存済みデータを取得
      let savedTranscript = '';
      try {
        const result = loadPart3Data(sheetName, '文字起こし原文');
        if (result.success) {
          savedTranscript = result.value;
        }
      } catch (e) {
        savedTranscript = '';
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedTranscript: savedTranscript,
        hasSavedData: !!savedTranscript
      });
    }
  });

  const isActiveCompanySheet = companySheets.some(s => s.sheetName === activeSheetName);

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: isActiveCompanySheet,
    companySheets: companySheets
  };
}

/**
 * 企業シート一覧を取得（企業名付き）
 */
function getCompanySheetListWithNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  // 全シートを取得し、除外シートをフィルタ（settingsSheet.js の isExcludedSheet() を使用）
  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!isExcludedSheet(sheetName)) {
      // 企業名を取得（行5, C列）
      const companyName = String(sheet.getRange(5, 3).getValue() || '').trim();
      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName  // 企業名がなければシート名を使用
      });
    }
  });

  // アクティブシートが企業シートかどうか
  const isActiveCompanySheet = companySheets.some(s => s.sheetName === activeSheetName);

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: isActiveCompanySheet,
    companySheets: companySheets
  };
}

function createTranscriptPromptHTML(sheetData, template) {
  const escapedTemplate = template
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const sheetDataJson = JSON.stringify(sheetData);
  const templateJson = JSON.stringify(template);

  return `
<!DOCTYPE html>
<html>
<head>
  ${CI_DIALOG_STYLES}
  <style>
    /* transcriptPrompt固有スタイル */
    h3 { margin-top: 0; color: #1a73e8; }
    textarea { width: 100%; font-family: monospace; font-size: 13px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; resize: vertical; }
    button { padding: 12px 24px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .primary { background: #1a73e8; color: white; }
    .primary:hover { background: #1557b0; }
    .secondary { background: #f1f3f4; color: #333; }
    .secondary:hover { background: #e8eaed; }
    .success { background: #34a853; color: white; }
    .save-btn { background: #ff9800; color: white; padding: 8px 16px; font-size: 13px; }
    .save-btn:hover { background: #f57c00; }
    .msg { padding: 10px; border-radius: 6px; margin-top: 10px; display: none; }
    .msg.success { background: #e6f4ea; color: #1e7e34; display: block; }
    .msg.error { background: #fce8e6; color: #c5221f; display: block; }
    .msg.info { background: #e3f2fd; color: #1565c0; display: block; }
    .btn-group { display: flex; gap: 10px; flex-wrap: wrap; }
    .accordion { background: #f1f3f4; border: none; padding: 12px 16px; width: 100%; text-align: left; cursor: pointer; border-radius: 6px; margin-bottom: 10px; }
    .accordion:hover { background: #e8eaed; }
    .accordion-content.show { display: block; }
    /* シート選択UI */
    .sheet-select-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ddd; }
    .sheet-select-title { font-weight: bold; margin-bottom: 10px; color: #333; }
    .sheet-list { max-height: 120px; overflow-y: auto; }
    .sheet-option { display: flex; align-items: center; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; }
    .sheet-option:hover { background: #e3f2fd; }
    .sheet-option.selected { background: #bbdefb; }
    .sheet-option.has-data { border-left: 3px solid #ff9800; }
    .sheet-option input[type="radio"] { margin-right: 10px; width: 16px; height: 16px; }
    .sheet-option label { cursor: pointer; flex: 1; }
    .saved-badge { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .company-name-display { background: #e8f0fe; padding: 10px; border-radius: 6px; margin-top: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <h3>📋 文字起こしを整理</h3>

  <!-- シート選択UI -->
  <div class="sheet-select-box">
    <div class="sheet-select-title">📄 対象企業を選択</div>
    <div id="sheetList" class="sheet-list"></div>
    <div id="companyNameDisplay" class="company-name-display"></div>
  </div>

  <button class="accordion" onclick="toggleAccordion(this)">▶ プロンプトテンプレートを表示</button>
  <div class="accordion-content">
    <pre style="white-space: pre-wrap; font-size: 12px;">${escapedTemplate}</pre>
    <button class="secondary" onclick="copyTemplate()">📋 テンプレートのみコピー</button>
  </div>

  <div class="section">
    <div class="section-title">
      文字起こしを貼り付け
      <button class="save-btn" onclick="saveTranscript()">💾 シートに保存</button>
    </div>
    <textarea id="transcriptInput" class="input-area" placeholder="NOTTAからダウンロードした文字起こしテキストを貼り付けてください..."></textarea>
    <div class="note">※ 60分程度の打ち合わせの文字起こしを想定 ｜ 保存すると次回自動読み込み</div>
  </div>

  <div class="btn-group">
    <button class="primary" onclick="generatePrompt()">🔄 プロンプト生成</button>
    <button class="success" onclick="copyOutput()">📋 完成版をコピー</button>
    <button class="secondary" onclick="clearAll()">クリア</button>
  </div>

  <div id="msg" class="msg"></div>

  <div class="section" style="margin-top: 15px;">
    <div class="section-title">完成版プロンプト（AIに貼り付け）</div>
    <textarea id="outputArea" class="output-area" readonly placeholder="上の「プロンプト生成」ボタンをクリックすると、ここに完成版が表示されます"></textarea>
  </div>

  <script>
    const template = ${templateJson};
    const sheetData = ${sheetDataJson};
    let selectedCompanyName = '';
    let selectedSheetName = '';

    // 初期化
    document.addEventListener('DOMContentLoaded', function() {
      renderSheetList();
    });

    function renderSheetList() {
      const container = document.getElementById('sheetList');
      const sheets = sheetData.companySheets;
      const activeSheet = sheetData.activeSheetName;
      const isActiveCompanySheet = sheetData.isActiveCompanySheet;

      if (sheets.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:10px;">企業シートがありません</div>';
        return;
      }

      let html = '';

      // アクティブシートが企業シートの場合、一番上に表示
      if (isActiveCompanySheet) {
        const activeSheetData = sheets.find(s => s.sheetName === activeSheet);
        selectedCompanyName = activeSheetData ? activeSheetData.companyName : '';
        selectedSheetName = activeSheet;
        html += createSheetOption(activeSheetData, true, true);

        // 保存済みデータがあれば読み込む
        if (activeSheetData && activeSheetData.savedTranscript) {
          document.getElementById('transcriptInput').value = activeSheetData.savedTranscript;
          showMsg('保存済みの文字起こしを読み込みました', 'info');
        }

        // 他のシート
        sheets.filter(s => s.sheetName !== activeSheet).forEach(sheet => {
          html += createSheetOption(sheet, false, false);
        });
      } else {
        // アクティブシートが企業シートでない場合、最初のシートを選択
        const firstSheet = sheets[0];
        selectedCompanyName = firstSheet ? firstSheet.companyName : '';
        selectedSheetName = firstSheet ? firstSheet.sheetName : '';
        sheets.forEach((sheet, index) => {
          html += createSheetOption(sheet, index === 0, false);
        });

        // 最初のシートの保存済みデータを読み込む
        if (firstSheet && firstSheet.savedTranscript) {
          document.getElementById('transcriptInput').value = firstSheet.savedTranscript;
          showMsg('保存済みの文字起こしを読み込みました', 'info');
        }
      }

      container.innerHTML = html;
      updateCompanyNameDisplay();
    }

    function createSheetOption(sheet, isSelected, isActive) {
      const checked = isSelected ? 'checked' : '';
      const selectedClass = isSelected ? 'selected' : '';
      const hasDataClass = sheet.hasSavedData ? 'has-data' : '';
      const activeBadge = isActive ? '<span class="active-badge">アクティブ</span>' : '';
      const savedBadge = sheet.hasSavedData ? '<span class="saved-badge">保存済み</span>' : '';

      return \`
        <div class="sheet-option \${selectedClass} \${hasDataClass}" onclick="selectSheet('\${escapeHtml(sheet.sheetName)}', '\${escapeHtml(sheet.companyName)}', '\${escapeHtml(sheet.savedTranscript || '')}', this)">
          <input type="radio" name="targetSheet" value="\${escapeHtml(sheet.sheetName)}" \${checked}>
          <label>\${escapeHtml(sheet.sheetName)}\${activeBadge}\${savedBadge}</label>
        </div>
      \`;
    }

    function selectSheet(sheetName, companyName, savedTranscript, element) {
      document.querySelectorAll('.sheet-option').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.sheet-option input[type="radio"]').forEach(el => el.checked = false);

      element.classList.add('selected');
      element.querySelector('input[type="radio"]').checked = true;
      selectedCompanyName = companyName;
      selectedSheetName = sheetName;
      updateCompanyNameDisplay();

      // 保存済みデータがあれば読み込む（現在の入力があれば確認）
      const currentInput = document.getElementById('transcriptInput').value.trim();
      if (savedTranscript) {
        if (currentInput && currentInput !== savedTranscript) {
          if (confirm('保存済みの文字起こしを読み込みますか？\\n（現在の入力は破棄されます）')) {
            document.getElementById('transcriptInput').value = savedTranscript;
            showMsg('保存済みの文字起こしを読み込みました', 'info');
          }
        } else {
          document.getElementById('transcriptInput').value = savedTranscript;
          showMsg('保存済みの文字起こしを読み込みました', 'info');
        }
      }
    }

    function updateCompanyNameDisplay() {
      const display = document.getElementById('companyNameDisplay');
      if (selectedCompanyName) {
        display.innerHTML = '🏢 企業名: <strong>' + escapeHtml(selectedCompanyName) + '</strong>（プロンプトに自動挿入されます）';
        display.style.display = 'block';
      } else {
        display.style.display = 'none';
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function toggleAccordion(btn) {
      const content = btn.nextElementSibling;
      const isOpen = content.classList.contains('show');
      content.classList.toggle('show');
      btn.textContent = (isOpen ? '▶' : '▼') + ' プロンプトテンプレートを表示';
    }

    function copyTemplate() {
      navigator.clipboard.writeText(template).then(() => {
        showMsg('テンプレートをコピーしました', 'success');
      });
    }

    function saveTranscript() {
      if (!selectedSheetName) {
        showMsg('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('transcriptInput').value.trim();
      if (!input) {
        showMsg('文字起こしを入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showMsg('💾 文字起こしを企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showMsg('💾 文字起こしを上書き保存しました', 'success');
                  else showMsg('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, '文字起こし原文', input);
            }
          } else {
            showMsg('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showMsg('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, '文字起こし原文', input, true);
    }

    function generatePrompt() {
      if (!selectedCompanyName) {
        showMsg('企業を選択してください', 'error');
        return;
      }
      const input = document.getElementById('transcriptInput').value.trim();
      if (!input) {
        showMsg('文字起こしを入力してください', 'error');
        return;
      }

      // 企業名をプロンプトに追加
      const companyHeader = '【対象企業】' + selectedCompanyName + '\\n\\n';
      const output = companyHeader + template.replace('{{input}}', input);

      document.getElementById('outputArea').value = output;
      showMsg('プロンプトを生成しました。「完成版をコピー」でAIに貼り付けてください', 'success');
    }

    function copyOutput() {
      const output = document.getElementById('outputArea').value;
      if (!output) {
        showMsg('先にプロンプトを生成してください', 'error');
        return;
      }
      navigator.clipboard.writeText(output).then(() => {
        showMsg('コピーしました！AIに貼り付けて実行してください', 'success');
      });
    }

    function clearAll() {
      document.getElementById('transcriptInput').value = '';
      document.getElementById('outputArea').value = '';
      showMsg('', '');
    }

    function showMsg(text, type) {
      const msg = document.getElementById('msg');
      msg.textContent = text;
      msg.className = 'msg ' + type;
    }
  </script>
</body>
</html>
  `;
}

// ===== 2. AI出力を転記 =====
function showTransferFromAIDialog() {
  // 企業シート一覧を取得
  const sheetData = getCompanySheetList();
  const html = HtmlService.createHtmlOutput(createTransferFromAIHTML(sheetData))
    .setWidth(900)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 AI出力を転記');
}

/**
 * 企業シート一覧を取得
 * settingsSheet.js の isExcludedSheet() を使用
 */
function getCompanySheetList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  // 全シートを取得し、除外シートをフィルタ
  const allSheets = ss.getSheets();
  const companySheets = allSheets
    .map(sheet => sheet.getName())
    .filter(name => !isExcludedSheet(name));

  // アクティブシートが企業シートかどうか
  const isActiveCompanySheet = companySheets.includes(activeSheetName);

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: isActiveCompanySheet,
    companySheets: companySheets
  };
}

function createTransferFromAIHTML(sheetData) {
  // シート一覧をJSON文字列に変換
  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  ${CI_DIALOG_STYLES}
  <style>
    /* transferFromAI固有スタイル */
    h3 { margin-top: 0; color: #1a73e8; }
    textarea { width: 100%; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    button { padding: 10px 20px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .primary { background: #1a73e8; color: white; }
    .primary:hover { background: #1557b0; }
    .secondary { background: #f1f3f4; color: #333; }
    .danger { background: #ea4335; color: white; }
    .success { background: #34a853; color: white; }
    .msg { padding: 10px; border-radius: 6px; margin: 10px 0; }
    .msg.success { background: #e6f4ea; color: #1e7e34; }
    .msg.error { background: #fce8e6; color: #c5221f; }
    .msg.warning { background: #fef7e0; color: #856404; }
    .diff-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .diff-table th, .diff-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .diff-table th { background: #f8f9fa; position: sticky; top: 0; }
    .diff-table tr:nth-child(even) { background: #f8f9fa; }
    .diff-row { cursor: pointer; }
    .diff-row:hover { background: #e3f2fd !important; }
    .diff-row.selected { background: #bbdefb !important; }
    .diff-row.conflict { background: #fff3e0 !important; }
    .current-val { color: #666; font-size: 11px; }
    .new-val { color: #1a73e8; }
    .diff-container { max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; }
    .btn-group { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
    .sheet-info { background: #e8f0fe; padding: 10px; border-radius: 6px; margin-bottom: 15px; }
    .checkbox-col { width: 40px; text-align: center; }
    input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .action-btns { position: sticky; bottom: 0; background: white; padding: 15px 0; border-top: 1px solid #ddd; }
    .edit-input { width: 100%; padding: 4px; font-size: 12px; }
    /* シート選択UI */
    .sheet-select-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ddd; }
    .sheet-select-title { font-weight: bold; margin-bottom: 10px; color: #333; display: flex; align-items: center; gap: 8px; }
    .sheet-list { max-height: 150px; overflow-y: auto; }
    .sheet-option { display: flex; align-items: center; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; }
    .sheet-option:hover { background: #e3f2fd; }
    .sheet-option.selected { background: #bbdefb; }
    .sheet-option input[type="radio"] { margin-right: 10px; width: 16px; height: 16px; }
    .sheet-option label { cursor: pointer; flex: 1; }
    .no-sheets-msg { color: #666; font-style: italic; padding: 10px; }
    .sheet-warning { background: #fff3e0; border: 1px solid #ffcc80; padding: 10px; border-radius: 6px; margin-top: 10px; color: #e65100; display: none; }
  </style>
</head>
<body>
  <h3>📥 AI出力を転記</h3>

  <div id="step1">
    <!-- シート選択UI -->
    <div class="sheet-select-box">
      <div class="sheet-select-title">
        📄 転記先シートを選択
      </div>
      <div id="sheetList" class="sheet-list"></div>
      <div id="sheetWarning" class="sheet-warning"></div>
    </div>

    <div class="section">
      <div class="section-title">AIが出力したJSONを貼り付け</div>
      <textarea id="jsonInput" class="input-area" placeholder='{"企業名": "株式会社○○", "会社紹介": {...}, ...}'></textarea>
    </div>
    <div class="btn-group">
      <button class="primary" onclick="parseAndCompare()">🔍 解析して比較</button>
      <button class="secondary" onclick="google.script.host.close()">閉じる</button>
    </div>
    <div id="parseMsg" class="msg" style="display:none;"></div>
  </div>

  <div id="step2" style="display:none;">
    <div class="sheet-info" id="sheetInfo"></div>

    <div id="confirmMsg" class="msg warning" style="display:none;"></div>

    <div class="section-title">転記内容の確認（チェックした項目のみ転記）</div>
    <div class="diff-container">
      <table class="diff-table">
        <thead>
          <tr>
            <th class="checkbox-col"><input type="checkbox" id="selectAll" onchange="toggleAll(this.checked)" checked></th>
            <th style="width:25%">項目</th>
            <th style="width:35%">現在の値</th>
            <th style="width:35%">新しい値（編集可）</th>
          </tr>
        </thead>
        <tbody id="diffBody"></tbody>
      </table>
    </div>

    <div class="action-btns">
      <div class="btn-group">
        <button class="success" onclick="executeTransfer()">✅ チェック項目を転記</button>
        <button class="secondary" onclick="goBack()">← 戻る</button>
        <button class="secondary" onclick="google.script.host.close()">閉じる</button>
      </div>
    </div>
    <div id="resultMsg" class="msg" style="display:none;"></div>
  </div>

  <script>
    let parsedData = null;
    let diffItems = [];
    let selectedSheetName = '';
    const sheetData = ${sheetDataJson};

    // 初期化：シート一覧を表示
    document.addEventListener('DOMContentLoaded', function() {
      renderSheetList();
    });

    function renderSheetList() {
      const container = document.getElementById('sheetList');
      const sheets = sheetData.companySheets;
      const activeSheet = sheetData.activeSheetName;
      const isActiveCompanySheet = sheetData.isActiveCompanySheet;

      if (sheets.length === 0) {
        container.innerHTML = '<div class="no-sheets-msg">転記可能なシートがありません</div>';
        return;
      }

      let html = '';

      // アクティブシートが企業シートの場合、一番上に表示
      if (isActiveCompanySheet) {
        selectedSheetName = activeSheet;
        html += createSheetOption(activeSheet, true, true);

        // 他のシート
        sheets.filter(s => s !== activeSheet).forEach(sheetName => {
          html += createSheetOption(sheetName, false, false);
        });
      } else {
        // アクティブシートが企業シートでない場合、最初のシートを選択
        selectedSheetName = sheets[0] || '';
        sheets.forEach((sheetName, index) => {
          html += createSheetOption(sheetName, index === 0, false);
        });
      }

      container.innerHTML = html;
    }

    function createSheetOption(sheetName, isSelected, isActive) {
      const checked = isSelected ? 'checked' : '';
      const selectedClass = isSelected ? 'selected' : '';
      const activeBadge = isActive ? '<span class="active-badge">アクティブ</span>' : '';

      return \`
        <div class="sheet-option \${selectedClass}" onclick="selectSheet('\${escapeHtml(sheetName)}', this)">
          <input type="radio" name="targetSheet" value="\${escapeHtml(sheetName)}" \${checked}>
          <label>\${escapeHtml(sheetName)}\${activeBadge}</label>
        </div>
      \`;
    }

    function selectSheet(sheetName, element) {
      // 前の選択を解除
      document.querySelectorAll('.sheet-option').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.sheet-option input[type="radio"]').forEach(el => el.checked = false);

      // 新しい選択を設定
      element.classList.add('selected');
      element.querySelector('input[type="radio"]').checked = true;
      selectedSheetName = sheetName;

      // アクティブシートと異なる場合は警告を表示
      const warning = document.getElementById('sheetWarning');
      if (sheetData.isActiveCompanySheet && sheetName !== sheetData.activeSheetName) {
        warning.innerHTML = '⚠️ アクティブなシート（' + escapeHtml(sheetData.activeSheetName) + '）とは異なるシートが選択されています。';
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    }

    function parseAndCompare() {
      // シートが選択されているか確認
      if (!selectedSheetName) {
        showParseMsg('転記先シートを選択してください', 'error');
        return;
      }

      const jsonStr = document.getElementById('jsonInput').value.trim();
      if (!jsonStr) {
        showParseMsg('JSONを入力してください', 'error');
        return;
      }

      // JSON部分を抽出（コードブロックで囲まれている場合も対応）
      let cleanJson = jsonStr.trim();
      // コードブロック記号（バッククォート3つ）
      const codeBlockMarker = String.fromCharCode(96, 96, 96); // \`\`\`
      const codeBlockJsonMarker = codeBlockMarker + 'json';
      // 先頭のコードブロック記号を除去
      if (cleanJson.startsWith(codeBlockJsonMarker)) {
        cleanJson = cleanJson.substring(codeBlockJsonMarker.length);
      } else if (cleanJson.startsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(codeBlockMarker.length);
      }
      // 末尾のコードブロック記号を除去
      if (cleanJson.endsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(0, cleanJson.length - codeBlockMarker.length);
      }
      cleanJson = cleanJson.trim();

      try {
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        showParseMsg('JSONの解析に失敗しました: ' + e.message, 'error');
        return;
      }

      // サーバーに送って現在の値と比較（選択されたシート名を渡す）
      google.script.run
        .withSuccessHandler(handleCompareResult)
        .withFailureHandler(handleError)
        .compareWithSelectedSheet(parsedData, selectedSheetName);
    }

    function handleCompareResult(result) {
      // エラーの場合は処理を止める
      if (!result.success) {
        showParseMsg(result.error, 'error');
        return;
      }

      // 企業名不一致の警告（続行は可能）
      if (result.needConfirm && result.mismatchWarning) {
        document.getElementById('confirmMsg').innerHTML =
          '<strong>⚠️ 企業名が一致しません</strong><br><br>' +
          '【シートの企業名】' + escapeHtml(result.sheetCompanyName) + '<br>' +
          '【JSONの企業名】' + escapeHtml(result.jsonCompanyName) + '<br><br>' +
          '<span style="color:#c5221f;">正しい企業のシートを開いていますか？</span><br>' +
          '別の企業に転記する場合は、<strong>そのシートを開いてから再実行</strong>してください。<br><br>' +
          'このまま転記する場合は下の項目を確認してください。';
        document.getElementById('confirmMsg').style.display = 'block';
      }

      // シート情報を表示
      document.getElementById('sheetInfo').innerHTML =
        '📄 <strong>転記先:</strong> ' + result.sheetName +
        (result.sheetCompanyName ? ' （' + result.sheetCompanyName + '）' : '');

      // 差分テーブルを生成
      diffItems = result.diffItems || [];
      renderDiffTable();

      // Step2を表示
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
    }

    function renderDiffTable() {
      const tbody = document.getElementById('diffBody');
      tbody.innerHTML = '';

      diffItems.forEach((item, index) => {
        const hasConflict = item.currentValue && item.currentValue !== item.newValue;
        const tr = document.createElement('tr');
        tr.className = 'diff-row' + (hasConflict ? ' conflict' : '');

        tr.innerHTML = \`
          <td class="checkbox-col">
            <input type="checkbox" id="cb_\${index}" \${item.newValue ? 'checked' : ''}
                   onchange="updateSelection(\${index}, this.checked)">
          </td>
          <td>\${item.label}</td>
          <td class="current-val">\${escapeHtml(item.currentValue || '(空)')}</td>
          <td>
            <input type="text" class="edit-input" id="val_\${index}"
                   value="\${escapeHtml(item.newValue || '')}"
                   onchange="updateValue(\${index}, this.value)"
                   \${!item.newValue ? 'disabled' : ''}>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function toggleAll(checked) {
      diffItems.forEach((item, index) => {
        if (item.newValue) {
          document.getElementById('cb_' + index).checked = checked;
          item.selected = checked;
        }
      });
    }

    function updateSelection(index, checked) {
      diffItems[index].selected = checked;
    }

    function updateValue(index, value) {
      diffItems[index].newValue = value;
    }

    function executeTransfer() {
      // 選択された項目のみ抽出
      const selectedItems = diffItems
        .filter((item, index) => document.getElementById('cb_' + index).checked)
        .map((item, index) => ({
          key: item.key,
          value: document.getElementById('val_' + (diffItems.indexOf(item))).value
        }));

      if (selectedItems.length === 0) {
        showResultMsg('転記する項目を選択してください', 'error');
        return;
      }

      // 選択されたシート名も渡す
      google.script.run
        .withSuccessHandler(handleTransferResult)
        .withFailureHandler(handleError)
        .executeTranscriptTransfer(selectedItems, selectedSheetName);
    }

    function handleTransferResult(result) {
      if (result.success) {
        showResultMsg('✅ ' + result.count + '件の項目を転記しました', 'success');
        setTimeout(() => google.script.host.close(), 2000);
      } else {
        showResultMsg('❌ 転記に失敗: ' + result.error, 'error');
      }
    }

    function goBack() {
      document.getElementById('step1').style.display = 'block';
      document.getElementById('step2').style.display = 'none';
      document.getElementById('confirmMsg').style.display = 'none';
    }

    function showParseMsg(text, type) {
      const msg = document.getElementById('parseMsg');
      msg.textContent = text;
      msg.className = 'msg ' + type;
      msg.style.display = 'block';
    }

    function showResultMsg(text, type) {
      const msg = document.getElementById('resultMsg');
      msg.innerHTML = text;
      msg.className = 'msg ' + type;
      msg.style.display = 'block';
    }

    function handleError(error) {
      showParseMsg('エラー: ' + error.message, 'error');
    }
  </script>
</body>
</html>
  `;
}

// ===== 比較処理 =====
/**
 * 選択されたシートと比較
 * @param {Object} jsonData - AIが出力したJSONデータ
 * @param {string} targetSheetName - 転記先のシート名
 */
function compareWithSelectedSheet(jsonData, targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheetName);

  if (!sheet) {
    return {
      success: false,
      error: '⚠️ シート「' + targetSheetName + '」が見つかりません。'
    };
  }

  // シートの企業名を取得（行5, C列）
  const sheetCompanyName = String(sheet.getRange(5, 3).getValue() || '').trim();
  const jsonCompanyName = String(jsonData.企業名 || '').trim();

  // シートの企業名が空の場合は警告
  if (!sheetCompanyName) {
    return {
      success: false,
      error: '⚠️ シート「' + targetSheetName + '」に企業名が設定されていません。\n\n' +
             '正しい企業シートを選択してください。'
    };
  }

  // JSONに企業名がない場合は警告
  if (!jsonCompanyName) {
    return {
      success: false,
      error: '⚠️ AIの出力に企業名が含まれていません。\n\n' +
             'JSONに「企業名」フィールドがあるか確認してください。'
    };
  }

  // 企業名チェック
  let needConfirm = false;
  let mismatchWarning = '';
  if (!checkCompanyNameMatch(jsonCompanyName, sheetCompanyName)) {
    needConfirm = true;
    mismatchWarning = '⚠️ 企業名が一致しません！\n\n' +
                      '【シートの企業名】' + sheetCompanyName + '\n' +
                      '【JSONの企業名】' + jsonCompanyName + '\n\n' +
                      '選択したシートが正しいか確認してください。';
  }

  // JSONからフラットなキー・値ペアに変換
  const flatData = flattenJsonData(jsonData);

  // 各項目の現在値を取得して比較
  const diffItems = [];
  for (const key in flatData) {
    const mapping = TRANSCRIPT_TO_SHEET_MAPPING[key];
    if (!mapping) continue;

    const currentValue = sheet.getRange(mapping.row, mapping.col).getValue();
    const newValue = flatData[key];

    diffItems.push({
      key: key,
      label: key,
      currentValue: String(currentValue || ''),
      newValue: String(newValue || ''),
      mapping: mapping
    });
  }

  return {
    success: true,
    needConfirm: needConfirm,
    mismatchWarning: mismatchWarning,
    sheetName: sheet.getName(),
    sheetCompanyName: sheetCompanyName,
    jsonCompanyName: jsonCompanyName,
    diffItems: diffItems
  };
}

// JSONをフラットなキー・値ペアに変換
function flattenJsonData(data) {
  const result = {};

  // 会社紹介
  if (data.会社紹介) {
    if (data.会社紹介.私たちについて) result['私たちについて'] = data.会社紹介.私たちについて;
    if (data.会社紹介.社長挨拶) result['社長挨拶'] = data.会社紹介.社長挨拶;
    if (data.会社紹介.会社の魅力) result['会社の魅力'] = data.会社紹介.会社の魅力;
    if (data.会社紹介.雰囲気) result['雰囲気'] = data.会社紹介.雰囲気;
  }

  // 社員の声
  if (data.社員の声 && Array.isArray(data.社員の声)) {
    data.社員の声.forEach((emp, i) => {
      const num = i + 1;
      if (emp.氏名) result['社員' + num + '_氏名'] = emp.氏名;
      if (emp.部署) result['社員' + num + '_部署'] = emp.部署;
      if (emp.年数) result['社員' + num + '_年数'] = emp.年数;
      if (emp.インタビュー) result['社員' + num + '_インタビュー'] = emp.インタビュー;
    });
  }

  // 最も打ち出したいポイント
  if (data.最も打ち出したいポイント) {
    result['最も打ち出したいポイント'] = data.最も打ち出したいポイント;
  }

  // 募集情報
  if (data.募集情報) {
    if (data.募集情報.募集背景) result['募集背景'] = data.募集情報.募集背景;
    if (data.募集情報.ペルソナ) {
      if (data.募集情報.ペルソナ.性別) result['ペルソナ_性別'] = data.募集情報.ペルソナ.性別;
      if (data.募集情報.ペルソナ.年齢) result['ペルソナ_年齢'] = data.募集情報.ペルソナ.年齢;
      if (data.募集情報.ペルソナ.外国人) result['ペルソナ_外国人'] = data.募集情報.ペルソナ.外国人;
    }
    if (data.募集情報.求める人材像) result['求める人材像'] = data.募集情報.求める人材像;
  }

  // スカウトメール
  if (data.スカウトメール) {
    if (data.スカウトメール.年齢) result['スカウト_年齢'] = data.スカウトメール.年齢;
    if (data.スカウトメール.エリア) result['スカウト_エリア'] = data.スカウトメール.エリア;
    if (data.スカウトメール.検索キーワード) result['スカウト_キーワード'] = data.スカウトメール.検索キーワード;
    if (data.スカウトメール.備考) result['スカウト_備考'] = data.スカウトメール.備考;
  }

  return result;
}

// ===== 転記実行 =====
/**
 * 選択されたシートに転記
 * @param {Array} selectedItems - 転記する項目の配列
 * @param {string} targetSheetName - 転記先のシート名
 */
function executeTranscriptTransfer(selectedItems, targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheetName);

  if (!sheet) {
    return { success: false, error: 'シート「' + targetSheetName + '」が見つかりません' };
  }

  let count = 0;
  try {
    selectedItems.forEach(item => {
      const mapping = TRANSCRIPT_TO_SHEET_MAPPING[item.key];
      if (mapping && item.value) {
        sheet.getRange(mapping.row, mapping.col).setValue(item.value);
        count++;
      }
    });

    return { success: true, count: count };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===== マッピング確認（デバッグ用） =====
function showMappingDebug() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let output = '=== 文字起こし転記マッピング確認 ===\n\n';
  output += 'シート名: ' + sheet.getName() + '\n\n';

  for (const key in TRANSCRIPT_TO_SHEET_MAPPING) {
    const m = TRANSCRIPT_TO_SHEET_MAPPING[key];
    const currentValue = sheet.getRange(m.row, m.col).getValue();
    output += `[${key}] 行${m.row}, 列${m.col}\n`;
    output += `  現在値: ${currentValue || '(空)'}\n\n`;
  }

  const html = HtmlService.createHtmlOutput(
    '<textarea style="width:100%;height:500px;font-family:monospace;font-size:12px;">' +
    output.replace(/</g, '&lt;') +
    '</textarea>'
  ).setWidth(700).setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'マッピング確認');
}

// 企業名一致チェック（hearingSheetManager.jsから流用）
function checkCompanyNameMatch(name1, name2) {
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

  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  return false;
}
