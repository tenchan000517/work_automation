/**
 * アニメPV制作 - ナレーション v2.0
 *
 * Fish Audioナレーション用設定・編集ダイアログ
 * 12シーン対応
 *
 * 外部依存:
 * - PV_DIALOG_STYLES, PV_UI_COMPONENTS (animePvCommonStyles.js)
 * - pv_getCompanySheetListWithData(), pv_getAllScenesFromSheet() (animePvSheetManager.js)
 * - pv_getCellValueByLabel(), pv_setCellValueByLabel() (animePvMain.js)
 */

// ================================================================================
// ===== 定数定義 =====
// ================================================================================

// Fish Audio ボイスプリセット（商用利用OK）
const PV_FISH_AUDIO_VOICES = [
  { id: 'custom', name: 'カスタム（ID入力）', description: '任意のボイスIDを入力' }
  // 実際のボイスIDはFish Audioで確認して追加
];

// Fish Audio デフォルト設定
const PV_FISH_AUDIO_DEFAULTS = {
  temperature: 0.7,
  topP: 0.7,
  speed: 1.0,
  volume: 0
};

// ================================================================================
// ===== ナレーション出力（Fish Audio設定対応） =====
// ================================================================================

/**
 * ナレーションテキスト出力ダイアログを表示（企業選択対応）
 */
function pv_showNarrationOutputDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('FishAudio_ボイスID');

  const htmlContent = pv_createNarrationDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(700)
    .setHeight(650);
  ui.showModalDialog(htmlOutput, '🗣️ ナレーション編集（Fish Audio設定）');
}

/**
 * シートからFish Audio設定を読み込む
 */
function pv_loadFishAudioSettings(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  return {
    success: true,
    settings: {
      voiceId: pv_getCellValueByLabel(sheet, 'FishAudio_ボイスID') || '',
      voiceName: pv_getCellValueByLabel(sheet, 'FishAudio_ボイス名') || '',
      temperature: parseFloat(pv_getCellValueByLabel(sheet, 'FishAudio_Temperature')) || PV_FISH_AUDIO_DEFAULTS.temperature,
      topP: parseFloat(pv_getCellValueByLabel(sheet, 'FishAudio_TopP')) || PV_FISH_AUDIO_DEFAULTS.topP,
      speed: parseFloat(pv_getCellValueByLabel(sheet, 'FishAudio_Speed')) || PV_FISH_AUDIO_DEFAULTS.speed,
      volume: parseFloat(pv_getCellValueByLabel(sheet, 'FishAudio_Volume')) || PV_FISH_AUDIO_DEFAULTS.volume
    }
  };
}

/**
 * シートからナレーション一覧を取得
 */
function pv_loadNarrationsForDialog(sheetName) {
  const scenes = pv_getAllScenesFromSheet(sheetName);
  const narrations = [];

  scenes.forEach((scene, index) => {
    narrations.push({
      scene: index + 1,
      name: scene.name || `シーン${index + 1}`,
      text: scene.narration || ''
    });
  });

  return narrations;
}

/**
 * Fish Audio設定をシートに保存
 */
function pv_saveFishAudioSettings(sheetName, settings) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    pv_setCellValueByLabel(sheet, 'FishAudio_ボイスID', settings.voiceId || '');
    pv_setCellValueByLabel(sheet, 'FishAudio_ボイス名', settings.voiceName || '');
    pv_setCellValueByLabel(sheet, 'FishAudio_Temperature', settings.temperature);
    pv_setCellValueByLabel(sheet, 'FishAudio_TopP', settings.topP);
    pv_setCellValueByLabel(sheet, 'FishAudio_Speed', settings.speed);
    pv_setCellValueByLabel(sheet, 'FishAudio_Volume', settings.volume);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ナレーションをシートに保存（シーンのナレーションフィールドを更新）
 */
function pv_saveNarrations(sheetName, narrationTexts) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    narrationTexts.forEach((text, index) => {
      const sceneNum = index + 1;
      pv_setCellValueByLabel(sheet, `シーン${sceneNum}_ナレーション`, text || '');
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function pv_createNarrationDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  const defaultsJson = JSON.stringify(PV_FISH_AUDIO_DEFAULTS);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .fish-audio-panel {
          background: #f0f9ff;
          border: 1px solid #7dd3fc;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .fish-audio-title {
          font-weight: bold;
          color: #0369a1;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .voice-id-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .voice-id-row .form-group { flex: 1; margin-bottom: 0; }
        .slider-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 8px;
        }
        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .slider-label { font-size: 12px; font-weight: bold; color: #333; }
        .slider-value { font-size: 12px; color: #0369a1; font-weight: bold; }
        .slider-input {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          background: #e0e0e0;
          border-radius: 3px;
          outline: none;
        }
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #0ea5e9;
          border-radius: 50%;
          cursor: pointer;
        }
        .narration-list {
          max-height: 280px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 16px;
        }
        .narration-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 8px;
        }
        .narration-item:last-child { margin-bottom: 0; }
        .narration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .narration-title { font-weight: bold; color: #374151; font-size: 12px; }
        .narration-text {
          width: 100%;
          height: 28px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 12px;
          resize: none;
        }
        .options-disabled { opacity: 0.5; pointer-events: none; }
        .footer-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
      </style>
    </head>
    <body>
      <h3>🗣️ ナレーション編集</h3>
      <p class="subtitle">ナレーションとFish Audio設定の編集・保存</p>

      <!-- 企業選択 -->
      <div class="input-section">
        <span class="input-label">対象企業を選択</span>
        <div class="company-select-wrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業シートを選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
      </div>

      <div id="optionsSection" class="options-disabled">
        <!-- Fish Audio設定パネル -->
        <div class="fish-audio-panel">
          <div class="fish-audio-title">🎙️ Fish Audio設定</div>
          <div class="voice-id-row">
            <div class="form-group">
              <label class="slider-label">ボイスID</label>
              <input type="text" id="voiceId" placeholder="例: xxx-xxx-xxx-xxx" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px;">
            </div>
            <div class="form-group">
              <label class="slider-label">ボイス名（メモ）</label>
              <input type="text" id="voiceName" placeholder="例: ナレーター女性1" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px;">
            </div>
          </div>
          <div class="slider-row">
            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Temperature</span>
                <span class="slider-value" id="tempValue">0.7</span>
              </div>
              <input type="range" class="slider-input" id="temperature" min="0.1" max="1.0" step="0.1" value="0.7" oninput="updateSliderValue('temperature', 'tempValue')">
            </div>
            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Top P</span>
                <span class="slider-value" id="topPValue">0.7</span>
              </div>
              <input type="range" class="slider-input" id="topP" min="0.1" max="1.0" step="0.1" value="0.7" oninput="updateSliderValue('topP', 'topPValue')">
            </div>
          </div>
          <div class="slider-row">
            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Speed</span>
                <span class="slider-value" id="speedValue">1.0</span>
              </div>
              <input type="range" class="slider-input" id="speed" min="0.5" max="2.0" step="0.1" value="1.0" oninput="updateSliderValue('speed', 'speedValue')">
            </div>
            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Volume</span>
                <span class="slider-value" id="volumeValue">0</span>
              </div>
              <input type="range" class="slider-input" id="volume" min="-10" max="10" step="1" value="0" oninput="updateSliderValue('volume', 'volumeValue')">
            </div>
          </div>
        </div>

        <!-- ナレーション一覧 -->
        <div class="section-title">ナレーション一覧</div>
        <div class="narration-list" id="narrationList">
          <p style="color:#666;">企業を選択するとナレーションが表示されます</p>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <div class="footer-buttons">
          <button class="btn btn-save" id="saveBtn" onclick="saveAll()" disabled>💾 全保存</button>
          <button class="btn btn-copy" id="copyAllBtn" onclick="copyAllWithSettings()" disabled>📋 全コピー</button>
          <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
        </div>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        const defaults = ${defaultsJson};
        let selectedSheetName = '';
        let narrations = [];

        window.onload = function() {
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
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">設定済</span>' : '';
            div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
            div.onclick = function(e) {
              e.stopPropagation();
              selectCompany(item);
              toggleCompanyDropdown();
            };
            dropdown.appendChild(div);
            if (item.isActive) selectCompany(item);
          });
        }

        function toggleCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          const display = document.getElementById('companySelectDisplay');
          dropdown.classList.toggle('show');
          display.classList.toggle('active');
        }

        function selectCompany(item) {
          selectedSheetName = item.sheetName;
          document.getElementById('companySelectDisplay').innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';
          document.getElementById('optionsSection').classList.remove('options-disabled');
          document.getElementById('saveBtn').disabled = false;
          document.getElementById('copyAllBtn').disabled = false;
          loadData();
        }

        function loadData() {
          showStatus('データ読み込み中...', 'info', 'status');
          // Fish Audio設定を読み込む
          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                const s = result.settings;
                document.getElementById('voiceId').value = s.voiceId || '';
                document.getElementById('voiceName').value = s.voiceName || '';
                document.getElementById('temperature').value = s.temperature;
                document.getElementById('topP').value = s.topP;
                document.getElementById('speed').value = s.speed;
                document.getElementById('volume').value = s.volume;
                updateSliderValue('temperature', 'tempValue');
                updateSliderValue('topP', 'topPValue');
                updateSliderValue('speed', 'speedValue');
                updateSliderValue('volume', 'volumeValue');
              }
            })
            .pv_loadFishAudioSettings(selectedSheetName);

          // ナレーションを読み込む
          google.script.run
            .withSuccessHandler(function(result) {
              narrations = result;
              renderNarrations();
              showStatus('', '', 'status');
            })
            .pv_loadNarrationsForDialog(selectedSheetName);
        }

        function renderNarrations() {
          const container = document.getElementById('narrationList');
          if (!narrations || narrations.length === 0) {
            container.innerHTML = '<p style="color:#666;">シーンがありません。</p>';
            return;
          }

          let html = '';
          narrations.forEach((n, i) => {
            html += '<div class="narration-item">' +
              '<div class="narration-header">' +
                '<span class="narration-title">シーン' + n.scene + '（' + escapeHtml(n.name) + '）</span>' +
                '<button class="btn btn-copy" onclick="copyNarration(' + i + ')">📋</button>' +
              '</div>' +
              '<input type="text" class="narration-text" id="narration' + i + '" value="' + escapeHtml(n.text) + '" placeholder="ナレーションを入力...">' +
            '</div>';
          });

          container.innerHTML = html;
        }

        function updateSliderValue(sliderId, valueId) {
          const value = document.getElementById(sliderId).value;
          document.getElementById(valueId).textContent = value;
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function copyNarration(index) {
          const text = document.getElementById('narration' + index).value;
          copyToClipboard(text);
        }

        function copyAllWithSettings() {
          const voiceId = document.getElementById('voiceId').value;
          const temperature = document.getElementById('temperature').value;
          const topP = document.getElementById('topP').value;
          const speed = document.getElementById('speed').value;
          const volume = document.getElementById('volume').value;

          let allText = '=== Fish Audio設定 ===\\n';
          allText += 'ボイスID: ' + voiceId + '\\n';
          allText += 'Temperature: ' + temperature + '\\n';
          allText += 'Top P: ' + topP + '\\n';
          allText += 'Speed: ' + speed + '\\n';
          allText += 'Volume: ' + volume + '\\n\\n';
          allText += '=== ナレーション ===\\n';

          narrations.forEach((n, i) => {
            const textarea = document.getElementById('narration' + i);
            if (textarea && textarea.value.trim()) {
              allText += '【シーン' + n.scene + '】' + n.name + '\\n';
              allText += textarea.value.trim() + '\\n\\n';
            }
          });

          copyToClipboard(allText.trim());
        }

        function saveAll() {
          if (!selectedSheetName) return;

          const settings = {
            voiceId: document.getElementById('voiceId').value,
            voiceName: document.getElementById('voiceName').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            topP: parseFloat(document.getElementById('topP').value),
            speed: parseFloat(document.getElementById('speed').value),
            volume: parseFloat(document.getElementById('volume').value)
          };

          // ナレーションテキストを収集
          const narrationTexts = [];
          for (let i = 0; i < 12; i++) {
            const input = document.getElementById('narration' + i);
            narrationTexts.push(input ? input.value : '');
          }

          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');

          let completed = 0;
          let errors = [];

          function checkDone() {
            completed++;
            if (completed >= 2) {
              setAllButtonsDisabled(false);
              if (errors.length > 0) {
                showStatus('❌ ' + errors.join(', '), 'error', 'status');
              } else {
                showStatus('✅ 保存しました', 'success', 'status');
              }
            }
          }

          // Fish Audio設定を保存
          google.script.run
            .withSuccessHandler(function(result) {
              if (!result.success) errors.push(result.error);
              checkDone();
            })
            .withFailureHandler(function(e) {
              errors.push(e.message);
              checkDone();
            })
            .pv_saveFishAudioSettings(selectedSheetName, settings);

          // ナレーションを保存
          google.script.run
            .withSuccessHandler(function(result) {
              if (!result.success) errors.push(result.error);
              checkDone();
            })
            .withFailureHandler(function(e) {
              errors.push(e.message);
              checkDone();
            })
            .pv_saveNarrations(selectedSheetName, narrationTexts);
        }

        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.company-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('companySelectDropdown').classList.remove('show');
            document.getElementById('companySelectDisplay').classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `;
}
