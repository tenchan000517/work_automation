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

// ==================== 保存キーマッピング ====================
// ※ 設定シートのM列〜N列で管理（settingsSheet.jsのgetSaveKeyForPrompt()で取得）
// ※ 設定シートにない場合はDEFAULT_SAVE_KEY_MAPPING（settingsSheet.js）を使用

// ==================== メニュー ====================

/**
 * プロンプトメニューを作成（既存のonOpenから呼び出し用）
 * @param {GoogleAppsScript.Base.Ui} ui - SpreadsheetApp.getUi()の結果
 */
// このメニューに表示するカテゴリ（プロンプトシートのF列で管理）
const PROMPT_MENU_CATEGORY = '議事録';

function createPromptMenu(ui) {
  const menu = ui.createMenu('４.📝 議事録作成・報告プロンプト');

  // プロンプトシートからメニュー項目を動的に生成（カテゴリでフィルタリング）
  const prompts = getPromptList();
  const filteredPrompts = prompts.filter(p => p.category === PROMPT_MENU_CATEGORY);

  if (filteredPrompts.length === 0) {
    menu.addItem('（プロンプトシートを作成してください）', 'showPromptSetupInstructions');
  } else {
    filteredPrompts.forEach((prompt) => {
      menu.addItem(prompt.name, `openPromptDialog_${prompt.index}`);
    });
    menu.addSeparator();
  }

  // 文字起こし整理・転記（transcriptToHearingSheet.jsから統合）
  menu.addItem('📋 文字起こしを整理（プロンプト生成）', 'showTranscriptPromptDialog');
  menu.addItem('📥 AI出力を転記', 'showTransferFromAIDialog');
  menu.addSeparator();

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
        template: row[4],
        category: row[5] || ''  // F列: カテゴリ
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
 * 保存キーがあるプロンプトは拡張ダイアログを表示
 */
function showPromptDialog(prompt) {
  // 設定シートから保存キー・入力キーを取得（settingsSheet.js）
  const saveKey = getSaveKeyForPrompt(prompt.name);
  const inputKey = getInputKeyForPrompt(prompt.name);

  if (saveKey) {
    // 保存機能付き拡張ダイアログ
    const sheetList = getCompanySheetListForPrompt(saveKey, inputKey);
    const html = HtmlService.createHtmlOutput(getPromptDialogWithSaveHtml(prompt, saveKey, inputKey, sheetList))
      .setWidth(800)
      .setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, prompt.name);
  } else {
    // 通常ダイアログ
    const html = HtmlService.createHtmlOutput(getPromptDialogHtml(prompt))
      .setWidth(700)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, prompt.name);
  }
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
  ${CI_DIALOG_STYLES}
  <style>
    /* promptDialog固有スタイル */
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
        コピー
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
        コピー
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

    // プレビュー更新（固有機能）
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

    // テンプレートをコピー（固有機能）
    function copyTemplate() {
      copyToClipboard(template);
    }

    // 完成版をコピー（固有機能）
    function copyResult() {
      const input = document.getElementById('inputText').value;
      const result = template.replace('{{input}}', input);
      copyToClipboard(result);
    }
  </script>
  ${CI_UI_COMPONENTS}
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

  // ヘッダー設定（F列カテゴリ追加）
  const headers = ['プロンプト名', '説明', '入力欄ラベル', '入力欄プレースホルダー', 'テンプレート', 'カテゴリ'];
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
  sheet.setColumnWidth(6, 100);  // カテゴリ

  SpreadsheetApp.getUi().alert(
    '完了',
    '「プロンプト」シートを作成しました。\n\n' +
    '・F列「カテゴリ」でメニューへの表示を制御できます\n' +
    '・例: カテゴリ=「議事録」→ 議事録メニューに表示\n\n' +
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

  // サンプルデータ（F列にカテゴリを追加）
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
{{input}}`,
      '議事録'  // カテゴリ
    ],
    [
      'ワークス投稿',
      '議事録をワークスに投稿する形式に整形',
      'ここに議事録を貼り付け',
      'AIが出力した議事録をここに貼り付けてください...',
      `@ALL
株式会社○○様 初回打ち合わせの議事録を共有します。

{{input}}

ご確認お願いします。`,
      '議事録'  // カテゴリ
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
{{input}}`,
      '構成案'  // カテゴリ
    ]
  ];

  // データ追加（6列）
  sheet.getRange(lastRow + 1, 1, sampleData.length, 6).setValues(sampleData);

  // 折り返し設定
  sheet.getRange(lastRow + 1, 5, sampleData.length, 1).setWrap(true);

  // 行の高さ調整
  for (let i = 0; i < sampleData.length; i++) {
    sheet.setRowHeight(lastRow + 1 + i, 150);
  }

  SpreadsheetApp.getUi().alert(
    '完了',
    `${sampleData.length}件のサンプルプロンプトを追加しました。\n\n` +
    '・議事録作成（カテゴリ: 議事録）\n・ワークス投稿（カテゴリ: 議事録）\n・構成案作成（カテゴリ: 構成案）\n\n' +
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
      <li><strong>F列：カテゴリ</strong> - メニューでのフィルタリング用</li>
    </ul>

    <h3>2. カテゴリについて</h3>
    <p>F列「カテゴリ」でどのメニューに表示するか制御できます：</p>
    <ul>
      <li><code>議事録</code> → 「４.📝 議事録作成・報告プロンプト」メニューに表示</li>
      <li><code>構成案</code> → 構成案メニューに表示（将来対応）</li>
    </ul>

    <h3>3. 使い方</h3>
    <ol>
      <li>メニュー「📝 プロンプト」から使いたいプロンプトを選択</li>
      <li>ダイアログが開く</li>
      <li>入力欄にテキストを貼り付け</li>
      <li>プレビューを確認</li>
      <li>「完成版をコピー」でクリップボードにコピー</li>
      <li>AIやワークスに貼り付け</li>
    </ol>

    <h3>4. プロンプトの追加</h3>
    <p>「プロンプト」シートに行を追加するだけ！</p>
    <p>追加後、シートを再読み込み（F5）するとメニューに反映されます。</p>

    <div class="note">
      <strong>💡 ポイント</strong><br>
      テンプレート内の <code>{{input}}</code> が入力値に置き換わります。<br>
      この文字列は必ず含めてください。
    </div>
  `).setWidth(500).setHeight(550);

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

// ==================== 保存機能付きダイアログ ====================

/**
 * 企業シート一覧を取得（保存済みデータ付き）
 * @param {string} saveKey - 保存キー（Part③のキー）
 * @param {string} inputKey - 入力キー（Part③のキー、オプション）
 */
function getCompanySheetListForPrompt(saveKey, inputKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(5, 3).getValue() || '').trim();

      // Part③から保存済みデータを取得（saveKey）
      let savedData = '';
      try {
        const result = loadPart3Data(sheetName, saveKey);
        if (result.success) {
          savedData = result.value;
        }
      } catch (e) {
        savedData = '';
      }

      // Part③から入力データを取得（inputKey）
      let inputData = '';
      if (inputKey) {
        try {
          const result = loadPart3Data(sheetName, inputKey);
          if (result.success) {
            inputData = result.value;
          }
        } catch (e) {
          inputData = '';
        }
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedData: savedData,
        hasSavedData: !!savedData,
        inputData: inputData,
        hasInputData: !!inputData,
        isActive: sheetName === activeSheetName
      });
    }
  });

  return companySheets;
}

/**
 * 保存機能付きダイアログのHTML生成
 * @param {Object} prompt - プロンプト情報
 * @param {string} saveKey - 保存キー（Part③のキー）
 * @param {string} inputKey - 入力キー（Part③のキー、オプション）
 * @param {Object[]} sheetList - 企業シート一覧
 */
function getPromptDialogWithSaveHtml(prompt, saveKey, inputKey, sheetList) {
  // テンプレート内の特殊文字をエスケープ
  const escapedTemplate = prompt.template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sheetListJson = JSON.stringify(sheetList);
  // inputKeyがあれば入力欄はinputKeyで保存、なければsaveKeyで保存
  const inputSaveKeyJson = JSON.stringify(inputKey || saveKey);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* promptDialog固有スタイル */
    .input-textarea {
      width: 100%;
      height: 140px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      resize: vertical;
      font-family: monospace;
    }
    .input-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .badge-input { background: #2196f3; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  ${prompt.description ? `<div class="description">${escapeHtmlForPrompt(prompt.description)}</div>` : ''}

  <!-- 企業選択ドロップダウン -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- テンプレート表示（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordionById('arrow', 'accordionContent')">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">
        コピー
      </button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText"></div>
    </div>
  </div>

  <!-- 入力エリア -->
  <div class="input-section">
    <div class="input-header">
      <label class="input-label" style="margin-bottom:0;">${escapeHtmlForPrompt(prompt.inputLabel)}</label>
      <button class="btn save-btn" onclick="saveData()">💾 シートに保存</button>
    </div>
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
        コピー
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

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    // 定数
    const template = \`${escapedTemplate}\`;
    const sheetList = ${sheetListJson};
    const inputSaveKey = ${inputSaveKeyJson};  // 入力欄の保存先キー
    let selectedSheetName = '';
    let selectedInputData = '';  // 入力欄に自動セットするデータ

    // 初期化
    window.onload = function() {
      document.getElementById('templateText').textContent = template;
      renderCompanyDropdown();
    };

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function renderCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      if (!sheetList || sheetList.length === 0) {
        dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
        return;
      }

      // ソート: アクティブ最上段、残りは逆順（新しいものが上）
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return -1;
      });

      sorted.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' selected' : '');

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        // inputDataがあれば「自動取得可」、なければsavedDataで「保存済」
        const inputBadge = item.hasInputData ? '<span class="badge-input">自動取得可</span>' : '';
        const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
        const companyNote = item.companyName && item.companyName !== item.sheetName
          ? ' <span style="color:#666;font-size:12px;">(' + escapeHtml(item.companyName) + ')</span>' : '';

        div.innerHTML = \`
          <span class="check-icon">\${item.isActive ? '✓' : ''}</span>
          <span class="company-name">\${escapeHtml(item.sheetName)}\${companyNote}</span>
          \${activeBadge}
          \${inputBadge}
          \${savedBadge}
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);

        // アクティブがあれば自動選択
        if (item.isActive) {
          selectCompany(item);
        }
      });
    }

    function selectCompany(item) {
      const currentInput = document.getElementById('inputText').value.trim();

      // inputDataまたはsavedDataがあれば読み込み確認
      const dataToLoad = item.inputData || item.savedData;
      if (dataToLoad && currentInput && currentInput !== dataToLoad) {
        if (!confirm('保存済みのデータを読み込みますか？\\n（現在の入力は破棄されます）')) {
          updateSelection(item);
          return;
        }
      }

      updateSelection(item);

      // inputDataがあれば優先、なければsavedDataを読み込む
      if (item.inputData) {
        document.getElementById('inputText').value = item.inputData;
        showStatus('文字起こし原文を自動取得しました', 'info');
        updatePreview();
      } else if (item.savedData) {
        document.getElementById('inputText').value = item.savedData;
        showStatus('保存済みのデータを読み込みました', 'info');
        updatePreview();
      }
    }

    function updateSelection(item) {
      selectedSheetName = item.sheetName;
      selectedInputData = item.inputData || item.savedData || '';

      // 表示を更新
      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const inputBadge = item.hasInputData ? '<span class="badge-input" style="margin-left:8px;">自動取得</span>' : '';
      const savedBadge = item.hasSavedData ? '<span class="badge-saved" style="margin-left:8px;">保存済</span>' : '';
      display.innerHTML = \`
        <span class="selected-check">✓</span>
        <span class="selected-name">\${escapeHtml(item.sheetName)}</span>
        \${activeBadge}
        \${inputBadge}
        \${savedBadge}
      \`;

      // ドロップダウン内の選択状態を更新
      document.querySelectorAll('.company-select-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      const items = document.querySelectorAll('.company-select-item');
      items.forEach(el => {
        const name = el.querySelector('.company-name').textContent.split('(')[0].trim();
        if (name === item.sheetName) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });
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

    // データを保存
    function saveData() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('inputText').value.trim();
      if (!input) {
        showStatus('入力データがありません', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, inputSaveKey, input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, inputSaveKey, input, true);
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
