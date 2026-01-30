/**
 * HP制作 JSON出力 GAS
 *
 * 【機能】
 * 1. ヒアリングシートからPart①②の情報をJSON形式で出力
 * 2. 構成案プロンプト用（外部AI用）
 * 3. Claude Code用HP作成指示文のデータ提供
 *
 * 【設計思想】
 * - サーバー情報（Part③）は絶対に含めない
 * - ラベルで検索する方式（行番号のズレに強い）
 * - commonStyles.jsを使用してUI統一
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 */

// ===== Part① 基本情報の項目（ラベル一覧） =====
const HP_JSON_PART1_LABELS = {
  // ページ1: 担当者情報 + 企業情報
  basic: [
    '企業名',
    '担当者名',
    '役職',
    '電話番号（担当者様）',
    'メールアドレス（担当者様）',
    '会社正式名称',
    '郵便番号',
    '住所',
    '代表電話番号',
    'お問い合わせメールアドレス',
    '代表者名',
    '設立年',
    '資本金',
    '従業員数',
    '事業内容',
    '営業時間・定休日'
  ],
  // HPについてのご要望
  requirements: [
    'HPの主な目的',
    'メインターゲット',
    '競合・意識している会社',
    '自社の強み',
    '参考にしたいHP',
    '現在のHP URL',
    '現在のHPで気になっている点',
    '期待すること',
    '必要なページ',
    '既存素材の有無',
    'SNSアカウント',
    '希望公開時期'
  ],
  // 会社の詳細情報
  companyDetails: [
    'ビジョン・ミッション',
    '代表メッセージ',
    '売上高',
    '会社の雰囲気・文化',
    'オフィス・店舗情報',
    '設備・施設'
  ],
  // サービス・商品について
  services: [
    '主なサービス・商品',
    'サービス・商品の強み・特徴',
    '実績・導入事例',
    '参考資料の有無'
  ]
};

// ===== Part② ヒアリング情報の項目（ラベル一覧） =====
const HP_JSON_PART2_LABELS = {
  // 1. ゴール・コンバージョン
  goal: [
    'メインのコンバージョン',
    'ハードル設定'
  ],
  // 2. ターゲットの深掘り
  target: [
    '年齢層・性別',
    '職業・役職・年収帯',
    '居住地・勤務地',
    '抱えている課題・悩み',
    'どんな状況で検索するか',
    '検索しそうなキーワード',
    '比較検討時に重視するポイント',
    '問い合わせ・応募前の不安・障壁'
  ],
  // 3. 強みの深掘り
  strength: [
    '選ばれる理由の具体例',
    'お客様・社員からよく言われる褒め言葉',
    'こだわり・譲れないポイント',
    '資格・認定・特許など',
    '独自の技術・ノウハウ',
    '提出資料で特に使いたい部分',
    '募集要項の推しポイント',
    '働き方の強み'
  ],
  // 4. 表現の方向性
  expression: [
    'キャッチコピー既存案',
    'キャッチコピーイメージ',
    '参考キャッチコピー',
    'デザインの深掘り',
    'NGイメージ',
    '撮影の雰囲気',
    '映したいもの',
    '社風の具体例',
    '表現したいキーワード'
  ],
  // 5. SEO・キーワード設計
  seo: [
    '最重要キーワード（3つ）',
    'サブキーワード（5つ程度）',
    'ローカルSEO対象地域',
    '現在の検索順位',
    '競合キーワード'
  ],
  // 6. 新規作成の確認
  newContent: [
    '代表メッセージ作成方法',
    '代表の強調点',
    'インタビュー対象者',
    'インタビュー人数',
    'インタビュー切り口',
    'よくある質問',
    '誤解されたくないこと'
  ]
};

// ===== JSON保存キー =====
const HP_JSON_SAVE_KEY = 'HP制作JSON';

// ===== Part③ サーバー情報（★除外対象★） =====
// これらのラベルを持つ行は絶対にJSON出力に含めない
const HP_JSON_EXCLUDED_LABELS = [
  'サーバー管理の希望',
  '現在のドメイン',
  'プロバイダ',
  '同じドメインでメール使用',
  'プロバイダ管理画面のログイン情報',
  'ドメイン管理画面のログイン情報',
  'AuthCode取得方法',
  'DNS設定の確認方法',
  '現在のサーバー管理者',
  '外部委託先への連絡',
  'サブドメインの使用',
  'FTPサーバー情報',
  '現在のHPアップロード方法',
  'メールアカウント数',
  '過去メールの保持希望',
  'メールサーバーのログイン情報',
  'デプロイパターン（A/B/C）',
  // Part④ 処理データも除外
  '企業フォルダURL',
  '素材フォルダURL',
  '文字起こし原文',
  'ヒアリング抽出JSON',
  '選択テンプレート',
  '構成案',
  '公開URL'
];

// ===== メニュー追加 =====
function hp_addJsonOutputMenu(ui) {
  ui.createMenu('4.📤 JSON出力')
    .addItem('📋 HP制作用JSON出力', 'hp_showJsonOutputDialog')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'hp_showStatusUpdateDialog')
    .addToUi();
}

// ===== JSON出力ダイアログ =====
function hp_showJsonOutputDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(hp_createJsonOutputDialogHTML(sheetData))
    .setWidth(800)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📤 HP制作用JSON出力');
}

/**
 * 企業シート一覧を取得（JSON出力用）
 */
function hp_getCompanySheetListForJsonOutput() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!hp_isExcludedSheet(sheetName)) {
      const companyName = String(sheet.getRange(6, 2).getValue() || '').trim();

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        isActive: sheetName === activeSheetName
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
 * シートからラベルに対応する値を取得
 * @param {Sheet} sheet - 対象シート
 * @param {string} label - 検索するラベル
 * @returns {string} 値（見つからない場合は空文字）
 */
function hp_getValueByLabel(sheet, label) {
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 1, lastRow, 2).getValues();

  for (let i = 0; i < data.length; i++) {
    const cellLabel = String(data[i][0] || '').trim();
    if (cellLabel === label) {
      return String(data[i][1] || '').trim();
    }
  }
  return '';
}

/**
 * ヒアリングシートからJSON用データを抽出
 * @param {string} sheetName - シート名
 * @returns {Object} { success, data, error }
 */
function hp_extractJsonData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  try {
    // シート全体のデータを取得（パフォーマンス向上）
    const lastRow = sheet.getLastRow();
    const allData = sheet.getRange(1, 1, lastRow, 7).getValues();

    // ラベル→値のマップを作成
    const labelValueMap = {};
    for (let i = 0; i < allData.length; i++) {
      const label = String(allData[i][0] || '').trim();
      if (label) {
        // B列の値を取得（結合セルの場合も対応）
        const value = String(allData[i][1] || '').trim();
        labelValueMap[label] = value;
      }
    }

    // サーバー情報が含まれていないか確認（除外対象のチェック）
    const includedExcluded = HP_JSON_EXCLUDED_LABELS.filter(label =>
      labelValueMap[label] && labelValueMap[label].length > 0
    );

    // Part① 基本情報を構築
    const part1 = {
      basic: {},
      requirements: {},
      companyDetails: {},
      services: {}
    };

    for (const category in HP_JSON_PART1_LABELS) {
      HP_JSON_PART1_LABELS[category].forEach(label => {
        const value = labelValueMap[label] || '';
        if (value) {
          part1[category][label] = value;
        }
      });
    }

    // Part② ヒアリング情報を構築
    const part2 = {
      goal: {},
      target: {},
      strength: {},
      expression: {},
      seo: {},
      newContent: {}
    };

    for (const category in HP_JSON_PART2_LABELS) {
      HP_JSON_PART2_LABELS[category].forEach(label => {
        const value = labelValueMap[label] || '';
        if (value) {
          part2[category][label] = value;
        }
      });
    }

    // 企業名を取得
    const companyName = labelValueMap['企業名'] || sheetName;

    // 最終JSONデータ
    const jsonData = {
      企業名: companyName,
      更新日時: new Date().toLocaleString('ja-JP'),
      'Part①_基本情報': {
        担当者情報_企業情報: part1.basic,
        HPについてのご要望: part1.requirements,
        会社の詳細情報: part1.companyDetails,
        サービス_商品について: part1.services
      },
      'Part②_ヒアリング情報': {
        ゴール_コンバージョン: part2.goal,
        ターゲットの深掘り: part2.target,
        強みの深掘り: part2.strength,
        表現の方向性: part2.expression,
        SEO_キーワード設計: part2.seo,
        新規作成の確認: part2.newContent
      }
    };

    return {
      success: true,
      data: jsonData,
      companyName: companyName
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * JSONを抽出してPart④に自動保存
 * @param {string} sheetName - シート名
 * @returns {Object} { success, data, companyName, saved, error }
 */
function hp_extractAndSaveJsonData(sheetName) {
  // JSONを抽出
  const result = hp_extractJsonData(sheetName);

  if (!result.success) {
    return result;
  }

  // Part④に保存
  const jsonStr = JSON.stringify(result.data, null, 2);
  const saveResult = hp_saveJsonToPart4(sheetName, jsonStr);

  return {
    success: true,
    data: result.data,
    companyName: result.companyName,
    saved: saveResult.success,
    saveError: saveResult.error || null
  };
}

/**
 * Part④にJSONを保存
 * @param {string} sheetName - シート名
 * @param {string} jsonStr - JSON文字列
 * @returns {Object} { success, error }
 */
function hp_saveJsonToPart4(sheetName, jsonStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  try {
    const lastRow = sheet.getLastRow();

    // 既存のHP制作JSONラベルを探す
    for (let row = 1; row <= lastRow; row++) {
      const label = sheet.getRange(row, 1).getValue();
      if (label === HP_JSON_SAVE_KEY) {
        sheet.getRange(row, 2).setValue(jsonStr);
        return { success: true };
      }
    }

    // 見つからない場合は最後に追加
    sheet.getRange(lastRow + 1, 1).setValue(HP_JSON_SAVE_KEY);
    sheet.getRange(lastRow + 1, 2).setValue(jsonStr);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * JSON出力ダイアログHTML
 */
function hp_createJsonOutputDialogHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .json-output {
      width: 100%;
      height: 350px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      background: #f8f9fa;
      white-space: pre;
      overflow: auto;
    }
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .info-box {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #1565C0;
    }
    .info-box ul {
      margin: 0;
      padding-left: 20px;
    }
    .warning-box {
      background: #fff3e0;
      border: 1px solid #ffcc80;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 12px;
      color: #e65100;
      font-size: 13px;
    }
    .stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 12px;
      color: #666;
    }
    .stat-item {
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📤 JSON出力について</h4>
    <ul>
      <li><strong>用途1:</strong> 構成案プロンプト → 外部AIに投げる</li>
      <li><strong>用途2:</strong> Claude Code用HP作成指示文のデータ</li>
    </ul>
    <p style="margin:8px 0 0 0;color:#d32f2f;font-weight:bold;">
      ⚠️ サーバー情報（Part③）は含まれません
    </p>
  </div>

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

  <!-- JSON出力 -->
  <div class="output-header">
    <span class="input-label" style="margin-bottom:0;">JSON出力</span>
    <div class="btn-group">
      <button class="btn btn-blue" id="generateBtn" onclick="generateJson()" disabled>
        🔄 生成・保存
      </button>
      <button class="btn btn-green" id="copyBtn" onclick="copyJson()" disabled>
        📋 コピー
      </button>
    </div>
  </div>
  <pre class="json-output" id="jsonOutput">（企業を選択して「JSON生成」をクリック）</pre>

  <div class="stats" id="stats" style="display:none;">
    <span class="stat-item" id="statPart1">Part①: 0項目</span>
    <span class="stat-item" id="statPart2">Part②: 0項目</span>
    <span class="stat-item" id="statTotal">合計: 0項目</span>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    let selectedSheetName = '';
    let currentJsonData = null;

    window.onload = function() {
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        onSelect: function(item, isActive) {
          selectedSheetName = item.sheetName;
          document.getElementById('generateBtn').disabled = false;
          document.getElementById('jsonOutput').textContent = '（「JSON生成」をクリックしてください）';
          document.getElementById('copyBtn').disabled = true;
          document.getElementById('stats').style.display = 'none';
        }
      });
    };

    function generateJson() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      document.getElementById('generateBtn').disabled = true;
      document.getElementById('jsonOutput').textContent = '⏳ 生成・保存中...';

      google.script.run
        .withSuccessHandler(handleJsonResult)
        .withFailureHandler(handleError)
        .hp_extractAndSaveJsonData(selectedSheetName);
    }

    function handleJsonResult(result) {
      document.getElementById('generateBtn').disabled = false;

      if (!result.success) {
        document.getElementById('jsonOutput').textContent = 'エラー: ' + result.error;
        showStatus(result.error, 'error');
        return;
      }

      currentJsonData = result.data;
      const jsonStr = JSON.stringify(result.data, null, 2);
      document.getElementById('jsonOutput').textContent = jsonStr;
      document.getElementById('copyBtn').disabled = false;

      // 統計を計算
      const part1Count = countItems(result.data['Part①_基本情報']);
      const part2Count = countItems(result.data['Part②_ヒアリング情報']);

      document.getElementById('statPart1').textContent = 'Part①: ' + part1Count + '項目';
      document.getElementById('statPart2').textContent = 'Part②: ' + part2Count + '項目';
      document.getElementById('statTotal').textContent = '合計: ' + (part1Count + part2Count) + '項目';
      document.getElementById('stats').style.display = 'flex';

      // 保存結果を表示
      if (result.saved) {
        showStatus('✅ JSON生成・Part④に保存完了（' + result.companyName + '）', 'success');
      } else {
        showStatus('⚠️ JSON生成完了・保存失敗: ' + (result.saveError || '不明なエラー'), 'warning');
      }
    }

    function countItems(obj) {
      let count = 0;
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          count += Object.keys(obj[key]).length;
        }
      }
      return count;
    }

    function copyJson() {
      if (!currentJsonData) {
        showStatus('先にJSONを生成してください', 'error');
        return;
      }
      const jsonStr = JSON.stringify(currentJsonData, null, 2);
      copyToClipboard(jsonStr);
    }

    function handleError(error) {
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('jsonOutput').textContent = 'エラー: ' + error.message;
      showStatus('エラー: ' + error.message, 'error');
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
