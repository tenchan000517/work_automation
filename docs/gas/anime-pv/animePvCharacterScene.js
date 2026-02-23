/**
 * アニメPV制作 - キャラクター・シーン編集ダイアログ v2.0
 *
 * 【機能】
 * - キャラクター編集ダイアログ（名前、性別、年齢、髪型、目、体格、服装）
 * - シーン編集ダイアログ（動画プロンプト直接編集 + オプション追加）
 * - エンディング編集ダイアログ（タイプ、変形元、アニメーション、最終テキスト）
 */

// ================================================================================
// ===== キャラクター編集ダイアログ =====
// ================================================================================

/**
 * キャラクター編集ダイアログを表示
 */
function pv_showCharacterEditDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const characters = pv_getAllCharactersFromSheet(sheetName);
  const html = HtmlService.createHtmlOutput(pv_createCharacterEditHTML(sheetName, characters))
    .setWidth(800)
    .setHeight(650);
  ui.showModalDialog(html, '👤 キャラクター設定を編集');
}

/**
 * キャラクター編集ダイアログのHTML
 */
function pv_createCharacterEditHTML(sheetName, characters) {
  const charactersJson = JSON.stringify(characters);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${PV_DIALOG_STYLES}
  <style>
    .character-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .character-tab {
      padding: 10px 24px;
      border: none;
      background: #f0f0f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .character-tab.active { background: #7c3aed; color: white; }
    .character-content { display: none; }
    .character-content.active { display: block; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: #333; font-size: 13px; }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
    .form-group textarea { min-height: 60px; resize: vertical; }
    .hint { font-size: 11px; color: #666; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">保存しました</div>

  <div class="character-tabs">
    <button class="character-tab active" onclick="switchCharacter(1)">キャラクター1（主人公）</button>
    <button class="character-tab" onclick="switchCharacter(2)">キャラクター2（サブ）</button>
  </div>

  <div id="char1Content" class="character-content active">
    <div class="form-row">
      <div class="form-group">
        <label>名前</label>
        <input type="text" id="char1_name" placeholder="例: 田中太郎">
      </div>
      <div class="form-group">
        <label>性別</label>
        <select id="char1_gender">
          <option value="">選択してください</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>現在編 年齢</label>
        <input type="text" id="char1_currentAge" placeholder="例: 28歳">
        <div class="hint">入社後の現在の年齢（文字列で入力）</div>
      </div>
      <div class="form-group">
        <label>過去編 年齢</label>
        <input type="text" id="char1_pastAge" placeholder="例: 17歳（高校生）、20歳（大学生）">
        <div class="hint">学生時代の年齢。キャラシート過去編に使用</div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>髪型・髪色（英語）</label>
        <input type="text" id="char1_hair" placeholder="例: short black hair with bangs">
        <div class="hint">プロンプト用に英語で入力</div>
      </div>
      <div class="form-group">
        <label>目の特徴（英語）</label>
        <input type="text" id="char1_eyes" placeholder="例: bright brown eyes">
      </div>
    </div>
    <div class="form-group">
      <label>体格（英語）</label>
      <input type="text" id="char1_build" placeholder="例: average build, slim, athletic">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>過去編服装（英語）</label>
        <textarea id="char1_pastOutfit" placeholder="例: school uniform, casual clothes"></textarea>
        <div class="hint">学生服、私服など</div>
      </div>
      <div class="form-group">
        <label>現在編服装（英語）</label>
        <textarea id="char1_currentOutfit" placeholder="例: navy work uniform with safety helmet"></textarea>
        <div class="hint">必須安全装備を必ず含める</div>
      </div>
    </div>
  </div>

  <div id="char2Content" class="character-content">
    <div class="form-row">
      <div class="form-group">
        <label>名前</label>
        <input type="text" id="char2_name" placeholder="例: 佐藤花子">
      </div>
      <div class="form-group">
        <label>性別</label>
        <select id="char2_gender">
          <option value="">選択してください</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </select>
        <div class="hint">先輩キャラは主人公より年上</div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>現在編 年齢</label>
        <input type="text" id="char2_currentAge" placeholder="例: 32歳">
        <div class="hint">先輩キャラは主人公より年上</div>
      </div>
      <div class="form-group">
        <label>過去編 年齢</label>
        <input type="text" id="char2_pastAge" placeholder="例: サブキャラは過去編に登場しない場合は空欄">
        <div class="hint">サブキャラは現在編のみの場合が多い</div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>髪型・髪色（英語）</label>
        <input type="text" id="char2_hair" placeholder="例: long brown hair in ponytail">
      </div>
      <div class="form-group">
        <label>目の特徴（英語）</label>
        <input type="text" id="char2_eyes" placeholder="例: gentle dark eyes">
      </div>
    </div>
    <div class="form-group">
      <label>体格（英語）</label>
      <input type="text" id="char2_build" placeholder="例: average build">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>過去編服装（英語）</label>
        <textarea id="char2_pastOutfit" placeholder="例: （サブキャラは空欄可）"></textarea>
      </div>
      <div class="form-group">
        <label>現在編服装（英語）</label>
        <textarea id="char2_currentOutfit" placeholder="例: work uniform with safety vest"></textarea>
        <div class="hint">必須安全装備を必ず含める</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <button class="btn btn-primary" onclick="saveCharacter()">💾 保存</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${PV_UI_COMPONENTS}

  <script>
    const sheetName = '${pv_escapeHtml(sheetName)}';
    const characters = ${charactersJson};
    let currentCharNum = 1;

    window.onload = function() {
      loadCharacterData(1);
      loadCharacterData(2);
    };

    function loadCharacterData(charNum) {
      const char = characters[charNum - 1] || {};
      document.getElementById('char' + charNum + '_name').value = char.name || '';
      document.getElementById('char' + charNum + '_gender').value = char.gender || '';
      document.getElementById('char' + charNum + '_currentAge').value = char.currentAge || '';
      document.getElementById('char' + charNum + '_pastAge').value = char.pastAge || '';
      document.getElementById('char' + charNum + '_hair').value = char.hair || '';
      document.getElementById('char' + charNum + '_eyes').value = char.eyes || '';
      document.getElementById('char' + charNum + '_build').value = char.build || '';
      document.getElementById('char' + charNum + '_pastOutfit').value = char.pastOutfit || '';
      document.getElementById('char' + charNum + '_currentOutfit').value = char.currentOutfit || '';
    }

    function switchCharacter(charNum) {
      currentCharNum = charNum;
      document.querySelectorAll('.character-tab').forEach((el, i) => {
        el.classList.toggle('active', i === charNum - 1);
      });
      document.getElementById('char1Content').classList.toggle('active', charNum === 1);
      document.getElementById('char2Content').classList.toggle('active', charNum === 2);
    }

    function getCharacterData(charNum) {
      return {
        name: document.getElementById('char' + charNum + '_name').value,
        gender: document.getElementById('char' + charNum + '_gender').value,
        currentAge: document.getElementById('char' + charNum + '_currentAge').value,
        pastAge: document.getElementById('char' + charNum + '_pastAge').value,
        hair: document.getElementById('char' + charNum + '_hair').value,
        eyes: document.getElementById('char' + charNum + '_eyes').value,
        build: document.getElementById('char' + charNum + '_build').value,
        pastOutfit: document.getElementById('char' + charNum + '_pastOutfit').value,
        currentOutfit: document.getElementById('char' + charNum + '_currentOutfit').value
      };
    }

    function saveCharacter() {
      const charData = getCharacterData(currentCharNum);
      setAllButtonsDisabled(true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showCopySuccess();
            showStatus('✅ キャラクター' + currentCharNum + 'を保存しました', 'success');
          } else {
            showStatus('❌ ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showStatus('エラー: ' + e.message, 'error');
        })
        .pv_saveCharacterToSheet(sheetName, currentCharNum, charData);
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

// ================================================================================
// ===== シーン編集ダイアログ =====
// ================================================================================

/**
 * シーン編集ダイアログを表示
 */
function pv_showSceneEditDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const scenes = pv_getAllScenesFromSheet(sheetName);
  const timeOptions = pv_getTimeOptions();
  const cameraOptions = pv_getCameraOptions();
  const actionOptions = pv_getActionOptions();

  const html = HtmlService.createHtmlOutput(pv_createSceneEditHTML(sheetName, scenes, timeOptions, cameraOptions, actionOptions))
    .setWidth(900)
    .setHeight(700);
  ui.showModalDialog(html, '🎬 シーン構成を編集');
}

/**
 * シーン編集ダイアログのHTML
 */
function pv_createSceneEditHTML(sheetName, scenes, timeOptions, cameraOptions, actionOptions) {
  const scenesJson = JSON.stringify(scenes);
  const timeOptionsJson = JSON.stringify(timeOptions);
  const cameraOptionsJson = JSON.stringify(cameraOptions);
  const actionOptionsJson = JSON.stringify(actionOptions);

  // シーン選択グリッド
  let sceneGrid = '';
  for (let i = 1; i <= PV_SCENE_COUNT; i++) {
    const scene = scenes[i - 1] || {};
    const hasData = scene && scene.name;
    sceneGrid += `
      <div class="scene-item ${hasData ? 'has-data' : ''}" data-scene="${i}" onclick="selectScene(${i})">
        <div class="scene-num">シーン${i}</div>
        <div class="scene-name">${pv_escapeHtml(scene.name || '未設定')}</div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${PV_DIALOG_STYLES}
  <style>
    .scene-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
    .scene-item {
      padding: 8px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .scene-item:hover { border-color: #7c3aed; background: #faf5ff; }
    .scene-item.selected { border-color: #7c3aed; background: #ede9fe; }
    .scene-item.has-data { border-color: #86efac; }
    .scene-item.has-data.selected { border-color: #7c3aed; }
    .scene-num { font-size: 11px; color: #7c3aed; font-weight: bold; }
    .scene-name { font-size: 10px; color: #666; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .edit-section { display: none; }
    .edit-section.active { display: block; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: #333; font-size: 13px; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
    }
    .form-group textarea { min-height: 80px; resize: vertical; font-family: monospace; }
    .option-buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .option-btn {
      padding: 4px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      font-size: 11px;
    }
    .option-btn:hover { border-color: #7c3aed; background: #faf5ff; }
    .section-label { font-size: 12px; color: #7c3aed; font-weight: bold; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">保存しました</div>

  <div class="section-label">シーンを選択（クリックして編集）</div>
  <div class="scene-grid">
    ${sceneGrid}
  </div>

  <div class="edit-section" id="editSection">
    <div class="section-label" id="editTitle">シーン編集</div>

    <div class="form-row">
      <div class="form-group">
        <label>シーン名</label>
        <input type="text" id="sceneName" placeholder="例: 日常と迷い">
      </div>
      <div class="form-group">
        <label>時間帯</label>
        <select id="scenePhase">
          <option value="">選択してください</option>
          <option value="過去">過去</option>
          <option value="転換点">転換点</option>
          <option value="現在">現在</option>
          <option value="未来">未来</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>場所</label>
        <input type="text" id="sceneLocation" placeholder="例: bedroom, factory, office">
      </div>
      <div class="form-group">
        <label>登場キャラ</label>
        <input type="text" id="sceneCharacters" placeholder="例: 主人公">
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>演出・動き</label>
        <input type="text" id="sceneAction" placeholder="例: looking out window">
      </div>
      <div class="form-group">
        <label>ムード</label>
        <input type="text" id="sceneMood" placeholder="例: melancholic, hopeful">
      </div>
    </div>

    <div class="form-group">
      <label>ナレーション</label>
      <textarea id="sceneNarration" placeholder="例: あの頃の僕は、将来が見えなかった。" style="min-height: 50px;"></textarea>
    </div>

    <div class="form-group">
      <label>動画プロンプト（英語）</label>
      <textarea id="sceneVideoPrompt" placeholder="The protagonist sits by the window..."></textarea>
      <div class="section-label" style="margin-top: 8px;">オプションを追加（クリックで追記）</div>
      <div class="option-buttons" id="optionButtons"></div>
    </div>

    <div class="footer">
      <button class="btn btn-primary" onclick="saveScene()">💾 このシーンを保存</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>
  </div>

  <div class="status" id="status"></div>

  ${PV_UI_COMPONENTS}

  <script>
    const sheetName = '${pv_escapeHtml(sheetName)}';
    const scenes = ${scenesJson};
    const timeOptions = ${timeOptionsJson};
    const cameraOptions = ${cameraOptionsJson};
    const actionOptions = ${actionOptionsJson};
    let selectedSceneNum = null;

    window.onload = function() {
      buildOptionButtons();
    };

    function buildOptionButtons() {
      const container = document.getElementById('optionButtons');
      let html = '';

      // 時間帯
      html += '<div style="width:100%;margin-bottom:4px;font-size:10px;color:#666;">時間帯:</div>';
      timeOptions.forEach(opt => {
        html += '<button class="option-btn" onclick="appendOption(\\'' + opt.en + '\\')">' + opt.name + '</button>';
      });

      // カメラ
      html += '<div style="width:100%;margin-bottom:4px;margin-top:8px;font-size:10px;color:#666;">カメラ:</div>';
      cameraOptions.forEach(opt => {
        html += '<button class="option-btn" onclick="appendOption(\\'' + opt.en + '\\')">' + opt.name + '</button>';
      });

      // アクション
      html += '<div style="width:100%;margin-bottom:4px;margin-top:8px;font-size:10px;color:#666;">アクション:</div>';
      actionOptions.forEach(opt => {
        html += '<button class="option-btn" onclick="appendOption(\\'' + opt.en + '\\')">' + opt.name + '</button>';
      });

      container.innerHTML = html;
    }

    function selectScene(sceneNum) {
      selectedSceneNum = sceneNum;
      document.querySelectorAll('.scene-item').forEach(el => el.classList.remove('selected'));
      document.querySelector('[data-scene="' + sceneNum + '"]').classList.add('selected');

      const scene = scenes[sceneNum - 1] || {};
      document.getElementById('sceneName').value = scene.name || '';
      document.getElementById('scenePhase').value = scene.phase || '';
      document.getElementById('sceneLocation').value = scene.location || '';
      document.getElementById('sceneCharacters').value = scene.characters || '';
      document.getElementById('sceneAction').value = scene.action || '';
      document.getElementById('sceneMood').value = scene.mood || '';
      document.getElementById('sceneNarration').value = scene.narration || '';
      document.getElementById('sceneVideoPrompt').value = scene.videoPrompt || '';

      document.getElementById('editTitle').textContent = 'シーン' + sceneNum + ' を編集';
      document.getElementById('editSection').classList.add('active');
    }

    function appendOption(optionText) {
      const textarea = document.getElementById('sceneVideoPrompt');
      const current = textarea.value.trim();
      if (current) {
        textarea.value = current + ', ' + optionText;
      } else {
        textarea.value = optionText;
      }
      textarea.focus();
    }

    function saveScene() {
      if (!selectedSceneNum) {
        showStatus('シーンを選択してください', 'error');
        return;
      }

      const sceneData = {
        name: document.getElementById('sceneName').value,
        phase: document.getElementById('scenePhase').value,
        location: document.getElementById('sceneLocation').value,
        characters: document.getElementById('sceneCharacters').value,
        action: document.getElementById('sceneAction').value,
        mood: document.getElementById('sceneMood').value,
        narration: document.getElementById('sceneNarration').value,
        videoPrompt: document.getElementById('sceneVideoPrompt').value
      };

      setAllButtonsDisabled(true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showCopySuccess();
            showStatus('✅ シーン' + selectedSceneNum + 'を保存しました', 'success');
            // シーングリッドを更新
            scenes[selectedSceneNum - 1] = sceneData;
            updateSceneGrid();
          } else {
            showStatus('❌ ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showStatus('エラー: ' + e.message, 'error');
        })
        .pv_saveSceneToSheet(sheetName, selectedSceneNum, sceneData);
    }

    function updateSceneGrid() {
      document.querySelectorAll('.scene-item').forEach((el, i) => {
        const scene = scenes[i] || {};
        const nameEl = el.querySelector('.scene-name');
        nameEl.textContent = scene.name || '未設定';
        if (scene.name) {
          el.classList.add('has-data');
        }
      });
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

// ================================================================================
// ===== エンディング編集ダイアログ =====
// ================================================================================

/**
 * エンディング編集ダイアログを表示
 */
function pv_showEndingEditDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const endingData = pv_getEndingDataFromSheet(sheet);
  const endingTypes = pv_getEndingTypes();
  const transformObjects = pv_getTransformObjects();
  const logoAnimations = pv_getLogoAnimations();

  const html = HtmlService.createHtmlOutput(pv_createEndingEditHTML(sheetName, endingData, endingTypes, transformObjects, logoAnimations))
    .setWidth(700)
    .setHeight(550);
  ui.showModalDialog(html, '🎬 エンディングを編集');
}

/**
 * エンディング編集ダイアログのHTML
 */
function pv_createEndingEditHTML(sheetName, endingData, endingTypes, transformObjects, logoAnimations) {
  const endingDataJson = JSON.stringify(endingData);
  const endingTypesJson = JSON.stringify(endingTypes);
  const transformObjectsJson = JSON.stringify(transformObjects);
  const logoAnimationsJson = JSON.stringify(logoAnimations);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${PV_DIALOG_STYLES}
  <style>
    .type-selector { display: flex; gap: 12px; margin-bottom: 16px; }
    .type-option {
      flex: 1;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .type-option:hover { border-color: #7c3aed; background: #faf5ff; }
    .type-option.selected { border-color: #7c3aed; background: #ede9fe; }
    .type-name { font-weight: bold; color: #333; margin-bottom: 4px; }
    .type-desc { font-size: 12px; color: #666; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: #333; }
    .form-group select, .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
    }
    .form-group textarea { min-height: 80px; resize: vertical; font-family: monospace; }
    .conditional-section { display: none; }
    .conditional-section.active { display: block; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">保存しました</div>

  <div class="input-label">エンディングタイプを選択</div>
  <div class="type-selector">
    <div class="type-option" data-type="object_to_logo" onclick="selectType('object_to_logo')">
      <div class="type-name">オブジェクト→ロゴ変形</div>
      <div class="type-desc">業界関連のオブジェクトがロゴに変形</div>
    </div>
    <div class="type-option" data-type="logo_animation" onclick="selectType('logo_animation')">
      <div class="type-name">ロゴアニメーション</div>
      <div class="type-desc">ロゴにアニメーション効果を追加</div>
    </div>
  </div>

  <div class="conditional-section" id="objectSection">
    <div class="form-group">
      <label>変形元オブジェクト</label>
      <select id="sourceObject" onchange="updateVideoPrompt()">
        <option value="">選択してください</option>
      </select>
    </div>
  </div>

  <div class="conditional-section" id="animationSection">
    <div class="form-group">
      <label>アニメーションタイプ</label>
      <select id="animationType" onchange="updateVideoPrompt()">
        <option value="">選択してください</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label>最終テキスト（ロゴの下に表示）</label>
    <input type="text" id="finalText" placeholder="例: 株式会社〇〇 採用サイトへ">
  </div>

  <div class="form-group">
    <label>動画プロンプト（英語）</label>
    <textarea id="videoPrompt" placeholder="Floating tools assembling and transforming into the company logo..."></textarea>
  </div>

  <div class="footer">
    <button class="btn btn-primary" onclick="saveEnding()">💾 保存</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${PV_UI_COMPONENTS}

  <script>
    const sheetName = '${pv_escapeHtml(sheetName)}';
    const endingData = ${endingDataJson};
    const endingTypes = ${endingTypesJson};
    const transformObjects = ${transformObjectsJson};
    const logoAnimations = ${logoAnimationsJson};
    let selectedType = '';

    window.onload = function() {
      // オプションを生成
      const objectSelect = document.getElementById('sourceObject');
      transformObjects.forEach(obj => {
        objectSelect.innerHTML += '<option value="' + obj.id + '">' + obj.name + '</option>';
      });

      const animSelect = document.getElementById('animationType');
      logoAnimations.forEach(anim => {
        animSelect.innerHTML += '<option value="' + anim.id + '">' + anim.name + '</option>';
      });

      // 既存データを読み込み
      if (endingData.type) {
        selectType(endingData.type);
      }
      if (endingData.sourceObject) {
        document.getElementById('sourceObject').value = endingData.sourceObject;
      }
      if (endingData.animationType) {
        document.getElementById('animationType').value = endingData.animationType;
      }
      document.getElementById('finalText').value = endingData.finalText || '';
      document.getElementById('videoPrompt').value = endingData.videoPrompt || '';
    };

    function selectType(type) {
      selectedType = type;
      document.querySelectorAll('.type-option').forEach(el => el.classList.remove('selected'));
      document.querySelector('[data-type="' + type + '"]').classList.add('selected');

      document.getElementById('objectSection').classList.toggle('active', type === 'object_to_logo');
      document.getElementById('animationSection').classList.toggle('active', type === 'logo_animation');

      updateVideoPrompt();
    }

    function updateVideoPrompt() {
      const textarea = document.getElementById('videoPrompt');
      if (!textarea.value.trim()) {
        // 自動生成
        if (selectedType === 'object_to_logo') {
          const objId = document.getElementById('sourceObject').value;
          const obj = transformObjects.find(o => o.id === objId);
          if (obj && obj.en) {
            textarea.value = obj.en + ' into the company logo, smooth transformation';
          }
        } else if (selectedType === 'logo_animation') {
          const animId = document.getElementById('animationType').value;
          const anim = logoAnimations.find(a => a.id === animId);
          if (anim && anim.en) {
            textarea.value = 'Company logo with ' + anim.en + ', elegant finish';
          }
        }
      }
    }

    function saveEnding() {
      const data = {
        type: selectedType,
        sourceObject: document.getElementById('sourceObject').value,
        animationType: document.getElementById('animationType').value,
        finalText: document.getElementById('finalText').value,
        videoPrompt: document.getElementById('videoPrompt').value
      };

      setAllButtonsDisabled(true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setAllButtonsDisabled(false);
          if (result.success) {
            showCopySuccess();
            showStatus('✅ エンディングを保存しました', 'success');
          } else {
            showStatus('❌ ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(e) {
          setAllButtonsDisabled(false);
          showStatus('エラー: ' + e.message, 'error');
        })
        .pv_saveEndingToSheet(sheetName, data);
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
