/**
 * アニメPV制作 - エフェクトシーンプロンプト生成機能 v2
 *
 * 【新しいUI/UX構造】
 * 1. 保存先選択（演出1-5）
 * 2. アクション選択（目を開く / 顔を上げる）← 起点
 * 3. エフェクト選択（アクションに紐づく4種類）
 * 4. 背景選択（場所 × 時間帯）
 * 5. スタイル選択（新海誠風など10種類）
 * 6. プロンプト生成 → 開始フレーム / 動画 / 終了フレーム
 *
 * 【3種類の出力プロンプト】
 * 1. 開始フレーム: 動作前の状態（目を閉じてる、クリーン構図）
 * 2. 動画プロンプト: タイムライン込みの動き記述
 * 3. 終了フレーム: 動作後の状態（目が開いた、エフェクトピーク）
 *
 * 【ネガティブプロンプト対応】
 * 開始フレーム・終了フレームにネガティブプロンプトを含む
 */

// ================================================================================
// ===== エフェクトシーンプロンプト生成ダイアログ =====
// ================================================================================

/**
 * エフェクトシーンプロンプト生成ダイアログを表示
 */
function pv_showEffectSceneDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  // 必要なデータを取得
  const stylePatterns = pv_getStylePatterns();
  const actions = pv_getActions();
  const effects = pv_getEffects();
  const locations = pv_getBackgroundLocations();
  const times = pv_getBackgroundTimes();
  const effectCount = pv_getEffectCount();
  // Part⑥の選択スタイルを取得
  const selectedStyleName = pv_getCellValueByLabel(sheet, '選択スタイル') || '';

  // 既存の演出データを取得
  const existingEffects = [];
  for (let i = 1; i <= effectCount; i++) {
    existingEffects.push(pv_getEffectSceneDataFromSheet(sheet, i));
  }

  const htmlContent = pv_createEffectSceneDialogHtml(
    sheetName,
    stylePatterns,
    actions,
    effects,
    locations,
    times,
    effectCount,
    existingEffects,
    selectedStyleName
  );
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(950)
    .setHeight(850);
  ui.showModalDialog(htmlOutput, '✨ エフェクトシーンプロンプト生成 v2');
}

/**
 * エフェクトシーンプロンプト生成ダイアログのHTMLを作成
 */
function pv_createEffectSceneDialogHtml(
  sheetName,
  stylePatterns,
  actions,
  effects,
  locations,
  times,
  effectCount,
  existingEffects,
  selectedStyleName
) {
  // JSONデータをエスケープして埋め込み
  const stylesJson = JSON.stringify(stylePatterns);
  const actionsJson = JSON.stringify(actions);
  const effectsJson = JSON.stringify(effects);
  const locationsJson = JSON.stringify(locations);
  const timesJson = JSON.stringify(times);
  const existingJson = JSON.stringify(existingEffects);

  // 選択スタイルのIDを特定
  let defaultStyleId = '';
  for (const style of stylePatterns) {
    if (style.name === selectedStyleName) {
      defaultStyleId = style.id;
      break;
    }
  }

  // 保存先ボタンを生成
  let saveDestButtons = '';
  for (let i = 1; i <= effectCount; i++) {
    const hasData = existingEffects[i-1] && existingEffects[i-1].name;
    const indicator = hasData ? '●' : '○';
    saveDestButtons += `
      <button class="dest-btn ${i === 1 ? 'selected' : ''}" data-dest="${i}" onclick="selectDestination(${i})">
        <span class="dest-indicator">${indicator}</span> 演出${i}
      </button>
    `;
  }

  // アクション選択肢を生成
  let actionOptions = '';
  for (const action of actions) {
    const inDevClass = action.inDevelopment ? ' in-dev' : '';
    const devBadge = action.inDevelopment ? '<span class="dev-badge">構築中</span>' : '';
    // サムネイルがある場合はimg、なければ絵文字
    const iconHtml = action.thumbnail
      ? `<img src="${pv_escapeHtml(action.thumbnail)}" class="thumbnail-gif" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';" /><span class="fallback-emoji" style="display:none;">${action.icon}</span>`
      : `<span class="fallback-emoji">${action.icon}</span>`;
    actionOptions += `
      <div class="action-option${inDevClass}" data-action-id="${action.id}" data-in-dev="${action.inDevelopment || false}" onclick="selectAction('${action.id}')">
        ${devBadge}
        <div class="action-icon">${iconHtml}</div>
        <div class="action-name">${pv_escapeHtml(action.name)}</div>
        <div class="action-timing">爆発: ${action.timing}</div>
      </div>
    `;
  }

  // 開始背景ドロップダウンを生成
  let locationBeforeDropdown = '<option value="">背景を選択...</option>';
  for (const loc of locations) {
    const selected = loc.id === 'dark_enclosed' ? 'selected' : '';
    locationBeforeDropdown += `<option value="${loc.id}" ${selected}>${pv_escapeHtml(loc.name)}</option>`;
  }

  // 終了背景ドロップダウンを生成
  let locationAfterDropdown = '<option value="">背景を選択...</option>';
  for (const loc of locations) {
    const selected = loc.id === 'urban' ? 'selected' : '';
    locationAfterDropdown += `<option value="${loc.id}" ${selected}>${pv_escapeHtml(loc.name)}</option>`;
  }

  // 時間帯ドロップダウンを生成（開始用）
  let timeBeforeDropdown = '<option value="">時間帯を選択...</option>';
  for (const time of times) {
    const selected = time.id === 'evening' ? 'selected' : '';
    timeBeforeDropdown += `<option value="${time.id}" ${selected}>${pv_escapeHtml(time.name)}</option>`;
  }

  // 時間帯ドロップダウンを生成（終了用）
  let timeAfterDropdown = '<option value="">時間帯を選択...</option>';
  for (const time of times) {
    const selected = time.id === 'morning' ? 'selected' : '';
    timeAfterDropdown += `<option value="${time.id}" ${selected}>${pv_escapeHtml(time.name)}</option>`;
  }

  // スタイル選択肢を生成
  let styleOptions = '';
  for (const style of stylePatterns) {
    const isSelected = style.id === defaultStyleId;
    styleOptions += `
      <div class="style-option ${isSelected ? 'selected' : ''}" data-style-id="${style.id}" onclick="selectStyle('${style.id}')">
        <div class="style-name">${pv_escapeHtml(style.name)}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${ANIME_PV_DIALOG_STYLES}
      <style>
        /* 全体レイアウト */
        body {
          font-family: 'Segoe UI', 'Meiryo', sans-serif;
          margin: 0;
          padding: 16px;
          background: #f8f9fa;
          overflow-y: auto;
        }

        h3 {
          margin: 0 0 4px 0;
          color: #333;
        }

        .subtitle {
          color: #666;
          margin: 0 0 16px 0;
          font-size: 13px;
        }

        .section-title {
          font-weight: bold;
          color: #444;
          margin: 16px 0 8px 0;
          font-size: 14px;
        }

        /* 保存先セクション */
        .dest-section {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .dest-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dest-label {
          font-weight: bold;
          color: #166534;
          margin-right: 8px;
        }
        .dest-btn {
          padding: 6px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        .dest-btn:hover { border-color: #7c3aed; }
        .dest-btn.selected { border-color: #7c3aed; background: #ede9fe; }
        .dest-indicator { font-size: 8px; }

        /* アクショングリッド */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .action-option {
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          background: white;
        }
        .action-option:hover { border-color: #7c3aed; background: #faf5ff; }
        .action-option.selected { border-color: #7c3aed; background: #ede9fe; }
        .action-option { position: relative; }
        .action-icon { font-size: 24px; margin-bottom: 4px; line-height: 1; }
        .action-icon .thumbnail-gif {
          width: 64px;
          height: 36px;
          object-fit: cover;
          border-radius: 4px;
        }
        .action-icon .fallback-emoji { font-size: 24px; }
        .action-name { font-size: 11px; font-weight: bold; color: #333; }
        .action-timing { font-size: 10px; color: #888; margin-top: 2px; }
        .dev-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #fbbf24;
          color: #78350f;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }
        .action-option.in-dev {
          opacity: 0.8;
          border-style: dashed;
        }

        /* エフェクトグリッド */
        .effect-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .effect-section.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .effect-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .effect-option {
          padding: 16px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          background: white;
          position: relative;
        }
        .effect-option:hover { border-color: #7c3aed; background: #faf5ff; }
        .effect-option.selected { border-color: #7c3aed; background: #ede9fe; }
        .effect-option.in-dev {
          opacity: 0.8;
          border-style: dashed;
        }
        .effect-icon { font-size: 32px; margin-bottom: 8px; line-height: 1; }
        .effect-icon .thumbnail-gif {
          width: 112px;
          height: 63px;
          object-fit: cover;
          border-radius: 6px;
        }
        .effect-icon .fallback-emoji { font-size: 32px; }
        .effect-name { font-size: 12px; font-weight: bold; color: #333; }
        .effect-dev-badge {
          position: absolute;
          top: 2px;
          left: 2px;
          background: #fbbf24;
          color: #78350f;
          font-size: 8px;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: bold;
        }
        .verified-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 10px;
          color: #16a34a;
        }

        /* シーン背景セクション */
        .scene-row {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }
        .scene-row .form-group { flex: 1; margin-bottom: 0; }
        .form-group label {
          display: block;
          font-size: 12px;
          color: #555;
          margin-bottom: 4px;
        }
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
        }
        .form-group input[type="text"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          box-sizing: border-box;
        }
        .custom-input-row {
          margin-bottom: 16px;
        }

        /* スタイルグリッド */
        .style-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .style-option {
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          background: white;
        }
        .style-option:hover { border-color: #7c3aed; background: #faf5ff; }
        .style-option.selected { border-color: #7c3aed; background: #ede9fe; }
        .style-name { font-size: 11px; font-weight: bold; color: #333; }

        /* ボタン */
        .main-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-generate { background: #7c3aed; color: white; }
        .btn-generate:hover:not(:disabled) { background: #6d28d9; }
        .btn-save-sheet { background: #3b82f6; color: white; }
        .btn-save-sheet:hover:not(:disabled) { background: #2563eb; }
        .btn-secondary { background: #e5e7eb; color: #374151; }
        .btn-secondary:hover { background: #d1d5db; }
        .btn-copy { background: #f3f4f6; color: #374151; padding: 6px 12px; font-size: 12px; }
        .btn-copy:hover { background: #e5e7eb; }

        /* 結果セクション */
        .results-section {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-top: 16px;
          display: none;
        }
        .results-section.show { display: block; }
        .result-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
        }
        .result-tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          background: #f8f9fa;
          border: none;
          font-size: 13px;
          transition: all 0.2s;
        }
        .result-tab:first-child { border-radius: 8px 0 0 0; }
        .result-tab:last-child { border-radius: 0 8px 0 0; }
        .result-tab.active {
          background: #7c3aed;
          color: white;
        }
        .result-tab:hover:not(.active) { background: #ede9fe; }
        .result-content {
          padding: 16px;
        }
        .result-pane {
          display: none;
        }
        .result-pane.active {
          display: block;
        }
        .prompt-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .prompt-box {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 11px;
          white-space: pre-wrap;
          min-height: 80px;
          max-height: 200px;
          overflow-y: auto;
          color: #333;
          margin-bottom: 8px;
        }
        .copy-btn-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        /* ステータス */
        .status {
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 12px;
          font-size: 13px;
          display: none;
        }
        .status.success {
          display: block;
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }
        .status.error {
          display: block;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        /* フッター */
        .footer {
          margin-top: 16px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <h3>✨ エフェクトシーンプロンプト生成 v2</h3>
      <p class="subtitle">アクション×エフェクトの組み合わせでI2V用プロンプトを生成</p>

      <!-- 保存先選択 -->
      <div class="dest-section">
        <div class="dest-row">
          <span class="dest-label">■ 保存先:</span>
          ${saveDestButtons}
        </div>
      </div>

      <!-- アクション選択 -->
      <div class="section-title">■ アクション選択（人物の動き）</div>
      <div class="action-grid" id="actionGrid">
        ${actionOptions}
      </div>

      <!-- エフェクト選択 -->
      <div class="section-title">■ エフェクト選択</div>
      <div class="effect-section disabled" id="effectSection">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">※ 先にアクションを選択してください</div>
        <div class="effect-grid" id="effectGrid">
          <!-- 動的に生成 -->
        </div>
      </div>

      <!-- シーン背景（開始） -->
      <div class="section-title">■ 背景（開始）</div>
      <div class="scene-row">
        <div class="form-group">
          <label>場所</label>
          <select id="locationBeforeSelect" onchange="onLocationChange('before')">
            ${locationBeforeDropdown}
          </select>
        </div>
        <div class="form-group">
          <label>時間帯</label>
          <select id="timeBeforeSelect" onchange="updateGenerateButton()">
            ${timeBeforeDropdown}
          </select>
        </div>
      </div>
      <div class="custom-input-row" id="customBeforeRow" style="display:none;">
        <div class="form-group" style="flex:1;">
          <label>カスタム背景（開始）</label>
          <input type="text" id="customBeforeInput" placeholder="例: abandoned warehouse, dusty atmosphere, dim lighting" onchange="updateGenerateButton()" />
        </div>
      </div>

      <!-- シーン背景（終了） -->
      <div class="section-title">■ 背景（終了）</div>
      <div class="scene-row">
        <div class="form-group">
          <label>場所</label>
          <select id="locationAfterSelect" onchange="onLocationChange('after')">
            ${locationAfterDropdown}
          </select>
        </div>
        <div class="form-group">
          <label>時間帯</label>
          <select id="timeAfterSelect" onchange="updateGenerateButton()">
            ${timeAfterDropdown}
          </select>
        </div>
      </div>
      <div class="custom-input-row" id="customAfterRow" style="display:none;">
        <div class="form-group" style="flex:1;">
          <label>カスタム背景（終了）</label>
          <input type="text" id="customAfterInput" placeholder="例: bright open field, blue sky, sunlight" onchange="updateGenerateButton()" />
        </div>
      </div>

      <!-- スタイル選択 -->
      <div class="section-title">■ スタイル選択（参考：プロンプトには新海誠スタイルがデフォルト）</div>
      <div class="style-grid">
        ${styleOptions}
      </div>

      <!-- ボタン -->
      <div class="main-actions">
        <button class="btn btn-generate" id="generateBtn" onclick="generatePrompts()" disabled>🎬 プロンプト生成</button>
        <button class="btn btn-save-sheet" id="saveBtn" onclick="saveToSheet()" disabled>💾 シートに保存</button>
      </div>

      <!-- 結果表示 -->
      <div class="results-section" id="resultsSection">
        <div class="result-tabs">
          <button class="result-tab active" data-tab="startFrame" onclick="switchResultTab('startFrame')">🖼️ 開始フレーム</button>
          <button class="result-tab" data-tab="endFrame" onclick="switchResultTab('endFrame')">🖼️ 終了フレーム</button>
          <button class="result-tab" data-tab="video" onclick="switchResultTab('video')">🎬 動画</button>
        </div>
        <div class="result-content">
          <!-- 開始フレーム -->
          <div class="result-pane active" id="pane-startFrame">
            <div class="prompt-label">プロンプト（ネガティブ含む）:</div>
            <div class="prompt-box" id="prompt-startFrame"></div>
            <div class="copy-btn-row">
              <button class="btn btn-copy" onclick="copyPrompt('startFrame')">📋 コピー</button>
            </div>
          </div>
          <!-- 動画 -->
          <div class="result-pane" id="pane-video">
            <div class="prompt-label">動画プロンプト（KLING v3 / VIDU Q3）:</div>
            <div class="prompt-box" id="prompt-video"></div>
            <div class="copy-btn-row">
              <button class="btn btn-copy" onclick="copyPrompt('video')">📋 コピー</button>
            </div>
          </div>
          <!-- 終了フレーム -->
          <div class="result-pane" id="pane-endFrame">
            <div class="prompt-label">プロンプト（ネガティブ含む）:</div>
            <div class="prompt-box" id="prompt-endFrame"></div>
            <div class="copy-btn-row">
              <button class="btn btn-copy" onclick="copyPrompt('endFrame')">📋 コピー</button>
            </div>
          </div>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
      </div>

      <script>
        // ===== データ =====
        const sheetName = '${pv_escapeHtml(sheetName)}';
        const stylePatterns = ${stylesJson};
        const actions = ${actionsJson};
        const effects = ${effectsJson};
        const locations = ${locationsJson};
        const times = ${timesJson};
        const existingEffects = ${existingJson};

        // ===== 状態管理 =====
        let selectedDestination = 1;
        let selectedActionId = null;
        let selectedEffectId = null;
        let selectedStyleId = '${defaultStyleId}';
        let generatedPrompts = {
          startFrame: '',
          startFrameNeg: '',
          video: '',
          endFrame: '',
          endFrameNeg: ''
        };

        // ===== 初期化 =====
        window.onload = function() {
          updateGenerateButton();
        };

        // ===== 保存先選択 =====
        function selectDestination(num) {
          selectedDestination = num;
          document.querySelectorAll('.dest-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.dest) === num);
          });
        }

        // ===== アクション選択 =====
        function selectAction(actionId) {
          selectedActionId = actionId;
          selectedEffectId = null; // エフェクト選択をリセット

          document.querySelectorAll('.action-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.actionId === actionId);
          });

          // エフェクトグリッドを更新
          updateEffectGrid();
          updateGenerateButton();
        }

        // ===== エフェクトグリッド更新 =====
        function updateEffectGrid() {
          const section = document.getElementById('effectSection');
          const grid = document.getElementById('effectGrid');

          if (!selectedActionId) {
            section.classList.add('disabled');
            grid.innerHTML = '';
            return;
          }

          section.classList.remove('disabled');

          // 選択したアクションに紐づくエフェクトを取得
          const action = actions.find(a => a.id === selectedActionId);
          if (!action) return;

          const linkedEffects = action.effects.map(eid => effects.find(e => e.id === eid)).filter(e => e);

          let html = '';
          for (const effect of linkedEffects) {
            const verifiedBadge = ''; // 検証済みバッジは非表示
            const inDevClass = effect.inDevelopment ? ' in-dev' : '';
            const devBadge = effect.inDevelopment ? '<span class="effect-dev-badge">構築中</span>' : '';
            // サムネイルがある場合はimg、なければ絵文字
            let iconHtml;
            if (effect.thumbnail) {
              iconHtml = '<img src="' + escapeHtml(effect.thumbnail) + '" class="thumbnail-gif" onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'inline\\';" /><span class="fallback-emoji" style="display:none;">' + effect.icon + '</span>';
            } else {
              iconHtml = '<span class="fallback-emoji">' + effect.icon + '</span>';
            }
            html += '<div class="effect-option' + inDevClass + '" data-effect-id="' + effect.id + '" data-in-dev="' + (effect.inDevelopment || false) + '" onclick="selectEffect(\\'' + effect.id + '\\')">' +
              devBadge +
              verifiedBadge +
              '<div class="effect-icon">' + iconHtml + '</div>' +
              '<div class="effect-name">' + escapeHtml(effect.name) + '</div>' +
              '</div>';
          }
          grid.innerHTML = html;
        }

        // ===== エフェクト選択 =====
        function selectEffect(effectId) {
          selectedEffectId = effectId;
          document.querySelectorAll('.effect-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.effectId === effectId);
          });
          updateGenerateButton();
        }

        // ===== スタイル選択 =====
        function selectStyle(styleId) {
          selectedStyleId = styleId;
          document.querySelectorAll('.style-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.styleId === styleId);
          });
          updateGenerateButton();
        }

        // ===== 場所選択変更時（カスタム表示切替） =====
        function onLocationChange(type) {
          const selectId = type === 'before' ? 'locationBeforeSelect' : 'locationAfterSelect';
          const customRowId = type === 'before' ? 'customBeforeRow' : 'customAfterRow';
          const selectedValue = document.getElementById(selectId).value;

          if (selectedValue === 'custom') {
            document.getElementById(customRowId).style.display = 'block';
          } else {
            document.getElementById(customRowId).style.display = 'none';
          }
          updateGenerateButton();
        }

        // ===== 背景文字列を取得 =====
        function getBackgroundString(type) {
          const locationSelectId = type === 'before' ? 'locationBeforeSelect' : 'locationAfterSelect';
          const timeSelectId = type === 'before' ? 'timeBeforeSelect' : 'timeAfterSelect';
          const customInputId = type === 'before' ? 'customBeforeInput' : 'customAfterInput';

          const locationId = document.getElementById(locationSelectId).value;
          const timeId = document.getElementById(timeSelectId).value;

          if (locationId === 'custom') {
            const customValue = document.getElementById(customInputId).value.trim();
            if (customValue) {
              const time = times.find(t => t.id === timeId);
              return customValue + (time ? ', ' + time.en : '');
            }
            return '';
          }

          const location = locations.find(l => l.id === locationId);
          const time = times.find(t => t.id === timeId);

          if (location && time) {
            return location.en + ', ' + time.en;
          }
          return '';
        }

        // ===== 生成ボタン状態更新 =====
        function updateGenerateButton() {
          const hasAction = selectedActionId !== null;
          const hasEffect = selectedEffectId !== null;

          // 開始背景チェック
          const locationBeforeId = document.getElementById('locationBeforeSelect').value;
          const timeBeforeId = document.getElementById('timeBeforeSelect').value;
          let hasBackgroundBefore = false;
          if (locationBeforeId === 'custom') {
            hasBackgroundBefore = document.getElementById('customBeforeInput').value.trim() !== '' && timeBeforeId !== '';
          } else {
            hasBackgroundBefore = locationBeforeId !== '' && timeBeforeId !== '';
          }

          // 終了背景チェック
          const locationAfterId = document.getElementById('locationAfterSelect').value;
          const timeAfterId = document.getElementById('timeAfterSelect').value;
          let hasBackgroundAfter = false;
          if (locationAfterId === 'custom') {
            hasBackgroundAfter = document.getElementById('customAfterInput').value.trim() !== '' && timeAfterId !== '';
          } else {
            hasBackgroundAfter = locationAfterId !== '' && timeAfterId !== '';
          }

          const canGenerate = hasAction && hasEffect && hasBackgroundBefore && hasBackgroundAfter;
          document.getElementById('generateBtn').disabled = !canGenerate;
        }

        // ===== プロンプト生成 =====
        function generatePrompts() {
          const action = actions.find(a => a.id === selectedActionId);
          const effect = effects.find(e => e.id === selectedEffectId);

          const backgroundBefore = getBackgroundString('before');
          const backgroundAfter = getBackgroundString('after');

          if (!action || !effect || !backgroundBefore || !backgroundAfter) {
            showStatus('全ての項目を選択してください', 'error');
            return;
          }

          // サーバー側でプロンプトを取得
          showStatus('プロンプトを生成中...', 'success');

          google.script.run
            .withSuccessHandler(function(result) {
              if (result && result.startFrame) {
                // プロンプトとネガティブを結合
                generatedPrompts = {
                  startFrame: result.startFrame + (result.startFrameNeg ? '\\n\\n' + result.startFrameNeg : ''),
                  video: result.video,
                  endFrame: result.endFrame + (result.endFrameNeg ? '\\n\\n' + result.endFrameNeg : ''),
                  // 保存用に元データも保持
                  _raw: result
                };

                // 表示更新
                document.getElementById('prompt-startFrame').textContent = generatedPrompts.startFrame;
                document.getElementById('prompt-video').textContent = generatedPrompts.video;
                document.getElementById('prompt-endFrame').textContent = generatedPrompts.endFrame;

                document.getElementById('resultsSection').classList.add('show');
                document.getElementById('saveBtn').disabled = false;
                showStatus('✅ プロンプトを生成しました', 'success');
              } else {
                showStatus('❌ プロンプトの取得に失敗しました', 'error');
              }
            })
            .withFailureHandler(function(error) {
              showStatus('❌ エラー: ' + error.message, 'error');
            })
            .pv_getEffectPromptsV2(selectedActionId, selectedEffectId, backgroundBefore, backgroundAfter);
        }

        // ===== 結果タブ切り替え =====
        function switchResultTab(tabId) {
          document.querySelectorAll('.result-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
          });
          document.querySelectorAll('.result-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === 'pane-' + tabId);
          });
        }

        // ===== コピー =====
        function copyPrompt(type) {
          const text = generatedPrompts[type] || '';
          if (text) {
            copyToClipboard(text);
          }
        }

        function copyToClipboard(text) {
          navigator.clipboard.writeText(text).then(function() {
            showStatus('📋 コピーしました', 'success');
            setTimeout(function() {
              document.getElementById('status').style.display = 'none';
            }, 2000);
          }).catch(function(err) {
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showStatus('📋 コピーしました', 'success');
            setTimeout(function() {
              document.getElementById('status').style.display = 'none';
            }, 2000);
          });
        }

        // ===== シートに保存 =====
        function saveToSheet() {
          if (!generatedPrompts.startFrame || !generatedPrompts.video || !generatedPrompts.endFrame) {
            showStatus('先にプロンプトを生成してください', 'error');
            return;
          }

          const action = actions.find(a => a.id === selectedActionId);
          const effect = effects.find(e => e.id === selectedEffectId);
          const style = stylePatterns.find(s => s.id === selectedStyleId);

          const data = {
            name: (action ? action.name : '') + ' × ' + (effect ? effect.name : ''),
            template: style ? style.name : '新海誠スタイル',
            action: action ? action.name : '',
            effect: effect ? effect.id : '',
            videoPrompt: generatedPrompts.video,
            startFramePrompt: generatedPrompts.startFrame,
            endFramePrompt: generatedPrompts.endFrame
          };

          document.getElementById('saveBtn').disabled = true;
          document.getElementById('saveBtn').textContent = '保存中...';

          google.script.run
            .withSuccessHandler(function(result) {
              document.getElementById('saveBtn').disabled = false;
              document.getElementById('saveBtn').textContent = '💾 シートに保存';
              if (result.success) {
                showStatus('✅ 演出' + selectedDestination + 'に保存しました', 'success');
                // 保存先ボタンのインジケータを更新
                const btn = document.querySelector('.dest-btn[data-dest="' + selectedDestination + '"]');
                if (btn) {
                  btn.querySelector('.dest-indicator').textContent = '●';
                }
              } else {
                showStatus('❌ ' + result.error, 'error');
              }
            })
            .withFailureHandler(function(error) {
              document.getElementById('saveBtn').disabled = false;
              document.getElementById('saveBtn').textContent = '💾 シートに保存';
              showStatus('❌ エラー: ' + error.message, 'error');
            })
            .pv_saveEffectSceneToSheet(sheetName, selectedDestination, data);
        }

        // ===== ユーティリティ =====
        function showStatus(message, type) {
          const status = document.getElementById('status');
          status.textContent = message;
          status.className = 'status ' + type;
        }

        function escapeHtml(str) {
          if (!str) return '';
          return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }
      <\/script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== シート保存・読み込み関数 =====
// ================================================================================
// 注意: pv_saveEffectSceneToSheet と pv_getEffectSceneDataFromSheet は
// animePvSheetManager.js で定義されています。そちらを使用してください。

// ================================================================================
// ===== HTMLエスケープ関数 =====
// ================================================================================

/**
 * HTML特殊文字をエスケープ
 */
function pv_escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
