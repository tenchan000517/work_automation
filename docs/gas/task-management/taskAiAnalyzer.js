/**
 * タスク管理システム - AI解析（Gemini API）
 *
 * Gemini APIを呼び出してテキストからタスクを抽出・要件定義を支援する。
 * APIキーは PropertiesService.getScriptProperties() に格納。
 *
 * 依存: taskSheetManager.js（task_getSystemSetting, task_writeLog, task_getMemberNames）
 */

// ================================================================================
// ===== プロンプト定数 =====
// ================================================================================

const TASK_EXTRACTION_PROMPT = `あなたはタスク管理アシスタントです。

【役割】
テキストを受け取り、タスク候補を抽出・整理します。
あなたはタスクかどうかを「判断」しません。可能性があるものは全て抽出し、確信度を付けてください。
最終的にタスク化するかどうかは人が決めます。

【タスク候補の検出基準】
以下のいずれかに該当するものをタスク候補として抽出：
- 「〜お願い」「〜やっておいて」「〜しておいて」「〜頼める？」等の依頼表現
- 「〜担当で」「〜さんに」＋ 具体的な作業
- 明確な作業指示（「〜を作成」「〜を送付」「〜を確認」）
- 期限付きの依頼
- 報告の中に含まれる次のアクション（確信度：低として抽出）

以下はタスク候補として抽出しない：
- 雑談・感想・お祝い・リアクション
- 純粋な情報共有で次のアクションが一切示唆されないもの
- 完了報告（「〜しました」「〜済みです」「〜完了」）で、次のアクションが示唆されていないもの
  例: 「写真整理しました。Driveにアップ済みです」→ 完了報告であり新規タスクではない

【確信度の基準】
- 高：明確な依頼・指示がある（「〜お願い」「〜してください」）
- 中：作業が示唆されているが明確な指示ではない（「〜のイメージ」「〜する感じ」）
- 低：報告や会話から推測されるタスク（明確な指示なし）

【各タスクについて以下を整理】
1. 担当者（不明なら「未特定」）
2. 内容（具体的に何をするか）
3. 期限（具体的な日付。不明なら「未設定」）
4. 完了条件（何がどうなっていれば完了か）
5. やること / やらないこと
6. 必要な情報・素材
7. 状態（未着手 / 進行中 / 完了済み）
8. 確信度（高 / 中 / 低）

【曖昧表現の検出】
以下のような表現を検出し、具体化を求める質問を生成：
- 程度が不明：「いい感じ」「もうちょっと」「シンプルに」
- 参照が不明：「前と同じ」「いつもの」「あれ」「これ」
- 期限が不明：「なるべく早く」「急ぎで」「そのうち」「手空いたら」
- 範囲が不明：「〜とか」「〜など」「〜的な」
- 暗黙の前提：「当然〜も」「ついでに〜も」

【実現可能性の確認】
- 期限に対して作業量が多すぎないか
- 必要な素材・情報が不足していないか
- 他のタスクへの依存関係がないか

【出力形式】
必ず以下のJSON形式のみで出力してください。説明文は不要です。

{
  "tasks": [
    {
      "id": "task-001",
      "confidence": "高",
      "assignee": "担当者名 or 未特定",
      "title": "タスクの要約（20字以内）",
      "detail": "具体的な作業内容",
      "deadline": "YYYY-MM-DD or 未設定",
      "done_criteria": "完了条件",
      "scope_in": "やること",
      "scope_out": "やらないこと（推測含む）",
      "required_info": ["必要な情報・素材"],
      "status": "未着手",
      "warnings": ["不明点や懸念事項"],
      "ambiguous_expressions": [
        {
          "original": "元の表現",
          "question": "具体化するための質問"
        }
      ]
    }
  ],
  "skipped_messages": [
    {
      "speaker": "発言者",
      "content_summary": "内容の要約",
      "reason": "スキップ理由"
    }
  ]
}`;

const TASK_REQUIREMENTS_PROMPT = `あなたは要件定義アシスタントです。

以下のタスクについて、ユーザーの回答を受け取り、要件として整理してください。

【整理の原則】
- AIがテキストから読み取れた情報は自動で埋める
- 足りない部分だけ質問する（全部聞かない）
- 選択肢を出して答えやすくする
- 曖昧な表現は具体的な表現に変換する

【チェック観点】
□ 担当者が明確か
□ 期限が具体的な日付か（「来週中」→ NG、「3/21」→ OK）
□ 成果物が具体的か
□ 完了条件があるか（どこに納品？誰が確認？）
□ 「やること」が明記されているか
□ 「やらないこと」が明記されているか
□ 曖昧な表現が残っていないか

【出力形式】
必ず以下のJSON形式のみで出力してください。

{
  "refined_tasks": [
    {
      "id": "task-001",
      "title": "タスク名",
      "assignee": "担当者名",
      "deadline": "YYYY-MM-DD",
      "done_criteria": "完了条件",
      "scope_in": "やること",
      "scope_out": "やらないこと",
      "notes": "補足事項",
      "remaining_questions": ["まだ不明な点があれば"]
    }
  ]
}`;

const TASK_DISCUSSION_PROMPT = `あなたはタスク管理アシスタントです。

口頭で依頼を受けた担当者を支援します。
依頼内容とヒアリング回答をもとに、タスクとして登録できるように情報を整理してください。

回答が空の項目がある場合は、追加で確認すべき質問を生成してください。

【出力形式】
必ず以下のJSON形式のみで出力してください。

{
  "tasks": [
    {
      "id": "task-001",
      "confidence": "高",
      "title": "タスク名",
      "assignee": "担当者名",
      "deadline": "未設定",
      "done_criteria": "完了条件",
      "scope_in": "やること",
      "scope_out": "やらないこと",
      "required_info": ["必要な情報"],
      "warnings": ["注意点"],
      "status": "未着手"
    }
  ],
  "additional_questions": ["追加で確認すべき質問"]
}`;

const TASK_SUMMARY_PROMPT = `あなたはタスク管理アシスタントです。

以下のタスク一覧データを分析し、チームの状況サマリーを日本語で作成してください。

【サマリーに含める内容】
- 全体の件数（未完了・超過）
- 担当者別の負荷状況
- 緊急で対応が必要なタスク
- 今週中に期限が来るタスク
- 注意すべきポイント

簡潔にまとめてください（箇条書き、5〜8行程度）。`;

// ================================================================================
// ===== Gemini API呼び出し =====
// ================================================================================

/**
 * Gemini APIを呼び出す
 * @param {string} prompt - ユーザープロンプト
 * @param {string} systemInstruction - システム指示
 * @param {Object} options - オプション {jsonMode: boolean}
 * @returns {{success: boolean, text?: string, error?: string}}
 */
function task_callGeminiApi(prompt, systemInstruction, options) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return { success: false, error: 'Gemini APIキーが設定されていません。スクリプトプロパティに GEMINI_API_KEY を登録してください。' };
    }

    var opts = options || {};
    var model = task_getSystemSetting('AIモデル') || 'gemini-2.0-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

    var generationConfig = {
      temperature: 0.3,
      maxOutputTokens: 65536
    };

    // JSON出力モード: AIに純粋なJSONのみ出力させる
    if (opts.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    var requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: generationConfig
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (statusCode !== 200) {
      var errorData = JSON.parse(responseText);
      var errorMsg = (errorData.error && errorData.error.message) || 'APIエラー（' + statusCode + '）';
      return { success: false, error: errorMsg };
    }

    var data = JSON.parse(responseText);
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return { success: false, error: 'AIからの応答が空です' };
    }

    var text = data.candidates[0].content.parts[0].text;
    return { success: true, text: text };
  } catch (e) {
    return { success: false, error: 'API呼び出しエラー: ' + e.message };
  }
}

// ================================================================================
// ===== JSON解析（AI出力は不安定なので堅牢に） =====
// ================================================================================

/**
 * AI出力からJSONを解析
 * @param {string} text - AI出力テキスト
 * @returns {Object|null}
 */
function task_parseJsonFromAiOutput(text) {
  if (!text) return null;

  // 1. 直接JSON.parse
  try {
    return JSON.parse(text.trim());
  } catch (e) { /* continue */ }

  // 2. ```json ... ``` からの抽出
  var jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) { /* continue */ }
  }

  // 3. ``` ... ``` からの抽出（言語指定なし）
  var codeBlockMatch = text.match(/```\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) { /* continue */ }
  }

  // 4. 最初の { から最後の } を切り出し
  var firstBrace = text.indexOf('{');
  var lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch (e) { /* continue */ }
  }

  return null;
}

// ================================================================================
// ===== タスク抽出（1回目AI呼び出し） =====
// ================================================================================

/**
 * テキストからタスクを抽出
 * @param {string} inputText - 入力テキスト
 * @param {string} mode - 入力モード（works_bulk, works_pin, notta, free_text, discussion）
 * @returns {{success: boolean, tasks?: Array, skippedMessages?: Array, error?: string}}
 */
function task_extractTasks(inputText, mode) {
  if (!inputText || !inputText.trim()) {
    return { success: false, error: 'テキストが入力されていません' };
  }

  var memberNames = task_getMemberNames();
  var memberInfo = memberNames.length > 0
    ? '\n\n【チームメンバー一覧（担当者の推定に使ってください）】\n' + memberNames.join('、')
    : '';

  var modeLabel = {
    'works_bulk': 'LINE WORKS会話ログ（複数メッセージ）',
    'works_pin': 'LINE WORKSの特定メッセージ',
    'notta': '会議文字起こし（NOTTA）',
    'free_text': 'ユーザーの自由記述',
    'discussion': '口頭依頼の内容'
  };

  var modeDesc = modeLabel[mode] || modeLabel['free_text'];
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][new Date().getDay()];
  var dateInfo = '\n\n【今日の日付】' + today + '（' + dayOfWeek + '曜日）\n※「水曜まで」「来週月曜」等の相対的な期限は、この日付を基準にYYYY-MM-DD形式に変換してください。';
  var userPrompt = '【入力モード】' + modeDesc + memberInfo + dateInfo + '\n\n【入力テキスト】\n' + inputText;

  var result = task_callGeminiApi(userPrompt, TASK_EXTRACTION_PROMPT, { jsonMode: true });
  if (!result.success) {
    return { success: false, error: result.error };
  }

  var parsed = task_parseJsonFromAiOutput(result.text);
  if (!parsed) {
    // ログに保存（デバッグ用）
    task_writeLog(mode, inputText, result.text, []);
    var preview = (result.text || '').substring(0, 200);
    return { success: false, error: 'AIの出力をJSONとして解析できませんでした。\n\n【AI出力の先頭200文字】\n' + preview };
  }

  // ログ保存
  task_writeLog(mode, inputText, result.text, []);

  return {
    success: true,
    tasks: parsed.tasks || [],
    skippedMessages: parsed.skipped_messages || []
  };
}

// ================================================================================
// ===== 要件定義アシスト（2回目AI呼び出し） =====
// ================================================================================

/**
 * 選択されたタスクの要件を定義
 * @param {string} originalText - 元のテキスト
 * @param {Array} selectedTasks - 選択されたタスク配列
 * @param {Object} userAnswers - ユーザーの回答（タスクIDをキーとした回答オブジェクト）
 * @returns {{success: boolean, refinedTasks?: Array, error?: string}}
 */
function task_defineRequirements(originalText, selectedTasks, userAnswers) {
  var userPrompt = '【元のテキスト】\n' + originalText + '\n\n';
  userPrompt += '【選択されたタスク】\n' + JSON.stringify(selectedTasks, null, 2) + '\n\n';
  userPrompt += '【ユーザーの回答】\n' + JSON.stringify(userAnswers, null, 2);

  var result = task_callGeminiApi(userPrompt, TASK_REQUIREMENTS_PROMPT, { jsonMode: true });
  if (!result.success) {
    return { success: false, error: result.error };
  }

  var parsed = task_parseJsonFromAiOutput(result.text);
  if (!parsed) {
    return { success: false, error: 'AIの出力を解析できませんでした。' };
  }

  return {
    success: true,
    refinedTasks: parsed.refined_tasks || []
  };
}

// ================================================================================
// ===== AIサマリー =====
// ================================================================================

/**
 * タスクデータからAIサマリーを生成
 * @param {Array} tasksData - タスク配列
 * @returns {{success: boolean, summary?: string, error?: string}}
 */
function task_generateAiSummary(tasksData) {
  if (!tasksData || tasksData.length === 0) {
    return { success: false, error: '表示するタスクがありません' };
  }

  var taskSummary = tasksData.map(function(t) {
    return t.id + ' ' + t.title + '（担当:' + t.assignee + ', 期限:' + (t.deadline || '未設定') + ', 状態:' + t.status + ', 緊急度:' + t.urgency + '）';
  }).join('\n');

  var userPrompt = '【タスク一覧】\n' + taskSummary;

  var result = task_callGeminiApi(userPrompt, TASK_SUMMARY_PROMPT);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, summary: result.text };
}

// ================================================================================
// ===== ディスカッションモード =====
// ================================================================================

/**
 * ディスカッションモードでタスクを解析
 * @param {string} description - 依頼内容の説明
 * @param {string} requesterName - 依頼者名
 * @param {Object} answers - ヒアリング回答（{question: answer}）
 * @returns {{success: boolean, tasks?: Array, questions?: Array, error?: string}}
 */
function task_analyzeDiscussion(description, requesterName, answers) {
  var userPrompt = '【依頼内容】\n' + description + '\n';
  userPrompt += '【依頼者】' + (requesterName || '不明') + '\n\n';

  if (answers && Object.keys(answers).length > 0) {
    userPrompt += '【ヒアリング回答】\n';
    var keys = Object.keys(answers);
    for (var i = 0; i < keys.length; i++) {
      userPrompt += '- ' + keys[i] + ': ' + (answers[keys[i]] || '（未回答）') + '\n';
    }
  }

  var result = task_callGeminiApi(userPrompt, TASK_DISCUSSION_PROMPT, { jsonMode: true });
  if (!result.success) {
    return { success: false, error: result.error };
  }

  var parsed = task_parseJsonFromAiOutput(result.text);
  if (!parsed) {
    return { success: false, error: 'AIの出力を解析できませんでした。' };
  }

  return {
    success: true,
    tasks: parsed.tasks || [],
    questions: parsed.additional_questions || []
  };
}
