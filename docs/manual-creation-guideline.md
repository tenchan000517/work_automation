# マニュアル作成ガイドライン

作成日: 2026-01-10
目的: 全商材のマニュアルを一定品質で作成・維持するための指針

---

## 1. はじめに

### 1.1 このガイドラインの目的

- 残り8商材のマニュアル作成時の指針
- 新商材追加時の指針
- ツナゲルレベルの品質維持
- 商材固有の最適化を妨げない柔軟性の確保

### 1.2 重要な原則

1. **汎用ルールを守る**: データ構造、ナンバリング、UI形式は統一
2. **商材固有の最適化を許容**: 業務フローは商材ごとに異なって当然
3. **引きずられを防ぐ**: ツナゲルの仕様をそのまま適用しない。各商材に最適な形を検討

---

## 1.3 参照先

| やりたいこと | 参照先 |
|-------------|--------|
| 初回ヒアリング〜議事録共有 | ツナゲル配列順0〜5（tsunageru.ts） |
| 撮影フロー | ツナゲル配列順4（tsunageru.ts） |
| 構成案生成 | docs/gas/tsunageru/compositionDraftGenerator.js |
| 文字起こし転記 | docs/gas/tsunageru/transcriptToHearingSheet.js |
| プロンプト・フォーマット管理 | docs/gas/tsunageru/setupSheets.js |
| ヒアリングシート操作 | docs/gas/tsunageru/hearingSheetManager.js |
| 撮影フォルダ作成 | docs/gas/tsunageru/createShootingFolder.js |

---

## 2. システム全体像

### 2.1 ファイル構成

```
src/lib/data/
├── index.ts        # 型定義・担当者色設定・全商材エクスポート
├── tsunageru.ts    # ツナゲル（モデルケース）
├── batsugun.ts     # バツグン
├── hp.ts           # HP制作
├── lp.ts           # LP制作
├── sns.ts          # SNS広告
├── pv.ts           # PV制作
├── pamph.ts        # パンフ
├── logo.ts         # ロゴ
└── sing.ts         # 月刊Sing

docs/gas/
├── tsunageru/                  # ツナゲル専用GAS
│   ├── setupSheets.js          # 初期設定（プロンプト・設定シート）
│   ├── hearingSheetManager.js  # ヒアリングシート管理
│   ├── transcriptToHearingSheet.js # 文字起こし転記
│   ├── compositionDraftGenerator.js # 構成案生成
│   ├── createShootingFolder.js # 撮影フォルダ作成
│   └── promptDialog.js         # プロンプトダイアログ
├── (他商材)/                   # 他商材追加時にフォルダ作成
└── (common)/                   # 共通機能が出てきたら作成

src/components/
├── TaskCard.tsx     # 業務カードコンポーネント
└── ContentModal.tsx # ポップアップモーダル
```

### 2.2 表示の流れ

```
商材データ（*.ts）
    ↓
TaskCard.tsx（業務カード表示）
    ↓ flowStepsを表示
フローステップボックス
    ↓ インフォアイコンクリック or リンククリック
ContentModal.tsx（ポップアップ表示）
```

---

## 3. データ構造

### 3.1 Product（商材）

```typescript
interface Product {
  id: string;           // 商材ID（英字、URLに使用）
  name: string;         // 商材名（日本語）
  taskCount: number;    // 業務数
  description: string;  // 商材説明
  tasks: Task[];        // 業務の配列
  issues: string[];     // 商材レベルの課題
}
```

### 3.2 Task（業務）

```typescript
interface Task {
  // === 必須フィールド ===
  no: string;              // 業務No（配列順と一致させる: "0", "1", "2"...）
  category: string;        // フェーズ名
  name: string;            // 業務名
  assignee: string;        // 担当者
  nextAssignee: string;    // 次の業務の担当者
  tools: string;           // 使用ツール
  deliverable: string;     // 成果物
  checkpoint: string;      // チェックポイント
  hasManual: boolean;      // マニュアル有無
  issues: string;          // 備考・課題感

  // === オプションフィールド ===
  trigger?: string;           // 次工程へ進む条件
  memo?: string;              // メモ
  simulation?: string;        // シミュレーション（業務の流れ）
  manualDraft?: string;       // マニュアルたたき
  overallFlow?: string;       // 全体フロー
  format?: string;            // フォーマット
  detailedFlow?: string;      // 詳細フロー
  nottaManual?: string;       // NOTTAマニュアル表示フラグ
  relatedSheetUrl?: string;   // 関連シートURL（非推奨）
  relatedLinks?: RelatedLink[]; // 関連リンク（複数対応）
  flowSteps?: FlowStep[];     // フローステップ
}
```

### 3.3 FlowStep（フローステップ）

```typescript
interface FlowStep {
  label: string;              // ステップ名（必須）
  links?: FlowStepLink[];     // リンク/ポップアップ
  description?: string;       // 詳細説明（インフォアイコンで表示）
  images?: ImageItem[];       // 説明用画像
  relatedTaskNo?: string;     // 関連タスクNo（担当者を動的取得）
  excludeSelf?: boolean;      // 自分を除外（relatedTaskNoと併用）
}
```

### 3.4 FlowStepLink（リンク/ポップアップ）

```typescript
interface FlowStepLink {
  label: string;              // ボタンラベル（必須）
  type: 'link' | 'popup';     // タイプ（必須）
  url?: string;               // リンク先URL（type: 'link'の場合）
  content?: string;           // ポップアップ内容（type: 'popup'の場合）
  images?: ImageItem[];       // ポップアップ内画像

  // === 入力フィールド付きテンプレート機能 ===
  hasInputField?: boolean;        // 入力フィールド表示
  inputSectionTitle?: string;     // アコーディオンタイトル
  inputLabel?: string;            // 入力欄ラベル（単一入力時、後方互換用）
  inputPlaceholder?: string;      // プレースホルダー（単一入力時、後方互換用）
  inputNote?: string;             // 注意書き
  template?: string;              // テンプレート（{{input}}や{{id}}が置換される）

  // === 複数入力フィールド対応（推奨） ===
  inputFields?: InputFieldConfig[];  // 複数入力フィールドの設定
}
```

### 3.5 InputFieldConfig（入力フィールド設定）

複数の入力フィールドを定義するための型。`inputFields`を指定すると、`inputLabel`/`inputPlaceholder`より優先される。

```typescript
interface InputFieldConfig {
  id: string;              // プレースホルダーID（例: "company" → {{company}}で参照）
  label: string;           // 表示ラベル（例: "企業名"）
  placeholder?: string;    // プレースホルダー（例: "株式会社○○"）
  defaultValue?: string;   // デフォルト値（例: "@河合 cc:@青柳"）
  type?: 'text' | 'textarea';  // 入力タイプ（デフォルト: text）
  rows?: number;           // textareaの場合の行数
}
```

**使用例:**
```typescript
links: [{
  label: "投稿フォーマット",
  type: "popup",
  hasInputField: true,
  inputSectionTitle: "ワークス投稿フォーマット",
  inputNote: "各項目を入力してください",
  inputFields: [
    { id: "mention", label: "宛先", placeholder: "@河合 cc:@青柳", defaultValue: "@河合 cc:@青柳" },
    { id: "company", label: "企業名", placeholder: "株式会社○○" },
    { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" }
  ],
  template: `{{mention}}
初回打ち合わせの日程が確定しました。

【企業名】{{company}}
【日時】{{datetime}}`
}]
```

### 3.6 ImageItem（画像）

```typescript
// 2つの形式がある
type ImageItem = string | ImageWithCaption;

interface ImageWithCaption {
  url: string;      // 画像URL
  caption?: string; // キャプション
}
```

---

## 4. 統一ルール（必守）

### 4.1 Noナンバリング

**ルール: 配列順と一致させる連番**

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

### 4.2 画像は必ずキャプション付き

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

### 4.3 例文・担当者名はハードコードしない

**ルール: descriptionに担当者名をハードコードしない**

```typescript
// NG（旧形式）- 担当者名ハードコード
description: `@河合 cc:@青柳
株式会社○○様の初回打ち合わせについて...`

// NG（単一入力の旧形式）- 担当者変更時に修正が必要
links: [{
  label: "投稿フォーマット",
  type: "popup",
  hasInputField: true,
  inputLabel: "企業名を入力",
  template: `@河合 cc:@青柳
株式会社{{input}}様の初回打ち合わせについて...`
}]

// OK（推奨形式）- 複数入力フィールドで担当者もフィールド化
links: [{
  label: "投稿フォーマット",
  type: "popup",
  hasInputField: true,
  inputSectionTitle: "ワークス投稿フォーマット",
  inputNote: "各項目を入力してください",
  inputFields: [
    { id: "mention", label: "宛先", placeholder: "@河合 cc:@青柳", defaultValue: "@河合 cc:@青柳" },
    { id: "company", label: "企業名", placeholder: "株式会社○○" }
  ],
  template: `{{mention}}
{{company}}様の初回打ち合わせについて...`
}]
```

**複数入力フィールドの利点:**
- 担当者名をデフォルト値として設定し、必要に応じて変更可能
- 各入力フィールドを個別に管理でき、テンプレートの柔軟性が向上
- textarea対応で議事録などの長文入力にも対応

**プレースホルダー一覧（setupSheets.jsで定義）:**
| プレースホルダー | 説明 |
|-----------------|------|
| `{{原稿担当1}}` | 原稿担当者1 |
| `{{原稿担当2}}` | 原稿担当者2 |
| `{{原稿チーム}}` | 原稿担当1・原稿担当2 |
| `{{@原稿チーム}}` | @原稿担当1 @原稿担当2 |
| `{{動画担当}}` | 動画担当者 |
| `{{撮影担当}}` | 撮影担当者 |
| `{{編集担当}}` | 編集担当者 |
| `{{CC}}` | CC対象者 |

### 4.4 関連リンクのタイプ

```typescript
relatedLinks: [
  { label: "シート名", url: "...", type: "sheet" },  // スプレッドシート→緑
  { label: "フォルダ名", url: "...", type: "drive" }, // ドライブ→青
  { label: "サイト名", url: "...", type: "site" },   // 外部サイト→オレンジ
  { label: "その他", url: "...", type: "other" },    // その他→グレー
]
```

---

## 5. 商材固有のカスタマイズポイント

以下は商材ごとに異なって良い部分：

### 5.1 カスタマイズ可能

- **業務数**: 商材によって異なる
- **フェーズ構成**: 商材のワークフローに合わせる
- **flowStepsの詳細度**: 必要に応じて詳細化/簡略化
- **GAS機能**: 商材固有のGASがあれば追加
- **担当者構成**: 商材によって異なる

### 5.2 カスタマイズ不可（統一必須）

- Noナンバリング（連番）
- 画像キャプション形式
- 例文のGAS連携方式
- データ構造（型定義）
- コンポーネント（TaskCard, ContentModal）

---

## 6. flowStepsの詳細度基準

### 6.1 詳細化すべき業務

- **初めて行う作業**: 新人でも迷わないレベル
- **ツール操作が複雑**: GAS、外部サービスなど
- **ミスが発生しやすい**: チェックポイントを明記
- **複数人が関わる**: 引き継ぎポイントを明確に

### 6.2 簡略化して良い業務

- **定型作業**: 担当者が慣れている
- **単純なツール操作**: 説明不要
- **商材横断で共通**: 別のマニュアルを参照

### 6.3 詳細化の目安

```typescript
【最小構成】
flowSteps: [
  { label: "ステップ名" }
]

【標準構成】
flowSteps: [
  {
    label: "ステップ名",
    description: "詳細説明",
    links: [{ label: "リンク", type: "link", url: "..." }]
  }
]

【詳細構成（単一入力）】- 後方互換、簡易なケース
flowSteps: [
  {
    label: "ステップ名",
    description: "詳細説明",
    links: [{
      label: "フォーマット",
      type: "popup",
      hasInputField: true,
      inputLabel: "企業名を入力",
      inputPlaceholder: "株式会社○○",
      template: "株式会社{{input}}様..."
    }]
  }
]

【詳細構成（複数入力）】- 推奨、柔軟性が高い
flowSteps: [
  {
    label: "ステップ名",
    description: "詳細説明（手順をSTEP形式で記載）",
    images: [
      { url: "/images/xxx.png", caption: "STEP 1: 説明" },
      { url: "/images/yyy.png", caption: "STEP 2: 説明" }
    ],
    links: [{
      label: "フォーマット",
      type: "popup",
      hasInputField: true,
      inputSectionTitle: "投稿フォーマット",
      inputNote: "各項目を入力してください",
      inputFields: [
        { id: "mention", label: "宛先", defaultValue: "@河合 cc:@青柳" },
        { id: "company", label: "企業名", placeholder: "株式会社○○" },
        { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" }
      ],
      template: `{{mention}}
{{company}}様の件
【日時】{{datetime}}`
    }]
  }
]

【詳細構成（長文入力）】- 議事録などに使用
flowSteps: [
  {
    label: "議事録共有",
    links: [{
      label: "投稿フォーマット",
      type: "popup",
      hasInputField: true,
      inputFields: [
        { id: "company", label: "企業名", placeholder: "株式会社○○" },
        { id: "minutes", label: "議事録", placeholder: "AIが出力した議事録を貼り付け...", type: "textarea", rows: 10 }
      ],
      template: `@ALL
{{company}}様 初回打ち合わせの議事録を共有します。

{{minutes}}

ご確認お願いします。`
    }]
  }
]
```

---

## 7. GAS連携の仕組み

### 7.1 プロンプトシート

スプレッドシートの「プロンプト」シートにプロンプトを登録し、GASダイアログから呼び出す。

| 列 | 内容 |
|----|------|
| A | プロンプト名（メニューに表示） |
| B | 説明 |
| C | 入力欄ラベル |
| D | プレースホルダー |
| E | テンプレート（`{{input}}`が入力値に置換） |

### 7.2 設定シート

担当者情報を設定シートで管理し、GASで動的に読み込む。

**設定シートの構造:**
```
設定シート
├── A列: 項目名
├── B列: 値
│
├── 担当者一覧（メンバー名を列挙）
│   ├── 河合
│   ├── 中尾文香
│   ├── 川崎
│   ├── 下脇田
│   ├── 紺谷
│   └── 渡邉
│
└── その他設定（CC先、デフォルト値など）
```

**ダイアログでの担当者選択:**
```html
<!-- 設定シートから読み込んだ担当者をドロップダウン表示 -->
<select id="assignee">
  <option value="">選択してください</option>
  <!-- GASから動的に生成 -->
  <option value="河合">河合</option>
  <option value="中尾文香">中尾文香</option>
  ...
  <option value="__custom__">その他（カスタム入力）</option>
</select>

<!-- カスタム入力欄（「その他」選択時に表示） -->
<input type="text" id="customAssignee" style="display:none" placeholder="担当者名を入力">
```

**GAS実装:**
```javascript
// 設定シートから担当者一覧を取得
function getAssigneeList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('設定');
  const data = sheet.getDataRange().getValues();
  // 担当者一覧の行を抽出してリストで返す
  return data.filter(row => row[0] === '担当者').map(row => row[1]);
}

// ダイアログHTMLに担当者ドロップダウンを生成
function buildAssigneeDropdown(assignees) {
  let html = '<select id="assignee"><option value="">選択してください</option>';
  assignees.forEach(name => {
    html += `<option value="${name}">${name}</option>`;
  });
  html += '<option value="__custom__">その他（カスタム入力）</option></select>';
  return html;
}
```

**関連ファイル:**
```
setupSheets.js
├── setupPromptSheet()     # プロンプトシート作成
├── showSettingsDialog()   # 設定ダイアログ表示
├── getSettingsFromSheet() # 設定読み込み
├── getAssigneeList()      # 担当者一覧取得
└── replacePlaceholders()  # プレースホルダー置換
```

### 7.3 flowStepsとGASの連携パターン

**パターン1: GASダイアログ経由（推奨）**
```
1. ユーザーがGASメニューから操作
2. GASがプロンプトシートからテンプレートを読み込み
3. 設定シートから担当者を読み込み、プレースホルダー置換
4. ダイアログで入力→完成版をコピー
```

**パターン2: flowSteps内popup（GASなしでも可）**
```
1. flowSteps内のhasInputField付きpopupでテンプレート表示
2. ユーザーが入力→完成版をコピー
※担当者はハードコードになるが、コピー時に手動修正
```

### 7.4 ダイアログUI仕様

GASダイアログとNext.js popup（ContentModal）は同じUI構成にする。

**共通UI構成:**
```
┌─────────────────────────────────────┐
│ タイトル                     [×]   │
├─────────────────────────────────────┤
│ ▶ テンプレート（アコーディオン）[コピー] │
│   └─ 展開時: テンプレート全文表示     │
├─────────────────────────────────────┤
│ ※ 注意書き（inputNote）             │
├─────────────────────────────────────┤
│ 入力フィールド1（ラベル付き）         │
│ ┌─────────────────────────────────┐ │
│ │ placeholder                     │ │
│ └─────────────────────────────────┘ │
│ 入力フィールド2（textarea可）        │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ プレビュー                   [コピー] │
│ ┌─────────────────────────────────┐ │
│ │ 完成版テキスト                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**対応表:**
| UI要素 | GASダイアログ | Next.js ContentModal |
|--------|--------------|---------------------|
| テンプレート表示 | アコーディオン | accordionOpen |
| 入力フィールド | HTML input/textarea | inputFields |
| 完成版表示 | 出力フィールド | プレビュー |
| コピー機能 | ボタン | handleTemplateCopy |

### 7.5 入力データの永続化

ダイアログで入力したデータは一時的ではなく、スプレッドシートに保存して再利用する。

#### 7.5.1 保存先の考え方

**対象シート = 企業シート（案件ごとに1シート）**

企業シートはヒアリングシートをコピーして作成。そこに各フローで入力したデータを蓄積していく。

```
スプレッドシート
├── プロンプト（システム）
├── 設定（システム）
├── ヒアリングシート（テンプレート/原本）
├── フォームの回答1（システム）
│
├── 株式会社A（企業シート）← ここに保存
├── 株式会社B（企業シート）← ここに保存
└── ...
```

#### 7.5.2 保存セルの設計

企業シートに「データ保存エリア」を設ける。ヒアリングシートの既存構造を活かしつつ、追加データ用の列/行を確保。

**例: 文字起こしデータの保存**
```
企業シート
├── Part① 基本情報（既存）
├── Part② ヒアリング情報（既存）
└── Part③ 処理データ（追加）
    ├── 行XX: 文字起こし原文
    ├── 行XX: AI整理後テキスト
    ├── 行XX: 構成案（原稿用）
    └── 行XX: 構成案（動画用）
```

#### 7.5.3 GASでの実装パターン

```javascript
// 保存
function saveToSheet(sheetName, cellAddress, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const existingValue = sheet.getRange(cellAddress).getValue();

  if (existingValue && existingValue !== value) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('上書き確認', '既存データを上書きしますか？', ui.ButtonSet.OK_CANCEL);
    if (response !== ui.Button.OK) return false;
  }

  sheet.getRange(cellAddress).setValue(value);
  return true;
}

// 読み込み
function loadFromSheet(sheetName, cellAddress) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  return sheet.getRange(cellAddress).getValue();
}

// ダイアログ表示時に既存データを初期値として渡す
function showDialogWithData() {
  const sheetName = getSelectedSheetName(); // 企業シート選択
  const existingData = loadFromSheet(sheetName, 'X10'); // 保存先セル

  const html = HtmlService.createHtmlOutput(`
    <textarea id="input">${existingData}</textarea>
    <button onclick="save()">保存</button>
  `);
  SpreadsheetApp.getUi().showModalDialog(html, 'タイトル');
}
```

#### 7.5.4 フロー例: 文字起こし→構成案

```
1. 文字起こしダイアログを開く
   └─ 企業シート選択 → 既存データがあればフィールドに表示

2. 文字起こしを貼り付け
   └─ 企業シートの「文字起こし原文」セルに保存

3. AI整理プロンプトを生成 → AIに貼り付け → 結果を取得

4. 構成案ダイアログを開く
   └─ 「文字起こし原文」セルから自動読み込み
   └─ AI整理後テキストを入力 → 「AI整理後」セルに保存

5. 構成案生成 → 結果を「構成案」セルに保存

6. 後日、同じ企業シートを開く
   └─ 全てのデータが保存されており、途中から再開可能
```

**上書き時の挙動:**
- 既にデータがある状態で新規入力 → 「上書きしますか？」アラート
- OK → 上書き保存

**除外シート（対象シート選択肢に出さない）:**
- プロンプト
- 設定
- フォームの回答1
- ヒアリングシート（原本/テンプレート）

### 7.6 GASメニュー構造

各GASファイルは `addXxxMenu(ui)` 関数を持ち、メインスクリプトのonOpenから呼び出す。

**GASファイルの構造:**
```javascript
// ===== メニュー追加 =====
function addCompositionMenu(ui) {
  ui.createMenu('5. 構成案生成')
    .addItem('構成案を生成（プロンプト生成）', 'showCompositionPromptDialog')
    .addSeparator()
    .addItem('ペアソナ/エンゲージ形式に変換', 'showPairsonaConvertDialog')
    .addToUi();
}
```

**メインスクリプト（onOpen）:**
```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 各GASのメニューを追加
  addSetupMenu(ui);           // 初期設定
  addHearingMenu(ui);         // ヒアリングシート
  addCompositionMenu(ui);     // 構成案生成
  addShootingMenu(ui);        // 撮影関連
}
```

**メリット:**
- GASファイルごとに独立したメニュー
- メインスクリプトは呼び出しのみで簡潔
- 新機能追加時はaddXxxMenu(ui)を追加するだけ

---

## 8. 新商材追加時のチェックリスト

### 8.1 データファイル作成

- [ ] `src/lib/data/{商材名}.ts` を作成
- [ ] Product型に準拠
- [ ] Noは配列順の連番
- [ ] `src/lib/data/index.ts` にエクスポート追加

### 8.2 各業務のflowSteps

- [ ] 全業務にflowStepsを設定
- [ ] 画像は必ずキャプション付き
- [ ] 例文はhasInputField付きpopupまたはGAS連携
- [ ] 担当者名はプレースホルダーまたはGAS連携

### 8.3 GAS連携（必要に応じて）

- [ ] 商材固有のGASがあれば作成
- [ ] プロンプトシートにプロンプト追加
- [ ] 設定シートに担当者追加

### 8.4 動作確認

- [ ] `npm run dev` で表示確認
- [ ] 各flowStepsのインフォアイコン動作確認
- [ ] 各リンク/ポップアップの動作確認
- [ ] GASダイアログの動作確認

---

## 9. 既存商材ブラッシュアップ時のチェックリスト

### 9.1 統一ルール適用

- [ ] Noが配列順の連番か
- [ ] 画像が全てキャプション付きか
- [ ] 例文に担当者名がハードコードされていないか

### 9.2 詳細度の見直し

- [ ] 詳細化すべき業務は十分に詳細か
- [ ] 簡略化して良い業務は過剰に詳細でないか

### 9.3 GAS連携

- [ ] 必要なGAS機能は揃っているか
- [ ] プロンプトシートのプロンプトは最新か

---

## 10. 参考: ツナゲルの構成（モデルケース）

ツナゲルは14業務で構成。参考にしつつ、商材固有の最適化を行うこと。

| 配列順 | 業務名 | flowSteps詳細度 |
|--------|--------|----------------|
| 0 | 受注・ワークス立ち上げ | 詳細（GAS連携） |
| 1 | 初回打ち合わせ日程調整 | 詳細（メール例文） |
| 2 | 打ち合わせ前準備 | 詳細（GAS連携） |
| 3 | オンライン初回打ち合わせ | 詳細（NOTTA連携） |
| 4 | 打ち合わせ後対応 | 詳細（GAS連携） |
| 5 | ヒアリング内容整理 | 詳細（GAS連携） |
| 6〜14 | （未ブラッシュアップ） | 標準〜最小 |

**注意**: ツナゲルの構成をそのまま他商材に適用しないこと。各商材のワークフローに合わせて最適化する。

---

## 11. 禁止事項

1. **Noに枝番を使う**: `0-1`, `0-2-2` などはNG
2. **Noに欠番を使う**: `-` はNG
3. **画像をキャプションなしで追加**: 単純文字列はNG
4. **descriptionに担当者名をハードコード**: `@河合` などはNG
5. **ツナゲルの仕様を無条件に適用**: 商材固有の最適化を妨げる

---

## 12. 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-10 | 初版作成 |
| 2026-01-10 | 複数入力フィールド対応（InputFieldConfig）を追加 |
