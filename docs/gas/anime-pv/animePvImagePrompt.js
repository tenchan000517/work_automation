/**
 * アニメPV制作 - シーン生成プロンプト生成 v3.0
 *
 * キャラクターシート・開始フレームのプロンプトを自動生成
 * 12シーン + エンディング対応
 * スタイル選択はダイアログで行う
 */

// ================================================================================
// ===== キャラクターシートプロンプト =====
// ================================================================================

/**
 * キャラクターシートプロンプト生成ダイアログを表示
 */
function pv_showCharacterSheetPromptDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const characters = pv_getAllCharactersFromSheet(sheetName);
  const stylePatterns = pv_getStylePatterns();
  // Part⑥の選択スタイルを取得
  const selectedStyleName = pv_getCellValueByLabel(sheet, '選択スタイル') || '';

  const htmlContent = pv_createCharacterSheetDialogHtml(sheetName, characters, stylePatterns, selectedStyleName);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(900)
    .setHeight(700);
  ui.showModalDialog(htmlOutput, '🎨 キャラクターシートプロンプト生成');
}

/**
 * キャラクターシートダイアログのHTMLを作成
 */
function pv_createCharacterSheetDialogHtml(sheetName, characters, stylePatterns, selectedStyleName) {
  const patternsJson = JSON.stringify(stylePatterns);
  const charactersJson = JSON.stringify(characters);

  // 選択スタイルのIDを特定
  let defaultStyleId = '';
  for (const style of stylePatterns) {
    if (style.name === selectedStyleName) {
      defaultStyleId = style.id;
      break;
    }
  }

  // スタイル選択オプションを生成
  let styleOptions = '';
  for (const style of stylePatterns) {
    const isSelected = style.id === defaultStyleId;
    styleOptions += `
      <div class="style-option ${isSelected ? 'selected' : ''}" data-style-id="${style.id}" onclick="selectStyle('${style.id}')">
        <div class="style-name">${pv_escapeHtml(style.name)}</div>
        <div class="style-desc">${pv_escapeHtml(style.description)}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .style-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
        .style-option {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .style-option:hover { border-color: #7c3aed; background: #faf5ff; }
        .style-option.selected { border-color: #7c3aed; background: #ede9fe; }
        .style-name { font-weight: bold; color: #333; font-size: 12px; }
        .style-desc { font-size: 10px; color: #666; margin-top: 4px; }
        .character-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .character-tab {
          padding: 8px 12px;
          border: none;
          background: #f0f0f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          flex: 1;
          min-width: 100px;
          text-align: center;
        }
        .character-tab.active { background: #7c3aed; color: white; }
        .character-tab:hover:not(.active) { background: #e0e0e0; }
        .character-content { display: none; }
        .character-content.active { display: block; }
        .mode-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 4px;
        }
        .mode-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .mode-btn.active { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .mode-btn:hover:not(.active) { background: #e0e0e0; }
        .mode-description {
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .mode-description.text-mode { background: #e3f2fd; border-color: #90caf9; }
        .optional-fields {
          background: #fff3e0;
          border: 1px solid #ffcc80;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .optional-field {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
        }
        .optional-field:last-child { margin-bottom: 0; }
        .optional-field input[type="checkbox"] { width: 16px; height: 16px; }
        .optional-field label { flex: 1; font-size: 12px; }
        .optional-field input[type="text"] {
          flex: 2;
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }
        .optional-field input[type="text"]:disabled { background: #f5f5f5; }
        .char-info-display {
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 12px;
          margin-bottom: 12px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <h3>🎨 キャラクターシートプロンプト生成</h3>
      <p class="subtitle">モードとスタイルを選択してプロンプトを生成</p>

      <!-- モード切替 -->
      <div class="section-title">生成モードを選択</div>
      <div class="mode-toggle">
        <button class="mode-btn active" id="modeImageRef" onclick="switchMode('imageRef')">
          🖼️ 画像参照モード
        </button>
        <button class="mode-btn" id="modeText" onclick="switchMode('text')">
          📝 テキスト詳細モード
        </button>
      </div>

      <div id="modeDescImageRef" class="mode-description">
        <strong>画像参照モード</strong>: 参照画像を添付する場合に最適。外見の詳細指定は不要（画像から取得されるため）。<br>
        「no text」「character reference sheet」などの基本指示を自動挿入します。
      </div>
      <div id="modeDescText" class="mode-description text-mode" style="display:none;">
        <strong>テキスト詳細モード</strong>: 参照画像なしで生成する場合。髪型、目、体格などの詳細をテキストで指定します。
      </div>

      <!-- キャラクター選択タブ（上部に配置） -->
      <div class="section-title">キャラクターを選択</div>
      <div class="character-tabs">
        <button class="character-tab active" onclick="switchSheet('1past')">キャラ1 過去編</button>
        <button class="character-tab" onclick="switchSheet('1current')">キャラ1 現在編</button>
        <button class="character-tab" onclick="switchSheet('2current')">キャラ2</button>
      </div>

      <!-- キャラクター情報表示 -->
      <div id="charInfoDisplay" class="char-info-display">
        <span style="color:#999;">読み込み中...</span>
      </div>

      <!-- 画像参照モード - オプション追加項目 -->
      <div id="optionalFields" class="optional-fields">
        <div style="font-weight:bold;margin-bottom:8px;font-size:13px;">追加オプション（任意） - シートのデータから自動セット済み</div>
        <div class="optional-field">
          <input type="checkbox" id="optGender" onchange="updatePrompts()">
          <label for="optGender">性別を指定</label>
          <select id="optGenderVal" onchange="updatePrompts()" style="flex:2;padding:6px;border:1px solid #ddd;border-radius:4px;">
            <option value="">-</option>
            <option value="male">男性 (male)</option>
            <option value="female">女性 (female)</option>
          </select>
        </div>
        <div class="optional-field">
          <input type="checkbox" id="optAge" onchange="updatePrompts()">
          <label for="optAge">年齢を指定</label>
          <input type="text" id="optAgeVal" placeholder="例: 25" onchange="updatePrompts()">
        </div>
        <div class="optional-field">
          <input type="checkbox" id="optOutfit" onchange="updatePrompts()">
          <label for="optOutfit">服装を指定</label>
          <input type="text" id="optOutfitVal" placeholder="例: work uniform, casual clothes" onchange="updatePrompts()">
        </div>
      </div>

      <div class="section-title">スタイルを選択</div>
      <div class="style-grid">
        ${styleOptions}
      </div>

      <div id="sheet1pastContent" class="character-content active">
        <div class="prompt-result">
          <div class="prompt-result-header">
            <span class="prompt-result-title">キャラクター1 過去編シート</span>
            <div class="prompt-result-actions">
              <button class="btn btn-copy" onclick="copyPrompt('1past')">📋 コピー</button>
              <button class="btn btn-save" onclick="savePrompt('1past')">💾 保存</button>
            </div>
          </div>
          <div class="prompt-result-body" id="prompt1past">モードとスタイルを選択するとプロンプトが生成されます</div>
        </div>
      </div>

      <div id="sheet1currentContent" class="character-content">
        <div class="prompt-result">
          <div class="prompt-result-header">
            <span class="prompt-result-title">キャラクター1 現在編シート</span>
            <div class="prompt-result-actions">
              <button class="btn btn-copy" onclick="copyPrompt('1current')">📋 コピー</button>
              <button class="btn btn-save" onclick="savePrompt('1current')">💾 保存</button>
            </div>
          </div>
          <div class="prompt-result-body" id="prompt1current">モードとスタイルを選択するとプロンプトが生成されます</div>
        </div>
      </div>

      <div id="sheet2currentContent" class="character-content">
        <div class="prompt-result">
          <div class="prompt-result-header">
            <span class="prompt-result-title">キャラクター2 シート</span>
            <div class="prompt-result-actions">
              <button class="btn btn-copy" onclick="copyPrompt('2current')">📋 コピー</button>
              <button class="btn btn-save" onclick="savePrompt('2current')">💾 保存</button>
            </div>
          </div>
          <div class="prompt-result-body" id="prompt2current">モードとスタイルを選択するとプロンプトが生成されます</div>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetName = '${pv_escapeHtml(sheetName)}';
        const stylePatterns = ${patternsJson};
        const characters = ${charactersJson};
        let selectedStyleId = '${defaultStyleId}';
        let currentMode = 'imageRef'; // 'imageRef' or 'text'
        let currentSheetKey = '1past'; // '1past', '1current', '2current'
        let generatedPrompts = { '1past': '', '1current': '', '2current': '' };

        // 初期化
        window.onload = function() {
          switchSheet('1past');
          // 選択スタイルがあれば初期プロンプト生成
          if (selectedStyleId) {
            updatePrompts();
          }
        };

        function switchMode(mode) {
          currentMode = mode;
          document.getElementById('modeImageRef').classList.toggle('active', mode === 'imageRef');
          document.getElementById('modeText').classList.toggle('active', mode === 'text');
          document.getElementById('modeDescImageRef').style.display = mode === 'imageRef' ? 'block' : 'none';
          document.getElementById('modeDescText').style.display = mode === 'text' ? 'block' : 'none';
          document.getElementById('optionalFields').style.display = mode === 'imageRef' ? 'block' : 'none';

          updatePrompts();
        }

        function selectStyle(styleId) {
          selectedStyleId = styleId;
          document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-style-id="' + styleId + '"]').classList.add('selected');

          updatePrompts();
        }

        function switchSheet(sheetKey) {
          currentSheetKey = sheetKey;

          // タブ切り替え
          document.querySelectorAll('.character-tab').forEach((el, i) => {
            const keys = ['1past', '1current', '2current'];
            el.classList.toggle('active', keys[i] === sheetKey);
          });

          // コンテンツ表示切り替え
          ['1past', '1current', '2current'].forEach(key => {
            document.getElementById('sheet' + key + 'Content').classList.toggle('active', key === sheetKey);
          });

          // キャラクターデータをプリセット
          const charNum = sheetKey.startsWith('1') ? 1 : 2;
          const isPast = sheetKey.includes('past');
          const charData = characters[charNum - 1] || {};
          presetCharacterDataForSheet(charData, isPast);
          updateCharacterInfoDisplay(charData, charNum, isPast);
          updatePrompts();
        }

        function presetCharacterDataForSheet(charData, isPast) {
          // 性別
          if (charData.gender) {
            const isFemale = charData.gender.includes('女');
            document.getElementById('optGenderVal').value = isFemale ? 'female' : 'male';
          } else {
            document.getElementById('optGenderVal').value = '';
          }

          // 年齢（過去編/現在編で異なる）
          if (isPast && charData.pastAge) {
            // pastAgeは "17歳" のような文字列なので数字部分を抽出
            const ageMatch = String(charData.pastAge).match(/(\d+)/);
            document.getElementById('optAgeVal').value = ageMatch ? ageMatch[1] : charData.pastAge;
          } else if (!isPast && charData.currentAge) {
            // currentAgeは "28歳" のような文字列なので数字部分を抽出
            const ageMatch = String(charData.currentAge).match(/(\d+)/);
            document.getElementById('optAgeVal').value = ageMatch ? ageMatch[1] : charData.currentAge;
          } else {
            document.getElementById('optAgeVal').value = '';
          }

          // 服装（過去編/現在編で異なる）
          if (isPast && charData.pastOutfit) {
            document.getElementById('optOutfitVal').value = charData.pastOutfit;
          } else if (!isPast && charData.currentOutfit) {
            document.getElementById('optOutfitVal').value = charData.currentOutfit;
          } else {
            document.getElementById('optOutfitVal').value = '';
          }
        }

        function updatePrompts() {
          if (!selectedStyleId) return;

          const style = stylePatterns.find(s => s.id === selectedStyleId);
          if (!style) return;

          // 3つのシート全てのプロンプトを生成
          ['1past', '1current', '2current'].forEach(key => {
            const charNum = key.startsWith('1') ? 1 : 2;
            const isPast = key.includes('past');
            const charData = characters[charNum - 1] || {};
            generatedPrompts[key] = buildSheetPrompt(style, charData, charNum, isPast);
            document.getElementById('prompt' + key).textContent = generatedPrompts[key];
          });
        }

        function buildSheetPrompt(style, charData, charNum, isPast) {
          if (currentMode === 'imageRef') {
            return buildImageRefPrompt(style, charData, charNum, isPast);
          } else {
            return buildTextPrompt(style, charData, charNum, isPast);
          }
        }

        // 画像参照モード: シンプルなプロンプト
        function buildImageRefPrompt(style, charData, charNum, isPast) {
          let prompt = style.videoBasePrompt || 'anime style';
          prompt += ', character turnaround sheet, model sheet';
          prompt += ', full body standing neutral pose';
          prompt += ', front view, side view, 3/4 view arranged horizontally';
          prompt += ', facial expression variations on the right';
          prompt += ', consistent character design, same character in all views';
          prompt += ', white background, no text';

          // オプションの状態を取得
          const optGenderChecked = document.getElementById('optGender').checked;
          const optGenderVal = document.getElementById('optGenderVal').value;
          const optAgeChecked = document.getElementById('optAge').checked;
          const optAgeVal = document.getElementById('optAgeVal').value.trim();
          const optOutfitChecked = document.getElementById('optOutfit').checked;
          const optOutfitVal = document.getElementById('optOutfitVal').value.trim();

          // 性別: オプション優先、なければcharDataから
          if (optGenderChecked && optGenderVal) {
            prompt += ', ' + optGenderVal + ' character';
          } else if (charData.gender) {
            const isFemale = charData.gender.includes('女');
            prompt += ', ' + (isFemale ? 'female' : 'male') + ' character';
          }

          // 年齢: オプション優先、なければcharDataから（過去編/現在編で異なる）
          if (optAgeChecked && optAgeVal) {
            prompt += ', ' + optAgeVal + ' years old';
          } else if (isPast && charData.pastAge) {
            const ageMatch = String(charData.pastAge).match(/(\d+)/);
            prompt += ', ' + (ageMatch ? ageMatch[1] : charData.pastAge) + ' years old';
          } else if (!isPast && charData.currentAge) {
            const ageMatch = String(charData.currentAge).match(/(\d+)/);
            if (ageMatch) prompt += ', ' + ageMatch[1] + ' years old';
          }

          // 服装: オプション優先、なければcharDataから（過去編/現在編で異なる）
          if (optOutfitChecked && optOutfitVal) {
            prompt += ', wearing ' + optOutfitVal;
          } else if (isPast && charData.pastOutfit) {
            prompt += ', wearing ' + charData.pastOutfit;
          } else if (!isPast && charData.currentOutfit) {
            prompt += ', wearing ' + charData.currentOutfit;
          }

          return prompt;
        }

        // テキスト詳細モード: 従来の詳細プロンプト（過去/現在で分離）
        function buildTextPrompt(style, charData, charNum, isPast) {
          let template = style.characterSheetPrompt || '';
          if (!template) {
            return 'このスタイルにはキャラクターシートテンプレートがありません';
          }

          const genderStr = charData.gender || '';
          const gender = genderStr.includes('女') ? 'female' : 'male';

          // 年齢: 過去編/現在編で異なる
          let age = '24';
          if (isPast && charData.pastAge) {
            const ageMatch = String(charData.pastAge).match(/(\d+)/);
            age = ageMatch ? ageMatch[1] : charData.pastAge;
          } else if (!isPast && charData.currentAge) {
            const ageMatch = String(charData.currentAge).match(/(\d+)/);
            if (ageMatch) age = ageMatch[1];
          }

          // 服装: 過去編/現在編で異なる
          let outfit = isPast
            ? (charData.pastOutfit || 'student uniform')
            : (charData.currentOutfit || 'work uniform');

          // 役割: 過去編は学生、現在編は社会人
          const role = isPast ? 'student' : 'worker';

          template = template.replace(/【年齢】/g, age);
          template = template.replace(/【male\\/female】/g, gender);
          template = template.replace(/【職業\\/学生】/g, role);
          template = template.replace(/【髪型・髪色.*?】/g, charData.hair || 'short black hair');
          template = template.replace(/【目の特徴.*?】/g, charData.eyes || 'bright brown eyes');
          template = template.replace(/【体格.*?】/g, charData.build || 'average build');
          template = template.replace(/【服装.*?】/g, outfit);

          // 白背景・テキスト不要を追加（画像参照モードと同様）
          template += ', white background, no text';

          return template;
        }

        function updateCharacterInfoDisplay(charData, charNum, isPast) {
          const infoEl = document.getElementById('charInfoDisplay');
          if (!charData || !charData.name) {
            infoEl.innerHTML = '<span style="color:#999;">キャラクター' + charNum + ' のデータがありません（台本をパース・保存してください）</span>';
            return;
          }

          // キャラ2は現在編のみなので時間ラベルは表示しない
          const timeLabel = charNum === 2 ? '' : (isPast ? '（過去編）' : '（現在編）');
          let html = '<strong>' + escapeHtml(charData.name) + '</strong>' + timeLabel;

          if (charData.gender) html += '<br>性別: ' + escapeHtml(charData.gender);
          if (isPast) {
            if (charData.pastAge) html += '<br>年齢: ' + escapeHtml(charData.pastAge);
            if (charData.pastOutfit) html += '<br>服装: ' + escapeHtml(charData.pastOutfit);
          } else {
            if (charData.currentAge) html += '<br>年齢: ' + escapeHtml(charData.currentAge);
            if (charData.currentOutfit) html += '<br>服装: ' + escapeHtml(charData.currentOutfit);
          }

          if (charData.hair) html += '<br>髪: ' + escapeHtml(charData.hair);
          if (charData.eyes) html += ' / 目: ' + escapeHtml(charData.eyes);
          if (charData.build) html += ' / 体格: ' + escapeHtml(charData.build);

          infoEl.innerHTML = html;
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function copyPrompt(sheetKey) {
          if (!generatedPrompts[sheetKey]) {
            showStatus('プロンプトを生成してください', 'error', 'status');
            return;
          }
          copyToClipboard(generatedPrompts[sheetKey]);
        }

        function savePrompt(sheetKey) {
          if (!generatedPrompts[sheetKey]) {
            showStatus('プロンプトを生成してください', 'error', 'status');
            return;
          }
          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');

          // sheetKey: '1past', '1current', '2current'
          const charNum = sheetKey.startsWith('1') ? 1 : 2;
          const isPast = sheetKey.includes('past');
          // キャラ2は現在編のみなのでラベルは省略
          const labelSuffix = charNum === 2 ? '' : (isPast ? ' 過去編' : ' 現在編');

          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ キャラ' + charNum + labelSuffix + 'のプロンプトを保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveCharacterSheetPromptWithTimeline(sheetName, charNum, isPast, generatedPrompts[sheetKey]);
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * キャラクターシートプロンプトを保存（過去/現在で分離）
 */
function pv_saveCharacterSheetPromptWithTimeline(sheetName, charNum, isPast, prompt) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const timeline = isPast ? '過去編' : '現在編';
    const label = `キャラクター${charNum}_シートプロンプト${timeline}`;
    pv_setCellValueByLabel(sheet, label, prompt);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * キャラクターシートプロンプトを保存（後方互換性のため残す）
 */
function pv_saveCharacterSheetPrompt(sheetName, charNum, prompt) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const label = `キャラ${charNum}シートプロンプト`;
    pv_setCellValueByLabel(sheet, label, prompt);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ================================================================================
// ===== シーン生成プロンプト =====
// ================================================================================

/**
 * シーン生成プロンプトダイアログを表示
 * 開始フレーム / 動画プロンプトをタブ切り替えで編集
 */
function pv_showScenePromptDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const scenes = pv_getAllScenesFromSheet(sheetName);
  const stylePatterns = pv_getStylePatterns();
  const endingData = pv_getEndingDataFromSheet(sheet);
  // Part⑥の選択スタイルを取得
  const selectedStyleName = pv_getCellValueByLabel(sheet, '選択スタイル') || '';

  const htmlContent = pv_createScenePromptDialogHtml(sheetName, scenes, stylePatterns, endingData, selectedStyleName);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(900)
    .setHeight(750);
  ui.showModalDialog(htmlOutput, '🎬 シーン生成プロンプト');
}

// 後方互換性のため旧関数名も維持
function pv_showStartFramePromptDialog() {
  pv_showScenePromptDialog();
}

/**
 * シーン生成プロンプトダイアログのHTMLを作成
 */
function pv_createScenePromptDialogHtml(sheetName, scenes, stylePatterns, endingData, selectedStyleName) {
  const patternsJson = JSON.stringify(stylePatterns);
  const scenesJson = JSON.stringify(scenes);
  const endingDataJson = JSON.stringify(endingData);
  const sceneCount = PV_SCENE_COUNT;

  // 選択スタイルのIDを特定
  let defaultStyleId = '';
  for (const style of stylePatterns) {
    if (style.name === selectedStyleName) {
      defaultStyleId = style.id;
      break;
    }
  }

  // スタイル選択オプションを生成
  let styleOptions = '';
  for (const style of stylePatterns) {
    const isSelected = style.id === defaultStyleId;
    styleOptions += `
      <div class="style-option ${isSelected ? 'selected' : ''}" data-style-id="${style.id}" onclick="selectStyle('${style.id}')">
        <div class="style-name">${pv_escapeHtml(style.name)}</div>
      </div>
    `;
  }

  // シーン選択グリッドを生成（12シーン + エンディング）
  let sceneGrid = '';
  for (let i = 1; i <= sceneCount; i++) {
    const scene = scenes[i - 1] || {};
    const hasData = !!(scene && scene.name);
    const hasStartFrame = !!(scene && scene.startFramePrompt);
    const hasVideo = !!(scene && scene.videoPrompt);
    // 両方あれば✓、片方あれば△、なければ×
    let promptStatus = '';
    if (hasStartFrame && hasVideo) {
      promptStatus = '✓✓';
    } else if (hasStartFrame || hasVideo) {
      promptStatus = hasStartFrame ? '✓△' : '△✓';
    } else {
      promptStatus = '△△';
    }
    const promptClass = hasData ? ((hasStartFrame && hasVideo) ? 'has-prompt' : 'no-prompt') : '';
    sceneGrid += `
      <div class="scene-item ${hasData ? 'has-data' : 'disabled'} ${promptClass}" data-scene="${i}" onclick="selectScene(${i}, ${hasData})">
        <div>シーン${i} ${hasData ? promptStatus : ''}</div>
        <div style="font-size:10px;color:#666;">${hasData ? pv_escapeHtml(scene.name) : '未設定'}</div>
      </div>
    `;
  }
  // エンディング
  const hasEnding = !!(endingData && endingData.type);
  sceneGrid += `
    <div class="scene-item ${hasEnding ? 'has-data ending' : 'disabled ending'}" data-scene="ending" onclick="selectEnding(${hasEnding})">
      <div>エンディング</div>
      <div style="font-size:10px;color:#666;">${hasEnding ? pv_escapeHtml(endingData.type) : '未設定'}</div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .style-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; }
        .style-option {
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .style-option:hover { border-color: #7c3aed; background: #faf5ff; }
        .style-option.selected { border-color: #7c3aed; background: #ede9fe; }
        .style-name { font-size: 11px; font-weight: bold; color: #333; }
        .scene-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .scene-item {
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .scene-item:hover:not(.disabled) { border-color: #7c3aed; background: #faf5ff; }
        .scene-item.selected { border-color: #7c3aed !important; background: #c4b5fd !important; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3); }
        .scene-item.has-data { border-color: #86efac; }
        .scene-item.disabled { opacity: 0.5; cursor: not-allowed; }
        .scene-item.ending { border-style: dashed; }
        .scene-item.ending.has-data { border-color: #f59e0b; }
        .has-prompt { border-color: #22c55e !important; }
        .no-prompt { border-color: #f97316 !important; border-style: dashed; }
        .edit-area { margin-top: 12px; }
        .edit-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.5;
          resize: vertical;
        }
        .edit-textarea:focus { border-color: #7c3aed; outline: none; }
        .scene-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 11px;
          margin-bottom: 12px;
        }
        .scene-info-label { color: #0369a1; font-weight: bold; }
        .prompt-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 4px;
        }
        .prompt-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: bold;
          transition: all 0.2s;
        }
        .prompt-tab.active { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #7c3aed; }
        .prompt-tab:hover:not(.active) { background: #e0e0e0; }
        .prompt-content { display: none; }
        .prompt-content.active { display: block; }
        .style-section {
          background: #fefce8;
          border: 1px solid #fde047;
          border-radius: 8px;
          padding: 12px;
          margin-top: 12px;
        }
        .style-section-title { font-size: 12px; font-weight: bold; color: #854d0e; margin-bottom: 8px; }
        .status-hint {
          font-size: 10px;
          color: #666;
          margin-top: 4px;
        }
      </style>
    </head>
    <body>
      <h3>🎬 シーン生成プロンプト</h3>
      <p class="subtitle">開始フレーム / 動画プロンプトを編集（12シーン + エンディング）</p>
      <p class="status-hint">凡例: ✓✓=両方あり, ✓△=開始フレームのみ, △✓=動画のみ, △△=両方なし</p>

      <div class="section-title">シーンを選択</div>
      <div class="scene-grid">
        ${sceneGrid}
      </div>

      <div class="edit-area" id="editArea" style="display: none;">
        <div class="scene-info" id="sceneInfo"></div>

        <!-- プロンプトタブ -->
        <div class="prompt-tabs">
          <button class="prompt-tab active" id="tabStartFrame" onclick="switchPromptTab('startFrame')">🖼️ 開始フレーム</button>
          <button class="prompt-tab" id="tabVideo" onclick="switchPromptTab('video')">🎬 動画プロンプト</button>
        </div>

        <!-- 開始フレームプロンプト -->
        <div class="prompt-content active" id="contentStartFrame">
          <div class="prompt-result">
            <div class="prompt-result-header">
              <span class="prompt-result-title" id="titleStartFrame">開始フレームプロンプト</span>
              <div class="prompt-result-actions">
                <button class="btn btn-copy" onclick="copyPrompt('startFrame')">📋 コピー</button>
                <button class="btn btn-save" onclick="savePrompt('startFrame')">💾 保存</button>
              </div>
            </div>
            <textarea class="edit-textarea" id="textareaStartFrame" placeholder="開始フレームプロンプトを入力..."></textarea>
          </div>
        </div>

        <!-- 動画プロンプト -->
        <div class="prompt-content" id="contentVideo">
          <div class="prompt-result">
            <div class="prompt-result-header">
              <span class="prompt-result-title" id="titleVideo">動画プロンプト</span>
              <div class="prompt-result-actions">
                <button class="btn btn-copy" onclick="copyPrompt('video')">📋 コピー</button>
                <button class="btn btn-save" onclick="savePrompt('video')">💾 保存</button>
              </div>
            </div>
            <textarea class="edit-textarea" id="textareaVideo" placeholder="動画プロンプトを入力..."></textarea>
          </div>
        </div>

        <!-- スタイル選択セクション -->
        <div class="style-section">
          <div class="style-section-title">🎨 スタイルから再生成（オプション）</div>
          <div class="style-grid">
            ${styleOptions}
          </div>
          <button class="btn btn-primary" onclick="regenerateFromStyle()" id="regenerateBtn">スタイルを適用して再生成</button>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetName = '${pv_escapeHtml(sheetName)}';
        const stylePatterns = ${patternsJson};
        const scenes = ${scenesJson};
        const endingData = ${endingDataJson};
        const sceneCount = ${sceneCount};
        let selectedStyleId = '${defaultStyleId}';
        let selectedSceneNum = null;
        let isEndingSelected = false;
        let currentPromptTab = 'startFrame'; // 'startFrame' or 'video'

        function selectStyle(styleId) {
          selectedStyleId = styleId;
          document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-style-id="' + styleId + '"]').classList.add('selected');
        }

        function switchPromptTab(tab) {
          currentPromptTab = tab;
          document.getElementById('tabStartFrame').classList.toggle('active', tab === 'startFrame');
          document.getElementById('tabVideo').classList.toggle('active', tab === 'video');
          document.getElementById('contentStartFrame').classList.toggle('active', tab === 'startFrame');
          document.getElementById('contentVideo').classList.toggle('active', tab === 'video');
        }

        function selectScene(sceneNum, hasData) {
          if (!hasData) {
            showStatus('このシーンはまだ設定されていません（台本パースを実行してください）', 'info', 'status');
            return;
          }

          selectedSceneNum = sceneNum;
          isEndingSelected = false;
          document.querySelectorAll('.scene-item').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-scene="' + sceneNum + '"]').classList.add('selected');

          showSceneEditor(sceneNum);
        }

        function selectEnding(hasData) {
          if (!hasData) {
            showStatus('エンディングはまだ設定されていません', 'info', 'status');
            return;
          }

          selectedSceneNum = null;
          isEndingSelected = true;
          document.querySelectorAll('.scene-item').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-scene="ending"]').classList.add('selected');

          showEndingEditor();
        }

        function showSceneEditor(sceneNum) {
          const scene = scenes[sceneNum - 1];
          if (!scene) return;

          document.getElementById('editArea').style.display = 'block';

          // シーン情報表示
          let info = '<span class="scene-info-label">シーン' + sceneNum + ': ' + escapeHtml(scene.name || '') + '</span><br>';
          info += scene.location ? '場所: ' + escapeHtml(scene.location) + ' / ' : '';
          info += scene.mood ? 'ムード: ' + escapeHtml(scene.mood) + ' / ' : '';
          info += scene.action ? '動き: ' + escapeHtml(scene.action) : '';
          document.getElementById('sceneInfo').innerHTML = info || '（シーン情報なし）';

          // タイトル更新
          document.getElementById('titleStartFrame').textContent = 'シーン' + sceneNum + ' 開始フレーム';
          document.getElementById('titleVideo').textContent = 'シーン' + sceneNum + ' 動画プロンプト';

          // プロンプト表示
          document.getElementById('textareaStartFrame').value = scene.startFramePrompt || '';
          document.getElementById('textareaVideo').value = scene.videoPrompt || '';
        }

        function showEndingEditor() {
          document.getElementById('editArea').style.display = 'block';

          let info = '<span class="scene-info-label">エンディング</span><br>';
          info += endingData.type ? 'タイプ: ' + escapeHtml(endingData.type) : '';
          document.getElementById('sceneInfo').innerHTML = info || '（エンディング情報なし）';

          document.getElementById('titleStartFrame').textContent = 'エンディング 開始フレーム';
          document.getElementById('titleVideo').textContent = 'エンディング 動画プロンプト';

          // エンディングは動画プロンプトのみ
          document.getElementById('textareaStartFrame').value = '';
          document.getElementById('textareaStartFrame').placeholder = 'エンディングは動画プロンプトタブを使用してください';
          document.getElementById('textareaVideo').value = endingData.videoPrompt || '';
        }

        function regenerateFromStyle() {
          if (!selectedStyleId) {
            showStatus('スタイルを選択してください', 'error', 'status');
            return;
          }

          const style = stylePatterns.find(s => s.id === selectedStyleId);
          if (!style) return;

          if (isEndingSelected) {
            const newPrompt = buildEndingPrompt(style, endingData);
            document.getElementById('textareaVideo').value = newPrompt;
          } else if (selectedSceneNum) {
            const scene = scenes[selectedSceneNum - 1];
            if (currentPromptTab === 'startFrame') {
              const newPrompt = buildStartFramePrompt(style, scene);
              document.getElementById('textareaStartFrame').value = newPrompt;
            } else {
              const newPrompt = buildVideoPrompt(style, scene);
              document.getElementById('textareaVideo').value = newPrompt;
            }
          }

          showStatus('スタイル「' + style.name + '」で再生成しました', 'success', 'status');
        }

        function buildStartFramePrompt(style, scene) {
          const baseStyle = style.videoBasePrompt || 'anime style';
          // 既存のstartFramePromptがあればスタイルを先頭に追加
          if (scene.startFramePrompt) {
            return baseStyle + '. ' + scene.startFramePrompt;
          }
          // なければシーン情報から生成
          return baseStyle + '. ' + (scene.action || 'Character') + ' at ' + (scene.location || 'location') + ', ' + (scene.mood || 'emotional atmosphere') + ', cinematic composition, detailed background';
        }

        function buildVideoPrompt(style, scene) {
          const baseStyle = style.videoBasePrompt || 'anime style';
          // 既存のvideoPromptがあればスタイルを先頭に追加
          if (scene.videoPrompt) {
            return baseStyle + '. ' + scene.videoPrompt;
          }
          // なければシーン情報から生成
          return baseStyle + '. ' + (scene.action || 'Character moving') + ', ' + (scene.mood || 'emotional') + ' atmosphere, smooth camera movement, cinematic motion';
        }

        function buildEndingPrompt(style, ending) {
          const baseStyle = style.videoBasePrompt || 'anime style, cinematic';
          return baseStyle + ', ' + (ending.videoPrompt || 'company logo animation') + ', elegant composition, final scene';
        }

        function copyPrompt(type) {
          const textareaId = type === 'startFrame' ? 'textareaStartFrame' : 'textareaVideo';
          const prompt = document.getElementById(textareaId).value;
          if (!prompt) {
            showStatus('プロンプトがありません', 'error', 'status');
            return;
          }
          copyToClipboard(prompt);
        }

        function savePrompt(type) {
          const textareaId = type === 'startFrame' ? 'textareaStartFrame' : 'textareaVideo';
          const prompt = document.getElementById(textareaId).value;
          if (!prompt.trim()) {
            showStatus('プロンプトを入力してください', 'error', 'status');
            return;
          }

          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');

          if (isEndingSelected) {
            // エンディングは動画プロンプトのみ
            google.script.run
              .withSuccessHandler(function(result) {
                setAllButtonsDisabled(false);
                if (result.success) {
                  endingData.videoPrompt = prompt;
                  showStatus('✅ エンディングのプロンプトを保存しました', 'success', 'status');
                } else {
                  showStatus('❌ ' + result.error, 'error', 'status');
                }
              })
              .withFailureHandler(function(e) {
                setAllButtonsDisabled(false);
                showStatus('エラー: ' + e.message, 'error', 'status');
              })
              .pv_saveEndingFramePrompt(sheetName, prompt);
          } else if (selectedSceneNum) {
            const saveFunc = type === 'startFrame' ? 'pv_saveStartFramePrompt' : 'pv_saveVideoPrompt';
            const labelType = type === 'startFrame' ? '開始フレーム' : '動画';

            google.script.run
              .withSuccessHandler(function(result) {
                setAllButtonsDisabled(false);
                if (result.success) {
                  // ローカルデータ更新
                  if (type === 'startFrame') {
                    scenes[selectedSceneNum - 1].startFramePrompt = prompt;
                  } else {
                    scenes[selectedSceneNum - 1].videoPrompt = prompt;
                  }
                  // グリッド表示更新
                  updateSceneGridStatus(selectedSceneNum);
                  showStatus('✅ シーン' + selectedSceneNum + 'の' + labelType + 'プロンプトを保存しました', 'success', 'status');
                } else {
                  showStatus('❌ ' + result.error, 'error', 'status');
                }
              })
              .withFailureHandler(function(e) {
                setAllButtonsDisabled(false);
                showStatus('エラー: ' + e.message, 'error', 'status');
              })
              [saveFunc](sheetName, selectedSceneNum, prompt);
          }
        }

        function updateSceneGridStatus(sceneNum) {
          const scene = scenes[sceneNum - 1];
          const hasStartFrame = !!(scene && scene.startFramePrompt);
          const hasVideo = !!(scene && scene.videoPrompt);
          const sceneItem = document.querySelector('[data-scene="' + sceneNum + '"]');
          if (sceneItem) {
            if (hasStartFrame && hasVideo) {
              sceneItem.classList.add('has-prompt');
              sceneItem.classList.remove('no-prompt');
            } else {
              sceneItem.classList.remove('has-prompt');
              sceneItem.classList.add('no-prompt');
            }
            // ステータス文字更新
            let status = '';
            if (hasStartFrame && hasVideo) {
              status = '✓✓';
            } else if (hasStartFrame) {
              status = '✓△';
            } else if (hasVideo) {
              status = '△✓';
            } else {
              status = '△△';
            }
            const firstDiv = sceneItem.querySelector('div');
            if (firstDiv) {
              firstDiv.textContent = 'シーン' + sceneNum + ' ' + status;
            }
          }
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * 開始フレームプロンプトをシートに保存
 */
function pv_saveStartFramePrompt(sheetName, sceneNum, prompt) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const label = `シーン${sceneNum}_開始フレームプロンプト`;
    pv_setCellValueByLabel(sheet, label, prompt);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 動画プロンプトをシートに保存
 */
function pv_saveVideoPrompt(sheetName, sceneNum, prompt) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const label = `シーン${sceneNum}_動画プロンプト`;
    pv_setCellValueByLabel(sheet, label, prompt);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * エンディングフレームプロンプトを保存
 */
function pv_saveEndingFramePrompt(sheetName, prompt) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    pv_setCellValueByLabel(sheet, 'エンディングフレームプロンプト', prompt);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 全シーンの開始フレームプロンプトを保存
 */
function pv_saveAllStartFramePrompts(sheetName, promptsJson) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const prompts = JSON.parse(promptsJson);
    let count = 0;

    for (const key in prompts) {
      if (key === 'ending') {
        pv_setCellValueByLabel(sheet, 'エンディングフレームプロンプト', prompts[key]);
        count++;
      } else {
        const sceneNum = parseInt(key);
        const label = `シーン${sceneNum}_開始フレームプロンプト`;
        pv_setCellValueByLabel(sheet, label, prompts[key]);
        count++;
      }
    }

    return { success: true, count: count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
