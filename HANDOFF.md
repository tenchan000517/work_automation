# 業務効率化・マニュアル作成プロジェクト HANDOFF

## 最近完了した機能（2026-01-14）

### フローステップタイトル改善・UI微調整（完了）

**タイトル改善:**
1. タイトルを簡潔化（例: 「ワークスで企業グループを作成」→「グループ作成」）
2. summaryに詳細説明を追加（例: 「LINEWORKSで企業グループを立ち上げる」）
3. ボタンの絵文字（📄📋）を削除

**共通化されたタイトル例:**
- 日程調整、カレンダー登録、ワークス共有、リアクション確認
- シート作成、フォルダ作成、議事録作成、構成案作成
- NOTTA起動、NOTTA確認、すり合わせ
- 撮影連絡、撮影、データチェック、動画編集
- 確認依頼、承認取得、FB実施、FB日程確定

**UI微調整:**
- カード幅: w-32(128px) → w-40(160px)
- カード間余白: gap-2 → gap-1
- カード内余白: px-3 → px-2.5
- ボタン横幅: 統一（w-full + justify-center）
- タイトル左余白: ml-1追加
- メインコンテンツ左右余白: px-4/8/12 → px-3/6/8

**関連ファイル:**
- `src/components/TaskCard.tsx` - カード・ボタンスタイル調整
- `src/lib/data/tsunageru.ts` - 全15タスクのflowSteps改善
- `src/app/products/[id]/page.tsx` - 左右余白調整

---

### フローステップのデザイン改善（完了）

**変更内容:**
```
【PC】横並び折り返し、固定幅
┌──────┐  ▶  ┌──────┐  ▶  ┌──────┐
│ ① ラベル│     │ ② ラベル│     │ ③ ラベル│
│ summary │     │ summary │     │ summary │
│ [ボタン]│     │ [ボタン]│     │ [ボタン]│
└──────┘     └──────┘     └──────┘

【モバイル】縦並び、コンテナ幅いっぱい
┌────────────────────────┐
│ ① ラベル / summary / [ボタン] │
└────────────────────────┘
              ▼
┌────────────────────────┐
│ ② ラベル / summary / [ボタン] │
└────────────────────────┘
```

**実装詳細:**
- `FlowStep`型に`summary`フィールド追加
- PC: 固定幅（w-40 = 160px）、横並び折り返し
- モバイル: コンテナ幅いっぱい（w-full）、縦並び
- 高さ: min-h-[120px]
- ステップ番号を左上に丸バッジで表示
- 矢印: 丸の中にChevronRight/ChevronDown（リッチなデザイン）
- `hasFlowSteps`未使用変数削除

### モバイルハンバーガーメニュー（完了）

**変更内容:**
- ヘッダーにハンバーガーアイコン追加（モバイルのみ）
- Menu ↔ X の回転アニメーション
- `ProductPageLayout`にヘッダーを統合
- Sidebarの開くボタンはデスクトップのみ表示（`hidden lg:block`）
- モバイルではデフォルトでメニュー閉じ

**関連ファイル:**
- `src/components/ProductPageLayout.tsx` - ヘッダー統合、ハンバーガーメニュー
- `src/components/Sidebar.tsx` - 開くボタンをデスクトップのみに
- `src/app/products/[id]/page.tsx` - ヘッダー削除（ProductPageLayoutに移動）

---

## プロジェクト概要

制作陣の業務効率化とマニュアル整備プロジェクト。
9商材・52業務を対象に、AI活用による効率化とマニュアル改善を推進。

**ガイドライン**:
- `docs/manual-creation-guideline-v3.md` ★最新版（新商材作成の完全ガイド）
- `docs/manual-creation-guideline-v2.md` UI仕様詳細（GASダイアログコンポーネント）
- `docs/manual-creation-guideline.md` 旧版（データ構造・型定義の参照用）

---

## 設計思想

### スプレッドシート中心の設計
本体はスプレッドシート+GAS。Next.jsサイトは補助（閲覧用ビュー）。

**理由**: 担当者が直接メンテナンスできる。コード変更不要。

### GASの2つの機能
- **AIプロンプト生成**: データ+プロンプト → AIに貼り付け → AI出力を使う
- **フォーマット生成**: データ+テンプレート → そのまま使える定型文

### 基本セット構成
- プロンプトシート（AIプロンプト管理）
- 設定シート（担当者名等の設定値）
- フォーム連携時: 回答シート + 原本シート

### 入力データの永続化
ダイアログで入力したデータは一時的ではなく、スプレッドシートに保存して再利用する。

**フロー:**
1. 貼り付け → 対象シートのセルに保存
2. 次回開く → セルから読み込み → フィールドに自動入力
3. 後続フローでも同じデータを参照可能

---

## 商材別業務一覧

| 商材 | 業務数 | 進捗 |
|------|--------|------|
| ツナゲル | 14 | GAS実装済み |
| バツグン | 5 | 基本情報のみ |
| HP制作 | 8 | 基本情報のみ |
| LP制作 | 5 | 基本情報のみ |
| SNS広告 | 5 | 基本情報のみ |
| PV制作 | 5 | 基本情報のみ |
| パンフ | 3 | 基本情報のみ |
| ロゴ | 3 | 基本情報のみ |
| 月刊Sing | 4 | 基本情報のみ |
| **合計** | **52** | - |

---

## GASメニュー構成（ツナゲル）

```
０.⚙️ 設定
├── 👥 メンバー編集
├── 📝 業務担当者編集
├── 📁 フォルダ設定編集
├── ─────────────
├── 📄 プロンプト編集
├── ─────────────
├── 📋 設定シートを作成
├── 📝 プロンプトシートを作成
└── 📊 企業情報一覧を作成

１.📋 企業情報入力
├── 📥 企業情報入力（ワークス貼り付け）
├── 📢 受注・キックオフ連絡
├── 📩 先方へ日程調整・フォーム記入依頼メール
├── ─────────────
├── 🏢 企業情報編集
├── ─────────────
└── 📊 企業情報一覧反映

２.📋 初回打ち合わせ
├── 🆕 新規ヒアリングシート作成（フォーム回答から）
├── 🆕 新規ヒアリングシート作成（手動）
├── ─────────────
├── 📂 新規フォルダ作成（企業シートから）
├── 🆕 新規フォルダ作成（手動）
├── ─────────────
├── 📥 フォーム回答を既存シートに転記
├── ─────────────
├── 📋 最近作成した企業フォルダ一覧
├── ─────────────
├── 🎨 テンプレート初期設定
└── ⚙️ 親フォルダを設定

３.📝 議事録作成
├── （プロンプトシートから動的生成）
├── ─────────────
├── 📋 文字起こしを整理（プロンプト生成）
├── 📥 AI出力を転記
├── ─────────────
├── 📄 プロンプトシートを作成
├── 🔄 サンプルプロンプトを追加
└── ❓ 使い方

４.📝 構成案作成
├── 📋 構成案を作成（プロンプト生成）
├── ─────────────
├── 📤 ペアソナ/エンゲージ形式に変換
├── 📤 ワークス報告用に変換
├── 📤 撮影指示書に変換
├── ─────────────
├── 📸 撮影日程確定報告
├── ─────────────
└── 🔧 シートデータ確認

📨 連絡フォーマット
├── 📋 日程確定報告
├── ─────────────
├── 📷 撮影日程確認
├── 🔔 参加者リマインド
├── ─────────────
├── 🎬 撮影指示連絡
├── 📸 撮影日程確定報告
└── 📝 議事録共有
```

---

## GASファイル構成

```
docs/gas/tsunageru/
├── commonStyles.js           # ★共通スタイル定義
├── settingsSheet.js          # 0.設定シート管理
├── hearingSheetManager.js    # メイン（onOpen含む）2.初回打ち合わせ
├── companyInfoManager.js     # 1.企業情報入力
├── promptDialog.js           # 3.議事録作成
├── compositionDraftGenerator.js # 4.構成案作成
├── contactFormats.js         # 連絡フォーマット
├── transcriptToHearingSheet.js  # 文字起こし転記（3に統合）
├── createShootingFolder.js   # 撮影フォルダ作成（2に統合）
├── companyCueGenerator.js    # 企業カンペ作成
└── sheetStructureChecker.js  # メンテナンス用
```

---

## Next.jsサイト共通化（src/lib/data/common/）

商材共通のマニュアル・テンプレートを切り出し、tsunageru.ts等から参照する構成。

```
src/lib/data/common/
├── index.ts
├── manuals/
│   ├── index.ts
│   ├── gas-auth.ts           # GAS認証フロー説明
│   ├── notta.ts              # NOTTA使い方（起動・終了・準備確認）
│   └── works-reaction.ts     # ワークスリアクションルール
└── templates/
    ├── index.ts
    ├── order-notification.ts     # 受注連絡（商材名を引数で渡す）
    ├── schedule-confirm.ts       # 日程確定報告
    ├── reminder.ts               # リマインド
    ├── shooting-request.ts       # 撮影日程確認
    ├── shooting-instruction.ts   # 撮影指示
    ├── minutes-share.ts          # 議事録共有
    ├── fb-report.ts              # FB報告テンプレート（3商材共通）
    └── shooting-checklist.ts     # 撮影時チェックリスト（2商材共通）
```

**テンプレート関数の使い方:**
```typescript
// 商材名を渡すだけで使える
createOrderNotificationTemplate("ツナゲル", "12ヶ月")
createOrderNotificationTemplate("HP制作", "制作")

// 引数なしで呼び出し
createScheduleConfirmTemplate()
createReminderTemplate()

// 定数として直接参照（Task.formatで使用）
format: FB_REPORT_TEMPLATE,      // ツナゲル/バツグン/HP共通
format: SHOOTING_CHECKLIST,      // ツナゲル/バツグン共通
```

---

## ヒアリングシート構成

### Part① 基本情報（フォーム回答から自動転記）
企業名、担当者名、業種、所在地、従業員数など

### Part② ヒアリング情報（打ち合わせ時記入）
- 会社紹介（私たちについて、社長挨拶、会社の魅力、雰囲気）
- 社員の声（最低2名）
- 求人写真
- 重要セクション（★★★）
- 募集情報
- 管理情報
- スカウトメール設定
- **撮影準備**（撮影場所、駐車場、当日担当者、緊急連絡先、必要備品、撮影日時、集合時間）

### Part③ 処理データ（システム管理）
- 撮影素材フォルダURL
- メインフォルダURL
- 文字起こし原文
- 議事録
- 構成案
- ペアソナ/エンゲージ
- 撮影指示書
- 企業カンペURL

---

## 設定シート構成

| 列 | 内容 |
|----|------|
| A-B列 | メンバー一覧 |
| D-F列 | 業務担当者 |
| H-I列 | フォルダ設定 |
| K列 | 企業情報項目 |
| M-N列 | 保存キーマッピング（プロンプト名→Part③保存先） |
| P-Q列 | Part③構成（ラベル名、行数） |

---

## 確定UI一覧

| 項目 | 仕様 |
|------|------|
| ダイアログ横幅 | 700px |
| ダイアログ高さ | 750px（基本値） |
| 担当者選択 | コンパクトドロップダウン |
| 企業選択 | カスタムドロップダウン（チェック・ハイライト・アクティブバッジ） |
| テンプレート表示 | 白背景+枠線、コピーボタンはタイトル行右端 |
| プレビューUI | カード形式、緑コピーボタン |

---

## ワークスのスタンプルール

| ルール | 説明 |
|--------|------|
| ①完了していないならスタンプを押さない | スタンプ = 完了の意思表示 |
| ②5分以上かかるものはタスク・カレンダーに落とし込んでからスタンプ | すぐ対応できないものは先にタスク化 |
| ③既読したらOKスタンプ → 完了したらグッドスタンプに変更 | 👌（OK）= 確認した、対応中 / 👍（グッド）= 完了した |

---

## 撮影関連情報フロー

```
① 日程調整メール
   └→ 「撮影日程を打ち合わせ時に決められれば」+ インタビュイー確認依頼

② 初回打ち合わせ
   └→ 撮影場所、駐車場、当日担当者、緊急連絡先等を聞く

③ 議事録プロンプト
   └→ AIが文字起こしから撮影関連情報も抽出して出力

④ 文字起こし→ヒアリングシート転記
   └→ Part②に自動転記

⑤ 撮影日程確定報告ダイアログ
   └→ Part②から自動読み込み
```

---

## マニュアルのmd分離（実装中）

tsunageru.tsの`manualDraft`をmdファイルに分離し、メンテナンス性を向上させる。

**ファイル配置:**
```
docs/manuals/
├── common/          # 共通マニュアル（複数商材で共有）
│   └── *.md
└── tsunageru/       # 商材固有マニュアル
    ├── 00-受注・ワークス立ち上げ.md
    ├── 01-初回打ち合わせ日程調整.md
    ...
    └── 14-月次FB打合せ.md
```

**読み込み関数:**
- `getManualByTaskNo(productId, taskNo)` → 商材固有マニュアル
- `getCommonManual(name)` → 共通マニュアル

**URL:**
- 商材固有: `/products/{productId}/tasks/{taskNo}/manual`
- 共通: `/manuals/common/{name}`

**移行済み共通マニュアル:**
- `/manuals/common/notta` ← 旧 `/manuals/notta` から移行

**使用パッケージ:**（インストール済み）
```bash
npm install react-markdown remark-gfm rehype-raw
```

**実装済み:**
- [x] パッケージインストール
- [x] ディレクトリ作成（docs/manuals/tsunageru/）
- [x] lib/manuals.ts作成（md読み込み関数）
- [x] ManualMarkdownRenderer.tsx作成（Client Component）
- [x] manual/page.tsx改修（Server Component方式）

**アーキテクチャ:** Server Component方式（ベストプラクティス）
```
manual/page.tsx (Server Component)
    ↓ getManualByTaskNo() で fs.readFile
    ↓ content を props で渡す
ManualMarkdownRenderer (Client Component)
    ↓ react-markdown でレンダリング
```

**残タスク:**
- [x] ~~マークダウンスタイル問題の修正~~ ✅完了
- [x] ~~全15タスクのmdファイル作成（No.0〜14）~~ ✅2026-01-13完了
- [x] ~~tsunageru.tsの`manualDraft`削除~~ ✅2026-01-13完了

**マニュアルmd分離: 完了**

---

## フロー・ガイドラインのmd分離（2026-01-13完了）

tsunageru.tsの`overallFlow`, `detailedFlow`, `memo`, `format`（ガイドライン）を外部mdファイルに分離。

**ファイル配置:**
```
docs/
├── flows/tsunageru/        # フロー
│   ├── overall-flow.md     # ← Task 5 overallFlow
│   ├── feedback-flow.md    # ← Task 14 memo
│   └── monthly-fb-flow.md  # ← Task 14 detailedFlow
└── guidelines/tsunageru/   # ガイドライン
    └── job-posting-guideline.md  # ← Task 9 format（差別化求人原稿ガイドライン）
```

**読み込み関数:**（lib/manuals.ts）
- `getFlow(productId, flowName)` → フロー読み込み
- `getGuideline(productId, guidelineName)` → ガイドライン読み込み

**UI対応:**
- `overall-flow/page.tsx` → Server Component化、mdファイル読み込み対応
- `flow/page.tsx` → Server Component化、mdファイル読み込み対応

**削減効果:**
- tsunageru.ts: 2,438行 → 1,825行（613行削減）

**フロー・ガイドラインmd分離: 完了**

---

## サイドメニュー実装（2026-01-13完了）

商材ページ（`/products/[id]`）に開閉式サイドメニューを実装。

**機能:**
- 全体フロー（商材レベル）へのリンク
- タスク一覧（アンカースクロール）
- マニュアル一覧（別タブで開く）
- フォーマット一覧（モーダル表示）

**コンポーネント構成:**
```
src/components/
├── Sidebar.tsx           # サイドメニュー本体
├── SidebarSection.tsx    # アコーディオンセクション
└── ProductPageLayout.tsx # 2カラムレイアウト管理
```

**特徴:**
- デスクトップ: 固定幅（w-64）、左右スライド式
- モバイル: 画面幅いっぱい、背景透過（95%）、スクロール後に自動閉じ
- lucide-reactでアイコン統一

**全体フローの配置変更:**
- 以前: Task 5に`hasOverallFlow`を設定
- 現在: 商材レベル（Product型）に`hasOverallFlow`を設定
- URL: `/products/{productId}/overall-flow`

**関連ファイル:**
- `src/app/products/[id]/page.tsx` - 2カラムレイアウト、ヘッダー改修
- `src/app/products/[id]/overall-flow/page.tsx` - 商材レベル全体フローページ
- `src/lib/data/index.ts` - Product型に`hasOverallFlow`追加

---

## ボタン表示問題の解決（2026-01-13完了）

**問題:**
md分離後、TaskCardの「マニュアル」「全体フロー」「詳細フロー」ボタンが表示されなかった。

**原因:**
`hasAnyDetail`変数が`manualDraft`, `overallFlow`, `detailedFlow`の存在をチェックしていたが、`hasManual`, `hasOverallFlow`, `hasDetailedFlow`フラグをチェックしていなかった。

**修正内容:**（TaskCard.tsx）
```typescript
// 修正前
const hasAnyDetail =
  task.manualDraft ||
  task.overallFlow ||
  task.detailedFlow || ...

// 修正後
const hasAnyDetail =
  task.manualDraft || task.hasManual ||
  task.overallFlow || task.hasOverallFlow ||
  task.detailedFlow || task.hasDetailedFlow || ...

// マニュアルボタン条件も修正
{(task.manualDraft || task.hasManual) && (...)}
```

---

## モバイル対応（2026-01-13完了）

商材ページとTaskCardのレスポンシブ対応を実装。

**対応内容:**
- ヘッダー: アイコン・タイトルサイズ調整、descriptionはmd以上で表示
- サイドメニュー: モバイルでは画面幅いっぱい、背景透過、スクロール後自動閉じ
- TaskCardヘッダー: モバイルでは縦並びレイアウト
- フローステップ: モバイルでは縦並び、矢印は「↓」に変更
- 余白: モバイルでは小さめに調整

---

## 使用パッケージ

```bash
# マークダウンレンダリング
npm install react-markdown remark-gfm rehype-raw

# アイコン
npm install lucide-react
```

---

## 将来の改善

### 「各種フォーマット」シートの作成
メールテンプレートなどのフォーマットを「各種フォーマット」シートから取得するように改善する。

**実装タスク:**
1. 設定メニューに「📋 各種フォーマットシートを作成」「📝 各種フォーマット編集」を追加
2. `initializeFormatSheet()` - 各種フォーマットシート作成関数
3. `showFormatEditDialog()` - 各種フォーマット編集ダイアログ
4. `getFormatFromSheet(formatName)` - フォーマット取得関数

---

## 開発コマンド

```bash
npx tsc --noEmit    # TypeScriptエラーチェック（コード変更後は必ず実行）
```

---

## 担当者一覧（ツナゲル）

| 担当者 | 色 | 主な業務 |
|--------|-----|---------|
| 渡邉 | グレー | 受注・立ち上げ、日程調整 |
| 河合 | ピンク | 打ち合わせ、原稿、編集 |
| 中尾文香 | 黄色 | 原稿執筆 |
| 川崎 | 水色 | 企画、撮影、FB |
| 下脇田 | 紫 | FB |
| 紺谷 | オレンジ | 応募対応 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-14 | フローステップUI微調整（カード幅w-40、余白調整、ボタン統一、タイトル左余白ml-1） |
| 2026-01-14 | フローステップタイトル改善（タイトル簡潔化、summary追加、ボタン絵文字削除） |
| 2026-01-14 | モバイルハンバーガーメニュー実装（ProductPageLayoutにヘッダー統合、Menu↔Xアニメーション） |
| 2026-01-14 | フローステップデザイン完了（FlowStep.summary追加、ステップ番号バッジ、丸枠矢印、サイズ統一） |
| 2026-01-13 | フローステップデザイン改善（途中）: Task型にsummary追加、lucide-react矢印導入 |
| 2026-01-13 | ガイドラインV3作成（新商材作成の完全ガイド、設計思想・共通概念・ルール・作り方） |
| 2026-01-13 | フォーマット共通化（FB_REPORT_TEMPLATE, SHOOTING_CHECKLIST）3商材で共有 |
| 2026-01-13 | モバイル対応（ヘッダー、サイドメニュー、TaskCard、フローステップ） |
| 2026-01-13 | サイドメニュー実装（Sidebar.tsx、SidebarSection.tsx、ProductPageLayout.tsx） |
| 2026-01-13 | 全体フローを商材レベルに移動（/products/{id}/overall-flow） |
| 2026-01-13 | lucide-reactインストール、アイコン統一 |
| 2026-01-13 | ボタン表示問題解決（hasAnyDetailにフラグ追加、マニュアルボタン条件修正） |
| 2026-01-13 | フロー・ガイドラインmd分離完了（docs/flows/, docs/guidelines/、613行削減） |
| 2026-01-13 | tsunageru.tsのmanualDraft全削除完了（md分離作業完了） |
| 2026-01-13 | 全15タスクのmdファイル作成完了（docs/manuals/tsunageru/に00〜14のマニュアル） |
| 2026-01-13 | マークダウンスタイル問題修正（globals.css、ManualMarkdownRenderer.tsx更新、engineer-course準拠） |
| 2026-01-13 | マニュアルmd分離実装（Server Component方式に変更、lib/manuals.ts、ManualMarkdownRenderer.tsx） |
| 2026-01-13 | マニュアルmd分離の設計決定（react-markdown + rehype-raw、HTML埋め込み対応） |
| 2026-01-13 | Next.jsサイト共通化（common/manuals, common/templates）、ワークススタンプルール追加 |
| 2026-01-13 | 撮影関連情報フロー実装、日程調整メール更新、GASメニュー名変更 |
| 2026-01-13 | 企業カンペ機能実装（3シート構成、5列化、チェックボックス） |
| 2026-01-13 | 撮影日程確定報告ダイアログ実装 |
| 2026-01-12 | Part③構成を設定シートで管理、保存機能追加 |
| 2026-01-12 | 全ダイアログをドロップダウンUI形式に統一 |
| 2026-01-12 | プロンプトシートにカテゴリ列追加 |
| 2026-01-11 | 企業選択UI共通化、commonStyles.js作成 |
| 2026-01-11 | GASメニュー構成変更、companyInfoManager.js新規作成 |
| 2026-01-10 | 入力データの永続化（Part③）、撮影フォルダ作成改善 |
| 2026-01-10 | settingsSheet.js作成、contactFormats.js作成 |
