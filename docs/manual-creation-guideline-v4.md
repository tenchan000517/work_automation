# マニュアル作成ガイドライン V4

作成日: 2026-02-02
目的: 新商材のスプレッドシート・GAS・マニュアルを再現性を持って作成するための完全ガイド

---

## はじめに

このガイドラインは、新しい商材を追加する際に「何を」「どのように」作るかを説明します。
ツナゲル・HP制作をリファレンスとして、残りの商材（バツグン、LP、SNS、PV、パンフ、ロゴ、月刊Sing）を作成する際の指針です。

**このガイドラインを読めば:**
- スプレッドシート（設定、プロンプト、ヒアリングシート）を作成できる
- GAS（ダイアログ、メニュー、自動化機能）を作成できる
- マニュアル/フロー（Next.jsサイト）を作成できる
- **共通マニュアルを作成・管理できる**（V4で追加）
- **全体マニュアルを設計・作成できる**（V4で追加）
- **マニュアルを検証・完成させるフローがわかる**（V4で追加）

**V3からの変更点:**
- 第5章: GAS共通概念（新規）
- 第6章: マニュアル作成フロー（新規）
- 第7章: 全体マニュアル設計（新規）
- 第8章: 共通マニュアル管理（新規）
- 第9章: マニュアル検証フロー（新規）
- 第10章: リファレンス（V3の5章を拡張）
- 第11章: チェックリスト（V3の6章を拡張）

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
1. ダイアログで入力 → 企業シートのPart③/④に保存
2. 次回ダイアログを開く → Part③/④から読み込み → フィールドに自動入力
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

docs/manuals/
├── common/              # 共通マニュアル（Markdown）★V4で追加
│   ├── gas-auth.md
│   ├── notta.md
│   ├── transcript.md
│   └── ...
├── tsunageru/           # 商材固有マニュアル
├── hp/
└── ...
```

**共通化の判断基準:**
- 2商材以上で同じ内容を使う → `common/` に切り出す
- 1商材でしか使わない → 商材ファイル内に記述
- **商材固有プロンプト（構成案プロンプト、Claude Code指示文等）は共通化しない**

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
| 企業シート | 企業ごとのデータ。Part①②③④で構成 | 担当者 |

### 2.3 企業シートの構成（Part①②③④）

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
├── Part③ サーバー情報等（フォームから転記 + 補足）★商材により異なる
│
└── Part④ 処理データ（システム管理）★GASが自動保存
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
├── M-N列: 保存キーマッピング（プロンプト名→Part④保存先）
└── P-Q列: Part③/④構成（ラベル名、行数）
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
| メニュー追加 | `{prefix}_addXxxMenu(ui)` | `hp_addCompanyInfoMenu(ui)` |
| ダイアログ表示 | `{prefix}_showXxxDialog()` | `hp_showOrderReportDialog()` |
| HTML生成 | `{prefix}_createXxxHTML()` | `hp_createOrderReportHTML()` |
| データ取得 | `{prefix}_getXxxFromSheet()` | `hp_getCompanyListFromSheet()` |
| データ保存 | `{prefix}_saveXxxToSheet()` | `hp_saveTranscriptToSheet()` |

**プレフィックス:**
- HP制作: `hp_`
- ツナゲル: `tsunageru_`（または省略）

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
| 高さ | **600〜750px**（基本値） |

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
3. **Drive APIサービスを追加**（フォルダ作成機能を使う場合）
   - Apps Scriptエディタ → 左メニュー「サービス」→「+」→「Drive API」を追加

#### Step 3: 初期設定を実行

1. GASメニュー「⚙️ 設定」→「📋 設定シートを作成」
2. GASメニュー「⚙️ 設定」→「📝 プロンプトシートを作成」
3. GASメニュー「⚙️ 設定」→「📊 企業情報一覧を作成」

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

1. GASメニュー「1.📋 {商材名}」→「🎨 テンプレート初期設定」
2. Part①②③④のセクションが作成される

---

### 4.2 GASの作り方

#### ファイル構成

```
docs/gas/{商材名}/
├── commonStyles.js           # 共通スタイル定義（★必須）
├── settingsSheet.js          # 設定シート管理（★必須）
├── hearingSheetManager.js    # ヒアリングシート管理（★必須）
├── progressManager.js        # 進捗管理（★必須）
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

  addSettingsMenu(ui);      // ⚙️ 設定
  addCompanyInfoMenu(ui);   // 1.📋 {商材名}
  addHearingMenu(ui);       // 2.📝 ヒアリング反映
  addXxxMenu(ui);           // ★追加
  addProgressMenu(ui);      // 📊 進捗管理
}
```

#### 保存機能の追加

Part④への保存機能を追加する場合:

**Step 1: Part④に保存セルを追加（hearingSheetManager.js）**

```javascript
// setupTemplate()関数内
row = createSectionHeader(sheet, row, 'Part④ 処理データ（システム管理）');
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
  hasOverallManual: true, // 全体マニュアルがある場合 ★V4で追加
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

## 5. GAS共通概念

### 5.1 GAS全体構成

HP制作・ツナゲルのGASはそれぞれ約10ファイルで構成される。

#### HP制作GAS構成（10ファイル）

| ファイル | 役割 |
|---------|------|
| `hearingSheetManager.js` | **メインハブ** - onOpen、シート作成、フォーム転記、企業フォルダ作成 |
| `commonStyles.js` | 全ダイアログ共通UIスタイル・コンポーネント |
| `settingsSheet.js` | メンバー一覧・フォルダ設定・プロンプトシート管理 |
| `progressManager.js` | ステータス欄管理（2-3行目）、進捗一覧、更新ログ |
| `formCreator.js` | Googleフォーム自動作成 |
| `jsonOutputDialog.js` | JSON出力 |
| `compositionPrompt.js` | 構成案プロンプト + Claude Code指示文 |
| `createFolder.js` | ページフォルダ追加、選択ページをPart④に保存 |
| `promptDialog.js` | プロンプトシートからテンプレート読み込み・ダイアログ表示 |
| `transcriptToHearingSheet.js` | 文字起こし→Part②自動転記 |

#### GAS依存関係

```
hearingSheetManager.js（メインハブ）
├─ commonStyles.js（全ダイアログで使用）
├─ jsonOutputDialog.js（JSON出力）
├─ compositionPrompt.js（構成案・Claude Code指示文生成）
├─ createFolder.js（ページフォルダ追加）
├─ promptDialog.js（プロンプト実行）
│  └─ transcriptToHearingSheet.js（文字起こし転記）
├─ settingsSheet.js（メンバー・フォルダ設定）
├─ progressManager.js（進捗管理）
└─ formCreator.js（フォーム作成・管理）
```

### 5.2 共通パターン

#### 認証・アクセス

- DriveApp.getFolderById() - Google Apps Script標準権限
- **Drive APIサービス追加が必須**（フォルダ作成機能を使う場合）

#### エラーハンドリング

```javascript
// 戻り値形式
{ success: true, data: {...} }
{ success: false, error: "エラーメッセージ" }

// UI表示
showStatus(message, isError);  // トースト通知（2秒自動消滅）
```

#### UI表示パターン

```
ドロップダウン選択 → データ取得 → プレビュー → コピー/保存ボタン
```

#### 保存・ロード

```javascript
// Part④から読み込み
const data = hp_loadPart4Data(sheetName, label);

// Part④に保存
hp_savePart4Data(sheetName, label, value);
```

### 5.3 メニュー構成パターン

```
⚙️ 設定              ← 設定シート・プロンプトシート作成
1.📋 [商材名]         ← シート作成・フォルダ作成
2.📝 ヒアリング反映    ← 文字起こし整理・転記
3.📁 素材フォルダ      ← フォルダ作成
4.📝 構成案作成       ← JSON出力・プロンプト生成
📊 進捗管理          ← ステータス更新・進捗一覧
```

### 5.4 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 関数プレフィックス | `hp_`, `tsunageru_` | `hp_createSheet()` |
| 定数 | `HP_COLORS`, `HP_TASKS` | `HP_DIALOG_STYLES` |
| メニュー追加 | `hp_add○○Menu(ui)` | `hp_addCompanyInfoMenu(ui)` |
| ダイアログHTML | `hp_create○○DialogHtml()` | `hp_createJsonOutputDialogHtml()` |

### 5.5 ダイアログサイズ

| サイズ | 用途 |
|--------|------|
| 700×600 | 小さめのダイアログ |
| 700×750 | 標準サイズ |
| 800×700 | 大きめのダイアログ（複雑なUI） |

### 5.6 商材固有vs共通の判断

| 種別 | 共通化する | 共通化しない |
|------|-----------|-------------|
| UIスタイル | ✅ commonStyles.js | - |
| 進捗管理 | ✅ progressManager.js | - |
| 設定シート | ✅ settingsSheet.js | - |
| 構成案プロンプト | - | ✅ 商材固有 |
| Claude Code指示文 | - | ✅ 商材固有 |
| フォーム→シートマッピング | - | ✅ 商材固有 |
| サブフォルダ構成 | - | ✅ 商材固有 |

### 5.7 操作→GAS呼び出しマッピング（HP制作例）

| 操作 | メニュー | GAS |
|------|---------|-----|
| ヒアリングシート作成 | 1.HP制作 → 新規シート作成 | hearingSheetManager.js → formCreator.js |
| JSON出力 | 4.構成案作成 → JSON出力 | jsonOutputDialog.js |
| 構成案プロンプト | 4.構成案作成 → 構成案プロンプト | compositionPrompt.js |
| 文字起こし転記 | 2.ヒアリング反映 → 文字起こし整理 | promptDialog.js → transcriptToHearingSheet.js |
| ページフォルダ追加 | 3.素材フォルダ → ページフォルダ追加 | createFolder.js |
| ステータス更新 | 各メニュー → ステータス更新 | progressManager.js |

---

## 6. マニュアル作成フロー

### 6.1 2つのアプローチ

マニュアル作成には2つのアプローチがある。プロジェクトの状況に応じて選択する。

#### パターンA: 個別 → 統合（推奨）

```
個別マニュアル作成 → スクショ検証 → 全体マニュアルに統合
```

**メリット:**
- 小さく始められる
- 検証しながら段階的に完成できる
- 既存の個別マニュアルを活かせる

**デメリット:**
- 統合時に重複・矛盾が発生しやすい
- 後から全体の整合性を取る必要がある

**採用例:** HP制作

#### パターンB: 完全 → 切り取り

```
完全マニュアル作成 → スクショ検証 → 個別マニュアルに切り取り
```

**メリット:**
- 最初から全体の整合性が取れる
- 重複が発生しない

**デメリット:**
- 最初の作成コストが高い
- 途中変更が全体に影響する

### 6.2 推奨フロー（パターンA）

```
① 既存マニュアルをコピーして統合
    ↓
② スクショ撮りながら実証
    ↓
③ 検証したものから完成
    ↓
④ 全体マニュアル完成
    ↓
⑤ 業務カードごとに分割（既存の状態に戻す）
```

**重要:** 既存マニュアル（00〜10, 99）は削除しない。全体マニュアルはこれらの「統合版」であり、各マニュアルは「切り抜き」として残る。

### 6.3 flowStepsは補助

**⚠️ flowStepsは冗長化の根本原因なので注意**

- flowStepsは業務カードの2カラム表示用の「補助」
- 全タスクに必須ではない
- 完全マニュアル（00-overall-manual.md）がメイン
- flowStepsは「完全マニュアルから画像+タイトル+説明を抽出した簡易版」

**生成方法:**
```
完全マニュアル → 画像 + タイトル + 説明を抽出 → flowSteps
```

### 6.4 業務カード（タスク）の粒度

**分割基準:**

| 基準 | 説明 | 例 |
|------|------|-----|
| 担当者の変わり目 | 担当が変わるポイント | 渡邉→河合、河合→川崎 |
| 成果物単位 | 明確な成果物が出る | シート完成、HP完成 |
| フェーズ区切り | 大きな工程の変わり目 | 準備→ヒアリング→制作 |

**共通フェーズ構成:**
```
受注・立ち上げ → 打ち合わせ前準備 → 初回打ち合わせ →
文字起こし → 原稿/構成案 → 制作 → 確認・修正 → 納品 → 運用
```

---

## 7. 全体マニュアル設計

### 7.1 全体マニュアルとは

全体マニュアル（00-overall-manual.md）は、商材の全業務を1ファイルにまとめた統合マニュアル。

**特徴:**
- 全タスクの手順を連続して読める
- 共通マニュアルをinclude機能で埋め込み
- アコーディオンで詳細を折りたたみ

**配置先:** `docs/manuals/{商材ID}/00-overall-manual.md`

### 7.2 include機能

別ファイルを埋め込む機能。共通マニュアルを複数の箇所で再利用できる。

**構文:**
```markdown
<!-- include: common/xxx.md -->
```

**処理:** `src/lib/manuals.ts` の `getManual()` 関数が `<!-- include: -->` を検出し、指定ファイルの内容に置換する。

**例:**
```markdown
## No.1 打ち合わせ前準備

### STEP 1: シート作成

（手順を記載）

<!-- include: common/gas-auth.md -->

### STEP 2: フォルダ作成

（手順を記載）
```

### 7.3 アコーディオンの使い方

詳細情報を折りたたんで表示する。HTMLの `<details>` タグを使用。

**基本構文:**
```markdown
<details style="border: 2px solid #色; border-radius: 8px; padding: 16px; margin: 16px 0; background: #背景色;">
<summary style="cursor: pointer; font-weight: bold; color: #文字色;">タイトル（クリックで展開）</summary>

内容をここに記載

</details>
```

### 7.4 アコーディオンの色パターン

| 用途 | 枠線色 | 背景色 | 文字色 |
|------|--------|--------|--------|
| ステータス更新 | #9C27B0（紫） | #f3e5f5 | #7B1FA2 |
| オプション機能 | #FF5722（オレンジ） | #fff3e0 | #E64A19 |
| メイン機能 | #2196F3（青） | #e3f2fd | #1976D2 |
| 完了・成功 | #4CAF50（緑） | #e8f5e9 | #388E3C |
| 注意事項 | #FFC107（黄） | #fff8e1 | #F57F17 |

**例:**
```markdown
<details style="border: 2px solid #9C27B0; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f3e5f5;">
<summary style="cursor: pointer; font-weight: bold; color: #7B1FA2;">📊 ステータス更新（クリックで展開）</summary>

<!-- include: common/status-update.md -->

</details>
```

### 7.5 個別マニュアルとの役割分離

| マニュアル | 役割 | 使用場面 |
|-----------|------|---------|
| 全体マニュアル | 全業務を通して読む | 新人教育、全体把握 |
| 個別マニュアル | 特定業務の詳細 | 業務カードからの参照 |

**関係:**
```
全体マニュアル = Σ（個別マニュアル + 共通マニュアル）
```

---

## 8. 共通マニュアル管理

### 8.1 配置先

**Markdown版:** `docs/manuals/common/`
**TypeScript版:** `src/lib/data/common/manuals/`

### 8.2 共通マニュアル一覧

| ファイル | 用途 | 使用タイミング |
|---------|------|---------------|
| `gas-auth.md` | GAS認証手順 | 初回メニュー実行時 |
| `notta.md` | NOTTA使い方 | 打ち合わせ前後 |
| `transcript.md` | 文字起こし整理 | 文字起こし→AI整理 |
| `transfer.md` | AI出力転記 | AI出力→シート転記 |
| `status-update.md` | ステータス更新 | 全タスク完了時 |
| `gijiroku.md` | 議事録作成 | 打ち合わせ後 |
| `json-output.md` | JSON出力 | 構成案作成前 |

### 8.3 共通マニュアルの作成手順

1. **既存マニュアルから共通部分を抽出**
   - HP・ツナゲル両方で使っている手順を特定
   - 商材固有の部分を汎用化

2. **Markdownファイルを作成**
   ```
   docs/manuals/common/{機能名}.md
   ```

3. **スクショ付きのステップ形式で記述**
   - 各STEPに画像を挿入
   - キャプションを付ける

4. **全体マニュアルにアコーディオンで埋め込み**
   ```markdown
   <details style="border: 2px solid #色; ...">
   <summary>タイトル（クリックで展開）</summary>
   <!-- include: common/xxx.md -->
   </details>
   ```

5. **他商材のマニュアルでも同じincludeで共通利用**

### 8.4 共通化しないもの

以下は商材固有のため、共通マニュアル化しない:

- 構成案プロンプト
- Claude Code指示文
- 商材固有のフォーム項目説明
- 商材固有のサブフォルダ構成

---

## 9. マニュアル検証フロー

### 9.1 検証の目的

- マニュアルの記載が正しいか確認
- 実際の操作で問題がないか検証
- スクショを撮りながら完成度を高める

### 9.2 検証フロー（毎ステップ実施）

```
1. Claude Code → マニュアルの該当ステップを表示
2. ユーザー → 操作を実行、スクショを撮影
3. ユーザー → スクショのパスを共有、気づいた点を報告
4. Claude Code → スクショを確認して内容を把握
5. Claude Code → HANDOFFのスクショ管理に追加
6. Claude Code → 問題があれば気づいたことメモに追加
7. Claude Code → 進捗を更新
8. 次のステップへ
```

### 9.3 スクショ管理

**重要:** スクショはいきなり配置せず、必ず内容確認→HANDOFF記録→後で一括配置

**HANDOFF記録形式:**

| # | ファイル名 | 配置後ファイル名 | マニュアル挿入位置 | 状態 |
|---|-----------|-----------------|------------------|------|
| 1 | 04abf4ee...png | step1-xxx.png | No.1 ステップ1 | ✅ 配置済み |
| 2 | f17dce5b...png | step2-xxx.png | No.1 ステップ2 | 📥 取得済み |

### 9.4 気づいたことメモ

検証中に発見した問題・改善点を記録する。

**HANDOFF記録形式:**

| # | 箇所 | 内容 | 種別 |
|---|------|------|------|
| 1 | GAS: シート作成 | ローディング表示がない | GAS改善 |
| 2 | マニュアル: No.1 | 手順が抜けている | マニュアル修正 |

### 9.5 検証進捗管理

**HANDOFF記録形式:**

| タスク | ステップ | 状態 | 備考 |
|--------|---------|------|------|
| No.1 打ち合わせ前準備 | 1. 回答確認 | ✅ 完了 | |
| | 2. シート作成 | ✅ 完了 | スクショ7枚取得 |
| | 3. フォルダ作成 | ⬜ | |
| No.2 初回打ち合わせ | | ⬜ | |

### 9.6 段階的完成

```
未検証 → スクショ取得 → 内容確認 → マニュアル挿入 → 完成
   ⬜        📥            👁️           ✏️          ✅
```

---

## 10. リファレンス

### 10.1 ツナゲルの構成

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

### 10.2 HP制作の構成

HP制作は11業務（No.0〜10）で構成。

```
docs/gas/hp/
├── commonStyles.js           # 共通スタイル定義
├── hearingSheetManager.js    # メインハブ（onOpen含む）
├── settingsSheet.js          # 設定シート管理
├── progressManager.js        # 進捗管理
├── formCreator.js            # フォーム作成
├── jsonOutputDialog.js       # JSON出力
├── compositionPrompt.js      # 構成案プロンプト
├── createFolder.js           # フォルダ作成
├── promptDialog.js           # プロンプトダイアログ
└── transcriptToHearingSheet.js # 文字起こし転記

docs/manuals/hp/
├── 00-overall-manual.md      # 全体マニュアル ★
├── 01-打ち合わせ前準備.md
├── ...
├── 10-月次FB.md
└── 99-Claude Code使い方.md

docs/flows/hp/
└── overall-flow.md           # 全体フロー

docs/samples/hp/
├── README.md                 # サンプル作成ガイド
├── sample_form_response_chubu.csv
├── meeting-transcript-chubu-kensetsu.txt
└── ...
```

### 10.3 共通テンプレート一覧

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

### 10.4 共通マニュアル一覧

```
docs/manuals/common/
├── gas-auth.md               # GAS認証フロー
├── notta.md                  # NOTTA使い方
├── transcript.md             # 文字起こし整理
├── transfer.md               # AI出力転記
├── status-update.md          # ステータス更新
├── gijiroku.md               # 議事録作成
└── json-output.md            # JSON出力

src/lib/data/common/manuals/
├── gas-auth.ts               # GAS認証フロー（TypeScript版）
├── notta.ts                  # NOTTA使い方
└── works-reaction.ts         # ワークスリアクションルール
```

### 10.5 GASメニュー構成パターン

**HP制作:**
```
⚙️ 設定
├── 📋 設定シートを作成
├── 📝 プロンプトシートを作成
└── 📄 設定を表示

1.📋 HP制作
├── 🆕 新規ヒアリングシート作成（フォーム回答から）
├── 🆕 新規ヒアリングシート作成（手動）
├── 📂 企業フォルダ作成
├── 📥 フォーム回答を既存シートに転記
├── 📋 テンプレート初期設定
└── ✏️ ステータス更新

2.📝 ヒアリング反映
├── 議事録作成（プロンプトシートから）
├── 📋 文字起こしを整理（プロンプト生成）
├── 📥 AI出力を転記
├── ❓ 使い方
└── ✏️ ステータス更新

3.📁 素材フォルダ

4.📝 構成案作成
├── 📤 HP制作用JSON出力
├── ────────────
├── 📋 構成案プロンプト生成
├── 🤖 Claude Code指示文生成
└── ✏️ ステータス更新

📊 進捗管理
```

### 10.6 V2ガイドラインの参照

UI仕様の詳細は `docs/manual-creation-guideline-v2.md` を参照:

- 3.3節: 担当者選択コンポーネント（コンパクトドロップダウン）
- 3.4節: 企業選択コンポーネント
- 3.5節: テンプレート表示（アコーディオン）
- 3.6節: プレビューセクション
- 3.7節: コピーボタンの表示/非表示
- 3.9節: 貼り付けUIコンポーネント

---

## 11. チェックリスト

### 11.1 新商材追加時

#### スプレッドシート
- [ ] スプレッドシートを作成
- [ ] GASファイルをコピー
- [ ] **Drive APIサービスを追加**（フォルダ作成機能を使う場合）
- [ ] 設定シートを作成・編集
- [ ] プロンプトシートを作成・編集
- [ ] 企業情報一覧を作成
- [ ] ヒアリングシートテンプレートを作成

#### GAS
- [ ] commonStyles.jsをコピー
- [ ] 必要なGASファイルをコピー・編集
- [ ] onOpenにメニュー追加
- [ ] ダイアログの動作確認
- [ ] 関数プレフィックスを商材固有に変更

#### マニュアル（Next.js）
- [ ] `src/lib/data/{商材ID}.ts` を作成
- [ ] `src/lib/data/index.ts` にエクスポート追加
- [ ] 全業務のflowStepsを設定
- [ ] 必要に応じてmdファイルを作成
- [ ] `npm run dev` で表示確認

#### 全体マニュアル（V4で追加）
- [ ] `hasOverallManual: true` を設定
- [ ] `docs/manuals/{商材ID}/00-overall-manual.md` を作成
- [ ] 共通マニュアルをincludeで埋め込み
- [ ] アコーディオンで詳細を折りたたみ

### 11.2 共通マニュアル追加時（V4で追加）

- [ ] `docs/manuals/common/{機能名}.md` を作成
- [ ] スクショ付きのステップ形式で記述
- [ ] 全体マニュアルにアコーディオンで埋め込み
- [ ] 他商材のマニュアルでも同じincludeで利用可能か確認

### 11.3 マニュアル検証時（V4で追加）

- [ ] HANDOFFにスクショ管理表を作成
- [ ] HANDOFFに検証進捗表を作成
- [ ] HANDOFFに気づいたことメモを作成
- [ ] 各ステップでスクショを撮影
- [ ] スクショの内容を確認してからHANDOFFに記録
- [ ] 問題があれば気づいたことメモに追加
- [ ] 検証完了後、スクショを一括配置

### 11.4 品質チェック

- [ ] Noは配列順の連番か
- [ ] 画像は全てキャプション付きか
- [ ] 担当者名がハードコードされていないか
- [ ] 共通化できるものは `common/` に切り出したか
- [ ] ダイアログサイズは700x600〜750か
- [ ] commonStyles.jsを使用しているか
- [ ] 各業務のflowSteps最後に「ステータス更新」ステップがあるか
- [ ] 「GAS」という表現を使っていないか
- [ ] 「メニュー」ではなく「ヒアリングシートのメニュー」と記載しているか
- [ ] GAS関数にプレフィックス（`hp_`, `tsunageru_`）が付いているか

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-02 | V4 初版作成（V3をベースに5〜9章を追加、リファレンス・チェックリストを拡張） |
| 2026-01-14 | V3: 表現ルール追加（GAS禁止、ヒアリングシートの明記）、ステータス更新ステップ追加 |
| 2026-01-13 | V3 初版作成 |
