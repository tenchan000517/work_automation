/**
 * アニメPV制作 - 設定管理
 *
 * スタイルパターン、ストーリーパターン、テンプレート設定を管理
 *
 * 【設計思想】
 * - ベースプロンプト（動画用）は画風・質感・雰囲気のみ
 * - 場所や要素を特定しすぎない
 * - シーン固有の内容は台本生成時にAIが作成
 */

// ===== 定数 =====
const SETTINGS_SHEET_NAME = '設定';
const TEMPLATE_SHEET_NAME = 'ヒアリングシート';

// ================================================================================
// ===== スタイルパターン（10種類） =====
// ================================================================================

/**
 * スタイルパターン
 * - videoBasePrompt: 動画プロンプトのベース部分（画風・質感のみ、場所・要素は含めない）
 * - characterSheetPrompt: キャラクターシート用
 * - startFramePrompt: 開始フレーム用
 */
const PV_STYLE_PATTERNS = [
  {
    id: 'shinkai',
    name: '新海誠風',
    description: '繊細な光、美しい背景、感情的',
    suitable: '採用PV、感動系、青春',
    // 動画用ベースプロンプト（シンプル：画風・質感のみ）
    videoBasePrompt: 'Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation',
    characterSheetPrompt: `Create an anime character reference sheet in the style of Makoto Shinkai films.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色 例: short black hair with bangs】
【目の特徴 例: bright brown eyes】
【体格 例: average build】

Wearing 【服装 例: navy blue work uniform】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: happy, determined, surprised, neutral.

Use a clean white background.
The art style should have detailed shading, soft lighting, and the atmospheric quality seen in films like "Your Name" or "Weathering with You".
Delicate light rays, lens flare effects, highly detailed eyes with reflections.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an anime scene in the style of Makoto Shinkai films.

【キャラクター説明 例: A 24-year-old Japanese woman with short black hair, wearing a navy blue work uniform】

【シーンの説明 - どこで、何をしているか】

【照明・時間帯 例: golden hour sunlight / morning light】

【感情・ムード 例: hopeful atmosphere / determined】

Cinematic composition, 16:9 aspect ratio.
Detailed background with Shinkai's signature style: photorealistic backgrounds, beautiful sky, delicate light rays, lens flare.
Atmospheric depth, emotional storytelling through visuals.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'chibi',
    name: 'デフォルメ',
    description: 'かわいい、親しみやすい、ポップ',
    suitable: '説明動画、SNS、カジュアル',
    videoBasePrompt: 'Chibi anime style, kawaii aesthetic, big expressive eyes, cute simplified features, bright colors, clean vector-like lines',
    characterSheetPrompt: `Create a chibi/deformed anime character reference sheet.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】

Wearing 【服装】.

Chibi style with:
- Large head (about 1:2 or 1:3 head-to-body ratio)
- Big expressive eyes
- Simplified hands and feet
- Cute rounded features
- Soft pastel coloring

Show the character from multiple angles: front view, side profile, and three-quarter view.
Facial expression variations on the right: happy, surprised, determined, thinking.

Clean white background, vector-like clean lines, kawaii aesthetic.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create a chibi/deformed anime scene.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【背景スタイル 例: simple pastel background / cute pattern】

【感情・ムード 例: cheerful and fun / excited】

Chibi style with large heads, big expressive eyes, cute simplified features.
Kawaii aesthetic, bright colors, playful composition.
16:9 aspect ratio, clean vector-like art style.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'evangelion',
    name: 'エヴァンゲリオン風',
    description: 'シャープ、緊張感、インパクト',
    suitable: '技術系、挑戦、革新',
    videoBasePrompt: 'Neon Genesis Evangelion anime style, sharp angular features, high contrast lighting, dramatic shadows, bold linework, cel-shaded, 90s anime aesthetic',
    characterSheetPrompt: `Create an anime character reference sheet in the style of Neon Genesis Evangelion.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: serious, determined, intense, neutral.

Evangelion art style characteristics:
- Sharp angular features and defined jawline
- Intense, detailed eyes with small pupils
- High contrast lighting with dramatic shadows
- Bold linework, slightly elongated proportions
- Serious, intense expression
- Cel-shaded coloring with stark highlights

Clean white background, 90s anime aesthetic, Gainax/Khara studio style.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an anime scene in the style of Neon Genesis Evangelion.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【照明・雰囲気 例: dramatic harsh lighting / industrial setting】

【感情・ムード 例: intense determination / quiet tension】

Evangelion art style: sharp angular features, high contrast lighting, dramatic shadows, bold composition.
Cel-shaded coloring, 90s anime aesthetic, Gainax cinematography.
16:9 aspect ratio, cinematic framing with unconventional angles.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'toriyama',
    name: '鳥山明風',
    description: '明るい、躍動感、元気',
    suitable: '製造業、スポーツ、活力',
    videoBasePrompt: 'Akira Toriyama anime style, clean bold outlines, dynamic poses, bright vivid colors, simple effective shading, energetic feel',
    characterSheetPrompt: `Create an anime character reference sheet in the style of Akira Toriyama (Dragon Ball, Dr. Slump).

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and action poses.
Facial expression variations on the right: happy, determined, surprised, confident.

Toriyama art style characteristics:
- Clean, bold outlines
- Slightly rounded features with defined muscles
- Large expressive eyes (not too large)
- Dynamic, energetic poses
- Bright, vivid colors
- Simple but effective shading
- Cheerful, determined expression

Clean white background, classic shonen manga aesthetic, vibrant and lively feel.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an anime scene in the style of Akira Toriyama.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【背景スタイル 例: vibrant outdoor setting / action background】

【感情・ムード 例: energetic and dynamic / determined】

Toriyama art style: clean bold outlines, dynamic composition, bright vivid colors.
Classic shonen aesthetic, energetic feel, simple but effective backgrounds.
16:9 aspect ratio, action-oriented composition.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'ghibli',
    name: 'ジブリ風',
    description: '柔らかい色彩、自然、温かみ',
    suitable: '食品、農業、地域密着',
    videoBasePrompt: 'Studio Ghibli anime style, soft rounded features, warm natural colors, watercolor-like shading, gentle atmosphere, Miyazaki aesthetic',
    characterSheetPrompt: `Create an anime character reference sheet in the style of Studio Ghibli films.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: gentle smile, curious, thoughtful, peaceful.

Ghibli art style characteristics:
- Soft, rounded features
- Warm, natural color palette
- Gentle, expressive eyes (not overly large)
- Realistic proportions with slight stylization
- Delicate linework
- Watercolor-like soft shading
- Natural, relaxed poses
- Kind, gentle expression

Clean white background, Hayao Miyazaki aesthetic, warm and nostalgic feel.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an anime scene in the style of Studio Ghibli films.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【照明・環境 例: warm afternoon light / lush green nature】

【感情・ムード 例: peaceful and gentle / nostalgic warmth】

Ghibli art style: soft rounded features, warm natural colors, watercolor-like backgrounds.
Miyazaki aesthetic, attention to nature and everyday details, gentle atmosphere.
16:9 aspect ratio, painterly composition with depth.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'cyberpunk',
    name: 'サイバーパンク風',
    description: 'ネオン、近未来、テック感',
    suitable: 'IT、ゲーム、先端技術',
    videoBasePrompt: 'Cyberpunk anime style, neon lighting, high contrast, cel-shaded, futuristic aesthetic, Ghost in the Shell/Akira feel',
    characterSheetPrompt: `Create an anime character reference sheet in cyberpunk anime style.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色 - ネオンカラーのハイライトも可】
【目の特徴 - サイバネティック要素も可】
【体格】

Wearing 【服装 - テックウェア、LED、未来的要素も可】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: confident, focused, smirk, neutral.

Cyberpunk anime style characteristics:
- Anime art style with cel shading
- Neon color accents (cyan, magenta, purple)
- High contrast lighting
- Futuristic clothing and accessories
- Possible cybernetic implants or tech accessories
- Sharp, modern aesthetic
- Urban, edgy vibe
- Confident, cool expression

Dark background with neon glow effects, Ghost in the Shell / Akira anime aesthetic.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create a cyberpunk anime scene.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【環境 例: neon-lit street / high-tech office / futuristic factory】

【感情・ムード 例: cool and confident / intense focus】

Cyberpunk anime style: anime art with cel shading, neon lighting (cyan, magenta, purple), high contrast, futuristic urban environment.
Ghost in the Shell / Akira anime aesthetic, rain-slicked surfaces, holographic elements.
16:9 aspect ratio, dramatic noir-inspired composition.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'watercolor',
    name: '水彩画風',
    description: '淡い色、芸術的、上品',
    suitable: 'ブライダル、美容、アート',
    videoBasePrompt: 'Watercolor illustration style, soft flowing gradients, delicate translucent layers, gentle color bleeding, light airy atmosphere, fine art aesthetic',
    characterSheetPrompt: `Create a character reference sheet in watercolor illustration style.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: serene, gentle smile, contemplative, peaceful.

Watercolor style characteristics:
- Soft, flowing color gradients
- Delicate, translucent layers
- Gentle color bleeding effects
- Light, airy atmosphere
- Soft edges, minimal harsh lines
- Pastel and muted color palette
- Elegant, dreamy quality
- Serene, gentle expression

Clean white background with subtle watercolor texture, fine art illustration aesthetic.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an illustration in watercolor style.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【色調 例: soft pastel tones / warm autumn colors】

【感情・ムード 例: serene and peaceful / dreamy】

Watercolor illustration style: soft flowing gradients, delicate translucent layers, gentle color bleeding.
Fine art aesthetic, light airy atmosphere, minimal harsh lines.
16:9 aspect ratio, elegant artistic composition.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: '90s',
    name: '90年代アニメ風',
    description: 'レトロ、セル画感、ノスタルジック',
    suitable: '老舗企業、伝統産業',
    videoBasePrompt: '1990s anime style, classic cel animation look, gradient shading, detailed hair highlights, visible linework, retro anime aesthetic',
    characterSheetPrompt: `Create an anime character reference sheet in 1990s anime style.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: happy, determined, surprised, blushing.

90s anime style characteristics:
- Classic cel animation look
- Slightly softer color palette than modern anime
- Detailed hair with distinct highlights
- Large, shiny eyes with multiple light reflections
- Visible linework, hand-drawn feel
- Gradient shading typical of cel animation
- Nostalgic, vintage anime aesthetic

Clean white background, retro anime aesthetic, Sailor Moon / Slayers era feel.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create an anime scene in 1990s anime style.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【照明・雰囲気 例: soft indoor lighting / dramatic sunset】

【感情・ムード 例: nostalgic / determined】

90s anime style: classic cel animation look, gradient shading, detailed hair highlights.
Retro anime aesthetic, visible linework, hand-drawn feel.
16:9 aspect ratio, vintage anime cinematography.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'pixar',
    name: 'ピクサー/3D風',
    description: '立体的、親しみやすい、ポップ',
    suitable: '子ども向け、教育、エンタメ',
    videoBasePrompt: 'Pixar/Disney 3D animation style, high-quality render, appealing character design, smooth rounded features, warm lighting, professional animation quality',
    characterSheetPrompt: `Create a 3D character reference sheet in Pixar/Disney animation style.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: happy, excited, determined, thoughtful.

Pixar/3D style characteristics:
- 3D rendered appearance
- Slightly exaggerated, appealing proportions
- Large expressive eyes
- Smooth, rounded features
- Subsurface scattering on skin
- Detailed textures (fabric, hair)
- Warm, inviting lighting
- Friendly, approachable expression

Clean studio background with soft lighting, high-quality 3D render aesthetic.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create a 3D rendered scene in Pixar/Disney animation style.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【照明・環境 例: warm studio lighting / outdoor natural light】

【感情・ムード 例: heartwarming / exciting / inspiring】

Pixar/3D style: high-quality 3D render, appealing character design, smooth rounded features.
Detailed textures, subsurface scattering, cinematic lighting.
16:9 aspect ratio, professional animation studio quality.

No text, no watermark, no signature, no letters, no UI elements.`
  },
  {
    id: 'realistic',
    name: '実写風',
    description: '高品質、リアル、プロフェッショナル',
    suitable: '企業PR、採用動画、プロモーション',
    videoBasePrompt: 'Photorealistic style, highly detailed, natural skin texture, realistic materials, professional cinematography, cinematic color grading',
    characterSheetPrompt: `Create a photorealistic character reference sheet.

The character is a 【年齢】-year-old Japanese 【male/female】 【職業/学生】.
【髪型・髪色】
【目の特徴】
【体格】

Wearing 【服装】.

Show the character from multiple angles: front view, side profile, and three-quarter view.
Include both full body poses and upper body close-ups.
Facial expression variations on the right: professional smile, confident, focused, neutral.

Photorealistic style:
- Highly detailed, realistic rendering
- Natural skin texture and pores
- Realistic hair strands and texture
- Accurate fabric folds and materials
- Natural lighting and shadows
- Professional photography quality
- Neutral, natural expression

Clean studio background with professional lighting, fashion photography aesthetic.

No text, no watermark, no signature, no letters.`,
    startFramePrompt: `Create a photorealistic cinematic scene.

【キャラクター説明】

【シーンの説明 - どこで、何をしているか】

【照明・環境 例: natural daylight / dramatic golden hour】

【感情・ムード 例: professional / inspiring / authentic】

Photorealistic style: highly detailed, natural skin texture, realistic materials.
Professional cinematography, shallow depth of field, cinematic color grading.
16:9 aspect ratio, film-quality composition.

No text, no watermark, no signature, no letters, no UI elements.`
  }
];

// ================================================================================
// ===== ストーリーパターン（12種類） =====
// ================================================================================

/**
 * ストーリーパターン定義 v2.0
 *
 * 4人の専門家（CMディレクター、広告クリエイティブディレクター、
 * 採用マーケティング、映像脚本家）の知見を元に設計
 *
 * 各パターンには以下を含む：
 * - essence: 物語の本質（概要生成用）
 * - emotionCurve/emotionCurveDisplay: 感情カーブ（内部名/UI表示名）
 * - opening/openingDisplay: オープニング手法（内部名/UI表示名）
 * - peak/peakDisplay: ピークの種類（内部名/UI表示名）
 * - visualTechniques: 映像表現手法
 * - emotionValues: 感情カーブ数値（12シーン分）
 * - suitable: 推奨される用途
 * - guidance: AIへのガイダンス
 */
const PV_STORY_PATTERNS = [
  // ===== 1. 自分を見つける =====
  {
    id: 'find_self',
    name: '自分を見つける',
    essence: 'わからない → 見つかる',
    emotionCurve: 'v_recovery',
    emotionCurveDisplay: '落ちて上がる',
    opening: 'empathy',
    openingDisplay: '困っている状態',
    peak: 'reversal',
    peakDisplay: '逆転',
    visualTechniques: ['光の演出', '色彩変化', '環境の変化'],
    emotionValues: [-3, -4, -5, -3, 0, +2, +5, +4, +3, +4, +5, +5],
    suitable: '新卒採用◎、中途採用◎、ブランディング○',
    guidance: `【物語の本質】わからない → きっかけ → 見つかる

【特徴・強み】
- 最も普遍的で強力な感情喚起力を持つ
- どん底からの復活という人類共通のテーマ
- 暗闘→光への視覚的コントラストが最大

【生み出す感情】感動、希望、カタルシス、勇気、共感、解放感

【演出の核心】
冒頭の暗い色調（グレー・青）から、転換点で暖色系へのグラデーション移行。
主人公の表情が影→光に照らされる瞬間を0.5秒のスローモーションで強調。

【シーン構成】
S1-3:[-3→-5] 苦悩・迷いの提示
S4-6:[-3→+2] きっかけ・転換点
S7★:[+5] ピーク（逆転の瞬間）
S8-12:[+4→+5] 新しい自分・希望`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '苦悩・迷い（-3→-5）',
        cameraWork: 'Pull out / Wide shot',
        narrativeIntent: '孤独感、迷いを表現。視聴者との距離を作り、主人公の孤立を強調',
        shotType: 'Wide shot → Medium shot'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '転換点（-3→+2）',
        cameraWork: 'Static → Slow push in',
        narrativeIntent: 'きっかけ、気づきの瞬間。視聴者を引き込み、変化への期待を高める',
        shotType: 'Medium close-up → Close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: 'アイコニックな瞬間、逆転。最も印象的なヒーローショットを創出',
        shotType: 'Dynamic hero shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '成長・希望（+4→+5）',
        cameraWork: 'Tracking / Push in / Boom up',
        narrativeIntent: '没入感、希望の共有。視聴者と主人公の一体化を演出',
        shotType: 'Various (Medium → Wide)'
      }
    ]
  },

  // ===== 2. 目標を達成する =====
  {
    id: 'achieve_goal',
    name: '目標を達成する',
    essence: '問い → 達成',
    emotionCurve: 'gradual_rise',
    emotionCurveDisplay: '少しずつ上がる',
    opening: 'question',
    openingDisplay: '問いかけ',
    peak: 'achievement',
    peakDisplay: '達成',
    visualTechniques: ['時間の圧縮', '表情クローズアップ', 'トランジション演出'],
    emotionValues: [-2, -2, -1, 0, +1, +2, +5, +4, +4, +4, +5, +5],
    suitable: '高卒採用◎、サービス紹介○、成長志向企業向け',
    guidance: `【物語の本質】問い → 一歩ずつ積み重ね → 達成

【特徴・強み】
- 成長物語として最も説得力がある
- 各ステップが可視化されることで信頼性が高い
- プロセスへの敬意が表現される

【生み出す感情】達成感、誇り、成長実感、尊敬、信頼、勇気

【演出の核心】
同じ動作（例：手を伸ばす）を異なる時間軸で繰り返し、その都度環境が進化していく。
最後に全ての断片が重なり合う瞬間を創出。

【シーン構成】
S1-3:[-2→-1] 目標の提示・最初の挑戦
S4-6:[0→+2] 積み重ね・小さな進歩
S7★:[+5] ピーク（達成の瞬間）
S8-12:[+4→+5] 達成後の誇り・次の目標`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '目標の提示（-2→-1）',
        cameraWork: 'Tracking / Static',
        narrativeIntent: '目標への問いかけ、最初の挑戦。被写体を追いながら挑戦の始まりを示す',
        shotType: 'Medium shot → Medium close-up'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '積み重ね（0→+2）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '小さな進歩の積み重ね。各ステップでカメラが近づき、成長を可視化',
        shotType: 'Medium shot (繰り返し構図)'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Push in',
        narrativeIntent: '達成の瞬間。360度回転または力強いプッシュインで達成感を最大化',
        shotType: 'Dynamic achievement shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '達成後（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '誇りと次への展望。上昇するカメラで未来への期待を表現',
        shotType: 'Medium → Wide (展望)'
      }
    ]
  },

  // ===== 3. 答えを見つける =====
  {
    id: 'find_answer',
    name: '答えを見つける',
    essence: '謎 → 真実',
    emotionCurve: 'flat_to_rise',
    emotionCurveDisplay: '平らから急に上がる',
    opening: 'shock',
    openingDisplay: '意外な映像',
    peak: 'discovery',
    peakDisplay: '発見',
    visualTechniques: ['空間歪曲', 'メタファー具現化', '光の演出'],
    emotionValues: [0, +1, 0, -1, 0, +1, +5, +4, +4, +5, +5, +5],
    suitable: 'サービス紹介◎、技術紹介◎、知的好奇心を刺激したい企業',
    guidance: `【物語の本質】謎 → 探求 → 真実

【特徴・強み】
- 知的好奇心を最大限に刺激
- 「気づき」の瞬間の演出が圧倒的
- 複雑なメッセージを直感的に伝達可能

【生み出す感情】驚き、知的興奮、納得感、啓示、爽快感、理解の喜び

【演出の核心】
断片化された映像（パズルのピース、分散する光の粒子）が徐々に集まり、
一つの明確な像を結ぶ。音響も分散→統合の設計。

【シーン構成】
S1-3:[0→0] 謎・疑問の提示
S4-6:[-1→+1] 探求・試行錯誤
S7★:[+5] ピーク（発見の瞬間）
S8-12:[+4→+5] 理解・新たな視点`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '謎の提示（0）',
        cameraWork: 'Static / Slow pan',
        narrativeIntent: '謎・疑問の提示。静的なカメラで観察的視点を確立し、好奇心を喚起',
        shotType: 'Medium shot → Detail shot'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '探求（-1→+1）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '探求・試行錯誤。徐々に近づくカメラで発見への期待を高める',
        shotType: 'Medium close-up → Close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '発見の瞬間。啓示的な動きで「分かった！」の爽快感を最大化',
        shotType: 'Dynamic revelation shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '理解（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '新たな視点の獲得。広がる視野と深まる理解を表現',
        shotType: 'Medium → Wide (俯瞰)'
      }
    ]
  },

  // ===== 4. 居場所を見つける =====
  {
    id: 'find_place',
    name: '居場所を見つける',
    essence: '孤独 → 繋がり',
    emotionCurve: 'slight_dip_rise',
    emotionCurveDisplay: '少し下がってから上がる',
    opening: 'empathy',
    openingDisplay: '困っている状態',
    peak: 'encounter',
    peakDisplay: '出会い',
    visualTechniques: ['表情クローズアップ', '色彩変化', '環境の変化'],
    emotionValues: [+1, 0, -1, +1, +2, +3, +5, +4, +5, +5, +5, +5],
    suitable: '新卒採用◎、インナーブランディング◎、チーム重視企業',
    guidance: `【物語の本質】孤独 → 出会い → 繋がり

【特徴・強み】
- 人間関係・絆を中心に据えた設計
- 孤独→繋がりの感情曲線が美しい
- ヒューマンドラマとして最高峰

【生み出す感情】温かさ、安心感、帰属感、感謝、共感、愛

【演出の核心】
一人の人物から始まり、徐々にフレーム内に他者が入ってくる構成。
色温度を冷たい→温かいへ段階的に変化。最後は円環状の構図で「繋がり」を視覚化。

【シーン構成】
S1-3:[+1→-1] 孤独・居場所のなさ
S4-6:[+1→+3] 出会い・受け入れられる
S7★:[+5] ピーク（居場所を見つける瞬間）
S8-12:[+4→+5] 仲間・繋がりの深化`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '孤独（+1→-1）',
        cameraWork: 'Pull out / Wide shot',
        narrativeIntent: '孤独・居場所のなさ。広い空間の中の一人を強調し、孤立感を表現',
        shotType: 'Wide shot (一人)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '出会い（+1→+3）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '出会い・受け入れ。フレーム内に他者が入り、距離が縮まる過程を描写',
        shotType: 'Two shot → Group shot'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Tracking / Arc shot',
        narrativeIntent: '居場所を見つけた瞬間。仲間との一体感を動的なカメラで強調',
        shotType: 'Dynamic group shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '繋がり（+4→+5）',
        cameraWork: 'Tracking / Boom up',
        narrativeIntent: '仲間との絆の深化。全員を捉える俯瞰や円環構図で一体感を視覚化',
        shotType: 'Group shot → Wide (俯瞰)'
      }
    ]
  },

  // ===== 5. 生まれ変わる =====
  {
    id: 'rebirth',
    name: '生まれ変わる',
    essence: '限界 → 再生',
    emotionCurve: 'deep_v_recovery',
    emotionCurveDisplay: '深く落ちて上がる',
    opening: 'empathy',
    openingDisplay: '困っている状態',
    peak: 'reversal',
    peakDisplay: '逆転',
    visualTechniques: ['光の演出', '色彩変化', '時間の圧縮', 'メタファー具現化'],
    emotionValues: [-4, -5, -4, -2, -1, +1, +4, +3, +4, +5, +5, +5],
    suitable: '中途採用◎、再出発をテーマにしたい企業',
    guidance: `【物語の本質】限界 → 決断 → 再生

【特徴・強み】
- 最も振り幅が大きく、感動の強度が最高
- 人生の転換点を描くのに最適
- 社会的メッセージ性が高い

【生み出す感情】深い感動、希望、生きる力、共感、勇気、解放感

【演出の核心】
破壊→再構築のメタファー（崩れる壁が花に変わる、割れた鏡が新しい窓になるなど）。
音楽は無音→静かなピアノ→フルオーケストラへ。

【シーン構成】
S1-3:[-4→-4] 限界・行き詰まり
S4-6:[-2→+1] 決断・覚悟
S7★:[+4] ピーク（再生の瞬間）
S8-12:[+3→+5] 新しい人生・希望`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '限界（-4→-4）',
        cameraWork: 'Wide shot / Pull out',
        narrativeIntent: '限界・行き詰まり。最も深い暗さを表現し、閉塞感を最大化',
        shotType: 'Wide shot → Extreme wide'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '決断（-2→+1）',
        cameraWork: 'Static → Push in',
        narrativeIntent: '決断・覚悟の瞬間。静寂からの覚醒をゆっくりとしたプッシュインで表現',
        shotType: 'Medium shot → Close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+4）★',
        cameraWork: 'Boom up / Arc shot',
        narrativeIntent: '再生の瞬間。上昇するカメラで解放感と新生を劇的に演出',
        shotType: 'Dynamic rebirth shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '新しい人生（+3→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '希望に満ちた新しい人生。光あふれる未来への展望を表現',
        shotType: 'Medium → Wide (光の中)'
      }
    ]
  },

  // ===== 6. 壁を乗り越える =====
  {
    id: 'overcome_wall',
    name: '壁を乗り越える',
    essence: '壁 → 突破',
    emotionCurve: 'wave_rise',
    emotionCurveDisplay: '上下しながら上がる',
    opening: 'question',
    openingDisplay: '問いかけ',
    peak: 'achievement',
    peakDisplay: '達成',
    visualTechniques: ['時間の圧縮', 'トランジション演出', '環境の変化'],
    emotionValues: [0, -2, -1, +1, -1, +2, +5, +3, +2, +3, +4, +5],
    suitable: '新卒採用◎、中途採用◎、挑戦をテーマにしたい企業',
    guidance: `【物語の本質】壁 → 失敗・再挑戦の繰り返し → 突破

【特徴・強み】
- リアルな成長曲線を描く
- 挫折と再起の繰り返しが共感を生む
- 長期的視点を表現可能

【生み出す感情】共感、粘り強さ、成長実感、リアリティ、達成感、誇り

【演出の核心】
波のメタファーを視覚化（実際の波、または波状の光・色彩）。
各谷から山への上昇を加速感あるトランジションで表現。最後の波が虹に変わる。

【シーン構成】
S1-3:[0→-1] 壁・最初の挫折
S4-6:[+1→+2] 再挑戦・一進一退
S7★:[+5] ピーク（突破の瞬間）
S8-12:[+3→+5] 成長・次の壁へ`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '壁・挫折（0→-1）',
        cameraWork: 'Push in / Pull out 交互',
        narrativeIntent: '壁との遭遇と最初の挫折。前進と後退を繰り返すカメラで葛藤を表現',
        shotType: 'Medium shot (変化)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '一進一退（+1→+2）',
        cameraWork: 'Push in / Pull out 交互',
        narrativeIntent: '再挑戦の繰り返し。波のような動きで粘り強さを視覚化',
        shotType: 'Medium → Medium close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Push in',
        narrativeIntent: '突破の瞬間。壁を乗り越えた達成感を力強いカメラワークで表現',
        shotType: 'Dynamic breakthrough shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '成長（+3→+5）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '成長と次への展望。前進を続けるトラッキングで継続的成長を表現',
        shotType: 'Medium → Wide (展望)'
      }
    ]
  },

  // ===== 7. 次のステージへ =====
  {
    id: 'next_stage',
    name: '次のステージへ',
    essence: '良い → もっと良い',
    emotionCurve: 'steady_rise',
    emotionCurveDisplay: 'ずっと上がる',
    opening: 'beauty',
    openingDisplay: '美しい映像',
    peak: 'achievement',
    peakDisplay: '達成',
    visualTechniques: ['色彩変化', '光の演出', 'メタファー具現化'],
    emotionValues: [+1, +2, +2, +3, +3, +4, +4, +5, +5, +5, +5, +5],
    suitable: '展示会◎、会社紹介◎、ポジティブブランディング',
    guidance: `【物語の本質】良い → さらに良い → もっと良い

【特徴・強み】
- ポジティブ・ブランディングに最適
- ネガティブ要素なしで感動を創出
- 美的完成度が最優先

【生み出す感情】喜び、高揚感、憧れ、希望、美的感動、ワクワク感

【演出の核心】
白やパステルカラーから始まり、徐々に彩度と輝度が上昇。
上昇運動（階段を登る、空へ飛ぶ）を多用。音楽はメジャーキーの一貫した上昇。

【シーン構成】
S1-3:[+1→+2] 美しい現状の提示
S4-6:[+3→+4] さらなる進化
S7-8★:[+4→+5] ピーク（最高の瞬間）
S9-12:[+5] 輝く未来・無限の可能性`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '美しい現状（+1→+2）',
        cameraWork: 'Push in / Static',
        narrativeIntent: '美しい現状の提示。既に良い状態を優雅に見せ、期待感を醸成',
        shotType: 'Medium shot → Medium close-up'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '進化（+3→+4）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: 'さらなる進化。上昇するカメラで成長の加速を表現',
        shotType: 'Medium → Wide (上昇)'
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク（+4→+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '最高の瞬間。輝く頂点を360度回転や上昇で壮大に演出',
        shotType: 'Dynamic peak shot'
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '輝く未来（+5）',
        cameraWork: 'Boom up / Wide',
        narrativeIntent: '無限の可能性。開放的な空間と上昇感で未来への期待を最大化',
        shotType: 'Wide shot (壮大)'
      }
    ]
  },

  // ===== 8. 危機を乗り越える =====
  {
    id: 'overcome_crisis',
    name: '危機を乗り越える',
    essence: '危機 → 打開',
    emotionCurve: 'v_recovery',
    emotionCurveDisplay: '落ちて上がる',
    opening: 'shock',
    openingDisplay: '意外な映像',
    peak: 'reversal',
    peakDisplay: '逆転',
    visualTechniques: ['空間歪曲', '光の演出', '時間の圧縮'],
    emotionValues: [-3, -4, -5, -3, 0, +2, +5, +4, +3, +4, +5, +5],
    suitable: '会社紹介○、サービス紹介○、ドラマチックな展開向け',
    guidance: `【物語の本質】突然の危機 → 葛藤 → 打開

【特徴・強み】
- 緊張感とドラマ性が最高レベル
- スリリングな展開が可能
- 短時間で強烈な印象を残す

【生み出す感情】緊張、解放、カタルシス、驚き、安堵、希望

【演出の核心】
空間が崩壊するような歪み（魚眼レンズ効果、フラクタル）から、
突然の静寂と幾何学的秩序への転換。音響も歪み→クリアへ。

【シーン構成】
S1-3:[-3→-5] 危機・衝撃
S4-6:[-3→+2] 葛藤・解決への糸口
S7★:[+5] ピーク（逆転の瞬間）
S8-12:[+4→+5] 解決・新たな強さ`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '危機（-3→-5）',
        cameraWork: 'Wide shot / Pull out',
        narrativeIntent: '危機・衝撃。歪んだ空間や急激なカメラ動作で緊張感を最大化',
        shotType: 'Wide shot (歪み)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '葛藤（-3→+2）',
        cameraWork: 'Static → Push in',
        narrativeIntent: '葛藤と解決への糸口。静寂から徐々に希望を見出す過程を描写',
        shotType: 'Medium close-up → Close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: '逆転の瞬間。歪みから秩序への転換を劇的なカメラワークで表現',
        shotType: 'Dynamic reversal shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '解決（+4→+5）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '解決と新たな強さの獲得。安定したカメラで回復と成長を表現',
        shotType: 'Medium → Wide (安定)'
      }
    ]
  },

  // ===== 9. 自分と向き合う =====
  {
    id: 'face_self',
    name: '自分と向き合う',
    essence: '表面 → 本質',
    emotionCurve: 'flat_to_rise',
    emotionCurveDisplay: '平らから急に上がる',
    opening: 'beauty',
    openingDisplay: '美しい映像',
    peak: 'discovery',
    peakDisplay: '発見',
    visualTechniques: ['メタファー具現化', '色彩変化', 'トランジション演出'],
    emotionValues: [0, +1, 0, -1, 0, +1, +5, +4, +4, +5, +5, +5],
    suitable: 'ブランディング◎、インナーブランディング◎、哲学的企業',
    guidance: `【物語の本質】表面 → 内省 → 深層（本質）

【特徴・強み】
- 哲学的・詩的な深みを持つ
- 知的ターゲットに強く響く
- 芸術性が最も高い

【生み出す感情】静かな感動、理解の喜び、美的満足、啓示、知的興奮

【演出の核心】
抽象的な映像（水面の波紋、光の屈折）から具体的なメッセージへの結晶化。
シンメトリーとアシンメトリーの対比。

【シーン構成】
S1-3:[0→0] 美しい表面
S4-6:[-1→+1] 内省・問いかけ
S7★:[+5] ピーク（本質の発見）
S8-12:[+4→+5] 深い理解・新たな視点`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '美しい表面（0）',
        cameraWork: 'Static / Slow pan',
        narrativeIntent: '美しい表面の提示。静的で瞑想的なカメラで観察的な視点を確立',
        shotType: 'Medium shot (シンメトリー)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '内省（-1→+1）',
        cameraWork: 'Slow push in',
        narrativeIntent: '内省・問いかけ。ゆっくりと近づくカメラで内面への旅を表現',
        shotType: 'Medium close-up → Close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Push in / Arc shot',
        narrativeIntent: '本質の発見。深い気づきの瞬間を静かながら力強いカメラワークで表現',
        shotType: 'Close-up (啓示)'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '深い理解（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '新たな視点の獲得。理解の広がりを開放的なカメラワークで表現',
        shotType: 'Medium → Wide (調和)'
      }
    ]
  },

  // ===== 10. 力を合わせる =====
  {
    id: 'unite',
    name: '力を合わせる',
    essence: 'バラバラ → 一つに',
    emotionCurve: 'slight_dip_rise',
    emotionCurveDisplay: '少し下がってから上がる',
    opening: 'question',
    openingDisplay: '問いかけ',
    peak: 'unity',
    peakDisplay: '団結',
    visualTechniques: ['環境の変化', '表情クローズアップ', 'メタファー具現化'],
    emotionValues: [+1, 0, -1, +1, +2, +3, +5, +4, +5, +5, +5, +5],
    suitable: '新卒採用◎、会社紹介◎、チームワーク重視企業',
    guidance: `【物語の本質】バラバラ → 対話 → 一つになる

【特徴・強み】
- チーム・組織の物語に最適
- 多様性と統合を表現可能
- 社会性の高いメッセージを伝達

【生み出す感情】帰属感、団結、温かさ、共感、安心感、誇り

【演出の核心】
個々の人物が別々のフレームに登場し、徐々に同じ空間に集まる。
最後は俯瞰視点で「全体の形」（円、星など）を描く。

【シーン構成】
S1-3:[+1→-1] 個々の状況・課題
S4-6:[+1→+3] 出会い・協力の始まり
S7★:[+5] ピーク（団結の瞬間）
S8-12:[+4→+5] 一体感・共に進む未来`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '個々の状況（+1→-1）',
        cameraWork: 'Pull out / Wide shot',
        narrativeIntent: '個々の状況・課題。別々のフレームで各人を紹介し、バラバラ感を強調',
        shotType: 'Medium shot (個別)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '協力の始まり（+1→+3）',
        cameraWork: 'Tracking / Push in',
        narrativeIntent: '出会いと協力の始まり。フレーム内に複数人が入り、距離が縮まる',
        shotType: 'Two shot → Group shot'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Boom up (俯瞰)',
        narrativeIntent: '団結の瞬間。俯瞰や360度回転で全員の一体感を壮大に表現',
        shotType: 'Wide shot (俯瞰/円環)'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '一体感（+4→+5）',
        cameraWork: 'Tracking / Boom up',
        narrativeIntent: '共に進む未来。全員で前進するトラッキングで団結の継続を表現',
        shotType: 'Group shot → Wide (展望)'
      }
    ]
  },

  // ===== 11. 大切なものに気づく =====
  {
    id: 'realize_value',
    name: '大切なものに気づく',
    essence: 'わからない → 気づく',
    emotionCurve: 'gradual_rise',
    emotionCurveDisplay: '少しずつ上がる',
    opening: 'empathy',
    openingDisplay: '困っている状態',
    peak: 'discovery',
    peakDisplay: '発見',
    visualTechniques: ['時間の圧縮', '色彩変化', '光の演出'],
    emotionValues: [-2, -2, -1, 0, +1, +2, +5, +4, +4, +4, +5, +5],
    suitable: '新卒採用◎、教育的メッセージ、成長志向企業',
    guidance: `【物語の本質】わからない → 学び・経験 → 大切なものに気づく

【特徴・強み】
- 学びの過程を美しく描く
- 論理的説得力が高い
- 教育的メッセージに最適

【生み出す感情】成長実感、納得感、達成感、理解の喜び、希望

【演出の核心】
暗い空間に一つずつ光が灯っていく。各光は異なる色を持ち、
最後に混ざり合って白色光を生成。知識の集積を視覚化。

【シーン構成】
S1-3:[-2→-1] 何が大切かわからない
S4-6:[0→+2] 経験・学び
S7★:[+5] ピーク（気づきの瞬間）
S8-12:[+4→+5] 大切なものと共に歩む`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: 'わからない（-2→-1）',
        cameraWork: 'Pull out / Static',
        narrativeIntent: '何が大切かわからない状態。暗い空間での迷いを静的なカメラで表現',
        shotType: 'Medium shot (暗め)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '経験・学び（0→+2）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '経験と学びの積み重ね。一つずつ光が灯る過程をカメラの接近で表現',
        shotType: 'Medium → Medium close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '気づきの瞬間。全ての光が一つになる瞬間を壮大なカメラワークで表現',
        shotType: 'Dynamic realization shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '共に歩む（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '大切なものと共に歩む未来。光に満ちた空間での展望を表現',
        shotType: 'Medium → Wide (光の中)'
      }
    ]
  },

  // ===== 12. 運命が変わる =====
  {
    id: 'change_destiny',
    name: '運命が変わる',
    essence: '波乱 → 変容',
    emotionCurve: 'wave_rise',
    emotionCurveDisplay: '上下しながら上がる',
    opening: 'shock',
    openingDisplay: '意外な映像',
    peak: 'reversal',
    peakDisplay: '逆転',
    visualTechniques: ['空間歪曲', 'メタファー具現化', '光の演出', 'トランジション演出'],
    emotionValues: [0, -2, -1, +1, -1, +2, +5, +3, +2, +3, +4, +5],
    suitable: '中途採用○、会社紹介○、ドラマチックな転換を描きたい企業',
    guidance: `【物語の本質】衝撃・波乱 → 揺さぶられる → 劇的に変容

【特徴・強み】
- 複雑性と深みを両立
- 多層的なメッセージを伝達可能
- 芸術性とエンターテインメント性の融合

【生み出す感情】驚き、興奮、カタルシス、深い感動、知的興奮、解放感

【演出の核心】
音波の共鳴をメタファーに、小さな振動が増幅し空間全体を変容させる。
フラクタル構造で微細→壮大へスケールアップ。

【シーン構成】
S1-3:[0→-1] 衝撃・予兆
S4-6:[+1→+2] 揺さぶられる・選択
S7★:[+5] ピーク（運命の転換点）
S8-12:[+3→+5] 新しい運命・壮大な未来`,
    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '衝撃・予兆（0→-1）',
        cameraWork: 'Dynamic movement / Wide shot',
        narrativeIntent: '衝撃と予兆。不安定なカメラワークで波乱の幕開けを表現',
        shotType: 'Medium shot (動的)'
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '揺さぶられる（+1→+2）',
        cameraWork: 'Push in / Pull out 交互',
        narrativeIntent: '揺さぶられる選択の時。振動のようなカメラで内面の葛藤を表現',
        shotType: 'Medium → Medium close-up'
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: '運命の転換点。空間全体が変容する瞬間を壮大なカメラワークで表現',
        shotType: 'Dynamic transformation shot'
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '新しい運命（+3→+5）',
        cameraWork: 'Boom up / Tracking',
        narrativeIntent: '新しい運命と壮大な未来。スケールアップするカメラで可能性の広がりを表現',
        shotType: 'Medium → Wide (壮大)'
      }
    ]
  }
];

// ================================================================================
// ===== オプション追加用（シーン編集ダイアログ用） =====
// ================================================================================

// 時間帯オプション
const PV_TIME_OPTIONS = [
  { id: 'morning', name: '朝', en: 'early morning light, soft golden rays' },
  { id: 'noon', name: '昼', en: 'bright daylight, clear sky' },
  { id: 'afternoon', name: '午後', en: 'warm afternoon light, long shadows' },
  { id: 'sunset', name: '夕方', en: 'golden hour, orange sunset glow' },
  { id: 'night', name: '夜', en: 'night scene, artificial lighting' }
];

// 場所オプション（エフェクトシーン用）
const PV_LOCATION_OPTIONS = [
  { id: 'office', name: 'オフィス', en: 'modern office interior, professional workspace' },
  { id: 'factory', name: '工場', en: 'industrial factory floor, machinery and equipment' },
  { id: 'warehouse', name: '倉庫', en: 'large warehouse interior, shelving and storage' },
  { id: 'outdoor_nature', name: '自然（屋外）', en: 'outdoor natural setting, trees and greenery' },
  { id: 'city_street', name: '都市・街路', en: 'urban city street, buildings and roads' },
  { id: 'rooftop', name: '屋上', en: 'building rooftop, open sky view' },
  { id: 'meeting_room', name: '会議室', en: 'meeting room interior, table and chairs' },
  { id: 'laboratory', name: '研究室・ラボ', en: 'laboratory interior, scientific equipment' },
  { id: 'construction', name: '建設現場', en: 'construction site, building in progress' },
  { id: 'abstract', name: '抽象的背景', en: 'abstract background, minimal environment' }
];

// カメラワークオプション
const PV_CAMERA_OPTIONS = [
  { id: 'static', name: '固定', en: 'static camera' },
  { id: 'pan_left', name: '左にパン', en: 'slow pan left' },
  { id: 'pan_right', name: '右にパン', en: 'slow pan right' },
  { id: 'pan_up', name: '上にパン', en: 'slow pan upward' },
  { id: 'pan_down', name: '下にパン', en: 'slow pan downward' },
  { id: 'zoom_in', name: 'ズームイン', en: 'slow zoom in' },
  { id: 'zoom_out', name: 'ズームアウト', en: 'slow zoom out' },
  { id: 'tracking', name: '追従', en: 'tracking shot, following the subject' },
  { id: 'orbit', name: '回り込み', en: 'gentle orbit around the subject' },
  { id: 'push_in', name: 'プッシュイン', en: 'slow push in toward the subject' }
];

// アクションオプション
const PV_ACTION_OPTIONS = [
  { id: 'look_up', name: '顔を上げる', en: 'slowly raises head and looks up' },
  { id: 'look_camera', name: 'カメラを見る', en: 'turns toward the camera' },
  { id: 'walk', name: '歩く', en: 'walks forward slowly' },
  { id: 'smile', name: '微笑む', en: 'smiles gently' },
  { id: 'determined', name: '決意の表情', en: 'shows determined expression' },
  { id: 'work', name: '作業する', en: 'performs work action with focus' },
  { id: 'talk', name: '話す', en: 'speaking with gestures' },
  { id: 'stand', name: '立っている', en: 'standing still, slight breathing movement' },
  { id: 'look_around', name: '周りを見る', en: 'looks around slowly' },
  { id: 'reach', name: '手を伸ばす', en: 'reaches out hand toward something' }
];

// エンディングタイプ
const PV_ENDING_TYPES = [
  { id: 'object_to_logo', name: 'オブジェクト→ロゴ変形', description: '業界関連のオブジェクトがロゴに変形' },
  { id: 'logo_animation', name: 'ロゴアニメーション', description: 'ロゴにアニメーション効果を追加' }
];

// 変形元オブジェクト例
const PV_TRANSFORM_OBJECTS = [
  { id: 'sakura', name: '桜の花びら', en: 'cherry blossom petals swirling and forming' },
  { id: 'tools', name: '工具', en: 'floating tools assembling and transforming' },
  { id: 'gears', name: '歯車', en: 'interlocking gears spinning and forming' },
  { id: 'sparks', name: '火花', en: 'welding sparks flying and converging' },
  { id: 'water', name: '水滴', en: 'water droplets merging and shaping' },
  { id: 'light', name: '光の粒子', en: 'particles of light gathering' },
  { id: 'paper', name: '紙片', en: 'paper fragments floating and assembling' },
  { id: 'custom', name: 'カスタム', en: '' }
];

// ロゴアニメーション種類
const PV_LOGO_ANIMATIONS = [
  { id: 'fade_in', name: 'フェードイン', en: 'logo fades in smoothly' },
  { id: 'zoom_in', name: 'ズームイン', en: 'logo zooms in from distance' },
  { id: 'particle', name: 'パーティクル集合', en: 'particles converge to form logo' },
  { id: 'light_streak', name: '光線エフェクト', en: 'light streaks reveal logo' },
  { id: 'glitch', name: 'グリッチ', en: 'glitch effect reveals logo' },
  { id: 'handwritten', name: '手書き', en: 'logo appears as if being drawn' }
];

// ================================================================================
// ===== エフェクトシーン関連 =====
// ================================================================================

// NOTE: エフェクトシーン関連は以下に移動・整理しました:
//
// 【コード】animePvEffectSettings.js
// - PV_EFFECT_COUNT, PV_BACKGROUND_EFFECTS, PV_CHARACTER_ACTIONS
// - PV_EFFECT_PRESETS, PV_EFFECT_ACTION_PRESETS
// - 関連する取得関数
//
// 【ドキュメント】演出コレオグラフィー専門家回答_完全版.md
// - 詳細な演出コレオグラフィーテンプレート（15種類）
// - 旧 PV_EFFECT_TEMPLATES の内容と同一のため、コードからは削除

// NOTE: PV_EFFECT_PRESETS, PV_EFFECT_ACTION_PRESETS,
//       PV_BACKGROUND_EFFECTS, PV_CHARACTER_ACTIONS は
//       animePvEffectSettings.js に移動しました

// ================================================================================
// ===== 設定取得関数 =====
// ================================================================================

function pv_getStylePatterns() {
  return PV_STYLE_PATTERNS;
}

function pv_getStylePatternById(styleId) {
  return PV_STYLE_PATTERNS.find(s => s.id === styleId);
}

function pv_getStylePatternByName(styleName) {
  return PV_STYLE_PATTERNS.find(s => s.name === styleName);
}

function pv_getStoryPatterns() {
  return PV_STORY_PATTERNS;
}

function pv_getStoryPatternById(storyId) {
  return PV_STORY_PATTERNS.find(s => s.id === storyId);
}

function pv_getTimeOptions() {
  return PV_TIME_OPTIONS;
}

function pv_getLocationOptions() {
  return PV_LOCATION_OPTIONS;
}

function pv_getCameraOptions() {
  return PV_CAMERA_OPTIONS;
}

function pv_getActionOptions() {
  return PV_ACTION_OPTIONS;
}

function pv_getEndingTypes() {
  return PV_ENDING_TYPES;
}

function pv_getTransformObjects() {
  return PV_TRANSFORM_OBJECTS;
}

function pv_getLogoAnimations() {
  return PV_LOGO_ANIMATIONS;
}

// NOTE: pv_getEffectPresets, pv_getEffectActionPresets, pv_getEffectCount,
//       pv_getBackgroundEffects, pv_getBackgroundEffectById,
//       pv_getCharacterActions, pv_getCharacterActionById は
//       animePvEffectSettings.js に移動しました

// ================================================================================
// ===== 設定シート管理 =====
// ================================================================================

/**
 * テンプレート初期設定
 */
function pv_setupTemplates() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 設定シート作成
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET_NAME);
    settingsSheet.getRange(1, 1, 1, 2).setValues([['キー', '値']]);
    settingsSheet.getRange(1, 1, 1, 2).setBackground('#7c3aed').setFontColor('#fff').setFontWeight('bold');

    const settings = [
      ['親フォルダID', ''],
      ['デフォルトスタイル', '新海誠風'],
      ['バージョン', PV_VERSION]
    ];
    settingsSheet.getRange(2, 1, settings.length, 2).setValues(settings);
  }

  ui.alert('✅ テンプレート初期設定が完了しました');
}

/**
 * 親フォルダを設定
 */
function pv_setParentFolder() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '親フォルダを設定',
    'Google Driveの「アニメPV制作」フォルダのIDを入力してください：\n' +
    '（フォルダURLの末尾のIDをコピー）',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const folderId = response.getResponseText().trim();
  if (!folderId) {
    ui.alert('エラー', 'フォルダIDを入力してください。', ui.ButtonSet.OK);
    return;
  }

  pv_setSettingValue('親フォルダID', folderId);
  ui.alert('✅ 親フォルダを設定しました');
}

/**
 * 親フォルダIDを取得
 */
function pv_getParentFolderId() {
  return pv_getSettingValue('親フォルダID');
}
