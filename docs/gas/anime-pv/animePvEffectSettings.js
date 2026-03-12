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
    thumbnail: '',
    inDevelopment: false,
    timing: '2.7s',
    description: '扉を開いて新しい世界へ - 過去から現在への転換',
    startFrameBase: 'Medium shot of character in dark space, hands reaching toward door, anxious searching expression',
    endFrameBase: 'Character stepping through bright doorway into new world, confident posture',
    effects: ['light_flooding', 'costume_change']
  },
  walk_backward: {
    id: 'walk_backward',
    name: '後ろ向きで歩く',
    icon: '🚶',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.5s',
    description: '後ろ向きで歩いていく - 世界が180度回転して変わる',
    startFrameBase: 'Full body back view, character walking away from camera, original environment',
    endFrameBase: 'Character in completely transformed environment after 180 degree world rotation',
    effects: ['world_rotation', 'costume_change']
  },

  // ===== C. コメディ・教育系アクション =====

  double_take: {
    id: 'double_take',
    name: '二度見リアクション',
    icon: '😲',
    thumbnail: '',
    inDevelopment: false,
    timing: '1.5s',
    description: '失敗に気づいて二度見→正解が見える',
    startFrameBase: 'Bust shot of character looking away casually, relaxed posture, unaware expression',
    endFrameBase: 'Character doing double-take reaction, wide eyes, surprised realization',
    effects: ['comedy_lightbulb', 'x_to_o_transition']
  },

  facepalm_to_smile: {
    id: 'facepalm_to_smile',
    name: '頭を抱える→笑顔',
    icon: '🤦',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.0s',
    description: '失敗で頭を抱える→気づいて笑顔に',
    startFrameBase: 'Bust shot of character with hand on forehead, frustrated facepalm pose, troubled expression',
    endFrameBase: 'Character smiling with understanding, hand lowered, relieved happy expression',
    effects: ['comedy_lightbulb', 'sparkle_understanding']
  },

  // ===== D. ゲーミフィケーション系アクション =====

  gauge_fill_burst: {
    id: 'gauge_fill_burst',
    name: 'ゲージ満タン',
    icon: '📊',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.5s',
    description: 'EXPゲージが満タンになりレベルアップ爆発',
    startFrameBase: 'Full body shot of character in determined pose, EXP gauge visible at bottom, gauge nearly full',
    endFrameBase: 'Character in victory pose, rainbow explosion effect, LEVEL UP text burst',
    effects: ['level_up_fanfare', 'rainbow_explosion']
  },

  skill_unlock_pose: {
    id: 'skill_unlock_pose',
    name: 'スキル獲得',
    icon: '⚔️',
    thumbnail: '',
    inDevelopment: false,
    timing: '1.8s',
    description: '新スキル獲得のポーズ決め',
    startFrameBase: 'Full body shot of character in ready stance, anticipation pose, focused expression',
    endFrameBase: 'Character in power pose with skill icon appearing above, magic circle at feet',
    effects: ['skill_icon_appear', 'magic_circle']
  },

  // ===== E. Nike・スポーツ系アクション =====

  explosive_start: {
    id: 'explosive_start',
    name: '爆発的スタート',
    icon: '🏃',
    thumbnail: '',
    inDevelopment: false,
    timing: '0.8s',
    description: '静止状態から爆発的にスタートダッシュ',
    startFrameBase: 'Full body shot of character in starting position, crouched ready stance, intense focus',
    endFrameBase: 'Character bursting forward in explosive sprint, speed lines, dust burst from ground',
    effects: ['speed_lines', 'dust_burst']
  },

  finish_line_cross: {
    id: 'finish_line_cross',
    name: 'ゴール突破',
    icon: '🏆',
    thumbnail: '',
    inDevelopment: false,
    timing: '3.0s',
    description: 'ゴールテープを切る瞬間をスローモーションで',
    startFrameBase: 'Full body shot of character running towards finish line, determined expression, arms pumping',
    endFrameBase: 'Character crossing finish line in slow motion, breaking tape, confetti explosion',
    effects: ['slow_motion_victory', 'confetti_explosion']
  },

  // ===== F. プレゼン・ビジョン系アクション =====

  data_convergence: {
    id: 'data_convergence',
    name: 'データが集まる',
    icon: '📈',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.2s',
    description: 'バラバラのデータが一つのグラフ/結論に収束',
    startFrameBase: 'Medium shot of character surrounded by scattered data points and fragments, thoughtful expression',
    endFrameBase: 'Character with all data converged into clear graph/conclusion behind, enlightened expression',
    effects: ['data_animation', 'clarity_burst']
  },

  horizon_expand: {
    id: 'horizon_expand',
    name: '視野が広がる',
    icon: '🌅',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.0s',
    description: '狭い視野から広大な景色へ',
    startFrameBase: 'Close-up of character in narrow confined space, limited view, contemplative',
    endFrameBase: 'Wide shot of character facing vast horizon, expansive landscape revealed, inspired expression',
    effects: ['horizon_reveal', 'sky_expansion']
  },

  // ===== G. ドキュメンタリー系アクション =====

  group_look_up: {
    id: 'group_look_up',
    name: '全員が顔を上げる',
    icon: '👥',
    thumbnail: '',
    inDevelopment: false,
    timing: '1.5s',
    description: 'うつむいていた複数人が一斉に顔を上げる',
    startFrameBase: 'Group shot of multiple characters looking down, shadowed faces, discouraged posture',
    endFrameBase: 'All characters looking up together, faces lit, unified determined expression',
    effects: ['unity_light', 'forward_together']
  },

  sepia_to_color: {
    id: 'sepia_to_color',
    name: '記憶が蘇る',
    icon: '📷',
    thumbnail: '',
    inDevelopment: false,
    timing: '2.5s',
    description: 'セピア調の過去から鮮やかな現在へ',
    startFrameBase: 'Sepia toned image of character in past memory, faded vintage look, nostalgic atmosphere',
    endFrameBase: 'Full vibrant color image of character, memory restored, vivid present moment',
    effects: ['color_restoration', 'memory_bloom']
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

  // ===== 新規エフェクト =====

  light_flooding: {
    id: 'light_flooding',
    name: '光の氾濫',
    icon: '☀️',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      door_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, cinematic color grading, atmospheric depth, high quality animation.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character in [BACKGROUND_BEFORE], hands reaching toward a door.
Character wearing [COSTUME_BEFORE].
Door outline glowing faintly. Anxious, searching expression.
Dark atmospheric mood, shadowy lighting.
Camera: medium shot framing, character centered.
Lighting: minimal, door outline glow only, dark shadows.

Composition: Character in starting environment, door visible ahead as light source.

Constraints: dark atmosphere, door closed, faint glow on door edges only.`,
          negative: 'no bright light yet, no open door, no cheerful expression, no sunlight'
        },
        endFrame: {
          prompt: `masterpiece, best quality, Makoto Shinkai anime style, cinematic composition.

Medium shot of character stepping through bright doorway into new world.
Character wearing [COSTUME_AFTER], confident posture.
(bright light flooding through open doorway:1.3), strong backlight.
Lens flare, god rays streaming from doorway.
[BACKGROUND_AFTER] - bright new world visible through doorway.
Camera: medium shot, character silhouette against brilliant light.

Constraints: door fully open, warm golden light, character confident, new world clearly visible.`,
          negative: 'closed door, dark, anxious expression, old clothes'
        },
        videoPrompt: `[0-1.3s] Character in [BACKGROUND_BEFORE], searching, anxious expression.
Character wearing [COSTUME_BEFORE]. Hands reaching toward closed door.
Door outline glowing faintly in the darkness.

[1.3-1.9s] Door outline begins to glow brighter, character approaches slowly.
Light seeping through door edges, anticipation building.
Hope emerging from [BACKGROUND_BEFORE].

[1.9-2.7s] ★EXPLOSION MOMENT: Hands push door, door slowly opens★
★Bright golden light floods through opening doorway★
Hair and clothes blown back gently by light wind from doorway.
God rays streaming into space, [BACKGROUND_BEFORE] receding.

[2.7-3.7s] Door fully open, brilliant light flooding the scene.
Character silhouette against the light, stepping forward.
Clothes beginning to transform from [COSTUME_BEFORE] to [COSTUME_AFTER].
New world [BACKGROUND_AFTER] becoming visible through doorway.

[3.7-5.5s] Character steps through into new bright world.
Now wearing [COSTUME_AFTER], confident walk.
[BACKGROUND_AFTER] - completely new environment, warm atmosphere, freedom.

Constraints: light comes from doorway only, warm golden light, gradual door opening, transition from [BACKGROUND_BEFORE] to [BACKGROUND_AFTER].
Negative: no sudden darkness, no closing door, no harsh shadows, no flickering, no return to old environment.`
      }
    }
  },

  costume_change: {
    id: 'costume_change',
    name: '服装変化',
    icon: '👔',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      door_open: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, cinematic color grading, atmospheric depth, high quality animation.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character in [BACKGROUND_BEFORE], standing before closed door.
Character wearing [COSTUME_BEFORE], uncertain posture.
Everyday casual outfit, slightly hunched shoulders.
Dark atmospheric mood.
Camera: medium shot framing, character centered.
Lighting: shadowed, minimal light.

Composition: Character in everyday clothes, contemplative mood before door.

Constraints: casual clothes clearly visible, uncertain body language, door closed.`,
          negative: 'no formal clothes, no confident pose, no bright light, no professional attire'
        },
        endFrame: {
          prompt: `masterpiece, best quality, Makoto Shinkai anime style, cinematic composition.

Medium shot of character stepping through bright doorway into new world.
(Character wearing [COSTUME_AFTER]:1.3), confident posture.
Professional transformed appearance, straight shoulders.
Strong backlight from doorway, lens flare.
[BACKGROUND_AFTER] - bright new world visible through doorway.

Constraints: new outfit clearly visible, confident body language, transformed appearance, new world visible.`,
          negative: 'old casual clothes, uncertain expression, hunched posture'
        },
        videoPrompt: `[0-1.3s] Character in [BACKGROUND_BEFORE], uncertain posture.
Character wearing [COSTUME_BEFORE], everyday casual appearance.
Standing before closed door, contemplative.

[1.3-2.7s] Character approaches door, hand reaches for handle.
Door begins to open, light starts streaming in from [BACKGROUND_AFTER].
Light touches character, subtle shimmer on clothes.

[2.7-3.7s] ★TRANSFORMATION MOMENT: As door opens fully★
★Clothes begin to shimmer and transform★
Fabric flows and reshapes, colors shifting.
[COSTUME_BEFORE] gradually transforming to [COSTUME_AFTER].
Posture straightening, confidence building.
[BACKGROUND_AFTER] becoming visible through doorway.

[3.7-5.5s] Character steps through into new bright world [BACKGROUND_AFTER].
Now wearing [COSTUME_AFTER], confident walk.
Professional appearance, straight shoulders, purposeful stride.
Completely new environment, freedom and possibility.

Constraints: clothes transform during light transition, gradual elegant change, posture improves with outfit.
Negative: no instant change, no magic sparkles, no comedic transformation, no remaining old clothes, no return to [BACKGROUND_BEFORE].`
      },
      walk_backward: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, cinematic color grading, atmospheric depth, high quality animation.
Cinematic composition, 16:9 aspect ratio.

Full body shot, back view of character walking away from camera.
Character wearing [COSTUME_BEFORE], casual everyday outfit.
[BACKGROUND_BEFORE] - original environment with atmospheric depth.
Camera: full body framing, character centered, back to camera.
Lighting: natural lighting of original environment.

Composition: Character walking into distance, original world visible.

Constraints: back view only, original outfit clearly visible, original environment.`,
          negative: 'no front view, no transformed clothes, no different environment'
        },
        endFrame: {
          prompt: `masterpiece, best quality, Makoto Shinkai anime style, cinematic composition.

Full body shot, back view of character continuing to walk.
(Character wearing [COSTUME_AFTER]:1.3), transformed professional outfit.
[BACKGROUND_AFTER] - completely different environment, new atmosphere.
New color palette, transformed world.
Camera: full body, back view, character walking forward.

Constraints: new outfit clearly visible from back, completely new environment.`,
          negative: 'original clothes, same environment, front view'
        },
        videoPrompt: `[0-1.0s] Character walking backward away from camera, steady pace.
Back view only, character wearing [COSTUME_BEFORE].
Walking into the distance in [BACKGROUND_BEFORE].

[1.0-2.5s] Background begins rotating around character (reaching 90 degrees).
Character stays perfectly upright while entire world rotates.
[BACKGROUND_BEFORE] rotating, colors beginning to shift.
Clothes beginning to shimmer subtly as world turns.

[2.5-3.5s] ★ROTATION COMPLETE: Background at 180 degrees★
★Outfit transforms from [COSTUME_BEFORE] to [COSTUME_AFTER]★
[BACKGROUND_AFTER] now fully visible - completely new world.
Different colors, different atmosphere, transformed environment.
Character now in transformed professional outfit.

[3.5-5.0s] Character continues walking in [BACKGROUND_AFTER].
Now wearing [COSTUME_AFTER], confident stride.
New environment stable, character walks forward into new future.

Constraints: character always upright, outfit changes with world rotation, smooth transition from [BACKGROUND_BEFORE] to [BACKGROUND_AFTER].
Negative: no character rotation, no dizzy motion, no partial outfit change, no jerky movement, no return to original world.`
      }
    }
  },

  world_rotation: {
    id: 'world_rotation',
    name: '世界回転',
    icon: '🌀',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      walk_backward: {
        startFrame: {
          prompt: `Makoto Shinkai anime style, soft lighting, cinematic color grading, atmospheric depth, high quality animation.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character walking away from camera, back view.
Character wearing [COSTUME_BEFORE].
[BACKGROUND_BEFORE] - original environment with full atmospheric depth.
Camera: full body framing, character centered, back to camera.
Lighting: natural lighting matching original environment.

Composition: Character walking into the distance, clear background visible.

Constraints: back view only, original environment clearly established, no rotation yet.`,
          negative: 'no front view, no rotation yet, no different environment, no transformed world'
        },
        endFrame: {
          prompt: `masterpiece, best quality, Makoto Shinkai anime style, cinematic composition.

Full body shot, back view, character continuing to walk forward.
Character wearing [COSTUME_AFTER].
[BACKGROUND_AFTER] - completely different environment, transformed atmosphere.
New color palette - shifted from original, different mood.
Camera: full body, back view, character walking.

Constraints: 180 degree rotated world, completely new environment, transformed atmosphere.`,
          negative: 'original background, same environment, front view, original colors'
        },
        videoPrompt: `[0-1.0s] Character walking backward away from camera, steady pace.
Back view only, character wearing [COSTUME_BEFORE].
Original environment clearly visible - [BACKGROUND_BEFORE].
Calm, natural movement into the distance.

[1.0-2.5s] ★Background begins rotating around character★
World rotates slowly reaching 90 degrees by 2.5s.
Character stays PERFECTLY UPRIGHT while entire world rotates around them.
[BACKGROUND_BEFORE] rotating, colors begin shifting.
Original palette fading, new colors emerging toward [BACKGROUND_AFTER].
Horizon line tilting as world turns.

[2.5-3.5s] ★ROTATION COMPLETE: World at 180 degrees★
★[BACKGROUND_AFTER] now fully visible - completely new environment★
Dramatic color shift complete - entirely different atmosphere.
Sky, ground, surroundings all transformed.
Character now wearing [COSTUME_AFTER].
Walking continues in same direction but in new world.

[3.5-5.0s] Character continues walking in [BACKGROUND_AFTER].
New environment now stable and fully established.
Character walks forward into new future with purpose.
New atmosphere, new possibilities.

Constraints: character NEVER rotates - only the world around them rotates, smooth 180 degree rotation from [BACKGROUND_BEFORE] to [BACKGROUND_AFTER], character always upright and walking steadily.
Negative: no character rotation, no dizzy camera, no jerky movement, no partial rotation, no return to [BACKGROUND_BEFORE].`
      }
    }
  },

  // ================================================================================
  // ===== C. コメディ系エフェクト =====
  // ================================================================================

  comedy_lightbulb: {
    id: 'comedy_lightbulb',
    name: '電球ピカーン',
    icon: '💡',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      double_take: {
        startFrame: {
          prompt: `Anime style, bright lighting, comedic atmosphere.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character looking away casually, relaxed posture.
Unaware expression, not paying attention.
[BACKGROUND] with neutral atmosphere.
Camera: bust shot framing, character slightly off-center.
Lighting: even, neutral lighting.

Constraints: casual pose, unaware expression, no lightbulb effect yet.`,
          negative: 'no surprised expression, no lightbulb, no realization, no comedy effects'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, comedic composition.

Bust shot of character doing double-take, wide surprised eyes.
(Glowing lightbulb appearing above head:1.3), realization moment.
Comedic expression, eyebrows raised, mouth slightly open.
[BACKGROUND] with bright atmosphere.

Constraints: clear double-take pose, lightbulb glowing above head, surprised but understanding expression.`,
          negative: 'calm expression, no lightbulb, unaware'
        },
        videoPrompt: `[0-0.5s] Character looking away casually, relaxed.
Not paying attention, neutral expression.

[0.5-1.0s] Something catches attention, head begins to turn.
Eyes starting to widen slightly.

[1.0-1.5s] ★DOUBLE-TAKE MOMENT: Head snaps back for second look★
★Lightbulb appears and LIGHTS UP above character's head★
Wide eyes, surprised realization expression.
Comedic timing - quick snap of attention.

[1.5-2.5s] Lightbulb glowing brightly above head.
Character's expression shifts from surprise to understanding.
"Aha!" moment clearly visible.

Constraints: comedic timing on double-take, lightbulb appears at moment of realization.
Negative: no slow realization, no sad expression, no dark atmosphere.`
      },
      facepalm_to_smile: {
        startFrame: {
          prompt: `Anime style, soft lighting, emotional atmosphere.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with hand on forehead, facepalm pose.
Frustrated or troubled expression, eyes closed or looking down.
[BACKGROUND] with slightly dim atmosphere.
Camera: bust shot framing, character centered.
Lighting: soft, slightly shadowed.

Constraints: clear facepalm pose, troubled expression, no smile yet.`,
          negative: 'no smiling, no lightbulb, no happy expression, no understanding'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, warm composition.

Bust shot of character with hand lowering from face, gentle smile.
(Glowing lightbulb above head:1.3), understanding achieved.
Relieved, happy expression, eyes open and bright.
[BACKGROUND] with warm, bright atmosphere.

Constraints: smile of understanding, lightbulb glowing, hand moving away from face.`,
          negative: 'frustrated, facepalm, troubled, dark'
        },
        videoPrompt: `[0-0.8s] Character in facepalm pose, hand on forehead.
Frustrated, troubled expression, eyes closed.
Struggling with problem, slight shake of head.

[0.8-1.5s] Hand begins to lower slowly.
Eyes start to open, expression softening.
Moment of dawning understanding.

[1.5-2.0s] ★LIGHTBULB MOMENT: Lightbulb appears and glows above head★
★Hand fully lowered, smile spreading across face★
"I get it now!" realization.

[2.0-3.0s] Full smile, lightbulb glowing brightly.
Relieved, happy expression.
Understanding achieved, problem solved.

Constraints: gradual transition from frustration to understanding, lightbulb at moment of clarity.
Negative: no staying frustrated, no dark ending.`
      }
    }
  },

  x_to_o_transition: {
    id: 'x_to_o_transition',
    name: '×→○変換',
    icon: '❌➡️⭕',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      double_take: {
        startFrame: {
          prompt: `Anime style, bright educational atmosphere.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with large red X mark floating beside them.
Confused or uncertain expression, tilted head.
[BACKGROUND] with clean, educational setting feel.
Camera: bust shot framing, character and X mark both visible.

Constraints: clear X mark visible, confused expression, educational atmosphere.`,
          negative: 'no O mark, no correct answer, no understanding'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, educational composition.

Bust shot of character with large green O mark floating beside them.
(X mark transformed to O mark:1.3), correct answer revealed.
Happy, understanding expression, confident pose.
[BACKGROUND] with bright, positive atmosphere.

Constraints: clear O mark visible, understanding achieved, positive atmosphere.`,
          negative: 'X mark, wrong answer, confused'
        },
        videoPrompt: `[0-0.5s] Character looking at floating X mark beside them.
Confused expression, tilted head, uncertain.
Red X mark clearly visible.

[0.5-1.0s] Character does double-take, looking at X mark again.
Starting to understand something.

[1.0-1.5s] ★TRANSFORMATION MOMENT: X mark begins to rotate★
★X mark morphs/transforms into O mark★
Color shifts from red to green.

[1.5-2.5s] O mark fully formed and glowing green.
Character's expression changes to understanding and happiness.
Confident nod, "I understand now!" moment.

Constraints: clear X to O transformation, color shift red to green.
Negative: no staying as X, no confusion at end.`
      }
    }
  },

  sparkle_understanding: {
    id: 'sparkle_understanding',
    name: 'キラキラ理解',
    icon: '✨',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      facepalm_to_smile: {
        startFrame: {
          prompt: `Anime style, soft lighting, contemplative atmosphere.
Cinematic composition, 16:9 aspect ratio.

Bust shot of character with hand on forehead, troubled pose.
Frustrated expression, struggling with understanding.
[BACKGROUND] with dim, muted colors.
Camera: bust shot framing, character centered.

Constraints: troubled expression, no sparkles, muted atmosphere.`,
          negative: 'no sparkles, no smiling, no bright colors'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, magical composition.

Bust shot of character smiling with understanding.
(Sparkles and light particles surrounding character:1.3).
Eyes bright and shining, happy relieved expression.
[BACKGROUND] transformed to bright, warm colors.

Constraints: sparkles around character, understanding achieved, bright atmosphere.`,
          negative: 'troubled, frustrated, dark, no sparkles'
        },
        videoPrompt: `[0-0.8s] Character in troubled pose, hand on forehead.
Frustrated, thinking hard, struggling.
Dark, muted atmosphere around character.

[0.8-1.5s] Realization begins, hand lowering.
First small sparkles appearing around character.
Expression starting to soften.

[1.5-2.0s] ★SPARKLE BURST: Understanding achieved★
★Sparkles multiply and surround character★
Smile spreading across face.

[2.0-3.0s] Full sparkle effect, character glowing with understanding.
Happy, relieved expression.
Bright, warm atmosphere.

Constraints: sparkles increase as understanding grows, magical feeling.
Negative: no staying dark, no frustration at end.`
      }
    }
  },

  // ================================================================================
  // ===== D. ゲーム系エフェクト =====
  // ================================================================================

  level_up_fanfare: {
    id: 'level_up_fanfare',
    name: 'レベルアップ演出',
    icon: '🎺',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      gauge_fill_burst: {
        startFrame: {
          prompt: `Anime game style, dramatic lighting, achievement atmosphere.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character in determined pose.
EXP gauge/bar visible at bottom of frame, gauge at 90% full.
Anticipation expression, about to achieve something.
[BACKGROUND] with game-like UI elements.
Camera: full body framing, character centered.

Constraints: EXP gauge nearly full, anticipation pose, game UI visible.`,
          negative: 'no full gauge, no level up yet, no celebration'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime game style, victory composition.

Full body shot of character in victory/power pose.
(LEVEL UP text burst with rainbow colors:1.3).
EXP gauge overflowing with light, celebratory explosion.
Triumphant expression, arms raised or fist pump.
[BACKGROUND] with rainbow light rays and sparkles.

Constraints: clear LEVEL UP moment, rainbow explosion, victory pose.`,
          negative: 'no level up, incomplete gauge, no celebration'
        },
        videoPrompt: `[0-1.0s] Character in determined stance, watching EXP gauge.
Gauge at 90%, slowly filling.
Anticipation building, focused expression.

[1.0-2.0s] Gauge reaches 95%, 98%, approaching full.
Character tensing with anticipation.
Light starting to glow from gauge.

[2.0-2.5s] ★LEVEL UP MOMENT: Gauge hits 100%★
★Rainbow explosion bursts from character★
"LEVEL UP" text appears with fanfare effect.

[2.5-4.0s] Character transitions to victory pose.
Arms raised in triumph, fist pump.
Rainbow lights and sparkles continue.
Triumphant, accomplished expression.

Constraints: dramatic gauge fill, explosive level up moment, victory celebration.
Negative: no incomplete level up, no sad expression.`
      }
    }
  },

  rainbow_explosion: {
    id: 'rainbow_explosion',
    name: '虹色爆発',
    icon: '🌈',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      gauge_fill_burst: {
        startFrame: {
          prompt: `Anime game style, anticipation lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character concentrating, power building.
Subtle glow around character, energy gathering.
[BACKGROUND] with dark atmosphere before burst.
Camera: full body framing, character centered.

Constraints: energy gathering, pre-explosion state, concentrated expression.`,
          negative: 'no explosion yet, no rainbow colors, no release'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime game style, explosive composition.

Full body shot of character at center of rainbow explosion.
(Seven colors of light radiating outward:1.3), radial burst pattern.
Triumphant pose, silhouette against brilliant light.
[BACKGROUND] filled with rainbow radial rays.

Constraints: clear rainbow explosion, radial pattern, triumphant moment.`,
          negative: 'no explosion, single color, dark'
        },
        videoPrompt: `[0-1.5s] Character concentrating, energy gathering.
Subtle glow around body, power building.
Colors starting to swirl around character.

[1.5-2.5s] ★EXPLOSION MOMENT: Energy releases★
★Seven colors burst OUTWARD in radial pattern★
Red, orange, yellow, green, blue, indigo, violet.
Character at center of rainbow burst.

[2.5-4.0s] Rainbow rays continue expanding outward.
Character in triumphant pose.
Brilliant, colorful light filling the scene.

Constraints: seven distinct colors, radial explosion pattern, character remains centered.
Negative: no single color, no inward movement, no dark ending.`
      }
    }
  },

  skill_icon_appear: {
    id: 'skill_icon_appear',
    name: 'スキルアイコン出現',
    icon: '🎯',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      skill_unlock_pose: {
        startFrame: {
          prompt: `Anime game style, focused lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character in ready stance.
Focused, determined expression, about to unlock something.
[BACKGROUND] with game-like atmosphere.
Camera: full body framing, character centered.

Constraints: ready stance, anticipation, no skill icon yet.`,
          negative: 'no skill icon, no magic effects, no achievement'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime game style, achievement composition.

Full body shot of character with skill icon floating above head.
(Glowing skill icon/badge appearing:1.3), newly unlocked.
Proud, accomplished expression, power pose.
[BACKGROUND] with magical glow effect.

Constraints: clear skill icon above head, accomplished expression, magical atmosphere.`,
          negative: 'no skill icon, no achievement, no glow'
        },
        videoPrompt: `[0-0.8s] Character in ready stance, focused.
Anticipation of skill unlock.
No effects yet, building tension.

[0.8-1.5s] Light begins gathering above character's head.
Swirling energy forming shape.
Character looking up at forming icon.

[1.5-1.8s] ★SKILL UNLOCK: Icon crystallizes above head★
★Clear skill icon/badge now visible★
Triumphant sound effect moment.

[1.8-3.0s] Character transitions to proud pose.
Skill icon glowing above head.
Accomplished, powerful expression.
"New skill acquired!" feeling.

Constraints: skill icon clearly visible and glowing, proud moment.
Negative: no incomplete icon, no failure.`
      }
    }
  },

  magic_circle: {
    id: 'magic_circle',
    name: '魔法陣',
    icon: '🔮',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      skill_unlock_pose: {
        startFrame: {
          prompt: `Anime fantasy style, dramatic lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character in ready stance.
Standing on normal ground, no magic effects.
[BACKGROUND] with atmospheric depth.
Camera: full body framing, showing feet and ground.

Constraints: normal ground visible, no magic circle yet.`,
          negative: 'no magic circle, no glowing floor, no runes'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime fantasy style, magical composition.

Full body shot of character standing on glowing magic circle.
(Intricate magic circle with runes at feet:1.3), rotating slowly.
Power pose, magical energy rising from circle.
[BACKGROUND] with magical atmosphere.

Constraints: detailed magic circle at feet, glowing runes, magical power visible.`,
          negative: 'no magic circle, no runes, normal ground'
        },
        videoPrompt: `[0-0.8s] Character in ready stance on normal ground.
Building anticipation, power gathering.

[0.8-1.5s] ★MAGIC CIRCLE APPEARS: Light forms at feet★
★Intricate circular pattern spreading outward★
Runes and symbols becoming visible.

[1.5-2.5s] Magic circle fully formed and glowing.
Circle rotating slowly around character.
Magical energy rising upward from patterns.

[2.5-3.5s] Character in power pose on glowing magic circle.
Full magical effect, runes pulsing with light.
Powerful, accomplished expression.

Constraints: intricate magic circle design, slow rotation, energy rising upward.
Negative: no disappearing circle, no broken pattern.`
      }
    }
  },

  // ================================================================================
  // ===== E. Nike系エフェクト =====
  // ================================================================================

  speed_lines: {
    id: 'speed_lines',
    name: 'スピードライン',
    icon: '💨',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      explosive_start: {
        startFrame: {
          prompt: `Anime sports style, focused lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character in starting position.
Crouched ready stance, fingers on ground.
Intense focused expression, muscles tensed.
[BACKGROUND] with clear, still atmosphere.
Camera: low angle, emphasizing ready position.

Constraints: starting position, no movement yet, tension before action.`,
          negative: 'no movement, no speed lines, no running'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime sports style, dynamic composition.

Full body shot of character in explosive sprint.
(Speed lines radiating from character:1.3), motion blur effect.
Powerful running form, determined expression.
[BACKGROUND] blurred with motion.

Constraints: clear speed lines, dynamic running pose, sense of incredible speed.`,
          negative: 'standing still, no speed lines, no motion'
        },
        videoPrompt: `[0-0.3s] Character in starting position, crouched.
Intense focus, muscles coiled.
Complete stillness, tension at maximum.

[0.3-0.8s] ★EXPLOSIVE START: Character bursts forward★
★Speed lines appear radiating from movement★
Powerful push-off, dust from ground.

[0.8-2.0s] Full sprint, speed lines streaming behind.
Character moving at incredible speed.
Background blurring with motion.
Determined, powerful expression.

Constraints: instantaneous acceleration, speed lines throughout sprint, dynamic energy.
Negative: no slow start, no hesitation.`
      }
    }
  },

  dust_burst: {
    id: 'dust_burst',
    name: '砂埃爆発',
    icon: '💥',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      explosive_start: {
        startFrame: {
          prompt: `Anime sports style, ground-level focus.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character in starting crouch.
Feet planted firmly on ground, ready to push off.
[BACKGROUND] with clear ground/track visible.
Camera: low angle showing ground and character.

Constraints: feet on ground, ready position, ground clearly visible.`,
          negative: 'no dust, no movement, no explosion'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime sports style, explosive composition.

Full body shot of character launching forward.
(Dust and debris exploding from ground:1.3), radial burst from feet.
Powerful takeoff moment, ground cracking slightly.
[BACKGROUND] with dust cloud expanding.

Constraints: dramatic dust explosion, powerful takeoff, ground impact visible.`,
          negative: 'no dust, clean ground, no impact'
        },
        videoPrompt: `[0-0.3s] Character in starting position, feet pressed to ground.
Maximum tension before release.
Ground still and quiet.

[0.3-0.8s] ★BURST MOMENT: Feet push off powerfully★
★Dust and debris EXPLODE from ground★
Circular burst pattern from point of impact.

[0.8-2.0s] Dust cloud expanding and rising.
Character already far ahead.
Ground shows impact marks.
Debris settling slowly.

Constraints: explosive dust burst at moment of push-off, radial pattern.
Negative: no slow dust rise, no weak impact.`
      }
    }
  },

  slow_motion_victory: {
    id: 'slow_motion_victory',
    name: 'スローモ勝利',
    icon: '🏅',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      finish_line_cross: {
        startFrame: {
          prompt: `Anime sports style, dramatic lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character approaching finish line.
Running at full speed, determined expression.
Finish line tape visible ahead.
[BACKGROUND] with race atmosphere.
Camera: side angle, capturing approach to finish.

Constraints: approaching finish, not yet crossed, running pose.`,
          negative: 'no finish yet, no celebration, no slow motion'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime sports style, cinematic composition.

Full body shot of character crossing finish line in slow motion.
(Breaking through finish tape:1.3), tape stretching and breaking.
Arms raised beginning victory pose.
Sweat droplets frozen in air, hair flowing.
[BACKGROUND] with cheering atmosphere.

Constraints: slow motion crossing moment, tape breaking, victory beginning.`,
          negative: 'not at finish line, no tape, no victory'
        },
        videoPrompt: `[0-1.0s] Character running toward finish line at full speed.
Determined, pushing hard.
Finish tape visible ahead.

[1.0-2.0s] ★SLOW MOTION BEGINS: Final steps to finish★
Time slowing down dramatically.
Every detail visible - sweat, muscle movement.

[2.0-3.0s] ★VICTORY MOMENT: Breaking through tape★
★Tape stretching and snapping in slow motion★
Arms beginning to raise.
Emotional release on face.

[3.0-4.0s] Victory pose forming in slow motion.
Triumphant expression, joy overwhelming.
Time gradually returning to normal.

Constraints: dramatic slow motion at victory moment, emotional impact.
Negative: no quick finish, no loss.`
      }
    }
  },

  confetti_explosion: {
    id: 'confetti_explosion',
    name: '紙吹雪爆発',
    icon: '🎊',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      finish_line_cross: {
        startFrame: {
          prompt: `Anime sports style, anticipation lighting.
Cinematic composition, 16:9 aspect ratio.

Full body shot of character about to cross finish line.
Final push, reaching forward.
[BACKGROUND] with crowd atmosphere, clear sky.
Camera: frontal angle, capturing finish moment.

Constraints: about to finish, no confetti yet, anticipation.`,
          negative: 'no confetti, no celebration effects, not finished'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime sports style, celebration composition.

Full body shot of character with arms raised in victory.
(Confetti explosion surrounding character:1.3), multicolored paper raining down.
Ecstatic expression, ultimate triumph.
[BACKGROUND] filled with colorful confetti.

Constraints: colorful confetti everywhere, victory pose, celebration atmosphere.`,
          negative: 'no confetti, no celebration, sad'
        },
        videoPrompt: `[0-1.5s] Character crossing finish line.
Arms beginning to raise.
Moment of realization - victory achieved.

[1.5-2.5s] ★CONFETTI EXPLOSION: Victory confirmed★
★Colorful confetti bursts from above★
Multicolored paper raining down.

[2.5-4.0s] Full victory celebration.
Arms raised high, surrounded by confetti.
Confetti slowly falling all around.
Pure joy on character's face.

Constraints: dramatic confetti burst, multicolored, joyful atmosphere.
Negative: no single color confetti, no sad ending.`
      }
    }
  },

  // ================================================================================
  // ===== F. プレゼン系エフェクト =====
  // ================================================================================

  data_animation: {
    id: 'data_animation',
    name: 'データアニメーション',
    icon: '📊',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      data_convergence: {
        startFrame: {
          prompt: `Anime business style, analytical atmosphere.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character surrounded by scattered data fragments.
Floating numbers, disconnected charts, random data points.
Thoughtful, analytical expression.
[BACKGROUND] with abstract data visualization atmosphere.
Camera: medium shot, character among data chaos.

Constraints: scattered data visible, not yet organized, analytical mood.`,
          negative: 'no organized data, no clear graph, no conclusion'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime business style, insightful composition.

Medium shot of character with organized data behind them.
(Data converged into clear graph/chart:1.3), conclusion visible.
Confident, enlightened expression.
[BACKGROUND] with clean data visualization.

Constraints: clear organized graph, data makes sense now, confident expression.`,
          negative: 'scattered data, chaos, confused'
        },
        videoPrompt: `[0-1.0s] Character surrounded by scattered data fragments.
Numbers, partial charts floating chaotically.
Thoughtful expression, trying to understand.

[1.0-1.8s] Data points begin moving, organizing.
Fragments starting to connect.
Character's expression brightening.

[1.8-2.2s] ★CONVERGENCE MOMENT: All data comes together★
★Clear graph/chart forms from chaos★
"I see it now!" realization.

[2.2-3.5s] Clean, organized data visualization behind character.
Confident expression, insight achieved.
Data flowing smoothly in organized pattern.

Constraints: clear transformation from chaos to order, data tells a story now.
Negative: no staying chaotic, no confusion at end.`
      }
    }
  },

  clarity_burst: {
    id: 'clarity_burst',
    name: '明確化の光',
    icon: '💡',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      data_convergence: {
        startFrame: {
          prompt: `Anime business style, dim analytical atmosphere.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character in dim environment, thinking.
Unclear, foggy atmosphere around character.
Concentrated expression, searching for answer.
[BACKGROUND] with muted, unclear visuals.

Constraints: dim atmosphere, unclear surroundings, searching.`,
          negative: 'no clarity, no bright light, no answer'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime business style, revelation composition.

Medium shot of character in bright, clear environment.
(Burst of clarity light from center:1.3), fog dispelled.
Confident, enlightened expression, answer found.
[BACKGROUND] now crystal clear and bright.

Constraints: clear bright atmosphere, clarity achieved, confidence.`,
          negative: 'foggy, dim, confused, searching'
        },
        videoPrompt: `[0-1.0s] Character in dim, foggy environment.
Searching for answer, concentrated.
Unclear atmosphere all around.

[1.0-1.8s] Point of light beginning to form.
Fog starting to recede.
Character noticing the emerging clarity.

[1.8-2.2s] ★CLARITY BURST: Light expands outward★
★Fog completely dispelled, everything clear★
Answer revealed, understanding achieved.

[2.2-3.5s] Bright, clear environment.
Character confident and enlightened.
Everything visible and understandable.

Constraints: dramatic clarity transformation, fog to clear, light expanding.
Negative: no staying foggy, no confusion at end.`
      }
    }
  },

  horizon_reveal: {
    id: 'horizon_reveal',
    name: '地平線出現',
    icon: '🌄',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      horizon_expand: {
        startFrame: {
          prompt: `Anime style, confined atmosphere.
Cinematic composition, 16:9 aspect ratio.

Close-up of character in narrow, confined space.
Limited view, walls or barriers visible.
Contemplative expression, looking for way out.
[BACKGROUND] showing limited, enclosed environment.
Camera: close framing, claustrophobic feel.

Constraints: confined space, limited view, no horizon visible.`,
          negative: 'no wide view, no horizon, no open space'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, expansive composition.

Wide shot of character facing vast horizon.
(Endless horizon stretching before character:1.3), open sky.
Inspired, awed expression, limitless possibilities.
[BACKGROUND] with vast landscape, beautiful sky.
Camera: wide framing, emphasizing expansive view.

Constraints: vast horizon visible, open sky, inspired expression.`,
          negative: 'confined, limited view, no horizon'
        },
        videoPrompt: `[0-0.8s] Character in confined, narrow space.
Limited view, feeling restricted.
Contemplative, searching expression.

[0.8-1.5s] Walls/barriers beginning to recede.
Space opening up around character.
Character stepping forward.

[1.5-2.0s] ★HORIZON REVEAL: Vast landscape appears★
★Camera pulling back to show endless horizon★
Character's expression shifting to awe.

[2.0-3.5s] Full panoramic view of vast horizon.
Endless sky, limitless landscape.
Character inspired, looking toward future.
Freedom and possibility.

Constraints: dramatic reveal of vast space, from confined to infinite.
Negative: no staying confined, no limited view at end.`
      }
    }
  },

  sky_expansion: {
    id: 'sky_expansion',
    name: '空の拡大',
    icon: '☁️',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      horizon_expand: {
        startFrame: {
          prompt: `Anime style, limited sky view.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character looking up at small patch of sky.
Sky visible through gap or window, limited view.
Longing expression, wanting more.
[BACKGROUND] with obstructed sky view.

Constraints: limited sky visible, obstructions, longing expression.`,
          negative: 'no full sky, no open view, no expansion'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, expansive composition.

Wide shot of character under vast open sky.
(Sky stretching endlessly in all directions:1.3), beautiful clouds.
Peaceful, fulfilled expression, looking up.
[BACKGROUND] dominated by beautiful expansive sky.

Constraints: vast sky filling frame, no obstructions, peaceful expression.`,
          negative: 'limited sky, obstructed view, confined'
        },
        videoPrompt: `[0-0.8s] Character looking up through limited gap.
Small patch of sky visible.
Longing expression, wanting more.

[0.8-1.5s] Obstructions beginning to fade away.
Sky view expanding.
Character's expression lifting.

[1.5-2.0s] ★SKY EXPANSION: Obstructions disappear★
★Vast sky revealed in all directions★
Beautiful clouds, endless blue.

[2.0-3.5s] Character standing under limitless sky.
Peaceful, fulfilled expression.
Sky stretching to all horizons.
Freedom, possibility, hope.

Constraints: dramatic expansion from limited to infinite sky.
Negative: no obstructions at end, no limited view.`
      }
    }
  },

  // ================================================================================
  // ===== G. ドキュメンタリー系エフェクト =====
  // ================================================================================

  unity_light: {
    id: 'unity_light',
    name: '団結の光',
    icon: '🌟',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      group_look_up: {
        startFrame: {
          prompt: `Anime style, dramatic shadowed lighting.
Cinematic composition, 16:9 aspect ratio.

Group shot of multiple characters looking down.
Shadowed faces, discouraged postures.
Dark, heavy atmosphere, sense of defeat.
[BACKGROUND] with dim, oppressive lighting.
Camera: group framing, capturing all characters.

Constraints: all characters looking down, shadowed, discouraged atmosphere.`,
          negative: 'no looking up, no light, no hope'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, hopeful composition.

Group shot of multiple characters looking up together.
(Warm light illuminating all faces:1.3), unity in expression.
Determined, hopeful expressions, faces lit.
[BACKGROUND] with warm, hopeful lighting from above.

Constraints: all characters looking up, faces lit, unified determination.`,
          negative: 'looking down, shadowed, discouraged'
        },
        videoPrompt: `[0-0.8s] Group of characters looking down, discouraged.
Shadowed faces, heavy atmosphere.
Sense of defeat, dark moment.

[0.8-1.2s] Small light beginning to appear above.
One character starting to look up.
Others beginning to notice.

[1.2-1.5s] ★UNITY MOMENT: All characters look up together★
★Warm light illuminating all faces★
Shared moment of determination.

[1.5-2.5s] All characters standing together, faces lit.
Unified expressions of hope and determination.
Light continuing to warm the scene.
"We're in this together" feeling.

Constraints: synchronized look-up, warm light on all faces, unity.
Negative: no one left looking down, no dark faces.`
      }
    }
  },

  forward_together: {
    id: 'forward_together',
    name: '共に前へ',
    icon: '👣',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      group_look_up: {
        startFrame: {
          prompt: `Anime style, scattered positioning.
Cinematic composition, 16:9 aspect ratio.

Group shot of multiple characters standing separately.
Not facing same direction, disconnected.
Individual expressions, not unified.
[BACKGROUND] showing group but not together.

Constraints: characters separate, not unified, facing different directions.`,
          negative: 'no unity, no same direction, not together'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, unified composition.

Group shot of all characters facing same direction.
(All looking toward shared future:1.3), unified posture.
Determined expressions, standing together.
[BACKGROUND] with path or direction visible ahead.

Constraints: all facing same direction, unified stance, determination.`,
          negative: 'scattered, different directions, disconnected'
        },
        videoPrompt: `[0-0.8s] Characters standing separately, facing different directions.
Disconnected, not unified.
Individual concerns on each face.

[0.8-1.3s] Characters beginning to turn.
Looking toward same point.
Starting to align.

[1.3-1.5s] ★UNITY MOMENT: All characters face same direction★
★Standing together, shoulders aligned★
Shared determination visible.

[1.5-2.5s] All characters looking toward shared future.
Unified stance, ready to move forward.
"Together we go" feeling.
Path or goal visible ahead.

Constraints: all facing same direction, unified posture, shared purpose.
Negative: no scattered positioning at end.`
      }
    }
  },

  color_restoration: {
    id: 'color_restoration',
    name: '色彩復活',
    icon: '🎨',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      sepia_to_color: {
        startFrame: {
          prompt: `Anime style, sepia/vintage tone.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character in sepia-toned scene.
Faded, nostalgic vintage coloring.
Wistful expression, memory of past.
[BACKGROUND] in sepia tones, vintage atmosphere.

Constraints: full sepia coloring, no vibrant colors, nostalgic feel.`,
          negative: 'no vibrant color, no present day, no full color'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, vibrant composition.

Medium shot of character in full vibrant color.
(Colors restored to full vibrancy:1.3), present moment.
Alive, present expression, memory becomes real.
[BACKGROUND] in full, beautiful color.

Constraints: full vibrant color, no sepia, present and alive.`,
          negative: 'sepia, faded, vintage, dull colors'
        },
        videoPrompt: `[0-1.0s] Scene in full sepia tone.
Character in past memory, faded colors.
Nostalgic, distant feeling.

[1.0-2.0s] Colors beginning to emerge from sepia.
Gradual restoration, like developing photo.
Life returning to the scene.

[2.0-2.5s] ★COLOR RESTORATION: Full color achieved★
★Vibrant colors throughout scene★
Memory becomes present moment.

[2.5-4.0s] Full vibrant color scene.
Character alive in the present.
Beautiful, vivid colors everywhere.
Past becomes present.

Constraints: gradual sepia to color transition, full vibrancy at end.
Negative: no returning to sepia, no staying faded.`
      }
    }
  },

  memory_bloom: {
    id: 'memory_bloom',
    name: '記憶の開花',
    icon: '🌸',
    thumbnail: '',
    inDevelopment: false,
    verified: false,
    prompts: {
      sepia_to_color: {
        startFrame: {
          prompt: `Anime style, faded memory aesthetic.
Cinematic composition, 16:9 aspect ratio.

Medium shot of character, faded and indistinct.
Blurry edges, unclear details, distant memory.
[BACKGROUND] foggy, dreamlike quality.

Constraints: faded, unclear, distant memory feeling.`,
          negative: 'no clarity, no sharp details, no vivid'
        },
        endFrame: {
          prompt: `masterpiece, best quality, anime style, vivid composition.

Medium shot of character in crystal clear detail.
(Memory blooming into vivid clarity:1.3), sharp and real.
Present, alive expression, memory fully restored.
[BACKGROUND] sharp and detailed.

Constraints: crystal clear, vivid details, memory fully restored.`,
          negative: 'faded, blurry, distant, unclear'
        },
        videoPrompt: `[0-1.0s] Faded, indistinct scene.
Character unclear, like distant memory.
Blurry edges, dreamlike quality.

[1.0-2.0s] Details beginning to sharpen.
Colors becoming more vivid.
Memory coming into focus.

[2.0-2.5s] ★MEMORY BLOOM: Full clarity achieved★
★Crystal clear details throughout★
Memory as vivid as present.

[2.5-4.0s] Sharp, clear scene.
Every detail visible.
Memory fully restored and alive.
Past becomes vivid present.

Constraints: gradual blur to sharp transition, full clarity at end.
Negative: no staying blurry, no fading back.`
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
  { id: 'night', name: '夜景', en: 'city night view, neon lights, urban glow' },
  { id: 'dark_enclosed', name: '暗い閉鎖空間', en: 'dark enclosed space, concrete walls, shadowy corridor, oppressive atmosphere' },
  { id: 'custom', name: 'カスタム', en: '' }
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
 * プロンプトを取得 V2（開始/終了背景分離、服装プレースホルダー対応）
 * @param {string} actionId - アクションID
 * @param {string} effectId - エフェクトID
 * @param {string} backgroundBefore - 開始背景文字列（[BACKGROUND_BEFORE]置換用）
 * @param {string} backgroundAfter - 終了背景文字列（[BACKGROUND_AFTER]置換用）
 * @returns {Object} { startFrame, startFrameNeg, endFrame, endFrameNeg, video }
 */
function pv_getEffectPromptsV2(actionId, effectId, backgroundBefore, backgroundAfter) {
  const effect = PV_EFFECTS[effectId];
  if (!effect || !effect.prompts[actionId]) {
    return null;
  }

  const prompts = effect.prompts[actionId];
  const bgBefore = backgroundBefore || PV_DEFAULT_BACKGROUND;
  const bgAfter = backgroundAfter || PV_DEFAULT_BACKGROUND;

  // 服装プレースホルダーをシートから取得
  let costumeBefore = '';
  let costumeAfter = '';
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    costumeBefore = pv_getCellValueByLabel(sheet, 'キャラクター1_過去編服装') || 'casual everyday clothes';
    costumeAfter = pv_getCellValueByLabel(sheet, 'キャラクター1_現在編服装') || 'professional work attire';
  } catch (e) {
    // シート取得に失敗した場合はデフォルト値を使用
    costumeBefore = 'casual everyday clothes';
    costumeAfter = 'professional work attire';
  }

  // プレースホルダー置換関数
  function replacePlaceholders(text) {
    return text
      .replace(/\[BACKGROUND_BEFORE\]/g, bgBefore)
      .replace(/\[BACKGROUND_AFTER\]/g, bgAfter)
      .replace(/\[BACKGROUND\]/g, bgAfter) // 旧形式互換
      .replace(/\[COSTUME_BEFORE\]/g, costumeBefore)
      .replace(/\[COSTUME_AFTER\]/g, costumeAfter);
  }

  return {
    startFrame: replacePlaceholders(prompts.startFrame.prompt),
    startFrameNeg: prompts.startFrame.negative,
    endFrame: replacePlaceholders(prompts.endFrame.prompt),
    endFrameNeg: prompts.endFrame.negative,
    video: replacePlaceholders(prompts.videoPrompt)
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
