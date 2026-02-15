/**
 * HP制作 更新・修正・校正 プロンプト GAS
 *
 * 【機能】
 * 1. カンプ差分確認 - 実装済みコードとカンプの差分を検出
 * 2. セクション単位修正 - 選択した項目のみ修正指示を生成
 * 3. プレースホルダー更新 - カンプ更新後のテキスト置き換え
 *
 * 【用途】
 * - 実装後のカンプとのギャップ確認・修正
 * - カンプ更新時のプレースホルダー箇所の実データ反映
 *
 * 【使用方法】
 * onOpen()内で hp_addUpdateMenu(ui) を呼び出し
 */

// ===== 共通スタイル（CI_DIALOG_STYLESを使用） =====
// ※ compositionPrompt.js の CI_DIALOG_STYLES を参照

// ===== メニュー追加 =====
function hp_addUpdateMenu(ui) {
  ui.createMenu('5.🔄 更新・修正・校正')
    .addItem('🔍 カンプ差分確認・修正', 'hp_showKanpuDiffDialog')
    .addItem('📝 プレースホルダー更新', 'hp_showPlaceholderUpdateDialog')
    .addToUi();
}

// ===== カンプ差分確認・修正ダイアログ =====
function hp_showKanpuDiffDialog() {
  const html = HtmlService.createHtmlOutput(getKanpuDiffDialogHtml())
    .setWidth(600)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'カンプ差分確認・修正');
}

function getKanpuDiffDialogHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .mode-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .mode-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
    }
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .radio-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .radio-item input[type="radio"] {
      margin: 0;
    }
    .radio-item label {
      font-size: 14px;
      cursor: pointer;
    }
    .checkbox-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .checkbox-item input[type="checkbox"] {
      margin: 0;
    }
    .checkbox-item label {
      font-size: 13px;
      cursor: pointer;
    }
    .path-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    .path-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .section-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .prompt-output {
      width: 100%;
      height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      background: #f8f9fa;
      white-space: pre-wrap;
      overflow: auto;
    }
    .warning-box {
      background: #fff3e0;
      border: 1px solid #ffcc80;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .warning-box h4 {
      margin: 0 0 8px 0;
      color: #e65100;
      font-size: 13px;
    }
    .warning-box ul {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
    }
    .btn-primary {
      background: #1565C0;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #0d47a1;
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: #eeeeee;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 注意事項 -->
  <div class="warning-box">
    <h4>⚠️ 修正時の注意</h4>
    <ul>
      <li>選択した項目<strong>のみ</strong>修正されます</li>
      <li>選択していない項目は<strong>絶対に変更されません</strong></li>
      <li>不安な場合は「解析のみ」で差分確認してから修正してください</li>
    </ul>
  </div>

  <!-- 対象セクション -->
  <div class="input-section">
    <span class="input-label">対象セクション</span>
    <input type="text" class="section-select" id="sectionName"
      placeholder="例: HeroSection, AboutSection, ContactForm など">
    <div class="note">※ 修正したいセクション名を入力（コンポーネント名推奨）</div>
  </div>

  <!-- モード選択 -->
  <div class="mode-section">
    <h4>📋 モード選択</h4>
    <div class="radio-group">
      <div class="radio-item">
        <input type="radio" id="modeAnalyze" name="mode" value="analyze" checked>
        <label for="modeAnalyze">🔍 解析のみ（差分レポート出力）</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="modeFix" name="mode" value="fix">
        <label for="modeFix">🔧 解析 + 修正指示生成</label>
      </div>
    </div>
  </div>

  <!-- 修正対象選択 -->
  <div class="mode-section">
    <h4>🎯 修正対象（複数選択可）</h4>
    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="targetText" value="text" checked>
        <label for="targetText">📝 テキスト・文言</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="targetColor" value="color">
        <label for="targetColor">🎨 色・カラー</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="targetLayout" value="layout">
        <label for="targetLayout">📐 レイアウト・配置</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="targetFont" value="font">
        <label for="targetFont">🔤 フォント・サイズ</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="targetImage" value="image">
        <label for="targetImage">🖼️ 画像・素材</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="targetSpacing" value="spacing">
        <label for="targetSpacing">↔️ 余白・間隔</label>
      </div>
    </div>
  </div>

  <!-- カンプ画像パス -->
  <div class="input-section">
    <span class="input-label">カンプ画像パス</span>
    <input type="text" class="path-input" id="kanpuPath"
      placeholder="例: C:\\Users\\tench\\Downloads\\信藤建設HPデザイン\\1.png">
  </div>

  <!-- 実装済みコードパス -->
  <div class="input-section">
    <span class="input-label">実装済みコードのパス（任意）</span>
    <input type="text" class="path-input" id="codePath"
      placeholder="例: /mnt/c/client_hp/shindo/src/components/HeroSection.tsx">
    <div class="note">※ 空欄の場合、セクション名から推測します</div>
  </div>

  <!-- プロンプト出力 -->
  <div class="input-section">
    <span class="input-label">生成されたプロンプト</span>
    <textarea class="prompt-output" id="promptOutput" readonly></textarea>
  </div>

  <!-- ボタン -->
  <div class="btn-group">
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <button class="btn-secondary" onclick="copyPrompt()">📋 コピー</button>
    <button class="btn-primary" onclick="generatePrompt()">生成</button>
  </div>

  <script>
    function generatePrompt() {
      const sectionName = document.getElementById('sectionName').value.trim();
      const mode = document.querySelector('input[name="mode"]:checked').value;
      const kanpuPath = document.getElementById('kanpuPath').value.trim();
      const codePath = document.getElementById('codePath').value.trim();

      // 選択された修正対象を取得
      const targets = [];
      if (document.getElementById('targetText').checked) targets.push('テキスト・文言');
      if (document.getElementById('targetColor').checked) targets.push('色・カラー');
      if (document.getElementById('targetLayout').checked) targets.push('レイアウト・配置');
      if (document.getElementById('targetFont').checked) targets.push('フォント・サイズ');
      if (document.getElementById('targetImage').checked) targets.push('画像・素材');
      if (document.getElementById('targetSpacing').checked) targets.push('余白・間隔');

      if (!sectionName) {
        alert('対象セクションを入力してください');
        return;
      }
      if (!kanpuPath) {
        alert('カンプ画像パスを入力してください');
        return;
      }
      if (targets.length === 0) {
        alert('修正対象を1つ以上選択してください');
        return;
      }

      const prompt = buildDiffPrompt(sectionName, mode, targets, kanpuPath, codePath);
      document.getElementById('promptOutput').value = prompt;
    }

    function buildDiffPrompt(sectionName, mode, targets, kanpuPath, codePath) {
      const modeText = mode === 'analyze' ? '解析のみ（差分レポート）' : '解析 + 修正';
      const targetsText = targets.join('、');

      let prompt = \`# カンプ差分確認・修正指示

## 基本情報

| 項目 | 内容 |
|------|------|
| 対象セクション | \${sectionName} |
| モード | \${modeText} |
| 修正対象 | \${targetsText} |
| カンプ画像 | \${kanpuPath} |
\${codePath ? \`| 実装コード | \${codePath} |\` : ''}

---

## 🚨 厳守事項

### ✅ やること
\${targets.map(t => \`- \${t}の差分を検出し、\${mode === 'fix' ? '修正指示を生成' : 'レポート出力'}\`).join('\\n')}

### ❌ やらないこと（絶対禁止）
\${['テキスト・文言', '色・カラー', 'レイアウト・配置', 'フォント・サイズ', '画像・素材', '余白・間隔']
  .filter(t => !targets.includes(t))
  .map(t => \`- \${t}は変更しない（現状維持）\`)
  .join('\\n')}
- 選択されていない項目は一切変更しない
- 既存の正しい実装を壊さない
- 推測でデザインを「改善」しない

---

## 作業手順

1. カンプ画像（\${kanpuPath}）を読み込む
2. \${codePath ? \`実装コード（\${codePath}）を読み込む\` : \`\${sectionName} のコードを探して読み込む\`}
3. 選択された項目（\${targetsText}）についてのみ差分を検出
\`;

      if (mode === 'analyze') {
        prompt += \`4. 差分レポートを以下の形式で出力:

### 差分レポート

| # | 項目 | カンプ | 実装 | 差分 |
|---|------|--------|------|------|
| 1 | （例）見出しテキスト | 「私たちについて」 | 「会社概要」 | テキスト相違 |
| ... | ... | ... | ... | ... |

### 所見
- （差分の要約と修正推奨度）
\`;
      } else {
        prompt += \`4. 差分を検出し、修正コードを生成
5. 修正は選択された項目（\${targetsText}）のみ
6. 修正前後の差分をわかりやすく表示

### 修正指示

\\\`\\\`\\\`diff
- 修正前のコード
+ 修正後のコード
\\\`\\\`\\\`
\`;
      }

      return prompt;
    }

    function copyPrompt() {
      const output = document.getElementById('promptOutput');
      output.select();
      document.execCommand('copy');

      const copySuccess = document.getElementById('copySuccess');
      copySuccess.classList.add('show');
      setTimeout(() => copySuccess.classList.remove('show'), 2000);
    }
  </script>
</body>
</html>
`;
}

// ===== プレースホルダー更新ダイアログ =====
function hp_showPlaceholderUpdateDialog() {
  const html = HtmlService.createHtmlOutput(getPlaceholderUpdateDialogHtml())
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'プレースホルダー更新');
}

function getPlaceholderUpdateDialogHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .info-box {
      background: #e3f2fd;
      border: 1px solid #90caf9;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #1565c0;
      font-size: 13px;
    }
    .info-box p {
      margin: 0;
      font-size: 12px;
      color: #333;
    }
    .path-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    .path-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .placeholder-list {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
    }
    .prompt-output {
      width: 100%;
      height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      background: #f8f9fa;
      white-space: pre-wrap;
      overflow: auto;
    }
    .btn-primary {
      background: #1565C0;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #0d47a1;
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📝 プレースホルダー更新とは</h4>
    <p>カンプが更新され、「aaaa」「xxxx」などのプレースホルダーが実データに置き換わった場合に、
    該当箇所のみを更新する機能です。レイアウトや色は変更しません。</p>
  </div>

  <!-- 対象セクション -->
  <div class="input-section">
    <span class="input-label">対象セクション</span>
    <input type="text" class="path-input" id="sectionName"
      placeholder="例: HeroSection, CompanyInfo, ContactForm など">
  </div>

  <!-- カンプ画像パス -->
  <div class="input-section">
    <span class="input-label">更新後のカンプ画像パス</span>
    <input type="text" class="path-input" id="kanpuPath"
      placeholder="例: C:\\Users\\tench\\Downloads\\信藤建設HPデザイン\\1_v2.png">
  </div>

  <!-- プレースホルダー一覧 -->
  <div class="input-section">
    <span class="input-label">更新対象のプレースホルダー（任意）</span>
    <textarea class="placeholder-list" id="placeholderList"
      placeholder="例:&#10;aaaa → 会社名&#10;xxxx → 住所&#10;0000-00-0000 → 電話番号"></textarea>
    <div class="note">※ 空欄の場合、カンプから自動検出します</div>
  </div>

  <!-- プロンプト出力 -->
  <div class="input-section">
    <span class="input-label">生成されたプロンプト</span>
    <textarea class="prompt-output" id="promptOutput" readonly></textarea>
  </div>

  <!-- ボタン -->
  <div class="btn-group">
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <button class="btn-secondary" onclick="copyPrompt()">📋 コピー</button>
    <button class="btn-primary" onclick="generatePrompt()">生成</button>
  </div>

  <script>
    function generatePrompt() {
      const sectionName = document.getElementById('sectionName').value.trim();
      const kanpuPath = document.getElementById('kanpuPath').value.trim();
      const placeholderList = document.getElementById('placeholderList').value.trim();

      if (!sectionName) {
        alert('対象セクションを入力してください');
        return;
      }
      if (!kanpuPath) {
        alert('カンプ画像パスを入力してください');
        return;
      }

      const prompt = buildPlaceholderPrompt(sectionName, kanpuPath, placeholderList);
      document.getElementById('promptOutput').value = prompt;
    }

    function buildPlaceholderPrompt(sectionName, kanpuPath, placeholderList) {
      let prompt = \`# プレースホルダー更新指示

## 基本情報

| 項目 | 内容 |
|------|------|
| 対象セクション | \${sectionName} |
| カンプ画像 | \${kanpuPath} |

---

## 🚨 厳守事項

### ✅ やること
- カンプ画像からテキスト・文言を読み取る
- プレースホルダー箇所（aaaa, xxxx, 000-0000 等）を実データに置き換える

### ❌ やらないこと（絶対禁止）
- レイアウト・配置の変更
- 色・カラーの変更
- フォント・サイズの変更
- 余白・間隔の変更
- 画像の変更
- テキスト以外のあらゆる変更

---

## 作業手順

1. カンプ画像（\${kanpuPath}）を読み込む
2. \${sectionName} のコードを探して読み込む
3. プレースホルダー箇所を特定
4. カンプの実データでプレースホルダーを置き換え
5. テキスト以外は一切変更しない
\`;

      if (placeholderList) {
        prompt += \`
---

## 更新対象のプレースホルダー

\\\`\\\`\\\`
\${placeholderList}
\\\`\\\`\\\`
\`;
      }

      prompt += \`
---

## 出力形式

\\\`\\\`\\\`diff
- プレースホルダーの箇所
+ 実データに置き換えた箇所
\\\`\\\`\\\`
\`;

      return prompt;
    }

    function copyPrompt() {
      const output = document.getElementById('promptOutput');
      output.select();
      document.execCommand('copy');

      const copySuccess = document.getElementById('copySuccess');
      copySuccess.classList.add('show');
      setTimeout(() => copySuccess.classList.remove('show'), 2000);
    }
  </script>
</body>
</html>
`;
}
