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
