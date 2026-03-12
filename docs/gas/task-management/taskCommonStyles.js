/**
 * タスク管理システム - 共通ダイアログスタイル・UIコンポーネント
 *
 * 【使用方法】
 * 各GASファイルのHTML生成部分で以下のように使用:
 *
 * return `
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   ${TASK_DIALOG_STYLES}
 * </head>
 * <body>
 *   ...
 *   ${TASK_UI_COMPONENTS}
 * </body>
 * </html>
 * `;
 *
 * 【提供する機能】
 * TASK_DIALOG_STYLES:
 *   - ベーススタイル（フォント、背景、余白）
 *   - フォーム要素（input, textarea, select, button）
 *   - タスクカード（確信度別ボーダー色）
 *   - モード選択ボタン（3列グリッド）
 *   - ステータスアイコン色分け
 *   - ローディングスピナー
 *
 * TASK_UI_COMPONENTS:
 *   - copyToClipboard(text): クリップボードにコピー
 *   - showStatus(message, type, statusId): ステータス表示
 *   - toggleAccordion(id): アコーディオン開閉
 *   - escapeHtml(str): HTMLエスケープ
 *   - setButtonLoading(btn, loading): ボタンローディング状態
 */

// ================================================================================
// ===== 共通ダイアログスタイル =====
// ================================================================================

const TASK_DIALOG_STYLES = `
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
  input[type="time"],
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
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
  textarea { min-height: 80px; resize: vertical; }

  .section-title {
    font-weight: bold;
    color: #1a73e8;
    margin: 20px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 2px solid #1a73e8;
  }

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
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary { background: #1a73e8; color: white; padding: 12px 24px; font-size: 14px; }
  .btn-primary:hover:not(:disabled) { background: #1557b0; }
  .btn-secondary { background: #f1f3f4; color: #333; padding: 12px 24px; font-size: 14px; }
  .btn-secondary:hover:not(:disabled) { background: #e0e0e0; }
  .btn-green { background: #22c55e; color: white; }
  .btn-green:hover:not(:disabled) { background: #16a34a; }
  .btn-orange { background: #f59e0b; color: white; }
  .btn-orange:hover:not(:disabled) { background: #d97706; }
  .btn-red { background: #ef4444; color: white; }
  .btn-red:hover:not(:disabled) { background: #dc2626; }
  .btn-copy { background: #34a853; color: white; }
  .btn-copy:hover:not(:disabled) { background: #2d8e47; }
  .btn-add { background: #e8f5e9; color: #2e7d32; }
  .btn-add:hover:not(:disabled) { background: #c8e6c9; }
  .btn-delete { background: #ffebee; color: #c62828; font-size: 12px; padding: 4px 8px; }
  .btn-delete:hover:not(:disabled) { background: #ffcdd2; }

  .actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }

  /* ===== ステータス表示 ===== */
  .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
  .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
  .status.error { display: block; background: #ffebee; color: #c62828; }
  .status.info { display: block; background: #e3f2fd; color: #1565c0; }

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

  /* ===== タスクカード（確信度別） ===== */
  .task-card {
    background: #fff;
    border: 1px solid #ddd;
    border-left: 4px solid #9e9e9e;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .task-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .task-card.confidence-high { border-left-color: #22c55e; }
  .task-card.confidence-mid { border-left-color: #f59e0b; }
  .task-card.confidence-low { border-left-color: #ef4444; }

  .task-card .task-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .task-card .task-title { font-weight: 600; color: #333; flex: 1; }
  .task-card .task-meta { font-size: 12px; color: #666; }
  .task-card .task-warning { font-size: 12px; color: #f59e0b; margin-top: 4px; }
  .task-card .task-info { font-size: 12px; color: #666; margin-top: 4px; font-style: italic; }

  /* ===== 確信度バッジ ===== */
  .badge-confidence {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-high { background: #dcfce7; color: #166534; }
  .badge-mid { background: #fef3c7; color: #92400e; }
  .badge-low { background: #fee2e2; color: #991b1b; }

  /* ===== モード選択ボタン（3列グリッド） ===== */
  .mode-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 10px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    text-align: center;
  }
  .mode-btn:hover { border-color: #1a73e8; background: #e8f0fe; }
  .mode-btn.selected { border-color: #1a73e8; background: #e8f0fe; color: #1a73e8; font-weight: 600; }
  .mode-btn .mode-icon { font-size: 24px; }
  .mode-btn .mode-label { font-size: 12px; }

  /* ===== 担当者グループヘッダー ===== */
  .group-header {
    font-weight: 700;
    color: #333;
    padding: 8px 12px;
    background: #f1f3f4;
    border-radius: 6px;
    margin: 16px 0 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .group-header .count { font-size: 12px; color: #666; font-weight: normal; }

  /* ===== ステータスアイコン色 ===== */
  .status-icon-overdue { color: #ef4444; }
  .status-icon-today { color: #f59e0b; }
  .status-icon-normal { color: #9e9e9e; }
  .status-icon-reported { color: #1a73e8; }

  /* ===== スピナー・ローディング ===== */
  .spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }
  .spinner.dark { border-color: #1a73e8; border-top-color: transparent; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .loading {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }
  .loading .spinner { width: 32px; height: 32px; border-width: 3px; border-color: #1a73e8; border-top-color: transparent; margin-bottom: 12px; }

  /* ===== アコーディオン ===== */
  .accordion {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 8px;
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
    flex: 1;
  }
  .accordion-arrow { transition: transform 0.2s; font-size: 12px; color: #666; }
  .accordion-arrow.open { transform: rotate(90deg); }
  .accordion-content {
    display: none;
    padding: 0 16px 16px;
    border-top: 1px solid #eee;
  }
  .accordion-content.open { display: block; }

  /* ===== 情報ボックス ===== */
  .info-box {
    background: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 15px;
    font-size: 13px;
  }

  /* ===== フィルタバー ===== */
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }
  .filter-bar label { font-size: 13px; font-weight: 500; color: #555; }
  .filter-bar select { width: auto; padding: 6px 10px; font-size: 13px; }

  /* ===== サマリーバー ===== */
  .summary-bar {
    display: flex;
    gap: 16px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #555;
  }

  /* ===== 設定テーブル ===== */
  .settings-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  .settings-table th, .settings-table td {
    border: 1px solid #ddd;
    padding: 8px 10px;
    text-align: left;
    font-size: 13px;
  }
  .settings-table th {
    background: #f1f3f4;
    font-weight: 600;
    color: #333;
  }
  .settings-table td input,
  .settings-table td select {
    border: none;
    padding: 4px 6px;
    font-size: 13px;
    width: 100%;
  }

  /* ===== ステップインジケータ ===== */
  .step-indicator {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ddd;
  }
  .step-dot.active { background: #1a73e8; }
  .step-dot.done { background: #22c55e; }
</style>
`;

// ================================================================================
// ===== 共通UIコンポーネント =====
// ================================================================================

const TASK_UI_COMPONENTS = `
<div id="copySuccess" class="copy-success">コピーしました</div>

<script>
// ===== クリップボード =====
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showCopySuccess();
  }).catch(function() {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess();
  });
}

function showCopySuccess() {
  var msg = document.getElementById('copySuccess');
  if (msg) {
    msg.classList.add('show');
    setTimeout(function() { msg.classList.remove('show'); }, 2000);
  }
}

// ===== ステータス表示 =====
function showStatus(message, type, statusId) {
  var el = document.getElementById(statusId || 'status');
  if (el) {
    el.textContent = message;
    el.className = 'status ' + type;
  }
}

// ===== アコーディオン =====
function toggleAccordion(id) {
  var content = document.getElementById('accordion-content-' + id);
  var arrow = document.getElementById('accordion-arrow-' + id);
  if (content) content.classList.toggle('open');
  if (arrow) arrow.classList.toggle('open');
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

// ===== ボタンローディング状態 =====
function setButtonLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> 処理中...';
  } else {
    btn.disabled = false;
    btn.textContent = originalText || btn.dataset.originalText || '実行';
  }
}
<\/script>
`;
