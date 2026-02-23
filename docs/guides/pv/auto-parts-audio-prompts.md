# 自動車部品製造PV 音声プロンプト集

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

## BGM: イントロ〜導入部分（0-15秒）

**用途:** シーン1-2の背景音楽。ナレーションが入るのでインストゥルメンタル。
**統一感:** 歌詞付き楽曲（幾田りら風）と同じ世界観のイントロ

### SUNO スタイルプロンプト

```
Modern J-pop instrumental intro, piano arpeggios with soft synth pads, light electronic elements, tempo 70 BPM building slowly, cinematic and emotional, anime movie opening feel, crystal clear production, delicate yet hopeful atmosphere, no vocals, Vocaloid producer style instrumental, anticipation building, Japanese drama soundtrack quality
```

### 設定
- Mode: Instrumental（ボーカルなし）
- Duration: 約20秒生成 → 15秒にトリミング

---

## BGM: ビルドアップ（10-20秒）

**用途:** シーン3への橋渡し。サビへの期待感を高める。

### SUNO スタイルプロンプト

```
J-pop build-up instrumental, piano melody intensifying, synth layers growing, electronic drums entering with energy, tempo accelerating from 70 to 130 BPM, pre-chorus tension building, no vocals, sparkly synth textures, anticipation peaking, modern anime theme instrumental style, professional mix ready for vocal explosion
```

### 設定
- Mode: Instrumental（ボーカルなし）
- Duration: 約15秒生成 → 10秒にトリミング

---

# 2. 歌詞付き楽曲 プロンプト（SUNO）

## メイン楽曲（15-45秒）

**用途:** シーン4-9のBGM。チームワークを表現する明るい曲。
**ボーカルイメージ:** 幾田りら（YOASOBI）風 - 透明感、高音、感情豊か

### SUNO スタイルプロンプト

```
Modern J-pop, crystal clear high female vocals, pure and bright tone with emotional depth, energetic yet delicate delivery, effortless vocal runs, tempo 130-140 BPM, synth-driven with piano accents and electronic beats, catchy melodic hooks with soaring chorus, Vocaloid producer music style, anime theme song feel, Japanese lyrics, youthful and inspiring, professional J-pop production, tight mixing
```

### 歌詞プロンプト（日本語）

```
[Chorus]
一人じゃない 手をつないで
ミクロの精度で 夢を形に
笑い合える 仲間がいるから
どこまでも走れる 未来へ

[Verse]
窓の外を眺めていた日々
何かが足りない そう思っていた
でも今は違う ここにいる意味
見つけたんだ この場所で

[Chorus]
一人じゃない 手をつないで
ミクロの精度で 夢を形に
支え合える 仲間がいるから
何だってできる 信じてる

[Bridge]
小さな部品の一つ一つが
誰かの笑顔につながっている
私たちの手で作り出す
明日を動かすチカラ

[Outro]
一人じゃない
ゆめスタ
```

### メタタグ付きバージョン

```
[Chorus - Full Band, Group Vocals]
一人じゃない 手をつないで
ミクロの精度で 夢を形に
笑い合える 仲間がいるから
どこまでも走れる 未来へ

[Verse - Softer, Female Solo]
窓の外を眺めていた日々
何かが足りない そう思っていた
でも今は違う ここにいる意味
見つけたんだ この場所で

[Chorus - Full Energy, Everyone]
一人じゃない 手をつないで
ミクロの精度で 夢を形に
支え合える 仲間がいるから
何だってできる 信じてる

[Bridge - Emotional, Strings Added]
小さな部品の一つ一つが
誰かの笑顔につながっている
私たちの手で作り出す
明日を動かすチカラ

[Outro - Fade Out, Soft]
一人じゃない
ゆめスタ
```

---

## 歌詞の意図

| パート | 歌詞のテーマ | 対応シーン |
|--------|-------------|-----------|
| Chorus | チームワーク、精密さ | シーン4（精密加工） |
| Verse | 過去の迷い→現在の充実 | シーン5（チーム確認） |
| Chorus繰り返し | 仲間への信頼 | シーン6（製品と社会） |
| Bridge | 仕事の意義、社会貢献 | シーン7（達成） |
| Outro | 企業メッセージ | シーン8-9（未来、ロゴ） |

---

## 鋳物製造編との曲調の違い

| 項目 | 鋳物製造編 | 自動車部品編 |
|------|-----------|-------------|
| ボーカル | 男性ソロ、力強い | 女性ソロ+グループハーモニー |
| 曲調 | ロック、熱い | ポップロック、明るい |
| テンポ | 140-150 BPM | 130-140 BPM |
| 雰囲気 | 情熱、闘志 | チームワーク、喜び |
| キーワード | 熱い、燃える | 一緒に、笑顔 |

---

# 3. ナレーション テキスト（FISH AUDIO）

## ナレーション設定

| 項目 | 設定 |
|------|------|
| 声質 | 若い成人女性、日本語 |
| トーン | 内省的→明るく、誠実、前向き |
| スタイル | 独白調からだんだん力強く |
| 参考 | 新海誠作品のヒロインの語り |

---

## ナレーション テキスト（セリフごとに改行）

### ナレーション①（シーン1-2：0-10秒）

```
私は何かを探していた。

自分の居場所を。
```

---

### ナレーション②（シーン2.5：決意）

```
挑戦は、平等だ。
```

---

### ナレーション③（シーン3：10-15秒）

```
ここで、仲間と出会った。
```

---

### ナレーション③（シーン9・ロゴ：40-45秒）

```
一人じゃない。

ゆめスタ
```

---

## ナレーション 全文（まとめ）

```
私は何かを探していた。

自分の居場所を。

挑戦は、平等だ。

ここで、仲間と出会った。

一人じゃない。

ゆめスタ
```

---

## FISH AUDIO 生成時の注意

1. **トーンの変化** - 前半は静かで内省的、後半は明るく力強く
2. **「仲間」の強調** - 「ここで、仲間と出会った」の「仲間」に温かみを
3. **「一人じゃない」** - 確信を持って、しっかりと
4. **「ゆめスタ」** - 企業名は笑顔が感じられるトーンで

---

# 4. 音声タイムライン（完成版）

| 時間 | シーン | BGM/楽曲 | ナレーション |
|------|--------|---------|-------------|
| 0-5秒 | 1: カフェ | ピアノソロ | 「私は何かを〜」 |
| 5-10秒 | 2: 目覚め | ピアノ+シンセ | 「自分の居場所を」 |
| 10-15秒 | 3: 工場へ | ビルドアップ | 「ここで、仲間と〜」 |
| 15-20秒 | 4: 精密加工 | 歌詞曲 Chorus | ー |
| 20-25秒 | 5: チーム確認 | 歌詞曲 Verse | ー |
| 25-30秒 | 6: 製品と社会 | 歌詞曲 Chorus | ー |
| 30-35秒 | 7: 達成 | 歌詞曲 Bridge | ー |
| 35-40秒 | 8: 未来へ | 歌詞曲 Outro | ー |
| 40-45秒 | 9: ロゴ | フェードアウト | 「一人じゃない〜」 |

---

# 5. 生成チェックリスト

## SUNO
- [ ] BGM導入部（0-15秒用インスト）
- [ ] 歌詞付き楽曲（15-45秒用）
- [ ] 必要に応じてリテイク・トリミング

## FISH AUDIO
- [ ] ナレーション①（私は何かを〜）
- [ ] ナレーション②（ここで、仲間と〜）
- [ ] ナレーション③（一人じゃない〜）
- [ ] 全体の間・トーン確認

