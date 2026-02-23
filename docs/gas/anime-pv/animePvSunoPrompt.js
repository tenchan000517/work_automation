/**
 * アニメPV制作 - SUNO音楽生成プロンプト v2.0
 *
 * SUNO BGM/歌詞付き楽曲プロンプトダイアログ
 * 12シーン対応
 *
 * 外部依存:
 * - PV_DIALOG_STYLES, PV_UI_COMPONENTS (animePvCommonStyles.js)
 * - pv_getCompanySheetListWithData() (animePvSheetManager.js)
 * - pv_saveAudioPrompt(), pv_loadSavedLyrics() (animePvLyricsPrompt.js)
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
