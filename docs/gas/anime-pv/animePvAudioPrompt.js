/**
 * アニメPV制作 - 音声プロンプト生成 v2.0
 *
 * SUNO BGM/歌詞付き楽曲、歌詞生成、FISH AUDIOナレーション用プロンプトを生成
 * 12シーン対応
 * スタイル選択はダイアログで行う
 */

// ================================================================================
// ===== 定数定義 =====
// ================================================================================

const PV_SUNO_BGM_STYLES = [
  {
    id: 'piano_solo',
    name: 'ピアノソロ',
    prompt: `Cinematic instrumental, emotional piano solo, ambient atmosphere,
slow tempo 60-70 BPM, melancholic yet hopeful, soft strings gradually entering,
film score style, no vocals, Japanese anime movie soundtrack feel`
  },
  {
    id: 'orchestral',
    name: 'オーケストラ',
    prompt: `Epic cinematic orchestral, emotional strings, building crescendo,
tempo 70-80 BPM, inspiring and hopeful, full orchestra arrangement,
film score style, no vocals, Hollywood movie trailer feel`
  },
  {
    id: 'acoustic',
    name: 'アコースティック',
    prompt: `Warm acoustic instrumental, gentle guitar melody, soft piano accents,
tempo 65-75 BPM, nostalgic and heartwarming, minimal arrangement,
indie film soundtrack style, no vocals, intimate atmosphere`
  },
  {
    id: 'electronic',
    name: 'エレクトロニック',
    prompt: `Modern electronic ambient, soft synth pads, gentle beats,
tempo 80-90 BPM, futuristic yet emotional, subtle bass,
ambient electronic style, no vocals, tech documentary feel`
  },
  {
    id: 'jpop_inst',
    name: 'J-POP（インスト）',
    prompt: `J-pop instrumental, piano-driven melody, light drums and bass,
tempo 75-85 BPM, uplifting and bright, anime opening feel,
Japanese pop style, no vocals, energetic but smooth`
  }
];

// ================================================================================
// ===== SUNO V5対応 選択肢定義 =====
// ================================================================================

// 日本人アーティスト風プリセット
const PV_SUNO_ARTIST_PRESETS = [
  {
    id: 'yoasobi',
    name: 'YOASOBI風',
    description: '高音女性・エレクトロポップ',
    settings: {
      genre: 'jpop',
      mood: 'energetic',
      energy: 'high',
      vocal: 'female_high',
      bpm: 'fast',
      instruments: ['synth', 'piano']
    },
    stylePrompt: 'Japanese anime pop, upbeat electropop, bright synthesizers, story-driven emotional narrative, night city aesthetic, modern J-Pop production, energetic yet bittersweet'
  },
  {
    id: 'sukima',
    name: 'スキマスイッチ風',
    description: '温かい男性・アコースティック',
    settings: {
      genre: 'acoustic',
      mood: 'nostalgic',
      energy: 'medium',
      vocal: 'male_soft',
      bpm: 'medium',
      instruments: ['acoustic_guitar', 'piano']
    },
    stylePrompt: 'Japanese acoustic pop duo, warm male vocals, piano-guitar blend, heartfelt melody, comforting and uplifting, organic sound, folk-pop fusion'
  },
  {
    id: 'oneokrock',
    name: 'ONE OK ROCK風',
    description: 'パワフル男性・ロック',
    settings: {
      genre: 'rock_jpop',
      mood: 'powerful',
      energy: 'maximum',
      vocal: 'male_powerful',
      bpm: 'very_fast',
      instruments: ['electric_guitar', 'full_band']
    },
    stylePrompt: 'Japanese rock band, powerful male vocals, emotional J-Rock with Western rock influence, alternative rock, post-hardcore energy, anthemic choruses, raw energy and passion'
  },
  {
    id: 'mrsgreen',
    name: 'Mrs. GREEN APPLE風',
    description: '高音男性・ポップロック',
    settings: {
      genre: 'rock_jpop',
      mood: 'uplifting',
      energy: 'high',
      vocal: 'male_powerful',
      bpm: 'fast',
      instruments: ['piano', 'electric_guitar']
    },
    stylePrompt: 'Japanese pop-rock, high-pitched expressive male vocals, bright piano melodies, energetic electric guitar, catchy and youthful, upbeat and optimistic, fresh and vibrant J-Pop sound'
  },
  {
    id: 'hata',
    name: '秦基博風',
    description: '優しい男性・バラード',
    settings: {
      genre: 'ballad',
      mood: 'emotional',
      energy: 'low',
      vocal: 'male_soft',
      bpm: 'slow',
      instruments: ['acoustic_guitar', 'piano']
    },
    stylePrompt: 'Japanese acoustic ballad, warm and tender male vocals, solo piano with gentle acoustic guitar, light string arrangement, heartfelt and intimate atmosphere, emotional storytelling'
  },
  {
    id: 'vaundy',
    name: 'Vaundy風',
    description: '独特な男性・オルタナ',
    settings: {
      genre: 'electronic',
      mood: 'nostalgic',
      energy: 'medium',
      vocal: 'male_soft',
      bpm: 'medium',
      instruments: ['synth', 'electric_guitar']
    },
    stylePrompt: 'Japanese alternative pop, genre-blending experimental sound, unique and androgynous male vocals, retro synthesizers, groovy basslines, modern production with vintage elements, artistic and unconventional'
  },
  {
    id: 'yonezu',
    name: '米津玄師風',
    description: '個性的男性・ダーク',
    settings: {
      genre: 'rock_jpop',
      mood: 'melancholic',
      energy: 'high',
      vocal: 'male_powerful',
      bpm: 'fast',
      instruments: ['electric_guitar', 'synth']
    },
    stylePrompt: 'Japanese alternative rock-pop, distinctive and theatrical male vocals, Vocaloid-inspired composition style, dark synthesizers, complex arrangements, cinematic, mysterious and artistic atmosphere'
  },
  {
    id: 'idol',
    name: 'アイドル風',
    description: '明るい女性グループ',
    settings: {
      genre: 'jpop',
      mood: 'uplifting',
      energy: 'high',
      vocal: 'group',
      bpm: 'fast',
      instruments: ['synth', '808_drums']
    },
    stylePrompt: 'Japanese idol pop, bright and cheerful female group vocals, catchy dance-pop melody, energetic and cute, upbeat synthesizers, youthful and vibrant, unison singing with harmonies'
  },
  {
    id: 'anime_battle',
    name: 'アニメOP（戦闘系）',
    description: 'ロック・熱い',
    settings: {
      genre: 'rock_jpop',
      mood: 'powerful',
      energy: 'maximum',
      vocal: 'male_powerful',
      bpm: 'very_fast',
      instruments: ['electric_guitar', 'full_band']
    },
    stylePrompt: 'Japanese anime opening, shonen battle theme, electric guitars with heavy riffs, orchestral strings, heroic and determined atmosphere, powerful vocals, dramatic and epic, fast-paced and intense'
  },
  {
    id: 'anime_youth',
    name: 'アニメOP（青春系）',
    description: 'ポップロック・爽やか',
    settings: {
      genre: 'rock_jpop',
      mood: 'uplifting',
      energy: 'high',
      vocal: 'female_high',
      bpm: 'fast',
      instruments: ['acoustic_guitar', 'electric_guitar']
    },
    stylePrompt: 'Japanese anime opening, slice-of-life youth theme, bright pop-rock sound, acoustic and electric guitar blend, cheerful female vocals, youthful and optimistic, warm and heartfelt, coming-of-age atmosphere'
  }
];

const PV_SUNO_GENRES = [
  { id: 'jpop', name: 'J-Pop', prompt: 'J-Pop' },
  { id: 'rock_jpop', name: 'Rock J-Pop', prompt: 'Rock J-Pop' },
  { id: 'ballad', name: 'Ballad', prompt: 'J-Pop Ballad' },
  { id: 'synthwave', name: 'Synthwave', prompt: 'Synthwave' },
  { id: 'electronic', name: 'Electronic', prompt: 'Electronic Pop' },
  { id: 'acoustic', name: 'Acoustic', prompt: 'Acoustic Pop' }
];

const PV_SUNO_MOODS = [
  { id: 'uplifting', name: 'Uplifting（高揚感）', prompt: 'Uplifting' },
  { id: 'nostalgic', name: 'Nostalgic（懐かしい）', prompt: 'Nostalgic' },
  { id: 'emotional', name: 'Emotional（感動的）', prompt: 'Emotional' },
  { id: 'energetic', name: 'Energetic（エネルギッシュ）', prompt: 'Energetic' },
  { id: 'melancholic', name: 'Melancholic（憂鬱）', prompt: 'Melancholic' },
  { id: 'powerful', name: 'Powerful（力強い）', prompt: 'Powerful' }
];

const PV_SUNO_ENERGIES = [
  { id: 'low', name: 'Low（静か）', prompt: 'Low Energy' },
  { id: 'medium', name: 'Medium（中程度）', prompt: 'Medium Energy' },
  { id: 'high', name: 'High（高い）', prompt: 'High Energy' },
  { id: 'maximum', name: 'Maximum（最大）', prompt: 'Maximum Energy' }
];

const PV_SUNO_VOCALS = [
  { id: 'female_high', name: '女性高音（透明感）', prompt: 'crystal clear high female vocals' },
  { id: 'female_mid', name: '女性中音（温かみ）', prompt: 'warm mid-range female vocals' },
  { id: 'male_powerful', name: '男性（力強い）', prompt: 'powerful male vocals' },
  { id: 'male_soft', name: '男性（優しい）', prompt: 'soft tender male vocals' },
  { id: 'group', name: 'グループ（ハーモニー）', prompt: 'group vocals with harmonies' }
];

const PV_SUNO_INSTRUMENTS = [
  { id: 'piano', name: 'Piano', prompt: 'Piano' },
  { id: 'synth', name: 'Synth', prompt: 'Synth' },
  { id: 'acoustic_guitar', name: 'Acoustic Guitar', prompt: 'Acoustic Guitar' },
  { id: 'electric_guitar', name: 'Electric Guitar', prompt: 'Electric Guitar' },
  { id: '808_drums', name: '808 Drums', prompt: '808 Drums' },
  { id: 'full_band', name: 'Full Band', prompt: 'Full Band' }
];

const PV_SUNO_BPMS = [
  { id: 'slow', name: 'Slow (60-80)', prompt: '60-80 BPM' },
  { id: 'medium', name: 'Medium (80-110)', prompt: '80-110 BPM' },
  { id: 'fast', name: 'Fast (110-140)', prompt: '110-140 BPM' },
  { id: 'very_fast', name: 'Very Fast (140+)', prompt: '140-160 BPM' },
  { id: 'custom', name: 'カスタム', prompt: '' }
];

// ================================================================================
// ===== 歌詞構成パターン定義 =====
// ================================================================================

// ショート（1分）向け - 短時間で最大限のエモーションを引き出す設計
const PV_LYRICS_STRUCTURES_SHORT = [
  {
    id: 'short_chorus_first',
    name: 'サビ頭→展開→サビ',
    description: '最初から掴む、記憶に残る',
    sections: ['Chorus', 'Verse', 'Final Chorus'],
    template: `[Chorus]
[Energy: High]
（最初からサビで掴む、印象的なフレーズ 4行）

[Verse]
[Energy: Medium]
（サビの背景・感情の深掘り 4行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（感情のピーク、サビの変化形 4行）`
  },
  {
    id: 'short_condensed',
    name: '凝縮型',
    description: '最短で感情曲線を描く',
    sections: ['Verse', 'Chorus', 'Outro'],
    template: `[Verse]
[Energy: Medium]
（情景描写と感情の芽生え 4行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（感情の爆発、最も伝えたいメッセージ 4-6行）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻を残す一言 2行）`
  },
  {
    id: 'short_intro_chorus',
    name: 'イントロ→サビ直行',
    description: '世界観＋インパクトの両立',
    sections: ['Intro', 'Chorus', 'Bridge', 'Final Chorus'],
    template: `[Intro]
[Energy: Low]
（世界観を一瞬で提示 2行）

[Chorus]
[Energy: High]
（すぐにサビへ、メインメッセージ 4行）

[Bridge]
[Energy: Building]
（視点の転換、問いかけ 2行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（クライマックス 4行）`
  },
  {
    id: 'short_one_scene',
    name: 'ワンシーン型',
    description: 'ショートフィルム的、1つの感情を深く',
    sections: ['Verse', 'Chorus'],
    template: `[Verse]
[Energy: Low]
[Building]
（1つの情景を丁寧に描写、感情が徐々に高まる 6行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（その情景から生まれる感情のピーク、1回だけだからこそ濃密に 6行）`
  }
];

// ロング（2-3分）向け - フルサイズ楽曲
const PV_LYRICS_STRUCTURES_LONG = [
  {
    id: 'standard',
    name: '標準（Verse始まり）',
    description: '物語性重視、ストーリーを展開',
    sections: ['Verse', 'Pre-Chorus', 'Chorus', 'Verse2', 'Chorus', 'Bridge', 'Final Chorus', 'Outro'],
    template: `[Verse]
[Energy: Medium]
（導入・状況描写・感情の芽生え 4-6行）

[Pre-Chorus]
[Energy: Building]
（感情の高まり 2-3行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（最も印象的なフレーズ 4-6行）

[Verse2]
[Energy: Medium]
（展開・変化・深化 4-6行）

[Chorus]
[Energy: High]
（サビ繰り返し）

[Bridge]
[Energy: Building]
（転換・新たな視点 2-4行）

[Final Chorus]
[Energy: Maximum]
（クライマックス）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻 2-4行）`
  },
  {
    id: 'chorus_first',
    name: 'サビ始まり',
    description: 'インパクト重視、最初からフック',
    sections: ['Chorus', 'Verse', 'Chorus', 'Verse2', 'Bridge', 'Final Chorus'],
    template: `[Chorus]
[Energy: High]
（最初からサビ、インパクト 4-6行）

[Verse]
[Energy: Medium]
（サビを受けて背景説明 4-6行）

[Chorus]
[Energy: High]
（サビ繰り返し）

[Verse2]
[Energy: Medium]
（展開・深化 4-6行）

[Bridge]
[Energy: Building]
（転換点 2-4行）

[Final Chorus]
[Energy: Maximum]
[Stacked Harmonies]
（最高潮のサビ）`
  },
  {
    id: 'with_intro',
    name: 'イントロ付き',
    description: '雰囲気重視、世界観を構築',
    sections: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse2', 'Chorus', 'Outro'],
    template: `[Intro]
[Energy: Low]
（世界観を提示する短いフレーズ 2行）

[Verse]
[Energy: Medium]
（物語の始まり 4-6行）

[Pre-Chorus]
[Energy: Building]
（高まり 2-3行）

[Chorus]
[Energy: High]
（サビ 4-6行）

[Verse2]
[Energy: Medium]
（展開 4-6行）

[Chorus]
[Energy: High]
[Stacked Harmonies]
（サビ繰り返し）

[Outro]
[Energy: Fading]
[Fade Out]
（余韻・イントロの呼応 2-4行）`
  },
  {
    id: 'ballad',
    name: 'バラード',
    description: '感情重視、じっくり展開',
    sections: ['Verse', 'Verse2', 'Chorus', 'Verse3', 'Bridge', 'Final Chorus', 'Outro'],
    template: `[Verse]
[Energy: Low]
（静かな導入・情景描写 4-6行）

[Verse2]
[Energy: Low]
（感情の深まり 4-6行）

[Chorus]
[Energy: Medium]
（控えめだが芯のあるサビ 4-6行）

[Verse3]
[Energy: Medium]
（転換・新たな展開 4-6行）

[Bridge]
[Energy: Building]
（感情の爆発前夜 2-4行）

[Final Chorus]
[Energy: High]
[Stacked Harmonies]
（感情のピーク）

[Outro]
[Energy: Fading]
[Fade Out]
（静かに消えゆく余韻 2-4行）`
  }
];

// 後方互換性のためのエイリアス
const PV_LYRICS_STRUCTURES = PV_LYRICS_STRUCTURES_LONG;

// 後方互換性のため残す（旧形式）
const PV_SUNO_VOCAL_STYLES = [
  {
    id: 'female_high',
    name: '女性高音（透明感）',
    prompt: `J-Pop, Uplifting, High Energy, crystal clear high female vocals, Piano, Synth, 120-130 BPM, Japanese lyrics`
  },
  {
    id: 'female_mid',
    name: '女性中音（温かみ）',
    prompt: `J-Pop Ballad, Emotional, Medium Energy, warm mid-range female vocals, Piano, Acoustic Guitar, 80-90 BPM, Japanese lyrics`
  },
  {
    id: 'male_powerful',
    name: '男性（力強い）',
    prompt: `Rock J-Pop, Powerful, High Energy, powerful male vocals, Electric Guitar, Full Band, 130-150 BPM, Japanese lyrics`
  },
  {
    id: 'male_soft',
    name: '男性（優しい）',
    prompt: `Acoustic Pop, Nostalgic, Low Energy, soft tender male vocals, Acoustic Guitar, Piano, 70-85 BPM, Japanese lyrics`
  },
  {
    id: 'group',
    name: 'グループ（ハーモニー）',
    prompt: `J-Pop, Energetic, High Energy, group vocals with harmonies, Synth, Full Band, 120-130 BPM, Japanese lyrics`
  }
];

// ================================================================================
// ===== SUNO BGMプロンプト =====
// ================================================================================

/**
 * SUNO冒頭BGMプロンプトダイアログを表示
 */
function pv_showSunoBgmDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('SUNO_BGMプロンプト');

  const htmlContent = pv_createSunoBgmDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(700)
    .setHeight(600);
  ui.showModalDialog(htmlOutput, '🎵 SUNO冒頭BGMプロンプト');
}

function pv_createSunoBgmDialogHtml(sheetData) {
  const stylesJson = JSON.stringify(PV_SUNO_BGM_STYLES);
  const sheetDataJson = JSON.stringify(sheetData);

  // スタイル選択オプション
  let styleOptions = '';
  for (const style of PV_SUNO_BGM_STYLES) {
    styleOptions += `
      <div class="style-option" data-style-id="${style.id}" onclick="selectStyle('${style.id}')">
        <div class="style-name">${pv_escapeHtml(style.name)}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .style-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
        .style-option {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .style-option:hover { border-color: #f59e0b; background: #fffbeb; }
        .style-option.selected { border-color: #f59e0b; background: #fef3c7; }
        .style-name { font-weight: bold; color: #333; font-size: 13px; }
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>🎵 SUNO冒頭BGMプロンプト</h3>
      <p class="subtitle">冒頭ナレーション部分のインストゥルメンタルBGM</p>

      <!-- 企業選択 -->
      <div class="input-section">
        <span class="input-label">対象企業を選択</span>
        <div class="company-select-wrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業シートを選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
      </div>

      <div id="optionsSection" class="options-disabled">
        <div class="section-title">BGMスタイルを選択</div>
        <div class="style-grid">
          ${styleOptions}
        </div>
      </div>

      <div class="prompt-result">
        <div class="prompt-result-header">
          <span class="prompt-result-title">生成されたプロンプト</span>
          <div class="prompt-result-actions">
            <button class="btn btn-copy" id="copyBtn" onclick="copyPrompt()" disabled>📋 コピー</button>
            <button class="btn btn-save" id="saveBtn" onclick="savePrompt()" disabled>💾 保存</button>
          </div>
        </div>
        <div class="prompt-result-body" id="promptBody">企業を選択し、スタイルを選択するとプロンプトが生成されます</div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        const styles = ${stylesJson};
        let selectedSheetName = '';
        let currentPrompt = '';

        window.onload = function() {
          initCompanyDropdown();
        };

        function initCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          dropdown.innerHTML = '';
          if (!sheetData.companySheets || sheetData.companySheets.length === 0) {
            dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
            return;
          }
          sheetData.companySheets.forEach(item => {
            const div = document.createElement('div');
            div.className = 'company-select-item' + (item.isActive ? ' active' : '');
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
            div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
            div.onclick = function(e) {
              e.stopPropagation();
              selectCompany(item);
              toggleCompanyDropdown();
            };
            dropdown.appendChild(div);
            if (item.isActive) selectCompany(item);
          });
        }

        function toggleCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          const display = document.getElementById('companySelectDisplay');
          dropdown.classList.toggle('show');
          display.classList.toggle('active');
        }

        function selectCompany(item) {
          selectedSheetName = item.sheetName;
          document.getElementById('companySelectDisplay').innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';
          document.getElementById('optionsSection').classList.remove('options-disabled');
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function selectStyle(styleId) {
          if (!selectedSheetName) return;
          document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-style-id="' + styleId + '"]').classList.add('selected');

          const style = styles.find(s => s.id === styleId);
          if (style) {
            currentPrompt = style.prompt;
            document.getElementById('promptBody').textContent = currentPrompt;
            document.getElementById('copyBtn').disabled = false;
            document.getElementById('saveBtn').disabled = false;
          }
        }

        function copyPrompt() {
          if (!currentPrompt) return;
          copyToClipboard(currentPrompt);
        }

        function savePrompt() {
          if (!selectedSheetName || !currentPrompt) return;
          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, 'SUNO_BGMプロンプト', currentPrompt);
        }

        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.company-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('companySelectDropdown').classList.remove('show');
            document.getElementById('companySelectDisplay').classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== SUNO歌詞付き楽曲プロンプト =====
// ================================================================================

/**
 * SUNO歌詞付き楽曲プロンプトダイアログを表示
 */
function pv_showSunoVocalDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('SUNO_ボーカルプロンプト');

  const htmlContent = pv_createSunoVocalDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(800)
    .setHeight(750);
  ui.showModalDialog(htmlOutput, '🎤 SUNO歌詞付き楽曲プロンプト（V5対応）');
}

function pv_createSunoVocalDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);
  const presetsJson = JSON.stringify(PV_SUNO_ARTIST_PRESETS);
  const genresJson = JSON.stringify(PV_SUNO_GENRES);
  const moodsJson = JSON.stringify(PV_SUNO_MOODS);
  const energiesJson = JSON.stringify(PV_SUNO_ENERGIES);
  const vocalsJson = JSON.stringify(PV_SUNO_VOCALS);
  const instrumentsJson = JSON.stringify(PV_SUNO_INSTRUMENTS);
  const bpmsJson = JSON.stringify(PV_SUNO_BPMS);

  // プリセット選択オプション生成
  let presetOptions = '<option value="">-- カスタム --</option>';
  for (const preset of PV_SUNO_ARTIST_PRESETS) {
    presetOptions += `<option value="${preset.id}">${pv_escapeHtml(preset.name)} - ${pv_escapeHtml(preset.description)}</option>`;
  }

  // ドロップダウンオプション生成
  const genreOptions = PV_SUNO_GENRES.map(g => `<option value="${g.id}">${pv_escapeHtml(g.name)}</option>`).join('');
  const moodOptions = PV_SUNO_MOODS.map(m => `<option value="${m.id}">${pv_escapeHtml(m.name)}</option>`).join('');
  const energyOptions = PV_SUNO_ENERGIES.map(e => `<option value="${e.id}">${pv_escapeHtml(e.name)}</option>`).join('');
  const vocalOptions = PV_SUNO_VOCALS.map(v => `<option value="${v.id}">${pv_escapeHtml(v.name)}</option>`).join('');
  const bpmOptions = PV_SUNO_BPMS.map(b => `<option value="${b.id}">${pv_escapeHtml(b.name)}</option>`).join('');

  // 楽器チェックボックス生成
  const instrumentChecks = PV_SUNO_INSTRUMENTS.map(i =>
    `<label class="instrument-check"><input type="checkbox" value="${i.id}" onchange="updatePrompt()"> ${pv_escapeHtml(i.name)}</label>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .preset-section { margin-bottom: 16px; }
        .preset-select {
          width: 100%; padding: 10px; border: 2px solid #ec4899; border-radius: 8px;
          font-size: 14px; background: #fdf2f8; cursor: pointer;
        }
        .preset-select:focus { outline: none; border-color: #be185d; }
        .param-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .param-group { display: flex; flex-direction: column; gap: 4px; }
        .param-label { font-size: 11px; font-weight: bold; color: #666; }
        .param-select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
        .instrument-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .instrument-check {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 10px; background: #f5f5f5; border-radius: 6px;
          font-size: 12px; cursor: pointer;
        }
        .instrument-check:has(input:checked) { background: #fce7f3; border: 1px solid #ec4899; }
        .bpm-custom { width: 80px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; display: none; }
        .lyrics-section {
          background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px;
          padding: 12px; margin-top: 16px;
        }
        .lyrics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .lyrics-title { font-weight: bold; color: #166534; font-size: 13px; }
        .lyrics-body {
          background: white; border: 1px solid #ddd; border-radius: 6px;
          padding: 10px; font-size: 12px; max-height: 120px; overflow-y: auto;
          white-space: pre-wrap; color: #333;
        }
        .lyrics-empty { color: #999; font-style: italic; }
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>🎤 SUNO歌詞付き楽曲プロンプト（V5対応）</h3>
      <p class="subtitle">企業を選択し、プリセットまたはカスタムで設定</p>

      <!-- 企業選択 -->
      <div class="input-section">
        <span class="input-label">対象企業を選択</span>
        <div class="company-select-wrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業シートを選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
      </div>

      <div id="optionsSection" class="options-disabled">
      <div class="section-title">🎌 アーティスト風プリセット</div>
      <div class="preset-section">
        <select id="preset" class="preset-select" onchange="applyPreset()">
          ${presetOptions}
        </select>
      </div>

      <div class="section-title">カスタム設定</div>
      <div class="param-grid">
        <div class="param-group">
          <span class="param-label">ジャンル</span>
          <select id="genre" class="param-select" onchange="updatePrompt()">${genreOptions}</select>
        </div>
        <div class="param-group">
          <span class="param-label">ムード</span>
          <select id="mood" class="param-select" onchange="updatePrompt()">${moodOptions}</select>
        </div>
        <div class="param-group">
          <span class="param-label">エネルギー</span>
          <select id="energy" class="param-select" onchange="updatePrompt()">${energyOptions}</select>
        </div>
      </div>

      <div class="param-grid">
        <div class="param-group">
          <span class="param-label">ボーカル</span>
          <select id="vocal" class="param-select" onchange="updatePrompt()">${vocalOptions}</select>
        </div>
        <div class="param-group">
          <span class="param-label">BPM</span>
          <select id="bpm" class="param-select" onchange="onBpmChange()">${bpmOptions}</select>
          <input type="text" id="bpmCustom" class="bpm-custom" placeholder="120" onchange="updatePrompt()">
        </div>
      </div>

      <div class="section-title">楽器（最大3つ推奨）</div>
      <div class="instrument-grid">
        ${instrumentChecks}
      </div>

      </div><!-- optionsSection -->

      <div class="prompt-result">
        <div class="prompt-result-header">
          <span class="prompt-result-title">🎵 楽曲プロンプト</span>
          <div class="prompt-result-actions">
            <button class="btn btn-copy" id="copyBtn" onclick="copyPrompt()" disabled>📋 コピー</button>
            <button class="btn btn-save" id="saveBtn" onclick="savePrompt()" disabled>💾 保存</button>
          </div>
        </div>
        <div class="prompt-result-body" id="promptBody">企業を選択し、要素を設定するとプロンプトが生成されます</div>
      </div>

      <div class="lyrics-section">
        <div class="lyrics-header">
          <span class="lyrics-title">📝 保存済み歌詞</span>
          <div>
            <button class="btn btn-copy" onclick="copyLyrics()">📋 コピー</button>
            <button class="btn" id="loadLyricsBtn" onclick="loadLyrics()" disabled>🔄 読み込む</button>
          </div>
        </div>
        <div class="lyrics-body" id="lyricsBody">
          <span class="lyrics-empty">企業を選択後、「読み込む」で保存済み歌詞を取得</span>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        const presets = ${presetsJson};
        const genres = ${genresJson};
        const moods = ${moodsJson};
        const energies = ${energiesJson};
        const vocals = ${vocalsJson};
        const instruments = ${instrumentsJson};
        const bpms = ${bpmsJson};
        let selectedSheetName = '';
        let currentPrompt = '';
        let currentLyrics = '';
        let usePresetPrompt = false;
        let presetStylePrompt = '';

        window.onload = function() {
          initCompanyDropdown();
        };

        function initCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          dropdown.innerHTML = '';
          if (!sheetData.companySheets || sheetData.companySheets.length === 0) {
            dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
            return;
          }
          sheetData.companySheets.forEach(item => {
            const div = document.createElement('div');
            div.className = 'company-select-item' + (item.isActive ? ' active' : '');
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
            div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
            div.onclick = function(e) {
              e.stopPropagation();
              selectCompany(item);
              toggleCompanyDropdown();
            };
            dropdown.appendChild(div);
            if (item.isActive) selectCompany(item);
          });
        }

        function toggleCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          const display = document.getElementById('companySelectDisplay');
          dropdown.classList.toggle('show');
          display.classList.toggle('active');
        }

        function selectCompany(item) {
          selectedSheetName = item.sheetName;
          document.getElementById('companySelectDisplay').innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';
          document.getElementById('optionsSection').classList.remove('options-disabled');
          document.getElementById('copyBtn').disabled = false;
          document.getElementById('saveBtn').disabled = false;
          document.getElementById('loadLyricsBtn').disabled = false;
          updatePrompt();
          loadLyrics();
        }

        // プリセット適用
        function applyPreset() {
          const presetId = document.getElementById('preset').value;
          if (!presetId) {
            usePresetPrompt = false;
            presetStylePrompt = '';
            updatePrompt();
            return;
          }

          const preset = presets.find(p => p.id === presetId);
          if (!preset) return;

          // 各選択肢を設定
          document.getElementById('genre').value = preset.settings.genre;
          document.getElementById('mood').value = preset.settings.mood;
          document.getElementById('energy').value = preset.settings.energy;
          document.getElementById('vocal').value = preset.settings.vocal;
          document.getElementById('bpm').value = preset.settings.bpm;

          // BPMカスタムフィールドの表示/非表示（clearPresetModeを呼ばない）
          const bpmCustom = document.getElementById('bpmCustom');
          bpmCustom.style.display = preset.settings.bpm === 'custom' ? 'inline-block' : 'none';

          // 楽器チェックボックスをリセットして設定
          document.querySelectorAll('.instrument-check input').forEach(cb => {
            cb.checked = preset.settings.instruments.includes(cb.value);
          });

          // プリセットのスタイルプロンプトを使用
          usePresetPrompt = true;
          presetStylePrompt = preset.stylePrompt;
          updatePrompt();
        }

        function onBpmChange() {
          const bpmSelect = document.getElementById('bpm');
          const bpmCustom = document.getElementById('bpmCustom');
          bpmCustom.style.display = bpmSelect.value === 'custom' ? 'inline-block' : 'none';
          // BPM変更はプリセットモードを解除しない、プロンプトのみ更新
          updatePrompt();
        }

        // 手動でジャンル/ムード/ボーカル/楽器を変更したらプリセットモードを解除
        function clearPresetMode() {
          usePresetPrompt = false;
          presetStylePrompt = '';
          document.getElementById('preset').value = '';
          updatePrompt();
        }

        function updatePrompt() {
          // プリセットのスタイルプロンプトを使用する場合
          if (usePresetPrompt && presetStylePrompt) {
            // BPMを追加
            const bpmSelect = document.getElementById('bpm').value;
            let bpmSuffix = '';
            if (bpmSelect === 'custom') {
              const customVal = document.getElementById('bpmCustom').value.trim();
              if (customVal) bpmSuffix = ', ' + customVal + ' BPM';
            } else {
              const bpm = bpms.find(b => b.id === bpmSelect);
              if (bpm && bpm.prompt) bpmSuffix = ', ' + bpm.prompt;
            }
            currentPrompt = presetStylePrompt + bpmSuffix + ', Japanese lyrics';
            document.getElementById('promptBody').textContent = currentPrompt;
            return;
          }

          // カスタムモード
          const genre = genres.find(g => g.id === document.getElementById('genre').value);
          const mood = moods.find(m => m.id === document.getElementById('mood').value);
          const energy = energies.find(e => e.id === document.getElementById('energy').value);
          const vocal = vocals.find(v => v.id === document.getElementById('vocal').value);

          // BPM
          const bpmSelect = document.getElementById('bpm').value;
          let bpmPrompt = '';
          if (bpmSelect === 'custom') {
            const customVal = document.getElementById('bpmCustom').value.trim();
            bpmPrompt = customVal ? customVal + ' BPM' : '';
          } else {
            const bpm = bpms.find(b => b.id === bpmSelect);
            bpmPrompt = bpm ? bpm.prompt : '';
          }

          // 楽器（選択されたもの）
          const selectedInstruments = [];
          document.querySelectorAll('.instrument-check input:checked').forEach(cb => {
            const inst = instruments.find(i => i.id === cb.value);
            if (inst) selectedInstruments.push(inst.prompt);
          });

          // プロンプト組み立て（V5形式: ジャンル, ムード, エネルギー, ボーカル, 楽器, BPM）
          const parts = [];
          if (genre) parts.push(genre.prompt);
          if (mood) parts.push(mood.prompt);
          if (energy) parts.push(energy.prompt);
          if (vocal) parts.push(vocal.prompt);
          if (selectedInstruments.length > 0) parts.push(selectedInstruments.join(', '));
          if (bpmPrompt) parts.push(bpmPrompt);
          parts.push('Japanese lyrics');

          currentPrompt = parts.join(', ');
          document.getElementById('promptBody').textContent = currentPrompt;
        }

        function copyPrompt() {
          if (!currentPrompt) {
            showStatus('プロンプトを生成してください', 'error', 'status');
            return;
          }
          copyToClipboard(currentPrompt);
        }

        function copyLyrics() {
          if (!currentLyrics) {
            showStatus('歌詞がありません', 'error', 'status');
            return;
          }
          copyToClipboard(currentLyrics);
        }

        function loadLyrics() {
          if (!selectedSheetName) return;
          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success && result.lyrics) {
                currentLyrics = result.lyrics;
                document.getElementById('lyricsBody').innerHTML = '<pre style="margin:0;white-space:pre-wrap;">' + escapeHtml(result.lyrics) + '</pre>';
              } else {
                document.getElementById('lyricsBody').innerHTML = '<span class="lyrics-empty">歌詞が保存されていません</span>';
                currentLyrics = '';
              }
            })
            .withFailureHandler(function(e) {
              document.getElementById('lyricsBody').innerHTML = '<span class="lyrics-empty">読み込みエラー</span>';
            })
            .pv_loadSavedLyrics(selectedSheetName);
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function savePrompt() {
          if (!selectedSheetName || !currentPrompt) return;
          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, 'SUNO_ボーカルプロンプト', currentPrompt);
        }

        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.company-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('companySelectDropdown').classList.remove('show');
            document.getElementById('companySelectDisplay').classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== 歌詞生成プロンプト =====
// ================================================================================

/**
 * 歌詞生成プロンプトダイアログを表示
 */
function pv_showLyricsPromptDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('歌詞生成プロンプト');

  const htmlContent = pv_createLyricsPromptDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(800)
    .setHeight(750);
  ui.showModalDialog(htmlOutput, '✏️ 歌詞生成プロンプト');
}

/**
 * 構成パターンを取得（ダイアログから呼び出し用）
 * @param {string} lengthType - 'short' または 'long'
 */
function pv_getLyricsStructures(lengthType) {
  const structures = lengthType === 'short' ? PV_LYRICS_STRUCTURES_SHORT : PV_LYRICS_STRUCTURES_LONG;
  return structures.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  }));
}

/**
 * 歌詞プロンプトを生成（ダイアログから呼び出し用）
 * @param {string} sheetName - シート名
 * @param {string} lengthType - 'short' または 'long'
 * @param {string} structureId - 構成パターンID
 */
function pv_generateLyricsPrompt(sheetName, lengthType, structureId) {
  const basicInfo = pv_getBasicInfoForDialog(sheetName);
  const extractedData = pv_getExtractedDataForDialog(sheetName);
  return pv_buildLyricsPrompt({ ...basicInfo, ...extractedData }, lengthType, structureId);
}

/**
 * 歌詞生成プロンプトを構築
 * @param {Object} data - 企業情報
 * @param {string} lengthType - 'short' または 'long'
 * @param {string} structureId - 構成パターンID
 */
function pv_buildLyricsPrompt(data, lengthType, structureId) {
  // 長さに応じた構成パターンを取得
  const structures = lengthType === 'short' ? PV_LYRICS_STRUCTURES_SHORT : PV_LYRICS_STRUCTURES_LONG;
  const structure = structures.find(s => s.id === structureId) || structures[0];
  const isShort = lengthType === 'short';
  const lengthLabel = isShort ? 'ショート（約1分）' : 'ロング（2-3分）';

  // ショート用の追加ガイダンス
  const shortGuidance = isShort ? `
## ⚡ ショート版の重要ポイント

**1分で心を動かす**ために、以下を意識してください：

1. **最初の10秒で掴む** - 冒頭から感情に訴えかける
2. **無駄な展開は削る** - 1つのメッセージに集中
3. **余韻より衝撃** - 聴き終わった後に残る「一言」を意識
4. **繰り返しを活かす** - 短いからこそ印象に残るフレーズを

**NG**: ロング版を短くしただけの歌詞
**OK**: 1分専用に設計された濃密な歌詞

---
` : '';

  return `# SUNO V5対応 エモーショナル歌詞生成プロンプト

## 楽曲の長さ: ${lengthLabel}

## 企業情報（インスピレーション用）
- 企業名: ${data.companyName || '（未設定）'}
- 業種: ${data.industry || '（未設定）'}
- コアメッセージ: ${data.coreMessage || '（未設定）'}
- PVの目的: ${data.purpose || '採用'}
- ターゲット: ${data.target || '若者・就活生'}
- トンマナ: ${data.tone || '熱い・情熱的'}

---
${shortGuidance}
## 歌詞スタイル指定

**ミスターチルドレン風のエモーショナルな歌詞**を作成してください。

### 歌詞作成のコツ（重要）

1. **抽象と具体のバランス**
   - 具体的な情景描写と抽象的な感情を混ぜる
   - 「朝焼けに溶けていく 昨日の不安」のように

2. **日常の普遍的な感情**
   - すれ違い、届かない想い、変わりゆく日常
   - 誰もが経験する小さな感情の機微

3. **比喩表現**
   - 感情を自然現象に例える（風、雨、空、季節）
   - 「心の中で雨が降る」「君という光」

4. **問いかけの技法**
   - 「君は覚えているかな」「あの日の僕らは何を見ていた」
   - リスナーに語りかける形式

5. **未完成の感情**
   - すべてを言い切らず、余韻を残す
   - 「...」や体言止めを効果的に使う

6. **時間の流れ**
   - 過去と現在を行き来する構成
   - 「あの頃」「いつか」「今」を対比

---

## 企業情報の扱い方（3つのルール）

1. **企業名は絶対に歌詞に入れない**
   - 「株式会社〇〇」「〇〇で働こう」は絶対NG

2. **抽象度を高くする**
   - 業種や仕事内容を直接書かず、その本質を詩的に表現
   - 説明的な言葉は使わない

3. **コアメッセージを踏襲する**
   - 企業のコアメッセージの「精神」を歌詞全体に反映させる
   - ただしコアメッセージをそのまま歌詞にするのではなく、感情として表現する

---

## 構成パターン: ${structure.name}

${structure.description}

### 構成テンプレート

\`\`\`
${structure.template}
\`\`\`

---

## SUNO V5メタタグ形式

必ず以下の形式でメタタグを付けてください：

### 構造タグ
- [Verse], [Verse2], [Verse3] - 歌い出し、展開
- [Pre-Chorus] - サビ前の高まり
- [Chorus], [Final Chorus] - サビ
- [Bridge] - 転換部
- [Intro], [Outro] - 導入・終結

### エネルギータグ
- [Energy: Low] - 静か、囁くような
- [Energy: Medium] - 通常
- [Energy: Building] - 徐々に高まる
- [Energy: High] - 力強い
- [Energy: Maximum] - 最高潮
- [Energy: Fading] - 消えゆく

### 効果タグ
- [Stacked Harmonies] - コーラス重ね
- [Breakdown] - 一旦静かに
- [Fade Out] - フェードアウト

---

## 言葉遣いの指定

### 使ってほしい表現
- シンプルだが詩的な日本語
- 「きっと」「ずっと」「たぶん」などの副詞
- カタカナ語を適度に（2-3箇所）
- 完結しすぎず、余韻を残す表現
- 体言止め「〜する日々」「〜という名の」

### 避けるべき表現
- 陳腐な恋愛表現（「君がいないと」「会いたい」）
- 説明的すぎる言葉（「努力して」「頑張って」）
- 直接的すぎる感情表現（「嬉しい」「悲しい」）
- 企業PRっぽい表現
- ありきたりな応援ソング的表現

---

## 出力形式

上記の構成テンプレートに従い、SUNO V5メタタグ付きの歌詞を出力してください。

\`\`\`
[セクションタグ]
[エネルギータグ]
歌詞1行目
歌詞2行目
...
\`\`\`

**重要**:
- タグは必ず角括弧 [ ] で囲み、各セクションの先頭に配置
- 歌詞は日本語で
- ${isShort ? '約1分（ショート）の歌詞を作成 - 濃密に、無駄なく' : '1曲分（約2-3分、ロング）の歌詞を作成'}
`;
}

function pv_createLyricsPromptDialogHtml(sheetData) {
  // ショート/ロング両方の構成パターンをJSON化
  const shortStructuresJson = JSON.stringify(PV_LYRICS_STRUCTURES_SHORT.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  })));
  const longStructuresJson = JSON.stringify(PV_LYRICS_STRUCTURES_LONG.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description
  })));
  const sheetDataJson = JSON.stringify(sheetData);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .length-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .length-btn {
          flex: 1; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 8px;
          cursor: pointer; text-align: center; transition: all 0.2s; background: white;
        }
        .length-btn:hover { border-color: #f59e0b; background: #fffbeb; }
        .length-btn.selected { border-color: #f59e0b; background: #fef3c7; }
        .length-btn.short.selected { border-color: #ec4899; background: #fdf2f8; }
        .length-btn-label { font-weight: bold; color: #333; font-size: 15px; }
        .length-btn-desc { color: #666; font-size: 12px; margin-top: 4px; }
        .length-btn-badge {
          display: inline-block; padding: 2px 8px; border-radius: 10px;
          font-size: 10px; font-weight: bold; margin-top: 6px;
        }
        .length-btn.short .length-btn-badge { background: #fce7f3; color: #be185d; }
        .length-btn.long .length-btn-badge { background: #dbeafe; color: #1d4ed8; }
        .structure-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
        .structure-option {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .structure-option:hover { border-color: #f59e0b; background: #fffbeb; }
        .structure-option.selected { border-color: #f59e0b; background: #fef3c7; }
        .structure-name { font-weight: bold; color: #333; font-size: 14px; margin-bottom: 4px; }
        .structure-desc { color: #666; font-size: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .info-item { background: #f5f5f5; padding: 8px 12px; border-radius: 6px; }
        .info-label { font-size: 11px; color: #666; margin-bottom: 2px; }
        .info-value { font-size: 13px; color: #333; font-weight: 500; }
        .prompt-result-body { max-height: 240px; overflow-y: auto; }
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>✏️ エモーショナル歌詞生成プロンプト</h3>
      <p class="subtitle">企業を選択し、歌詞生成プロンプトを作成</p>

      <!-- 企業選択 -->
      <div class="input-section">
        <span class="input-label">対象企業を選択</span>
        <div class="company-select-wrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業シートを選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
        <div class="company-info" id="companyInfo" style="display:none;"></div>
      </div>

      <div id="optionsSection" class="options-disabled">
        <div class="section-title">企業情報</div>
        <div class="info-grid" id="infoGrid">
          <div class="info-item"><div class="info-label">企業名</div><div class="info-value" id="infoCompany">-</div></div>
          <div class="info-item"><div class="info-label">業種</div><div class="info-value" id="infoIndustry">-</div></div>
          <div class="info-item"><div class="info-label">コアメッセージ</div><div class="info-value" id="infoCoreMessage">-</div></div>
          <div class="info-item"><div class="info-label">トンマナ</div><div class="info-value" id="infoTone">-</div></div>
        </div>

        <div class="section-title">楽曲の長さ</div>
        <div class="length-toggle">
          <div class="length-btn short selected" data-length="short" onclick="selectLength('short')">
            <div class="length-btn-label">⚡ ショート</div>
            <div class="length-btn-desc">約1分・インパクト重視</div>
            <div class="length-btn-badge">メイン</div>
          </div>
          <div class="length-btn long" data-length="long" onclick="selectLength('long')">
            <div class="length-btn-label">🎵 ロング</div>
            <div class="length-btn-desc">2-3分・フルサイズ</div>
            <div class="length-btn-badge">オプション</div>
          </div>
        </div>

        <div class="section-title">構成パターンを選択</div>
        <div class="structure-grid" id="structureGrid"></div>
      </div>

      <div class="prompt-result">
        <div class="prompt-result-header">
          <span class="prompt-result-title">歌詞生成プロンプト</span>
          <div class="prompt-result-actions">
            <button class="btn btn-copy" id="copyBtn" onclick="copyPrompt()" disabled>📋 コピー</button>
            <button class="btn btn-save" id="saveBtn" onclick="savePrompt()" disabled>💾 保存</button>
          </div>
        </div>
        <div class="prompt-result-body" id="promptBody">企業を選択するとプロンプトが生成されます</div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        const shortStructures = ${shortStructuresJson};
        const longStructures = ${longStructuresJson};
        let selectedSheetName = '';
        let selectedCompanyInfo = null;
        let currentPrompt = '';
        let currentLengthType = 'short';
        let currentStructureId = 'short_chorus_first';

        window.onload = function() {
          initCompanyDropdown();
          renderStructures('short');
        };

        function initCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          dropdown.innerHTML = '';

          if (!sheetData.companySheets || sheetData.companySheets.length === 0) {
            dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
            return;
          }

          sheetData.companySheets.forEach(item => {
            const div = document.createElement('div');
            div.className = 'company-select-item' + (item.isActive ? ' active' : '');
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
            div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
            div.onclick = function(e) {
              e.stopPropagation();
              selectCompany(item);
              toggleCompanyDropdown();
            };
            dropdown.appendChild(div);

            if (item.isActive) {
              selectCompany(item);
            }
          });
        }

        function toggleCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          const display = document.getElementById('companySelectDisplay');
          if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            display.classList.remove('active');
          } else {
            dropdown.classList.add('show');
            display.classList.add('active');
          }
        }

        function selectCompany(item) {
          selectedSheetName = item.sheetName;
          showStatus('データ読み込み中...', 'info', 'status');

          google.script.run
            .withSuccessHandler(function(info) {
              selectedCompanyInfo = info;
              google.script.run
                .withSuccessHandler(function(extractedInfo) {
                  if (extractedInfo) {
                    selectedCompanyInfo = { ...selectedCompanyInfo, ...extractedInfo };
                  }
                  updateCompanyDisplay(item);
                  enableOptions();
                  updatePrompt();
                  showStatus('', '', 'status');
                })
                .pv_getExtractedDataForDialog(item.sheetName);
            })
            .pv_getBasicInfoForDialog(item.sheetName);
        }

        function updateCompanyDisplay(item) {
          const display = document.getElementById('companySelectDisplay');
          display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';

          if (selectedCompanyInfo) {
            document.getElementById('infoCompany').textContent = selectedCompanyInfo.companyName || '（未設定）';
            document.getElementById('infoIndustry').textContent = selectedCompanyInfo.industry || '（未設定）';
            document.getElementById('infoCoreMessage').textContent = selectedCompanyInfo.coreMessage || '（未設定）';
            document.getElementById('infoTone').textContent = selectedCompanyInfo.tone || '（未設定）';

            const infoDiv = document.getElementById('companyInfo');
            infoDiv.innerHTML = '🏢 ' + escapeHtml(selectedCompanyInfo.companyName || item.sheetName) +
              (selectedCompanyInfo.industry ? ' / ' + escapeHtml(selectedCompanyInfo.industry) : '');
            infoDiv.style.display = 'block';
          }
        }

        function enableOptions() {
          document.getElementById('optionsSection').classList.remove('options-disabled');
          document.getElementById('copyBtn').disabled = false;
          document.getElementById('saveBtn').disabled = false;
        }

        function selectLength(lengthType) {
          document.querySelectorAll('.length-btn').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-length="' + lengthType + '"]').classList.add('selected');
          currentLengthType = lengthType;
          renderStructures(lengthType);
        }

        function renderStructures(lengthType) {
          const structures = lengthType === 'short' ? shortStructures : longStructures;
          const grid = document.getElementById('structureGrid');
          grid.innerHTML = '';

          structures.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'structure-option' + (i === 0 ? ' selected' : '');
            div.dataset.structureId = s.id;
            div.onclick = function() { selectStructure(s.id); };
            div.innerHTML = '<div class="structure-name">' + escapeHtml(s.name) + '</div>' +
                            '<div class="structure-desc">' + escapeHtml(s.description) + '</div>';
            grid.appendChild(div);
          });

          currentStructureId = structures[0].id;
          if (selectedSheetName) {
            updatePrompt();
          }
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function selectStructure(structureId) {
          document.querySelectorAll('.structure-option').forEach(el => el.classList.remove('selected'));
          document.querySelector('[data-structure-id="' + structureId + '"]').classList.add('selected');
          currentStructureId = structureId;
          updatePrompt();
        }

        function updatePrompt() {
          if (!selectedSheetName) return;
          showStatus('プロンプト生成中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(newPrompt) {
              currentPrompt = newPrompt;
              document.getElementById('promptBody').textContent = newPrompt;
              showStatus('', '', 'status');
            })
            .withFailureHandler(function(e) {
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_generateLyricsPrompt(selectedSheetName, currentLengthType, currentStructureId);
        }

        function copyPrompt() {
          if (!currentPrompt) return;
          copyToClipboard(currentPrompt);
        }

        function savePrompt() {
          if (!selectedSheetName || !currentPrompt) return;
          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, '歌詞生成プロンプト', currentPrompt);
        }

        // ドロップダウン外クリックで閉じる
        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.company-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('companySelectDropdown').classList.remove('show');
            document.getElementById('companySelectDisplay').classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== 歌詞パース =====
// ================================================================================

/**
 * 歌詞パースダイアログを表示
 */
function pv_showLyricsParseDialog() {
  const ui = SpreadsheetApp.getUi();
  const sheetData = pv_getCompanySheetListWithData('生成歌詞');

  const htmlContent = pv_createLyricsParseDialogHtml(sheetData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(650)
    .setHeight(500);
  ui.showModalDialog(htmlOutput, '📥 歌詞を貼り付け・保存');
}

function pv_createLyricsParseDialogHtml(sheetData) {
  const sheetDataJson = JSON.stringify(sheetData);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .options-disabled { opacity: 0.5; pointer-events: none; }
      </style>
    </head>
    <body>
      <h3>📥 歌詞を貼り付け・保存</h3>
      <p class="subtitle">AIが生成した歌詞を保存</p>

      <!-- 企業選択 -->
      <div class="input-section">
        <span class="input-label">対象企業を選択</span>
        <div class="company-select-wrapper">
          <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
            <span class="placeholder">企業シートを選択してください</span>
          </div>
          <div class="company-select-dropdown" id="companySelectDropdown"></div>
        </div>
      </div>

      <div id="optionsSection" class="options-disabled">
        <div class="input-section">
          <label class="input-label">生成された歌詞を貼り付け</label>
          <textarea id="lyricsInput" placeholder="[Verse]
夢見ていた未来へ
一歩ずつ歩いてく
..."></textarea>
        </div>

        <div class="actions">
          <button class="btn btn-save" id="saveBtn" onclick="saveLyrics()">💾 保存</button>
        </div>
      </div>

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const sheetData = ${sheetDataJson};
        let selectedSheetName = '';

        window.onload = function() {
          initCompanyDropdown();
        };

        function initCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          dropdown.innerHTML = '';
          if (!sheetData.companySheets || sheetData.companySheets.length === 0) {
            dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
            return;
          }
          sheetData.companySheets.forEach(item => {
            const div = document.createElement('div');
            div.className = 'company-select-item' + (item.isActive ? ' active' : '');
            const savedBadge = item.hasSavedData ? '<span class="badge-saved">保存済</span>' : '';
            div.innerHTML = '<span class="company-name">' + escapeHtml(item.sheetName) + '</span>' + savedBadge;
            div.onclick = function(e) {
              e.stopPropagation();
              selectCompany(item);
              toggleCompanyDropdown();
            };
            dropdown.appendChild(div);
            if (item.isActive) selectCompany(item);
          });
        }

        function toggleCompanyDropdown() {
          const dropdown = document.getElementById('companySelectDropdown');
          const display = document.getElementById('companySelectDisplay');
          dropdown.classList.toggle('show');
          display.classList.toggle('active');
        }

        function selectCompany(item) {
          selectedSheetName = item.sheetName;
          document.getElementById('companySelectDisplay').innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(item.sheetName) + '</span>';
          document.getElementById('optionsSection').classList.remove('options-disabled');
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function saveLyrics() {
          if (!selectedSheetName) return;
          const lyrics = document.getElementById('lyricsInput').value.trim();
          if (!lyrics) {
            showStatus('歌詞を入力してください', 'error', 'status');
            return;
          }

          setAllButtonsDisabled(true);
          showStatus('保存中...', 'info', 'status');
          google.script.run
            .withSuccessHandler(function(result) {
              setAllButtonsDisabled(false);
              if (result.success) {
                showStatus('✅ 保存しました', 'success', 'status');
              } else {
                showStatus('❌ ' + result.error, 'error', 'status');
              }
            })
            .withFailureHandler(function(e) {
              setAllButtonsDisabled(false);
              showStatus('エラー: ' + e.message, 'error', 'status');
            })
            .pv_saveAudioPrompt(selectedSheetName, '生成歌詞', lyrics);
        }

        document.addEventListener('click', function(e) {
          const wrapper = document.querySelector('.company-select-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('companySelectDropdown').classList.remove('show');
            document.getElementById('companySelectDisplay').classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== ナレーション出力 =====
// ================================================================================

/**
 * ナレーションテキスト出力ダイアログを表示
 */
function pv_showNarrationOutputDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  // シーンからナレーションを収集（12シーン対応）
  const scenes = pv_getAllScenesFromSheet(sheetName);
  const narrations = [];

  scenes.forEach((scene, index) => {
    if (scene && scene.narration) {
      narrations.push({
        scene: index + 1,
        name: scene.name || `シーン${index + 1}`,
        text: scene.narration
      });
    }
  });

  const htmlContent = pv_createNarrationDialogHtml(sheetName, narrations);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(500);
  ui.showModalDialog(htmlOutput, '🗣️ ナレーションテキスト出力');
}

function pv_createNarrationDialogHtml(sheetName, narrations) {
  let narrationList = '';
  narrations.forEach((n, i) => {
    narrationList += `
      <div class="card">
        <div class="card-header">シーン${n.scene}（${pv_escapeHtml(n.name)}）</div>
        <div class="card-body">
          <textarea id="narration${i}" style="width:100%;height:60px;">${pv_escapeHtml(n.text)}</textarea>
          <button class="btn btn-copy" onclick="copyNarration(${i})" style="margin-top:8px;">📋 コピー</button>
        </div>
      </div>
    `;
  });

  if (narrations.length === 0) {
    narrationList = '<p style="color:#666;">ナレーションが設定されているシーンがありません。<br>台本パースでシーンを読み込むか、シーン編集でナレーションを追加してください。</p>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .card { border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
        .card-header { background: #f5f5f5; padding: 8px 12px; font-weight: bold; color: #333; font-size: 13px; }
        .card-body { padding: 12px; }
      </style>
    </head>
    <body>
      <h3>🗣️ ナレーションテキスト出力</h3>
      <p class="subtitle">FISH AUDIO用のナレーションテキスト（12シーン対応）</p>

      ${narrationList}

      <div id="status" class="status"></div>

      <div class="footer">
        <button class="btn btn-primary" onclick="copyAllNarrations()" ${narrations.length === 0 ? 'disabled' : ''}>📋 全てコピー</button>
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      ${PV_UI_COMPONENTS}
      <script>
        const narrationCount = ${narrations.length};

        function copyNarration(index) {
          const text = document.getElementById('narration' + index).value;
          copyToClipboard(text);
        }

        function copyAllNarrations() {
          let allText = '';
          for (let i = 0; i < narrationCount; i++) {
            const text = document.getElementById('narration' + i).value;
            if (text) {
              allText += text + '\\n\\n';
            }
          }
          copyToClipboard(allText.trim());
        }
      </script>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== 共通保存関数 =====
// ================================================================================

/**
 * 音声プロンプトをシートに保存
 */
function pv_saveAudioPrompt(sheetName, fieldName, content) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    pv_setCellValueByLabel(sheet, fieldName, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 保存済み歌詞を読み込む
 */
function pv_loadSavedLyrics(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'シートが見つかりません' };

    const lyrics = pv_getCellValueByLabel(sheet, '生成歌詞');
    return { success: true, lyrics: lyrics || '' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
