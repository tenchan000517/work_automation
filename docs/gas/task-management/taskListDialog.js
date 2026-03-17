/**
 * タスク管理システム - 画面5：タスク一覧 + 設定ダイアログ
 *
 * 担当者別グルーピング、フィルタ、アコーディオン展開、アクションボタン。
 * 設定ダイアログ4種（担当者・リマインド・棚卸し・AIモデル）も含む。
 *
 * 依存: taskCommonStyles.js, taskSheetManager.js, taskAiAnalyzer.js, taskCalendarManager.js
 */

// ================================================================================
// ===== タスク一覧ダイアログ =====
// ================================================================================

/**
 * タスク一覧ダイアログを表示（全員用）
 */
function task_showTaskListDialog() {
  var tasks = task_getAllTasks({ status: '未完了' });
  var members = task_getMemberNames();
  var html = HtmlService.createHtmlOutput(task_createTaskListDialogHtml(tasks, members, 'member'))
    .setWidth(850)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '\uD83D\uDCCA タスク一覧');
}

/**
 * 完了承認ダイアログを表示（管理者用）
 */
function task_showApprovalDialog() {
  var tasks = task_getAllTasks({ status: '未完了' });
  var members = task_getMemberNames();
  var html = HtmlService.createHtmlOutput(task_createTaskListDialogHtml(tasks, members, 'admin'))
    .setWidth(850)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '\u2705 完了承認・差し戻し');
}

/**
 * タスク一覧ダイアログのHTMLを生成
 * @param {string} viewMode - 'member'（全員用）or 'admin'（管理者用）
 */
function task_createTaskListDialogHtml(tasks, members, viewMode) {
  var tasksJson = JSON.stringify(tasks);
  var membersJson = JSON.stringify(members);

  return `<!DOCTYPE html>
<html>
<head>
  ${TASK_DIALOG_STYLES}
  <style>
    .task-row { cursor: pointer; padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
    .task-row:hover { background: #f5f5f5; }
    .task-detail { display: none; padding: 12px 16px; background: #fafafa; border: 1px solid #eee; border-radius: 6px; margin: 4px 12px 8px 12px; font-size: 13px; }
    .task-detail.open { display: block; }
    .task-detail .detail-section { margin-bottom: 8px; }
    .task-detail .detail-label { font-weight: 600; color: #555; }
    .action-btns { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .summary-count { font-weight: 600; }
  </style>
</head>
<body>
  <h3>\uD83D\uDCCA タスク一覧</h3>

  <div class="filter-bar">
    <label>担当者：</label>
    <select id="filterAssignee" onchange="applyFilter()">
      <option value="">全員</option>
    </select>
    <label>状態：</label>
    <select id="filterStatus" onchange="applyFilter()">
      <option value="未完了">未完了</option>
      <option value="全て">全て</option>
      <option value="完了報告済み">完了報告済み</option>
    </select>
  </div>

  <div id="summaryBar" class="summary-bar"></div>
  <div id="taskListContainer"></div>

  <div class="actions">
    <button class="btn btn-primary" onclick="requestAiSummary()" id="summaryBtn">\uD83E\uDD16 AIサマリー</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div id="aiSummaryBox" style="display:none; margin-top:16px;">
    <div class="section-title">\uD83E\uDD16 AIサマリー</div>
    <div id="aiSummaryContent" style="background:#fff; padding:12px; border-radius:6px; border:1px solid #ddd; white-space:pre-wrap; font-size:13px;"></div>
  </div>

  <div id="status" class="status"></div>

  ${TASK_UI_COMPONENTS}

  <script>
    var allTasks = ${tasksJson};
    var membersList = ${membersJson};
    var viewMode = '${viewMode || "member"}';
    var filteredTasks = allTasks;

    // 担当者ドロップダウン初期化
    (function() {
      var sel = document.getElementById('filterAssignee');
      membersList.forEach(function(name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
      });
      renderTaskList();
    })();

    function applyFilter() {
      var assignee = document.getElementById('filterAssignee').value;
      var status = document.getElementById('filterStatus').value;

      filteredTasks = allTasks.filter(function(t) {
        if (assignee && t.assignee !== assignee) return false;
        if (status === '未完了' && (t.status === '完了' || t.status === '保留')) return false;
        if (status !== '未完了' && status !== '全て' && t.status !== status) return false;
        return true;
      });
      renderTaskList();
    }

    function renderTaskList() {
      var container = document.getElementById('taskListContainer');
      container.innerHTML = '';

      // サマリー
      var overdue = 0, today = 0, normal = 0, reported = 0, reqPending = 0;
      var ballHolders = {};
      filteredTasks.forEach(function(t) {
        if (t.urgency === 'overdue') overdue++;
        else if (t.urgency === 'today') today++;
        else if (t.urgency === 'reported') reported++;
        else normal++;
        if ((t.size === '大' || t.size === '中') && !t.requirementDef) reqPending++;
        if (t.ballHolder) {
          ballHolders[t.ballHolder] = (ballHolders[t.ballHolder] || 0) + 1;
        }
      });
      var ballSummary = '';
      var ballKeys = Object.keys(ballHolders).sort();
      if (ballKeys.length > 0) {
        ballSummary = ' \uD83C\uDFB3ボール：';
        ballKeys.forEach(function(k) {
          ballSummary += k + '(' + ballHolders[k] + ') ';
        });
      }
      document.getElementById('summaryBar').innerHTML =
        '合計：<span class="summary-count">' + filteredTasks.length + '件</span>' +
        (overdue ? ' \uD83D\uDD34超過' + overdue : '') +
        (today ? ' \uD83D\uDFE1本日' + today : '') +
        (reported ? ' \uD83D\uDD35報告済' + reported : '') +
        ' \u2B1C通常' + normal +
        (reqPending ? ' \uD83D\uDCDD要件定義待ち' + reqPending : '') +
        ballSummary;

      // 担当者別グルーピング
      var groups = {};
      filteredTasks.forEach(function(t) {
        var key = t.assignee || '未割当';
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });

      var groupKeys = Object.keys(groups).sort();
      for (var g = 0; g < groupKeys.length; g++) {
        var groupName = groupKeys[g];
        var groupTasks = groups[groupName];

        container.innerHTML += '<div class="group-header">' +
          '\u2501\u2501 ' + escapeHtml(groupName) + ' <span class="count">（' + groupTasks.length + '件）</span></div>';

        for (var i = 0; i < groupTasks.length; i++) {
          var t = groupTasks[i];
          var icon = '\u2B1C';
          if (t.urgency === 'overdue') icon = '\uD83D\uDD34';
          else if (t.urgency === 'today') icon = '\uD83D\uDFE1';
          else if (t.urgency === 'reported') icon = '\uD83D\uDD35';

          var deadlineText = t.deadline || '期限なし';
          if (t.urgency === 'overdue') deadlineText += ' 超過';
          else if (t.urgency === 'today') deadlineText += ' 本日';

          // タスク規模バッジ
          var sizeBadge = '';
          if (t.size === '大' || t.size === '中') {
            var hasDef = !!t.requirementDef;
            if (hasDef) {
              sizeBadge = '<span class="badge-size badge-size-' + (t.size === '大' ? 'large' : 'medium') + '-done">\u2705' + escapeHtml(t.size) + '</span>';
            } else {
              var sIcon = t.size === '大' ? '\uD83D\uDD34' : '\uD83D\uDFE1';
              sizeBadge = '<span class="badge-size badge-size-' + (t.size === '大' ? 'large' : 'medium') + '-pending">' + sIcon + escapeHtml(t.size) + '</span>';
            }
          }

          var taskHtml = '<div class="task-row" onclick="toggleTaskDetail(\\'' + t.id + '\\')">' +
            '<span class="status-icon-' + t.urgency + '">' + icon + '</span>' +
            '<strong>' + escapeHtml(t.id) + '</strong> ' +
            escapeHtml(t.title) + sizeBadge +
            (t.company ? ' <span style="color:#666;font-size:12px;">[' + escapeHtml(t.company) + ']</span>' : '') +
            '<span style="margin-left:auto; font-size:12px; color:#666;">（期限：' + escapeHtml(deadlineText) + '）</span>' +
            '</div>';

          // 要件定義情報
          var reqDefHtml = '';
          if (t.requirementDef) {
            var rd = t.requirementDef;
            reqDefHtml = '<div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:6px; padding:10px; margin-top:8px; font-size:12px;">' +
              '<strong>\uD83D\uDCDD 要件定義</strong>' +
              (rd.kgi ? '<div style="margin-top:6px;"><span class="detail-label">KGI：</span> ' + escapeHtml(rd.kgi) + '</div>' : '') +
              (rd.handoff_definition ? '<div><span class="detail-label">手離れ：</span> ' + escapeHtml(rd.handoff_definition) + '</div>' : '') +
              (rd.scope_in ? '<div><span class="detail-label">やること：</span> ' + escapeHtml(rd.scope_in) + '</div>' : '') +
              (rd.scope_out ? '<div><span class="detail-label">やらないこと：</span> ' + escapeHtml(rd.scope_out) + '</div>' : '') +
              '</div>';
          }

          // 要件定義ボタン（大/中で未完了の場合のみ）
          var reqDefBtn = '';
          if ((t.size === '大' || t.size === '中') && !t.requirementDef) {
            reqDefBtn = '<button class="btn btn-orange" style="font-size:12px; padding:6px 12px;" onclick="event.stopPropagation(); openRequirementDialog(\\'' + t.id + '\\')">\uD83D\uDCDD 要件定義する</button>';
          }

          taskHtml += '<div class="task-detail" id="detail-' + t.id + '">' +
            '<div class="detail-section"><span class="detail-label">状態：</span> ' + escapeHtml(t.status) + '</div>' +
            '<div class="detail-section"><span class="detail-label">期限：</span> ' + escapeHtml(t.deadline || '未設定') + '</div>' +
            (t.doneCriteria ? '<div class="detail-section"><span class="detail-label">完了条件：</span> ' + escapeHtml(t.doneCriteria) + '</div>' : '') +
            (t.notes ? '<div class="detail-section"><span class="detail-label">備考：</span> ' + escapeHtml(t.notes) + '</div>' : '') +
            (t.completionComment ? '<div class="detail-section"><span class="detail-label">完了報告：</span> ' + escapeHtml(t.completionComment) + '</div>' : '') +
            (t.approvalNote ? '<div class="detail-section"><span class="detail-label">承認/差し戻し：</span> ' + escapeHtml(t.approvalNote) + '</div>' : '') +
            (t.company ? '<div class="detail-section"><span class="detail-label">企業名：</span> ' + escapeHtml(t.company) + '</div>' : '') +
            (t.taskType ? '<div class="detail-section"><span class="detail-label">種別：</span> ' + escapeHtml(t.taskType) + '</div>' : '') +
            (t.ballHolder ? '<div class="detail-section"><span class="detail-label">ボール：</span> ' + escapeHtml(t.ballHolder) + '</div>' : '') +
            reqDefHtml +
            '<div class="action-btns">' +
            reqDefBtn +
            // 全員用: 完了報告 + Claude Code
            (viewMode === 'member' && (t.status === '未着手' || t.status === '進行中' || t.status === '差し戻し')
              ? '<button class="btn btn-primary" style="font-size:12px; padding:6px 12px;" onclick="submitCompletion(\\'' + t.id + '\\')">\uD83D\uDCDD 完了報告</button>' : '') +
            // 管理者用: 承認・差し戻し（完了報告済みの時のみ）
            (viewMode === 'admin' && t.status === '完了報告済み'
              ? '<button class="btn btn-green" style="font-size:12px; padding:6px 12px;" onclick="approveTask(\\'' + t.id + '\\')">\u2705 承認</button>' +
                '<button class="btn btn-orange" style="font-size:12px; padding:6px 12px;" onclick="remandTask(\\'' + t.id + '\\')">\u21A9\uFE0F 差し戻し</button>' : '') +
            '<button class="btn btn-copy" style="font-size:12px; padding:6px 12px;" onclick="copyClaudeCode(\\'' + t.id + '\\')">\uD83E\uDD16 Claude Code</button>' +
            '</div></div>';

          container.innerHTML += taskHtml;
        }
      }

      if (filteredTasks.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">タスクがありません</div>';
      }
    }

    function toggleTaskDetail(taskId) {
      var el = document.getElementById('detail-' + taskId);
      if (el) el.classList.toggle('open');
    }

    // ===== アクション: 完了報告 =====
    function submitCompletion(taskId) {
      var comment = prompt('\uD83D\uDCDD 完了報告コメント（任意）：');
      if (comment === null) return;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus(taskId + ' の完了報告を送信しました', 'success');
            refreshTaskList();
          } else {
            showStatus(result.error, 'error');
          }
        })
        .task_submitCompletionReport(taskId, comment);
    }

    // ===== アクション: 承認 =====
    function approveTask(taskId) {
      var approver = prompt('\u2705 承認者名を入力：');
      if (!approver) return;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus(taskId + ' を承認しました', 'success');
            refreshTaskList();
          } else {
            showStatus(result.error, 'error');
          }
        })
        .task_approveTask(taskId, approver);
    }

    // ===== アクション: 差し戻し =====
    function remandTask(taskId) {
      var reason = prompt('\u21A9\uFE0F 差し戻し理由：');
      if (!reason) return;
      var approver = prompt('差し戻し者名：');
      if (!approver) return;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus(taskId + ' を差し戻しました', 'success');
            refreshTaskList();
          } else {
            showStatus(result.error, 'error');
          }
        })
        .task_remandTask(taskId, reason, approver);
    }

    // ===== Claude Codeコピー =====
    function copyClaudeCode(taskId) {
      var task = allTasks.find(function(t) { return t.id === taskId; });
      if (!task) return;
      var text = '以下のタスクの作業を開始してください。\\n\\n' +
        '【タスク】' + task.title + '\\n' +
        '【担当】' + task.assignee + '\\n' +
        '【期限】' + (task.deadline || '未設定') + '\\n' +
        (task.company ? '【企業名】' + task.company + '\\n' : '') +
        (task.taskType ? '【種別】' + task.taskType + '\\n' : '') +
        '【完了条件】' + (task.doneCriteria || '');

      // 要件定義情報
      if (task.requirementDef) {
        var rd = task.requirementDef;
        text += '\\n\\n--- 要件定義 ---';
        if (rd.kgi) text += '\\n【KGI（本当のゴール）】' + rd.kgi;
        if (rd.handoff_definition) text += '\\n【手離れの定義】' + rd.handoff_definition;
        if (rd.scope_in) text += '\\n【スコープ: やること】' + rd.scope_in;
        if (rd.scope_out) text += '\\n【スコープ: やらないこと】' + rd.scope_out;
      } else if (task.size === '大' || task.size === '中') {
        text += '\\n\\n⚠️ このタスクは要件定義が未完了です。以下の指示に従って要件定義を行ってください。';
        text += '\\n\\n--- 要件定義の指示 ---';
        text += '\\nこのタスクについて、以下の4項目を深掘りしてください。一方的に決めず、私への質問→回答→整理のサイクルを回してください。';
        text += '\\n';
        text += '\\n■ KGI（本当のゴール）';
        text += '\\n依頼者が本当に望んでいることは何か。表面的な指示の裏にある目的を言語化する。';
        text += '\\n';
        text += '\\n■ 手離れの定義';
        text += '\\n何がどうなっていれば、このタスクから完全に手を離せるか。成果物の完成だけでなく「誰に渡すか」「どこに格納するか」「報告は必要か」まで含める。';
        text += '\\n';
        text += '\\n■ スコープ';
        text += '\\n・やること: 明確に含まれる作業を列挙';
        text += '\\n・やらないこと: 含まれない・やるべきでない作業を明示（暗黙の期待を先回りして潰す）';
        text += '\\n';
        text += '\\n■ リスク・確認事項';
        text += '\\n・期限に対して作業量は妥当か';
        text += '\\n・不足している情報・素材はないか';
        text += '\\n・依頼者に確認すべき曖昧な点はないか';
        text += '\\n';
        text += '\\n「いい感じに」「前と同じ」などの曖昧表現は必ず具体化してください。';
      }

      copyToClipboard(text);
    }

    function openRequirementDialog(taskId) {
      google.script.host.close();
      google.script.run.task_showRequirementDialog(taskId);
    }

    // ===== AIサマリー =====
    function requestAiSummary() {
      var btn = document.getElementById('summaryBtn');
      setButtonLoading(btn, true);

      google.script.run
        .withSuccessHandler(function(result) {
          setButtonLoading(btn, false, '\uD83E\uDD16 AIサマリー');
          if (result.success) {
            document.getElementById('aiSummaryContent').textContent = result.summary;
            document.getElementById('aiSummaryBox').style.display = 'block';
          } else {
            showStatus(result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          setButtonLoading(btn, false, '\uD83E\uDD16 AIサマリー');
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_requestAiSummary();
    }

    function refreshTaskList() {
      google.script.run
        .withSuccessHandler(function(tasks) {
          allTasks = tasks;
          applyFilter();
        })
        .task_getAllTasks({ status: '未完了' });
    }
  <\/script>
</body>
</html>`;
}

// ================================================================================
// ===== アクション関数（ダイアログから呼ばれる） =====
// ================================================================================

/**
 * 完了報告を提出
 * @param {string} taskId
 * @param {string} comment
 * @returns {{success: boolean, error?: string}}
 */
function task_submitCompletionReport(taskId, comment) {
  var result = task_updateTaskStatus(taskId, '完了報告済み', comment);
  if (!result.success) return result;

  // 管理者にメール通知
  try {
    var task = task_getTaskById(taskId);
    if (task) {
      var subject = '\uD83D\uDCCB 完了報告: ' + taskId + ' ' + task.title;
      var body = taskId + '（' + task.title + '）が完了報告されました。\n\n' +
        '担当：' + task.assignee + '\n' +
        'コメント：' + (comment || 'なし') + '\n' +
        '完了条件：' + task.doneCriteria + '\n\n' +
        'スプレッドシートを開いて確認してください。';
      task_notifyManagers(subject, body);
    }
  } catch (e) {
    // メール送信エラーは無視（タスク更新は成功）
  }

  return { success: true };
}

/**
 * タスクを承認
 * @param {string} taskId
 * @param {string} approverName
 * @returns {{success: boolean, error?: string}}
 */
function task_approveTask(taskId, approverName) {
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
  var note = approverName + ' 承認 ' + now;
  var result = task_updateTaskStatus(taskId, '完了', note);
  if (!result.success) return result;

  // 担当者にメール通知
  try {
    var task = task_getTaskById(taskId);
    if (task) {
      task_sendApprovalNotification(task, true, '');
    }
  } catch (e) { /* ignore */ }

  return { success: true };
}

/**
 * タスクを差し戻し
 * @param {string} taskId
 * @param {string} reason
 * @param {string} approverName
 * @returns {{success: boolean, error?: string}}
 */
function task_remandTask(taskId, reason, approverName) {
  var note = '差し戻し（' + approverName + '）：' + reason;
  var result = task_updateTaskStatus(taskId, '差し戻し', note);
  if (!result.success) return result;

  // 担当者にメール通知
  try {
    var task = task_getTaskById(taskId);
    if (task) {
      task_sendApprovalNotification(task, false, reason);
    }
  } catch (e) { /* ignore */ }

  return { success: true };
}

/**
 * AIサマリーを要求
 * @returns {{success: boolean, summary?: string, error?: string}}
 */
function task_requestAiSummary() {
  var tasks = task_getAllTasks({ status: '未完了' });
  return task_generateAiSummary(tasks);
}

// ================================================================================
// ===== 要件定義ダイアログ =====
// ================================================================================

/**
 * 要件定義ダイアログを表示
 * @param {string} taskId
 */
function task_showRequirementDialog(taskId) {
  var task = task_getTaskById(taskId);
  if (!task) {
    SpreadsheetApp.getUi().alert('タスクが見つかりません: ' + taskId);
    return;
  }

  var taskJson = JSON.stringify(task);

  var html = HtmlService.createHtmlOutput(task_createRequirementDialogHtml(task))
    .setWidth(850)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '\uD83D\uDCDD 要件定義: ' + taskId + ' ' + task.title);
}

/**
 * 要件定義ダイアログのHTMLを生成
 * @param {Object} task
 * @returns {string}
 */
function task_createRequirementDialogHtml(task) {
  var taskJson = JSON.stringify(task);
  var existingDef = task.requirementDef ? JSON.stringify(task.requirementDef) : 'null';
  var sizeIcon = task.size === '大' ? '\uD83D\uDD34' : '\uD83D\uDFE1';

  return `<!DOCTYPE html>
<html>
<head>
  ${TASK_DIALOG_STYLES}
  <style>
    .req-def-section { margin-bottom: 16px; }
    .req-def-section label { display: block; font-weight: 600; margin-bottom: 6px; color: #333; }
    .scope-group { display: flex; gap: 16px; }
    .scope-group > div { flex: 1; }
    .questions-section { background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 6px; padding: 12px; margin-top: 16px; }
    .questions-section h4 { margin: 0 0 10px 0; color: #e65100; font-size: 14px; }
    .question-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .question-item input[type="checkbox"] { margin-top: 3px; }
  </style>
</head>
<body>
  <h3>\uD83D\uDCDD 要件定義: ${task.id} ${task.title.replace(/'/g, "\\'")}（${task.size}タスク${sizeIcon}）</h3>

  <div id="aiDraftBox" class="info-box" style="display:none;">
    <strong>\uD83E\uDD16 AIが整理した内容</strong>
    <div id="aiDraftContent" style="margin-top:6px; font-size:13px;"></div>
  </div>

  <div id="loadingArea" class="loading" style="display:none;">
    <div class="spinner dark"></div>
    <div>AIが叩き台を生成中...</div>
  </div>

  <div id="formArea">
    <div class="req-def-section">
      <label>1. KGI（本当のゴール）</label>
      <textarea id="kgi" rows="2" placeholder="このタスクが成功した状態を記述"></textarea>
    </div>

    <div class="req-def-section">
      <label>2. 手離れの定義</label>
      <textarea id="handoff" rows="2" placeholder="何がどうなっていれば、このタスクから手を離せるか"></textarea>
    </div>

    <div class="req-def-section">
      <label>3. スコープ</label>
      <div class="scope-group">
        <div>
          <label style="font-size:13px;">やること</label>
          <textarea id="scopeIn" rows="3" placeholder="明確に含まれる作業"></textarea>
        </div>
        <div>
          <label style="font-size:13px;">やらないこと</label>
          <textarea id="scopeOut" rows="3" placeholder="含まれない・やらない作業"></textarea>
        </div>
      </div>
    </div>

    <div class="req-def-section">
      <label>4. 期限</label>
      <input type="date" id="deadline" value="${task.deadline || ''}">
    </div>

    <div id="questionsSection" class="questions-section" style="display:none;">
      <h4>\u2501\u2501 依頼者に確認すべきこと \u2501\u2501</h4>
      <div id="questionsList"></div>
    </div>
  </div>

  <div class="actions" style="margin-top:20px;">
    <button class="btn btn-secondary" onclick="copyForDefineTask()" id="claudeBtn">\uD83E\uDD16 Claude Codeで深掘り</button>
    <button class="btn btn-primary" onclick="saveRequirement()" id="saveBtn">\uD83D\uDCBE 保存</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div id="status" class="status"></div>

  ${TASK_UI_COMPONENTS}

  <script>
    var taskData = ${taskJson};
    var existingDef = ${existingDef};

    (function init() {
      if (existingDef) {
        // 既存データがある場合: 編集モード
        document.getElementById('kgi').value = existingDef.kgi || '';
        document.getElementById('handoff').value = existingDef.handoff_definition || '';
        document.getElementById('scopeIn').value = existingDef.scope_in || '';
        document.getElementById('scopeOut').value = existingDef.scope_out || '';
        if (existingDef.questions_for_requester && existingDef.questions_for_requester.length > 0) {
          renderQuestions(existingDef.questions_for_requester);
        }
      } else {
        // 新規: AIで叩き台を生成
        generateDraft();
      }
    })();

    function generateDraft() {
      document.getElementById('loadingArea').style.display = 'block';

      google.script.run
        .withSuccessHandler(function(result) {
          document.getElementById('loadingArea').style.display = 'none';
          if (result.success && result.draft) {
            var d = result.draft;
            document.getElementById('kgi').value = d.kgi || '';
            document.getElementById('handoff').value = d.handoff_definition || '';
            document.getElementById('scopeIn').value = d.scope_in || '';
            document.getElementById('scopeOut').value = d.scope_out || '';

            // AI生成の注釈表示
            document.getElementById('aiDraftBox').style.display = 'block';
            document.getElementById('aiDraftContent').textContent = 'AIが生成した叩き台です。内容を確認・修正してから保存してください。';

            if (d.questions_for_requester && d.questions_for_requester.length > 0) {
              renderQuestions(d.questions_for_requester);
            }
          } else {
            showStatus('AI生成に失敗しました: ' + (result.error || ''), 'error');
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('loadingArea').style.display = 'none';
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_generateRequirementDraft(taskData);
    }

    function renderQuestions(questions) {
      var section = document.getElementById('questionsSection');
      var list = document.getElementById('questionsList');
      section.style.display = 'block';
      list.innerHTML = '';
      for (var i = 0; i < questions.length; i++) {
        list.innerHTML += '<div class="question-item">' +
          '<input type="checkbox" id="q-' + i + '">' +
          '<label for="q-' + i + '">' + escapeHtml(questions[i]) + '</label>' +
          '</div>';
      }
    }

    function saveRequirement() {
      var btn = document.getElementById('saveBtn');
      setButtonLoading(btn, true);

      var reqData = {
        kgi: document.getElementById('kgi').value,
        handoff_definition: document.getElementById('handoff').value,
        scope_in: document.getElementById('scopeIn').value,
        scope_out: document.getElementById('scopeOut').value,
        questions_for_requester: [],
        risk_notes: []
      };

      // 質問リストを収集
      var qItems = document.querySelectorAll('#questionsList label');
      qItems.forEach(function(el) {
        reqData.questions_for_requester.push(el.textContent);
      });

      google.script.run
        .withSuccessHandler(function(result) {
          setButtonLoading(btn, false, '\uD83D\uDCBE 保存');
          if (result.success) {
            showStatus('要件定義を保存しました', 'success');
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          setButtonLoading(btn, false, '\uD83D\uDCBE 保存');
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_saveRequirementData(taskData.id, reqData);
    }

    function copyForDefineTask() {
      var text = '以下のタスクの要件定義を深掘りしてください。\\n' +
        '一方的に決めず、私への質問→回答→整理のサイクルを回してください。\\n' +
        '「いい感じに」「前と同じ」などの曖昧表現は必ず具体化してください。\\n\\n' +
        '--- タスク情報 ---\\n' +
        '【タスクID】' + taskData.id + '\\n' +
        '【タスク】' + taskData.title + '\\n' +
        '【担当】' + (taskData.assignee || '') + '\\n' +
        '【期限】' + (taskData.deadline || '未設定') + '\\n' +
        (taskData.company ? '【企業名】' + taskData.company + '\\n' : '') +
        (taskData.taskType ? '【種別】' + taskData.taskType + '\\n' : '') +
        '【完了条件】' + (taskData.doneCriteria || '') + '\\n' +
        '【タスク規模】' + (taskData.size || '') + '\\n';

      var kgi = document.getElementById('kgi').value;
      var handoff = document.getElementById('handoff').value;
      var scopeIn = document.getElementById('scopeIn').value;
      var scopeOut = document.getElementById('scopeOut').value;

      if (kgi || handoff || scopeIn || scopeOut) {
        text += '\\n--- 現在の要件定義（叩き台） ---\\n';
        if (kgi) text += '【KGI】' + kgi + '\\n';
        if (handoff) text += '【手離れ定義】' + handoff + '\\n';
        if (scopeIn) text += '【やること】' + scopeIn + '\\n';
        if (scopeOut) text += '【やらないこと】' + scopeOut + '\\n';
      }

      text += '\\n--- 深掘りしてほしい項目 ---\\n' +
        '■ KGI（本当のゴール）: 依頼者が本当に望んでいることは何か。表面的な指示の裏にある目的を言語化。\\n' +
        '■ 手離れの定義: 何がどうなれば完全に手を離せるか。「誰に渡すか」「どこに格納するか」「報告は必要か」まで含める。\\n' +
        '■ スコープ: やること（明確に含む作業）/ やらないこと（含まない・やるべきでない作業。暗黙の期待を先回りして潰す）\\n' +
        '■ リスク・確認事項: 期限vs作業量の妥当性、不足情報、依頼者に確認すべき曖昧な点\\n';

      copyToClipboard(text);
    }
  <\/script>
</body>
</html>`;
}

// ================================================================================
// ===== 設定ダイアログ =====
// ================================================================================

/**
 * 担当者設定ダイアログ
 */
function showMemberSettingsDialog() {
  var members = task_getMembers();
  var membersJson = JSON.stringify(members);

  var html = `<!DOCTYPE html>
<html>
<head>${TASK_DIALOG_STYLES}</head>
<body>
  <h3>\uD83D\uDC64 担当者設定</h3>
  <table class="settings-table" id="memberTable">
    <thead><tr><th>名前</th><th>メールアドレス</th><th>カレンダーID</th><th>役割</th><th></th></tr></thead>
    <tbody id="memberBody"></tbody>
  </table>
  <button class="btn btn-add" onclick="addRow()">\uFF0B 担当者を追加</button>
  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button class="btn btn-primary" onclick="save()">保存</button>
  </div>
  <div id="status" class="status"></div>
  ${TASK_UI_COMPONENTS}
  <script>
    var members = ${membersJson};
    function render() {
      var body = document.getElementById('memberBody');
      body.innerHTML = '';
      members.forEach(function(m, i) {
        body.innerHTML += '<tr>' +
          '<td><input type="text" value="' + escapeHtml(m.name) + '" data-idx="' + i + '" data-field="name"></td>' +
          '<td><input type="email" value="' + escapeHtml(m.email) + '" data-idx="' + i + '" data-field="email"></td>' +
          '<td><input type="text" value="' + escapeHtml(m.calendarId) + '" data-idx="' + i + '" data-field="calendarId"></td>' +
          '<td><select data-idx="' + i + '" data-field="role">' +
          '<option value="担当者"' + (m.role !== '管理者' ? ' selected' : '') + '>担当者</option>' +
          '<option value="管理者"' + (m.role === '管理者' ? ' selected' : '') + '>管理者</option></select></td>' +
          '<td><button class="btn btn-delete" onclick="removeRow(' + i + ')">\u2716</button></td></tr>';
      });
    }
    function addRow() { members.push({name:'',email:'',calendarId:'',role:'担当者'}); render(); }
    function removeRow(i) { members.splice(i, 1); render(); }
    function collectData() {
      document.querySelectorAll('#memberBody input, #memberBody select').forEach(function(el) {
        var idx = parseInt(el.dataset.idx);
        members[idx][el.dataset.field] = el.value;
      });
    }
    function save() {
      collectData();
      var valid = members.filter(function(m) { return m.name.trim(); });
      google.script.run.withSuccessHandler(function(r) {
        if (r.success) { showStatus('保存しました', 'success'); }
        else { showStatus(r.error, 'error'); }
      }).task_saveMemberSettings(valid);
    }
    render();
  <\/script>
</body></html>`;

  var output = HtmlService.createHtmlOutput(html).setWidth(850).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(output, '\uD83D\uDC64 担当者設定');
}

/**
 * リマインド設定ダイアログ
 */
function showReminderSettingsDialog() {
  var r1 = task_getSystemSetting('リマインド時間1');
  var r2 = task_getSystemSetting('リマインド時間2');
  var r3 = task_getSystemSetting('リマインド時間3');
  var c1 = task_getSystemSetting('カレンダーリマインド1');
  var c2 = task_getSystemSetting('カレンダーリマインド2');

  var html = `<!DOCTYPE html>
<html>
<head>${TASK_DIALOG_STYLES}</head>
<body>
  <h3>\u23F0 リマインド設定</h3>
  <div class="section-title">メール通知（1日最大3回）</div>
  <div class="form-group"><label>1回目</label><input type="time" id="r1" value="${r1 || '09:00'}"></div>
  <div class="form-group"><label>2回目（空欄なら無効）</label><input type="time" id="r2" value="${r2}"></div>
  <div class="form-group"><label>3回目（空欄なら無効）</label><input type="time" id="r3" value="${r3}"></div>
  <div class="section-title">カレンダー通知</div>
  <div class="form-group"><label>通知1</label><input type="text" id="c1" value="${c1 || '前日 09:00'}" placeholder="前日 09:00"></div>
  <div class="form-group"><label>通知2</label><input type="text" id="c2" value="${c2 || '当日 09:00'}" placeholder="当日 09:00"></div>
  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button class="btn btn-primary" onclick="save()">保存</button>
  </div>
  <div id="status" class="status"></div>
  ${TASK_UI_COMPONENTS}
  <script>
    function save() {
      var settings = {
        'リマインド時間1': document.getElementById('r1').value,
        'リマインド時間2': document.getElementById('r2').value,
        'リマインド時間3': document.getElementById('r3').value,
        'カレンダーリマインド1': document.getElementById('c1').value,
        'カレンダーリマインド2': document.getElementById('c2').value
      };
      google.script.run.withSuccessHandler(function(r) {
        if (r.success) showStatus('保存しました', 'success');
        else showStatus(r.error, 'error');
      }).task_saveSystemSettings(settings);
    }
  <\/script>
</body></html>`;

  var output = HtmlService.createHtmlOutput(html).setWidth(500).setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(output, '\u23F0 リマインド設定');
}

/**
 * 棚卸し設定ダイアログ
 */
function showReviewSettingsDialog() {
  var day = task_getSystemSetting('棚卸し曜日') || '月曜';
  var time = task_getSystemSetting('棚卸し時間') || '08:30';
  var days = ['月曜','火曜','水曜','木曜','金曜','土曜','日曜'];
  var dayOptions = days.map(function(d) {
    return '<option value="' + d + '"' + (d === day ? ' selected' : '') + '>' + d + '</option>';
  }).join('');

  var html = `<!DOCTYPE html>
<html>
<head>${TASK_DIALOG_STYLES}</head>
<body>
  <h3>\uD83D\uDCC5 棚卸し設定</h3>
  <div class="form-group"><label>送信曜日</label><select id="day">${dayOptions}</select></div>
  <div class="form-group"><label>送信時刻</label><input type="time" id="time" value="${time}"></div>
  <div class="form-group"><label>送信先</label><input type="text" value="管理者全員" disabled></div>
  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button class="btn btn-primary" onclick="save()">保存</button>
  </div>
  <div id="status" class="status"></div>
  ${TASK_UI_COMPONENTS}
  <script>
    function save() {
      google.script.run.withSuccessHandler(function(r) {
        if (r.success) showStatus('保存しました', 'success');
        else showStatus(r.error, 'error');
      }).task_saveSystemSettings({
        '棚卸し曜日': document.getElementById('day').value,
        '棚卸し時間': document.getElementById('time').value
      });
    }
  <\/script>
</body></html>`;

  var output = HtmlService.createHtmlOutput(html).setWidth(450).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(output, '\uD83D\uDCC5 棚卸し設定');
}

/**
 * AIモデル設定ダイアログ
 */
function showAiModelSettingsDialog() {
  var current = task_getSystemSetting('AIモデル') || 'gemini-2.0-flash';
  var models = [
    { id: 'gemini-2.5-pro-preview-06-05', label: 'Gemini 2.5 Pro（推奨・高精度）' },
    { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash（高速・高精度）' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash（高速）' }
  ];
  var radioHtml = models.map(function(m) {
    return '<div style="margin-bottom:10px;"><label><input type="radio" name="model" value="' + m.id + '"' +
      (current === m.id ? ' checked' : '') + '> ' + m.label + '</label></div>';
  }).join('');

  var html = `<!DOCTYPE html>
<html>
<head>${TASK_DIALOG_STYLES}</head>
<body>
  <h3>\uD83E\uDD16 AIモデル設定</h3>
  <div class="form-group"><label>使用モデル</label>${radioHtml}</div>
  <p style="font-size:12px; color:#666;">現在のモデル：${current}</p>
  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button class="btn btn-primary" onclick="save()">保存</button>
  </div>
  <div id="status" class="status"></div>
  ${TASK_UI_COMPONENTS}
  <script>
    function save() {
      var model = document.querySelector('input[name="model"]:checked');
      if (!model) return;
      google.script.run.withSuccessHandler(function(r) {
        if (r.success) showStatus('保存しました', 'success');
        else showStatus(r.error, 'error');
      }).task_saveSystemSettings({ 'AIモデル': model.value });
    }
  <\/script>
</body></html>`;

  var output = HtmlService.createHtmlOutput(html).setWidth(500).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(output, '\uD83E\uDD16 AIモデル設定');
}
