# アニリク採用PV転換点演出プロンプト集 v2
## Image-to-Video完全対応版（開始フレーム + 動画プロンプト）

**コンセプト**: 人物の背後でエフェクトが発生するパターン（前景・後景の奥行き分離）

**v2更新内容:**
- ①背景を街景色に変更（`[BACKGROUND]`プレースホルダー使用）
- ②4色チョーク爆発を中央から外向きに変更
- ③桜の花びらパターンを追加（パターン2）
- ④目が「完全に開ききった瞬間」に爆発するよう修正
- ⑥カメラが一気に引くよう修正

---

## 背景設定について

全パターンで以下の背景プレースホルダーを使用:

```
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style]
```

**UIダイアログで選択可能な背景オプション:**
- オフィス: `modern office interior, glass windows, natural light`
- 工場: `industrial factory interior, metallic structures, dramatic lighting`
- 自然: `serene nature landscape, trees, sunlight filtering through leaves`
- 都市・街路: `urban city street, beautiful sky, Makoto Shinkai style`（デフォルト）
- 屋上: `rooftop with city skyline, sunset sky, dramatic clouds`

---

## パターン1: 目を開く × 光の粒子（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、金色の光粒子（背後に配置） |
| **エフェクト** | 目が**完全に開ききった瞬間**に背後の光粒子が一気に上昇爆発 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.
Negative: no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters.
```

**日本語版（日本のAI画像生成用）:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、目を閉じている、アニメスタイルイラスト、柔らかいまつげと滑らかなまぶた。
胸から上の上半身が見える、閉じた目で穏やかな表情。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト。

構図：キャラクターのバストがフレーム中央を占め、クリーンな背景、奥行き感。

制約：目は完全に閉じている、クリーンな構図、まだエフェクトなし。
ネガティブ：開いた目、桜の花びら、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, waist shot, eyes open, (explosion of golden light particles from behind:1.3), particles floating upward, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, ウエストショット, 目を開けている, (背後から金色の光粒子の爆発:1.3), 上昇する粒子, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
閉じた目
```

### カメラワーク（時間軸）

```
0-2.0s ── 【静・溜め + 目が開く】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態から徐々に開いていく
          背後の粒子: 微かに脈動する光、まだ静止
          フォーカス: 開いていく目（前景）+ 背後の待機粒子（後景）
          カメラ: 完全固定、バストショット構図
          ★目がゆっくり開いていく過程、緊張感

2.0s ──── 【★爆発の瞬間 - 目が完全に開ききった瞬間】
          目: ★完全に開ききった状態★
          背後の粒子: ★この瞬間に一気に点火・爆発上昇開始★
          ★同期ポイント: 目が完全に開く = 粒子爆発開始★
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

2.0-4.5s ─ 【爆発展開 + 一気に引き】
          構図: ほぼ全身（ニーショット〜フルショット）へ急速に変化
          目: 完全に開いた状態、瞳に背後の粒子光が反射
          背後の粒子: 上昇し続け、画面上部で漂う
          粒子は人物の背後・周囲で美しく舞う
          フォーカス: 人物全体 → 背後で漂う粒子全体
          カメラ: ★急速にズームアウト（バスト→ほぼ全身）★
          スローモーション適用、美しい余韻、エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Golden particles burst UPWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Particles continue rising upward behind and around character.
Particles float gently at upper area.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never cross in front of face.

Negative: no particles in front of face, no blinking, no particles moving downward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Golden particles burst UPWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Particles continue rising upward behind and around character.
Particles float gently at upper area.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never in front of face.

Negative: no particles in front of face, no blinking, no particles moving downward.
```

---

## パターン2: 目を開く × 桜の花びら（背後）【新規】✅ 検証済み

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、桜の花びら（目が開いた瞬間に出現） |
| **エフェクト** | 目が**完全に開ききった瞬間**に**中央から**桜の花びらが出現し、放射状に外向きに広がる |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.
Negative: no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters.
```

**日本語版（日本のAI画像生成用）:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、目を閉じている、アニメスタイルイラスト、柔らかいまつげと滑らかなまぶた。
胸から上の上半身が見える、閉じた目で穏やかな表情。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト。

構図：キャラクターのバストがフレーム中央を占め、クリーンな背景、奥行き感。

制約：目は完全に閉じている、クリーンな構図、まだエフェクトなし。
ネガティブ：開いた目、桜の花びら、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, waist shot, eyes open, (explosion of cherry blossom petals from behind:1.3), radial petals flying, strong backlight, lens flare, glowing light, blurred japanese street background, anime style

no branch, no tree, no trunk, no leaves, no twigs, no wood, closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, ウエストショット, 目を開けている, (背後から桜の花びらの爆発:1.3), 放射状に飛ぶ花びら, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
枝なし, 木なし, 幹なし, 葉なし, 小枝なし, 木材なし, 閉じた目
```

### カメラワーク（時間軸）

```
0-2.0s ── 【静・溜め + 目が開く】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態から徐々に開いていく
          背後: まだ花びらなし、クリーンな背景
          フォーカス: 開いていく目（前景）
          カメラ: 完全固定、バストショット構図
          ★目がゆっくり開いていく過程、期待感

2.0s ──── 【★爆発の瞬間 - 目が完全に開ききった瞬間】
          目: ★完全に開ききった状態★
          背後の花びら: ★この瞬間に中央から出現し、放射状に外向きに広がる★
          ★同期ポイント: 目が完全に開く = 花びらが中央から放射状に出現・拡散★
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

2.0-4.5s ─ 【花びら展開 + 一気に引き】
          構図: ウエストショット（腰から上）へ急速に変化
          目: 完全に開いた状態
          背後の花びら: 中央から外向きに放射状に広がりながら舞い続ける
          花びらは個別の散った花びらのみ（枝・木・茎なし）
          フォトリアルで繊細な花びら、柔らかく半透明な質感
          フォーカス: 人物 → 背後で舞う花びら
          カメラ: ★急速にズームアウト（バスト→ウエスト）★
          スローモーション適用、美しい余韻
```

### KLING v3 動画プロンプト

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Petals explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Petals continue spreading outward in radial pattern.
Petals travel behind and around character at varying speeds.
Slow motion applied.

Constraints: petals explode OUTWARD in radial pattern, petals never cross in front of face, varying petal speeds.

Negative: no petals in front of face, no blinking, no petals moving inward, no branches, no trees, no stems.
```

### VIDU Q3 動画プロンプト

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Petals explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Petals continue spreading outward in radial pattern.
Petals travel around character at varying speeds.
Slow motion applied.

Constraints: petals explode OUTWARD in radial pattern, petals never in front of face, varying petal speeds.

Negative: no petals in front of face, no blinking, no petals moving inward, no branches, no trees, no stems.
```

---

## 検証で得た重要な学び（桜の花びらパターンより）

### ✅ 成功した要素

| 要素 | 内容 |
|------|------|
| `from behind character` | これが決め手。中央から出現ではなく背後から出現に |
| 動きに集中 | デザイン・色・質感の言及を削除。終了フレームに任せる |
| シンプルな構造 | 時間軸 + 動きの指示のみ |
| 枝・木の禁止 | ネガティブに `no branches, no trees, no stems` |

### ❌ 失敗した要素

| 要素 | 問題 |
|------|------|
| `from center` | 画面中央から新しい花びらが出現してしまう |
| `from lower area` | 意図通りにならない |
| `THE SAME petals` | 接続を明示しても新しい花びらが生成される |
| `upward and OUTWARD` | 方向が矛盾して混乱 |
| カメラワーク指示 | I2Vでは安定しない→動画編集ソフトで対応 |
| `varying speeds` | 別のアニメーションを誘発する可能性（要注意） |
| デザイン詳細指定 | 終了フレームと競合して不安定に |

### ⚠️ カメラワークについて

- I2Vでズームアウトは安定しない
- 動画編集ソフトで後処理する方針に変更
- 動画プロンプトからカメラ関連の言及を全て削除済み

### 4色チョークへの適用

1. **動画プロンプトは動きのみに集中**
   - デザイン（色、質感）は終了フレームで指定
   - `from behind character` を使用

2. **構造を同じにする**
   - 開始フレーム: キャラクターのみ（チョーク粉なし）
   - 終了フレーム: チョーク粉が放射状に広がった状態
   - 動画プロンプト: 動きのタイミングと方向のみ

3. **4色チョークの特殊性**
   - 4色（青・赤・黄・緑）の指定は終了フレームで
   - 動画プロンプトでは `powder` または `chalk` だけでOK
   - `from behind character in radial pattern` を使用

---

## パターン3: 目を開く × 4色チョーク（背後）✅ 検証済み

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、4色のチョーク粉（青・赤・黄・緑、背後の**中央**に配置） |
| **エフェクト** | 目が**完全に開ききった瞬間**に**中央から外向きに一斉爆発**、4色が放射状に広がる |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.
Negative: no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、目を閉じている、アニメスタイルイラスト、柔らかいまつげと滑らかなまぶた。
胸から上の上半身が見える、閉じた目で穏やかな表情。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト。

構図：キャラクターのバストがフレーム中央を占め、クリーンな背景、奥行き感。

制約：目は完全に閉じている、クリーンな構図、まだエフェクトなし。
ネガティブ：開いた目、桜の花びら、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, waist shot, eyes open, (explosion of colorful chalk powder from behind:1.3), blue red yellow green powder, radial powder flying, strong backlight, lens flare, glowing light, blurred japanese street background, anime style

closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, ウエストショット, 目を開けている, (背後からカラフルなチョーク粉の爆発:1.3), 青赤黄緑の粉, 放射状に飛ぶ粉, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
閉じた目
```

### カメラワーク（時間軸）

```
0-2.0s ── 【静・溜め + 目が開く】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態から徐々に開いていく
          背後の4色の粉: 中央で集中、微かに色の光を放つ
          青・赤・黄・緑が背後中央で待機
          フォーカス: 開いていく目（前景）+ 背後中央の4色（後景）
          カメラ: 完全固定、バストショット構図
          ★目がゆっくり開いていく過程、4色のエネルギーが溜まっている予兆

2.0s ──── 【★爆発の瞬間 - 目が完全に開ききった瞬間】
          目: ★完全に開ききった状態★
          背後の4色の粉: ★この瞬間に中央から外向きに一斉爆発★
          ★同期ポイント: 目が完全に開く = 背後4色が放射状に外向き爆発★
          ★4色の粉が中央から全方向へ放射状に広がる★
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

2.0-4.5s ─ 【4色展開 + 一気に引き】
          構図: ほぼ全身（ニーショット〜フルショット）へ急速に変化
          目: 完全に開いた状態、瞳に4色の反射
          背後の4色の粉: 中央から外向きに放射状に広がり続ける
          背後の4色がカラフルな雲を形成しながら拡散、人物の周りで漂う
          フォーカス: 人物全体 → 背後で広がる4色全体
          カメラ: ★急速にズームアウト（バスト→ほぼ全身）★
          スローモーション適用、美しい色の余韻、4色エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Chalk powder explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Powder continue spreading outward in radial pattern.
Powder travel behind and around character at varying speeds.
Slow motion applied.

Constraints: powder explode OUTWARD in radial pattern, powder never cross in front of face.

Negative: no powder in front of face, no blinking, no powder moving inward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Chalk powder explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Powder continue spreading outward in radial pattern.
Powder travel behind and around character at varying speeds.
Slow motion applied.

Constraints: powder explode OUTWARD in radial pattern, powder never in front of face.

Negative: no powder in front of face, no blinking, no powder moving inward.
```

---

## パターン4: 目を開く × エネルギー波（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、同心円状のエネルギー波（背後に配置） |
| **エフェクト** | 目が**完全に開ききった瞬間**に背後の中心からエネルギー波が同心円状に放射 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.
Negative: no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、目を閉じている、アニメスタイルイラスト、柔らかいまつげと滑らかなまぶた。
胸から上の上半身が見える、閉じた目で穏やかな表情。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト。

構図：キャラクターのバストがフレーム中央を占め、クリーンな背景、奥行き感。

制約：目は完全に閉じている、クリーンな構図、まだエフェクトなし。
ネガティブ：開いた目、桜の花びら、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, waist shot, eyes open, (concentric energy waves from behind:1.3), circular shockwave rings, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, ウエストショット, 目を開けている, (背後から同心円状のエネルギー波:1.3), 円形の衝撃波リング, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
閉じた目
```

### カメラワーク（時間軸）

```
0-2.0s ── 【静・溜め + 目が開く】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態から徐々に開いていく
          背後のエネルギー核: 中央で微かに脈動、小さな光の点
          背後からリズミカルな光の呼吸
          フォーカス: 開いていく目（前景）+ 背後で脈動する核（後景）
          カメラ: 完全固定、バストショット構図
          ★目がゆっくり開いていく過程、背後でエネルギーが集中している予兆

2.0s ──── 【★爆発の瞬間 - 目が完全に開ききった瞬間】
          目: ★完全に開ききった状態★
          背後のエネルギー: ★この瞬間に背後中心から同心円波が爆発放射★
          ★同期ポイント: 目が完全に開く = 背後エネルギー波放出★
          第一波が背後の中心から外側へ爆発的に広がる
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

2.0-4.5s ─ 【波動展開 + 一気に引き】
          構図: ほぼ全身（ニーショット〜フルショット）へ急速に変化
          目: 完全に開いた状態、瞳が光る
          背後のエネルギー: 連続する同心円波が規則的に脈動放射
          背後で円形の衝撃波が拡大、背後から波動が人物の周りを包むように
          フォーカス: 人物全体 → 背後で脈動する波全体
          カメラ: ★急速にズームアウト（バスト→ほぼ全身）★
          スローモーション適用、美しい波動の余韻、同心円エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Concentric energy wave explodes OUTWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Energy waves continue expanding outward in concentric circles.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never cross in front of face.

Negative: no energy in front of face, no blinking, no waves moving inward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Concentric energy wave explodes OUTWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Energy waves continue expanding outward in concentric circles.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never in front of face.

Negative: no energy in front of face, no blinking, no waves moving inward.
```

---

## パターン5: 顔を上げる × 光の粒子（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | うつむいた顔を上げ、光を受ける |
| **オブジェクト** | 顔（クローズアップ）、金色の光粒子（背後の低い位置に配置） |
| **エフェクト** | 顔が上を向く瞬間に背後の低い位置から光粒子が爆発的に上昇 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.
Negative: no face looking up, no open eyes, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのウエストショット、うつむいている、アニメスタイルイラスト、影のある表情、暗いムード。
腰から上の上半身が見える、目は閉じている、顔は上から影を落とされている。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：ウエストショット構図、キャラクター中央、やや上からのハイアングル。
ライティング：顔に上から影のある照明。

構図：キャラクターのウエストショットがフレーム中央を占め、クリーンな背景、奥行き感。

制約：顔はうつむいている、目は閉じている、影のある表情、クリーンな構図、まだエフェクトなし。
ネガティブ：上を向いた顔、開いた目、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (explosion of golden light particles from behind:1.3), particles floating upward, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
face looking down, closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, 全身ショット, 上を向いた顔, 穏やかな表情, 目を開けている, (背後から金色の光粒子の爆発:1.3), 上昇する粒子, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
うつむいた顔, 閉じた目
```

### カメラワーク（時間軸）

```
0-1.3s ── 【静・溜め】
          構図: バストショット（胸から上）
          顔: うつむき、影の中、暗い表情
          背後の光粒子: 下部で微かに光る、まだ静止
          背後の低い位置で待機する粒子
          フォーカス: うつむいたキャラクター（前景）+ 背後下部の待機粒子（後景）
          カメラ: 固定バストショット、やや上から
          孤独感、緊張感、背後でエネルギーが待機

1.3-3s ─── 【ピーク - 完全同期の瞬間 + 一気にカメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後の光粒子: 顔が上がる瞬間に背後の下部から一気に爆発上昇
          ★同期ポイント: 顔の上昇開始 = 背後粒子爆発上昇★
          背後の粒子が上方へ勢いよく上昇、顔の周りを包むように
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

3-5s ──── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、光を受ける
          背後の光粒子: 背後で顔の周りを漂う、舞い続ける
          背後の粒子光が顔を照らす、表情が見える
          フォーカス: 人物全体 → 背後で舞う粒子全体
          カメラ: ★急速にズームアウト済み（ほぼ全身が収まる構図）★
          スローモーション適用、美しい光の余韻、粒子エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Golden particles burst UPWARD from behind character★

[1.3-3s] Face slowly raising upward, chin lifting.
Particles continue rising upward behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Particles float gently around character.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never cross in front of face.

Negative: no particles in front of face, no rapid head motion, no particles moving downward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Golden particles burst UPWARD from behind character★

[1.3-3s] Face slowly raising upward, chin lifting.
Particles continue rising upward behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Particles float gently around character.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never in front of face.

Negative: no particles in front of face, no rapid head motion, no particles moving downward.
```

---

## パターン6: 顔を上げる × 桜の花びら（背後）【新規】

| 要素 | 内容 |
|------|------|
| **アクション** | うつむいた顔を上げ、光を受ける |
| **オブジェクト** | 顔（クローズアップ）、桜の花びら（顔が上がった瞬間に出現） |
| **エフェクト** | 顔が上を向く瞬間に桜の花びらが背後から出現し、放射状に外向きに広がる |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.
Negative: no face looking up, no open eyes, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのウエストショット、うつむいている、アニメスタイルイラスト、影のある表情、暗いムード。
腰から上の上半身が見える、目は閉じている、顔は上から影を落とされている。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：ウエストショット構図、キャラクター中央、やや上からのハイアングル。
ライティング：顔に上から影のある照明。

構図：キャラクターのウエストショットがフレーム中央を占め、クリーンな背景、奥行き感。

制約：顔はうつむいている、目は閉じている、影のある表情、クリーンな構図、まだエフェクトなし。
ネガティブ：上を向いた顔、開いた目、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (explosion of cherry blossom petals from behind:1.3), radial petals flying, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
no branch, no tree, no trunk, no leaves, no twigs, no wood, face looking down, closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, 全身ショット, 上を向いた顔, 穏やかな表情, 目を開けている, (背後から桜の花びらの爆発:1.3), 放射状に飛ぶ花びら, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
枝なし, 木なし, 幹なし, 葉なし, 小枝なし, 木材なし, うつむいた顔, 閉じた目
```

### カメラワーク（時間軸）

```
0-1.3s ── 【静・溜め】
          構図: ウエストショット（腰から上）
          顔: うつむき、影の中、暗い表情
          背後: まだ花びらなし、クリーンな背景
          フォーカス: うつむいたキャラクター
          カメラ: 固定ウエストショット、やや上から
          孤独感、期待感

1.3-3s ─── 【ピーク - 完全同期の瞬間】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後の花びら: ★顔が上がる瞬間に背後から出現し、放射状に外向きに広がる★
          ★同期ポイント: 顔の上昇開始 = 花びらが背後から放射状に出現・拡散★
          花びらは個別の散った花びらのみ（枝・木・茎なし）

3-5s ──── 【スロー・余韻】
          構図: 全身ショット
          顔: 完全に上を向いた状態、表情が見える
          背後の花びら: 外向きに放射状に広がりながら舞い続ける
          フォトリアルで繊細な花びら、柔らかく半透明な質感
          フォーカス: 人物 → 背後で舞う花びら
          スローモーション適用、美しい余韻
```

### KLING v3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Petals explode OUTWARD from behind character in radial pattern★

[1.3-3s] Face slowly raising upward, chin lifting.
Petals continue spreading outward in radial pattern.
Petals travel behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Petals continue floating around character.
Slow motion applied.

Constraints: petals explode OUTWARD in radial pattern, petals never cross in front of face.

Negative: no petals in front of face, no rapid head motion, no petals moving inward, no branches, no trees, no stems.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Petals explode OUTWARD from behind character in radial pattern★

[1.3-3s] Face slowly raising upward, chin lifting.
Petals continue spreading outward in radial pattern.
Petals travel behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Petals continue floating around character.
Slow motion applied.

Constraints: petals explode OUTWARD in radial pattern, petals never in front of face.

Negative: no petals in front of face, no rapid head motion, no petals moving inward, no branches, no trees, no stems.
```

---

## パターン7: 顔を上げる × 4色チョーク（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | うつむいた顔を上げ、光を受ける |
| **オブジェクト** | 顔（クローズアップ）、4色のチョーク粉（青・赤・黄・緑、背後の**中央**に配置） |
| **エフェクト** | 顔が上を向く瞬間に**中央から外向きに一斉爆発**、4色が放射状に広がり顔の周囲を包む |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.
Negative: no face looking up, no open eyes, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのウエストショット、うつむいている、アニメスタイルイラスト、影のある表情、暗いムード。
腰から上の上半身が見える、目は閉じている、顔は上から影を落とされている。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：ウエストショット構図、キャラクター中央、やや上からのハイアングル。
ライティング：顔に上から影のある照明。

構図：キャラクターのウエストショットがフレーム中央を占め、クリーンな背景、奥行き感。

制約：顔はうつむいている、目は閉じている、影のある表情、クリーンな構図、まだエフェクトなし。
ネガティブ：上を向いた顔、開いた目、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, waist shot, face looking up, peaceful expression, (explosion of colorful chalk powder from behind:1.3), blue red yellow green powder, radial powder flying, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
face looking down, closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, ウエストショット, 上を向いた顔, 穏やかな表情, (背後からカラフルなチョーク粉の爆発:1.3), 青赤黄緑の粉, 放射状に飛ぶ粉, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
うつむいた顔, 閉じた目
```

### カメラワーク（時間軸）

```
0-1.3s ── 【静・溜め】
          構図: バストショット（胸から上）
          顔: 中央でうつむき、影の中、暗い表情
          背後の4色の粉: 中央で集中、微かに色の光を放つ
          青・赤・黄・緑が背後中央で待機
          フォーカス: うつむいたキャラクター（前景）+ 背後中央の4色（後景）
          カメラ: 固定バストショット、やや上から
          孤独感、4色のエネルギーが背後中央で溜まっている予兆

1.3-3s ─── 【ピーク - 完全同期の瞬間 + 一気にカメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後の4色の粉: 顔が上がる瞬間に中央から外向きに一斉爆発
          ★同期ポイント: 顔の上昇開始 = 背後4色が放射状に外向き爆発★
          ★4色の粉が中央から全方向へ放射状に広がる★
          顔の周囲を包むように4色が拡散
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

3-5s ──── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、表情が見える
          背後の4色の粉: 中央から外向きに広がり、カラフルな雲を形成
          背後の混合雲が人物の周りで拡散、顔を照らす
          フォーカス: 人物全体 → 背後で広がる4色全体
          カメラ: ★急速にズームアウト済み（ほぼ全身が収まる構図）★
          スローモーション適用、美しい色の余韻、4色エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Chalk powder explode OUTWARD from behind character in radial pattern★

[1.3-3s] Face slowly raising upward, chin lifting.
Powder continue spreading outward in radial pattern.
Powder travel behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Powder continue spreading outward.
Slow motion applied.

Constraints: powder explode OUTWARD in radial pattern, powder never cross in front of face.

Negative: no powder in front of face, no rapid head motion, no powder moving inward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Chalk powder explode OUTWARD from behind character in radial pattern★

[1.3-3s] Face slowly raising upward, chin lifting.
Powder continue spreading outward in radial pattern.
Powder travel behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Powder continue spreading outward.
Slow motion applied.

Constraints: powder explode OUTWARD in radial pattern, powder never in front of face.

Negative: no powder in front of face, no rapid head motion, no powder moving inward.
```

---

## パターン8: 顔を上げる × エネルギー波（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | うつむいた顔を上げ、光を受ける |
| **オブジェクト** | 顔（クローズアップ）、同心円状のエネルギー波（背後に配置） |
| **エフェクト** | 顔が上を向く瞬間に背後の中心からエネルギー波が同心円状に放射 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.
Negative: no face looking up, no open eyes, no particles, no motion blur, no multiple characters.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのウエストショット、うつむいている、アニメスタイルイラスト、影のある表情、暗いムード。
腰から上の上半身が見える、目は閉じている、顔は上から影を落とされている。
[背景：都市の街路、美しい空、新海誠スタイル]、奥行きあり。
カメラ：ウエストショット構図、キャラクター中央、やや上からのハイアングル。
ライティング：顔に上から影のある照明。

構図：キャラクターのウエストショットがフレーム中央を占め、クリーンな背景、奥行き感。

制約：顔はうつむいている、目は閉じている、影のある表情、クリーンな構図、まだエフェクトなし。
ネガティブ：上を向いた顔、開いた目、粒子、モーションブラー、複数キャラクター。
```

### 終了フレーム用プロンプト（静止画生成用）

**プロンプト:**
```
masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (concentric energy waves from behind:1.3), circular shockwave rings, strong backlight, lens flare, glowing light, blurred japanese street background, anime style
```

**ネガティブ:**
```
face looking down, closed eyes
```

**日本語版:**
```
傑作, 最高品質, ソロ, 全身ショット, 上を向いた顔, 穏やかな表情, 目を開けている, (背後から同心円状のエネルギー波:1.3), 円形の衝撃波リング, 強いバックライト, レンズフレア, 輝く光, ぼやけた日本の街並み背景, アニメスタイル
```

**ネガティブ:**
```
うつむいた顔, 閉じた目
```

### カメラワーク（時間軸）

```
0-1.3s ── 【静・溜め】
          構図: バストショット（胸から上）
          顔: うつむき、影の中、暗い表情
          背後のエネルギー核: 中央で微かに脈動、小さな光の点
          背後からリズミカルな光の呼吸
          フォーカス: うつむいたキャラクター（前景）+ 背後で脈動する核（後景）
          カメラ: 固定バストショット、やや上から
          孤独感、背後でエネルギーが集中している予兆

1.3-2.8s ─ 【ピーク - 完全同期の瞬間 + 一気にカメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後のエネルギー: 顔が上がる瞬間に背後中心から同心円波が爆発放射
          ★同期ポイント: 顔の上昇開始 = 背後エネルギー波放出★
          第一波が背後の中心から外側へ爆発的に広がる
          背後で円形の衝撃波が人物の周りを包むように拡大
          ★カメラ: 爆発と同時に一気にズームアウト開始★
          ★瞬間的なカメラ引き（徐々にではなく一気に）★

2.8-5s ─── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、表情が見える
          背後のエネルギー: 連続する同心円波が規則的に脈動放射
          背後から波動が人物の周りを包み、顔を照らす
          フォーカス: 人物全体 → 背後で脈動する波全体
          カメラ: ★急速にズームアウト済み（ほぼ全身が収まる構図）★
          スローモーション適用、美しい波動の余韻、同心円エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Concentric energy wave explodes OUTWARD from behind character★

[1.3-2.8s] Face slowly raising upward, chin lifting.
Energy waves continue expanding outward in concentric circles.

[2.8-5s] Face fully raised looking upward, eyes open, peaceful expression.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never cross in front of face.

Negative: no energy in front of face, no rapid head motion, no waves moving inward.
```

### VIDU Q3 動画プロンプト（簡略版）

```
[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Concentric energy wave explodes OUTWARD from behind character★

[1.3-2.8s] Face slowly raising upward, chin lifting.
Energy waves continue expanding outward in concentric circles.

[2.8-5s] Face fully raised looking upward, eyes open, peaceful expression.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never in front of face.

Negative: no energy in front of face, no rapid head motion, no waves moving inward.
```

---

## 使用ガイド・まとめ

### 制作ワークフロー

```
1. 開始フレーム（静止画）生成
   ↓
   使用: 各パターンの「開始フレーム用プロンプト」
   モデル: Nanobanana / KLING v3 / Ideogram V3 / Flux等
   ※Nanobananaならここに出てくる懸念点は凡そカバーできます
   ※構図: バストショット（胸から上）

2. 動画生成（Image-to-Video）
   ↓
   使用: 生成した開始フレーム + 「動画プロンプト」
   モデル: KLING v3 または VIDU Q3
   ※カメラワーク: 爆発と共に★一気に★ズームアウト（バストショット→ほぼ全身）

3. 合成・編出
   ↓
   背景素材をスクリーン/加算合成でキャラクターに重ねる
```

### 重要な技術ポイント

1. **奥行き分離（Depth Separation）**
   - 前景（人物）と後景（エフェクト）を明確に分離
   - エフェクトは常に背後に配置、人物の前を横切らない
   - この構造により自然な合成が可能

2. **完全同期（Perfect Synchronization）**
   - 目を開く系: 目が**完全に開ききった瞬間** = 背後でエフェクト爆発（2.0秒時点）
   - 顔を上げる系: 顔が上がる瞬間 = 背後でエフェクト爆発（1.3秒時点）
   - ★マークで同期ポイントを明示

3. **爆発方向の統一**
   - 4色チョーク: **中央から外向きに放射状に爆発**（4隅から中央へ収束ではない）
   - 光の粒子: 下部から上方へ上昇
   - エネルギー波: 中心から同心円状に拡大
   - 桜の花びら: 中央から外向きに放射状に舞い上がる

4. **背景設定**
   - `[BACKGROUND: urban city street, beautiful sky, Makoto Shinkai style]` プレースホルダー使用
   - デフォルト: 都市・街路（真っ黒背景ではない）
   - UIダイアログで選択可能: オフィス/工場/自然/都市・街路/屋上

5. **開始フレームの「待機状態」設計**
   - エフェクトが見えているが爆発していない
   - 人物に隠れず、AIが認識できる程度に配置
   - 爆発の予兆として視覚的に存在
   - **構図: バストショット（胸から上）**

6. **キーフレームの3段階**
   - 【静・溜め】: 0-2.0秒（目を開く系）/ 0-1.3秒（顔を上げる系）、緊張感・予兆（バストショット固定）
   - 【爆発の瞬間】: 2.0秒 / 1.3秒、**目が完全に開いた瞬間** or 顔が上がる瞬間 + **一気にカメラ引き開始**
   - 【展開・余韻】: 最後まで、美しさ・感情浸透 + **ほぼ全身まで引き**

7. **カメラワーク「一気に引き」の設計**
   - 開始: バストショット（胸から上）
   - 爆発時: ★**一気に**★ウエストショット〜フルショットへズームアウト
   - **徐々にではなく、爆発と同時に瞬間的に引く**
   - 目的: エフェクトの壮大さをドラマチックに見せる

8. **新海誠スタイルプロンプト**
   - 全プロンプトの冒頭に統一スタイル追加
   - `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth`
   - 繊細な光、美しい背景、感情的な表現

### プロンプトの構造

全てのプロンプトは以下の構造で統一:

```
- Shot Description（構図説明）
- Foreground-Background Setup（前景・後景の配置）
- Time-based Camera Work（時間軸のカメラワーク）
  [0-Xs] 静・溜め + 目が開いていく
  [Xs] ★爆発の瞬間★
  [X-Zs] 展開・余韻
- Constraints（制約）: 必ず守るべき要素
- Negative（禁止事項）: 避けるべき要素
```

### モデル選択推奨

- **KLING v3**:
  - 複雑な奥行き制御、前景・後景分離に強い
  - 特にパターン3,6の4色同時制御に最適
  - 時間軸の精密な同期制御が可能
  - **瞬間的なズームアウト（カメラ引き）に対応**

- **VIDU Q3**:
  - 16秒長尺対応、Smart Cuts機能
  - ネイティブオーディオで音響効果統合
  - 空間的な音響の深さ表現に優れる
  - **ダイナミックなカメラワーク変化に対応**

### 合成時のヒント

- 開始フレーム: Nanobanana / Ideogram V3 / Fluxで高品質アニメスタイル生成
- **開始フレーム構図: 必ずバストショット（胸から上）で生成**
- 背景: `[BACKGROUND]`プレースホルダーで街景色などを指定
- 合成モード: スクリーン or 加算（Add）
- 同期調整: エフェクトの爆発ピークを2.0秒（目を開く系）/ 1.3秒（顔を上げる系）に配置
- **カメラワーク: 爆発と同時に一気にバストショット→ほぼ全身へズームアウト**
- 追加調整: カラーグレーディング、グロー効果で統一感を出す
- **スタイル: 新海誠風プロンプトを冒頭に追加済み**

### v2での変更点まとめ

| 項目 | v1 | v2 |
|------|-----|-----|
| 背景 | Dark void background（真っ黒） | [BACKGROUND: urban city street...]（街景色） |
| 4色チョーク | 4隅から中央へ衝突 | **中央から外向きに放射状に爆発** |
| 桜の花びら | なし | **パターン2として追加** |
| 爆発タイミング | 目が開き始める瞬間 | **目が完全に開ききった瞬間** |
| カメラワーク | 徐々に引く | **爆発と同時に一気に引く** |

全7パターンで、Image-to-Video対応の転換点演出が完璧に実現できます。開始フレームと動画プロンプトの両方を用意したので、確実に意図通りの同期演出が制作可能です！
