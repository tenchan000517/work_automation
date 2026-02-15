# No.11 SEO設定（GA4・サーチコンソール・サイトマップ）

HP納品後の運用フェーズで実施するSEO設定マニュアルです。
Google Analytics 4（GA4）とGoogle Search Consoleの設定、サイトマップの登録、URL検査を行います。

---

## 基本情報

| 項目 | 内容 |
|------|------|
| 担当者 | 河合 |
| 実施タイミング | No.9 納品完了後（本番公開後） |
| 使用ツール | Google Analytics, Google Search Console, ターミナル |
| 成果物 | GA4設定完了, サーチコンソール連携, サイトマップ登録 |
| 次工程 | No.10 月次FB（継続運用） |

---

## 目的

- HPのアクセス解析を可能にする（GA4）
- 検索エンジンにサイトを正しく認識させる（サーチコンソール）
- 検索結果への表示を促進する（サイトマップ・URL検査）

---

## フロー概要

```
【STEP 1】GA4設定
    ↓ Googleアナリティクスでプロパティ作成
測定ID（G-XXXXXXX）を取得
    ↓ Next.jsに実装
GA4タグ設置完了
    ↓

【STEP 2】サーチコンソール設定
    ↓ Google Search Consoleでプロパティ追加
所有権確認
    ↓

【STEP 3】サイトマップ設定
    ↓ Next.jsでsitemap.xml生成
サーチコンソールにサイトマップ送信
    ↓

【STEP 4】URL検査・インデックス登録
    ↓ 各ページのURL検査
インデックス登録リクエスト
    ↓
完了
```

---

## STEP 1: GA4（Google Analytics 4）の設定

### 1-1. GA4アカウント・プロパティの作成

#### 新規作成の場合

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. Googleアカウントでログイン
3. 左下の **歯車アイコン（管理）** をクリック

![GA4管理画面](/images/hp/seo/ga4-admin.png)

4. **「＋ プロパティを作成」** をクリック

#### プロパティ設定

| 項目 | 入力内容 |
|------|---------|
| プロパティ名 | 企業名（例：株式会社○○ HP） |
| レポートのタイムゾーン | 日本 |
| 通貨 | 日本円（JPY） |

5. **「次へ」** をクリック

#### ビジネスの詳細

| 項目 | 選択内容 |
|------|---------|
| 業種 | 該当する業種を選択 |
| ビジネスの規模 | 該当するものを選択 |

6. **「次へ」** → **「作成」** をクリック

#### データストリームの設定

7. **「ウェブ」** を選択
8. 以下を入力：

| 項目 | 入力内容 |
|------|---------|
| ウェブサイトのURL | `https://www.example.com`（本番URL） |
| ストリーム名 | 企業名 HP |

9. **「ストリームを作成」** をクリック

### 1-2. 測定IDの取得

ストリーム作成後、以下の画面が表示されます：

![GA4測定ID](/images/hp/seo/ga4-measurement-id.png)

**測定ID** が表示されます（例：`G-ABC123XYZ`）

> ⚠️ **重要:** この測定IDをメモしておいてください。Next.jsへの実装で使用します。

### 1-3. Next.jsへのGA4実装

#### 方法A: @next/third-parties を使用（推奨・Next.js 14以降）

1. パッケージをインストール

```bash
npm install @next/third-parties
```

2. `app/layout.tsx` を編集

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXX" />  {/* ← 測定IDを設定 */}
    </html>
  )
}
```

#### 方法B: 環境変数を使用（複数環境対応）

1. `.env.local` を作成（または編集）

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
```

2. `app/layout.tsx` を編集

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ja">
      <body>{children}</body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  )
}
```

3. **Vercelにデプロイする場合**: Vercel管理画面で環境変数を設定

   - Settings → Environment Variables
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXX`

### 1-4. GA4の拡張計測機能の確認

SPAサイト（Next.js）では、ページ遷移が正しく計測されるよう設定を確認します。

1. GA4管理画面 → **「データの収集と修正」** → **「データストリーム」**
2. 該当ストリームをクリック
3. **「拡張計測機能」** の歯車アイコンをクリック
4. **「ページビュー数」** の項目で以下を確認：
   - ✅ **「ブラウザの履歴イベントに基づくページの変更」** にチェックが入っている

![GA4拡張計測機能](/images/hp/seo/ga4-enhanced-measurement.png)

> ⚠️ このチェックがないと、初回アクセスページのみ計測され、ページ遷移が計測されません。

### 1-5. 動作確認

1. HPにアクセス
2. GA4管理画面 → **「レポート」** → **「リアルタイム」**
3. 自分のアクセスが表示されればOK

---

## STEP 2: Google Search Console の設定

### 2-1. サーチコンソールへのアクセス

1. [Google Search Console](https://search.google.com/search-console/) にアクセス
2. Googleアカウントでログイン

### 2-2. プロパティの追加

1. 左上のプロパティ選択 → **「＋ プロパティを追加」** をクリック

![サーチコンソール プロパティ追加](/images/hp/seo/gsc-add-property.png)

2. **「URLプレフィックス」** を選択（推奨）

| プロパティタイプ | 説明 |
|----------------|------|
| ドメイン | サブドメイン含む全体を管理（DNS設定が必要） |
| URLプレフィックス | 特定URLのみ管理（簡単） |

3. URLを入力（例：`https://www.example.com`）
4. **「続行」** をクリック

### 2-3. 所有権の確認

複数の確認方法がありますが、**HTMLタグ** または **Google Analytics** が簡単です。

#### 方法A: HTMLタグ（推奨）

1. 表示されたメタタグをコピー
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXXX" />
   ```

2. Next.jsの `app/layout.tsx` に追加

```tsx
export const metadata = {
  verification: {
    google: 'XXXXXXXXXXXXXXX',  // ← contentの値のみ
  },
}
```

または `app/layout.tsx` の `<head>` 内に直接追加：

```tsx
<head>
  <meta name="google-site-verification" content="XXXXXXXXXXXXXXX" />
</head>
```

3. デプロイ後、サーチコンソールで **「確認」** をクリック

#### 方法B: Google Analytics（GA4設定済みの場合）

GA4が既に設定されている場合、自動的に所有権が確認されることがあります。

1. 確認方法として **「Google アナリティクス」** を選択
2. **「確認」** をクリック

### 2-4. 所有権確認完了

「所有権を確認しました」と表示されれば完了です。

![サーチコンソール 所有権確認完了](/images/hp/seo/gsc-verified.png)

---

## STEP 3: サイトマップの設定

### 3-1. Next.jsでサイトマップを生成

#### 方法A: App Router の組み込み機能（推奨）

`app/sitemap.ts` を作成：

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.example.com'  // ← 本番URLに変更

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recruit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // 他のページも追加
  ]
}
```

#### 方法B: next-sitemap パッケージを使用

1. パッケージをインストール

```bash
npm install next-sitemap
```

2. `next-sitemap.config.js` を作成（プロジェクトルート）

```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.example.com',  // ← 本番URLに変更
  generateRobotsTxt: true,
  generateIndexSitemap: false,  // 小規模サイトはfalse
}
```

3. `package.json` にスクリプト追加

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

4. ビルド実行

```bash
npm run build
```

→ `public/sitemap.xml` と `public/robots.txt` が生成されます

### 3-2. サイトマップの確認

ブラウザで `https://www.example.com/sitemap.xml` にアクセスし、XMLが表示されることを確認。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com</loc>
    <lastmod>2026-02-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1</priority>
  </url>
  ...
</urlset>
```

### 3-3. サーチコンソールにサイトマップを送信

1. Google Search Console を開く
2. 左メニュー → **「サイトマップ」** をクリック
3. **「新しいサイトマップの追加」** に `sitemap.xml` と入力
4. **「送信」** をクリック

![サーチコンソール サイトマップ送信](/images/hp/seo/gsc-sitemap-submit.png)

### 3-4. 送信結果の確認

| ステータス | 説明 |
|-----------|------|
| 成功 | サイトマップが正常に処理された |
| 取得できませんでした | URLが間違っているか、アクセスできない |
| 1件のエラー | XMLの形式エラーなど |

> 💡 「成功」と表示されても、インデックスには1〜2週間かかることがあります。

---

## STEP 4: URL検査・インデックス登録

### 4-1. URL検査ツールの使い方

1. Google Search Console を開く
2. 上部の検索バーに **確認したいURLを入力** してEnter

![サーチコンソール URL検査](/images/hp/seo/gsc-url-inspection.png)

### 4-2. 検査結果の見方

| ステータス | 意味 | 対応 |
|-----------|------|------|
| URLはGoogleに登録されています | インデックス済み | 対応不要 |
| URLがGoogleに登録されていません | 未インデックス | インデックス登録をリクエスト |
| URL は Google に登録されていますが問題があります | 問題あり | 詳細を確認して修正 |

### 4-3. インデックス登録のリクエスト

1. URL検査結果画面で **「インデックス登録をリクエスト」** をクリック
2. 「インデックス登録をリクエスト済み」と表示されればOK

![サーチコンソール インデックス登録リクエスト](/images/hp/seo/gsc-index-request.png)

### 4-4. 各ページのインデックス登録

以下の主要ページについて、順番にURL検査とインデックス登録を実施します：

| ページ | URL |
|--------|-----|
| トップページ | `https://www.example.com/` |
| 会社概要 | `https://www.example.com/about` |
| サービス | `https://www.example.com/service` |
| 採用情報 | `https://www.example.com/recruit` |
| お問い合わせ | `https://www.example.com/contact` |
| プライバシーポリシー | `https://www.example.com/privacy` |

### 4-5. 注意事項

- **1日の上限あり**: インデックス登録リクエストには1日の上限があります
- **反映までの時間**: 数分〜数時間（長い場合は1〜2週間）
- **同じURLの再リクエスト**: 何度リクエストしても早くはなりません
- **大量のURL**: サイトマップ送信で対応（個別リクエストは不要）

---

## 完了チェックリスト

### GA4設定

- [ ] GA4アカウント・プロパティを作成した
- [ ] 測定ID（G-XXXXXXX）を取得した
- [ ] Next.jsにGoogleAnalyticsコンポーネントを実装した
- [ ] 拡張計測機能の「ブラウザの履歴イベント」を確認した
- [ ] リアルタイムレポートで動作確認した

### サーチコンソール設定

- [ ] プロパティを追加した（URLプレフィックス）
- [ ] 所有権を確認した
- [ ] GA4とサーチコンソールを連携した（任意）

### サイトマップ設定

- [ ] Next.jsでsitemap.tsを作成した
- [ ] /sitemap.xml にアクセスしてXMLを確認した
- [ ] サーチコンソールでサイトマップを送信した
- [ ] 「成功」ステータスを確認した

### URL検査

- [ ] 主要ページのURL検査を実施した
- [ ] 未インデックスのページはリクエストを送信した

---

## トラブルシューティング

### Q: GA4でデータが表示されない

**確認事項:**
1. 測定IDが正しいか確認
2. デプロイが完了しているか確認
3. ブラウザの広告ブロッカーが無効か確認
4. 本番環境にアクセスしているか確認（localhost不可）

### Q: サーチコンソールで所有権確認ができない

**確認事項:**
1. メタタグが正しく設置されているか確認
2. デプロイが完了しているか確認
3. URLが正確か確認（www有無、https/http）

### Q: サイトマップが「取得できませんでした」になる

**確認事項:**
1. `/sitemap.xml` にブラウザでアクセスできるか確認
2. robots.txt でブロックされていないか確認
3. XMLの形式が正しいか確認

### Q: インデックス登録されない

**確認事項:**
1. robots.txt で `Disallow` されていないか確認
2. メタタグで `noindex` が設定されていないか確認
3. ページが正常に表示されるか確認
4. 1〜2週間待つ（時間がかかる場合がある）

---

## 関連リソース

### 公式ドキュメント

| リソース | URL |
|---------|-----|
| GA4 ヘルプ | https://support.google.com/analytics/ |
| Search Console ヘルプ | https://support.google.com/webmasters/ |
| Next.js Metadata | https://nextjs.org/docs/app/api-reference/file-conventions/metadata |

### 参考リンク

| 内容 | URL |
|------|-----|
| Next.js GA4設定 | https://nextjs.org/docs/messages/next-script-for-ga |
| サイトマップ生成 | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-15 | マニュアル新規作成 |
