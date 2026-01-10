/**
 * プロンプトダイアログ機能
 *
 * 【概要】
 * スプレッドシートの「プロンプト」シートからテンプレートを読み込み、
 * 入力フィールド付きのダイアログを表示する。
 *
 * 【シート構造】
 * A列: プロンプト名（メニューに表示）
 * B列: 説明（ダイアログのサブタイトル）
 * C列: 入力欄のラベル
 * D列: 入力欄のプレースホルダー
 * E列: テンプレート（{{input}}が入力値に置換される）
 *
 * 【統合方法】
 * 既存のonOpen()に以下を追加:
 *   createPromptMenu(ui);
 *
 * 【使い方】
 * 1. 「プロンプト」シートを作成し、上記構造でデータを入力
 * 2. メニュー「📝 プロンプト」から使いたいプロンプトを選択
 * 3. ダイアログで入力 → プレビュー確認 → コピー
 */

// ==================== メニュー ====================

/**
 * プロンプトメニューを作成（既存のonOpenから呼び出し用）
 * @param {GoogleAppsScript.Base.Ui} ui - SpreadsheetApp.getUi()の結果
 */
function createPromptMenu(ui) {
  const menu = ui.createMenu('３.📝 議事録作成・報告プロンプト');

  // プロンプトシートからメニュー項目を動的に生成
  const prompts = getPromptList();

  if (prompts.length === 0) {
    menu.addItem('（プロンプトシートを作成してください）', 'showPromptSetupInstructions');
  } else {
    prompts.forEach((prompt, index) => {
      menu.addItem(prompt.name, `openPromptDialog_${index}`);
    });
    menu.addSeparator();
  }

  menu.addItem('📄 プロンプトシートを作成', 'createPromptSheet');
  menu.addItem('🔄 サンプルプロンプトを追加', 'addSamplePrompts');
  menu.addItem('❓ 使い方', 'showPromptUsage');

  menu.addToUi();
}

/**
 * プロンプト一覧を取得
 */
function getPromptList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const prompts = [];

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[4]) {  // 名前とテンプレートが必須
      prompts.push({
        index: i - 1,
        name: row[0],
        description: row[1] || '',
        inputLabel: row[2] || 'ここに入力',
        inputPlaceholder: row[3] || '',
        template: row[4]
      });
    }
  }

  return prompts;
}

/**
 * 指定インデックスのプロンプトを取得
 */
function getPromptByIndex(index) {
  const prompts = getPromptList();
  return prompts[index] || null;
}

// ==================== 動的関数生成 ====================

// メニューから呼び出される関数を動的に生成（最大20個）
for (let i = 0; i < 20; i++) {
  this[`openPromptDialog_${i}`] = (function(idx) {
    return function() {
      openPromptDialogByIndex(idx);
    };
  })(i);
}

/**
 * インデックスを指定してダイアログを開く
 */
function openPromptDialogByIndex(index) {
  const prompt = getPromptByIndex(index);
  if (!prompt) {
    SpreadsheetApp.getUi().alert('プロンプトが見つかりません');
    return;
  }
  showPromptDialog(prompt);
}

// ==================== ダイアログ ====================

/**
 * プロンプトダイアログを表示
 */
function showPromptDialog(prompt) {
  const html = HtmlService.createHtmlOutput(getPromptDialogHtml(prompt))
    .setWidth(700)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, prompt.name);
}

/**
 * ダイアログのHTMLを生成
 */
function getPromptDialogHtml(prompt) {
  // テンプレート内の特殊文字をエスケープ
  const escapedTemplate = prompt.template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      margin: 0;
      padding: 16px;
      background: #f8f9fa;
    }

    .description {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
    }

    /* アコーディオン */
    .accordion {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
    }

    .accordion-header:hover {
      background: #f5f5f5;
    }

    .accordion-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #333;
    }

    .accordion-arrow {
      transition: transform 0.2s;
    }

    .accordion-arrow.open {
      transform: rotate(90deg);
    }

    .accordion-content {
      display: none;
      padding: 0 16px 16px;
      border-top: 1px solid #eee;
    }

    .accordion-content.open {
      display: block;
    }

    .template-text {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 12px;
    }

    /* ボタン */
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-blue {
      background: #3b82f6;
      color: white;
    }

    .btn-blue:hover {
      background: #2563eb;
    }

    .btn-green {
      background: #22c55e;
      color: white;
    }

    .btn-green:hover {
      background: #16a34a;
    }

    .btn-gray {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-gray:hover {
      background: #d1d5db;
    }

    /* 入力エリア */
    .input-section {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .input-label {
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
      display: block;
    }

    .input-textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
    }

    .input-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* プレビュー */
    .preview-section {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .preview-title {
      font-weight: 500;
      color: #333;
    }

    .preview-content {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 12px;
      font-size: 13px;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      color: #333;
    }

    .preview-placeholder {
      color: #999;
      font-style: italic;
    }

    /* コピー成功メッセージ */
    .copy-success {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #22c55e;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    }

    .copy-success.show {
      opacity: 1;
    }

    /* フッター */
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  ${prompt.description ? `<div class="description">${escapeHtmlForPrompt(prompt.description)}</div>` : ''}

  <!-- テンプレート表示（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">
        テンプレートをコピー
      </button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText"></div>
    </div>
  </div>

  <!-- 入力エリア -->
  <div class="input-section">
    <label class="input-label">${escapeHtmlForPrompt(prompt.inputLabel)}</label>
    <textarea
      class="input-textarea"
      id="inputText"
      placeholder="${escapeHtmlForPrompt(prompt.inputPlaceholder)}"
      oninput="updatePreview()"
    ></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー</span>
      <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" disabled>
        完成版をコピー
      </button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <script>
    // テンプレート（GASから渡される）
    const template = \`${escapedTemplate}\`;

    // 初期化
    document.getElementById('templateText').textContent = template;

    // アコーディオン開閉
    function toggleAccordion() {
      const content = document.getElementById('accordionContent');
      const arrow = document.getElementById('arrow');
      content.classList.toggle('open');
      arrow.classList.toggle('open');
    }

    // プレビュー更新
    function updatePreview() {
      const input = document.getElementById('inputText').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim()) {
        const result = template.replace('{{input}}', input);
        preview.textContent = result;
        preview.classList.remove('preview-placeholder');
        copyBtn.disabled = false;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">上の入力欄にテキストを入力すると、ここにプレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    // テンプレートをコピー
    function copyTemplate() {
      copyToClipboard(template);
    }

    // 完成版をコピー
    function copyResult() {
      const input = document.getElementById('inputText').value;
      const result = template.replace('{{input}}', input);
      copyToClipboard(result);
    }

    // クリップボードにコピー
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess();
      }).catch(err => {
        // フォールバック
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopySuccess();
      });
    }

    // コピー成功メッセージ表示
    function showCopySuccess() {
      const msg = document.getElementById('copySuccess');
      msg.classList.add('show');
      setTimeout(() => {
        msg.classList.remove('show');
      }, 2000);
    }
  </script>
</body>
</html>
  `;
}

/**
 * HTMLエスケープ（プロンプト用）
 */
function escapeHtmlForPrompt(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==================== セットアップ ====================

/**
 * プロンプトシートを作成
 */
function createPromptSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('プロンプト');

  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '確認',
      '「プロンプト」シートは既に存在します。上書きしますか？',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    sheet.clear();
  } else {
    sheet = ss.insertSheet('プロンプト');
  }

  // ヘッダー設定
  const headers = ['プロンプト名', '説明', '入力欄ラベル', '入力欄プレースホルダー', 'テンプレート'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  // 列幅調整
  sheet.setColumnWidth(1, 120);  // プロンプト名
  sheet.setColumnWidth(2, 200);  // 説明
  sheet.setColumnWidth(3, 180);  // 入力欄ラベル
  sheet.setColumnWidth(4, 250);  // プレースホルダー
  sheet.setColumnWidth(5, 500);  // テンプレート

  SpreadsheetApp.getUi().alert(
    '完了',
    '「プロンプト」シートを作成しました。\n\n' +
    '「🔄 サンプルプロンプトを追加」でサンプルを追加できます。\n\n' +
    '※メニューを更新するには、シートを再読み込みしてください。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * サンプルプロンプトを追加
 */
function addSamplePrompts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('プロンプト');

  if (!sheet) {
    SpreadsheetApp.getUi().alert(
      'エラー',
      '「プロンプト」シートがありません。\n先に「📄 プロンプトシートを作成」を実行してください。',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  // 既存データの最終行を取得
  const lastRow = sheet.getLastRow();

  // サンプルデータ
  const sampleData = [
    [
      '議事録作成',
      'NOTTAの文字起こしから議事録を作成',
      'ここに文字起こしテキストを貼り付け',
      'NOTTAでダウンロードした文字起こしテキストをここに貼り付け...',
      `以下の打ち合わせ文字起こしから議事録を作成してください。

【出力フォーマット】
■ 打ち合わせ概要
日時：
参加者：
企業名：

■ ヒアリング内容の要点
【企業・採用状況】
・

【求人原稿の方向性】
・

【動画制作について】
・

■ 決定事項
・撮影日程：
・撮影場所：
・インタビュー対象：
・その他：

■ 次のアクション
・

【注意事項】
・要点を箇条書きで簡潔にまとめる
・企業の発言はそのままのニュアンスを残す
・不明点は「要確認」と記載

━━━━━━━━━━━━━━━━━━━━
【文字起こし】
━━━━━━━━━━━━━━━━━━━━
{{input}}`
    ],
    [
      'ワークス投稿',
      '議事録をワークスに投稿する形式に整形',
      'ここに議事録を貼り付け',
      'AIが出力した議事録をここに貼り付けてください...',
      `@ALL
株式会社○○様 初回打ち合わせの議事録を共有します。

{{input}}

ご確認お願いします。`
    ],
    [
      '構成案作成',
      'ヒアリング情報から求人原稿の構成案を作成',
      'ここにヒアリング情報を貼り付け',
      'ヒアリングシートの内容やメモをここに貼り付け...',
      `以下のヒアリング情報から、求人原稿の構成案を作成してください。

【出力フォーマット】
■ 求人タイトル（キャッチコピー）
・

■ 職務内容
【会社紹介】

【業務内容（Step形式）】
Step1:
Step2:
Step3:

【会社のポイント×3】
①
②
③

■ 求人概要
・職種：
・雇用形態：
・給与：
・勤務地：

■ 応募要件
【必須】
【歓迎】

■ 待遇・福利厚生

■ 勤務時間・休日休暇

■ 掲載画像の候補
①
②
③

■ 原稿の方向性メモ

━━━━━━━━━━━━━━━━━━━━
【ヒアリング情報】
━━━━━━━━━━━━━━━━━━━━
{{input}}`
    ]
  ];

  // データ追加
  sheet.getRange(lastRow + 1, 1, sampleData.length, sampleData[0].length).setValues(sampleData);

  // 折り返し設定
  sheet.getRange(lastRow + 1, 5, sampleData.length, 1).setWrap(true);

  // 行の高さ調整
  for (let i = 0; i < sampleData.length; i++) {
    sheet.setRowHeight(lastRow + 1 + i, 150);
  }

  SpreadsheetApp.getUi().alert(
    '完了',
    `${sampleData.length}件のサンプルプロンプトを追加しました。\n\n` +
    '・議事録作成\n・ワークス投稿\n・構成案作成\n\n' +
    '※メニューを更新するには、シートを再読み込みしてください。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 使い方を表示
 */
function showPromptUsage() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
      h2 { color: #333; border-bottom: 2px solid #4285f4; padding-bottom: 8px; }
      h3 { color: #4285f4; margin-top: 20px; }
      code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
      .note { background: #fff3cd; padding: 12px; border-radius: 8px; margin: 16px 0; }
    </style>
    <h2>📝 プロンプトダイアログの使い方</h2>

    <h3>1. プロンプトシートの構造</h3>
    <p>「プロンプト」シートに以下の列でデータを入力します：</p>
    <ul>
      <li><strong>A列：プロンプト名</strong> - メニューに表示される名前</li>
      <li><strong>B列：説明</strong> - ダイアログ上部に表示（任意）</li>
      <li><strong>C列：入力欄ラベル</strong> - 入力欄の上に表示</li>
      <li><strong>D列：プレースホルダー</strong> - 入力欄のヒント文</li>
      <li><strong>E列：テンプレート</strong> - <code>{{input}}</code>が入力値に置換される</li>
    </ul>

    <h3>2. 使い方</h3>
    <ol>
      <li>メニュー「📝 プロンプト」から使いたいプロンプトを選択</li>
      <li>ダイアログが開く</li>
      <li>入力欄にテキストを貼り付け</li>
      <li>プレビューを確認</li>
      <li>「完成版をコピー」でクリップボードにコピー</li>
      <li>AIやワークスに貼り付け</li>
    </ol>

    <h3>3. プロンプトの追加</h3>
    <p>「プロンプト」シートに行を追加するだけ！</p>
    <p>追加後、シートを再読み込み（F5）するとメニューに反映されます。</p>

    <div class="note">
      <strong>💡 ポイント</strong><br>
      テンプレート内の <code>{{input}}</code> が入力値に置き換わります。<br>
      この文字列は必ず含めてください。
    </div>
  `).setWidth(500).setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, '使い方');
}

/**
 * セットアップ案内を表示
 */
function showPromptSetupInstructions() {
  SpreadsheetApp.getUi().alert(
    'セットアップが必要です',
    '「プロンプト」シートがありません。\n\n' +
    'メニュー「📝 プロンプト」→「📄 プロンプトシートを作成」を実行してください。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
