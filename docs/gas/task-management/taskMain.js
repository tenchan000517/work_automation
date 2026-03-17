/**
 * タスク管理システム - メインメニュー・エントリーポイント
 *
 * onOpen() でメニューバーに「タスク管理」「管理者メニュー」の2つを追加。
 * 各メニュー項目は対応するダイアログ関数への薄いラッパー。
 *
 * 依存: 全ファイル
 */

// ================================================================================
// ===== メニュー登録 =====
// ================================================================================

function onOpen() {
  var ui = SpreadsheetApp.getUi();

  // メニュー1：全員が使う
  var taskMenu = ui.createMenu('\uD83D\uDCCB タスク管理');

  // タスク登録サブメニュー
  var registerSub = ui.createMenu('\u2795 タスク登録')
    .addItem('\uD83D\uDCAC ワークス一括', 'showInputDialog_WorksBulk')
    .addItem('\uD83D\uDCCC ワークスピンポイント', 'showInputDialog_WorksPin')
    .addItem('\uD83D\uDCDD NOTTA', 'showInputDialog_Notta')
    .addItem('\u270D\uFE0F 自由記述', 'showInputDialog_FreeText')
    .addItem('\uD83E\uDD1D ディスカッション', 'showInputDialog_Discussion');

  taskMenu
    .addSubMenu(registerSub)
    .addItem('\uD83D\uDCCA タスク一覧', 'showTaskListDialog')
    .addItem('\uD83D\uDCDD 完了報告', 'showCompletionReportDialog')
    .addItem('\uD83D\uDCCA 進捗報告', 'showProgressReportDialog')
    .addSeparator()
    .addItem('\u2753 使い方', 'showHelpDialog')
    .addToUi();

  // メニュー2：管理者用
  var adminMenu = ui.createMenu('\u2699\uFE0F 管理者メニュー');

  adminMenu
    .addItem('\u2705 完了承認・差し戻し', 'showApprovalDialog')
    .addItem('\uD83D\uDCCA AIサマリー', 'showAiSummaryDialog')
    .addSeparator()
    .addItem('\uD83D\uDC64 担当者設定', 'showMemberSettingsDialog')
    .addItem('\u23F0 リマインド設定', 'showReminderSettingsDialog')
    .addItem('\uD83D\uDCC5 棚卸し設定', 'showReviewSettingsDialog')
    .addItem('\uD83E\uDD16 AIモデル設定', 'showAiModelSettingsDialog')
    .addSeparator()
    .addItem('\uD83D\uDD27 テンプレート初期設定', 'initializeTemplate')
    .addToUi();

  // メニュー3：シミュレーション（taskSimulator.js）
  sim_addMenu();
}

// ================================================================================
// ===== エントリー関数（メニュー → ダイアログ） =====
// ================================================================================

// タスク登録（モード別）
function showInputDialog_WorksBulk() { task_showInputDialog('works_bulk'); }
function showInputDialog_WorksPin() { task_showInputDialog('works_pin'); }
function showInputDialog_Notta() { task_showInputDialog('notta'); }
function showInputDialog_FreeText() { task_showInputDialog('free_text'); }
function showInputDialog_Discussion() { task_showInputDialog('discussion'); }

// タスク一覧
function showTaskListDialog() { task_showTaskListDialog(); }

// 完了報告（タスク一覧の完了報告済みフィルタ表示）
function showCompletionReportDialog() { task_showTaskListDialog(); }

// 進捗報告
function showProgressReportDialog() { task_showProgressReportDialog(); }

// 完了承認（管理者用ビュー）
function showApprovalDialog() { task_showApprovalDialog(); }

// AIサマリー
function showAiSummaryDialog() {
  var tasks = task_getAllTasks({ status: '未完了' });
  var result = task_generateAiSummary(tasks);
  var ui = SpreadsheetApp.getUi();
  if (result.success) {
    ui.alert('\uD83E\uDD16 AIサマリー', result.summary, ui.ButtonSet.OK);
  } else {
    ui.alert('エラー', result.error, ui.ButtonSet.OK);
  }
}

// テンプレート初期設定
function initializeTemplate() {
  var result = task_initializeTemplate();
  var ui = SpreadsheetApp.getUi();
  if (result.success) {
    ui.alert('\u2705 初期設定完了', result.message, ui.ButtonSet.OK);

    // トリガーもセットアップ
    task_setupRemindTriggers();
    task_setupWeeklyReviewTrigger();
  } else {
    ui.alert('エラー', result.error, ui.ButtonSet.OK);
  }
}

// 使い方
function showHelpDialog() {
  var html = `<!DOCTYPE html>
<html>
<head>${TASK_DIALOG_STYLES}</head>
<body>
  <h3>\u2753 タスク管理システム 使い方</h3>

  <div class="section-title">初回セットアップ</div>
  <ol style="font-size:13px; line-height:1.8;">
    <li>GASエディタ → プロジェクト設定 → スクリプトプロパティ → <code>GEMINI_API_KEY</code> を登録</li>
    <li>\u2699\uFE0F 管理者メニュー → テンプレート初期設定</li>
    <li>\u2699\uFE0F 管理者メニュー → 担当者設定（名前・メール・役割を登録）</li>
    <li>\u2699\uFE0F 管理者メニュー → リマインド設定（通知時間を設定）</li>
  </ol>

  <div class="section-title">タスク登録</div>
  <ol style="font-size:13px; line-height:1.8;">
    <li>\uD83D\uDCCB タスク管理 → タスク登録 → モードを選択</li>
    <li>テキストを貼り付けて「AI解析する」</li>
    <li>タスク候補から登録するものを\u2705選択</li>
    <li>要件を確認・補完して「登録」</li>
  </ol>

  <div class="section-title">入力モード</div>
  <table class="settings-table">
    <tr><th>モード</th><th>用途</th></tr>
    <tr><td>\uD83D\uDCAC ワークス一括</td><td>LINE WORKSの会話ログ全体からタスクを一括抽出</td></tr>
    <tr><td>\uD83D\uDCCC ピンポイント</td><td>特定の1メッセージからタスクを抽出</td></tr>
    <tr><td>\uD83D\uDCDD NOTTA</td><td>会議文字起こしからタスクを抽出</td></tr>
    <tr><td>\u270D\uFE0F 自由記述</td><td>自分で書いた内容を整理</td></tr>
    <tr><td>\uD83E\uDD1D ディスカッション</td><td>口頭依頼の要件を洗い出し</td></tr>
  </table>

  <div class="section-title">完了フロー</div>
  <p style="font-size:13px;">担当者：完了報告 → 管理者：承認 or 差し戻し</p>

  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>
</body>
</html>`;

  var output = HtmlService.createHtmlOutput(html).setWidth(600).setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(output, '\u2753 使い方');
}
