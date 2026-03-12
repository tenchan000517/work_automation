/**
 * HP制作 構成案プロンプト GAS
 *
 * 【機能】
 * 1. 構成案プロンプト生成 - JSON + テンプレート → 外部AI用プロンプト
 * 2. Claude Code指示文生成 - 構成案 + JSON → HP実装指示
 *
 * 【用途】
 * 用途1: ヒアリングシート内容（JSON）→ 構成案作成用プロンプト → 外部AIに投げる
 * 用途2: 外部AI出力結果 + ヒアリングシート内容（JSON）→ Claude Code用HP作成指示文
 *
 * 【設計思想】
 * - jsonOutputDialog.jsのhp_extractJsonData()を再利用
 * - サーバー情報（Part③）は絶対に含めない
 * - commonStyles.jsを使用してUI統一
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 */

// ===== Claude Code用出力指示テンプレート =====
const HP_CLAUDE_CODE_OUTPUT_INSTRUCTION = `

---

# 【Claude Code用 出力指示】

**あなたはこの指示に従って、プロジェクトをセットアップし、ファイルを作成・保存してください。**

## 出力先ディレクトリ
\`\`\`
/mnt/c/client_hp/{{companyNameEn}}/
\`\`\`

## 最終的なファイル構成
\`\`\`
{{companyNameEn}}/
├── HANDOFF.md                    # 進捗管理・引き継ぎ用
├── doc/
│   └── wireframe/
│       ├── 00_overview.md        # PART1: サイト全体の戦略設計
{{pageFiles}}
│       ├── {{commonPartsNum}}_common_parts.md    # ヘッダー・フッター
│       └── {{photoGuideNum}}_photo_guide.md      # 撮影指示書
├── public/images/                # 素材画像（後で配置）
├── src/                          # Next.jsソースコード
└── （その他テンプレートファイル）
\`\`\`

## 作成手順

### STEP 1: 出力先ディレクトリを作成

\`\`\`bash
mkdir -p /mnt/c/client_hp/{{companyNameEn}}/doc/wireframe
cd /mnt/c/client_hp/{{companyNameEn}}
\`\`\`

### STEP 2: HANDOFF.mdを作成

以下の内容で HANDOFF.md を作成してください：
   \`\`\`markdown
   # {{companyName}} HP制作 HANDOFF

   ## プロジェクト情報

   | 項目 | 内容 |
   |------|------|
   | 企業名 | {{companyName}} |
   | ディレクトリ | client_hp/{{companyNameEn}}/ |
   | 作成日 | {{date}} |
   | テンプレート | {{templateType}} |

   ## 企業基本情報

   | 項目 | 内容 |
   |------|------|
   | 代表者 | （構成案から抽出） |
   | 設立 | （構成案から抽出） |
   | 所在地 | （構成案から抽出） |
   | 電話番号 | （構成案から抽出） |
   | 事業内容 | （構成案から抽出） |

   ## ロゴ

   | 項目 | 内容 |
   |------|------|
   | ファイル一覧 | （未定の場合は「未定」と記載） |
   | ヘッダー用 | ファイル名、サイズ（PC/SP） |
   | フッター用 | ファイル名、サイズ |
   | ファビコン用 | ファイル名 |
   | カラー | ロゴの色、反転が必要な場面 |

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
   | レイアウト | 3カラム等 |
   | 背景色 | #XXXXXX |
   | PC | 横並び配置 |
   | SP | 縦並び配置 |

   ## ページ別セクション構成

   ### TOPページ
   | セクション | 背景色 |
   |-----------|--------|
   | ヒーロー | 画像 |
   | ... | ... |
   | CTA | メインカラー |

   （他ページも同様に記載）

   ## 素材ファイル

   | 項目 | 内容 |
   |------|------|
   | 画像ディレクトリ | public/images/ |
   | 画像一覧 | （ファイル名と用途） |
   | 未撮影/未生成 | （必要だが未準備の素材） |

   ## 技術スタック

   - Next.js 16.x（App Router）
   - React 19.x
   - TypeScript 5.x
   - Tailwind CSS 4.x
   - Framer Motion 12.x

   ## コーディングルール

   - **globals.cssの@themeブロック内のブランドカラーのみ変更する**
     - \`--color-navy\` → メインカラーに変更
     - \`--color-navy-dark\` → メインカラー（濃）に変更
     - \`--color-accent\` → アクセントカラーに変更
     - \`--color-accent-dark\` → アクセントカラー（濃）に変更
     - ※変数名は変えない（ユーティリティクラスが参照しているため）
   - **それ以外のglobals.cssは編集しない**
   - **Tailwind CSSを使用** - スタイルはユーティリティクラスで記述

   ## 参照ファイル

   | ファイル | 用途 |
   |---------|------|
   | doc/wireframe/*.md | 各ページの詳細設計 |
   | doc/wireframe/00_overview.md | サイト全体の戦略設計 |

   ## 実装状況

   | ページ | 状態 | 備考 |
   |--------|------|------|
   {{pageStatusTable}}
   | 共通パーツ | 未着手 | ヘッダー・フッター |

   ## 最初にやること（セットアップ）

   **※すでにdocフォルダとHANDOFF.mdが存在する場合（構成案プロンプトで作成済み）:**

   \`\`\`bash
   # 1. docフォルダとHANDOFFを一時退避
   cd /mnt/c/client_hp/{{companyNameEn}}
   mv doc ../{{companyNameEn}}_doc_backup
   mv HANDOFF.md ../{{companyNameEn}}_HANDOFF_backup.md

   # 2. 一度親ディレクトリに移動してディレクトリを削除
   cd /mnt/c/client_hp
   rm -rf {{companyNameEn}}

   # 3. テンプレートをクローン
   gh repo clone {{templateRepo}} {{companyNameEn}}

   # 4. docフォルダとHANDOFFを戻す
   mv {{companyNameEn}}_doc_backup {{companyNameEn}}/doc
   mv {{companyNameEn}}_HANDOFF_backup.md {{companyNameEn}}/HANDOFF.md

   # 5. 依存関係インストール
   cd {{companyNameEn}}
   npm install
   \`\`\`

   ## 次にやること（実装）

   1. doc/wireframe/00_overview.md でサイト戦略を確認
   2. TOPページ（01_top.md）から実装開始
   3. 各ページはdoc/wireframe/XX_pagename.mdを参照しながら実装
   \`\`\`

### STEP 3: ワイヤーフレームをファイルごとに作成・保存

- 一度に全て出力しない
- 1ファイル作成 → 保存 → 次のファイル
- **ファイル名の規則**: 番号は2桁ゼロ埋め（01, 02, ...）、ページ名は英語小文字

### STEP 4: 各ファイルの冒頭にメタ情報を記載

\`\`\`markdown
# [ページ名] ページ詳細設計

> 企業名: {{companyName}}
> 作成日: {{date}}
> ファイル: XX_pagename.md
\`\`\`

### STEP 5: 完了後の確認

全ファイル作成後、ディレクトリ構造を出力して確認

---

## 実行順序

1. STEP 1を実行（出力先ディレクトリ作成）
2. **HANDOFF.md** を作成
3. **doc/wireframe/00_overview.md** を作成
4. **各ページのwireframe** を順番に作成
5. **common_parts.md** と **photo_guide.md** を作成

ファイル作成を開始してください。
`;

// ===== 構成案プロンプトテンプレート（3人の専門家バージョン） =====
const HP_COMPOSITION_PROMPT_TEMPLATE = `あなたは以下の3人の世界最高峰の専門家として、HP制作の完全な構成案を作成してください。

# 【専門家ペルソナ】

## 👤 専門家①: 世界一のWEBマーケティングプロフェッショナル
- **専門領域**: コンバージョン最適化、ユーザー心理学、データドリブンマーケティング
- **視点**:
  - 各ページでユーザーがどう行動し、どこで離脱し、どこでコンバージョンするか
  - ターゲット別の最適な導線設計
  - ABテストで勝率の高い文言・配置・色の選定
  - 心理トリガー（社会的証明、希少性、権威性など）の戦略的配置
- **アウトプット**: 各ページの「見出し」「文言」「CTA配置」「導線設計」を、コンバージョン率を最大化する観点から設計

## 👤 専門家②: 日本で最高の求人コンサルタント
- **専門領域**: 採用ブランディング、求職者心理、定着率向上戦略
- **視点**:
  - 求職者が本当に知りたい情報は何か（給与より文化、数字より実感）
  - 応募ハードルを下げる情報開示の順序と深さ
  - 「この会社で働きたい」と思わせる感情設計
  - 入社後のギャップを防ぐ正直で魅力的な表現
- **アウトプット**: 採用関連ページ（採用情報、社員インタビュー、働く環境）の文言・構成を、応募率と定着率を最大化する観点から設計

## 👤 専門家③: 人間味ある最高のWEBデザイナー
- **専門領域**: UI/UX、ビジュアル階層設計、ブランド体験設計、**反AIデザイン哲学**
- **視点**:
  - **AIデザインの典型的な特徴を徹底的に排除**
  - 視線の流れを計算した要素配置とビジュアル階層
  - 感情を動かす色彩・余白・タイポグラフィの選定
  - ブランドの世界観を体現する洗練されたデザイン
- **アウトプット**: 各ページの「レイアウト」「ビジュアル要素」「色彩設計」「UI詳細」を、人間ならではの洗練されたデザインで設計

### 【専門家③の「反AIデザイン哲学」】

AIが生成するデザインには典型的なパターンがあり、それらを**意図的に避ける**ことで、人間ならではの洗練されたデザインを実現します。

#### ❌ AIデザインの典型的な特徴（絶対に避けるべき要素）

**1. カード乱用症候群**
- ❌ 全ての要素をカードコンテナで囲む
- ❌ カードに必ず border: 1px solid #E0E0E0 をつける
- ❌ カードに必ず box-shadow: 0 2px 8px rgba(0,0,0,0.08) をつける
- ❌ すべてのカードが同じ角丸（12px）
- ✅ **代わりに**: 情報のグルーピングは余白と視覚的階層で表現。カードは本当に必要な時だけ使う。

**2. 紫・グラデーション病**
- ❌ 理由もなく紫系の色（#6B5CE7, #8B5CF6など）を多用
- ❌ 何にでもグラデーション（linear-gradient）を適用
- ❌ 2色以上の派手なグラデーション
- ✅ **代わりに**: 企業ブランドカラーに基づいた単色使用。グラデーションは同系色の微妙なものを目立たない場所にのみ。

**3. 過剰な装飾**
- ❌ すべての見出しに下線や背景色
- ❌ 見出しの前後に装飾的な記号（●、|、＝など）
- ❌ セクションごとに背景色を交互に変える
- ❌ アイコンの過剰使用
- ✅ **代わりに**: タイポグラフィの階層とサイズだけで視覚的な秩序を作る。装飾は最小限。

**4. 不自然な余白**
- ❌ すべての要素間の余白が均一（例: すべて40px）
- ❌ 余白が8の倍数に固執
- ✅ **代わりに**: 要素の重要度や関係性に応じて余白を変える。関連する要素は近く、関連しない要素は遠く。

**5. ボタンの画一化**
- ❌ すべてのボタンが同じサイズ
- ❌ すべてのボタンが角丸8px
- ❌ ホバー時は必ず transform: scale(1.05)
- ✅ **代わりに**: ボタンのサイズは文言の長さや重要度に応じて変える。ホバーも多様に。

**6. アニメーションの過剰使用**
- ❌ すべての要素にスクロール連動フェードイン
- ❌ すべての要素に下からスライドイン
- ❌ アニメーション時間が必ず0.3秒か0.6秒
- ✅ **代わりに**: アニメーションは控えめに。本当に注目してほしい要素にのみ。多くの要素は静的に表示。

**7. レイアウトの硬直性**
- ❌ すべてのセクションが「見出し→リード文→3カラムカード→CTAボタン」の繰り返し
- ❌ 常に左右対称
- ✅ **代わりに**: セクションごとに異なるレイアウトパターン。時には非対称、時には全幅使用。

#### ✅ 人間デザイナーならではの特徴（積極的に取り入れるべき要素）

**1. 余白の呼吸**: 関連する要素は近づけ、関連しない要素は大きく離す。余白は呼吸するように自然に。

**2. タイポグラフィの階層**: サイズ、ウェイト、色、字間、行間で階層を作る。装飾なしでも目立たせる。

**3. 色の抑制と強調**: ベースはモノトーン、ブランドカラーは「ここぞ」という時だけ使う。

**4. ビジュアルのバリエーション**: 写真は様々なサイズ・アスペクト比で配置。インパクトと リズムを作る。

**5. 非対称の美学**: 常に左右対称ではなく、時には意図的に崩す。

**6. 装飾の引き算**: ボーダー・影は必要最小限。背景色の変化は意味がある時だけ。

**7. インタラクションの自然さ**: ホバーは控えめに。アニメーションは一部の重要な要素にのみ。

**8. ブランドの一貫性と柔軟性**: コア要素は一貫、ページごとに少しずつ表情を変える。

---

# 【重要な前提条件】

## ✅ 完成度の定義
この構成案は「設計書」ではなく、**以下の状態を満たす完成品**です:

1. **テンプレートに流し込むだけの状態**
   - 技術的な実装（HTML/CSS/JSの構造）はテンプレート側に存在
   - 構成案では「何を」「どこに」「どう見せるか」に100%集中
   - エンジニアが迷わず、デザイナーが迷わず、ライターが迷わない

2. **全ての文言が確定している**
   - 「後で考える」「検討が必要」という表現は一切なし
   - 見出し、本文、ボタン文言、キャプション、すべて実際の文字数で記載
   - そのままコピペしてテンプレートに貼り付けられるレベル

3. **全てのビジュアル要素が指定されている**
   - 画像内容（撮影指示レベルの具体性）
   - 配置（左・右・中央、サイズ、余白）
   - 色（カラーコード、ただしグラデーションは最小限）
   - アニメーション（控えめに、意味がある時だけ）

4. **全てのUI要素が設計されている**
   - ボタンのサイズ、色、ホバー時の挙動（ただし画一的ではない）
   - フォームの項目、バリデーション、エラー表示
   - カード（使う場合のみ）、リスト、テーブルのスタイル
   - モバイル版での変更点

5. **AIデザインの特徴を徹底的に排除**
   - カードの乱用を避ける
   - ボーダー・影は必要最小限
   - グラデーションは原則使わない
   - 紫系の色は企業カラーでない限り使わない
   - 余白は要素の関係性に応じて変える
   - アニメーションは控えめに

---

# 【ヒアリング情報】

\`\`\`json
{{json}}
\`\`\`

---

# 【作成するページ】

{{pages}}

---

# 【出力形式】

以下の構成で、3人の専門家の知見を統合した構成案を出力してください。
各セクションで、該当する専門家の視点を明記し、その専門性に基づいた設計理由を記載してください。

---

## 【PART 1】サイト全体の戦略設計

### 1-1. マーケティング戦略（👤 専門家①の視点）

#### ■ コンバージョンファネル設計
各ターゲットの行動フロー:

**ターゲット①: [具体的な属性]**
\`\`\`
認知 → 興味 → 比較検討 → 行動 → コンバージョン
  ↓      ↓         ↓        ↓          ↓
[施策] [施策]    [施策]   [施策]    [施策]
\`\`\`

- **認知段階**:
  - 流入経路: Google検索「[キーワード]」、SNS、紹介
  - 最初に見るページ: トップページ（70%）、サービスページ（20%）、採用ページ（10%）
  - この段階での訴求: 「[具体的なメッセージ]」
  - 離脱防止策: ファーストビュー3秒で「[訴求ポイント]」を伝える

- **興味段階**:
  - 見るページ: 会社概要、実績紹介
  - 滞在時間目標: 各ページ2分以上
  - この段階での訴求: 「[具体的なメッセージ]」
  - 次のアクションへの誘導: 「[CTA文言]」で[次のページ]へ

- **比較検討段階**:
  - 見るページ: サービス詳細、料金、FAQ
  - 競合と比較される要素: [具体的な要素3つ]
  - この段階での訴求: 「[差別化ポイント]」
  - 不安解消コンテンツ: [具体的なコンテンツ]

- **行動段階**:
  - 最後のハードル: 「[具体的な不安要素]」
  - 背中を押す要素: 「[具体的な要素]」（例: 無料相談、実績の数字、お客様の声）
  - CTAの配置: [具体的な配置場所3箇所]

- **コンバージョン**:
  - 目標行動: お問い合わせフォーム送信
  - フォーム到達率目標: [%]
  - フォーム完了率目標: [%]
  - 離脱防止策: 項目数[個]、入力時間[分以内]

（ターゲット②、③も同様に記載）

#### ■ 心理トリガー配置戦略
各ページでどの心理トリガーをどこに配置するか:

**トップページ**:
- 社会的証明: 「施工実績300件以上」「お客様満足度95%」→ 配置: 実績セクション、数字を大きく表示
- 権威性: 「名古屋市役所新庁舎施工」→ 配置: 実績カルーセル、ロゴマーク付き
- 希少性: 「月間受注枠残り3件」→ 配置: CTAセクション（※該当する場合のみ）
- 親近性: 社員の笑顔の写真 → 配置: 採用情報セクション

（各ページごとに同様に記載）

#### ■ ABテスト推奨項目
公開後にテストすべき要素:

1. **トップページのメインキャッチコピー**:
   - パターンA: 「[文言]」（実績重視）
   - パターンB: 「[文言]」（感情訴求）
   - 勝利予測: パターンA（理由: ターゲットが信頼性を重視）

2. **CTAボタンの文言**:
   - パターンA: 「お問い合わせ」
   - パターンB: 「無料相談してみる」
   - 勝利予測: パターンB（理由: ハードルの低さを感じさせる）

（計5-7項目を記載）

---

### 1-2. 採用ブランディング戦略（👤 専門家②の視点）

#### ■ 求職者インサイト分析
ターゲット求職者が本当に知りたいこと（優先順序）:

**高校新卒者の場合**:
1. 最重要: この会社で自分はやっていけるか？（厳しすぎないか）
2. 重要: 先輩たちはどんな人？（怖くないか、優しいか）
3. 重要: 休みはちゃんと取れるか？（プライベートは大丈夫か）
4. やや重要: 給料はどれくらいか？
5. やや重要: どんな技術が身につくか？

**対応策**:
- 「やっていけるか」→ 若手社員インタビューで「未経験でも大丈夫だった」エピソード
- 「先輩たち」→ 笑顔の写真、社員食堂での談笑シーン、「話しやすい」というコメント
- 「休み」→ 「有給取得率○%」「残業月15時間」を数字で明記
- 「給料」→ 月給レンジを正直に記載、賞与実績も
- 「技術」→ 研修制度、資格取得支援を具体的に

**中途採用者（経験者）の場合**:
（同様に優先順位と対応策を記載）

#### ■ 応募ハードルを下げる情報開示戦略

- **ステップ1: 採用ページ訪問時（ハードル: 低）**
  - 開示情報: 仕事の魅力、社風、働く環境（ポジティブな情報）
  - 目標: 「もっと知りたい」と思わせる

- **ステップ2: ページを読み進めた時（ハードル: 中）**
  - 開示情報: 社員インタビュー、1日の流れ、福利厚生の詳細
  - 目標: 「この会社いいかも」と思わせる

- **ステップ3: 募集要項を見た時（ハードル: やや高）**
  - 開示情報: 給与レンジ、勤務時間、休日、応募資格
  - 目標: 「応募してみよう」と決断させる

- **ステップ4: エントリーフォーム到達時（ハードル: 高）**
  - フォーム項目: 最小限（名前、連絡先、簡単な志望動機のみ）
  - 目標: 離脱させない

#### ■ 「入りたい」と思わせる感情設計

**社員インタビュー**:
- 目標感情: 「この人たちと一緒に働きたい」
- 文言の工夫:
  - NG例: 「やりがいのある仕事です」（抽象的）
  - OK例: 「初めて自分が担当した現場が完成した時、施主さんに『ありがとう』と言われて、この仕事を選んで良かったと心から思いました」（具体的、感情が伝わる）
- 写真の工夫:
  - NG例: スーツでかしこまったポートレート
  - OK例: 現場で笑顔で話している自然な表情

---

### 1-3. ブランド体験設計（👤 専門家③の視点）

#### ■ ブランドの「人格」定義

**もしこの会社が人だったら...**:
- 年齢: [例: 40代（経験豊富だが、まだ現役で活躍している）]
- 性格: [例: 誠実、温厚、面倒見が良い、技術に誇りを持っている]
- 話し方: [例: 丁寧だが堅苦しくない、専門用語は使うが説明してくれる]
- 印象: 「この人になら任せられる」「この人の下で働きたい」

**この人格をデザインに落とし込む**:
- 色: [例: 紺色（誠実さ）+ オレンジ（温かさ）]
- フォント: [例: ゴシック体（現代的で読みやすい）]
- 写真: [例: 作り込まれたスタジオ写真×、現場の自然な表情◎]
- 余白: [例: 適度な余白（品がある）]

#### ■ ビジュアル階層設計

**トップページのファーストビュー（視線の流れ）**:
\`\`\`
1. メインビジュアル（写真）← 最初に目が行く
   ↓
2. メインキャッチコピー（大きな文字）← 2番目に読む
   ↓
3. サブキャッチコピー（小さな文字）← 3番目に読む
   ↓
4. CTAボタン（目立つ色）← 最後に行動する
\`\`\`

#### ■ 色彩心理とブランド体験

**メインカラー**: [色名] [#カラーコード]
- 心理効果: [例: 信頼、誠実、安定]
- 使用箇所: ヘッダー背景、見出しテキスト、フッター背景
- 避けるべき使い方: [例: CTAボタン（クリック率が下がる）]

**アクセントカラー**: [色名] [#カラーコード]
- 心理効果: [例: 活力、親しみ、行動喚起]
- 使用箇所: CTAボタン、強調テキスト、ホバーエフェクト

**サブカラー**: [色名] [#カラーコード]
- 使用箇所: セクション背景、カード背景

#### ■ 余白とリズムの設計

**余白の基準値**:
- セクション間の余白: [例: 100px（PC）/ 60px（SP）]
- 見出しと本文の余白: [例: 40px（PC）/ 24px（SP）]
- 段落間の余白: [例: 24px（PC）/ 16px（SP）]
- カード間の余白: [例: 30px（PC）/ 20px（SP）]

**リズムの設計**:
\`\`\`
大きな画像セクション（ファーストビュー）
  ↓ 余白100px
テキスト中心セクション（企業紹介）← 落ち着いて読む
  ↓ 余白100px
カード型セクション（サービス紹介）← 視覚的に楽しい
  ↓ 余白100px
画像+テキストセクション（実績紹介）← 信頼感
  ↓ 余白100px
フォームセクション（CTA）← 行動する
\`\`\`

---

## 【PART 2】各ページ詳細設計

以下、{{pages}}で指定された各ページについて、この形式で詳細を出力してください:

### [ページ名] ページ

#### ページ概要
- **目的**: [このページで達成したいこと]
- **ターゲット**: [このページを見るユーザー像]
- **CV導線上の役割**: [認知/興味/比較検討/行動のどの段階か]
- **滞在時間目標**: [○分]
- **次のアクション**: [次に見てほしいページ/行動]

#### セクション構成（上から順に）

---

##### セクション1: [セクション名]

**👤 専門家①（マーケティング）の設計意図**:
[このセクションがCV導線上で果たす役割、心理トリガーの配置理由]

**👤 専門家②（採用）の設計意図**:（採用関連ページの場合）
[求職者心理への配慮、情報開示の意図]

**👤 専門家③（デザイン）の設計意図**:
[視線誘導、ブランド体験の意図]

**レイアウト**:
- 構成: [例: フルワイド / 2カラム左画像右テキスト / グリッド3列]
- 高さ: [例: 100vh / auto / 600px程度]
- 背景: [色コード / グラデーション / 画像指示]
- 余白: 上[○px] 下[○px] 左右[○px]
- モバイル時の変更: [例: 1カラムに変更、画像を上にテキストを下に]

**コンテンツ**:
- 見出し: 「[そのままコピペできる具体的な文言]」
  - フォントサイズ: PC[○px] / SP[○px]
  - 色: [#カラーコード]
- サブ見出し: 「[具体的な文言]」
- 本文:
  「[そのままコピペできる具体的な文章。改行位置も指定。]」
- CTA: 「[ボタン文言]」→ [リンク先]
- 画像指示:
  - 内容: [何を撮影するか、どんな構図か]
  - サイズ: [幅○px × 高さ○px / アスペクト比]
  - 位置: [左/右/中央/背景]

**アニメーション**:
- 要素: [何を動かすか]
- トリガー: [スクロール到達時 / ページ読み込み時 / ホバー時]
- 動き: [フェードイン / スライドイン / スケール]
- 方向: [下から20px / 左から30px / 中央から]
- 速度: [0.6秒]
- イージング: [ease-out]
- 遅延: [複数要素の場合: 各要素0.1秒ずらし]

**UI詳細**:
- ボタン:
  - サイズ: 幅[○px] 高さ[○px] / padding[○px ○px]
  - 色: 背景[#○○○] 文字[#○○○]
  - 角丸: [○px]
  - ホバー: [背景色変化 / 影追加 / スケール1.05]
- カード:（該当する場合）
  - 影: [0 4px 12px rgba(0,0,0,0.1)]
  - 角丸: [8px]
  - ホバー: [translateY(-4px) + 影を濃く]

---

##### セクション2: [セクション名]
（同様の形式で続ける）

---

## 【注意事項】

1. **「後で考える」は禁止**: すべての文言・数値を確定させて出力
2. **コピーは具体的に**: 「〇〇について」ではなく実際の文言を書く
3. **数字を活用**: 実績、年数、件数など具体的な数字があれば必ず使う
4. **ターゲット視点**: 企業目線ではなくユーザーが求める情報順に構成
5. **モバイル考慮**: PC版とSP版の違いを明記
6. **専門家の視点明記**: 各設計の理由を専門家の観点から説明`;

// ===== 構成案用データ取得（JSON + 選択ページ） =====
/**
 * 構成案プロンプト用のデータを取得
 * - Part①② のJSON
 * - Part④ の選択ページ
 */
function hp_extractCompositionData(sheetName) {
  try {
    // まずJSONデータを取得
    const jsonResult = hp_extractJsonData(sheetName);
    if (!jsonResult.success) {
      return jsonResult;
    }

    // 選択ページをPart④から取得
    let selectedPages = [];
    try {
      const pagesResult = hp_loadPart4Data(sheetName, '選択ページ');
      if (pagesResult.success && pagesResult.value) {
        selectedPages = pagesResult.value.split(',').map(p => p.trim()).filter(p => p);
      }
    } catch (e) {
      // 選択ページがなくてもエラーにはしない
    }

    return {
      success: true,
      companyName: jsonResult.companyName,
      data: jsonResult.data,
      selectedPages: selectedPages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== テンプレート一覧 =====
// 各テンプレートは独立したリポジトリとして管理
// nameJa: ダイアログ表示用の日本語名
const HP_TEMPLATE_TYPES = [
  {
    id: 'standard',
    name: 'Standard',
    nameJa: '標準テンプレート',
    pages: 6,
    description: '企業HP標準テンプレート',
    repo: 'tenchan000517/template-standard',
    branch: 'master'
  },
  {
    id: 'fullorder',
    name: 'Full Order',
    nameJa: 'フルオーダー',
    pages: 0,
    description: 'ページなし、完全カスタム',
    repo: 'tenchan000517/template-fullorder',
    branch: 'master'
  },
  {
    id: 'recruit-magazine',
    name: 'Recruit Magazine',
    nameJa: '採用サイト（マガジン形式）',
    pages: 7,
    description: '採用サイト特化、読ませるエディトリアル',
    repo: 'tenchan000517/template-recruit-magazine',
    branch: 'master'
  },
  {
    id: 'leadgen-minimal',
    name: 'LeadGen Minimal',
    nameJa: 'リード獲得型（ミニマル）',
    pages: 4,
    description: 'CV最短ルート設計、余白とタイポグラフィ',
    repo: 'tenchan000517/template-leadgen-minimal',
    branch: 'master'
  },
  {
    id: 'leadgen-visual',
    name: 'LeadGen Visual',
    nameJa: '地域密着型（ビジュアル）',
    pages: 5,
    description: '地域商圏×SEO、写真・動画主役',
    repo: 'tenchan000517/template-leadgen-visual',
    branch: 'master'
  },
  {
    id: 'trust-visual',
    name: 'Trust Visual',
    nameJa: '信頼構築型（ビジュアル）',
    pages: 6,
    description: '社会的証明の最大化、写真・動画主役',
    repo: 'tenchan000517/template-trust-visual',
    branch: 'master'
  },
  {
    id: 'authority-minimal',
    name: 'Authority Minimal',
    nameJa: '権威性訴求（ミニマル）',
    pages: 8,
    description: '専門性・実績で説得、余白とタイポグラフィ',
    repo: 'tenchan000517/template-authority-minimal',
    branch: 'master'
  }
];

// ===== Claude Code指示文テンプレート =====
// テスト用に一時的に短いテンプレートを使用
const HP_CLAUDE_CODE_PROMPT_TEMPLATE_ORIGINAL = `# HP制作セットアップ指示書

## 概要
{{companyName}}のHP制作プロジェクトをセットアップしてください。

## 1. 企業ディレクトリ作成

\`{{companyNameEn}}/\` ディレクトリを作成し、以下の構造でファイルを配置：

\`\`\`
{{companyNameEn}}/
├── data/
│   ├── hearing.json      # ヒアリング抽出JSON
│   └── composition.md    # 構成案全文
├── HANDOFF.md            # 進捗管理・引き継ぎ用
└── （テンプレートファイル）
\`\`\`

## 2. テンプレートをコピー

\`\`\`bash
cp -r /mnt/c/sing-hp-template/* {{companyNameEn}}/
\`\`\`

※ /mnt/c/sing-hp-template/ が存在しない場合は、先にテンプレートをクローンしてください：
\`\`\`bash
gh repo clone anthropics/sing-hp-template /mnt/c/sing-hp-template
\`\`\`

## 3. hearing.json を作成

\`{{companyNameEn}}/data/hearing.json\` に以下を保存：

{{json}}

## 4. composition.md を作成

\`{{companyNameEn}}/data/composition.md\` に以下を保存：

{{composition}}

## 5. HANDOFF.md を作成

\`{{companyNameEn}}/HANDOFF.md\` に以下を保存：

---

# {{companyName}} HP制作 HANDOFF

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| 企業名 | {{companyName}} |
| 企業名（英語） | {{companyNameEn}} |
| 使用テンプレート | {{templateType}} |
| 作成日 | {{date}} |

## 企業基本情報

| 項目 | 内容 |
|------|------|
| 代表者 | （hearing.jsonから抽出） |
| 設立 | （hearing.jsonから抽出） |
| 所在地 | （hearing.jsonから抽出） |
| 電話番号 | （hearing.jsonから抽出） |
| 事業内容 | （hearing.jsonから抽出） |

## ロゴ

| 項目 | 内容 |
|------|------|
| ファイル一覧 | （未定の場合は「未定」と記載） |
| ヘッダー用 | ファイル名、サイズ（PC/SP） |
| フッター用 | ファイル名、サイズ |
| ファビコン用 | ファイル名 |
| カラー | ロゴの色、反転が必要な場面 |

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
| レイアウト | 3カラム等 |
| 背景色 | #XXXXXX |
| PC | 横並び配置 |
| SP | 縦並び配置 |

## ページ別セクション構成

### TOPページ
| セクション | 背景色 |
|-----------|--------|
| ヒーロー | 画像 |
| ... | ... |
| CTA | メインカラー |

（他ページも同様に記載）

## 素材ファイル

| 項目 | 内容 |
|------|------|
| 画像ディレクトリ | public/images/ |
| 画像一覧 | （ファイル名と用途） |
| 未撮影/未生成 | （必要だが未準備の素材） |

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
| data/hearing.json | ヒアリング抽出JSON |
| data/composition.md | 構成案全文（実装の詳細仕様） |
| SEO_LLMO_GUIDE.md | SEO・LLMO実装ガイド（最終フェーズで使用） |

## 実装状況

| ページ | 状態 | 備考 |
|--------|------|------|
| TOP | 未着手 | |
| 会社概要 | 未着手 | |
| サービス | 未着手 | |
| 採用情報 | 未着手 | |
| お問い合わせ | 未着手 | |

## 次にやること

1. data/composition.md を読んで全体像を把握
2. TOPページから実装開始
3. 実装中は data/hearing.json と照合して整合性を確認
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
cd {{companyNameEn}} && npm install
\`\`\`

## 7. 完了確認

セットアップ完了後、ディレクトリ構造を出力して確認してください。`;

// テスト用：短いテンプレート（問題切り分け用）
const HP_CLAUDE_CODE_PROMPT_TEMPLATE = `# テスト指示文

企業名: {{companyName}}
テンプレート: {{templateType}}
日付: {{date}}

## JSON
{{json}}

## 構成案
{{composition}}
`;

// ===== プロンプトシートからテンプレート取得 =====
/**
 * 構成案プロンプトテンプレートを取得
 * プロンプトシートに「構成案プロンプト」があればそちらを使用、なければデフォルト
 */
function hp_getCompositionPromptTemplate() {
  try {
    const prompt = hp_getPromptByName('構成案プロンプト');
    if (prompt && prompt.template) {
      return prompt.template;
    }
  } catch (e) {
    // プロンプトシートがない場合など
  }
  return HP_COMPOSITION_PROMPT_TEMPLATE;
}

/**
 * Claude Code指示文テンプレートを取得
 * ※プロンプトシートのテンプレートはエスケープ問題があるため、常にデフォルトを使用
 */
function hp_getClaudeCodePromptTemplate() {
  // プロンプトシートからの取得は無効化（バッククォート等のエスケープ問題があるため）
  // 将来的にはプロンプトシートのテンプレートを安全にエスケープする処理を追加
  return HP_CLAUDE_CODE_PROMPT_TEMPLATE_ORIGINAL;
}

// ===== メニュー追加（JSON出力と構成案作成を統合） =====
function hp_addCompositionMenu(ui) {
  ui.createMenu('4.📝 構成案作成')
    .addItem('📤 HP制作用JSON出力', 'hp_showJsonOutputDialog')
    .addSeparator()
    .addItem('📋 構成案プロンプト生成', 'hp_showCompositionPromptDialog')
    .addItem('🤖 Claude Code指示文生成', 'hp_showClaudeCodePromptDialog')
    .addSeparator()
    .addItem('🎨 カンプ分析プロンプト生成', 'hp_showKanpuAnalysisDialog')
    .addItem('🖼️ カンプ版 Claude Code指示文', 'hp_showKanpuClaudeCodeDialog')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'hp_showStatusUpdateDialog')
    .addToUi();
}

// ※ カンプ版の関数は compositionPromptKanpu.js に定義
// hp_showKanpuAnalysisDialog()
// hp_showKanpuClaudeCodeDialog()

// ===== 1. 構成案プロンプト生成ダイアログ =====
function hp_showCompositionPromptDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(hp_createCompositionPromptDialogHTML(sheetData))
    .setWidth(850)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 構成案プロンプト生成');
}

/**
 * 構成案プロンプトダイアログHTML
 */
function hp_createCompositionPromptDialogHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  // テンプレート一覧をJSON化
  const templateTypesJson = JSON.stringify(HP_TEMPLATE_TYPES)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/`/g, '\\`');
  // プロンプトシートから取得（なければデフォルト）
  const template = hp_getCompositionPromptTemplate();
  const templateEscaped = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  // 出力指示テンプレートはJSON.stringifyでエスケープ（バッククォート対策）
  const outputInstructionJson = JSON.stringify(HP_CLAUDE_CODE_OUTPUT_INSTRUCTION);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    .prompt-output {
      width: 100%;
      height: 380px;
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
      background: #e3f2fd;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #1565C0;
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
      font-size: 12px;
    }
    .step.active {
      background: #1565C0;
      color: white;
    }
    .step.done {
      background: #4CAF50;
      color: white;
    }
    .template-section {
      display: none;
      margin-top: 12px;
    }
    .template-section.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- ステップ表示 -->
  <div class="step-indicator">
    <div class="step active" id="step1">1. 企業選択</div>
    <div class="step" id="step2">2. プロンプト生成</div>
    <div class="step" id="step3">3. 外部AIに投げる</div>
  </div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📋 構成案プロンプト生成</h4>
    <p style="margin:0;">ヒアリングシートの内容（Part①②）をJSON形式で抽出し、構成案作成用のプロンプトを生成します。</p>
    <p style="margin:8px 0 0 0;color:#d32f2f;font-weight:bold;">⚠️ サーバー情報（Part③）は含まれません</p>
  </div>

  <!-- Claude Code用: 起動場所の案内 -->
  <div class="info-box" id="claudeCodeInfo" style="display:none; background:#e8f5e9; border-color:#81c784;">
    <h4 style="color:#2e7d32;">📍 Claude Code 起動場所</h4>
    <p style="margin:0;"><code style="background:#c8e6c9;padding:2px 6px;border-radius:4px;">client_hp/</code> でClaude Codeを起動してください</p>
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

  <!-- Claude Code用チェックボックス -->
  <div class="input-section" style="margin-top: 12px;">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
      <input type="checkbox" id="claudeCodeCheck" style="width: 18px; height: 18px; cursor: pointer;" onchange="toggleClaudeCodeInfo()">
      <span style="font-size: 14px; font-weight: 500;">🤖 Claude Codeで実行する（ファイル保存指示を追加）</span>
    </label>
    <div class="note" style="margin-top: 4px; margin-left: 26px;">チェックすると、出力先ディレクトリとファイル分割の指示がプロンプト末尾に追加されます</div>
  </div>

  <!-- テンプレート選択（Claude Code用チェック時のみ表示） -->
  <div class="template-section" id="templateSection">
    <div class="input-section">
      <span class="input-label">テンプレートを選択</span>
      <div class="company-select-wrapper">
        <div class="company-select-display" id="templateSelectDisplay" onclick="toggleTemplateDropdown()">
          <span class="placeholder">テンプレートを選択してください</span>
        </div>
        <div class="company-select-dropdown" id="templateSelectDropdown"></div>
      </div>
    </div>
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
  <pre class="prompt-output" id="promptOutput">（企業を選択して「プロンプト生成」をクリック）</pre>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    const template = \`${templateEscaped}\`;
    const outputInstruction = ${outputInstructionJson};
    const templateTypes = ${templateTypesJson};
    let selectedSheetName = '';
    let selectedCompanyName = '';
    let selectedTemplateType = '';
    let currentPrompt = '';

    window.onload = function() {
      initCompanyDropdown({
        sheets: sheetData.companySheets,
        activeSheetName: sheetData.activeSheetName,
        isActiveCompanySheet: sheetData.isActiveCompanySheet,
        onSelect: function(item, isActive) {
          selectedSheetName = item.sheetName;
          selectedCompanyName = item.companyName;
          document.getElementById('generateBtn').disabled = false;
          document.getElementById('promptOutput').textContent = '（「プロンプト生成」をクリックしてください）';
          document.getElementById('copyBtn').disabled = true;
          updateStep(1);
        }
      });
      initTemplateSelect();
    };

    function updateStep(step) {
      ['step1', 'step2', 'step3'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.className = 'step';
        if (i + 1 < step) el.className = 'step done';
        else if (i + 1 === step) el.className = 'step active';
      });
    }

    function toggleClaudeCodeInfo() {
      const isChecked = document.getElementById('claudeCodeCheck').checked;
      document.getElementById('claudeCodeInfo').style.display = isChecked ? 'block' : 'none';
      const section = document.getElementById('templateSection');
      if (isChecked) {
        section.classList.add('show');
      } else {
        section.classList.remove('show');
      }
    }

    function initTemplateSelect() {
      const dropdown = document.getElementById('templateSelectDropdown');
      dropdown.innerHTML = templateTypes.map(function(t) {
        var pagesText = t.pages > 0 ? t.pages + 'ページ' : 'カスタム';
        return '<div class="company-select-item" data-id="' + t.id + '" onclick="selectTemplate(\\'' + t.id + '\\')">' +
          '<span class="check-icon"></span>' +
          '<span class="company-name">' + t.nameJa + '</span>' +
          '<span style="color:#888;font-size:12px;margin-left:8px;">' + pagesText + '</span>' +
        '</div>';
      }).join('');
    }

    function toggleTemplateDropdown() {
      var display = document.getElementById('templateSelectDisplay');
      var dropdown = document.getElementById('templateSelectDropdown');
      var isOpen = dropdown.classList.contains('show');
      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectTemplate(id) {
      selectedTemplateType = id;
      var selected = templateTypes.find(function(t) { return t.id === id; });
      var display = document.getElementById('templateSelectDisplay');
      var pagesText = selected.pages > 0 ? selected.pages + 'ページ' : 'カスタム';
      display.innerHTML = '<span class="selected-check">✓</span>' +
        '<span class="selected-name">' + selected.nameJa + '</span>' +
        '<span style="color:#888;font-size:12px;margin-left:8px;">' + pagesText + '</span>';

      document.querySelectorAll('#templateSelectDropdown .company-select-item').forEach(function(el) {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      document.querySelectorAll('#templateSelectDropdown .company-select-item').forEach(function(el) {
        if (el.dataset.id === id) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });

      toggleTemplateDropdown();
    }

    function generatePrompt() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      const isClaudeCode = document.getElementById('claudeCodeCheck').checked;
      if (isClaudeCode && !selectedTemplateType) {
        showStatus('テンプレートを選択してください', 'error');
        return;
      }

      document.getElementById('generateBtn').disabled = true;
      document.getElementById('promptOutput').textContent = '⏳ 生成中...';

      google.script.run
        .withSuccessHandler(handleJsonResult)
        .withFailureHandler(handleError)
        .hp_extractCompositionData(selectedSheetName);
    }

    function handleJsonResult(result) {
      document.getElementById('generateBtn').disabled = false;

      if (!result.success) {
        document.getElementById('promptOutput').textContent = 'エラー: ' + result.error;
        showStatus(result.error, 'error');
        return;
      }

      const jsonStr = JSON.stringify(result.data, null, 2);

      // 選択ページをフォーマット
      let pagesStr = '指定なし（全ページ）';
      const selectedPages = result.selectedPages || [];
      if (selectedPages.length > 0) {
        pagesStr = selectedPages.map((p, i) => (i + 1) + '. ' + p).join('\\n');
      }

      currentPrompt = template
        .replace('{{json}}', jsonStr)
        .replace('{{pages}}', pagesStr);

      // Claude Code用チェックボックスがONの場合、出力指示を追加
      const isClaudeCode = document.getElementById('claudeCodeCheck').checked;
      if (isClaudeCode) {
        currentPrompt += buildOutputInstruction(result.companyName, selectedPages);
      }

      document.getElementById('promptOutput').textContent = currentPrompt;
      document.getElementById('copyBtn').disabled = false;
      updateStep(2);

      // 選択ページの情報も表示
      const pageInfo = selectedPages.length > 0
        ? '（' + selectedPages.length + 'ページ）'
        : '（ページ未設定）';
      let claudeCodeInfo = '';
      if (isClaudeCode) {
        const selectedTemplate = templateTypes.find(function(t) { return t.id === selectedTemplateType; });
        const templateName = selectedTemplate ? selectedTemplate.nameJa : '';
        claudeCodeInfo = ' + Claude Code出力指示（' + templateName + '）';
      }
      showStatus('✅ プロンプト生成完了（' + result.companyName + pageInfo + claudeCodeInfo + '）', 'success');
    }

    // 出力指示を構築
    function buildOutputInstruction(companyName, selectedPages) {
      // 企業名を英語表記に変換（簡易版：ひらがな・カタカナ・漢字をローマ字に変換は難しいので、入力を促す形にする）
      const companyNameEn = toEnglishName(companyName);

      // ページファイル一覧を生成
      const pageNameMap = {
        'TOP': 'top',
        'About': 'about',
        '会社概要': 'about',
        'Service': 'service',
        'サービス': 'service',
        '事業内容': 'service',
        'Recruit': 'recruit',
        '採用情報': 'recruit',
        '採用': 'recruit',
        'Contact': 'contact',
        'お問い合わせ': 'contact',
        'News': 'news',
        'お知らせ': 'news',
        'FAQ': 'faq',
        'よくある質問': 'faq',
        'Works': 'works',
        '実績': 'works',
        'Blog': 'blog',
        'ブログ': 'blog'
      };

      // ページ未選択時のデフォルト
      let pageFiles, pageStatusTable, commonPartsNum, photoGuideNum;

      if (selectedPages.length > 0) {
        pageFiles = selectedPages.map((page, i) => {
          const num = String(i + 1).padStart(2, '0');
          const pageName = pageNameMap[page] || page.toLowerCase().replace(/[^a-z0-9]/g, '');
          return '│       ├── ' + num + '_' + pageName + '.md';
        }).join('\\n');

        pageStatusTable = selectedPages.map(page => {
          return '| ' + page + ' | 未着手 | |';
        }).join('\\n   ');

        commonPartsNum = String(selectedPages.length + 1).padStart(2, '0');
        photoGuideNum = String(selectedPages.length + 2).padStart(2, '0');
      } else {
        // ページ未選択時: 構成案に基づいて生成するよう指示
        pageFiles = '│       ├── 01_top.md             # TOPページ\\n│       ├── 02_about.md           # 会社概要\\n│       ├── ...                   # （構成案のページ構成に従って作成）';
        pageStatusTable = '| TOP | 未着手 | |\\n   | 会社概要 | 未着手 | |\\n   | ... | 未着手 | （構成案に従って追加） |';
        commonPartsNum = 'XX';
        photoGuideNum = 'XX';
      }

      // 今日の日付
      const today = new Date();
      const dateStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      // テンプレート情報を取得
      const selectedTemplate = templateTypes.find(function(t) { return t.id === selectedTemplateType; });
      const templateName = selectedTemplate ? selectedTemplate.nameJa : selectedTemplateType;
      const templateRepo = selectedTemplate ? selectedTemplate.repo : 'tenchan000517/template-standard';

      return outputInstruction
        .replace(/{{companyName}}/g, companyName)
        .replace(/{{companyNameEn}}/g, companyNameEn)
        .replace('{{pageFiles}}', pageFiles)
        .replace('{{pageStatusTable}}', pageStatusTable)
        .replace('{{commonPartsNum}}', commonPartsNum)
        .replace('{{photoGuideNum}}', photoGuideNum)
        .replace(/{{templateType}}/g, templateName)
        .replace(/{{templateRepo}}/g, templateRepo)
        .replace(/{{date}}/g, dateStr);
    }

    // 企業名を英語表記に変換（簡易版）
    function toEnglishName(name) {
      // 既に英語の場合はそのまま
      if (/^[a-zA-Z0-9\\-_\\s]+$/.test(name)) {
        return name.toLowerCase().replace(/\\s+/g, '-');
      }
      // 日本語の場合は {{要入力}} として出力
      return '{{' + name + 'の英語表記を入力}}';
    }

    function copyPrompt() {
      if (!currentPrompt) {
        showStatus('先にプロンプトを生成してください', 'error');
        return;
      }
      copyToClipboard(currentPrompt);
      updateStep(3);
    }

    function handleError(error) {
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('promptOutput').textContent = 'エラー: ' + error.message;
      showStatus('エラー: ' + error.message, 'error');
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

// ===== 2. Claude Code指示文生成ダイアログ =====
function hp_showClaudeCodePromptDialog() {
  const sheetData = hp_getCompanySheetListForJsonOutput();

  const html = HtmlService.createHtmlOutput(hp_createClaudeCodePromptDialogHTML(sheetData))
    .setWidth(900)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '🤖 Claude Code指示文生成');
}

/**
 * Claude Code指示文ダイアログHTML
 */
function hp_createClaudeCodePromptDialogHTML(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  // HTMLに埋め込むため、</script>やバッククォートをエスケープ
  const templateTypesJson = JSON.stringify(HP_TEMPLATE_TYPES)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/`/g, '\\`');
  // プロンプトシートから取得（なければデフォルト）
  const template = hp_getClaudeCodePromptTemplate();
  const templateEscaped = template
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
      height: 280px;
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
    .composition-input {
      width: 100%;
      height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
    }
    .composition-input:focus {
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
    .template-select-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .template-option {
      padding: 8px 6px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: #fff;
    }
    .template-option:hover {
      border-color: #1565C0;
      background: #E3F2FD;
    }
    .template-option.selected {
      border-color: #1565C0;
      background: #E3F2FD;
    }
    .template-option .name {
      font-weight: bold;
      font-size: 11px;
      color: #333;
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .template-option .pages {
      font-size: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- ステップ表示 -->
  <div class="step-indicator">
    <div class="step active" id="step1">1. 企業選択</div>
    <div class="step" id="step2">2. テンプレート・構成案</div>
    <div class="step" id="step3">3. 指示文生成</div>
    <div class="step" id="step4">4. Claude Codeへ</div>
  </div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>🤖 Claude Code指示文生成</h4>
    <p style="margin:0;">外部AIで作成した構成案と、ヒアリングシートの内容を組み合わせて、Claude Code用のHP作成指示文を生成します。</p>
  </div>

  <!-- 起動場所の案内 -->
  <div class="info-box" style="background:#e8f5e9; border-color:#81c784;">
    <h4 style="color:#2e7d32;">📍 Claude Code 起動場所</h4>
    <p style="margin:0;"><code style="background:#c8e6c9;padding:2px 6px;border-radius:4px;">client_hp/</code> でClaude Codeを起動してください</p>
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

  <!-- テンプレート選択 -->
  <div class="input-section">
    <span class="input-label">テンプレートを選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="templateSelectDisplay" onclick="toggleTemplateDropdown()">
        <span class="placeholder">テンプレートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="templateSelectDropdown"></div>
    </div>
  </div>

  <!-- 構成案入力 -->
  <div class="input-section">
    <span class="input-label">構成案を貼り付け（外部AIの出力結果）</span>
    <textarea
      class="composition-input"
      id="compositionInput"
      placeholder="外部AIで生成した構成案をここに貼り付けてください..."
      oninput="checkInputs()"
    ></textarea>
    <div class="note">※ 構成案プロンプトの出力結果を貼り付けてください</div>
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
  <pre class="prompt-output" id="promptOutput">（企業・テンプレートを選択し、構成案を貼り付けて「指示文生成」をクリック）</pre>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetData = ${sheetDataJson};
    const template = \`${templateEscaped}\`;
    const templateTypes = ${templateTypesJson};
    let selectedSheetName = '';
    let selectedCompanyName = '';
    let selectedTemplateType = '';
    let currentInstruction = '';
    let jsonData = null;

    window.onload = function() {
      try {
        initCompanyDropdown({
          sheets: sheetData.companySheets,
          activeSheetName: sheetData.activeSheetName,
          isActiveCompanySheet: sheetData.isActiveCompanySheet,
          onSelect: function(item, isActive) {
            selectedSheetName = item.sheetName;
            selectedCompanyName = item.companyName;
            jsonData = null;
            checkInputs();
          }
        });
        console.log('initCompanyDropdown completed');
      } catch (e) {
        console.error('initCompanyDropdown error:', e);
      }
      try {
        initTemplateSelect();
        console.log('initTemplateSelect completed');
      } catch (e) {
        console.error('initTemplateSelect error:', e);
      }
    };

    function initTemplateSelect() {
      const dropdown = document.getElementById('templateSelectDropdown');
      dropdown.innerHTML = templateTypes.map(function(t) {
        var pagesText = t.pages > 0 ? t.pages + 'ページ' : 'カスタム';
        return '<div class="company-select-item" data-id="' + t.id + '" onclick="selectTemplate(\\'' + t.id + '\\')">' +
          '<span class="check-icon"></span>' +
          '<span class="company-name">' + t.nameJa + '</span>' +
          '<span style="color:#888;font-size:12px;margin-left:8px;">' + pagesText + '</span>' +
        '</div>';
      }).join('');
    }

    function toggleTemplateDropdown() {
      var display = document.getElementById('templateSelectDisplay');
      var dropdown = document.getElementById('templateSelectDropdown');
      var isOpen = dropdown.classList.contains('show');
      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function selectTemplate(id) {
      selectedTemplateType = id;
      var selected = templateTypes.find(function(t) { return t.id === id; });
      var display = document.getElementById('templateSelectDisplay');
      var pagesText = selected.pages > 0 ? selected.pages + 'ページ' : 'カスタム';
      display.innerHTML = '<span class="selected-check">✓</span>' +
        '<span class="selected-name">' + selected.nameJa + '</span>' +
        '<span style="color:#888;font-size:12px;margin-left:8px;">' + pagesText + '</span>';

      // ドロップダウン内の選択状態を更新
      document.querySelectorAll('#templateSelectDropdown .company-select-item').forEach(function(el) {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      document.querySelectorAll('#templateSelectDropdown .company-select-item').forEach(function(el) {
        if (el.dataset.id === id) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });

      toggleTemplateDropdown();
      checkInputs();
    }

    function updateStep(step) {
      ['step1', 'step2', 'step3', 'step4'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.className = 'step';
        if (i + 1 < step) el.className = 'step done';
        else if (i + 1 === step) el.className = 'step active';
      });
    }

    function checkInputs() {
      const hasCompany = !!selectedSheetName;
      const hasTemplate = !!selectedTemplateType;
      const hasComposition = !!document.getElementById('compositionInput').value.trim();

      document.getElementById('generateBtn').disabled = !(hasCompany && hasTemplate && hasComposition);

      if (hasCompany && hasTemplate && hasComposition) {
        updateStep(2);
      } else if (hasCompany) {
        updateStep(1);
      }
    }

    function generateInstruction() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      if (!selectedTemplateType) {
        showStatus('テンプレートを選択してください', 'error');
        return;
      }

      const composition = document.getElementById('compositionInput').value.trim();
      if (!composition) {
        showStatus('構成案を貼り付けてください', 'error');
        return;
      }

      document.getElementById('generateBtn').disabled = true;
      document.getElementById('promptOutput').textContent = '⏳ 生成中...';

      google.script.run
        .withSuccessHandler(function(result) {
          handleJsonResult(result, composition);
        })
        .withFailureHandler(handleError)
        .hp_extractJsonData(selectedSheetName);
    }

    // 企業名を英語表記に変換（簡易版）
    function toEnglishName(name) {
      // 既に英語の場合はそのまま
      if (/^[a-zA-Z0-9\\-_\\s]+$/.test(name)) {
        return name.toLowerCase().replace(/\\s+/g, '-');
      }
      // 日本語の場合は {{要入力}} として出力
      return '{{' + name + 'の英語表記を入力}}';
    }

    function handleJsonResult(result, composition) {
      document.getElementById('generateBtn').disabled = false;

      if (!result.success) {
        document.getElementById('promptOutput').textContent = 'エラー: ' + result.error;
        showStatus(result.error, 'error');
        return;
      }

      jsonData = result.data;
      const jsonStr = JSON.stringify(result.data, null, 2);

      // テンプレート名を取得（日本語名を優先）
      const selectedTemplate = templateTypes.find(t => t.id === selectedTemplateType);
      const templateName = selectedTemplate ? selectedTemplate.nameJa : selectedTemplateType;

      // 今日の日付を取得
      const today = new Date();
      const dateStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      // 企業名を英語表記に変換
      const companyNameEn = toEnglishName(result.companyName);

      currentInstruction = template
        .replaceAll('{{companyName}}', result.companyName)
        .replaceAll('{{companyNameEn}}', companyNameEn)
        .replaceAll('{{templateType}}', templateName)
        .replace('{{json}}', jsonStr)
        .replace('{{composition}}', composition)
        .replaceAll('{{date}}', dateStr);

      document.getElementById('promptOutput').textContent = currentInstruction;
      document.getElementById('copyBtn').disabled = false;
      updateStep(3);

      showStatus('✅ 指示文生成完了（' + result.companyName + ' / ' + templateName + '）', 'success');
    }

    function copyInstruction() {
      if (!currentInstruction) {
        showStatus('先に指示文を生成してください', 'error');
        return;
      }
      copyToClipboard(currentInstruction);
      updateStep(4);

      // 次ステップの案内を表示
      const companyNameEn = toEnglishName(selectedCompanyName);
      showStatus('✅ コピーしました！ → Claude Codeに貼り付けてください', 'success');
    }

    function handleError(error) {
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('promptOutput').textContent = 'エラー: ' + error.message;
      showStatus('エラー: ' + error.message, 'error');
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
