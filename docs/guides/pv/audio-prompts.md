# アニメPV 音声プロンプト集

## 概要

| 要素 | 生成AI | 時間 |
|------|--------|------|
| BGM（インスト） | SUNO | 0-15秒 |
| 歌詞付き楽曲 | SUNO | 15-45秒 |
| ナレーション | FISH AUDIO | 適宜 |

---

## タイムライン

```
0秒 ─────────── 10秒 ─────────── 20秒 ─────────── 40秒 ── 45秒
│                │                │                │       │
│  導入（Past）   │  転換（Change） │   サビ（Action）  │ 結び  │
│                │                │                │       │
│ ピアノソロ      │ ビルドアップ    │  歌詞付き楽曲    │ F.O.  │
│ ナレーション①  │ ナレーション②  │  （ボーカル）    │ ロゴ  │
└────────────────┴────────────────┴────────────────┴───────┘
```

---

# 1. BGM プロンプト（SUNO）

## BGM: 導入部分（0-15秒）

**用途:** シーン1-2の背景音楽。ナレーションが入るのでインストゥルメンタル。

### SUNO スタイルプロンプト

```
Cinematic instrumental, emotional piano solo, ambient atmosphere, slow tempo 60-70 BPM, melancholic yet hopeful, soft strings gradually entering, building anticipation, film score style, no vocals, Japanese anime movie soundtrack feel, gentle reverb, warm and nostalgic
```

### 設定
- Mode: Instrumental（ボーカルなし）
- Duration: 約20秒生成 → 15秒にトリミング

---

## BGM: ビルドアップ（10-20秒）

**用途:** シーン3への橋渡し。徐々に盛り上がる。

### SUNO スタイルプロンプト

```
Cinematic build-up, piano with growing orchestral elements, strings and soft drums entering, tempo gradually increasing from 70 to 100 BPM, emotional crescendo, anticipation building, no vocals, film trailer style, powerful yet restrained, preparing for explosive chorus
```

### 設定
- Mode: Instrumental（ボーカルなし）
- Duration: 約15秒生成 → 10秒にトリミング

---

## 代替案: 1曲で0-20秒をカバー

SUNOのメタタグを使って1曲で生成する方法：

### スタイルプロンプト

```
Cinematic J-pop ballad, anime movie soundtrack, emotional piano intro, orchestral build-up, no vocals for first 15 seconds then instrumental crescendo, 70-100 BPM gradual acceleration, warm and nostalgic opening, hopeful and determined mood, professional film score quality
```

### 歌詞/構成プロンプト

```
[Intro]
[Piano Solo - 8 bars]
[Soft Strings Enter]

[Build]
[Drums Enter Softly]
[Orchestral Crescendo]
[Rising Intensity]

[Pre-Chorus]
[Instrumental Build to Peak]
```

---

# 2. 歌詞付き楽曲 プロンプト（SUNO）

## メイン楽曲（15-45秒）

**用途:** シーン4-9のBGM。サビから始まり、感動的に終わる。

### SUNO スタイルプロンプト

```
Energetic J-pop rock, anime opening style, powerful male vocals, emotional and determined, up-tempo 140-150 BPM, electric guitar and drums driving the beat, soaring chorus melody, inspirational and youthful energy, Makoto Shinkai film soundtrack feel, Japanese lyrics, passionate and hopeful, professional mix quality
```

### 歌詞プロンプト（日本語）

```
[Chorus]
形なき想いが 今ここで燃え上がる
熱い鉄のように 僕らは変わってゆく
見えない場所で 世界を支える
その手で作り出す 明日への証

[Verse]
迷いの中で見つけた 一筋の光
汗と炎の向こうに 夢が待っている

[Chorus]
形なき想いが 今ここで燃え上がる
熱い鉄のように 僕らは変わってゆく

[Bridge]
どんな小さな部品も
誰かの人生を動かしている

[Outro]
世界の心臓を作る
それが僕らの仕事
```

### メタタグ付きバージョン

```
[Chorus - Powerful, Full Band]
形なき想いが 今ここで燃え上がる
熱い鉄のように 僕らは変わってゆく
見えない場所で 世界を支える
その手で作り出す 明日への証

[Verse - Slightly Softer]
迷いの中で見つけた 一筋の光
汗と炎の向こうに 夢が待っている

[Chorus - Full Energy]
形なき想いが 今ここで燃え上がる
熱い鉄のように 僕らは変わってゆく

[Bridge - Emotional, Strings]
どんな小さな部品も
誰かの人生を動かしている

[Outro - Fade Out, Piano Returns]
世界の心臓を作る
それが僕らの仕事
```

---

## 歌詞の意図

| パート | 歌詞のテーマ | 対応シーン |
|--------|-------------|-----------|
| Chorus | 想いが形になる、変化 | シーン4（注湯） |
| Verse | 迷いから光へ | シーン5（職人の眼差し） |
| Chorus繰り返し | 熱い決意 | シーン6（製品と社会） |
| Bridge | 仕事の意義 | シーン7（インフラ） |
| Outro | 企業メッセージ | シーン8-9（未来、ロゴ） |

---

## 代替歌詞案（より抽象的）

```
[Chorus]
燃える想いを 形に変えて
この手で作る 未来のかけら
誰かの夢が 走り出す時
僕らはここで 世界を回す

[Verse]
空を見上げた あの日の僕は
何も持たずに 立ち尽くしていた

[Chorus]
燃える想いを 形に変えて
この手で作る 未来のかけら

[Outro]
見えない場所で 光り続ける
それが僕らの 誇り
```

---

# 3. ナレーション テキスト（FISH AUDIO）

## ナレーション設定

| 項目 | 設定 |
|------|------|
| 声質 | 若い成人男性、日本語 |
| トーン | 内省的、落ち着いた、誠実、決意 |
| スタイル | 独白調、ウィスパー気味だが芯がある |
| 参考 | 新海誠作品の主人公の語り |

---

## ナレーション テキスト（セリフごとに改行）

### ナレーション①（シーン1-2：0-10秒）

```
あの頃、僕は何かになりたかった。

でも、何になればいいのか分からなかった。
```

---

### ナレーション②（シーン3：10-15秒）

```
熱くなれる場所を、探していた。
```

---

### ナレーション③（シーン9・ロゴ：40-45秒）

```
世界の心臓を作る仕事。

ゆめスタ
```

---

## ナレーション 全文（まとめ）

```
あの頃、僕は何かになりたかった。

でも、何になればいいのか分からなかった。

熱くなれる場所を、探していた。

世界の心臓を作る仕事。

ゆめスタ
```

---

## FISH AUDIO 生成時の注意

1. **間（ま）を意識** - セリフ間に適切な間を設ける
2. **感情の変化** - 前半は迷い、後半は確信
3. **ゆめスタ** - 企業名は少しゆっくり、はっきりと

---

# 4. 音声タイムライン（完成版）

| 時間 | シーン | BGM/楽曲 | ナレーション |
|------|--------|---------|-------------|
| 0-5秒 | 1: 屋上 | ピアノソロ | 「あの頃、僕は〜」 |
| 5-10秒 | 2: 目覚め | ピアノ+ストリングス | 「でも、何に〜」 |
| 10-15秒 | 3: 工場へ | ビルドアップ | 「熱くなれる場所を〜」 |
| 15-20秒 | 4: 注湯 | 歌詞曲 Chorus | ー |
| 20-25秒 | 5: 眼差し | 歌詞曲 Verse | ー |
| 25-30秒 | 6: 製品 | 歌詞曲 Chorus | ー |
| 30-35秒 | 7: インフラ | 歌詞曲 Bridge | ー |
| 35-40秒 | 8: 未来へ | 歌詞曲 Outro | ー |
| 40-45秒 | 9: ロゴ | フェードアウト | 「世界の心臓を〜」 |

---

# 5. 生成チェックリスト

## SUNO
- [ ] BGM導入部（0-15秒用インスト）
- [ ] 歌詞付き楽曲（15-45秒用）
- [ ] 必要に応じてリテイク・トリミング

## FISH AUDIO
- [ ] ナレーション①（あの頃〜）
- [ ] ナレーション②（熱くなれる〜）
- [ ] ナレーション③（世界の心臓〜）
- [ ] 全体の間・トーン確認

---

## 参考リンク

- [SUNO AI Prompts Complete Guide](https://sunnoai.com/prompt/)
- [How to Write Effective Prompts for Suno](https://www.soundverse.ai/blog/article/how-to-write-effective-prompts-for-suno-ai-music-generation-0957)
- [Complete List of SUNO Prompts & Styles](https://travisnicholson.medium.com/complete-list-of-prompts-styles-for-suno-ai-music-2024-33ecee85f180)
