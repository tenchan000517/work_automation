/**
 * アニメPV制作 - 歌詞生成プロンプト v2.0
 *
 * 歌詞生成プロンプトダイアログ、歌詞パースダイアログ、共通保存関数
 * 12シーン対応
 *
 * 外部依存:
 * - PV_DIALOG_STYLES, PV_UI_COMPONENTS (animePvCommonStyles.js)
 * - pv_getCompanySheetListWithData() (animePvSheetManager.js)
 * - pv_getBasicInfoForDialog(), pv_getExtractedDataForDialog() (animePvMain.js)
 * - pv_getCellValueByLabel(), pv_setCellValueByLabel() (animePvMain.js)
 */

// ================================================================================
// ===== 歌詞構成パターン定義 =====
// ================================================================================

// ショート（1分）向け - 短時間で最大限のエモーションを引き出す設計
const PV_LYRICS_STRUCTURES_SHORT = [
  {
    id: 'short_chorus_first',
    name: 'サビ頭→展開→サビ',
    description: '最初から掴む、記憶に残る',
    sections: ['Chorus', 'Verse', 'Final Chorus'],
    template: `[Chorus]
[Energy: High]
（最初からサビで掴む、印象的なフレーズ 4行）

[Verse]
[Energy: Medium]
（サビの背景・感情の深掘り 4行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（感情のピーク、サビの変化形 4行）`
  },
  {
    id: 'short_condensed',
    name: '凝縮型',
    description: '最短で感情曲線を描く',
    sections: ['Verse', 'Chorus', 'Outro'],
    template: `[Verse]
[Energy: Medium]
（情景描写と感情の芽生え 4行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（感情の爆発、最も伝えたいメッセージ 4-6行）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻を残す一言 2行）`
  },
  {
    id: 'short_intro_chorus',
    name: 'イントロ→サビ直行',
    description: '世界観＋インパクトの両立',
    sections: ['Intro', 'Chorus', 'Bridge', 'Final Chorus'],
    template: `[Intro]
[Energy: Low]
（世界観を一瞬で提示 2行）

[Chorus]
[Energy: High]
（すぐにサビへ、メインメッセージ 4行）

[Bridge]
[Energy: Building]
（視点の転換、問いかけ 2行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（クライマックス 4行）`
  },
  {
    id: 'short_one_scene',
    name: 'ワンシーン型',
    description: 'ショートフィルム的、1つの感情を深く',
    sections: ['Verse', 'Chorus'],
    template: `[Verse]
[Energy: Low]
[Building]
（1つの情景を丁寧に描写、感情が徐々に高まる 6行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（その情景から生まれる感情のピーク、1回だけだからこそ濃密に 6行）`
  }
];

// ロング（2-3分）向け - フルサイズ楽曲
const PV_LYRICS_STRUCTURES_LONG = [
  {
    id: 'standard',
    name: '標準（Verse始まり）',
    description: '物語性重視、ストーリーを展開',
    sections: ['Verse', 'Pre-Chorus', 'Chorus', 'Verse2', 'Chorus', 'Bridge', 'Final Chorus', 'Outro'],
    template: `[Verse]
[Energy: Medium]
（導入・状況描写・感情の芽生え 4-6行）

[Pre-Chorus]
[Energy: Building]
（感情の高まり 2-3行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（最も印象的なフレーズ 4-6行）

[Verse2]
[Energy: Medium]
（展開・変化・深化 4-6行）

[Chorus]
[Energy: High]
（サビ繰り返し）

[Bridge]
[Energy: Building]
（転換・新たな視点 2-4行）

[Final Chorus]
[Energy: Maximum]
（クライマックス）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻 2-4行）`
  },
  {
    id: 'chorus_first',
    name: 'サビ始まり',
    description: 'インパクト重視、最初からフック',
    sections: ['Chorus', 'Verse', 'Chorus', 'Verse2', 'Bridge', 'Final Chorus'],
    template: `[Chorus]
[Energy: High]
（最初からサビ、インパクト 4-6行）

[Verse]
[Energy: Medium]
（サビを受けて背景説明 4-6行）

[Chorus]
[Energy: High]
（サビ繰り返し）

[Verse2]
[Energy: Medium]
（展開・深化 4-6行）

[Bridge]
[Energy: Building]
（転換点 2-4行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（最高潮のサビ）`
  },
  {
    id: 'with_intro',
    name: 'イントロ付き',
    description: '雰囲気重視、世界観を構築',
    sections: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse2', 'Chorus', 'Outro'],
    template: `[Intro]
[Energy: Low]
（世界観を提示する短いフレーズ 2行）

[Verse]
[Energy: Medium]
（物語の始まり 4-6行）

[Pre-Chorus]
[Energy: Building]
（高まり 2-3行）

[Chorus]
[Energy: High]
（サビ 4-6行）

[Verse2]
[Energy: Medium]
（展開 4-6行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（サビ繰り返し）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻・イントロの呼応 2-4行）`
  },
  {
    id: 'ballad',
    name: 'バラード',
    description: '感情重視、じっくり展開',
    sections: ['Verse', 'Verse2', 'Chorus', 'Verse3', 'Bridge', 'Final Chorus', 'Outro'],
    template: `[Verse]
[Energy: Low]
（静かな導入・情景描写 4-6行）

[Verse2]
[Energy: Low]
（感情の深まり 4-6行）

[Chorus]
[Energy: Medium]
（控えめだが芯のあるサビ 4-6行）

[Verse3]
[Energy: Medium]
（転換・新たな展開 4-6行）

[Bridge]
[Energy: Building]
（感情の爆発前夜 2-4行）

[Final Chorus]
[Energy: High]
[Stacked Harmonies]
（感情のピーク）

[Outro]
[Energy: Fading]
[Fade Out]
（静かに消えゆく余韻 2-4行）`
  }
];

// 後方互換性のためのエイリアス
const PV_LYRICS_STRUCTURES = PV_LYRICS_STRUCTURES_LONG;

// ================================================================================
// ===== 歌詞生成プロンプト =====
// ================================================================================

/**
 * 歌詞生成プロンプトダイアログを表示
 */
function pv_showLyricsPromptDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('歌詞生成プロンプト');

  const htmlContent = pv_createLyricsPromptDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(800)
    .setHeight(750);
  ui.showModalDialog(htmlOutput, '✏️ 歌詞生成プロンプト');
}

/**
 * 構成パターンを取得（ダイアログから呼び出し用）
 * @param {string} lengthType - 'short' または 'long'
 */
function pv_getLyricsStructures(lengthType) {
  const structures = lengthType === 'short' ? PV_LYRICS_STRUCTURES_SHORT : PV_LYRICS_STRUCTURES_LONG;
  return structures.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  }));
}

/**
 * 歌詞プロンプトを生成（ダイアログから呼び出し用）
 * @param {string} sheetName - シート名
 * @param {string} lengthType - 'short' または 'long'
 * @param {string} structureId - 構成パターンID
 */
function pv_generateLyricsPrompt(sheetName, lengthType, structureId) {
  const basicInfo = pv_getBasicInfoForDialog(sheetName);
  const extractedData = pv_getExtractedDataForDialog(sheetName);
  return pv_buildLyricsPrompt({ ...basicInfo, ...extractedData }, lengthType, structureId);
}

/**
 * 歌詞生成プロンプトを構築
 * @param {Object} data - 企業情報
 * @param {string} lengthType - 'short' または 'long'
 * @param {string} structureId - 構成パターンID
 */
function pv_buildLyricsPrompt(data, lengthType, structureId) {
  // 長さに応じた構成パターンを取得
  const structures = lengthType === 'short' ? PV_LYRICS_STRUCTURES_SHORT : PV_LYRICS_STRUCTURES_LONG;
  const structure = structures.find(s => s.id === structureId) || structures[0];
  const isShort = lengthType === 'short';
  const lengthLabel = isShort ? 'ショート（約1分）' : 'ロング（2-3分）';

  // ショート用の追加ガイダンス
  const shortGuidance = isShort ? `
## ⚡ ショート版の重要ポイント

**1分で心を動かす**ために、以下を意識してください：

1. **最初の10秒で掴む** - 冒頭から感情に訴えかける
2. **無駄な展開は削る** - 1つのメッセージに集中
3. **余韻より衝撃** - 聴き終わった後に残る「一言」を意識
4. **繰り返しを活かす** - 短いからこそ印象に残るフレーズを

**NG**: ロング版を短くしただけの歌詞
**OK**: 1分専用に設計された濃密な歌詞

---
` : '';

  return `# SUNO V5対応 エモーショナル歌詞生成プロンプト

## 楽曲の長さ: ${lengthLabel}

## 企業情報（インスピレーション用）
- 企業名: ${data.companyName || '（未設定）'}
- 業種: ${data.industry || '（未設定）'}
- コアメッセージ: ${data.coreMessage || '（未設定）'}
- PVの目的: ${data.purpose || '採用'}
- ターゲット: ${data.target || '若者・就活生'}
- トンマナ: ${data.tone || '熱い・情熱的'}

---
${shortGuidance}
## 歌詞スタイル指定

**ミスターチルドレン風のエモーショナルな歌詞**を作成してください。

### 歌詞作成のコツ（重要）

1. **抽象と具体のバランス**
   - 具体的な情景描写と抽象的な感情を混ぜる
   - 「朝焼けに溶けていく 昨日の不安」のように

2. **日常の普遍的な感情**
   - すれ違い、届かない想い、変わりゆく日常
   - 誰もが経験する小さな感情の機微

3. **比喩表現**
   - 感情を自然現象に例える（風、雨、空、季節）
   - 「心の中で雨が降る」「君という光」

4. **問いかけの技法**
   - 「君は覚えているかな」「あの日の僕らは何を見ていた」
   - リスナーに語りかける形式

5. **未完成の感情**
   - すべてを言い切らず、余韻を残す
   - 「...」や体言止めを効果的に使う

6. **時間の流れ**
   - 過去と現在を行き来する構成
   - 「あの頃」「いつか」「今」を対比

---

## 企業情報の扱い方（3つのルール）

1. **企業名は絶対に歌詞に入れない**
   - 「株式会社〇〇」「〇〇で働こう」は絶対NG

2. **抽象度を高くする**
   - 業種や仕事内容を直接書かず、その本質を詩的に表現
   - 説明的な言葉は使わない

3. **コアメッセージを踏襲する**
   - 企業のコアメッセージの「精神」を歌詞全体に反映させる
   - ただしコアメッセージをそのまま歌詞にするのではなく、感情として表現する

---

## 構成パターン: ${structure.name}

${structure.description}

### 構成テンプレート

\`\`\`
${structure.template}
\`\`\`

---

## SUNO V5メタタグ形式

必ず以下の形式でメタタグを付けてください：

### 構造タグ
- [Verse], [Verse2], [Verse3] - 歌い出し、展開
- [Pre-Chorus] - サビ前の高まり
- [Chorus], [Final Chorus] - サビ
- [Bridge] - 転換部
- [Intro], [Outro] - 導入・終結

### エネルギータグ
- [Energy: Low] - 静か、囁くような
- [Energy: Medium] - 通常
- [Energy: Building] - 徐々に高まる
- [Energy: High] - 力強い
- [Energy: Maximum] - 最高潮
- [Energy: Fading] - 消えゆく

### 効果タグ
- [Stacked Harmonies] - コーラス重ね
- [Breakdown] - 一旦静かに
- [Fade Out] - フェードアウト

---

## 言葉遣いの指定

### 使ってほしい表現
- シンプルだが詩的な日本語
- 「きっと」「ずっと」「たぶん」などの副詞
- カタカナ語を適度に（2-3箇所）
- 完結しすぎず、余韻を残す表現
- 体言止め「〜する日々」「〜という名の」

### 避けるべき表現
- 陳腐な恋愛表現（「君がいないと」「会いたい」）
- 説明的すぎる言葉（「努力して」「頑張って」）
- 直接的すぎる感情表現（「嬉しい」「悲しい」）
- 企業PRっぽい表現
- ありきたりな応援ソング的表現

---

## 出力形式

上記の構成テンプレートに従い、SUNO V5メタタグ付きの歌詞を出力してください。

\`\`\`
[セクションタグ]
[エネルギータグ]
歌詞1行目
歌詞2行目
...
\`\`\`

**重要**:
- タグは必ず角括弧 [ ] で囲み、各セクションの先頭に配置
- 歌詞は日本語で
- ${isShort ? '約1分（ショート）の歌詞を作成 - 濃密に、無駄なく' : '1曲分（約2-3分、ロング）の歌詞を作成'}
`;
}

function pv_createLyricsPromptDialogHtml(sheetData) {
  // ショート/ロング両方の構成パターンをJSON化
  const shortStructuresJson = JSON.stringify(PV_LYRICS_STRUCTURES_SHORT.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  })));
  const longStructuresJson = JSON.stringify(PV_LYRICS_STRUCTURES_LONG.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  })));
  const sheetDataJson = JSON.stringify(sheetData);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .length-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .length-btn {
          flex: 1; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 8px;
          cursor: pointer; text-align: center; transition: all 0.2s; background: white;
        }
        .length-btn:hover { border-color: #f59e0b; background: #fffbeb; }
        .length-btn.selected { border-color: #f59e0b; background: #fef3c7; }
        .length-btn.short.selected { border-color: #ec4899; background: #fdf2f8; }
        .length-btn-label { font-weight: bold; color: #333; font-size: 15px; }
        .length-btn-desc { color: #666; font-size: 12px; margin-top: 4px; }
        .length-btn-badge {
          display: inline-block; padding: 2px 8px; border-radius: 10px;
          font-size: 10px; font-weight: bold; margin-top: 6px;
        }
        .length-btn.short .length-btn-badge { background: #fce7f3; color: #be185d; }
        .length-btn.long .length-btn-badge { background: #dbeafe; color: #1d4ed8; }
        .structure-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
        .structure-option {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .structure-option:hover { border-color: #f59e0b; background: #fffbeb; }
        .structure-option.selected { border-color: #f59e0b; background: #fef3c7; }
        .structure-name { font-weight: bold; color: #333; font-size: 14px; margin-bottom: 4px; }
        .structure-desc { color: #666; font-size: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .info-item { background: #f5f5f5; padding: 8px 12px; border-radius: 6px; }
        .info-label { font-size: 11px; color: #666; margin-bottom: 2px; }
        .info-value { font-size: 13px; color: #333; font-weight: 500; }
        .prompt-result-body { max-height: 240px; overflow-y: auto; }
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>✏️ エモーショナル歌詞生成プロンプト</h3>
      <p class="subtitle">企業を選択し、歌詞生成プロンプトを作成</p>

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

      <div id="optionsSection" class="options-disabled">
        <div class="section-title">企業情報</div>
        <div class="info-grid" id="infoGrid">
          <div class="info-item"><div class="info-label">企業名</div><div class="info-value" id="infoCompany">-</div></div>
          <div class="info-item"><div class="info-label">業種</div><div class="info-value" id="infoIndustry">-</div></div>
          <div class="info-item"><div class="info-label">コアメッセージ</div><div class="info-value" id="infoCoreMessage">-</div></div>
          <div class="info-item"><div class="info-label">トンマナ</div><div class="info-value" id="infoTone">-</div></div>
        </div>

        <div class="section-title">楽曲の長さ</div>
        <div class="length-toggle">
          <div class="length-btn short selected" data-length="short" onclick="selectLength('short')">
            <div class="length-btn-label">⚡ ショート</div>
            <div class="length-btn-desc">約1分・インパクト重視</div>
            <div class="length-btn-badge">メイン</div>
          </div>
          <div class="length-btn long" data-length="long" onclick="selectLength('long')">
            <div class="length-btn-label">🎵 ロング</div>
            <div class="length-btn-desc">2-3分・フルサイズ</div>
            <div class="length-btn-badge">オプション</div>
          </div>
        </div>

        <div class="section-title">構成パターンを選択</div>
        <div class="structure-grid" id="structureGrid"></div>
      </div>

      <div class="prompt-result">
        <div class="prompt-result-header">
          <span class="prompt-result-title">歌詞生成プロンプト</span>
          <div class="prompt-result-actions">
            <button class="btn btn-copy" id="copyBtn" onclick="copyPrompt()" disabled>📋 コピー</button>
            <button class="btn btn-save" id="saveBtn" onclick="savePrompt()" disabled>💾 保存</button>
          </div>
        </div>
        <div class="prompt-result-body" id="promptBody">企業を選択するとプロンプトが生成されます</div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        const shortStructures = ${shortStructuresJson};
        const longStructures = ${longStructuresJson};
        let selectedSheetName = '';
        let selectedCompanyInfo = null;
        let currentPrompt = '';
        let currentLengthType = 'short';
        let currentStructureId = 'short_chorus_first';

        window.onload = function() {
          initCompanyDropdown();
          renderStructures('short');
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
          showStatus('データ読み込み中...', 'info', 'status');

          google.script.run
            .withSuccessHandler(function(info) {
              selectedCompanyInfo = info;
              google.script.run
                .withSuccessHandler(function(extractedInfo) {
                  if (extractedInfo) {
                    selectedCompanyInfo = { ...selectedCompanyInfo, ...extractedInfo };
                  }
                  updateCompanyDisplay(item);
                  enableOptions();
                  updatePrompt();
                  showStatus('', '', 'status');
                })
                .pv_getExtractedDataForDialog(item.sheetName);
            })
            .pv_getBasicInfoForDialog(item.sheetName);
        }

        function updateCompanyDisplay(item) {
          const display = document.getElementById('companySelectDisplay');
          display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';

          if (selectedCompanyInfo) {
            document.getElementById('infoCompany').textContent = selectedCompanyInfo.companyName || '（未設定）';
            document.getElementById('infoIndustry').textContent = selectedCompanyInfo.industry || '（未設定）';
            document.getElementById('infoCoreMessage').textContent = selectedCompanyInfo.coreMessage || '（未設定）';
            document.getElementById('infoTone').textContent = selectedCompanyInfo.tone || '（未設定）';

            const infoDiv = document.getElementById('companyInfo');
            infoDiv.innerHTML = '🏢 ' + escapeHtml(selectedCompanyInfo.companyName || item.sheetName) +
              (selectedCompanyInfo.industry ? ' / ' + escapeHtml(selectedCompanyInfo.industry) : '');
            infoDiv.style.display = 'block';
          }
        }

        function enableOptions() {
          document.getElementById('optionsSection').classList.remove('options-disabled');
          document.getElementById('copyBtn').disabled = false;
          document.getElementById('saveBtn').disabled = false;
        }

        function selectLength(lengthType) {
          document.querySelectorAll('.length-btn').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-length="' + lengthType + '"]').classList.add('selected');
          currentLengthType = lengthType;
          renderStructures(lengthType);
        }

        function renderStructures(lengthType) {
          const structures = lengthType === 'short' ? shortStructures : longStructures;
          const grid = document.getElementById('structureGrid');
          grid.innerHTML = '';

          structures.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'structure-option' + (i === 0 ? ' selected' : '');
            div.dataset.structureId = s.id;
            div.onclick = function() { selectStructure(s.id); };
            div.innerHTML = '<div class="structure-name">' + escapeHtml(s.name) + '</div>' +
                            '<div class="structure-desc">' + escapeHtml(s.description) + '</div>';
            grid.appendChild(div);
          });

          currentStructureId = structures[0].id;
          if (selectedSheetName) {
            updatePrompt();
          }
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function selectStructure(structureId) {
          document.querySelectorAll('.structure-option').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-structure-id="' + structureId + '"]').classList.add('selected');
          currentStructureId = structureId;
          updatePrompt();
        }

        function updatePrompt() {
          if (!selectedSheetName) return;
          showStatus('プロンプト生成中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(newPrompt) {
              currentPrompt = newPrompt;
              document.getElementById('promptBody').textContent = newPrompt;
              showStatus('', '', 'status');
            })
            .withFailureHandler(function(e) {
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_generateLyricsPrompt(selectedSheetName, currentLengthType, currentStructureId);
        }

        function copyPrompt() {
          if (!currentPrompt) return;
          copyToClipboard(currentPrompt);
        }

        function savePrompt() {
          if (!selectedSheetName || !currentPrompt) return;
          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, '歌詞生成プロンプト', currentPrompt);
        }

        // ドロップダウン外クリックで閉じる
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

// ================================================================================
// ===== 歌詞パース =====
// ================================================================================

/**
 * 歌詞パースダイアログを表示
 */
function pv_showLyricsParseDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('生成歌詞');

  const htmlContent = pv_createLyricsParseDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(650)
    .setHeight(500);
  ui.showModalDialog(htmlOutput, '📥 歌詞を貼り付け・保存');
}

function pv_createLyricsParseDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>📥 歌詞を貼り付け・保存</h3>
      <p class="subtitle">AIが生成した歌詞を保存</p>

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
        <div class="input-section">
          <label class="input-label">生成された歌詞を貼り付け</label>
          <textarea id="lyricsInput" placeholder="[Verse]
夢見ていた未来へ
一歩ずつ歩いてく
..."></textarea>
        </div>

        <div class="actions">
          <button class="btn btn-save" id="saveBtn" onclick="saveLyrics()">💾 保存</button>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        let selectedSheetName = '';

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
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
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
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function saveLyrics() {
          if (!selectedSheetName) return;
          const lyrics = document.getElementById('lyricsInput').value.trim();
          if (!lyrics) {
            showStatus('歌詞を入力してください', 'error', 'status');
            return;
          }

          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, '生成歌詞', lyrics);
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

// ================================================================================
// ===== 共通保存関数 =====
// ================================================================================

/**
 * 音声プロンプトをシートに保存
 */
function pv_saveAudioPrompt(sheetName, fieldName, content) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    pv_setCellValueByLabel(sheet, fieldName, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 保存済み歌詞を読み込む
 */
function pv_loadSavedLyrics(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const lyrics = pv_getCellValueByLabel(sheet, '生成歌詞');
    return { success: true, lyrics: lyrics || '' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
