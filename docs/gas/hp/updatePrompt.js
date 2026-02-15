/**
 * HP制作 更新・修正・校正 プロンプト GAS
 *
 * 【機能】
 * 1. カンプ差分確認・修正 - 実装済みコードとカンプの差分を検出・修正
 * 2. プレースホルダー更新 + SEO/LLMO - ヒアリングシートJSONでプレースホルダー置換 + SEO/LLMO対策
 *
 * 【用途】
 * - 実装後のカンプとのギャップ確認・修正
 * - ヒアリングシートのデータでプレースホルダーを実データに置換
 * - SEO・LLMO対策の実施
 *
 * 【依存】
 * - jsonOutputDialog.js: hp_getCompanySheetListForJsonOutput(), hp_extractAndSaveJsonData()
 * - compositionPrompt.js: CI_DIALOG_STYLES
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
    .addItem('📝 プレースホルダー更新 + SEO/LLMO', 'hp_showPlaceholderUpdateDialog')
    .addItem('📷 素材反映', 'hp_showAssetReflectionDialog')
    .addSeparator()
    .addItem('✅ 素材チェック実行', 'hp_showAssetCheckDialog')
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

| # | 項目 | カンプ | 実装 | 差分種別 | 修正推奨度 |
|---|------|--------|------|----------|-----------|
| 1 | （例）見出しテキスト | 「私たちについて」 | 「会社概要」 | テキスト相違 | 高 |
| ... | ... | ... | ... | ... | ... |

### 所見
- （差分の要約と修正推奨度）

---

## 📁 必須: レポート保存

**差分レポートを以下のファイルに保存してください:**

\\\`docs/DESIGN_DIFF_REPORT.md\\\`

保存内容:
- 作成日
- 対象企業名
- カンプ画像パス
- 全ページ・全セクションの差分一覧
- 修正推奨度（高/中/低）
- 修正対象ファイル一覧

---

## 📝 必須: HANDOFF.md 更新

レポート保存後、\\\`HANDOFF.md\\\` を更新して次セッションが作業開始できるようにしてください。

**追加する内容:**

\\\`\\\`\\\`markdown
## 次セッション: カンプ差分修正

**差分レポート:** \\\`docs/DESIGN_DIFF_REPORT.md\\\`

### 作業手順（1ページ・1セクションずつ丁寧に）

以下の順序で、**1ページずつ**カンプを参照しながら修正してください。

| # | ページ | セクション | カンプ画像 | 修正ファイル | 修正内容 | 状態 |
|---|--------|-----------|-----------|-------------|---------|------|
| 1 | （ページ名） | （セクション名） | （対応するカンプ画像パス） | （修正対象.tsx） | （差分内容） | 未着手 |
| ... | ... | ... | ... | ... | ... | ... |

### 作業ルール
1. **必ず1セクションずつ**作業する（複数同時に変更しない）
2. 修正前に**カンプ画像を読み込んで確認**する
3. 修正後に**実装とカンプを見比べて確認**する
4. 確認完了したら上の表の「状態」を「完了」に更新
5. 次のセクションに進む
\\\`\\\`\\\`
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

---

## 📝 修正後: HANDOFF.md 更新

修正完了後、\\\`HANDOFF.md\\\` の該当セクションの「状態」を「完了」に更新してください。

未完了の修正がある場合は、次セッションへの引き継ぎ情報を記載してください。
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
  // 企業シート一覧を取得（jsonOutputDialog.jsの関数を使用）
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(getPlaceholderUpdateDialogHtml(sheetData))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, 'プレースホルダー更新 + SEO/LLMO');
}

function getPlaceholderUpdateDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

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
    .company-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      background: white;
    }
    .company-select:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .option-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .option-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
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
    .prompt-output {
      width: 100%;
      height: 280px;
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
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
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
    .btn-secondary:disabled {
      background: #eee;
      color: #999;
      cursor: not-allowed;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .status {
      margin-top: 12px;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      display: none;
    }
    .status.success {
      background: #e8f5e9;
      color: #2e7d32;
      display: block;
    }
    .status.error {
      background: #ffebee;
      color: #c62828;
      display: block;
    }
    .status.loading {
      background: #fff3e0;
      color: #e65100;
      display: block;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📝 プレースホルダー更新 + SEO/LLMO</h4>
    <p>ヒアリングシートから最新のJSONデータを取得し、プレースホルダーを実データに置換します。
    同時にSEO・LLMO対策も実施できます。</p>
  </div>

  <!-- 企業シート選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <select class="company-select" id="companySelect" onchange="onCompanySelect()">
      <option value="">-- 企業シートを選択 --</option>
    </select>
  </div>

  <!-- オプション選択 -->
  <div class="option-section">
    <h4>🎯 実行内容（複数選択可）</h4>
    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="optPlaceholder" value="placeholder" checked>
        <label for="optPlaceholder">📝 プレースホルダー更新（aaaa → 実データ）</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="optSeo" value="seo" checked>
        <label for="optSeo">🔍 SEO対策（metadata, robots.txt, sitemap等）</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="optLlmo" value="llmo" checked>
        <label for="optLlmo">🤖 LLMO対策（JSON-LD構造化データ）</label>
      </div>
    </div>
  </div>

  <!-- プロンプト出力 -->
  <div class="input-section">
    <span class="input-label">生成されたプロンプト</span>
    <textarea class="prompt-output" id="promptOutput" readonly placeholder="企業を選択して「生成」をクリック"></textarea>
  </div>

  <!-- ステータス表示 -->
  <div class="status" id="status"></div>

  <!-- ボタン -->
  <div class="btn-group">
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <button class="btn-secondary" id="copyBtn" onclick="copyPrompt()" disabled>📋 コピー</button>
    <button class="btn-primary" id="generateBtn" onclick="generatePrompt()" disabled>生成（JSON取得 + 保存）</button>
  </div>

  <script>
    const sheetData = ${sheetDataJson};
    let selectedSheetName = '';
    let currentJsonData = null;

    window.onload = function() {
      const select = document.getElementById('companySelect');

      sheetData.companySheets.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet.sheetName;
        option.textContent = sheet.companyName + (sheet.isActive ? ' (現在のシート)' : '');
        if (sheet.isActive) {
          option.selected = true;
          selectedSheetName = sheet.sheetName;
        }
        select.appendChild(option);
      });

      updateButtonState();
    };

    function onCompanySelect() {
      selectedSheetName = document.getElementById('companySelect').value;
      updateButtonState();
    }

    function updateButtonState() {
      document.getElementById('generateBtn').disabled = !selectedSheetName;
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function generatePrompt() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      const optPlaceholder = document.getElementById('optPlaceholder').checked;
      const optSeo = document.getElementById('optSeo').checked;
      const optLlmo = document.getElementById('optLlmo').checked;

      if (!optPlaceholder && !optSeo && !optLlmo) {
        showStatus('実行内容を1つ以上選択してください', 'error');
        return;
      }

      document.getElementById('generateBtn').disabled = true;
      document.getElementById('promptOutput').value = '⏳ JSONデータを取得中...';
      showStatus('ヒアリングシートからJSONを取得・保存しています...', 'loading');

      // GASのhp_extractAndSaveJsonData関数を呼び出し
      google.script.run
        .withSuccessHandler(handleJsonResult)
        .withFailureHandler(handleError)
        .hp_extractAndSaveJsonData(selectedSheetName);
    }

    function handleJsonResult(result) {
      document.getElementById('generateBtn').disabled = false;

      if (!result.success) {
        document.getElementById('promptOutput').value = '';
        showStatus('エラー: ' + result.error, 'error');
        return;
      }

      currentJsonData = result.data;
      const jsonStr = JSON.stringify(result.data, null, 2);

      const optPlaceholder = document.getElementById('optPlaceholder').checked;
      const optSeo = document.getElementById('optSeo').checked;
      const optLlmo = document.getElementById('optLlmo').checked;

      const prompt = buildUpdatePrompt(jsonStr, optPlaceholder, optSeo, optLlmo);
      document.getElementById('promptOutput').value = prompt;
      document.getElementById('copyBtn').disabled = false;

      if (result.saved) {
        showStatus('✅ JSON取得完了・シートに保存しました（企業: ' + result.companyName + '）', 'success');
      } else {
        showStatus('✅ JSON取得完了（保存: ' + (result.saveError || '失敗') + '）', 'success');
      }
    }

    function handleError(error) {
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('promptOutput').value = '';
      showStatus('エラー: ' + error.message, 'error');
    }

    function buildUpdatePrompt(jsonStr, optPlaceholder, optSeo, optLlmo) {
      const tasks = [];
      if (optPlaceholder) tasks.push('プレースホルダー更新');
      if (optSeo) tasks.push('SEO対策');
      if (optLlmo) tasks.push('LLMO対策');

      let prompt = \`# HP更新指示（\${tasks.join(' + ')}）

## 企業データ（ヒアリングシートから抽出）

\\\`\\\`\\\`json
\${jsonStr}
\\\`\\\`\\\`

---

## 実行内容

\`;

      if (optPlaceholder) {
        prompt += \`### 1. プレースホルダー更新

上記JSONデータを使用して、コード内のプレースホルダーを実データに置換してください。

**対象パターン:**
- \\\`aaaa\\\`, \\\`xxxx\\\`, \\\`〇〇〇\\\` → 該当する実データ
- \\\`000-0000-0000\\\`, \\\`00-0000-0000\\\` → 電話番号
- \\\`000-0000\\\` → 郵便番号
- \\\`sample@example.com\\\` → メールアドレス

**厳守事項:**
- レイアウト・色・フォント等は一切変更しない
- JSONにないデータは置換しない（プレースホルダーのまま残す）

\`;
      }

      if (optSeo) {
        prompt += \`### \${optPlaceholder ? '2' : '1'}. SEO対策

\\\`SEO_LLMO_GUIDE.md\\\` を参照して、以下を実施してください：

- [ ] \\\`robots.txt\\\` 作成（public/robots.txt）
- [ ] \\\`sitemap.ts\\\` 作成（app/sitemap.ts）
- [ ] 全ページに \\\`metadata\\\` 設定（title, description）
- [ ] 見出し構造の最適化（h1 > h2 > h3）
- [ ] 画像の \\\`alt\\\` 属性設定

**metadataの設定例:**
\\\`\\\`\\\`typescript
export const metadata: Metadata = {
  title: '企業名 | ページタイトル',
  description: 'ページの説明文（120文字程度）',
};
\\\`\\\`\\\`

\`;
      }

      if (optLlmo) {
        prompt += \`### \${optPlaceholder && optSeo ? '3' : optPlaceholder || optSeo ? '2' : '1'}. LLMO対策（構造化データ）

\\\`SEO_LLMO_GUIDE.md\\\` を参照して、JSON-LD構造化データを設置してください。

**必須スキーマ:**
- \\\`Organization\\\` - 会社情報（TOPページ）
- \\\`LocalBusiness\\\` - 店舗・事業所情報（該当する場合）
- \\\`BreadcrumbList\\\` - パンくずリスト（全ページ）
- \\\`FAQPage\\\` - よくある質問（該当ページ）

**設置方法:**
\\\`\\\`\\\`typescript
// app/layout.tsx または各ページ
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
\\\`\\\`\\\`

\`;
      }

      prompt += \`---

## 参照ファイル

| ファイル | 用途 |
|---------|------|
| SEO_LLMO_GUIDE.md | SEO・LLMO実装ガイド |
| data/hearing.json | ヒアリング抽出データ（参考） |

---

## 完了後の確認

- [ ] プレースホルダーが実データに置換されている
- [ ] ビルドエラーがない（\\\`npm run build\\\`）
- [ ] 型エラーがない（\\\`npx tsc --noEmit\\\`）
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

// ===== 素材反映ダイアログ =====
function hp_showAssetReflectionDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(getAssetReflectionDialogHtml(sheetData))
    .setWidth(750)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '📷 素材反映');
}

function getAssetReflectionDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

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
    .step-box {
      background: #fff3e0;
      border: 1px solid #ffcc80;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .step-box h4 {
      margin: 0 0 8px 0;
      color: #e65100;
      font-size: 13px;
    }
    .step-box ol {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
    }
    .company-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      background: white;
    }
    .company-select:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .json-input {
      width: 100%;
      height: 180px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
    }
    .json-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
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
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
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
    .btn-secondary:disabled {
      background: #eee;
      color: #999;
      cursor: not-allowed;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .status {
      margin-top: 12px;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      display: none;
    }
    .status.success {
      background: #e8f5e9;
      color: #2e7d32;
      display: block;
    }
    .status.error {
      background: #ffebee;
      color: #c62828;
      display: block;
    }
    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    .preview-table th, .preview-table td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      text-align: left;
    }
    .preview-table th {
      background: #f5f5f5;
    }
    .preview-section {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      max-height: 150px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📷 素材反映</h4>
    <p>撮影・選定した素材をプロジェクトに配置するためのプロンプトを生成します。</p>
  </div>

  <!-- ワークフロー -->
  <div class="step-box">
    <h4>📋 ワークフロー</h4>
    <ol>
      <li>HANDOFFから「必要素材リスト」JSONをコピー</li>
      <li>ダウンロードした素材フォルダのパスを入力</li>
      <li>「生成」をクリック</li>
      <li>生成されたプロンプトをClaude Codeに貼り付け</li>
    </ol>
  </div>

  <!-- 企業シート選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <select class="company-select" id="companySelect" onchange="onCompanySelect()">
      <option value="">-- 企業シートを選択 --</option>
    </select>
  </div>

  <!-- 必要素材JSON入力 -->
  <div class="input-section">
    <span class="input-label">必要素材リストJSON（HANDOFFからコピペ）</span>
    <textarea
      class="json-input"
      id="assetJsonInput"
      placeholder='{
  "company": "企業名",
  "totalAssets": 12,
  "assets": [
    {
      "id": 1,
      "fileName": "hero.jpg",
      "destPath": "public/images/",
      "page": "TOP",
      "usage": "ヒーロー背景",
      ...
    }
  ]
}'
      oninput="parseAndPreview()"
    ></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section" id="previewSection" style="display:none;">
    <strong>📋 素材一覧プレビュー</strong>
    <table class="preview-table" id="previewTable">
      <thead>
        <tr>
          <th>#</th>
          <th>ファイル名</th>
          <th>ページ</th>
          <th>用途</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <!-- ダウンロードパス入力 -->
  <div class="input-section">
    <span class="input-label">ダウンロードした素材フォルダのパス</span>
    <input
      type="text"
      class="path-input"
      id="assetFolderPath"
      placeholder="例: C:\\\\Users\\\\tench\\\\Downloads\\\\本番素材"
      oninput="checkInputs()"
    >
    <div class="note">※ 本番素材がダウンロードされているフォルダのパスを入力</div>
  </div>

  <!-- プロンプト出力 -->
  <div class="input-section">
    <span class="input-label">生成されたプロンプト</span>
    <textarea class="prompt-output" id="promptOutput" readonly placeholder="入力を完了して「生成」をクリック"></textarea>
  </div>

  <!-- ステータス表示 -->
  <div class="status" id="status"></div>

  <!-- ボタン -->
  <div class="btn-group">
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <button class="btn-secondary" id="copyBtn" onclick="copyAssetPrompt()" disabled>📋 コピー</button>
    <button class="btn-primary" id="generateBtn" onclick="generateAssetPrompt()" disabled>生成</button>
  </div>

  <script>
    const sheetData = ` + sheetDataJson + `;
    let selectedSheetName = '';
    let parsedAssets = null;

    window.onload = function() {
      const select = document.getElementById('companySelect');

      sheetData.companySheets.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet.sheetName;
        option.textContent = sheet.companyName + (sheet.isActive ? ' (現在のシート)' : '');
        if (sheet.isActive) {
          option.selected = true;
          selectedSheetName = sheet.sheetName;
        }
        select.appendChild(option);
      });

      checkInputs();
    };

    function onCompanySelect() {
      selectedSheetName = document.getElementById('companySelect').value;
      checkInputs();
    }

    function parseAndPreview() {
      const jsonInput = document.getElementById('assetJsonInput').value.trim();
      const previewSection = document.getElementById('previewSection');
      const previewBody = document.getElementById('previewTable').querySelector('tbody');

      if (!jsonInput) {
        previewSection.style.display = 'none';
        parsedAssets = null;
        checkInputs();
        return;
      }

      try {
        const data = JSON.parse(jsonInput);
        if (!data.assets || !Array.isArray(data.assets)) {
          throw new Error('assets配列がありません');
        }

        parsedAssets = data;
        previewSection.style.display = 'block';

        // テーブル更新
        previewBody.innerHTML = '';
        data.assets.slice(0, 10).forEach(asset => {
          const row = document.createElement('tr');
          row.innerHTML = '<td>' + asset.id + '</td>' +
            '<td>' + escapeHtml(asset.fileName) + '</td>' +
            '<td>' + escapeHtml(asset.page || '-') + '</td>' +
            '<td>' + escapeHtml(asset.usage || '-') + '</td>';
          previewBody.appendChild(row);
        });

        if (data.assets.length > 10) {
          const row = document.createElement('tr');
          row.innerHTML = '<td colspan="4" style="text-align:center;color:#666;">... 他 ' + (data.assets.length - 10) + ' 件</td>';
          previewBody.appendChild(row);
        }

        showAssetStatus('✅ JSONパース成功（' + data.assets.length + '件の素材）', 'success');
      } catch (e) {
        previewSection.style.display = 'none';
        parsedAssets = null;
        showAssetStatus('❌ JSONパースエラー: ' + e.message, 'error');
      }

      checkInputs();
    }

    function checkInputs() {
      const hasCompany = !!selectedSheetName;
      const hasAssets = !!parsedAssets;
      const hasPath = !!document.getElementById('assetFolderPath').value.trim();

      document.getElementById('generateBtn').disabled = !(hasCompany && hasAssets && hasPath);
    }

    function generateAssetPrompt() {
      if (!parsedAssets) {
        showAssetStatus('必要素材リストJSONを入力してください', 'error');
        return;
      }

      const folderPath = document.getElementById('assetFolderPath').value.trim();
      if (!folderPath) {
        showAssetStatus('素材フォルダのパスを入力してください', 'error');
        return;
      }

      const prompt = buildAssetReflectionPrompt(parsedAssets, folderPath);
      document.getElementById('promptOutput').value = prompt;
      document.getElementById('copyBtn').disabled = false;

      showAssetStatus('✅ プロンプト生成完了', 'success');
    }

    function buildAssetReflectionPrompt(data, folderPath) {
      // 配置指示テーブルを生成
      let tableRows = '';
      data.assets.forEach(asset => {
        tableRows += '| ' + asset.id + ' | ' + asset.fileName + ' | ' + asset.destPath + asset.fileName + ' | ' + (asset.usage || '-') + ' |\\n';
      });

      return '# 素材反映指示\\n\\n' +
        '## 素材フォルダ\\n' + folderPath + '\\n\\n' +
        '## 配置指示\\n\\n' +
        '| # | ファイル名 | 配置先 | 用途 |\\n' +
        '|---|-----------|--------|------|\\n' +
        tableRows + '\\n' +
        '## 作業内容\\n\\n' +
        '1. 上記素材フォルダを読み込む\\n' +
        '2. 各ファイルを配置先にコピー\\n' +
        '3. コード内のプレースホルダー参照を実ファイル参照に更新\\n' +
        '4. 画像が正しく表示されることを確認\\n' +
        '## 厳守事項\\n\\n' +
        '- レイアウト・色・フォント等は一切変更しない\\n' +
        '- 画像の配置のみを行う\\n' +
        '- 不足している画像がある場合は報告する\\n' +
        '- 画像サイズが大きすぎる場合は適切にリサイズ（幅1920px以下推奨）\\n\\n' +
        '## 完了後\\n\\n' +
        '- [ ] 全ての画像が正しく表示される\\n' +
        '- [ ] HANDOFF.md の「素材配置」を「完了」に更新\\n';
    }

    function copyAssetPrompt() {
      const output = document.getElementById('promptOutput');
      output.select();
      document.execCommand('copy');

      const copySuccess = document.getElementById('copySuccess');
      copySuccess.classList.add('show');
      setTimeout(() => copySuccess.classList.remove('show'), 2000);
    }

    function showAssetStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>
`;
}

// ===== 素材チェックダイアログ =====
function hp_showAssetCheckDialog() {
  const sheetData = hp_getCompanySheetListForAssetCheck();

  const html = HtmlService.createHtmlOutput(getAssetCheckDialogHtml(sheetData))
    .setWidth(700)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '✅ 素材チェック実行');
}

/**
 * 素材チェック用の企業シート一覧を取得
 */
function hp_getCompanySheetListForAssetCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (!hp_isExcludedSheet(name)) {
      let companyName = '';
      try {
        companyName = sheet.getRange(5, 2).getValue() || name;
      } catch (e) {
        companyName = name;
      }

      // Part④から必要なURLを取得
      let productionFolderUrl = '';
      let shootingGuideUrl = '';
      const lastRow = sheet.getLastRow();
      for (let row = 1; row <= lastRow; row++) {
        const label = sheet.getRange(row, 1).getValue();
        if (label === '本番素材フォルダURL') {
          productionFolderUrl = sheet.getRange(row, 2).getValue() || '';
        }
        if (label === '撮影指示書URL') {
          shootingGuideUrl = sheet.getRange(row, 2).getValue() || '';
        }
      }

      // すべての企業をリストに追加（データがない場合はUIで警告を表示）
      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        isActive: name === activeSheetName,
        productionFolderUrl: productionFolderUrl,
        shootingGuideUrl: shootingGuideUrl,
        hasRequiredData: !!productionFolderUrl && !!shootingGuideUrl
      });
    }
  }

  return result;
}

function getAssetCheckDialogHtml(sheetList) {
  const sheetListJson = JSON.stringify(sheetList);

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
    .company-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      background: white;
    }
    .result-section {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .result-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .result-item:last-child {
      border-bottom: none;
    }
    .result-ok { color: #2E7D32; }
    .result-ng { color: #C62828; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      margin-top: 16px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #4CAF50;
      width: 0%;
      transition: width 0.3s;
    }
    .summary-box {
      display: flex;
      gap: 20px;
      margin-top: 16px;
    }
    .summary-item {
      flex: 1;
      text-align: center;
      padding: 16px;
      border-radius: 8px;
    }
    .summary-ok {
      background: #E8F5E9;
      color: #2E7D32;
    }
    .summary-ng {
      background: #FFEBEE;
      color: #C62828;
    }
    .summary-number {
      font-size: 32px;
      font-weight: bold;
    }
    .summary-label {
      font-size: 12px;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📋 機能説明</h4>
    <p>本番素材フォルダをスキャンし、撮影指示書に記載されたファイルが存在するかチェックします。<br>
    存在するファイルは撮影指示書の「素材URL」列に自動転記されます。</p>
  </div>

  <!-- 企業選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <select class="company-select" id="companySelect" onchange="onCompanySelect()">
      <option value="">-- 企業を選択 --</option>
    </select>
  </div>

  <!-- 選択した企業の情報 -->
  <div id="companyInfo" style="display:none; margin-top:16px;">
    <div style="background:#f9f9f9; padding:12px; border-radius:6px;">
      <p style="margin:0 0 8px 0; font-size:13px;">📁 本番素材フォルダ: <a id="productionLink" href="#" target="_blank">開く</a></p>
      <p style="margin:0; font-size:13px;">📋 撮影指示書: <a id="guideLink" href="#" target="_blank">開く</a></p>
    </div>
  </div>

  <!-- 進捗 -->
  <div id="progressSection" style="display:none;">
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <p id="progressText" style="text-align:center; margin-top:8px; font-size:13px; color:#666;">チェック中...</p>
  </div>

  <!-- 結果サマリー -->
  <div id="resultSection" style="display:none;">
    <div class="summary-box">
      <div class="summary-item summary-ok">
        <div class="summary-number" id="okCount">0</div>
        <div class="summary-label">✅ 配置済み</div>
      </div>
      <div class="summary-item summary-ng">
        <div class="summary-number" id="ngCount">0</div>
        <div class="summary-label">❌ 未配置</div>
      </div>
    </div>
  </div>

  <!-- ステータス表示 -->
  <div class="status" id="status"></div>

  <!-- ボタン -->
  <div class="btn-group" style="margin-top:20px;">
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <button class="btn-primary" id="checkBtn" onclick="executeAssetCheck()" disabled>✅ チェック実行</button>
  </div>

  <script>
    const sheetList = ${sheetListJson};
    let selectedSheet = null;

    window.onload = function() {
      const select = document.getElementById('companySelect');

      sheetList.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet.sheetName;
        option.textContent = sheet.companyName + (sheet.isActive ? ' (現在のシート)' : '');
        if (sheet.isActive) {
          option.selected = true;
          selectedSheet = sheet;
          showCompanyInfo(sheet);
        }
        select.appendChild(option);
      });

      checkInputs();
    };

    function onCompanySelect() {
      const sheetName = document.getElementById('companySelect').value;
      selectedSheet = sheetList.find(s => s.sheetName === sheetName);

      if (selectedSheet) {
        showCompanyInfo(selectedSheet);
      } else {
        document.getElementById('companyInfo').style.display = 'none';
      }

      // 結果をリセット
      document.getElementById('resultSection').style.display = 'none';
      document.getElementById('progressSection').style.display = 'none';

      checkInputs();
    }

    function showCompanyInfo(sheet) {
      document.getElementById('companyInfo').style.display = 'block';
      document.getElementById('productionLink').href = sheet.productionFolderUrl || '#';
      document.getElementById('guideLink').href = sheet.shootingGuideUrl || '#';

      if (!sheet.hasRequiredData) {
        showStatus('⚠️ この企業には本番素材フォルダまたは撮影指示書が設定されていません', 'warning');
      } else {
        document.getElementById('status').textContent = '';
      }
    }

    function checkInputs() {
      const btn = document.getElementById('checkBtn');
      btn.disabled = !selectedSheet || !selectedSheet.hasRequiredData;
    }

    function executeAssetCheck() {
      if (!selectedSheet || !selectedSheet.hasRequiredData) {
        showStatus('企業を選択してください', 'error');
        return;
      }

      document.getElementById('checkBtn').disabled = true;
      document.getElementById('progressSection').style.display = 'block';
      document.getElementById('resultSection').style.display = 'none';
      document.getElementById('progressFill').style.width = '30%';
      document.getElementById('progressText').textContent = '本番素材フォルダをスキャン中...';

      google.script.run
        .withSuccessHandler(handleCheckResult)
        .withFailureHandler(handleCheckError)
        .hp_executeAssetCheck(selectedSheet.sheetName, selectedSheet.productionFolderUrl, selectedSheet.shootingGuideUrl);
    }

    function handleCheckResult(result) {
      document.getElementById('progressFill').style.width = '100%';

      if (result.success) {
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('okCount').textContent = result.okCount;
        document.getElementById('ngCount').textContent = result.ngCount;

        if (result.ngCount === 0) {
          showStatus('✅ すべての素材が配置されています！', 'success');
        } else {
          showStatus('⚠️ ' + result.ngCount + '件の素材が未配置です。撮影指示書を確認してください。', 'warning');
        }
      } else {
        showStatus('❌ ' + result.error, 'error');
        document.getElementById('progressSection').style.display = 'none';
      }

      document.getElementById('checkBtn').disabled = false;
    }

    function handleCheckError(error) {
      document.getElementById('progressSection').style.display = 'none';
      showStatus('❌ エラー: ' + error.message, 'error');
      document.getElementById('checkBtn').disabled = false;
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

/**
 * 素材チェック実行
 * @param {string} sheetName - シート名
 * @param {string} productionFolderUrl - 本番素材フォルダURL
 * @param {string} shootingGuideUrl - 撮影指示書URL
 */
function hp_executeAssetCheck(sheetName, productionFolderUrl, shootingGuideUrl) {
  try {
    // 1. 本番素材フォルダIDを取得
    const folderMatch = productionFolderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (!folderMatch) {
      throw new Error('本番素材フォルダURLが無効です');
    }
    const productionFolderId = folderMatch[1];

    // 2. 撮影指示書スプレッドシートIDを取得
    const ssMatch = shootingGuideUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!ssMatch) {
      throw new Error('撮影指示書URLが無効です');
    }
    const guideSpreadsheetId = ssMatch[1];

    // 3. 本番素材フォルダ内のファイル一覧を取得
    const productionFolder = DriveApp.getFolderById(productionFolderId);
    const files = productionFolder.getFiles();
    const fileMap = {};
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      fileMap[fileName] = {
        url: file.getUrl(),
        id: file.getId()
      };
    }

    // 4. 撮影指示書スプレッドシートを開く
    const guideSs = SpreadsheetApp.openById(guideSpreadsheetId);
    const listSheet = guideSs.getSheetByName('素材リスト');
    if (!listSheet) {
      throw new Error('撮影指示書に「素材リスト」シートが見つかりません');
    }

    // 5. 素材リストをチェックして更新
    const lastRow = listSheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, okCount: 0, ngCount: 0 };
    }

    let okCount = 0;
    let ngCount = 0;

    // ファイル名は3列目、素材URLは10列目
    for (let row = 2; row <= lastRow; row++) {
      const fileName = listSheet.getRange(row, 3).getValue();
      if (!fileName) continue;

      if (fileMap[fileName]) {
        // ファイルが存在 → URLを転記
        listSheet.getRange(row, 10).setValue(fileMap[fileName].url);
        okCount++;
      } else {
        // ファイルが存在しない
        listSheet.getRange(row, 10).setValue('');
        ngCount++;
      }
    }

    return {
      success: true,
      okCount: okCount,
      ngCount: ngCount
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
