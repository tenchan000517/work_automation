# KLING v3 / VIDU Q3 対応プロンプト集

演出を確実に意図通り実現するためのプロンプト集。

---

## 重要な発見事項

リサーチから判明した重要ポイント:

1. **KLING v3の強み**: マルチショット対応、カメラワーク制御、ネイティブオーディオ
2. **VIDU Q3の強み**: 16秒連続生成、Smart Cuts機能、物理準拠の動き
3. **共通の鍵**:
   - "Shot Type → Subject Action → Camera Movement → Constraints → Negatives" の5層構造
   - 時間指定は「0-2s」形式より「during first 2 seconds」形式が確実
   - 余計な動きを防ぐには **ネガティブプロンプトとConstraints** が必須

---

## A. そのまま使える6シーン

---

### A-1. 扉開放 (Door Opening)

**KLING v3 推奨プロンプト:**
```
Over-the-shoulder shot in dark enclosed space.
Character searches in darkness, finds door outline with faint light seeping through edges.

[0-1.3s] Camera locked, character back visible, breathing gently, head scanning slowly.
No other movement.

[1.3-1.9s] Character steps closer to door, hand reaches forward.
Camera follows with subtle forward dolly.

[1.9-2.7s] Hand pushes door, door swings open slowly.
Bright light floods inward explosively from door gap.
Wind rushes in, hair and clothing flutter strongly.

[2.7-3.7s] Door fully open, character silhouetted against bright light.
Wind continues blowing steadily, natural physics-based motion.
Camera holds position.

[3.7-5s] Character steps through doorway into bright new world.
Camera slow pan up to reveal expansive beautiful sky.
Slow motion on final step.

Constraints: character movement only during specified times, background stays dark, door opens in single smooth motion.
Negative: no multiple characters, no objects flying, no door slamming, no unnatural speed changes.
```

**VIDU Q3 推奨プロンプト:**
```
Cinematic sequence: dark room to bright world transition.

Wide shot: character in shadowed space, back to camera, searching for exit. Faint light outline of door ahead. Camera static. Duration: 0-1.3 seconds.

Smart Cut: Medium shot, character approaches door, hand extends. Camera gentle dolly forward. Duration: 1.3-1.9 seconds.

Smart Cut: Close-up on hand pushing door. Door swings open, light bursts through gap. Wind SFX rushes in. Hair and coat flutter with wind physics. Duration: 1.9-2.7 seconds.

Smart Cut: Full silhouette shot, door fully open, character backlit. Wind continues steady. Camera locked. Duration: 2.7-3.7 seconds.

Smart Cut: Character steps forward into light, slow motion. Camera tilts up to sky. Beautiful ambient music fades in. Duration: 3.7-5 seconds.

Visual style: cinematic, high contrast lighting, photorealistic.
Constraints: single character only, door motion smooth and singular, no additional objects.
Negative: no door bouncing, no multiple light sources, no sudden cuts.
```

---

### A-2. 光の粒子上昇 (Light Particle Ascension)

**KLING v3 推奨プロンプト (エフェクト単体):**
```
Fixed camera, centered composition, black background.
Golden light particles resting at bottom of frame, faintly pulsing.

[0-1s] Particles dormant at bottom, gentle breathing glow.
Camera completely locked, no movement.

[1-1.5s] Particles ignite suddenly, begin rising upward in single explosive burst.
No camera movement.

[1.5-3s] Particles rise at varying speeds creating depth perception.
Some particles fast, some slow, natural physics-based ascension.
Camera remains fixed.

[3-5s] Particles reach top of frame, begin floating gently, gradually fade out.
Slow motion applied to floating phase.
Camera locked throughout.

Constraints: particles only, no characters, no background objects, black void background maintained.
Negative: no camera shake, no additional effects, no particles falling, no ground surface visible.
```

**VIDU Q3 推奨プロンプト:**
```
Single static shot: light particle effect on pure black background.

Golden light particles rest at bottom edge, minimal pulsing glow. Camera fixed, center framing. Duration: 0-1 seconds.

Particles suddenly ignite and begin ascending in various trajectories. Physics-based varying speeds. Camera stays locked. Duration: 1-1.5 seconds.

Particles continue rising, some fast, some slow, creating depth. Natural motion, no wind effect. Camera static. Duration: 1.5-3 seconds.

Particles reach upper frame, float gently, gradually fade to transparency. Slow motion effect. Camera maintains position. Duration: 3-5 seconds.

Visual style: particle effect, volumetric lighting, deep blacks.
Audio: soft whoosh sound as particles rise, gentle ambient tone.
Constraints: effect only, no environment, no surfaces.
Negative: no downward motion, no swirling, no additional light sources.
```

---

### A-3. グリッチ (Glitch Effect)

**KLING v3 推奨プロンプト:**
```
Fixed camera, full frame digital glitch effect overlay.
Clean starting state with subtle scan lines.

[0-1s] Minimal visual noise, thin horizontal scan lines drifting slowly.
Slight unease feeling, stable image underneath.
Camera locked.

[1-1.5s] Explosive glitch burst: RGB color separation, blocky pixel distortion.
Image shakes violently in place (not camera shake, image distortion).
Peak glitch intensity.

[1.5-3s] Glitch waves pulse rhythmically, coming and receding.
RGB shifts, block artifacts appear and disappear in waves.
Accelerating then decelerating cycle.

[3-5s] Glitch effect gradually stabilizes, scan lines fade.
Image returns to clean state slowly.
Camera remains fixed throughout.

Constraints: screen effect only, no physical objects glitching, uniform application across frame.
Negative: no camera movement, no 3D objects, no characters, no actual scene behind effect.
```

**VIDU Q3 推奨プロンプト:**
```
Digital glitch overlay effect, single continuous shot.

Stable image with subtle scan lines drifting vertically. Faint static. Camera locked. Duration: 0-1 seconds.

Sudden intense glitch explosion: RGB color channel separation, blocky pixel artifacts. Image shakes in place. Peak distortion. SFX: harsh digital noise burst. Duration: 1-1.5 seconds.

Rhythmic glitch waves pulsing across frame. Block artifacts and RGB shifts in synchronized waves. Accelerate then decelerate. Duration: 1.5-3 seconds.

Glitch gradually fades, scan lines disappear, image stabilizes to clean state. Camera stays fixed. Duration: 3-5 seconds.

Visual style: digital artifact, screen distortion, high contrast.
Audio: electronic glitch sounds, harsh then soft.
Constraints: effect layer only, no actual scene content.
Negative: no camera motion, no physical space, no depth.
```

---

### A-4. エネルギー波動 (Energy Wave)

**KLING v3 推奨プロンプト:**
```
Fixed camera, centered composition, dark void background.
Energy core at center of frame, dormant glowing sphere.

[0-1s] Core pulses faintly at center, slow breathing rhythm.
Minimal movement, anticipation building.
Camera locked.

[1-1.5s] Core ignites suddenly, explosive energy wave radiates outward.
Single shockwave ring expands from center in all directions.
Peak burst moment.

[1.5-3s] Continuous energy waves pulse outward rhythmically.
Aurora-like ribbon trails follow wave motion.
Natural physics-based expansion speed.
Camera remains fixed.

[3-5s] Wave pulsing stabilizes into steady breathing rhythm.
Gentle regular pulses, calming energy state.
Camera locked throughout.

Constraints: energy effect only, spherical expansion from single center point, no environmental objects.
Negative: no camera movement, no multiple energy sources, no irregular motion, no background elements.
```

**VIDU Q3 推奨プロンプト:**
```
Energy wave effect, single static shot, dark background.

Central glowing energy core pulses gently. Slow rhythmic breathing light. Camera centered and locked. Duration: 0-1 seconds.

Core suddenly ignites, explosive energy wave radiates outward spherically. Single shockwave expands. SFX: powerful energy burst sound. Duration: 1-1.5 seconds.

Continuous rhythmic energy waves pulse from center. Aurora ribbon trails follow wave edges. Natural expansion physics. Camera static. Duration: 1.5-3 seconds.

Wave motion stabilizes into slow steady pulse rhythm. Breathing-like regular waves. Calm energy state. Camera locked. Duration: 3-5 seconds.

Visual style: energy effect, volumetric lighting, aurora colors.
Audio: deep bass pulse, harmonic resonance.
Constraints: centered effect, no solid objects.
Negative: no camera shake, no environment, no chaos.
```

---

### A-5. 色彩浸食 (Color Invasion)

**KLING v3 推奨プロンプト:**
```
Medium shot of character in monochrome world.
Character stands neutral, expressionless, entire scene grayscale.

[0-1s] Complete monochrome scene, character motionless.
Subtle breathing only, no other movement.
Camera locked medium shot.

[1-1.5s] Character reaches hand forward, touches invisible surface.
At contact point, vivid color suddenly appears.
Camera slowly zooms toward contact point.

[1.5-3.5s] Color spreads from contact point like veins or cracks.
Vivid hues flow across character's hand, up arm, across torso.
Color propagation follows natural vein-like pattern.
Camera slowly pulls back to medium shot.

[3.5-5s] Color reaches character's face last, expression changes from neutral to joy.
Entire character now fully colorized, vibrant saturated colors.
Camera settles at medium shot, slow motion on final color spread.

Constraints: character only, monochrome-to-color transition only, color spreads continuously without gaps.
Negative: no other characters, no environmental color change, no jumping color, no reverse flow.
```

**VIDU Q3 推奨プロンプト:**
```
Color transformation sequence: monochrome to vibrant color.

Wide shot: character standing in grayscale world, neutral expression. Complete monochrome. Subtle breathing. Camera medium shot locked. Duration: 0-1 seconds.

Smart Cut: Character hand reaches forward, touches surface. At contact point, vivid color spark appears. Camera zooms slowly toward hand. Duration: 1-1.5 seconds.

Color spreads from contact point like organic veins. Vivid hues flow across hand, up arm, across body. Vein-like pattern propagation. Camera gentle zoom out. Duration: 1.5-3.5 seconds.

Smart Cut: Color reaches face last, expression transitions to smile. Full body now vibrant color. Camera medium shot, slow motion. Joyful ambient music. Duration: 3.5-5 seconds.

Visual style: cinematic, high saturation final color, smooth gradient transitions.
Audio: soft magical sound as color spreads, uplifting music at end.
Constraints: single character, progressive color invasion, no color jumps.
Negative: no background color change, no multiple sources, no flashing.
```

---

### A-6. 地平線の光 (Horizon Light)

**KLING v3 推奨プロンプト:**
```
Wide angle shot from behind character silhouette.
Character standing at edge, looking toward distant horizon line.
Sun at horizon edge, pre-dawn or sunset lighting.

[0-1.5s] Character silhouette still, facing horizon.
Gentle wind moves hair softly, breathing visible.
Camera wide angle behind character, locked position.

[1.5-2.5s] Sun light begins expanding along horizon line.
Light intensity increases gradually, natural sunrise/sunset speed.
Camera remains locked.

[2.5-4s] Clouds catch light, sky transforms with color gradient.
Light particles begin rising from ground near character's feet.
Natural atmospheric physics, camera fixed.

[4-6s] Character takes single step forward into light.
Light particles swirl gently around stepping foot.
Camera follows character gently, maintains silhouette framing.
Slow motion on step motion.

Constraints: single character, natural lighting progression, ground-based particle motion only.
Negative: no rapid lighting changes, no artificial light sources, no multiple characters, no dramatic effects.
```

**VIDU Q3 推奨プロンプト:**
```
Cinematic horizon sequence: character witnessing dawn/dusk.

Wide angle behind character silhouette, horizon line visible. Gentle wind in hair. Character still, deep breath. Camera locked. Duration: 0-1.5 seconds.

Light spreads along horizon, sun rising/setting. Natural speed light expansion. Sky begins color shift. Camera static. Soft ambient wind SFX. Duration: 1.5-2.5 seconds.

Clouds illuminate with gradient colors. Light particles rise from ground at character's feet. Atmospheric physics-based motion. Camera locked. Duration: 2.5-4 seconds.

Character takes single step forward. Light particles swirl around foot. Camera gently follows, maintains silhouette. Slow motion. Uplifting music swells. Duration: 4-6 seconds.

Visual style: cinematic silhouette, golden hour lighting, photorealistic.
Audio: gentle wind, uplifting orchestral music builds.
Constraints: natural lighting only, single smooth step.
Negative: no artificial effects, no rapid transitions, no multiple steps.
```

---

## B. 基本パターン4シーン

---

### B-1. 目開き (Eye Opening)

**KLING v3 推奨プロンプト:**
```
Extreme close-up of closed eye, eyelashes visible.
Soft rim lighting creating subtle shadow on eyelid.

[0-1s] Eye completely closed, eyelid and lashes in sharp focus.
Subtle shadow play from eyelashes.
Camera locked extreme close-up, no movement.

[1-3s] Eyelid slowly opens upward, revealing eye gradually.
Pupil expands as light enters, natural eye-opening physics.
Camera maintains position or subtle slow push-in toward pupil.
Slow motion applied.

[3-4s] Eye fully open, pupil reflects light source.
Reflection of sky/scenery visible in eye surface.
Camera locked, focus on iris detail.

Constraints: eye only in frame, smooth continuous opening motion, reflection visible in pupil.
Negative: no blinking, no rapid motion, no other facial features moving, no eye darting.
```

**VIDU Q3 推奨プロンプト:**
```
Eye opening extreme close-up sequence.

Closed eye macro shot, eyelashes sharp, subtle shadows. Camera locked, no movement. Soft breathing sound only. Duration: 0-1 seconds.

Eyelid slowly opens revealing eye. Pupil expands naturally as light enters. Camera subtle push-in or locked. Slow motion. Duration: 1-3 seconds.

Eye fully open, light reflects in pupil showing sky/environment. Focus on iris texture detail. Camera static. Calm ambient sound. Duration: 3-4 seconds.

Visual style: macro photography, soft lighting, photorealistic eye detail.
Audio: gentle atmospheric sound, soft breath.
Constraints: eye fills frame, single smooth opening.
Negative: no blinking, no eyelid flutter, no sudden moves, no face visible.
```

---

### B-2. 振り向き (Turn Around)

**KLING v3 推奨プロンプト:**
```
Medium shot of character's back, facing away from camera.
Backlit lighting creating rim light on character's edge.

[0-1s] Character back to camera, completely still.
Subtle anticipation, slight head tilt as if hearing something.
Camera locked medium shot.

[1-2.5s] Character turns head and body toward camera.
Hair flows naturally with turning motion, backlight creates lens flare.
Smooth rotational movement accelerating then peak speed.
Camera remains locked.

[2.5-4s] Character face fully visible, looking directly at camera.
Hair settles, lens flare glows gently.
Camera locked, slow motion on final face reveal.

Constraints: single character, smooth 180-degree turn, hair motion follows physics, backlight maintained.
Negative: no camera rotation, no jumping motion, no multiple turns, no additional characters.
```

**VIDU Q3 推奨プロンプト:**
```
Character turn-around reveal sequence.

Medium shot: character back to camera, backlit rim lighting. Completely still with anticipation. Slight head tilt. Camera locked. Duration: 0-1 seconds.

Character turns smoothly toward camera. Hair flows with motion, backlight creates lens flare. Natural rotation speed accelerating to peak. Camera static. Duration: 1-2.5 seconds.

Face fully revealed, looking at camera. Hair settles naturally, soft lens flare. Camera locked, slow motion. Ambient music builds. Duration: 2.5-4 seconds.

Visual style: cinematic portrait, rim lighting, lens flare effect, photorealistic.
Audio: subtle wind, emotional music crescendo.
Constraints: smooth 180° rotation, hair physics-based.
Negative: no camera spin, no choppy motion, no additional people.
```

---

### B-3. 手を伸ばす (Reaching Hand)

**KLING v3 推奨プロンプト:**
```
Low angle shot, character face and raised hand visible.
Strong light source above (god rays), dramatic contrast.

[0-1s] Character face in frame, determined expression.
Hand at chest level, preparing to reach upward.
Camera low angle locked.

[1-3s] Hand extends upward toward light source.
Arm straightens, fingers spread open reaching toward light.
Character face transitions from determined to hopeful.
Camera subtle tilt up following hand motion or locked.

[3-4s] Hand reaches into bright light, silhouette forms.
Fingers fully extended catching light beams.
Camera locked on silhouette composition.

Constraints: single character, smooth arm extension, hand silhouette against light, face visible initially.
Negative: no camera zoom, no multiple hands, no light grabbing, no jumping motion.
```

**VIDU Q3 推奨プロンプト:**
```
Reaching toward light sequence, low angle shot.

Character face in low angle frame, determined expression. Hand at chest. Strong backlight creating god rays. Camera locked. Duration: 0-1 seconds.

Hand extends smoothly upward toward light. Arm straightens, fingers spread. Expression shifts hopeful. Camera subtle tilt up or static. Duration: 1-3 seconds.

Hand enters bright light zone, forms silhouette. Fingers fully extended in light beams. Camera locked on composition. Soft inspirational music. Duration: 3-4 seconds.

Visual style: dramatic lighting, silhouette, god rays, cinematic.
Audio: gentle atmospheric build, uplifting music at peak.
Constraints: single smooth reach motion, hand silhouette clear.
Negative: no zoom, no hand shaking, no light manipulation.
```

---

### B-4. 空を見上げる (Looking Up at Sky)

**KLING v3 推奨プロンプト:**
```
Close-up of character face, initially downcast looking down.
Shadowed lighting on face, somber mood.

[0-1s] Character face down, eyes closed or looking at ground.
Shadowed expression, still and quiet.
Camera close-up locked.

[1-2.5s] Character slowly raises face upward.
Eyes open gradually as face tilts up.
Camera tilts up synchronously with face movement.
Accelerating tilt motion.

[2.5-4s] Face fully raised, eyes open looking at sky.
Light illuminates face from above, expression peaceful.
Sky visible in upper frame.
Camera locked showing face and sky, slow motion on final light reveal.

Constraints: single character, smooth head tilt upward, lighting changes naturally with face angle.
Negative: no camera zoom, no rapid motion, no expression change beyond peaceful, no other characters.
```

**VIDU Q3 推奨プロンプト:**
```
Looking upward revelation sequence.

Close-up: character face downcast, eyes closed, shadowed. Still and somber mood. Camera locked. Duration: 0-1 seconds.

Face slowly tilts upward, eyes gradually open. Camera tilts up synchronously with face. Accelerating motion. Duration: 1-2.5 seconds.

Face fully raised, eyes open gazing at sky. Light floods face from above, peaceful expression. Sky visible above. Camera locked, slow motion. Calm music. Duration: 2.5-4 seconds.

Visual style: portrait lighting, natural sky light, emotional cinematic.
Audio: ambient wind, peaceful music builds.
Constraints: smooth upward tilt, natural lighting transition.
Negative: no zoom, no jerky motion, no smile, no looking around.
```

---

## C. 改善候補9シーン

---

### C-1. 涙 (Tear Drop) - 改善版

**KLING v3 推奨プロンプト:**
```
Extreme close-up of eye, tear forming at lower eyelid edge.
Soft lighting, focus on eye and tear.

[0-1.5s] Tear accumulates slowly at eyelid edge.
Eye stays open, minimal blinking, tear grows gradually.
Camera locked extreme close-up on eye.

[1.5-1.8s] Single spherical tear drop detaches from eyelid.
Tear becomes independent sphere, begins falling.
Camera quickly refocuses to follow tear downward.
Peak moment: detachment instant.

[1.8-2.5s] Camera tracks falling tear drop downward.
Natural gravity-based fall speed, tear maintains spherical form.
Camera follows tear in smooth downward motion.

[2.5-4s] Tear lands on surface, creates ripple rings expanding outward.
Camera pulls back slightly to show ripple spreading.
Slow motion on ripple expansion, concentric rings visible.

Constraints: single tear drop, spherical form maintained, clean detachment, smooth tracking shot, ripple physics-based.
Negative: no streaming tears, no nose drip, no multiple tears, no facial expression change, no smearing.
```

**VIDU Q3 推奨プロンプト:**
```
Single tear drop falling sequence with ripple.

Extreme close-up: tear forming at eye edge, slowly accumulating. Eye open, minimal blink. Camera locked. Soft emotional music begins. Duration: 0-1.5 seconds.

Smart Cut: Single spherical tear detaches from eyelid. Camera instantly follows tear downward. Peak detachment moment. Duration: 1.5-1.8 seconds.

Camera tracks falling spherical tear drop. Natural gravity speed, tear stays round. Smooth downward camera follow. SFX: silence emphasizing fall. Duration: 1.8-2.5 seconds.

Smart Cut: Tear lands, creates perfect ripple rings expanding outward. Camera pulls back showing ripples. Slow motion. Gentle water droplet sound. Duration: 2.5-4 seconds.

Visual style: macro photography, sharp focus on tear, soft lighting.
Audio: emotional piano, water droplet sound at impact.
Constraints: single tear only, spherical shape, clean physics.
Negative: no tear streams, no dripping, no face crying, no smudging.
```

---

### C-2. 決意の一歩 (Determined Step) - 改善版

**KLING v3 推奨プロンプト:**
```
Low angle shot focused on character's feet and lower legs.
Feet on ground, standing still, tension visible in stance.

[0-1s] Feet completely still on ground.
Subtle weight shift preparing to step forward.
Camera low angle locked on feet.

[1-1.5s] One foot lifts and steps forward firmly.
Foot makes contact with ground creating impact.
Peak moment: foot touchdown instant.

[1.5-2.5s] At foot contact, light ripple wave emanates from foot outward along ground.
Clean light effect spreading radially, no dust or debris.
Camera locked on foot and ripple.
Natural physics-based ripple propagation.

[2.5-4s] Camera slowly tilts upward from feet toward character's face.
Ripple continues fading as camera moves up.
Face revealed with determined expression.
Slow motion on tilt-up reveal.

Constraints: feet remain focal point initially, single clean light ripple from impact, no environmental debris, smooth tilt-up camera motion.
Negative: no dust clouds, no multiple steps, no foot sliding, no shaking ground, no camera zoom.
```

**VIDU Q3 推奨プロンプト:**
```
Determined step with light ripple effect.

Low angle on feet: character standing still, subtle weight shift. Feet anchored. Camera locked low. Tension in stance. Duration: 0-1 seconds.

Foot steps forward firmly, makes ground contact. Peak impact moment. Camera stays on foot. Strong step sound. Duration: 1-1.5 seconds.

At foot contact, clean light ripple radiates outward from impact point along ground. No dust, pure light effect. Camera locked. Glowing ripple SFX. Duration: 1.5-2.5 seconds.

Camera slowly tilts up from feet to face. Ripple fades as camera rises. Face revealed with determination. Slow motion tilt. Inspiring music builds. Duration: 2.5-4 seconds.

Visual style: cinematic low angle, light effect clean, photorealistic.
Audio: powerful step sound, light shimmer, uplifting score.
Constraints: foot focus initially, single light ripple, smooth camera tilt.
Negative: no sand/dust, no multiple steps, no shaking, no zoom.
```

---

### C-3. 花びら舞う (Petals Swirling) - 改善版

**KLING v3 推奨プロンプト:**
```
Fixed camera, centered frame, sakura petals floating motionless in air.
Black or neutral soft-focus background, petals suspended.

[0-1s] Petals hang frozen in mid-air, completely still.
Anticipatory pause, no movement.
Camera locked center composition.

[1-1.5s] Petals suddenly explode into spiral vortex motion.
All petals simultaneously begin rotating around center point.
Peak burst energy moment, explosive outward then spiral.

[1.5-3s] Petals swirl in continuous vortex pattern.
Maintain spiral trajectory, varying speeds creating depth.
Natural physics-based turbulent flow around invisible center axis.
Camera remains fixed.

[3-5s] Vortex slows, petals begin gentle downward descent.
Spiral motion fades, petals fall individually at different rates.
Slow motion on descent phase.

Constraints: petals only, spiral vortex pattern, center-axis rotation, natural physics, gradual transition from swirl to fall.
Negative: no ground visible, no random scattering, no wind gusts, no petals moving upward, no camera movement.
```

**VIDU Q3 推奨プロンプト:**
```
Sakura petal vortex effect, single fixed shot.

Petals frozen motionless in air, suspended. Soft background. Complete stillness. Camera locked center. Duration: 0-1 seconds.

Petals suddenly burst into explosive spiral vortex. All petals simultaneously rotate around center point. Peak energy burst. Wind whoosh SFX. Duration: 1-1.5 seconds.

Petals swirl in continuous turbulent vortex pattern. Varying speeds, spiral around center axis. Natural flow physics. Camera static. Gentle wind sound. Duration: 1.5-3 seconds.

Vortex slows, petals transition to gentle downward fall. Individual descent at different rates. Slow motion. Calm ambient music. Duration: 3-5 seconds.

Visual style: sakura petals, soft focus background, volumetric motion.
Audio: wind whoosh at burst, gentle breeze during swirl, peaceful fade.
Constraints: spiral pattern maintained, center-axis rotation, physics-based.
Negative: no ground, no upward motion, no chaotic scatter, no camera move.
```

---

### C-4. 衝撃波 (Shockwave) - 改善版

**KLING v3 推奨プロンプト:**
```
Fixed camera, pure black background, center point glowing faintly.
Minimalist composition, single energy source at center.

[0-1s] Center point pulses faintly with dim light.
Small breathing glow, building energy.
Camera locked center composition.

[1-1.3s] Single explosive burst from center point.
Shockwave ring appears instantaneously and expands outward.
One ring only, non-repeating, clean circular form.
Peak moment: burst instant.

[1.3-3s] Shockwave ring continues expanding radially outward.
Ring maintains circular form, expands at natural physics speed.
Ring edge glows brightly, trailing fade behind.
Camera remains fixed.

[3-5s] Ring reaches frame edges and exits.
Center point glows softly with residual light then fades.
Slow fade to black.

Constraints: single center point, one ring only, clean black background, no objects, circular expansion, non-repeating.
Negative: no multiple rings, no repeating pulses, no debris, no 3D objects, no environmental elements, no camera movement.
```

**VIDU Q3 推奨プロンプト:**
```
Single shockwave ring effect on black background.

Center point faintly pulsing glow, dim energy building. Pure black background. Camera locked center. Silence. Duration: 0-1 seconds.

Single explosive burst: shockwave ring appears and expands from center. One ring only, clean circle. Peak burst. Deep bass explosion SFX. Duration: 1-1.3 seconds.

Ring continues expanding radially outward. Glowing edge, trailing fade. Natural expansion physics. Camera static. Resonant hum sound. Duration: 1.3-3 seconds.

Ring exits frame edges. Center point residual glow fades slowly to black. Camera locked. Sound fades to silence. Duration: 3-5 seconds.

Visual style: clean energy effect, black void, glowing ring, minimalist.
Audio: deep bass burst, resonant fade, silence return.
Constraints: single ring, non-repeating, circular form, black background only.
Negative: no multiple pulses, no objects, no environment, no camera move, no chaos.
```

---

### C-5. キラキラ爆発 (Sparkle Explosion) - 改善版

**KLING v3 推奨プロンプト:**
```
Fixed camera, center composition, dark background, center point pulsing.
Star-shaped particle sparkles ready to burst.

[0-1s] Center point pulses rhythmically with soft glow.
Sparkle particles visible around center, pulsing in sync.
Camera locked center.

[1-1.3s] Explosive radial burst from center.
Star-shaped sparkle particles shoot outward in all directions simultaneously.
Clean particle burst, no ribbons, no aurora trails.
Peak explosion moment.

[1.3-2.5s] Sparkle particles spread radially outward.
Particles maintain star shape, twinkle individually as they move.
Natural deceleration as particles spread.
Camera remains fixed.

[2.5-5s] Particles slow and begin gentle floating motion.
Individual sparkles twinkle randomly, drifting slowly.
Slow motion on floating phase.

Constraints: star-shaped particles only, radial explosion pattern, no trail effects, individual twinkling, natural physics.
Negative: no aurora ribbons, no streamers, no swirls, no secondary effects, no camera movement, no color-changing.
```

**VIDU Q3 推奨プロンプト:**
```
Star sparkle particle explosion, fixed shot.

Center point pulsing gently. Star-shaped sparkles around center pulsing in rhythm. Dark background. Camera locked. Soft magical hum. Duration: 0-1 seconds.

Explosive burst: star sparkles shoot radially outward in all directions. No ribbons, particles only. Peak explosion. Sparkle burst SFX. Duration: 1-1.3 seconds.

Sparkles spread outward, maintaining star shapes. Individual twinkling as they travel. Natural deceleration physics. Camera static. Gentle chime sounds. Duration: 1.3-2.5 seconds.

Sparkles slow to gentle float. Random individual twinkling, slow drift. Slow motion. Peaceful ambient music. Duration: 2.5-5 seconds.

Visual style: star-shaped particles, clean sparkle effect, dark background.
Audio: magical burst sound, gentle twinkle chimes, peaceful fade.
Constraints: particles only, no trails, radial burst, individual twinkle.
Negative: no aurora, no ribbons, no swirls, no streamers, no camera move.
```

---

### C-6. 鏡面反転 (Mirror Inversion) - 改善版

**KLING v3 推奨プロンプト:**
```
Side view medium shot, character kneeling on one knee, head bowed.
Not prostrating, dignified kneeling pose with one knee down.
Floor surface neutral matte finish.

[0-1.2s] Character kneeling, head bowed forward (not to ground).
One knee down, other foot planted, hands on raised knee.
Slow motion on kneeling motion settling.
Camera side angle locked.

[1.2-2s] Floor surface transforms to mirror-like reflective surface.
Character's reflection becomes visible below, perfectly mirrored.
Reflection clarity increases gradually.
Camera remains side view.

[2-3s] Reflection character begins standing up independently.
Real character stays kneeling while reflection rises.
Mirror reflection moves opposite of real character.
Camera locked.

[3-3.6s] Camera rotates 180 degrees around vertical axis.
Rotation brings reflection into primary position as camera flips.
Peak rotation moment, smooth continuous spin.

[3.6-4.6s] Rotation complete, now showing reflection as main subject.
Former reflection is now standing upright in primary frame.
Camera locked on new standing position, slow motion.

Constraints: dignified single-knee kneel, mirror reflection accurate, independent reflection motion, smooth 180° camera rotation, no position swap glitches.
Negative: no full prostration, no both knees down, no face-to-ground, no choppy rotation, no multiple characters.
```

**VIDU Q3 推奨プロンプト:**
```
Mirror reflection inversion sequence with camera rotation.

Side view: character kneeling on one knee, head bowed forward. Dignified pose, one knee down, hands on raised knee. Not prostrating. Camera side angle locked. Slow motion kneel. Duration: 0-1.2 seconds.

Floor becomes mirror surface, reflection appears below. Character reflection visible, growing clearer. Camera static. Reflective surface sound. Duration: 1.2-2 seconds.

Reflection begins standing while real character stays kneeling. Independent mirror motion. Camera locked. Mysterious sound effect. Duration: 2-3 seconds.

Camera rotates 180° smoothly around vertical axis. Rotation brings reflection into primary frame position. Continuous smooth spin. Rotational whoosh sound. Duration: 3-3.6 seconds.

Rotation complete: former reflection now main character standing upright. Camera locked on standing figure. Slow motion. Triumphant music. Duration: 3.6-4.6 seconds.

Visual style: mirror effect, cinematic side angle, smooth rotation.
Audio: reflective shimmer, rotation whoosh, triumphant score.
Constraints: one-knee kneel, accurate mirror, independent motion, smooth 180° spin.
Negative: no prostration, no both knees, no face down, no jerky rotation.
```

---

### C-7. 光線貫通 (Light Beam Connection) - シンプル化改善版

**KLING v3 推奨プロンプト:**
```
Wide angle shot, single character small in frame, dark isolated space.
Character standing alone, empty surroundings, minimal lighting.

[0-1.2s] Character alone in darkness, isolated and small in wide frame.
No movement, loneliness emphasized by composition.
Camera wide angle locked.

[1.2-2s] Character raises one hand forward.
Single bright beam of light shoots from hand outward into darkness.
Beam travels fast, straight trajectory.
Camera remains wide.

[2-3.5s] Multiple light beams return from various directions toward character.
Beams converge at character from different angles.
Natural light beam physics, no sources visible.
Camera locked.

[3.5-5s] Beams connect at character, forming interconnected light network pattern.
Geometric pattern of connecting lines around character.
Character no longer isolated, surrounded by light connections.
Slow motion on network formation.

Constraints: single character, light beams only, straight trajectories, geometric network pattern, no new characters appearing.
Negative: no people materializing, no physical objects, no complex interactions, no camera movement, no beam curving.
```

**VIDU Q3 推奨プロンプト:**
```
Light beam network connection sequence, simplified.

Wide shot: lone character in dark empty space. Small in frame, isolated. Complete stillness. Camera wide locked. Lonely ambient sound. Duration: 0-1.2 seconds.

Character raises hand, shoots single bright light beam outward into darkness. Fast straight trajectory. Camera static. Beam launch sound. Duration: 1.2-2 seconds.

Multiple light beams return from various darkness directions toward character. Beams converge at character from different angles. Camera locked. Returning beam sounds. Duration: 2-3.5 seconds.

Beams connect at character, form geometric light network pattern. Interconnected lines create web around character. No longer isolated. Slow motion. Uplifting music builds. Duration: 3.5-5 seconds.

Visual style: geometric light beams, dark space, network pattern, minimalist.
Audio: beam sounds, connection chimes, uplifting electronic music.
Constraints: light beams only, straight lines, geometric pattern, character stays.
Negative: no people appearing, no objects, no curved beams, no camera move.
```

---

### C-8. 光の放出 (Light Release) - シンプル化改善版

**KLING v3 推奨プロンプト:**
```
Close-up of cupped hands held together, soft light glowing within hands.
Hands at center of frame, gentle contained glow seeping between fingers.

[0-1.2s] Cupped hands closed, soft light trapped inside glowing gently.
Light pulses faintly within hands, contained energy.
Camera close-up locked on hands.

[1.2-2s] Hands slowly open, palms spreading apart.
Light inside released as hands separate, burst of light particles escape.
Peak moment: hands opening and light release.

[2-4s] Light particles float away from hands in all directions.
Particles spread radially outward and slightly upward.
Natural floating physics, varying particle speeds.
Camera slowly pulls back to wider view.

[4-5s] Particles continue floating away, spreading further into distance.
Hands remain open and empty, light fully released.
Slow motion on particles drifting away.

Constraints: hands only initially, light particles simple, radial dispersal pattern, no other characters, no sprouting effects.
Negative: no seeds, no plants growing, no people receiving light, no complex transformations, no camera zoom, no additional effects.
```

**VIDU Q3 推奨プロンプト:**
```
Light release from hands sequence, simplified.

Close-up: cupped hands together, soft light glowing within. Light seeps between fingers gently. Camera locked on hands. Gentle hum sound. Duration: 0-1.2 seconds.

Hands slowly open, palms spread. Light particles burst free and release outward. Peak release moment. Camera stays on hands. Magical release sound. Duration: 1.2-2 seconds.

Light particles float away radially in all directions. Spread outward and upward naturally. Varying particle speeds. Camera gentle pull back. Soft shimmer sounds. Duration: 2-4 seconds.

Particles drift further into distance. Hands open and empty. Light fully released and dispersing. Slow motion. Peaceful ambient music. Duration: 4-5 seconds.

Visual style: soft light particles, gentle glow, simple release effect.
Audio: gentle hum, magical release, shimmer sounds, peaceful music.
Constraints: hands central, particles only, radial dispersal, simple clean effect.
Negative: no sprouting, no plants, no other people, no complex effects, no zoom.
```

---

### C-9. 星空凝視 (Stargazing) - 改善版

**KLING v3 推奨プロンプト:**
```
Low angle shot, character silhouette looking upward at night sky.
Starry sky above, character small in lower frame, peaceful composition.

[0-1.5s] Character silhouette gazing up at star-filled sky.
Complete stillness, quiet contemplation moment.
Camera low angle locked.

[1.5-3s] Single shooting star crosses sky horizontally.
Natural shooting star trajectory and speed, clean trail behind.
No explosion, no breaking apart, simple crossing motion.
Camera remains locked.

[3-5s] Shooting star exits frame, leaves fading trail.
Sky returns to stillness with stationary stars.
Character continues gazing peacefully.
Slow motion on peaceful stillness.

Constraints: single shooting star, horizontal crossing trajectory, natural speed, simple trail, no explosions, peaceful mood.
Negative: no star explosion, no constellation forming, no multiple stars, no camera movement, no character movement beyond breathing.
```

**VIDU Q3 推奨プロンプト:**
```
Peaceful stargazing moment with shooting star.

Low angle: character silhouette gazing up at starry night sky. Complete stillness, peaceful mood. Camera locked low angle. Gentle night ambience. Duration: 0-1.5 seconds.

Single shooting star crosses sky horizontally at natural speed. Clean trail behind, no explosion. Simple crossing motion. Camera static. Soft whoosh sound. Duration: 1.5-3 seconds.

Shooting star exits frame, trail fades. Sky returns to stillness with stationary stars. Character continues peaceful gaze. Slow motion. Calm music. Duration: 3-5 seconds.

Visual style: night sky, silhouette, realistic stars, peaceful composition.
Audio: night ambience, gentle whoosh, calm peaceful music.
Constraints: single star, horizontal trajectory, natural speed, clean trail, peaceful.
Negative: no explosion, no constellation, no multiple stars, no camera move, no stirring.
```

---

## まとめと使用ガイド

### 重要なプロンプト原則

| 原則 | 内容 |
|------|------|
| **時間指定** | "0-2s" より "during first 2 seconds" の方が確実 |
| **Constraints** | 何が動いて良いか明示 |
| **Negatives** | 意図しない動きを確実に防ぐ |
| **カメラワーク** | "Camera locked" "Camera gentle dolly" など具体的に |
| **物理法則** | "physics-based" "natural speed" で自然な動きを指示 |

### モデル選択推奨

| 用途 | 推奨モデル |
|------|-----------|
| 複雑なカメラワーク + マルチショット | KLING v3 |
| 16秒長尺 + Smart Cuts | VIDU Q3 |
| エフェクト単体（A-2, A-3, A-4など） | どちらでもOK、KLINGの方がやや精密 |

### プロンプト5層構造

```
1. Shot Type（構図）
2. Subject Action（人物/オブジェクトの動き）
3. Camera Movement（カメラワーク）
4. Constraints（制約：何が動いて良いか）
5. Negatives（禁止：何が動いてはいけないか）
```
