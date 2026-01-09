# ツナゲル分析レポート

作成日: 2026-01-10
目的: 次世代セッションへの引き継ぎのため、ツナゲルに関する全情報を記録

---

## 1. 参照したファイル一覧

### ソースコード
- `src/lib/data/tsunageru.ts` - ツナゲルの業務データ（3890行）
- `src/lib/data/index.ts` - 型定義・担当者色設定（196行）
- `src/components/TaskCard.tsx` - 業務カードコンポーネント（460行）
- `src/components/ContentModal.tsx` - ポップアップモーダル（458行）

### GASスクリプト（docs/gas/）
- `hearingSheetManager.js`
- `transcriptToHearingSheet.js`
- `compositionDraftGenerator.js`
- `createShootingFolder.js`
- `promptDialog.js`
- `setupSheets.js`
- `sheetStructureChecker.js`
- `old-format-export.js`
- `new-format-export.js`
- `integrated-menu.js`
- `exportByCategory-v2.js`
- `formToInternalSheet.js`

### プロンプト（docs/prompts/）
- `composition-draft-prompt.md`
- `composition-converters.md`
- `googleform-creation-prompt.md`
- `googleform-creation-prompt-short.md`
- `job-posting-prompt.md`

### 画像（public/images/）
48ファイル確認（詳細は後述）

---

## 2. 型定義（src/lib/data/index.ts）

### 担当者色設定
```typescript
export const assigneeColors: Record<string, { bg: string; text: string; border: string; cardBgClass: string }> = {
  "青柳": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", cardBgClass: "card-bg-blue" },
  "河合": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300", cardBgClass: "card-bg-pink" },
  "中尾文香": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", cardBgClass: "card-bg-yellow" },
  "中尾": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", cardBgClass: "card-bg-yellow" },
  "清水": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", cardBgClass: "card-bg-green" },
  "川崎": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300", cardBgClass: "card-bg-cyan" },
  "下脇田": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", cardBgClass: "card-bg-purple" },
  "紺谷": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", cardBgClass: "card-bg-orange" },
  "渡邉": { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-400", cardBgClass: "card-bg-gray" },
};
```

### 担当者優先順位
```typescript
const assigneePriority: Record<string, number> = {
  "河合": 1,
  "川崎": 2,
  "中尾文香": 3,
  "中尾": 3,
  "下脇田": 4,
  "紺谷": 5,
  "清水": 6,
  "青柳": 7,
  "渡邉": 99,
};
```

### Task インターフェース
```typescript
export interface Task {
  no: string;
  category: string;
  name: string;
  assignee: string;
  nextTask?: string;
  nextAssignee: string;
  tools: string;
  deliverable: string;
  checkpoint: string;
  hasManual: boolean;
  issues: string;
  trigger?: string;
  memo?: string;
  simulation?: string;
  manualDraft?: string;
  overallFlow?: string;
  format?: string;
  detailedFlow?: string;
  nottaManual?: string;
  relatedSheetUrl?: string;
  relatedLinks?: RelatedLink[];
  flowSteps?: FlowStep[];
}
```

### RelatedLink インターフェース
```typescript
export interface RelatedLink {
  label: string;
  url: string;
  type: 'sheet' | 'drive' | 'site' | 'other';
}
```

### ImageWithCaption / ImageItem
```typescript
export interface ImageWithCaption {
  url: string;
  caption?: string;
}
export type ImageItem = string | ImageWithCaption;
```

### FlowStepLink インターフェース
```typescript
export interface FlowStepLink {
  label: string;
  url?: string;
  content?: string;
  type: 'link' | 'popup';
  images?: ImageItem[];
  hasInputField?: boolean;
  inputSectionTitle?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputNote?: string;
  template?: string;
}
```

### FlowStep インターフェース
```typescript
export interface FlowStep {
  label: string;
  links?: FlowStepLink[];
  description?: string;
  images?: ImageItem[];
  relatedTaskNo?: string;
  excludeSelf?: boolean;
}
```

### Product インターフェース
```typescript
export interface Product {
  id: string;
  name: string;
  taskCount: number;
  description: string;
  tasks: Task[];
  issues: string[];
}
```

---

## 3. ツナゲル商材情報

```typescript
id: "tsunageru"
name: "ツナゲル"
taskCount: 14
description: "採用求人原稿作成、インタビュー動画、応募対応、FB"
```

### issues配列（商材レベル）
```
- 情報共有フォーマット・ヒアリングシート事前送付出来ていないことによる、打合せ時間の工数増加
- ヒアリングシートの改善必要
- NOTTA使用マニュアル
- フォルダ格納マニュアル(フォルダ名＋フォルダの作り方)
- 現地打合せマニュアル・構成変更必要・撮影マニュアルの作成(撮り方・画面表示方法)
- 撮影マニュアル
- データ共有マニュアル(ドライブの使い方＋テンプレ)
- 編集マニュアル
- 差別化された原稿になっていない
- メールテンプレ
- キックオフMTGマニュアル
- マニュアル
- 週間集計マニュアル＋FB資料テンプレート　FB資料作成マニュアル
- 週間集計データの共有テンプレ
- FBマニュアル　FB共有テンプレ
```

---

## 4. 全14業務の詳細データ

### 業務1: No.0-1 受注・ワークス立ち上げ

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "0-1" |
| category | "受注・立ち上げ" |
| name | "受注・ワークス立ち上げ" |
| assignee | "渡邉" |
| nextAssignee | "渡邉" |
| tools | "ワークス" |
| deliverable | "企業グループ作成完了" |
| checkpoint | "必要情報の入力漏れ" |
| hasManual | true |
| issues | "企業基本情報の共有フォーマット整備" |

**simulation**
```
【業務内容】
1. 受注確定
2. ワークスで企業グループを作成
3. 企業基本情報の共有フォーマットに記入

【トリガー（次工程へ）】
→ ワークスで担当者メンション + 必要情報フォーマット送信
```

**manualDraft**: あり（受注・ワークス立ち上げマニュアル）

**format**: あり（企業基本情報の共有フォーマット）

**flowSteps**: 2ステップ
1. `label: "ワークスで企業グループを作成"` + description（手順詳細）
2. `label: "フォーマットを記入しグループに送信"` + description + images（1枚） + links（1つのpopup）

**relatedLinks**: なし

---

### 業務2: No.0-2 初回打ち合わせ日程調整

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "0-2" |
| category | "受注・立ち上げ" |
| name | "初回打ち合わせ日程調整" |
| assignee | "渡邉" |
| nextAssignee | "河合" |
| tools | "メール・カレンダー" |
| deliverable | "日程確定" |
| checkpoint | "参加者全員の日程確認" |
| hasManual | true |
| issues | "先方用初回打ち合わせシート作成が必要" |

**simulation**
```
【業務内容】
1. 先方と初回打ち合わせの候補日程を調整
2. 参加者（企業担当・渡邉・河合）の日程を確認
3. 日程確定後、カレンダー登録

【事前アクション】
→ 先方へヒアリングシート（黄色部分）の事前記入を依頼
※先方用初回打ち合わせシートを送付

【トリガー（次工程へ）】
→ 日程確定報告（カレンダー更新 or スプレッドシート更新）
```

**manualDraft**: あり

**flowSteps**: 4ステップ
1. `label: "先方へ日程調整+フォーム記入依頼"` + description（メール例文）+ links（Googleフォームlink）
2. `label: "日程確定・カレンダー登録"`（labelのみ）
3. `label: "ワークスで日程を共有"` + description + images（1枚）
4. `label: "リアクション確認"` + description

**relatedLinks**: なし

---

### 業務3: No.0-2-2 打ち合わせ前準備

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "0-2-2" |
| category | "受注・立ち上げ" |
| name | "打ち合わせ前準備" |
| assignee | "河合" |
| nextAssignee | "渡邉, 河合" |
| tools | "スプレッドシート・GAS" |
| deliverable | "ヒアリングシート作成完了・撮影日程調整済み" |
| checkpoint | "フォーム回答の確認・撮影担当者との日程調整" |
| hasManual | true |
| issues | "" |

**simulation**
```
【業務内容】
1. フォーム回答を確認し、GASでヒアリングシートを作成
2. 撮影担当者に撮影可能日程を5候補程度確認

【トリガー（次工程へ）】
→ ヒアリングシート作成完了 + 撮影可能日程の確保
```

**manualDraft**: あり

**flowSteps**: 6ステップ
1. `label: "フォーム回答を確認"` + description + links（フォーム回答シートlink）
2. `label: "GASでヒアリングシート作成"` + description（詳細手順、パターンA/B、企業名ルール、認証フロー） + images（8枚、全てキャプション付き） + links（ヒアリングシートlink）
3. `label: "撮影可能日5候補を確認"` + relatedTaskNo: "3" + description
4. `label: "参加者へリマインド"` + relatedTaskNo: "0-3" + excludeSelf: true + description
5. `label: "リアクション確認"` + description
6. `label: "NOTTA録画要領の確認"` + description + images（2枚） + links（NOTTAlink）

**relatedLinks**: なし

---

### 業務4: No.0-3 オンライン初回打ち合わせ

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "0-3" |
| category | "受注・立ち上げ" |
| name | "オンライン初回打ち合わせ" |
| assignee | "渡邉, 河合" |
| nextAssignee | "河合" |
| tools | "Google Meet・ヒアリングシート・NOTTA" |
| deliverable | "ヒアリングシート記入済み・議事録" |
| checkpoint | "要件漏れ・撮影日程確定" |
| hasManual | true |
| issues | "ヒアリングシートの改善必要" |
| nottaManual | "enabled" |

**simulation**
```
【参加者】
企業担当・渡邉・河合

【業務内容】
1. 求人原稿ヒアリング：ヒアリングシート使用
2. 撮影日程の調整：川崎と連携
3. NOTTA等で議事録作成

【トリガー（次工程へ）】
→ 議事録のワークスグループ共有
```

**manualDraft**: あり（詳細な60分打ち合わせマニュアル）

**flowSteps**: 6ステップ
1. `label: "Meetに入ってNOTTAを起動"` + description（詳細手順） + images（7枚） + links（NOTTAlink）
2. `label: "ミーティング開始"` + description（60分マニュアル） + links（ヒアリングシートlink）
3. `label: "ヒアリングシートに記入"` + description + links（ヒアリングシートlink）
4. `label: "撮影日程調整・カレンダー登録"` + description
5. `label: "NOTTAの録音を確認"` + description（終了・ダウンロード手順） + images（3枚） + links（NOTTAlink）
6. `label: "営業担当とすり合わせ"` + description

**relatedLinks**: なし

---

### 業務5: No.0-3-2 打ち合わせ後対応

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "0-3-2" |
| category | "受注・立ち上げ" |
| name | "打ち合わせ後対応" |
| assignee | "河合" |
| nextAssignee | "河合" |
| tools | "ワークス・Googleドライブ" |
| deliverable | "議事録共有・撮影フォルダ作成完了" |
| checkpoint | "撮影日程の連絡漏れ・フォルダ作成漏れ" |
| hasManual | true |
| issues | "" |

**simulation**
```
【業務内容】
1. 撮影日程を川崎に連絡
2. 議事録をワークスに共有
3. 撮影データの共有フォルダを作成

【トリガー（次工程へ）】
→ 議事録共有 + フォルダ作成完了
```

**flowSteps**: 5ステップ
1. `label: "撮影フォルダ作成"` + description（GAS手順、フォルダ構成） + images（4枚、全てキャプション付き） + links（ヒアリングシートlink）
2. `label: "撮影担当者へ連絡"` + relatedTaskNo: "3" + description（例文） + images（2枚、キャプション付き）
3. `label: "リアクション確認"` + description
4. `label: "議事録を作成"` + description（5ステップ手順） + images（5枚、全てキャプション付き） + links（1つのpopup、hasInputField: true、template付き）
5. `label: "議事録をワークスで共有"` + description（3ステップ手順） + images（3枚、全てキャプション付き） + links（1つのpopup、hasInputField: true、template付き）

**relatedLinks**: なし

---

### 業務6: No.1 ヒアリング内容整理

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "1" |
| category | "採用求人原稿作成" |
| name | "ヒアリング内容整理" |
| assignee | "河合" |
| nextAssignee | "河合, 中尾文香, 川崎" |
| tools | "スプレッドシート" |
| deliverable | "構成案" |
| checkpoint | "要件漏れ" |
| hasManual | true |
| issues | "情報共有フォーマット・ヒアリングシート事前送付出来ていないことによる、打合せ時間の工数増加\nヒアリングシートの改善必要\nNOTTA使用マニュアル\nフォルダ格納マニュアル(フォルダ名＋フォルダの作り方)" |

**memo**: あり（議事録フォーマット詳細）

**simulation**
```
【前工程からのトリガー】
議事録のワークスグループ共有を受けて開始

【業務内容】
1. NOTTAまたは録音データから議事録を確認
2. ヒアリングシートへ転記
3. 構成案の作成

【トリガー（次工程へ）】
→ 構成案をワークスで共有
```

**manualDraft**: あり（詳細なマニュアル）

**overallFlow**: あり（ツナゲル業務全体フロー、Phase 0〜5の詳細）

**format**: あり（ペアソナ求人原稿 構成案テンプレート、詳細フォーマット）

**flowSteps**: 4ステップ
1. `label: "文字起こしを整理"` + description（4ステップ手順） + images（4枚、全てキャプション付き） + links（ヒアリングシートlink）
2. `label: "ヒアリングシートへ転記"` + description（3ステップ手順、安全機能説明） + images（4枚、全てキャプション付き） + links（ヒアリングシートlink）
3. `label: "構成案を作成"` + description + links（2つのpopup: 構成案テンプレート、掲載画像サンプル）
4. `label: "構成案をワークスで共有"` + description + links（1つのpopup: 共有フォーマット）

**relatedLinks**: 2件
- ヒアリングシート (sheet)
- スプレッドシート (sheet)

---

### 業務7: No.2 企画・質問設計

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "2" |
| category | "インタビューショート動画" |
| name | "企画・質問設計" |
| assignee | "川崎" |
| nextAssignee | "川崎" |
| tools | "企業カンペ" |
| deliverable | "質問案" |
| checkpoint | "採用訴求一致" |
| hasManual | true |
| issues | "現地打合せマニュアル・構成変更必要・撮影マニュアルの作成(撮り方・画面表示方法)" |

**memo**: あり（ChatGPTリンク、タブレット購入メモ）

**simulation**: `現地打合せ：企業担当・川崎　撮影の流れ、撮影場所の選定、カンペ作成`

**manualDraft**: あり

**flowSteps**: 4ステップ
1. `label: "構成案を確認"`（labelのみ）
2. `label: "質問案を作成"`（labelのみ）
3. `label: "企業カンペを作成"` + links（1つのlink: カンペフォルダ）
4. `label: "現地打合せ実施"`（labelのみ）

**relatedLinks**: 2件
- 企業カンペ参考 (site)
- 企業カンペ (drive)

---

### 業務8: No.3 撮影

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "3" |
| category | "インタビューショート動画" |
| name | "撮影" |
| assignee | "川崎" |
| nextAssignee | "河合" |
| tools | "AIカメラアプリ" |
| deliverable | "動画素材" |
| checkpoint | "音声" |
| hasManual | true |
| issues | "撮影マニュアル\nデータ共有マニュアル(ドライブの使い方＋テンプレ)" |

**memo**: あり

**simulation**: `撮影\n撮影データチェック\n撮影者が撮影データの納品：共有ドライブの指定フォルダ内に指定のファイル名で格納\n河合がローカルフォルダにデータダウンロードしドライブに元データ格納`

**manualDraft**: あり（撮影マニュアル（縦動画・ショート動画運用向け）、11セクション、参考URL付き）

**format**: あり（撮影時チェックリスト、8カテゴリ、判定ルール付き）

**flowSteps**: 3ステップ
1. `label: "撮影（縦動画9:16、HD60FPS）"`（labelのみ）
2. `label: "撮影データチェック"`（labelのみ）
3. `label: "共有ドライブに格納"`（labelのみ）

**relatedLinks**: なし

---

### 業務9: No.5 編集

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "5" |
| category | "インタビューショート動画" |
| name | "編集" |
| assignee | "河合" |
| nextAssignee | "河合" |
| tools | "Powerdirector" |
| deliverable | "ショート動画" |
| checkpoint | "テロップ誤字" |
| hasManual | true |
| issues | "編集マニュアル" |

**simulation**: `編集データを指定のドライブに指定ファイル名で格納`

**manualDraft**: あり（動画編集マニュアル）

**flowSteps**: 4ステップ
1. `label: "撮影データをダウンロード"`（labelのみ）
2. `label: "Powerdirectorで編集"`（labelのみ）
3. `label: "テロップ・BGM追加"`（labelのみ）
4. `label: "書き出し・格納"` + links（1つのlink: 管理シート）

**relatedLinks**: 1件
- 編集データ管理 (sheet)

---

### 業務10: No.4 原稿執筆

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "4" |
| category | "採用求人原稿作成" |
| name | "原稿執筆" |
| assignee | "河合, 中尾文香" |
| nextAssignee | "河合" |
| tools | "エンゲージ・Pairsona" |
| deliverable | "原稿" |
| checkpoint | "表現NG" |
| hasManual | true |
| issues | "差別化された原稿になっていない" |

**memo**: あり（各種URL、原稿マニュアル概要）

**simulation**: あり（詳細フロー）

**manualDraft**: あり（差別化型・求人原稿作成マニュアル、7セクション）

**format**: あり（差別化求人原稿ガイドライン、7ステップ）

**flowSteps**: 3ステップ
1. `label: "ヒアリングシートを元にライティング"` + links（1つのlink: ヒアリングシート）
2. `label: "動画をYouTube経由で挿入（Pairsona）または直接挿入（エンゲージ）"` + links（2つのlink: Pairsona, エンゲージ）
3. `label: "原稿リンク/スクショをワークスで共有"`（labelのみ）

**relatedLinks**: 4件
- 原稿管理シート (sheet)
- Pairsona (site)
- エンゲージ（企業側）(site)
- エンゲージ（求職者側）(site)

---

### 業務11: No.- 企業担当へ確認依頼

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "-" |
| category | "作成原稿の確認" |
| name | "企業担当へ確認依頼" |
| assignee | "河合" |
| nextAssignee | "河合" |
| tools | "メール" |
| deliverable | "原稿リンク" |
| checkpoint | "原稿内容に相違ないか" |
| hasManual | true |
| issues | "メールテンプレ" |

**simulation**
```
先方へ原稿の確認
修正箇所の有無の確認
修正箇所の修正対応
キックオフの日程調整
```

**manualDraft**: あり（メールテンプレート含む）

**flowSteps**: 4ステップ
1. `label: "原稿リンクを準備"`（labelのみ）
2. `label: "先方へ確認依頼メール送信"`（labelのみ）
3. `label: "修正対応（必要な場合）"`（labelのみ）
4. `label: "最終承認取得"`（labelのみ）

**relatedLinks**: なし

---

### 業務12: No.- 今後の担当者の共有とスケジュール共有

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "-" |
| category | "キックオフMTG" |
| name | "今後の担当者の共有とスケジュール共有" |
| assignee | "河合" |
| nextAssignee | "紺谷" |
| tools | "メール" |
| deliverable | "原稿リンク" |
| checkpoint | "原稿内容に相違ないか" |
| hasManual | true |
| issues | "キックオフMTGマニュアル" |

**memo**: `メールテンプレ`

**simulation**: `今後の運用担当者と次回FB日程の調整`

**manualDraft**: あり（MTGアジェンダ、担当者一覧含む）

**flowSteps**: 5ステップ
1. `label: "原稿の最終確認・公開準備"`（labelのみ）
2. `label: "今後の担当者を共有"`（labelのみ）
3. `label: "運用スケジュールを共有"`（labelのみ）
4. `label: "次回FB日程を確定"`（labelのみ）
5. `label: "議事録をワークスに共有"`（labelのみ）

**relatedLinks**: なし

---

### 業務13: No.6 企業・応募者へ連絡

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "6" |
| category | "応募対応連絡" |
| name | "企業・応募者へ連絡" |
| assignee | "紺谷" |
| nextAssignee | "河合" |
| tools | "エンゲージ・Pairsona・ワークス" |
| deliverable | "通話ログ・メール" |
| checkpoint | "フロー遵守" |
| hasManual | true |
| issues | "マニュアル" |

**simulation**: `応募対応フロー使用し応募者への連絡・企業への連絡`

**manualDraft**: あり（応募対応フロー、メールテンプレート含む）

**flowSteps**: 5ステップ
1. `label: "応募を確認（エンゲージ/Pairsona）"`（labelのみ）
2. `label: "応募者へ初回連絡（24時間以内）"`（labelのみ）
3. `label: "企業へ応募報告"`（labelのみ）
4. `label: "面接日程調整"`（labelのみ）
5. `label: "結果報告"`（labelのみ）

**relatedLinks**: なし

---

### 業務14: No.- 週間データの集計と資料作成

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "-" |
| category | "FB資料作成" |
| name | "週間データの集計と資料作成" |
| assignee | "河合" |
| nextAssignee | "川崎, 下脇田" |
| tools | "スプレッドシート・Canva" |
| deliverable | "スプレッドシート集計データ" |
| checkpoint | "数値推移" |
| hasManual | true |
| issues | "週間集計マニュアル＋FB資料テンプレート　FB資料作成マニュアル\n週間集計データの共有テンプレ" |

**simulation**
```
エンゲージログインして週間データの集計　閲覧数・イイね数・応募数
集計データの共有を各企業ワークスグループに共有
```

**manualDraft**: あり

**flowSteps**: 4ステップ
1. `label: "エンゲージで週間データ取得"`（labelのみ）
2. `label: "スプレッドシートに記入"` + links（1つのlink: 集計シート）
3. `label: "数値推移チェック"`（labelのみ）
4. `label: "ワークスグループに共有"`（labelのみ）

**relatedLinks**: 1件
- 週間データ集計シート (sheet)

---

### 業務15: No.7 月次FB打合せ

**基本情報**
| フィールド | 値 |
|-----------|-----|
| no | "7" |
| category | "月次FB" |
| name | "月次FB打合せ" |
| assignee | "川崎, 下脇田" |
| nextAssignee | "河合" |
| tools | "資料テンプレ" |
| deliverable | "FB資料" |
| checkpoint | "指標理解" |
| hasManual | true |
| issues | "FBマニュアル　FB共有テンプレ" |

**memo**: あり（Sing顧客フィードバックフロー詳細、30分タイムライン）

**simulation**: `FBの実施＋ネクストFB日程の確定\nFB議事録をFBグループに共有テンプレを使用し報告`

**manualDraft**: あり（月次FBマニュアル、FB承認フロー含む）

**format**: あり（FB報告テンプレート）

**detailedFlow**: あり（月次FB（フィードバック）フロー、タイムライン詳細）

**flowSteps**: 5ステップ
1. `label: "FB資料を3稼働日前までに作成・承認"`（labelのみ）
2. `label: "FB実施（30分）"`（labelのみ）
3. `label: "課題解決を当日内に完了"`（labelのみ）
4. `label: "FB議事録をグループに共有"`（labelのみ）
5. `label: "次回FB日程を確定"`（labelのみ）

**relatedLinks**: なし

---

## 5. 画像ファイル一覧（public/images/）

### 認証・GAS関連
- `gas-menu.png`
- `gas-manual-create.png`
- `gas-auth-1.png`
- `gas-auth-2.png`
- `gas-auth-3.png`
- `gas-auth-4.png`
- `gas-auth-5.png`
- `gas-form-select-dialog.png`
- `gas-folder-menu.png`
- `gas-folder-complete.png`
- `gas-folder-history.png`
- `gas-folder-history-menu.png`
- `gas-folder-history-new.png`

### NOTTA関連
- `notta-home.png`
- `notta-webmeeting.png`
- `notta-step1-home.png`
- `notta-step2-dialog.png`
- `notta-step3-calendar-copy.png`
- `notta-step4-url-paste.png`
- `notta-step5-bot-joined.png`
- `notta-step6-approve-wait.png`
- `notta-step8-approve.png`
- `notta-step9-recording.png`
- `notta-step11-end-meeting.png`
- `notta-step12-ai-processing.png`
- `notta-step13-download.png`

### プロンプトダイアログ・AI関連
- `prompt-menu-select.png`
- `prompt-dialog-input.png`
- `ai-prompt-paste.png`
- `ai-output-copy.png`
- `ai-output-check.png`
- `ai-gijiroku-input.png`
- `ai-gijiroku-output.png`

### ワークス関連
- `works-menu-select.png`
- `works-dialog-input.png`
- `works-post-send.png`
- `works-schedule-share.png`
- `lineworks-sample.png`

### 文字起こし転記関連
- `transcript-menu-select.png`
- `transcript-dialog.png`
- `transcript-ai-paste.png`
- `transcript-ai-output.png`
- `transfer-menu-select.png`
- `transfer-dialog.png`
- `transfer-confirm.png`
- `transfer-result.png`

### その他
- `notta-step10-3split.jpg`（レイアウト参考）

### サンプル画像（public/images/sample/）
- `cowerk-thumbnail.webp`
- `cowerk-01.webp`
- `cowerk-02.webp`
- `cowerk-03.webp`
- `cowerk-04.webp`
- `cowerk-05.webp`

---

## 6. TaskCard.tsx の主要機能

### フローステップのカテゴリ判定（getFlowStepClass関数）
| カテゴリ | CSSクラス | 判定キーワード |
|---------|----------|---------------|
| 共有・送信系 | flow-step-share | 共有, 送信, 送付, メンション, 報告, 提出, リマインド |
| 確認・チェック系 | flow-step-check | 確認, チェック, 取得, 抽出, ダウンロード |
| 作成・入力系 | flow-step-create | 作成, 記入, 入力, ライティング, 編集, 追加, 準備, 書き出し, 格納 |
| 打合せ・連絡系 | flow-step-meeting | 打合せ, 連絡, 実施, FB, MTG, 調整, 面接 |
| ツール操作系 | flow-step-tool | ワークス, エンゲージ, Pairsona, Powerdirector, ドライブ, YouTube, NOTTA, スプレッドシート |
| 撮影系 | flow-step-shoot | 撮影 |
| 承認・完了系 | flow-step-approve | 承認, 完了, 確定, 解決, 修正, 対応 |
| 提示・候補系 | flow-step-suggest | 提示, 候補 |
| デフォルト | flow-step-default | 上記に該当しない |

### getRelatedAssignee関数
- relatedTaskNoから関連タスクの担当者を動的に取得
- excludeSelf=trueの場合、現在の業務担当者を除外

### 表示されるボタン（hasAnyDetailがtrueの場合）
- マニュアル（manualDraftがある場合）→ 別タブ
- 詳細フロー（detailedFlowがある場合）→ 別タブ
- 全体フロー（overallFlowがある場合）→ 別タブ
- シミュレーション（simulationがある場合）→ ポップアップ
- フォーマット（formatがある場合）→ ポップアップ
- メモ（memoがある場合）→ ポップアップ
- NOTTAマニュアル（nottaManualがある場合）→ 別タブ
- relatedLinks（複数対応）→ 各タイプ別色分け

---

## 7. ContentModal.tsx の主要機能

### 入力フィールド付きテンプレート機能
- `hasInputField`: trueで入力フィールドを表示
- `inputSectionTitle`: アコーディオンタイトル
- `inputLabel`: 入力フィールドのラベル
- `inputPlaceholder`: プレースホルダー
- `inputNote`: 注意書き
- `template`: テンプレート（`{{input}}`が入力値に置換される）

### 機能
- アコーディオン：テンプレート全文を展開表示
- テンプレートコピー：テンプレートのみコピー
- プレビュー：入力値を埋め込んだ結果を表示
- 完成版コピー：プレビューをコピー

### 画像表示機能
- キャプション対応（ImageWithCaption型）
- クリックで拡大表示
- Escキーで閉じる

### 埋め込みリンク機能
- `embeddedLinks`: ポップアップ内にボタンを表示
- type: 'link'の場合は外部リンク
- type: 'popup'の場合は入れ子ポップアップ

---

## 8. 業務ナンバリングの現状

| 配列順 | No | 業務名 | 備考 |
|--------|-----|--------|------|
| 0 | 0-1 | 受注・ワークス立ち上げ | |
| 1 | 0-2 | 初回打ち合わせ日程調整 | |
| 2 | 0-2-2 | 打ち合わせ前準備 | 枝番 |
| 3 | 0-3 | オンライン初回打ち合わせ | |
| 4 | 0-3-2 | 打ち合わせ後対応 | 枝番 |
| 5 | 1 | ヒアリング内容整理 | |
| 6 | 2 | 企画・質問設計 | |
| 7 | 3 | 撮影 | |
| 8 | 5 | 編集 | **No.4より後に配置** |
| 9 | 4 | 原稿執筆 | **No.5より前に配置** |
| 10 | - | 企業担当へ確認依頼 | Noなし |
| 11 | - | 今後の担当者の共有とスケジュール共有 | Noなし |
| 12 | 6 | 企業・応募者へ連絡 | |
| 13 | - | 週間データの集計と資料作成 | Noなし |
| 14 | 7 | 月次FB打合せ | |

---

## 9. GASスクリプトの機能概要

### hearingSheetManager.js
- 新規作成（フォーム回答から）
- 新規作成（手動）
- フォーム回答を既存シートに転記
- テンプレート初期設定
- JSONでダウンロード
- テキストでダウンロード

### transcriptToHearingSheet.js
- 文字起こしを整理（プロンプト生成）
- AI出力を転記
- マッピング確認

### compositionDraftGenerator.js
- 構成案を生成（プロンプト生成）
- ペアソナ/エンゲージ形式に変換
- ワークス報告用に変換
- 撮影指示書に変換
- シートデータ確認

### createShootingFolder.js
- 新規フォルダ作成
- 最近作成したフォルダ一覧
- 親フォルダを設定

### promptDialog.js
- プロンプトシートから読み込んでダイアログ表示
- 入力フィールド付きテンプレート機能

### setupSheets.js
- setupPromptSheet(): プロンプトシート作成
- showSettingsDialog(): 担当者設定ダイアログ
- getSettingsFromSheet(): 設定シートから担当者情報取得
- replacePlaceholders(): プレースホルダー置換

---

## 10. 参照URL一覧（tsunageru.ts内）

### Googleフォーム
- ユーザー用: https://forms.gle/gXE12JNfsN9JGiPJA

### スプレッドシート
- ヒアリングシート: https://docs.google.com/spreadsheets/d/1-7HaTUdnFSEUUDPl9Z_b2kUJNaJQ90h4hHmRgfW-6dk/edit
- フォーム回答シート: https://docs.google.com/spreadsheets/d/1-7HaTUdnFSEUUDPl9Z_b2kUJNaJQ90h4hHmRgfW-6dk/edit?gid=273899977#gid=273899977
- 編集データ管理: https://docs.google.com/spreadsheets/d/1-9OP13Z-VO5yq2gWZ-z2PGh1dcYPRxE6wzQ2h7JnqrM/edit?gid=1181257077#gid=1181257077
- 週間データ集計シート: https://docs.google.com/spreadsheets/d/1X-XFjj5823s9PCQ5oZs-_O2536yKl7uq1zXiQvtn5AM/edit?gid=63900268#gid=63900268
- スプレッドシート（ツナゲル関連）: https://docs.google.com/spreadsheets/d/19NTIktYXjZXf9VBvGp-aeRpfD4YHJnLM/edit

### Googleドライブ
- 企業カンペ: https://drive.google.com/drive/folders/1lqQq8lrChumGrry96OOp73DrCQ8_ptH7?usp=drive_link
- 撮影フォルダ親: https://drive.google.com/drive/folders/1irkdRQYFypDErVHzUHoXF3BLnyOlumMh

### 外部サイト
- NOTTA: https://app.notta.ai/
- Pairsona: https://pairsona.jp/
- エンゲージ（企業側）: https://en-gage.net/company/logout/
- エンゲージ（求職者側）: https://en-gage.net/#/
- 企業カンペ参考（ChatGPT）: https://chatgpt.com/share/694e02cc-3a30-800a-8188-5e7b371e3053

### YouTube参考
- https://youtu.be/n5tHSlJVwo4
- https://youtu.be/om72hp6WxjE

---

## 11. 担当者情報

### 担当者と主な業務
| 担当者 | 色 | 優先度 | 主な業務 |
|--------|-----|--------|---------|
| 渡邉 | グレー | 99 | 受注・立ち上げ、日程調整、初回打ち合わせ |
| 河合 | ピンク | 1 | 打ち合わせ前準備、打ち合わせ後対応、ヒアリング内容整理、原稿執筆、編集、確認依頼、キックオフMTG、週間データ集計 |
| 中尾文香 | 黄色 | 3 | 原稿執筆 |
| 川崎 | 水色 | 2 | 企画・質問設計、撮影、月次FB |
| 下脇田 | 紫 | 4 | 月次FB |
| 紺谷 | オレンジ | 5 | 応募対応 |
| 青柳 | 青 | 7 | （担当から削除されているがUI設定は残存） |
| 清水 | 緑 | 6 | （ツナゲルでは未使用） |

---

## 12. flowStepsの状態分類

### description・画像・入力テンプレートが充実している業務
- No.0-1（2ステップ）
- No.0-2（4ステップ）
- No.0-2-2（6ステップ）
- No.0-3（6ステップ）
- No.0-3-2（5ステップ）
- No.1（4ステップ）

### labelのみ、またはlabel+単一リンクの業務
- No.2（4ステップ）
- No.3（3ステップ）
- No.4（3ステップ）
- No.5（4ステップ）
- 企業担当へ確認依頼（4ステップ）
- 今後の担当者共有（5ステップ）
- No.6（5ステップ）
- 週間データ集計（4ステップ）
- No.7（5ステップ）

---

## 13. 備考

### HANDOFFに記載されている未解決課題との対応
HANDOFFの「作業中・未解決の課題」セクションに記載されている内容：

1. **担当者名のハードコード** - tsunageru.ts内の担当者名、GASプロンプト内の担当者名
2. **フローステップの一貫性** - 画像にキャプションがあるフローと、ないフローが混在
3. **報告フォーマットが旧バージョンのまま** - 一部のフローステップで例文ハードコード、入力フィールド付きテンプレート機能が未適用

### 本レポートで記録していない情報
- GASスクリプトの詳細なコード内容（ファイルパスのみ記録）
- プロンプトファイルの詳細な内容（ファイルパスのみ記録）
- 他の8商材のデータ

---

以上
