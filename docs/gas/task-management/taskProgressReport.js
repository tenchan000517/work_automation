/**
 * タスク管理システム - 進捗報告（LINE WORKS用）
 *
 * 要件定義のscope_in/scope_outに対して進捗をチェックし、
 * LINE WORKS用の報告フォーマットを自動生成する。
 *
 * 依存: taskSheetManager.js（task_getAllTasks, task_getMemberNames）
 *       taskCommonStyles.js（task_getCommonStyles）
 */

// ================================================================================
// ===== サーバーサイド =====
// ================================================================================

/**
 * 進捗報告ダイアログを表示
 */
function task_showProgressReportDialog() {
  var html = HtmlService.createHtmlOutput(task_buildProgressReportHTML())
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📊 進捗報告');
}

/**
 * 自分の進行中タスクを取得（要件定義付き）
 * @param {string} assignee
 * @returns {Array}
 */
function task_getMyActiveTasks(assignee) {
  var tasks = task_getAllTasks({ status: '未完了' });
  var result = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (assignee && t.assignee !== assignee) continue;
    if (t.status === '保留') continue;

    // scope_in/scope_outをパース
    var scopeIn = [];
    var scopeOut = [];
    var kgi = '';
    var handoff = '';
    if (t.requirementDef) {
      kgi = t.requirementDef.kgi || '';
      handoff = t.requirementDef.handoff_definition || '';
      scopeIn = parseScopeItems_(t.requirementDef.scope_in || '');
      scopeOut = parseScopeItems_(t.requirementDef.scope_out || '');
    }

    result.push({
      id: t.id,
      company: t.company || '',
      title: t.title,
      taskType: t.taskType || '',
      status: t.status,
      deadline: t.deadline,
      parentId: t.parentId || '',
      kgi: kgi,
      handoff: handoff,
      scopeIn: scopeIn,
      scopeOut: scopeOut,
      hasRequirementDef: !!t.requirementDef
    });
  }
  return result;
}

/**
 * scope文字列を項目配列にパース
 * 「・」「- 」「\n」「、」で分割
 */
function parseScopeItems_(text) {
  if (!text) return [];
  // 改行で分割 → 各行の先頭記号を除去
  var lines = text.split(/\n/);
  var items = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/^[\s・\-\*・]+/, '').trim();
    if (line) items.push(line);
  }
  return items;
}

// ================================================================================
// ===== HTML =====
// ================================================================================

function task_buildProgressReportHTML() {
  var members = [];
  try { members = task_getMemberNames(); } catch (e) {}

  return '<html><head>' +
    '<style>' + task_getCommonStyles() +
    // 追加スタイル
    'body { font-family: "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 16px; background: #f5f5f5; }' +
    '.screen { display: none; }' +
    '.screen.active { display: block; }' +

    // 画面1: 担当者選択
    '.member-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; }' +
    '.member-btn { padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; text-align: center; }' +
    '.member-btn:hover { border-color: #1a73e8; background: #e8f0fe; }' +

    // 画面2: タスク選択
    '.task-card { background: #fff; border-radius: 8px; padding: 12px 16px; margin: 8px 0; border-left: 4px solid #1a73e8; cursor: pointer; }' +
    '.task-card:hover { background: #e8f0fe; }' +
    '.task-card.selected { border-left-color: #34a853; background: #e6f4ea; }' +
    '.task-company { font-size: 12px; color: #666; }' +
    '.task-title { font-size: 14px; font-weight: bold; margin: 4px 0; }' +
    '.task-meta { font-size: 12px; color: #888; }' +
    '.no-req { color: #d93025; font-size: 12px; }' +

    // 画面3: チェック
    '.check-section { background: #fff; border-radius: 8px; padding: 16px; margin: 12px 0; }' +
    '.section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }' +
    '.scope-in-title { color: #1a73e8; }' +
    '.scope-out-title { color: #d93025; }' +
    '.check-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }' +
    '.check-item:last-child { border-bottom: none; }' +
    '.check-item input[type="checkbox"] { margin-top: 3px; transform: scale(1.2); }' +
    '.check-item label { font-size: 13px; flex: 1; cursor: pointer; }' +
    '.scope-out-warning { background: #fce8e6; border-radius: 6px; padding: 10px 12px; margin: 4px 0; font-size: 12px; color: #c5221f; }' +
    '.kgi-box { background: #e8f0fe; border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #174ea6; }' +
    '.memo-input { width: 100%; min-height: 60px; border: 1px solid #ddd; border-radius: 6px; padding: 8px; font-size: 13px; resize: vertical; box-sizing: border-box; }' +

    // 画面4: 報告プレビュー
    '.report-box { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; white-space: pre-wrap; min-height: 200px; }' +

    // 共通
    '.btn-primary { background: #1a73e8; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; cursor: pointer; }' +
    '.btn-primary:hover { background: #1557b0; }' +
    '.btn-copy { background: #34a853; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; cursor: pointer; }' +
    '.btn-copy:hover { background: #2d8e47; }' +
    '.btn-back { background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; }' +
    '.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; }' +
    '.task-count-badge { font-size: 12px; color: #666; }' +
    '</style>' +
    '</head><body>' +

    // ===== 画面1: 担当者選択 =====
    '<div id="screen1" class="screen active">' +
    '<h3>自分を選択してください</h3>' +
    '<div class="member-grid">' +
    members.map(function(name) {
      return '<div class="member-btn" onclick="selectMember(\'' + name + '\')">' + name + '</div>';
    }).join('') +
    '</div>' +
    '</div>' +

    // ===== 画面2: タスク選択 =====
    '<div id="screen2" class="screen">' +
    '<div style="display:flex; justify-content:space-between; align-items:center;">' +
    '<h3>進捗を報告するタスクを選択</h3>' +
    '<span class="task-count-badge" id="taskCount"></span>' +
    '</div>' +
    '<div id="taskList"></div>' +
    '<div style="height:60px;"></div>' +
    '<div class="bottom-bar">' +
    '<button class="btn-back" onclick="goScreen(1)">← 戻る</button>' +
    '<button class="btn-primary" id="btnNext" onclick="goToCheck()" disabled>選択したタスクの進捗を入力 →</button>' +
    '</div>' +
    '</div>' +

    // ===== 画面3: チェック入力 =====
    '<div id="screen3" class="screen">' +
    '<div id="checkContent"></div>' +
    '<div style="height:60px;"></div>' +
    '<div class="bottom-bar">' +
    '<button class="btn-back" onclick="goScreen(2)">← 戻る</button>' +
    '<button class="btn-primary" onclick="generateReport()">報告を生成 →</button>' +
    '</div>' +
    '</div>' +

    // ===== 画面4: 報告プレビュー =====
    '<div id="screen4" class="screen">' +
    '<h3>LINE WORKS用 報告テキスト</h3>' +
    '<div class="report-box" id="reportText"></div>' +
    '<div style="height:60px;"></div>' +
    '<div class="bottom-bar">' +
    '<button class="btn-back" onclick="goScreen(3)">← 戻る</button>' +
    '<button class="btn-copy" onclick="copyReport()">📋 コピー</button>' +
    '</div>' +
    '</div>' +

    '<script>' +
    'var currentMember = "";' +
    'var allTasks = [];' +
    'var selectedTaskIds = {};' +
    'var taskMemos = {};' +

    'function goScreen(n) {' +
    '  document.querySelectorAll(".screen").forEach(function(el) { el.classList.remove("active"); });' +
    '  document.getElementById("screen" + n).classList.add("active");' +
    '}' +

    // 画面1 → 2: 担当者選択後にタスク読み込み
    'function selectMember(name) {' +
    '  currentMember = name;' +
    '  document.getElementById("taskList").innerHTML = "<p>読み込み中...</p>";' +
    '  goScreen(2);' +
    '  google.script.run.withSuccessHandler(function(tasks) {' +
    '    allTasks = tasks || [];' +
    '    renderTaskList();' +
    '  }).task_getMyActiveTasks(name);' +
    '}' +

    'function renderTaskList() {' +
    '  var html = "";' +
    '  if (allTasks.length === 0) {' +
    '    html = "<p style=\\"color:#888;\\">進行中のタスクがありません</p>";' +
    '  }' +
    '  document.getElementById("taskCount").textContent = allTasks.length + "件";' +
    '  for (var i = 0; i < allTasks.length; i++) {' +
    '    var t = allTasks[i];' +
    '    var sel = selectedTaskIds[t.id] ? " selected" : "";' +
    '    html += \'<div class="task-card\' + sel + \'" onclick="toggleTask(\\\'\' + t.id + \'\\\')">\'  +' +
    '      (t.company ? \'<div class="task-company">\' + esc(t.company) + (t.taskType ? " / " + esc(t.taskType) : "") + \'</div>\' : "") +' +
    '      \'<div class="task-title">\' + esc(t.title) + \'</div>\' +' +
    '      \'<div class="task-meta">\' + t.status + (t.deadline ? " | 期限: " + t.deadline : "") +' +
    '      (!t.hasRequirementDef ? \' | <span class="no-req">⚠️ 要件定義なし</span>\' : " | ✅ 要件定義あり") +' +
    '      \'</div></div>\';' +
    '  }' +
    '  document.getElementById("taskList").innerHTML = html;' +
    '  document.getElementById("btnNext").disabled = Object.keys(selectedTaskIds).length === 0;' +
    '}' +

    'function toggleTask(id) {' +
    '  if (selectedTaskIds[id]) { delete selectedTaskIds[id]; }' +
    '  else { selectedTaskIds[id] = true; }' +
    '  renderTaskList();' +
    '}' +

    // 画面2 → 3: チェック入力
    'function goToCheck() {' +
    '  var html = "";' +
    '  var selected = allTasks.filter(function(t) { return selectedTaskIds[t.id]; });' +
    '  for (var i = 0; i < selected.length; i++) {' +
    '    var t = selected[i];' +
    '    html += \'<div class="check-section">\';' +
    '    html += \'<div style="font-size:12px;color:#666;">\' + esc(t.company || "") + \'</div>\';' +
    '    html += \'<div style="font-size:16px;font-weight:bold;margin:4px 0;">\' + esc(t.title) + \'</div>\';' +

    // KGI表示
    '    if (t.kgi) {' +
    '      html += \'<div class="kgi-box" style="margin:8px 0;">🎯 KGI: \' + esc(t.kgi) + \'</div>\';' +
    '    }' +

    // scope_in チェックリスト
    '    if (t.scopeIn.length > 0) {' +
    '      html += \'<div class="section-title scope-in-title">✅ やること（スコープ内）</div>\';' +
    '      for (var j = 0; j < t.scopeIn.length; j++) {' +
    '        var itemId = "si_" + t.id + "_" + j;' +
    '        html += \'<div class="check-item">\' +' +
    '          \'<input type="checkbox" id="\' + itemId + \'">\' +' +
    '          \'<label for="\' + itemId + \'">\' + esc(t.scopeIn[j]) + \'</label></div>\';' +
    '      }' +
    '    } else if (!t.hasRequirementDef) {' +
    '      html += \'<div class="scope-out-warning">⚠️ 要件定義がありません。先に要件定義を行ってください。</div>\';' +
    '    }' +

    // scope_out 警告表示
    '    if (t.scopeOut.length > 0) {' +
    '      html += \'<div class="section-title scope-out-title" style="margin-top:12px;">🚫 やらないこと（スコープ外）</div>\';' +
    '      for (var k = 0; k < t.scopeOut.length; k++) {' +
    '        html += \'<div class="scope-out-warning">・\' + esc(t.scopeOut[k]) + \'</div>\';' +
    '      }' +
    '    }' +

    // メモ
    '    html += \'<div style="margin-top:12px;"><div class="section-title">💬 メモ（任意）</div>\';' +
    '    html += \'<textarea class="memo-input" id="memo_\' + t.id + \'" placeholder="補足があれば...">\' + esc(taskMemos[t.id] || "") + \'</textarea></div>\';' +
    '    html += \'</div>\';' +
    '  }' +
    '  document.getElementById("checkContent").innerHTML = html;' +
    '  goScreen(3);' +
    '}' +

    // 画面3 → 4: 報告生成
    'function generateReport() {' +
    '  var now = new Date();' +
    '  var timeStr = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);' +
    '  var report = "📊 進捗報告（" + timeStr + "）\\n";' +
    '  var selected = allTasks.filter(function(t) { return selectedTaskIds[t.id]; });' +

    '  for (var i = 0; i < selected.length; i++) {' +
    '    var t = selected[i];' +
    '    report += "\\n■ " + (t.company ? t.company + " " : "") + t.title;' +
    '    if (t.deadline) report += "（期限: " + t.deadline + "）";' +
    '    report += "\\n";' +

    // scope_inの進捗
    '    if (t.scopeIn.length > 0) {' +
    '      report += "【やること】\\n";' +
    '      for (var j = 0; j < t.scopeIn.length; j++) {' +
    '        var cb = document.getElementById("si_" + t.id + "_" + j);' +
    '        var checked = cb ? cb.checked : false;' +
    '        report += (checked ? "✅ " : "⬜ ") + t.scopeIn[j] + "\\n";' +
    '      }' +
    '    }' +

    // scope_out確認
    '    if (t.scopeOut.length > 0) {' +
    '      report += "【やらないこと（確認）】\\n";' +
    '      for (var k = 0; k < t.scopeOut.length; k++) {' +
    '        report += "🚫 " + t.scopeOut[k] + " → 触れていない\\n";' +
    '      }' +
    '    }' +

    // メモ
    '    var memoEl = document.getElementById("memo_" + t.id);' +
    '    var memo = memoEl ? memoEl.value.trim() : "";' +
    '    taskMemos[t.id] = memo;' +
    '    if (memo) {' +
    '      report += "【メモ】\\n" + memo + "\\n";' +
    '    }' +
    '  }' +

    '  document.getElementById("reportText").textContent = report;' +
    '  goScreen(4);' +
    '}' +

    // コピー
    'function copyReport() {' +
    '  var text = document.getElementById("reportText").textContent;' +
    '  if (navigator.clipboard) {' +
    '    navigator.clipboard.writeText(text).then(function() {' +
    '      var btn = document.querySelector(".btn-copy");' +
    '      btn.textContent = "✅ コピーしました";' +
    '      setTimeout(function() { btn.textContent = "📋 コピー"; }, 2000);' +
    '    });' +
    '  } else {' +
    '    var ta = document.createElement("textarea");' +
    '    ta.value = text;' +
    '    document.body.appendChild(ta);' +
    '    ta.select();' +
    '    document.execCommand("copy");' +
    '    document.body.removeChild(ta);' +
    '    var btn = document.querySelector(".btn-copy");' +
    '    btn.textContent = "✅ コピーしました";' +
    '    setTimeout(function() { btn.textContent = "📋 コピー"; }, 2000);' +
    '  }' +
    '}' +

    'function esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }' +
    '</script></body></html>';
}
