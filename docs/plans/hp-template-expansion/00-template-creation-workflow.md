# HPテンプレート作成ワークフローガイド

> 作成日: 2026-01-31
> 対象: 新規テンプレートプリセットの作成手順

---

## 概要

新しいHPテンプレートプリセットを作成し、GASに登録するまでの完全なワークフロー。

```
1. 専門家に諮問 → 2. 出力を整理 → 3. テンプレート作成 → 4. リポジトリ化 → 5. GAS更新
```

---

## STEP 1: 専門家に諮問

### 使用するプロンプト

新しいテンプレートのアイデアが必要な場合、以下のプロンプトを外部AI（Claude等）に投げる。

<details>
<summary>専門家諮問プロンプト（クリックで展開）</summary>

```markdown
# HP制作テンプレート拡充計画 - 専門家への諮問

## 現状のシステム概要

### HP制作フロー
1. **ヒアリングシート**（Googleスプレッドシート + GAS）でクライアント情報を収集
2. **構成案プロンプト**でAIに投げ、ページごとの詳細設計を作成
3. **Claude Code**でテンプレートをクローンし、構成案に基づいて実装
4. 完成したHPを納品

### 現在のテンプレート

| テンプレート | 特徴 | 用途 |
|-------------|------|------|
| **Standard** | 7ページ固定（TOP/会社概要/サービス/採用/お問い合わせ/お知らせ/プライバシー） | 標準的な企業HP |
| **Full Order** | ページなし、ナビゲーション動的読み込み、完全カスタム | 特殊な要件のHP |

### 技術スタック
- Next.js 16.x (App Router)
- React 19.x
- TypeScript
- Tailwind CSS 4.x
- Framer Motion（アニメーション）

### クライアント層
- 中小企業（製造業、建設業、サービス業など）
- 主な目的: コーポレートサイト、採用強化、問い合わせ獲得
- 予算帯: 中〜高価格帯

---

## 専門家への質問

以下の3人の専門家として、**HP制作に最適なテンプレートとして、あとどのようなバリエーションがあるとクライアントは100％満足するか**を提案してください。

### 👤 専門家① この道30年の世界最高峰のWEBマーケティングのプロ

**あなたの視点:**
- コンバージョンファネル設計
- 業種別のマーケティング戦略
- ユーザー行動分析に基づいたページ構成
- SEO・広告運用との連携
- ABテストで勝率の高いパターン

**質問:**
Standard（7ページ固定）とFull Order（完全カスタム）の間を埋めるテンプレートとして、どのようなバリエーションがあるとマーケティング成果を最大化できますか？

---

### 👤 専門家② 最先端の知識を持った日本の行動心理学の権威

**あなたの視点:**
- 認知バイアスと意思決定プロセス
- 信頼構築のメカニズム
- 行動喚起のトリガー
- 情報処理の負荷と最適化
- 日本人特有の心理傾向

**質問:**
ユーザーが「この会社に問い合わせたい」「ここで働きたい」と思うまでの心理プロセスを考慮したとき、どのような心理的アプローチに特化したテンプレートがあると効果的ですか？

---

### 👤 専門家③ 人間最強のWEBデザイナー

**あなたの視点:**
- トレンドからセオリーまで全てのデザインに意味を持たせる
- AIっぽいデザインとは全く違ったアプローチ
- レイアウト、コントラスト、アニメーション
- コンバージョン率の高いWEBサイトのデザイン法則

**質問:**
Standard（整然とした企業サイト）とFull Order（完全自由）の間を埋めるテンプレートとして、どのようなデザインアプローチのバリエーションがあると良いですか？

---

## 回答フォーマット

各専門家は以下の形式で回答してください：

### [専門家名]の提案

| テンプレート名 | ページ数 | 特徴 | 最適なクライアント |
|---------------|---------|------|------------------|
| ... | ... | ... | ... |

**テンプレート名: [名前]**
- **コンセプト**: なぜこのテンプレートが必要か
- **ページ構成**: どのページが含まれるか
- **特徴的な要素**: 他のテンプレートとの差別化ポイント
- **想定クライアント**: どのような企業に最適か
- **期待される効果**: このテンプレートを使うことで得られる成果

---

## 最終的なアウトプット

3人の専門家の意見を統合し、**優先度順に実装すべきテンプレート**をリストアップしてください。
```

</details>

---

## STEP 2: 各テンプレートの詳細仕様を取得

### STEP 1 で「どのテンプレートを作るか」が決まった後、各テンプレートの詳細設計を専門家に依頼する。

### 詳細仕様プロンプトの使い方

1. `prompt-template-detail-spec.md` をベースにプレースホルダーを埋める
2. 外部AI（Claude等）に投げる
3. 出力を `spec-{template-name}.md` として保存

### プロンプト一覧（全5件作成済み）

```
docs/plans/hp-template-expansion/
├── prompt-template-detail-spec.md      # プロンプトテンプレート（雛形）
├── prompt-01-recruit-magazine.md       # Recruit Magazine 用プロンプト ✅
├── prompt-02-local-visual.md           # Local Visual 用プロンプト ✅
├── prompt-03-leadgen-minimal.md        # LeadGen Minimal 用プロンプト ✅
├── prompt-04-trust-visual.md           # Trust Visual 用プロンプト ✅
└── prompt-05-authority-minimal.md      # Authority Minimal 用プロンプト ✅
```

### 詳細仕様の出力保存先

```
docs/plans/hp-template-expansion/
├── spec-recruit-magazine.md            # Recruit Magazine 詳細仕様
├── spec-local-visual.md                # Local Visual 詳細仕様
└── ...
```

---

## STEP 3: 専門家出力の整理

### ファイル構成

```
docs/plans/hp-template-expansion/
├── 00-template-creation-workflow.md  # このガイド
├── 01-expert-consultation-raw.md     # 専門家諮問の生出力（どのテンプレートを作るか）
├── 02-template-matrix-plan.md        # 整理した計画書
├── prompt-template-detail-spec.md    # 詳細仕様プロンプトテンプレート
├── prompt-01-recruit-magazine.md     # Recruit Magazine 用プロンプト
├── spec-recruit-magazine.md          # Recruit Magazine 詳細仕様（専門家出力）
└── ...
```

### 整理のポイント

専門家の出力を以下の2軸に分類する:

```
テンプレート = 型（Type） × 表現（Design）
```

**型（Type）** - 専門家①②の提案から抽出:
- 何を達成するか（目的・心理設計）
- どのようなページ構成が必要か
- どのような導線設計か

**表現（Design）** - 専門家③の提案から抽出:
- どう見せるか（デザインパターン）
- 余白、タイポグラフィ、アニメーション
- 業種との相性

### 命名規則

プリセット名は「型-表現」の形式:

| 型 | 表現 | プリセット名 |
|----|------|-------------|
| recruit | magazine | recruit-magazine |
| local | visual | local-visual |
| leadgen | minimal | leadgen-minimal |

---

## STEP 3: テンプレート作成

### ベーステンプレート

**全ての新規プリセットは `template-fullorder` をベースに作成する。**

理由:
- ナビゲーションが `site.json` から動的読み込み
- 固定ページなし → 型ごとに最適なページ構成を自由に定義
- Header/Footer が `site.navigation` 対応済み

### 作業ディレクトリ

```bash
# 作業場所
/mnt/c/hp-template/template-{preset-name}/

# 例
/mnt/c/hp-template/template-recruit-magazine/
```

### 作成手順

```bash
# 1. fullorderテンプレートをクローン
cd /mnt/c/hp-template
gh repo clone tenchan000517/template-fullorder template-{preset-name}

# 2. .git を削除して新規リポジトリ化
cd template-{preset-name}
rm -rf .git
git init

# 3. site.json を編集（ナビゲーション、ページ構成）
# 4. 各ページを作成（src/app/{page}/page.tsx）
# 5. デザインパターンに応じたスタイル調整
# 6. 動作確認
npm install
npm run dev
```

### site.json の完全テンプレート

template-standard の site.json を基本構造として使用:

```json
{
  "company": {
    "name": "",
    "nameShort": "",
    "nameEn": "",
    "id": "",
    "ceo": "",
    "established": "",
    "capital": "",
    "revenue": "",
    "employees": "",
    "business": "",
    "license": "",
    "catchphrase": "",
    "mission": ""
  },
  "contact": {
    "phone": "",
    "phoneFormatted": "",
    "phoneTel": "",
    "fax": "",
    "email": "",
    "hours": "",
    "recruitContact": ""
  },
  "locations": {
    "headquarters": {
      "name": "本社",
      "zipCode": "",
      "address": "",
      "access": "",
      "mapUrl": ""
    },
    "branches": []
  },
  "social": {
    "instagram": ""
  },
  "images": {
    "logo": "/images/logo.png",
    "logoSquare": "/images/logo-square.png",
    "logoOnly": "/images/logo-only.png"
  },
  "seo": {
    "titleSuffix": "",
    "defaultTitle": "",
    "defaultDescription": ""
  },
  "navigation": {
    "main": [
      { "label": "ページ名", "href": "/path" }
    ],
    "footer": [],
    "cta": { "label": "お問い合わせ", "href": "/contact" }
  },
  "stats": {},
  "history": [],
  "services": [],
  "works": [],
  "news": [],
  "recruit": {
    "catchphrase": "",
    "subCatchphrase": "",
    "data": [],
    "benefits": { "vacation": [], "allowances": [], "facilities": [] },
    "positions": {
      "highSchool": { "title": "", "items": [] },
      "midCareer": { "title": "", "items": [] }
    },
    "faq": [],
    "interviews": []
  },
  "ceo": {
    "name": "",
    "title": "",
    "image": "",
    "message": []
  }
}
```

### navigation の型別設定例

**Recruit Magazine（採用特化）:**
```json
"navigation": {
  "main": [
    { "label": "会社を知る", "href": "/about" },
    { "label": "仕事を知る", "href": "/work" },
    { "label": "社員を知る", "href": "/people" },
    { "label": "働く環境", "href": "/culture" },
    { "label": "募集要項", "href": "/recruit" },
    { "label": "エントリー", "href": "/entry" }
  ]
}
```

**Local Visual（地域密着）:**
```json
"navigation": {
  "main": [
    { "label": "サービス", "href": "/service" },
    { "label": "対応エリア", "href": "/area" },
    { "label": "施工事例", "href": "/works" },
    { "label": "会社概要", "href": "/about" },
    { "label": "お問い合わせ", "href": "/contact" }
  ]
}
```

### page.tsx の実装パターン（template-standard 準拠）

全ての page.tsx は以下の構造に従う:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { site, company, contact } from "@/lib/site";

// ============================================================
// 📝 ページ設定（構成案に基づいて編集してください）
// ============================================================
export const metadata: Metadata = {
  title: `ページ名｜${site.seo.titleSuffix || "企業サイト"}`,
  description: site.seo.defaultDescription || "ページの説明",
};

// ============================================================
// 📝 コンテンツデータ（構成案に基づいて編集してください）
// ============================================================

// セクション1のデータ
const SECTION1_DATA = {
  title: "タイトルを入力",
  description: "説明文を入力してください。",
};

// site.jsonで上書き可能なデータ（フォールバック）
const ITEMS_FALLBACK = [
  { label: "項目1", value: "値を入力" },
  { label: "項目2", value: "値を入力" },
];

// ============================================================
// コンポーネント
// ============================================================

function PageHeader() {
  return (
    <section className="relative h-[200px] lg:h-[300px] flex items-center justify-center">
      {/* ヘッダー実装 */}
    </section>
  );
}

function Section1() {
  return (
    <section className="py-[60px] lg:py-[100px] bg-white">
      {/* セクション実装 */}
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-[60px] lg:py-20 bg-navy">
      {/* CTA実装 */}
    </section>
  );
}

// ============================================================
// メインページ
// ============================================================
export default function PageName() {
  // site.jsonからデータ取得（あればそちら、なければフォールバック）
  const items = site.someData.length > 0 ? site.someData : ITEMS_FALLBACK;

  return (
    <>
      <PageHeader />
      <Section1 />
      {/* 他のセクション */}
      <CTASection />
    </>
  );
}
```

### データの優先順位ルール

```tsx
// site.json にデータがあればそちらを使用、なければフォールバック
const history = site.history.length > 0 ? site.history : HISTORY_FALLBACK;
const interviews = site.recruit.interviews.length > 0
  ? site.recruit.interviews
  : INTERVIEWS_FALLBACK;
```

### プレースホルダーテキストの書き方

| 項目 | 例 |
|------|-----|
| タイトル | `"タイトルを入力"` |
| 説明文 | `"説明文を入力してください。"` |
| 数値 | `"XX"` または具体的な仮数値 |
| 画像パス | `"/images/placeholder.jpg"` |

### 必須チェックリスト

- [ ] `site.json` のナビゲーションが正しく設定されている
- [ ] 全ページが作成されている
- [ ] 全 page.tsx が上記パターンに従っている
- [ ] コンテンツデータにプレースホルダーが設定されている
- [ ] site.json フォールバックが実装されている
- [ ] Header/Footer が `site.navigation` から読み込んでいる
- [ ] `npm run dev` でエラーなく起動する
- [ ] `npm run build` が成功する
- [ ] README.md がテンプレート用に更新されている

---

## STEP 4: リポジトリ化とプッシュ

### 命名規則

```
template-{type}-{design}
```

| プリセット | リポジトリ名 |
|-----------|-------------|
| Recruit Magazine | `template-recruit-magazine` |
| Local Visual | `template-local-visual` |
| LeadGen Minimal | `template-leadgen-minimal` |

### GitHubリポジトリ作成

```bash
# 1. 作業ディレクトリに移動
cd /mnt/c/hp-template/template-{preset-name}

# 2. 初期コミット
git add .
git commit -m "Initial commit: {Preset Name} template"

# 3. GitHubリポジトリ作成 & プッシュ
gh repo create tenchan000517/template-{preset-name} --public --source=. --push

# 4. Template Repository に設定（GitHub UI で設定）
# Settings → General → Template repository にチェック
```

### リポジトリ設定

| 項目 | 設定 |
|------|------|
| Visibility | Public |
| Template repository | ✅ 有効化 |
| Default branch | main または master |

---

## STEP 5: GAS更新（compositionPrompt.js）

### 更新箇所

`docs/gas/hp/compositionPrompt.js` の `HP_TEMPLATE_TYPES` 配列に追加:

```javascript
// ===== テンプレート一覧 =====
const HP_TEMPLATE_TYPES = [
  {
    id: 'standard',
    name: 'Standard',
    pages: 7,
    description: '企業HP標準テンプレート（7ページ固定）',
    repo: 'tenchan000517/template-standard',
    branch: 'master'
  },
  {
    id: 'fullorder',
    name: 'Full Order',
    pages: 0,
    description: 'フルオーダー（ページなし、完全カスタム）',
    repo: 'tenchan000517/template-fullorder',
    branch: 'master'
  },
  // ↓↓↓ ここに新規テンプレートを追加 ↓↓↓
  {
    id: 'recruit-magazine',
    name: 'Recruit Magazine',
    pages: 8,
    description: '採用特化×雑誌型（社員インタビュー重視）',
    repo: 'tenchan000517/template-recruit-magazine',
    branch: 'main',
    type: 'recruit',      // 型
    design: 'magazine'    // 表現
  },
  {
    id: 'local-visual',
    name: 'Local Visual',
    pages: 6,
    description: '地域密着×ビジュアル（製造・建設業向け）',
    repo: 'tenchan000517/template-local-visual',
    branch: 'main',
    type: 'local',
    design: 'visual'
  }
  // ...
];
```

### 各プロパティの説明

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `id` | 一意のID（ケバブケース） | `recruit-magazine` |
| `name` | 表示名 | `Recruit Magazine` |
| `pages` | ページ数（目安） | `8` |
| `description` | 説明文（ダイアログに表示） | `採用特化×雑誌型` |
| `repo` | GitHubリポジトリ（org/repo形式） | `tenchan000517/template-recruit-magazine` |
| `branch` | デフォルトブランチ | `main` |
| `type` | 型ID（オプション） | `recruit` |
| `design` | 表現ID（オプション） | `magazine` |

### GASへの反映

1. `compositionPrompt.js` を編集
2. スプレッドシートのApps Scriptエディタを開く
3. 該当ファイルの内容を更新
4. 保存（Ctrl+S）
5. ダイアログで新しいテンプレートが表示されることを確認

---

## チェックリスト（完了確認）

### テンプレート作成完了チェック

- [ ] fullorder をベースにクローン
- [ ] site.json のナビゲーション設定
- [ ] 全ページ作成（プレースホルダー可）
- [ ] npm run dev で動作確認
- [ ] npm run build で成功確認
- [ ] README.md 更新

### リポジトリ化完了チェック

- [ ] GitHubリポジトリ作成
- [ ] 命名規則に従っている（`template-{type}-{design}`）
- [ ] Template repository に設定
- [ ] 初期コミット & プッシュ完了

### GAS更新完了チェック

- [ ] HP_TEMPLATE_TYPES に追加
- [ ] スプレッドシートのGASに反映
- [ ] ダイアログで表示確認
- [ ] テンプレートクローンが正常に動作

### ドキュメント更新完了チェック

- [ ] HANDOFF.md の主要プリセット一覧を更新
- [ ] 計画書（02-template-matrix-plan.md）のステータス更新

---

## トラブルシューティング

### Q: fullorder をクローンしたが .git が残っている

```bash
rm -rf .git
git init
```

### Q: npm run dev でエラーが出る

```bash
# node_modules を削除して再インストール
rm -rf node_modules
npm install
```

### Q: GASを更新したがダイアログに反映されない

- ブラウザをリロード
- Apps Scriptエディタで保存（Ctrl+S）されているか確認
- スプレッドシートを開き直す

### Q: Template repository の設定方法がわからない

1. GitHubでリポジトリを開く
2. Settings タブをクリック
3. General セクションで「Template repository」にチェック

---

## 参照ファイル

| ファイル | 内容 |
|---------|------|
| `docs/gas/hp/compositionPrompt.js` | GAS本体（テンプレート選択UI） |
| `docs/plans/hp-template-expansion/01-expert-consultation-raw.md` | 専門家諮問の生出力 |
| `docs/plans/hp-template-expansion/02-template-matrix-plan.md` | 計画書（型×表現マトリクス） |
| `/mnt/c/hp-template/` | テンプレート作業ディレクトリ |
