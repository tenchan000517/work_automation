/**
 * アニメPV制作 - 文字起こし→AI抽出
 *
 * HP制作のフローを参考に:
 * 1. 文字起こしを貼り付け
 * 2. ヒアリング情報抽出プロンプトを生成
 * 3. AIに投入
 * 4. AIの出力（JSON）をパース→シートに転記
 */

// ================================================================================
// ===== 抽出項目マッピング =====
// ================================================================================

const PV_TRANSCRIPT_MAPPING = {
  'コアメッセージ': 'コアメッセージ',
  'ストーリーアイデア': 'ストーリーアイデア',
  '安全装備': '安全装備',
  'NG要素': 'NG要素',
  '舞台・世界観': '舞台・世界観',
  '音声設定': '音声設定'
};

// ================================================================================
// ===== 文字起こし整理（プロンプト生成） =====
// ================================================================================

/**
 * 文字起こしを整理するダイアログを表示
 */
function pv_showTranscriptPromptDialog() {
  const sheetData = pv_getCompanySheetListWithData('文字起こし原文');
  const template = pv_getTranscriptPromptTemplate();

  const html = HtmlService.createHtmlOutput(pv_createTranscriptPromptHTML(sheetData, template))
    .setWidth(850)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 文字起こしを整理');
}

/**
 * 文字起こし抽出プロンプトテンプレート
 */
function pv_getTranscriptPromptTemplate() {
  return `以下の文字起こしから、アニメPV制作に必要なヒアリング情報を抽出してください。

【対象企業】
{{companyName}}
業種: {{industry}}
目的: {{purpose}}
ターゲット: {{target}}

【抽出項目】
1. コアメッセージ
   - 視聴者に最も伝えたい1つのメッセージ
   - キャッチコピーになりうるフレーズ

2. ストーリーアイデア
   - クライアントが話したシナリオ案
   - 具体的なシーン案や展開イメージ
   - 伝えたい感情の流れ

3. 安全装備
   - 必須安全装備（ヘルメット、安全靴、ゴーグル等）
   - 作業シーンでの注意点

4. NG要素
   - 映してはいけない設備・エリア
   - 映してはいけないロゴ・ブランド
   - 表現上の禁止事項

5. 舞台・世界観
   - 舞台となる場所（工場、オフィス、店舗等）
   - 季節・時間帯の希望

6. 音声設定
   - ナレーションの性別・トーン
   - BGMの方向性
   - 歌詞付き楽曲の要否

【出力形式】
以下のJSON形式で出力してください。言及されていない項目は空文字""としてください。

\`\`\`json
{
  "コアメッセージ": "",
  "ストーリーアイデア": "",
  "安全装備": "",
  "NG要素": "",
  "舞台・世界観": "",
  "音声設定": ""
}
\`\`\`

【文字起こし】
{{input}}`;
}

/**
 * 文字起こし整理ダイアログのHTML
 */
function pv_createTranscriptPromptHTML(sheetData, template) {
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
  ${PV_DIALOG_STYLES}
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
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .company-info { background: #e8f0fe; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 企業選択 -->
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

  <!-- テンプレート表示 -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">コピー</button>
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
    <textarea class="input-textarea" id="transcriptInput" placeholder="NOTTAからダウンロードした文字起こしテキストを貼り付け..." oninput="updatePreview()"></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">完成版プロンプト（AIに貼り付け）</span>
      <button class="btn btn-green" onclick="copyOutput()" id="copyResultBtn" disabled>コピー</button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">企業を選択して文字起こしを貼り付けると、プレビューが表示されます</span>
    </div>
  </div>

  <div class="footer">
    <button class="btn btn-gray" onclick="clearAll()">クリア</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${PV_UI_COMPONENTS}

  <script>
    const templateBase = \`${escapedTemplate}\`;
    const sheetData = ${sheetDataJson};
    let selectedSheetName = '';
    let selectedCompanyInfo = null;

    window.onload = function() {
      document.getElementById('templateText').textContent = templateBase;
      initCompanyDropdown();
    };

    function initCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      if (!sheetData.companySheets || sheetData.companySheets.length === 0) {
        dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
        return;
      }

      sheetData.companySheets.forEach(item => {
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' active' : '');
        const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
        div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
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

    function toggleCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      const display = document.getElementById('companySelectDisplay');
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectCompany(item) {
      selectedSheetName = item.sheetName;

      // 企業情報を取得
      google.script.run
        .withSuccessHandler(function(info) {
          selectedCompanyInfo = info;
          updateCompanyDisplay(item);
          if (item.savedData) {
            document.getElementById('transcriptInput').value = item.savedData;
            showStatus('保存済みの文字起こしを読み込みました', 'info');
          }
          updatePreview();
        })
        .pv_getBasicInfoForDialog(item.sheetName);
    }

    function updateCompanyDisplay(item) {
      const display = document.getElementById('companySelectDisplay');
      display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';

      if (selectedCompanyInfo) {
        const infoDiv = document.getElementById('companyInfo');
        infoDiv.innerHTML = '🏢 ' + escapeHtml(selectedCompanyInfo.companyName || item.sheetName) +
          (selectedCompanyInfo.industry ? ' / ' + escapeHtml(selectedCompanyInfo.industry) : '') +
          (selectedCompanyInfo.purpose ? ' / ' + escapeHtml(selectedCompanyInfo.purpose) : '');
        infoDiv.style.display = 'block';
      }
    }

    function updatePreview() {
      const input = document.getElementById('transcriptInput').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim() && selectedCompanyInfo) {
        let result = templateBase
          .replace('{{companyName}}', selectedCompanyInfo.companyName || '')
          .replace('{{industry}}', selectedCompanyInfo.industry || '')
          .replace('{{purpose}}', selectedCompanyInfo.purpose || '')
          .replace('{{target}}', selectedCompanyInfo.target || '')
          .replace('{{input}}', input);
        preview.textContent = result;
        copyBtn.disabled = false;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">企業を選択して文字起こしを貼り付けると、プレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    function copyTemplate() {
      copyToClipboard(templateBase);
    }

    function copyOutput() {
      const input = document.getElementById('transcriptInput').value;
      if (!input.trim() || !selectedCompanyInfo) {
        showStatus('企業を選択して文字起こしを入力してください', 'error');
        return;
      }
      let result = templateBase
        .replace('{{companyName}}', selectedCompanyInfo.companyName || '')
        .replace('{{industry}}', selectedCompanyInfo.industry || '')
        .replace('{{purpose}}', selectedCompanyInfo.purpose || '')
        .replace('{{target}}', selectedCompanyInfo.target || '')
        .replace('{{input}}', input);
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

      setAllButtonsDisabled(true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showStatus('💾 文字起こしを保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              setAllButtonsDisabled(true);
              showStatus('上書き保存中...', 'info');
              google.script.run
                .withSuccessHandler(function(r) {
                  setAllButtonsDisabled(false);
                  if (r.success) showStatus('💾 上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .withFailureHandler(function(e) {
                  setAllButtonsDisabled(false);
                  showStatus('エラー: ' + e.message, 'error');
                })
                .pv_saveToSheetForce(selectedSheetName, '文字起こし原文', input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showStatus('エラー: ' + e.message, 'error');
        })
        .pv_saveToSheet(selectedSheetName, '文字起こし原文', input, true);
    }

    function clearAll() {
      document.getElementById('transcriptInput').value = '';
      updatePreview();
      showStatus('クリアしました', 'info');
    }

    function toggleAccordion() {
      const content = document.getElementById('accordionContent');
      const arrow = document.getElementById('arrow');
      if (content.classList.contains('show')) {
        content.classList.remove('show');
        arrow.textContent = '▶';
      } else {
        content.classList.add('show');
        arrow.textContent = '▼';
      }
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        const success = document.getElementById('copySuccess');
        success.classList.add('show');
        setTimeout(function() { success.classList.remove('show'); }, 2000);
      });
    }

    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('companySelectDropdown');
      const display = document.getElementById('companySelectDisplay');
      if (!dropdown.contains(e.target) && !display.contains(e.target)) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      }
    });
  </script>
</body>
</html>
  `;
}

/**
 * ダイアログ用に基本情報を取得
 */
function pv_getBasicInfoForDialog(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {};

  return pv_getBasicInfoFromSheet(sheet);
}

// ================================================================================
// ===== AI出力を転記 =====
// ================================================================================

/**
 * AI出力を転記するダイアログを表示
 */
function pv_showTranscriptParseDialog() {
  const sheetData = pv_getCompanySheetListWithData('ヒアリング抽出JSON');

  const html = HtmlService.createHtmlOutput(pv_createTranscriptParseHTML(sheetData))
    .setWidth(750)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 AI出力を転記');
}

/**
 * AI出力転記ダイアログのHTML
 */
function pv_createTranscriptParseHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${PV_DIALOG_STYLES}
  <style>
    .input-textarea {
      width: 100%;
      height: 180px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      resize: vertical;
      font-family: monospace;
    }
    .save-btn { background: #ff9800; color: white; }
    .diff-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
    .diff-table th, .diff-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    .diff-table th { background: #f8f9fa; }
    .diff-container { max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <div id="step1">
    <!-- 企業選択 -->
    <div class="input-section">
      <span class="input-label">転記先企業を選択</span>
      <div class="company-select-wrapper">
        <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
          <span class="placeholder">企業シートを選択してください</span>
        </div>
        <div class="company-select-dropdown" id="companySelectDropdown"></div>
      </div>
    </div>

    <!-- JSON入力 -->
    <div class="input-section">
      <div class="input-header">
        <label class="input-label" style="margin-bottom:0;">AIが出力したJSONを貼り付け</label>
        <button class="btn save-btn" onclick="saveJson()">💾 JSON保存</button>
      </div>
      <textarea class="input-textarea" id="jsonInput" placeholder='{"コアメッセージ": "...", "ストーリーアイデア": "...", ...}'></textarea>
      <div class="note">※ コードブロック（\`\`\`json）で囲まれていても自動除去します</div>
    </div>

    <div class="footer">
      <button class="btn btn-blue" onclick="parseAndPreview()">🔍 解析してプレビュー</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <div id="step2" style="display:none;">
    <div class="input-label">転記内容の確認</div>
    <div class="diff-container">
      <table class="diff-table">
        <thead>
          <tr><th style="width:30%">項目</th><th>値</th></tr>
        </thead>
        <tbody id="diffBody"></tbody>
      </table>
    </div>

    <div class="footer" style="margin-top:12px;">
      <button class="btn btn-green" onclick="executeTransfer()">✅ 転記実行</button>
      <button class="btn btn-gray" onclick="goBack()">← 戻る</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="resultStatus"></div>
  </div>

  ${PV_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    let selectedSheetName = '';
    let parsedData = null;

    window.onload = function() {
      initCompanyDropdown();
    };

    function initCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      sheetData.companySheets.forEach(item => {
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' active' : '');
        const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
        div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
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

    function toggleCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      const display = document.getElementById('companySelectDisplay');
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectCompany(item) {
      selectedSheetName = item.sheetName;
      const display = document.getElementById('companySelectDisplay');
      display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';

      if (item.savedData) {
        document.getElementById('jsonInput').value = item.savedData;
        showStatus('保存済みのJSONを読み込みました', 'info');
      }
    }

    function cleanJsonString(jsonStr) {
      let cleanJson = jsonStr.trim();
      const codeBlockMarker = String.fromCharCode(96, 96, 96);
      if (cleanJson.startsWith(codeBlockMarker + 'json')) {
        cleanJson = cleanJson.substring(7);
      } else if (cleanJson.startsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(3);
      }
      if (cleanJson.endsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      return cleanJson.trim();
    }

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

      setAllButtonsDisabled(true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showStatus('💾 JSONを保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              setAllButtonsDisabled(true);
              showStatus('上書き保存中...', 'info');
              google.script.run
                .withSuccessHandler(function(r) {
                  setAllButtonsDisabled(false);
                  if (r.success) showStatus('💾 上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .withFailureHandler(function(e) {
                  setAllButtonsDisabled(false);
                  showStatus('エラー: ' + e.message, 'error');
                })
                .pv_saveToSheetForce(selectedSheetName, 'ヒアリング抽出JSON', jsonStr);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showStatus('エラー: ' + e.message, 'error');
        })
        .pv_saveToSheet(selectedSheetName, 'ヒアリング抽出JSON', jsonStr, true);
    }

    function parseAndPreview() {
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

      // プレビュー表示
      const tbody = document.getElementById('diffBody');
      tbody.innerHTML = '';

      const items = [
        { key: 'コアメッセージ', value: parsedData['コアメッセージ'] },
        { key: 'ストーリーアイデア', value: parsedData['ストーリーアイデア'] },
        { key: '安全装備', value: parsedData['安全装備'] },
        { key: 'NG要素', value: parsedData['NG要素'] },
        { key: '舞台・世界観', value: parsedData['舞台・世界観'] },
        { key: '音声設定', value: parsedData['音声設定'] }
      ];

      items.forEach(item => {
        if (item.value) {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td>' + escapeHtml(item.key) + '</td><td>' + escapeHtml(item.value) + '</td>';
          tbody.appendChild(tr);
        }
      });

      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
    }

    function executeTransfer() {
      setAllButtonsDisabled(true);
      showResultStatus('転記中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showResultStatus('✅ ' + result.count + '件の項目を転記しました', 'success');
            setTimeout(function() { google.script.host.close(); }, 2000);
          } else {
            showResultStatus('❌ 転記に失敗: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showResultStatus('エラー: ' + e.message, 'error');
        })
        .pv_executeTranscriptTransfer(parsedData, selectedSheetName);
    }

    function goBack() {
      document.getElementById('step1').style.display = 'block';
      document.getElementById('step2').style.display = 'none';
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

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        const success = document.getElementById('copySuccess');
        success.classList.add('show');
        setTimeout(function() { success.classList.remove('show'); }, 2000);
      });
    }

    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('companySelectDropdown');
      const display = document.getElementById('companySelectDisplay');
      if (!dropdown.contains(e.target) && !display.contains(e.target)) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      }
    });
  </script>
</body>
</html>
  `;
}

/**
 * 文字起こし抽出データを転記
 */
function pv_executeTranscriptTransfer(jsonData, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  let count = 0;
  try {
    for (const [jsonKey, sheetLabel] of Object.entries(PV_TRANSCRIPT_MAPPING)) {
      const value = jsonData[jsonKey];
      if (value) {
        pv_setCellValueByLabel(sheet, sheetLabel, value);
        count++;
      }
    }

    // JSONも保存
    pv_setCellValueByLabel(sheet, 'ヒアリング抽出JSON', JSON.stringify(jsonData, null, 2));

    return { success: true, count: count };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
