# Recruit Magazine テンプレート 実装 HANDOFF

**最終更新**: 2026-02-01
**ステータス**: ✅ Phase 3 完了（全ページ実装完了）

---

## 🎯 次世代セッションタスク

### 現在のフェーズ: 完了

**Recruit Magazine テンプレートの全8ページが実装完了**:
- TOP / People / Entry (Phase 1)
- Work / Recruit / FAQ (Phase 2)
- About / Culture (Phase 3)

---

## 📋 実装進捗

### Phase 1（必須）

| タスク | 状態 | 備考 |
|--------|------|------|
| template-fullorder クローン | ✅ 完了 | `/mnt/c/hp-template/template-recruit-magazine/` |
| site.json 構造実装 | ✅ 完了 | recruit セクション完全実装 |
| globals.css ブランドカラー設定 | ✅ 完了 | @theme 内のみ変更（ネイビーブルー系） |
| TOPページ | ✅ 完了 | 6セクション（ヒーロー、コンセプト、社員、数字、仕事、CTA） |
| Peopleページ | ✅ 完了 | 5セクション（ヒーロー、導入、インタビュー3名、クロストーク、CTA） |
| Entryページ | ✅ 完了 | 4セクション（3ステップフォーム） |
| GitHubプッシュ | ✅ 完了 | https://github.com/tenchan000517/template-recruit-magazine |
| GAS更新 | ✅ 完了 | HP_TEMPLATE_TYPES に追加 |

### Phase 2（重要）

| タスク | 状態 | 備考 |
|--------|------|------|
| Workページ | ✅ 完了 | 6セクション（ヒーロー、事業概要、職種紹介、1日の流れ、キャリアパス、CTA） |
| Recruitページ | ✅ 完了 | 6セクション（ヒーロー、職種サマリー、募集要項、選考フロー、FAQ誘導、CTA） |
| FAQページ | ✅ 完了 | 5セクション（ヒーロー、カテゴリナビ、FAQリスト展開表示、問い合わせ誘導、CTA） |

### Phase 3（充実）

| タスク | 状態 | 備考 |
|--------|------|------|
| Aboutページ | ✅ 完了 | 6セクション（ヒーロー、代表メッセージ、経営理念、沿革、会社概要、アクセス） |
| Cultureページ | ✅ 完了 | 7セクション（ヒーロー、福利厚生ハイライト、一覧、研修制度、ギャラリー、社員の声、CTA） |

### コンポーネント

| コンポーネント | 状態 | 使用ページ |
|---------------|------|-----------|
| InterviewCard | ✅ 完了 | People |
| EmployeeCard | ✅ 完了 | TOP |
| NumberBlock | ✅ 完了 | TOP |
| JobCard | ⬜ 未着手 | Work |
| TimelineHorizontal | ⬜ 未着手 | Work, Culture |
| QuoteBlock | ⬜ 未着手 | People, Culture |
| PhotoGallery | ⬜ 未着手 | Culture |
| BenefitHighlight | ⬜ 未着手 | Culture |
| RecruitmentCard | ⬜ 未着手 | Recruit |

---

## 📁 ファイル構造（目標）

```
template-recruit-magazine/
├── data/
│   └── site.json              # recruit セクション追加
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # TOP（6セクション）
│   │   ├── about/page.tsx     # 会社を知る
│   │   ├── work/page.tsx      # 仕事を知る
│   │   ├── people/page.tsx    # 社員を知る（核心）
│   │   ├── culture/page.tsx   # 働く環境
│   │   ├── recruit/page.tsx   # 募集要項
│   │   ├── entry/page.tsx     # エントリー
│   │   └── faq/page.tsx       # FAQ
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── InterviewCard.tsx  ★新規
│   │   ├── JobCard.tsx        ★新規
│   │   ├── NumberBlock.tsx    ★新規
│   │   ├── TimelineHorizontal.tsx ★新規
│   │   ├── QuoteBlock.tsx     ★新規
│   │   ├── PhotoGallery.tsx   ★新規
│   │   ├── BenefitHighlight.tsx ★新規
│   │   └── RecruitmentCard.tsx ★新規
│   └── lib/
│       └── site.ts
├── public/images/
└── globals.css                # @theme 内ブランドカラーのみ変更
```

---

## 🔧 技術スタック

- **Framework**: Next.js 16.x（App Router）
- **Styling**: Tailwind CSS 4.x
- **Animation**: Framer Motion 12.x
- **Image**: next/image
- **レスポンシブ**: PC優先、SP対応必須

---

## 📐 デザインルール

### カラー

```css
/* globals.css @theme 内で設定 */
--color-primary: /* クライアントに合わせて設定 */;
--color-primary-light: /* 10%明るく */;
--color-accent: /* 同系色 */;
```

### タイポグラフィ

```css
/* PC */
H1: 48px / line-height: 1.3
H2: 32px / line-height: 1.4
H3: 24px / line-height: 1.5
本文: 16px / line-height: 1.9

/* SP */
H1: 32px / H2: 24px / H3: 20px / 本文: 16px
```

### 余白

```
小: 40px（同一トピック内）
中: 80px（トピック切り替え）
大: 120px（章の切り替え）
特大: 160px（意図的な間）
```

### アニメーション

```tsx
// Fade Up（基本）
{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

// Stagger（連続）
container: { animate: { transition: { staggerChildren: 0.1 } } }
item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
```

---

## 📄 参照ドキュメント

| ドキュメント | パス |
|-------------|------|
| **設計仕様書（完全版）** | `docs/plans/hp-template-expansion/spec-recruit-magazine-full.md` |
| 設計仕様書（簡略版） | `docs/plans/hp-template-expansion/spec-recruit-magazine.md` |
| ワークフローガイド | `docs/plans/hp-template-expansion/00-template-creation-workflow.md` |
| テンプレート計画書 | `docs/plans/hp-template-expansion/02-template-matrix-plan.md` |

---

## ⚠️ 注意事項

### 禁止事項

1. **AIデザインの典型パターン禁止**
   - ❌ 全要素にカードコンテナ
   - ❌ 紫系グラデーション
   - ❌ 全セクションで同じ余白
   - ❌ 全要素にフェードインアニメーション

2. **コーディングルール**
   - globals.css の @theme ブロック内のブランドカラーのみ変更可
   - それ以外のglobals.css編集は禁止

3. **余白の均一化禁止**
   - 上下の余白は必ず異なる値にする
   - セクション内でも20px/40pxを使い分ける

### 重要ポイント

- **Peopleページが核心**: このテンプレートの存在意義
- **インタビューは構成を変える**: 全員同じレイアウトではNG
- **FAQはアコーディオンにしない**: 展開状態で表示

---

## 🚀 実装開始コマンド

```bash
# 1. template-fullorder をクローン
cd /mnt/c/hp-template/
cp -r /path/to/template-fullorder template-recruit-magazine

# 2. 作業ディレクトリに移動
cd template-recruit-magazine

# 3. 依存関係インストール
npm install

# 4. 開発サーバー起動（WSL2の場合）
npm run dev -- --webpack

# 5. ブラウザで確認
# http://localhost:3000
```

---

## 📝 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-01 | Phase 3 完了: About/Cultureページ実装、GitHubプッシュ。全8ページ実装完了 |
| 2026-02-01 | Phase 2 完了: Work/Recruit/FAQページ実装、GitHubプッシュ |
| 2026-02-01 | Phase 1 完了: TOP/People/Entry実装、GitHub公開、GAS更新 |
| 2026-02-01 | 初版作成: 設計仕様書完成、実装HANDOFF作成 |

---

## 💡 Recruit Magazine テンプレート完成

### 全Phase完了

**Phase 1 で完了したこと**:
- ✅ template-recruit-magazine リポジトリ作成・公開
- ✅ TOPページ（6セクション）
- ✅ Peopleページ（5セクション）
- ✅ Entryページ（3ステップフォーム）
- ✅ コンポーネント: NumberBlock, EmployeeCard, InterviewCard
- ✅ compositionPrompt.js 更新

**Phase 2 で完了したこと**:
- ✅ Workページ（6セクション）: ヒーロー、事業概要、職種紹介（左右交互）、1日の流れ（PC横/SP縦タイムライン）、キャリアパス、CTA
- ✅ Recruitページ（6セクション）: ヒーロー、職種サマリー（アンカーリンク）、募集要項（定義リスト形式）、選考フロー、FAQ誘導、CTA
- ✅ FAQページ（5セクション）: ヒーロー、カテゴリナビ（スティッキー）、FAQリスト（展開表示・非アコーディオン）、問い合わせ誘導、CTA

**Phase 3 で完了したこと**:
- ✅ Aboutページ（6セクション）: ヒーロー、代表メッセージ（引用符装飾・署名対応）、経営理念・ビジョン、沿革（中央縦線タイムライン・左右交互配置）、会社概要（定義リスト形式）、アクセス（Google Map埋め込みプレースホルダー）
- ✅ Cultureページ（7セクション）: ヒーロー、福利厚生ハイライト（制度 + 社員コメント）、全福利厚生一覧（カテゴリ別2カラム）、研修・教育制度（横向き/縦向きタイムライン）、オフィスギャラリー（不規則グリッド）、社員の声（引用 + 詳細リンク）、CTA

**全8ページ実装完了**:
- TOP（/）
- About（/about）
- Work（/work）
- People（/people）
- Culture（/culture）
- Recruit（/recruit）
- Entry（/entry）
- FAQ（/faq）

**リポジトリ**: https://github.com/tenchan000517/template-recruit-magazine

**開発環境**:
```bash
cd /mnt/c/hp-template/template-recruit-magazine
npm install
npm run dev -- --webpack
```

**参照ドキュメント**:
- 設計仕様書: `docs/plans/hp-template-expansion/spec-recruit-magazine-full.md`
