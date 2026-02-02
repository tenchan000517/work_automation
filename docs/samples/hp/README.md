# HP制作サンプルデータ作成ガイド

## 概要

HP制作フローのテスト・検証用サンプルデータの作成ガイド。
新しいサンプル企業を追加する際はこのガイドに従う。

---

## ファイル構成

```
docs/samples/hp/
├── README.md                              # このガイド
├── sample_form_response_mikawa.csv        # 三河精密工業（製造業）
├── meeting-transcript-mikawa-seimitsu.txt # 三河精密工業 文字起こし
├── sample_form_response_kyoritsu.csv      # 共立工業（道路・橋梁維持管理）★採用特化
└── meeting-transcript-kyoritsu.txt        # 共立工業 文字起こし
```

**参照元（中部建設）:**
```
docs/gas/hp/sample_form_response.csv       # 中部建設（建設業）
docs/samples/meeting-transcript-sample.txt # 中部建設相当（物流業）
```

---

## 作成手順

### 1. 企業設定を決める

以下を決定する：
- 業種（既存サンプルと異なる業種を選ぶ）
- 会社名、所在地、従業員数、創業年
- HPの目的（問い合わせ増加、採用強化など）
- サーバー管理の希望（A〜D）

**既存サンプルとの差別化ポイントを明確にする**

### 2. 文字起こしを作成

**形式:**
```
【文字起こしサンプル】〇〇株式会社 HP制作初回ヒアリング
日時：2026年○月○日（○）14:00〜15:30
参加者：
  - 〇〇株式会社：社長、担当者など
  - 当社：青柳（CC）、河合（制作）

================================================================================

【00:00:20】

青柳：本日はお時間いただきまして...
```

**必須要素（Part②39項目に対応）:**
1. ゴール・コンバージョン（目的、ハードル設定）
2. ターゲットの深掘り（年齢層、課題、検索キーワード等）
3. 強みの深掘り（選ばれる理由、こだわり、資格・技術等）
4. 表現の方向性（キャッチコピー、デザイン、撮影イメージ）
5. SEO・キーワード設計
6. 新規作成の確認（代表メッセージ、社員インタビュー等）

### 3. CSVを作成

**形式:**
- 中部建設のCSV（`docs/gas/hp/sample_form_response.csv`）と同じ80列
- 1行目: ヘッダー（そのままコピー）
- 2行目: データ

**列数確認コマンド:**
```bash
python3 -c "
import csv
with open('ファイルパス', 'r') as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        print(f'Row {i}: {len(row)} columns')
"
```

**注意点:**
- カンマを含む値はダブルクォートで囲む
- 複数選択の値は `"値1, 値2, 値3"` の形式
- 空欄は単にカンマで区切る（値なし）
- **文字起こしの内容と整合性を取る**

### 4. 整合性チェック

CSVと文字起こしで以下が一致しているか確認：
- [ ] HPの目的
- [ ] ターゲット
- [ ] 強み・アピールポイント
- [ ] 必要なページ
- [ ] 採用情報（採用目的がある場合）
- [ ] サーバー管理の希望
- [ ] インタビュー対象者

---

## 差別化チェックリスト

新しいサンプルは既存と以下の点で差別化する：

| 項目 | 選択肢例 |
|------|----------|
| 業種 | 建設、製造、物流、IT、サービス、小売、飲食など |
| HP目的 | 問い合わせ増加のみ / 採用強化のみ / 両方 |
| サーバー | A.Sing移管 / B.メール残す / C.自社管理 / D.検討中 |
| 素材 | あり / ほぼない |
| SNS | あり / なし |
| 外部委託 | なし / あり（連絡可） / あり（連絡不可） |
| 会社規模 | 小規模〜30名 / 中規模30〜100名 / 大規模100名〜 |

---

## 既存サンプル一覧

| 企業名 | 業種 | HP目的 | サーバー | 特徴 | 対象テンプレート |
|--------|------|--------|----------|------|-----------------|
| 中部建設 | 建設業 | 問い合わせ+採用 | A.Sing移管 | SNSあり、素材あり | Standard |
| 三河精密工業 | 製造業 | 問い合わせ+採用 | C.自社管理 | 外部委託（連絡不可）、素材なし | LeadGen Visual |
| 共立工業 | 道路・橋梁維持管理 | **採用特化** | B.メール残す | 公共事業、インタビュー重視 | Recruit Magazine |

---

## テストで躓いたら

サンプルを使ってテストした際に問題が発生したら：

1. **問題を解決する**（GAS修正、プロンプト改善など）
2. **マニュアルのトラブルシューティングに追記**
   - 対象: `docs/manuals/hp/99-Claude Code使い方.md`
   - 形式: 「Q: 〇〇」「症状:」「解決策:」

これにより、同じ問題で躓く人を減らせる。

---

## 素材画像の一括生成

撮影ガイド（`XX_photo_guide.md`）が生成されたら、そこに記載された必要素材をスクリプトで一括生成できる。

### 使用ツール

`/mnt/c/Nanobanana/generate_image.py` - Gemini API画像生成スクリプト

### 手順

1. **撮影ガイドを確認**
   Claude Codeが生成した `doc/wireframe/XX_photo_guide.md` を開き、必要な素材一覧を確認

2. **プロンプトを作成**
   撮影ガイドの指示内容をGemini用プロンプトに変換

3. **一括生成スクリプトを実行**
   ```bash
   cd /mnt/c/Nanobanana

   # 単一画像生成
   python generate_image.py "プロンプト" output.png

   # アスペクト比指定
   python generate_image.py "プロンプト" output.png 16:9

   # 参照画像あり（キャラクター一貫性）
   python generate_image.py "プロンプト" --ref anchor.png --out output.png
   ```

4. **生成した画像を素材フォルダに配置**
   ```
   client_hp/{{companyNameEn}}/public/images/
   ```

### 生成例

撮影ガイドの指示例 → Geminiプロンプト変換例：

| 撮影ガイドの指示 | Geminiプロンプト例 |
|-----------------|-------------------|
| 「工場内観（明るく清潔な印象）」 | "Clean modern factory interior, bright lighting, organized workspace, Japanese manufacturing facility, high quality photo" |
| 「作業中の社員（真剣な表情）」 | "Japanese factory worker operating CNC machine, focused expression, wearing clean work uniform, professional photo" |
| 「精密部品クローズアップ」 | "Close-up of precision machined metal parts, shiny surface, high detail, industrial product photography" |

### 注意点

- 生成画像はあくまでプレースホルダー（実際の撮影までの仮置き）
- 最終的には実写真に差し替える
- 人物画像は社内確認が必要な場合あり

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-31 | 「テストで躓いたら」セクション追加 |
| 2026-01-31 | 初版作成。三河精密工業サンプル追加。 |
