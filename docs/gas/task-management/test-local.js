/**
 * タスク管理システム - ローカルテスト実行スクリプト
 *
 * GAS API非依存の純粋ロジック関数をNode.jsで検証する。
 * 実行: node test-local.js
 *
 * テスト対象:
 *   H. AI解析（JSONパース）- task_parseJsonFromAiOutput
 *   I. カレンダー連携（一部）- task_formatEventDescription, task_parseReminderToMinutes
 *   K. Claude Code出力 - task_formatForClaudeCode
 *   L. ディスカッションパターン - task_getDiscussionPattern, task_getAllDiscussionPatterns
 *   O. 要件定義（一部）- task_getRequirementStatus
 */

// ========================================================================
// テストフレームワーク（軽量）
// ========================================================================

var RESULTS = [];
var CURRENT_CATEGORY = '';

function assert(testName, condition, detail) {
  RESULTS.push({ name: CURRENT_CATEGORY + ' - ' + testName, passed: !!condition, detail: detail || '' });
}

function assertEqual(testName, actual, expected, detail) {
  var passed = JSON.stringify(actual) === JSON.stringify(expected);
  RESULTS.push({
    name: CURRENT_CATEGORY + ' - ' + testName,
    passed: passed,
    detail: passed ? '' : '期待値: ' + JSON.stringify(expected) + ', 実際: ' + JSON.stringify(actual) + (detail ? ' (' + detail + ')' : '')
  });
}

function assertNotNull(testName, value) {
  RESULTS.push({
    name: CURRENT_CATEGORY + ' - ' + testName,
    passed: value !== null && value !== undefined,
    detail: (value === null || value === undefined) ? '値がnull/undefinedです' : ''
  });
}

function assertNull(testName, value) {
  RESULTS.push({
    name: CURRENT_CATEGORY + ' - ' + testName,
    passed: value === null || value === undefined || value === '',
    detail: (value !== null && value !== undefined && value !== '') ? '値がnull/undefinedではありません: ' + JSON.stringify(value) : ''
  });
}

// ========================================================================
// 定数（taskSheetManager.js より）
// ========================================================================

const TASK_COLUMNS = {
  ID: 1, STATUS: 2, ASSIGNEE: 3, TITLE: 4, DEADLINE: 5,
  DONE_CRITERIA: 6, REG_DATE: 7, INPUT_MODE: 8, COMPLETION_COMMENT: 9,
  APPROVAL_NOTE: 10, NOTES: 11, SIZE: 12, REQUIREMENT_DEF: 13
};

const TASK_SIZES = ['大', '中', '小'];

// ========================================================================
// テスト対象関数の読み込み（ソースからコピー）
// ========================================================================

// --- taskAiAnalyzer.js: task_parseJsonFromAiOutput ---
function task_parseJsonFromAiOutput(text) {
  if (!text) return null;
  try { return JSON.parse(text.trim()); } catch (e) { /* continue */ }
  var jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) { try { return JSON.parse(jsonBlockMatch[1].trim()); } catch (e) { /* continue */ } }
  var codeBlockMatch = text.match(/```\s*([\s\S]*?)```/);
  if (codeBlockMatch) { try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) { /* continue */ } }
  var firstBrace = text.indexOf('{');
  var lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (e) { /* continue */ }
  }
  return null;
}

// --- taskAiAnalyzer.js: task_preprocessNottaText ---
function task_preprocessNottaText(text) {
  var originalLength = text.length;
  var processed = text.replace(/^(.+?)\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*$/gm, '$1：');
  processed = processed.replace(/[\(（\[]\d{1,2}:\d{2}(?::\d{2})?[\)）\]]/g, '');
  processed = processed.replace(/\n{3,}/g, '\n\n');
  return { processed: processed.trim(), originalLength: originalLength, processedLength: processed.trim().length };
}

// --- UI: sanitizeText ---
function sanitizeText(text) {
  if (!text) return '';
  var patterns = [
    /[バﾊﾞ][カｶ]|ばか|馬鹿/g, /[アｱ][ホｿ]|あほ|阿呆/g, /死ね|しね|死んで/g,
    /[クｸ][ソｿ]|くそ|糞/g, /ふざけ(?:るな|んな|んじゃ)/g, /うざ[いっ]/g,
    /[キｷ][モﾓ][いっ]/g, /頭いかれ/g, /馬鹿じゃ/g, /マジで怒/g
  ];
  var result = text;
  for (var i = 0; i < patterns.length; i++) { result = result.replace(patterns[i], '***'); }
  return result;
}

// --- taskSheetManager.js: task_getRequirementStatus ---
function task_getRequirementStatus(task) {
  if (!task.size || task.size === '小') return 'not_applicable';
  if (task.requirementDef) return 'done';
  return 'pending';
}

// --- taskCalendarManager.js: task_parseReminderToMinutes ---
function task_parseReminderToMinutes(reminderStr) {
  if (!reminderStr) return 0;
  var parts = reminderStr.split(/\s+/);
  if (parts.length < 2) return 0;
  var dayPart = parts[0];
  var timePart = parts[1];
  var timeSplit = timePart.split(':');
  if (timeSplit.length < 2) return 0;
  var hours = parseInt(timeSplit[0], 10);
  var mins = parseInt(timeSplit[1], 10);
  if (isNaN(hours) || isNaN(mins)) return 0;
  if (dayPart === '前日') return (24 - hours) * 60 - mins;
  if (dayPart === '当日') return hours * 60 + mins;
  return 0;
}

// --- taskCalendarManager.js: task_formatEventDescription ---
function task_formatEventDescription(taskData) {
  var lines = [];
  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('担当：' + (taskData.assignee || '未定'));
  lines.push('状態：未着手');
  lines.push('');
  if (taskData.doneCriteria) { lines.push('【完了条件】'); lines.push(taskData.doneCriteria); lines.push(''); }
  if (taskData.scopeIn) {
    lines.push('【やること】');
    var scopeInItems = taskData.scopeIn.split(/[、,\n]/);
    for (var i = 0; i < scopeInItems.length; i++) { var item = scopeInItems[i].trim(); if (item) lines.push('・' + item); }
    lines.push('');
  }
  if (taskData.scopeOut) {
    lines.push('【やらないこと】');
    var scopeOutItems = taskData.scopeOut.split(/[、,\n]/);
    for (var j = 0; j < scopeOutItems.length; j++) { var outItem = scopeOutItems[j].trim(); if (outItem) lines.push('・' + outItem); }
    lines.push('');
  }
  if (taskData.notes) { lines.push('【備考】'); lines.push(taskData.notes); lines.push(''); }
  // Utilities.formatDate → ローカル用に置換
  var d = new Date();
  var dateStr = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  lines.push('登録日：' + dateStr);
  lines.push('━━━━━━━━━━━━━━━━━━');
  return lines.join('\n');
}

// --- taskResultDialog.js: task_formatForClaudeCode ---
function task_formatForClaudeCode(taskData) {
  var lines = [];
  lines.push('以下のタスクの作業を開始してください。');
  lines.push('');
  lines.push('【タスク】' + (taskData.title || ''));
  lines.push('【担当】' + (taskData.assignee || ''));
  lines.push('【期限】' + (taskData.deadline || '未設定'));
  lines.push('【完了条件】' + (taskData.doneCriteria || ''));
  if (taskData.scopeIn) {
    lines.push('【やること】');
    var inItems = taskData.scopeIn.split(/[、,\n]/);
    for (var i = 0; i < inItems.length; i++) { var item = inItems[i].trim(); if (item) lines.push('- ' + item); }
  }
  if (taskData.scopeOut) {
    lines.push('【やらないこと】');
    var outItems = taskData.scopeOut.split(/[、,\n]/);
    for (var j = 0; j < outItems.length; j++) { var outItem = outItems[j].trim(); if (outItem) lines.push('- ' + outItem); }
  }
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

// --- taskDiscussionPatterns.js ---
const TASK_DISCUSSION_PATTERNS = {
  generic: { name: '汎用', keywords: [],
    questions: ['目的・背景は？（なぜこれをやるのか）', '期限は？', '成果物は何？（ファイル？連絡？作業完了？）', '完了の確認者は誰？', '他に関連するタスクや依存関係は？'] },
  design: { name: 'デザイン・制作系',
    keywords: ['バナー', 'デザイン', 'ロゴ', 'チラシ', 'ポスター', '制作', 'クリエイティブ', '画像', 'イラスト', 'LP', 'ランディングページ'],
    questions: ['サイズ・フォーマットは？', '使用用途は？（SNS？サイト？印刷？）', '素材は提供される？自分で用意？', 'ブランドガイドラインはある？', '参考イメージは？', 'テキスト（コピー）は誰が書く？'] },
  document: { name: '資料・ドキュメント系',
    keywords: ['資料', 'ドキュメント', '報告書', '提案書', 'プレゼン', 'マニュアル', '議事録', '企画書', '仕様書', 'レポート'],
    questions: ['目的・用途は？（社内？クライアント提出？）', '対象者は？（誰が読む？）', 'ページ数・分量の目安は？', 'テンプレートはある？', '元データ・素材はある？'] },
  client: { name: 'クライアント対応系',
    keywords: ['クライアント', '顧客', 'お客様', '取引先', '修正依頼', 'フィードバック', '対応', '問い合わせ', '要望'],
    questions: ['クライアント名は？', '対応内容は？（修正？確認？連絡？）', 'クライアントの温度感は？（急ぎ？通常？）', '窓口担当は誰？', '過去の経緯で注意すべきことは？'] },
  sales: { name: '営業・外部連絡系',
    keywords: ['営業', '訪問', '電話', 'メール', '見積', '提案', '商談', '発注', '請求', '契約', '外部'],
    questions: ['相手先は？（企業名・担当者名）', '連絡手段は？（メール？電話？訪問？）', '伝える内容は？', '事前に準備する資料は？', '返答の期限は？'] }
};

function task_getDiscussionPattern(taskDescription) {
  const desc = (taskDescription || '').toLowerCase();
  var matchedKey = null;
  var maxMatches = 0;
  var keys = Object.keys(TASK_DISCUSSION_PATTERNS);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === 'generic') continue;
    var pattern = TASK_DISCUSSION_PATTERNS[key];
    var matchCount = 0;
    for (var j = 0; j < pattern.keywords.length; j++) {
      if (desc.indexOf(pattern.keywords[j].toLowerCase()) !== -1) matchCount++;
    }
    if (matchCount > maxMatches) { maxMatches = matchCount; matchedKey = key; }
  }
  return { matched: matchedKey, pattern: matchedKey ? TASK_DISCUSSION_PATTERNS[matchedKey] : TASK_DISCUSSION_PATTERNS.generic, generic: TASK_DISCUSSION_PATTERNS.generic };
}

function task_getAllDiscussionPatterns() { return TASK_DISCUSSION_PATTERNS; }

// ========================================================================
// テスト実行
// ========================================================================

// H. AI解析（JSONパース）
CURRENT_CATEGORY = 'H. AI解析（JSONパース）';
(function() {
  var r1 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"テスト"}]}');
  assert('1. 正常なJSON', r1 !== null && r1.tasks && r1.tasks[0].title === 'テスト');

  var r2 = task_parseJsonFromAiOutput('以下はJSON出力です。\n```json\n{"tasks":[{"id":"task-001","title":"コードブロック"}]}\n```\n以上です。');
  assert('2. ```jsonブロック', r2 !== null && r2.tasks && r2.tasks[0].title === 'コードブロック');

  var r3 = task_parseJsonFromAiOutput('結果:\n```\n{"tasks":[{"id":"task-001","title":"言語指定なし"}]}\n```');
  assert('3. ```ブロック（言語指定なし）', r3 !== null && r3.tasks && r3.tasks[0].title === '言語指定なし');

  var r4 = task_parseJsonFromAiOutput('分析結果をお伝えします。{"tasks":[{"id":"task-001","title":"混在テスト"}]} 以上がタスクです。');
  assert('4. テキスト混在JSON', r4 !== null && r4.tasks && r4.tasks[0].title === '混在テスト');

  var r5 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"タスク1"},{"id":"task-002","title":"タスク2"},{"id":"task-003","title":"タスク3"}]}');
  assert('5. 複数タスクJSON', r5 !== null && r5.tasks && r5.tasks.length === 3);

  var r6 = task_parseJsonFromAiOutput('{"tasks":[],"skipped_messages":[]}');
  assert('6. 空のtasks配列', r6 !== null && r6.tasks && r6.tasks.length === 0);

  var r7 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"不正"');
  assertNull('7. 不正なJSON（閉じカッコ不足）', r7);

  var r8 = task_parseJsonFromAiOutput('これはJSONではありません。タスクの分析ができませんでした。');
  assertNull('8. 完全に壊れた文字列', r8);

  var r9 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"警告付き","warnings":["期限が短い","素材が不足"]}]}');
  assert('9. warnings付きタスク', r9 !== null && r9.tasks && r9.tasks[0].warnings && r9.tasks[0].warnings.length === 2);

  var r10 = task_parseJsonFromAiOutput('{"tasks":[{"id":"task-001","title":"曖昧表現付き","ambiguous_expressions":[{"original":"いい感じ","question":"具体的にどのようなデザインですか？"}]}]}');
  assert('10. ambiguous_expressions付きタスク', r10 !== null && r10.tasks && r10.tasks[0].ambiguous_expressions && r10.tasks[0].ambiguous_expressions[0].original === 'いい感じ');
})();

// I. カレンダー連携（ロジック部分）
CURRENT_CATEGORY = 'I. カレンダー連携';
(function() {
  var desc = task_formatEventDescription({
    assignee: '田中太郎', doneCriteria: 'テスト完了条件',
    scopeIn: 'デザイン作成、コーディング', scopeOut: 'テスト実施', notes: 'テスト備考'
  });
  assert('1a. フォーマットに担当者が含まれる', desc.indexOf('田中太郎') !== -1);
  assert('1b. フォーマットに完了条件が含まれる', desc.indexOf('テスト完了条件') !== -1);
  assert('1c. フォーマットにやることが含まれる', desc.indexOf('デザイン作成') !== -1);
  assert('1d. フォーマットにやらないことが含まれる', desc.indexOf('テスト実施') !== -1);
  assert('1e. フォーマットに備考が含まれる', desc.indexOf('テスト備考') !== -1);

  assertEqual('2a. 前日09:00→900分', task_parseReminderToMinutes('前日 09:00'), 900);
  assertEqual('2b. 当日09:00→540分', task_parseReminderToMinutes('当日 09:00'), 540);
  assertEqual('2c. 1時間前→0（未対応形式）', task_parseReminderToMinutes('1時間前'), 0);
  assertEqual('2d. 30分前→0（未対応形式）', task_parseReminderToMinutes('30分前'), 0);
  assertEqual('2e. 空文字→0', task_parseReminderToMinutes(''), 0);
  assertEqual('2f. null→0', task_parseReminderToMinutes(null), 0);
})();

// K. Claude Code出力
CURRENT_CATEGORY = 'K. Claude Code出力';
(function() {
  var output1 = task_formatForClaudeCode({
    title: 'LP制作', assignee: '田中太郎', deadline: '2026-04-01',
    doneCriteria: 'クライアント承認', scopeIn: 'デザイン,コーディング,テスト',
    scopeOut: 'サーバー構築,コンテンツ執筆'
  });
  assert('1a. タスク名が含まれる', output1.indexOf('LP制作') !== -1);
  assert('1b. 担当が含まれる', output1.indexOf('田中太郎') !== -1);
  assert('1c. 期限が含まれる', output1.indexOf('2026-04-01') !== -1);
  assert('1d. 完了条件が含まれる', output1.indexOf('クライアント承認') !== -1);
  assert('1e. やることが含まれる', output1.indexOf('デザイン') !== -1);
  assert('1f. やらないことが含まれる', output1.indexOf('サーバー構築') !== -1);
  assert('1g. 先頭行のフレーズ', output1.indexOf('以下のタスクの作業を開始してください') !== -1);
  assert('2a. やることセクションがある', output1.indexOf('【やること】') !== -1);
  assert('2b. やらないことセクションがある', output1.indexOf('【やらないこと】') !== -1);

  var output3 = task_formatForClaudeCode({ title: 'シンプルタスク', assignee: '', deadline: '', doneCriteria: '' });
  assert('3a. タスク名が含まれる', output3.indexOf('シンプルタスク') !== -1);
  assert('3b. 期限が未設定', output3.indexOf('未設定') !== -1);
  assert('3c. やることセクションがない', output3.indexOf('【やること】') === -1);
})();

// L. ディスカッションパターン
CURRENT_CATEGORY = 'L. ディスカッションパターン';
(function() {
  var r1 = task_getDiscussionPattern('バナーのデザインを作成してほしい');
  assertEqual('1. デザイン系マッチ', r1.matched, 'design');

  var r2 = task_getDiscussionPattern('提案書の資料を作る必要がある');
  assertEqual('2. 資料系マッチ', r2.matched, 'document');

  var r3 = task_getDiscussionPattern('クライアントからの修正依頼に対応する');
  assertEqual('3. クライアント系マッチ', r3.matched, 'client');

  var r4 = task_getDiscussionPattern('見積書を送って営業する');
  assertEqual('4. 営業系マッチ', r4.matched, 'sales');

  var r5 = task_getDiscussionPattern('何かやっておいてください');
  assertNull('5a. キーワードなしでmatchedがnull', r5.matched);
  assertEqual('5b. パターンが汎用', r5.pattern.name, '汎用');

  var allPatterns = task_getAllDiscussionPatterns();
  assert('6a. 全パターン取得', allPatterns !== null);
  assert('6b. genericパターンが存在', allPatterns.generic !== undefined);
  assert('6c. designパターンが存在', allPatterns.design !== undefined);
  assert('6d. documentパターンが存在', allPatterns.document !== undefined);
  assert('6e. clientパターンが存在', allPatterns.client !== undefined);
  assert('6f. salesパターンが存在', allPatterns.sales !== undefined);
})();

// P. NOTTA前処理
CURRENT_CATEGORY = 'P. NOTTA前処理';
(function() {
  // 1. タイムスタンプ除去（HH:MM形式）
  var r1 = task_preprocessNottaText('川﨑彩 01:22\nテストです');
  assert('1. HH:MM形式のタイムスタンプ除去', r1.processed.indexOf('01:22') === -1);
  assert('1b. 発言者名は残る', r1.processed.indexOf('川﨑彩') !== -1);

  // 2. タイムスタンプ除去（HH:MM:SS形式）
  var r2 = task_preprocessNottaText('青柳慧 00:09\nマイクだけ入れといてもらえばOKです。');
  assert('2. HH:MM:SS形式のタイムスタンプ除去', r2.processed.indexOf('00:09') === -1);
  assert('2b. 本文は残る', r2.processed.indexOf('マイク') !== -1);

  // 3. 複数行のタイムスタンプ除去
  var multiLine = '川﨑彩 02:03\nストックというのは\n\n青柳慧 02:09\nはい。';
  var r3 = task_preprocessNottaText(multiLine);
  assert('3. 複数行のタイムスタンプ除去', r3.processed.indexOf('02:03') === -1 && r3.processed.indexOf('02:09') === -1);

  // 4. 過剰な空行の圧縮
  var r4 = task_preprocessNottaText('行1\n\n\n\n\n行2');
  assert('4. 3行以上の空行を圧縮', r4.processed.indexOf('\n\n\n') === -1);

  // 5. テキスト長の削減確認
  var longText = '';
  for (var i = 0; i < 100; i++) { longText += '発言者 ' + i + ':' + (i < 10 ? '0' : '') + i + ':00\nテスト発言です\n'; }
  var r5 = task_preprocessNottaText(longText);
  assert('5. テキスト長が削減される', r5.processedLength < r5.originalLength);

  // 6. タイムスタンプがない通常テキストはそのまま
  var r6 = task_preprocessNottaText('普通のテキストです。タスクをお願いします。');
  assertEqual('6. 通常テキストは変化なし', r6.processed, '普通のテキストです。タスクをお願いします。');
})();

// Q. コンテンツ安全フィルタ
CURRENT_CATEGORY = 'Q. コンテンツ安全フィルタ';
(function() {
  // 1. 不適切な表現がフィルタされる
  assertEqual('1. 馬鹿がフィルタされる', sanitizeText('これは馬鹿だ'), 'これは***だ');
  assertEqual('2. ふざけんながフィルタされる', sanitizeText('ふざけんなよ'), '***よ');
  assertEqual('3. 頭いかれがフィルタされる', sanitizeText('頭いかれてる'), '***てる');

  // 4. 正常テキストは変化なし
  assertEqual('4. 正常テキストは変化なし', sanitizeText('タスクを完了しました'), 'タスクを完了しました');

  // 5. nullや空文字
  assertEqual('5. null入力', sanitizeText(null), '');
  assertEqual('6. 空文字入力', sanitizeText(''), '');

  // 7. 複数パターンの同時フィルタ
  var mixed = '馬鹿じゃねこれ、ふざけんな';
  var filtered = sanitizeText(mixed);
  assert('7. 複数パターン同時フィルタ', filtered.indexOf('馬鹿') === -1 && filtered.indexOf('ふざけ') === -1);
})();

// O. 要件定義（ロジック部分）
CURRENT_CATEGORY = 'O. 要件定義';
(function() {
  assertEqual('1. SIZE列番号', TASK_COLUMNS.SIZE, 12);
  assertEqual('1b. REQUIREMENT_DEF列番号', TASK_COLUMNS.REQUIREMENT_DEF, 13);
  assert('2. TASK_SIZES定数', TASK_SIZES && TASK_SIZES.length === 3);
  assertEqual('2b. TASK_SIZES内容', TASK_SIZES, ['大', '中', '小']);

  assertEqual('4a. 大タスク要件定義未完了', task_getRequirementStatus({ size: '大', requirementDef: null }), 'pending');
  assertEqual('4b. 大タスク要件定義完了', task_getRequirementStatus({ size: '大', requirementDef: { kgi: 'test' } }), 'done');
  assertEqual('4c. 小タスクは対象外', task_getRequirementStatus({ size: '小', requirementDef: null }), 'not_applicable');
  assertEqual('4d. sizeなしは対象外', task_getRequirementStatus({ size: '', requirementDef: null }), 'not_applicable');

  // Claude Code出力に要件定義が含まれるか
  var ccOutput = task_formatForClaudeCode({
    title: '要件定義付きタスク', assignee: '田中太郎', deadline: '2026-04-01',
    doneCriteria: 'HP公開', size: '大',
    requirementDef: { kgi: 'HP公開して集客を増やす', handoff_definition: 'クライアント確認完了 + デプロイ' }
  });
  assert('7a. Claude Code出力にKGI含む', ccOutput.indexOf('KGI') !== -1);
  assert('7b. Claude Code出力に手離れ含む', ccOutput.indexOf('手離れ') !== -1);

  // 中タスクのテスト
  assertEqual('8. 中タスクのステータス', task_getRequirementStatus({ size: '中', requirementDef: null }), 'pending');
  // 小タスクは不要
  assertEqual('9. 小タスクのステータス', task_getRequirementStatus({ size: '小', requirementDef: null }), 'not_applicable');
})();

// ========================================================================
// 結果表示
// ========================================================================

var total = RESULTS.length;
var passed = RESULTS.filter(function(r) { return r.passed; }).length;
var failed = total - passed;

console.log('');
console.log('='.repeat(60));
console.log('  タスク管理システム ローカルテスト結果');
console.log('='.repeat(60));
console.log('');
console.log('  合計: ' + total + ' テスト');
console.log('  成功: ' + passed);
console.log('  失敗: ' + failed);
console.log('  成功率: ' + Math.round(passed / total * 100) + '%');
console.log('');

// カテゴリ別表示
var categories = {};
RESULTS.forEach(function(r) {
  var catMatch = r.name.match(/^([^-]+)/);
  var catName = catMatch ? catMatch[1].trim() : 'その他';
  if (!categories[catName]) categories[catName] = [];
  categories[catName].push(r);
});

Object.keys(categories).forEach(function(catName) {
  var catResults = categories[catName];
  var catPassed = catResults.filter(function(r) { return r.passed; }).length;
  var catFailed = catResults.length - catPassed;
  var icon = catFailed === 0 ? '✅' : '❌';
  console.log(icon + ' ' + catName + ' (' + catPassed + '/' + catResults.length + ')');

  catResults.forEach(function(r) {
    var shortName = r.name.replace(/^[^-]+-\s*/, '');
    if (r.passed) {
      console.log('  ✅ ' + shortName);
    } else {
      console.log('  ❌ ' + shortName);
      if (r.detail) console.log('     → ' + r.detail);
    }
  });
  console.log('');
});

if (failed > 0) {
  console.log('='.repeat(60));
  console.log('  ⚠️  ' + failed + ' 件のテストが失敗しました');
  console.log('='.repeat(60));
  process.exit(1);
} else {
  console.log('='.repeat(60));
  console.log('  🎉 全テスト成功！');
  console.log('='.repeat(60));
  process.exit(0);
}
