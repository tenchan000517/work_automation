/**
 * 共通ダイアログスタイル・UIコンポーネント
 *
 * 【使用方法】
 * 各GASファイルのHTML生成部分で以下のように使用:
 *
 * return `
 * <!DOCTYPE html>
 * <html>
 * <head>
 * ${CI_DIALOG_STYLES}
 * </head>
 * <body>
 *   ...
 *   ${CI_UI_COMPONENTS}
 * </body>
 * </html>
 * `;
 *
 * 【提供する機能】
 * CI_DIALOG_STYLES:
 *   - ベーススタイル（フォント、背景、余白）
 *   - フォーム要素（input, textarea, select, button）
 *   - アコーディオン（カード形式）
 *   - コンパクトドロップダウン（担当者選択）
 *   - 企業選択ドロップダウン
 *   - プレビューセクション
 *   - ステータス表示、トースト
 *
 * CI_UI_COMPONENTS:
 *   - copyToClipboard(text): クリップボードにコピー
 *   - showCopySuccess(): コピー成功トースト表示
 *   - toggleAccordion(): アコーディオン開閉
 *   - escapeHtml(str): HTMLエスケープ
 *   - 外側クリックでドロップダウンを閉じる
 */

// ================================================================================
// ===== 共通ダイアログスタイル =====
// ================================================================================

const CI_DIALOG_STYLES = `
<style>
  /* ===== ベーススタイル ===== */
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Hiragino Sans', Tahoma, sans-serif;
    margin: 0;
    padding: 16px;
    background: #f8f9fa;
    font-size: 14px;
  }

  h3 { margin: 0 0 5px 0; color: #333; font-size: 16px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
  .description { color: #666; font-size: 14px; margin-bottom: 16px; }

  /* ===== フォーム基本 ===== */
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-weight: bold; margin-bottom: 6px; color: #333; }
  .form-group .hint { font-size: 12px; color: #888; margin-top: 4px; }

  .form-row { display: flex; gap: 16px; margin-bottom: 14px; }
  .form-group.half { flex: 1; margin-bottom: 0; }

  input[type="text"],
  input[type="email"],
  input[type="date"],
  input[type="datetime-local"],
  textarea,
  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  textarea { min-height: 80px; resize: vertical; }

  /* ===== フィールド行（横並びラベル） ===== */
  .field-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
  .field-row label { width: 130px; font-weight: bold; font-size: 13px; flex-shrink: 0; }
  .field-row input, .field-row select { flex: 1; }
  .section-title { font-weight: bold; color: #1a73e8; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #1a73e8; }

  /* ===== ボタン ===== */
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-primary { background: #1a73e8; color: white; padding: 12px 24px; font-size: 14px; }
  .btn-primary:hover { background: #1557b0; }
  .btn-secondary { background: #f1f3f4; color: #333; padding: 12px 24px; font-size: 14px; }
  .btn-secondary:hover { background: #e0e0e0; }
  .btn-blue { background: #3b82f6; color: white; }
  .btn-blue:hover { background: #2563eb; }
  .btn-green { background: #22c55e; color: white; }
  .btn-green:hover { background: #16a34a; }
  .btn-gray { background: #e5e7eb; color: #374151; }
  .btn-gray:hover { background: #d1d5db; }
  .btn-copy { background: #34a853; color: white; }
  .btn-copy:hover { background: #2d8e47; }
  .btn-parse { background: #ff9800; color: white; }
  .btn-parse:hover { background: #f57c00; }
  .btn-add { background: #e8f5e9; color: #2e7d32; }
  .btn-add:hover { background: #c8e6c9; }
  .btn-delete { background: #ffebee; color: #c62828; }
  .btn-delete:hover { background: #ffcdd2; }

  .actions { display: flex; gap: 10px; margin-top: 20px; }

  /* ===== ステータス表示 ===== */
  .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
  .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
  .status.error { display: block; background: #ffebee; color: #c62828; }

  .parse-status { padding: 10px; border-radius: 4px; margin: 10px 0; display: none; }
  .parse-status.success { display: block; background: #e8f5e9; color: #2e7d32; }
  .parse-status.error { display: block; background: #ffebee; color: #c62828; }

  /* ===== コピー成功トースト ===== */
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
  .copy-success.show { opacity: 1; }

  /* ===== 情報ボックス ===== */
  .info-box {
    background: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 15px;
  }
  .info-box .icon { margin-right: 8px; }

  /* ===== アコーディオン（カード形式） ===== */
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
  .accordion-header:hover { background: #f5f5f5; border-radius: 8px; }
  .accordion-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #333;
  }
  .accordion-arrow { transition: transform 0.2s; }
  .accordion-arrow.open { transform: rotate(90deg); }
  .accordion-content {
    display: none;
    padding: 0 16px 16px;
    border-top: 1px solid #eee;
  }
  .accordion-content.open { display: block; }
  .template-text {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
    margin-top: 12px;
  }
  .template-hint { font-size: 11px; color: #888; margin-top: 8px; }

  /* ===== 入力セクション（カード形式） ===== */
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
    margin-bottom: 12px;
    display: block;
  }

  /* ===== 入力モード切り替え ===== */
  .input-mode-toggle { display: flex; gap: 12px; margin-bottom: 8px; }
  .input-mode-toggle label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px; font-weight: normal; }
  .company-input-area { margin-top: 6px; }

  /* ===== コンパクトドロップダウン（担当者選択） ===== */
  .multi-select-wrapper { position: relative; }
  .multi-select-display {
    width: 100%;
    padding: 10px 30px 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;
    min-height: 40px;
    position: relative;
  }
  .multi-select-display:hover { border-color: #3b82f6; }
  .multi-select-display.active { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .multi-select-display::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #666;
  }
  .multi-select-display .placeholder { color: #999; }
  .multi-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 100;
    display: none;
    max-height: 180px;
    overflow-y: auto;
    margin-top: 2px;
  }
  .multi-select-dropdown.show { display: block; }
  .multi-select-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    font-size: 14px;
  }
  .multi-select-item:hover { background: #f5f5f5; }
  .multi-select-item input { margin: 0; cursor: pointer; }
  .multi-select-item label { cursor: pointer; flex: 1; margin: 0; font-weight: normal; }

  /* ===== 企業選択ドロップダウン ===== */
  .company-select-wrapper { position: relative; }
  .company-select-display {
    width: 100%;
    padding: 10px 30px 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  .company-select-display:hover { border-color: #3b82f6; }
  .company-select-display.active { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .company-select-display::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #666;
    transition: transform 0.2s;
  }
  .company-select-display.active::after { transform: translateY(-50%) rotate(180deg); }
  .company-select-display .placeholder { color: #999; }
  .company-select-display .selected-check { color: #22c55e; font-size: 16px; }
  .company-select-display .selected-name { flex: 1; }
  .company-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 100;
    display: none;
    max-height: 220px;
    overflow-y: auto;
    margin-top: 2px;
  }
  .company-select-dropdown.show { display: block; }
  .company-select-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
  }
  .company-select-item:last-child { border-bottom: none; }
  .company-select-item:hover { background: #f5f5f5; }
  .company-select-item.selected { background: #e3f2fd; }
  .company-select-item .check-icon { width: 20px; color: #22c55e; font-size: 16px; }
  .company-select-item .company-name { flex: 1; }
  .badge-active { background: #4caf50; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }

  /* ===== プレビューセクション（カード形式） ===== */
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
  .preview-title { font-weight: 500; color: #333; }
  .preview-content {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 12px;
    font-size: 13px;
    white-space: pre-wrap;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    color: #333;
  }
  .preview-placeholder { color: #999; font-style: italic; }

  /* ===== 結果表示エリア（旧形式互換） ===== */
  .result-area { margin-top: 20px; display: none; }
  .result-area.show { display: block; }
  .result-box {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 15px;
    font-family: 'Consolas', monospace;
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 250px;
    overflow-y: auto;
  }

  /* ===== チェックボックスラベル（メンバー選択） ===== */
  .member-select {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 6px;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .checkbox-label:hover { border-color: #4285f4; background: #e8f0fe; }
  .checkbox-label:has(input:checked) {
    background: #e8f0fe;
    border-color: #4285f4;
    color: #1a73e8;
  }
  .checkbox-label input { margin: 0; cursor: pointer; }

  /* ===== フッター ===== */
  .footer {
    display: flex;
    justify-content: flex-end;
  }

  /* ===== 貼り付けエリア ===== */
  .section { margin-bottom: 15px; }
  .section .section-header {
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .input-area { height: 150px; }
  .output-area { height: 200px; background: #f8f9fa; }
  .note { font-size: 12px; color: #666; margin-top: 6px; }
  .btn-save {
    padding: 4px 12px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  .btn-save:hover { background: #e0e0e0; }

  /* ===== 日付ピッカー（候補日程用） ===== */
  .date-picker-list { margin-bottom: 8px; }
  .date-picker-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    align-items: center;
  }
  .date-picker-row input[type="date"] {
    width: 160px;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .date-picker-row input[type="time"] {
    width: 100px;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .date-picker-row input[type="text"] {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .date-picker-row .btn-delete {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #ffebee;
    color: #c62828;
    font-size: 14px;
  }
  .date-picker-row .btn-delete:hover { background: #ffcdd2; }
  .btn-add-date {
    background: #e8f5e9;
    color: #2e7d32;
    padding: 6px 12px;
    font-size: 13px;
    border: 1px solid #c8e6c9;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-add-date:hover { background: #c8e6c9; }

  /* ===== 参加者選択（横並びチップ） ===== */
  .participant-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 6px;
  }
  .participant-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
  }
  .participant-chip:hover { border-color: #4285f4; background: #e8f0fe; }
  .participant-chip.selected {
    background: #e8f0fe;
    border-color: #4285f4;
    color: #1a73e8;
  }
  .participant-chip input { margin: 0; cursor: pointer; }
</style>
`;

// ================================================================================
// ===== 共通UIコンポーネント =====
// ================================================================================

const CI_UI_COMPONENTS = `
<script>
// ===== クリップボード・トースト =====
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess();
  }).catch(err => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess();
  });
}

function showCopySuccess() {
  const msg = document.getElementById('copySuccess');
  if (msg) {
    msg.classList.add('show');
    setTimeout(() => { msg.classList.remove('show'); }, 2000);
  }
}

// ===== アコーディオン =====
function toggleAccordion() {
  toggleAccordionById('arrow', 'accordionContent');
}

function toggleAccordionById(arrowId, contentId) {
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);
  if (content && arrow) {
    content.classList.toggle('open');
    arrow.classList.toggle('open');
  }
}

// ===== HTMLエスケープ =====
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== 外側クリックでドロップダウンを閉じる =====
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.multi-select-wrapper')) {
      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));
    }
    if (!e.target.closest('.company-select-wrapper')) {
      document.querySelectorAll('.company-select-dropdown').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.company-select-display').forEach(d => d.classList.remove('active'));
    }
  });
});

// ================================================================================
// ===== 企業選択ドロップダウン共通関数 =====
// ================================================================================

/**
 * 企業選択ドロップダウンの設定を保持するグローバル変数
 */
let _companySelectConfig = null;

/**
 * 企業選択ドロップダウンを初期化
 * @param {Object} config - 設定オブジェクト
 * @param {string} config.displayId - 表示部分のID（デフォルト: 'companySelectDisplay'）
 * @param {string} config.dropdownId - ドロップダウンのID（デフォルト: 'companySelectDropdown'）
 * @param {Array} config.sheets - 企業シート配列（{sheetName, companyName, ...}）
 * @param {string} config.activeSheetName - アクティブシート名
 * @param {boolean} config.isActiveCompanySheet - アクティブシートが企業シートか
 * @param {string} config.savedDataKey - 保存済みデータのキー（例: 'savedJson', 'savedTranscript'）
 * @param {Function} config.onSelect - 選択時コールバック function(item, isActive)
 * @param {string} config.badgeLabel - 保存済バッジのラベル（デフォルト: '保存済'）
 */
function initCompanyDropdown(config) {
  _companySelectConfig = Object.assign({
    displayId: 'companySelectDisplay',
    dropdownId: 'companySelectDropdown',
    sheets: [],
    activeSheetName: '',
    isActiveCompanySheet: false,
    savedDataKey: null,
    onSelect: null,
    badgeLabel: '保存済'
  }, config);

  renderCompanyDropdownItems();
}

/**
 * ドロップダウンの開閉
 */
function toggleCompanyDropdown() {
  const config = _companySelectConfig;
  if (!config) return;

  const display = document.getElementById(config.displayId);
  const dropdown = document.getElementById(config.dropdownId);
  if (!display || !dropdown) return;

  const isOpen = dropdown.classList.contains('show');
  if (isOpen) {
    dropdown.classList.remove('show');
    display.classList.remove('active');
  } else {
    dropdown.classList.add('show');
    display.classList.add('active');
  }
}

/**
 * ドロップダウンの項目をレンダリング
 */
function renderCompanyDropdownItems() {
  const config = _companySelectConfig;
  if (!config) return;

  const dropdown = document.getElementById(config.dropdownId);
  if (!dropdown) return;

  const sheets = config.sheets;
  const activeSheet = config.activeSheetName;
  const isActiveCompanySheet = config.isActiveCompanySheet;

  if (!sheets || sheets.length === 0) {
    dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
    return;
  }

  dropdown.innerHTML = '';

  // ソート: アクティブ最上段、残りは逆順（新しいものが上）
  const sorted = [...sheets].sort((a, b) => {
    const aIsActive = a.sheetName === activeSheet && isActiveCompanySheet;
    const bIsActive = b.sheetName === activeSheet && isActiveCompanySheet;
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    return -1;
  });

  sorted.forEach((item) => {
    const isActive = item.sheetName === activeSheet && isActiveCompanySheet;
    const div = document.createElement('div');
    div.className = 'company-select-item' + (isActive ? ' selected' : '');

    const activeBadge = isActive ? '<span class="badge-active">アクティブ</span>' : '';

    // 保存済みバッジ（savedDataKeyで指定されたキーをチェック）
    let savedBadge = '';
    if (config.savedDataKey) {
      const hasSaved = item[config.savedDataKey] || item['hasSaved' + config.savedDataKey.charAt(0).toUpperCase() + config.savedDataKey.slice(1)];
      if (hasSaved || item.hasSavedData) {
        savedBadge = '<span class="badge-saved">' + escapeHtml(config.badgeLabel) + '</span>';
      }
    }

    const companyNote = item.companyName && item.companyName !== item.sheetName
      ? ' <span style="color:#666;font-size:12px;">(' + escapeHtml(item.companyName) + ')</span>' : '';

    div.innerHTML =
      '<span class="check-icon">' + (isActive ? '✓' : '') + '</span>' +
      '<span class="company-name">' + escapeHtml(item.sheetName) + companyNote + '</span>' +
      activeBadge +
      savedBadge;

    div.onclick = function(e) {
      e.stopPropagation();
      selectCompanyItem(item, isActive);
      toggleCompanyDropdown();
    };

    dropdown.appendChild(div);

    // アクティブがあれば自動選択
    if (isActive) {
      selectCompanyItem(item, true);
    }
  });
}

/**
 * 企業を選択
 * @param {Object} item - 選択された企業データ
 * @param {boolean} isActive - アクティブシートかどうか
 */
function selectCompanyItem(item, isActive) {
  const config = _companySelectConfig;
  if (!config) return;

  // 選択状態の表示を更新
  updateCompanySelectDisplay(item, isActive);

  // コールバック呼び出し
  if (config.onSelect) {
    config.onSelect(item, isActive);
  }
}

/**
 * 選択状態の表示を更新
 * @param {Object} item - 選択された企業データ
 * @param {boolean} isActive - アクティブシートかどうか
 */
function updateCompanySelectDisplay(item, isActive) {
  const config = _companySelectConfig;
  if (!config) return;

  const display = document.getElementById(config.displayId);
  if (!display) return;

  const activeBadge = isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';

  // 保存済みバッジ
  let savedBadge = '';
  if (config.savedDataKey) {
    const hasSaved = item[config.savedDataKey] || item['hasSaved' + config.savedDataKey.charAt(0).toUpperCase() + config.savedDataKey.slice(1)];
    if (hasSaved || item.hasSavedData) {
      savedBadge = '<span class="badge-saved" style="margin-left:8px;">' + escapeHtml(config.badgeLabel) + '</span>';
    }
  }

  display.innerHTML =
    '<span class="selected-check">✓</span>' +
    '<span class="selected-name">' + escapeHtml(item.sheetName) + '</span>' +
    activeBadge +
    savedBadge;

  // ドロップダウン内の選択状態を更新
  const dropdown = document.getElementById(config.dropdownId);
  if (dropdown) {
    dropdown.querySelectorAll('.company-select-item').forEach(el => {
      el.classList.remove('selected');
      const checkIcon = el.querySelector('.check-icon');
      if (checkIcon) checkIcon.textContent = '';
    });

    dropdown.querySelectorAll('.company-select-item').forEach(el => {
      const nameEl = el.querySelector('.company-name');
      if (nameEl) {
        const name = nameEl.textContent.split('(')[0].trim();
        if (name === item.sheetName) {
          el.classList.add('selected');
          const checkIcon = el.querySelector('.check-icon');
          if (checkIcon) checkIcon.textContent = '✓';
        }
      }
    });
  }
}

/**
 * ステータスメッセージを表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ（'success', 'error', 'info'）
 * @param {string} statusId - ステータス要素のID（デフォルト: 'status'）
 */
function showStatus(message, type, statusId) {
  const status = document.getElementById(statusId || 'status');
  if (status) {
    status.textContent = message;
    status.className = 'status ' + type;
  }
}
<\/script>
`;
