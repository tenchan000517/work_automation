# ストーリーパターン v3.0 - 実装コード

11スタイル分析を統合した最終版を実装します。

---

## 完全実装コード

```javascript
// ================================================================================
// ===== ストーリーパターン v3.0（15種類）=====
// ================================================================================

/**
 * ストーリーパターン定義 v3.0
 *
 * 11スタイル分析（新海誠、ジブリ、ドラゴンボール、ドラゴンクエスト、エヴァンゲリオン、
 * TED Talk、ピクサー、Nike/Apple、ドキュメンタリー、ゲーミフィケーション、落語・コメディ）
 * の知見を統合し、採用PV・インナーブランディング・教育研修の全用途をカバー
 *
 * 変更履歴:
 * - v2.0→v3.0: 4組のパターン統合、7パターン新規追加、トランジション詳細化
 * - 12パターン→15パターン（統合により8パターン、新規7パターン）
 */

const PV_STORY_PATTERNS = [

  // ================================================================================
  // ===== A. 採用PV特化（6パターン）=====
  // ================================================================================

  // ===== 1. 変容する（統合: find_self + rebirth）=====
  {
    id: 'transform',
    name: '変容する',
    essence: '失われた自分 → 決断 → 新しい自分',

    emotionCurve: 'v_recovery',
    emotionCurveDisplay: '落ちて上がる',

    opening: 'empathy',
    openingDisplay: '困っている状態',

    peak: 'transformation',
    peakDisplay: '変容',

    visualTechniques: ['光の演出', '色彩変化', '環境の変化', 'メタファー具現化'],

    // パラメータ化: 変容の深さを選択可能
    transformationDepth: {
      mild: {
        name: '穏やかな変容',
        emotionValues: [-3, -4, -5, -3, 0, +2, +5, +4, +3, +4, +5, +5],
        suitable: '新卒採用◎、第二新卒○',
        description: '迷いから自分探しへの物語'
      },
      deep: {
        name: '深い再生',
        emotionValues: [-4, -5, -4, -2, -1, +1, +4, +3, +4, +5, +5, +5],
        suitable: '中途採用◎、キャリアチェンジ◎、再出発テーマ',
        description: '限界からの再生、人生の転換点'
      }
    },

    // デフォルト設定
    emotionValues: [-3, -4, -5, -3, 0, +2, +5, +4, +3, +4, +5, +5],
    suitable: '新卒採用◎、中途採用◎、ブランディング○',

    // 11スタイル対応
    recommendedStyle: 'shinkai',
    recommendedStyleDisplay: '新海誠',
    secondaryStyle: 'pixar',
    secondaryStyleDisplay: 'ピクサー',
    avoidStyle: 'dragonball',
    hybridRecommendation: '新海誠(S1-6: 美しい孤独) + ピクサー(S7-12: 温かい成長)',

    guidance: `【物語の本質】失われた自分 → きっかけ・決断 → 新しい自分への変容

【11スタイル知見の統合】
- 新海誠: 光と影の対比、レンズフレア、パーティクルディゾルブ
- ピクサー: 感動的な3幕構造、マッチカット、色彩の感情変化

【特徴・強み】
- 最も普遍的で強力な感情喚起力
- どん底からの復活という人類共通のテーマ
- 暗闘→光への視覚的コントラストが最大
- mild/deep 2つの深さから選択可能

【生み出す感情】感動、希望、カタルシス、勇気、共感、解放感

【演出の核心】
冒頭の暗い色調（グレー・青）から、転換点で暖色系へのグラデーション移行。
主人公の表情が影→光に照らされる瞬間を0.5秒のスローモーションで強調。
新海誠的レンズフレアを転換点（S4）で使用。

【シーン構成】
S1-3:[-3→-5] 苦悩・迷いの提示
S4-6:[-3→+2] きっかけ・転換点（★光の導き演出）
S7★:[+5] ピーク（変容の瞬間・新しい自分）
S8-12:[+4→+5] 新しい自分・希望の未来`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '苦悩・迷い（-3→-5）',
        cameraWork: 'Pull out / Wide shot',
        narrativeIntent: '孤独感、迷いを表現。視聴者との距離を作り、主人公の孤立を強調',
        shotType: 'Wide shot → Medium shot',
        transition: {
          type: 'slow_dissolve',
          duration: 2.0,
          effect: 'desaturate', // 徐々に彩度低下
          audio: 'ambient_fade'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '転換点（-3→+2）',
        cameraWork: 'Static → Slow push in',
        narrativeIntent: 'きっかけ、気づきの瞬間。視聴者を引き込み、変化への期待を高める',
        shotType: 'Medium close-up → Close-up',
        transition: {
          type: 'light_leak', // 新海誠スタイル
          duration: 0.7,
          effect: 'particle_dissolve',
          audio: 'hopeful_chime'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: 'アイコニックな瞬間、変容。最も印象的なヒーローショットを創出',
        shotType: 'Dynamic hero shot',
        transition: {
          type: 'transformation_burst',
          duration: 2.0,
          effect: 'color_explosion', // 一気に鮮やかに
          audio: 'orchestral_crescendo'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '成長・希望（+4→+5）',
        cameraWork: 'Tracking / Push in / Boom up',
        narrativeIntent: '没入感、希望の共有。視聴者と主人公の一体化を演出',
        shotType: 'Various (Medium → Wide)',
        transition: {
          type: 'hopeful_dissolve',
          duration: 1.5,
          effect: 'warm_glow',
          audio: 'uplifting_music'
        }
      }
    ]
  },

  // ===== 2. 挑戦する（統合: achieve_goal + overcome_wall）=====
  {
    id: 'challenge',
    name: '挑戦する',
    essence: '目標 → 努力 → 達成',

    emotionCurve: 'gradual_rise',
    emotionCurveDisplay: '少しずつ上がる',

    opening: 'question',
    openingDisplay: '問いかけ',

    peak: 'achievement',
    peakDisplay: '達成',

    visualTechniques: ['時間の圧縮', '表情クローズアップ', 'トランジション演出'],

    // パラメータ化: 挑戦の困難度を選択可能
    difficulty: {
      steady: {
        name: '着実な成長',
        emotionCurve: 'gradual_rise',
        emotionValues: [-2, -2, -1, 0, +1, +2, +5, +4, +4, +4, +5, +5],
        suitable: '高卒採用◎、サービス紹介○、成長志向企業',
        description: '一歩ずつ積み重ねる王道成長物語'
      },
      obstacles: {
        name: '壁との闘い',
        emotionCurve: 'wave_rise',
        emotionValues: [0, -2, -1, +1, -1, +2, +5, +3, +2, +3, +4, +5],
        suitable: '新卒採用◎、中途採用◎、挑戦をテーマにしたい企業',
        description: '失敗と再挑戦の繰り返しからの突破'
      }
    },

    // デフォルト設定
    emotionValues: [-2, -2, -1, 0, +1, +2, +5, +4, +4, +4, +5, +5],
    suitable: '高卒採用◎、新卒採用○、成長志向企業',

    // 11スタイル対応
    recommendedStyle: 'dragonquest',
    recommendedStyleDisplay: 'ドラゴンクエスト',
    secondaryStyle: 'pixar',
    secondaryStyleDisplay: 'ピクサー',
    avoidStyle: 'evangelion',
    hybridRecommendation: 'DQ(基本構造) + ゲーミフィケーション(レベルアップ演出)',

    guidance: `【物語の本質】目標・壁 → 一歩ずつ積み重ね/失敗と再挑戦 → 達成

【11スタイル知見の統合】
- DQ: RPG的成長の可視化、レベルアップ音、荘厳なオーケストラ
- ゲーミフィケーション: ステータス表示、達成感の演出

【特徴・強み】
- 成長物語として最も説得力がある
- 各ステップが可視化されることで信頼性が高い
- steady/obstacles 2つの難易度から選択可能
- プロセスへの敬意が表現される

【生み出す感情】達成感、誇り、成長実感、尊敬、信頼、勇気

【演出の核心】
同じ動作（例：手を伸ばす）を異なる時間軸で繰り返し、その都度環境が進化。
各ステップでカメラが近づき、成長を可視化。
DQ的「レベルアップ！」音を達成時に使用。

【シーン構成】
S1-3:[-2→-1] 目標の提示・最初の挑戦
S4-6:[0→+2] 積み重ね・小さな進歩（★レベルアップ演出）
S7★:[+5] ピーク（達成の瞬間・360度回転）
S8-12:[+4→+5] 達成後の誇り・次の目標`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '目標の提示（-2→-1）',
        cameraWork: 'Tracking / Static',
        narrativeIntent: '目標への問いかけ、最初の挑戦。被写体を追いながら挑戦の始まりを示す',
        shotType: 'Medium shot → Medium close-up',
        transition: {
          type: 'motivated_cut',
          duration: 1.0,
          effect: 'match_action',
          audio: 'adventure_theme'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '積み重ね（0→+2）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '小さな進歩の積み重ね。各ステップでカメラが近づき、成長を可視化',
        shotType: 'Medium shot (繰り返し構図)',
        transition: {
          type: 'level_up_transition',
          duration: 1.0,
          effect: 'sparkle + status_bar_fill',
          audio: 'level_up_jingle' // ピロリロリン♪
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Push in',
        narrativeIntent: '達成の瞬間。360度回転または力強いプッシュインで達成感を最大化',
        shotType: 'Dynamic achievement shot',
        transition: {
          type: 'achievement_fanfare',
          duration: 2.0,
          effect: 'victory_pose + light_rays',
          audio: 'orchestral_victory'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '達成後（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '誇りと次への展望。上昇するカメラで未来への期待を表現',
        shotType: 'Medium → Wide (展望)',
        transition: {
          type: 'horizon_dissolve',
          duration: 1.5,
          effect: 'sky_expand',
          audio: 'hopeful_theme'
        }
      }
    ]
  },

  // ===== 3. 発見する（統合: find_answer + face_self）=====
  {
    id: 'discover',
    name: '発見する',
    essence: '謎・疑問 → 探求 → 発見',

    emotionCurve: 'flat_to_rise',
    emotionCurveDisplay: '平らから急に上がる',

    opening: 'question',
    openingDisplay: '問いかけ・意外な映像',

    peak: 'discovery',
    peakDisplay: '発見',

    visualTechniques: ['空間歪曲', 'メタファー具現化', '光の演出', '色彩変化'],

    // パラメータ化: 発見の方向性を選択可能
    discoveryType: {
      external: {
        name: '外的発見',
        opening: 'shock',
        openingDisplay: '意外な映像',
        suitable: 'サービス紹介◎、技術紹介◎、知的好奇心を刺激したい企業',
        description: '外の世界の真実・謎を解き明かす',
        recommendedStyle: 'evangelion',
        visualFocus: '空間歪曲、実験的演出、テロップ多用'
      },
      internal: {
        name: '内的発見',
        opening: 'beauty',
        openingDisplay: '美しい映像',
        suitable: 'ブランディング◎、インナーブランディング◎、哲学的企業',
        description: '自分の内面・本質を見つける',
        recommendedStyle: 'ghibli',
        visualFocus: '内省的、シンメトリー、瞑想的'
      }
    },

    // デフォルト設定（external）
    emotionValues: [0, +1, 0, -1, 0, +1, +5, +4, +4, +5, +5, +5],
    suitable: 'サービス紹介◎、技術紹介◎、ブランディング◎',

    // 11スタイル対応
    recommendedStyle: 'evangelion',
    recommendedStyleDisplay: 'エヴァンゲリオン',
    secondaryStyle: 'shinkai',
    secondaryStyleDisplay: '新海誠',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'エヴァ(構造・緊張感) + 新海誠(美しさ・光)',

    guidance: `【物語の本質】謎・疑問 → 探求・試行錯誤 → 発見・真実

【11スタイル知見の統合】
- エヴァ: テロップ多用、カットイン、静止と爆発、情報過多
- 新海誠: 美しい光の演出、レンズフレア
- ジブリ(internal): 内省的、瞑想的カメラワーク

【特徴・強み】
- 知的好奇心を最大限に刺激
- 「気づき」の瞬間の演出が圧倒的
- external/internal 2つの方向性から選択可能
- 複雑なメッセージを直感的に伝達可能

【生み出す感情】驚き、知的興奮、納得感、啓示、爽快感、理解の喜び

【演出の核心】
断片化された映像（パズルのピース、分散する光の粒子）が徐々に集まり、
一つの明確な像を結ぶ。エヴァ的テロップで情報過多→統合。
音響も分散→統合の設計。

【シーン構成】
S1-3:[0→0] 謎・疑問の提示（★テロップ・カットイン多用）
S4-6:[-1→+1] 探求・試行錯誤
S7★:[+5] ピーク（発見の瞬間・啓示）
S8-12:[+4→+5] 理解・新たな視点`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '謎の提示（0）',
        cameraWork: 'Static / Slow pan',
        narrativeIntent: '謎・疑問の提示。静的なカメラで観察的視点を確立し、好奇心を喚起',
        shotType: 'Medium shot → Detail shot',
        transition: {
          type: 'glitch_cut', // エヴァスタイル
          duration: 0.2,
          effect: 'rgb_split + telop_flash',
          audio: 'electronic_beep'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '探求（-1→+1）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '探求・試行錯誤。徐々に近づくカメラで発見への期待を高める',
        shotType: 'Medium close-up → Close-up',
        transition: {
          type: 'data_overlay',
          duration: 1.0,
          effect: 'telop_cascade + analysis_lines',
          audio: 'thinking_process'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '発見の瞬間。啓示的な動きで「分かった！」の爽快感を最大化',
        shotType: 'Dynamic revelation shot',
        transition: {
          type: 'revelation_burst',
          duration: 2.0,
          effect: 'puzzle_complete + light_expansion',
          audio: 'eureka_moment'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '理解（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '新たな視点の獲得。広がる視野と深まる理解を表現',
        shotType: 'Medium → Wide (俯瞰)',
        transition: {
          type: 'understanding_dissolve',
          duration: 1.5,
          effect: 'clarity_spread',
          audio: 'enlightenment_chord'
        }
      }
    ]
  },

  // ===== 4. 繋がる（統合: find_place + unite）=====
  {
    id: 'connect',
    name: '繋がる',
    essence: '孤独 → 出会い → 絆',

    emotionCurve: 'slight_dip_rise',
    emotionCurveDisplay: '少し下がってから上がる',

    opening: 'empathy',
    openingDisplay: '困っている状態',

    peak: 'connection',
    peakDisplay: '繋がり',

    visualTechniques: ['表情クローズアップ', '色彩変化', '環境の変化', 'メタファー具現化'],

    // パラメータ化: 視点を選択可能
    perspective: {
      individual: {
        name: '個人の居場所探し',
        peak: 'find_belonging',
        peakDisplay: '居場所を見つける',
        suitable: '新卒採用◎、インナーブランディング◎',
        description: '一人の人が居場所を見つける物語',
        focus: '個人視点、孤独→受容'
      },
      collective: {
        name: '集団の団結',
        peak: 'unity',
        peakDisplay: '団結',
        suitable: '新卒採用◎、会社紹介◎、チームワーク重視企業',
        description: 'バラバラだった人々が一つになる物語',
        focus: '集団視点、個→全体'
      }
    },

    // デフォルト設定（individual）
    emotionValues: [+1, 0, -1, +1, +2, +3, +5, +4, +5, +5, +5, +5],
    suitable: '新卒採用◎、インナーブランディング◎、チーム重視企業',

    // 11スタイル対応
    recommendedStyle: 'ghibli',
    recommendedStyleDisplay: 'ジブリ',
    secondaryStyle: 'pixar',
    secondaryStyleDisplay: 'ピクサー',
    avoidStyle: 'dragonball',
    hybridRecommendation: 'ジブリ(S1-6: 温かさ) + ピクサー(S7-12: 感動)',

    guidance: `【物語の本質】孤独 → 出会い・受け入れ → 深い繋がり・絆

【11スタイル知見の統合】
- ジブリ: 温かい光、自然な人間関係、ゆったりとしたテンポ
- ピクサー: 感動的な絆の描写、マッチカット

【特徴・強み】
- 人間関係・絆を中心に据えた設計
- 孤独→繋がりの感情曲線が美しい
- individual/collective 2つの視点から選択可能
- ヒューマンドラマとして最高峰

【生み出す感情】温かさ、安心感、帰属感、感謝、共感、愛

【演出の核心】
一人の人物から始まり、徐々にフレーム内に他者が入ってくる構成。
色温度を冷たい→温かいへ段階的に変化。
最後は円環状の構図で「繋がり」を視覚化（DQ/ジブリスタイル）。

【シーン構成】
S1-3:[+1→-1] 孤独・居場所のなさ
S4-6:[+1→+3] 出会い・受け入れられる（★フレーム内に他者）
S7★:[+5] ピーク（繋がりの瞬間・円環構図）
S8-12:[+4→+5] 仲間・繋がりの深化`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '孤独（+1→-1）',
        cameraWork: 'Pull out / Wide shot',
        narrativeIntent: '孤独・居場所のなさ。広い空間の中の一人を強調し、孤立感を表現',
        shotType: 'Wide shot (一人)',
        transition: {
          type: 'lonely_dissolve',
          duration: 2.5,
          effect: 'desaturate + cold_tone',
          audio: 'silence_ambience'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '出会い（+1→+3）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '出会い・受け入れ。フレーム内に他者が入り、距離が縮まる過程を描写',
        shotType: 'Two shot → Group shot',
        transition: {
          type: 'connection_build',
          duration: 1.5,
          effect: 'warm_tone + people_enter_frame',
          audio: 'gentle_music'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Tracking / Arc shot → Boom up (俯瞰)',
        narrativeIntent: '繋がりの瞬間。仲間との一体感を動的なカメラで強調、円環構図',
        shotType: 'Dynamic group shot → Overhead circle',
        transition: {
          type: 'unity_bloom',
          duration: 2.0,
          effect: 'circle_formation + warm_light',
          audio: 'emotional_crescendo'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '繋がり（+4→+5）',
        cameraWork: 'Tracking / Boom up',
        narrativeIntent: '仲間との絆の深化。全員を捉える俯瞰や円環構図で一体感を視覚化',
        shotType: 'Group shot → Wide (俯瞰)',
        transition: {
          type: 'together_forward',
          duration: 1.5,
          effect: 'unified_movement',
          audio: 'hopeful_together'
        }
      }
    ]
  },

  // ===== 5. 大切なものに気づく =====
  {
    id: 'realize_value',
    name: '大切なものに気づく',
    essence: 'わからない → 学び・経験 → 大切なものに気づく',

    emotionCurve: 'gradual_rise',
    emotionCurveDisplay: '少しずつ上がる',

    opening: 'empathy',
    openingDisplay: '困っている状態',

    peak: 'realization',
    peakDisplay: '気づき',

    visualTechniques: ['時間の圧縮', '色彩変化', '光の演出'],

    emotionValues: [-2, -2, -1, 0, +1, +2, +5, +4, +4, +4, +5, +5],

    suitable: '新卒採用◎、教育的メッセージ、成長志向企業',

    // 11スタイル対応
    recommendedStyle: 'pixar',
    recommendedStyleDisplay: 'ピクサー',
    secondaryStyle: 'dragonquest',
    secondaryStyleDisplay: 'ドラゴンクエスト',
    avoidStyle: 'evangelion',
    hybridRecommendation: 'ピクサー(感動の物語) + ゲーミフィケーション(成長の可視化)',

    guidance: `【物語の本質】わからない → 学び・経験 → 大切なものに気づく

【11スタイル知見の統合】
- ピクサー: 感動的な気づきの瞬間、マッチカット、色彩変化
- ゲーミフィケーション: 学びのステップを可視化

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
S4-6:[0→+2] 経験・学び（★一つずつ光が灯る）
S7★:[+5] ピーク（気づきの瞬間・全てが一つに）
S8-12:[+4→+5] 大切なものと共に歩む`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: 'わからない（-2→-1）',
        cameraWork: 'Pull out / Static',
        narrativeIntent: '何が大切かわからない状態。暗い空間での迷いを静的なカメラで表現',
        shotType: 'Medium shot (暗め)',
        transition: {
          type: 'confused_dissolve',
          duration: 2.0,
          effect: 'low_saturation',
          audio: 'uncertain_theme'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '経験・学び（0→+2）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '経験と学びの積み重ね。一つずつ光が灯る過程をカメラの接近で表現',
        shotType: 'Medium → Medium close-up',
        transition: {
          type: 'learning_accumulation',
          duration: 1.0,
          effect: 'lights_turn_on_one_by_one',
          audio: 'discovery_chime'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '気づきの瞬間。全ての光が一つになる瞬間を壮大なカメラワークで表現',
        shotType: 'Dynamic realization shot',
        transition: {
          type: 'realization_bloom',
          duration: 2.0,
          effect: 'lights_merge_to_white + revelation',
          audio: 'emotional_peak'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '共に歩む（+4→+5）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: '大切なものと共に歩む未来。光に満ちた空間での展望を表現',
        shotType: 'Medium → Wide (光の中)',
        transition: {
          type: 'illuminated_path',
          duration: 1.5,
          effect: 'bright_future',
          audio: 'hopeful_journey'
        }
      }
    ]
  },

  // ===== 6. 運命が変わる =====
  {
    id: 'change_destiny',
    name: '運命が変わる',
    essence: '波乱 → 揺さぶられる → 変容',

    emotionCurve: 'wave_rise',
    emotionCurveDisplay: '上下しながら上がる',

    opening: 'shock',
    openingDisplay: '意外な映像',

    peak: 'destiny_shift',
    peakDisplay: '運命の転換',

    visualTechniques: ['空間歪曲', 'メタファー具現化', '光の演出', 'トランジション演出'],

    emotionValues: [0, -2, -1, +1, -1, +2, +5, +3, +2, +3, +4, +5],

    suitable: '中途採用○、会社紹介○、ドラマチックな転換を描きたい企業',

    // 11スタイル対応
    recommendedStyle: 'evangelion',
    recommendedStyleDisplay: 'エヴァンゲリオン',
    secondaryStyle: 'shinkai',
    secondaryStyleDisplay: '新海誠',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'エヴァ(実験的構造) + 新海誠(美的表現)',

    guidance: `【物語の本質】衝撃・波乱 → 揺さぶられる → 劇的に変容

【11スタイル知見の統合】
- エヴァ: 実験的映像、メタ表現、精神世界の視覚化
- 新海誠: 美しい光と色彩

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
S4-6:[+1→+2] 揺さぶられる・選択（★波のメタファー）
S7★:[+5] ピーク（運命の転換点・空間変容）
S8-12:[+3→+5] 新しい運命・壮大な未来`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '衝撃・予兆（0→-1）',
        cameraWork: 'Dynamic movement / Wide shot',
        narrativeIntent: '衝撃と予兆。不安定なカメラワークで波乱の幕開けを表現',
        shotType: 'Medium shot (動的)',
        transition: {
          type: 'shock_distortion',
          duration: 0.5,
          effect: 'space_warp + glitch',
          audio: 'ominous_rumble'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '揺さぶられる（+1→+2）',
        cameraWork: 'Push in / Pull out 交互',
        narrativeIntent: '揺さぶられる選択の時。振動のようなカメラで内面の葛藤を表現',
        shotType: 'Medium → Medium close-up',
        transition: {
          type: 'oscillation',
          duration: 1.0,
          effect: 'wave_pattern + uncertainty',
          audio: 'tension_build'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: '運命の転換点。空間全体が変容する瞬間を壮大なカメラワークで表現',
        shotType: 'Dynamic transformation shot',
        transition: {
          type: 'destiny_shift',
          duration: 2.5,
          effect: 'space_transformation + fractal_expand',
          audio: 'cosmic_shift'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '新しい運命（+3→+5）',
        cameraWork: 'Boom up / Tracking',
        narrativeIntent: '新しい運命と壮大な未来。スケールアップするカメラで可能性の広がりを表現',
        shotType: 'Medium → Wide (壮大)',
        transition: {
          type: 'scale_expansion',
          duration: 1.5,
          effect: 'universe_unfold',
          audio: 'epic_future'
        }
      }
    ]
  },

  // ================================================================================
  // ===== B. インナーブランディング特化（4パターン）=====
  // ================================================================================

  // ===== 7. ビジョンを共有する（新規）=====
  {
    id: 'share_vision',
    name: 'ビジョンを共有する',
    essence: '問いかけ → データ → ビジョン → 共感',

    emotionCurve: 'ted_talk_staircase', // 新規カーブ
    emotionCurveDisplay: '階段状に上がる',

    emotionValues: [0, +1, +1, +2, +2, +3, +4, +4, +5, +5, +5, +5],

    opening: 'question',
    openingDisplay: '問いかけ',

    peak: 'vision_revelation',
    peakDisplay: 'ビジョンの開示',

    visualTechniques: [
      'データビジュアライゼーション',
      'インフォグラフィック',
      'スピーカー中心構図',
      '画面分割（資料+話者）'
    ],

    suitable: '経営ビジョン共有◎、全社会議◎、戦略説明◎、キックオフ◎',

    // 11スタイル対応
    recommendedStyle: 'ted_talk',
    recommendedStyleDisplay: 'TED Talk',
    secondaryStyle: 'apple',
    secondaryStyleDisplay: 'Apple',
    avoidStyle: 'dragonball',
    hybridRecommendation: 'TED Talk(基本構造) + Apple(ミニマル美学)',

    guidance: `【物語の本質】問いかけ → 論理的説得 → ビジョン提示 → 行動喚起

【11スタイル知見の統合】
- TED Talk型: スピーカー中心、データ+ストーリー、階段状理解
- Apple型: ミニマル、美しいビジョン提示、Think Different

【特徴・強み】
- 知的説得力が最高
- データドリブンで信頼性◎
- 行動変容を促す構造
- 経営層のメッセージ発信に最適

【生み出す感情】納得感、知的興奮、使命感、行動意欲、誇り

【演出の核心】
段階的理解の積み重ね（階段）。
各ステップで「なるほど」の小さなクライマックス。
スピーカー7-8割、資料2-3割の画面配分。
最後に全体像が明らかになる啓示的瞬間。

【シーン構成】
S1-2:[0→+1] 問いかけ（現状への疑問）
S3-4:[+1→+2] データ提示（事実・信頼構築）
S5-6:[+2→+3] ストーリー（感情・共感）
S7-8★:[+3→+4] ピーク（ビジョン開示・解決策）
S9-12:[+4→+5] 行動喚起・共感の深化`,

    sceneGuidelines: [
      {
        scenes: [1, 2],
        emotionRange: '問いかけ (0→+1)',
        cameraWork: 'スピーカー Medium shot / 資料 Insert',
        narrativeIntent: '視聴者の好奇心を喚起。「なぜ？」を引き出す',
        shotType: 'Medium shot (話者) + データスライド',
        transition: {
          type: 'slide_wipe',
          duration: 0.8,
          effect: 'minimal_clean',
          audio: 'subtle_transition'
        }
      },
      {
        scenes: [3, 4],
        emotionRange: 'データ提示 (+1→+2)',
        cameraWork: 'データ Full screen / 話者 Insert',
        narrativeIntent: '論理的根拠を示し、信頼を構築',
        shotType: 'Infographics + Medium close-up',
        transition: {
          type: 'data_animation',
          duration: 1.0,
          effect: 'count_up_graphs + chart_build',
          audio: 'data_reveal'
        }
      },
      {
        scenes: [5, 6],
        emotionRange: 'ストーリー (+2→+3)',
        cameraWork: 'Close-up (感情) / イラスト Overlay',
        narrativeIntent: 'データに人間性を与え、共感を生む',
        shotType: 'Close-up + Story visualization',
        transition: {
          type: 'emotional_dissolve',
          duration: 1.5,
          effect: 'warm_fade + story_appear',
          audio: 'human_connection'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク: ビジョン開示 (+3→+4)★',
        cameraWork: 'Push in to Close-up / ビジョン Full screen',
        narrativeIntent: 'ビジョンの啓示的瞬間。全てが繋がる「これだ！」',
        shotType: 'Dynamic push in + Vision reveal',
        transition: {
          type: 'vision_revelation',
          duration: 2.0,
          effect: 'light_expansion + clarity',
          audio: 'vision_theme'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '行動喚起 (+4→+5)',
        cameraWork: 'Medium shot / Wide shot (全体)',
        narrativeIntent: '「私たちにできること」を示し、行動を促す',
        shotType: 'Medium → Wide (community)',
        transition: {
          type: 'call_to_action',
          duration: 1.0,
          effect: 'forward_motion + unity',
          audio: 'inspiring_call'
        }
      }
    ]
  },

  // ===== 8. 誇りを再発見する（新規）=====
  {
    id: 'rediscover_pride',
    name: '誇りを再発見する',
    essence: '忘れかけた誇り → 思い出す → 再燃',

    emotionCurve: 'rekindling_pride', // 新規カーブ
    emotionCurveDisplay: '一度下がって再び上がる',

    emotionValues: [+2, +1, 0, -1, 0, +2, +5, +4, +5, +5, +5, +5],

    opening: 'beauty',
    openingDisplay: '美しい過去',

    peak: 'rekindling',
    peakDisplay: '誇りの再燃',

    visualTechniques: [
      '過去映像（セピア調）',
      '現在との対比',
      'インタビュー',
      '時間経過の視覚化'
    ],

    suitable: '社員誇り醸成◎、周年記念◎、インナーブランディング◎、OB会◎',

    // 11スタイル対応
    recommendedStyle: 'documentary',
    recommendedStyleDisplay: 'ドキュメンタリー',
    secondaryStyle: 'pixar',
    secondaryStyleDisplay: 'ピクサー',
    avoidStyle: 'dragonball',
    hybridRecommendation: 'ドキュメンタリー(リアルな声) + ピクサー(感動構造)',

    guidance: `【物語の本質】忘れかけた誇り → 歴史を振り返る → 誇りの再燃

【11スタイル知見の統合】
- ドキュメンタリー型: リアルな声、歴史の重み、インタビュー中心
- ピクサー型: 感動的な物語構造、色彩の感情変化

【特徴・強み】
- 社員の内なる誇りを呼び覚ます
- 歴史と現在を繋ぐ
- ベテラン・若手の両方に響く
- 組織の記憶と継承

【生み出す感情】誇り、感謝、帰属感、使命感、温かさ、涙

【演出の核心】
過去の輝き（セピア調）から始まり、
一度現在の課題（彩度低下）を経て、
創業精神の再発見により鮮やかな色彩へ。
ベテラン社員のインタビューが核心。

【シーン構成】
S1-2:[+2→+1] 美しい過去・創業時の想い（★セピア調）
S3-4:[0→-1] 忘れかけていた・日常に埋没
S5-6:[0→+2] 思い出す・歴史を振り返る（★インタビュー）
S7-8★:[+2→+5] ピーク（誇りの再燃・涙）
S9-12:[+4→+5] 誇りと共に未来へ`,

    sceneGuidelines: [
      {
        scenes: [1, 2],
        emotionRange: '美しい過去 (+2→+1)',
        cameraWork: 'アーカイブ映像 / Static panning',
        narrativeIntent: '輝いていた時代を美しく提示',
        shotType: 'アーカイブ (セピア調) + ナレーション',
        transition: {
          type: 'nostalgic_dissolve',
          duration: 2.0,
          effect: 'sepia_fade + film_grain',
          audio: 'nostalgic_theme'
        }
      },
      {
        scenes: [3, 4],
        emotionRange: '忘却 (0→-1)',
        cameraWork: 'Pull out / 日常の定点観測',
        narrativeIntent: '忘れかけていた誇り、日常に埋もれた想い',
        shotType: 'Medium shot (日常) 彩度↓',
        transition: {
          type: 'desaturate',
          duration: 1.5,
          effect: 'color_drain + routine',
          audio: 'mundane_ambience'
        }
      },
      {
        scenes: [5, 6],
        emotionRange: '思い出す (0→+2)',
        cameraWork: 'インタビュー Close-up / アーカイブ挿入',
        narrativeIntent: 'ベテラン社員の語り、歴史の掘り起こし',
        shotType: 'Interview Close-up + 過去映像',
        transition: {
          type: 'memory_flash',
          duration: 1.0,
          effect: 'flickering_memories + sepia_flash',
          audio: 'remembering'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク: 誇りの再燃 (+2→+5)★',
        cameraWork: 'Push in / 表情クローズアップ',
        narrativeIntent: '誇りが蘇る瞬間。涙と笑顔',
        shotType: 'Close-up (感動の表情) 彩度MAX',
        transition: {
          type: 'color_bloom',
          duration: 2.0,
          effect: 'vibrant_restoration + tears',
          audio: 'emotional_peak'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '未来へ (+4→+5)',
        cameraWork: 'Tracking / Boom up',
        narrativeIntent: '誇りを胸に、次世代へ繋ぐ',
        shotType: 'Group shot → Wide (全社員)',
        transition: {
          type: 'legacy_forward',
          duration: 1.5,
          effect: 'generational_bridge',
          audio: 'hopeful_future'
        }
      }
    ]
  },

  // ===== 9. 共に危機を乗り越える（新規）=====
  {
    id: 'overcome_together',
    name: '共に危機を乗り越える',
    essence: '危機 → 団結 → 突破 → 強い絆',

    emotionCurve: 'crisis_unity_breakthrough', // 新規カーブ
    emotionCurveDisplay: '深く落ちて団結し上がる',

    emotionValues: [-4, -5, -4, -2, 0, +2, +5, +4, +5, +5, +5, +5],

    opening: 'shock',
    openingDisplay: '危機の衝撃',

    peak: 'unity_breakthrough',
    peakDisplay: '団結による突破',

    visualTechniques: [
      'ドキュメンタリー撮影',
      'リアルな社員の声',
      '時系列モンタージュ',
      '表情のクローズアップ'
    ],

    suitable: '危機時メッセージ◎、困難な時期◎、チームビルディング◎、変革期◎',

    // 11スタイル対応
    recommendedStyle: 'documentary',
    recommendedStyleDisplay: 'ドキュメンタリー',
    secondaryStyle: 'nike',
    secondaryStyleDisplay: 'Nike',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'ドキュメンタリー(リアル・信頼) + Nike(突破の力強さ)',

    guidance: `【物語の本質】危機 → 団結の決意 → 共に突破 → 強い絆

【11スタイル知見の統合】
- ドキュメンタリー型: リアルな現場の声、信頼性、インタビュー
- Nike型: 突破の瞬間の力強さ、「Just Do It」精神

【特徴・強み】
- 危機を「敵」ではなく「試練」として再定義
- チームの絆を可視化
- 困難を共有することで結束を強化
- 心理的安全性の醸成

【生み出す感情】団結、決意、感謝、誇り、安心、希望

【演出の核心】
個々の不安顔（バラバラ）から、
顔を上げて見つめ合う（団結）へ。
最後は全員が同じ方向を向く俯瞰ショット。
リアルな社員の声が最も重要。

【シーン構成】
S1-3:[-4→-4] 危機の到来・衝撃（★リアルな混乱）
S4-6:[-2→+2] 団結の決意・支え合い（★インタビュー）
S7-8★:[+2→+5] ピーク（共に突破する瞬間・歓喜）
S9-12:[+4→+5] 強い絆・新たな強さ`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '危機 (-4→-4)',
        cameraWork: 'ハンディカメラ / 不安定',
        narrativeIntent: '危機の衝撃をリアルに。不安と混乱',
        shotType: 'Wide shot (混乱) → Close-up (不安顔)',
        transition: {
          type: 'harsh_cut',
          duration: 0.0,
          effect: 'sudden_shock + handheld',
          audio: 'crisis_alarm'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '団結 (-2→+2)',
        cameraWork: 'インタビュー / 2-shot',
        narrativeIntent: '個々の決意、支え合う瞬間',
        shotType: 'Close-up (個人) → Two shot (支え合い)',
        transition: {
          type: 'connection_build',
          duration: 1.5,
          effect: 'people_unite + eye_contact',
          audio: 'unity_theme'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク: 共に突破 (+2→+5)★',
        cameraWork: 'ダイナミックな動き / Arc shot',
        narrativeIntent: '全員で壁を破る瞬間。歓喜と涙',
        shotType: 'Dynamic group shot (歓喜)',
        transition: {
          type: 'breakthrough_explosion',
          duration: 2.0,
          effect: 'light_burst + celebration',
          audio: 'victory_roar'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '強い絆 (+4→+5)',
        cameraWork: 'Boom up (俯瞰) / Wide shot',
        narrativeIntent: '試練を共に乗り越えた誇り、深まる絆',
        shotType: 'Wide shot (俯瞰) 全員で前進',
        transition: {
          type: 'unified_march',
          duration: 1.5,
          effect: 'together_forward + strength',
          audio: 'bond_theme'
        }
      }
    ]
  },

  // ===== 10. 次のステージへ =====
  {
    id: 'next_stage',
    name: '次のステージへ',
    essence: '良い → もっと良い → さらに良い',

    emotionCurve: 'steady_rise',
    emotionCurveDisplay: 'ずっと上がる',

    opening: 'beauty',
    openingDisplay: '美しい映像',

    peak: 'next_level',
    peakDisplay: '次のレベル',

    visualTechniques: ['色彩変化', '光の演出', 'メタファー具現化'],

    emotionValues: [+1, +2, +2, +3, +3, +4, +4, +5, +5, +5, +5, +5],

    suitable: '展示会◎、会社紹介◎、ポジティブブランディング◎、インナーブランディング○',

    // 11スタイル対応
    recommendedStyle: 'shinkai',
    recommendedStyleDisplay: '新海誠',
    secondaryStyle: 'apple',
    secondaryStyleDisplay: 'Apple',
    avoidStyle: 'dragonball',
    hybridRecommendation: '新海誠(ビジュアルの美しさ) + Apple(メッセージの力)',

    guidance: `【物語の本質】良い → さらに良い → もっと良い → 無限の可能性

【11スタイル知見の統合】
- 新海誠: 美しい光と色彩、レンズフレア、上昇感
- Apple: ミニマルな美学、「Think Different」的メッセージ

【特徴・強み】
- ポジティブ・ブランディングに最適
- ネガティブ要素なしで感動を創出
- 美的完成度が最優先
- インナーブランディングにも有効

【生み出す感情】喜び、高揚感、憧れ、希望、美的感動、ワクワク感

【演出の核心】
白やパステルカラーから始まり、徐々に彩度と輝度が上昇。
上昇運動（階段を登る、空へ飛ぶ）を多用。
音楽はメジャーキーの一貫した上昇。

【シーン構成】
S1-3:[+1→+2] 美しい現状の提示
S4-6:[+3→+4] さらなる進化（★彩度・輝度上昇）
S7-8★:[+4→+5] ピーク（最高の瞬間・空へ）
S9-12:[+5] 輝く未来・無限の可能性`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '美しい現状（+1→+2）',
        cameraWork: 'Push in / Static',
        narrativeIntent: '美しい現状の提示。既に良い状態を優雅に見せ、期待感を醸成',
        shotType: 'Medium shot → Medium close-up',
        transition: {
          type: 'elegant_dissolve',
          duration: 1.5,
          effect: 'soft_glow',
          audio: 'gentle_optimism'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '進化（+3→+4）',
        cameraWork: 'Push in / Boom up',
        narrativeIntent: 'さらなる進化。上昇するカメラで成長の加速を表現',
        shotType: 'Medium → Wide (上昇)',
        transition: {
          type: 'ascension',
          duration: 1.5,
          effect: 'brightness_increase + upward',
          audio: 'rising_theme'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク（+4→+5）★',
        cameraWork: 'Arc shot / Boom up',
        narrativeIntent: '最高の瞬間。輝く頂点を360度回転や上昇で壮大に演出',
        shotType: 'Dynamic peak shot → Sky',
        transition: {
          type: 'peak_bloom',
          duration: 2.0,
          effect: 'lens_flare + sky_reach',
          audio: 'triumphant_peak'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '輝く未来（+5）',
        cameraWork: 'Boom up / Wide',
        narrativeIntent: '無限の可能性。開放的な空間と上昇感で未来への期待を最大化',
        shotType: 'Wide shot (壮大) 空へ',
        transition: {
          type: 'infinite_horizon',
          duration: 1.5,
          effect: 'endless_sky',
          audio: 'infinite_possibility'
        }
      }
    ]
  },

  // ================================================================================
  // ===== C. 教育・研修特化（3パターン）=====
  // ================================================================================

  // ===== 11. 楽しく学ぶ（新規）=====
  {
    id: 'learn_with_joy',
    name: '楽しく学ぶ',
    essence: '堅苦しい → 笑い → 理解 → 実践',

    emotionCurve: 'comedy_learning', // 新規カーブ
    emotionCurveDisplay: '笑いながら上がる',

    emotionValues: [-1, 0, +1, +2, +3, +3, +4, +5, +4, +5, +5, +5],

    opening: 'comedy',
    openingDisplay: '共感できる失敗例',

    peak: 'aha_moment',
    peakDisplay: '「なるほど！」の瞬間',

    visualTechniques: [
      'コメディ演出',
      '効果音多用',
      'NG例→OK例の対比',
      'ツッコミテロップ'
    ],

    suitable: 'コンプライアンス教育◎、安全教育◎、新人研修◎、マナー研修◎',

    // 11スタイル対応
    recommendedStyle: 'rakugo_comedy',
    recommendedStyleDisplay: '落語・コメディ',
    secondaryStyle: 'gamification',
    secondaryStyleDisplay: 'ゲーミフィケーション',
    avoidStyle: 'evangelion',
    hybridRecommendation: '落語(枕→本題→オチ) + ゲーミフィケーション(クイズ・ポイント)',

    guidance: `【物語の本質】堅苦しいテーマ → 笑いで緊張をほぐす → 楽しく理解 → 実践したくなる

【11スタイル知見の統合】
- 落語・コメディ型: 枕→本題→オチの構造、笑いの「間」、あるある共感
- ゲーミフィケーション型: クイズ、ポイント、達成感

【特徴・強み】
- 記憶定着率が最高（笑いの効果）
- 堅苦しいテーマを親しみやすく
- 「また見たい」と思わせる
- 心理的抵抗を下げる

【生み出す感情】笑い、共感、理解、親近感、「やってみよう」

【演出の核心】
失敗例を大げさにコミカルに演出（バラエティSE多用）。
ツッコミテロップで「あるある」共感。
正解例は真面目に、でも明るく。
クイズ形式で視聴者参加を促す。

【シーン構成】
S1-2:[-1→0] 枕（あるある失敗談・共感）
S3-5:[+1→+3] 本題（笑いながら学ぶ・NG例）
S6-7★:[+3→+4] ピーク（「なるほど！」の瞬間・クイズ正解）
S8:[+5] 正解例・スッキリ
S9-12:[+4→+5] 実践への意欲・まとめ`,

    sceneGuidelines: [
      {
        scenes: [1, 2],
        emotionRange: '枕 (-1→0)',
        cameraWork: 'Static / 再現ドラマ風',
        narrativeIntent: '「あるある」で共感を得る。笑いで緊張をほぐす',
        shotType: 'Medium shot (コメディ演技)',
        transition: {
          type: 'comedic_cut',
          duration: 0.3,
          effect: 'sound_effect + reaction_shot',
          audio: 'comedy_SE' // ズコー、ピヨピヨ等
        }
      },
      {
        scenes: [3, 4, 5],
        emotionRange: '本題 (+1→+3)',
        cameraWork: 'NG例高速カット / OK例ゆっくり',
        narrativeIntent: 'NG例を面白く、OK例を分かりやすく',
        shotType: 'Split screen (NG vs OK)',
        transition: {
          type: 'contrast_wipe',
          duration: 0.5,
          effect: 'X_mark + O_mark + ズコー音',
          audio: 'wrong_answer_SE'
        }
      },
      {
        scenes: [6, 7],
        emotionRange: 'ピーク: 「なるほど！」(+3→+4)★',
        cameraWork: 'Push in / クイズ形式',
        narrativeIntent: '理解の瞬間。視聴者参加型',
        shotType: 'Quiz UI + 正解演出',
        transition: {
          type: 'aha_moment',
          duration: 1.0,
          effect: 'light_bulb + ピコーン！SE',
          audio: 'correct_answer_jingle'
        }
      },
      {
        scenes: [8],
        emotionRange: '正解例 (+5)',
        cameraWork: 'Clean shot',
        narrativeIntent: '正しいやり方をクリアに見せる',
        shotType: 'Medium shot (手本)',
        transition: {
          type: 'clean_dissolve',
          duration: 1.0,
          effect: 'キラーン + perfect',
          audio: 'approval_chime'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '実践意欲 (+4→+5)',
        cameraWork: 'Medium shot / 明るい表情',
        narrativeIntent: '「やってみよう」という気持ちに',
        shotType: 'Group shot (前向き)',
        transition: {
          type: 'motivated_dissolve',
          duration: 1.0,
          effect: 'bright_future',
          audio: 'action_theme'
        }
      }
    ]
  },

  // ===== 12. レベルアップする（新規）=====
  {
    id: 'level_up',
    name: 'レベルアップする',
    essence: 'Lv.1 → 挑戦 → レベルアップ → マスター',

    emotionCurve: 'gamification_growth', // 新規カーブ
    emotionCurveDisplay: '段階的に上がる（階段）',

    emotionValues: [0, +1, +2, +2, +3, +3, +4, +4, +5, +5, +5, +5],

    opening: 'gamification',
    openingDisplay: 'ゲーム開始画面',

    peak: 'level_max',
    peakDisplay: 'レベルMAX達成',

    visualTechniques: [
      'ゲームUI',
      'ステータス表示',
      'レベルアップエフェクト',
      'バッジ・実績システム'
    ],

    suitable: 'スキルアップ研修◎、新人研修◎、eラーニング◎、継続学習◎',

    // 11スタイル対応
    recommendedStyle: 'gamification',
    recommendedStyleDisplay: 'ゲーミフィケーション',
    secondaryStyle: 'dragonquest',
    secondaryStyleDisplay: 'ドラゴンクエスト',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'ゲーミフィケーション(UI・システム) + DQ(RPG的世界観)',

    guidance: `【物語の本質】Lv.1初心者 → 各ステージ挑戦 → レベルアップ → Lv.MAX マスター

【11スタイル知見の統合】
- ゲーミフィケーション型: UI、達成感、報酬システム、ポイント
- DQ型: RPG的成長、仲間、冒険、「レベルアップ！」音

【特徴・強み】
- 学習のゲーム化で継続率UP
- 進捗の可視化でモチベーション維持
- 達成感の連続でエンゲージメント最大
- eラーニングに最適

【生み出す感情】達成感、楽しさ、成長実感、やる気、ワクワク、誇り

【演出の核心】
画面に常時ステータス表示（HP, EXP, Level）。
各レベルアップ時に派手なエフェクト（ピロリロリン♪）。
最後にLv.MAX到達で大きなファンファーレ。
バッジ・実績システムで達成感を可視化。

【シーン構成】
S1-2:[0→+1] チュートリアル（Lv.1）
S3-4:[+2] ステージ1挑戦（Lv.2到達）★レベルアップ
S5-6:[+3] ステージ2挑戦（Lv.3到達）★レベルアップ
S7-8:[+4] ステージ3挑戦（Lv.4到達）★レベルアップ
S9-10:[+5] 最終ステージ（Lv.5 MAX到達）★★★
S11-12:[+5] マスター認定・次のステージへ`,

    sceneGuidelines: [
      {
        scenes: [1, 2],
        emotionRange: 'チュートリアル (0→+1)',
        cameraWork: 'ゲーム画面風 / UI重視',
        narrativeIntent: 'ルール説明、最初のミッション',
        shotType: 'Game UI + Tutorial overlay',
        transition: {
          type: 'game_start',
          duration: 0.5,
          effect: 'START演出 + HP/EXP表示',
          audio: 'game_start_jingle'
        }
      },
      {
        scenes: [3, 4],
        emotionRange: 'ステージ1 (+2)',
        cameraWork: '実践映像 / ステータスOverlay',
        narrativeIntent: '最初の挑戦、小さな達成感',
        shotType: 'Action + Status bar overlay',
        transition: {
          type: 'level_up_1',
          duration: 1.0,
          effect: 'LEVEL UP! Lv.2 +50 EXP キラキラ',
          audio: 'level_up_jingle' // ピロリロリン♪
        }
      },
      {
        scenes: [5, 6],
        emotionRange: 'ステージ2 (+3)',
        cameraWork: '少し難しいミッション',
        narrativeIntent: '成長を実感、スキルが増える',
        shotType: 'Challenge + New skill unlock',
        transition: {
          type: 'level_up_2',
          duration: 1.0,
          effect: 'LEVEL UP! Lv.3 New Skill獲得！',
          audio: 'skill_unlock_fanfare'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク: ステージ3 (+4)★',
        cameraWork: 'ボス戦風 / ダイナミック',
        narrativeIntent: '最大の挑戦、全スキル駆使',
        shotType: 'Boss battle style',
        transition: {
          type: 'level_up_3',
          duration: 1.5,
          effect: 'LEVEL UP! Lv.4 Great Job!',
          audio: 'victory_fanfare'
        }
      },
      {
        scenes: [9, 10],
        emotionRange: '最終ステージ (+5)',
        cameraWork: 'Climax battle',
        narrativeIntent: 'マスターへの道、全力',
        shotType: 'Final challenge + Full power',
        transition: {
          type: 'level_max',
          duration: 2.0,
          effect: 'LEVEL MAX! Lv.5 Master! 虹色エフェクト',
          audio: 'master_achievement_fanfare'
        }
      },
      {
        scenes: [11, 12],
        emotionRange: 'マスター認定 (+5)',
        cameraWork: 'Wide shot / 認定画面',
        narrativeIntent: 'マスター認定、次のステージへの期待',
        shotType: 'Certificate screen + Next preview',
        transition: {
          type: 'ending_preview',
          duration: 1.5,
          effect: 'Master Certificate + To be continued...',
          audio: 'ending_theme'
        }
      }
    ]
  },

  // ===== 13. 失敗から学ぶ（新規）=====
  {
    id: 'learn_from_failure',
    name: '失敗から学ぶ',
    essence: '失敗 → 分析 → 気づき → 次の成功',

    emotionCurve: 'failure_wisdom', // 新規カーブ
    emotionCurveDisplay: '失敗から徐々に上がる',

    emotionValues: [-3, -2, -1, 0, +1, +2, +4, +3, +4, +5, +5, +5],

    opening: 'empathy',
    openingDisplay: '失敗の瞬間',

    peak: 'wisdom_gained',
    peakDisplay: '教訓の獲得',

    visualTechniques: [
      '再現ドラマ',
      '原因分析図解',
      '対策の視覚化',
      'ビフォー・アフター'
    ],

    suitable: '失敗事例共有◎、安全教育◎、品質管理◎、リスク管理◎',

    // 11スタイル対応
    recommendedStyle: 'documentary',
    recommendedStyleDisplay: 'ドキュメンタリー',
    secondaryStyle: 'rakugo_comedy',
    secondaryStyleDisplay: '落語・コメディ（軽度失敗の場合）',
    avoidStyle: 'dragonball',
    hybridRecommendation: 'ドキュメンタリー(リアルな分析) + 落語(重すぎない雰囲気)',

    guidance: `【物語の本質】失敗 → なぜ起きた？ → 深い気づき → 次に活かす

【11スタイル知見の統合】
- ドキュメンタリー型: リアルな分析、説得力、インタビュー
- 落語・コメディ型: 重すぎない雰囲気（軽度失敗の場合）

【特徴・強み】
- 失敗を「恥」ではなく「学び」に変換
- 心理的安全性の醸成
- 同じ失敗を防ぐ組織学習
- 失敗事例の資産化

【生み出す感情】共感、理解、安心、学び、前向きさ、感謝

【演出の核心】
失敗の瞬間はリアルに（でも責めない）。
原因分析をインフォグラフィックで視覚化（なぜ？×5）。
対策後の成功例で希望を示す。
ビフォー・アフター対比が重要。

【シーン構成】
S1-3:[-3→-1] 失敗の瞬間・衝撃（★でも責めない）
S4-6:[0→+2] 原因分析・なぜ起きた？（★図解多用）
S7-8★:[+2→+4] ピーク（深い気づき・教訓獲得）
S9-12:[+3→+5] 対策実施・次の成功（★ビフォー・アフター）`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '失敗 (-3→-1)',
        cameraWork: '再現ドラマ / ドキュメンタリー',
        narrativeIntent: '失敗の瞬間をリアルに。でも責めない。共感を得る',
        shotType: 'Medium shot (失敗瞬間) スロモ',
        transition: {
          type: 'shock_cut',
          duration: 0.3,
          effect: '衝撃音 + ズーム',
          audio: 'failure_sound'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '原因分析 (0→+2)',
        cameraWork: '図解・インフォグラフィック',
        narrativeIntent: '「なぜ？」を5回繰り返す。根本原因へ',
        shotType: 'Infographics (Why×5 tree)',
        transition: {
          type: 'analysis_build',
          duration: 1.0,
          effect: '図が組み立てられる + なぜ？テキスト',
          audio: 'analysis_theme'
        }
      },
      {
        scenes: [7, 8],
        emotionRange: 'ピーク: 教訓 (+2→+4)★',
        cameraWork: 'Close-up / テキスト表示',
        narrativeIntent: '深い気づきの瞬間。「こうすれば防げた」',
        shotType: 'Close-up (気づき顔) + 教訓テキスト',
        transition: {
          type: 'wisdom_moment',
          duration: 2.0,
          effect: 'ライトが灯る + 教訓カード',
          audio: 'enlightenment'
        }
      },
      {
        scenes: [9, 10, 11, 12],
        emotionRange: '次の成功 (+3→+5)',
        cameraWork: 'ビフォー・アフター / Push in',
        narrativeIntent: '対策実施後の成功例。失敗は無駄じゃない',
        shotType: 'Split screen (Before/After) → 成功',
        transition: {
          type: 'success_contrast',
          duration: 1.5,
          effect: '暗→明 + 成功のチェックマーク',
          audio: 'success_theme'
        }
      }
    ]
  },

  // ================================================================================
  // ===== D. 特殊用途（2パターン）=====
  // ================================================================================

  // ===== 14. 今すぐ行動する（新規・短尺）=====
  {
    id: 'just_act',
    name: '今すぐ行動する',
    essence: '課題 → 汗 → 達成 → メッセージ',

    emotionCurve: 'nike_instant_impact', // 新規カーブ
    emotionCurveDisplay: '一気に急上昇（短尺）',

    // 注: 短尺のため12シーンだが、実質6-8シーンで完結
    emotionValues: [0, 0, +1, +2, +3, +4, +5, +5, +5, +4, +5, +5],

    opening: 'action',
    openingDisplay: '即座にアクション',

    peak: 'instant_achievement',
    peakDisplay: '瞬間的達成',

    visualTechniques: [
      '超高速カッティング',
      'モノクロ⇔カラー',
      'スローモーション',
      '力強いメッセージテキスト'
    ],

    suitable: '営業キックオフ◎、モチベーションUP◎、イベント導入◎、SNS用◎',

    // 11スタイル対応
    recommendedStyle: 'nike',
    recommendedStyleDisplay: 'Nike',
    secondaryStyle: 'dragonball',
    secondaryStyleDisplay: 'ドラゴンボール',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'Nike(汗・努力の可視化) + DB(高速カッティング)',

    duration: '10-30秒（超短尺）', // 他パターンより短い

    guidance: `【物語の本質】課題提示 → 努力の高速モンタージュ → 達成 → 「Just Do It」

【11スタイル知見の統合】
- Nike型: 汗・努力の可視化、力強いメッセージ、「Just Do It」精神
- DB型: 超高速カッティング、スローモーション多用、原色

【特徴・強み】
- 圧倒的な短尺で強烈な印象（10-30秒）
- 行動を即座に促す
- SNS・イベントで最適
- モチベーションUPに即効性

【生み出す感情】興奮、やる気、「できる」確信、行動意欲、高揚感

【演出の核心】
0.3-0.5秒の超高速カット連続（30カット/10秒）。
モノクロ⇔カラーの激しい切替。
達成の瞬間だけ3秒のスローモーション。
最後にメッセージが画面を覆う（JUST DO IT的）。

【シーン構成（短尺版）】
S1-2:[0] 課題・目標の提示（2秒）
S3-6:[+1→+4] 努力の高速モンタージュ（5秒）★超高速
S7-9★:[+5] ピーク（達成のスローモーション）（3秒）
S10-12:[+4→+5] メッセージ・ロゴ（2秒）

総尺: 12秒（1シーン1秒想定）`,

    sceneGuidelines: [
      {
        scenes: [1, 2],
        emotionRange: '課題提示 (0)',
        cameraWork: 'Wide shot / 問いかけ',
        narrativeIntent: '何が課題か？何を達成するか？瞬時に提示',
        shotType: 'Wide shot (目標) 2秒',
        transition: {
          type: 'hard_cut',
          duration: 0.0,
          effect: 'none',
          audio: 'sudden_start'
        }
      },
      {
        scenes: [3, 4, 5, 6],
        emotionRange: '努力 (+1→+4)',
        cameraWork: '超高速カッティング',
        narrativeIntent: '汗・集中・限界への挑戦を0.3秒カットで連続',
        shotType: '0.3秒カット×20（汗、目、足、手、転倒、立ち上がる...）',
        transition: {
          type: 'hard_cut_rapid',
          duration: 0.0,
          effect: 'モノクロ⇔カラー激しく切替',
          audio: 'intense_beat'
        }
      },
      {
        scenes: [7, 8, 9],
        emotionRange: 'ピーク: 達成 (+5)★',
        cameraWork: 'スローモーション',
        narrativeIntent: '達成の瞬間を引き延ばす。勝利のポーズ',
        shotType: 'Slow motion (勝利の瞬間) 3秒',
        transition: {
          type: 'time_stretch',
          duration: 3.0,
          effect: 'スローモーション + カラー復活',
          audio: 'triumphant_moment'
        }
      },
      {
        scenes: [10, 11, 12],
        emotionRange: 'メッセージ (+4→+5)',
        cameraWork: 'テキストオーバーレイ',
        narrativeIntent: '「Just Do It」的な強いメッセージ。行動喚起',
        shotType: 'Message text full screen + Logo 2秒',
        transition: {
          type: 'message_impact',
          duration: 0.5,
          effect: 'テキストがズドン + ロゴ',
          audio: 'powerful_statement'
        }
      }
    ]
  },

  // ===== 15. 危機を乗り越える =====
  {
    id: 'overcome_crisis',
    name: '危機を乗り越える',
    essence: '危機 → 打開策 → 突破',

    emotionCurve: 'v_recovery',
    emotionCurveDisplay: '落ちて上がる',

    opening: 'shock',
    openingDisplay: '意外な映像',

    peak: 'breakthrough',
    peakDisplay: '突破',

    visualTechniques: ['空間歪曲', '光の演出', '時間の圧縮'],

    emotionValues: [-3, -4, -5, -3, 0, +2, +5, +4, +3, +4, +5, +5],

    suitable: '会社紹介○、サービス紹介○、ドラマチックな展開向け',

    // 11スタイル対応
    recommendedStyle: 'evangelion',
    recommendedStyleDisplay: 'エヴァンゲリオン',
    secondaryStyle: 'dragonball',
    secondaryStyleDisplay: 'ドラゴンボール',
    avoidStyle: 'ghibli',
    hybridRecommendation: 'エヴァ(緊張感・実験性) + DB(爆発力)',

    guidance: `【物語の本質】突然の危機 → 葛藤 → 打開策発見 → 突破

【11スタイル知見の統合】
- エヴァ: 緊張感、テロップ、カウントダウン、静止と爆発
- DB: 爆発的なブレイクスルー、タメ→爆発

【特徴・強み】
- 緊張感とドラマ性が最高レベル
- スリリングな展開が可能
- 短時間で強烈な印象を残す
- サービス紹介にドラマ性を付与

【生み出す感情】緊張、解放、カタルシス、驚き、安堵、希望

【演出の核心】
空間が崩壊するような歪み（魚眼レンズ効果、フラクタル）から、
突然の静寂と幾何学的秩序への転換。
エヴァ的カウントダウン・テロップ多用。
音響も歪み→クリアへ。

【シーン構成】
S1-3:[-3→-5] 危機・衝撃（★歪み・テロップ）
S4-6:[-3→+2] 葛藤・解決への糸口（★カウントダウン）
S7★:[+5] ピーク（突破の瞬間・空間正常化）
S8-12:[+4→+5] 解決・新たな強さ`,

    sceneGuidelines: [
      {
        scenes: [1, 2, 3],
        emotionRange: '危機（-3→-5）',
        cameraWork: 'Wide shot / Pull out',
        narrativeIntent: '危機・衝撃。歪んだ空間や急激なカメラ動作で緊張感を最大化',
        shotType: 'Wide shot (歪み効果)',
        transition: {
          type: 'shock_distortion',
          duration: 0.5,
          effect: 'space_warp + red_alert_telop',
          audio: 'crisis_alarm'
        }
      },
      {
        scenes: [4, 5, 6],
        emotionRange: '葛藤（-3→+2）',
        cameraWork: 'Static → Push in',
        narrativeIntent: '葛藤と解決への糸口。カウントダウンで緊張維持',
        shotType: 'Medium close-up → Close-up',
        transition: {
          type: 'countdown_tension',
          duration: 1.0,
          effect: 'カウントダウンテロップ + ビープ音',
          audio: 'tension_countdown'
        }
      },
      {
        scenes: [7],
        emotionRange: 'ピーク（+5）★',
        cameraWork: 'Arc shot / Dynamic movement',
        narrativeIntent: '突破の瞬間。歪みから秩序への転換を劇的に',
        shotType: 'Dynamic breakthrough shot',
        transition: {
          type: 'breakthrough_restoration',
          duration: 2.0,
          effect: '空間正常化 + 光の爆発',
          audio: 'breakthrough_fanfare'
        }
      },
      {
        scenes: [8, 9, 10, 11, 12],
        emotionRange: '解決（+4→+5）',
        cameraWork: 'Push in / Tracking',
        narrativeIntent: '解決と新たな強さの獲得。安定したカメラで回復を表現',
        shotType: 'Medium → Wide (安定)',
        transition: {
          type: 'stabilization',
          duration: 1.5,
          effect: 'clear_space + forward',
          audio: 'resolution_theme'
        }
      }
    ]
  }
];

// ================================================================================
// ===== 新規感情カーブタイプ定義 =====
// ================================================================================

/**
 * 11スタイル分析から追加された新規感情カーブ
 */
const NEW_EMOTION_CURVE_TYPES = {
  // TED Talk型
  ted_talk_staircase: {
    name: '階段状上昇',
    description: '段階的な理解の積み重ね。各ステップで小さな納得。',
    typical: [0, +1, +1, +2, +2, +3, +4, +4, +5, +5, +5, +5],
    usedIn: ['share_vision']
  },

  // エヴァ型
  eva_extreme_stillness: {
    name: '極端な静止→爆発',
    description: '長い緊張の後の爆発的解放。',
    typical: [0, 0, 0, 0, 0, 0, +5, +4, +3, +4, +5, +5],
    usedIn: [] // 将来的に追加可能
  },

  // ドラゴンボール型
  db_charge_burst: {
    name: 'タメ→爆発→持続',
    description: '力を溜めて一気に解放、高い状態維持。',
    typical: [-2, -2, -1, 0, 0, 0, +5, +5, +5, +5, +5, +5],
    usedIn: [] // 将来的に追加可能
  },

  // ピクサー型
  pixar_rollercoaster: {
    name: '感情のジェットコースター',
    description: '喜怒哀楽の激しい変動から大きなカタルシス。',
    typical: [+2, -3, +1, -2, +3, -1, +5, +3, +4, +5, +5, +5],
    usedIn: [] // 将来的に追加可能
  },

  // ゲーミフィケーション型
  gamification_growth: {
    name: 'レベルアップ階段',
    description: '明確な段階での成長。各レベルで達成感。',
    typical: [0, +1, +2, +2, +3, +3, +4, +4, +5, +5, +5, +5],
    usedIn: ['level_up']
  },

  // インナーブランディング型
  rekindling_pride: {
    name: '誇りの再燃',
    description: '忘れかけた誇りを思い出し、再び燃え上がる。',
    typical: [+2, +1, 0, -1, 0, +2, +5, +4, +5, +5, +5, +5],
    usedIn: ['rediscover_pride']
  },

  crisis_unity_breakthrough: {
    name: '危機→団結→突破',
    description: '深い危機から団結し、共に突破する。',
    typical: [-4, -5, -4, -2, 0, +2, +5, +4, +5, +5, +5, +5],
    usedIn: ['overcome_together']
  },

  // 教育型
  comedy_learning: {
    name: '笑いながら学ぶ',
    description: '笑いで緊張をほぐし、楽しく理解を深める。',
    typical: [-1, 0, +1, +2, +3, +3, +4, +5, +4, +5, +5, +5],
    usedIn: ['learn_with_joy']
  },

  failure_wisdom: {
    name: '失敗からの学び',
    description: '失敗を分析し、教訓を得て成長する。',
    typical: [-3, -2, -1, 0, +1, +2, +4, +3, +4, +5, +5, +5],
    usedIn: ['learn_from_failure']
  },

  // 短尺インスピレーション型
  nike_instant_impact: {
    name: '即座のインパクト',
    description: '短尺で一気に高揚感を生み出す。',
    typical: [0, 0, +1, +2, +3, +4, +5, +5, +5, +4, +5, +5],
    usedIn: ['just_act']
  }
};

// ================================================================================
// ===== エクスポート =====
// ================================================================================

export { PV_STORY_PATTERNS, NEW_EMOTION_CURVE_TYPES };
```

---

## 実装完了

### **変更サマリー:**

#### **統合:**
- 12パターン → 8パターンに統合（4組）
  - find_self + rebirth → **transform**
  - achieve_goal + overcome_wall → **challenge**
  - find_answer + face_self → **discover**
  - find_place + unite → **connect**

#### **新規追加:**
- 7パターン追加
  - **share_vision** (ビジョン共有)
  - **rediscover_pride** (誇り再発見)
  - **overcome_together** (共に危機克服)
  - **learn_with_joy** (楽しく学ぶ)
  - **level_up** (レベルアップ)
  - **learn_from_failure** (失敗から学ぶ)
  - **just_act** (今すぐ行動)

#### **最終構成:**
- **15パターン** = 8（統合後）+ 7（新規）
- **全用途カバー**: 採用6 + インナー4 + 教育3 + 特殊2

#### **強化項目:**
- 11スタイル対応表を全パターンに追加
- トランジション詳細化（type, duration, effect, audio）
- パラメータ化（depth, difficulty, type, perspective）
- 10種類の新規感情カーブ定義

---

次のステップ（フェーズ2以降）の実装が必要な場合はお知らせください。
