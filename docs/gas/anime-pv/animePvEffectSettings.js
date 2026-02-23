/**
 * アニメPV制作 - エフェクトシーン設定 v2
 *
 * 【新構造】
 * - アクション定義（親）: 目を開く / 顔を上げる
 * - エフェクト定義（子）: 各アクションに紐づく4種類
 * - 各組み合わせに対して開始フレーム/終了フレーム/動画プロンプトを定義
 *
 * 【設計思想】
 * - アクションが起点（選択の親）
 * - エフェクトはアクションに紐づく
 * - プロンプトは演出プロンプト_背後エフェクト_I2V対応_v2.mdから転記
 */

// ================================================================================
// ===== エフェクトシーン基本設定 =====
// ================================================================================

const PV_EFFECT_COUNT = 5;

// ================================================================================
// ===== アクション定義 =====
// ================================================================================

/**
 * アクション定義（親）
 * - timing: 爆発のタイミング（秒）
 * - effects: 紐づくエフェクトID一覧
 */
const PV_ACTIONS = {
  eye_open: {
    id: 'eye_open',
    name: '目を開く',
    icon: '👁️',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/eye_open.jpeg',
    timing: '2.0s',
    description: '閉じた目がゆっくり開き、瞳に光が映る',
    startFrameBase: 'Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid. Upper body visible from chest up, peaceful expression with closed eyes.',
    endFrameBase: 'eyes open',
    effects: ['particles', 'cherry_blossom', 'chalk', 'energy_wave']
  },
  face_raise: {
    id: 'face_raise',
    name: '顔を上げる',
    icon: '🙆',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/face_raise.jpeg',
    timing: '1.3s',
    description: 'うつむいた顔を上げ、光を受ける',
    startFrameBase: 'Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood. Upper body visible from waist up, eyes closed, face cast in shadow from above.',
    endFrameBase: 'face looking up, peaceful expression, eyes open',
    effects: ['particles', 'cherry_blossom', 'chalk', 'energy_wave']
  },
  door_open: {
    id: 'door_open',
    name: '扉を開く',
    icon: '🚪',
    thumbnail: '', // 外部ホスティング時にURLを設定
    inDevelopment: true, // 構築中フラグ
    timing: '3.0s',
    description: '扉を開いてくぐる - 過去から現在への転換',
    startFrameBase: '', // 未実装
    endFrameBase: '', // 未実装
    effects: ['costume_change']
  },
  walk_backward: {
    id: 'walk_backward',
    name: '後ろ向きで歩く',
    icon: '🚶',
    thumbnail: '', // 外部ホスティング時にURLを設定
    inDevelopment: true, // 構築中フラグ
    timing: '4.0s',
    description: '後ろ向きで歩いていく - 世界が変わる',
    startFrameBase: '', // 未実装
    endFrameBase: '', // 未実装
    effects: ['world_rotation']
  }
};

// ================================================================================
// ===== エフェクト定義 =====
// ================================================================================

/**
 * エフェクト定義
 * - verified: 検証済みフラグ
 * - prompts: アクション別のプロンプト
 */
const PV_EFFECTS = {
  particles: {
    id: 'particles',
    name: '光の粒子',
    icon: '✨',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/face_raise_particles.gif',
    verified: false,
    prompts: {
      eye_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.`,
          negative: 'no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, waist shot, eyes open, (explosion of golden light particles from behind:1.3), particles floating upward, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'closed eyes'
        },
        videoPrompt: `[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Golden particles burst UPWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Particles continue rising upward behind and around character.
Particles float gently at upper area.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never cross in front of face.

Negative: no particles in front of face, no blinking, no particles moving downward.`
      },
      face_raise: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.`,
          negative: 'no face looking up, no open eyes, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (explosion of golden light particles from behind:1.3), particles floating upward, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'face looking down, closed eyes'
        },
        videoPrompt: `[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Golden particles burst UPWARD from behind character★

[1.3-3s] Face slowly raising upward, chin lifting.
Particles continue rising upward behind and around character.

[3-5s] Face fully raised looking upward, eyes open, peaceful expression.
Particles float gently around character.
Slow motion applied.

Constraints: particles burst UPWARD from behind, particles never cross in front of face.

Negative: no particles in front of face, no rapid head motion, no particles moving downward.`
      }
    }
  },

  cherry_blossom: {
    id: 'cherry_blossom',
    name: '桜の花びら',
    icon: '🌸',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/eye_open_cherry_blossom.gif',
    verified: true,
    prompts: {
      eye_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.`,
          negative: 'no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, waist shot, eyes open, (explosion of cherry blossom petals from behind:1.3), radial petals flying, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'no branch, no tree, no trunk, no leaves, no twigs, no wood, closed eyes'
        },
        videoPrompt: `[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Petals explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Petals continue spreading outward in radial pattern.
Petals travel behind and around character at varying speeds.
Slow motion applied.

Constraints: petals explode OUTWARD in radial pattern, petals never cross in front of face, varying petal speeds.

Negative: no petals in front of face, no blinking, no petals moving inward, no branches, no trees, no stems.`
      },
      face_raise: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.`,
          negative: 'no face looking up, no open eyes, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (explosion of cherry blossom petals from behind:1.3), radial petals flying, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'no branch, no tree, no trunk, no leaves, no twigs, no wood, face looking down, closed eyes'
        },
        videoPrompt: `[0-1.3s] Face looking downward, shadowed expression, eyes closed.
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

Negative: no petals in front of face, no rapid head motion, no petals moving inward, no branches, no trees, no stems.`
      }
    }
  },

  chalk: {
    id: 'chalk',
    name: '4色チョーク',
    icon: '🎨',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/eye_open_chalk.gif',
    verified: true,
    prompts: {
      eye_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.`,
          negative: 'no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, waist shot, eyes open, (explosion of colorful chalk powder from behind:1.3), blue red yellow green powder, radial powder flying, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'closed eyes'
        },
        videoPrompt: `[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Chalk powder explode OUTWARD from behind character in radial pattern★

[2.0-4.5s] Eyes remain fully open.
Powder continue spreading outward in radial pattern.
Powder travel behind and around character at varying speeds.
Slow motion applied.

Constraints: powder explode OUTWARD in radial pattern, powder never cross in front of face.

Negative: no powder in front of face, no blinking, no powder moving inward.`
      },
      face_raise: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.`,
          negative: 'no face looking up, no open eyes, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, waist shot, face looking up, peaceful expression, (explosion of colorful chalk powder from behind:1.3), blue red yellow green powder, radial powder flying, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'face looking down, closed eyes'
        },
        videoPrompt: `[0-1.3s] Face looking downward, shadowed expression, eyes closed.
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

Negative: no powder in front of face, no rapid head motion, no powder moving inward.`
      }
    }
  },

  energy_wave: {
    id: 'energy_wave',
    name: 'エネルギー波',
    icon: '🌊',
    thumbnail: 'https://assets.yumesuta.com/thumbnail/face_raise_energy_wave.gif',
    verified: false,
    prompts: {
      eye_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with eyes closed, anime style illustration, soft eyelashes and smooth eyelid.
Upper body visible from chest up, peaceful expression with closed eyes.
[BACKGROUND] with atmospheric depth.
Camera: bust shot framing, character centered.
Lighting: soft rim light on face and hair.

Composition: Character bust occupies center of frame, clean background with depth.

Constraints: eyes completely closed, clean composition, no effects yet.`,
          negative: 'no open eyes, no cherry blossom petals yet, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, waist shot, eyes open, (concentric energy waves from behind:1.3), circular shockwave rings, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'closed eyes'
        },
        videoPrompt: `[0-2.0s] Eyes slowly opening from closed.
Eyes gradually open, eyelids lifting upward revealing iris.
★Eyes continue opening until FULLY OPEN at 2.0s mark★

[2.0s] ★EXPLOSION MOMENT: At the EXACT INSTANT eyes are FULLY OPEN★
★Concentric energy wave explodes OUTWARD from behind character★

[2.0-4.5s] Eyes remain fully open.
Energy waves continue expanding outward in concentric circles.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never cross in front of face.

Negative: no energy in front of face, no blinking, no waves moving inward.`
      },
      face_raise: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, lens flare, cinematic color grading, atmospheric depth, high quality animation.
Detailed Shinkai signature style: photorealistic backgrounds, beautiful sky, delicate light rays.
Cinematic composition, 16:9 aspect ratio.

Waist shot of character looking downward, anime style illustration, shadowed expression, somber mood.
Upper body visible from waist up, eyes closed, face cast in shadow from above.
[BACKGROUND] with atmospheric depth.
Camera: waist shot framing, character centered, slightly high angle.
Lighting: shadowed lighting on face from above.

Composition: Character waist shot occupies center of frame, clean background with depth.

Constraints: face looking downward, eyes closed, shadowed expression, clean composition, no effects yet.`,
          negative: 'no face looking up, no open eyes, no particles, no motion blur, no multiple characters'
        },
        endFrame: {
          prompt: `masterpiece, best quality, solo, full body shot, face looking up, peaceful expression, eyes open, (concentric energy waves from behind:1.3), circular shockwave rings, strong backlight, lens flare, glowing light, [BACKGROUND], anime style`,
          negative: 'face looking down, closed eyes'
        },
        videoPrompt: `[0-1.3s] Face looking downward, shadowed expression, eyes closed.
Somber mood, still and quiet.

[1.3s] ★EXPLOSION MOMENT: At the EXACT INSTANT face begins lifting★
★Concentric energy wave explodes OUTWARD from behind character★

[1.3-2.8s] Face slowly raising upward, chin lifting.
Energy waves continue expanding outward in concentric circles.

[2.8-5s] Face fully raised looking upward, eyes open, peaceful expression.
Multiple rings pulsing rhythmically behind and around character.
Slow motion applied.

Constraints: energy waves expand OUTWARD in concentric pattern, waves never cross in front of face.

Negative: no energy in front of face, no rapid head motion, no waves moving inward.`
      }
    }
  },

  // ===== 新規エフェクト（構築中） =====

  costume_change: {
    id: 'costume_change',
    name: '服装変化',
    icon: '👔',
    thumbnail: '', // 外部ホスティング時にURLを設定
    inDevelopment: true, // 構築中フラグ
    verified: false,
    prompts: {
      door_open: {
        startFrame: {
          prompt: '', // 未実装
          negative: ''
        },
        endFrame: {
          prompt: '', // 未実装
          negative: ''
        },
        videoPrompt: '' // 未実装
      }
    }
  },

  world_rotation: {
    id: 'world_rotation',
    name: '世界回転トランジション',
    icon: '🌀',
    thumbnail: '', // 外部ホスティング時にURLを設定
    inDevelopment: true, // 構築中フラグ
    verified: false,
    prompts: {
      walk_backward: {
        startFrame: {
          prompt: '', // 未実装
          negative: ''
        },
        endFrame: {
          prompt: '', // 未実装
          negative: ''
        },
        videoPrompt: '' // 未実装
      }
    }
  }
};

// ================================================================================
// ===== 背景設定 =====
// ================================================================================

/**
 * 背景プレースホルダーのデフォルト値
 */
const PV_DEFAULT_BACKGROUND = 'urban city street, beautiful sky, Makoto Shinkai style';

/**
 * 場所オプション（背景選択用）
 * UI用ドロップダウン
 */
const PV_BACKGROUND_LOCATIONS = [
  { id: 'office', name: 'オフィス', en: 'modern office interior, glass windows, natural light' },
  { id: 'factory', name: '工場', en: 'industrial factory interior, metallic structures, dramatic lighting' },
  { id: 'nature', name: '自然', en: 'serene nature landscape, trees, sunlight filtering through leaves' },
  { id: 'urban', name: '都市・街路', en: 'urban city street, beautiful sky, Makoto Shinkai style' },
  { id: 'rooftop', name: '屋上', en: 'rooftop with city skyline, sunset sky, dramatic clouds' },
  { id: 'school', name: '学校', en: 'school corridor, large windows, afternoon sunlight' },
  { id: 'train', name: '電車', en: 'train interior, window view, warm lighting' },
  { id: 'shrine', name: '神社', en: 'japanese shrine, torii gate, peaceful atmosphere' },
  { id: 'beach', name: '海辺', en: 'beach coastline, ocean horizon, gentle waves' },
  { id: 'night', name: '夜景', en: 'city night view, neon lights, urban glow' }
];

/**
 * 時間帯オプション
 */
const PV_BACKGROUND_TIMES = [
  { id: 'morning', name: '朝', en: 'early morning light, soft golden hour' },
  { id: 'noon', name: '昼', en: 'bright daylight, clear sky' },
  { id: 'evening', name: '夕方', en: 'sunset golden hour, warm orange light' },
  { id: 'night', name: '夜', en: 'night time, moonlight, city lights' },
  { id: 'blue_hour', name: '薄暮', en: 'blue hour twilight, magical atmosphere' }
];

// ================================================================================
// ===== 旧形式互換用定義（既存UIとの互換性維持） =====
// ================================================================================

/**
 * 旧形式のエフェクト一覧（既存UIとの互換性用）
 * @deprecated 新UIでは PV_EFFECTS を使用
 */
const PV_BACKGROUND_EFFECTS = [
  { id: 'particles', name: '光の粒子', icon: '✨', description: '光の粒子が背後から上昇爆発' },
  { id: 'cherry_blossom', name: '桜の花びら', icon: '🌸', description: '桜の花びらが背後から放射状に広がる' },
  { id: 'chalk', name: '4色チョーク', icon: '🎨', description: '4色の粉が背後から放射状に爆発' },
  { id: 'energy_wave', name: 'エネルギー波', icon: '🌊', description: '同心円状のエネルギー波が背後から放射' }
];

/**
 * 旧形式のアクション一覧（既存UIとの互換性用）
 * @deprecated 新UIでは PV_ACTIONS を使用
 */
const PV_CHARACTER_ACTIONS = [
  { id: 'eye_open', name: '目を開く', startFrame: 'eyes closed', videoAction: 'eyes slowly opening', endFrame: 'eyes fully open' },
  { id: 'face_raise', name: '顔を上げる', startFrame: 'face looking down', videoAction: 'face slowly raising', endFrame: 'face looking up' }
];

// ================================================================================
// ===== 取得関数 =====
// ================================================================================

/**
 * エフェクトシーン枠数を取得
 */
function pv_getEffectCount() {
  return PV_EFFECT_COUNT;
}

/**
 * アクション一覧を取得
 */
function pv_getActions() {
  return Object.values(PV_ACTIONS);
}

/**
 * アクションをIDで取得
 */
function pv_getActionById(actionId) {
  return PV_ACTIONS[actionId] || null;
}

/**
 * エフェクト一覧を取得
 */
function pv_getEffects() {
  return Object.values(PV_EFFECTS);
}

/**
 * エフェクトをIDで取得
 */
function pv_getEffectById(effectId) {
  return PV_EFFECTS[effectId] || null;
}

/**
 * アクションに紐づくエフェクト一覧を取得
 */
function pv_getEffectsForAction(actionId) {
  const action = PV_ACTIONS[actionId];
  if (!action) return [];

  return action.effects.map(effectId => PV_EFFECTS[effectId]).filter(e => e);
}

/**
 * 背景場所オプションを取得
 */
function pv_getBackgroundLocations() {
  return PV_BACKGROUND_LOCATIONS;
}

/**
 * 背景時間帯オプションを取得
 */
function pv_getBackgroundTimes() {
  return PV_BACKGROUND_TIMES;
}

/**
 * プロンプトを取得（アクション×エフェクトの組み合わせ）
 * @param {string} actionId - アクションID
 * @param {string} effectId - エフェクトID
 * @param {string} background - 背景文字列（[BACKGROUND]置換用）
 * @returns {Object} { startFrame, startFrameNeg, endFrame, endFrameNeg, video }
 */
function pv_getEffectPrompts(actionId, effectId, background) {
  const effect = PV_EFFECTS[effectId];
  if (!effect || !effect.prompts[actionId]) {
    return null;
  }

  const prompts = effect.prompts[actionId];
  const bg = background || PV_DEFAULT_BACKGROUND;

  return {
    startFrame: prompts.startFrame.prompt.replace(/\[BACKGROUND\]/g, bg),
    startFrameNeg: prompts.startFrame.negative,
    endFrame: prompts.endFrame.prompt.replace(/\[BACKGROUND\]/g, bg),
    endFrameNeg: prompts.endFrame.negative,
    video: prompts.videoPrompt
  };
}

/**
 * 検証済みかどうかを確認
 */
function pv_isEffectVerified(effectId) {
  const effect = PV_EFFECTS[effectId];
  return effect ? effect.verified : false;
}

// ================================================================================
// ===== 旧互換関数 =====
// ================================================================================

/**
 * @deprecated 新UIでは pv_getEffects() を使用
 */
function pv_getBackgroundEffects() {
  return PV_BACKGROUND_EFFECTS;
}

/**
 * @deprecated 新UIでは pv_getEffectById() を使用
 */
function pv_getBackgroundEffectById(effectId) {
  return PV_BACKGROUND_EFFECTS.find(e => e.id === effectId);
}

/**
 * @deprecated 新UIでは pv_getActions() を使用
 */
function pv_getCharacterActions() {
  return PV_CHARACTER_ACTIONS;
}

/**
 * @deprecated 新UIでは pv_getActionById() を使用
 */
function pv_getCharacterActionById(actionId) {
  return PV_CHARACTER_ACTIONS.find(a => a.id === actionId);
}

/**
 * 場所オプションを取得（旧互換 + 新形式兼用）
 */
function pv_getLocationOptions() {
  return PV_BACKGROUND_LOCATIONS;
}

/**
 * 時間帯オプションを取得（旧互換 + 新形式兼用）
 */
function pv_getTimeOptions() {
  return PV_BACKGROUND_TIMES;
}
