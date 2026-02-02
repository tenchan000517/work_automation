# 業務効率化・マニュアル作成プロジェクト HANDOFF

## 🎯 次世代セッションタスク（2026-02-02 更新）

### 次にやること

**マニュアル検証（共立工業サンプルで実証）** - 下記「📖 統一マニュアル作成」セクション参照

---

## ✅ 解決済み: Claude Code指示文ダイアログ（2026-02-02）

### 問題

**メニュー「4.📝 構成案作成」→「🤖 Claude Code指示文生成」ダイアログで、企業選択・テンプレート選択ができなかった**

### 原因

**プロンプトシートに登録されていた「Claude Code指示文」テンプレートに、バッククォート等の特殊文字が含まれていた。**

`hp_getClaudeCodePromptTemplate()` がプロンプトシートからテンプレートを取得 → HTMLに埋め込み時にエスケープが不完全 → JavaScriptのパースエラー → スクリプト全体が実行されない → `toggleTemplateDropdown` 等の関数が未定義

### 解決策

1. プロンプトシートからのテンプレート取得を無効化（常にデフォルトを使用）
2. テンプレート選択UIをグリッドからドロップダウンに変更
3. `HP_TEMPLATE_TYPES` を `JSON.stringify` でクライアントに渡すように修正

### 修正ファイル

- `docs/gas/hp/compositionPrompt.js`

---

## ✅ 完了: ガイドラインV4作成（2026-02-02）

**成果物:** `docs/manual-creation-guideline-v4.md`

**V4の構成（11章）:**
1. 設計思想（V3ベース）
2. 共通概念（V3ベース）
3. ルール（V3ベース）
4. 作り方（V3ベース）
5. **GAS共通概念**（新規）- メニュー構成パターン、命名規則、商材固有vs共通の判断基準
6. **マニュアル作成フロー**（新規）- パターンA（個別→統合）/パターンB（完全→切り取り）
7. **全体マニュアル設計**（新規）- include機能、アコーディオン色パターン
8. **共通マニュアル管理**（新規）- 配置先、一覧テーブル
9. **マニュアル検証フロー**（新規）- スクショ管理、気づいたことメモ、段階的完成
10. リファレンス（V3の5章を拡張）- HP制作構成追加、GASメニュー構成パターン追加
11. チェックリスト（V3の6章を拡張）- 全体マニュアル・共通マニュアル・検証時のチェック項目追加

---

## 📖 統一マニュアル（全体マニュアル）作成

HP制作の全体マニュアルを作成し、スクショ付きで完成させる。

### 全体マニュアル作成フロー

```
①既存マニュアルをコピーして統合 → ②スクショ撮りながら実証 → ③検証したものから完成 → ④全体マニュアル完成 → ⑤業務カードごとに分割（既存の状態に戻す）
```

**重要:** 既存マニュアル（00〜10, 99）は削除しない。全体マニュアルはこれらの「統合版」であり、各マニュアルは「切り抜き」として残る。

### 実装済み（このセッション）

- [x] Product型に`hasOverallManual`追加（`src/lib/data/index.ts`）
- [x] hp.tsに`hasOverallManual: true`追加
- [x] Sidebar.tsxに「全体マニュアルを見る」ボタン追加（緑色）
- [x] 全体マニュアルページ作成（`/products/[id]/overall-manual/page.tsx`）
- [x] 全体フロー作成（`docs/flows/hp/overall-flow.md`）
- [x] Recruit Magazine用サンプル作成（共立工業）
- [x] **全体マニュアル作成完了**（`docs/manuals/hp/00-overall-manual.md`）
  - 全11タスク + Claude Code使い方を統合
  - 既存マニュアル（00〜10, 99）は削除せず残す
- [x] `getManual`関数追加（`src/lib/manuals.ts`）- ファイル名指定でマニュアル読み込み
- [x] **マニュアルinclude機能追加**（`src/lib/manuals.ts`）
  - `<!-- include: common/xxx.md -->` 構文で別ファイルを埋め込み可能に
  - 共通マニュアル配置先: `docs/manuals/common/`
- [x] **共通マニュアル作成**
  - `common/pre-meeting-steps-4-8.md` - 打ち合わせ前準備ステップ4〜8
  - HP・ツナゲル両方で使用
- [x] **NOTTAマニュアルをアコーディオン化**
  - `common/notta.md` を `<details>` タグでカード風アコーディオンに
  - HP全体マニュアル No.2 に挿入
- [x] **No.1 打ち合わせ前準備にスクショ挿入**（11枚）
  - 配置先: `public/images/hp/no1/`
  - 全体マニュアル（00-overall-manual.md）に画像タグ挿入済み
- [x] **共通マニュアル作成 + アコーディオン埋め込み**
  - `docs/manuals/common/gas-auth.md` - GAS認証手順（スクショ5枚）
  - `docs/manuals/common/transcript.md` - 文字起こし整理手順（スクショ4枚）
  - `docs/manuals/common/transfer.md` - AI出力転記手順（スクショ4枚）
  - HP全体マニュアルにアコーディオン埋め込み
    - No.1 シート作成 → GAS認証アコーディオン
    - No.3 文字起こし・転記 → transcript.md、transfer.mdアコーディオン
  - ツナゲル・HP制作で共通利用可能

### 次にやること（優先順）

1. **共通マニュアル作成の続き（転用候補）**

   以下の手順を共通マニュアル化して、HP全体マニュアルにアコーディオンで埋め込む。

   | 転用候補 | 共通マニュアル | 埋め込み先 | 状態 |
   |---------|--------------|-----------|------|
   | GAS認証 | `common/gas-auth.md` | No.1 シート作成 | ✅ 完了 |
   | NOTTA起動〜終了 | `common/notta.md` | No.2 初回打ち合わせ | ✅ 完了 |
   | 文字起こし整理 | `common/transcript.md` | No.3 文字起こし・転記 | ✅ 完了 |
   | AI出力転記 | `common/transfer.md` | No.3 文字起こし・転記 | ✅ 完了 |
   | ステータス更新 | `common/status-update.md` | No.0（全タスク共通） | ✅ 完了 |
   | 議事録作成 | `common/gijiroku.md` | No.3 | ✅ 完了 |
   | JSON出力 | `common/json-output.md` | No.4 | ✅ 完了 |
   | ~~構成案プロンプト~~ | - | - | HP固有（共通化しない） |
   | ~~Claude Code指示文~~ | - | - | HP固有（共通化しない） |

   **作業フロー:**
   ```
   1. ツナゲルで使っている画像を確認（/images/）
   2. 共通マニュアル（Markdown）を作成（docs/manuals/common/xxx.md）
      - スクショ付きのステップ形式
      - notta.md を参考に
   3. HP全体マニュアルの該当箇所に<details>アコーディオンで埋め込み
      <details style="border: 2px solid #色; ...">
      <summary>タイトル（クリックで展開）</summary>
      <!-- include: common/xxx.md -->
      </details>
   4. ツナゲルのマニュアルでも同じincludeで共通利用
   ```

   **⚠️ 重要: tsunageru.tsの読み方**

   `src/lib/data/tsunageru.ts` は約26000トークンあり、1回で全文読めない。
   **必ず分割して全文読むこと:**
   ```
   Read tsunageru.ts offset=0 limit=500
   Read tsunageru.ts offset=500 limit=500
   Read tsunageru.ts offset=1000 limit=500
   ...（必要な箇所まで繰り返す）
   ```
   または、Grepで必要な箇所を検索してから該当部分を読む。

2. **マニュアル検証（共立工業サンプルで実証）**
   - 制作担当者が全体マニュアル（No.0〜No.10）を見ながら実際に作業を進める
   - マニュアルの記載が正しいか・わかりやすいかを検証
   - スクショを撮りながら進める
   - **Claude Codeの役割:** マニュアルの該当箇所を提示、問題があれば修正

3. **マニュアル完成**
   - 検証したものから順次完成させる

### テンプレート別サンプル進捗

### 進捗状況

| # | テンプレート | サンプル | マニュアル検証 | スクショ | 完成 |
|---|-------------|----------|---------------|----------|------|
| 1 | Standard | ✅ 中部建設 | ⬜ | ⬜ | ⬜ |
| 2 | Recruit Magazine | ✅ 共立工業 | ⬜ | ⬜ | ⬜ |
| 3 | LeadGen Minimal | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | LeadGen Visual | ✅ 三河精密 | ⬜ | ⬜ | ⬜ |
| 5 | Trust Visual | ⬜ | ⬜ | ⬜ | ⬜ |
| 6 | Authority Minimal | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 | Full Order | ⬜ | ⬜ | ⬜ | ⬜ |

※ 1回の検証で複数テンプレートをカバーできる可能性あり

### 🔄 検証フロー（毎ステップ実施）

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

**重要:** スクショはいきなり配置せず、必ず内容確認→HANDOFF記録→後で一括配置

### 📋 マニュアル検証進捗（共立工業）

**現在のタスク:** No.4 JSON出力・原稿生成 > 構成案プロンプト生成

| タスク | ステップ | 状態 | 備考 |
|--------|---------|------|------|
| No.1 打ち合わせ前準備 | 全ステップ | ✅ 完了 | スクショ11枚取得 |
| No.4 JSON出力・原稿生成 | 全ステップ | ✅ 完了 | スクショ4枚取得 |
| No.3 文字起こし・転記 | | ⬜ | テンプレート決定後に実施 |
| No.6 素材撮影 | | ⬜ | 素材フォルダ作成のみ |

### 📸 スクショ管理

| # | ファイル名 | 配置後ファイル名 | マニュアル挿入位置 | 状態 |
|---|-----------|-----------------|------------------|------|
| 1 | 04abf4ee...png | step1-form-response.png | No.1 ステップ1 回答確認 | ✅ 配置済み |
| 2 | f17dce5b...png | step2-menu.png | No.1 ステップ2 メニュー | ✅ 配置済み |
| 3 | 43e54d7f...png | step2-dialog-new.png | No.1 ステップ2 ダイアログ | ✅ 配置済み |
| 4 | b1c683b1...png | step2-dialog-select.png | No.1 ステップ2 企業選択 | ✅ 配置済み |
| 5 | c969ebbd...png | step2-dialog-complete.png | No.1 ステップ2 完了時 | ✅ 配置済み |
| 6 | 496505c4...png | step2-dialog-manual.png | No.1 ステップ2 パターンB | ✅ 配置済み |
| 7 | cc8fa47a...png | step2-sheet-upper.png | No.1 ステップ2 転記確認 | ✅ 配置済み |
| 8 | 86bb7f82...png | step2-sheet-lower.png | （未使用） | 📥 取得済み |
| 9 | 7443a46b...png | step3-folder-select.png | No.1 ステップ3 企業選択 | ✅ 配置済み |
| 10 | 2c2ecab6...png | step3-folder-options.png | No.1 ステップ3 ページ選択 | ✅ 配置済み |
| 11 | ecb3b3de...png | step3-folder-complete.png | No.1 ステップ3 作成完了 | ✅ 配置済み |
| 12 | a85d2b5b...png | step3-folder-result.png | No.1 ステップ3 作成結果 | ✅ 配置済み |
| 13 | 32da7548...png | status-menu.png | ステータス更新メニュー | ✅ 配置済み |
| 14 | da945b8a...png | status-dialog.png | ステータス更新ダイアログ | ✅ 配置済み |
| 15 | f2d711f5...png | step2-menu.png | No.4 STEP2 構成案作成メニュー | ✅ 配置済み |
| 16 | e4f4f77a...png | step2-composition-prompt.png | No.4 STEP2 構成案プロンプト生成ダイアログ | ✅ 配置済み |
| 17 | 07687ee8...png | step2-composition-ai.png | No.4 STEP2 外部AIでの構成案作成 | ✅ 配置済み |
| 18 | e3a55890...png | step2-claude-code-dialog.png | No.4 STEP3 Claude Code指示文生成ダイアログ | ✅ 配置済み |

**配置先:** `public/images/hp/no1/`、`public/images/hp/`（ステータス更新）、`public/images/hp/no4/`（構成案作成）
**マニュアル:** `docs/manuals/hp/00-overall-manual.md` No.1セクション

### 📝 気づいたことメモ（後で一括修正）

| # | 箇所 | 内容 | 種別 |
|---|------|------|------|
| 1 | GAS: 手動作成ダイアログ | 「正式名称で入力してください」的な赤文字テキストがほしい（例はあるが注意書きがない） | GAS改善 |
| 2 | GAS: シート作成実行ボタン | クリック後にローディング表示がない。実行中か反応しているかわからない | GAS改善 |
| 3 | GAS: 企業フォルダ作成 | 作成後にブラウザのダイアログが出て「開く」をクリックしても開かない。→ ダイアログ内に完了メッセージ + URL表示 + 開くボタンを表示すべき | GAS改善 |
| 4 | GAS: 企業フォルダ作成 | サブフォルダのページ選択が8種類固定。カスタムページを追加できる入力欄がほしい | GAS改善 |
| 5 | GAS: メニュー番号 | メニュー番号と実際の作業順序が不一致。現状: 1→4→3→2。改善案: 1.HP制作→2.構成案作成(旧4)→3.素材フォルダ→4.ヒアリング反映(旧2) | GAS改善 |
| 6 | マニュアル: アコーディオン | No.3 Step2〜5の概要をアコーディオンの外に追加済み | ✅ 修正済み |
| 7 | GAS: 企業名取得（全ファイル） | 企業名取得が6行目だった → 5行目に修正済み。対象: transcriptToHearingSheet.js（272行目、631行目、1046行目）、jsonOutputDialog.js（199行目）、promptDialog.js（364行目） | ✅ 修正済み |

### STEP 1: サンプル作成

**参照:** `docs/samples/hp/README.md`（サンプル作成ガイド）

**既存サンプル:**
- ✅ 中部建設（建設業）→ Standard用
- ✅ 三河精密工業（製造業）→ LeadGen Visual用

**必要なサンプル:**
- [x] 採用特化企業 → Recruit Magazine用 ✅ 共立工業（道路・橋梁維持管理）
- [ ] サービス業（リフォーム等）→ LeadGen Minimal用
- [ ] 士業・専門家 → Trust Visual用
- [ ] コンサル・BtoB → Authority Minimal用
- [ ] 特殊業種 → Full Order用

**差別化ポイント（業種・サーバー・素材等を変える）**

### STEP 2: GASテスト（全体フロー通し）

各テンプレートで以下を検証：

1. **ヒアリングシート作成**
   - [ ] フォーム回答からシート作成
   - [ ] Part①②③の転記確認

2. **ヒアリング反映**
   - [ ] 文字起こし→AI整理→Part②転記
   - [ ] 議事録作成

3. **素材フォルダ作成**
   - [ ] ページ選択→フォルダ作成
   - [ ] Part④に選択ページ保存

4. **構成案作成**
   - [ ] JSON出力
   - [ ] 構成案プロンプト生成（テンプレート別）
   - [ ] Claude Code指示文生成

5. **進捗管理**
   - [ ] ステータス更新
   - [ ] 進捗一覧表示

### STEP 3: スクショ撮影

**撮影対象:**
- GASダイアログ（各メニュー）
- 生成されるプロンプト・指示文
- Claude Codeでのセットアップ結果
- 完成したHP（テンプレート別）

**保存先:** `public/images/hp/`

### STEP 4: マニュアル作成・更新

**対象ファイル:**
- `docs/manuals/hp/00-全体フロー.md`（新規or更新）
- `docs/manuals/hp/04-JSON出力・原稿生成.md`（テンプレート選択の説明追加）
- `docs/manuals/hp/99-Claude Code使い方.md`（テンプレート別Tips追加）

**記載内容:**
- テンプレート選択の判断基準
- テンプレート別の構成案プロンプトの違い
- テンプレート別のClaude Code指示のコツ

---

### その他のタスク

1. **hp.tsのflowSteps詳細化**
   - ツナゲルのようにflowStepsに詳細情報を追加

2. **GASテスト（進捗管理）**
   - 📊 進捗管理メニューの動作確認

---

## 📋 テンプレート拡充計画

### 設計方針

```
テンプレート = 型（目的・心理設計） × 表現（デザインパターン）
```

- **型（Type）**: 専門家①②が決める「何を達成するか」
- **表現（Design）**: 専門家③が決める「どう見せるか」

### 型（Type）一覧

| ID | 型名 | 本質 |
|----|------|------|
| `recruit` | Recruit | 求職者の意思決定プロセス対応 |
| `leadgen` | Lead Gen | CV最短ルート設計 |
| `trust` | Trust Builder | 社会的証明の最大化 |
| `local` | Local Business | 地域商圏×SEO |
| `authority` | Authority | 専門性・実績で説得 |

### 表現（Design）一覧

| ID | 表現名 | 特徴 |
|----|--------|------|
| `visual` | Visual Impact | 写真・動画主役、テキスト最小 |
| `minimal` | Minimal Pro | 余白とタイポグラフィで勝負 |
| `dynamic` | Dynamic Flow | アニメーション・インタラクション |
| `magazine` | Magazine | 読ませるエディトリアル |

### 実装済みテンプレート一覧（全7種類）✅

| テンプレート | 型×表現 | ページ数 | サンプル企業 | リポジトリ |
|-------------|---------|----------|-------------|-----------|
| Standard | 汎用 | 6 | 中部建設株式会社 | `template-standard` |
| Recruit Magazine | recruit × magazine | 7 | 株式会社ネクストステージ | `template-recruit-magazine` |
| LeadGen Minimal | leadgen × minimal | 4 | スカイリフォーム株式会社 | `template-leadgen-minimal` |
| LeadGen Visual | leadgen × visual | 5 | 三河精密工業株式会社 | `template-leadgen-visual` |
| Trust Visual | trust × visual | 6 | あおぞら法律事務所 | `template-trust-visual` |
| Authority Minimal | authority × minimal | 8 | 株式会社テックフロンティア | `template-authority-minimal` |
| Full Order | フルカスタム | 自由 | 東海プレシジョン株式会社 | `template-fullorder` |

### 関連リソース

| リソース | パス/URL |
|---------|---------|
| テンプレート本体 | `/mnt/c/hp-template/` |
| ショーケースサイト | `/mnt/c/sing-hp-template/` |
| ショーケースURL | https://sing-hp-template.vercel.app/ |

### テンプレート構造

```
/mnt/c/hp-template/
├── template-standard/          # 標準テンプレート（6ページ）
├── template-recruit-magazine/  # 採用サイト・マガジン形式（7ページ）
├── template-leadgen-minimal/   # リード獲得型・ミニマル（4ページ）
├── template-leadgen-visual/    # 地域密着型・ビジュアル（5ページ）
├── template-trust-visual/      # 信頼構築型・ビジュアル（6ページ）
├── template-authority-minimal/ # 権威性訴求・ミニマル（8ページ）
└── template-fullorder/         # フルオーダー・完全カスタム
```

### 設計ドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/plans/hp-template-expansion/00-template-creation-workflow.md` | ワークフローガイド（完全手順書） |
| `docs/plans/hp-template-expansion/01-expert-consultation-raw.md` | 専門家諮問の生出力（全文保存） |
| `docs/plans/hp-template-expansion/02-template-matrix-plan.md` | 計画書（詳細設計） |

---

### ✅ 完了: 全テンプレート実装 + ショーケースサイト

**完了日:** 2026-02-02

**成果物:**
- `/mnt/c/hp-template/` - 7種類のテンプレート本体
- `/mnt/c/sing-hp-template/` - クライアント向けショーケースサイト
- GAS `compositionPrompt.js` - 7種類のテンプレート選択UI

**実装内容:**
- 全7テンプレートをNext.js 16 + React 19 + Tailwind 4で実装
- 各テンプレートにサンプル企業データを設定
- ショーケースサイトで全テンプレートをプレビュー可能
- GASのテンプレート選択UIを7種類に対応

**テンプレート設計思想:**
- 型（Type）× 表現（Design）のマトリクス設計
- `template-fullorder` をベースに各テンプレートを作成
- `site.json` でナビゲーション・基本情報を管理
- 各ページ.tsx でコンテンツを直接編集

---

### HP制作フロー改善

HP制作のフローをツナゲルと同じ設計思想で整備する。

**現在のステータス:** STEP 8完了、テンプレートリポジトリ分離完了

---

#### ✅ 完了した作業

- タスク分割設計（11タスク構成）
- hp.tsの再構築
- Googleフォーム設計・作成・GAS適用
- ヒアリングシート構造設計（4パート構成）
- Part②ヒアリング項目設計（39項目）
- **全10個のGASファイル作成完了**
- **マニュアル全11タスク詳細化完了**（No.0〜10）
- **GASテスト（Part①〜③転記）** - フォーム回答からの転記動作確認＆修正
- **マニュアル更新（01-打ち合わせ前準備）** - メニュー名修正、スクショ追加
- **プロンプトシート構造統一** - settingsSheet.jsに一本化（6列構造）
- **メニュー統合** - 「3.文字起こし転記」を「2.ヒアリング反映」に統合（メニュー6→5個に）
- **JSON出力自動保存** - 生成時にPart④へ自動保存
- **サンプルデータ作成** - 中部建設のCSV・文字起こしサンプル
- **構成案プロンプト大幅改善** - 3人の専門家プロンプト、反AIデザイン哲学、選択ページ連携
- **メニュー統合（2回目）** - 「4.JSON出力」と「5.構成案作成」を統合（メニュー5→4個に）
- **Claude Code指示文大幅改善** - 実装指示→セットアップ指示に変更、HANDOFF生成方式
- **STEP 5完了** - 構成案プロンプトにClaude Code用出力指示追加（チェックボックス、HANDOFF生成、wireframe保存）
- **Claude Code使い方マニュアル作成** - `docs/manuals/hp/99-Claude Code使い方.md`（起動方法4パターン、モード説明、トラブルシューティング、紹介動画）
- **GitHubテンプレートリポジトリ設定** - sing-hp-templateをTemplate Repositoryに設定
- **Claude Code指示文フロー改善** - ユーザー向け/Claude Code向け指示を分離、起動場所案内をダイアログに追加、テンプレートクローン指示を明確化
- **HANDOFFテンプレート拡充** - 企業情報、ロゴ、ブランドカラー、ヘッダー/フッター仕様、素材ファイル等を追加
- **コーディングルール改善** - globals.cssの@themeブロック内ブランドカラー変更指示を明確化
- **HANDOFF_GUIDE.md作成** - sing-hp-template/に配置（HANDOFFの構造標準化ガイド）
- **製造業サンプル作成（三河精密工業）** - 文字起こし・CSV作成、サンプル作成ガイド作成
- **構成案プロンプト改善** - ファイル保存指示を明示的に追加（「Writeツールで作成してください」等）
- **マニュアル更新（99-Claude Code使い方）** - トラブルシューティング追加（構成案投げてもファイル保存されない場合の対処法）

#### ✅ HP制作GAS（全て完了）

| ファイル | 機能 |
|---------|------|
| `formCreator.js` | Googleフォームセットアップ |
| `hearingSheetManager.js` | メインGAS（onOpen、シート作成、フォーム転記、企業フォルダ作成） |
| `settingsSheet.js` | 設定シート・プロンプトシート管理 |
| `commonStyles.js` | 共通スタイル（ツナゲルから流用） |
| `progressManager.js` | ステータス管理・進捗一覧 |
| `promptDialog.js` | 議事録作成・プロンプト実行 |
| `createFolder.js` | 素材フォルダ作成（チェックボックス選択式） |
| `transcriptToHearingSheet.js` | 文字起こし転記（Part②39項目対応） |
| `jsonOutputDialog.js` | JSON出力（Part①②、サーバー情報除外） |
| `compositionPrompt.js` | 構成案プロンプト + Claude Code指示文 |

---

#### 📋 次にやること（優先順）

##### ~~STEP 1: マニュアル更新・スクショ挿入~~ ✅完了
スクショ挿入と最新GASに合わせた更新が完了。

##### ~~STEP 2: 構成案プロンプト改善~~ ✅完了
3人の専門家プロンプトを実装：
- **専門家①**: WEBマーケティングプロ（コンバージョンファネル、心理トリガー、ABテスト）
- **専門家②**: 求人コンサルタント（求職者インサイト、情報開示戦略、感情設計）
- **専門家③**: WEBデザイナー（反AIデザイン哲学、余白の呼吸、装飾の引き算）

**修正したGAS:**
- `createFolder.js` - 選択ページをPart④に保存
- `compositionPrompt.js` - 3人の専門家プロンプト、プロンプトシート読み込み、選択ページ連携
- `settingsSheet.js` - プロンプトシート作成時に構成案プロンプト自動登録

##### ~~STEP 3: Claude Code指示文ブラッシュアップ~~ ✅完了
Claude Code指示文を「実装指示」から「セットアップ指示」に変更。

**変更内容:**
- ダイアログにテンプレート選択UI追加（5種類）
- 技術スタック修正（Next.js 16.1.6、React 19.2.3、Tailwind 4.x等）
- 開発環境の注意点追加（WSL2でTurbopack不可→--webpackフラグ）
- 指示文の役割を変更:
  1. 企業ディレクトリ作成（`/mnt/c/hp-projects/{{companyName}}/`）
  2. 生データ保存（`data/hearing.json`, `data/composition.md`）
  3. HANDOFF.md作成（進捗管理・引き継ぎ用）
  4. 次世代セッションへの引き継ぎ指示出力

**修正したGAS:**
- `compositionPrompt.js` - HP_CLAUDE_CODE_PROMPT_TEMPLATE全面改修、ダイアログにテンプレート選択追加

##### ~~STEP 4: マニュアル更新~~ ✅完了
Claude Code指示文の変更に合わせてマニュアルを更新。

**対象マニュアル:** `docs/manuals/hp/04-JSON出力・原稿生成.md`

**更新内容:**
- メニュー番号を「4.📝 構成案作成」に統一
- テンプレート選択の説明を追加（5種類）
- 生成される指示文の役割（セットアップ指示書）を説明
- STEP 5〜6追加（Claude Codeセットアップ実行、次世代セッション開始）
- 技術スタックを最新版に更新（Next.js 16.1.6等）
- トラブルシューティング追加（セットアップ・次世代セッション関連）

##### ~~STEP 5: 構成案プロンプトにClaude Code用出力指示を追加~~ ✅完了

**実装内容:**
- `HP_CLAUDE_CODE_OUTPUT_INSTRUCTION` テンプレート追加
- ダイアログに「Claude Codeで実行する」チェックボックス追加
- チェックON時: HANDOFF.md生成指示 + wireframe保存指示を追加
- 出力先: `client_hp/{{companyNameEn}}/doc/wireframe/`

**作成したマニュアル:**
- `docs/manuals/hp/99-Claude Code使い方.md`
- スクショ18枚、紹介動画1本（`public/images/hp/claude-code/`）

##### ~~STEP 6: 製造業の文字起こしサンプル作成~~ ✅完了

**作成ファイル:**
- `docs/samples/hp/meeting-transcript-mikawa-seimitsu.txt` - 文字起こし
- `docs/samples/hp/sample_form_response_mikawa.csv` - フォーム回答CSV
- `docs/samples/hp/README.md` - サンプル作成ガイド

**企業設定（三河精密工業）:**
- 業種: 製造業（精密金属加工）
- サーバー: C. 自社管理（外部委託先と連絡取れない）
- 素材: ほぼない
- 中部建設との差別化を意識

##### ~~STEP 7: 実装テスト~~ ✅完了

構成案プロンプトのClaude Code実行オプションをテストした。

**テスト結果:**
- `client_hp/mikawa-seimitsu/HANDOFF.md` ✅生成済み
- `client_hp/mikawa-seimitsu/doc/wireframe/*.md` ✅生成済み

**発見した問題と対応:**
| 問題 | 対応 |
|------|------|
| Claude Codeが「ファイル保存しますか？」と聞いてくる | プロンプトに明示的な保存指示を追加済み |
| Claude Codeが先にmkdirでディレクトリを作ってしまう | トラブルシューティングに対処法追加（docを退避→クローン→戻す） |
| sing-hp-templateが「ショーケースサイト」であり「1企業用テンプレート」ではない | STEP 8で解決 |

**修正したファイル:**
- `compositionPrompt.js` - セットアップ手順を最初のセッションから分離、HANDOFF.mdに記載
- `docs/manuals/hp/99-Claude Code使い方.md` - トラブルシューティング追加

##### ~~STEP 8: テンプレートリポジトリ再構築~~ ✅完了

**問題:**
現在のsing-hp-templateは「テンプレートのショーケースサイト」であり、クローンしても5種類のテンプレートが全部入ってしまう。1企業用HPとして使えない。

**解決策:**
1. **中部建設HPを第一のテンプレートとして完成**
2. **テンプレートを別リポジトリに分離** → `template-standard`
3. **GASで選択 → リポジトリURL動的生成**

**設計方針（ハイブリッド方式）:**
- `data/site.json` → 基本情報（会社名、連絡先、SEO、ブランドカラー）
- 各ページ.tsx → ページ固有コンテンツは直接編集

**完了した作業:**
- [x] 中部建設HPを `/mnt/c/hp-template/template-standard/` にコピー（node_modules除外）
- [x] `data/site.json` 作成（空の構造）
- [x] `src/lib/site.ts` 作成（型定義＋データ読み込みユーティリティ）
- [x] `tsconfig.json` 更新（`@data/*` パスエイリアス追加）
- [x] `src/app/layout.tsx` 修正（site.jsonから読み込み）
- [x] `src/components/Header.tsx` 修正（site.jsonから読み込み）
- [x] `src/components/Footer.tsx` 修正（site.jsonから読み込み）
- [x] ロゴファイル名汎用化（中部建設ロゴ.png → logo.png等）
- [x] `src/app/page.tsx` 修正（コンテンツデータを上部に集約、site.jsonと連携）

**残りの作業:** ✅全て完了
1. [x] 残りのページをプレースホルダー化（about, service, recruit, contact, privacy, news）
2. [x] 不要ファイル削除（HANDOFF.md, doc/wireframe等）
3. [x] テンプレート用README.md作成
4. [x] 新リポジトリ `template-standard` を作成してプッシュ
5. [x] `compositionPrompt.js` のテンプレート選択UIを修正
6. [x] 動作テスト（ビルドは未実施、コード修正完了）

**作業ディレクトリ:**
- テンプレート作業場所: `/mnt/c/hp-template/template-standard/`
- 元の中部建設HP（変更禁止）: `/mnt/c/client_hp/chubu-kensetsu/`

**ファイル構造（現在）:**
```
/mnt/c/hp-template/template-standard/
├── data/
│   └── site.json          # 基本情報（空の構造）★新規作成
├── src/
│   ├── lib/
│   │   └── site.ts        # データ読み込みユーティリティ ★新規作成
│   ├── app/
│   │   ├── layout.tsx     # ★修正済み（site.json読み込み）
│   │   ├── page.tsx       # ★修正済み（コンテンツ上部集約）
│   │   └── ...            # 残りのページ（未修正）
│   └── components/
│       ├── Header.tsx     # ★修正済み（site.json読み込み）
│       └── Footer.tsx     # ★修正済み（site.json読み込み）
├── public/images/
│   ├── logo.png           # ★リネーム済み（旧:中部建設ロゴ.png）
│   ├── logo-square.png    # ★リネーム済み
│   └── logo-only.png      # ★リネーム済み
└── tsconfig.json          # ★修正済み（@data/* 追加）
```

**page.tsxの構造（参考）:**
```tsx
// コンテンツデータ（構成案に基づいて編集してください）
const FIRST_VIEW = { catchphrase: "...", subCopy: "...", ... };
const STATS = [...];
const ABOUT = {...};
const SERVICES = [...];
// ... 他のセクションデータ

// セクションコンポーネント
function FirstView() { ... }  // site.jsonのcompany.catchphraseを参照
function StatsSection() { ... }  // site.statsがあれば使用、なければSTATS
// ...
```

**参照:**
- 現テンプレート: `https://github.com/tenchan000517/sing-hp-template`

##### STEP 9: hp.tsのflowSteps詳細化
ツナゲルのようにflowStepsに詳細情報を追加。
- `summary`: ステップの概要
- `description`: 詳細な手順説明
- `links`: 必要なリンク

##### STEP 6: GASテスト（残り）
- [x] 1.📋 HP制作 ✅
- [x] ⚙️ 設定 ✅
- [x] 2.📝 ヒアリング反映 ✅（旧:議事録作成+文字起こし転記を統合）
- [x] 3.📁 素材フォルダ ✅
- [x] 4.📤 JSON出力 ✅（自動保存機能追加）
- [x] 5.📝 構成案作成 ✅
- [ ] 📊 進捗管理

---

#### 📊 マニュアル進捗状況（全完了）

全11タスクのマニュアル詳細化が完了。各マニュアルには以下が含まれる：
- 基本情報テーブル（担当者、使用ツール、前後工程）
- フロー概要（図解）
- 作業手順（STEP形式）
- チェックポイント
- トラブルシューティング

**マニュアル格納場所:** `docs/manuals/hp/`

---

### ツナゲル検証・インフォ更新

新しいフローでの検証を行い、スクショ撮影→インフォ更新→マニュアル更新を進める。

**現状:**
- No.0〜5: インフォ/マニュアル作成済み（更新が必要な可能性）
- No.6〜13: 基本情報のみ、詳細フロー未確定

**必読ドキュメント:** `docs/manual-creation-guideline-v3.md`

---

## プロジェクト概要

制作陣の業務効率化とマニュアル整備プロジェクト。
9商材・52業務を対象に、AI活用による効率化とマニュアル改善を推進。

**ガイドライン:**
- `docs/manual-creation-guideline-v3.md` ★最新版（新商材作成の完全ガイド）
- `docs/manual-creation-guideline-v2.md` UI仕様詳細（GASダイアログ）
- `docs/manual-creation-guideline.md` 旧版（データ構造参照用）

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
| HP制作 | 11 | GAS完了・マニュアル完了（GASテスト待ち） |
| バツグン | 5 | 基本情報のみ |
| LP制作 | 5 | 基本情報のみ |
| SNS広告 | 5 | 基本情報のみ |
| PV制作 | 5 | 基本情報のみ |
| パンフ | 3 | 基本情報のみ |
| ロゴ | 3 | 基本情報のみ |
| 月刊Sing | 4 | 基本情報のみ |
| **合計** | **52** | - |

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
└── ✏️ ステータス更新

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
