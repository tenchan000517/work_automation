/**
 * タスク管理システム - 画面1：モード選択 + テキスト入力ダイアログ
 *
 * 5つの入力モードから選択し、テキストを貼り付けてAI解析する画面。
 * ディスカッションモード時は追加フィールド（説明 + 依頼者ドロップダウン）を表示。
 *
 * 依存: taskCommonStyles.js, taskSheetManager.js, taskAiAnalyzer.js, taskDiscussionPatterns.js
 */

// ================================================================================
// ===== ダイアログ表示 =====
// ================================================================================

/**
 * 入力ダイアログを表示
 * @param {string} preselectedMode - 事前選択モード（works_bulk, works_pin, notta, free_text, discussion）
 */
function task_showInputDialog(preselectedMode) {
  var members = task_getMemberNames();
  var html = HtmlService.createHtmlOutput(task_createInputDialogHtml(preselectedMode, members))
    .setWidth(850)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '\uD83D\uDCCB タスク登録');
}

// ================================================================================
// ===== HTML生成 =====
// ================================================================================

/**
 * 入力ダイアログのHTMLを生成
 * @param {string} preselectedMode
 * @param {string[]} members
 * @returns {string}
 */
function task_createInputDialogHtml(preselectedMode, members) {
  var memberOptions = members.map(function(name) {
    return '<option value="' + name + '">' + name + '</option>';
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  ${TASK_DIALOG_STYLES}
  <style>
    .discussion-fields { display: none; margin-top: 16px; }
    .discussion-fields.show { display: block; }
  </style>
</head>
<body>
  <h3>\uD83D\uDCCB タスク登録</h3>
  <p class="description">入力モードを選択してください</p>

  <div class="mode-grid">
    <div class="mode-btn ${preselectedMode === 'works_bulk' ? 'selected' : ''}" data-mode="works_bulk" onclick="selectMode(this)">
      <span class="mode-icon">\uD83D\uDCAC</span>
      <span class="mode-label">ワークス一括</span>
    </div>
    <div class="mode-btn ${preselectedMode === 'works_pin' ? 'selected' : ''}" data-mode="works_pin" onclick="selectMode(this)">
      <span class="mode-icon">\uD83D\uDCCC</span>
      <span class="mode-label">ピンポイント</span>
    </div>
    <div class="mode-btn ${preselectedMode === 'notta' ? 'selected' : ''}" data-mode="notta" onclick="selectMode(this)">
      <span class="mode-icon">\uD83D\uDCDD</span>
      <span class="mode-label">NOTTA</span>
    </div>
    <div class="mode-btn ${preselectedMode === 'free_text' ? 'selected' : ''}" data-mode="free_text" onclick="selectMode(this)">
      <span class="mode-icon">\u270D\uFE0F</span>
      <span class="mode-label">自由記述</span>
    </div>
    <div class="mode-btn ${preselectedMode === 'discussion' ? 'selected' : ''}" data-mode="discussion" onclick="selectMode(this)">
      <span class="mode-icon">\uD83E\uDD1D</span>
      <span class="mode-label">ディスカッション</span>
    </div>
  </div>

  <!-- 通常モード: テキストエリア -->
  <div id="normalFields">
    <div class="form-group">
      <label>テキストを貼り付けてください</label>
      <textarea id="inputText" style="height: 200px;" placeholder="LINE WORKSの会話ログや会議の文字起こし、依頼内容などを貼り付けてください..."></textarea>
    </div>
  </div>

  <!-- ディスカッションモード: 追加フィールド -->
  <div id="discussionFields" class="discussion-fields">
    <div class="form-group">
      <label>何を頼まれましたか？</label>
      <textarea id="discussionDesc" style="height: 80px;" placeholder="例: バナー作成を頼まれました"></textarea>
    </div>
    <div class="form-group">
      <label>誰から？</label>
      <select id="requesterName">
        <option value="">選択してください</option>
        ${memberOptions}
        <option value="その他">その他</option>
      </select>
    </div>

    <div id="discussionQuestions" style="display:none;">
      <div class="section-title">確認事項</div>
      <p class="description">以下を確認しましたか？ わかる範囲で回答してください。</p>
      <div id="questionsList"></div>
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button id="analyzeBtn" class="btn btn-primary" onclick="startAnalysis()">AI解析する</button>
  </div>

  <div id="status" class="status"></div>

  ${TASK_UI_COMPONENTS}

  <script>
    var selectedMode = '${preselectedMode || ''}';

    function selectMode(el) {
      document.querySelectorAll('.mode-btn').forEach(function(btn) {
        btn.classList.remove('selected');
      });
      el.classList.add('selected');
      selectedMode = el.dataset.mode;

      // ディスカッションモードの表示切替
      var isDiscussion = selectedMode === 'discussion';
      document.getElementById('normalFields').style.display = isDiscussion ? 'none' : 'block';
      document.getElementById('discussionFields').className = 'discussion-fields' + (isDiscussion ? ' show' : '');
    }

    // ディスカッション: 説明入力時に質問パターンを表示
    document.getElementById('discussionDesc').addEventListener('blur', function() {
      var desc = this.value.trim();
      if (!desc) return;

      google.script.run
        .withSuccessHandler(function(result) {
          renderDiscussionQuestions(result);
        })
        .task_getDiscussionPattern(desc);
    });

    function renderDiscussionQuestions(patternResult) {
      var container = document.getElementById('questionsList');
      var wrapper = document.getElementById('discussionQuestions');
      container.innerHTML = '';

      var allQuestions = [];
      // 専門パターンの質問
      if (patternResult.matched && patternResult.pattern) {
        allQuestions = allQuestions.concat(patternResult.pattern.questions);
      }
      // 汎用質問
      if (patternResult.generic) {
        allQuestions = allQuestions.concat(patternResult.generic.questions);
      }

      // 重複除去
      var seen = {};
      var uniqueQuestions = [];
      for (var i = 0; i < allQuestions.length; i++) {
        if (!seen[allQuestions[i]]) {
          seen[allQuestions[i]] = true;
          uniqueQuestions.push(allQuestions[i]);
        }
      }

      for (var j = 0; j < uniqueQuestions.length; j++) {
        var q = uniqueQuestions[j];
        var div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = '<label>' + escapeHtml(q) + '</label>' +
          '<input type="text" class="discussion-answer" data-question="' + escapeHtml(q) + '" placeholder="回答（任意）">';
        container.appendChild(div);
      }

      wrapper.style.display = uniqueQuestions.length > 0 ? 'block' : 'none';
    }

    function startAnalysis() {
      if (!selectedMode) {
        showStatus('入力モードを選択してください', 'error');
        return;
      }

      var btn = document.getElementById('analyzeBtn');
      setButtonLoading(btn, true);

      if (selectedMode === 'discussion') {
        startDiscussionAnalysis(btn);
      } else {
        startTextAnalysis(btn);
      }
    }

    function startTextAnalysis(btn) {
      var inputText = document.getElementById('inputText').value.trim();
      if (!inputText) {
        showStatus('テキストを入力してください', 'error');
        setButtonLoading(btn, false, 'AI解析する');
        return;
      }

      showStatus('AI解析中...しばらくお待ちください', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setButtonLoading(btn, false, 'AI解析する');
          if (result.success) {
            // 結果ダイアログへ遷移（サーバー側でダイアログが開いてから閉じる）
            var resultData = JSON.stringify({
              tasks: result.tasks,
              skippedMessages: result.skippedMessages,
              inputMode: selectedMode,
              originalText: inputText
            });
            google.script.run
              .withSuccessHandler(function() { google.script.host.close(); })
              .withFailureHandler(function(e) { showStatus('結果表示エラー: ' + e.message, 'error'); })
              .task_showResultDialogFromData(resultData);
          } else {
            showStatus(result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          setButtonLoading(btn, false, 'AI解析する');
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_extractTasks(inputText, selectedMode);
    }

    function startDiscussionAnalysis(btn) {
      var desc = document.getElementById('discussionDesc').value.trim();
      if (!desc) {
        showStatus('依頼内容を入力してください', 'error');
        setButtonLoading(btn, false, 'AI解析する');
        return;
      }

      var requester = document.getElementById('requesterName').value;
      var answers = {};
      document.querySelectorAll('.discussion-answer').forEach(function(input) {
        if (input.value.trim()) {
          answers[input.dataset.question] = input.value.trim();
        }
      });

      showStatus('AI解析中...しばらくお待ちください', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          setButtonLoading(btn, false, 'AI解析する');
          if (result.success) {
            var resultData = JSON.stringify({
              tasks: result.tasks,
              skippedMessages: [],
              inputMode: 'discussion',
              originalText: desc,
              additionalQuestions: result.questions
            });
            google.script.run
              .withSuccessHandler(function() { google.script.host.close(); })
              .withFailureHandler(function(e) { showStatus('結果表示エラー: ' + e.message, 'error'); })
              .task_showResultDialogFromData(resultData);
          } else {
            showStatus(result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          setButtonLoading(btn, false, 'AI解析する');
          showStatus('エラー: ' + err.message, 'error');
        })
        .task_analyzeDiscussion(desc, requester, answers);
    }
  <\/script>
</body>
</html>`;
}
