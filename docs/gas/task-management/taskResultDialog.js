/**
 * タスク管理システム - 画面2〜4：候補選択 → 要件確認 → 登録完了
 *
 * SPA方式で1つのダイアログ内にステップ2〜4を実装。
 * - 画面2: タスク候補一覧（チェックボックス選択）
 * - 画面3: 要件確認（タスクごとの詳細入力）
 * - 画面4: 登録完了
 *
 * 依存: taskCommonStyles.js, taskSheetManager.js, taskAiAnalyzer.js, taskCalendarManager.js
 */

// ================================================================================
// ===== ダイアログ表示 =====
// ================================================================================

/**
 * AI解析結果からダイアログを表示
 * @param {string} aiResultJson - JSON文字列
 */
function task_showResultDialogFromData(aiResultJson) {
  var aiResult = JSON.parse(aiResultJson);
  var members = task_getMemberNames();
  var html = HtmlService.createHtmlOutput(
    task_createResultDialogHtml(aiResult, members, aiResult.inputMode, aiResult.originalText)
  )
    .setWidth(850)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '\uD83D\uDCCB タスク候補');
}

/**
 * ダイアログからタスクを一括登録
 * @param {string} tasksJson - 登録するタスクのJSON文字列
 * @returns {{success: boolean, results?: Array, error?: string}}
 */
function task_registerTasksFromDialog(tasksJson) {
  try {
    var tasks = JSON.parse(tasksJson);
    var results = [];

    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      var regResult = task_registerTask({
        title: t.title,
        assignee: t.assignee,
        deadline: t.deadline,
        doneCriteria: t.doneCriteria,
        inputMode: t.inputMode || '',
        notes: t.notes || '',
        size: t.size || '',
        company: t.company_name || t.company || '',
        taskType: t.task_type || t.taskType || '',
        ballHolder: t.ballHolder || ''
      });

      var calResult = { success: false };
      if (regResult.success && t.deadline) {
        calResult = task_createCalendarEvent({
          taskId: regResult.taskId,
          title: t.title,
          assignee: t.assignee,
          deadline: t.deadline,
          doneCriteria: t.doneCriteria,
          scopeIn: t.scopeIn || '',
          scopeOut: t.scopeOut || '',
          notes: t.notes || ''
        });
      }

      results.push({
        taskId: regResult.taskId || '',
        title: t.title,
        assignee: t.assignee,
        deadline: t.deadline,
        size: t.size || '',
        company: t.company_name || t.company || '',
        taskType: t.task_type || t.taskType || '',
        ballHolder: t.ballHolder || '',
        success: regResult.success,
        calendarCreated: calResult.success,
        error: regResult.error || ''
      });
    }

    return { success: true, results: results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * タスクデータをClaude Code用フォーマットに変換
 * @param {Object} taskData
 * @returns {string}
 */
function task_formatForClaudeCode(taskData) {
  var lines = [];
  lines.push('以下のタスクの作業を開始してください。');
  lines.push('');
  lines.push('【タスク】' + (taskData.title || ''));
  lines.push('【担当】' + (taskData.assignee || ''));
  lines.push('【期限】' + (taskData.deadline || '未設定'));
  lines.push('【企業名】' + (taskData.company || ''));
  lines.push('【種別】' + (taskData.taskType || ''));
  lines.push('【完了条件】' + (taskData.doneCriteria || ''));

  if (taskData.scopeIn) {
    lines.push('【やること】');
    var inItems = taskData.scopeIn.split(/[、,\n]/);
    for (var i = 0; i < inItems.length; i++) {
      var item = inItems[i].trim();
      if (item) lines.push('- ' + item);
    }
  }

  if (taskData.scopeOut) {
    lines.push('【やらないこと】');
    var outItems = taskData.scopeOut.split(/[、,\n]/);
    for (var j = 0; j < outItems.length; j++) {
      var outItem = outItems[j].trim();
      if (outItem) lines.push('- ' + outItem);
    }
  }

  // 要件定義情報を含める
  var reqStatus = task_getRequirementStatus(taskData);
  if (reqStatus === 'done' && taskData.requirementDef) {
    var rd = taskData.requirementDef;
    lines.push('');
    lines.push('--- 要件定義 ---');
    if (rd.kgi) lines.push('【KGI（本当のゴール）】' + rd.kgi);
    if (rd.handoff_definition) lines.push('【手離れの定義】' + rd.handoff_definition);
    if (rd.scope_in) lines.push('【スコープ: やること】' + rd.scope_in);
    if (rd.scope_out) lines.push('【スコープ: やらないこと】' + rd.scope_out);
  } else if (reqStatus === 'pending') {
    lines.push('');
    lines.push('⚠️ まず /define-task ' + (taskData.id || '') + ' で要件定義を行ってください');
  }

  return lines.join('\n');
}

// ================================================================================
// ===== HTML生成 =====
// ================================================================================

/**
 * 結果ダイアログのHTMLを生成
 * @param {Object} aiResult - {tasks, skippedMessages, inputMode, originalText}
 * @param {string[]} members
 * @param {string} inputMode
 * @param {string} originalText
 * @returns {string}
 */
function task_createResultDialogHtml(aiResult, members, inputMode, originalText) {
  var tasksJson = JSON.stringify(aiResult.tasks || []);
  var skippedJson = JSON.stringify(aiResult.skippedMessages || []);
  var membersJson = JSON.stringify(members);
  var escapedOriginalText = (originalText || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

  var modeLabelMap = {
    'works_bulk': 'ワークス一括',
    'works_pin': 'ワークスピンポイント',
    'notta': 'NOTTA',
    'free_text': '自由記述',
    'discussion': 'ディスカッション'
  };
  var modeLabel = modeLabelMap[inputMode] || inputMode;

  return `<!DOCTYPE html>
<html>
<head>
  ${TASK_DIALOG_STYLES}
  <style>
    .step { display: none; }
    .step.active { display: block; }
    .task-check { display: flex; align-items: flex-start; gap: 10px; }
    .task-check input[type="checkbox"] { margin-top: 4px; width: 18px; height: 18px; cursor: pointer; }
    .req-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .req-counter { font-size: 14px; color: #666; }
    .result-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .result-item:last-child { border-bottom: none; }
    .result-icon { font-size: 18px; }
  </style>
</head>
<body>
  <!-- ステップインジケータ -->
  <div class="step-indicator">
    <div class="step-dot active" id="dot-2"></div>
    <div class="step-dot" id="dot-3"></div>
    <div class="step-dot" id="dot-4"></div>
  </div>

  <!-- ===== 画面2: タスク候補一覧 ===== -->
  <div id="step2" class="step active">
    <h3 id="step2Title"></h3>
    <p class="description">タスク化するものに\u2705を入れてください</p>
    <div id="taskCandidates"></div>

    <div id="skippedSection" style="display:none; margin-top:16px;">
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion('skipped')">
          <span class="accordion-title" id="skippedTitle"></span>
          <span class="accordion-arrow" id="accordion-arrow-skipped">\u25B6</span>
        </div>
        <div class="accordion-content" id="accordion-content-skipped">
          <div id="skippedList" style="font-size:13px; color:#666;"></div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
      <button class="btn btn-primary" onclick="proceedToRequirements()">選択したタスクの要件を確認する</button>
    </div>
  </div>

  <!-- ===== 画面3: 要件確認 ===== -->
  <div id="step3" class="step">
    <div class="req-nav">
      <button class="btn btn-secondary" onclick="prevTask()" id="prevBtn">\u2190 前へ</button>
      <span class="req-counter" id="reqCounter"></span>
      <button class="btn btn-secondary" onclick="nextTask()" id="nextBtn">次へ \u2192</button>
    </div>

    <div id="requirementsForm"></div>

    <div class="actions" style="margin-top:20px;">
      <button class="btn btn-secondary" onclick="showStep(2)">\u2190 候補一覧に戻る</button>
      <button id="registerBtn" class="btn btn-green" onclick="registerAllTasks()">\u2705 登録する</button>
    </div>
  </div>

  <!-- ===== 画面4: 登録完了 ===== -->
  <div id="step4" class="step">
    <h3>\u2705 登録完了</h3>
    <p class="description">以下のタスクを登録しました</p>
    <div id="registrationResults"></div>

    <div class="actions" style="margin-top:20px;">
      <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
    </div>
  </div>

  <div id="status" class="status"></div>

  ${TASK_UI_COMPONENTS}

  <script>
    var allTasks = ${tasksJson};
    var skippedMessages = ${skippedJson};
    var membersList = ${membersJson};
    var inputMode = '${inputMode}';
    var modeLabel = '${modeLabel}';
    var originalText = \`${escapedOriginalText}\`;

    var selectedTasks = [];
    var currentTaskIndex = 0;

    // ===== コンテンツ安全フィルタ =====
    function sanitizeText(text) {
      if (!text) return '';
      var patterns = [
        /[バﾊﾞ][カｶ]|ばか|馬鹿/g,
        /[アｱ][ホｿ]|あほ|阿呆/g,
        /死ね|しね|死んで/g,
        /[クｸ][ソｿ]|くそ|糞/g,
        /ふざけ(?:るな|んな|んじゃ)/g,
        /うざ[いっ]/g,
        /[キｷ][モﾓ][いっ]/g,
        /頭いかれ/g,
        /馬鹿じゃ/g,
        /マジで怒/g
      ];
      var result = text;
      for (var i = 0; i < patterns.length; i++) {
        result = result.replace(patterns[i], '***');
      }
      return result;
    }

    // ===== 初期化: 画面2の候補一覧を描画 =====
    (function init() {
      document.getElementById('step2Title').textContent =
        '\uD83D\uDCCB タスク候補（' + allTasks.length + '件検出）';

      var container = document.getElementById('taskCandidates');
      container.innerHTML = '';

      for (var i = 0; i < allTasks.length; i++) {
        var t = allTasks[i];
        var conf = t.confidence || '中';
        var confClass = conf === '高' ? 'high' : (conf === '低' ? 'low' : 'mid');
        var checked = conf !== '低' ? 'checked' : '';

        var warnings = '';
        if (t.warnings && t.warnings.length > 0) {
          warnings = '<div class="task-warning">\u26A0\uFE0F ' + escapeHtml(sanitizeText(t.warnings.join(' / '))) + '</div>';
        }
        if (t.ambiguous_expressions && t.ambiguous_expressions.length > 0) {
          for (var j = 0; j < t.ambiguous_expressions.length; j++) {
            warnings += '<div class="task-info">\u2753 ' + escapeHtml(t.ambiguous_expressions[j].question) + '</div>';
          }
        }

        var sizeLabel = '';
        if (t.size) {
          var sizeIcon = t.size === '大' ? '\uD83D\uDD34' : (t.size === '中' ? '\uD83D\uDFE1' : '');
          if (sizeIcon) sizeLabel = '<span class="badge-size badge-size-' + (t.size === '大' ? 'large' : 'medium') + '-pending">' + sizeIcon + escapeHtml(t.size) + '</span>';
        }

        container.innerHTML += '<div class="task-card confidence-' + confClass + '">' +
          '<div class="task-check">' +
          '<input type="checkbox" id="task-check-' + i + '" data-index="' + i + '" ' + checked + '>' +
          '<div style="flex:1;">' +
          '<div class="task-header">' +
          '<span class="badge-confidence badge-' + confClass + '">確信度：' + escapeHtml(conf) + '</span>' +
          sizeLabel +
          '<span class="task-title">' + escapeHtml(t.title) + '</span>' +
          '</div>' +
          '<div class="task-meta">担当：' + escapeHtml(t.assignee || '未特定') +
          ' \uFF5C 期限：' + escapeHtml(t.deadline || '未設定') + '</div>' +
          warnings +
          '</div></div></div>';
      }

      // スキップされたメッセージ
      if (skippedMessages.length > 0) {
        document.getElementById('skippedSection').style.display = 'block';
        document.getElementById('skippedTitle').textContent =
          'スキップされたメッセージ（' + skippedMessages.length + '件）';
        var skippedHtml = '';
        for (var k = 0; k < skippedMessages.length; k++) {
          var s = skippedMessages[k];
          if (inputMode === 'notta') {
            // NOTTAモード: content_summaryを非表示（不適切な発言の漏出を防止）
            skippedHtml += '<p><strong>' + escapeHtml(s.speaker || '') + '</strong>' +
              '<br><span style="color:#999;">' + escapeHtml(s.reason || '') + '</span></p>';
          } else {
            skippedHtml += '<p><strong>' + escapeHtml(s.speaker || '') + '</strong>：' +
              escapeHtml(sanitizeText(s.content_summary || '')) +
              '<br><span style="color:#999;">' + escapeHtml(s.reason || '') + '</span></p>';
          }
        }
        document.getElementById('skippedList').innerHTML = skippedHtml;
      }
    })();

    // ===== ステップ遷移 =====
    function showStep(step) {
      document.querySelectorAll('.step').forEach(function(el) { el.classList.remove('active'); });
      document.getElementById('step' + step).classList.add('active');

      for (var i = 2; i <= 4; i++) {
        var dot = document.getElementById('dot-' + i);
        dot.className = 'step-dot';
        if (i < step) dot.className = 'step-dot done';
        if (i === step) dot.className = 'step-dot active';
      }
    }

    // ===== 画面2 → 画面3 =====
    function proceedToRequirements() {
      selectedTasks = [];
      var checkboxes = document.querySelectorAll('#taskCandidates input[type="checkbox"]');
      checkboxes.forEach(function(cb) {
        if (cb.checked) {
          selectedTasks.push(allTasks[parseInt(cb.dataset.index)]);
        }
      });

      if (selectedTasks.length === 0) {
        showStatus('タスクを1つ以上選択してください', 'error');
        return;
      }

      currentTaskIndex = 0;
      renderRequirementsStep();
      showStep(3);
    }

    // ===== 画面3: 要件確認フォーム描画 =====
    function renderRequirementsStep() {
      var t = selectedTasks[currentTaskIndex];
      document.getElementById('reqCounter').textContent =
        '(' + (currentTaskIndex + 1) + '/' + selectedTasks.length + ') ' + escapeHtml(t.title);

      document.getElementById('prevBtn').disabled = currentTaskIndex === 0;
      document.getElementById('nextBtn').disabled = currentTaskIndex >= selectedTasks.length - 1;

      var taskTypeVal = t.task_type || t.taskType || '';

      // 担当者ドロップダウン
      var assigneeOptions = '<option value="">選択してください</option>';
      for (var i = 0; i < membersList.length; i++) {
        var sel = (t.assignee === membersList[i] || t.assignee === membersList[i]) ? ' selected' : '';
        assigneeOptions += '<option value="' + escapeHtml(membersList[i]) + '"' + sel + '>' + escapeHtml(membersList[i]) + '</option>';
      }
      if (t.assignee && membersList.indexOf(t.assignee) === -1 && t.assignee !== '未特定') {
        assigneeOptions += '<option value="' + escapeHtml(t.assignee) + '" selected>' + escapeHtml(t.assignee) + '</option>';
      }

      var detailHtml = '';
      if (t.detail) {
        detailHtml = '<div class="info-box"><strong>AIが整理した内容：</strong><br>' + escapeHtml(sanitizeText(t.detail)) + '</div>';
      }

      var form = '<h3>\uD83D\uDCCB 要件確認</h3>' + detailHtml +
        '<div class="form-group"><label>担当者</label>' +
        '<select id="req-assignee" onchange="saveCurrentTask()">' + assigneeOptions + '</select></div>' +
        '<div class="form-group"><label>期限</label>' +
        '<input type="date" id="req-deadline" value="' + escapeHtml(t.deadline !== '未設定' ? t.deadline : '') + '" onchange="saveCurrentTask()"></div>' +
        '<div class="form-group"><label>完了条件</label>' +
        '<textarea id="req-doneCriteria" rows="2" onchange="saveCurrentTask()">' + escapeHtml(t.done_criteria || '') + '</textarea>' +
        '<div class="hint">AIが提案。修正可能</div></div>' +
        '<div class="form-group"><label>やること</label>' +
        '<textarea id="req-scopeIn" rows="2" onchange="saveCurrentTask()">' + escapeHtml(t.scope_in || '') + '</textarea></div>' +
        '<div class="form-group"><label>やらないこと</label>' +
        '<textarea id="req-scopeOut" rows="2" onchange="saveCurrentTask()">' + escapeHtml(t.scope_out || '') + '</textarea></div>' +
        '<div class="form-group"><label>備考</label>' +
        '<input type="text" id="req-notes" value="" onchange="saveCurrentTask()"></div>' +
        '<div class="form-group"><label>企業名</label>' +
        '<input type="text" id="req-company" value="' + escapeHtml(t.company_name || t.company || '') + '" onchange="saveCurrentTask()"></div>' +
        '<div class="form-group"><label>種別</label>' +
        '<select id="req-taskType" onchange="saveCurrentTask()">' +
        '<option value="">選択してください</option>' +
        '<option value="HP"' + (taskTypeVal === 'HP' ? ' selected' : '') + '>HP</option>' +
        '<option value="LP"' + (taskTypeVal === 'LP' ? ' selected' : '') + '>LP</option>' +
        '<option value="パンフレット・カタログ"' + (taskTypeVal === 'パンフレット・カタログ' ? ' selected' : '') + '>パンフレット・カタログ</option>' +
        '<option value="月刊Sing"' + (taskTypeVal === '月刊Sing' ? ' selected' : '') + '>月刊Sing</option>' +
        '<option value="ゆめマガ"' + (taskTypeVal === 'ゆめマガ' ? ' selected' : '') + '>ゆめマガ</option>' +
        '<option value="動画"' + (taskTypeVal === '動画' ? ' selected' : '') + '>動画</option>' +
        '<option value="動画撮影"' + (taskTypeVal === '動画撮影' ? ' selected' : '') + '>動画撮影</option>' +
        '<option value="SNS関連"' + (taskTypeVal === 'SNS関連' ? ' selected' : '') + '>SNS関連</option>' +
        '<option value="FB"' + (taskTypeVal === 'FB' ? ' selected' : '') + '>FB</option>' +
        '<option value="FB資料作成"' + (taskTypeVal === 'FB資料作成' ? ' selected' : '') + '>FB資料作成</option>' +
        '<option value="営業支援"' + (taskTypeVal === '営業支援' ? ' selected' : '') + '>営業支援</option>' +
        '<option value="採用原稿関連"' + (taskTypeVal === '採用原稿関連' ? ' selected' : '') + '>採用原稿関連</option>' +
        '<option value="応募者対応"' + (taskTypeVal === '応募者対応' ? ' selected' : '') + '>応募者対応</option>' +
        '<option value="名刺"' + (taskTypeVal === '名刺' ? ' selected' : '') + '>名刺</option>' +
        '<option value="ロゴ"' + (taskTypeVal === 'ロゴ' ? ' selected' : '') + '>ロゴ</option>' +
        '<option value="原稿"' + (taskTypeVal === '原稿' ? ' selected' : '') + '>原稿</option>' +
        '</select></div>';

      document.getElementById('requirementsForm').innerHTML = form;
    }

    function saveCurrentTask() {
      var t = selectedTasks[currentTaskIndex];
      t.assignee = document.getElementById('req-assignee').value;
      t.deadline = document.getElementById('req-deadline').value || '未設定';
      t.done_criteria = document.getElementById('req-doneCriteria').value;
      t.scope_in = document.getElementById('req-scopeIn').value;
      t.scope_out = document.getElementById('req-scopeOut').value;
      t._notes = document.getElementById('req-notes').value;
      t.company_name = document.getElementById('req-company') ? document.getElementById('req-company').value : (t.company_name || '');
      t.task_type = document.getElementById('req-taskType') ? document.getElementById('req-taskType').value : (t.task_type || '');
    }

    function nextTask() {
      saveCurrentTask();
      if (currentTaskIndex < selectedTasks.length - 1) {
        currentTaskIndex++;
        renderRequirementsStep();
      }
    }

    function prevTask() {
      saveCurrentTask();
      if (currentTaskIndex > 0) {
        currentTaskIndex--;
        renderRequirementsStep();
      }
    }

    // ===== 画面3 → 画面4: 登録 =====
    function registerAllTasks() {
      saveCurrentTask();

      var btn = document.getElementById('registerBtn');
      setButtonLoading(btn, true);

      var tasksToRegister = selectedTasks.map(function(t) {
        return {
          title: t.title,
          assignee: t.assignee === '未特定' ? '' : t.assignee,
          deadline: t.deadline === '未設定' ? '' : t.deadline,
          doneCriteria: t.done_criteria || '',
          inputMode: modeLabel,
          notes: t._notes || '',
          scopeIn: t.scope_in || '',
          scopeOut: t.scope_out || '',
          size: t.size || '',
          company_name: t.company_name || t.company || '',
          task_type: t.task_type || t.taskType || '',
          ballHolder: t.ballHolder || ''
        };
      });

      google.script.run
        .withSuccessHandler(function(result) {
          setButtonLoading(btn, false, '\u2705 登録する');
          if (result.success) {
            renderCompletionStep(result.results);
            showStep(4);
          } else {
            showStatus('登録エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          setButtonLoading(btn, false, '\u2705 登録する');
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_registerTasksFromDialog(JSON.stringify(tasksToRegister));
    }

    // ===== 画面4: 登録完了 =====
    function renderCompletionStep(results) {
      var container = document.getElementById('registrationResults');
      var html = '';

      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var icon = r.success ? '\u2705' : '\u274C';
        var calIcon = r.calendarCreated ? '\uD83D\uDCC5 カレンダーに登録済み' : '';

        var reqDefBtn = '';
        if (r.success && (r.size === '大' || r.size === '中')) {
          reqDefBtn = '<button class="btn btn-orange" style="font-size:12px; padding:6px 10px; margin-right:4px;" onclick="openRequirementDef(\\'' + escapeHtml(r.taskId) + '\\')">\uD83D\uDCDD 要件定義する</button>';
        }

        var sizeBadge = '';
        if (r.size === '大') sizeBadge = '<span class="badge-size badge-size-large-pending">\uD83D\uDD34大</span>';
        else if (r.size === '中') sizeBadge = '<span class="badge-size badge-size-medium-pending">\uD83D\uDFE1中</span>';

        html += '<div class="result-item">' +
          '<span class="result-icon">' + icon + '</span>' +
          '<div style="flex:1;">' +
          '<strong>' + escapeHtml(r.taskId) + '</strong> ' + escapeHtml(r.title) + sizeBadge +
          (r.company ? '<br><span style="font-size:12px; color:#555;">企業：' + escapeHtml(r.company) + '</span>' : '') +
          (r.taskType ? '<br><span style="font-size:12px; color:#555;">種別：' + escapeHtml(r.taskType) + '</span>' : '') +
          '（' + escapeHtml(r.assignee || '未定') + '・' + escapeHtml(r.deadline || '期限なし') + '）' +
          (calIcon ? '<br><span style="font-size:12px; color:#1a73e8;">' + calIcon + '</span>' : '') +
          (r.error ? '<br><span style="font-size:12px; color:#c62828;">' + escapeHtml(r.error) + '</span>' : '') +
          '</div>' +
          '<div style="display:flex; gap:4px;">' +
          reqDefBtn +
          '<button class="btn btn-copy" style="font-size:12px; padding:6px 10px;" onclick="copyForClaudeCode(' + i + ')">\uD83E\uDD16 Claude Code</button>' +
          '</div></div>';
      }

      // 結果データをグローバルに保持
      window._registrationResults = results;
      container.innerHTML = html;
    }

    function copyForClaudeCode(idx) {
      var r = window._registrationResults[idx];
      var t = selectedTasks[idx];
      var text = '以下のタスクの作業を開始してください。\\n\\n' +
        '【タスク】' + (r.title || '') + '\\n' +
        '【担当】' + (r.assignee || '') + '\\n' +
        '【期限】' + (r.deadline || '未設定') + '\\n' +
        '【企業名】' + (r.company || t.company_name || '') + '\\n' +
        '【種別】' + (r.taskType || t.task_type || '') + '\\n' +
        '【完了条件】' + (t.done_criteria || '') + '\\n';

      if (t.scope_in) {
        text += '【やること】\\n';
        t.scope_in.split(/[、,\\n]/).forEach(function(item) {
          if (item.trim()) text += '- ' + item.trim() + '\\n';
        });
      }
      if (t.scope_out) {
        text += '【やらないこと】\\n';
        t.scope_out.split(/[、,\\n]/).forEach(function(item) {
          if (item.trim()) text += '- ' + item.trim() + '\\n';
        });
      }

      // 大/中タスクで要件定義未完了の場合、警告を追加
      if (r.size === '大' || r.size === '中') {
        text += '\\n⚠️ まず /define-task ' + r.taskId + ' で要件定義を行ってください\\n';
      }

      copyToClipboard(text);
    }

    function openRequirementDef(taskId) {
      google.script.host.close();
      google.script.run.task_showRequirementDialog(taskId);
    }
  <\/script>
</body>
</html>`;
}
