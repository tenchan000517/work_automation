# HP制作テンプレート拡充計画書

> 作成日: 2026-01-31
> ステータス: 計画中
> 参照: `01-expert-consultation-raw.md`（専門家諮問の生出力）

---

## 設計方針

### 核心的な気づき

```
テンプレート = 型（目的・心理設計） × 表現（デザインパターン）
```

専門家①②が「何を達成するか」を決め、専門家③が「どう見せるか」を決める。
この2軸のマトリクスで管理することで、テンプレート数の爆発を防ぎつつ柔軟性を確保する。

---

## 型（Type）一覧

専門家①（マーケティング）と専門家②（心理学）の提案を統合・整理。

| ID | 型名 | 本質 | ページ構成の特徴 | 主要クライアント |
|----|------|------|-----------------|----------------|
| `recruit` | Recruit | 求職者の意思決定プロセス対応 | 会社を知る/仕事を知る/社員を知る/募集要項 | 採用難の中小企業 |
| `leadgen` | Lead Gen | CV最短ルート設計 | LP型TOP/サービス/事例/CTA重視 | 問い合わせ獲得優先の企業 |
| `trust` | Trust Builder | 社会的証明の最大化 | 選ばれる理由/実績/お客様の声重視 | 知名度低い・新規参入企業 |
| `local` | Local Business | 地域商圏×SEO | 対応エリア/施工事例/MEO対策 | 建設業・製造業・士業 |
| `authority` | Authority | 専門性・実績で説得 | 事例詳細/コラム/代表メッセージ | 高単価サービス・コンサル |

---

## 表現（Design Pattern）一覧

専門家③（デザイン）の提案を整理。

| ID | 表現名 | 特徴 | CSS/UIの特徴 | 最適な業種 |
|----|--------|------|-------------|-----------|
| `visual` | Visual Impact | 写真・動画主役、テキスト最小 | 全画面ビジュアル、グリッド崩し | 製造業・建設業・飲食 |
| `minimal` | Minimal Pro | 余白とタイポグラフィで勝負 | 余白率40%+、モノトーン基調 | 設計事務所・デザイン会社 |
| `dynamic` | Dynamic Flow | アニメーション・インタラクション | パララックス、カーソル追従 | IT企業・先進的企業 |
| `magazine` | Magazine | 読ませるエディトリアル | 段組み、プルクォート、長文対応 | 採用重視・ブランディング |

---

## マトリクス：型 × 表現

全ての組み合わせが有効ではない。下表で「◎」は特に相性が良い、「○」は有効、「-」は非推奨。

|  | Visual | Minimal | Dynamic | Magazine |
|--|--------|---------|---------|----------|
| **Recruit** | ○ 現場を見せる | - | ○ 先進的イメージ | ◎ インタビュー重視 |
| **Lead Gen** | ○ インパクト重視 | ◎ 高単価向け | ○ IT系向け | - |
| **Trust** | ○ 実績を見せる | - | - | ○ 事例詳細 |
| **Local** | ◎ 施工事例 | - | - | - |
| **Authority** | ○ 実績ビジュアル | ◎ 高級感 | - | ○ コラム重視 |

---

## 主要プリセット（優先実装）

マトリクスから「よく使う組み合わせ」を5つプリセットとして定義。

### プリセット一覧

| 優先度 | プリセット名 | 型 | 表現 | 用途 |
|-------|-------------|-----|-----|------|
| 1 | **Recruit Magazine** | Recruit | Magazine | 採用特化サイト（社員インタビュー重視） |
| 2 | **Local Visual** | Local | Visual | 地域密着×施工事例（製造・建設業向け） |
| 3 | **LeadGen Minimal** | Lead Gen | Minimal | 高単価CV特化（コンサル・BtoB向け） |
| 4 | **Trust Visual** | Trust | Visual | 信頼構築×実績（新規参入企業向け） |
| 5 | **Authority Minimal** | Authority | Minimal | 権威構築×高級感（専門サービス向け） |

---

## プリセット詳細設計

### 1. Recruit Magazine（採用特化 × 読ませる）

**コンセプト**: 求職者が「この会社で働きたい」と思うまでの心理プロセスを、雑誌を読むように追体験させる。

**ページ構成**:
1. TOP - 採用メッセージ + 社員の笑顔
2. About - 会社を知る（理念、歴史、数字で見る）
3. Work - 仕事を知る（職種紹介、1日の流れ）
4. People - 社員を知る（インタビュー3-5名）
5. Culture - 働く環境（福利厚生、研修、オフィス）
6. Recruit - 募集要項（職種別詳細）
7. Entry - エントリーフォーム
8. FAQ - よくある質問

**表現の特徴**:
- 雑誌のような見出しタイポグラフィ
- 写真とテキストの有機的なレイアウト
- インタビューは引用ブロック＋大きな写真
- スクロールで読み進める長編コンテンツ

**実装優先度**: ★★★★★（最優先）
- 理由: 中小企業の最大課題は人材確保。現行Standardでは採用ページが弱い。

---

### 2. Local Visual（地域密着 × ビジュアル重視）

**コンセプト**: 「地域名+業種」で検索してきた見込み客に、写真で信頼感を与え、すぐに問い合わせさせる。

**ページ構成**:
1. TOP - 全画面ビジュアル + 地域名 + 実績数字
2. Service - サービス一覧（写真メイン）
3. Area - 対応エリア（地図＋地域名リスト）
4. Works - 施工事例（Before/After、ギャラリー）
5. About - 会社概要（地域との関わり）
6. Contact - お問い合わせ（電話番号大きく）

**表現の特徴**:
- ファーストビュー全画面写真
- 施工事例はグリッドギャラリー
- Before/After比較スライダー
- Googleマップ埋め込み最適化
- 電話番号は追従表示

**実装優先度**: ★★★★★（最優先）
- 理由: 建設業・製造業クライアントが多い。写真素材があれば即展開可能。

---

### 3. LeadGen Minimal（CV特化 × ミニマル）

**コンセプト**: 高単価サービスのCV特化。余白を贅沢に使い、高級感と信頼感を演出しながら、最短でCVへ導く。

**ページ構成**:
1. TOP（LP型）- 課題提起 → 解決策 → CTA
2. Service - サービス詳細（選ばれる理由）
3. Case - 事例紹介（課題→解決→成果）
4. Contact - お問い合わせ（シンプルなフォーム）
5. Privacy - プライバシーポリシー

**表現の特徴**:
- 余白率40%以上
- モノトーン基調 + アクセント1色
- CTAは各セクション末尾に配置
- フローティングCTA（画面下部固定）
- フォーム項目は最小限

**実装優先度**: ★★★★☆
- 理由: BtoB・コンサル向け。汎用性高く、Standardからの派生で効率的に開発可能。

---

### 4. Trust Visual（信頼構築 × ビジュアル）

**コンセプト**: 知名度の低い企業が、写真と数字で信頼を勝ち取る。社会的証明を全面展開。

**ページ構成**:
1. TOP - 実績数字 + 取引先ロゴ + お客様の声
2. Why - 選ばれる理由（具体的な数字）
3. Works - 実績紹介（写真ギャラリー）
4. Voice - お客様の声（写真付き、詳細）
5. About - 会社概要（資格・認証バッジ）
6. Service - サービス一覧
7. Contact - お問い合わせ

**表現の特徴**:
- ファーストビュー直下に実績数字（カウントアップ）
- 取引先ロゴをスライダー表示
- お客様の声は顔写真＋具体的コメント
- 資格・認証バッジをグリッド表示

**実装優先度**: ★★★★☆
- 理由: 新規クライアントに最初に提案しやすい。信頼構築のテンプレートとして汎用性高い。

---

### 5. Authority Minimal（権威構築 × ミニマル）

**コンセプト**: 専門性で勝負する企業向け。余白と洗練されたデザインで高級感を演出し、価格競争から脱却。

**ページ構成**:
1. TOP - キャッチコピー + シンプルなビジュアル
2. Philosophy - 理念・代表メッセージ
3. Service - サービス詳細（深掘り）
4. Case - 事例詳細（課題→解決→成果）
5. Column - 専門コラム（ブログ機能）
6. Team - チーム紹介
7. About - 会社概要
8. Contact - お問い合わせ
9. Privacy - プライバシーポリシー

**表現の特徴**:
- 余白率40%以上
- フォントサイズの大胆な強弱
- モノトーン + アクセント1色
- 横書きと縦書きの混在（日本語の美しさ）
- コラムは読みやすいタイポグラフィ

**実装優先度**: ★★★☆☆
- 理由: 高単価クライアント向け。設計事務所・コンサル等、特定の業種に刺さる。

---

## 実装ロードマップ

### Phase 1（2週間）- 最優先プリセット

| タスク | 成果物 | 担当 |
|--------|--------|------|
| Recruit Magazine テンプレート作成 | `template-recruit-magazine` リポジトリ | - |
| Local Visual テンプレート作成 | `template-local-visual` リポジトリ | - |
| GAS テンプレート選択UI更新 | `compositionPrompt.js` 更新 | - |

### Phase 2（1週間）- 次点プリセット

| タスク | 成果物 | 担当 |
|--------|--------|------|
| LeadGen Minimal テンプレート作成 | `template-leadgen-minimal` リポジトリ | - |
| Trust Visual テンプレート作成 | `template-trust-visual` リポジトリ | - |

### Phase 3（1週間）- 拡充

| タスク | 成果物 | 担当 |
|--------|--------|------|
| Authority Minimal テンプレート作成 | `template-authority-minimal` リポジトリ | - |
| 構成案プロンプト更新（型×表現対応） | `compositionPrompt.js` 更新 | - |

---

## 技術的な実装方針

### ベーステンプレート

**全ての新規プリセットは `template-fullorder` をベースに作成する。**

理由:
- ナビゲーションが `site.json` から動的読み込み → ページ構成の柔軟性
- 固定ページなし → 型ごとに最適なページ構成を自由に定義
- Header/Footer が `site.navigation` 対応済み → 統一性維持
- 既存の Standard（7ページ固定）との差別化が明確

```
template-fullorder（ベース）
    ↓ clone & customize
├── template-recruit-magazine
├── template-local-visual
├── template-leadgen-minimal
├── template-trust-visual
└── template-authority-minimal
```

### リポジトリ構造

```
GitHub
├── template-standard          # 既存: 7ページ固定（従来型）
├── template-fullorder         # 既存: フルオーダー ★ベーステンプレート
├── template-recruit-magazine  # 新規: 採用特化×雑誌型
├── template-local-visual      # 新規: 地域密着×ビジュアル
├── template-leadgen-minimal   # 新規: CV特化×ミニマル
├── template-trust-visual      # 新規: 信頼構築×ビジュアル
└── template-authority-minimal # 新規: 権威構築×ミニマル
```

### 共通コンポーネント

全テンプレートで共通して使用するコンポーネントを抽出:

- `Header` / `Footer` - site.json連携
- `CTA` - フローティング対応
- `ContactForm` - バリデーション込み
- `ImageGallery` - グリッド/スライダー切り替え
- `CountUp` - 数字カウントアップ
- `Testimonial` - お客様の声

### GAS更新内容

`compositionPrompt.js` の `HP_TEMPLATE_TYPES` を更新:

```javascript
const HP_TEMPLATE_TYPES = [
  { id: 'standard', name: 'Standard', type: null, design: null, pages: 7, repo: 'tenchan000517/template-standard' },
  { id: 'fullorder', name: 'Full Order', type: null, design: null, pages: 0, repo: 'tenchan000517/template-fullorder' },
  { id: 'recruit-magazine', name: 'Recruit Magazine', type: 'recruit', design: 'magazine', pages: 8, repo: 'tenchan000517/template-recruit-magazine' },
  { id: 'local-visual', name: 'Local Visual', type: 'local', design: 'visual', pages: 6, repo: 'tenchan000517/template-local-visual' },
  { id: 'leadgen-minimal', name: 'LeadGen Minimal', type: 'leadgen', design: 'minimal', pages: 5, repo: 'tenchan000517/template-leadgen-minimal' },
  { id: 'trust-visual', name: 'Trust Visual', type: 'trust', design: 'visual', pages: 7, repo: 'tenchan000517/template-trust-visual' },
  { id: 'authority-minimal', name: 'Authority Minimal', type: 'authority', design: 'minimal', pages: 9, repo: 'tenchan000517/template-authority-minimal' }
];
```

---

## 成功指標

| 指標 | 目標 |
|------|------|
| テンプレート選択時の提案精度 | クライアントの業種・目的から最適なテンプレートを1発で提案できる |
| 開発効率 | 新規HP制作の初期セットアップが30分以内 |
| クライアント満足度 | 「選択肢が明確で選びやすい」というフィードバック |
| カバー率 | クライアントの95%以上のニーズをプリセットでカバー |

---

## 次のアクション

1. [ ] Phase 1 のテンプレート作成開始
2. [ ] 各プリセットのワイヤーフレーム作成
3. [ ] 既存の中部建設HPを `Local Visual` の参考実装として活用
4. [ ] 構成案プロンプトに型×表現の選択肢を追加
