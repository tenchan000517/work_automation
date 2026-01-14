/**
 * 企業情報入力 GAS
 *
 * 受注後のキックオフ関連と企業情報管理を集約
 *
 * 【メニュー構造】
 * １.📋 企業情報入力
 *   ├── 📥 企業情報入力（ワークス貼り付け）
 *   ├── 📢 受注・キックオフ連絡
 *   ├── 📩 先方へ日程調整・フォーム記入依頼メール
 *   ├── ─────────────
 *   ├── 🏢 企業情報編集
 *   ├── ─────────────
 *   └── 📊 企業情報一覧反映
 *
 * 【使用方法】
 * onOpen() に addKickoffMenu(ui); を追加
 */

// ================================================================================
// ===== メニュー =====
// ================================================================================

function addKickoffMenu(ui) {
  ui.createMenu('１.📋 企業情報入力')
    .addItem('📥 企業情報入力（ワークス貼り付け）', 'showCompanyInfoParseDialog')
    .addItem('📢 受注・キックオフ連絡', 'showOrderReportDialog')
    .addItem('📩 先方へ日程調整・フォーム記入依頼メール', 'showScheduleEmailDialog')
    .addSeparator()
    .addItem('🏢 企業情報編集', 'showCompanyInfoEditDialog')
    .addSeparator()
    .addItem('📊 企業情報一覧反映', 'syncCompanyListSheet')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'showStatusUpdateDialog')
    .addToUi();
}

// ================================================================================
// ===== 共通ユーティリティ =====
// ================================================================================

/**
 * 企業情報一覧シートのヘッダーからテンプレートを動的生成
 * 「■」で始まる列をセクション区切りとして認識
 * @return {Object} { success: boolean, template: string, headers: string[] }
 */
function getCompanyInfoTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  // デフォルト値（項目名 → 値）
  const defaultValues = {
    '受注商材': 'ツナゲル'
  };

  // デフォルトヘッダー（シートがない場合）
  const defaultHeaders = ['■基本情報', '企業名', '担当者名', '役職・部署', '連絡先（電話）', '連絡先（メール）', '契約開始日',
    '■受注内容', '受注商材', '契約期間', '契約金額', '備考',
    '■制作担当', 'メイン担当', 'サブ担当'];

  let headerRow = defaultHeaders;

  // シートがある場合はヘッダーを取得
  if (sheet) {
    const lastCol = sheet.getLastColumn();
    if (lastCol >= 1) {
      headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      headerRow = headerRow.filter(h => h && String(h).trim());
    }
  }

  // テンプレート生成（■で始まる項目はセクション区切り）
  const separator = '============================';
  const lines = [];
  const dataHeaders = []; // 実際のデータ項目（セクション区切り以外）

  for (const header of headerRow) {
    const h = String(header).trim();
    if (!h) continue;

    if (h.startsWith('■')) {
      // セクション区切り
      if (lines.length > 0) {
        lines.push(''); // 前セクションとの空行
      }
      lines.push(separator);
      lines.push(h);
      lines.push(separator);
    } else {
      // データ項目
      const value = defaultValues[h] || '';
      lines.push(`${h}: ${value}`);
      dataHeaders.push(h);
    }
  }

  const template = lines.join('\n').trim();

  return { success: true, headers: dataHeaders, template: template };
}

/**
 * 企業シート一覧を取得（除外シートを除く）
 */
function getCompanySheetListForCompanyInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const companySheets = [];

  // 除外シート判定（インライン定義で依存関係問題を回避）
  const excludeExact = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
  const excludePartial = ['ヒアリングシート', '原本'];

  for (const sheet of sheets) {
    const name = sheet.getName();

    // 完全一致で除外
    if (excludeExact.includes(name)) continue;

    // 部分一致で除外
    let excluded = false;
    for (const partial of excludePartial) {
      if (name.includes(partial)) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    companySheets.push(name);
  }

  return companySheets;
}

/**
 * 個別企業シートから企業情報を取得（syncCompanyListSheet用）
 * 注: 現在のアーキテクチャでは企業情報は企業情報一覧シートで管理
 * この関数は移行用途で、シート名を企業名として使用
 * @param {string} sheetName - 企業シート名
 * @returns {Object} { success, data: { companyName, ... } }
 */
function getCompanyInfoFromSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return { success: false, error: 'シートが見つかりません' };
    }

    // 企業名はシート名を使用（個別シートはシート名=企業名）
    // hearingSheetManager.js では行5,C列に企業名があるが、
    // シート名の方が確実なためシート名を使用
    const companyName = sheetName;

    // 行5,C列から企業名を取得（あれば上書き）
    let cellCompanyName = '';
    try {
      cellCompanyName = String(sheet.getRange(6, 3).getValue() || '').trim();
    } catch (e) {
      // セル取得失敗時はシート名を使用
    }

    return {
      success: true,
      data: {
        companyName: cellCompanyName || companyName,
        contactName: '',
        position: '',
        phone: '',
        email: '',
        contractDate: '',
        product: 'ツナゲル',
        contractPeriod: '',
        contractAmount: '',
        notes: '',
        mainAssignee: '',
        subAssignee: ''
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * HTMLエスケープ（属性用）
 */
function escapeHtmlAttrCI(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTMLエスケープ
 */
function escapeHtmlCI(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


// ================================================================================
// ===== 共通スタイル（commonStyles.js を参照） =====
// ================================================================================
// CI_DIALOG_STYLES, CI_UI_COMPONENTS は commonStyles.js で定義
// GASエディタでは commonStyles.js を必ず追加すること


// ================================================================================
// ===== 1. 企業情報入力（ワークス貼り付け）→ 企業情報一覧シートに追加 =====
// ================================================================================

function showCompanyInfoParseDialog() {
  // 企業情報一覧シートの存在確認
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const listSheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  if (!listSheet) {
    SpreadsheetApp.getUi().alert(
      'エラー',
      '「企業情報一覧」シートが見つかりません。\n\n' +
      'メニュー「０.⚙️ 設定」→「📊 企業情報一覧を作成」を先に実行してください。',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const members = getMemberList();
  const templateResult = getCompanyInfoTemplate();
  const html = HtmlService.createHtmlOutput(createCompanyInfoParseHTML(members, templateResult.template))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 企業情報入力（ワークス貼り付け）');
}

function createCompanyInfoParseHTML(members, template) {
  let memberOptions = '';
  for (const member of members) {
    memberOptions += `<option value="${escapeHtmlAttrCI(member)}">${escapeHtmlCI(member)}</option>`;
  }

  // テンプレートをJSONエスケープ
  const templateJson = JSON.stringify(template || '');

  return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
<style>
  /* ダイアログ固有スタイル */
  .parse-result { margin-top: 15px; }
</style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <h3>企業情報入力</h3>
  <p class="subtitle">ワークスから送られてきた企業情報フォーマットを貼り付けて展開</p>

  <!-- 企業情報テンプレート（最上段） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>企業情報テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">コピー</button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText"></div>
      <div class="template-hint">※ 企業情報一覧シートの項目から動的に生成されています</div>
    </div>
  </div>

  <div class="info-box">
    <span class="icon">📊</span>
    入力した情報は「企業情報一覧」シートに追加されます
  </div>

  <div class="form-group">
    <label>ワークスの内容を貼り付け</label>
    <textarea id="rawInput" style="min-height: 150px;" placeholder="テンプレート通りに記入済みの企業情報を貼り付けてください
例：営業担当からワークスで送られてきた情報"></textarea>
  </div>

  <div class="actions">
    <button class="btn btn-parse" onclick="parseInput()">📋 展開</button>
  </div>

  <div class="parse-status" id="parseStatus" style="display:none;"></div>

  <div class="parse-result" id="parseResult" style="display:none;">
    <div class="section-title">■ 基本情報</div>
    <div class="field-row">
      <label>企業名</label>
      <input type="text" id="companyName">
    </div>
    <div class="field-row">
      <label>担当者名</label>
      <input type="text" id="contactName">
    </div>
    <div class="field-row">
      <label>役職・部署</label>
      <input type="text" id="position">
    </div>
    <div class="field-row">
      <label>連絡先（電話）</label>
      <input type="text" id="phone">
    </div>
    <div class="field-row">
      <label>連絡先（メール）</label>
      <input type="text" id="email">
    </div>
    <div class="field-row">
      <label>契約開始日</label>
      <input type="text" id="contractDate">
    </div>

    <div class="section-title">■ 受注内容</div>
    <div class="field-row">
      <label>受注商材</label>
      <input type="text" id="product" value="ツナゲル">
    </div>
    <div class="field-row">
      <label>契約期間</label>
      <input type="text" id="contractPeriod">
    </div>
    <div class="field-row">
      <label>契約金額</label>
      <input type="text" id="contractAmount">
    </div>
    <div class="field-row">
      <label>備考</label>
      <input type="text" id="notes">
    </div>

    <div class="section-title">■ 制作担当</div>
    <div class="field-row">
      <label>メイン担当</label>
      <select id="mainAssignee">
        <option value="">-- 選択 --</option>
        ${memberOptions}
      </select>
    </div>
    <div class="field-row">
      <label>サブ担当</label>
      <select id="subAssignee">
        <option value="">-- 選択 --</option>
        ${memberOptions}
      </select>
    </div>

    <div class="actions" style="margin-top: 20px;">
      <button class="btn btn-primary" onclick="saveToList()">💾 企業情報一覧に追加</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
    </div>
  </div>

  ${CI_UI_COMPONENTS}
  <script>
    // テンプレート（サーバーから動的に取得）
    const templateText = ${templateJson};

    // 初期化
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('templateText').textContent = templateText;
    });

    // テンプレートをコピー（toggleAccordion, copyToClipboard, showCopySuccessはuiComponents.htmlで提供）
    function copyTemplate() {
      const text = document.getElementById('templateText').textContent;
      copyToClipboard(text);
    }

    function parseInput() {
      const raw = document.getElementById('rawInput').value;
      if (!raw.trim()) {
        showParseStatus('貼り付け内容が空です', 'error');
        return;
      }

      const data = {};

      // 各フィールドを抽出
      const patterns = {
        companyName: /企業名[:：]\\s*(.+)/,
        contactName: /担当者名[:：]\\s*(.+)/,
        position: /役職・部署[:：]\\s*(.+)/,
        phone: /連絡先（電話）[:：]\\s*(.+)/,
        email: /連絡先（メール）[:：]\\s*(.+)/,
        contractDate: /契約開始日[:：]\\s*(.+)/,
        product: /受注商材[:：]\\s*(.+)/,
        contractPeriod: /契約期間[:：]\\s*(.+)/,
        contractAmount: /契約金額[:：]\\s*(.+)/,
        notes: /備考[:：]\\s*(.+)/,
        mainAssignee: /メイン担当[:：]\\s*(.+)/,
        subAssignee: /サブ担当[:：]\\s*(.*)/
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = raw.match(pattern);
        if (match) {
          data[key] = match[1].trim();
        }
      }

      // フィールドに値を設定
      document.getElementById('companyName').value = data.companyName || '';
      document.getElementById('contactName').value = data.contactName || '';
      document.getElementById('position').value = data.position || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('contractDate').value = data.contractDate || '';
      document.getElementById('product').value = data.product || 'ツナゲル';
      document.getElementById('contractPeriod').value = data.contractPeriod || '';
      document.getElementById('contractAmount').value = data.contractAmount || '';
      document.getElementById('notes').value = data.notes || '';

      // 担当者のセレクトボックス設定
      if (data.mainAssignee) {
        const mainSelect = document.getElementById('mainAssignee');
        for (let i = 0; i < mainSelect.options.length; i++) {
          if (mainSelect.options[i].value === data.mainAssignee) {
            mainSelect.selectedIndex = i;
            break;
          }
        }
      }
      if (data.subAssignee) {
        const subSelect = document.getElementById('subAssignee');
        for (let i = 0; i < subSelect.options.length; i++) {
          if (subSelect.options[i].value === data.subAssignee) {
            subSelect.selectedIndex = i;
            break;
          }
        }
      }

      document.getElementById('parseResult').style.display = 'block';
      showParseStatus('展開完了！内容を確認して保存してください', 'success');
    }

    function showParseStatus(message, type) {
      const status = document.getElementById('parseStatus');
      status.textContent = message;
      status.className = 'parse-status ' + type;
      status.style.display = 'block';
    }

    function saveToList() {
      const companyName = document.getElementById('companyName').value.trim();

      if (!companyName) {
        alert('企業名を入力してください');
        return;
      }

      const data = {
        companyName: companyName,
        contactName: document.getElementById('contactName').value.trim(),
        position: document.getElementById('position').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        contractDate: document.getElementById('contractDate').value.trim(),
        product: document.getElementById('product').value.trim(),
        contractPeriod: document.getElementById('contractPeriod').value.trim(),
        contractAmount: document.getElementById('contractAmount').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        mainAssignee: document.getElementById('mainAssignee').value,
        subAssignee: document.getElementById('subAssignee').value
      };

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showParseStatus('企業情報一覧に追加しました: ' + result.companyName, 'success');
            setTimeout(function() { google.script.host.close(); }, 1500);
          } else {
            showParseStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showParseStatus('エラー: ' + error.message, 'error');
        })
        .addCompanyInfoToList(data);
    }
  </script>
</body>
</html>
`;
}

/**
 * 企業情報を企業情報一覧シートに追加
 * ■で始まるセクション列はスキップしてデータを配置
 */
function addCompanyInfoToList(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

    if (!sheet) {
      return { success: false, error: '「企業情報一覧」シートが見つかりません' };
    }

    // ヘッダー行を取得
    const lastCol = sheet.getLastColumn();
    if (lastCol < 1) {
      return { success: false, error: '企業情報一覧シートにヘッダーがありません' };
    }
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // 同じ企業名が既に存在するかチェック
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const existingCompanies = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      // 企業名列を探す
      let companyNameColIndex = -1;
      for (let i = 0; i < headers.length; i++) {
        if (String(headers[i]).trim() === '企業名') {
          companyNameColIndex = i;
          break;
        }
      }
      if (companyNameColIndex >= 0) {
        for (const row of existingCompanies) {
          if (String(row[companyNameColIndex]).trim() === data.companyName) {
            return { success: false, error: '「' + data.companyName + '」は既に登録されています' };
          }
        }
      }
    }

    // フィールド名とデータのマッピング
    const fieldMapping = {
      '企業名': data.companyName || '',
      '担当者名': data.contactName || '',
      '役職・部署': data.position || '',
      '連絡先（電話）': data.phone || '',
      '連絡先（メール）': data.email || '',
      '契約開始日': data.contractDate || '',
      '受注商材': data.product || '',
      '契約期間': data.contractPeriod || '',
      '契約金額': data.contractAmount || '',
      '備考': data.notes || '',
      'メイン担当': data.mainAssignee || '',
      'サブ担当': data.subAssignee || ''
    };

    // 新しい行を作成（■列はスキップ）
    const newRow = [];
    for (const header of headers) {
      const h = String(header).trim();
      if (h.startsWith('■')) {
        // セクション区切り列は空文字
        newRow.push('');
      } else if (fieldMapping.hasOwnProperty(h)) {
        newRow.push(fieldMapping[h]);
      } else {
        newRow.push('');
      }
    }

    sheet.appendRow(newRow);

    return { success: true, companyName: data.companyName };

  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ================================================================================
// ===== 2. 受注・キックオフ連絡 =====
// ================================================================================

function showOrderReportDialog() {
  const members = getMemberList();

  // 企業情報一覧から企業リストを取得
  const companyResult = getCompanyListFromSheet();
  let companies = [];
  if (companyResult.success && companyResult.companies.length > 0) {
    companies = companyResult.companies;
  }

  // アクティブシート情報を取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheetName = ss.getActiveSheet().getName();

  // システムシートかどうか判定
  const systemSheets = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
  const isSystemSheet = systemSheets.some(s => activeSheetName === s || activeSheetName.includes('ヒアリングシート') || activeSheetName.includes('原本'));

  // 企業リストにアクティブ情報を付与（逆順ソート + アクティブ最上段）
  const activeCompanyName = isSystemSheet ? null : activeSheetName;

  const html = HtmlService.createHtmlOutput(createOrderReportHTML(members, companies, activeCompanyName))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📢 受注・キックオフ連絡');
}

function createOrderReportHTML(members, companies, activeCompanyName) {
  const defaultMentions = ['河合', '中尾文香'];
  const defaultCC = ['青柳'];

  // メンバーリストをJSON形式で渡す
  const membersJson = JSON.stringify(members.map(m => escapeHtmlAttrCI(m)));

  // 企業リストをソート（アクティブ最上段、残りは逆順=新しいものが上）
  const sortedCompanies = companies.slice().sort((a, b) => {
    if (a.name === activeCompanyName) return -1;
    if (b.name === activeCompanyName) return 1;
    // 逆順（rowIndexが大きい=下の行=新しいものが上）
    return b.rowIndex - a.rowIndex;
  });

  // 企業リストをJSON形式で渡す
  const companiesJson = JSON.stringify(sortedCompanies.map(c => ({
    name: escapeHtmlAttrCI(c.name),
    isActive: c.name === activeCompanyName
  })));

  // 企業リストがあるかどうかでUIを切り替え
  const hasCompanies = companies.length > 0;
  const activeCompanyJson = JSON.stringify(activeCompanyName || '');

  return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <p class="description">グループ作成後に新規受注をワークスで報告</p>

  <!-- テンプレート（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">コピー</button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText">今後の連絡はこちらのグループで行います。

@{{宛先}} cc:@{{CC}}
新規受注です。
{{企業名}}様、ツナゲル12ヶ月契約。
初回打ち合わせは調整中です。
日程が決まり次第企業詳細と共にご連絡します！</div>
    </div>
  </div>

  <!-- 入力セクション -->
  <div class="input-section">
    <div class="form-row">
      <div class="form-group half">
        <label>宛先</label>
        <div class="multi-select-wrapper">
          <div class="multi-select-display" id="mentionDisplay" onclick="toggleDropdown('mention')">
            <span class="placeholder">選択してください</span>
          </div>
          <div class="multi-select-dropdown" id="mentionDropdown"></div>
        </div>
      </div>

      <div class="form-group half">
        <label>CC</label>
        <div class="multi-select-wrapper">
          <div class="multi-select-display" id="ccDisplay" onclick="toggleDropdown('cc')">
            <span class="placeholder">選択してください</span>
          </div>
          <div class="multi-select-dropdown" id="ccDropdown"></div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>企業名</label>
      ${hasCompanies ? `
      <div class="input-mode-toggle">
        <label><input type="radio" name="inputMode" value="select" checked onchange="toggleInputMode()"> 一覧から選択</label>
        <label><input type="radio" name="inputMode" value="manual" onchange="toggleInputMode()"> 手入力</label>
      </div>
      <div class="company-input-area">
        <div class="company-select-wrapper" id="companySelectWrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業を選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
        <input type="text" id="companyManual" placeholder="株式会社○○" style="display:none;" oninput="updatePreview()">
      </div>
      ` : `
      <input type="text" id="companyManual" placeholder="株式会社○○" oninput="updatePreview()">
      <div class="hint">企業情報一覧にデータがありません</div>
      `}
    </div>
  </div>

  <!-- プレビューセクション -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー</span>
      <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" style="display:none;">コピー</button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">企業名を選択するとプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  ${CI_UI_COMPONENTS}
  <script>
    const hasCompanies = ${hasCompanies};
    const members = ${membersJson};
    const defaultMentions = ${JSON.stringify(defaultMentions)};
    const defaultCC = ${JSON.stringify(defaultCC)};
    const companies = ${companiesJson};
    const activeCompanyName = ${activeCompanyJson};
    let selectedCompany = null;

    // ドロップダウン初期化
    function initDropdowns() {
      createDropdown('mention', defaultMentions);
      createDropdown('cc', defaultCC);
      if (hasCompanies) {
        initCompanyDropdown();
      }
    }

    function createDropdown(name, defaults) {
      const dropdown = document.getElementById(name + 'Dropdown');
      dropdown.innerHTML = '';
      for (const member of members) {
        const checked = defaults.includes(member) ? 'checked' : '';
        const item = document.createElement('div');
        item.className = 'multi-select-item';
        item.innerHTML = \`
          <input type="checkbox" id="\${name}_\${member}" name="\${name}" value="\${member}" \${checked} onchange="updateDisplay('\${name}')">
          <label for="\${name}_\${member}">\${member}</label>
        \`;
        item.onclick = function(e) {
          if (e.target.tagName !== 'INPUT') {
            const cb = item.querySelector('input');
            cb.checked = !cb.checked;
            updateDisplay(name);
          }
        };
        dropdown.appendChild(item);
      }
      updateDisplay(name);
    }

    function toggleDropdown(name) {
      const display = document.getElementById(name + 'Display');
      const dropdown = document.getElementById(name + 'Dropdown');
      const isOpen = dropdown.classList.contains('show');

      // 他のドロップダウンを閉じる
      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));

      if (!isOpen) {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function updateDisplay(name) {
      const display = document.getElementById(name + 'Display');
      const checked = Array.from(document.querySelectorAll(\`input[name="\${name}"]:checked\`)).map(cb => cb.value);

      if (checked.length === 0) {
        display.innerHTML = '<span class="placeholder">選択してください</span>';
      } else {
        display.innerHTML = checked.join(', ');
      }
      updatePreview();
    }

    // 外側クリックで閉じる
    document.addEventListener('click', function(e) {
      // 宛先・CCドロップダウン
      if (!e.target.closest('.multi-select-wrapper')) {
        document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));
      }
      // 企業選択ドロップダウン
      if (!e.target.closest('.company-select-wrapper')) {
        const dropdown = document.getElementById('companySelectDropdown');
        const display = document.getElementById('companySelectDisplay');
        if (dropdown) dropdown.classList.remove('show');
        if (display) display.classList.remove('active');
      }
    });

    function toggleInputMode() {
      if (!hasCompanies) return;
      const mode = document.querySelector('input[name="inputMode"]:checked').value;
      const selectWrapper = document.getElementById('companySelectWrapper');
      const manualEl = document.getElementById('companyManual');

      if (mode === 'select') {
        selectWrapper.style.display = 'block';
        manualEl.style.display = 'none';
      } else {
        selectWrapper.style.display = 'none';
        manualEl.style.display = 'block';
      }
      updatePreview();
    }

    function getCompanyName() {
      if (!hasCompanies) {
        return document.getElementById('companyManual').value.trim();
      }
      const mode = document.querySelector('input[name="inputMode"]:checked').value;
      if (mode === 'select') {
        return selectedCompany || '';
      } else {
        return document.getElementById('companyManual').value.trim();
      }
    }

    // ===== 企業選択ドロップダウン =====
    function initCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      companies.forEach((company, index) => {
        const item = document.createElement('div');
        item.className = 'company-select-item';
        item.dataset.name = company.name;

        const checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon';
        checkIcon.textContent = '';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'company-name';
        nameSpan.textContent = company.name;

        item.appendChild(checkIcon);
        item.appendChild(nameSpan);

        if (company.isActive) {
          const badge = document.createElement('span');
          badge.className = 'badge-active';
          badge.textContent = 'アクティブ';
          item.appendChild(badge);
        }

        item.onclick = function() {
          selectCompany(company.name);
        };

        dropdown.appendChild(item);
      });

      // アクティブ企業があれば自動選択
      if (activeCompanyName) {
        selectCompany(activeCompanyName);
      }
    }

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      // 他のドロップダウンを閉じる
      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectCompany(companyName) {
      selectedCompany = companyName;

      // 表示を更新
      const display = document.getElementById('companySelectDisplay');
      const activeCompany = companies.find(c => c.name === companyName);
      const activeBadge = activeCompany && activeCompany.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(companyName) + '</span>' + activeBadge;

      // リスト内のハイライトとチェック更新
      document.querySelectorAll('.company-select-item').forEach(item => {
        const isSelected = item.dataset.name === companyName;
        item.classList.toggle('selected', isSelected);
        item.querySelector('.check-icon').textContent = isSelected ? '✓' : '';
      });

      // ドロップダウンを閉じる
      document.getElementById('companySelectDropdown').classList.remove('show');
      document.getElementById('companySelectDisplay').classList.remove('active');

      updatePreview();
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function updatePreview() {
      const mentions = Array.from(document.querySelectorAll('input[name="mention"]:checked')).map(cb => '@' + cb.value);
      const ccs = Array.from(document.querySelectorAll('input[name="cc"]:checked')).map(cb => '@' + cb.value);
      const company = getCompanyName();

      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (!company) {
        preview.innerHTML = '<span class="preview-placeholder">企業名を選択するとプレビューが表示されます</span>';
        copyBtn.style.display = 'none';
        return;
      }

      let mentionStr = mentions.join(' ');
      if (ccs.length > 0) {
        mentionStr += ' cc:' + ccs.join(' ');
      }

      const result = \`今後の連絡はこちらのグループで行います。

\${mentionStr}
新規受注です。
\${company}様、ツナゲル12ヶ月契約。
初回打ち合わせは調整中です。
日程が決まり次第企業詳細と共にご連絡します！\`;

      preview.textContent = result;
      copyBtn.style.display = 'block';
    }

    function copyResult() {
      const text = document.getElementById('previewContent').textContent;
      if (!text) return;
      copyToClipboard(text);
    }

    // toggleAccordion, copyToClipboard, showCopySuccessはuiComponents.htmlで提供

    function copyTemplate() {
      const text = document.getElementById('templateText').textContent;
      copyToClipboard(text);
    }

    // 初期化
    initDropdowns();
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 3. 企業情報編集（企業情報一覧シートから読み書き） =====
// ================================================================================

/**
 * 企業情報一覧シートから企業リストを取得
 * ヘッダーから「企業名」列を動的に探す
 */
function getCompanyListFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  if (!sheet) {
    return { success: false, error: '「企業情報一覧」シートが見つかりません', companies: [] };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return { success: true, companies: [] };
  }

  // ヘッダー行から「企業名」列を探す
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let companyNameColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === '企業名') {
      companyNameColIndex = i;
      break;
    }
  }

  if (companyNameColIndex < 0) {
    return { success: false, error: '「企業名」列が見つかりません', companies: [] };
  }

  // 企業名列を取得（列番号は1始まりなので+1）
  const data = sheet.getRange(2, companyNameColIndex + 1, lastRow - 1, 1).getValues();
  const companies = [];

  for (let i = 0; i < data.length; i++) {
    const companyName = String(data[i][0] || '').trim();
    if (companyName) {
      companies.push({
        rowIndex: i + 2,  // 実際の行番号（ヘッダーが1行目なので+2）
        name: companyName
      });
    }
  }

  return { success: true, companies: companies };
}

/**
 * 企業情報一覧シートから指定行のデータを取得
 * ■で始まるセクション列はスキップして読み取る
 */
function getCompanyInfoFromList(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  if (!sheet) {
    return { success: false, error: '「企業情報一覧」シートが見つかりません' };
  }

  // ヘッダー行を取得
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return { success: false, error: '企業情報一覧シートにヘッダーがありません' };
  }
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const row = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];

  // ヘッダーからデータを取得（■列はスキップ）
  const data = {
    companyName: '',
    contactName: '',
    position: '',
    phone: '',
    email: '',
    contractDate: '',
    product: '',
    contractPeriod: '',
    contractAmount: '',
    notes: '',
    mainAssignee: '',
    subAssignee: ''
  };

  // フィールド名とdataキーのマッピング
  const headerToKey = {
    '企業名': 'companyName',
    '担当者名': 'contactName',
    '役職・部署': 'position',
    '連絡先（電話）': 'phone',
    '連絡先（メール）': 'email',
    '契約開始日': 'contractDate',
    '受注商材': 'product',
    '契約期間': 'contractPeriod',
    '契約金額': 'contractAmount',
    '備考': 'notes',
    'メイン担当': 'mainAssignee',
    'サブ担当': 'subAssignee'
  };

  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i]).trim();
    if (h.startsWith('■')) continue; // セクション列はスキップ
    if (headerToKey[h]) {
      data[headerToKey[h]] = String(row[i] || '');
    }
  }

  return { success: true, data: data };
}

/**
 * 企業情報一覧シートの指定行を更新
 * ■で始まるセクション列はスキップして更新
 */
function updateCompanyInfoInList(rowIndex, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

    if (!sheet) {
      return { success: false, error: '「企業情報一覧」シートが見つかりません' };
    }

    // ヘッダー行を取得
    const lastCol = sheet.getLastColumn();
    if (lastCol < 1) {
      return { success: false, error: '企業情報一覧シートにヘッダーがありません' };
    }
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // フィールド名とデータのマッピング
    const fieldMapping = {
      '企業名': data.companyName || '',
      '担当者名': data.contactName || '',
      '役職・部署': data.position || '',
      '連絡先（電話）': data.phone || '',
      '連絡先（メール）': data.email || '',
      '契約開始日': data.contractDate || '',
      '受注商材': data.product || '',
      '契約期間': data.contractPeriod || '',
      '契約金額': data.contractAmount || '',
      '備考': data.notes || '',
      'メイン担当': data.mainAssignee || '',
      'サブ担当': data.subAssignee || ''
    };

    // 既存行を取得して■列以外を更新
    const existingRow = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
    const rowData = [];
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i]).trim();
      if (h.startsWith('■')) {
        // セクション区切り列は既存値を維持（通常は空）
        rowData.push(existingRow[i] || '');
      } else if (fieldMapping.hasOwnProperty(h)) {
        rowData.push(fieldMapping[h]);
      } else {
        rowData.push(existingRow[i] || '');
      }
    }

    sheet.getRange(rowIndex, 1, 1, lastCol).setValues([rowData]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function showCompanyInfoEditDialog() {
  const result = getCompanyListFromSheet();
  if (!result.success) {
    SpreadsheetApp.getUi().alert('エラー', result.error + '\n\nメニュー「０.⚙️ 設定」→「📊 企業情報一覧を作成」を先に実行してください。', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const companies = result.companies;
  const members = getMemberList();
  const html = HtmlService.createHtmlOutput(createCompanyInfoEditHTML(companies, members))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '🏢 企業情報編集');
}

function createCompanyInfoEditHTML(companies, members) {
  let companyOptions = '<option value="">-- 企業を選択 --</option>';
  for (const company of companies) {
    companyOptions += `<option value="${company.rowIndex}">${escapeHtmlCI(company.name)}</option>`;
  }

  let memberOptions = '';
  for (const member of members) {
    memberOptions += `<option value="${escapeHtmlAttrCI(member)}">${escapeHtmlCI(member)}</option>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
</head>
<body>
  <h3>企業情報編集</h3>
  <p class="subtitle">企業情報一覧から編集します</p>

  <div class="form-group">
    <label>企業選択</label>
    <select id="companySelect" onchange="loadCompanyInfo()">
      ${companyOptions}
    </select>
    <div class="hint">企業情報一覧シートから読み込みます</div>
  </div>

  <div class="edit-form" id="editForm" style="display:none;">
    <div class="section-title">■ 基本情報</div>
    <div class="field-row">
      <label>企業名</label>
      <input type="text" id="companyName">
    </div>
    <div class="field-row">
      <label>担当者名</label>
      <input type="text" id="contactName">
    </div>
    <div class="field-row">
      <label>役職・部署</label>
      <input type="text" id="position">
    </div>
    <div class="field-row">
      <label>連絡先（電話）</label>
      <input type="text" id="phone">
    </div>
    <div class="field-row">
      <label>連絡先（メール）</label>
      <input type="text" id="email">
    </div>
    <div class="field-row">
      <label>契約開始日</label>
      <input type="text" id="contractDate">
    </div>

    <div class="section-title">■ 受注内容</div>
    <div class="field-row">
      <label>受注商材</label>
      <input type="text" id="product">
    </div>
    <div class="field-row">
      <label>契約期間</label>
      <input type="text" id="contractPeriod">
    </div>
    <div class="field-row">
      <label>契約金額</label>
      <input type="text" id="contractAmount">
    </div>
    <div class="field-row">
      <label>備考</label>
      <input type="text" id="notes">
    </div>

    <div class="section-title">■ 制作担当</div>
    <div class="field-row">
      <label>メイン担当</label>
      <select id="mainAssignee">
        <option value="">-- 選択 --</option>
        ${memberOptions}
      </select>
    </div>
    <div class="field-row">
      <label>サブ担当</label>
      <select id="subAssignee">
        <option value="">-- 選択 --</option>
        ${memberOptions}
      </select>
    </div>

    <div style="margin-top: 25px;">
      <button class="btn btn-primary" onclick="saveChanges()">💾 保存</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
    </div>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}
  <script>
    let currentRowIndex = null;

    function loadCompanyInfo() {
      const rowIndex = document.getElementById('companySelect').value;
      if (!rowIndex) {
        document.getElementById('editForm').style.display = 'none';
        currentRowIndex = null;
        return;
      }

      currentRowIndex = parseInt(rowIndex);

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            const data = result.data;
            document.getElementById('companyName').value = data.companyName || '';
            document.getElementById('contactName').value = data.contactName || '';
            document.getElementById('position').value = data.position || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('contractDate').value = data.contractDate || '';
            document.getElementById('product').value = data.product || '';
            document.getElementById('contractPeriod').value = data.contractPeriod || '';
            document.getElementById('contractAmount').value = data.contractAmount || '';
            document.getElementById('notes').value = data.notes || '';

            setSelectValue('mainAssignee', data.mainAssignee || '');
            setSelectValue('subAssignee', data.subAssignee || '');

            document.getElementById('editForm').style.display = 'block';
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .getCompanyInfoFromList(currentRowIndex);
    }

    function setSelectValue(selectId, value) {
      const select = document.getElementById(selectId);
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) {
          select.selectedIndex = i;
          return;
        }
      }
      select.selectedIndex = 0;
    }

    function saveChanges() {
      if (!currentRowIndex) {
        showStatus('企業を選択してください', 'error');
        return;
      }

      const data = {
        companyName: document.getElementById('companyName').value.trim(),
        contactName: document.getElementById('contactName').value.trim(),
        position: document.getElementById('position').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        contractDate: document.getElementById('contractDate').value.trim(),
        product: document.getElementById('product').value.trim(),
        contractPeriod: document.getElementById('contractPeriod').value.trim(),
        contractAmount: document.getElementById('contractAmount').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        mainAssignee: document.getElementById('mainAssignee').value,
        subAssignee: document.getElementById('subAssignee').value
      };

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました', 'success');
            // ドロップダウンの表示名も更新
            const select = document.getElementById('companySelect');
            select.options[select.selectedIndex].text = data.companyName;
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .updateCompanyInfoInList(currentRowIndex, data);
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
// ===== 4. 企業情報一覧反映 =====
// ================================================================================

/**
 * 企業シートから情報を収集して企業情報一覧シートに反映
 */
function syncCompanyListSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

  // シートがない場合はエラー
  if (!sheet) {
    ui.alert('エラー',
      '「企業情報一覧」シートが見つかりません。\n\n' +
      'メニュー「０.⚙️ 設定」→「📊 企業情報一覧を作成」を先に実行してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // 確認ダイアログ
  const response = ui.alert(
    '確認',
    '企業シートから情報を収集して「企業情報一覧」シートに反映します。\n\n' +
    '既存のデータは上書きされます。\n続行しますか？',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) {
    return;
  }

  // ヘッダー行以外をクリア
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 12).clearContent();
    sheet.getRange(2, 1, lastRow - 1, 12).setBackground(null);
  }

  // 企業シートから情報を収集
  const companySheets = getCompanySheetListForCompanyInfo();
  const companyData = [];

  for (const sheetName of companySheets) {
    const result = getCompanyInfoFromSheet(sheetName);
    if (result.success) {
      const d = result.data;
      companyData.push([
        d.companyName || sheetName,
        d.contactName || '',
        d.position || '',
        d.phone || '',
        d.email || '',
        d.contractDate || '',
        d.product || '',
        d.contractPeriod || '',
        d.contractAmount || '',
        d.notes || '',
        d.mainAssignee || '',
        d.subAssignee || ''
      ]);
    }
  }

  // データを書き込み
  if (companyData.length > 0) {
    sheet.getRange(2, 1, companyData.length, 12).setValues(companyData);

    // 交互の行色
    for (let i = 0; i < companyData.length; i++) {
      if (i % 2 === 1) {
        sheet.getRange(i + 2, 1, 1, 12).setBackground('#f8f9fa');
      }
    }
  }

  ui.alert('完了',
    '企業情報一覧を更新しました。\n\n' +
    '・' + companyData.length + '件の企業情報を反映',
    ui.ButtonSet.OK
  );
}


// ================================================================================
// ===== 5. 日程調整・フォーム記入メール =====
// ================================================================================

/**
 * 日程調整・フォーム記入依頼メールダイアログを表示
 */
function showScheduleEmailDialog() {
  const members = getMemberList();

  // 企業情報一覧から企業リストを取得
  const companyResult = getCompanyListFromSheet();
  let companies = [];
  if (companyResult.success && companyResult.companies.length > 0) {
    companies = companyResult.companies;
  }

  // アクティブシート情報を取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheetName = ss.getActiveSheet().getName();

  // システムシートかどうか判定
  const systemSheets = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
  const isSystemSheet = systemSheets.some(s => activeSheetName === s || activeSheetName.includes('ヒアリングシート') || activeSheetName.includes('原本'));

  // 企業リストにアクティブ情報を付与（逆順ソート + アクティブ最上段）
  const activeCompanyName = isSystemSheet ? null : activeSheetName;

  // フォームURLを取得
  const formUrl = getFormUrlFromSettings();

  const html = HtmlService.createHtmlOutput(createScheduleRequestHTML(members, companies, activeCompanyName, formUrl))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📩 日程調整・フォーム記入依頼メール');
}

// getFormUrlFromSettings() は settingsSheet.js で定義（重複削除）

/**
 * 企業情報一覧から担当者情報を取得
 * - contactName: 企業の担当者名（連絡先）
 * - mainAssignee: 制作メイン担当
 * - subAssignee: 制作サブ担当
 */
function getCompanyAssigneesFromList(companyName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(COMPANY_LIST_SHEET_NAME);

    if (!sheet) {
      return { success: false, contactName: '', mainAssignee: '', subAssignee: '' };
    }

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      return { success: false, contactName: '', mainAssignee: '', subAssignee: '' };
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // 列インデックスを探す
    let companyNameColIndex = -1;
    let contactNameColIndex = -1;
    let mainAssigneeColIndex = -1;
    let subAssigneeColIndex = -1;

    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i]).trim();
      if (h === '企業名') companyNameColIndex = i;
      if (h === '担当者名') contactNameColIndex = i;
      if (h === 'メイン担当') mainAssigneeColIndex = i;
      if (h === 'サブ担当') subAssigneeColIndex = i;
    }

    if (companyNameColIndex < 0) {
      return { success: false, contactName: '', mainAssignee: '', subAssignee: '' };
    }

    // 企業名で検索
    for (const row of data) {
      if (String(row[companyNameColIndex]).trim() === companyName) {
        return {
          success: true,
          contactName: contactNameColIndex >= 0 ? String(row[contactNameColIndex] || '') : '',
          mainAssignee: mainAssigneeColIndex >= 0 ? String(row[mainAssigneeColIndex] || '') : '',
          subAssignee: subAssigneeColIndex >= 0 ? String(row[subAssigneeColIndex] || '') : ''
        };
      }
    }

    return { success: false, contactName: '', mainAssignee: '', subAssignee: '' };
  } catch (e) {
    return { success: false, contactName: '', mainAssignee: '', subAssignee: '' };
  }
}

function createScheduleRequestHTML(members, companies, activeCompanyName, formUrl) {
  const defaultParticipants = ['渡邉', '河合'];

  // メンバーリストをJSON形式で渡す
  const membersJson = JSON.stringify(members.map(m => escapeHtmlAttrCI(m)));

  // 企業リストをソート（アクティブ最上段、残りは逆順=新しいものが上）
  const sortedCompanies = companies.slice().sort((a, b) => {
    if (a.name === activeCompanyName) return -1;
    if (b.name === activeCompanyName) return 1;
    return b.rowIndex - a.rowIndex;
  });

  // 企業リストをJSON形式で渡す
  const companiesJson = JSON.stringify(sortedCompanies.map(c => ({
    name: escapeHtmlAttrCI(c.name),
    isActive: c.name === activeCompanyName
  })));

  const hasCompanies = companies.length > 0;
  const activeCompanyJson = JSON.stringify(activeCompanyName || '');
  const formUrlJson = JSON.stringify(formUrl || '');

  // テンプレート
  const templateText = `件名：【日程調整】初回お打ち合わせのご案内

{{企業名}}
{{担当者名}}様

お世話になっております。
株式会社Singの渡邉です。

この度は採用支援サービス「ツナゲル」をご契約いただき、
誠にありがとうございます。

早速ですが、初回お打ち合わせの日程調整をさせていただきたく
ご連絡いたしました。

下記日程にてご都合いかがでしょうか。

━━━━━━━━━━━━━━━━━━━━
【候補日程】
{{候補日程}}
━━━━━━━━━━━━━━━━━━━━

【打ち合わせ方法】
Google Meetにて実施（約60分）
※URLは日程確定後にお送りいたします

【参加者（弊社）】
{{参加者}}

━━━━━━━━━━━━━━━━━━━━

【撮影日程について】
打ち合わせ時に撮影日程を決められればと思いますので、
以下について事前にご確認いただけますと幸いです。
・撮影にご参加いただく方（インタビュー対象者）2〜3名
・その方々の〇月〜〇月のご都合
・撮影場所（御社内 or 別会場）
・駐車場の有無

━━━━━━━━━━━━━━━━━━━━

また、打ち合わせをより充実したものにするため、
事前に下記ヒアリングシートへのご回答をお願いいたします。

▼ヒアリングシート（Googleフォーム）
{{フォームURL}}

【所要時間】約15〜20分程度
【ご回答期限】初回お打ち合わせ日の前日まで

ご不明な点がございましたら、
お気軽にお問い合わせください。

何卒よろしくお願いいたします。`;

  return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <p class="description">先方へ初回打ち合わせの日程調整メールを作成</p>

  <!-- テンプレート（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <div class="accordion-title">
        <span class="accordion-arrow" id="arrow">▶</span>
        <span>テンプレートを表示</span>
      </div>
      <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">コピー</button>
    </div>
    <div class="accordion-content" id="accordionContent">
      <div class="template-text" id="templateText">${escapeHtmlCI(templateText)}</div>
    </div>
  </div>

  <!-- 入力セクション -->
  <div class="input-section">
    <div class="form-group">
      <label>企業名</label>
      ${hasCompanies ? `
      <div class="input-mode-toggle">
        <label><input type="radio" name="inputMode" value="select" checked onchange="toggleInputMode()"> 一覧から選択</label>
        <label><input type="radio" name="inputMode" value="manual" onchange="toggleInputMode()"> 手入力</label>
      </div>
      <div class="company-input-area">
        <div class="company-select-wrapper" id="companySelectWrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業を選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
        <input type="text" id="companyManual" placeholder="株式会社○○" style="display:none;" oninput="updatePreview()">
      </div>
      ` : `
      <input type="text" id="companyManual" placeholder="株式会社○○" oninput="updatePreview()">
      <div class="hint">企業情報一覧にデータがありません</div>
      `}
    </div>

    <div class="form-group">
      <label>担当者名</label>
      <input type="text" id="contactName" placeholder="○○様" oninput="updatePreview()">
      <div class="hint" id="assigneeHint" style="display:none;"></div>
    </div>

    <div class="form-group">
      <label>候補日程</label>
      <div class="date-picker-list" id="datePickerList">
        <div class="date-picker-row">
          <input type="date" onchange="updatePreview()">
          <input type="time" value="10:00" onchange="updatePreview()">
          <span>〜</span>
          <input type="text" placeholder="備考（任意）" oninput="updatePreview()">
          <button class="btn-delete" onclick="removeDate(this)">×</button>
        </div>
        <div class="date-picker-row">
          <input type="date" onchange="updatePreview()">
          <input type="time" value="14:00" onchange="updatePreview()">
          <span>〜</span>
          <input type="text" placeholder="備考（任意）" oninput="updatePreview()">
          <button class="btn-delete" onclick="removeDate(this)">×</button>
        </div>
        <div class="date-picker-row">
          <input type="date" onchange="updatePreview()">
          <input type="time" value="10:00" onchange="updatePreview()">
          <span>〜</span>
          <input type="text" placeholder="備考（任意）" oninput="updatePreview()">
          <button class="btn-delete" onclick="removeDate(this)">×</button>
        </div>
      </div>
      <button class="btn-add-date" onclick="addDate()">＋ 候補日を追加</button>
    </div>

    <div class="form-group">
      <label>参加者（弊社）</label>
      <div class="participant-chips" id="participantChips"></div>
    </div>

    <div class="form-group">
      <label>ヒアリングフォームURL</label>
      <input type="text" id="formUrl" placeholder="https://forms.google.com/..." oninput="updatePreview()">
      <div class="hint">設定シートから自動取得されます</div>
    </div>
  </div>

  <!-- プレビューセクション -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー</span>
      <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" style="display:none;">コピー</button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">企業名を入力するとプレビューが表示されます</span>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  ${CI_UI_COMPONENTS}
  <script>
    const hasCompanies = ${hasCompanies};
    const members = ${membersJson};
    const defaultParticipants = ${JSON.stringify(defaultParticipants)};
    const companies = ${companiesJson};
    const activeCompanyName = ${activeCompanyJson};
    const defaultFormUrl = ${formUrlJson};
    let selectedCompany = null;

    // 初期化
    document.addEventListener('DOMContentLoaded', function() {
      initParticipantChips();
      if (hasCompanies) {
        initCompanyDropdown();
      }
      document.getElementById('formUrl').value = defaultFormUrl;
      updatePreview();
    });

    // 参加者チップの初期化
    function initParticipantChips() {
      const container = document.getElementById('participantChips');
      container.innerHTML = '';
      for (const member of members) {
        const checked = defaultParticipants.includes(member);
        const chip = document.createElement('label');
        chip.className = 'participant-chip' + (checked ? ' selected' : '');
        chip.innerHTML = \`
          <input type="checkbox" name="participant" value="\${member}" \${checked ? 'checked' : ''} onchange="toggleChip(this)">
          \${member}
        \`;
        container.appendChild(chip);
      }
    }

    function toggleChip(checkbox) {
      const chip = checkbox.closest('.participant-chip');
      chip.classList.toggle('selected', checkbox.checked);
      updatePreview();
    }

    // 企業選択ドロップダウン
    function initCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      companies.forEach((company) => {
        const item = document.createElement('div');
        item.className = 'company-select-item';
        item.dataset.name = company.name;

        const checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon';
        checkIcon.textContent = '';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'company-name';
        nameSpan.textContent = company.name;

        item.appendChild(checkIcon);
        item.appendChild(nameSpan);

        if (company.isActive) {
          const badge = document.createElement('span');
          badge.className = 'badge-active';
          badge.textContent = 'アクティブ';
          item.appendChild(badge);
        }

        item.onclick = function() { selectCompany(company.name); };
        dropdown.appendChild(item);
      });

      // アクティブ企業があれば自動選択
      if (activeCompanyName) {
        selectCompany(activeCompanyName);
      }
    }

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectCompany(companyName) {
      selectedCompany = companyName;

      const display = document.getElementById('companySelectDisplay');
      const activeCompany = companies.find(c => c.name === companyName);
      const activeBadge = activeCompany && activeCompany.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(companyName) + '</span>' + activeBadge;

      document.querySelectorAll('.company-select-item').forEach(item => {
        const isSelected = item.dataset.name === companyName;
        item.classList.toggle('selected', isSelected);
        item.querySelector('.check-icon').textContent = isSelected ? '✓' : '';
      });

      document.getElementById('companySelectDropdown').classList.remove('show');
      document.getElementById('companySelectDisplay').classList.remove('active');

      // 担当者名を自動取得
      loadCompanyAssignees(companyName);

      updatePreview();
    }

    function loadCompanyAssignees(companyName) {
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success && result.contactName) {
            document.getElementById('contactName').value = result.contactName;
            updatePreview();
          }
        })
        .getCompanyAssigneesFromList(companyName);
    }

    function toggleInputMode() {
      if (!hasCompanies) return;
      const mode = document.querySelector('input[name="inputMode"]:checked').value;
      const selectWrapper = document.getElementById('companySelectWrapper');
      const manualEl = document.getElementById('companyManual');

      if (mode === 'select') {
        selectWrapper.style.display = 'block';
        manualEl.style.display = 'none';
      } else {
        selectWrapper.style.display = 'none';
        manualEl.style.display = 'block';
      }
      updatePreview();
    }

    function getCompanyName() {
      if (!hasCompanies) {
        return document.getElementById('companyManual').value.trim();
      }
      const mode = document.querySelector('input[name="inputMode"]:checked').value;
      if (mode === 'select') {
        return selectedCompany || '';
      } else {
        return document.getElementById('companyManual').value.trim();
      }
    }

    // 日程ピッカー
    function addDate() {
      const list = document.getElementById('datePickerList');
      const row = document.createElement('div');
      row.className = 'date-picker-row';
      row.innerHTML = \`
        <input type="date" onchange="updatePreview()">
        <input type="time" value="10:00" onchange="updatePreview()">
        <span>〜</span>
        <input type="text" placeholder="備考（任意）" oninput="updatePreview()">
        <button class="btn-delete" onclick="removeDate(this)">×</button>
      \`;
      list.appendChild(row);
    }

    function removeDate(btn) {
      const list = document.getElementById('datePickerList');
      if (list.children.length > 1) {
        btn.closest('.date-picker-row').remove();
        updatePreview();
      }
    }

    function getDates() {
      const rows = document.querySelectorAll('.date-picker-row');
      const dates = [];
      rows.forEach(row => {
        const dateInput = row.querySelector('input[type="date"]');
        const timeInput = row.querySelector('input[type="time"]');
        const noteInput = row.querySelector('input[type="text"]');

        if (dateInput.value) {
          const d = new Date(dateInput.value);
          const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
          const formatted = (d.getMonth() + 1) + '月' + d.getDate() + '日（' + weekdays[d.getDay()] + '）' + timeInput.value + '〜';
          const note = noteInput.value.trim();
          dates.push(note ? formatted + ' ' + note : formatted);
        }
      });
      return dates;
    }

    function updatePreview() {
      const company = getCompanyName();
      const contactName = document.getElementById('contactName').value.trim() || '○○様';
      const dates = getDates();
      const participants = Array.from(document.querySelectorAll('input[name="participant"]:checked')).map(cb => cb.value);
      const formUrl = document.getElementById('formUrl').value.trim();

      const preview = document.getElementById('previewContent');
      const copyBtn = document.getElementById('copyResultBtn');

      if (!company) {
        preview.innerHTML = '<span class="preview-placeholder">企業名を入力するとプレビューが表示されます</span>';
        copyBtn.style.display = 'none';
        return;
      }

      const dateLines = dates.length > 0 ? dates.map(d => '・' + d).join('\\n') : '・（候補日を入力してください）';
      const participantStr = participants.length > 0 ? participants.join('、') : '（参加者を選択してください）';

      const result = \`件名：【日程調整】初回お打ち合わせのご案内

\${company}
\${contactName}

お世話になっております。
株式会社Singの渡邉です。

この度は採用支援サービス「ツナゲル」をご契約いただき、
誠にありがとうございます。

早速ですが、初回お打ち合わせの日程調整をさせていただきたく
ご連絡いたしました。

下記日程にてご都合いかがでしょうか。

━━━━━━━━━━━━━━━━━━━━
【候補日程】
\${dateLines}
━━━━━━━━━━━━━━━━━━━━

【打ち合わせ方法】
Google Meetにて実施（約60分）
※URLは日程確定後にお送りいたします

【参加者（弊社）】
\${participantStr}

━━━━━━━━━━━━━━━━━━━━

また、打ち合わせをより充実したものにするため、
事前に下記ヒアリングシートへのご回答をお願いいたします。

▼ヒアリングシート（Googleフォーム）
\${formUrl || '（フォームURLを入力してください）'}

【所要時間】約15〜20分程度
【ご回答期限】初回お打ち合わせ日の前日まで

ご不明な点がございましたら、
お気軽にお問い合わせください。

何卒よろしくお願いいたします。\`;

      preview.textContent = result;
      copyBtn.style.display = 'block';
    }

    function copyResult() {
      const text = document.getElementById('previewContent').textContent;
      if (!text) return;
      copyToClipboard(text);
    }

    function copyTemplate() {
      const text = document.getElementById('templateText').textContent;
      copyToClipboard(text);
    }
  </script>
</body>
</html>
`;
}
