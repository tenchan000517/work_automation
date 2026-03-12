# 業務効率化・マニュアル作成プロジェクト HANDOFF

## 🎯 次にやること

### タスク管理システム GAS: テスト・改善（進行中）

#### 次のアクション

**要件定義機能の実装計画を立てる**（フローテストで見えた最重要課題）

以下を具体的に決める：
- タスク規模（大/中/小）の判定基準とプロンプトへの組み込み方
- 「📝 要件定義する」ボタンを押したら何が開くか（ダイアログの項目・フロー）
- 要件定義の保存先（シートのどの列、どのフォーマット）
- 「要件定義完了」の判定方法と一覧での表示（ラベル・色）
- Claude Code連携の具体仕様（skill定義、タスク管理ディレクトリ構成）
- 既存機能への追加（リマインドメール・AIサマリーへの1行追加内容）
- 方針は下記「要件定義とは」「要件定義機能の設計方針」を参照

計画完了後：
- 実装
- フローテスト継続（シナリオ2〜20。シナリオ1は✅完了・修正済み）

---

#### なぜこのツールが必要か

**現場の悩み:**
- タスクはLINE WORKS・会議・口頭で発生するが、**誰もタスク管理ツールに登録しない**（めんどくさい、後回しにして忘れる）
- 「〜やっておいて」で作業が始まるが、**完了条件・成果物・やらないことが定義されない**まま進む → 手戻り
- 管理者→中間管理職→実行者の**伝言ゲームで解像度が落ちる**。中間管理職が受け取った時点で解像度が低いと、実行者にはどうしようもない
- 管理者は全体を把握したいが、情報がチャット・議事録・口頭に散らばっていて追いきれない

**本質的な問題:**
1. **会話→タスク化の変換を誰もやらない** → AIが会話テキストからタスクを自動抽出
2. **要件定義を誰もやらない** → AIが完了条件・やること・やらないことを自動整理
3. **曖昧な指示が可視化されない** → AIが「いい感じに」「あれ」等を検出し質問を生成

**設計原則（絶対）:**
- 「誰もやらない」前提で設計する。新しい手間を増やす実装はNG
- 既存の流れ（会話テキストを貼るだけ）の中で自然に解決される
- 承認フローを別ステップにしない。通知→ワンタップで完結
- 「めんどくさい」「後回しにして忘れる」が発生する設計は失敗する

**フローテストで見えてきた課題:**
- タスクを受けた側が「何を確認すべきか分からない」ため、解像度が低いまま着手してしまう
- 要件定義の必要性に気づかず、確認しに行く習慣がない → AIが確認すべき点を自動提示する必要がある
- 完了条件が曖昧だと、スコープが広がりすぎる（やらなくていいことまでやる）or 指示待ちで止まる
- AIの warnings や質問が表示されても**無視される可能性がある** → 無視できない仕組みが必要

**要件定義とは:**
依頼者と担当者で以下を**合意**すること。ドキュメントを書くことではない。
1. **KGI** — このタスクの本当のゴールは何か（言われたことの裏にある期待。例:「サイト作って」の裏に「検索上位表示」がある等）
2. **完了 = 手離れの定義** — 何がどうなったら自分の手から完全に離れるか（例:「確認して」= 確認→アポ取り→共有→全員認識まで）
3. **スコープ** — どこまでやる / やらない
4. **期限** — いつまでに

AIが出す完了条件・スコープ・期限は**叩き台**。要件定義はその叩き台を元に「これでいいですか？」を確認して**確定**するステップ。
タスクは**完了したら手離れするもの**。後続が生まれたら別タスク。「なんとなく続いてる」タスクは許容しない。

**要件定義機能の設計方針:**
- タスク規模（大/中/小）をAIが自動判定
- 「大」タスクは要件定義が完了するまで着手NG（必須）。「中」は推奨
- 登録完了画面・タスク一覧の両方に「📝 要件定義する」ボタンを配置（今やる/後でやる どちらも同じ簡単さ）
- Claude Code連携: タスク管理ディレクトリでskillを実行 → 叩き台を元に「依頼者にこう聞いてください」を出す
- GASダイアログからも簡易登録可能（Claude Code非経由）
- 気づかせる仕組み: タスク一覧で大タスク🔴・中タスク🟡ラベル、リマインドメール・AIサマリーに「要件定義未完了X件」を追加（既存機能に1行足すだけ）

---

**実装完了:** 10ファイル（`docs/gas/task-management/`）
**仕様書:** `docs/plans/task-management/specification.md`
**要件定義:** `docs/plans/task-management/requirements.md`

#### GASメニュー構成

```
📋 タスク管理（全員用）
├── ➕ タスク登録
│   ├── 💬 ワークス一括
│   ├── 📌 ワークスピンポイント
│   ├── 📝 NOTTA
│   ├── ✍️ 自由記述
│   └── 🤝 ディスカッション
├── 📊 タスク一覧
├── 📝 完了報告
└── ❓ 使い方

⚙️ 管理者メニュー
├── ✅ 完了承認・差し戻し
├── 📊 AIサマリー
├── 👤 担当者設定
├── ⏰ リマインド設定
├── 📅 棚卸し設定
├── 🤖 AIモデル設定
└── 🔧 テンプレート初期設定
```

#### ファイル構成

| ファイル | 内容 |
|---------|------|
| `taskMain.js` | メニュー登録・エントリー（onOpen） |
| `taskCommonStyles.js` | CSS + 共通UIコンポーネント |
| `taskDiscussionPatterns.js` | ディスカッションモードのパターン定義 |
| `taskSheetManager.js` | シート操作・CRUD・テンプレート初期設定 |
| `taskAiAnalyzer.js` | Gemini API呼び出し・プロンプト・JSON解析 |
| `taskCalendarManager.js` | カレンダーイベント作成・更新・削除 |
| `taskInputDialog.js` | 画面1：モード選択+テキスト入力 |
| `taskResultDialog.js` | 画面2〜4：候補選択→要件確認→登録完了（SPA） |
| `taskListDialog.js` | 画面5：タスク一覧（全員用/管理者用ビュー切替）+設定ダイアログ4種 |
| `taskReminder.js` | リマインド・通知・トリガー管理 |
| `taskSimulator.js` | ユニットテスト（14カテゴリ・120+テスト） |
| `taskFlowTestScenarios.md` | フローテストシナリオ集（20シナリオ） |

#### appsscript.json 必須スコープ

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/script.container.ui",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/script.external_request",
  "https://www.googleapis.com/auth/script.send_mail",
  "https://www.googleapis.com/auth/script.scriptapp"
]
```

#### デプロイ手順

1. GASエディタにコード貼り付け（10ファイル）
2. `appsscript.json` に上記スコープを追加
3. プロジェクト設定 → スクリプトプロパティ → `GEMINI_API_KEY` を登録
4. 管理者メニュー → テンプレート初期設定（3シート作成+トリガー設定）
5. 管理者メニュー → 担当者設定（名前・メール・役割を登録）

#### テスト進捗

| 機能 | 状態 | 備考 |
|------|------|------|
| テンプレート初期設定 | ✅ | 3シート+条件付き書式+ドロップダウン |
| ワークス一括登録 | ✅ | AI解析→候補選択→要件確認→登録完了 |
| Claude Codeコピー | ✅ | 登録完了画面+タスク一覧から |
| タスク一覧（全員用） | ✅ | 担当者別グルーピング+フィルタ |
| 完了承認（管理者用） | ✅ | ビュー切替実装済み |
| ログ記録 | ✅ | 行高さ固定（21px） |
| 担当者設定 | ⬜ | 未テスト |
| リマインド設定 | ⬜ | 未テスト |
| 棚卸し設定 | ⬜ | 未テスト |
| AIモデル設定 | ⬜ | 未テスト |
| カレンダー登録 | ⬜ | 未テスト |
| 完了報告→承認フロー | ⬜ | 未テスト |
| リマインドメール | ⬜ | 未テスト |
| ワークスピンポイント | ⬜ | 未テスト |
| NOTTA | ⬜ | 未テスト |
| 自由記述 | ⬜ | 未テスト |
| ディスカッション | ⬜ | 未テスト |

#### テストツール

**1. ユニットテスト: `taskSimulator.js`**

GASプロジェクトに追加して「🧪 シミュレーション」メニューから実行。14カテゴリ・120+テスト。

```
🧪 シミュレーション
├── ▶️ 全テスト実行
├── A〜N（14カテゴリ個別実行）
├── 🧹 テストデータ削除（T-SIM-xxx行を削除）
└── 📊 前回の結果を表示
```

- テストデータは `T-SIM-` プレフィックスで安全にクリーンアップ
- メール送信なし、カレンダー作成なし（フォーマット検証のみ）
- 結果はHTMLダイアログ（カテゴリ別アコーディオン、失敗は自動展開、成功率表示）
- ScriptPropertiesに結果保存 → 前回結果を再表示可能

**2. フローテスト: `taskFlowTestScenarios.md`**

実際の社員・管理者の1週間を想定した20シナリオ。各シナリオに「貼り付け用テキスト」「検証ポイント表」「起こりうる問題」「コミュニケーション課題」を記載。手動でダイアログ操作して検証する。

**実行順序（推奨）:**
1. まず `taskSimulator.js` の全テスト実行で基盤の動作確認
2. 次にフローテストをシナリオ3（担当者設定）→ 1（一括）→ 2（ピンポイント）の順で実行

#### フローテストシナリオ一覧（全20シナリオ）

**詳細:** `docs/gas/task-management/taskFlowTestScenarios.md`

| # | 日 | シナリオ | モード | 検証の主眼 | 状態 |
|---|---|---------|--------|-----------|------|
| 1 | 月 | 週末LINEログ一括解析 | ワークス一括 | 雑談/報告/依頼の分離、5タスク抽出 | ✅ |
| 2 | 月 | 急ぎの個別指示 | ピンポイント | 「今日中」の期限検出、複合作業の1タスク化 | ⬜ |
| 3 | 月 | 担当者の初期設定 | 管理者設定 | 保存→取得、カレンダーID空の挙動 | ⬜ |
| 4 | 火 | 定例MTG議事録 | NOTTA | 完了報告の誤検出、「全員」タスクの扱い | ⬜ |
| 5 | 火 | 一覧確認→完了報告 | タスク一覧 | フィルタ、期限超過表示、ステータス更新 | ⬜ |
| 6 | 火 | 自分メモのタスク化 | 自由記述 | 担当者未特定、期限なし | ⬜ |
| 7 | 水 | 管理者の承認・差し戻し | 管理者操作 | 承認メモ記録、差し戻し理由記録、メール通知 | ⬜ |
| 8 | 水 | 差し戻し後の再提出 | 承認フロー | 報告→差し戻し→修正→再報告→承認のループ | ⬜ |
| 9 | 水 | 口頭依頼のタスク化 | ディスカッション | デザイン系パターンマッチ、不足情報warning | ⬜ |
| 10 | 木 | リマインド設定確認 | 管理者設定 | トリガー設定、時間変更、無効化 | ⬜ |
| 11 | 木 | AIサマリーで全体把握 | AIサマリー | 負荷分析、超過警告、Gemini API呼び出し | ⬜ |
| 12 | 木 | タスクを保留にする | 直接編集 | ドロップダウン操作、フィルタ除外 | ⬜ |
| 13 | 金 | 週次棚卸し | 一覧 | 全件表示、完了グレー、AIサマリー | ⬜ |
| 14 | 金 | Claude Codeへ指示コピー | 一覧 | フォーマット、クリップボード | ⬜ |
| 15 | 特殊 | タスク0件（雑談のみ） | 一括 | 空結果ハンドリング、スキップ一覧 | ⬜ |
| 16 | 特殊 | 曖昧指示ばかり | 一括 | ambiguous_expressions検出、確信度「低」 | ⬜ |
| 17 | 特殊 | 12件の大量一括登録 | 自由記述 | 6分制限、カレンダー大量作成 | ⬜ |
| 18 | 特殊 | うっかり重複登録 | 一括 | 重複チェックなし（課題として記録） | ⬜ |
| 19 | 特殊 | APIキー未設定 | 一括 | エラーハンドリング | ⬜ |
| 20 | 特殊 | 期限が過去の日付 | 一括 | 即座に超過表示 | ⬜ |

**各シナリオの構成（mdファイル参照）:**
- **状況:** リアルな業務場面の説明
- **社員/管理者の悩み:** その場面で感じる課題（UI改善のヒント）
- **GAS操作:** メニュー→ダイアログの具体的手順
- **貼り付けるテキスト:** そのままコピペできるサンプル入力
- **検証ポイント表:** 確認項目と期待値の一覧
- **起こりうる問題:** テスト時に注意すべき既知リスク
- **コミュニケーション課題:** システム外の運用面の問題

#### 修正履歴

| 問題 | 原因 | 修正 |
|------|------|------|
| UrlFetchApp権限エラー | appsscript.jsonにスコープ未設定 | 7スコープ追加 |
| JSON解析失敗 | maxOutputTokens不足(4096)でJSON途切れ | 65536に増加+responseMimeType追加 |
| ダイアログが閉じて結果が出ない | google.script.host.close()が先に実行 | withSuccessHandlerで順序制御 |
| タスク一覧に承認ボタンが出る | 全員用/管理者用の区別なし | viewMode引数で切替 |
| ログの行高さが広がる | 長いJSONで自動拡張 | setRowHeight(21)で固定 |
| 「水曜まで」等が日付変換されない | プロンプトに今日の日付が渡されていない | 今日の日付+曜日をプロンプトに追加（taskAiAnalyzer.js） |
| 完了報告がタスクとして誤検出 | 除外ルールが不十分 | 「〜しました」「〜済み」の完了報告除外ルールを追加（taskAiAnalyzer.js） |
| メニュー選択済みなのにモード選択UIが出る | preselectedModeを受け取るがグリッドを常に表示 | 事前選択時はグリッド非表示→ヘッダー表示+「変更」リンク（taskInputDialog.js） |

#### 状態遷移（テスト時参照）

```
               担当者          担当者            管理者
未着手 ──→ 進行中 ──→ 完了報告済み ──→ 完了
                                │
                                │ 管理者
                                ↓
                             差し戻し ──→ 進行中（ループ）

※ どの状態からでも → 保留 にできる（管理者のみ）
```

- 担当者は「完了」にできない。必ず管理者の承認が必要
- ログイン機能はない。ダイアログで「自分」を選ぶ運用

#### アーキテクチャ注意点

- **Gemini APIキー**: `PropertiesService.getScriptProperties()` に格納（設定シートではない）
- **GAS実行時間制限**: 6分。AI呼び出しが遅い場合あり。デフォルトモデルは `gemini-2.0-flash`
- **ダイアログ間遷移**: 画面1→画面2-4は「サーバー側で新ダイアログを開いてから旧ダイアログを閉じる」パターン（`withSuccessHandler`で順序制御）。画面2-4内はSPA方式（JS表示切替）
- **競合対策**: `task_registerTask` と `task_updateTaskStatus` で `LockService.getScriptLock()` を使用
- **ハードコード禁止**: 担当者・時間・モデル等は全て設定シートから読み取り

---

### アニメPV GAS: 動作確認（頭からやる）

**作業内容:** GASにコードを反映して、フェーズごとに動作確認・スクショ撮影・マニュアル作成

---

#### GASメニュー構成（全体フロー）

```
📹 アニメPV制作
├── 1️⃣ ヒアリング
│   ├── 新規ヒアリングシート作成
│   ├── 企業フォルダ作成
│   ├── 文字起こしを整理（プロンプト生成）
│   └── AI出力を転記
├── 2️⃣ 台本生成
│   ├── 台本生成プロンプト
│   └── 台本パース・保存
├── 3️⃣ キャラクター・シーン編集
│   ├── キャラクター設定を編集
│   ├── シーン構成を編集
│   └── エンディングを編集
├── 4️⃣ プロンプト生成
│   ├── キャラクターシートプロンプト
│   ├── シーン生成プロンプト
│   ├── 歌詞生成プロンプト
│   ├── 歌詞を貼り付け・保存
│   ├── SUNO冒頭BGMプロンプト
│   ├── SUNO歌詞付き楽曲プロンプト
│   └── ナレーション編集 ★今回改修
└── ⚙️ 設定
    ├── テンプレート初期設定
    ├── 親フォルダを設定
    └── 進捗一覧
```

---

#### 対象ファイル（`docs/gas/anime-pv/`）12ファイル

| # | ファイル | 内容 | 今回変更 |
|---|---------|------|----------|
| 1 | `animePvMain.js` | メニュー・ユーティリティ | |
| 2 | `animePvSettings.js` | 定数・設定 | |
| 3 | `animePvCommonStyles.js` | 共通スタイル | |
| 4 | `animePvFolderManager.js` | フォルダ作成 | ★ フォルダ構造拡張 |
| 5 | `animePvSheetManager.js` | シート作成 | ★ 列幅、Fish Audio設定 |
| 6 | `animePvTranscript.js` | 文字起こし | |
| 7 | `animePvScriptPrompt.js` | 台本生成 | |
| 8 | `animePvImagePrompt.js` | 画像プロンプト | ★ シーン生成プロンプト、選択スタイル自動選択 |
| 9 | `animePvCharacterScene.js` | キャラクター・シーン編集 | |
| 10 | `animePvSunoPrompt.js` | SUNO音楽生成（BGM・ボーカル） | ★ 分割 |
| 11 | `animePvLyricsPrompt.js` | 歌詞生成 + 共通保存関数 | ★ 分割 |
| 12 | `animePvNarration.js` | ナレーション（Fish Audio） | ★ 分割 |
| 13 | `animePvEffectSettings.js` | エフェクト設定（アクション・エフェクト定義） | ★ 新規 |
| 14 | `animePvEffectScene.js` | エフェクトシーンUI・プロンプト生成 | ★ 新規、選択スタイル自動選択 |

> **アーカイブ:** `_archive/animePvAudioPrompt.js`（旧：音声プロンプト統合ファイル）

---

#### フェーズ分け（進捗トラッキング）

| Phase | 内容 | 状態 | スクショ |
|-------|------|------|----------|
| **0** | GASにコード反映（12ファイル） | ✅ 完了 | - |
| **1** | ⚙️ 設定（テンプレート初期設定、親フォルダ設定） | ✅ 完了 | |
| **2** | 1️⃣ ヒアリング（シート作成、フォルダ作成） | ✅ 完了 | 7枚 |
| **3** | 1️⃣ ヒアリング（文字起こし→AI転記） | ✅ 完了 | 6枚 |
| **4** | 2️⃣ 台本生成（プロンプト→パース） | ✅ 完了 | 7枚 |
| **5** | 3️⃣ キャラクター・シーン編集 | ✅ 完了 | 5枚（32-36番） |
| **6** | 4️⃣ プロンプト生成（画像系） | ✅ 完了 | 14枚（37-50番） |
| **7** | 4️⃣ プロンプト生成（音声系） | ✅ 完了 | 10枚（24-31, 60-61番） |
| **8** | 5️⃣ エフェクトシーン生成 | ✅ 完了 | 4枚（56-59番） |
| **9** | 6️⃣ 編集・書き出し | ✅ 完了 | 1枚（62番） |

**状態:** ⬜ 未着手 / 🔄 進行中 / ✅ 完了 / ❌ 問題あり

---

#### エフェクトシーン機能（Phase 8）

**完成した機能:**
- アクション選択（目を開く / 顔を上げる）+ サムネイル画像
- エフェクト選択（光の粒子 / 桜の花びら / 4色チョーク / エネルギー波）+ GIFサムネイル
- 背景選択（場所 × 時間帯）
- プロンプト生成（開始フレーム / 終了フレーム / 動画）
- シートへの保存機能（演出1-5）

**サムネイルURL:** `https://assets.yumesuta.com/thumbnail/`
- アクション: `eye_open.jpeg`, `face_raise.jpeg`
- エフェクト: `face_raise_particles.gif`, `eye_open_cherry_blossom.gif`, `eye_open_chalk.gif`, `face_raise_energy_wave.gif`

**実装済みアクション（14種）:**

| カテゴリ | アクション | 説明 | タイミング | 紐づくエフェクト |
|---------|-----------|------|-----------|-----------------|
| **感動・成長系** | 目を開く | 閉じた目がゆっくり開く | 2.0s | particles, cherry_blossom, chalk, energy_wave |
| | 顔を上げる | うつむいた顔を上げる | 1.3s | particles, cherry_blossom, chalk, energy_wave |
| **転換・再生系** | 扉を開く | 扉を開いて新しい世界へ | 2.7s | light_flooding, costume_change |
| | 後ろ向きで歩く | 世界が180度回転 | 2.5s | world_rotation, costume_change |
| **コメディ・教育系** | 二度見リアクション | 失敗に気づいて二度見 | 1.5s | comedy_lightbulb, x_to_o_transition |
| | 頭を抱える→笑顔 | 失敗→気づいて笑顔 | 2.0s | comedy_lightbulb, sparkle_understanding |
| **ゲーミフィケーション系** | ゲージ満タン | EXPゲージ満タン爆発 | 2.5s | level_up_fanfare, rainbow_explosion |
| | スキル獲得 | 新スキル獲得ポーズ | 1.8s | skill_icon_appear, magic_circle |
| **Nike・スポーツ系** | 爆発的スタート | 静止→スタートダッシュ | 0.8s | speed_lines, dust_burst |
| | ゴール突破 | ゴールテープ突破 | 3.0s | slow_motion_victory, confetti_explosion |
| **プレゼン・ビジョン系** | データが集まる | バラバラ→収束 | 2.2s | data_animation, clarity_burst |
| | 視野が広がる | 狭い→広大な景色 | 2.0s | horizon_reveal, sky_expansion |
| **ドキュメンタリー系** | 全員が顔を上げる | 複数人が一斉に顔上げ | 1.5s | unity_light, forward_together |
| | 記憶が蘇る | セピア→カラー | 2.5s | color_restoration, memory_bloom |

**実装済みエフェクト（24種）:**

| カテゴリ | エフェクト | 説明 |
|---------|-----------|------|
| **基本エフェクト** | 光の粒子 | 背後から粒子爆発 |
| | 桜の花びら | 桜が放射状に広がる |
| | 4色チョーク | カラフル粉が爆発 |
| | エネルギー波 | 同心円状の波動 |
| **転換系** | 光の氾濫 | 扉から光が溢れる |
| | 世界回転 | 背景が180度回転 |
| | 服装変化 | 服が変わる |
| **コメディ系** | 電球ピカーン | 頭上に電球（理解の瞬間） |
| | ×→○変換 | バツが丸に変わる |
| | キラキラ理解 | 理解した瞬間のキラキラ |
| **ゲーム系** | レベルアップ演出 | 虹色光＋ファンファーレ |
| | 虹色爆発 | 7色の光が放射状に |
| | スキルアイコン | スキルアイコン出現 |
| | 魔法陣 | 足元に魔法陣展開 |
| **Nike系** | スピードライン | 集中線・スピード感 |
| | 砂埃爆発 | 足元から砂埃 |
| | スローモ勝利 | 勝利の瞬間をスローで |
| | 紙吹雪爆発 | ゴール時の紙吹雪 |
| **プレゼン系** | データアニメーション | グラフが組み上がる |
| | 明確化の光 | 全体像が見える瞬間 |
| | 地平線出現 | 広大な景色が現れる |
| | 空の拡大 | 空がどこまでも広がる |
| **ドキュメンタリー系** | 団結の光 | 全員を照らす希望の光 |
| | 共に前へ | 全員が同じ方向を向く |
| | 色彩復活 | セピア→フルカラー |
| | 記憶の開花 | 過去の記憶が鮮明に |

**ストーリーパターン×推奨アクション対応:**

| パターン | 推奨アクション |
|----------|---------------|
| transform | door_open, eye_open, face_raise |
| challenge | eye_open, face_raise |
| discover | eye_open, face_raise, **data_convergence** |
| connect | eye_open, face_raise, **group_look_up** |
| next_stage | door_open, **horizon_expand**, eye_open |
| share_vision | **data_convergence**, **horizon_expand**, eye_open, face_raise |
| rediscover_pride | **sepia_to_color**, **group_look_up**, face_raise, eye_open |
| overcome_together | **group_look_up**, face_raise, eye_open |
| learn_with_joy | **double_take**, **facepalm_to_smile**, face_raise, eye_open |
| level_up | **gauge_fill_burst**, **skill_unlock_pose**, eye_open, face_raise |
| learn_from_failure | **facepalm_to_smile**, face_raise, eye_open |
| just_act | **explosive_start**, **finish_line_cross**, face_raise, eye_open |

**関連マニュアル（動画編集ソフト）:**
| ソフト | マニュアル | サイトURL |
|--------|-----------|-----------|
| PowerDirector | `docs/manuals/anime-pv/05-PowerDirectorキーフレーム操作.md` | `/products/anime-pv/tasks/5/manual` |
| Premiere Pro | `docs/manuals/anime-pv/06-Premiere Proキーフレーム操作.md` | `/products/anime-pv/tasks/6/manual` |

> ※ I2Vでカメラワーク（ズームアウト）は安定しない → 動画編集ソフトで後処理が必要
> キーフレーム操作ガイドを上記マニュアルで参照

**重要ドキュメント:**
- `docs/gas/anime-pv/演出プロンプト_背後エフェクト_I2V対応_v2.md`

**このドキュメントの教訓（306-350行目「検証で得た重要な学び」）:**

| 分類 | 内容 |
|------|------|
| ✅ 成功 | `from behind character` が決め手。中央からではなく背後から出現に |
| ✅ 成功 | 動画プロンプトは**動きのみに集中**。デザイン・色・質感は終了フレームに任せる |
| ✅ 成功 | シンプルな構造（時間軸 + 動きの指示のみ） |
| ✅ 成功 | 桜の花びらには `no branches, no trees, no stems` をネガティブに |
| ❌ 失敗 | `from center` → 画面中央から新しいオブジェクトが出現してしまう |
| ❌ 失敗 | `THE SAME petals` → 接続を明示しても新しい花びらが生成される |
| ❌ 失敗 | `upward and OUTWARD` → 方向が矛盾して混乱 |
| ❌ 失敗 | デザイン詳細指定 → 終了フレームと競合して不安定に |
| ⚠️ 注意 | I2Vでカメラワーク（ズームアウト）は安定しない → 動画編集ソフトで後処理 |

**プロンプト設計の原則（1223-1307行目「重要な技術ポイント」）:**
- **奥行き分離**: 前景（人物）と後景（エフェクト）を明確に分離。エフェクトは常に背後
- **完全同期**: 目を開く=2.0秒、顔を上げる=1.3秒で爆発
- **3フレーム構造**: 開始フレーム（エフェクトなし）→ 動画プロンプト（動きのみ）→ 終了フレーム（エフェクト完了状態）
- **キーフレーム3段階**: 静・溜め → 爆発の瞬間 → 展開・余韻

**GAS実装時の教訓:**
- GASのHtmlServiceでは外部mp4動画は表示不可 → GIFに変換して対応
- サムネイルは16:9比率が見やすい

---

#### 共有済みスクリーンショット

| パス | 内容 | Phase |
|------|------|-------|
| `/images/anime-pv/01-menu-hearing.png` | メニュー展開（ヒアリング） | 2 |
| `/images/anime-pv/02-new-sheet-empty.png` | 新規シート作成（初期） | 2 |
| `/images/anime-pv/03-new-sheet-filled.png` | 新規シート作成（入力済み） | 2 |
| `/images/anime-pv/04-folder-confirm.png` | フォルダ作成確認 | 2 |
| `/images/anime-pv/05-folder-complete.png` | フォルダ作成完了 | 2 |
| `/images/anime-pv/06-drive-folders.png` | Driveフォルダ | 2 |
| `/images/anime-pv/07-sheet-folder-url.png` | シートにURL保存 | 2 |
| `/images/anime-pv/08-transcript-empty.png` | 文字起こし整理（初期） | 3 |
| `/images/anime-pv/09-transcript-saved.png` | 文字起こし整理（保存） | 3 |
| `/images/anime-pv/10-claude-output.png` | Claude AI出力 | 3 |
| `/images/anime-pv/11-transfer-json.png` | AI出力転記（JSON） | 3 |
| `/images/anime-pv/12-transfer-confirm.png` | AI出力転記（確認） | 3 |
| `/images/anime-pv/13-sheet-ai-data.png` | Part②AI抽出データ | 3 |
| `/images/anime-pv/14-menu-script.png` | メニュー展開（台本生成） | 4 |
| `/images/anime-pv/15-script-dialog.png` | 台本生成プロンプトダイアログ（全体） | 4 |
| `/images/anime-pv/16-script-selected.png` | 台本生成プロンプトダイアログ（選択済み） | 4 |
| `/images/anime-pv/17-claude-script-output.png` | Claude AI出力（台本JSON） | 4 |
| `/images/anime-pv/18-parse-input.png` | 台本パース・保存（JSON貼り付け） | 4 |
| `/images/anime-pv/19-parse-confirm.png` | 台本パース・保存（確認画面） | 4 |
| `/images/anime-pv/20-sheet-part6-data.png` | Part⑥処理データ | 4 |
| `/images/anime-pv/21-sheet-character-scene.png` | Part③④キャラクター・シーン | 4 |
| `/images/anime-pv/22-menu-prompt.png` | メニュー展開（プロンプト生成） | 6 |
| `/images/anime-pv/23-character-sheet-dialog.png` | キャラクターシートプロンプトダイアログ | 6 |
| `/images/anime-pv/24-lyrics-prompt.png` | 歌詞生成プロンプトダイアログ | 7 |
| `/images/anime-pv/25-lyrics-preview.png` | 歌詞プレビュー（Claude出力） | 7 |
| `/images/anime-pv/26-lyrics-save.png` | 歌詞を貼り付け・保存 | 7 |
| `/images/anime-pv/27-suno-bgm-prompt.png` | SUNO冒頭BGMプロンプト | 7 |
| `/images/anime-pv/28-suno-bgm-create.png` | SUNO画面（BGM生成） | 7 |
| `/images/anime-pv/29-suno-vocal-prompt.png` | SUNO歌詞付き楽曲プロンプト | 7 |
| `/images/anime-pv/30-suno-vocal-create.png` | SUNO画面（歌詞付き楽曲生成） | 7 |
| `/images/anime-pv/31-narration-edit.png` | ナレーション編集（Fish Audio設定） | 7 |
| `/images/anime-pv/32-menu-character-scene.png` | メニュー展開（キャラクター・シーン編集） | 5 |
| `/images/anime-pv/33-character-edit.png` | キャラクター設定を編集 | 5 |
| `/images/anime-pv/34-scene-grid.png` | シーン構成を編集（グリッド） | 5 |
| `/images/anime-pv/35-scene-edit.png` | シーン構成を編集（詳細） | 5 |
| `/images/anime-pv/36-ending-edit.png` | エンディングを編集 | 5 |
| `/images/anime-pv/37-menu-prompt.png` | メニュー展開（プロンプト生成） | 6 |
| `/images/anime-pv/38-character-sheet-dialog-top.png` | キャラクターシートダイアログ（上部） | 6 |
| `/images/anime-pv/39-character-sheet-dialog-bottom.png` | キャラクターシートダイアログ（下部） | 6 |
| `/images/anime-pv/40-ai-studio-model.png` | Google AI Studio モデル選択 | 6 |
| `/images/anime-pv/41-ai-studio-settings.png` | Google AI Studio 設定 | 6 |
| `/images/anime-pv/42-ai-studio-prompt.png` | Google AI Studio プロンプト入力 | 6 |
| `/images/anime-pv/43-character-sheet-past.jpeg` | キャラクターシート生成結果（過去編） | 6 |
| `/images/anime-pv/44-character-sheet-char2.jpeg` | キャラクターシート生成結果（キャラ2） | 6 |
| `/images/anime-pv/45-character-sheet-current.jpeg` | キャラクターシート生成結果（現在編） | 6 |
| `/images/anime-pv/46-menu-prompt-updated.png` | メニュー（シーン生成プロンプト） | 6 |
| `/images/anime-pv/47-scene-prompt-dialog.png` | シーン生成プロンプトダイアログ（全体） | 6 |
| `/images/anime-pv/48-scene-prompt-style.png` | シーン生成プロンプト（スタイル選択） | 6 |
| `/images/anime-pv/49-ai-studio-start-frame.png` | AI Studio 開始フレーム生成 | 6 |
| `/images/anime-pv/50-kling-video-generate.png` | I2V動画生成（Kling/VIDU） | 6 |
| `/images/anime-pv/51-folder-character-sheet.png` | フォルダ：キャラクターシート | 2 |
| `/images/anime-pv/52-folder-start-frame-scene.png` | フォルダ：開始フレーム_シーン | 2 |
| `/images/anime-pv/53-folder-start-frame-effect.png` | フォルダ：開始フレーム_エフェクト | 8 |
| `/images/anime-pv/54-folder-video-effect.png` | フォルダ：動画_エフェクト | 8 |
| `/images/anime-pv/55-folder-audio.png` | フォルダ：音声 | 7 |
| `/images/anime-pv/56-effect-scene-dialog.png` | エフェクトシーンダイアログ | 8 |
| `/images/anime-pv/57-effect-start-frame.png` | エフェクト開始フレーム生成 | 8 |
| `/images/anime-pv/58-effect-end-frame.png` | エフェクト終了フレーム生成 | 8 |
| `/images/anime-pv/59-effect-video-generate.png` | エフェクト動画生成（Kling） | 8 |
| `/images/anime-pv/60-sheet-audio-settings.png` | Part⑤ 音声プロンプト - Fish Audio設定 | 7 |
| `/images/anime-pv/61-fish-audio-generate.png` | Fish Audio 音声合成画面 | 7 |
| `/images/anime-pv/62-premiere-timeline.png` | Premiere Pro タイムライン | 9 |

**マニュアル:** `docs/manuals/anirec/00-overall-manual.md`

---

#### 止まった箇所・解決方法

| Phase | 箇所 | 問題 | 解決方法 |
|-------|------|------|----------|
| 4 | 台本生成 | startFrameがJSON出力に含まれていなかった | JSONスキーマにstartFrame追加、ガイドライン追加 |
| 4 | 台本生成 | 企業名がstartFrameに混入 | テキスト禁止ルール追加（no text, no logos, no signs） |
| 6 | 開始フレーム | onclickエラー（シーン名がクオートされない） | hasDataをbooleanに変換（!!演算子） |
| 6 | 開始フレーム | 保存ボタンが機能しない | ラベル名不一致修正（`シーン${n}_開始フレームプロンプト`） |
| 6 | 開始フレーム | スタイルが含まれない | パース時にbasePromptを自動追加 |

---

### ✅ アニメPV制作（サイト追加完了）

**サイト追加完了:** `/products/anime-pv` でアクセス可能

**マニュアル:**
- `docs/manuals/anime-pv/00-overall-manual.md` - AI活用アニメPV制作講座
- `docs/manuals/anime-pv/01-鋳物製造業サンプル.md` - 男性主人公、成長物語、熱い演出
- `docs/manuals/anime-pv/02-自動車部品製造サンプル.md` - 女性主人公、チームワーク、クリーンな演出

**元ファイル:** `docs/guides/pv/`（計9ファイル）→ 統合済み

---

### HP制作: ギャップ修正・プレースホルダー更新のテスト検証

**対象機能（updatePrompt.js）:**
1. **カンプ差分確認・修正** - 実装とカンプの差分を検出・修正
2. **プレースホルダー更新 + SEO/LLMO** - JSON自動取得で実データ置換 + SEO対策

**テスト項目:**
- [ ] カンプ差分確認・修正が正しく動作するか
- [ ] プレースホルダー更新でJSON自動取得・保存できるか
- [ ] SEO/LLMO対策のプロンプトが正しく生成されるか
- [ ] 3社（tokiwa, shindo, tomolink）で実際に使用して検証

---

### HP制作: GAS改善（気づいたことメモから）

| # | 箇所 | 内容 |
|---|------|------|
| 1 | 手動作成ダイアログ | 「正式名称で入力してください」の赤文字注意書き追加 |
| 2 | シート作成実行ボタン | ローディング表示追加 |
| 3 | 企業フォルダ作成 | 完了メッセージ + URL表示 + 開くボタンをダイアログ内に |
| 4 | 企業フォルダ作成 | カスタムページ追加入力欄 |
| 5 | メニュー番号 | 作業順序と一致させる（1→4→3→2 を 1→2→3→4 に） |

### ツナゲル検証・インフォ更新

- No.0〜5: インフォ/マニュアル作成済み（更新が必要な可能性）
- No.6〜13: 基本情報のみ、詳細フロー未確定

---

## ✅ HP制作マニュアル完成（2026-02-03）

### 成果物

| 種類 | パス |
|------|------|
| 全体マニュアル | `docs/manuals/hp/00-overall-manual.md` |
| 個別マニュアル | `docs/manuals/hp/01〜11.md`, `99-claude-code.md` |
| **カンプ版マニュアル** | `docs/manuals/hp/05-HP作成-カンプ版.md` ★2026-02-15追加 |
| **カンプ版GAS** | `docs/gas/hp/compositionPromptKanpu.js` ★2026-02-15追加 |
| SEO設定マニュアル | `docs/manuals/hp/11-SEO設定.md` ★2026-02-15追加 |
| 共通マニュアル | `docs/manuals/common/`（7件） |
| スクショ | `public/images/hp/`（35枚） |
| ガイドライン | `docs/manual-creation-guideline-v4.md` |

### 共通マニュアル一覧

| ファイル | 内容 |
|---------|------|
| `gas-auth.md` | GAS認証手順 |
| `notta.md` | NOTTA起動〜終了 |
| `transcript.md` | 文字起こし整理 |
| `transfer.md` | AI出力転記 |
| `status-update.md` | ステータス更新 |
| `gijiroku.md` | 議事録作成 |
| `json-output.md` | JSON出力 |

### テンプレート（7種類）

| テンプレート | サンプル企業 | リポジトリ |
|-------------|-------------|-----------|
| Standard | 中部建設 | `template-standard` |
| Recruit Magazine | 共立工業 | `template-recruit-magazine` |
| LeadGen Minimal | スカイリフォーム | `template-leadgen-minimal` |
| LeadGen Visual | 三河精密工業 | `template-leadgen-visual` |
| Trust Visual | あおぞら法律事務所 | `template-trust-visual` |
| Authority Minimal | テックフロンティア | `template-authority-minimal` |
| Full Order | 東海プレシジョン | `template-fullorder` |

### 検証済みタスク

| タスク | スクショ |
|--------|---------|
| No.1 打ち合わせ前準備 | 11枚 |
| No.4 JSON出力・原稿生成 | 4枚 |
| No.5 HP実装 | 14枚 |

---

## プロジェクト概要

制作陣の業務効率化とマニュアル整備プロジェクト。
9商材・52業務を対象に、AI活用による効率化とマニュアル改善を推進。

**ガイドライン:**
- `docs/manual-creation-guideline-v4.md` ★最新版（HP制作での学びを反映）
- `docs/manual-creation-guideline-v3.md` 新商材作成の完全ガイド
- `docs/manual-creation-guideline-v2.md` UI仕様詳細（GASダイアログ）

---

## 設計思想

### スプレッドシート中心の設計
本体はスプレッドシート+GAS。Next.jsサイトは補助（閲覧用ビュー）。
理由: 担当者が直接メンテナンスできる。コード変更不要。

### GASの2つの機能
- **AIプロンプト生成**: データ+プロンプト → AIに貼り付け → AI出力を使う
- **フォーマット生成**: データ+テンプレート → そのまま使える定型文

### GASセットアップ時の注意点
- **Drive APIサービスの追加が必要**（フォルダ作成機能を使う場合）
- Apps Scriptエディタ → 左メニュー「ライブラリ」の下にある「サービス」→「+」→「Drive API」を追加
- これをしないとフォルダ作成系の機能が動作しない

### 基本セット構成
- プロンプトシート（AIプロンプト管理）
- 設定シート（担当者名等の設定値）
- フォーム連携時: 回答シート + 原本シート

### 入力データの永続化
ダイアログで入力したデータはスプレッドシートに保存して再利用する。

### 表現ルール（非エンジニア向け）
- 「GAS」は使わない → 「ヒアリングシートのメニュー」
- ダイアログサイズは700x750に統一

---

## 商材別業務一覧

| 商材 | 業務数 | 進捗 |
|------|--------|------|
| ツナゲル | 14 | GAS実装済み |
| HP制作 | 11 | ✅ GAS・マニュアル完了（GAS改善待ち） |
| バツグン | 5 | 基本情報のみ |
| LP制作 | 5 | 基本情報のみ |
| SNS広告 | 5 | 基本情報のみ |
| PV制作 | 5 | 基本情報のみ |
| **アニメPV制作** | 7 | ✅ **サイト追加完了**（講座1+サンプル2+リファレンス3+自動化1） |
| **アニリク** | 1 | ✅ **新規追加**（GAS操作マニュアル） |
| パンフ | 3 | 基本情報のみ |
| ロゴ | 3 | 基本情報のみ |
| 月刊Sing | 4 | 基本情報のみ |
| **合計** | **56** | - |

---

## 関連リソース

### HP制作

| リソース | URL/パス |
|---------|---------|
| ヒアリングシート | https://docs.google.com/spreadsheets/d/1GO5fyOd-0lT_OMpLNw6rIZDRA6jrK4lzIAt-0tDxGvc/ |
| HP・LPフォルダ（親） | https://drive.google.com/drive/folders/1Zi2zn57JA3wZQvrEUwGN26jZkRDodWe- |
| テンプレート本体（7種類） | `/mnt/c/hp-template/` |
| ショーケースサイト | `/mnt/c/sing-hp-template/` |
| ショーケースURL | https://sing-hp-template.vercel.app/ |
| 修正マニュアル | https://sing-hp-template.vercel.app/manual |
| GASファイル | `docs/gas/hp/` |
| マニュアル | `docs/manuals/hp/` |
| サンプルデータ | `docs/samples/hp/` ※作成ガイドは `README.md` |

### ツナゲル

| リソース | パス |
|---------|------|
| GASファイル | `docs/gas/tsunageru/` |
| マニュアル | `docs/manuals/tsunageru/` |

### アニリク（anirec）

| リソース | パス |
|---------|------|
| サイトURL | `/products/anirec` |
| 全体マニュアル | `docs/manuals/anirec/00-overall-manual.md` |
| GASファイル | `docs/gas/anime-pv/`（アニメPVと共通） |
| 関連マニュアル | `docs/manuals/anime-pv/03,05,06`（スタイルプロンプト集、キーフレーム操作） |

---

## 参照情報

### HP制作 ヒアリングシート構造

```
【上部（1〜3行目）】
├── 1行目: 企業名
├── 2行目: ステータスヘッダー（B〜G列）
├── 3行目: ステータス入力欄
└── H列: 公開URL

【右側（I〜N列）】
└── 更新ログ

【メインエリア（4行目〜）】
├── Part① 基本情報（フォームから自動転記）
├── Part② ヒアリング情報（打ち合わせで記入）★1行1情報
├── Part③ サーバー情報（フォームから転記 + 補足）
└── Part④ 処理データ（システム管理）
```

### HP制作 Part②ヒアリング項目（39項目）

**ヒアリングの流れ:**
1. ゴール・コンバージョンの確認
2. ターゲットの深掘り（ペルソナ設計）
3. 強みの深掘り（具体例を引き出す）
4. 表現の方向性（キャッチコピー、デザイン、撮影）
5. SEOキーワード設計
6. 新規作成の確認

<details>
<summary>詳細項目一覧（クリックで展開）</summary>

**1. ゴール・コンバージョン（2項目）**
- メインのコンバージョン
- ハードル設定

**2. ターゲットの深掘り（8項目）**
- 年齢層・性別
- 職業・役職・年収帯
- 居住地・勤務地
- 抱えている課題・悩み
- どんな状況で検索するか
- 検索しそうなキーワード
- 比較検討時に重視するポイント
- 問い合わせ・応募前の不安・障壁

**3. 強みの深掘り（8項目）**
- 選ばれる理由の具体例
- お客様・社員からよく言われる褒め言葉
- こだわり・譲れないポイント
- 資格・認定・特許など
- 独自の技術・ノウハウ
- 提出資料で特に使いたい部分
- 募集要項の推しポイント
- 働き方の強み

**4. 表現の方向性（9項目）**
- キャッチコピー既存案
- キャッチコピーイメージ
- 参考キャッチコピー
- デザインの深掘り
- NGイメージ
- 撮影の雰囲気
- 映したいもの
- 社風の具体例
- 表現したいキーワード

**5. SEO・キーワード設計（5項目）**
- 最重要キーワード（3つ）
- サブキーワード（5つ程度）
- ローカルSEO対象地域
- 現在の検索順位
- 競合キーワード

**6. 新規作成の確認（7項目）**
- 代表メッセージ作成方法
- 代表の強調点
- インタビュー対象者
- インタビュー人数
- インタビュー切り口
- よくある質問
- 誤解されたくないこと

</details>

### HP制作 GASメニュー構成

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

2.📝 ヒアリング反映 ★旧「議事録作成」+「文字起こし転記」を統合
├── 議事録作成（プロンプトシートから）
├── 📋 文字起こしを整理（プロンプト生成）
├── 📥 AI出力を転記
├── ❓ 使い方
└── ✏️ ステータス更新

3.📁 素材フォルダ

4.📝 構成案作成 ★JSON出力と統合
├── 📤 HP制作用JSON出力
├── ────────────
├── 📋 構成案プロンプト生成
├── 🤖 Claude Code指示文生成
├── ────────────
├── 🎨 カンプ分析プロンプト生成
├── 🖼️ カンプ版 Claude Code指示文
└── ✏️ ステータス更新

5.🔄 更新・修正・校正 ★2026-02-15追加
├── 🔍 カンプ差分確認・修正
└── 📝 プレースホルダー更新 + SEO/LLMO

📊 進捗管理
```

### HP制作 担当者

- 河合: メイン担当（ヒアリング〜納品〜月次FB）
- 川崎: 素材撮影
- 青柳: CC（全工程で報告を受ける）

### ツナゲル担当者

| 担当者 | 主な業務 |
|--------|---------|
| 渡邉 | 受注・立ち上げ、日程調整 |
| 河合 | 打ち合わせ、原稿、編集 |
| 中尾文香 | 原稿執筆 |
| 川崎 | 企画、撮影、FB |
| 下脇田 | FB |
| 紺谷 | 応募対応 |

---

## 開発コマンド

```bash
npx tsc --noEmit    # TypeScriptエラーチェック（コード変更後は必ず実行）
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-25 | **アニメPV: エフェクトシーン大幅拡張**。(1) 新規アクション10種追加 - コメディ系（double_take, facepalm_to_smile）、ゲーム系（gauge_fill_burst, skill_unlock_pose）、Nike系（explosive_start, finish_line_cross）、プレゼン系（data_convergence, horizon_expand）、ドキュメンタリー系（group_look_up, sepia_to_color）、(2) 新規エフェクト17種追加 - 各アクションに紐づく専用エフェクト（comedy_lightbulb, x_to_o_transition, level_up_fanfare等）、(3) ストーリーパターン×推奨アクション対応 - 全15パターンにカテゴリ別最適アクションを設定、(4) 台本生成プロンプトダイアログ改善 - 推奨スタイル・推奨演出を表示、グリッド高さ固定（175px） |
| 2026-02-24 | **アニメPV: トランジション・エフェクト拡充**。(1) 新アクション完全実装 - `door_open`（扉を開く、5.5秒、爆発2.7s）、`walk_backward`（後ろ向きで歩く、5.0秒、爆発2.5s）、(2) 新エフェクト実装 - `light_flooding`（光の氾濫）、`world_rotation`（世界回転）、`costume_change`（服装変化、door_open/walk_backward両対応）、(3) プレースホルダー拡張 - `[BACKGROUND_BEFORE]`/`[BACKGROUND_AFTER]`で開始・終了背景を個別指定、`[COSTUME_BEFORE]`/`[COSTUME_AFTER]`でシートから服装を自動取得、(4) UI変更 - 背景選択を「開始」「終了」の2ドロップダウンに分離、「カスタム」選択時にテキスト入力欄を表示、(5) 場所オプション追加 - 「暗い閉鎖空間」「カスタム」、(6) 新関数 - `pv_getEffectPromptsV2`（背景・服装プレースホルダー置換対応）、(7) 全15ストーリーパターンに`recommendedActions`配列を追加。**次フェーズ**: 追加アクション候補（turn_around, reach_out, first_step）の検討 |
| 2026-02-23 | **シーン生成プロンプト・フォルダ構造・エフェクトシーン完成**。(1) シーン生成プロンプト - 開始フレーム/動画プロンプトのタブ切替、選択スタイル自動選択、UI改善、(2) フォルダ構造拡張 - とりあえず/、開始フレーム_シーン/エフェクト、動画_シーン/エフェクト、完パケ/、(3) エフェクトシーン作成マニュアル（Phase 5）追加 - ダイアログ説明、開始・終了フレーム生成、I2V動画生成、(4) スクショ14枚追加（46-59番）: 06差し替え、51-55フォルダ構造詳細、56-59エフェクトシーン作成 |
| 2026-02-23 | **アニリク（anirec）新商材として登録**。(1) `src/lib/data/anirec.ts`新規作成（全体マニュアル1タスク）、(2) `index.ts`にanirec追加、(3) `docs/manuals/anirec/00-overall-manual.md`の未追記セクションを補完（Phase 3: キャラクター・シーン編集、4-1: キャラクターシートプロンプト、4-2: 開始フレームプロンプト）、(4) `docs/manuals/anime-pv/00-overall-manual.md`からGAS操作ガイドを削除（講座内容のみに）、(5) PowerDirector/Premiere Pro/スタイルプロンプト集の「メインマニュアルに戻る」リンクをanirecに修正。サイトURL: `/products/anirec`, `/products/anirec/tasks/0/manual` |
| 2026-02-23 | **キーフレームマニュアルをサイト統合**。(1) `docs/guides/`から`docs/manuals/anime-pv/`に移動（05-PowerDirectorキーフレーム操作.md、06-Premiere Proキーフレーム操作.md）、(2) anime-pv.tsにタスク5,6追加（taskCount: 5→7）、(3) 各マニュアルにメインマニュアルへ戻るリンク追加（03, 05, 06）。サイトURL: `/products/anime-pv/tasks/5/manual`, `/products/anime-pv/tasks/6/manual` |
| 2026-02-23 | **Premiere Proキーフレームマニュアル作成**。`docs/guides/premiere-keyframe.md`新規作成。スクショ9枚（`public/images/guides/premiere/`）。内容: スケール変更、ズーム操作、タイムリマップ、イージング（時間補間法）。GIF含む |
| 2026-02-23 | **PowerDirectorキーフレームマニュアル作成**。`docs/guides/powerdirector-keyframe.md`新規作成。スクショ17枚（`public/images/guides/powerdirector/`）。内容: キーフレームとは、スケール変更、ズーム操作、スピード変更、イージング変更。Phase 8エフェクトシーンの関連タスクとして追加（I2Vカメラワーク後処理用） |
| 2026-02-23 | **アニメPV GAS: エフェクトシーン機能完成**。(1) `animePvEffectSettings.js`新規作成 - アクション定義（目を開く/顔を上げる）、エフェクト定義（光の粒子/桜の花びら/4色チョーク/エネルギー波）、各組み合わせのI2Vプロンプト、(2) `animePvEffectScene.js`新規作成 - エフェクトシーンプロンプト生成ダイアログ（アクション選択→エフェクト選択→背景選択→プロンプト生成→シート保存）、(3) サムネイル画像/GIF対応 - 外部ホスティング（assets.yumesuta.com）、16:9表示、onerrorで絵文字フォールバック、(4) 新アクション「扉を開く」「後ろ向きで歩く」を構築中として追加、(5) **教訓: GASではmp4表示不可→GIF変換で対応** |
| 2026-02-21 | **アニメPV GAS: 台本生成・開始フレーム機能改善**。(1) JSONスキーマにstartFrame追加、(2) startFrameにテキスト禁止ルール追加（企業名・看板等を含めない）、(3) パース時にstartFrameにbasePrompt+no textを自動追加、(4) 開始フレームダイアログを編集モーダルに再設計（既存データ表示→編集→保存）、(5) onclickエラー修正（boolean変換）、(6) 保存ボタンのラベル名不一致修正、(7) キャラクターシートプロンプト（テキスト詳細モード）にwhite background, no text追加。修正ファイル: `animePvScriptPrompt.js`, `animePvSheetManager.js`, `animePvMain.js`, `animePvImagePrompt.js` |
| 2026-02-21 | **アニメPV GAS: Phase 7（音声系）マニュアル完成**。スクショ8枚保存（24-31番）、マニュアルにPhase 4「プロンプト生成」セクション追加（歌詞生成、歌詞保存、SUNO BGM、SUNO歌詞付き楽曲、ナレーション編集）。アーティスト風プリセット11種類を記載 |
| 2026-02-20 | **アニメPV制作を新商材として追加**。(1) `src/lib/data/anime-pv.ts`作成、(2) `index.ts`にanimePv追加、(3) マニュアル3件作成: `docs/manuals/anime-pv/00-overall-manual.md`（講座）、`01-鋳物製造業サンプル.md`（4ファイル統合）、`02-自動車部品製造サンプル.md`（4ファイル統合）。サイトで `/products/anime-pv` からアクセス可能。各サンプルへのリンク修正済み |
| 2026-02-20 | **アニメPV制作講座完成**。`docs/guides/pv/00-anime-pv-course.md`。STEP 1-9の完全ガイド（企画→キャラ設計→シーン構成→画像生成→動画生成→音楽生成→編集→完成）。トラブルシューティング・チェックリスト付き |
| 2026-02-20 | **自動車部品製造PV完成**。女性主人公（20歳→28歳）、チームワーク重視、幾田りら風ボーカル。追加シーン（決意・飛び出す）含む全11シーン。ファイル: `auto-parts-*.md` |
| 2026-02-18 | **アニメPV制作サービス開始**。鋳物製造業向け新卒採用PV（45秒）。ガイド作成: `docs/guides/pv/anime-pv-guide.md`。画風: 新海誠風、8シーン構成、BGM/ナレーション/歌詞付き音楽/動画をAI生成 |
| 2026-02-16 | **FB資料スライドレイアウト統一GAS作成**。1ページ目を基準に2〜20ページ目の位置・サイズを統一。GAS: `docs/gas/tsunageru/slideLayoutManager.js`、マニュアル: `docs/manuals/tsunageru/14-FB資料スライド統一.md` |
| 2026-02-15 | HP制作: **更新・修正・校正機能完成**。(1) `updatePrompt.js`新規作成 - カンプ差分確認・修正（セクション単位、修正対象選択式）、プレースホルダー更新+SEO/LLMO（JSON自動取得・シート保存）、(2) カンプ版フロー統一 - `compositionPromptKanpu.js`を通常版と同じフローに修正（「8.実装開始」削除）、(3) マニュアル更新 - `05-HP作成-カンプ版.md`、`07-更新修正校正.md`、(4) SSHキー設定 - elfyakiraアカウント用（`~/.ssh/config`にgithub-elfyakira追加） |
| 2026-02-15 | HP制作: **デザインカンプ版フロー追加**。(1) カンプ版GAS作成（`compositionPromptKanpu.js`）- カンプ分析プロンプト生成、カンプ版Claude Code指示文の2機能、(2) カンプ版マニュアル作成（`05-HP作成-カンプ版.md`）- 厳守事項（文言捏造禁止、プレースホルダー維持、デザイン忠実再現）、バッチ処理対応、(3) 既存GASメニューにカンプ版を統合、(4) 全体マニュアルに2つのフロー（通常版/カンプ版）の導線を追加 |
| 2026-02-15 | HP制作: **No.11 SEO設定マニュアル追加**。GA4設定、サーチコンソール設定、サイトマップ登録（Next.js）、URL検査・インデックス登録の4ステップで構成。全体マニュアルにPhase 7「SEO・LLMO」を追加 |
| 2026-02-03 | HP制作: **No.5 HP実装マニュアル完成**。(1) STEP 1-5のフロー整理（実装見守り→ビルド自動→HANDOFF完了確認→動作確認→ステータス更新）、(2) 自動フローをメインに、手動セットアップはアコーディオンに、(3) コンテキスト限界時の対応セクション追加、(4) ローカル動作確認フロー追加（npm install/run dev/レスポンシブ確認）、(5) WSLパーミッションエラー対応を補足アコーディオンに、(6) スクショ14枚追加。**Vercelデプロイ完了** |
| 2026-02-03 | HP制作: **構成案プロンプト→HP実装フロー整備完了**。(1) 構成案プロンプトのチェックボックスON時の出力指示を修正（ページ未選択でも動作）、(2) Claude Code指示文テンプレートを完全版に戻した、(3) HANDOFFテンプレート（GAS）のセットアップ手順修正（docフォルダ退避→クローン→戻す）、(4) 全体マニュアルNo.4-5のフロー整理・起動術式追加、(5) `99-Claude Code使い方.md`→`99-claude-code.md`にリネーム（includeのスペース問題対応）、(6) No.5にClaude Codeマニュアルのincludeアコーディオン追加、(7) No.4にスクショ2枚追加 |
| 2026-02-02 | **ガイドラインV4作成完了**（`docs/manual-creation-guideline-v4.md`）。V3をベースに5〜9章を新規追加（GAS共通概念、マニュアル作成フロー、全体マニュアル設計、共通マニュアル管理、マニュアル検証フロー）。リファレンス・チェックリストを拡張。次タスク: マニュアル検証（共立工業サンプルで実証） |
| 2026-02-02 | HP制作: **共通マニュアル3件作成完了**（`status-update.md`, `gijiroku.md`, `json-output.md`）。HP全体マニュアルにアコーディオン埋め込み完了（No.0ステータス更新、No.3議事録作成、No.4 JSON出力）。構成案プロンプト・Claude Code指示文はHP固有のため共通化しない。次タスク: マニュアル検証（共立工業サンプルで実証） |
| 2026-02-02 | HP制作: **全体マニュアル作成完了**（`docs/manuals/hp/00-overall-manual.md`）。全11タスク + Claude Code使い方を1ファイルに統合。既存マニュアル（00〜10, 99）は個別参照用として残す。`getManual`関数追加（`src/lib/manuals.ts`）。次タスク: GASテスト（共立工業サンプルで実証） |
| 2026-02-02 | HP制作: 全体マニュアル機能の基盤実装。Product型に`hasOverallManual`追加、Sidebar.tsxに「全体マニュアルを見る」ボタン追加（緑色）、`/products/[id]/overall-manual/page.tsx`作成。次タスク: `docs/manuals/hp/00-overall-manual.md`作成（既存マニュアル統合） |
| 2026-02-02 | HP制作: 全体フロー作成（`docs/flows/hp/overall-flow.md`）。Phase構成、担当者、ツール、GASメニュー、テンプレート選択ガイドを記載 |
| 2026-02-02 | HP制作: Recruit Magazine用サンプル作成完了（共立工業・道路橋梁維持管理・採用特化）。文字起こし・CSV作成、サンプル作成ガイド更新 |
| 2026-02-02 | HP制作: 統一マニュアル（全体フロー）作成計画をHANDOFFに追加。テンプレート7種類×（サンプル作成→GASテスト→スクショ→マニュアル）の進捗表を作成。既存サンプル: 中部建設（Standard用）、三河精密工業（LeadGen Visual用） |
| 2026-02-02 | HP制作: 全テンプレート実装完了（7種類）+ ショーケースサイト完成。テンプレート本体を`/mnt/c/hp-template/`に配置、ショーケースを`/mnt/c/sing-hp-template/`に配置。GAS `compositionPrompt.js`は7種類対応済み |
| 2026-02-01 | HP制作: Recruit Magazine Phase 3完了（全8ページ実装完了）- Aboutページ（代表メッセージ・経営理念・沿革・会社概要・アクセス）、Cultureページ（福利厚生ハイライト・一覧・研修制度・ギャラリー・社員の声）。次タスク: Local Visualテンプレート作成 |
| 2026-02-01 | HP制作: Recruit Magazine Phase 2完了 - Work/Recruit/FAQページ実装。Workページ（職種紹介・1日の流れ・キャリアパス）、Recruitページ（募集要項・選考フロー）、FAQページ（展開表示・問い合わせ誘導）。次タスク: Phase 3実装（About/Culture） |
| 2026-02-01 | HP制作: Recruit Magazine設計仕様完成 - 専門家3名による完全設計仕様書作成（PART1-4: 全体戦略、8ページ詳細設計、8コンポーネント、site.json構造）。`spec-recruit-magazine.md`と`HANDOFF-recruit-magazine.md`を作成。次タスク: Phase 1実装（TOP/People/Entry） |
| 2026-01-31 | HP制作: テンプレート拡充計画完了 - 専門家諮問実施、型×表現マトリクス設計採用、5プリセット定義。計画書を`docs/plans/hp-template-expansion/`に保存。次タスク: Phase 1実装（Recruit Magazine, Local Visual） |
| 2026-01-31 | HP制作: テンプレート拡充計画 - 3人の専門家諮問プロンプト作成、HANDOFFに追加。次タスク: プロンプト実行→追加テンプレート決定 |
| 2026-01-31 | HP制作: フルオーダーテンプレート作成完了 - `template-fullorder`リポジトリ作成・プッシュ、site.jsonにnavigation追加、Header/Footerをsite.navigation対応に変更、compositionPrompt.jsにテンプレート追加 |
| 2026-01-31 | HP制作: STEP 8完了 - `template-standard`リポジトリ作成・プッシュ、全ページプレースホルダー化（about/service/recruit/contact/privacy/news）、compositionPrompt.js修正（テンプレート選択UI・セットアップ手順更新）。次タスク: フルオーダーテンプレート作成 |
| 2026-01-31 | HP制作: STEP 8進行中 - テンプレート作業場所を`/mnt/c/hp-template/template-standard/`に作成、ハイブリッド方式採用（site.json+直接編集）、site.json構造定義、lib/site.ts作成、Header/Footer/layout/page.tsxをsite.json連携に修正、ロゴファイル名汎用化完了。残り: 他ページのプレースホルダー化、リポジトリプッシュ、GAS修正 |
| 2026-01-31 | HP制作: STEP 7完了・STEP 8開始 - テンプレートリポジトリ問題発見（ショーケースサイトだった）、解決策決定（中部建設HPを第一テンプレートとして別リポジトリ化）、compositionPrompt.js修正（セットアップ手順をHANDOFF.mdに移動）、トラブルシューティング追加 |
| 2026-01-31 | HP制作: 実装テスト中 - 構成案プロンプト改善（ファイル保存指示明示化）、マニュアルにトラブルシューティング追加 |
| 2026-01-31 | HP制作: 製造業サンプル作成完了（三河精密工業）- 文字起こし・CSV・サンプル作成ガイド。次タスク: 実装テスト |
| 2026-01-31 | HP制作: HANDOFFテンプレート拡充（企業情報、ロゴ、ブランドカラー、ヘッダー/フッター仕様等追加）、コーディングルール改善（@themeブロックのブランドカラー変更指示）、HANDOFF_GUIDE.md作成。次タスク: 製造業の文字起こしサンプル作成 → 実装テスト |
| 2026-01-31 | HP制作: Claude Code指示文フロー改善 - ユーザー向け/Claude Code向け指示を分離、ダイアログに起動場所案内追加（client_hp/ + WSL注意書き）、globals.css編集禁止ルール追加、テンプレートクローン指示を明確化（cp -r方式） |
| 2026-01-31 | HP制作: STEP 5完了（構成案プロンプトにClaude Code用出力指示追加）、Claude Code使い方マニュアル作成（99-Claude Code使い方.md）、GitHubテンプレートリポジトリ設定完了。次タスク: 実装テスト + テンプレート選択問題の検討 |
| 2026-01-31 | HP制作: 中部建設の構成案作成完了 → 次タスクとして「Claude Code用出力指示追加」をHANDOFFに記載。成功例を `/mnt/c/work-manual/chubu-kensetsu-hp/doc/wireframe/` に保存（9ファイル、128KB） |
| 2026-01-31 | HP制作: マニュアル更新（04-JSON出力・原稿生成）- メニュー統合反映、テンプレート選択説明追加、セットアップ指示書説明、次世代セッション開始方法追記、技術スタック更新 |
| 2026-01-31 | HP制作: Claude Code指示文大幅改善 - 「実装指示」→「セットアップ指示」に変更、ダイアログにテンプレート選択追加、企業ディレクトリ・HANDOFF生成方式に変更 |
| 2026-01-31 | HP制作: メニュー統合（2回目）- 「4.JSON出力」と「5.構成案作成」を「4.構成案作成」に統合（メニュー5→4個に） |
| 2026-01-31 | HP制作: フォルダ機能修正 - 企業フォルダ名を会社正式名称に変更、素材フォルダ→ページフォルダ追加に変更、Part④「素材フォルダURL」→「選択ページ」に変更、**GASにDrive APIサービス追加が必要**（ライブラリ下のサービスから追加） |
| 2026-01-31 | HP制作: 構成案プロンプト大幅改善 - 3人の専門家プロンプト、反AIデザイン哲学、選択ページ連携、プロンプトシート自動登録 |
| 2026-01-30 | HP制作: マニュアル更新完了（03, 04, 05, 06）- メニュー番号修正、スクショ10枚挿入 |
| 2026-01-30 | HP制作: GASテスト（Part①〜③転記修正）、プロンプトシート構造統一（settingsSheet.jsに一本化）、マニュアル更新（01-打ち合わせ前準備にスクショ追加） |
| 2026-01-30 | HP制作: HANDOFF整理（25907トークン→350行に簡潔化）、マニュアル全11タスク詳細化完了 |
| 2026-01-30 | HP制作: GAS全10ファイル作成完了、Googleフォーム作成・適用完了 |
| 2026-01-14 | GAS最適化: settingsSheet.js 4ダイアログにCI_DIALOG_STYLES/CI_UI_COMPONENTS適用、サイズ700x750統一、手動変更可能の説明追加 |
| 2026-01-14 | GAS最適化: commonStyles.jsにbtn-add、btn-delete追加 |
| 2026-01-14 | GAS最適化レポート作成（docs/gas-optimization-report.md）、将来改善に入力キー・保存キー管理を追加 |
| 2026-01-14 | 全14タスクのflowStepsに「ステータス更新」ステップを追加、表現ルール統一（GAS→ヒアリングシートのメニュー） |
| 2026-01-14 | ガイドラインv3更新（表現ルール、ステータス更新ステップ追加、品質チェック項目追加） |
| 2026-01-14 | 商材ページUI改善: 業務数・課題・サマリーを最下部に移動してアコーディオン化、Accordion.tsx新規作成 |
| 2026-01-14 | タスク定義を設定シートから取得するように変更（progressManager.js→getTasks()、hearingSheetManager.js連携） |
| 2026-01-14 | タスク統合（15→14タスク）: No.0とNo.1を統合、マニュアル・tsunageru.ts・GAS更新 |
| 2026-01-14 | ステータス更新ダイアログを全メニューに追加（企業情報入力、初回打ち合わせ、議事録作成、構成案作成、連絡フォーマット） |
| 2026-01-14 | 更新ログ機能追加（I〜N列、タスク変更・保持者変更・状態・メモ・工数を記録） |
| 2026-01-14 | ステータス欄を6項目に拡張（状態・全体ステータス追加、条件付き書式追加） |
| 2026-01-14 | 進捗管理機能実装（progressManager.js、ステータス管理・進捗一覧・進捗ログ） |
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
| 2026-01-13 | 全14タスクのmdファイル作成完了（docs/manuals/tsunageru/に00〜13のマニュアル） |
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
