/**
 * アニメPV制作 - シート作成・管理
 *
 * シンプルなシート構造（手入力は最小限）
 * - Part① 基本情報（企業名、業種、目的、ターゲット、トンマナ）
 * - Part② AI抽出データ
 * - Part③ キャラクター設定（2人）
 * - Part④ シーン構成（12シーン + エンディング）
 * - Part⑤ 音声プロンプト
 */

// ===== 定数 =====
const PV_COLORS = {
  HEADER: '#7c3aed',
  HEADER_TEXT: '#FFFFFF',
  INPUT: '#faf5ff',
  SYSTEM: '#f1f5f9',
  LABEL: '#f8fafc',
  SECTION: '#ede9fe',
  BORDER: '#e2e8f0'
};

// ================================================================================
// ===== 新規シート作成 =====
// ================================================================================

// ===== ドロップダウン選択肢 =====
const PV_DROPDOWN_OPTIONS = {
  industry: [
    '製造業（機械・金属）',
    '製造業（食品・医薬品）',
    '製造業（精密機器）',
    '建設・土木',
    'IT・ソフトウェア',
    '物流・運輸',
    '小売・サービス',
    '医療・福祉',
    '教育',
    '金融・保険',
    'その他'
  ],
  // 目的（ゴール）: PVで何を達成したいか
  goal: [
    'ブランディング（認知・イメージ向上）',
    '応募・受注獲得（行動を促す）',
    '理解促進（何をしている会社か伝える）',
    'インナーブランディング（社員の帰属意識向上）',
    'その他'
  ],
  // 用途: どんなPVを作るか
  usage: [
    '新卒採用PV',
    '高卒採用PV',
    '中途採用PV',
    '会社紹介PV',
    'サービス紹介PV',
    '展示会・イベント用',
    'その他'
  ],
  target: [
    '大卒学生',
    '高卒学生',
    '中途転職者',
    '顧客・取引先',
    '新入社員',
    '既存社員',
    '一般消費者',
    'その他'
  ],
  tone: [
    '知的・誠実',
    '情熱的・熱い',
    '明るい・ポップ',
    '落ち着いた・上品',
    'クール・スタイリッシュ',
    '温かみ・親しみやすい',
    'その他'
  ]
};

/**
 * 新規ヒアリングシート作成（HTMLダイアログ）
 */
function pv_createNewSheet() {
  const html = HtmlService.createHtmlOutput(pv_getNewSheetDialogHtml())
    .setWidth(520)
    .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, '🆕 新規ヒアリングシート作成');
}

/**
 * 新規シート作成ダイアログのHTML
 */
function pv_getNewSheetDialogHtml() {
  const industryOptions = PV_DROPDOWN_OPTIONS.industry.map(opt =>
    `<option value="${opt}">${opt}</option>`
  ).join('');
  const goalOptions = PV_DROPDOWN_OPTIONS.goal.map(opt =>
    `<option value="${opt}">${opt}</option>`
  ).join('');
  const usageOptions = PV_DROPDOWN_OPTIONS.usage.map(opt =>
    `<option value="${opt}">${opt}</option>`
  ).join('');
  const targetOptions = PV_DROPDOWN_OPTIONS.target.map(opt =>
    `<option value="${opt}">${opt}</option>`
  ).join('');
  const toneOptions = PV_DROPDOWN_OPTIONS.tone.map(opt =>
    `<option value="${opt}">${opt}</option>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
${ANIME_PV_DIALOG_STYLES}
<style>
  .required { color: #dc2626; }
  .custom-input {
    display: none;
    margin-top: 8px;
  }
  .custom-input.show { display: block; }
  .field-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .field-row .form-group { flex: 1; margin-bottom: 0; }
</style>
</head>
<body>
  <h3>新規シートを作成</h3>
  <p class="description">企業のヒアリングシートを新規作成します。</p>

  <div class="form-group">
    <label>企業名 <span class="required">*</span></label>
    <input type="text" id="companyName" placeholder="例：サンプル精密工業株式会社">
  </div>

  <div class="form-group">
    <label>業種 <span class="required">*</span></label>
    <select id="industry" onchange="toggleCustomInput('industry')">
      <option value="">選択してください</option>
      ${industryOptions}
    </select>
    <input type="text" id="industryCustom" class="custom-input" placeholder="業種を入力">
  </div>

  <div class="form-group">
    <label>目的 <span style="color: #888; font-weight: normal;">(任意)</span></label>
    <select id="goal" onchange="toggleCustomInput('goal')">
      <option value="">選択してください</option>
      ${goalOptions}
    </select>
    <input type="text" id="goalCustom" class="custom-input" placeholder="目的を入力">
  </div>

  <div class="form-group">
    <label>用途 <span style="color: #888; font-weight: normal;">(任意)</span></label>
    <select id="usage" onchange="toggleCustomInput('usage')">
      <option value="">選択してください</option>
      ${usageOptions}
    </select>
    <input type="text" id="usageCustom" class="custom-input" placeholder="用途を入力">
  </div>

  <div class="form-group">
    <label>ターゲット <span style="color: #888; font-weight: normal;">(任意)</span></label>
    <select id="target" onchange="toggleCustomInput('target')">
      <option value="">選択してください</option>
      ${targetOptions}
    </select>
    <input type="text" id="targetCustom" class="custom-input" placeholder="ターゲットを入力">
  </div>

  <div class="form-group">
    <label>トンマナ <span style="color: #888; font-weight: normal;">(任意)</span></label>
    <select id="tone" onchange="toggleCustomInput('tone')">
      <option value="">選択してください</option>
      ${toneOptions}
    </select>
    <input type="text" id="toneCustom" class="custom-input" placeholder="トンマナを入力">
  </div>

  <div id="status" class="status"></div>

  <div class="footer">
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
    <button class="btn btn-primary" id="createBtn" onclick="createSheet()">作成</button>
  </div>

${ANIME_PV_UI_COMPONENTS}
<script>
function toggleCustomInput(fieldId) {
  const select = document.getElementById(fieldId);
  const customInput = document.getElementById(fieldId + 'Custom');
  if (select.value === 'その他') {
    customInput.classList.add('show');
    customInput.focus();
  } else {
    customInput.classList.remove('show');
    customInput.value = '';
  }
}

function getFieldValue(fieldId) {
  const select = document.getElementById(fieldId);
  const customInput = document.getElementById(fieldId + 'Custom');
  if (select.value === 'その他' && customInput.value.trim()) {
    return customInput.value.trim();
  }
  return select.value;
}

function createSheet() {
  const companyName = document.getElementById('companyName').value.trim();
  const industry = getFieldValue('industry');
  const goal = getFieldValue('goal');
  const usage = getFieldValue('usage');
  const target = getFieldValue('target');
  const tone = getFieldValue('tone');

  // バリデーション
  if (!companyName) {
    showStatus('企業名を入力してください。', 'error');
    return;
  }
  if (!industry) {
    showStatus('業種を選択してください。', 'error');
    return;
  }

  document.getElementById('createBtn').disabled = true;
  showStatus('作成中...', 'info');

  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        showStatus('✅ ' + result.message, 'success');
        setTimeout(function() {
          google.script.host.close();
        }, 1500);
      } else {
        showStatus('❌ ' + result.error, 'error');
        document.getElementById('createBtn').disabled = false;
      }
    })
    .withFailureHandler(function(error) {
      showStatus('❌ エラー: ' + error.message, 'error');
      document.getElementById('createBtn').disabled = false;
    })
    .pv_createNewSheetWithData({
      companyName: companyName,
      industry: industry,
      goal: goal,
      usage: usage,
      target: target,
      tone: tone
    });
}
<\/script>
</body>
</html>
  `;
}

/**
 * データ付きで新規シートを作成
 */
function pv_createNewSheetWithData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 重複チェック
  if (ss.getSheetByName(data.companyName)) {
    return { success: false, error: `「${data.companyName}」は既に存在します。` };
  }

  try {
    const sheet = ss.insertSheet(data.companyName);
    pv_setupSheetStructure(sheet, data.companyName);

    // 追加フィールドを保存
    if (data.industry) pv_setCellValueByLabel(sheet, '業種', data.industry);
    if (data.goal) pv_setCellValueByLabel(sheet, '目的', data.goal);
    if (data.usage) pv_setCellValueByLabel(sheet, '用途', data.usage);
    if (data.target) pv_setCellValueByLabel(sheet, 'ターゲット', data.target);
    if (data.tone) pv_setCellValueByLabel(sheet, 'トンマナ', data.tone);

    ss.setActiveSheet(sheet);
    return { success: true, message: `「${data.companyName}」シートを作成しました。` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * シート構造をセットアップ
 */
function pv_setupSheetStructure(sheet, companyName) {
  // 列幅設定
  sheet.setColumnWidth(1, 230);
  sheet.setColumnWidth(2, 950);

  let row = 1;

  // ===== タイトル =====
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue('アニメPV制作 ヒアリングシート')
    .setBackground(PV_COLORS.HEADER)
    .setFontColor(PV_COLORS.HEADER_TEXT)
    .setFontSize(14)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(row, 35);
  row++;

  // ===== Part① 基本情報（手入力） =====
  row = pv_addSectionHeader(sheet, row, 'Part① 基本情報');
  row = pv_addInputRow(sheet, row, '企業名', companyName);
  row = pv_addInputRow(sheet, row, '業種');
  row = pv_addInputRow(sheet, row, '目的', '', '例: ブランディング、応募・受注獲得、理解促進、インナーブランディング');
  row = pv_addInputRow(sheet, row, '用途', '', '例: 新卒採用PV、高卒採用PV、中途採用PV、会社紹介PV');
  row = pv_addInputRow(sheet, row, 'ターゲット', '', '例: 大卒学生、高卒学生、中途転職者、顧客・取引先、新入社員、既存社員');
  row = pv_addInputRow(sheet, row, 'トンマナ', '', '例: 熱い・情熱的、明るい・ポップ、落ち着いた・知的');
  row++;

  // ===== Part② AI抽出データ =====
  row = pv_addSectionHeader(sheet, row, 'Part② AI抽出データ');
  row = pv_addSystemRow(sheet, row, '文字起こし原文', 5);
  row = pv_addSystemRow(sheet, row, 'コアメッセージ');
  row = pv_addSystemRow(sheet, row, 'ストーリーアイデア', 3);
  row = pv_addSystemRow(sheet, row, '安全装備');
  row = pv_addSystemRow(sheet, row, 'NG要素');
  row = pv_addSystemRow(sheet, row, '舞台・世界観');
  row = pv_addSystemRow(sheet, row, '音声設定');
  row = pv_addSystemRow(sheet, row, 'ヒアリング抽出JSON', 5);
  row++;

  // ===== Part③ キャラクター設定 =====
  row = pv_addSectionHeader(sheet, row, 'Part③ キャラクター設定');

  for (let i = 1; i <= PV_CHARACTER_COUNT; i++) {
    row = pv_addSubHeader(sheet, row, `キャラクター${i}`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_名前`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_性別`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_現在編年齢`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_過去編年齢`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_髪型髪色`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_目の特徴`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_体格`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_過去編服装`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_現在編服装`);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_シートプロンプト過去編`, 3);
    row = pv_addSystemRow(sheet, row, `キャラクター${i}_シートプロンプト現在編`, 3);
    row++;
  }

  // ===== Part④ シーン構成（12シーン + エンディング） =====
  row = pv_addSectionHeader(sheet, row, 'Part④ シーン構成');

  // シーン1〜12
  for (let i = 1; i <= PV_SCENE_COUNT; i++) {
    row = pv_addSubHeader(sheet, row, `シーン${i}`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_名前`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_時間帯`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_場所`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_登場キャラ`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_演出動き`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_ムード`);
    row = pv_addSystemRow(sheet, row, `シーン${i}_ナレーション`, 2);
    row = pv_addSystemRow(sheet, row, `シーン${i}_動画プロンプト`, 4);
    row = pv_addSystemRow(sheet, row, `シーン${i}_開始フレームプロンプト`, 3);
    row++;
  }

  // エンディング
  row = pv_addSubHeader(sheet, row, 'エンディング');
  row = pv_addSystemRow(sheet, row, 'エンディング_タイプ', 1, 'オブジェクト→ロゴ変形 / ロゴアニメーション');
  row = pv_addSystemRow(sheet, row, 'エンディング_変形元', 1, '桜の花びら、工具、歯車など');
  row = pv_addSystemRow(sheet, row, 'エンディング_アニメーション', 1, 'フェードイン、パーティクル集合など');
  row = pv_addSystemRow(sheet, row, 'エンディング_最終テキスト');
  row = pv_addSystemRow(sheet, row, 'エンディング_動画プロンプト', 4);
  row++;

  // ===== エフェクトシーン（アクセントシーン） =====
  row = pv_addSectionHeader(sheet, row, 'エフェクトシーン');

  for (let i = 1; i <= PV_EFFECT_COUNT; i++) {
    row = pv_addSubHeader(sheet, row, `演出${i}`);
    row = pv_addSystemRow(sheet, row, `演出${i}_名前`);
    row = pv_addSystemRow(sheet, row, `演出${i}_テンプレート`);
    row = pv_addSystemRow(sheet, row, `演出${i}_人物アクション`);
    row = pv_addSystemRow(sheet, row, `演出${i}_効果`);
    row = pv_addSystemRow(sheet, row, `演出${i}_動画プロンプト`, 4);
    row = pv_addSystemRow(sheet, row, `演出${i}_開始フレームプロンプト`, 3);
    row = pv_addSystemRow(sheet, row, `演出${i}_終了フレームプロンプト`, 3);
    row++;
  }

  // ===== Part⑤ 音声プロンプト =====
  row = pv_addSectionHeader(sheet, row, 'Part⑤ 音声プロンプト');
  row = pv_addSystemRow(sheet, row, 'SUNO_BGMプロンプト', 3);
  row = pv_addSystemRow(sheet, row, 'SUNO_ボーカルプロンプト', 3);
  row = pv_addSystemRow(sheet, row, '歌詞生成プロンプト', 3);
  row = pv_addSystemRow(sheet, row, '生成歌詞', 5);

  // Fish Audio設定
  row = pv_addSubHeader(sheet, row, 'Fish Audio設定');
  row = pv_addSystemRow(sheet, row, 'FishAudio_ボイスID');
  row = pv_addSystemRow(sheet, row, 'FishAudio_ボイス名');
  row = pv_addSystemRow(sheet, row, 'FishAudio_Temperature');
  row = pv_addSystemRow(sheet, row, 'FishAudio_TopP');
  row = pv_addSystemRow(sheet, row, 'FishAudio_Speed');
  row = pv_addSystemRow(sheet, row, 'FishAudio_Volume');
  row++;

  // ===== Part⑥ 処理データ =====
  row = pv_addSectionHeader(sheet, row, 'Part⑥ 処理データ');
  row = pv_addSystemRow(sheet, row, '企業フォルダURL');
  row = pv_addSystemRow(sheet, row, '選択スタイル');
  row = pv_addSystemRow(sheet, row, '選択ストーリーパターン');
  row = pv_addSystemRow(sheet, row, '台本JSON', 10);

  // 罫線
  sheet.getRange(1, 1, row, 2).setBorder(
    true, true, true, true, true, true,
    PV_COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID
  );
}

// ================================================================================
// ===== ヘルパー関数 =====
// ================================================================================

function pv_addSectionHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue(title)
    .setBackground(PV_COLORS.HEADER)
    .setFontColor(PV_COLORS.HEADER_TEXT)
    .setFontSize(11)
    .setFontWeight('bold');
  sheet.setRowHeight(row, 28);
  return row + 1;
}

function pv_addSubHeader(sheet, row, title) {
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue('▼ ' + title)
    .setBackground(PV_COLORS.SECTION)
    .setFontColor('#6d28d9')
    .setFontSize(10)
    .setFontWeight('bold');
  sheet.setRowHeight(row, 24);
  return row + 1;
}

function pv_addInputRow(sheet, row, label, value, note) {
  sheet.getRange(row, 1)
    .setValue(label)
    .setBackground(PV_COLORS.LABEL)
    .setFontWeight('bold');
  sheet.getRange(row, 2)
    .setValue(value || '')
    .setBackground(PV_COLORS.INPUT);
  if (note) sheet.getRange(row, 2).setNote(note);
  return row + 1;
}

function pv_addSystemRow(sheet, row, label, height, note) {
  height = height || 1;
  if (height > 1) {
    sheet.getRange(row, 1, height, 1).merge();
    sheet.getRange(row, 2, height, 1).merge();
  }
  sheet.getRange(row, 1)
    .setValue(label)
    .setBackground('#e2e8f0')
    .setFontWeight('bold')
    .setFontColor('#475569')
    .setVerticalAlignment('top');
  sheet.getRange(row, 2)
    .setBackground(PV_COLORS.SYSTEM)
    .setFontColor('#475569')
    .setVerticalAlignment('top')
    .setWrap(true);
  if (note) sheet.getRange(row, 2).setNote(note);
  return row + height;
}

// ================================================================================
// ===== データ保存・読み込み =====
// ================================================================================

/**
 * シートにデータを保存
 * @param {string} sheetName - シート名
 * @param {string} label - ラベル名
 * @param {string} value - 値
 * @param {boolean} checkExisting - 既存値チェック
 */
function pv_saveToSheet(sheetName, label, value, checkExisting) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  return pv_setCellValueByLabelWithCheck(sheet, label, value, checkExisting);
}

/**
 * シートにデータを強制保存
 */
function pv_saveToSheetForce(sheetName, label, value) {
  return pv_saveToSheet(sheetName, label, value, false);
}

/**
 * シートからデータを読み込み
 */
function pv_loadFromSheet(sheetName, label) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  const value = pv_getCellValueByLabel(sheet, label);
  return { success: true, value: value };
}

/**
 * 企業シート一覧を取得（保存済みデータ付き）
 */
function pv_getCompanySheetListWithData(dataKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const allSheets = ss.getSheets();
  const companySheets = [];

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (pv_isCompanySheet(sheetName)) {
      const companyName = pv_getCompanyNameFromSheet(sheet);

      let savedData = '';
      if (dataKey) {
        savedData = pv_getCellValueByLabel(sheet, dataKey) || '';
      }

      companySheets.push({
        sheetName: sheetName,
        companyName: companyName || sheetName,
        savedData: savedData,
        hasSavedData: !!savedData,
        isActive: sheetName === activeSheetName
      });
    }
  });

  return {
    activeSheetName: activeSheetName,
    isActiveCompanySheet: pv_isCompanySheet(activeSheetName),
    companySheets: companySheets
  };
}

/**
 * シートから全キャラクターデータを取得
 */
function pv_getAllCharactersFromSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const characters = [];
  for (let i = 1; i <= PV_CHARACTER_COUNT; i++) {
    characters.push(pv_getCharacterDataFromSheet(sheet, i));
  }
  return characters;
}

/**
 * シートから全シーンデータを取得
 */
function pv_getAllScenesFromSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const scenes = [];
  for (let i = 1; i <= PV_SCENE_COUNT; i++) {
    scenes.push(pv_getSceneDataFromSheet(sheet, i));
  }
  return scenes;
}

/**
 * シートにキャラクターデータを保存
 */
function pv_saveCharacterToSheet(sheetName, charNum, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const prefix = `キャラクター${charNum}_`;
  const fields = {
    '名前': data.name,
    '性別': data.gender,
    '現在編年齢': data.currentAge,
    '過去編年齢': data.pastAge,
    '髪型髪色': data.hair,
    '目の特徴': data.eyes,
    '体格': data.build,
    '過去編服装': data.pastOutfit,
    '現在編服装': data.currentOutfit
  };

  for (const [field, value] of Object.entries(fields)) {
    if (value !== undefined) {
      pv_setCellValueByLabel(sheet, prefix + field, value);
    }
  }

  return { success: true };
}

/**
 * シートにシーンデータを保存
 */
function pv_saveSceneToSheet(sheetName, sceneNum, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const prefix = `シーン${sceneNum}_`;
  const fields = {
    '名前': data.name,
    '時間帯': data.phase,
    '場所': data.location,
    '登場キャラ': data.characters,
    '演出動き': data.action,
    'ムード': data.mood,
    'ナレーション': data.narration,
    '動画プロンプト': data.videoPrompt,
    '開始フレームプロンプト': data.startFramePrompt
  };

  for (const [field, value] of Object.entries(fields)) {
    if (value !== undefined) {
      pv_setCellValueByLabel(sheet, prefix + field, value);
    }
  }

  return { success: true };
}

/**
 * シートにエンディングデータを保存
 */
function pv_saveEndingToSheet(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const fields = {
    'エンディング_タイプ': data.type,
    'エンディング_変形元': data.sourceObject,
    'エンディング_アニメーション': data.animationType,
    'エンディング_最終テキスト': data.finalText,
    'エンディング_動画プロンプト': data.videoPrompt
  };

  for (const [label, value] of Object.entries(fields)) {
    if (value !== undefined) {
      pv_setCellValueByLabel(sheet, label, value);
    }
  }

  return { success: true };
}

/**
 * シートからエフェクトシーンデータを取得
 */
function pv_getEffectSceneDataFromSheet(sheet, effectNum) {
  const prefix = `演出${effectNum}_`;
  return {
    name: pv_getCellValueByLabel(sheet, prefix + '名前'),
    template: pv_getCellValueByLabel(sheet, prefix + 'テンプレート'),
    action: pv_getCellValueByLabel(sheet, prefix + '人物アクション'),
    effect: pv_getCellValueByLabel(sheet, prefix + '効果'),
    videoPrompt: pv_getCellValueByLabel(sheet, prefix + '動画プロンプト'),
    startFramePrompt: pv_getCellValueByLabel(sheet, prefix + '開始フレームプロンプト'),
    endFramePrompt: pv_getCellValueByLabel(sheet, prefix + '終了フレームプロンプト')
  };
}

/**
 * シートから全エフェクトシーンデータを取得
 */
function pv_getAllEffectScenesFromSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const effectScenes = [];
  for (let i = 1; i <= PV_EFFECT_COUNT; i++) {
    effectScenes.push(pv_getEffectSceneDataFromSheet(sheet, i));
  }
  return effectScenes;
}

/**
 * シートにエフェクトシーンデータを保存
 */
function pv_saveEffectSceneToSheet(sheetName, effectNum, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const prefix = `演出${effectNum}_`;
  const fields = {
    '名前': data.name,
    'テンプレート': data.template,
    '人物アクション': data.action,
    '効果': data.effect,
    '動画プロンプト': data.videoPrompt,
    '開始フレームプロンプト': data.startFramePrompt,
    '終了フレームプロンプト': data.endFramePrompt
  };

  for (const [field, value] of Object.entries(fields)) {
    if (value !== undefined) {
      pv_setCellValueByLabel(sheet, prefix + field, value);
    }
  }

  return { success: true };
}

/**
 * 台本JSONをパースしてシートに保存
 */
function pv_parseAndSaveScript(sheetName, jsonData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  try {
    // スタイルベースプロンプトを取得
    const selectedStyle = pv_getCellValueByLabel(sheet, '選択スタイル');
    const stylePattern = pv_getStylePatternByName(selectedStyle) || pv_getStylePatterns()[0];
    const basePrompt = stylePattern.videoBasePrompt;

    // キャラクター設定を保存
    if (jsonData.characters) {
      jsonData.characters.forEach((char, index) => {
        const charNum = index + 1;
        if (charNum <= PV_CHARACTER_COUNT) {
          pv_saveCharacterToSheet(sheetName, charNum, {
            name: char.name,
            gender: char.gender,
            currentAge: char.currentAge,
            pastAge: char.pastAge,
            hair: char.hair,
            eyes: char.eyes,
            build: char.build,
            pastOutfit: char.pastOutfit,
            currentOutfit: char.currentOutfit
          });
        }
      });
    }

    // シーン構成を保存
    if (jsonData.scenes) {
      jsonData.scenes.forEach((scene, index) => {
        const sceneNum = index + 1;
        if (sceneNum <= PV_SCENE_COUNT) {
          // 動画プロンプト = ベース + シーン固有
          const videoPrompt = scene.videoPrompt
            ? `${basePrompt}. ${scene.videoPrompt}`
            : basePrompt;

          // 開始フレームプロンプト = ベース + シーン固有 + テキスト不要指示
          const startFramePrompt = scene.startFrame
            ? `${basePrompt}. ${scene.startFrame}, no text, no logos, no signs, no watermarks`
            : '';

          pv_saveSceneToSheet(sheetName, sceneNum, {
            name: scene.name,
            phase: scene.phase,
            location: scene.location,
            characters: scene.characters,
            action: scene.action,
            mood: scene.mood,
            narration: scene.narration,
            startFramePrompt: startFramePrompt,
            videoPrompt: videoPrompt
          });
        }
      });
    }

    // エンディングを保存
    if (jsonData.ending) {
      const endingVideoPrompt = jsonData.ending.videoPrompt
        ? `${basePrompt}. ${jsonData.ending.videoPrompt}`
        : basePrompt;

      pv_saveEndingToSheet(sheetName, {
        type: jsonData.ending.type,
        sourceObject: jsonData.ending.sourceObject,
        animationType: jsonData.ending.animationType,
        finalText: jsonData.ending.finalText,
        videoPrompt: endingVideoPrompt
      });
    }

    // 台本JSONも保存
    pv_setCellValueByLabel(sheet, '台本JSON', JSON.stringify(jsonData, null, 2));

    return { success: true, message: 'パース完了' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
