/**
 * タスク管理システム - ディスカッションモード パターン定義
 *
 * タスクの種類に応じた「聞くべきこと」のテンプレート。
 * 依存: なし（純粋なデータファイル）
 */

// ================================================================================
// ===== ディスカッションパターン定義 =====
// ================================================================================

const TASK_DISCUSSION_PATTERNS = {
  generic: {
    name: '汎用',
    keywords: [],
    questions: [
      '目的・背景は？（なぜこれをやるのか）',
      '期限は？',
      '成果物は何？（ファイル？連絡？作業完了？）',
      '完了の確認者は誰？',
      '他に関連するタスクや依存関係は？'
    ]
  },
  design: {
    name: 'デザイン・制作系',
    keywords: ['バナー', 'デザイン', 'ロゴ', 'チラシ', 'ポスター', '制作', 'クリエイティブ', '画像', 'イラスト', 'LP', 'ランディングページ'],
    questions: [
      'サイズ・フォーマットは？',
      '使用用途は？（SNS？サイト？印刷？）',
      '素材は提供される？自分で用意？',
      'ブランドガイドラインはある？',
      '参考イメージは？',
      'テキスト（コピー）は誰が書く？'
    ]
  },
  document: {
    name: '資料・ドキュメント系',
    keywords: ['資料', 'ドキュメント', '報告書', '提案書', 'プレゼン', 'マニュアル', '議事録', '企画書', '仕様書', 'レポート'],
    questions: [
      '目的・用途は？（社内？クライアント提出？）',
      '対象者は？（誰が読む？）',
      'ページ数・分量の目安は？',
      'テンプレートはある？',
      '元データ・素材はある？'
    ]
  },
  client: {
    name: 'クライアント対応系',
    keywords: ['クライアント', '顧客', 'お客様', '取引先', '修正依頼', 'フィードバック', '対応', '問い合わせ', '要望'],
    questions: [
      'クライアント名は？',
      '対応内容は？（修正？確認？連絡？）',
      'クライアントの温度感は？（急ぎ？通常？）',
      '窓口担当は誰？',
      '過去の経緯で注意すべきことは？'
    ]
  },
  sales: {
    name: '営業・外部連絡系',
    keywords: ['営業', '訪問', '電話', 'メール', '見積', '提案', '商談', '発注', '請求', '契約', '外部'],
    questions: [
      '相手先は？（企業名・担当者名）',
      '連絡手段は？（メール？電話？訪問？）',
      '伝える内容は？',
      '事前に準備する資料は？',
      '返答の期限は？'
    ]
  }
};

// ================================================================================
// ===== パターンマッチング =====
// ================================================================================

/**
 * タスク説明文からマッチするディスカッションパターンを取得
 * @param {string} taskDescription - タスクの説明文
 * @returns {Object} {matched: string|null, pattern: Object, generic: Object}
 */
function task_getDiscussionPattern(taskDescription) {
  const desc = (taskDescription || '').toLowerCase();
  var matchedKey = null;
  var maxMatches = 0;

  // generic以外のパターンでキーワードマッチング
  var keys = Object.keys(TASK_DISCUSSION_PATTERNS);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === 'generic') continue;
    var pattern = TASK_DISCUSSION_PATTERNS[key];
    var matchCount = 0;
    for (var j = 0; j < pattern.keywords.length; j++) {
      if (desc.indexOf(pattern.keywords[j].toLowerCase()) !== -1) {
        matchCount++;
      }
    }
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      matchedKey = key;
    }
  }

  return {
    matched: matchedKey,
    pattern: matchedKey ? TASK_DISCUSSION_PATTERNS[matchedKey] : TASK_DISCUSSION_PATTERNS.generic,
    generic: TASK_DISCUSSION_PATTERNS.generic
  };
}

/**
 * 全ディスカッションパターンを取得
 * @returns {Object} TASK_DISCUSSION_PATTERNS
 */
function task_getAllDiscussionPatterns() {
  return TASK_DISCUSSION_PATTERNS;
}
