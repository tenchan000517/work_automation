# アニリク採用PV転換点演出プロンプト集
## Image-to-Video完全対応版（開始フレーム + 動画プロンプト）

**コンセプト**: 人物の背後でエフェクトが発生するパターン（前景・後景の奥行き分離）

---

## パターン1: 目を開く × 光の粒子（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、金色の光粒子（背後に配置） |
| **エフェクト** | 目が開く瞬間に背後の光粒子が一気に上昇爆発 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
Behind character in background, faintly glowing golden light particles are visible at lower portion, dormant and waiting.
Particles are small, subtle glow, not yet exploding, resting at bottom behind character.
Dark atmospheric background with slight depth, particles clearly visible but dim.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair, particles emit faint golden glow from behind.

Composition: Character bust occupies center of frame, particles visible in background behind and around character, creating depth.

Constraints: particles must be visible behind character not hidden, particles not yet rising, eyes completely closed, clean composition.
Negative: no open eyes, no particles already exploding, no particles in front of face, no motion blur, no multiple characters.
```

**日本語版（日本のAI画像生成用）:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、目を閉じている、アニメスタイルイラスト、柔らかいまつげと滑らかなまぶた。
胸から上の上半身が見える、閉じた目で穏やかな表情。
背後の下部に金色の光の粒子が微かに光って待機している状態、まだ爆発していない、休眠状態。
粒子は小さく控えめな輝き、人物の背後の低い位置に配置。
暗い雰囲気の背景、奥行きあり、粒子は見えているが暗い。
カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト、背後の粒子から微かな金色の光。

構図：キャラクターのバストがフレーム中央を占め、背後に粒子が見える、奥行き感。

制約：粒子は人物の背後で見えている必要あり、隠れていない、粒子はまだ上昇していない、目は完全に閉じている。
ネガティブ：開いた目、すでに爆発している粒子、顔の前の粒子、モーションブラー、複数キャラクター。
```

### カメラワーク（時間軸）

```
0-1.2s ── 【静・溜め】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態、穏やかな表情
          背後の粒子: 微かに脈動する光、まだ静止
          フォーカス: 閉じた目と顔（前景）+ 背後の待機粒子（後景）
          カメラ: 完全固定、バストショット構図
          緊張感、予兆の雰囲気

1.2-2.8s ─ 【ピーク - 完全同期の瞬間 + カメラ引き】
          目: ゆっくり開き始める
          背後の粒子: 目が開く瞬間に一気に点火・爆発上昇開始
          ★同期ポイント: 目の動き開始 = 粒子爆発開始★
          粒子は背後から上方へ様々な速度で上昇
          フォーカス: 開く目（前景）← → 爆発上昇する背後の粒子（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことでエフェクトの広がりをダイナミックに見せる★

2.8-4.5s ─ 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          目: 完全に開いた状態、瞳に背後の粒子光が反射
          背後の粒子: 上昇し続け、画面上部で漂う
          粒子は人物の背後・周囲で美しく舞う
          フォーカス: 人物全体 → 背後で漂う粒子全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい余韻、エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character with eyes closed, anime style.
Behind character in background, golden light particles are faintly glowing at lower area, dormant and waiting, not yet moving.
Dark atmospheric background with depth separating foreground character from background particles.

[0-1.2s] BUST SHOT: Character visible from chest up, eyes completely closed, peaceful expression.
Behind character, golden light particles rest at lower background area, gently pulsing but stationary.
Particles clearly visible behind character creating depth, not hidden.
Subtle breathing glow from background particles, anticipation building.
Camera locked on bust shot framing, no movement.

[1.2-2.8s] Eyes begin opening slowly, eyelids lifting upward revealing iris gradually.
SIMULTANEOUSLY at exact moment eyes start opening:
Golden light particles BEHIND character ignite explosively, burst upward from lower background.
★PERFECT SYNCHRONIZATION: eye opening triggers background particle explosion★
Particles shoot upward in background at varying speeds, traveling behind and around character.
Background particles rise dramatically creating beautiful depth.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as explosion happens★
Camera reveals more of the character and the expanding particle field.
Particles remain in background/behind character throughout, not crossing in front of face.

[2.8-4.5s] Eyes fully open, reflections of background particle light visible in eyes.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Background particles continue rising behind character, reach upper background area and float gently.
Particles drift slowly in background space behind and around character, beautiful atmospheric effect.
Slow motion on floating background particles, grand composition showing full effect.
Wide composition reveals the majesty of the particle explosion surrounding character.

Constraints: strict foreground-background separation, start with bust shot end with nearly full body, smooth zoom out during explosion, perfect synchronization at 1.2s between eye opening and background particle explosion, particles never cross in front of face, natural physics-based particle motion in background space, varying particle speeds for depth perception.

Negative: no particles in front of face, no particles hiding behind character (must be visible), no blinking, no multiple particle bursts, no particles moving downward, no foreground-background confusion, no camera shake, no zoom IN, no environmental objects, no multiple characters.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style cinematic sequence: eye opening synchronized with background golden particle explosion, camera pulls back dramatically.

BUST SHOT: Character visible from chest up with closed eyes, peaceful expression. Behind character in background, golden light particles faintly glowing at lower area, dormant, clearly visible creating depth. Dark atmospheric background. Particles not yet moving. Anticipation tension. Camera locked on bust shot. Silence. Duration: 0-1.2 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Eyes begin opening slowly, eyelids lift revealing iris. AT THE EXACT SAME INSTANT: Golden particles BEHIND character in background ignite explosively from lower area, burst upward. ★Perfect sync: eye opening = background explosion★ ★Camera zooms out from bust shot to waist shot★ Particles shoot up in background at varying speeds, traveling behind and around character. Camera reveals expanding particle field as it pulls back. Explosive particle whoosh SFX from behind. Duration: 1.2-2.8 seconds.

Eyes fully open. ★Camera continues pulling back to nearly full body (knee to full shot)★ Background particles continue rising behind character, reach upper background and float gently. Particles drift slowly in background space around character, atmospheric depth effect. Slow motion on background floating particles. Grand wide composition showing full majesty of particle explosion. Soft magical ambient sound. Duration: 2.8-4.5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, golden volumetric particles in background, depth separation, cinematic atmospheric lighting.

Audio: silence builds tension, explosive particle burst whoosh from background at peak moment, gentle magical ambience with depth in float phase.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during explosion, strict depth separation, perfect action-effect sync at 1.2s mark, particles visible in background not hidden, bottom-to-top motion in background space, varying particle speeds for depth perception, particles never in front of face.

Negative: no particles crossing foreground, no particles hidden completely, no zoom IN, no blinking, no multiple bursts, no downward particles, no foreground-background mixing, no shake, no environment elements, no flat composition.
```

---

## パターン2: 目を開く × 4色チョーク（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、4色のチョーク粉（青・赤・黄・緑、背後の4隅に配置） |
| **エフェクト** | 目が開く瞬間に背後の4隅から中心へ向かって粉が爆発的に混合 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed at center, anime style illustration.
Upper body visible from chest up, peaceful expression with closed eyes.
Behind character in background, four colored chalk powder clusters visible at four corners creating depth:
- Top-left corner background: blue chalk powder cluster, clearly visible
- Top-right corner background: red chalk powder cluster, clearly visible
- Bottom-left corner background: yellow chalk powder cluster, clearly visible
- Bottom-right corner background: green chalk powder cluster, clearly visible

All four powder clusters are resting, not yet moving, waiting state.
Powders are in background space behind character, creating depth separation from foreground character.
Dark void background for compositing, powder clusters emit soft colored glow from behind.

Camera: bust shot framing, character centered.
Lighting: soft light on face and hair, four colored glows from background corners.

Composition: Character bust occupies center of frame, four colored powder clusters visible in background at four corners behind character, clear depth separation.

Constraints: four distinct colored powders visible in background corners, character centered foreground, powders clearly visible not hidden, powders not yet moving toward center, clean depth separation.
Negative: no open eyes, no powders already exploding, no powders in front of face, no powders in center yet, no motion blur, no mixed colors yet.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、中央で目を閉じている、アニメスタイルイラスト。
胸から上の上半身が見える、閉じた目で穏やかな表情。
背後の4隅に4色のチョーク粉が溜まって見える、奥行き感あり：
- 左上背後：青いチョーク粉の塊、はっきり見える
- 右上背後：赤いチョーク粉の塊、はっきり見える
- 左下背後：黄色いチョーク粉の塊、はっきり見える
- 右下背後：緑のチョーク粉の塊、はっきり見える

4つの粉は全て静止、まだ動いていない、待機状態。
粉は人物の背後空間にあり、前景のキャラクターと奥行き分離。
合成用の暗い背景、粉の塊は背後から柔らかい色の光を放つ。

カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪に柔らかい光、背後の4隅から4色の光。

構図：キャラクターのバストがフレーム中央を占め、背後の4隅に4色の粉が見える、明確な奥行き分離。

制約：背後の4隅に4色の粉がはっきり見える、キャラクターは前景中央、粉は隠れていない、まだ中心に向かっていない。
ネガティブ：開いた目、すでに爆発している粉、顔の前の粉、中央にすでにある粉、モーションブラー、混ざった色。
```

### カメラワーク（時間軸）

```
0-1.2s ── 【静・溜め】
          構図: バストショット（胸から上）
          目: 中央で完全に閉じた状態、穏やかな表情
          背後の4色の粉: 4隅で静止、微かに色の光を放つ
          左上青/右上赤/左下黄/右下緑が背後で待機
          フォーカス: キャラクターの顔と閉じた目（前景）+ 背後4隅の色（後景）
          カメラ: 完全固定、バストショット構図
          緊張感、4色のエネルギーが溜まっている予兆

1.2-2.5s ─ 【ピーク - 完全同期の瞬間 + カメラ引き】
          目: ゆっくり開き始める
          背後の4色の粉: 目が開く瞬間に4隅から中心へ一斉爆発
          ★同期ポイント: 目の動き開始 = 背後4方向同時爆発★
          4色の粉の流れが背後から中心（キャラクター位置）へ突進
          背後で4色が衝突し始める
          フォーカス: 開く目（前景）← → 背後で中心に向かう4色（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことで4色の衝突をダイナミックに見せる★

2.5-4.5s ─ 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          目: 完全に開いた状態、瞳に4色の反射
          背後の4色の粉: 中心で混ざり合いカラフルな雲を形成
          背後の混合雲がゆっくり拡散、人物の周りで漂う
          フォーカス: 人物全体 → 背後で混ざり合う粉全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい色の余韻、4色エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character with eyes closed at center, anime style.
Behind character in background space, four colored chalk powder clusters positioned at four corners, clearly visible creating depth:
Top-left background: blue powder, top-right background: red powder, bottom-left background: yellow powder, bottom-right background: green powder.
All four powder clusters static and waiting in background, not yet moving.
Dark void background for compositing, depth separation between foreground character and background powders.

[0-1.2s] BUST SHOT: Character visible from chest up, eyes completely closed at center, peaceful expression.
Behind character in background, four colored powder clusters positioned at four corners, completely still.
Background powders emit soft colored glow: blue top-left, red top-right, yellow bottom-left, green bottom-right.
Powders clearly visible in background behind character, creating depth.
Tension building, anticipation of four-way explosion from behind.
Camera locked on bust shot framing.

[1.2-2.5s] Eyes begin opening slowly at center, eyelids lifting.
SIMULTANEOUSLY at exact same instant:
All four chalk powder clusters BEHIND character in background explode inward toward center.
★PERFECT SYNCHRONIZATION: eye opening triggers four-way background powder collision★
Blue from background top-left, red from background top-right, yellow from background bottom-left, green from background bottom-right.
Four powder streams rush toward center in background space in violent acceleration.
Background powder streams collide at center behind character, colors begin mixing in background.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as collision happens★
Camera reveals more of the character and the converging powder streams.
Powders remain in background throughout, creating dramatic depth effect.

[2.5-4.5s] Eyes fully open, four color reflections visible in eyes.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Behind character in background, four colors mixed at center create vibrant colorful explosion cloud.
Background mixed powder cloud slowly expands and disperses gently in background space around character.
Wide composition reveals the majesty of the colorful cloud surrounding character.
Slow motion on background color mixing and dispersal, beautiful color blending behind character.

Constraints: start bust shot end nearly full body, smooth zoom out during collision, strict foreground-background depth separation, four distinct colored background powders, perfect corner-to-center trajectory in background space, simultaneous four-way explosion in background synced with eye opening at 1.2s, colors mix at center in background not in foreground, powders always behind character creating depth, black void background for compositing.

Negative: no powders in front of face, no powders hidden completely, no zoom IN, no blinking, no random powder motion, no gravity fall, no powder from other directions, no powders crossing foreground, no camera shake, no environmental elements, no flat composition.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style four-color chalk powder explosion synchronized with eye opening, camera pulls back dramatically.

BUST SHOT: Character visible from chest up with closed eyes at center, peaceful expression. Behind character in background, four colored chalk powder clusters at four corners creating depth: top-left blue, top-right red, bottom-left yellow, bottom-right green. All static in background. Black void background for compositing. Four colored glows from behind. Tension builds. Camera locked on bust shot. Silence. Duration: 0-1.2 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Eyes begin opening at center, eyelids lift. AT EXACT SAME MOMENT: All four powder clusters BEHIND character in background explode inward toward center simultaneously. ★Perfect sync: eye opening = four-way background collision★ ★Camera zooms out from bust shot to waist shot★ Blue, red, yellow, green streams rush to center in background space. Background powder collision at center. Colors begin mixing in background behind character. Camera reveals expanding collision effect. Four-direction collision SFX from behind. Duration: 1.2-2.5 seconds.

Eyes fully open, four color reflections visible. ★Camera continues pulling back to nearly full body (knee to full shot)★ Behind character, colors mixed at center background form vibrant explosion cloud. Background cloud slowly expands and disperses in background space. Grand wide composition showing full majesty of colorful cloud surrounding character. Slow motion on background color mixing. Colorful magical sound with depth. Duration: 2.5-4.5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, vibrant chalk powder colors in background space, depth separation, black void background for compositing.

Audio: silence builds, four-way collision sound from background at peak moment, magical color shimmer with spatial depth in finale.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during collision, four distinct background corner positions, simultaneous four-way convergence in background space, colors mix at center background behind character, black void background, clear depth separation, background powders visible throughout not hidden.

Negative: no powders in foreground, no zoom IN, no random powder, no gravity fall, no other directions, no powders crossing front, no shake, no flat composition, no foreground-background confusion.
```

---

## パターン3: 目を開く × エネルギー波（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | 閉じた目がゆっくり開き、瞳に光が映る |
| **オブジェクト** | 目（超クローズアップ）、同心円状のエネルギー波（背後に配置） |
| **エフェクト** | 目が開く瞬間に背後の中心からエネルギー波が同心円状に放射 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed at center, anime style illustration.
Upper body visible from chest up, peaceful expression with closed eyes.
Behind character in background space, faint glowing energy core visible at center background, dormant and pulsing gently.
Energy core emits subtle light from behind character, creating depth separation from foreground character.
Core is small concentrated point of light in background, not yet releasing waves, waiting state.
Dark atmospheric background with depth, energy core clearly visible behind character.

Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair, subtle energy glow from background center.

Composition: Character bust occupies center of frame in foreground, small glowing energy core visible in background center behind character, clear depth separation.

Constraints: energy core visible in background behind character not hidden, core not yet releasing waves, eyes completely closed, clean foreground-background separation, core small and concentrated.
Negative: no open eyes, no energy waves already expanding, no energy in front of face, no large explosion yet, no motion blur.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、中央で目を閉じている、アニメスタイルイラスト。
胸から上の上半身が見える、閉じた目で穏やかな表情。
背後の中央空間に微かに光るエネルギーの核が見える、休眠状態で優しく脈動。
エネルギー核は人物の背後から微かな光を放ち、前景のキャラクターと奥行き分離を作る。
核は背後の小さな集中した光の点、まだ波動を放っていない、待機状態。
暗い雰囲気の背景、奥行きあり、エネルギー核は人物の背後にはっきり見える。

カメラ：バストショット構図、キャラクター中央。
ライティング：顔と髪にソフトなリムライト、背後中央から微かなエネルギーの光。

構図：キャラクターのバストが前景のフレーム中央を占め、小さく光るエネルギー核が背後の中央に見える、明確な奥行き分離。

制約：エネルギー核は背後で見える、隠れていない、まだ波動を放っていない、目は完全に閉じている、前景・背景の明確な分離、核は小さく集中。
ネガティブ：開いた目、すでに広がっているエネルギー波、顔の前のエネルギー、大きな爆発、モーションブラー。
```

### カメラワーク（時間軸）

```
0-1.2s ── 【静・溜め】
          構図: バストショット（胸から上）
          目: 完全に閉じた状態、穏やかな表情
          背後のエネルギー核: 中央で微かに脈動、小さな光の点
          背後からリズミカルな光の呼吸
          フォーカス: キャラクターの顔と閉じた目（前景）+ 背後で脈動する核（後景）
          カメラ: 完全固定、バストショット構図
          緊張感、背後でエネルギーが集中している予兆

1.2-2.3s ─ 【ピーク - 完全同期の瞬間 + カメラ引き】
          目: ゆっくり開き始める
          背後のエネルギー: 目が開く瞬間に背後中心から同心円波が爆発放射
          ★同期ポイント: 目の動き開始 = 背後エネルギー波放出★
          第一波が背後の中心から外側へ爆発的に広がる
          背後で円形の衝撃波が拡大
          フォーカス: 開く瞳（前景）← → 背後で広がる波の先端（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことで同心円波の広がりをダイナミックに見せる★

2.3-4.5s ─ 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          目: 完全に開いた状態、瞳が光る
          背後のエネルギー: 連続する同心円波が規則的に脈動放射
          背後から波動が人物の周りを包むように拡大
          フォーカス: 人物全体 → 背後で脈動する波全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい波動の余韻、同心円エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character with eyes closed at center, anime style.
Behind character in background space, small glowing energy core visible at center background, pulsing gently, dormant and ready.
Energy core in background creating depth separation from foreground character.
Dark atmospheric background, energy core clearly visible behind character.

[0-1.2s] BUST SHOT: Character visible from chest up, eyes completely closed at center, peaceful expression.
Behind character in background, subtle energy core pulses at center background, rhythmic faint glow breathing.
Energy core small concentrated point in background space behind character, clearly visible creating depth.
Energy building in background but not yet released, anticipation.
Camera locked on bust shot framing.

[1.2-2.3s] Eyes begin opening slowly at center, eyelids lifting to reveal iris and pupil.
SIMULTANEOUSLY at exact moment eyes start opening:
Concentric energy wave explodes outward from background center core in circular shockwave.
★PERFECT SYNCHRONIZATION: eye opening triggers background energy wave release★
First energy ring expands radially from background center in explosive acceleration.
Circular wave spreads outward rapidly in background space behind character, glowing edge with trailing fade.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as wave expands★
Camera reveals more of the character and the expanding concentric waves.
Energy remains in background throughout, not crossing in front of face.

[2.3-4.5s] Eyes fully open, reflecting background energy light.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Behind character in background, continuous concentric energy waves pulse outward rhythmically from background center.
Multiple rings expanding at regular intervals in background space, creating breathing pulse pattern behind character.
Wide composition reveals the majesty of the concentric wave pattern surrounding character.
Slow motion on background wave propagation, beautiful circular pattern.

Constraints: start bust shot end nearly full body, smooth zoom out during wave expansion, strict foreground-background depth separation, concentric circular wave pattern in background space, perfect synchronization at 1.2s between eye opening and background wave burst, waves originate from background center behind character, regular rhythmic pulse in background finale, energy never crosses foreground.

Negative: no energy in front of face, no energy hidden completely, no zoom IN, no blinking, no irregular wave pattern, no multiple burst sources, no energy crossing foreground, no camera shake, no background environmental elements, no flat composition.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style concentric energy wave synchronized with eye opening, camera pulls back dramatically.

BUST SHOT: Character visible from chest up with closed eyes at center, peaceful expression. Behind character in background, small glowing energy core at center background, faint rhythmic pulse. Energy breathing in background space. Dark atmospheric background. Depth separation. Energy core visible behind character. Camera locked on bust shot. Pulsing hum sound from behind. Duration: 0-1.2 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Eyes begin opening at center, eyelids reveal pupils. AT EXACT SAME INSTANT: Concentric energy wave explodes from background center core in circular shockwave. ★Perfect sync: eye opening = background energy burst★ ★Camera zooms out from bust shot to waist shot★ First ring expands radially outward rapidly in background space behind character. Camera reveals expanding wave pattern. Explosive energy burst SFX from behind. Duration: 1.2-2.3 seconds.

Eyes fully open, reflecting background energy. ★Camera continues pulling back to nearly full body (knee to full shot)★ Behind character in background, continuous concentric waves pulse outward rhythmically from background center. Multiple rings expanding regularly in background space behind character. Grand wide composition showing full majesty of concentric wave pattern. Slow motion on background wave propagation. Rhythmic bass pulse sound with depth. Duration: 2.3-4.5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, energy wave effect in background space, circular concentric pattern in background, depth separation.

Audio: pulsing hum from behind builds, explosive burst from background at peak, rhythmic bass pulse with spatial depth in finale.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during wave expansion, circular wave pattern in background space, perfect sync at 1.2s, waves from background center behind character, regular rhythmic pulse in background, clear depth separation, energy visible in background not hidden.

Negative: no energy in foreground, no zoom IN, no irregular waves, no multiple sources, no energy crossing front, no shake, no flat composition, no foreground-background confusion.
```

---

## パターン4: 顔を上げる × 光の粒子（背後）

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

Bust shot of character looking downward, anime style illustration, shadowed expression somber mood.
Upper body visible from chest up, eyes closed or downcast, face cast in shadow from above.
Behind character in background space at lower area, golden light particles faintly glowing, dormant and waiting.
Particles visible at bottom background behind character, not yet rising, resting state creating depth.
Dark atmospheric background with depth separation between foreground character and background particles.

Camera: bust shot framing on downcast character, slightly high angle looking down.
Lighting: shadowed lighting on face from above, faint golden glow from background particles at bottom.

Composition: Character bust occupies center in foreground, background particles visible behind and around character at lower area, clear depth separation.

Constraints: particles visible in background behind character not hidden, particles not yet rising, face downcast and shadowed, clean foreground-background separation, particles at lower background position.
Negative: no face looking up, no particles already exploding or rising, no particles in front of face, no bright lighting on face yet, no motion blur.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、うつむいている、アニメスタイルイラスト、影のある暗い表情。
胸から上の上半身が見える、目は閉じているか伏せている、顔は上から影を落とされている。
背後の下部空間に金色の光粒子が微かに光って待機、休眠状態。
背後の下部に粒子が見える、まだ上昇していない、静止状態で奥行き感を作る。
暗い雰囲気の背景、前景のキャラクターと背後の粒子に奥行き分離。

カメラ：うつむいたキャラクターのバストショット、やや上からのハイアングル。
ライティング：顔に上から影のある照明、背後下部の粒子から微かな金色の光。

構図：キャラクターのバストが前景中央を占め、背後の下部に粒子が見える、明確な奥行き分離。

制約：粒子は背後で見える、隠れていない、まだ上昇していない、顔はうつむいて影がある、前景・背景の明確な分離、粒子は背後の低い位置。
ネガティブ：上を向いた顔、すでに爆発や上昇している粒子、顔の前の粒子、顔の明るい照明、モーションブラー。
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

1.3-3s ─── 【ピーク - 完全同期の瞬間 + カメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後の光粒子: 顔が上がる瞬間に背後の下部から一気に爆発上昇
          ★同期ポイント: 顔の上昇開始 = 背後粒子爆発上昇★
          背後の粒子が上方へ勢いよく上昇、顔の周りを包むように
          背後で上昇する粒子が人物の周囲を取り囲む
          フォーカス: 上がる顔（前景）← → 背後で爆発上昇する粒子（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことで粒子の爆発上昇をダイナミックに見せる★

3-5s ──── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、光を受ける
          背後の光粒子: 背後で顔の周りを漂う、舞い続ける
          背後の粒子光が顔を照らす、表情が見える
          フォーカス: 人物全体 → 背後で舞う粒子全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい光の余韻、粒子エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character looking downward, anime style, shadowed lighting creating somber mood.
Upper body visible from chest up, face cast in shadow, eyes closed or downcast, hopeless expression.
Behind character in background space at lower area, golden light particles faintly glowing, dormant and waiting, clearly visible creating depth.
Dark atmospheric background with depth separation.

[0-1.3s] BUST SHOT: Character visible from chest up, face downward, expression shadowed and somber.
Eyes closed or looking down, still and quiet, dark mood.
Behind character in background at lower area, golden light particles dormant, faint glow, waiting.
Particles visible in background behind character creating depth, not hidden.
Camera locked on bust shot framing, slightly high angle looking down at bowed character.

[1.3-3s] Character begins slowly raising face upward, chin lifting.
SIMULTANEOUSLY at exact moment face starts lifting:
Golden light particles BEHIND character in background explode upward violently from lower background area.
★PERFECT SYNCHRONIZATION: face raising triggers background particle explosion★
Particles shoot upward in background space at varying speeds, traveling behind and around character as face rises.
Background particles surround character from behind, enveloping character while staying in background.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as explosion happens★
Camera reveals more of the character and the expanding particle field.
Focus tracks rising character ← → background exploding upward particles.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Light illuminates face from above and from background particles.
Behind character in background, golden light particles floating gently around character, drifting slowly in background space.
Wide composition reveals the majesty of the particle explosion surrounding character.
Slow motion on background floating particles, grand atmospheric depth effect.

Constraints: start bust shot end nearly full body, smooth zoom out during explosion, strict foreground-background depth separation, perfect synchronization at 1.3s between face raising and background particle explosion from lower area, background particles surround and follow face upward while staying in background space, natural physics with varying particle speeds in background, lighting on face changes from dark to bright, particles never cross in front of face.

Negative: no rapid motion, no blinking, no smile (peaceful expression only), no particles in foreground, no particles hidden completely, no camera shake, no zoom IN, no multiple particle bursts, no environmental elements, no flat composition, no foreground-background confusion.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style face raising synchronized with background golden particle explosion, camera pulls back dramatically.

BUST SHOT: Character visible from chest up, face downcast, shadowed, somber expression. Eyes closed or looking down. Behind character in background at lower area, golden particles dormant, faint glow, clearly visible creating depth. Dark mood. Camera locked on bust shot, high angle. Silence. Duration: 0-1.3 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Face begins lifting upward, chin rises. AT EXACT SAME INSTANT: Golden particles BEHIND character in background ignite explosively from lower area, burst upward violently in background space surrounding rising character from behind. ★Perfect sync: face lifting = background explosion★ ★Camera zooms out from bust shot to waist shot★ Background particles envelop character from behind as face lifts. Camera reveals expanding particle field. Explosive particle whoosh SFX from behind. Duration: 1.3-3 seconds.

Smart Cut: Face fully raised, eyes open, peaceful expression. ★Camera continues pulling back to nearly full body (knee to full shot)★ Light floods face from above. Behind character in background, particles float gently around character in background space. Grand wide composition showing full majesty of particle explosion. Slow motion. Uplifting music swells. Duration: 3-5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, golden volumetric particles in background space, depth separation, dramatic lighting shift dark-to-bright.

Audio: silence builds tension, explosive particle burst from background with face lift, uplifting orchestral music with spatial depth in finale.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during explosion, strict depth separation, particles always in background behind character, perfect sync at 1.3s, background particles from bottom surround character while staying in background, lighting transforms naturally, background particles visible not hidden.

Negative: no rapid motion, no smile (peaceful only), no particles in foreground, no shake, no zoom IN, no multiple bursts, no environment, no flat composition, no foreground-background mixing.
```

---

## パターン5: 顔を上げる × 4色チョーク（背後）

| 要素 | 内容 |
|------|------|
| **アクション** | うつむいた顔を上げ、光を受ける |
| **オブジェクト** | 顔（クローズアップ）、4色のチョーク粉（青・赤・黄・緑、背後の4隅に配置） |
| **エフェクト** | 顔が上を向く瞬間に背後の4隅から顔の位置へ向かって粉が爆発、背後で混合 |

### 開始フレーム用プロンプト（静止画生成用）

**KLING v3 / Ideogram V3 / Flux推奨:**
```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character looking downward at center, anime style illustration, shadowed expression.
Upper body visible from chest up, eyes closed, face cast in shadow, somber mood.
Behind character in background space, four colored chalk powder clusters visible at four corners creating depth:
- Top-left corner background: blue chalk powder cluster, clearly visible
- Top-right corner background: red chalk powder cluster, clearly visible
- Bottom-left corner background: yellow chalk powder cluster, clearly visible
- Bottom-right corner background: green chalk powder cluster, clearly visible

All four powder clusters resting in background, not yet moving, waiting state.
Powders in background space behind character, creating depth separation from foreground character.
Black void background for compositing, powder clusters emit soft colored glow from behind.

Camera: bust shot framing on downcast character at center, slightly high angle.
Lighting: shadowed light on face, four colored glows from background corners.

Composition: Character bust occupies center in foreground, four colored powder clusters visible in background at four corners behind character, clear depth separation.

Constraints: four distinct colored powders visible in background corners, character centered foreground downcast, powders clearly visible not hidden, powders not yet moving toward face, clean depth separation.
Negative: no face looking up, no powders already exploding, no powders in front of face, no powders at center yet, no motion blur, no mixed colors yet.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、中央でうつむいている、アニメスタイルイラスト、影のある表情。
胸から上の上半身が見える、目は閉じている、顔は影を落とされている、暗いムード。
背後の4隅に4色のチョーク粉が見える、奥行き感あり：
- 左上背後：青いチョーク粉の塊、はっきり見える
- 右上背後：赤いチョーク粉の塊、はっきり見える
- 左下背後：黄色いチョーク粉の塊、はっきり見える
- 右下背後：緑のチョーク粉の塊、はっきり見える

4つの粉は全て背後で静止、まだ動いていない、待機状態。
粉は人物の背後空間にあり、前景のキャラクターと奥行き分離。
合成用の黒い背景、粉の塊は背後から柔らかい色の光を放つ。

カメラ：中央のうつむいたキャラクターのバストショット、やや上からのハイアングル。
ライティング：顔に影のある光、背後の4隅から4色の光。

構図：キャラクターのバストが前景中央を占め、背後の4隅に4色の粉が見える、明確な奥行き分離。

制約：背後の4隅に4色の粉がはっきり見える、キャラクターは前景中央でうつむき、粉は隠れていない、まだ顔に向かっていない。
ネガティブ：上を向いた顔、すでに爆発している粉、顔の前の粉、中央にすでにある粉、モーションブラー、混ざった色。
```

### カメラワーク（時間軸）

```
0-1.3s ── 【静・溜め】
          構図: バストショット（胸から上）
          顔: 中央でうつむき、影の中、暗い表情
          背後の4色の粉: 4隅で静止、微かに色の光を放つ
          左上青/右上赤/左下黄/右下緑が背後で待機
          フォーカス: うつむいたキャラクター（前景）+ 背後4隅の色（後景）
          カメラ: 固定バストショット、やや上から
          孤独感、4色のエネルギーが背後で溜まっている予兆

1.3-3s ─── 【ピーク - 完全同期の瞬間 + カメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後の4色の粉: 顔が上がる瞬間に背後の4隅から顔の位置へ一斉爆発
          ★同期ポイント: 顔の上昇開始 = 背後4方向同時爆発★
          4色の粉の流れが背後から顔の位置（中央）へ突進
          背後で4色が顔の周辺位置で衝突し始める
          フォーカス: 上がる顔（前景）← → 背後で顔位置に向かう4色（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことで4色の衝突をダイナミックに見せる★

3-5s ──── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、表情が見える
          背後の4色の粉: 背後で混ざり合いカラフルな雲を形成
          背後の混合雲が人物の周りで拡散、顔を照らす
          フォーカス: 人物全体 → 背後で混ざり合う粉全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい色の余韻、4色エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character looking downward at center, anime style, shadowed expression.
Upper body visible from chest up, face cast in shadow, eyes closed, somber mood.
Behind character in background space, four colored chalk powder clusters positioned at four corners, clearly visible creating depth:
Top-left background: blue powder, top-right background: red powder, bottom-left background: yellow powder, bottom-right background: green powder.
All four powder clusters static in background, waiting, not yet moving.
Black void background for compositing, depth separation between foreground character and background powders.

[0-1.3s] BUST SHOT: Character visible from chest up, face downward at center, expression shadowed, eyes closed.
Behind character in background, four colored powder clusters at four corners, completely still.
Background powders emit soft colored glow: blue top-left, red top-right, yellow bottom-left, green bottom-right.
Powders clearly visible in background behind character, creating depth.
Tension building, anticipation of four-way explosion from behind.
Camera locked on bust shot framing, slightly high angle looking down at bowed character.

[1.3-3s] Character begins slowly raising face upward, chin lifting.
SIMULTANEOUSLY at exact same instant:
All four chalk powder clusters BEHIND character in background explode inward toward face position at center.
★PERFECT SYNCHRONIZATION: face raising triggers four-way background powder collision★
Blue from background top-left, red from background top-right, yellow from background bottom-left, green from background bottom-right.
Four powder streams rush toward face position in background space in violent acceleration.
Background powder streams collide at face position behind character as face rises, colors begin mixing in background.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as collision happens★
Camera reveals more of the character and the converging powder streams.
Powders remain in background throughout, creating dramatic depth effect.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Behind character in background, four colors mixed around face position create vibrant colorful explosion cloud.
Background mixed powder cloud slowly expands and disperses gently in background space surrounding character.
Wide composition reveals the majesty of the colorful cloud surrounding character.
Slow motion on background color mixing and dispersal, beautiful color blending behind character.

Constraints: start bust shot end nearly full body, smooth zoom out during collision, strict foreground-background depth separation, four distinct colored background powders, perfect corner-to-face trajectory in background space, simultaneous four-way explosion in background synced with face raising at 1.3s, colors mix at face position in background, powders always behind character creating depth, black void background for compositing.

Negative: no powders in front of face, no rapid head motion, no smile (peaceful only), no powders hidden completely, no zoom IN, no blinking, no random powder motion, no gravity fall, no powder from other directions, no powders crossing foreground, no camera shake, no environmental elements, no flat composition.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style four-color chalk powder explosion synchronized with face raising, camera pulls back dramatically.

BUST SHOT: Character visible from chest up, face downcast at center, shadowed, eyes closed. Behind character in background, four colored powders at corners creating depth: top-left blue, top-right red, bottom-left yellow, bottom-right green. All static in background. Black void background for compositing. Four colored glows from behind. Somber mood. Camera locked on bust shot, high angle. Silence. Duration: 0-1.3 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Face begins lifting upward, chin rises. AT EXACT SAME INSTANT: All four powder clusters BEHIND character in background explode inward toward face position at center simultaneously. ★Perfect sync: face raising = four-way background collision★ ★Camera zooms out from bust shot to waist shot★ Blue, red, yellow, green streams rush to face position in background space. Background powder collision at face position as face rises. Camera reveals expanding collision effect. Four-direction collision SFX from behind. Duration: 1.3-3 seconds.

Smart Cut: Face fully raised, eyes open, peaceful expression. ★Camera continues pulling back to nearly full body (knee to full shot)★ Behind character in background, colors mixed around face position form vibrant explosion cloud. Background cloud slowly expands in background space. Grand wide composition showing full majesty of colorful cloud surrounding character. Slow motion on background color mixing. Colorful uplifting music with spatial depth. Duration: 3-5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, vibrant chalk powders in background space, depth separation, black void background for compositing.

Audio: silence builds, four-way collision sound from background at peak moment, magical color shimmer with spatial depth in finale.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during collision, four distinct background corner positions, simultaneous four-way convergence in background space to face position, colors mix in background around character, black void background, clear depth separation, background powders visible not hidden.

Negative: no powders in foreground, no rapid motion, no smile (peaceful only), no zoom IN, no random powder, no gravity, no other directions, no powders crossing front, no shake, no flat composition, no foreground-background confusion.
```

---

## パターン6: 顔を上げる × エネルギー波（背後）

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

Bust shot of character looking downward, anime style illustration, shadowed expression.
Upper body visible from chest up, eyes closed or downcast, face cast in shadow, somber mood.
Behind character in background space at center area, faint glowing energy core visible, dormant and pulsing gently.
Energy core in background creating depth separation from foreground character.
Core emits subtle rhythmic glow from behind character, small concentrated point.
Dark atmospheric background with depth, energy core clearly visible behind character.

Camera: bust shot framing on downcast character, slightly high angle looking down.
Lighting: shadowed lighting on face from above, subtle energy pulse glow from background center.

Composition: Character bust occupies center in foreground, small glowing energy core visible in background center behind character, clear depth separation.

Constraints: energy core visible in background behind character not hidden, core not yet releasing waves, face downcast and shadowed, clean foreground-background separation, core small and concentrated in background.
Negative: no face looking up, no energy waves already expanding, no energy in front of face, no large explosion yet, no bright lighting on face yet, no motion blur.
```

**日本語版:**
```
新海誠アニメスタイル、柔らかい光、レンズフレア、シネマティックな色調、大気の奥行き、高品質アニメーション。
新海誠の特徴的なスタイル：フォトリアルな背景、美しい空、繊細な光線。
シネマティック構図、16:9アスペクト比。

キャラクターのバストショット、うつむいている、アニメスタイルイラスト、影のある表情。
胸から上の上半身が見える、目は閉じているか伏せている、顔は影を落とされている、暗いムード。
背後の中央空間に微かに光るエネルギーの核が見える、休眠状態で優しく脈動。
エネルギー核は背後にあり、前景のキャラクターと奥行き分離を作る。
核は人物の背後から微かなリズミカルな光を放つ、小さな集中した点。
暗い雰囲気の背景、奥行きあり、エネルギー核は人物の背後にはっきり見える。

カメラ：うつむいたキャラクターのバストショット、やや上からのハイアングル。
ライティング：顔に上から影のある照明、背後中央から微かなエネルギーの脈動光。

構図：キャラクターのバストが前景中央を占め、小さく光るエネルギー核が背後の中央に見える、明確な奥行き分離。

制約：エネルギー核は背後で見える、隠れていない、まだ波動を放っていない、顔はうつむいて影がある、前景・背景の明確な分離、核は背後で小さく集中。
ネガティブ：上を向いた顔、すでに広がっているエネルギー波、顔の前のエネルギー、大きな爆発、顔の明るい照明、モーションブラー。
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

1.3-2.8s ─ 【ピーク - 完全同期の瞬間 + カメラ引き】
          顔: ゆっくり上がり始める、顎が持ち上がる
          背後のエネルギー: 顔が上がる瞬間に背後中心から同心円波が爆発放射
          ★同期ポイント: 顔の上昇開始 = 背後エネルギー波放出★
          第一波が背後の中心から外側へ爆発的に広がる
          背後で円形の衝撃波が人物の周りを包むように拡大
          フォーカス: 上がる顔（前景）← → 背後で広がる波の先端（後景）
          カメラ: 爆発と同時にズームアウト開始（バストショット→ウエストショットへ）
          ★カメラが引くことで同心円波の広がりをダイナミックに見せる★

2.8-5s ─── 【スロー・余韻 + さらに引き】
          構図: ほぼ全身（ニーショット〜フルショット）
          顔: 完全に上を向いた状態、表情が見える
          背後のエネルギー: 連続する同心円波が規則的に脈動放射
          背後から波動が人物の周りを包み、顔を照らす
          フォーカス: 人物全体 → 背後で脈動する波全体
          カメラ: 継続してズームアウト（最終的にほぼ全身が収まる構図へ）
          スローモーション適用、美しい波動の余韻、同心円エフェクト全体が見える壮大な構図
```

### KLING v3 動画プロンプト

```
Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth.

Bust shot of character looking downward, anime style, shadowed expression.
Upper body visible from chest up, face cast in shadow, eyes closed or downcast, somber mood.
Behind character in background space at center, small glowing energy core visible, pulsing gently, rhythmic faint glow breathing.
Energy core in background creating depth separation from foreground character.
Dark atmospheric background, energy core clearly visible behind character.

[0-1.3s] BUST SHOT: Character visible from chest up, face downward, expression shadowed, eyes closed or downcast.
Behind character in background at center, faint energy core pulses, rhythmic glow breathing through background space.
Energy core small concentrated point in background behind character, clearly visible creating depth.
Energy building in background but not yet released, anticipation.
Camera locked on bust shot framing, slightly high angle looking down at bowed character.

[1.3-2.8s] Character begins slowly raising face upward, chin lifting.
SIMULTANEOUSLY at exact moment face starts lifting:
Concentric energy wave explodes outward from background center core in circular shockwave.
★PERFECT SYNCHRONIZATION: face raising triggers background energy wave release★
First energy ring expands radially from background center in explosive acceleration.
Circular wave spreads outward rapidly in background space behind character, surrounding character from behind.
★CAMERA PULLS BACK: zoom out from bust shot to waist shot as wave expands★
Camera reveals more of the character and the expanding concentric waves.
Background energy wave glowing edge with trailing fade, creating dramatic depth effect.
Energy remains in background throughout, not crossing in front of face.

[2.8-5s] Face fully raised looking upward, eyes open, peaceful expression.
★CAMERA CONTINUES PULLING BACK: zoom out to nearly full body (knee shot to full shot)★
Behind character in background, continuous concentric energy waves pulse outward rhythmically from background center.
Multiple rings expanding at regular intervals in background space, creating breathing pulse pattern surrounding character.
Wide composition reveals the majesty of the concentric wave pattern surrounding character.
Face illuminated by background energy light, expression visible.
Slow motion on background wave propagation, beautiful circular pattern.

Constraints: start bust shot end nearly full body, smooth zoom out during wave expansion, strict foreground-background depth separation, concentric circular wave pattern in background space, perfect synchronization at 1.3s between face raising and background wave burst, waves originate from background center behind character, regular rhythmic pulse in background finale, energy never crosses foreground.

Negative: no energy in front of face, no rapid head motion, no smile (peaceful only), no energy hidden completely, no zoom IN, no blinking, no irregular wave pattern, no multiple burst sources, no energy crossing foreground, no camera shake, no background environmental elements, no flat composition.
```

### VIDU Q3 動画プロンプト

```
Makoto Shinkai anime style concentric energy wave synchronized with face raising, camera pulls back dramatically.

BUST SHOT: Character visible from chest up, face downcast, shadowed, eyes closed. Behind character in background at center, small glowing energy core, faint rhythmic pulse. Energy breathing in background space. Dark atmospheric background. Depth separation. Energy core visible behind character. Camera locked on bust shot, high angle. Pulsing hum sound from behind. Duration: 0-1.3 seconds.

PEAK SYNCHRONIZATION + CAMERA PULL BACK: Face begins lifting upward, chin rises. AT EXACT SAME INSTANT: Concentric energy wave explodes from background center core in circular shockwave. ★Perfect sync: face raising = background energy burst★ ★Camera zooms out from bust shot to waist shot★ First ring expands radially outward rapidly in background space behind character, surrounding character. Camera reveals expanding wave pattern. Explosive energy burst SFX from behind. Duration: 1.3-2.8 seconds.

Smart Cut: Face fully raised, eyes open, peaceful expression. ★Camera continues pulling back to nearly full body (knee to full shot)★ Behind character in background, continuous concentric waves pulse outward rhythmically from background center. Multiple rings expanding regularly in background space surrounding character. Grand wide composition showing full majesty of concentric wave pattern. Slow motion on background wave propagation. Rhythmic bass pulse with uplifting melody, spatial depth. Duration: 2.8-5 seconds.

Visual style: Makoto Shinkai anime, soft lighting, lens flare, bust shot to full body zoom out, energy wave effect in background space, circular concentric pattern, depth separation.

Audio: pulsing hum from behind builds, explosive burst from background at peak, rhythmic bass pulse with uplifting music and spatial depth in finale.

Constraints: start bust shot end nearly full body, smooth continuous zoom out during wave expansion, circular wave pattern in background space, perfect sync at 1.3s, waves from background center behind character, regular rhythmic pulse in background, clear depth separation, energy visible in background not hidden.

Negative: no energy in foreground, no rapid motion, no smile (peaceful only), no zoom IN, no irregular waves, no multiple sources, no energy crossing front, no shake, no flat composition, no foreground-background confusion.
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
   ※カメラワーク: 爆発と共にズームアウト（バストショット→ほぼ全身）

3. 合成・編出
   ↓
   黒背景素材をスクリーン/加算合成でキャラクターに重ねる
```

### 重要な技術ポイント

1. **奥行き分離（Depth Separation）**
   - 前景（人物）と後景（エフェクト）を明確に分離
   - エフェクトは常に背後に配置、人物の前を横切らない
   - この構造により自然な合成が可能

2. **完全同期（Perfect Synchronization）**
   - 目を開く瞬間 = 背後でエフェクト爆発（1.2秒時点）
   - 顔が上がる瞬間 = 背後でエフェクト爆発（1.3秒時点）
   - ★マークで同期ポイントを明示

3. **開始フレームの「待機状態」設計**
   - エフェクトが見えているが爆発していない
   - 人物に隠れず、AIが認識できる程度に配置
   - 爆発の予兆として視覚的に存在
   - **構図: バストショット（胸から上）**

4. **キーイングの3段階**
   - 【静・溜め】: 0-1.2/1.3秒、緊張感・予兆（バストショット固定）
   - 【ピーク】: 1.2/1.3秒、爆発的な同期の瞬間 + **カメラ引き開始**
   - 【スロー・余韻】: 最後まで、美しさ・感情浸透 + **ほぼ全身まで引き**

5. **カメラワーク「引き」の設計**
   - 開始: バストショット（胸から上）
   - ピーク時: ウエストショット（腰から上）へズームアウト開始
   - 終了: ニーショット〜フルショット（ほぼ全身）
   - 目的: エフェクトの壮大さをダイナミックに見せる

6. **新海誠スタイルプロンプト**
   - 全プロンプトの冒頭に統一スタイル追加
   - `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth`
   - 繊細な光、美しい背景、感情的な表現

### プロンプトの構造

全てのプロンプトは以下の構造で統一:

```
- Shot Description（構図説明）
- Foreground-Background Setup（前景・後景の配置）
- Time-based Camera Work（時間軸のカメラワーク）
  [0-Xs] 静・溜め
  [X-Ys] ピーク・同期
  [Y-Zs] スロー・余韻
- Constraints（制約）: 必ず守るべき要素
- Negative（禁止事項）: 避けるべき要素
```

### モデル選択推奨

- **KLING v3**:
  - 複雑な奥行き制御、前景・後景分離に強い
  - 特にパターン2,5の4色同時制御に最適
  - 時間軸の精密な同期制御が可能
  - **スムーズなズームアウト（カメラ引き）に対応**

- **VIDU Q3**:
  - 16秒長尺対応、Smart Cuts機能
  - ネイティブオーディオで音響効果統合
  - 空間的な音響の深さ表現に優れる
  - **ダイナミックなカメラワーク変化に対応**

### 合成時のヒント

- 開始フレーム: Nanobanana / Ideogram V3 / Fluxで高品質アニメスタイル生成
- **開始フレーム構図: 必ずバストショット（胸から上）で生成**
- エフェクト素材: 黒背景（void background）で生成
- 合成モード: スクリーン or 加算（Add）
- 同期調整: エフェクトの爆発ピークを1.2/1.3秒に配置
- **カメラワーク: 爆発と共にバストショット→ほぼ全身へズームアウト**
- 追加調整: カラーグレーディング、グロー効果で統一感を出す
- **スタイル: 新海誠風プロンプトを冒頭に追加済み**

全6パターンで、Image-to-Video対応の転換点演出が完璧に実現できます。開始フレームと動画プロンプトの両方を用意したので、確実に意図通りの同期演出が制作可能です！

**今回の更新内容:**
- 新海誠風スタイルプロンプトを全パターンの冒頭に追加
- 構図を超クローズアップからバストショットに変更
- カメラワーク「引き」を追加（バストショット→ほぼ全身）
- エフェクト爆発のダイナミックさを最大限に見せる設計
