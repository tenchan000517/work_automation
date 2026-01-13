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
  // テンプレート内の特殊文字をエスケープ
  const escapedTemplate = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* transcriptPrompt固有スタイル */
    .input-textarea {
      width: 100%;
      height: 140px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      resize: vertical;
      font-family: monospace;
    }
    .input-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .company-info { background: #e8f0fe; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 企業選択ドロップダウン -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
    <div class="company-info" id="companyInfo" style="display:none;"></div>
  </div>

  <!-- テンプレート表示（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordionById('arrow', 'accordionContent')">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">
        コピー
      </button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText"></div>
    </div>
  </div>

  <!-- 入力エリア -->
  <div class="input-section">
    <div class="input-header">
      <label class="input-label" style="margin-bottom:0;">文字起こしを貼り付け</label>
      <button class="btn save-btn" onclick="saveTranscript()">💾 シートに保存</button>
    </div>
    <textarea
      class="input-textarea"
      id="transcriptInput"
      placeholder="NOTTAからダウンロードした文字起こしテキストを貼り付けてください..."
      oninput="updatePreview()"
    ></textarea>
    <div class="note">※ 60分程度の打ち合わせの文字起こしを想定 ｜ 保存すると次回自動読み込み</div>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">完成版プロンプト（AIに貼り付け）</span>
      <button class="btn btn-green" onclick="copyOutput()" id="copyResultBtn" disabled>
        コピー
      </button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="clearAll()">クリア</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    // 定数
    const template = \`${escapedTemplate}\`;
    const sheetData = ${sheetDataJson};
    let selectedCompanyName = '';
    let selectedSheetName = '';

    // 初期化
    window.onload = function() {
      document.getElementById('templateText').textContent = template;

      // 共通関数で企業選択ドロップダウンを初期化
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        savedDataKey: 'savedTranscript',
        badgeLabel: '保存済',
        onSelect: function(item, isActive) {
          const currentInput = document.getElementById('transcriptInput').value.trim();

          // 保存済みデータがあれば読み込み確認
          if (item.savedTranscript && currentInput && currentInput !== item.savedTranscript) {
            if (!confirm('保存済みの文字起こしを読み込みますか？\\n（現在の入力は破棄されます）')) {
              selectedSheetName = item.sheetName;
              selectedCompanyName = item.companyName;
              updateCompanyInfo();
              return;
            }
          }

          selectedSheetName = item.sheetName;
          selectedCompanyName = item.companyName;
          updateCompanyInfo();

          // 保存済みデータを読み込む
          if (item.savedTranscript) {
            document.getElementById('transcriptInput').value = item.savedTranscript;
            showStatus('保存済みの文字起こしを読み込みました', 'info');
            updatePreview();
          }
        }
      });
    };

    // 企業名表示を更新
    function updateCompanyInfo() {
      const companyInfo = document.getElementById('companyInfo');
      if (selectedCompanyName) {
        companyInfo.innerHTML = '🏢 企業名: <strong>' + escapeHtml(selectedCompanyName) + '</strong>（プロンプトに自動挿入されます）';
        companyInfo.style.display = 'block';
      } else {
        companyInfo.style.display = 'none';
      }
    }

    // プレビュー更新
    function updatePreview() {
      const input = document.getElementById('transcriptInput').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim() && selectedCompanyName) {
        const companyHeader = '【対象企業】' + selectedCompanyName + '\\n\\n';
        const result = companyHeader + template.replace('{{input}}', input);
        preview.textContent = result;
        preview.classList.remove('preview-placeholder');
        copyBtn.disabled = false;
      } else if (input.trim()) {
        preview.innerHTML = '<span class="preview-placeholder">企業を選択してください</span>';
        copyBtn.disabled = true;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    // テンプレートをコピー
    function copyTemplate() {
      copyToClipboard(template);
    }

    // 完成版をコピー
    function copyOutput() {
      const input = document.getElementById('transcriptInput').value;
      if (!input.trim()) {
        showStatus('文字起こしを入力してください', 'error');
        return;
      }
      if (!selectedCompanyName) {
        showStatus('企業を選択してください', 'error');
        return;
      }
      const companyHeader = '【対象企業】' + selectedCompanyName + '\\n\\n';
      const result = companyHeader + template.replace('{{input}}', input);
      copyToClipboard(result);
    }

    function saveTranscript() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('transcriptInput').value.trim();
      if (!input) {
        showStatus('文字起こしを入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 文字起こしを企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 文字起こしを上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, '文字起こし原文', input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, '文字起こし原文', input, true);
    }

    function clearAll() {
      document.getElementById('transcriptInput').value = '';
      document.getElementById('previewContent').innerHTML = '<span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>';
      document.getElementById('copyResultBtn').disabled = true;
      showStatus('クリアしました', 'info');
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

// ===== 2. AI出力を転記 =====
function showTransferFromAIDialog() {
  // 企業シート一覧を取得（保存済みJSONデータ付き）
  const sheetData = getCompanySheetListWithSavedJson();
  const html = HtmlService.createHtmlOutput(createTransferFromAIHTML(sheetData))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 AI出力を転記');
}

/**
 * 企業シート一覧を取得（保存済みJSONデータ付き）
 * Part③から「ヒアリング抽出JSON」を取得
 */
function getCompanySheetListWithSavedJson() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(5, 3).getValue() || '').trim();

      // Part③から保存済みJSONを取得
      let savedJson = '';
      try {
        const result = loadPart3Data(sheetName, 'ヒアリング抽出JSON');
        if (result.success) {
          savedJson = result.value;
        }
      } catch (e) {
        savedJson = '';
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedJson: savedJson,
        hasSavedJson: !!savedJson
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
 * 企業シート一覧を取得（シンプル版 - 後方互換用）
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
  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* transferFromAI固有スタイル */
    .input-textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      resize: vertical;
      font-family: monospace;
    }
    .input-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .diff-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .diff-table th, .diff-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    .diff-table th { background: #f8f9fa; position: sticky; top: 0; }
    .diff-table tr:nth-child(even) { background: #f8f9fa; }
    .diff-row { cursor: pointer; }
    .diff-row:hover { background: #e3f2fd !important; }
    .diff-row.selected { background: #bbdefb !important; }
    .diff-row.conflict { background: #fff3e0 !important; }
    .current-val { color: #666; font-size: 11px; }
    .diff-container { max-height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; }
    .sheet-info { background: #e8f0fe; padding: 10px; border-radius: 6px; margin-bottom: 12px; }
    .checkbox-col { width: 35px; text-align: center; }
    input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .edit-input { width: 100%; padding: 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; }
    .sheet-warning { background: #fff3e0; border: 1px solid #ffcc80; padding: 10px; border-radius: 6px; margin-top: 8px; color: #e65100; display: none; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <div id="step1">
    <!-- 企業選択ドロップダウン -->
    <div class="input-section">
      <span class="input-label">転記先企業を選択</span>
      <div class="company-select-wrapper">
        <div class="company-select-display" id="companySelectDisplay" onclick="event.stopPropagation(); toggleCompanyDropdown()">
          <span class="placeholder">企業シートを選択してください</span>
        </div>
        <div class="company-select-dropdown" id="companySelectDropdown"></div>
      </div>
      <div id="sheetWarning" class="sheet-warning"></div>
    </div>

    <!-- JSON入力エリア -->
    <div class="input-section">
      <div class="input-header">
        <label class="input-label" style="margin-bottom:0;">AIが出力したJSONを貼り付け</label>
        <button class="btn save-btn" onclick="saveJson()">💾 シートに保存</button>
      </div>
      <textarea
        class="input-textarea"
        id="jsonInput"
        placeholder='{"企業名": "株式会社○○", "会社紹介": {...}, ...}'
      ></textarea>
      <div class="note">※ コードブロック（\`\`\`json）で囲まれていても自動除去します</div>
    </div>

    <!-- フッター -->
    <div class="footer">
      <button class="btn btn-blue" onclick="parseAndCompare()">🔍 解析して比較</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <div id="step2" style="display:none;">
    <div class="sheet-info" id="sheetInfo"></div>

    <div id="confirmMsg" class="status warning" style="display:none;"></div>

    <div class="input-label">転記内容の確認（チェックした項目のみ転記）</div>
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

    <!-- フッター -->
    <div class="footer" style="margin-top:12px;">
      <button class="btn btn-green" onclick="executeTransfer()">✅ チェック項目を転記</button>
      <button class="btn btn-gray" onclick="goBack()">← 戻る</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="resultStatus"></div>
  </div>

  ${CI_UI_COMPONENTS}

  <script>
    // 定数
    const sheetData = ${sheetDataJson};
    let parsedData = null;
    let diffItems = [];
    let selectedSheetName = '';
    let selectedCompanyData = null;

    // 初期化
    window.onload = function() {
      // 共通関数で企業選択ドロップダウンを初期化
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        savedDataKey: 'savedJson',
        badgeLabel: '保存済',
        onSelect: function(item, isActive) {
          const currentInput = document.getElementById('jsonInput').value.trim();

          // 保存済みJSONがあれば読み込み確認
          if (item.savedJson && currentInput && currentInput !== item.savedJson) {
            if (!confirm('保存済みのJSONを読み込みますか？\\n（現在の入力は破棄されます）')) {
              selectedSheetName = item.sheetName;
              selectedCompanyData = item;
              updateWarning(item, isActive);
              return;
            }
          }

          selectedSheetName = item.sheetName;
          selectedCompanyData = item;
          updateWarning(item, isActive);

          // 保存済みJSONを読み込む
          if (item.savedJson) {
            document.getElementById('jsonInput').value = item.savedJson;
            showStatus('保存済みのJSONを読み込みました', 'info');
          }
        }
      });
    };

    // アクティブシートと異なる場合の警告表示
    function updateWarning(item, isActive) {
      const warning = document.getElementById('sheetWarning');
      if (sheetData.isActiveCompanySheet && item.sheetName !== sheetData.activeSheetName) {
        warning.innerHTML = '⚠️ アクティブなシート（' + escapeHtml(sheetData.activeSheetName) + '）とは異なるシートが選択されています。';
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    }

    // JSONをクリーンにする（コードブロック除去）
    function cleanJsonString(jsonStr) {
      let cleanJson = jsonStr.trim();
      const codeBlockMarker = String.fromCharCode(96, 96, 96);
      const codeBlockJsonMarker = codeBlockMarker + 'json';

      if (cleanJson.startsWith(codeBlockJsonMarker)) {
        cleanJson = cleanJson.substring(codeBlockJsonMarker.length);
      } else if (cleanJson.startsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(codeBlockMarker.length);
      }
      if (cleanJson.endsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(0, cleanJson.length - codeBlockMarker.length);
      }
      return cleanJson.trim();
    }

    // JSONを保存
    function saveJson() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const jsonStr = document.getElementById('jsonInput').value.trim();
      if (!jsonStr) {
        showStatus('JSONを入力してください', 'error');
        return;
      }

      // JSON形式チェック
      try {
        JSON.parse(cleanJsonString(jsonStr));
      } catch (e) {
        showStatus('JSONの形式が正しくありません: ' + e.message, 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 JSONを企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 JSONを上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, 'ヒアリング抽出JSON', jsonStr);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, 'ヒアリング抽出JSON', jsonStr, true);
    }

    function parseAndCompare() {
      if (!selectedSheetName) {
        showStatus('転記先シートを選択してください', 'error');
        return;
      }

      const jsonStr = document.getElementById('jsonInput').value.trim();
      if (!jsonStr) {
        showStatus('JSONを入力してください', 'error');
        return;
      }

      const cleanJson = cleanJsonString(jsonStr);

      try {
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        showStatus('JSONの解析に失敗しました: ' + e.message, 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(handleCompareResult)
        .withFailureHandler(handleError)
        .compareWithSelectedSheet(parsedData, selectedSheetName);
    }

    function handleCompareResult(result) {
      if (!result.success) {
        showStatus(result.error, 'error');
        return;
      }

      if (result.needConfirm && result.mismatchWarning) {
        document.getElementById('confirmMsg').innerHTML =
          '<strong>⚠️ 企業名が一致しません</strong><br>' +
          '【シート】' + escapeHtml(result.sheetCompanyName) + '<br>' +
          '【JSON】' + escapeHtml(result.jsonCompanyName);
        document.getElementById('confirmMsg').style.display = 'block';
      }

      document.getElementById('sheetInfo').innerHTML =
        '📄 <strong>転記先:</strong> ' + escapeHtml(result.sheetName) +
        (result.sheetCompanyName ? ' （' + escapeHtml(result.sheetCompanyName) + '）' : '');

      diffItems = result.diffItems || [];
      renderDiffTable();

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
                   onchange="updateCheckboxSelection(\${index}, this.checked)">
          </td>
          <td>\${escapeHtml(item.label)}</td>
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

    function toggleAll(checked) {
      diffItems.forEach((item, index) => {
        if (item.newValue) {
          document.getElementById('cb_' + index).checked = checked;
          item.selected = checked;
        }
      });
    }

    function updateCheckboxSelection(index, checked) {
      diffItems[index].selected = checked;
    }

    function updateValue(index, value) {
      diffItems[index].newValue = value;
    }

    function executeTransfer() {
      const selectedItems = diffItems
        .filter((item, index) => document.getElementById('cb_' + index).checked)
        .map((item) => ({
          key: item.key,
          value: document.getElementById('val_' + diffItems.indexOf(item)).value
        }));

      if (selectedItems.length === 0) {
        showResultStatus('転記する項目を選択してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(handleTransferResult)
        .withFailureHandler(handleError)
        .executeTranscriptTransfer(selectedItems, selectedSheetName);
    }

    function handleTransferResult(result) {
      if (result.success) {
        showResultStatus('✅ ' + result.count + '件の項目を転記しました', 'success');
        setTimeout(() => google.script.host.close(), 2000);
      } else {
        showResultStatus('❌ 転記に失敗: ' + result.error, 'error');
      }
    }

    function goBack() {
      document.getElementById('step1').style.display = 'block';
      document.getElementById('step2').style.display = 'none';
      document.getElementById('confirmMsg').style.display = 'none';
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function showResultStatus(message, type) {
      const status = document.getElementById('resultStatus');
      status.innerHTML = message;
      status.className = 'status ' + type;
    }

    function handleError(error) {
      showStatus('エラー: ' + error.message, 'error');
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
