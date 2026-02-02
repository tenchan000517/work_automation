# HP制作 全体マニュアル

**統合版マニュアル** - 全11タスク + Claude Code使い方

このマニュアルは、HP制作の全工程（受注から月次FBまで）を1つにまとめた統合版です。
各タスクの詳細は個別マニュアルも参照できます。

---

## 目次

- [全体フロー](#全体フロー)
- [No.0 受注・立ち上げ](#no0-受注立ち上げ)
- [No.1 打ち合わせ前準備](#no1-打ち合わせ前準備)
- [No.2 初回打ち合わせ](#no2-初回打ち合わせ)
- [No.3 文字起こし・転記](#no3-文字起こし転記)
- [No.4 JSON出力・原稿生成](#no4-json出力原稿生成)
- [No.5 HP作成](#no5-hp作成)
- [No.6 素材撮影（オプション）](#no6-素材撮影オプション)
- [No.7 修正・根拠作成](#no7-修正根拠作成)
- [No.8 MVP確認・修正](#no8-mvp確認修正)
- [No.9 納品](#no9-納品)
- [No.10 月次FB](#no10-月次fb)
- [Claude Code使い方](#claude-code使い方)

---

## 全体フロー

```
【Phase 1: 準備】
No.0 受注・立ち上げ（渡邉）
    ↓ グループ作成・日程調整
No.1 打ち合わせ前準備（河合）
    ↓ シート作成・撮影日確認

【Phase 2: ヒアリング】
No.2 初回打ち合わせ（渡邉・河合）
    ↓ NOTTA録音・ヒアリング
No.3 文字起こし・転記（河合）
    ↓ AI整理・39項目転記

【Phase 3: 構成案作成】
No.4 JSON出力・原稿生成（河合）
    ↓ 構成案プロンプト→Claude Code指示文

【Phase 4: 制作】
No.5 HP作成（河合）
    ↓ Claude Codeで実装
No.6 素材撮影（川崎）※オプション
    ↓ 写真・動画素材撮影
No.7 修正・根拠作成（河合）
    ↓ リデザイン・トークスクリプト

【Phase 5: 納品】
No.8 MVP確認・修正（河合）
    ↓ FB収集・修正
No.9 納品（河合）
    ↓ 本番公開

【Phase 6: 運用】
No.10 月次FB（河合）
    ↓ 定期フィードバック
```

### 担当者一覧

| 担当者 | 主な業務 |
|--------|---------|
| 渡邉 | 受注・立ち上げ、日程調整 |
| 河合 | 打ち合わせ〜納品〜月次FB（メイン担当） |
| 川崎 | 素材撮影 |
| 青柳 | CC（全工程で報告を受ける） |

### テンプレート一覧（7種類）

| テンプレート | 特徴 | ページ数 |
|-------------|------|---------|
| Standard | 企業HP標準テンプレート | 6 |
| Recruit Magazine | 採用特化、マガジン形式 | 7 |
| LeadGen Minimal | CV最短ルート、ミニマル | 4 |
| LeadGen Visual | 地域密着型、ビジュアル | 5 |
| Trust Visual | 信頼構築型、ビジュアル | 6 |
| Authority Minimal | 権威性訴求、ミニマル | 8 |
| Full Order | フルオーダー、カスタム | 自由 |

### 主要リンク

| リソース | URL |
|---------|-----|
| ヒアリングシート | https://docs.google.com/spreadsheets/d/1GO5fyOd-0lT_OMpLNw6rIZDRA6jrK4lzIAt-0tDxGvc/ |
| └ フォーム回答シート | 同上（gid=107403975） |
| 事前ヒアリングフォーム（回答者用） | https://forms.gle/oboPCja6Ec8K3tuX6 |
| 事前ヒアリングフォーム（編集用） | https://docs.google.com/forms/d/1sIpvg11In1GCp3JOUbDSIYiwoHnHYIH50gXw7jYhT5Y/edit |
| HP・LPフォルダ | https://drive.google.com/drive/folders/1Zi2zn57JA3wZQvrEUwGN26jZkRDodWe- |
| テンプレート一覧 | https://sing-hp-template.vercel.app/ |
| 修正マニュアル | https://sing-hp-template.vercel.app/manual |

---

## No.0 受注・立ち上げ

> **個別マニュアル**: [00-受注・立ち上げ.md](./00-受注・立ち上げ.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 渡邉 |
| 成果物 | 企業グループ、日程確定 |
| 次工程 | No.1 打ち合わせ前準備（河合） |

### 目的

受注後、ワークスグループを立ち上げ、初回打ち合わせの日程調整までを完了する。
製作陣がグループ立ち上げを確認したら、各種対応が進んでいるかウォッチし、必要に応じてフォローする。

### フロー

#### 1. グループ作成

LINEWORKSで企業グループを立ち上げる。

**グループ名:** 【HP制作】○○株式会社

**メンバー:**
- 渡邉（営業担当）
- 河合（制作メイン）
- 青柳（CC）

**手順:**
1. LINEWORKSにログイン
2. 左メニューから「グループ」を選択
3. 「＋」ボタンから新規グループ作成
4. グループ名を「【HP制作】○○株式会社」の形式で入力
5. メンバーを追加
6. 作成完了

#### 2. 情報共有

企業基本情報をフォーマットでグループに共有する。

**フォーマット:**
```
============================
■基本情報
============================
企業名:
担当者名:
役職・部署:
連絡先（電話）:
連絡先（メール）:
契約開始日:

============================
■受注内容
============================
受注商材: HP制作
契約金額:
備考:

============================
■制作担当
============================
メイン担当: 河合
```

#### 3. 日程調整

初回打ち合わせの日程を先方と調整する。

- 候補日を複数提示
- 先方の都合を確認
- 参加者の予定を調整

#### 4. カレンダー登録

確定した日程をカレンダーに登録する。

- Google Meetリンクを発行
- 参加者全員を招待

#### 5. ワークス共有

日程確定をグループに報告する。

**日程確定報告フォーマット:**
```
お疲れ様です。

下記の通り日程が確定しましたのでご連絡します。

━━━━━━━━━━━━━━━━━━
■ 打ち合わせ概要
━━━━━━━━━━━━━━━━━━
【企業名】
【日時】
【場所】Google Meet
【参加者】

━━━━━━━━━━━━━━━━━━
■ Meet URL
━━━━━━━━━━━━━━━━━━
（ここにURLを貼る）

よろしくお願いいたします。
```

#### 6. ステータス更新

ステータスを更新して次の担当者（河合）へ引き継ぐ。

<details style="border: 2px solid #9C27B0; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f3e5f5;">
<summary style="cursor: pointer; font-weight: bold; color: #7B1FA2;">✏️ ステータス更新の詳細手順（クリックで展開）</summary>

<!-- include: common/status-update.md -->

</details>

### トリガー（次工程へ進む条件）

日程確定＋カレンダー登録＋ワークス報告

### 成果物

- 企業グループ（ワークス）
- 企業基本情報の共有フォーマット（記入済み）
- 確定日程（カレンダー登録済み）

---

## No.1 打ち合わせ前準備

> **個別マニュアル**: [01-打ち合わせ前準備.md](./01-打ち合わせ前準備.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 成果物 | ヒアリングシート、企業フォルダ、撮影候補日 |
| 次工程 | No.2 初回打ち合わせ（渡邉・河合） |

### 目的

初回打ち合わせをスムーズに行うための事前準備。
ヒアリングシートを作成し、撮影可能日程も事前に確認しておく。

### フロー

#### 1. 回答確認

フォームの事前回答を確認する。

ヒアリングシートを開き、「事前ヒアリング回答」シートを確認します。

<img src="/images/hp/no1/step1-form-response.png" alt="事前ヒアリング回答シート" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

回答があれば次のステップでヒアリングシートを作成します。
回答がない場合は、先方にリマインドするか「新規作成（手動）」で空のシートを作成します。

#### 2. シート作成

ヒアリングシートのスプレッドシートを開き、メニューからシートを作成する。

**パターンA：フォーム回答済みの場合**

1. ヒアリングシートのスプレッドシートを開く
2. メニュー「**1.📋 HP制作**」をクリック

<img src="/images/hp/no1/step2-menu.png" alt="HP制作メニュー" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

3. 「**🆕 新規ヒアリングシート作成（フォーム回答から）**」を選択

<img src="/images/hp/no1/step2-dialog-new.png" alt="フォーム回答から新規作成ダイアログ" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

4. ドロップダウンから該当企業を選択

<img src="/images/hp/no1/step2-dialog-select.png" alt="企業選択" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

5. 「実行」をクリック

<img src="/images/hp/no1/step2-dialog-complete.png" alt="シート作成完了" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

→ 「○○株式会社」シート（タブ）が自動作成される
→ フォームの回答データがPart①・Part③に自動転記される

<img src="/images/hp/no1/step2-sheet-upper.png" alt="作成されたヒアリングシート" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

<details style="border: 2px solid #FF9800; border-radius: 8px; padding: 16px; margin: 16px 0; background: #fff8e1;">
<summary style="cursor: pointer; font-weight: bold; color: #E65100;">🔐 初回のみ: GAS認証手順（クリックで展開）</summary>

<!-- include: common/gas-auth.md -->

</details>

**パターンB：フォーム未回答の場合**

1. ヒアリングシートのスプレッドシートを開く
2. メニュー「**1.📋 HP制作**」をクリック
3. 「**🆕 新規ヒアリングシート作成（手動）**」を選択

<img src="/images/hp/no1/step2-dialog-manual.png" alt="手動作成ダイアログ" style="max-width: 350px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

4. 企業名を入力して「OK」をクリック

→ 「○○株式会社」シート（タブ）が作成される（空の状態）
→ 初回打ち合わせで直接ヒアリングしながら入力

**⚠️ 企業名入力ルール（重要）**

手動作成時の企業名は必ず以下のルールで入力：

✅ **正しい例：**
- 株式会社○○
- ○○株式会社
- 有限会社○○

❌ **間違い例：**
- (株)○○　← カッコ省略NG
- ㈱○○　← 省略記号NG
- ○○ 株式会社　← 余計なスペースNG

#### 3. フォルダ作成

ヒアリングシートのメニューから企業フォルダを作成する。

**手順:**
1. ヒアリングシートを開く（作成した企業シートを選択）
2. メニュー「**1.📋 HP制作**」→「**📂 企業フォルダ作成**」
3. 対象企業を選択（アクティブなシートが自動選択される）

<img src="/images/hp/no1/step3-folder-select.png" alt="企業フォルダ作成 - 企業選択" style="max-width: 500px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

4. 必要に応じてサブフォルダを選択（オプション）
   - ページ構成が決まっている場合、サブフォルダを一緒に作成できます
   - 「＋カスタムフォルダを追加」で任意のフォルダ名も追加可能

<img src="/images/hp/no1/step3-folder-options.png" alt="サブフォルダオプション" style="max-width: 500px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

5. 「📂 フォルダを作成」をクリック
6. 完了ダイアログが表示される

<img src="/images/hp/no1/step3-folder-complete.png" alt="フォルダ作成完了" style="max-width: 450px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

→ 「フォルダを開く」ボタンでGoogle Driveを開けます
→ 「URLをコピー」ボタンでURLをコピーできます
→ 作成したサブフォルダ一覧が表示されます

**作成されたフォルダ:**

<img src="/images/hp/no1/step3-folder-result.png" alt="Google Drive フォルダ" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

```
HP・LP フォルダ/
└── [企業名]/ ← 今回作成
    ├── TOP/
    ├── テスト/
    └── （その他選択したサブフォルダ）
```

<!-- include: common/pre-meeting-steps-4-8.md -->

### 成果物

- ヒアリングシート（企業名入り、フォームデータ転記済み）
- 企業フォルダ（作成済み）
- 撮影可能日程（5候補程度）

---

## No.2 初回打ち合わせ

> **個別マニュアル**: [02-初回打ち合わせ.md](./02-初回打ち合わせ.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 渡邉, 河合 |
| 使用ツール | Google Meet, NOTTA, ヒアリングシート |
| 成果物 | ヒアリングシート（記入済み）、NOTTA議事録、撮影日程 |
| 次工程 | No.3 文字起こし・転記（河合） |

### 目的

企業のHP制作ニーズを把握し、HP制作に必要な情報を収集する。

### 参加者

- 企業担当者
- 渡邉（営業）
- 河合（制作）

### フロー

#### 1. NOTTA起動

録音・文字起こしを開始する。

<details style="border: 2px solid #1565C0; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f8fafc;">
<summary style="cursor: pointer; font-weight: bold; color: #1565C0;">📹 NOTTAの詳細手順（クリックで展開）</summary>

<!-- include: common/notta.md -->

</details>

#### 2. MTG開始

初回打ち合わせを実施する。

**事前準備チェック:**
- [ ] ヒアリングシートの黄色部分が先方記入済みか確認
- [ ] Google Meetリンクを送付済みか確認
- [ ] NOTTA録音開始済みか確認

**打ち合わせ内容（60分想定）:**

**【1. 自己紹介・本日の流れ説明（5分）】**

**【2. 企業・HP制作の背景ヒアリング（20分）】**
- 事業内容の確認
- HP制作の目的・背景
- 現状のHP（ある場合）の課題
- ターゲット層

**【3. HP制作の方向性確認（15分）】**
- 掲載したいコンテンツ
- デザインの方向性
- 参考サイト
- NGワード・表現の確認

**【4. 素材撮影について（10分）】**
- 撮影が必要か確認（撮影あり / 先方用意）
- 撮影候補日の提示（事前に川崎から取得済み）
- 撮影場所の候補

**【5. 今後のスケジュール確認（10分）】**
- HP納品目安
- 撮影日（必要な場合）
- 次回打ち合わせ

#### 3. シート記入

打ち合わせ内容を随時記録する。

打ち合わせ中、ヒアリングシートのPart②（白いセル）に内容を記入していきます。

**記入のポイント:**
- キーワードをメモする程度でOK（詳細はNOTTA議事録で補完）
- 「HP制作の目的」「ターゲット層」「参考サイト」は特に丁寧に記録
- 先方の言葉をそのまま使う（言い換えない）

#### 4. 撮影日調整

撮影候補日を提示・確定する。

事前に川崎から取得した撮影候補日5つを先方に提示し、日程を確定します。

**撮影パターン:**

| パターン | 説明 |
|----------|------|
| A. 撮影あり（動画） | HPの中に動画を配置 |
| B. 撮影あり（写真） | 高解像度素材写真を配置 |
| C. 先方用意 | 先方に素材を用意してもらう |

#### 5. NOTTA確認

録音停止・データを確認する。

1. 打ち合わせ終了時、「録音を停止」をクリック
2. NOTTAのダッシュボードで録音データを確認
3. 文字起こしが正しく行われているか確認
4. 必要に応じてダウンロード

#### 6. すり合わせ

営業担当と内容の認識合わせを行う。

**すり合わせ内容:**
- ヒアリング内容の認識合わせ
- HPの方向性確認
- 先方の温度感・要望の共有
- 懸念点があれば共有

#### 7. ステータス更新

ステータスを更新して次の担当者（河合）へ。

### HP制作固有のヒアリング項目

| 項目 | 内容 |
|------|------|
| HP制作の目的 | 新規顧客獲得、採用強化、ブランディングなど |
| ターゲット層 | 誰に向けたHPか |
| 掲載コンテンツ | 会社概要、サービス紹介、採用情報、お問い合わせなど |
| デザインの方向性 | モダン、シンプル、親しみやすい、高級感など |
| 参考サイト | 「こんな感じにしたい」というイメージ |
| 写真素材 | 撮影するか、先方用意か、フリー素材か |

### チェックポイント

- [ ] 必要な情報がヒアリングできているか
- [ ] NOTTAの録画が正常に完了しているか
- [ ] 撮影日程（または素材準備）が確定しているか
- [ ] HP制作の方向性が明確か

---

## No.3 文字起こし・転記

> **個別マニュアル**: [03-文字起こし・転記.md](./03-文字起こし・転記.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | NOTTA, スプレッドシート（ヒアリングシートのメニュー） |
| 成果物 | Part②ヒアリング情報（39項目） |
| 次工程 | No.4 JSON出力・原稿生成 |

### 目的

初回打ち合わせの文字起こしから、HP制作に必要なヒアリング情報（39項目）を抽出し、ヒアリングシートのPart②に転記する。

### フロー概要

```
NOTTA文字起こし確認
    ↓
📋 文字起こしを整理（プロンプト生成）
    ↓ ※プロンプトをコピーしてAIに貼り付け
AIがJSON形式で出力
    ↓
📥 AI出力を転記
    ↓
Part②に39項目が転記される
    ↓
内容確認・修正
    ↓
ステータス更新
```

### 作業手順

#### Step 1: NOTTA文字起こしの確認

1. **NOTTAにログイン**してプロジェクト一覧を開く
2. 該当の打ち合わせの**文字起こしを表示**
3. 内容を確認し、**必要に応じて修正**
   - 固有名詞（会社名、人名など）の誤変換を修正
   - 明らかな誤認識を修正
4. 文字起こし全文を**コピー**

#### （オプション）議事録を作成する場合

打ち合わせ内容を議事録形式でまとめる場合は、以下の手順で作成できます。

<details style="border: 2px solid #FF5722; border-radius: 8px; padding: 16px; margin: 16px 0; background: #fff3e0;">
<summary style="cursor: pointer; font-weight: bold; color: #E64A19;">📝 議事録作成の詳細手順（クリックで展開）</summary>

<!-- include: common/gijiroku.md -->

</details>

#### Step 2: プロンプト生成 → AI実行

文字起こしからヒアリング情報（39項目）を抽出するプロンプトを生成し、AIに実行させます。

1. メニュー「**2.📝 ヒアリング反映**」→「**📋 文字起こしを整理（プロンプト生成）**」
2. 対象企業を選択
3. 文字起こし全文を貼り付け
4. 「🔄 プロンプト生成」→「📋 コピー」
5. AI（Claude/ChatGPT/Gemini）に貼り付けて実行
6. AIがJSON形式で39項目を出力 → 全文コピー

<details style="border: 2px solid #1565C0; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f8fafc;">
<summary style="cursor: pointer; font-weight: bold; color: #1565C0;">📋 文字起こし整理の詳細手順（クリックで展開）</summary>

<!-- include: common/transcript.md -->

</details>

#### Step 3: AI出力を転記

AIが出力したJSON形式のヒアリング情報をヒアリングシートのPart②に転記します。

1. メニュー「**2.📝 ヒアリング反映**」→「**📥 AI出力を転記**」
2. 対象企業を選択
3. AIが出力したJSONを貼り付け
4. 「🔄 解析して比較」→ 転記内容を確認
5. 「✅ チェック項目を転記」→ Part②に39項目が転記される

<details style="border: 2px solid #4CAF50; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f1f8e9;">
<summary style="cursor: pointer; font-weight: bold; color: #2E7D32;">📥 AI出力転記の詳細手順（クリックで展開）</summary>

<!-- include: common/transfer.md -->

</details>

#### Step 4: 内容確認・補足入力

1. ヒアリングシートのPart②を確認
2. 手動で補足・修正

#### Step 5: ステータス更新

メニュー「**2.📝 ヒアリング反映**」→「**✏️ ステータス更新**」

### Part②の39項目

| カテゴリ | 項目数 | 主な内容 |
|---------|--------|----------|
| 1. ゴール・コンバージョン | 2 | メインのCV、ハードル設定 |
| 2. ターゲットの深掘り | 8 | 年齢層、職業、課題、検索キーワードなど |
| 3. 強みの深掘り | 8 | 選ばれる理由、褒め言葉、こだわりなど |
| 4. 表現の方向性 | 9 | キャッチコピー、デザイン、撮影イメージなど |
| 5. SEO・キーワード設計 | 5 | 最重要KW、サブKW、対象地域など |
| 6. 新規作成の確認 | 7 | 代表メッセージ、インタビュー対象など |

---

## No.4 JSON出力・原稿生成

> **個別マニュアル**: [04-JSON出力・原稿生成.md](./04-JSON出力・原稿生成.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | スプレッドシート（ヒアリングシートのメニュー）, AI（Claude/ChatGPT） |
| 成果物 | 構成案, セットアップ指示書, 企業ディレクトリ（HANDOFF.md含む） |
| 次工程 | No.5 HP作成 |

### 目的

ヒアリングシートの情報をJSON形式で出力し、AIを活用してHP構成案を作成。最終的にClaude Codeでセットアップを行い、次世代セッションでHP実装を開始できる状態を作る。

### フロー概要

```
【STEP 1】JSON出力
ヒアリングシート（Part①②）
    ↓ メニュー「4.📝 構成案作成」→「📤 HP制作用JSON出力」
JSON形式で出力（Part④に自動保存）
    ↓ コピー

【STEP 2】構成案作成
    ↓ メニュー「4.📝 構成案作成」→「📋 構成案プロンプト生成」
JSON + テンプレート = プロンプト
    ↓ コピーして外部AI（Claude/ChatGPT）に貼り付け
AIが構成案を出力
    ↓ コピー

【STEP 3】Claude Code指示文生成
    ↓ メニュー「4.📝 構成案作成」→「🤖 Claude Code指示文生成」
構成案 + JSON + テンプレート選択 = セットアップ指示書
    ↓ コピー

【STEP 4】HP作成開始
    ↓ Claude Codeにセットアップ指示書を投入
企業ディレクトリ・HANDOFF作成
    ↓ 次世代セッションでHP実装開始
```

### 作業手順

#### STEP 1: JSON出力

1. ヒアリングシートを開く
2. メニュー「**4.📝 構成案作成**」→「**📤 HP制作用JSON出力**」をクリック
3. 対象企業を選択
4. 「🔄 JSON生成」ボタンをクリック
5. 「📋 コピー」ボタンでJSONをコピー

<details style="border: 2px solid #2196F3; border-radius: 8px; padding: 16px; margin: 16px 0; background: #e3f2fd;">
<summary style="cursor: pointer; font-weight: bold; color: #1565C0;">📤 JSON出力の詳細手順（クリックで展開）</summary>

<!-- include: common/json-output.md -->

</details>

⚠️ **Part③サーバー情報は含まれません**（セキュリティ対策）

#### STEP 2: 構成案プロンプト生成

1. メニュー「**4.📝 構成案作成**」→「**📋 構成案プロンプト生成**」をクリック
2. 対象企業を選択
3. 「🔄 プロンプト生成」ボタンをクリック
4. 「📋 コピー」ボタンでプロンプトをコピー

<details style="border: 2px solid #4CAF50; border-radius: 8px; padding: 16px; margin: 16px 0; background: #e8f5e9;">
<summary style="cursor: pointer; font-weight: bold; color: #2E7D32;">📸 構成案プロンプト生成の画面（クリックで展開）</summary>

**メニュー「4.📝 構成案作成」**

<img src="/images/hp/no4/step2-menu.png" alt="構成案作成メニュー" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 8px 0;" />

**構成案プロンプト生成ダイアログ**

<img src="/images/hp/no4/step2-composition-prompt.png" alt="構成案プロンプト生成ダイアログ" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 8px 0;" />

- **Claude Code起動場所**: `client_hp/`（WSL環境: `/mnt/c/client_hp/`）
- **☑️ Claude Codeで実行する**: チェックするとファイル保存指示が追加される
- **3人の専門家プロンプト**: WEBマーケティングプロ、求人コンサルタント、WEBデザイナーによる構成案作成

</details>

#### STEP 3: Claude Codeで構成案を作成・保存

**「☑️ Claude Codeで実行する」にチェックを入れた場合の推奨フロー**

1. `client_hp/` フォルダでClaude Codeを起動
   ```bash
   cd /mnt/c/client_hp
   claude
   ```

2. コピーしたプロンプトを貼り付けてEnter

3. Claude Codeが自動で以下を実行：
   - ディレクトリ作成（`client_hp/{{企業名英語}}/`）
   - HANDOFF.md作成
   - `doc/wireframe/` に構成案ファイルを順次保存
     - `00_overview.md` - サイト全体の戦略設計
     - `01_top.md` - TOPページ
     - `02_about.md` - 会社概要
     - ... 各ページごとに作成

4. 完了後のフォルダ構成：
   ```
   client_hp/{{企業名英語}}/
   ├── HANDOFF.md                    # 進捗管理・引き継ぎ用
   └── doc/
       └── wireframe/
           ├── 00_overview.md        # サイト全体の戦略設計
           ├── 01_top.md             # TOPページ
           ├── 02_about.md           # 会社概要
           ├── ...                   # 各ページ
           ├── XX_common_parts.md    # ヘッダー・フッター
           └── XX_photo_guide.md     # 撮影指示書
   ```

![構成案セットアップ完了](/images/hp/no5/step1-setup-complete.png)

---

<details style="border: 1px solid #ddd; border-radius: 8px; padding: 0; margin: 16px 0;">
<summary style="background: #f5f5f5; padding: 12px 16px; cursor: pointer; font-weight: bold;">📝 別の方法: Claude Code指示文を使う（クリックで展開）</summary>
<div style="padding: 16px;">

「Claude Code指示文生成」ダイアログを使う方法もあります。

1. メニュー「**4.📝 構成案作成**」→「**🤖 Claude Code指示文生成**」をクリック
2. 対象企業を選択
3. テンプレートを選択（7種類から選択）

   | テンプレート | 特徴 | ページ数 |
   |-------------|------|---------|
   | 標準テンプレート | 企業HP標準テンプレート | 6 |
   | フルオーダー | 完全カスタム | 0 |
   | 採用サイト（マガジン形式） | 採用特化、読ませるエディトリアル | 7 |
   | リード獲得型（ミニマル） | CV最短ルート、余白とタイポグラフィ | 4 |
   | 地域密着型（ビジュアル） | 地域商圏×SEO、写真・動画主役 | 5 |
   | 信頼構築型（ビジュアル） | 社会的証明の最大化 | 6 |
   | 権威性訴求（ミニマル） | 専門性・実績で説得 | 8 |

4. 構成案を貼り付け
5. 「🔄 指示文生成」ボタンをクリック
6. 「📋 コピー」ボタンで指示文をコピー

![Claude Code指示文生成ダイアログ](/images/hp/no4/step2-claude-code-dialog.png)

</div>
</details>

---

#### STEP 4: 次のフェーズ（HP実装）へ

構成案ファイルが作成されたら、**新しいセッションで**No.5 HP作成へ進みます。

> ⚠️ **重要:** 構成案プロンプト実行後はコンテキストが満タンになっています。
> 必ず **新しいセッション** を開始してください。

**セッションをリセットする手順:**

1. **`/clear` を実行**

![次のステップ表示](/images/hp/no5/step1-next-steps.png)

2. **ターミナルを閉じる（いずれか）:**
   - 新しいターミナルウィンドウを開く
   - WSLを `Ctrl+C` 2回押しで終了して再起動

![/clear実行](/images/hp/no5/step0-clear.png)

**起動術式（新しいセッションで実行）:**

1. 企業ディレクトリに移動してClaude Codeを起動：
   ```bash
   cd /mnt/c/client_hp/{{企業名英語}}
   claude
   ```

![cd→claude起動](/images/hp/no5/step0-cd-claude.png)

![Claude Code Welcome画面](/images/hp/no5/step0-claude-welcome.png)

2. Claude Codeに最初の指示：
   ```
   HANDOFF.mdを読んで指示に従って実装を開始してください
   ```

3. Claude Codeが自動で以下を実行：
   - HANDOFFの「最初にやること（セットアップ）」を読む
   - テンプレートをクローン（docフォルダを退避→クローン→戻す）
   - npm install
   - 構成案（doc/wireframe/）に従って実装開始

#### STEP 5: ステータス更新

メニュー「**4.📝 構成案作成**」→「**✏️ ステータス更新**」

---

## No.5 HP作成

> **個別マニュアル**: [05-HP作成.md](./05-HP作成.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | Claude Code, VSCode, ターミナル |
| 成果物 | HPソースコード（Next.js） |
| 次工程 | No.6 素材撮影（オプション）または No.7 修正・根拠作成 |

### 目的

Claude Codeを使用して、テンプレートをベースにクライアント用のHPを実装する。

### フロー概要

```
【No.4から継続】Claude Codeがセットアップ済み
    ↓
【自動】Claude Codeが構成案に従って実装
    ↓
【ユーザー】追加指示（必要に応じて）
    ↓
【自動】ビルド確認（Claude Codeが実行）
    ↓
【ユーザー】HANDOFF完了確認
    ↓
【ユーザー】動作確認（ローカル）
    ↓
【ユーザー】ステータス更新
```

<details style="border: 2px solid #9333ea; border-radius: 8px; padding: 0; margin: 16px 0; background: #faf5ff;">
<summary style="background: #9333ea; color: white; padding: 12px 16px; cursor: pointer; font-weight: bold; margin: 0; border-radius: 6px 6px 0 0;">🤖 Claude Code 使い方マニュアル（クリックで展開）</summary>
<div style="padding: 16px;">

<!-- include: hp/99-claude-code.md -->

</div>
</details>

### 前提条件

**No.4 STEP 4で「起動術式」を実行済み。** Claude Codeが以下の状態で動作中：

- ✅ HANDOFFを読んでプロジェクト内容を把握
- ✅ テンプレートをクローン済み
- ✅ `npm install` 完了
- ✅ 構成案に従って実装を進行中

![Claude Codeが自動でセットアップを進める様子](/images/hp/no5/auto-setup-progress.png)

**ディレクトリ構造:**
```
client_hp/{{企業名英語}}/
├── HANDOFF.md
├── doc/wireframe/
│   ├── 00_overview.md
│   ├── 01_top.md
│   └── ...
├── src/                  # ← テンプレートから
├── public/               # ← テンプレートから
├── package.json          # ← テンプレートから
└── ...
```

### 作業手順

#### STEP 1: 実装の進行を見守る・追加指示

Claude Codeが自動で実装を進めます。基本的に見守るだけでOK。

**追加指示（必要に応じて）:**
- 「○○ページのデザインを修正して」
- 「フォントサイズを大きくして」
- 「ヘッダーの色を変えて」

#### STEP 2: ビルド確認（自動）

Claude Codeが実装完了後、自動で `npm run build` を実行します。基本的に見守るだけでOK。

![ビルド実行の例](/images/hp/no5/build-example.png)

- エラーがあれば自動で修正
- 「✓ Compiled successfully」が表示されれば完了

> ⚠️ **Windowsで `npm install` している場合**: ビルドが失敗します。その場合はSTEP 2以降を手動で行ってください：
> ```bash
> # WSL環境で実行
> rm -rf node_modules package-lock.json
> npm install
> npm run build
> npm run dev
> ```
>
> **既にnode_modulesがある場合**、パーミッションエラーが出ることがあります：
>
> ![npm permission error](/images/hp/no5/npm-permission-error.png)
>
> この場合は `rm -rf node_modules package-lock.json` で削除してからやり直してください。

#### STEP 3: HANDOFF完了確認

ある程度実装が進んだら、HANDOFFの全フェーズが完了しているか確認します。

**Claude Codeに聞く:**
```
HANDOFFに記載された全てのフェーズは完了しましたか？
```

![HANDOFFフェーズ完了確認](/images/hp/no5/handoff-phase-check.png)

Claude Codeが以下を報告します：
- **完了済み**: テンプレートセットアップ、ブランドカラー設定、ページ実装、ビルド確認など
- **未完了（外部依存）**: 画像の差し替え（クライアント対応待ち）、メール送信機能の有効化（本番設定）など

![残作業の完了報告](/images/hp/no5/handoff-complete-report.png)

「`npm run dev` で動作確認できる状態です」と表示されたら、STEP 4へ進みます。

#### STEP 4: ローカルで動作確認

ブラウザで実際に確認します。

##### ターミナルの開き方

<details style="border: 1px solid #ddd; border-radius: 8px; padding: 0; margin: 16px 0;">
<summary style="background: #f5f5f5; padding: 12px 16px; cursor: pointer; font-weight: bold;">方法A: エクスプローラーから開く（簡単）</summary>
<div style="padding: 16px;">

1. **client_hp フォルダを開く**

   ![client_hpフォルダ](/images/hp/claude-code/client_hp_folder.png)

2. **企業フォルダを右クリック → 「ターミナルで開く」**

   ![右クリックメニュー](/images/hp/claude-code/right_click_menu.png)

3. **ターミナルが開いたら `npm run dev` を実行**

</div>
</details>

<details style="border: 1px solid #ddd; border-radius: 8px; padding: 0; margin: 16px 0;">
<summary style="background: #f5f5f5; padding: 12px 16px; cursor: pointer; font-weight: bold;">方法B: VS Codeから開く</summary>
<div style="padding: 16px;">

1. **VS Codeを起動**

   ![VS Codeメニューバー](/images/hp/claude-code/vscode_menubar.png)

2. **メニュー → 「ターミナル」→「新しいターミナル」**

   ![ターミナルメニュー](/images/hp/claude-code/vscode_terminal_menu.png)

3. **ターミナルで企業フォルダに移動して `npm run dev` を実行**
   ```bash
   cd /mnt/c/client_hp/{{企業名英語}}
   npm run dev
   ```

</div>
</details>

##### 依存関係のインストール

```bash
npm install
```

![npm install成功](/images/hp/no5/npm-install-success.png)

<details style="border: 1px solid #f59e0b; border-radius: 8px; padding: 0; margin: 16px 0; background: #fffbeb;">
<summary style="background: #f59e0b; color: white; padding: 12px 16px; cursor: pointer; font-weight: bold; margin: 0; border-radius: 6px 6px 0 0;">⚠️ WSLでパーミッションエラーが出る場合</summary>
<div style="padding: 16px;">

WSL環境で既にnode_modulesがある場合、以下のようなエラーが出ることがあります：

![npm permission error](/images/hp/no5/npm-permission-error.png)

**解決策:** 削除してからやり直してください：

```bash
rm -rf node_modules package-lock.json
```

![node_modules削除](/images/hp/no5/rm-node-modules.png)

その後、再度 `npm install` を実行します。

</div>
</details>

##### 開発サーバーの起動

```bash
npm run dev
```

![npm run dev実行](/images/hp/no5/npm-run-dev.png)

ローカルサーバーが起動したら、URLが表示されます。**Ctrl + クリック** でブラウザが開きます。

##### ブラウザで確認

http://localhost:3000 にアクセス（ポートが使用中の場合は3001など）

![HPプレビュー（PC）](/images/hp/no5/hp-preview-pc.jpg)

HPが正しく表示されればOKです。

##### レスポンシブ確認

**Ctrl + Shift + I** または **F12** で開発者ツールを開きます。

![レスポンシブ確認（開発者ツール）](/images/hp/no5/hp-preview-responsive.jpg)

左上のデバイスアイコンをクリックすると、スマホ・タブレット表示を確認できます。

##### 確認項目

**表示確認:**
- [ ] トップページが正しく表示されるか
- [ ] 各ページへのナビゲーションが動作するか
- [ ] 画像が正しく表示されるか
- [ ] テキストが正しく表示されるか

**レスポンシブ確認:**
- [ ] PC表示（1280px以上）
- [ ] タブレット表示（768px〜1279px）
- [ ] スマホ表示（767px以下）
- [ ] ハンバーガーメニューが動作するか

**機能確認:**
- [ ] リンクが正しく動作するか
- [ ] CTAボタンが目立つか
- [ ] フォームが表示されるか
- [ ] アニメーションが動作するか

#### STEP 5: ステータス更新

メニュー「**1.📋 HP制作**」→「**✏️ ステータス更新**」

#### コンテキスト限界時の対応

Claude Codeで長時間作業を続けると、以下のような警告が表示されます：

![コンテキスト限界の警告](/images/hp/no5/context-low-warning.png)

**「Context low (7% remaining)」** と表示されたら、コンテキスト（会話の記憶）が限界に近づいています。

**対処法：** 以下のように指示してください：

```
コンテキストの限界が近づいています。
HANDOFFを更新して、次世代セッションに引き継いでください。
```

Claude Codeは以下を自動で行います：
1. 現在の進捗をHANDOFF.mdに保存
2. 次のセッションへの引き継ぎ事項を記載
3. `/compact` または新しいセッション開始の案内

**新しいセッションの開始方法：**
1. `/clear` で現在のセッションをクリア
2. `HANDOFF.mdを読んで` と指示
3. Claude Codeがプロジェクト状況を把握し、残作業を表示
4. `では残作業から順次行ってください` で続行

![次世代セッション開始の例](/images/hp/no5/next-session-start.png)

> 💡 **ポイント**: 途中で中断しても、HANDOFFがあれば次のセッションで続きから再開できます

<details style="border: 1px solid #ddd; border-radius: 8px; padding: 0; margin: 16px 0;">
<summary style="background: #f5f5f5; padding: 12px 16px; cursor: pointer; font-weight: bold;">📋 手動でセットアップする場合（新規セッションから始める場合）</summary>
<div style="padding: 16px;">

**No.4を飛ばして直接No.5から始める場合、または新しいPCでセットアップする場合:**

1. 企業ディレクトリに移動
   ```bash
   cd /mnt/c/client_hp/{{企業名英語}}
   ```

2. テンプレートをクローン（docフォルダを退避してから）
   ```bash
   # docフォルダを一時退避
   mv doc ../{{企業名英語}}_doc_backup
   mv HANDOFF.md ../{{企業名英語}}_HANDOFF_backup.md

   # ディレクトリを削除
   cd /mnt/c/client_hp
   rm -rf {{企業名英語}}

   # テンプレートをクローン
   gh repo clone tenchan000517/template-standard {{企業名英語}}

   # docフォルダとHANDOFFを戻す
   mv {{企業名英語}}_doc_backup {{企業名英語}}/doc
   mv {{企業名英語}}_HANDOFF_backup.md {{企業名英語}}/HANDOFF.md

   # 依存関係インストール
   cd {{企業名英語}}
   npm install
   ```

3. Claude Codeを起動して実装開始
   ```bash
   claude
   ```
   ```
   HANDOFF.mdを読んで、doc/wireframe/の構成案に従ってHP実装を開始してください
   ```

**テンプレート一覧（No.4で選んだものと同じ）:**
| テンプレート | 用途 |
|-------------|------|
| `template-standard` | 標準テンプレート |
| `template-recruit-magazine` | 採用サイト（マガジン形式） |
| `template-leadgen-minimal` | リード獲得型（ミニマル） |
| `template-leadgen-visual` | 地域密着型（ビジュアル） |
| `template-trust-visual` | 信頼構築型（ビジュアル） |
| `template-authority-minimal` | 権威性訴求（ミニマル） |
| `template-fullorder` | フルオーダー |

</div>
</details>

### 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1.6（App Router） | フレームワーク |
| React | 19.2.3 | UIライブラリ |
| TypeScript | 5.x | 型安全なコード |
| Tailwind CSS | 4.x | スタイリング |
| Framer Motion | 12.x | アニメーション |

### 開発環境の注意点

- **WSL2環境ではTurbopackが動作しない**ため、`--webpack`フラグを使用
- `npm run dev` = `next dev --webpack`

---

## No.6 素材撮影（オプション）

> **個別マニュアル**: [06-素材撮影.md](./06-素材撮影.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 川崎 |
| 使用ツール | カメラ, 照明機材, Google Drive |
| 成果物 | 写真・動画素材 |
| 次工程 | No.7 修正・根拠作成 |

### 実施パターン

| パターン | 説明 |
|----------|------|
| A. 撮影あり（動画） | HPの中に動画を配置 |
| B. 撮影あり（写真） | 高解像度素材写真を配置 |
| C. 先方用意 | 先方に素材を用意してもらう（このマニュアルは不要） |

### フロー概要

```
【事前準備】素材フォルダ作成（GAS）
    ↓ メニュー「3.📁 素材フォルダ」
フォルダがGoogle Driveに作成される
    ↓
【現地撮影】写真・動画素材を撮影
    ↓
【データ納品】素材フォルダにアップロード
    ↓
【ステータス更新】
    ↓
No.7 修正・根拠作成へ
```

### GASメニュー: 素材フォルダ作成

1. ヒアリングシートを開く
2. メニュー「**3.📁 素材フォルダ**」→「**🆕 素材フォルダ作成**」をクリック
3. 対象企業を選択
4. 必要なページをチェック（TOP, About, Service, Recruit, Contact など）
5. 「フォルダ作成」ボタンをクリック

### 撮影の大前提

**静止画（写真）撮影:**
- 高解像度で撮影する（最低でも1920×1080以上）
- RAW撮影が可能な場合はRAWで撮影

**動画撮影:**
- 縦動画（9:16）または横動画（16:9）※用途に応じて選択
- HD・60FPSで撮影する

**共通:**
- 寄りすぎない（編集で「寄る」ことはできるが「引く」ことはできない）
- 被写体の周囲に余白を残す

### 必須素材

- 外観写真（全景・入口・看板）
- 内観写真（複数アングル）
- スタッフ写真（個人・集合）
- 業務風景（作業中の様子）
- 設備・機材（必要に応じて）
- 商品・サービス（該当する場合）

### 撮影後チェック

- [ ] 必須素材がすべて揃っているか
- [ ] 寄りすぎていないか
- [ ] カメラをゆっくり動かせているか（動画の場合）
- [ ] 不要な人・物が映っていないか
- [ ] ピントが合っているか
- [ ] 露出は適切か

### データ納品ルール

**ファイル命名規則:**
`[企業名]_[撮影日]_[種別]_[連番].jpg / .mp4`

例:
- 中京商運_20251226_外観_01.jpg
- 中京商運_20251226_動画_01.mp4

---

## No.7 修正・根拠作成

> **個別マニュアル**: [07-修正・根拠作成.md](./07-修正・根拠作成.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | Claude Code, AI（Claude/ChatGPT） |
| 成果物 | MVP版HP, トークスクリプト（デザイン根拠） |
| 次工程 | No.8 MVP確認・修正 |

### 目的

HPの修正・リデザインを行い、先方にMVPを渡す際の「デザインの根拠」を説明するトークスクリプトを作成する。

### フロー概要

```
【STEP 1】素材の配置
    ↓ 撮影素材がある場合は配置
Claude Codeで画像を差し替え
    ↓
【STEP 2】リデザイン
    ↓ 必要に応じてデザイン調整
Claude Codeで修正
    ↓
【STEP 3】根拠作成
    ↓ AIでトークスクリプト生成
デザインの意図を説明できる状態に
    ↓
【STEP 4】最終確認
    ↓
MVP完成
    ↓
ステータス更新
```

### 作業手順

#### STEP 1: 素材の配置（撮影素材がある場合）

1. 素材フォルダから画像をダウンロード
2. プロジェクトに画像を配置
   ```bash
   cp ~/Downloads/*.jpg /mnt/c/[企業名]-hp/public/images/
   ```
3. Claude Codeで画像パスを更新

#### STEP 2: リデザイン

**よくある調整項目:**

| 調整項目 | Claude Codeへの指示例 |
|---------|---------------------|
| 色味調整 | 「メインカラーを○○に変更して」 |
| フォントサイズ | 「見出しを大きくして」 |
| 余白調整 | 「セクション間の余白を広げて」 |
| レイアウト変更 | 「○○を2カラムから3カラムに変更して」 |
| アニメーション追加 | 「スクロールで要素がフェードインするように」 |

#### STEP 3: 根拠作成（トークスクリプト）

AIを使って、デザインの意図を説明するトークスクリプトを作成します。

**トークスクリプトの構成:**
1. **デザインコンセプト** - 全体の方向性、選んだ理由
2. **各セクションの意図** - ファーストビュー、サービス紹介、会社概要、CTA
3. **ターゲットへの訴求** - どんな印象を与えるか、行動を促すポイント
4. **今後の展開案** - 追加提案（オプション）

#### STEP 4: 最終確認

**確認項目:**
- [ ] 全ページが正しく表示されるか
- [ ] 画像がすべて配置されているか
- [ ] リンクが正しく動作するか
- [ ] ビルドエラーがないか
- [ ] トークスクリプトが完成しているか

---

## No.8 MVP確認・修正

> **個別マニュアル**: [08-MVP確認・修正.md](./08-MVP確認・修正.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | メール, Google Meet, Claude Code |
| 成果物 | 承認済みHP |
| 次工程 | No.9 納品 |

### 目的

先方にMVPを送付し、フィードバックをもらい、修正対応を行い、最終承認を取得する。

### フロー概要

```
【STEP 1】MVP送付
    ↓ URLとトークスクリプトを共有
先方確認
    ↓
【STEP 2】FB収集
    ↓ 打ち合わせ or メールで修正点を確認
修正リスト作成
    ↓
【STEP 3】修正対応
    ↓ Claude Codeで修正
修正版URL共有
    ↓
【STEP 4】再確認・承認
    ↓ 先方確認 → 承認
承認取得
    ↓
ステータス更新
```

### 作業手順

#### STEP 1: MVP送付

1. Vercelにデプロイ
   ```bash
   vercel
   ```

2. メールでMVP送付

**メール例:**
```
件名: 【HP制作】MVP確認のお願い（株式会社○○様）

○○様

お世話になっております。
Singの河合です。

HPのMVP（最小機能版）が完成いたしましたので、
ご確認をお願いいたします。

■ 確認用URL
https://[プロジェクト名].vercel.app/

■ ご確認いただきたい点
・デザインの方向性
・掲載内容の正確性
・修正したい箇所

■ 確認期限
○月○日（○）まで

ご不明点やご質問がございましたら、
お気軽にお知らせください。

よろしくお願いいたします。
```

#### STEP 2: FB収集

FBの整理:
- 修正箇所をリスト化
- 優先度をつける（必須 / あれば良い）

**FBリストの例:**
| No | 修正箇所 | 内容 | 優先度 |
|----|---------|------|--------|
| 1 | トップ | キャッチコピーを変更 | 必須 |
| 2 | About | 代表写真を差し替え | 必須 |
| 3 | Service | 順番を入れ替え | あれば |

#### STEP 3: 修正対応

1. Claude Codeで修正
2. 修正後の確認
3. 修正版をデプロイ
   ```bash
   vercel --prod
   ```
4. 修正完了の連絡

#### STEP 4: 再確認・承認

1. 承認の確認（メールで承認の返信 or 打ち合わせで口頭承認）
2. 承認内容の記録（承認日、承認者、承認内容）

**複数回の修正が必要な場合:**
- STEP 2〜4を繰り返す
- 修正回数が多い場合は追加費用の相談

---

## No.9 納品

> **個別マニュアル**: [09-納品.md](./09-納品.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | メール, Vercel, DNS設定画面 |
| 成果物 | 公開されたHP |
| 次工程 | No.10 月次FB |

### 目的

承認済みのHPを本番環境に公開し、先方に正式に納品する。運用方法についても説明する。

### デプロイパターン

| パターン | 条件 | 対応内容 |
|---------|------|---------|
| A. サーバー移管 | Singで完全管理 | ドメイン移管＋Vercelデプロイ |
| B. CNAMEのみ変更 | 既存サーバー維持 | DNS設定のみ変更 |
| C. 先方アップロード | 納品物を渡す | ビルド済みファイル納品 |

### 作業手順

#### STEP 1: 最終確認

**チェックリスト:**
- [ ] 全ページが正しく表示される
- [ ] 画像がすべて表示される
- [ ] リンクが正しく動作する
- [ ] お問い合わせフォームが動作する
- [ ] メタタグ（title, description）が設定されている
- [ ] OGP画像が設定されている
- [ ] favicon.icoが設定されている
- [ ] ビルドエラーがない

#### STEP 2: 本番デプロイ

**パターンA: Vercelに本番デプロイ**

1. カスタムドメインを設定
2. DNS設定を変更
3. SSL証明書を確認

**パターンB: CNAMEのみ変更**

1. 現在のDNS設定を記録
2. CNAMEを設定
3. 浸透を待つ（数時間〜最大48時間）

**パターンC: ビルド済みファイル納品**

1. 静的ファイルを生成
   ```bash
   npm run build
   ```
2. outフォルダをzipファイルにして共有

#### STEP 3: 納品連絡

**メール例:**
```
件名: 【HP制作】納品完了のご連絡（株式会社○○様）

○○様

お世話になっております。
Singの河合です。

ホームページの制作が完了し、本番公開が完了いたしました。

■ 公開URL
https://www.example.com/

■ 納品物一覧
・ホームページ（上記URL）
・ソースコード（GitHubリポジトリ or zipファイル）
・管理画面ログイン情報（別途お送りします）

■ 今後の運用について
・更新方法は別途ご説明いたします
・月次フィードバックを○月から開始予定です

ご確認いただき、問題がなければ納品完了とさせていただきます。

よろしくお願いいたします。
```

#### STEP 4: 運用説明

1. 更新方法の説明
2. 月次FBの説明
3. 問い合わせ先の共有

#### STEP 5: 公開URL記録

ヒアリングシートの**H3セル（公開URL欄）**に公開URLを入力

#### STEP 6: ステータス更新

メニュー「**1.📋 HP制作**」→「**✏️ ステータス更新**」

---

## No.10 月次FB

> **個別マニュアル**: [10-月次FB.md](./10-月次FB.md)

### 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 使用ツール | Google Meet, スプレッドシート |
| 成果物 | FB報告, 次回アクション |
| 前工程 | No.9 納品 |
| 後工程 | （継続運用） |

### 目的

納品後のHPの運用状況を確認し、クライアントと定期的にフィードバックを実施。改善提案や追加施策の提案を行う。

### FB承認フロー

1. **実施日決定** - 担当者と話して実施日の決定（基本はフィードバック実施日に次回の日程は決定する）
2. **資料作成・承認** - 実施3稼働日前までにフィードバック資料の作成（担当者作成→上司提出→承認を得る）
3. **前日確認** - 承認を得たら、実施1稼働日前に企業担当者へ前日確認
4. **フィードバック実施** - 資料をベースに話をする
5. **課題解決** - フィードバック時に出た課題に対しての解決は当日内に完了させること
6. **報告入力** - フィードバック報告内容は管理部がスプレッドシートに入力する

### FB実施フロー（30分想定）

**フロー設計の前提:**
1. 数値は「評価」ではなく判断材料
2. 閲覧数は早く出さない
3. 本音 → 主観 → 事実 → 整理、の順を崩さない

**タイムライン:**

| 時間 | 内容 | 目的 |
|------|------|------|
| 0:00-0:03 | アイスブレイク | 安心して話せる場をつくる |
| 0:03-0:08 | 本音ウォームアップ | 表層の感想 → 違和感の入口へ |
| 0:08-0:18 | 本音・価値観深掘り | 不安・迷い・違和感を出し切ってもらう（顧客7:Sing3） |
| 0:18-0:20 | 主観の最終確認 | 数字の話をする前の手応え確認 |
| 0:20-0:23 | 閲覧数開示 | 事実のみ、良い・悪いの評価は言わない |
| 0:23-0:27 | 数値の受け取り確認 | 「この数字を見て、どう感じますか？」 |
| 0:27-0:30 | お礼・クロージング | ネクスト日程の確定 |

### FB終了時チェック（自己評価）

- [ ] 説明した感覚より、話してもらえた感覚が強いか
- [ ] 数値が「武器」ではなく、材料として扱われたか
- [ ] ネクスト日程は確定したか

---

## Claude Code使い方

> **個別マニュアル**: [99-claude-code.md](./99-claude-code.md)

HP制作で構成案プロンプトを実行する際に使用するClaude Codeの使い方を説明します。

### Claude Codeとは

Claude CodeはAnthropicが提供するAIコーディングアシスタントです。ターミナル（黒い画面）で動作し、ファイルの作成・編集を自動で行います。

### 1. Claude Codeの立ち上げ方

#### 方法A: エクスプローラーから開く（簡単）

1. client_hp フォルダを開く
2. 企業フォルダを右クリック → 「ターミナルで開く」
3. ターミナルで `claude` と入力してEnter

#### 方法B: VS Codeから開く

1. VS Codeを起動
2. メニュー → 「ターミナル」→「新しいターミナル」
3. ターミナルで企業フォルダに移動して `claude` を実行
   ```bash
   cd client_hp
   cd chubu-kensetsu-hp
   claude
   ```

#### 方法C: WSL環境の場合

1. VS Codeで Ctrl+Shift+P を押す
2. 「WSL」と入力 →「WSL: 新しいウィンドウで WSL に接続する」を選択
3. 以降は方法Bと同じ

#### 方法D: Git Bashから開く

1. client_hp フォルダを右クリック →「Git Bash Here」を選択
2. Git Bashで `claude` と入力してEnter

#### 初回起動時の確認ダイアログ

初めてのフォルダでClaude Codeを起動すると、信頼確認が表示されます。
**「1. Yes, proceed」を選択してEnter** で続行できます。

### 2. Claude Codeでの実行の仕方

#### STEP 1: プロンプトを貼り付ける

1. ヒアリングシートの「4. 構成案作成」メニューで生成したプロンプトをコピー
2. Claude Codeの画面に貼り付け（Ctrl+V または 右クリック→貼り付け）
3. Enterキーを押す

#### STEP 2: 実行を見守る

Claude Codeが自動的に以下を実行します：
1. 作業環境の確認
2. HANDOFF.md の作成
3. wireframe/ フォルダ内に各ページのファイルを作成

#### STEP 3: 完了確認

「HANDOFF.mdに記載のテンプレートセットアップ手順に従い、実装を開始できます」と表示されれば完了です。

```
chubu-kensetsu/
├── HANDOFF.md
└── doc/
    └── wireframe/
        ├── 00_overview.md
        ├── 01_top.md
        ├── 02_about.md
        └── ...
```

### 3. Claude Codeのモードについて

画面下部にモード表示があります。`Shift+Tab` で切り替えられます。

| モード | 説明 |
|--------|------|
| accept edits on | Claude Codeがファイルを編集できる状態（通常はこのモード） |
| plan mode on | 計画を立てるだけで、実際の編集は行わない状態 |

### 4. トラブルシューティング

#### Q: 「claude」コマンドが見つからない

**解決策:**
```bash
npm install -g @anthropic-ai/claude-code
```

#### Q: Permission denied エラーが出る

**解決策:**
正しいフォルダ（client_hp/企業名/）に移動してから実行

#### Q: 構成案を投げたのにファイルが保存されない

**症状:** 「ファイルとして保存しますか？」と聞かれる

**解決策:** 以下をコピペして返答
```
はい。以下のフォルダ・ファイル構成で作成してください：

★企業名（英語）★/
├── HANDOFF.md
└── doc/
    └── wireframe/
        ├── 00_overview.md
        ├── ★構成案に含まれる各ページのmdファイル★
        ├── XX_common_parts.md
        └── XX_photo_guide.md
```

#### Q: ディレクトリを先に作ってしまった

**解決策:** ドキュメントを退避 → テンプレートクローン → ドキュメントを戻す

```bash
# 1. ドキュメントを一時退避
mv /mnt/c/client_hp/{{企業名英語}} /mnt/c/client_hp/{{企業名英語}}_backup

# 2. テンプレートからクローン
cd /mnt/c/client_hp
gh repo create {{企業名英語}} --template tenchan000517/sing-hp-template --clone --private

# 3. ドキュメントを戻す
cp -r /mnt/c/client_hp/{{企業名英語}}_backup/* /mnt/c/client_hp/{{企業名英語}}/

# 4. バックアップ削除
rm -rf /mnt/c/client_hp/{{企業名英語}}_backup
```

### 5. ターミナルの基本操作

| 操作 | コマンド |
|------|---------|
| フォルダ移動 | `cd フォルダ名` |
| 上の階層に戻る | `cd ..` |
| 現在地確認 | `pwd` |
| フォルダ内一覧 | `ls` |
| Claude Code終了 | `Ctrl + C` または `/exit` |

---

## GASメニュー構成

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

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-02 | 全体マニュアル作成（全11タスク + Claude Code使い方を統合） |
