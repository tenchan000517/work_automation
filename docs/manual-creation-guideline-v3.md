# マニュアル作成ガイドライン V3

作成日: 2026-01-13
目的: 新商材のスプレッドシート・GAS・マニュアルを作成するための完全ガイド

---

## はじめに

このガイドラインは、新しい商材を追加する際に「何を」「どのように」作るかを説明します。
ツナゲルをリファレンスとして、残り8商材（バツグン、HP、LP、SNS、PV、パンフ、ロゴ、月刊Sing）を作成する際の指針です。

**このガイドラインを読めば:**
- スプレッドシート（設定、プロンプト、ヒアリングシート）を作成できる
- GAS（ダイアログ、メニュー、自動化機能）を作成できる
- マニュアル/フロー（Next.jsサイト）を作成できる

---

## 1. 設計思想

### 1.1 スプレッドシート中心の設計

**本体はスプレッドシート+GAS。Next.jsサイトは補助（閲覧用ビュー）。**

```
スプレッドシート + GAS     →    担当者が直接メンテナンス可能
       ↓
Next.jsサイト              →    閲覧・参照用（読み取り専用）
```

**理由:**
- 担当者がコード変更なしでメンテナンスできる
- プロンプトや設定の変更がすぐに反映される
- Googleスプレッドシートは社内で馴染みがある

### 1.2 GASの2つの機能

| 種類 | 説明 | 例 |
|------|------|-----|
| **AIプロンプト生成** | データ+プロンプト → AIに貼り付け → AI出力を使う | 議事録作成、構成案作成 |
| **フォーマット生成** | データ+テンプレート → そのまま使える定型文 | 受注連絡、日程確定報告、撮影指示 |

**違いのポイント:**
- AIプロンプト生成: 出力をAI（ChatGPT、Gemini等）に貼り付けて使う
- フォーマット生成: 出力をそのままワークス等に貼り付けて使う

### 1.3 入力データの永続化

ダイアログで入力したデータは一時的ではなく、スプレッドシートに保存して再利用する。

```
1. ダイアログで入力 → 企業シートのPart③に保存
2. 次回ダイアログを開く → Part③から読み込み → フィールドに自動入力
3. 後続フローでも同じデータを参照可能
```

**メリット:**
- 途中で中断しても続きから再開できる
- 別のダイアログでも同じデータを参照できる
- データの一元管理（企業シートに全て集約）

### 1.4 商材固有 vs 共通の切り分け

```
src/lib/data/
├── common/              # 複数商材で共通して使うもの
│   ├── manuals/         #   共通マニュアル（NOTTA、GAS認証、ワークスリアクション）
│   └── templates/       #   共通テンプレート（受注連絡、日程確定報告等）
│
├── tsunageru.ts         # 商材固有のデータ
├── batsugun.ts
├── hp.ts
└── ...
```

**共通化の判断基準:**
- 2商材以上で同じ内容を使う → `common/` に切り出す
- 1商材でしか使わない → 商材ファイル内に記述

---

## 2. 共通概念

### 2.1 基本セット構成

どの商材も以下のシート構成を持つ:

```
スプレッドシート
├── プロンプト           # AIプロンプトの管理
├── 設定                 # 担当者・フォルダ設定等
├── 企業情報一覧         # 全企業の一覧管理（ドロップダウン用）
├── ヒアリングシート     # テンプレート（原本）
├── フォームの回答1      # Googleフォーム連携時
└── 各企業シート         # 企業ごとに作成（株式会社○○等）
```

### 2.2 各シートの役割

| シート | 役割 | 編集者 |
|--------|------|--------|
| プロンプト | AIプロンプトを管理。GASダイアログから読み込む | 管理者 |
| 設定 | 担当者一覧、業務担当者、フォルダ設定、保存キーマッピング | 管理者 |
| 企業情報一覧 | 全企業の基本情報。ドロップダウンの選択肢として使用 | 担当者 |
| ヒアリングシート | 企業シートのテンプレート。これをコピーして企業シートを作成 | 管理者 |
| 企業シート | 企業ごとのデータ。Part①②③で構成 | 担当者 |

### 2.3 企業シートの構成（Part①②③）

```
企業シート（株式会社○○）
│
├── 1行目: 企業名（タイトル）
├── 2行目: ステータスヘッダー（B〜G列）
├── 3行目: ステータス入力欄（B〜G列）
│   └── 現在タスク / タスク保持者 / 状態 / 期限 / 最終更新日 / 全体ステータス
│
├── 更新ログ（I〜N列）
│   └── 日時 / タスク変更 / 保持者変更 / 状態 / メモ / 工数
│
├── Part① 基本情報（4行目〜、フォーム回答から自動転記）
│   └── 企業名、担当者名、業種、所在地、従業員数など
│
├── Part② ヒアリング情報（打ち合わせ時に記入）
│   ├── 会社紹介（私たちについて、社長挨拶、会社の魅力）
│   ├── 社員の声（最低2名）
│   ├── 募集情報
│   └── 撮影準備（撮影場所、駐車場、当日担当者等）
│
└── Part③ 処理データ（システム管理）★GASが自動保存
    ├── 撮影素材フォルダURL
    ├── メインフォルダURL
    ├── 文字起こし原文
    ├── 議事録
    ├── 構成案
    └── その他処理済みデータ
```

### 2.4 ステータス欄の構成（6項目）

各企業シートの2-3行目にステータス情報を管理。進捗管理に使用。

| 列 | ヘッダー | 入力 | 選択肢 |
|----|----------|------|--------|
| B | 現在タスク | ドロップダウン | 0.受注〜14.月次FB（15段階） |
| C | タスク保持者 | ドロップダウン | 担当者一覧 |
| D | 状態 | ドロップダウン | 対応中 / 先方確認 / 次の担当へ |
| E | 期限 | 日付 | - |
| F | 最終更新日 | 自動 | ダイアログ更新時に自動記録 |
| G | 全体ステータス | ドロップダウン | 制作中 / 運用中 / 完了 |

**更新ログ（I〜N列）:**
「ステータス更新」ダイアログで更新するたびに、ログが下に追記される。
- 日時、タスク変更（番号のみ）、保持者変更、状態、メモ、工数（前回からの経過時間）

### 2.5 設定シートの構成

```
設定シート
├── A-B列: メンバー一覧（ドロップダウン用）
├── D-F列: 業務担当者（タスクNo→担当者のマッピング）
├── H-I列: フォルダ設定（親フォルダID等）
├── K列: 企業情報項目（企業情報一覧のカラム定義）
├── M-N列: 保存キーマッピング（プロンプト名→Part③保存先）
└── P-Q列: Part③構成（ラベル名、行数）
```

### 2.6 プロンプトシートの構成

```
プロンプトシート
├── A列: プロンプト名（メニューに表示）
├── B列: カテゴリ（グループ分け用）
├── C列: 説明
├── D列: 入力欄ラベル
├── E列: プレースホルダー
└── F列: テンプレート（{{input}}が入力値に置換）
```

---

## 3. ルール

### 3.1 ナンバリング規則

**業務No（Task.no）は配列順と一致させる連番**

```typescript
// 正しい
tasks: [
  { no: "0", ... },  // 配列[0]
  { no: "1", ... },  // 配列[1]
  { no: "2", ... },  // 配列[2]
]

// 間違い
tasks: [
  { no: "0-1", ... },   // 枝番NG
  { no: "1", ... },
  { no: "-", ... },     // 欠番NG
]
```

### 3.2 命名規則

#### ファイル名

| 対象 | 規則 | 例 |
|------|------|-----|
| 商材データ | `{商材ID}.ts` | `tsunageru.ts`, `hp.ts` |
| マニュアルmd | `{No}-{業務名}.md` | `00-受注・ワークス立ち上げ.md` |
| GASファイル | `{機能名}.js`（キャメルケース） | `hearingSheetManager.js` |
| 共通テンプレート | `{機能名}.ts`（ケバブケース） | `order-notification.ts` |

#### 関数名

| 対象 | 規則 | 例 |
|------|------|-----|
| メニュー追加 | `addXxxMenu(ui)` | `addCompanyInfoMenu(ui)` |
| ダイアログ表示 | `showXxxDialog()` | `showOrderReportDialog()` |
| HTML生成 | `createXxxHTML()` | `createOrderReportHTML()` |
| データ取得 | `getXxxFromSheet()` | `getCompanyListFromSheet()` |
| データ保存 | `saveXxxToSheet()` | `saveTranscriptToSheet()` |

#### シート名

| シート | 命名 |
|--------|------|
| システムシート | 「プロンプト」「設定」「企業情報一覧」「ヒアリングシート」 |
| フォーム回答 | 「フォームの回答 1」または「フォームの回答1」 |
| 企業シート | 正式企業名をそのまま使用（例: 「株式会社テスト」） |

### 3.3 UI統一ルール

#### ダイアログサイズ

| 項目 | 値 |
|------|-----|
| 横幅 | **700px**（固定） |
| 高さ | **750px**（基本値） |

```javascript
const html = HtmlService.createHtmlOutput(createDialogHTML())
  .setWidth(700)
  .setHeight(750);
```

#### 共通スタイル

全てのダイアログで `commonStyles.js` の `CI_DIALOG_STYLES` と `CI_UI_COMPONENTS` を使用する。

```javascript
return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
</head>
<body>
  ...
  ${CI_UI_COMPONENTS}
</body>
</html>
`;
```

#### コンポーネント

| コンポーネント | 用途 | 参照 |
|---------------|------|------|
| コンパクトドロップダウン | 担当者・宛先・CC選択（複数選択可） | V2 3.3節 |
| 企業選択ドロップダウン | 企業選択（アクティブバッジ付き） | V2 3.4節 |
| テンプレート表示 | アコーディオン形式 | V2 3.5節 |
| プレビューセクション | 生成結果表示 | V2 3.6節 |

### 3.4 画像ルール

**画像は必ずキャプション付き**

```typescript
// 正しい（新形式）
images: [
  { url: "/images/xxx.png", caption: "STEP 1: 説明" },
  { url: "/images/yyy.png", caption: "STEP 2: 説明" }
]

// 間違い（旧形式）
images: ["/images/xxx.png", "/images/yyy.png"]
```

**キャプションの命名規則:**
- 手順の場合: `STEP X: 動作を説明`
- 補足の場合: `【補足】説明`
- 初回のみの場合: `【初回のみ】説明`

### 3.5 表現ルール（非エンジニア向け）

**「GAS」という表現は使わない**

担当者は非エンジニアなので、専門用語を避けてわかりやすく記載する。

```
// NG
summary: "GASでステータスを更新"
description: "GASのメニューから〜"

// OK
summary: "ヒアリングシートのメニューからステータスを更新"
description: "ヒアリングシートのメニューから〜"
```

**「メニュー」だけでは不十分、必ず「ヒアリングシートの」を付ける**

どのメニューか明示しないと、担当者が迷う。

```
// NG
summary: "メニューからステータスを更新"
description: "任意のメニューから「✏️ ステータス更新」を選択"

// OK
summary: "ヒアリングシートのメニューからステータスを更新"
description: "ヒアリングシートの任意のメニューから「✏️ ステータス更新」を選択"
```

### 3.6 ステータス更新ステップの追加

**各業務のflowStepsの最後に「ステータス更新」ステップを追加する**

業務完了後、次の担当者へ引き継ぐためにステータスを更新する。

```typescript
flowSteps: [
  { label: "ステップ1", summary: "〇〇を実行" },
  { label: "ステップ2", summary: "△△を確認" },
  // ... 業務固有のステップ
  {
    label: "ステータス更新",
    summary: "ヒアリングシートのメニューからステータスを更新",
    links: [
      { label: "ヒアリングシート", type: "link", url: "https://docs.google.com/spreadsheets/d/xxx" }
    ],
    description: `業務完了後、ヒアリングシートのステータス更新ダイアログでステータスを更新します。

━━━━━━━━━━━━━━━━━━━━
■ 手順
━━━━━━━━━━━━━━━━━━━━

1. ヒアリングシートを開く
2. ヒアリングシートの任意のメニューから「✏️ ステータス更新」を選択
3. 現在タスクを次の業務に変更
4. タスク保持者を次の担当者に変更
5. 状態を「次の担当へ」に変更
6. メモに必要な申し送り事項を入力
7. 「更新」をクリック`,
  },
],
```

**ポイント:**
- summaryは「ヒアリングシートのメニューからステータスを更新」で統一
- linksにヒアリングシートへのリンクボタンを必ず追加
- descriptionで具体的な手順を記載

### 3.7 担当者ハードコード禁止

**descriptionやtemplateに担当者名を直接書かない**

```typescript
// NG
description: `@河合 cc:@青柳
株式会社○○様の初回打ち合わせについて...`

// OK（入力フィールドで担当者を選択）
inputFields: [
  { id: "mention", label: "宛先", defaultValue: "@河合 cc:@青柳" },
  { id: "company", label: "企業名", placeholder: "株式会社○○" }
],
template: `{{mention}}
{{company}}様の初回打ち合わせについて...`
```

---

## 4. 作り方

### 4.1 スプレッドシートの作り方

#### Step 1: スプレッドシートを作成

1. Googleドライブで新規スプレッドシートを作成
2. スプレッドシート名を「{商材名}ヒアリングシート」に変更

#### Step 2: GASを追加

1. 拡張機能 → Apps Script
2. 必要なGASファイルをコピー（後述の4.2参照）

#### Step 3: 初期設定を実行

1. GASメニュー「0.設定」→「📋 設定シートを作成」
2. GASメニュー「0.設定」→「📝 プロンプトシートを作成」
3. GASメニュー「0.設定」→「📊 企業情報一覧を作成」

#### Step 4: 設定シートを編集

設定シートで以下を設定:
- A-B列: メンバー一覧（担当者の名前を入力）
- D-F列: 業務担当者（タスクNoと担当者のマッピング）
- H-I列: フォルダ設定（親フォルダIDを設定）

#### Step 5: プロンプトシートを編集

必要なプロンプトを追加:
- プロンプト名（メニューに表示される）
- カテゴリ（グループ分け用）
- テンプレート（`{{input}}`が入力値に置換）

#### Step 6: ヒアリングシートテンプレートを作成

1. GASメニュー「2.ヒアリングシート」→「🎨 テンプレート初期設定」
2. Part①②③のセクションが作成される

---

### 4.2 GASの作り方

#### ファイル構成

```
docs/gas/{商材名}/
├── commonStyles.js           # 共通スタイル定義（★必須）
├── settingsSheet.js          # 設定シート管理（★必須）
├── hearingSheetManager.js    # ヒアリングシート管理（★必須）
├── progressManager.js        # 進捗管理（★必須）
├── companyInfoManager.js     # 企業情報入力
├── promptDialog.js           # プロンプトダイアログ
├── contactFormats.js         # 連絡フォーマット
└── {その他商材固有の機能}.js
```

**progressManager.js の機能:**
- ステータス欄の作成・管理（2-3行目）
- 進捗一覧シートの作成・更新
- ステータス更新ダイアログ（全メニューから呼び出し可能）
- 更新ログの記録（I〜N列）

#### 共通スタイル（commonStyles.js）

**commonStyles.js** は全ダイアログで使用する共通スタイル・UIコンポーネントを提供。

**提供される機能:**

| 変数 | 提供内容 |
|------|---------|
| `CI_DIALOG_STYLES` | CSS: ベーススタイル、フォーム要素、ボタン、アコーディオン、ドロップダウン、プレビュー等 |
| `CI_UI_COMPONENTS` | JavaScript: copyToClipboard(), showCopySuccess(), toggleAccordion(), escapeHtml(), 企業選択ドロップダウン関数 |

**使い方:**
```javascript
return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}</head>
<body>
  ...
  ${CI_UI_COMPONENTS}
</body>
</html>
`;
```

**利用可能なCSSクラス:**
- `.btn`, `.btn-blue`, `.btn-green`, `.btn-gray` - ボタン
- `.form-group`, `.form-row` - フォーム
- `.accordion`, `.accordion-header`, `.accordion-content` - アコーディオン
- `.multi-select-wrapper`, `.multi-select-display`, `.multi-select-dropdown` - 担当者選択
- `.company-select-wrapper`, `.company-select-display`, `.company-select-dropdown` - 企業選択
- `.preview-section`, `.preview-content` - プレビュー
- `.copy-success` - コピー成功トースト

**詳細なHTML/CSS/JavaScript例は `docs/manual-creation-guideline-v2.md` のセクション3を参照。**

---

#### 新規ダイアログの作り方

**Step 1: 関数を作成**

```javascript
// メニューから呼び出される関数
function showXxxDialog() {
  // 1. データ取得
  const members = getMemberList();
  const companies = getCompanyListFromSheet();

  // 2. HTML生成
  const html = HtmlService.createHtmlOutput(createXxxHTML(members, companies))
    .setWidth(700)
    .setHeight(750);

  // 3. ダイアログ表示
  SpreadsheetApp.getUi().showModalDialog(html, 'ダイアログタイトル');
}
```

**Step 2: HTML生成関数を作成**

```javascript
function createXxxHTML(members, companies) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${CI_DIALOG_STYLES}
</head>
<body>
  <div class="container">
    <h2>タイトル</h2>

    <!-- 担当者選択（コンパクトドロップダウン） -->
    <div class="form-group">
      <label>宛先</label>
      <div class="multi-select-wrapper">
        <div class="multi-select-display" id="mentionDisplay" onclick="toggleDropdown('mention')">
          <span class="placeholder">選択してください</span>
        </div>
        <div class="multi-select-dropdown" id="mentionDropdown"></div>
      </div>
    </div>

    <!-- 企業選択 -->
    <div class="form-group">
      <label>企業名</label>
      <div class="company-select-wrapper" id="companySelectWrapper">
        <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
          <span class="placeholder">企業を選択してください</span>
        </div>
        <div class="company-select-dropdown" id="companySelectDropdown"></div>
      </div>
    </div>

    <!-- プレビュー -->
    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">プレビュー</span>
        <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" style="display:none;">コピー</button>
      </div>
      <div class="preview-content" id="previewContent">
        <span class="preview-placeholder">企業名を選択するとプレビューが表示されます</span>
      </div>
    </div>

    <!-- フッター -->
    <div class="footer">
      <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    </div>
  </div>

  <!-- コピー成功メッセージ -->
  <div class="copy-success" id="copySuccess">コピーしました！</div>

  ${CI_UI_COMPONENTS}

  <script>
    // 初期化データ
    const members = ${JSON.stringify(members)};
    const companies = ${JSON.stringify(companies)};

    // 初期化
    document.addEventListener('DOMContentLoaded', function() {
      initDropdowns();
      initCompanyDropdown();
    });

    // ここにダイアログ固有のJavaScriptを追加
  </script>
</body>
</html>
`;
}
```

**Step 3: メニューに追加**

```javascript
// xxxManager.js
function addXxxMenu(ui) {
  ui.createMenu('📋 メニュー名')
    .addItem('📝 機能名', 'showXxxDialog')
    .addSeparator()
    .addItem('📄 別の機能', 'showYyyDialog')
    .addToUi();
}
```

**Step 4: onOpenに登録**

```javascript
// hearingSheetManager.js（onOpenがあるファイル）
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  addSettingsMenu(ui);      // 0.設定
  addCompanyInfoMenu(ui);   // 1.企業情報入力
  addHearingMenu(ui);       // 2.ヒアリングシート
  addXxxMenu(ui);           // ★追加
  addContactFormatsMenu(ui); // 連絡フォーマット
}
```

#### 保存機能の追加

Part③への保存機能を追加する場合:

**Step 1: Part③に保存セルを追加（hearingSheetManager.js）**

```javascript
// setupTemplate()関数内
row = createSectionHeader(sheet, row, 'Part③ 処理データ（システム管理）');
row = createDataStorageRow(sheet, row, '撮影素材フォルダURL');
row = createDataStorageRow(sheet, row, 'メインフォルダURL');
row = createDataStorageRowLarge(sheet, row, '文字起こし原文', 5);
row = createDataStorageRowLarge(sheet, row, '議事録', 8);
row = createDataStorageRowLarge(sheet, row, '新しい項目', 5);  // ★追加
```

**Step 2: 設定シートにマッピングを追加**

設定シートのM-N列に追加:

| M列（プロンプト名） | N列（保存キー） |
|-------------------|----------------|
| 議事録作成 | 文字起こし原文 |
| 新しいプロンプト | 新しい項目 |

---

### 4.3 マニュアルの作り方

#### Step 1: 商材データファイルを作成

```typescript
// src/lib/data/{商材ID}.ts
import type { Product } from "./index";
import {
  // 共通テンプレートをインポート
  createOrderNotificationTemplate,
  FB_REPORT_TEMPLATE,
  SHOOTING_CHECKLIST,
} from "./common";

export const xxx: Product = {
  id: "xxx",
  name: "商材名",
  taskCount: 5,
  description: "商材の説明",
  hasOverallFlow: true,  // 全体フローがある場合
  tasks: [
    {
      no: "0",
      category: "フェーズ名",
      name: "業務名",
      assignee: "担当者",
      nextAssignee: "次の担当者",
      tools: "使用ツール",
      deliverable: "成果物",
      checkpoint: "チェックポイント",
      hasManual: true,
      issues: "課題",
      simulation: `業務の流れ`,
      flowSteps: [
        { label: "ステップ1" },
        { label: "ステップ2" },
      ],
    },
    // ... 他のタスク
  ],
  issues: ["課題1", "課題2"],
};
```

#### Step 2: index.tsにエクスポートを追加

```typescript
// src/lib/data/index.ts
import { xxx } from "./xxx";

export const products: Product[] = [
  tsunageru,
  batsugun,
  hp,
  xxx,  // ★追加
  // ...
];
```

#### Step 3: マニュアルmdファイルを作成

```markdown
<!-- docs/manuals/{商材ID}/{No}-{業務名}.md -->
# 業務名マニュアル

## 概要

この業務の目的と概要を記載。

## 手順

### Step 1: 〇〇を実行

具体的な手順を記載。

### Step 2: △△を確認

確認ポイントを記載。

## 注意点

- 注意点1
- 注意点2

## 関連リンク

- [スプレッドシート](https://docs.google.com/spreadsheets/d/xxx)
```

#### Step 4: flowStepsを詳細化

```typescript
flowSteps: [
  {
    label: "ステップ名",
    description: `詳細説明

━━━━━━━━━━━━━━━━━━━━
■ 手順
━━━━━━━━━━━━━━━━━━━━

【STEP 1】〇〇を実行
説明...

【STEP 2】△△を確認
説明...`,
    images: [
      { url: "/images/step1.png", caption: "STEP 1: 〇〇を実行" },
      { url: "/images/step2.png", caption: "STEP 2: △△を確認" },
    ],
    links: [
      { label: "スプレッドシート", type: "link", url: "https://..." },
      createOrderNotificationTemplate("商材名", "12ヶ月"),
    ],
  },
]
```

#### flowStepsの詳細度基準

| 詳細度 | 使用場面 | 内容 |
|--------|---------|------|
| 最小 | 定型作業、担当者が慣れている | `{ label: "ステップ名" }` のみ |
| 標準 | 通常の業務 | label + description + links |
| 詳細 | 初めて行う作業、ミスが発生しやすい | label + description + images + links |

---

## 5. リファレンス

### 5.1 ツナゲルの構成

ツナゲルは14業務（No.0〜14）で構成。新商材作成時の参考として使用。

```
docs/gas/tsunageru/
├── commonStyles.js           # 共通スタイル定義
├── settingsSheet.js          # 0.設定シート管理
├── hearingSheetManager.js    # 2.ヒアリングシート（onOpen含む）
├── companyInfoManager.js     # 1.企業情報入力
├── promptDialog.js           # 3.議事録作成
├── compositionDraftGenerator.js # 4.構成案作成
├── contactFormats.js         # 連絡フォーマット
└── sheetStructureChecker.js  # メンテナンス用

docs/manuals/tsunageru/
├── 00-受注・ワークス立ち上げ.md
├── 01-初回打ち合わせ日程調整.md
├── ...
└── 14-月次FB打合せ.md

docs/flows/tsunageru/
├── overall-flow.md           # 全体フロー
├── feedback-flow.md          # FBフロー
└── monthly-fb-flow.md        # 月次FBフロー

docs/guidelines/tsunageru/
└── job-posting-guideline.md  # 求人原稿ガイドライン
```

### 5.2 共通テンプレート一覧

```
src/lib/data/common/templates/
├── order-notification.ts     # 受注連絡（商材名を引数で渡す）
├── schedule-confirm.ts       # 日程確定報告
├── reminder.ts               # リマインド
├── shooting-request.ts       # 撮影日程確認
├── shooting-instruction.ts   # 撮影指示
├── minutes-share.ts          # 議事録共有
├── fb-report.ts              # FB報告テンプレート（3商材共通）
└── shooting-checklist.ts     # 撮影時チェックリスト（2商材共通）
```

**使い方:**
```typescript
import {
  createOrderNotificationTemplate,
  FB_REPORT_TEMPLATE,
  SHOOTING_CHECKLIST,
} from "./common";

// 関数として使う
links: [createOrderNotificationTemplate("ツナゲル", "12ヶ月")]

// 定数として使う
format: FB_REPORT_TEMPLATE,
```

### 5.3 共通マニュアル一覧

```
src/lib/data/common/manuals/
├── gas-auth.ts               # GAS認証フロー説明
├── notta.ts                  # NOTTA使い方（起動・終了・準備確認）
└── works-reaction.ts         # ワークスリアクションルール

docs/manuals/common/
└── notta.md                  # NOTTAマニュアル（md版）
```

### 5.4 V2ガイドラインの参照

UI仕様の詳細は `docs/manual-creation-guideline-v2.md` を参照:

- 3.3節: 担当者選択コンポーネント（コンパクトドロップダウン）
- 3.4節: 企業選択コンポーネント
- 3.5節: テンプレート表示（アコーディオン）
- 3.6節: プレビューセクション
- 3.7節: コピーボタンの表示/非表示
- 3.9節: 貼り付けUIコンポーネント

---

## 6. チェックリスト

### 6.1 新商材追加時

#### スプレッドシート
- [ ] スプレッドシートを作成
- [ ] GASファイルをコピー
- [ ] 設定シートを作成・編集
- [ ] プロンプトシートを作成・編集
- [ ] 企業情報一覧を作成
- [ ] ヒアリングシートテンプレートを作成

#### GAS
- [ ] commonStyles.jsをコピー
- [ ] 必要なGASファイルをコピー・編集
- [ ] onOpenにメニュー追加
- [ ] ダイアログの動作確認

#### マニュアル（Next.js）
- [ ] `src/lib/data/{商材ID}.ts` を作成
- [ ] `src/lib/data/index.ts` にエクスポート追加
- [ ] 全業務のflowStepsを設定
- [ ] 必要に応じてmdファイルを作成
- [ ] `npm run dev` で表示確認

### 6.2 品質チェック

- [ ] Noは配列順の連番か
- [ ] 画像は全てキャプション付きか
- [ ] 担当者名がハードコードされていないか
- [ ] 共通化できるものは `common/` に切り出したか
- [ ] ダイアログサイズは700x750か
- [ ] commonStyles.jsを使用しているか
- [ ] 各業務のflowSteps最後に「ステータス更新」ステップがあるか
- [ ] 「GAS」という表現を使っていないか
- [ ] 「メニュー」ではなく「ヒアリングシートのメニュー」と記載しているか

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-14 | 表現ルール追加（GAS禁止、ヒアリングシートの明記）、ステータス更新ステップ追加 |
| 2026-01-13 | V3 初版作成 |
