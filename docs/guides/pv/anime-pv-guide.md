# アニメPV制作ガイド：新卒採用向け（鋳物製造業編）

## 概要

| 項目 | 内容 |
|------|------|
| 業種 | 製造業（鋳物製造） |
| ターゲット | 新卒採用（大学生・高校生） |
| 動画尺 | 45秒 |
| 1カット | 最大5秒 |

## 制作要素

すべて別々に生成する:
1. **BGM** - AI生成（Suno/Udio等）
2. **ナレーション** - AI生成（ElevenLabs等）
3. **歌詞付き音楽** - AI生成
4. **動画** - 開始フレーム＋終了フレームをAI生成し、動画AIで補間

---

## 1. コンセプトと全体設計

共有動画の共通点は**「スケール感の対比」と「時間の経過」**です。これを鋳物業に置き換えます。

### コアメッセージ
> 「熱き想いは、形になって社会を支える。」
> （液体の鉄が固体の部品になり、社会を動かすことのメタファー）

### 画風（Art Style）

**キーワード:**
- 新海誠風 (Makoto Shinkai style)
- コミックス・ウェーブ・フィルム風
- 高精細な背景 (High detailed background)
- 劇的な光の演出 (Dramatic lighting, Lens flare, God rays)
- 夕暮れまたは夜明け (Golden hour / Blue hour)

**色彩:**
- 鋳物の「赤・オレンジ（溶湯）」と、青春の「青（空・制服）」のコントラスト

---

## 2. タイムラインと構成（全45秒）

| 時間 | フェーズ | 映像の内容 | 音楽・BGM | ナレーション・セリフ |
|------|---------|-----------|----------|-------------------|
| 00-10 | 導入 (Past) | 学生時代の日常、または何かを見上げる横顔 | 静かなピアノソロ。環境音（風、チャイム） | 独白調。低めで落ち着いた声。「あの頃、僕は何かになりたかった。」 |
| 10-20 | 転換 (Change) | 就職活動や決意の瞬間。鉄が溶ける様子へのカットイン | 徐々にストリングスやドラムが入るビルドアップ | 「熱くなれる場所を探していた。」 |
| 20-40 | サビ (Action) | ここから歌詞付き楽曲へ。鋳造現場のダイナミックな作業。火花、溶湯、汗 | サビ（Vocal Track）開始。アップテンポで疾走感のあるJ-POP/ロック | （ナレーションなし、歌詞と映像で魅せる） |
| 40-45 | 結び (Future) | 完成した製品（エンジン等）と、ヘルメットを脱ぐ社員。ロゴ | フェードアウト、余韻のあるピアノ | 「世界の心臓を作る仕事。 [会社名]」 |

---

## 3. シーン別 AI生成プロンプトガイド

動画生成AI（Runway Gen-3, Kling, Luma Dream Machine等）での使用を想定し、**「開始フレーム（Start Image）」の生成プロンプトと、「動き（Motion/End Frame）」**の指示を定義します。

※画像生成AI（Midjourney等）で開始画像を生成し、それを動画AIで動かす手法が最も品質が高くなります。

### 【シーン1：導入】日常と迷い (0s - 5s)

**構図:** 高校または大学の校舎の屋上、または帰り道。夕焼け。

**開始画像プロンプト:**
```
Anime style, high quality, Makoto Shinkai style, a male student standing on a school rooftop at sunset, looking up at the sky, lens flare, emotional atmosphere, highly detailed clouds, shooting from behind.
```

**動き（Motion）:**
```
Camera pans slowly upward to the sky. Clouds are moving fast. wind blowing his hair.
```

### 【シーン2：予感】熱への憧れ (5s - 10s)

**構図:** 暑い夏の日、陽炎（かげろう）。または部活で汗を流すシーン（熱気のメタファー）。

**開始画像プロンプト:**
```
Anime style, close up of a young man wiping sweat, sparkling sweat drops, intense sunlight, summer sky, heat haze, shimmering air, depth of field.
```

**動き（Motion）:**
```
Hand wipes sweat, eyes look determined, focus shift from hand to eyes.
```

### 【シーン3：転換】現場への一歩 (10s - 15s)

**構図:** 工場の巨大な扉が開く、あるいは安全靴の足元からパンアップ。光のコントラスト。

**開始画像プロンプト:**
```
Anime style, low angle shot, legs of a worker wearing safety shoes and work pants, walking towards a giant dark factory entrance with bright orange light leaking from inside, dust particles dancing in the light.
```

**動き（Motion）:**
```
Walking forward, the factory door opens slowly, orange light floods the screen.
```

### 【シーン4：サビ・クライマックス】注湯（ちゅうとう）作業 (15s - 20s)

※一番の魅せ場

**構図:** 溶けた鉄（溶湯）を型に流し込む瞬間。火花が散る劇的なシーン。

**開始画像プロンプト:**
```
Anime style, masterpiece, industrial foundry scene, molten iron glowing intensely orange, pouring liquid metal, sparks flying everywhere, dramatic lighting, silhouette of a worker in heat-resistant suit controlling the ladle, cinematic composition.
```

**動き（Motion）:**
```
Molten metal pouring down heavily, sparks flying dynamically towards the camera.
```

### 【シーン5：サビ・躍動】職人の眼差し (20s - 25s)

**構図:** 防護メガネ越し真剣な眼差し。顔にオレンジ色の照り返し。

**開始画像プロンプト:**
```
Anime style, close up of a young worker's face wearing a helmet and safety goggles, face illuminated by the orange glow of fire, intense and focused expression, sweat on cheek, highly detailed reflection in the goggles.
```

**動き（Motion）:**
```
He nods slightly to a colleague, shouting instructions (mouth moving), intense atmosphere.
```

### 【シーン6：サビ・成果】製品と社会 (25s - 30s)

**構図:** 鋳造で作られた部品（エンジンブロックやパイプなど）が組み込まれた車やインフラが稼働する。

**開始画像プロンプト:**
```
Anime style, a glossy metallic engine block highly detailed, steam rising, assembling into a car, transition to the car running on a beautiful highway along the coast, blue sky, speed lines.
```

**動き（Motion）:**
```
Fast zoom out from the engine part to the whole car driving away fast.
```

### 【シーン7：サビ・広がり】地図に残る仕事 (30s - 35s)

**構図:** 共有動画の「スリランカ高速道路」のような、完成した巨大な構造物と夕景。

**開始画像プロンプト:**
```
Anime style, wide shot, a massive bridge or industrial plant at twilight, beautiful purple and orange sky, city lights starting to turn on, a worker standing on a high place overlooking the view, back view.
```

**動き（Motion）:**
```
Camera pulls back slowly to show the vastness of the scenery. The worker takes a deep breath.
```

### 【シーン8：結び】未来へ (35s - 40s)

**構図:** ヘルメットを脇に抱え、朝焼けを見る。笑顔。

**開始画像プロンプト:**
```
Anime style, portrait of the young worker now confident, holding a helmet under arm, standing in clean morning light, smiling gently, wind blowing, factory in the background blurred.
```

**動き（Motion）:**
```
He turns to the camera and smiles.
```

### 【ラスト：ロゴ】 (40s - 45s)

**構図:** 白背景または黒背景に企業ロゴ。キャッチコピー。

**アニメーション:** シンプルなフェードイン。

---

## 4. 音楽・音声生成ガイド (Suno AI / Udio / ElevenLabs想定)

### BGMから楽曲への移行（Timing）

共有動画の最大の特徴は、**「サビで一気に盛り上げる」**点です。

#### 00s-15s (Intro/Verse)

**AI生成プロンプト (Suno/Udio):**
```
Cinematic, Emotional Piano, Ambient, Slow build up, Soft strings.
```

**役割:** ナレーションを聞かせるため、ボーカルは無し（Instrumental）。

#### 15s-45s (Chorus/Hook)

**AI生成プロンプト:**
```
J-Pop, Anime Opening style, Energetic Rock, Male Vocals, Up-tempo, Emotional melody, Powerful drums, Electric guitar solo.
```

**歌詞のテーマ:** 「形なき熱を、確かな未来へ」「見えない場所で世界を支える」といった内容。

**編集指示:** 15秒目の「注湯（火花）」のシーンに合わせて、ドラムのフィルインと共にサビが爆発するように波形を編集して繋げます。

### ナレーション (Atmosphere)

**AI生成プロンプト (ElevenLabs等):**
- Voice Type: Young adult male, Japanese.
- Style: Introspective, Calm, Sincere, Determined.

**参考:** 新海誠作品の主人公のような、少し独白めいた、ウィスパー気味だが芯のある声。

---

## 5. 分析・再現のポイントまとめ（チェックリスト）

- [ ] **光の演出:** 全てのカットに「光源」を意識させること。逆光、レンズフレアをAIプロンプトに必ず入れる。
- [ ] **対比構造:** 「静（学生/悩み）」から「動（現場/情熱）」へのコントラストを明確にする。
- [ ] **シズル感:** 鋳物業特有の「溶けた鉄」「火花」「重厚感」は、アニメ映えする最高の素材です。ここを美しく描くことで、3K（きつい・汚い・危険）のイメージを「かっこいい・職人技」へ変換します。
- [ ] **視点の移動:** 常にカメラが動いている（パン、ズーム、ドリー）映像を生成すること。静止画のパニングだけではリッチになりません。

---

このガイドに沿って、各シーンのプロンプトをAIに入力していけば、共有いただいた参考動画のようなクオリティの高い採用PVが作成可能です。
