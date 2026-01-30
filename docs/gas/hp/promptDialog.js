/**
 * HP制作 プロンプトダイアログ機能
 *
 * 【概要】
 * スプレッドシートの「プロンプト」シートからテンプレートを読み込み、
 * 入力フィールド付きのダイアログを表示する。
 *
 * 【シート構造】
 * A列: プロンプト名（メニューに表示）
 * B列: 説明（ダイアログのサブタイトル）
 * C列: 入力欄のラベル
 * D列: 入力欄のプレースホルダー
 * E列: テンプレート（{{input}}が入力値に置換される）
 * F列: カテゴリ（メニューでのフィルタリング用）
 *
 * 【設計思想】
 * - ツナゲルほど複雑にしない（不変・シンプル）
 * - commonStyles.jsを使用してUI統一
 */

// ==================== 定数 ====================

// このメニューに表示するカテゴリ
const HP_PROMPT_MENU_CATEGORY = '議事録';

// ==================== メニュー ====================

/**
 * プロンプトメニューを作成
 */
function hp_addPromptMenu(ui) {
  const menu = ui.createMenu('2.📝 ヒアリング反映');

  // プロンプトシートからメニュー項目を動的に生成（カテゴリでフィルタリング）
  const prompts = hp_getPromptList();
  const filteredPrompts = prompts.filter(p => p.category === HP_PROMPT_MENU_CATEGORY);

  if (filteredPrompts.length === 0) {
    menu.addItem('（プロンプトシートを作成してください）', 'hp_showPromptSetupInstructions');
  } else {
    filteredPrompts.forEach((prompt) => {
      menu.addItem(prompt.name, `hp_openPromptDialog_${prompt.index}`);
    });
    menu.addSeparator();
  }

  // 文字起こし整理・転記
  menu.addItem('📋 文字起こしを整理（プロンプト生成）', 'hp_showTranscriptPromptDialog');
  menu.addItem('📥 AI出力を転記', 'hp_showTransferFromAIDialog');
  menu.addSeparator();

  menu.addItem('❓ 使い方', 'hp_showPromptUsage');
  menu.addSeparator();
  menu.addItem('✏️ ステータス更新', 'hp_showStatusUpdateDialog');

  menu.addToUi();
}

/**
 * プロンプト一覧を取得
 */
function hp_getPromptList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const prompts = [];

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[4]) {  // 名前とテンプレートが必須
      prompts.push({
        index: i - 1,
        name: row[0],
        description: row[1] || '',
        inputLabel: row[2] || 'ここに入力',
        inputPlaceholder: row[3] || '',
        template: row[4],
        category: row[5] || ''  // F列: カテゴリ
      });
    }
  }

  return prompts;
}

/**
 * 指定インデックスのプロンプトを取得
 */
function hp_getPromptByIndex(index) {
  const prompts = hp_getPromptList();
  return prompts[index] || null;
}

// ==================== 動的関数生成 ====================

// メニューから呼び出される関数を動的に生成（最大20個）
for (let i = 0; i < 20; i++) {
  this[`hp_openPromptDialog_${i}`] = (function(idx) {
    return function() {
      hp_openPromptDialogByIndex(idx);
    };
  })(i);
}

/**
 * インデックスを指定してダイアログを開く
 */
function hp_openPromptDialogByIndex(index) {
  const prompt = hp_getPromptByIndex(index);
  if (!prompt) {
    SpreadsheetApp.getUi().alert('プロンプトが見つかりません');
    return;
  }
  hp_showPromptDialog(prompt);
}

// ==================== ダイアログ ====================

/**
 * プロンプトダイアログを表示
 * 保存キーがあるプロンプトは拡張ダイアログを表示
 */
function hp_showPromptDialog(prompt) {
  // 設定シートから保存キー・入力キーを取得
  const saveKey = hp_getSaveKeyForPrompt(prompt.name);
  const inputKey = hp_getInputKeyForPrompt(prompt.name);

  if (saveKey) {
    // 保存機能付き拡張ダイアログ
    const sheetList = hp_getCompanySheetListForPrompt(saveKey, inputKey);
    const html = HtmlService.createHtmlOutput(hp_getPromptDialogWithSaveHtml(prompt, saveKey, inputKey, sheetList))
      .setWidth(800)
      .setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, prompt.name);
  } else {
    // 通常ダイアログ
    const html = HtmlService.createHtmlOutput(hp_getPromptDialogHtml(prompt))
      .setWidth(700)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, prompt.name);
  }
}

/**
 * ダイアログのHTMLを生成
 */
function hp_getPromptDialogHtml(prompt) {
  // テンプレート内の特殊文字をエスケープ
  const escapedTemplate = prompt.template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .input-textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
    }
    .input-textarea:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  ${prompt.description ? `<div class="description">${hp_escapeHtmlForPrompt(prompt.description)}</div>` : ''}

  <!-- テンプレート表示（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
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
    <label class="input-label">${hp_escapeHtmlForPrompt(prompt.inputLabel)}</label>
    <textarea
      class="input-textarea"
      id="inputText"
      placeholder="${hp_escapeHtmlForPrompt(prompt.inputPlaceholder)}"
      oninput="updatePreview()"
    ></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー</span>
      <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" disabled>
        コピー
      </button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <script>
    const template = \`${escapedTemplate}\`;
    document.getElementById('templateText').textContent = template;

    function updatePreview() {
      const input = document.getElementById('inputText').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim()) {
        const result = template.replace('{{input}}', input);
        preview.textContent = result;
        preview.classList.remove('preview-placeholder');
        copyBtn.disabled = false;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    function copyTemplate() {
      copyToClipboard(template);
    }

    function copyResult() {
      const input = document.getElementById('inputText').value;
      const result = template.replace('{{input}}', input);
      copyToClipboard(result);
    }
  </script>
  ${CI_UI_COMPONENTS}
</body>
</html>
  `;
}

/**
 * HTMLエスケープ
 */
function hp_escapeHtmlForPrompt(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==================== セットアップ ====================
// ※プロンプトシート作成は「⚙️ 設定」メニュー（settingsSheet.js）に統一

/**
 * 使い方を表示
 */
function hp_showPromptUsage() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
      h2 { color: #1565C0; border-bottom: 2px solid #1565C0; padding-bottom: 8px; }
      h3 { color: #1565C0; margin-top: 20px; }
      code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
      .note { background: #E3F2FD; padding: 12px; border-radius: 8px; margin: 16px 0; }
    </style>
    <h2>📝 プロンプトダイアログの使い方</h2>

    <h3>1. プロンプトシートの構造</h3>
    <p>「プロンプト」シートに以下の列でデータを入力します：</p>
    <ul>
      <li><strong>A列：プロンプト名</strong> - メニューに表示される名前</li>
      <li><strong>B列：説明</strong> - ダイアログ上部に表示（任意）</li>
      <li><strong>C列：入力欄ラベル</strong> - 入力欄の上に表示</li>
      <li><strong>D列：プレースホルダー</strong> - 入力欄のヒント文</li>
      <li><strong>E列：テンプレート</strong> - <code>{{input}}</code>が入力値に置換される</li>
      <li><strong>F列：カテゴリ</strong> - メニューでのフィルタリング用</li>
    </ul>

    <h3>2. カテゴリについて</h3>
    <p>F列「カテゴリ」でどのメニューに表示するか制御できます：</p>
    <ul>
      <li><code>議事録</code> → 「３.📝 議事録作成」メニューに表示</li>
      <li><code>構成案</code> → 構成案メニューに表示（将来対応）</li>
    </ul>

    <h3>3. 使い方</h3>
    <ol>
      <li>メニューから使いたいプロンプトを選択</li>
      <li>ダイアログが開く</li>
      <li>入力欄にテキストを貼り付け</li>
      <li>プレビューを確認</li>
      <li>「コピー」でクリップボードにコピー</li>
      <li>AIに貼り付けて実行</li>
    </ol>

    <div class="note">
      <strong>💡 ポイント</strong><br>
      テンプレート内の <code>{{input}}</code> が入力値に置き換わります。<br>
      この文字列は必ず含めてください。
    </div>
  `).setWidth(500).setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, '使い方');
}

/**
 * セットアップ案内を表示
 */
function hp_showPromptSetupInstructions() {
  SpreadsheetApp.getUi().alert(
    'セットアップが必要です',
    '「プロンプト」シートがありません。\n\n' +
    'メニュー「📝 議事録作成」→「📄 プロンプトシートを作成」を実行してください。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ==================== 保存機能付きダイアログ ====================

/**
 * 企業シート一覧を取得（保存済みデータ付き）
 */
function hp_getCompanySheetListForPrompt(saveKey, inputKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!hp_isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(6, 2).getValue() || '').trim();

      // Part④から保存済みデータを取得
      let savedData = '';
      try {
        const result = hp_loadPart4Data(sheetName, saveKey);
        if (result.success) {
          savedData = result.value;
        }
      } catch (e) {
        savedData = '';
      }

      // Part④から入力データを取得
      let inputData = '';
      if (inputKey) {
        try {
          const result = hp_loadPart4Data(sheetName, inputKey);
          if (result.success) {
            inputData = result.value;
          }
        } catch (e) {
          inputData = '';
        }
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedData: savedData,
        hasSavedData: !!savedData,
        inputData: inputData,
        hasInputData: !!inputData,
        isActive: sheetName === activeSheetName
      });
    }
  });

  return companySheets;
}

/**
 * 保存機能付きダイアログのHTML生成
 */
function hp_getPromptDialogWithSaveHtml(prompt, saveKey, inputKey, sheetList) {
  const escapedTemplate = prompt.template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sheetListJson = JSON.stringify(sheetList);
  const inputSaveKeyJson = JSON.stringify(inputKey || saveKey);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
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
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .badge-input { background: #2196f3; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  ${prompt.description ? `<div class="description">${hp_escapeHtmlForPrompt(prompt.description)}</div>` : ''}

  <!-- 企業選択ドロップダウン -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
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
      <label class="input-label" style="margin-bottom:0;">${hp_escapeHtmlForPrompt(prompt.inputLabel)}</label>
      <button class="btn save-btn" onclick="saveData()">💾 シートに保存</button>
    </div>
    <textarea
      class="input-textarea"
      id="inputText"
      placeholder="${hp_escapeHtmlForPrompt(prompt.inputPlaceholder)}"
      oninput="updatePreview()"
    ></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー</span>
      <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" disabled>
        コピー
      </button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const template = \`${escapedTemplate}\`;
    const sheetList = ${sheetListJson};
    const inputSaveKey = ${inputSaveKeyJson};
    let selectedSheetName = '';
    let selectedInputData = '';

    window.onload = function() {
      document.getElementById('templateText').textContent = template;
      renderCompanyDropdown();
    };

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function renderCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      if (!sheetList || sheetList.length === 0) {
        dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
        return;
      }

      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return -1;
      });

      sorted.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' selected' : '');

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        const inputBadge = item.hasInputData ? '<span class="badge-input">自動取得可</span>' : '';
        const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
        const companyNote = item.companyName && item.companyName !== item.sheetName
          ? ' <span style="color:#666;font-size:12px;">(' + escapeHtml(item.companyName) + ')</span>' : '';

        div.innerHTML = \`
          <span class="check-icon">\${item.isActive ? '✓' : ''}</span>
          <span class="company-name">\${escapeHtml(item.sheetName)}\${companyNote}</span>
          \${activeBadge}
          \${inputBadge}
          \${savedBadge}
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);

        if (item.isActive) {
          selectCompany(item);
        }
      });
    }

    function selectCompany(item) {
      const currentInput = document.getElementById('inputText').value.trim();
      const dataToLoad = item.inputData || item.savedData;
      if (dataToLoad && currentInput && currentInput !== dataToLoad) {
        if (!confirm('保存済みのデータを読み込みますか？\\n（現在の入力は破棄されます）')) {
          updateSelection(item);
          return;
        }
      }

      updateSelection(item);

      if (item.inputData) {
        document.getElementById('inputText').value = item.inputData;
        showStatus('文字起こし原文を自動取得しました', 'info');
        updatePreview();
      } else if (item.savedData) {
        document.getElementById('inputText').value = item.savedData;
        showStatus('保存済みのデータを読み込みました', 'info');
        updatePreview();
      }
    }

    function updateSelection(item) {
      selectedSheetName = item.sheetName;
      selectedInputData = item.inputData || item.savedData || '';

      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const inputBadge = item.hasInputData ? '<span class="badge-input" style="margin-left:8px;">自動取得</span>' : '';
      const savedBadge = item.hasSavedData ? '<span class="badge-saved" style="margin-left:8px;">保存済</span>' : '';
      display.innerHTML = \`
        <span class="selected-check">✓</span>
        <span class="selected-name">\${escapeHtml(item.sheetName)}</span>
        \${activeBadge}
        \${inputBadge}
        \${savedBadge}
      \`;

      document.querySelectorAll('.company-select-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      const items = document.querySelectorAll('.company-select-item');
      items.forEach(el => {
        const name = el.querySelector('.company-name').textContent.split('(')[0].trim();
        if (name === item.sheetName) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });
    }

    function updatePreview() {
      const input = document.getElementById('inputText').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim()) {
        const result = template.replace('{{input}}', input);
        preview.textContent = result;
        preview.classList.remove('preview-placeholder');
        copyBtn.disabled = false;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    function copyTemplate() {
      copyToClipboard(template);
    }

    function copyResult() {
      const input = document.getElementById('inputText').value;
      const result = template.replace('{{input}}', input);
      copyToClipboard(result);
    }

    function saveData() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('inputText').value.trim();
      if (!input) {
        showStatus('入力データがありません', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .hp_savePart4DataForce(selectedSheetName, inputSaveKey, input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .hp_savePart4Data(selectedSheetName, inputSaveKey, input, true);
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

// ==================== Part④データ操作 ====================

/**
 * Part④からデータを読み込む
 */
function hp_loadPart4Data(sheetName, key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  const lastRow = sheet.getLastRow();
  for (let row = 1; row <= lastRow; row++) {
    const label = sheet.getRange(row, 1).getValue();
    if (label === key) {
      const value = sheet.getRange(row, 2).getValue();
      return { success: true, value: value || '' };
    }
  }

  return { success: false, error: 'キーが見つかりません' };
}

/**
 * Part④にデータを保存
 */
function hp_savePart4Data(sheetName, key, value, checkExisting) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  const lastRow = sheet.getLastRow();
  for (let row = 1; row <= lastRow; row++) {
    const label = sheet.getRange(row, 1).getValue();
    if (label === key) {
      const existing = sheet.getRange(row, 2).getValue();
      if (checkExisting && existing) {
        return { success: false, needConfirm: true };
      }
      sheet.getRange(row, 2).setValue(value);
      return { success: true };
    }
  }

  return { success: false, error: 'キーが見つかりません' };
}

/**
 * Part④にデータを強制保存
 */
function hp_savePart4DataForce(sheetName, key, value) {
  return hp_savePart4Data(sheetName, key, value, false);
}

// ==================== 保存キー・入力キー取得 ====================

/**
 * プロンプト名から保存キーを取得
 */
function hp_getSaveKeyForPrompt(promptName) {
  // 設定シートから取得するか、デフォルト値を使用
  const mapping = {
    '議事録作成': '議事録',
    '構成案作成': '構成案'
  };
  return mapping[promptName] || null;
}

/**
 * プロンプト名から入力キーを取得
 */
function hp_getInputKeyForPrompt(promptName) {
  const mapping = {
    '議事録作成': '文字起こし原文',
    '構成案作成': '議事録'
  };
  return mapping[promptName] || null;
}

// ==================== 文字起こし整理・転記 ====================
// ※ transcriptToHearingSheet.js に実装済み
// hp_showTranscriptPromptDialog() → transcriptToHearingSheet.js
// hp_showTransferFromAIDialog() → transcriptToHearingSheet.js
