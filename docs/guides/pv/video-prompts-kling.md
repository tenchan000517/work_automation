# Kling AI 動画生成プロンプト集

## 基本情報

| 項目 | 内容 |
|------|------|
| 動画生成AI | Kling AI |
| モード | Image to Video |
| 入力 | 開始フレーム画像 |
| 出力 | 5秒動画 |
| 解像度 | 1080p推奨 |

---

## Kling プロンプトの基本構造

Image-to-Video では開始画像がシーンを提供するため、以下に集中：

```
[主体（Subject）] + [動き（Movement）] + [カメラワーク（Camera）] + [雰囲気（Mood）]
```

### 注意事項
- 1プロンプト = 1アクション（詰め込みすぎない）
- 複雑な回転や物理的動きは避ける
- 「stable camera movement」で歪み防止
- 具体的な数字（5本の木など）は避ける

---

## シーン別 動画生成プロンプト

---

## シーン1：日常と迷い（0-5秒）

**入力画像:** 屋上に立つ17歳学生（後ろ姿）、夕焼け空

### Kling プロンプト

```
The male student stands still on the rooftop. Camera slowly pans upward toward the dramatic sunset sky. Clouds drift across the orange and purple sky at moderate speed. His black hair gently sways in the wind. Contemplative, emotional atmosphere. Stable camera movement.
```

### 設定
- Duration: 5 seconds
- Mode: Standard / Professional
- Aspect Ratio: 16:9

---

## シーン2：目覚め（5-10秒）

**入力画像:** 教室でうつむく17歳学生

### Kling プロンプト

```
The student sits with his head bowed in the quiet classroom. He slowly raises his head, eyes opening wider as if struck by a sudden realization. Warm afternoon sunlight catches his face as he looks up. His expression transforms from uncertainty to quiet determination. Gentle dust particles float in the light beams. Emotional, pivotal moment. Stable camera with subtle focus shift to his eyes.
```

### 設定
- Duration: 5 seconds
- Mode: Standard / Professional
- Aspect Ratio: 16:9

### 演出意図
- 下向き → 上向き で感情の変化を表現
- シーン1の「空を見上げる」と呼応
- 「何かに気づいた」瞬間を捉える

---

## シーン3：現場への一歩（10-15秒）

**入力画像:** 工場入口に向かう作業員の足元（ローアングル）

### Kling プロンプト

```
Low angle shot of the worker's legs walking forward steadily. Safety boots step firmly on concrete floor. The massive factory door slowly opens wider. Bright orange light from inside gradually floods the frame. Dust particles float in the light beams. Dramatic, anticipatory atmosphere. Stable camera, slight forward tracking.
```

### 設定
- Duration: 5 seconds
- Mode: Standard / Professional
- Aspect Ratio: 16:9

---

## シーン4：注湯作業 - クライマックス（15-20秒）

**入力画像:** 溶湯を注ぐ準備をする作業員

### Kling プロンプト

```
The worker tilts the large ladle. Glowing orange molten iron pours down into the casting mold. Hundreds of bright sparks fly dynamically in all directions, some toward the camera. Steam rises intensely. The worker's silhouette is dramatic against the orange glow. High energy, climactic moment. Slight camera shake for impact.
```

### 設定
- Duration: 5 seconds
- Mode: Professional（推奨）
- Aspect Ratio: 16:9

---

## シーン5：職人の眼差し（20-25秒）

**入力画像:** 保護メガネをした作業員の顔アップ

### Kling プロンプト

```
Extreme close-up of the worker's face. He nods slightly with confidence. His mouth opens as if shouting brief instructions. Orange firelight flickers across his face and reflects in his safety goggles. Sweat beads glisten on his cheek. Intense, focused atmosphere. Stable camera with subtle breathing motion.
```

### 設定
- Duration: 5 seconds
- Mode: Standard / Professional
- Aspect Ratio: 16:9

---

## シーン6：製品と社会（25-30秒）

**入力画像:** 完成したエンジンブロック（工場内）

### Kling プロンプト

```
Steam rises gently from the polished engine block surface. Camera slowly zooms out, transitioning to reveal a sleek car driving on a coastal highway. The car moves smoothly along the road with speed blur. Bright blue sky and sparkling ocean in background. Optimistic, triumphant mood. Smooth camera transition.
```

### 設定
- Duration: 5 seconds
- Mode: Professional（推奨・トランジションあり）
- Aspect Ratio: 16:9

**注意:** このシーンはトランジションが複雑なため、2つの動画に分けて後で編集することを推奨

#### 代替案（2分割）

**シーン6A：エンジンブロック**
```
Steam rises gently from the polished metal engine block. Camera slowly zooms out to reveal more of the industrial setting. Professional lighting highlights the craftsmanship. Proud, accomplished atmosphere. Smooth, stable zoom out.
```

**シーン6B：走る車**
```
A sleek modern car drives along a beautiful coastal highway. Speed blur and motion lines show fast movement. Bright blue sky with white clouds above. Sparkling ocean visible to the side. Freedom, optimism. Stable tracking shot.
```

---

## シーン7：地図に残る仕事（30-35秒）

**入力画像:** 夕暮れの巨大インフラを見渡す作業員（後ろ姿）

### Kling プロンプト

```
Wide shot of the worker standing on the elevated platform. Camera slowly pulls back to reveal the massive bridge infrastructure stretching into the distance. The worker takes a deep breath, his shoulders rising slightly then relaxing. City lights begin to twinkle below. Purple and orange twilight sky. Reflective, proud atmosphere. Slow, smooth dolly out.
```

### 設定
- Duration: 5 seconds
- Mode: Standard / Professional
- Aspect Ratio: 16:9

---

## シーン8：未来へ（35-40秒）

**入力画像:** 朝の光の中に立つ作業員（顔アップ or 上半身）

### Kling プロンプト

```
The young worker looks up toward the sky with determined eyes. Camera rapidly pans upward following his gaze, sweeping dramatically into the bright blue morning sky. Lens flare bursts across the frame as the camera reaches the sun. Clouds drift peacefully in the vast open sky. Powerful, liberating, hopeful finale. Dynamic upward camera movement with momentum.
```

### 設定
- Duration: 5 seconds
- Mode: Professional（推奨）
- Aspect Ratio: 16:9

### 演出意図
- シーン1（夕焼け空を見上げる学生）との対比
- 過去の迷いから → 未来への確信へ
- 勢いのあるカメラワークで希望を表現

---

## シーン9：ロゴ（40-45秒）

**入力画像:** 鋳型に溶湯を注ぐトップダウンショット

### Kling プロンプト

```
Top-down view of the casting mold. Glowing orange molten metal fills the mold shape forming text characters. Sparks fly gently around the edges. The metal gradually cools, transitioning from bright orange to solid dark iron. Steam rises softly. The company name "ゆめスタ" becomes visible. Elegant, conclusive atmosphere. Static camera, no movement.
```

### 設定
- Duration: 5 seconds
- Mode: Professional（推奨・テキスト生成）
- Aspect Ratio: 16:9

**注意:** テキスト生成は難しいため、以下の代替案を推奨

#### 代替案（テキストは後から合成）

```
Top-down view of the casting mold. Glowing orange molten metal fills the mold shape. Sparks fly gently around the edges. The metal gradually cools, transitioning from bright orange to solid dark iron. Steam rises softly from the cooling surface. Elegant, conclusive atmosphere. Static camera.
```

→ 「ゆめスタ」テキストは動画編集ソフトでオーバーレイ

---

## 生成チェックリスト

### 動画生成（Kling）
- [ ] シーン1：日常と迷い
- [ ] シーン2：熱への憧れ
- [ ] シーン3：現場への一歩
- [ ] シーン4：注湯作業（クライマックス）
- [ ] シーン5：職人の眼差し
- [ ] シーン6A：エンジンブロック
- [ ] シーン6B：走る車
- [ ] シーン7：地図に残る仕事
- [ ] シーン8：未来へ
- [ ] シーン9：ロゴ（溶湯→冷却）

---

## 推奨ワークフロー

### Step 1: 画像準備
1. Gemini 3 Pro Imageで開始フレームを生成
2. 1080p以上の解像度で保存
3. ウォーターマーク・テキストがないことを確認

### Step 2: Kling生成
1. 開始フレーム画像をアップロード
2. 上記プロンプトをコピー＆ペースト
3. Professional modeを選択（重要シーン）
4. 16:9アスペクト比を設定
5. 生成実行

### Step 3: 品質チェック
- [ ] キャラクターの顔が歪んでいないか
- [ ] 動きが自然か
- [ ] 意図したカメラワークか
- [ ] 照明・雰囲気が一貫しているか

### Step 4: リテイク（必要な場合）
- プロンプトを簡略化
- 「stable camera movement」を追加
- 複雑な動きを分割

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 顔が歪む | プロンプトを簡略化、顔の動きを減らす |
| 動きが不自然 | 「smooth」「gentle」「slowly」を追加 |
| カメラがぶれる | 「stable camera movement」を追加 |
| 背景が変わる | 「maintain background」を追加 |
| 服装が変わる | 開始画像の服装を明記 |

---

## 参考リンク

- [Kling Image-to-Video Guide](https://app.klingai.com/global/quickstart/image-to-video-guide)
- [Kling 3.0 Prompting Guide - Atlabs AI](https://www.atlabs.ai/blog/kling-3-0-prompting-guide-master-ai-video-generation)
- [Kling AI Prompt Guide - Leonardo.Ai](https://leonardo.ai/news/kling-ai-prompts/)
