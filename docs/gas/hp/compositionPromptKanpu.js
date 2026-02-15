/**
 * HP制作 デザインカンプ版 プロンプト GAS
 *
 * 【機能】
 * 1. カンプ分析プロンプト生成 - デザインカンプ画像からHP実装指示を生成
 * 2. カンプ版Claude Code指示文生成 - 画像分析結果を元にHP実装
 *
 * 【用途】
 * デザイナーが作成したデザインカンプ（画像）を忠実に実装する際に使用
 * - 文言の捏造禁止
 * - プレースホルダー維持
 * - デザイン忠実再現
 *
 * 【使用方法】
 * compositionPrompt.jsと同じスプレッドシートに追加
 * hp_addCompositionMenu()内でこのファイルのメニューを追加
 */

// ===== カンプ分析プロンプトテンプレート（3人の専門家バージョン） =====
const HP_KANPU_ANALYSIS_PROMPT_TEMPLATE = `あなたは以下の3人の世界最高峰の専門家として、デザインカンプを分析し、HP実装指示書を作成してください。

# 【専門家ペルソナ】

## 👤 専門家①: 世界一のフロントエンドエンジニア
- **専門領域**: HTML/CSS/JavaScript、React/Next.js、レスポンシブデザイン、アクセシビリティ
- **視点**:
  - デザインカンプをコードに落とし込む際の最適な構造設計
  - セマンティックなHTML構造の設計
  - CSSの効率的な実装方法（Tailwind CSS）
  - コンポーネント分割の最適化
- **アウトプット**: 各セクションの「HTML構造」「CSSクラス」「コンポーネント設計」を技術的に正確に記述

## 👤 専門家②: 世界一のUI/UXデザイナー
- **専門領域**: ビジュアルデザイン、インタラクションデザイン、色彩設計、タイポグラフィ
- **視点**:
  - デザインカンプの意図を正確に読み取る
  - 色・余白・フォントサイズの正確な抽出
  - レスポンシブ時の挙動推測
  - アニメーション・ホバー効果の推測
- **アウトプット**: 各セクションの「色コード」「サイズ」「余白」「ビジュアル要素」を数値で正確に記述

## 👤 専門家③: 世界一の品質管理エキスパート
- **専門領域**: 要件定義、品質保証、リスク管理
- **視点**:
  - 「見えるもの」と「見えないもの」を明確に区別
  - プレースホルダー箇所の特定と明示
  - 不明点・要確認事項の洗い出し
  - 実装時の注意点・リスクの特定
- **アウトプット**: 各セクションの「確定情報」「プレースホルダー」「要確認事項」を明確に分類

---

# 【最重要ルール - 絶対厳守】

## 🚨 禁止事項（違反厳禁）

### 1. 文言の捏造禁止
- ❌ カンプに**見えない文言**を勝手に作成すること
- ❌ 「〇〇について」「詳しくはこちら」など一般的な文言を推測で追加
- ❌ 会社名・住所・電話番号などを推測で記載
- ✅ カンプに**見える文字のみ**を正確に転記

### 2. プレースホルダー維持
- ❌ 「aaaa」「xxxx」「000-0000」などのプレースホルダーを勝手に実データに置き換え
- ❌ プレースホルダーを「後で入力」などの説明文に変更
- ✅ プレースホルダーは**そのまま**実装指示に記載

### 3. デザイン忠実再現
- ❌ カンプにないデザイン要素を勝手に追加
- ❌ 「こうした方が良い」という改善提案
- ❌ カンプと異なるレイアウト・配色の提案
- ✅ カンプの**見た目を100%再現**することに集中

### 4. 虚偽情報禁止
- ❌ 存在しない実績・資格・受賞歴を追加
- ❌ 推測で数字（従業員数、創業年など）を記載
- ✅ 不明な情報は「【要確認】」と明記

---

# 【出力形式】

## PART 1: カンプ全体分析

### 1-1. ページ構成一覧

| # | ファイル名 | ページ種類 | 実装対象 | 備考 |
|---|-----------|-----------|---------|------|
| 1 | 1.png | TOPページ | ✅ | メインビジュアル〜フッター |
| 2 | 2.png | Aboutページ | ✅ | 会社紹介 |
| ... | ... | ... | ... | ... |

### 1-2. 共通要素の抽出

#### ブランドカラー（カンプから抽出）
| 用途 | カラーコード | 使用箇所 |
|------|-------------|---------|
| メインカラー | #XXXXXX | ヘッダー背景、見出し等 |
| アクセントカラー | #XXXXXX | CTAボタン等 |
| 背景色 | #XXXXXX | セクション背景 |

#### ヘッダー仕様
- ロゴ: [位置、サイズ]
- ナビゲーション: [項目一覧]
- 背景: [色/透明]

#### フッター仕様
- レイアウト: [構成]
- 背景色: [色コード]
- 含まれる要素: [ロゴ、ナビ、連絡先等]

### 1-3. 技術仕様

- フレームワーク: Next.js 14+ (App Router)
- スタイリング: Tailwind CSS
- アニメーション: Framer Motion（必要に応じて）

---

## PART 2: ページ別詳細設計

以下、各ページごとに記述:

### [ページ名] ページ（[ファイル名].png）

#### ページ概要
- **カンプファイル**: [ファイル名]
- **URL想定**: /[path]
- **含まれるセクション数**: [数]

#### セクション構成（上から順に）

---

##### セクション1: [セクション名]

**👤 専門家①（エンジニア）の分析**:
- HTML構造: [セマンティックなタグ構成]
- 推奨コンポーネント名: [ComponentName.tsx]
- Tailwindクラス概要: [主要なクラス]

**👤 専門家②（デザイナー）の分析**:
- 背景: [色コード / 画像]
- 余白: 上[○px] 下[○px] 左右[○px]
- 見出しサイズ: PC[○px] / SP[○px推測]

**👤 専門家③（品質管理）の分析**:
- ✅ 確定情報: [カンプに見える情報]
- ⚠️ プレースホルダー: [「aaaa」等の箇所]
- ❓ 要確認: [不明点]

**コンテンツ詳細**:

| 要素 | 内容（カンプから転記） | 備考 |
|------|----------------------|------|
| 見出し | 「[カンプの文字をそのまま]」 | |
| 本文 | 「[カンプの文字をそのまま]」 | |
| ボタン | 「[ボタン文言]」 | リンク先: [推測] |
| 画像 | [画像の説明] | サイズ: [横×縦] |

**レイアウト指示**:
\`\`\`
[アスキーアートまたは簡易図でレイアウトを表現]
\`\`\`

**プレースホルダー一覧**:
| 箇所 | 現在の値 | 用途推測 |
|------|---------|---------|
| 住所欄 | aaaa | 会社住所 |
| 電話番号 | 000-0000 | 代表電話 |

---

##### セクション2: [セクション名]
（同様の形式で続ける）

---

## PART 3: 実装時の注意事項

### 3-1. 絶対に守ること
1. カンプの文言を**一字一句そのまま**使用
2. プレースホルダー（aaaa等）は**そのまま**実装
3. カンプにない要素は**追加しない**

### 3-2. プレースホルダー一覧（全ページ）
| ページ | 箇所 | 現在の値 | 用途 |
|--------|------|---------|------|
| TOP | ヒーロー | ... | ... |
| About | 住所 | aaaa | 会社住所 |
| ... | ... | ... | ... |

### 3-3. 要確認事項一覧
| # | 項目 | 詳細 | 優先度 |
|---|------|------|--------|
| 1 | ロゴファイル | 透過PNG必要？ | 高 |
| 2 | OGP画像 | カンプに含まれず | 中 |
| ... | ... | ... | ... |

### 3-4. レスポンシブ対応
- カンプはPC版のみのため、SP版は以下の方針で実装:
  - ナビゲーション → ハンバーガーメニュー
  - 複数カラム → 1カラムに変更
  - 画像サイズ → 幅100%に調整

---

## PART 4: ファイル構成

\`\`\`
src/
├── app/
│   ├── page.tsx          # TOP
│   ├── about/page.tsx    # About
│   ├── [その他ページ]
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── [セクション名].tsx
│   └── ...
└── styles/
    └── globals.css
\`\`\`
`;

// ===== カンプ版 Claude Code指示文テンプレート =====
// ※通常版（compositionPrompt.js）と同じフローを踏襲
const HP_KANPU_CLAUDE_CODE_TEMPLATE = `# HP制作セットアップ指示書（カンプ版）

## 概要
{{companyName}}のHP制作プロジェクトをセットアップしてください。

## 1. 企業ディレクトリ作成

\`/mnt/c/client_hp/{{companyNameEn}}/\` ディレクトリを作成し、以下の構造でファイルを配置：

\`\`\`
{{companyNameEn}}/
├── data/
│   ├── hearing.json      # ヒアリング抽出JSON（あれば）
│   └── composition.md    # カンプ分析結果
├── HANDOFF.md            # 進捗管理・引き継ぎ用
└── （テンプレートファイル）
\`\`\`

## 2. テンプレートをクローン

\`\`\`bash
cd /mnt/c/client_hp
gh repo clone tenchan000517/template-standard {{companyNameEn}}
cd {{companyNameEn}}
mkdir -p data
\`\`\`

## 3. composition.md を作成

\`{{companyNameEn}}/data/composition.md\` に以下を保存：

{{kanpuAnalysis}}

## 4. hearing.json を作成（該当する場合のみ）

\`{{companyNameEn}}/data/hearing.json\` に以下を保存：

{{json}}

## 5. HANDOFF.md を作成

\`{{companyNameEn}}/HANDOFF.md\` に以下を保存：

---

# {{companyName}} HP制作 HANDOFF

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| 企業名 | {{companyName}} |
| 企業名（英語） | {{companyNameEn}} |
| 使用テンプレート | template-standard |
| 作成日 | {{date}} |
| 制作方式 | カンプ版（デザインカンプから実装） |
| カンプフォルダ | {{kanpuFolder}} |

## 🚨 カンプ版 厳守事項

1. **文言の捏造禁止**: カンプに見えない文言を勝手に作らない
2. **プレースホルダー維持**: 「aaaa」「xxxx」等はそのまま実装
3. **デザイン忠実再現**: カンプの見た目を100%再現
4. **虚偽情報禁止**: 推測で情報を追加しない

## 企業基本情報

| 項目 | 内容 |
|------|------|
| 代表者 | （composition.mdから抽出） |
| 設立 | （composition.mdから抽出） |
| 所在地 | （composition.mdから抽出） |
| 電話番号 | （composition.mdから抽出） |
| 事業内容 | （composition.mdから抽出） |

## ブランドカラー

| 項目 | コード | 用途 |
|------|--------|------|
| メインカラー | #XXXXXX | ヘッダー、見出し等 |
| アクセントカラー | #XXXXXX | CTA、ボタン等 |
| サブカラー | #XXXXXX | 背景、装飾等 |
| テキスト（濃） | #333333 | 本文 |
| テキスト（淡） | #666666 | 補足テキスト |

## ヘッダー仕様

| 項目 | PC | SP |
|------|----|----|
| ロゴ位置 | 左 | 左 |
| ナビ構成 | 横並び | ハンバーガー |
| 背景 | 白/透明 | 白 |
| スクロール時 | 固定/変化 | 固定 |

## フッター仕様

| 項目 | 内容 |
|------|------|
| レイアウト | （composition.mdから抽出） |
| 背景色 | #XXXXXX |
| PC | 横並び配置 |
| SP | 縦並び配置 |

## ページ別セクション構成

（composition.mdのPART 2を参照）

## 技術スタック

- Next.js 16.x（App Router）
- React 19.x
- TypeScript 5.x
- Tailwind CSS 4.x
- Framer Motion 12.x

## 開発環境

\`\`\`bash
npm install
npm run dev
\`\`\`

※ WSL2環境では \`npm run dev\` が \`next dev --webpack\` を実行します（Turbopack非対応のため）

## コーディングルール

- **globals.cssの@themeブロック内のブランドカラーのみ変更する**
  - \`--color-navy\` → メインカラーに変更
  - \`--color-navy-dark\` → メインカラー（濃）に変更
  - \`--color-accent\` → アクセントカラーに変更
  - \`--color-accent-dark\` → アクセントカラー（濃）に変更
  - ※変数名は変えない（ユーティリティクラスが参照しているため）
- **それ以外のglobals.cssは編集しない**
- **Tailwind CSSを使用** - スタイルはユーティリティクラスで記述
- **コンポーネント単位で開発** - 各ページ・セクションはコンポーネント化

## 参照ファイル

| ファイル | 用途 |
|---------|------|
| data/composition.md | カンプ分析結果（実装の詳細仕様） |
| data/hearing.json | ヒアリング抽出JSON（あれば） |
| SEO_LLMO_GUIDE.md | SEO・LLMO実装ガイド（最終フェーズで使用） |

## 実装状況

| ページ | 状態 | 備考 |
|--------|------|------|
{{pageStatusTable}}

## 次にやること

1. data/composition.md を読んで全体像を把握
2. TOPページから実装開始
3. **プレースホルダー（aaaa等）はそのまま実装**（後でクライアント確認後に置き換え）
4. 全ページ実装完了後、SEO_LLMO_GUIDE.md に従ってSEO・LLMO対策を実施

### 最終フェーズ: SEO・LLMO対策（必須）

実装完了後、SEO_LLMO_GUIDE.md を参照して以下を実施:

- [ ] robots.txt 作成
- [ ] sitemap.ts 作成
- [ ] 全ページに metadata（title, description）設定
- [ ] JSON-LD 構造化データ設置（業種に応じたスキーマタイプ）
- [ ] 見出し構造の最適化（h1 > h2 > h3）
- [ ] 画像の alt 属性設定
- [ ] 型チェック（npx tsc --noEmit）

---

## 実装完了後: 必要素材リストの出力

実装完了後、HANDOFF.md に以下の「必要素材リスト」セクションを追加してください。

### 必要素材リスト

コード内の全画像参照を抽出し、以下のJSON形式で出力:

\`\`\`json
{
  "company": "{{companyName}}",
  "generatedAt": "{{date}}",
  "totalAssets": 12,
  "assets": [
    {
      "id": 1,
      "fileName": "hero.jpg",
      "destPath": "public/images/",
      "page": "TOP",
      "usage": "ヒーロー背景",
      "currentSrc": "/images/placeholder-hero.jpg",
      "shootingNote": "会社外観 or 作業風景、横長推奨",
      "size": "1920x1080推奨"
    }
  ]
}
\`\`\`

**抽出ルール:**
1. \`public/images/\` 以下の全画像参照を抽出
2. プレースホルダー画像（placeholder-*, sample-* など）を特定
3. 各画像の用途をコードのコメントやコンテキストから推測
4. 撮影指示（shootingNote）を用途から自動生成

---

## 6. 依存関係インストール

\`\`\`bash
cd /mnt/c/client_hp/{{companyNameEn}} && npm install
\`\`\`

## 7. 完了確認

セットアップ完了後、ディレクトリ構造を出力して確認してください。
`;

// ===== 画像分割処理用の指示テンプレート =====
const HP_KANPU_IMAGE_BATCH_TEMPLATE = `# カンプ画像分析（バッチ{{batchNum}}/{{totalBatches}}）

## 対象画像
{{imageList}}

## 分析指示

以下の観点で各画像を分析してください:

### 1. ページ識別
- ページ種類（TOP/About/Service等）
- URLパス推測

### 2. セクション抽出
- 各セクションの名前
- 上から順番に番号付け

### 3. テキスト抽出
- **見える文字をそのまま転記**
- プレースホルダー（aaaa等）も記録

### 4. デザイン要素
- 色コード（推測含む）
- レイアウト構成
- 画像の位置・サイズ

### 5. 注意点
- 不明点・要確認事項
- プレースホルダー箇所のリスト

---

**出力形式**: PART 2の「ページ別詳細設計」の形式で出力してください。
`;

// ===== メニュー追加関数（compositionPrompt.jsから呼び出される） =====
/**
 * カンプ版メニュー項目を追加
 * @param {GoogleAppsScript.Base.Menu} menu - 親メニュー
 */
function hp_addKanpuMenuItems(menu) {
  menu.addSeparator()
    .addItem('🎨 カンプ分析プロンプト生成', 'hp_showKanpuAnalysisDialog')
    .addItem('🖼️ カンプ版 Claude Code指示文', 'hp_showKanpuClaudeCodeDialog');
}

// ===== 1. カンプ分析プロンプト生成ダイアログ =====
function hp_showKanpuAnalysisDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(hp_createKanpuAnalysisDialogHTML(sheetData))
    .setWidth(900)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '🎨 カンプ分析プロンプト生成');
}

/**
 * カンプ分析ダイアログHTML
 */
function hp_createKanpuAnalysisDialogHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  const templateEscaped = HP_KANPU_ANALYSIS_PROMPT_TEMPLATE
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  const batchTemplateEscaped = HP_KANPU_IMAGE_BATCH_TEMPLATE
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .prompt-output {
      width: 100%;
      height: 300px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
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
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .info-box {
      background: #fff3e0;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
      border: 1px solid #ffcc80;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #e65100;
    }
    .warning-box {
      background: #ffebee;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
      border: 1px solid #ef9a9a;
    }
    .warning-box h4 {
      margin: 0 0 8px 0;
      color: #c62828;
    }
    .step-indicator {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .step {
      flex: 1;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 6px;
      text-align: center;
      font-size: 11px;
    }
    .step.active {
      background: #1565C0;
      color: white;
    }
    .step.done {
      background: #4CAF50;
      color: white;
    }
    .batch-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .batch-btn {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 13px;
    }
    .batch-btn:hover {
      border-color: #1565C0;
      background: #E3F2FD;
    }
    .batch-btn.active {
      border-color: #1565C0;
      background: #1565C0;
      color: white;
    }
    .folder-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .folder-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- ステップ表示 -->
  <div class="step-indicator">
    <div class="step active" id="step1">1. 企業・フォルダ指定</div>
    <div class="step" id="step2">2. バッチ選択</div>
    <div class="step" id="step3">3. プロンプト生成</div>
    <div class="step" id="step4">4. Claude Codeへ</div>
  </div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>🎨 カンプ分析プロンプト生成</h4>
    <p style="margin:0;">デザインカンプ画像を分析し、HP実装指示書を生成するためのプロンプトを作成します。</p>
    <p style="margin:8px 0 0 0;">画像が多い場合は分割処理（バッチ）で対応します。</p>
  </div>

  <!-- 厳守事項 -->
  <div class="warning-box">
    <h4>🚨 厳守事項</h4>
    <ul style="margin:0;padding-left:20px;">
      <li>カンプに見えない文言を勝手に作らない</li>
      <li>プレースホルダー（aaaa等）はそのまま維持</li>
      <li>デザインを忠実に再現（改善提案禁止）</li>
      <li>虚偽情報は一切追加しない</li>
    </ul>
  </div>

  <!-- 企業選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- カンプフォルダ入力 -->
  <div class="input-section">
    <span class="input-label">カンプフォルダのパス</span>
    <input
      type="text"
      class="folder-input"
      id="kanpuFolder"
      placeholder="例: C:\\Users\\tench\\Downloads\\信藤建設HPデザイン"
      oninput="checkInputs()"
    >
    <div class="note">※ デザインカンプ画像が保存されているフォルダのパスを入力</div>
  </div>

  <!-- 画像枚数入力 -->
  <div class="input-section">
    <span class="input-label">画像の枚数</span>
    <input
      type="number"
      class="folder-input"
      id="imageCount"
      placeholder="例: 8"
      min="1"
      max="20"
      style="width: 100px;"
      oninput="updateBatchSelector()"
    >
    <div class="note">※ フォルダ内のPNG/JPG画像の枚数</div>
  </div>

  <!-- バッチ選択 -->
  <div class="input-section" id="batchSection" style="display:none;">
    <span class="input-label">処理バッチを選択</span>
    <div class="batch-selector" id="batchSelector"></div>
    <div class="note">※ 画像が多い場合、2-3枚ずつ分割して処理します（コンテキスト容量対策）</div>
  </div>

  <!-- プロンプト出力 -->
  <div class="output-header">
    <span class="input-label" style="margin-bottom:0;">生成されたプロンプト</span>
    <div class="btn-group">
      <button class="btn btn-blue" id="generateBtn" onclick="generatePrompt()" disabled>
        🔄 プロンプト生成
      </button>
      <button class="btn btn-green" id="copyBtn" onclick="copyPrompt()" disabled>
        📋 コピー
      </button>
    </div>
  </div>
  <pre class="prompt-output" id="promptOutput">（企業とフォルダを指定して「プロンプト生成」をクリック）</pre>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    const analysisTemplate = \`${templateEscaped}\`;
    const batchTemplate = \`${batchTemplateEscaped}\`;
    let selectedSheetName = '';
    let selectedCompanyName = '';
    let currentPrompt = '';
    let selectedBatch = 'all';
    const IMAGES_PER_BATCH = 2; // 1バッチあたりの画像数

    window.onload = function() {
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        onSelect: function(item, isActive) {
          selectedSheetName = item.sheetName;
          selectedCompanyName = item.companyName;
          checkInputs();
        }
      });
    };

    function updateStep(step) {
      ['step1', 'step2', 'step3', 'step4'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.className = 'step';
        if (i + 1 < step) el.className = 'step done';
        else if (i + 1 === step) el.className = 'step active';
      });
    }

    function updateBatchSelector() {
      const count = parseInt(document.getElementById('imageCount').value) || 0;
      const batchSection = document.getElementById('batchSection');
      const batchSelector = document.getElementById('batchSelector');

      if (count <= 0) {
        batchSection.style.display = 'none';
        return;
      }

      batchSection.style.display = 'block';
      const totalBatches = Math.ceil(count / IMAGES_PER_BATCH);

      let html = '<button class="batch-btn active" onclick="selectBatch(\\'all\\')">全体分析</button>';

      if (count > IMAGES_PER_BATCH) {
        for (let i = 1; i <= totalBatches; i++) {
          const start = (i - 1) * IMAGES_PER_BATCH + 1;
          const end = Math.min(i * IMAGES_PER_BATCH, count);
          html += '<button class="batch-btn" onclick="selectBatch(' + i + ')">バッチ' + i + '（' + start + '-' + end + '）</button>';
        }
      }

      batchSelector.innerHTML = html;
      selectedBatch = 'all';
      checkInputs();
    }

    function selectBatch(batch) {
      selectedBatch = batch;
      document.querySelectorAll('.batch-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      updateStep(2);
      checkInputs();
    }

    function checkInputs() {
      const hasCompany = !!selectedSheetName;
      const hasFolder = !!document.getElementById('kanpuFolder').value.trim();
      const hasCount = parseInt(document.getElementById('imageCount').value) > 0;

      document.getElementById('generateBtn').disabled = !(hasCompany && hasFolder && hasCount);

      if (hasCompany && hasFolder && hasCount) {
        updateStep(2);
      }
    }

    function generatePrompt() {
      const folder = document.getElementById('kanpuFolder').value.trim();
      const count = parseInt(document.getElementById('imageCount').value);

      if (!selectedCompanyName || !folder || !count) {
        showStatus('必須項目を入力してください', 'error');
        return;
      }

      let prompt = '';

      if (selectedBatch === 'all') {
        // 全体分析用プロンプト
        prompt = analysisTemplate;

        // 画像リストを生成
        let imageList = '';
        for (let i = 1; i <= count; i++) {
          imageList += i + '. ' + i + '.png\\n';
        }

        prompt = '# 対象画像一覧\\n\\n' + imageList + '\\n---\\n\\n' + prompt;
      } else {
        // バッチ処理用プロンプト
        const batchNum = selectedBatch;
        const start = (batchNum - 1) * IMAGES_PER_BATCH + 1;
        const end = Math.min(batchNum * IMAGES_PER_BATCH, count);
        const totalBatches = Math.ceil(count / IMAGES_PER_BATCH);

        let imageList = '';
        for (let i = start; i <= end; i++) {
          imageList += '- ' + i + '.png\\n';
        }

        prompt = batchTemplate
          .replace('{{batchNum}}', batchNum)
          .replace('{{totalBatches}}', totalBatches)
          .replace('{{imageList}}', imageList);
      }

      // 企業名を追加
      prompt = '# ' + selectedCompanyName + ' デザインカンプ分析\\n\\n' +
        '**カンプフォルダ**: ' + folder + '\\n\\n' +
        '---\\n\\n' + prompt;

      currentPrompt = prompt;
      document.getElementById('promptOutput').textContent = prompt;
      document.getElementById('copyBtn').disabled = false;
      updateStep(3);

      const batchInfo = selectedBatch === 'all' ? '全体分析' : 'バッチ' + selectedBatch;
      showStatus('✅ プロンプト生成完了（' + batchInfo + '）', 'success');
    }

    function copyPrompt() {
      if (!currentPrompt) {
        showStatus('先にプロンプトを生成してください', 'error');
        return;
      }
      copyToClipboard(currentPrompt);
      updateStep(4);
      showStatus('✅ コピーしました！Claude Codeに貼り付けて画像を添付してください', 'success');
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
  `;
}

// ===== 2. カンプ版 Claude Code指示文生成ダイアログ =====
function hp_showKanpuClaudeCodeDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(hp_createKanpuClaudeCodeDialogHTML(sheetData))
    .setWidth(900)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '🖼️ カンプ版 Claude Code指示文');
}

/**
 * カンプ版 Claude Code指示文ダイアログHTML
 */
function hp_createKanpuClaudeCodeDialogHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  const templateEscaped = HP_KANPU_CLAUDE_CODE_TEMPLATE
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .prompt-output {
      width: 100%;
      height: 250px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      background: #f8f9fa;
      white-space: pre-wrap;
      overflow: auto;
    }
    .analysis-input {
      width: 100%;
      height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
    }
    .analysis-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .info-box {
      background: #e8f5e9;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
      border: 1px solid #81c784;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #2e7d32;
    }
    .warning-box {
      background: #ffebee;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
      border: 1px solid #ef9a9a;
    }
    .warning-box h4 {
      margin: 0 0 8px 0;
      color: #c62828;
    }
    .folder-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .folder-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>🖼️ カンプ版 Claude Code指示文</h4>
    <p style="margin:0;">カンプ分析結果を元に、Claude Code用のHP実装指示文を生成します。</p>
  </div>

  <!-- 厳守事項 -->
  <div class="warning-box">
    <h4>🚨 厳守事項</h4>
    <ul style="margin:0;padding-left:20px;">
      <li>カンプに見えない文言を勝手に作らない</li>
      <li>プレースホルダー（aaaa等）はそのまま維持</li>
      <li>デザインを忠実に再現（改善提案禁止）</li>
    </ul>
  </div>

  <!-- 起動場所の案内 -->
  <div class="info-box" style="background:#fff3e0; border-color:#ffcc80;">
    <h4 style="color:#e65100;">📍 Claude Code 起動場所</h4>
    <p style="margin:0;"><code style="background:#ffe0b2;padding:2px 6px;border-radius:4px;">client_hp/</code> でClaude Codeを起動してください</p>
    <p style="margin:8px 0 0 0;font-size:12px;color:#555;">※WSL環境の場合: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">/mnt/c/client_hp/</code></p>
  </div>

  <!-- 企業選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- カンプフォルダ入力 -->
  <div class="input-section">
    <span class="input-label">カンプフォルダのパス</span>
    <input
      type="text"
      class="folder-input"
      id="kanpuFolder"
      placeholder="例: C:\\Users\\tench\\Downloads\\信藤建設HPデザイン"
      oninput="checkInputs()"
    >
  </div>

  <!-- カンプ分析結果入力 -->
  <div class="input-section">
    <span class="input-label">カンプ分析結果を貼り付け</span>
    <textarea
      class="analysis-input"
      id="analysisInput"
      placeholder="カンプ分析プロンプトの出力結果をここに貼り付けてください..."
      oninput="checkInputs()"
    ></textarea>
    <div class="note">※ 「カンプ分析プロンプト生成」で得た分析結果を貼り付け</div>
  </div>

  <!-- 指示文出力 -->
  <div class="output-header">
    <span class="input-label" style="margin-bottom:0;">生成された指示文</span>
    <div class="btn-group">
      <button class="btn btn-blue" id="generateBtn" onclick="generateInstruction()" disabled>
        🔄 指示文生成
      </button>
      <button class="btn btn-green" id="copyBtn" onclick="copyInstruction()" disabled>
        📋 コピー
      </button>
    </div>
  </div>
  <pre class="prompt-output" id="promptOutput">（企業を選択し、分析結果を貼り付けて「指示文生成」をクリック）</pre>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    const template = \`${templateEscaped}\`;
    let selectedSheetName = '';
    let selectedCompanyName = '';
    let currentInstruction = '';

    window.onload = function() {
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        onSelect: function(item, isActive) {
          selectedSheetName = item.sheetName;
          selectedCompanyName = item.companyName;
          checkInputs();
        }
      });
    };

    function checkInputs() {
      const hasCompany = !!selectedSheetName;
      const hasFolder = !!document.getElementById('kanpuFolder').value.trim();
      const hasAnalysis = !!document.getElementById('analysisInput').value.trim();

      document.getElementById('generateBtn').disabled = !(hasCompany && hasFolder && hasAnalysis);
    }

    // 企業名を英語表記に変換（簡易版）
    function toEnglishName(name) {
      if (/^[a-zA-Z0-9\\-_\\s]+$/.test(name)) {
        return name.toLowerCase().replace(/\\s+/g, '-');
      }
      return '{{' + name + 'の英語表記を入力}}';
    }

    function generateInstruction() {
      const folder = document.getElementById('kanpuFolder').value.trim();
      const analysis = document.getElementById('analysisInput').value.trim();

      if (!selectedCompanyName || !folder || !analysis) {
        showStatus('必須項目を入力してください', 'error');
        return;
      }

      // 今日の日付
      const today = new Date();
      const dateStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      const companyNameEn = toEnglishName(selectedCompanyName);

      // ページステータステーブルを生成（分析結果から抽出を試みる）
      let pageStatusTable = '| TOP | 未着手 | |\\n| About | 未着手 | |\\n| その他 | 未着手 | （分析結果から追加） |';

      currentInstruction = template
        .replace(/{{companyName}}/g, selectedCompanyName)
        .replace(/{{companyNameEn}}/g, companyNameEn)
        .replace(/{{kanpuFolder}}/g, folder)
        .replace(/{{date}}/g, dateStr)
        .replace('{{kanpuAnalysis}}', analysis)
        .replace('{{pageStatusTable}}', pageStatusTable);

      document.getElementById('promptOutput').textContent = currentInstruction;
      document.getElementById('copyBtn').disabled = false;

      showStatus('✅ 指示文生成完了', 'success');
    }

    function copyInstruction() {
      if (!currentInstruction) {
        showStatus('先に指示文を生成してください', 'error');
        return;
      }
      copyToClipboard(currentInstruction);
      showStatus('✅ コピーしました！Claude Codeに貼り付けてください', 'success');
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
  `;
}
