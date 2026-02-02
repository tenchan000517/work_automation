/**
 * HP制作 文字起こし → ヒアリングシート転記 GAS
 *
 * 【機能】
 * 1. 文字起こしを整理 - プロンプト生成（文字起こし + テンプレート）
 * 2. AI出力を転記 - JSON形式のAI出力をヒアリングシートに転記
 * 3. 差分確認UI - 既存値との比較・選択的上書き
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 *
 * 【設計思想】
 * - ツナゲルほど複雑にしない（シンプル・不変）
 * - Part②ヒアリング情報（39項目）を対象
 */

// ===== Part② マッピング =====
// 文字起こしから抽出する項目 → ヒアリングシート（行, 列）
// ※hp_setupTemplate()の行番号に基づく
// ※値はB列（col: 2）に入力
const HP_TRANSCRIPT_TO_SHEET_MAPPING = {
  // 1. ゴール・コンバージョン（行52-53）
  'メインのコンバージョン': { row: 52, col: 2 },
  'ハードル設定': { row: 53, col: 2 },

  // 2. ターゲットの深掘り（行56-63）
  '年齢層・性別': { row: 56, col: 2 },
  '職業・役職・年収帯': { row: 57, col: 2 },
  '居住地・勤務地': { row: 58, col: 2 },
  '抱えている課題・悩み': { row: 59, col: 2 },
  'どんな状況で検索するか': { row: 60, col: 2 },
  '検索しそうなキーワード': { row: 61, col: 2 },
  '比較検討時に重視するポイント': { row: 62, col: 2 },
  '問い合わせ・応募前の不安・障壁': { row: 63, col: 2 },

  // 3. 強みの深掘り（行66-73）
  '選ばれる理由の具体例': { row: 66, col: 2 },
  'お客様・社員からよく言われる褒め言葉': { row: 67, col: 2 },
  'こだわり・譲れないポイント': { row: 68, col: 2 },
  '資格・認定・特許など': { row: 69, col: 2 },
  '独自の技術・ノウハウ': { row: 70, col: 2 },
  '提出資料で特に使いたい部分': { row: 71, col: 2 },
  '募集要項の推しポイント': { row: 72, col: 2 },
  '働き方の強み': { row: 73, col: 2 },

  // 4. 表現の方向性（行76-84）
  'キャッチコピー既存案': { row: 76, col: 2 },
  'キャッチコピーイメージ': { row: 77, col: 2 },
  '参考キャッチコピー': { row: 78, col: 2 },
  'デザインの深掘り': { row: 79, col: 2 },
  'NGイメージ': { row: 80, col: 2 },
  '撮影の雰囲気': { row: 81, col: 2 },
  '映したいもの': { row: 82, col: 2 },
  '社風の具体例': { row: 83, col: 2 },
  '表現したいキーワード': { row: 84, col: 2 },

  // 5. SEO・キーワード設計（行87-91）
  '最重要キーワード': { row: 87, col: 2 },
  'サブキーワード': { row: 88, col: 2 },
  'ローカルSEO対象地域': { row: 89, col: 2 },
  '現在の検索順位': { row: 90, col: 2 },
  '競合キーワード': { row: 91, col: 2 },

  // 6. 新規作成の確認（行94-100）
  '代表メッセージ作成方法': { row: 94, col: 2 },
  '代表の強調点': { row: 95, col: 2 },
  'インタビュー対象者': { row: 96, col: 2 },
  'インタビュー人数': { row: 97, col: 2 },
  'インタビュー切り口': { row: 98, col: 2 },
  'よくある質問': { row: 99, col: 2 },
  '誤解されたくないこと': { row: 100, col: 2 },
};

// ===== メニュー追加 =====
// ※ メニューは promptDialog.js の hp_addPromptMenu() に統合済み
// 「2.📝 ヒアリング反映」メニューから呼び出される

// ===== プロンプトシートからテンプレート読み込み =====

/**
 * プロンプトシートから「ヒアリング情報抽出」テンプレートを取得
 * @returns {Object} { success, template, error }
 */
function hp_getTranscriptPromptFromSheet() {
  const PROMPT_NAME = 'ヒアリング情報抽出';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) {
    return {
      success: false,
      error: '「プロンプト」シートがありません。\n\n' +
             'メニュー「⚙️ HP設定」→「📝 プロンプトシートを作成」を実行してください。'
    };
  }

  const data = sheet.getDataRange().getValues();

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // A列（プロンプト名）が一致し、E列（テンプレート）が存在する場合
    if (row[0] === PROMPT_NAME && row[4]) {
      return { success: true, template: row[4] };
    }
  }

  // 見つからない場合はデフォルトテンプレートを返す
  return {
    success: true,
    template: hp_getDefaultTranscriptPromptTemplate()
  };
}

/**
 * デフォルトの文字起こし整理プロンプトテンプレート
 */
function hp_getDefaultTranscriptPromptTemplate() {
  return `以下の文字起こしから、HP制作に必要なヒアリング情報を抽出してください。

【抽出項目】
1. ゴール・コンバージョン
   - メインのコンバージョン: 最終的にユーザーに何をしてほしいか
   - ハードル設定: カジュアル面談など本申込前のステップ

2. ターゲットの深掘り
   - 年齢層・性別
   - 職業・役職・年収帯
   - 居住地・勤務地
   - 抱えている課題・悩み
   - どんな状況で検索するか
   - 検索しそうなキーワード
   - 比較検討時に重視するポイント
   - 問い合わせ・応募前の不安・障壁

3. 強みの深掘り
   - 選ばれる理由の具体例
   - お客様・社員からよく言われる褒め言葉
   - こだわり・譲れないポイント
   - 資格・認定・特許など
   - 独自の技術・ノウハウ
   - 提出資料で特に使いたい部分
   - 募集要項の推しポイント
   - 働き方の強み

4. 表現の方向性
   - キャッチコピー既存案
   - キャッチコピーイメージ
   - 参考キャッチコピー
   - デザインの深掘り
   - NGイメージ
   - 撮影の雰囲気
   - 映したいもの
   - 社風の具体例
   - 表現したいキーワード

5. SEO・キーワード設計
   - 最重要キーワード（3つ）
   - サブキーワード（5つ程度）
   - ローカルSEO対象地域
   - 現在の検索順位
   - 競合キーワード

6. 新規作成の確認
   - 代表メッセージ作成方法
   - 代表の強調点
   - インタビュー対象者
   - インタビュー人数
   - インタビュー切り口
   - よくある質問
   - 誤解されたくないこと

【出力形式】
以下のJSON形式で出力してください。言及されていない項目は空文字""としてください。

\`\`\`json
{
  "企業名": "",
  "ゴール・コンバージョン": {
    "メインのコンバージョン": "",
    "ハードル設定": ""
  },
  "ターゲット": {
    "年齢層・性別": "",
    "職業・役職・年収帯": "",
    "居住地・勤務地": "",
    "抱えている課題・悩み": "",
    "どんな状況で検索するか": "",
    "検索しそうなキーワード": "",
    "比較検討時に重視するポイント": "",
    "問い合わせ・応募前の不安・障壁": ""
  },
  "強み": {
    "選ばれる理由の具体例": "",
    "お客様・社員からよく言われる褒め言葉": "",
    "こだわり・譲れないポイント": "",
    "資格・認定・特許など": "",
    "独自の技術・ノウハウ": "",
    "提出資料で特に使いたい部分": "",
    "募集要項の推しポイント": "",
    "働き方の強み": ""
  },
  "表現の方向性": {
    "キャッチコピー既存案": "",
    "キャッチコピーイメージ": "",
    "参考キャッチコピー": "",
    "デザインの深掘り": "",
    "NGイメージ": "",
    "撮影の雰囲気": "",
    "映したいもの": "",
    "社風の具体例": "",
    "表現したいキーワード": ""
  },
  "SEO": {
    "最重要キーワード": "",
    "サブキーワード": "",
    "ローカルSEO対象地域": "",
    "現在の検索順位": "",
    "競合キーワード": ""
  },
  "新規作成": {
    "代表メッセージ作成方法": "",
    "代表の強調点": "",
    "インタビュー対象者": "",
    "インタビュー人数": "",
    "インタビュー切り口": "",
    "よくある質問": "",
    "誤解されたくないこと": ""
  }
}
\`\`\`

【文字起こし】
{{input}}`;
}

// ===== 1. 文字起こしを整理（プロンプト生成） =====
function hp_showTranscriptPromptDialog() {
  // プロンプトシートからテンプレートを取得
  const promptData = hp_getTranscriptPromptFromSheet();

  // エラーの場合はアラートを表示して終了
  if (!promptData.success) {
    SpreadsheetApp.getUi().alert('エラー', promptData.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // 企業シート一覧を取得（保存済みデータ含む）
  const sheetData = hp_getCompanySheetListWithNamesAndData();

  const html = HtmlService.createHtmlOutput(hp_createTranscriptPromptHTML(sheetData, promptData.template))
    .setWidth(800)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 文字起こしを整理');
}

/**
 * 企業シート一覧を取得（企業名・保存済みデータ付き）
 */
function hp_getCompanySheetListWithNamesAndData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!hp_isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(5, 2).getValue() || '').trim();

      // Part④から保存済みデータを取得
      let savedTranscript = '';
      try {
        const result = hp_loadPart4Data(sheetName, '文字起こし原文');
        if (result.success) {
          savedTranscript = result.value;
        }
      } catch (e) {
        savedTranscript = '';
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedTranscript: savedTranscript,
        hasSavedData: !!savedTranscript
      });
    }
  });

  const isActiveCompanySheet = companySheets.some(s => s.sheetName === activeSheetName);

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: isActiveCompanySheet,
    companySheets: companySheets
  };
}

/**
 * Part④からデータを読み込む
 */
function hp_loadPart4Data(sheetName, label) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  const lastRow = sheet.getLastRow();
  for (let row = 1; row <= lastRow; row++) {
    const cellLabel = sheet.getRange(row, 1).getValue();
    if (cellLabel === label) {
      const value = sheet.getRange(row, 2).getValue();
      return { success: true, value: value };
    }
  }

  return { success: false, error: 'ラベルが見つかりません' };
}

/**
 * Part④にデータを保存
 */
function hp_savePart4Data(sheetName, label, value, checkExisting) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  const lastRow = sheet.getLastRow();
  for (let row = 1; row <= lastRow; row++) {
    const cellLabel = sheet.getRange(row, 1).getValue();
    if (cellLabel === label) {
      const existingValue = sheet.getRange(row, 2).getValue();
      if (checkExisting && existingValue) {
        return { success: false, needConfirm: true };
      }
      sheet.getRange(row, 2).setValue(value);
      return { success: true };
    }
  }

  return { success: false, error: 'ラベルが見つかりません' };
}

/**
 * Part④にデータを強制保存
 */
function hp_savePart4DataForce(sheetName, label, value) {
  return hp_savePart4Data(sheetName, label, value, false);
}

function hp_createTranscriptPromptHTML(sheetData, template) {
  // テンプレート内の特殊文字をエスケープ
  const escapedTemplate = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
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
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .company-info { background: #e8f0fe; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 企業選択ドロップダウン -->
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
      <label class="input-label" style="margin-bottom:0;">文字起こしを貼り付け</label>
      <button class="btn save-btn" onclick="saveTranscript()">💾 シートに保存</button>
    </div>
    <textarea
      class="input-textarea"
      id="transcriptInput"
      placeholder="NOTTAからダウンロードした文字起こしテキストを貼り付けてください..."
      oninput="updatePreview()"
    ></textarea>
    <div class="note">※ 60分程度の打ち合わせの文字起こしを想定 ｜ 保存すると次回自動読み込み</div>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">完成版プロンプト（AIに貼り付け）</span>
      <button class="btn btn-green" onclick="copyOutput()" id="copyResultBtn" disabled>
        コピー
      </button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="clearAll()">クリア</button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const template = \`${escapedTemplate}\`;
    const sheetData = ${sheetDataJson};
    let selectedCompanyName = '';
    let selectedSheetName = '';

    window.onload = function() {
      document.getElementById('templateText').textContent = template;

      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        savedDataKey: 'savedTranscript',
        badgeLabel: '保存済',
        onSelect: function(item, isActive) {
          const currentInput = document.getElementById('transcriptInput').value.trim();

          if (item.savedTranscript && currentInput && currentInput !== item.savedTranscript) {
            if (!confirm('保存済みの文字起こしを読み込みますか？\\n（現在の入力は破棄されます）')) {
              selectedSheetName = item.sheetName;
              selectedCompanyName = item.companyName;
              updateCompanyInfo();
              return;
            }
          }

          selectedSheetName = item.sheetName;
          selectedCompanyName = item.companyName;
          updateCompanyInfo();

          if (item.savedTranscript) {
            document.getElementById('transcriptInput').value = item.savedTranscript;
            showStatus('保存済みの文字起こしを読み込みました', 'info');
            updatePreview();
          }
        }
      });
    };

    function updateCompanyInfo() {
      const companyInfo = document.getElementById('companyInfo');
      if (selectedCompanyName) {
        companyInfo.innerHTML = '🏢 企業名: <strong>' + escapeHtml(selectedCompanyName) + '</strong>（プロンプトに自動挿入されます）';
        companyInfo.style.display = 'block';
      } else {
        companyInfo.style.display = 'none';
      }
    }

    function updatePreview() {
      const input = document.getElementById('transcriptInput').value;
      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (input.trim() && selectedCompanyName) {
        const companyHeader = '【対象企業】' + selectedCompanyName + '\\n\\n';
        const result = companyHeader + template.replace('{{input}}', input);
        preview.textContent = result;
        preview.classList.remove('preview-placeholder');
        copyBtn.disabled = false;
      } else if (input.trim()) {
        preview.innerHTML = '<span class="preview-placeholder">企業を選択してください</span>';
        copyBtn.disabled = true;
      } else {
        preview.innerHTML = '<span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>';
        copyBtn.disabled = true;
      }
    }

    function copyTemplate() {
      copyToClipboard(template);
    }

    function copyOutput() {
      const input = document.getElementById('transcriptInput').value;
      if (!input.trim()) {
        showStatus('文字起こしを入力してください', 'error');
        return;
      }
      if (!selectedCompanyName) {
        showStatus('企業を選択してください', 'error');
        return;
      }
      const companyHeader = '【対象企業】' + selectedCompanyName + '\\n\\n';
      const result = companyHeader + template.replace('{{input}}', input);
      copyToClipboard(result);
    }

    function saveTranscript() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('transcriptInput').value.trim();
      if (!input) {
        showStatus('文字起こしを入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 文字起こしを企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 文字起こしを上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .hp_savePart4DataForce(selectedSheetName, '文字起こし原文', input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .hp_savePart4Data(selectedSheetName, '文字起こし原文', input, true);
    }

    function clearAll() {
      document.getElementById('transcriptInput').value = '';
      document.getElementById('previewContent').innerHTML = '<span class="preview-placeholder">上の入力欄に文字起こしを貼り付けると、ここにプレビューが表示されます</span>';
      document.getElementById('copyResultBtn').disabled = true;
      showStatus('クリアしました', 'info');
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

// ===== 2. AI出力を転記 =====
function hp_showTransferFromAIDialog() {
  const sheetData = hp_getCompanySheetListWithSavedJson();
  const html = HtmlService.createHtmlOutput(hp_createTransferFromAIHTML(sheetData))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 AI出力を転記');
}

/**
 * 企業シート一覧を取得（保存済みJSONデータ付き）
 */
function hp_getCompanySheetListWithSavedJson() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!hp_isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(5, 2).getValue() || '').trim();

      let savedJson = '';
      try {
        const result = hp_loadPart4Data(sheetName, 'ヒアリング抽出JSON');
        if (result.success) {
          savedJson = result.value;
        }
      } catch (e) {
        savedJson = '';
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedJson: savedJson,
        hasSavedJson: !!savedJson
      });
    }
  });

  const isActiveCompanySheet = companySheets.some(s => s.sheetName === activeSheetName);

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: isActiveCompanySheet,
    companySheets: companySheets
  };
}

function hp_createTransferFromAIHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .input-textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
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
    .diff-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .diff-table th, .diff-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    .diff-table th { background: #f8f9fa; position: sticky; top: 0; }
    .diff-table tr:nth-child(even) { background: #f8f9fa; }
    .diff-row { cursor: pointer; }
    .diff-row:hover { background: #e3f2fd !important; }
    .diff-row.selected { background: #bbdefb !important; }
    .diff-row.conflict { background: #fff3e0 !important; }
    .current-val { color: #666; font-size: 11px; }
    .diff-container { max-height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; }
    .sheet-info { background: #e8f0fe; padding: 10px; border-radius: 6px; margin-bottom: 12px; }
    .checkbox-col { width: 35px; text-align: center; }
    input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .edit-input { width: 100%; padding: 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; }
    .sheet-warning { background: #fff3e0; border: 1px solid #ffcc80; padding: 10px; border-radius: 6px; margin-top: 8px; color: #e65100; display: none; }
    .input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <div id="step1">
    <div class="input-section">
      <span class="input-label">転記先企業を選択</span>
      <div class="company-select-wrapper">
        <div class="company-select-display" id="companySelectDisplay" onclick="event.stopPropagation(); toggleCompanyDropdown()">
          <span class="placeholder">企業シートを選択してください</span>
        </div>
        <div class="company-select-dropdown" id="companySelectDropdown"></div>
      </div>
      <div id="sheetWarning" class="sheet-warning"></div>
    </div>

    <div class="input-section">
      <div class="input-header">
        <label class="input-label" style="margin-bottom:0;">AIが出力したJSONを貼り付け</label>
        <button class="btn save-btn" onclick="saveJson()">💾 シートに保存</button>
      </div>
      <textarea
        class="input-textarea"
        id="jsonInput"
        placeholder='{"企業名": "株式会社○○", "ゴール・コンバージョン": {...}, ...}'
      ></textarea>
      <div class="note">※ コードブロック（\`\`\`json）で囲まれていても自動除去します</div>
    </div>

    <div class="footer">
      <button class="btn btn-blue" onclick="parseAndCompare()">🔍 解析して比較</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <div id="step2" style="display:none;">
    <div class="sheet-info" id="sheetInfo"></div>

    <div id="confirmMsg" class="status warning" style="display:none;"></div>

    <div class="input-label">転記内容の確認（チェックした項目のみ転記）</div>
    <div class="diff-container">
      <table class="diff-table">
        <thead>
          <tr>
            <th class="checkbox-col"><input type="checkbox" id="selectAll" onchange="toggleAll(this.checked)" checked></th>
            <th style="width:25%">項目</th>
            <th style="width:35%">現在の値</th>
            <th style="width:35%">新しい値（編集可）</th>
          </tr>
        </thead>
        <tbody id="diffBody"></tbody>
      </table>
    </div>

    <div class="footer" style="margin-top:12px;">
      <button class="btn btn-green" onclick="executeTransfer()">✅ チェック項目を転記</button>
      <button class="btn btn-gray" onclick="goBack()">← 戻る</button>
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>

    <div class="status" id="resultStatus"></div>
  </div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    let parsedData = null;
    let diffItems = [];
    let selectedSheetName = '';
    let selectedCompanyData = null;

    window.onload = function() {
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        savedDataKey: 'savedJson',
        badgeLabel: '保存済',
        onSelect: function(item, isActive) {
          const currentInput = document.getElementById('jsonInput').value.trim();

          if (item.savedJson && currentInput && currentInput !== item.savedJson) {
            if (!confirm('保存済みのJSONを読み込みますか？\\n（現在の入力は破棄されます）')) {
              selectedSheetName = item.sheetName;
              selectedCompanyData = item;
              updateWarning(item, isActive);
              return;
            }
          }

          selectedSheetName = item.sheetName;
          selectedCompanyData = item;
          updateWarning(item, isActive);

          if (item.savedJson) {
            document.getElementById('jsonInput').value = item.savedJson;
            showStatus('保存済みのJSONを読み込みました', 'info');
          }
        }
      });
    };

    function updateWarning(item, isActive) {
      const warning = document.getElementById('sheetWarning');
      if (sheetData.isActiveCompanySheet && item.sheetName !== sheetData.activeSheetName) {
        warning.innerHTML = '⚠️ アクティブなシート（' + escapeHtml(sheetData.activeSheetName) + '）とは異なるシートが選択されています。';
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    }

    function cleanJsonString(jsonStr) {
      let cleanJson = jsonStr.trim();
      const codeBlockMarker = String.fromCharCode(96, 96, 96);
      const codeBlockJsonMarker = codeBlockMarker + 'json';

      if (cleanJson.startsWith(codeBlockJsonMarker)) {
        cleanJson = cleanJson.substring(codeBlockJsonMarker.length);
      } else if (cleanJson.startsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(codeBlockMarker.length);
      }
      if (cleanJson.endsWith(codeBlockMarker)) {
        cleanJson = cleanJson.substring(0, cleanJson.length - codeBlockMarker.length);
      }
      return cleanJson.trim();
    }

    function saveJson() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const jsonStr = document.getElementById('jsonInput').value.trim();
      if (!jsonStr) {
        showStatus('JSONを入力してください', 'error');
        return;
      }

      try {
        JSON.parse(cleanJsonString(jsonStr));
      } catch (e) {
        showStatus('JSONの形式が正しくありません: ' + e.message, 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 JSONを企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 JSONを上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .hp_savePart4DataForce(selectedSheetName, 'ヒアリング抽出JSON', jsonStr);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .hp_savePart4Data(selectedSheetName, 'ヒアリング抽出JSON', jsonStr, true);
    }

    function parseAndCompare() {
      if (!selectedSheetName) {
        showStatus('転記先シートを選択してください', 'error');
        return;
      }

      const jsonStr = document.getElementById('jsonInput').value.trim();
      if (!jsonStr) {
        showStatus('JSONを入力してください', 'error');
        return;
      }

      const cleanJson = cleanJsonString(jsonStr);

      try {
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        showStatus('JSONの解析に失敗しました: ' + e.message, 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(handleCompareResult)
        .withFailureHandler(handleError)
        .hp_compareWithSelectedSheet(parsedData, selectedSheetName);
    }

    function handleCompareResult(result) {
      if (!result.success) {
        showStatus(result.error, 'error');
        return;
      }

      if (result.needConfirm && result.mismatchWarning) {
        document.getElementById('confirmMsg').innerHTML =
          '<strong>⚠️ 企業名が一致しません</strong><br>' +
          '【シート】' + escapeHtml(result.sheetCompanyName) + '<br>' +
          '【JSON】' + escapeHtml(result.jsonCompanyName);
        document.getElementById('confirmMsg').style.display = 'block';
      }

      document.getElementById('sheetInfo').innerHTML =
        '📄 <strong>転記先:</strong> ' + escapeHtml(result.sheetName) +
        (result.sheetCompanyName ? ' （' + escapeHtml(result.sheetCompanyName) + '）' : '');

      diffItems = result.diffItems || [];
      renderDiffTable();

      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
    }

    function renderDiffTable() {
      const tbody = document.getElementById('diffBody');
      tbody.innerHTML = '';

      diffItems.forEach((item, index) => {
        const hasConflict = item.currentValue && item.currentValue !== item.newValue;
        const tr = document.createElement('tr');
        tr.className = 'diff-row' + (hasConflict ? ' conflict' : '');

        tr.innerHTML = \`
          <td class="checkbox-col">
            <input type="checkbox" id="cb_\${index}" \${item.newValue ? 'checked' : ''}
                   onchange="updateCheckboxSelection(\${index}, this.checked)">
          </td>
          <td>\${escapeHtml(item.label)}</td>
          <td class="current-val">\${escapeHtml(item.currentValue || '(空)')}</td>
          <td>
            <input type="text" class="edit-input" id="val_\${index}"
                   value="\${escapeHtml(item.newValue || '')}"
                   onchange="updateValue(\${index}, this.value)"
                   \${!item.newValue ? 'disabled' : ''}>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function toggleAll(checked) {
      diffItems.forEach((item, index) => {
        if (item.newValue) {
          document.getElementById('cb_' + index).checked = checked;
          item.selected = checked;
        }
      });
    }

    function updateCheckboxSelection(index, checked) {
      diffItems[index].selected = checked;
    }

    function updateValue(index, value) {
      diffItems[index].newValue = value;
    }

    function executeTransfer() {
      const selectedItems = diffItems
        .filter((item, index) => document.getElementById('cb_' + index).checked)
        .map((item) => ({
          key: item.key,
          value: document.getElementById('val_' + diffItems.indexOf(item)).value
        }));

      if (selectedItems.length === 0) {
        showResultStatus('転記する項目を選択してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(handleTransferResult)
        .withFailureHandler(handleError)
        .hp_executeTranscriptTransfer(selectedItems, selectedSheetName);
    }

    function handleTransferResult(result) {
      if (result.success) {
        showResultStatus('✅ ' + result.count + '件の項目を転記しました', 'success');
        setTimeout(() => google.script.host.close(), 2000);
      } else {
        showResultStatus('❌ 転記に失敗: ' + result.error, 'error');
      }
    }

    function goBack() {
      document.getElementById('step1').style.display = 'block';
      document.getElementById('step2').style.display = 'none';
      document.getElementById('confirmMsg').style.display = 'none';
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }

    function showResultStatus(message, type) {
      const status = document.getElementById('resultStatus');
      status.innerHTML = message;
      status.className = 'status ' + type;
    }

    function handleError(error) {
      showStatus('エラー: ' + error.message, 'error');
    }
  </script>
</body>
</html>
  `;
}

// ===== 比較処理 =====
/**
 * 選択されたシートと比較
 */
function hp_compareWithSelectedSheet(jsonData, targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheetName);

  if (!sheet) {
    return {
      success: false,
      error: '⚠️ シート「' + targetSheetName + '」が見つかりません。'
    };
  }

  // シートの企業名を取得（行5, B列）
  const sheetCompanyName = String(sheet.getRange(5, 2).getValue() || '').trim();
  const jsonCompanyName = String(jsonData.企業名 || '').trim();

  // 企業名チェック
  let needConfirm = false;
  let mismatchWarning = '';
  if (sheetCompanyName && jsonCompanyName) {
    if (!hp_checkCompanyNameMatch(jsonCompanyName, sheetCompanyName)) {
      needConfirm = true;
      mismatchWarning = '企業名が一致しません';
    }
  }

  // JSONからフラットなキー・値ペアに変換
  const flatData = hp_flattenJsonData(jsonData);

  // 各項目の現在値を取得して比較
  const diffItems = [];
  for (const key in flatData) {
    const mapping = HP_TRANSCRIPT_TO_SHEET_MAPPING[key];
    if (!mapping) continue;

    const currentValue = sheet.getRange(mapping.row, mapping.col).getValue();
    const newValue = flatData[key];

    diffItems.push({
      key: key,
      label: key,
      currentValue: String(currentValue || ''),
      newValue: String(newValue || ''),
      mapping: mapping
    });
  }

  return {
    success: true,
    needConfirm: needConfirm,
    mismatchWarning: mismatchWarning,
    sheetName: sheet.getName(),
    sheetCompanyName: sheetCompanyName,
    jsonCompanyName: jsonCompanyName,
    diffItems: diffItems
  };
}

/**
 * JSONをフラットなキー・値ペアに変換
 */
function hp_flattenJsonData(data) {
  const result = {};

  // ゴール・コンバージョン
  if (data['ゴール・コンバージョン']) {
    const g = data['ゴール・コンバージョン'];
    if (g['メインのコンバージョン']) result['メインのコンバージョン'] = g['メインのコンバージョン'];
    if (g['ハードル設定']) result['ハードル設定'] = g['ハードル設定'];
  }

  // ターゲット
  if (data['ターゲット']) {
    const t = data['ターゲット'];
    if (t['年齢層・性別']) result['年齢層・性別'] = t['年齢層・性別'];
    if (t['職業・役職・年収帯']) result['職業・役職・年収帯'] = t['職業・役職・年収帯'];
    if (t['居住地・勤務地']) result['居住地・勤務地'] = t['居住地・勤務地'];
    if (t['抱えている課題・悩み']) result['抱えている課題・悩み'] = t['抱えている課題・悩み'];
    if (t['どんな状況で検索するか']) result['どんな状況で検索するか'] = t['どんな状況で検索するか'];
    if (t['検索しそうなキーワード']) result['検索しそうなキーワード'] = t['検索しそうなキーワード'];
    if (t['比較検討時に重視するポイント']) result['比較検討時に重視するポイント'] = t['比較検討時に重視するポイント'];
    if (t['問い合わせ・応募前の不安・障壁']) result['問い合わせ・応募前の不安・障壁'] = t['問い合わせ・応募前の不安・障壁'];
  }

  // 強み
  if (data['強み']) {
    const s = data['強み'];
    if (s['選ばれる理由の具体例']) result['選ばれる理由の具体例'] = s['選ばれる理由の具体例'];
    if (s['お客様・社員からよく言われる褒め言葉']) result['お客様・社員からよく言われる褒め言葉'] = s['お客様・社員からよく言われる褒め言葉'];
    if (s['こだわり・譲れないポイント']) result['こだわり・譲れないポイント'] = s['こだわり・譲れないポイント'];
    if (s['資格・認定・特許など']) result['資格・認定・特許など'] = s['資格・認定・特許など'];
    if (s['独自の技術・ノウハウ']) result['独自の技術・ノウハウ'] = s['独自の技術・ノウハウ'];
    if (s['提出資料で特に使いたい部分']) result['提出資料で特に使いたい部分'] = s['提出資料で特に使いたい部分'];
    if (s['募集要項の推しポイント']) result['募集要項の推しポイント'] = s['募集要項の推しポイント'];
    if (s['働き方の強み']) result['働き方の強み'] = s['働き方の強み'];
  }

  // 表現の方向性
  if (data['表現の方向性']) {
    const e = data['表現の方向性'];
    if (e['キャッチコピー既存案']) result['キャッチコピー既存案'] = e['キャッチコピー既存案'];
    if (e['キャッチコピーイメージ']) result['キャッチコピーイメージ'] = e['キャッチコピーイメージ'];
    if (e['参考キャッチコピー']) result['参考キャッチコピー'] = e['参考キャッチコピー'];
    if (e['デザインの深掘り']) result['デザインの深掘り'] = e['デザインの深掘り'];
    if (e['NGイメージ']) result['NGイメージ'] = e['NGイメージ'];
    if (e['撮影の雰囲気']) result['撮影の雰囲気'] = e['撮影の雰囲気'];
    if (e['映したいもの']) result['映したいもの'] = e['映したいもの'];
    if (e['社風の具体例']) result['社風の具体例'] = e['社風の具体例'];
    if (e['表現したいキーワード']) result['表現したいキーワード'] = e['表現したいキーワード'];
  }

  // SEO
  if (data['SEO']) {
    const seo = data['SEO'];
    if (seo['最重要キーワード']) result['最重要キーワード'] = seo['最重要キーワード'];
    if (seo['サブキーワード']) result['サブキーワード'] = seo['サブキーワード'];
    if (seo['ローカルSEO対象地域']) result['ローカルSEO対象地域'] = seo['ローカルSEO対象地域'];
    if (seo['現在の検索順位']) result['現在の検索順位'] = seo['現在の検索順位'];
    if (seo['競合キーワード']) result['競合キーワード'] = seo['競合キーワード'];
  }

  // 新規作成
  if (data['新規作成']) {
    const n = data['新規作成'];
    if (n['代表メッセージ作成方法']) result['代表メッセージ作成方法'] = n['代表メッセージ作成方法'];
    if (n['代表の強調点']) result['代表の強調点'] = n['代表の強調点'];
    if (n['インタビュー対象者']) result['インタビュー対象者'] = n['インタビュー対象者'];
    if (n['インタビュー人数']) result['インタビュー人数'] = n['インタビュー人数'];
    if (n['インタビュー切り口']) result['インタビュー切り口'] = n['インタビュー切り口'];
    if (n['よくある質問']) result['よくある質問'] = n['よくある質問'];
    if (n['誤解されたくないこと']) result['誤解されたくないこと'] = n['誤解されたくないこと'];
  }

  return result;
}

// ===== 転記実行 =====
/**
 * 選択されたシートに転記
 */
function hp_executeTranscriptTransfer(selectedItems, targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheetName);

  if (!sheet) {
    return { success: false, error: 'シート「' + targetSheetName + '」が見つかりません' };
  }

  let count = 0;
  try {
    selectedItems.forEach(item => {
      const mapping = HP_TRANSCRIPT_TO_SHEET_MAPPING[item.key];
      if (mapping && item.value) {
        sheet.getRange(mapping.row, mapping.col).setValue(item.value);
        count++;
      }
    });

    return { success: true, count: count };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===== マッピング確認（デバッグ用） =====
function hp_showMappingDebug() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let output = '=== HP制作 文字起こし転記マッピング確認 ===\n\n';
  output += 'シート名: ' + sheet.getName() + '\n\n';

  for (const key in HP_TRANSCRIPT_TO_SHEET_MAPPING) {
    const m = HP_TRANSCRIPT_TO_SHEET_MAPPING[key];
    const currentValue = sheet.getRange(m.row, m.col).getValue();
    output += `[${key}] 行${m.row}, 列${m.col}\n`;
    output += `  現在値: ${currentValue || '(空)'}\n\n`;
  }

  const html = HtmlService.createHtmlOutput(
    '<textarea style="width:100%;height:500px;font-family:monospace;font-size:12px;">' +
    output.replace(/</g, '&lt;') +
    '</textarea>'
  ).setWidth(700).setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'マッピング確認');
}
