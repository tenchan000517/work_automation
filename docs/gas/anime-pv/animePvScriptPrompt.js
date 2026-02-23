/**
 * アニメPV制作 - 台本生成プロンプト v2.0
 *
 * 【機能】
 * - ストーリーパターン + スタイル選択ダイアログ
 * - 台本生成プロンプトの作成
 * - AIが生成した台本（JSON）をパース→シートに展開
 */

// ================================================================================
// ===== 台本生成プロンプトダイアログ =====
// ================================================================================

/**
 * 台本生成プロンプトダイアログを表示
 */
function pv_showScriptPromptDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('台本JSON');
  const storyPatterns = pv_getStoryPatterns();
  const stylePatterns = pv_getStylePatterns();

  const html = HtmlService.createHtmlOutput(pv_createScriptPromptHTML(sheetData, storyPatterns, stylePatterns))
    .setWidth(950)
    .setHeight(850);
  ui.showModalDialog(html, '📝 台本生成プロンプト');
}

/**
 * 台本生成プロンプトダイアログのHTML
 */
function pv_createScriptPromptHTML(sheetData, storyPatterns, stylePatterns) {
  const sheetDataJson = JSON.stringify(sheetData);
  // sceneGuidelinesを除外してJSON化（クライアント側に渡すデータを軽量化）
  const storyPatternsForClient = storyPatterns.map(p => {
    const { sceneGuidelines, ...rest } = p;
    return rest;
  });
  const storyPatternsJson = JSON.stringify(storyPatternsForClient);
  const stylePatternsJson = JSON.stringify(stylePatterns);

  // シーンガイドラインを事前生成（ID -> テキストのマップ）
  const sceneGuidelinesMap = {};
  storyPatterns.forEach(p => {
    if (p.sceneGuidelines) {
      let text = '';
      p.sceneGuidelines.forEach(function(guide) {
        const sceneStr = guide.scenes.length === 1
          ? 'S' + guide.scenes[0]
          : 'S' + guide.scenes[0] + '-' + guide.scenes[guide.scenes.length - 1];
        text += '**' + sceneStr + '（' + guide.emotionRange + '）**\n';
        text += '- カメラワーク: ' + guide.cameraWork + '\n';
        text += '- 物語的意図: ' + guide.narrativeIntent + '\n';
        text += '- ショットタイプ: ' + guide.shotType + '\n\n';
      });
      sceneGuidelinesMap[p.id] = text;
    }
  });
  const sceneGuidelinesMapJson = JSON.stringify(sceneGuidelinesMap);

  // ストーリーパターン選択オプション
  let storyOptions = '';
  storyPatterns.forEach(pattern => {
    // 新プロパティ対応：essenceからdescription相当を生成
    const essenceDesc = pattern.essence ? `「${pattern.essence.split(' → ')[0]}」から「${pattern.essence.split(' → ').pop()}」への物語` : (pattern.description || '');
    storyOptions += `
      <div class="pattern-option" data-pattern-id="${pattern.id}" onclick="selectStoryPattern('${pattern.id}')">
        <div class="pattern-name">${pv_escapeHtml(pattern.name)}</div>
        <div class="pattern-desc">${pv_escapeHtml(essenceDesc)}</div>
        <div class="pattern-structure">
          <span class="structure-tag">${pv_escapeHtml(pattern.emotionCurveDisplay || '')}</span>
          <span class="structure-tag">${pv_escapeHtml(pattern.openingDisplay || '')}</span>
          <span class="structure-tag">${pv_escapeHtml(pattern.peakDisplay || '')}</span>
        </div>
        <div class="pattern-suitable">${pv_escapeHtml(pattern.suitable)}</div>
      </div>
    `;
  });

  // スタイルパターン選択オプション
  let styleOptions = '';
  stylePatterns.forEach(style => {
    styleOptions += `
      <div class="style-option" data-style-id="${style.id}" onclick="selectStylePattern('${style.id}')">
        <div class="style-name">${pv_escapeHtml(style.name)}</div>
        <div class="style-desc">${pv_escapeHtml(style.description)}</div>
      </div>
    `;
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${PV_DIALOG_STYLES}
  <style>
    .pattern-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; max-height: 400px; overflow-y: auto; padding-right: 4px; }
    .pattern-option {
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pattern-option:hover { border-color: #7c3aed; background: #faf5ff; }
    .pattern-option.selected { border-color: #7c3aed; background: #ede9fe; }
    .pattern-name { font-weight: bold; color: #333; font-size: 13px; margin-bottom: 4px; }
    .pattern-desc { font-size: 11px; color: #666; margin-bottom: 4px; }
    .pattern-structure { display: flex; gap: 6px; margin: 6px 0; flex-wrap: wrap; }
    .structure-tag { background: #f3f4f6; color: #4b5563; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
    .pattern-suitable { font-size: 10px; color: #7c3aed; }
    .style-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
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
    .style-desc { font-size: 9px; color: #666; margin-top: 2px; }
    .section-title { font-weight: bold; color: #7c3aed; margin: 16px 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #7c3aed; font-size: 14px; }
    .company-info { background: #e8f0fe; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 12px; }
    .selected-info { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
    .selected-badge { background: #ede9fe; color: #7c3aed; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .btn.loading { position: relative; color: transparent !important; pointer-events: none; }
    .btn.loading::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid #fff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
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

  <!-- ストーリーパターン選択 -->
  <div class="section-title">ストーリーパターンを選択</div>
  <div class="pattern-grid">
    ${storyOptions}
  </div>

  <!-- スタイル選択 -->
  <div class="section-title">スタイルを選択</div>
  <div class="style-grid">
    ${styleOptions}
  </div>

  <!-- 選択状態表示 -->
  <div class="selected-info" id="selectedInfo" style="display:none;">
    <span class="selected-badge" id="selectedStoryBadge"></span>
    <span class="selected-badge" id="selectedStyleBadge"></span>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">台本生成プロンプト</span>
      <button class="btn btn-green" onclick="copyPrompt()" id="copyBtn" disabled>コピー</button>
    </div>
    <div class="preview-content" id="previewContent" style="max-height: 200px;">
      <span class="preview-placeholder">企業・ストーリーパターン・スタイルを選択するとプロンプトが生成されます</span>
    </div>
  </div>

  <div class="footer">
    <button class="btn btn-primary" onclick="saveSelectionAndCopy()" id="saveBtn" disabled>💾 選択を保存 & コピー</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${PV_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    const storyPatterns = ${storyPatternsJson};
    const stylePatterns = ${stylePatternsJson};
    const sceneGuidelinesMap = ${sceneGuidelinesMapJson};
    let selectedSheetName = '';
    let selectedCompanyInfo = null;
    let selectedStoryPattern = null;
    let selectedStylePattern = null;
    let generatedPrompt = '';
    let isLoading = false;

    window.onload = function() {
      initCompanyDropdown();
    };

    function setLoading(btnId, loading) {
      const btn = document.getElementById(btnId);
      if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }

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
      showStatus('データ読み込み中...', 'info');

      google.script.run
        .withSuccessHandler(function(info) {
          selectedCompanyInfo = info;
          updateCompanyDisplay(item);
          // 抽出データも取得
          google.script.run
            .withSuccessHandler(function(extractedInfo) {
              if (extractedInfo) {
                selectedCompanyInfo = { ...selectedCompanyInfo, ...extractedInfo };
              }
              updatePrompt();
              showStatus('', '');
            })
            .pv_getExtractedDataForDialog(item.sheetName);
        })
        .pv_getBasicInfoForDialog(item.sheetName);
    }

    function updateCompanyDisplay(item) {
      const display = document.getElementById('companySelectDisplay');
      display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';

      if (selectedCompanyInfo) {
        const infoDiv = document.getElementById('companyInfo');
        let infoText = '🏢 ' + escapeHtml(selectedCompanyInfo.companyName || item.sheetName);
        if (selectedCompanyInfo.industry) infoText += ' / ' + escapeHtml(selectedCompanyInfo.industry);
        if (selectedCompanyInfo.goal) infoText += ' / ' + escapeHtml(selectedCompanyInfo.goal);
        if (selectedCompanyInfo.usage) infoText += ' / ' + escapeHtml(selectedCompanyInfo.usage);
        infoDiv.innerHTML = infoText;
        infoDiv.style.display = 'block';
      }
    }

    function selectStoryPattern(patternId) {
      selectedStoryPattern = storyPatterns.find(p => p.id === patternId);
      document.querySelectorAll('.pattern-option').forEach(el => el.classList.remove('selected'));
      document.querySelector('[data-pattern-id="' + patternId + '"]').classList.add('selected');
      updateSelectedInfo();
      updatePrompt();
    }

    function selectStylePattern(styleId) {
      selectedStylePattern = stylePatterns.find(s => s.id === styleId);
      document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
      document.querySelector('[data-style-id="' + styleId + '"]').classList.add('selected');
      updateSelectedInfo();
      updatePrompt();
    }

    function updateSelectedInfo() {
      const infoDiv = document.getElementById('selectedInfo');
      if (selectedStoryPattern || selectedStylePattern) {
        infoDiv.style.display = 'flex';
        document.getElementById('selectedStoryBadge').textContent = selectedStoryPattern ? '📖 ' + selectedStoryPattern.name : '';
        document.getElementById('selectedStyleBadge').textContent = selectedStylePattern ? '🎨 ' + selectedStylePattern.name : '';
      } else {
        infoDiv.style.display = 'none';
      }
    }

    function updatePrompt() {
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyBtn');
      const saveBtn = document.getElementById('saveBtn');

      if (!selectedCompanyInfo || !selectedStoryPattern || !selectedStylePattern) {
        preview.innerHTML = '<span class="preview-placeholder">企業・ストーリーパターン・スタイルを選択するとプロンプトが生成されます</span>';
        copyBtn.disabled = true;
        saveBtn.disabled = true;
        return;
      }

      generatedPrompt = buildScriptPrompt();
      preview.textContent = generatedPrompt;
      copyBtn.disabled = false;
      saveBtn.disabled = false;
    }

    // シーンガイドライン取得関数（サーバーで事前生成されたマップから取得）
    function getSceneGuidelines(storyPatternId) {
      return sceneGuidelinesMap[storyPatternId] || '';
    }

    function buildScriptPrompt() {
      const data = selectedCompanyInfo;
      const story = selectedStoryPattern;
      const style = selectedStylePattern;

      // 感情カーブ数値を視覚化
      const emotionValuesDisplay = story.emotionValues
        ? story.emotionValues.map((v, i) => 'S' + (i + 1) + ':[' + (v >= 0 ? '+' : '') + v + ']' + (i === 6 ? '★' : '')).join(' ')
        : '';

      // 映像表現手法
      const visualTechniquesDisplay = story.visualTechniques
        ? story.visualTechniques.join('、')
        : '';

      // essenceからdescription相当を生成
      const essenceDesc = story.essence
        ? '「' + story.essence.split(' → ')[0] + '」から「' + story.essence.split(' → ').pop() + '」への物語'
        : '';

      // シーンガイドラインを取得
      const sceneGuidelinesText = getSceneGuidelines(story.id);

      return \`# アニメPV台本生成プロンプト

## 企業情報
- 企業名: \${data.companyName || '（未入力）'}
- 業種: \${data.industry || '（未入力）'}
- 目的: \${data.goal || '（未入力）'}
- 用途: \${data.usage || '（未入力）'}
- ターゲット: \${data.target || '（未入力）'}
- トンマナ: \${data.tone || '（未入力）'}

## ヒアリング情報
- コアメッセージ: \${data.coreMessage || '（未入力）'}
- ストーリーアイデア: \${data.storyIdea || '（未入力）'}
- 舞台・世界観: \${data.setting || '（未入力）'}

## 安全・コンプライアンス
- 必須安全装備: \${data.safetyEquipment || '特になし'}
- NG要素: \${data.ngElements || '特になし'}

## 音声設定
\${data.audioSetting || '（未設定）'}

---

## 選択されたストーリーパターン: \${story.name}
\${essenceDesc}

### 構成要素
- 感情カーブ: \${story.emotionCurveDisplay || ''}
- オープニング: \${story.openingDisplay || ''}
- ピーク: \${story.peakDisplay || ''}
- 映像表現手法: \${visualTechniquesDisplay}

### 感情カーブ数値（シーン7がピーク★）
\${emotionValuesDisplay}

### 台本作成ガイダンス
\${story.guidance || ''}

---

## 選択されたスタイル: \${style.name}
\${style.description}

### 動画ベースプロンプト（各シーンで使用）
\${style.videoBasePrompt}

---

## シーン別カメラワーク指針

\${sceneGuidelinesText}
### 動画プロンプト構造（各シーンで使用）

各シーンのvideoPromptは以下の6要素構造で生成してください：
[ショットタイプ] + [被写体] + [1つの明確なアクション] + [カメラ動作] + [物語的意図に基づく演出]

**重要ルール:**
- **1プロンプト1アクション原則**: 複数のアクションを混ぜない
- **ナラティブ・インテント**: すべてのカメラ動作に「なぜ？」を持たせる
- **スタイルは自動追加**: \${style.name}のベースプロンプトは自動追加されるので含めない

---

# 出力形式（必ずこのJSON形式で出力）

上記の企業情報・ヒアリング情報を元に、12シーン + エンディングの台本を以下のJSON形式で出力してください。

\\\`\\\`\\\`json
{
  "characters": [
    {
      "name": "string（日本人名）",
      "gender": "男性 | 女性",
      "currentAge": "string（現在の年齢）",
      "pastAge": "string（過去編がある場合のみ）",
      "hair": "string（英語で髪型・髪色）",
      "eyes": "string（英語で目の特徴）",
      "build": "string（英語で体格）",
      "pastOutfit": "string（過去編がある場合のみ）",
      "currentOutfit": "string（現在の服装、安全装備含む）"
    }
  ],
  "scenes": [
    {
      "name": "string（シーン名）",
      "phase": "過去 | 転換点 | 現在 | 未来",
      "location": "string（場所）",
      "characters": "string（登場キャラクター）",
      "action": "string（動作・演出）",
      "mood": "string（雰囲気）",
      "narration": "string | null（ナレーション、4〜6シーンに配置）",
      "startFrame": "string（英語で開始フレームの詳細な視覚的説明。キャラクターの姿勢・表情・位置、背景の詳細、照明、色調を具体的に）",
      "videoPrompt": "string（英語で動画生成用プロンプト。動きとカメラワークを含む）"
    }
  ],
  "ending": {
    "type": "object_to_logo | logo_animation",
    "sourceObject": "string（object_to_logoの場合）",
    "animationType": "string（logo_animationの場合）",
    "finalText": "string（最終テキスト）",
    "videoPrompt": "string（英語でエンディング用プロンプト）"
  }
}
\\\`\\\`\\\`

---

## 制作ガイドライン

### 必須ルール
1. **企業名は絶対に変更しない**: 「\${data.companyName || '（未入力）'}」を一字一句そのまま使用
2. **シーン数**: 必ず12シーンを出力
3. **安全装備**: 「\${data.safetyEquipment || '特になし'}」を現在編の服装に必ず含める
4. **NG要素**: 「\${data.ngElements || '特になし'}」は絶対に含めない
5. **感情カーブ**: 上記の感情カーブ数値に沿った感情の起伏を表現する

### クリエイティブガイドライン
6. **キャラクター**: 主人公（必須）+ サブキャラ（任意）の最大2名
7. **ナレーション**: 感情の流れに沿った自然なナレーションを4〜6シーンに配置
8. **startFrame（重要）**: 各シーンの開始フレームを詳細に記述。以下を必ず含める:
   - キャラクターの姿勢・表情・視線の方向
   - 服装（過去編/現在編で異なる）
   - 背景の具体的な描写（場所、時間帯、天候）
   - 照明と色調（感情カーブに対応）
   - 構図（ワイドショット、クローズアップなど）
   - **テキスト・文字を含めない**: 看板、企業名、ロゴなどのテキストは画像生成では正確に再現できないため含めない。企業ロゴ等は後工程で合成する。
     ❌ NG: "with 'サンプル工業株式会社' sign visible"
     ⭕ OK: "factory entrance with company building visible"
9. **動画プロンプト**: 上記「シーン別カメラワーク指針」と「動画プロンプト構造」に従って生成
10. **映像表現**: 「\${visualTechniquesDisplay}」の技法を適切なシーンで活用
11. **エンディング**: ロゴへの変形またはロゴアニメーションで終了、最終テキストは目的に合わせて設定\`;
    }

    function copyPrompt() {
      if (!generatedPrompt) return;
      setLoading('copyBtn', true);
      navigator.clipboard.writeText(generatedPrompt).then(function() {
        setLoading('copyBtn', false);
        const success = document.getElementById('copySuccess');
        success.classList.add('show');
        setTimeout(function() { success.classList.remove('show'); }, 2000);
      }).catch(function() {
        setLoading('copyBtn', false);
        showStatus('コピーに失敗しました', 'error');
      });
    }

    function saveSelectionAndCopy() {
      if (!selectedSheetName || !selectedStoryPattern || !selectedStylePattern) {
        showStatus('すべての項目を選択してください', 'error');
        return;
      }

      setLoading('saveBtn', true);
      showStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            navigator.clipboard.writeText(generatedPrompt).then(function() {
              setLoading('saveBtn', false);
              showStatus('✅ 選択を保存してコピーしました', 'success');
            });
          } else {
            setLoading('saveBtn', false);
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          setLoading('saveBtn', false);
          showStatus('エラー: ' + error.message, 'error');
        })
        .pv_saveScriptSelections(selectedSheetName, selectedStoryPattern.name, selectedStylePattern.name);
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
 * ダイアログ用に抽出データを取得
 */
function pv_getExtractedDataForDialog(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {};

  return pv_getExtractedDataFromSheet(sheet);
}

/**
 * シーンガイドラインテキストを生成（サーバーサイド）
 */
function pv_generateSceneGuidelinesText(storyPatternId) {
  const storyPatterns = pv_getStoryPatterns();
  const pattern = storyPatterns.find(p => p.id === storyPatternId);

  if (!pattern || !pattern.sceneGuidelines) return '';

  let output = '';
  pattern.sceneGuidelines.forEach(function(guide) {
    const sceneStr = guide.scenes.length === 1
      ? 'S' + guide.scenes[0]
      : 'S' + guide.scenes[0] + '-' + guide.scenes[guide.scenes.length - 1];

    output += '**' + sceneStr + '（' + guide.emotionRange + '）**\n';
    output += '- カメラワーク: ' + guide.cameraWork + '\n';
    output += '- 物語的意図: ' + guide.narrativeIntent + '\n';
    output += '- ショットタイプ: ' + guide.shotType + '\n\n';
  });
  return output;
}

/**
 * 選択を保存
 */
function pv_saveScriptSelections(sheetName, storyName, styleName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  try {
    pv_setCellValueByLabel(sheet, '選択ストーリーパターン', storyName);
    pv_setCellValueByLabel(sheet, '選択スタイル', styleName);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ================================================================================
// ===== 台本パース・保存ダイアログ =====
// ================================================================================

/**
 * 台本パースダイアログを表示
 */
function pv_showScriptParseDialog() {
  const sheetData = pv_getCompanySheetListWithData('台本JSON');

  const html = HtmlService.createHtmlOutput(pv_createScriptParseHTML(sheetData))
    .setWidth(800)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 台本パース・保存');
}

/**
 * 台本パースダイアログのHTML
 */
function pv_createScriptParseHTML(sheetData) {
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
      height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      resize: vertical;
      font-family: monospace;
    }
    .parse-summary { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; margin-top: 12px; }
    .summary-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e0e0e0; }
    .summary-item:last-child { border-bottom: none; }
    .summary-label { color: #666; }
    .summary-value { font-weight: bold; color: #333; }
    .btn.loading { position: relative; color: transparent !important; pointer-events: none; }
    .btn.loading::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid #fff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <div id="step1">
    <!-- 企業選択 -->
    <div class="input-section">
      <span class="input-label">保存先企業を選択</span>
      <div class="company-select-wrapper">
        <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
          <span class="placeholder">企業シートを選択してください</span>
        </div>
        <div class="company-select-dropdown" id="companySelectDropdown"></div>
      </div>
    </div>

    <!-- JSON入力 -->
    <div class="input-section">
      <label class="input-label">AIが生成した台本（JSON形式）を貼り付け</label>
      <textarea class="input-textarea" id="scriptInput" placeholder='{"characters": [...], "scenes": [...], "ending": {...}}'></textarea>
      <div class="note">※ コードブロック（\`\`\`json）で囲まれていても自動除去します</div>
    </div>

    <div class="footer">
      <button class="btn btn-blue" onclick="parseAndPreview()" id="parseBtn">🔍 解析してプレビュー</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <div id="step2" style="display:none;">
    <div class="input-label">パース結果の確認</div>
    <div class="parse-summary" id="parseSummary"></div>

    <div class="footer" style="margin-top:16px;">
      <button class="btn btn-green" onclick="saveScript()" id="saveBtn">✅ シートに保存</button>
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

    function setLoading(btnId, loading) {
      const btn = document.getElementById(btnId);
      if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }

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
        document.getElementById('scriptInput').value = item.savedData;
        showStatus('保存済みの台本を読み込みました', 'info');
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

    function parseAndPreview() {
      if (!selectedSheetName) {
        showStatus('保存先シートを選択してください', 'error');
        return;
      }

      const jsonStr = document.getElementById('scriptInput').value.trim();
      if (!jsonStr) {
        showStatus('台本JSONを入力してください', 'error');
        return;
      }

      setLoading('parseBtn', true);
      showStatus('解析中...', 'info');

      const cleanJson = cleanJsonString(jsonStr);

      try {
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        setLoading('parseBtn', false);
        showStatus('JSONの解析に失敗しました: ' + e.message, 'error');
        return;
      }

      setLoading('parseBtn', false);

      // サマリー表示
      const summary = document.getElementById('parseSummary');
      let html = '';

      // キャラクター
      if (parsedData.characters && parsedData.characters.length > 0) {
        html += '<div class="summary-item"><span class="summary-label">キャラクター数</span><span class="summary-value">' + parsedData.characters.length + '人</span></div>';
        parsedData.characters.forEach((char, i) => {
          const genderAge = (char.gender || '') + (char.currentAge ? ' ' + char.currentAge : '');
          html += '<div class="summary-item"><span class="summary-label">└ ' + (i + 1) + '</span><span class="summary-value">' + escapeHtml(char.name || '名前なし') + ' (' + escapeHtml(genderAge) + ')</span></div>';
        });
      }

      // シーン
      if (parsedData.scenes && parsedData.scenes.length > 0) {
        html += '<div class="summary-item"><span class="summary-label">シーン数</span><span class="summary-value">' + parsedData.scenes.length + 'シーン</span></div>';
        const narrationCount = parsedData.scenes.filter(s => s.narration).length;
        html += '<div class="summary-item"><span class="summary-label">└ ナレーション有り</span><span class="summary-value">' + narrationCount + 'シーン</span></div>';
      }

      // エンディング
      if (parsedData.ending) {
        html += '<div class="summary-item"><span class="summary-label">エンディング</span><span class="summary-value">' + escapeHtml(parsedData.ending.type || '設定あり') + '</span></div>';
      }

      summary.innerHTML = html || '<div style="color:#666;">パースされたデータがありません</div>';

      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
      showStatus('', '');
    }

    function saveScript() {
      if (!parsedData) {
        showResultStatus('先にパースを実行してください', 'error');
        return;
      }

      setLoading('saveBtn', true);
      showResultStatus('保存中...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setLoading('saveBtn', false);
          if (result.success) {
            showResultStatus('✅ ' + result.message, 'success');
            setTimeout(function() { google.script.host.close(); }, 2000);
          } else {
            showResultStatus('❌ 保存に失敗: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          setLoading('saveBtn', false);
          showResultStatus('❌ エラー: ' + error.message, 'error');
        })
        .pv_parseAndSaveScript(selectedSheetName, parsedData);
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
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
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
