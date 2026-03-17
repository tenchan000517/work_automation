/**
 * LP制作 構成案プロンプト生成 GAS
 *
 * 【機能】
 * 1. ダイアログで20項目を入力 → LP構成案プロンプトを一括生成
 * 2. 既存ヒアリングシートからデータを自動反映（企業名、ターゲット、強み等）
 * 3. LP入力データをシートのPart④に保存
 * 4. Claude Code指示文も同時生成可能
 *
 * 【設計思想】
 * - 既存シートがあれば自動反映、なければ直接入力
 * - ダイアログには厳選して反映、プロンプトにはPart①②の全JSONを参考情報として付加
 * - ドロップダウンで選択可能な項目はドロップダウン化（入力の手間を減らす）
 * - commonStyles.jsを使用してUI統一
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 * onOpenメニューからLP構成案プロンプト生成を選択
 */

// ===== LPテンプレート選択肢 =====

const LP_TEMPLATES = [
  {
    id: 'template-lp',
    name: '標準LP（訴求・実績型）',
    description: '課題→解決→強み→実績→声→料金→FAQ→CTA',
    sections: [
      'ファーストビュー', '課題提起', '解決策提示', '特徴・強み',
      '実績・数字', 'お客様の声', '料金/オファー', 'FAQ', '最終CTA'
    ]
  },
  {
    id: 'template-lp-reassurance',
    name: '安心・心理設計LP（共感・寄り添い型）',
    description: '共感→不安言語化→先回り→差別化→未来→ハードル排除→信頼→FAQ→安心CTA',
    sections: [
      'ファーストビュー（共感特化）', '不安の言語化', '疑念の先回り', '違い（構造提示）',
      '登録後の未来イメージ', '登録ハードル排除', '信頼性（運営会社）', 'よくある不安の解消', '最終CTA（安心着地）'
    ]
  }
];

// ===== ドロップダウン選択肢 =====

const LP_CV_TYPES = [
  '問い合わせ',
  '資料請求',
  '無料相談予約',
  '申し込み・契約',
  '購入',
  '会員登録・無料トライアル',
  'セミナー・ウェビナー予約',
  'LINE友だち追加',
  'アプリダウンロード'
];

const LP_TRAFFIC_SOURCES = [
  'Google検索広告',
  'Googleディスプレイ広告',
  'Facebook / Instagram広告',
  'X(Twitter)広告',
  'YouTube広告',
  'LINE広告',
  'メールマガジン',
  'チラシ・QRコード',
  'オーガニック検索'
];

const LP_TONES = [
  '信頼・安心',
  '緊急・限定',
  '親しみ・カジュアル',
  '高級・プレミアム',
  '専門・権威',
  '情熱・エネルギッシュ'
];

const LP_PRICE_OPTIONS = [
  '表示する（具体的な金額を記載）',
  '表示しない',
  '要相談と表記',
  '無料と表記'
];

const LP_INCENTIVE_OPTIONS = [
  'なし',
  '期間限定割引',
  '先着○名限定',
  '初回限定特典',
  '数量限定',
  '無料プレゼント',
  'セット割引'
];

const LP_GUARANTEE_OPTIONS = [
  'なし',
  '無料相談',
  '全額返金保証',
  'お試し期間あり',
  '成果保証'
];

// ===== LP構成案プロンプトテンプレート =====

const LP_COMPOSITION_PROMPT_TEMPLATE = `あなたは以下の2人の世界最高峰の専門家として、LP（ランディングページ）の完全な構成案を作成してください。

# 【専門家ペルソナ】

## 👤 専門家①: 世界一のダイレクトレスポンスマーケター
- **専門領域**: コンバージョン率最適化（CRO）、セールスコピーライティング、行動心理学
- **視点**:
  - ファーストビュー3秒で離脱を防ぎ、スクロールさせる設計
  - PASONA法則（Problem→Affinity→Solution→Offer→Narrowing→Action）に基づく構成
  - 心理トリガー（社会的証明、希少性、権威性、返報性、損失回避）の戦略的配置
  - マイクロコピー（ボタン周辺の小さな文言）で行動障壁を下げる
  - 流入元の広告文言とFVの一貫性（メッセージマッチ）
- **アウトプット**: 各セクションの「見出し」「本文」「CTA文言」「心理トリガー」を、CVR最大化の観点から設計

## 👤 専門家②: 人間味ある最高のWEBデザイナー
- **専門領域**: UI/UX、ビジュアル階層設計、ブランド体験設計、**反AIデザイン哲学**
- **視点**:
  - **AIデザインの典型的な特徴を徹底的に排除**（カード乱用、紫グラデーション、均一な余白、過剰なアニメーション）
  - LPの縦長1ページ構成に最適化されたビジュアルフロー
  - セクション間のリズム（テキスト→ビジュアル→数字→テキスト）
  - CTAボタンの視覚的突出（周囲の余白、コントラスト、サイズ）
  - モバイルファースト設計（LP閲覧の70%以上がスマホ）
- **アウトプット**: 各セクションの「レイアウト」「ビジュアル要素」「色彩設計」「UI詳細」を、人間ならではの洗練されたデザインで設計

### 【専門家②の「反AIデザイン哲学」（LP版）】

#### ❌ LPでよくあるAIデザインの失敗
- ❌ 全セクションが同じレイアウトパターンの繰り返し
- ❌ カード型UIの乱用（特に特徴セクションの3カラムカード）
- ❌ 意味のないグラデーション背景
- ❌ 全てのボタンが同じデザイン（CTAの優先度が伝わらない）
- ❌ 装飾過多で情報が埋もれる

#### ✅ 高CVR LPのデザイン原則
- ✅ セクションごとに異なるレイアウトでリズムを作る
- ✅ CTAは周囲と明確にコントラストをつけ、余白で目立たせる
- ✅ 重要な数字は大きく、補足は小さく（視覚的階層）
- ✅ 写真は「使っている場面」「結果が出た瞬間」を見せる
- ✅ モバイルでの親指の届く範囲にCTAを配置

---

# 【入力情報】

## A. 基本情報
- **企業名**: {{companyName}}
- **サービス・商品名**: {{serviceName}}
- **LPの目的（CV種別）**: {{cvType}}
- **流入元**: {{trafficSource}}

## B. ターゲット
- **ターゲット像**: {{targetProfile}}
- **抱えている課題・悩み**: {{targetPain}}
- **検索意図・広告クリック動機**: {{searchIntent}}
- **比較検討時に重視すること**: {{comparisonPoints}}

## C. 訴求・差別化
- **提供内容の詳細**: {{serviceDetail}}
- **強み・選ばれる理由**: {{strengths}}
- **実績・数字**: {{achievements}}
- **競合との違い**: {{competitors}}
- **お客様の声・事例**: {{testimonials}}

## D. オファー・クロージング
- **価格・料金**: {{priceDisplay}}
- **特典・限定性**: {{incentive}}
- **保証・リスク軽減**: {{guarantee}}

## E. 表現・デザイン
- **トーン**: {{tone}}
- **ブランドカラー**: {{brandColor}}
- **参考LP（URL）**: {{referenceUrl}}
- **NG表現・注意点**: {{ngExpressions}}

---

# 【LPセクション構成】

以下の構成でLPを設計してください。各セクションで2人の専門家の知見を統合してください。

## セクション1: ファーストビュー（FV）
**最重要セクション。3秒で「自分のためのページだ」と認識させる。**
- メインキャッチコピー（ターゲットの悩み or ベネフィットを端的に）
- サブキャッチコピー（メインの補足、具体性を加える）
- キービジュアル（撮影指示レベルの具体性）
- CTA（ボタン文言 + マイクロコピー「たった30秒で入力完了」等）
- 流入元の広告とのメッセージマッチを意識

## セクション2: 課題提起
**「あなたのこんなお悩み、ありませんか？」**
- ターゲットの悩みを3-5個リストアップ
- 「あるある」と共感させる具体的な場面描写
- 悩みの先にある不安や損失を示唆

## セクション3: 解決策の提示
**「そんなあなたに○○」**
- サービス/商品の概要を一文で
- ベネフィット（特徴ではなく「得られる結果」）を3つ
- 「なぜこのサービスで解決できるのか」のロジック

## セクション4: 特徴・強み
**3カラムで訴求**
- 強み×3（アイコン or 写真 + 見出し + 説明文）
- 各強みに具体的な数値・事例を添える
- 競合との差別化が伝わる表現

## セクション5: 実績・数字
**社会的証明（導入数、満足度等）**
- インパクトのある数字（導入社数、満足度、年数等）
- 大きなフォント+補足テキストの組み合わせ
- ロゴ一覧（BtoB）/ メディア掲載（BtoC）

## セクション6: お客様の声
**テスティモニアル**
- 2-3件のテスティモニアル
- 写真 + 名前（属性）+ コメント
- Before/After形式が可能なら採用

## セクション7: 料金・オファー
**特典・限定性**
- 料金表示（入力情報の設定に従う）
- 特典・限定性の訴求
- 比較表（プランが複数ある場合）

## セクション8: よくある質問（FAQ）
**不安・疑問を先回りで解消**
- 5-7件のQ&A
- 「申し込み前の不安」を中心に構成
- ポジティブな回答で安心感を

## セクション9: 最終CTA
**クロージング**
- 強いCTAメッセージ（FVとは異なる切り口）
- 保証・リスク軽減の再提示
- フォーム設計（項目は最小限：名前、連絡先、相談内容程度）
- マイクロコピーで最後の一押し

---

# 【出力形式】

## ✅ 完成度の定義
この構成案は「設計書」ではなく、**以下の状態を満たす完成品**です:

1. **全ての文言が確定している**
   - 見出し、本文、ボタン文言、マイクロコピー、すべて実際の文字数で記載
   - 「後で考える」「検討が必要」は一切なし
   - そのままコピペして実装できるレベル

2. **全てのビジュアル要素が指定されている**
   - 画像内容（撮影指示レベルの具体性）
   - 配置、サイズ、余白
   - 色（カラーコード指定）

3. **モバイル版の変更点が明記されている**
   - PC版とSP版でレイアウトが変わる箇所を具体的に

4. **CTA設計が完璧**
   - ボタン文言、色、サイズ、マイクロコピー
   - 各CTAの配置理由（心理トリガーとの関連）

---

## 出力構成

### PART 1: LP全体の戦略設計

#### 1-1. コンバージョン戦略（👤 専門家①）
- ターゲットの心理フロー（認知→興味→欲求→不安解消→行動）
- 各セクションの役割とCTA配置戦略
- メッセージマッチ（広告文言→FV→全体の一貫性）

#### 1-2. ビジュアル・デザイン戦略（👤 専門家②）
- 全体のトーン＆マナー
- カラーパレット（メイン、アクセント、背景、テキスト）
- タイポグラフィ設計
- セクション間のリズム設計

### PART 2: セクション別詳細設計

各セクションについて以下を記載:
- **コピー**: 見出し、本文、ボタン文言（すべて確定版）
- **レイアウト**: PC版・SP版の配置
- **ビジュアル**: 画像・アイコンの内容と配置
- **デザイン**: 背景色、余白、フォントサイズ
- **心理トリガー**: このセクションで使用する心理効果
- **CTA**: 配置する場合のデザインと文言

### PART 3: 実装メモ
- レスポンシブ対応の注意点
- パフォーマンス考慮（画像最適化、遅延読み込み）
- フォームのバリデーション設計
- OGP・SEO設定（LP用の最小限）

{{referenceSection}}
`;

// ===== LP Claude Code出力指示テンプレート =====

const LP_CLAUDE_CODE_OUTPUT_INSTRUCTION = `

---

# 【Claude Code用 出力指示】

**あなたはこの指示に従って、LPプロジェクトをセットアップし、ファイルを作成・保存してください。**

## 出力先ディレクトリ
\`\`\`
/mnt/c/client_lp/{{companyNameEn}}/
\`\`\`

## 最終的なファイル構成
\`\`\`
{{companyNameEn}}/
├── HANDOFF.md                    # 進捗管理・引き継ぎ用
├── doc/
│   └── wireframe/
│       └── lp.md                 # LP構成案（全セクション）
├── public/images/                # 素材画像（後で配置）
├── src/                          # Next.jsソースコード
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx              # LP本体（1ページ）
│   └── components/               # セクション別コンポーネント
└── （その他テンプレートファイル）
\`\`\`

## 作成手順

### STEP 1: テンプレートをクローンしてセットアップ

\`\`\`bash
cd /mnt/c/client_lp
gh repo clone tenchan000517/template-lp {{companyNameEn}}
cd {{companyNameEn}}
npm install
mkdir -p doc/wireframe
\`\`\`

### STEP 2: HANDOFF.mdを作成

以下の内容で HANDOFF.md を作成してください：
\`\`\`markdown
# {{companyName}} LP制作 HANDOFF

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| 企業名 | {{companyName}} |
| サービス名 | {{serviceName}} |
| LPの目的 | {{cvType}} |
| テンプレート | template-lp |
| ディレクトリ | client_lp/{{companyNameEn}}/ |
| 作成日 | {{date}} |

## ブランドカラー

| 項目 | コード | 用途 |
|------|--------|------|
| メインカラー | （構成案から抽出） | ヘッダー、見出し等 |
| アクセントカラー | （構成案から抽出） | CTA、ボタン等 |
| 背景カラー | （構成案から抽出） | セクション背景 |

## コーディングルール

- Next.js (App Router) + TypeScript + Tailwind CSS
- モバイルファースト設計
- **globals.cssの@themeブロック内のブランドカラーのみ変更する**
  - CSS変数名は変えない（ユーティリティクラスが参照しているため）
- **それ以外のglobals.cssは編集しない**
- 画像は public/images/ に配置
- セクション単位でコンポーネント分割（src/components/sections/）
- CTAボタンはスムーススクロールでフォームへ
- src/data/sample.ts のサンプルデータを実データに差し替える

## 実装ステータス

| セクション | ステータス | 備考 |
|-----------|-----------|------|
{{sectionRows}}
\`\`\`

### STEP 3: LP構成案を保存

上記の構成案全文を **doc/wireframe/lp.md** として保存してください。

### STEP 4: 構成案に基づいてLP実装

1. **doc/wireframe/lp.md** を読む
2. HANDOFF.md のコーディングルールに従う
3. **src/data/sample.ts** のサンプルデータを実データに差し替え
4. **src/components/sections/** のセクションコンポーネントを構成案に合わせて編集
5. globals.css のブランドカラー変数を差し替え
6. レスポンシブ対応（SP/PC）を確認

ファイル作成を開始してください。
`;

// ===== HP→LP フィールドマッピング =====
// ヒアリングシートのラベル → LP入力フィールドID
const LP_FIELD_MAPPING = {
  // 単一ラベル → 単一フィールド
  'メインターゲット': 'targetProfile',
  '抱えている課題・悩み': 'targetPain',
  'どんな状況で検索するか': 'searchIntent',
  '比較検討時に重視するポイント': 'comparisonPoints',
  '主なサービス・商品': 'serviceDetail',
  '競合・意識している会社': 'competitors',
  '実績・導入事例': 'achievements',
  'お客様・社員からよく言われる褒め言葉': 'testimonials',
  'NGイメージ': 'ngExpressions',
  // 複数ラベルを結合するフィールド
  '_strengths': ['自社の強み', '選ばれる理由の具体例', 'サービス・商品の強み・特徴', '独自の技術・ノウハウ'],
  '_targetProfile_append': ['年齢層・性別', '職業・役職・年収帯', '居住地・勤務地'],
  '_searchIntent_append': ['検索しそうなキーワード']
};

// ===== エントリーポイント =====

/**
 * LP構成案プロンプト生成ダイアログを表示
 */
function lp_showCompositionDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();
  const html = HtmlService.createHtmlOutput(lp_createCompositionDialogHTML(sheetData))
    .setWidth(750)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '📄 LP構成案プロンプト生成');
}

// ===== サーバーサイド関数 =====

/**
 * ヒアリングシートからLP用データを抽出
 * Part①②の全JSONを取得し、LPフィールドへのマッピングも行う
 */
function lp_extractFromSheet(sheetName) {
  try {
    // Part①②のJSON全体を取得（参考情報用）
    const jsonResult = hp_extractJsonData(sheetName);
    if (!jsonResult.success) {
      return { success: false, error: jsonResult.error };
    }

    // シートからラベル→値のマップを作成
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(1, 1, lastRow, 2).getValues();

    const labelMap = {};
    data.forEach(function(row) {
      const label = String(row[0]).trim();
      const value = String(row[1] || '').trim();
      if (label && value) {
        labelMap[label] = value;
      }
    });

    // LPフィールドにマッピング
    const mapped = {};

    // 単一マッピング
    Object.keys(LP_FIELD_MAPPING).forEach(function(key) {
      if (key.startsWith('_')) return; // 結合マッピングはスキップ
      const fieldId = LP_FIELD_MAPPING[key];
      if (labelMap[key]) {
        mapped[fieldId] = labelMap[key];
      }
    });

    // 強み（複数ラベルを結合）
    var strengthParts = [];
    LP_FIELD_MAPPING['_strengths'].forEach(function(label) {
      if (labelMap[label]) strengthParts.push(labelMap[label]);
    });
    if (strengthParts.length > 0) {
      mapped['strengths'] = strengthParts.join('\n');
    }

    // ターゲット像（追加情報を結合）
    var targetAppend = [];
    LP_FIELD_MAPPING['_targetProfile_append'].forEach(function(label) {
      if (labelMap[label]) targetAppend.push(label + ': ' + labelMap[label]);
    });
    if (targetAppend.length > 0 && mapped['targetProfile']) {
      mapped['targetProfile'] += '\n' + targetAppend.join('、');
    } else if (targetAppend.length > 0) {
      mapped['targetProfile'] = targetAppend.join('、');
    }

    // 検索意図（追加情報を結合）
    var searchAppend = [];
    LP_FIELD_MAPPING['_searchIntent_append'].forEach(function(label) {
      if (labelMap[label]) searchAppend.push(labelMap[label]);
    });
    if (searchAppend.length > 0 && mapped['searchIntent']) {
      mapped['searchIntent'] += '\n検索キーワード: ' + searchAppend.join('、');
    } else if (searchAppend.length > 0) {
      mapped['searchIntent'] = '検索キーワード: ' + searchAppend.join('、');
    }

    // 既存LP入力データがあれば読み込む
    const savedLpData = hp_loadPart4Data(sheetName, 'LP制作データ');
    var previousLpData = null;
    if (savedLpData.success && savedLpData.value) {
      try {
        previousLpData = JSON.parse(savedLpData.value);
      } catch (e) {
        // JSONパース失敗は無視
      }
    }

    return {
      success: true,
      companyName: jsonResult.companyName,
      fullJson: jsonResult.data,
      mapped: mapped,
      previousLpData: previousLpData
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * LP入力データをPart④に保存
 */
function lp_saveToSheet(sheetName, lpData) {
  try {
    const jsonStr = JSON.stringify(lpData, null, 2);
    hp_savePart4DataForce(sheetName, 'LP制作データ', jsonStr);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== ダイアログHTML生成 =====

function lp_createCompositionDialogHTML(sheetData) {
  // ドロップダウンのオプションをJSON化
  const sheetDataJson = JSON.stringify(sheetData);
  const cvTypesJson = JSON.stringify(LP_CV_TYPES);
  const trafficSourcesJson = JSON.stringify(LP_TRAFFIC_SOURCES);
  const tonesJson = JSON.stringify(LP_TONES);
  const priceOptionsJson = JSON.stringify(LP_PRICE_OPTIONS);
  const incentiveOptionsJson = JSON.stringify(LP_INCENTIVE_OPTIONS);
  const guaranteeOptionsJson = JSON.stringify(LP_GUARANTEE_OPTIONS);
  const templatesJson = JSON.stringify(LP_TEMPLATES);

  // テンプレートをJSON.stringifyで安全にエスケープ
  const promptTemplateJson = JSON.stringify(LP_COMPOSITION_PROMPT_TEMPLATE);
  const ccInstructionJson = JSON.stringify(LP_CLAUDE_CODE_OUTPUT_INSTRUCTION);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .lp-form { max-height: calc(100vh - 60px); overflow-y: auto; padding-right: 4px; }

    .section-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 14px;
      overflow: hidden;
    }
    .section-card-header {
      padding: 10px 14px;
      font-weight: bold;
      font-size: 13px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-card-body { padding: 14px; }

    .header-a { background: #1565C0; }
    .header-b { background: #00838F; }
    .header-c { background: #E65100; }
    .header-d { background: #6A1B9A; }
    .header-e { background: #2E7D32; }

    .lp-field { margin-bottom: 12px; }
    .lp-field:last-child { margin-bottom: 0; }
    .lp-field label {
      display: block;
      font-weight: 600;
      font-size: 12px;
      color: #333;
      margin-bottom: 4px;
    }
    .lp-field .field-hint {
      font-size: 11px;
      color: #888;
      margin-bottom: 4px;
    }
    .lp-field select, .lp-field input, .lp-field textarea {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 13px;
    }
    .lp-field textarea { min-height: 56px; resize: vertical; }
    .lp-field select:focus, .lp-field input:focus, .lp-field textarea:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 2px rgba(21,101,192,0.1);
    }

    .output-section {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
      display: none;
    }
    .output-section.show { display: block; }
    .prompt-output {
      width: 100%;
      height: 250px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 11px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      background: #f8f9fa;
      white-space: pre-wrap;
      overflow: auto;
    }
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .output-header h4 { margin: 0; font-size: 14px; }

    .cc-toggle {
      background: #f0f4ff;
      border: 1px solid #c5cae9;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cc-toggle label { font-weight: 500; font-size: 13px; cursor: pointer; }

    .btn-generate {
      width: 100%;
      padding: 12px;
      background: #1565C0;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-generate:hover { background: #0D47A1; }
    .btn-generate:disabled { background: #90CAF9; cursor: not-allowed; }

    .price-detail { margin-top: 6px; display: none; }
    .price-detail.show { display: block; }
    .incentive-detail { margin-top: 6px; display: none; }
    .incentive-detail.show { display: block; }
    .guarantee-detail { margin-top: 6px; display: none; }
    .guarantee-detail.show { display: block; }

    .sheet-selector {
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .sheet-selector label { font-weight: 600; font-size: 13px; color: #2E7D32; display: block; margin-bottom: 6px; }
    .sheet-selector select { width: 100%; padding: 8px 10px; border: 1px solid #a5d6a7; border-radius: 5px; font-size: 13px; }
    .sheet-selector .sheet-hint { font-size: 11px; color: #558B2F; margin-top: 6px; }
    .sheet-status { font-size: 12px; margin-top: 6px; padding: 6px 10px; border-radius: 4px; display: none; }
    .sheet-status.loaded { display: block; background: #c8e6c9; color: #2E7D32; }
    .sheet-status.loading { display: block; background: #fff9c4; color: #F57F17; }
    .sheet-status.error { display: block; background: #ffcdd2; color: #c62828; }

    .btn-save {
      padding: 8px 16px;
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-save:hover { background: #1B5E20; }
    .btn-save:disabled { background: #a5d6a7; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="lp-form">
    <p class="subtitle">20項目を入力するとLP構成案プロンプトを自動生成します</p>

    <!-- シート選択 -->
    <div class="sheet-selector">
      <label>📂 既存ヒアリングシートから読み込み（任意）</label>
      <select id="sheetSelect" onchange="onSheetSelect()">
        <option value="">直接入力（シートなし）</option>
      </select>
      <div class="sheet-hint">シートを選択すると企業名・ターゲット・強み等が自動入力されます</div>
      <div class="sheet-status" id="sheetStatus"></div>
    </div>

    <!-- A. 基本情報 -->
    <div class="section-card">
      <div class="section-card-header header-a">A. 基本情報</div>
      <div class="section-card-body">
        <div class="lp-field">
          <label>1. 企業名 *</label>
          <input type="text" id="companyName" placeholder="例: 株式会社○○">
        </div>
        <div class="lp-field">
          <label>2. サービス・商品名 *</label>
          <input type="text" id="serviceName" placeholder="例: クラウド在庫管理システム「StockAI」">
        </div>
        <div class="lp-field">
          <label>3. LPの目的（CV種別） *</label>
          <select id="cvType"></select>
        </div>
        <div class="lp-field">
          <label>4. 流入元</label>
          <select id="trafficSource"></select>
        </div>
      </div>
    </div>

    <!-- B. ターゲット -->
    <div class="section-card">
      <div class="section-card-header header-b">B. ターゲット</div>
      <div class="section-card-body">
        <div class="lp-field">
          <label>5. ターゲット像 *</label>
          <div class="field-hint">誰に売るか。具体的なペルソナ像</div>
          <textarea id="targetProfile" placeholder="例: 従業員50-200名の製造業。在庫管理に課題を感じている生産管理部門の責任者（40-50代男性）"></textarea>
        </div>
        <div class="lp-field">
          <label>6. 抱えている課題・悩み *</label>
          <div class="field-hint">ターゲットが感じている具体的な痛み</div>
          <textarea id="targetPain" placeholder="例: Excelでの在庫管理が限界。欠品・過剰在庫が頻発。棚卸しに丸2日かかる"></textarea>
        </div>
        <div class="lp-field">
          <label>7. 検索意図・広告クリック動機</label>
          <div class="field-hint">何を期待してこのLPに来るか</div>
          <textarea id="searchIntent" placeholder="例: 「在庫管理 システム 中小企業」で検索。自社でも導入できる手軽なツールを探している"></textarea>
        </div>
        <div class="lp-field">
          <label>8. 比較検討時に重視すること</label>
          <textarea id="comparisonPoints" placeholder="例: 導入コスト、既存システムとの連携、サポート体制、導入事例の有無"></textarea>
        </div>
      </div>
    </div>

    <!-- C. 訴求・差別化 -->
    <div class="section-card">
      <div class="section-card-header header-c">C. 訴求・差別化</div>
      <div class="section-card-body">
        <div class="lp-field">
          <label>9. 提供内容の詳細 *</label>
          <div class="field-hint">サービス/商品の具体的な内容</div>
          <textarea id="serviceDetail" placeholder="例: AIで需要予測→自動発注→リアルタイム在庫可視化。月額5万円〜。導入サポート付き"></textarea>
        </div>
        <div class="lp-field">
          <label>10. 強み・選ばれる理由 *</label>
          <div class="field-hint">3つ程度。具体的な数値があるとベスト</div>
          <textarea id="strengths" placeholder="例:&#10;1. AI予測精度98% - 欠品率を平均73%削減&#10;2. 最短3日で導入 - 既存システムとAPI連携&#10;3. 専任サポーター付き - 導入後3ヶ月間伴走"></textarea>
        </div>
        <div class="lp-field">
          <label>11. 実績・数字</label>
          <div class="field-hint">導入数、満足度、受賞歴など</div>
          <textarea id="achievements" placeholder="例: 導入企業500社超、継続率98.5%、在庫コスト平均30%削減"></textarea>
        </div>
        <div class="lp-field">
          <label>12. 競合との違い</label>
          <textarea id="competitors" placeholder="例: 大手A社は月額30万円〜で中小には高すぎる。B社はカスタマイズ不可。当社は中小特化で柔軟"></textarea>
        </div>
        <div class="lp-field">
          <label>13. お客様の声・事例</label>
          <div class="field-hint">なければ空欄でOK（AIが想定で作成）</div>
          <textarea id="testimonials" placeholder="例: ○○製作所 田中部長「棚卸し時間が2日→3時間に。もっと早く導入すればよかった」"></textarea>
        </div>
      </div>
    </div>

    <!-- D. オファー・クロージング -->
    <div class="section-card">
      <div class="section-card-header header-d">D. オファー・クロージング</div>
      <div class="section-card-body">
        <div class="lp-field">
          <label>14. 価格・料金</label>
          <select id="priceDisplay" onchange="togglePriceDetail()"></select>
          <div class="price-detail" id="priceDetailArea">
            <input type="text" id="priceDetail" placeholder="例: 月額50,000円〜（税別）/ 初期費用0円">
          </div>
        </div>
        <div class="lp-field">
          <label>15. 特典・限定性</label>
          <select id="incentive" onchange="toggleIncentiveDetail()"></select>
          <div class="incentive-detail" id="incentiveDetailArea">
            <input type="text" id="incentiveDetail" placeholder="例: 3月末まで初月無料 / 先着30社限定">
          </div>
        </div>
        <div class="lp-field">
          <label>16. 保証・リスク軽減</label>
          <select id="guarantee" onchange="toggleGuaranteeDetail()"></select>
          <div class="guarantee-detail" id="guaranteeDetailArea">
            <input type="text" id="guaranteeDetail" placeholder="例: 30日間全額返金保証">
          </div>
        </div>
      </div>
    </div>

    <!-- E. 表現・デザイン -->
    <div class="section-card">
      <div class="section-card-header header-e">E. 表現・デザイン</div>
      <div class="section-card-body">
        <div class="lp-field">
          <label>17. トーン</label>
          <select id="tone"></select>
        </div>
        <div class="lp-field">
          <label>18. ブランドカラー</label>
          <input type="text" id="brandColor" placeholder="例: メイン #1565C0（紺）、アクセント #FF6F00（オレンジ）">
        </div>
        <div class="lp-field">
          <label>19. 参考LP（URL）</label>
          <input type="text" id="referenceUrl" placeholder="例: https://example.com/lp">
        </div>
        <div class="lp-field">
          <label>20. NG表現・注意点</label>
          <textarea id="ngExpressions" placeholder="例: 薬機法に抵触する表現NG。「日本一」「最高」等の最上級表現NG"></textarea>
        </div>
      </div>
    </div>

    <!-- Claude Code オプション -->
    <div class="cc-toggle">
      <input type="checkbox" id="claudeCodeCheck" onchange="toggleClaudeCode()">
      <label for="claudeCodeCheck">🤖 Claude Code用の出力指示も含める</label>
    </div>

    <!-- テンプレート選択（Claude Code有効時のみ表示） -->
    <div class="cc-toggle" id="templateSelector" style="display: none; flex-direction: column; align-items: flex-start;">
      <label style="margin-bottom: 6px;">📦 使用テンプレート</label>
      <select id="templateSelect" style="width: 100%; padding: 8px 10px; border: 1px solid #c5cae9; border-radius: 5px; font-size: 13px;"></select>
      <div id="templateDesc" style="font-size: 11px; color: #666; margin-top: 4px;"></div>
    </div>

    <!-- ボタン群 -->
    <div style="display: flex; gap: 10px; margin-bottom: 4px;">
      <button class="btn-generate" id="generateBtn" onclick="generatePrompt()" style="flex: 1;">
        📄 構成案プロンプトを生成
      </button>
      <button class="btn-save" id="saveBtn" onclick="saveToSheet()" disabled title="シートを選択すると有効になります">
        💾 シートに保存
      </button>
    </div>

    <!-- ステータス -->
    <div id="status" class="status"></div>

    <!-- 出力 -->
    <div class="output-section" id="outputSection">
      <div class="output-header">
        <h4>📋 生成されたプロンプト</h4>
        <button class="btn btn-copy" onclick="copyPrompt()">📋 コピー</button>
      </div>
      <textarea class="prompt-output" id="promptOutput" readonly></textarea>
    </div>
  </div>

  <div class="copy-success" id="copyToast">✓ コピーしました</div>

  ${CI_UI_COMPONENTS}
  <script>
    // ドロップダウンデータ
    var sheetData = ${sheetDataJson};
    var cvTypes = ${cvTypesJson};
    var trafficSources = ${trafficSourcesJson};
    var tones = ${tonesJson};
    var priceOptions = ${priceOptionsJson};
    var incentiveOptions = ${incentiveOptionsJson};
    var guaranteeOptions = ${guaranteeOptionsJson};
    var lpTemplates = ${templatesJson};

    // テンプレート（JSON.stringifyの出力はそのままJS文字列リテラルとして有効）
    var promptTemplate = ${promptTemplateJson};
    var ccInstruction = ${ccInstructionJson};

    var currentPrompt = '';
    var selectedSheetName = '';
    var fullJsonData = null; // Part①②のJSON全体（参考情報用）

    // 初期化
    window.onload = function() {
      // シート選択ドロップダウン
      var sel = document.getElementById('sheetSelect');
      (sheetData.companySheets || []).forEach(function(s) {
        var opt = document.createElement('option');
        opt.value = s.sheetName;
        opt.textContent = s.companyName + '（' + s.sheetName + '）';
        if (s.isActive) opt.selected = true;
        sel.appendChild(opt);
      });
      // アクティブシートが選択されていたら自動読み込み
      if (sel.value) onSheetSelect();

      populateSelect('cvType', cvTypes, '選択してください');
      populateSelect('trafficSource', trafficSources, '選択してください');
      populateSelect('tone', tones, '選択してください');
      populateSelect('priceDisplay', priceOptions, '選択してください');
      populateSelect('incentive', incentiveOptions, '選択してください');
      populateSelect('guarantee', guaranteeOptions, '選択してください');

      // テンプレート選択ドロップダウン
      var tplSel = document.getElementById('templateSelect');
      lpTemplates.forEach(function(t) {
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        tplSel.appendChild(opt);
      });
      tplSel.addEventListener('change', function() {
        var selected = lpTemplates.find(function(t) { return t.id === tplSel.value; });
        document.getElementById('templateDesc').textContent = selected ? selected.description : '';
      });
      // 初期表示
      document.getElementById('templateDesc').textContent = lpTemplates[0].description;
    };

    function populateSelect(id, options, placeholder) {
      var sel = document.getElementById(id);
      sel.innerHTML = '<option value="">' + placeholder + '</option>';
      options.forEach(function(opt) {
        sel.innerHTML += '<option value="' + opt + '">' + opt + '</option>';
      });
    }

    // ===== シート選択・データ読み込み =====

    function onSheetSelect() {
      selectedSheetName = document.getElementById('sheetSelect').value;
      var saveBtn = document.getElementById('saveBtn');

      if (!selectedSheetName) {
        saveBtn.disabled = true;
        fullJsonData = null;
        setSheetStatus('', '');
        return;
      }

      saveBtn.disabled = false;
      setSheetStatus('⏳ データを読み込み中...', 'loading');

      google.script.run
        .withSuccessHandler(handleSheetData)
        .withFailureHandler(function(err) {
          setSheetStatus('❌ ' + err.message, 'error');
        })
        .lp_extractFromSheet(selectedSheetName);
    }

    function handleSheetData(result) {
      if (!result.success) {
        setSheetStatus('❌ ' + result.error, 'error');
        return;
      }

      fullJsonData = result.fullJson;

      // 前回保存したLP入力データがあればそちらを優先
      if (result.previousLpData) {
        applyLpData(result.previousLpData);
        setSheetStatus('✅ 前回のLP入力データを復元しました（' + result.companyName + '）', 'loaded');
      } else {
        // Part①②からマッピングしたデータを反映
        applyMappedData(result.companyName, result.mapped);
        setSheetStatus('✅ ヒアリングシートから反映しました（' + result.companyName + '）', 'loaded');
      }
    }

    function applyMappedData(companyName, mapped) {
      // 企業名
      setVal('companyName', companyName);

      // テキストフィールド
      var textFields = ['targetProfile', 'targetPain', 'searchIntent', 'comparisonPoints',
                        'serviceDetail', 'strengths', 'achievements', 'competitors',
                        'testimonials', 'ngExpressions'];
      textFields.forEach(function(id) {
        if (mapped[id]) setVal(id, mapped[id]);
      });
    }

    function applyLpData(data) {
      // テキスト・入力フィールド
      var fields = ['companyName', 'serviceName', 'targetProfile', 'targetPain',
                    'searchIntent', 'comparisonPoints', 'serviceDetail', 'strengths',
                    'achievements', 'competitors', 'testimonials', 'brandColor',
                    'referenceUrl', 'ngExpressions', 'priceDetail', 'incentiveDetail',
                    'guaranteeDetail'];
      fields.forEach(function(id) {
        if (data[id]) setVal(id, data[id]);
      });

      // ドロップダウン
      if (data.cvType) setSelectVal('cvType', data.cvType);
      if (data.trafficSource) setSelectVal('trafficSource', data.trafficSource);
      if (data.tone) setSelectVal('tone', data.tone);
      if (data.priceDisplay) { setSelectVal('priceDisplay', data.priceDisplay); togglePriceDetail(); }
      if (data.incentive) { setSelectVal('incentive', data.incentive); toggleIncentiveDetail(); }
      if (data.guarantee) { setSelectVal('guarantee', data.guarantee); toggleGuaranteeDetail(); }
    }

    function setVal(id, value) {
      var el = document.getElementById(id);
      if (el) el.value = value;
    }

    function setSelectVal(id, value) {
      var el = document.getElementById(id);
      if (!el) return;
      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].value === value) {
          el.selectedIndex = i;
          return;
        }
      }
    }

    function setSheetStatus(message, type) {
      var el = document.getElementById('sheetStatus');
      el.textContent = message;
      el.className = 'sheet-status' + (type ? ' ' + type : '');
    }

    // ===== シートに保存 =====

    function saveToSheet() {
      if (!selectedSheetName) {
        showStatus('シートを選択してください', 'error');
        return;
      }

      var data = collectFormData();
      document.getElementById('saveBtn').disabled = true;

      google.script.run
        .withSuccessHandler(function(result) {
          document.getElementById('saveBtn').disabled = false;
          if (result.success) {
            showStatus('✅ LP入力データをシートに保存しました', 'success');
          } else {
            showStatus('❌ 保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('saveBtn').disabled = false;
          showStatus('❌ 保存エラー: ' + err.message, 'error');
        })
        .lp_saveToSheet(selectedSheetName, data);
    }

    function collectFormData() {
      return {
        companyName: val('companyName'),
        serviceName: val('serviceName'),
        cvType: val('cvType'),
        trafficSource: val('trafficSource'),
        targetProfile: val('targetProfile'),
        targetPain: val('targetPain'),
        searchIntent: val('searchIntent'),
        comparisonPoints: val('comparisonPoints'),
        serviceDetail: val('serviceDetail'),
        strengths: val('strengths'),
        achievements: val('achievements'),
        competitors: val('competitors'),
        testimonials: val('testimonials'),
        priceDisplay: val('priceDisplay'),
        priceDetail: val('priceDetail'),
        incentive: val('incentive'),
        incentiveDetail: val('incentiveDetail'),
        guarantee: val('guarantee'),
        guaranteeDetail: val('guaranteeDetail'),
        tone: val('tone'),
        brandColor: val('brandColor'),
        referenceUrl: val('referenceUrl'),
        ngExpressions: val('ngExpressions'),
        savedAt: new Date().toISOString()
      };
    }

    // ===== 詳細入力の表示切り替え =====

    function togglePriceDetail() {
      var v = document.getElementById('priceDisplay').value;
      var area = document.getElementById('priceDetailArea');
      area.className = (v === priceOptions[0]) ? 'price-detail show' : 'price-detail';
    }

    function toggleIncentiveDetail() {
      var v = document.getElementById('incentive').value;
      var area = document.getElementById('incentiveDetailArea');
      area.className = (v && v !== incentiveOptions[0]) ? 'incentive-detail show' : 'incentive-detail';
    }

    function toggleGuaranteeDetail() {
      var v = document.getElementById('guarantee').value;
      var area = document.getElementById('guaranteeDetailArea');
      area.className = (v && v !== guaranteeOptions[0]) ? 'guarantee-detail show' : 'guarantee-detail';
    }

    function toggleClaudeCode() {
      var checked = document.getElementById('claudeCodeCheck').checked;
      document.getElementById('templateSelector').style.display = checked ? 'flex' : 'none';
    }

    // ===== バリデーション =====

    function validate() {
      var required = [
        { id: 'companyName', name: '企業名' },
        { id: 'serviceName', name: 'サービス・商品名' },
        { id: 'cvType', name: 'LPの目的' },
        { id: 'targetProfile', name: 'ターゲット像' },
        { id: 'targetPain', name: '課題・悩み' },
        { id: 'serviceDetail', name: '提供内容の詳細' },
        { id: 'strengths', name: '強み・選ばれる理由' }
      ];
      for (var i = 0; i < required.length; i++) {
        var el = document.getElementById(required[i].id);
        if (!el.value.trim()) {
          showStatus(required[i].name + ' を入力してください', 'error');
          el.focus();
          return false;
        }
      }
      return true;
    }

    // ===== プロンプト生成 =====

    function generatePrompt() {
      if (!validate()) return;

      document.getElementById('generateBtn').disabled = true;
      document.getElementById('generateBtn').textContent = '⏳ 生成中...';

      // フォームデータ収集
      var data = {
        companyName: val('companyName'),
        serviceName: val('serviceName'),
        cvType: val('cvType'),
        trafficSource: val('trafficSource') || '未指定',
        targetProfile: val('targetProfile'),
        targetPain: val('targetPain'),
        searchIntent: val('searchIntent') || '未指定',
        comparisonPoints: val('comparisonPoints') || '未指定',
        serviceDetail: val('serviceDetail'),
        strengths: val('strengths'),
        achievements: val('achievements') || '未指定（AIが適切な表現を検討）',
        competitors: val('competitors') || '未指定',
        testimonials: val('testimonials') || 'なし（AIが想定事例を作成）',
        priceDisplay: buildPriceText(),
        incentive: buildIncentiveText(),
        guarantee: buildGuaranteeText(),
        tone: val('tone') || '信頼・安心',
        brandColor: val('brandColor') || '未指定（AIが提案）',
        referenceUrl: val('referenceUrl') || 'なし',
        ngExpressions: val('ngExpressions') || '特になし'
      };

      // 参考情報セクション（Part①②のJSON全体）
      var refSection = '';
      if (fullJsonData) {
        var fence = String.fromCharCode(96,96,96);
        refSection = '\\n---\\n\\n# 【参考情報: ヒアリングシート全データ】' +
          '\\n\\nLP固有の20項目に加え、以下のヒアリング情報も参考にしてください。' +
          '\\nLP構成案に活用できる情報があれば積極的に取り入れてください。' +
          '\\n\\n' + fence + 'json\\n' + JSON.stringify(fullJsonData, null, 2) + '\\n' + fence;
      }

      // テンプレートに値を埋め込み
      currentPrompt = promptTemplate
        .replace('{{companyName}}', data.companyName)
        .replace('{{serviceName}}', data.serviceName)
        .replace('{{cvType}}', data.cvType)
        .replace('{{trafficSource}}', data.trafficSource)
        .replace('{{targetProfile}}', data.targetProfile)
        .replace('{{targetPain}}', data.targetPain)
        .replace('{{searchIntent}}', data.searchIntent)
        .replace('{{comparisonPoints}}', data.comparisonPoints)
        .replace('{{serviceDetail}}', data.serviceDetail)
        .replace('{{strengths}}', data.strengths)
        .replace('{{achievements}}', data.achievements)
        .replace('{{competitors}}', data.competitors)
        .replace('{{testimonials}}', data.testimonials)
        .replace('{{priceDisplay}}', data.priceDisplay)
        .replace('{{incentive}}', data.incentive)
        .replace('{{guarantee}}', data.guarantee)
        .replace('{{tone}}', data.tone)
        .replace('{{brandColor}}', data.brandColor)
        .replace('{{referenceUrl}}', data.referenceUrl)
        .replace('{{ngExpressions}}', data.ngExpressions)
        .replace('{{referenceSection}}', refSection);

      // Claude Code指示文を追加
      if (document.getElementById('claudeCodeCheck').checked) {
        var companyNameEn = toEnglishName(data.companyName);
        var today = new Date();
        var dateStr = today.getFullYear() + '-' +
          String(today.getMonth() + 1).padStart(2, '0') + '-' +
          String(today.getDate()).padStart(2, '0');

        // 選択テンプレートを取得
        var selectedTemplateId = document.getElementById('templateSelect').value;
        var selectedTemplate = lpTemplates.find(function(t) { return t.id === selectedTemplateId; });

        // セクション一覧を生成
        var sectionRows = selectedTemplate.sections.map(function(s) {
          return '| ' + s + ' | 未着手 | |';
        }).join('\\n');

        var cc = ccInstruction
          .replace(/{{companyName}}/g, data.companyName)
          .replace(/{{companyNameEn}}/g, companyNameEn)
          .replace(/{{serviceName}}/g, data.serviceName)
          .replace(/{{cvType}}/g, data.cvType)
          .replace(/{{date}}/g, dateStr)
          .replace(/template-lp/g, selectedTemplateId)
          .replace(/{{sectionRows}}/, sectionRows);

        currentPrompt += cc;
      }

      // シート選択時は自動保存
      if (selectedSheetName) {
        google.script.run.lp_saveToSheet(selectedSheetName, collectFormData());
      }

      // 出力表示
      document.getElementById('promptOutput').textContent = currentPrompt;
      document.getElementById('outputSection').className = 'output-section show';
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('generateBtn').textContent = '📄 構成案プロンプトを生成';

      var ccInfo = document.getElementById('claudeCodeCheck').checked ? ' + Claude Code指示文' : '';
      var refInfo = fullJsonData ? ' + ヒアリング参考情報' : '';
      showStatus('✅ プロンプト生成完了（' + data.companyName + ' / ' + data.serviceName + ccInfo + refInfo + '）', 'success');

      // 出力セクションにスクロール
      document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
    }

    function val(id) {
      return document.getElementById(id).value.trim();
    }

    function buildPriceText() {
      var selected = val('priceDisplay');
      if (!selected) return '未指定';
      if (selected === priceOptions[0]) {
        var detail = val('priceDetail');
        return detail ? '表示する: ' + detail : '表示する（金額は構成案で決定）';
      }
      return selected;
    }

    function buildIncentiveText() {
      var selected = val('incentive');
      if (!selected || selected === incentiveOptions[0]) return 'なし';
      var detail = val('incentiveDetail');
      return detail ? selected + ': ' + detail : selected;
    }

    function buildGuaranteeText() {
      var selected = val('guarantee');
      if (!selected || selected === guaranteeOptions[0]) return 'なし';
      var detail = val('guaranteeDetail');
      return detail ? selected + ': ' + detail : selected;
    }

    function toEnglishName(name) {
      if (/^[a-zA-Z0-9\\-_\\s]+$/.test(name)) {
        return name.toLowerCase().replace(/\\s+/g, '-');
      }
      return '{{' + name + 'の英語表記を入力}}';
    }

    function copyPrompt() {
      if (!currentPrompt) {
        showStatus('先にプロンプトを生成してください', 'error');
        return;
      }
      copyToClipboard(currentPrompt);
    }

    function showStatus(message, type) {
      var status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
  `;
}
