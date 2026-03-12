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
      var overdue = 0, today = 0, normal = 0, reported = 0;
      filteredTasks.forEach(function(t) {
        if (t.urgency === 'overdue') overdue++;
        else if (t.urgency === 'today') today++;
        else if (t.urgency === 'reported') reported++;
        else normal++;
      });
      document.getElementById('summaryBar').innerHTML =
        '合計：<span class="summary-count">' + filteredTasks.length + '件</span>' +
        (overdue ? ' \uD83D\uDD34超過' + overdue : '') +
        (today ? ' \uD83D\uDFE1本日' + today : '') +
        (reported ? ' \uD83D\uDD35報告済' + reported : '') +
        ' \u2B1C通常' + normal;

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

          var taskHtml = '<div class="task-row" onclick="toggleTaskDetail(\\'' + t.id + '\\')">' +
            '<span class="status-icon-' + t.urgency + '">' + icon + '</span>' +
            '<strong>' + escapeHtml(t.id) + '</strong> ' +
            escapeHtml(t.title) +
            '<span style="margin-left:auto; font-size:12px; color:#666;">（期限：' + escapeHtml(deadlineText) + '）</span>' +
            '</div>';

          taskHtml += '<div class="task-detail" id="detail-' + t.id + '">' +
            '<div class="detail-section"><span class="detail-label">状態：</span> ' + escapeHtml(t.status) + '</div>' +
            '<div class="detail-section"><span class="detail-label">期限：</span> ' + escapeHtml(t.deadline || '未設定') + '</div>' +
            (t.doneCriteria ? '<div class="detail-section"><span class="detail-label">完了条件：</span> ' + escapeHtml(t.doneCriteria) + '</div>' : '') +
            (t.notes ? '<div class="detail-section"><span class="detail-label">備考：</span> ' + escapeHtml(t.notes) + '</div>' : '') +
            (t.completionComment ? '<div class="detail-section"><span class="detail-label">完了報告：</span> ' + escapeHtml(t.completionComment) + '</div>' : '') +
            (t.approvalNote ? '<div class="detail-section"><span class="detail-label">承認/差し戻し：</span> ' + escapeHtml(t.approvalNote) + '</div>' : '') +
            '<div class="action-btns">' +
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
        '【完了条件】' + (task.doneCriteria || '');
      copyToClipboard(text);
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
