/**
 * アニメPV制作 - 共通ダイアログスタイル・UIコンポーネント
 *
 * 【使用方法】
 * 各GASファイルのHTML生成部分で以下のように使用:
 *
 * return `
 * <!DOCTYPE html>
 * <html>
 * <head>
 * ${ANIME_PV_DIALOG_STYLES}
 * </head>
 * <body>
 *   ...
 *   ${ANIME_PV_UI_COMPONENTS}
 * </body>
 * </html>
 * `;
 */

// ================================================================================
// ===== 共通ダイアログスタイル =====
// ================================================================================

const ANIME_PV_DIALOG_STYLES = `
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

  input[type="text"],
  input[type="email"],
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
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
  textarea { min-height: 120px; resize: vertical; font-family: 'Consolas', monospace; }

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
  .btn-primary { background: #7c3aed; color: white; padding: 12px 24px; font-size: 14px; }
  .btn-primary:hover { background: #6d28d9; }
  .btn-secondary { background: #f1f3f4; color: #333; padding: 12px 24px; font-size: 14px; }
  .btn-secondary:hover { background: #e0e0e0; }
  .btn-copy { background: #10b981; color: white; }
  .btn-copy:hover { background: #059669; }
  .btn-parse { background: #f59e0b; color: white; }
  .btn-parse:hover { background: #d97706; }
  .btn-save { background: #3b82f6; color: white; }
  .btn-save:hover { background: #2563eb; }
  .btn-gray { background: #e5e7eb; color: #374151; }
  .btn-gray:hover { background: #d1d5db; }

  .actions { display: flex; gap: 10px; margin-top: 20px; }
  .footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

  /* ===== ステータス表示 ===== */
  .status { margin-top: 15px; padding: 10px; border-radius: 6px; display: none; }
  .status.success { display: block; background: #d1fae5; color: #065f46; }
  .status.error { display: block; background: #fee2e2; color: #991b1b; }
  .status.info { display: block; background: #dbeafe; color: #1e40af; }

  /* ===== コピー成功トースト ===== */
  .copy-success {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #10b981;
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

  /* ===== プレビューセクション ===== */
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
    font-family: 'Consolas', monospace;
    white-space: pre-wrap;
    min-height: 100px;
    max-height: 300px;
    overflow-y: auto;
    color: #333;
  }
  .preview-placeholder { color: #999; font-style: italic; }

  /* ===== 入力セクション ===== */
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

  /* ===== タブ ===== */
  .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #ddd; }
  .tab {
    padding: 8px 16px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #666;
    font-size: 14px;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .tab.active {
    color: #7c3aed;
    border-bottom-color: #7c3aed;
    font-weight: 500;
  }
  .tab:hover { color: #7c3aed; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* ===== カード ===== */
  .card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .card-header {
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  .card-body { color: #666; font-size: 13px; }

  /* ===== バッジ ===== */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }
  .badge-purple { background: #ede9fe; color: #7c3aed; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-active { background: #7c3aed; color: white; }

  /* ===== プロンプト結果エリア ===== */
  .prompt-result {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  .prompt-result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid #ddd;
  }
  .prompt-result-title { font-weight: 500; color: #333; }
  .prompt-result-actions { display: flex; gap: 8px; }
  .prompt-result-body {
    padding: 16px;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    color: #333;
    background: #fafafa;
    border-radius: 0 0 8px 8px;
  }

  /* ===== 企業選択ドロップダウン ===== */
  .company-select-wrapper { position: relative; margin-bottom: 16px; }
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
  .company-select-display:hover { border-color: #7c3aed; }
  .company-select-display.active { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
  .company-select-display::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #666;
  }
  .company-select-display .placeholder { color: #999; }
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
  .company-select-item.selected { background: #ede9fe; }

  /* ===== シーン選択 ===== */
  .scene-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .scene-item {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    font-size: 13px;
  }
  .scene-item:hover { border-color: #7c3aed; background: #faf5ff; }
  .scene-item.selected { border-color: #7c3aed; background: #ede9fe; }
  .scene-item.disabled { opacity: 0.5; cursor: not-allowed; }

  /* ===== ローディング ===== */
  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
  }
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e0e0e0;
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ===== アコーディオン ===== */
  .accordion {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    cursor: pointer;
    user-select: none;
  }
  .accordion-header:hover { background: #f0f0f0; }
  .accordion-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #333;
  }
  .accordion-arrow {
    font-size: 10px;
    color: #666;
    transition: transform 0.2s;
  }
  .accordion-content {
    display: none;
    padding: 16px;
    background: #fff;
    border-top: 1px solid #ddd;
  }
  .accordion-content.show { display: block; }
  .template-text {
    font-family: 'Consolas', monospace;
    font-size: 11px;
    white-space: pre-wrap;
    color: #333;
    max-height: 200px;
    overflow-y: auto;
  }
</style>
`;

// ================================================================================
// ===== 共通UIコンポーネント =====
// ================================================================================

const ANIME_PV_UI_COMPONENTS = `
<div id="copySuccess" class="copy-success">✓ コピーしました</div>
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

// ===== タブ切り替え =====
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="' + tabId + '"]').classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ===== ステータス表示 =====
function showStatus(message, type, elementId) {
  const status = document.getElementById(elementId || 'status');
  if (status) {
    status.textContent = message;
    status.className = 'status ' + type;
  }
}

// ===== 企業選択ドロップダウン =====
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

// 外側クリックでドロップダウンを閉じる
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.company-select-wrapper')) {
      const dropdown = document.getElementById('companySelectDropdown');
      const display = document.getElementById('companySelectDisplay');
      if (dropdown) dropdown.classList.remove('show');
      if (display) display.classList.remove('active');
    }
  });
});

// ===== ローディング表示 =====
function showLoading(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '<div class="loading"><div class="spinner"></div><span>' + escapeHtml(message || '処理中...') + '</span></div>';
  }
}

function hideLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '';
  }
}

// ===== ボタンローディング状態管理 =====
function setButtonLoading(btnId, loading, loadingText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>' + (loadingText || '処理中...');
    btn.style.opacity = '0.7';
    btn.style.cursor = 'not-allowed';
  } else {
    btn.disabled = false;
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
    }
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
}

// ===== 全ボタン無効化/有効化 =====
function setAllButtonsDisabled(disabled) {
  document.querySelectorAll('button').forEach(function(btn) {
    if (!btn.classList.contains('btn-gray')) { // 閉じるボタンは除外
      btn.disabled = disabled;
      btn.style.opacity = disabled ? '0.7' : '1';
    }
  });
}
<\/script>
`;

// ================================================================================
// ===== 別名（互換性のため） =====
// ================================================================================

const PV_DIALOG_STYLES = ANIME_PV_DIALOG_STYLES;
const PV_UI_COMPONENTS = ANIME_PV_UI_COMPONENTS;
