/**
 * 構成案作成 GAS
 *
 * 【機能】
 * 1. ヒアリングシート（Part①+Part②）から情報を取得
 * 2. プロンプトと組み合わせて「完成版プロンプト」を生成
 * 3. AIに投げて構成案を取得
 *
 * 【使用方法】
 * hearingSheetManager.jsと同じスプレッドシートに追加
 * onOpen()に addCompositionMenu(ui); を追加
 */

// ===== ヒアリングシート → 構成案用 マッピング =====
// Part① 基本情報（フォーム入力済み部分）
// ※2-3行目にステータス欄があるため、既存データは+1行ずれている
const PART1_MAPPING = {
  '企業名': { row: 6, col: 3 },
  '代表者名': { row: 7, col: 3 },
  'HP_URL': { row: 8, col: 3 },
  '住所': { row: 9, col: 3 },
  '電話番号': { row: 10, col: 3 },
  'メールアドレス': { row: 11, col: 3 },
  '許可番号': { row: 12, col: 3 },
  '設立日': { row: 13, col: 3 },
  '担当者名': { row: 14, col: 3 },
  '事業内容': { row: 15, col: 3 },
  '転勤_有無': { row: 16, col: 3 },
  '転勤_転勤先': { row: 16, col: 5 },

  // 雇用形態・職種
  '雇用形態': { row: 19, col: 3 },
  '試用期間_有無': { row: 20, col: 3 },
  '試用期間_期間': { row: 20, col: 5 },
  '試用期間_条件変更': { row: 21, col: 3 },
  '職種': { row: 22, col: 3 },

  // 勤務条件
  '勤務時間1': { row: 25, col: 3 },
  '勤務時間2': { row: 26, col: 3 },
  '勤務時間3': { row: 27, col: 3 },
  '実働時間': { row: 25, col: 7 },
  '勤務時間_備考': { row: 28, col: 3 },
  '休憩時間': { row: 31, col: 3 },

  // 残業
  '残業_有無': { row: 37, col: 3 },
  '残業_月平均': { row: 38, col: 6 },
  '残業_備考': { row: 39, col: 3 },

  // 休日
  '休日区分': { row: 42, col: 3 },
  '年間休日': { row: 43, col: 6 },
  '長期休暇_有無': { row: 45, col: 3 },
  '長期休暇_詳細': { row: 45, col: 5 },

  // 給与
  '給与形態': { row: 49, col: 3 },
  '給与額': { row: 50, col: 3 },
  '想定年収': { row: 51, col: 3 },
  '賞与_有無': { row: 52, col: 3 },
  '賞与_詳細': { row: 52, col: 5 },
  'みなし残業_時間': { row: 53, col: 3 },
  'みなし残業_金額': { row: 53, col: 5 },
  '試用期間中給与': { row: 54, col: 3 },

  // 福利厚生
  '雇用保険': { row: 57, col: 4 },
  '労災保険': { row: 57, col: 6 },
  '厚生年金': { row: 58, col: 4 },
  '健康保険': { row: 58, col: 6 },
  'その他待遇': { row: 59, col: 3 },

  // 作業内容
  '作業内容詳細': { row: 64, col: 3 },

  // 製品・サービス
  '製品1': { row: 71, col: 3 },
  '製品2': { row: 72, col: 3 },
  '製品3': { row: 73, col: 3 },
  '作業上の注意点': { row: 74, col: 3 },

  // その他
  '平均年齢': { row: 78, col: 4 },
  '男女比': { row: 78, col: 6 },
  '必須資格': { row: 79, col: 3 },
  '選考フロー': { row: 80, col: 3 },
};

// Part② ヒアリング情報（打ち合わせ時記入部分）
// ※2-3行目にステータス欄があるため、既存データは+1行ずれている
const PART2_MAPPING = {
  // 会社紹介セクション
  '私たちについて': { row: 84, col: 3 },
  '社長挨拶': { row: 87, col: 3 },
  '会社の魅力': { row: 90, col: 3 },
  '雰囲気': { row: 93, col: 3 },

  // 社員の声セクション
  '社員1_氏名': { row: 99, col: 3 },
  '社員1_部署': { row: 99, col: 4 },
  '社員1_年数': { row: 99, col: 5 },
  '社員1_インタビュー': { row: 99, col: 6 },
  '社員2_氏名': { row: 100, col: 3 },
  '社員2_部署': { row: 100, col: 4 },
  '社員2_年数': { row: 100, col: 5 },
  '社員2_インタビュー': { row: 100, col: 6 },
  '社員3_氏名': { row: 101, col: 3 },
  '社員3_部署': { row: 101, col: 4 },
  '社員3_年数': { row: 101, col: 5 },
  '社員3_インタビュー': { row: 101, col: 6 },
  '社員4_氏名': { row: 102, col: 3 },
  '社員4_部署': { row: 102, col: 4 },
  '社員4_年数': { row: 102, col: 5 },
  '社員4_インタビュー': { row: 102, col: 6 },

  // 最も打ち出したいポイント
  '最も打ち出したいポイント': { row: 112, col: 1 },

  // 募集情報セクション
  '募集背景': { row: 118, col: 3 },
  'ペルソナ_性別': { row: 120, col: 3 },
  'ペルソナ_年齢': { row: 120, col: 5 },
  'ペルソナ_外国人': { row: 120, col: 7 },
  '求める人材像': { row: 121, col: 3 },

  // スカウトメール設定
  'スカウト_年齢': { row: 130, col: 3 },
  'スカウト_エリア': { row: 131, col: 3 },
  'スカウト_キーワード': { row: 132, col: 3 },
  'スカウト_備考': { row: 133, col: 3 },
};


// ================================================================================
// ===== 設定シート機能 =====
// ================================================================================
// getSettingsFromSheet(), replacePlaceholders() は settingsSheet.js で定義
// このファイルでは settingsSheet.js の関数を使用


// ===== メニュー追加 =====
function addCompositionMenu(ui) {
  ui.createMenu('４.📝 構成案作成')
    .addItem('📋 構成案を作成（プロンプト生成）', 'showCompositionPromptDialog')
    .addSeparator()
    .addItem('📤 ペアソナ/エンゲージ形式に変換', 'showPairsonaConvertDialog')
    .addItem('📤 ワークス報告用に変換', 'showWorksReportConvertDialog')
    .addItem('📤 撮影指示書に変換', 'showShootingInstructionConvertDialog')
    .addSeparator()
    .addItem('📸 撮影日程確定報告', 'showShootingConfirmDialog')  // contactFormats.jsで定義
    .addSeparator()
    .addItem('🔧 シートデータ確認', 'showSheetDataDebug')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'showStatusUpdateDialog')
    .addToUi();
}

// 単独でメニューを追加する場合
function addCompositionMenuStandalone() {
  const ui = SpreadsheetApp.getUi();
  addCompositionMenu(ui);
}


// ===== プロンプトシートからテンプレート読み込み =====
function getCompositionPromptFromSheet() {
  const PROMPT_NAME = '構成案作成';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) {
    return {
      success: false,
      error: '「プロンプト」シートがありません。\n\n' +
             '先にプロンプトシートを作成し、「構成案作成」プロンプトを追加してください。'
    };
  }

  const data = sheet.getDataRange().getValues();

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === PROMPT_NAME && row[4]) {
      return { success: true, template: row[4] };
    }
  }

  return {
    success: false,
    error: 'プロンプトシートに「' + PROMPT_NAME + '」がありません。\n\n' +
           'プロンプトシートに以下の行を追加してください：\n' +
           'A列: 構成案作成\n' +
           'E列: プロンプトテンプレート'
  };
}


// ===== ヒアリングシートから情報を取得 =====
function getHearingSheetData(sheet) {
  const data = {
    企業名: '',
    Part1_基本情報: {
      代表者名: '',
      HP_URL: '',
      住所: '',
      電話番号: '',
      メールアドレス: '',
      事業内容: '',
      転勤: { 有無: '', 転勤先: '' }
    },
    Part1_雇用形態: {
      雇用形態: '',
      職種: '',
      試用期間: { 有無: '', 期間: '', 条件変更: '' }
    },
    Part1_勤務条件: {
      勤務時間1: '',
      勤務時間2: '',
      勤務時間3: '',
      実働時間: '',
      休憩時間: '',
      備考: ''
    },
    Part1_残業: {
      有無: '',
      月平均: '',
      備考: ''
    },
    Part1_休日: {
      休日区分: '',
      年間休日: '',
      長期休暇: { 有無: '', 詳細: '' }
    },
    Part1_給与: {
      給与形態: '',
      給与額: '',
      想定年収: '',
      賞与: { 有無: '', 詳細: '' },
      みなし残業: { 時間: '', 金額: '' },
      試用期間中給与: ''
    },
    Part1_福利厚生: {
      社会保険: {
        雇用保険: '',
        労災保険: '',
        厚生年金: '',
        健康保険: ''
      },
      その他待遇: ''
    },
    Part1_作業内容: {
      詳細: ''
    },
    Part1_製品サービス: {
      製品1: '',
      製品2: '',
      製品3: '',
      注意点: ''
    },
    Part1_その他: {
      平均年齢: '',
      男女比: '',
      必須資格: '',
      選考フロー: ''
    },
    Part2_会社紹介: {
      私たちについて: '',
      社長挨拶: '',
      会社の魅力: '',
      雰囲気: ''
    },
    Part2_社員の声: [],
    Part2_最も打ち出したいポイント: '',
    Part2_募集情報: {
      募集背景: '',
      ペルソナ: { 性別: '', 年齢: '', 外国人: '' },
      求める人材像: ''
    },
    Part2_スカウトメール: {
      年齢: '',
      エリア: '',
      検索キーワード: '',
      備考: ''
    }
  };

  // セル値を取得するヘルパー関数
  const getCellValue = (row, col) => {
    try {
      const value = sheet.getRange(row, col).getValue();
      return value !== null && value !== undefined ? String(value).trim() : '';
    } catch (e) {
      return '';
    }
  };

  // Part① 基本情報
  data.企業名 = getCellValue(PART1_MAPPING['企業名'].row, PART1_MAPPING['企業名'].col);
  data.Part1_基本情報.代表者名 = getCellValue(PART1_MAPPING['代表者名'].row, PART1_MAPPING['代表者名'].col);
  data.Part1_基本情報.HP_URL = getCellValue(PART1_MAPPING['HP_URL'].row, PART1_MAPPING['HP_URL'].col);
  data.Part1_基本情報.住所 = getCellValue(PART1_MAPPING['住所'].row, PART1_MAPPING['住所'].col);
  data.Part1_基本情報.電話番号 = getCellValue(PART1_MAPPING['電話番号'].row, PART1_MAPPING['電話番号'].col);
  data.Part1_基本情報.メールアドレス = getCellValue(PART1_MAPPING['メールアドレス'].row, PART1_MAPPING['メールアドレス'].col);
  data.Part1_基本情報.事業内容 = getCellValue(PART1_MAPPING['事業内容'].row, PART1_MAPPING['事業内容'].col);
  data.Part1_基本情報.転勤.有無 = getCellValue(PART1_MAPPING['転勤_有無'].row, PART1_MAPPING['転勤_有無'].col);
  data.Part1_基本情報.転勤.転勤先 = getCellValue(PART1_MAPPING['転勤_転勤先'].row, PART1_MAPPING['転勤_転勤先'].col);

  // 雇用形態
  data.Part1_雇用形態.雇用形態 = getCellValue(PART1_MAPPING['雇用形態'].row, PART1_MAPPING['雇用形態'].col);
  data.Part1_雇用形態.職種 = getCellValue(PART1_MAPPING['職種'].row, PART1_MAPPING['職種'].col);
  data.Part1_雇用形態.試用期間.有無 = getCellValue(PART1_MAPPING['試用期間_有無'].row, PART1_MAPPING['試用期間_有無'].col);
  data.Part1_雇用形態.試用期間.期間 = getCellValue(PART1_MAPPING['試用期間_期間'].row, PART1_MAPPING['試用期間_期間'].col);
  data.Part1_雇用形態.試用期間.条件変更 = getCellValue(PART1_MAPPING['試用期間_条件変更'].row, PART1_MAPPING['試用期間_条件変更'].col);

  // 勤務条件
  data.Part1_勤務条件.勤務時間1 = getCellValue(PART1_MAPPING['勤務時間1'].row, PART1_MAPPING['勤務時間1'].col);
  data.Part1_勤務条件.勤務時間2 = getCellValue(PART1_MAPPING['勤務時間2'].row, PART1_MAPPING['勤務時間2'].col);
  data.Part1_勤務条件.勤務時間3 = getCellValue(PART1_MAPPING['勤務時間3'].row, PART1_MAPPING['勤務時間3'].col);
  data.Part1_勤務条件.実働時間 = getCellValue(PART1_MAPPING['実働時間'].row, PART1_MAPPING['実働時間'].col);
  data.Part1_勤務条件.休憩時間 = getCellValue(PART1_MAPPING['休憩時間'].row, PART1_MAPPING['休憩時間'].col);
  data.Part1_勤務条件.備考 = getCellValue(PART1_MAPPING['勤務時間_備考'].row, PART1_MAPPING['勤務時間_備考'].col);

  // 残業
  data.Part1_残業.有無 = getCellValue(PART1_MAPPING['残業_有無'].row, PART1_MAPPING['残業_有無'].col);
  data.Part1_残業.月平均 = getCellValue(PART1_MAPPING['残業_月平均'].row, PART1_MAPPING['残業_月平均'].col);
  data.Part1_残業.備考 = getCellValue(PART1_MAPPING['残業_備考'].row, PART1_MAPPING['残業_備考'].col);

  // 休日
  data.Part1_休日.休日区分 = getCellValue(PART1_MAPPING['休日区分'].row, PART1_MAPPING['休日区分'].col);
  data.Part1_休日.年間休日 = getCellValue(PART1_MAPPING['年間休日'].row, PART1_MAPPING['年間休日'].col);
  data.Part1_休日.長期休暇.有無 = getCellValue(PART1_MAPPING['長期休暇_有無'].row, PART1_MAPPING['長期休暇_有無'].col);
  data.Part1_休日.長期休暇.詳細 = getCellValue(PART1_MAPPING['長期休暇_詳細'].row, PART1_MAPPING['長期休暇_詳細'].col);

  // 給与
  data.Part1_給与.給与形態 = getCellValue(PART1_MAPPING['給与形態'].row, PART1_MAPPING['給与形態'].col);
  data.Part1_給与.給与額 = getCellValue(PART1_MAPPING['給与額'].row, PART1_MAPPING['給与額'].col);
  data.Part1_給与.想定年収 = getCellValue(PART1_MAPPING['想定年収'].row, PART1_MAPPING['想定年収'].col);
  data.Part1_給与.賞与.有無 = getCellValue(PART1_MAPPING['賞与_有無'].row, PART1_MAPPING['賞与_有無'].col);
  data.Part1_給与.賞与.詳細 = getCellValue(PART1_MAPPING['賞与_詳細'].row, PART1_MAPPING['賞与_詳細'].col);
  data.Part1_給与.みなし残業.時間 = getCellValue(PART1_MAPPING['みなし残業_時間'].row, PART1_MAPPING['みなし残業_時間'].col);
  data.Part1_給与.みなし残業.金額 = getCellValue(PART1_MAPPING['みなし残業_金額'].row, PART1_MAPPING['みなし残業_金額'].col);
  data.Part1_給与.試用期間中給与 = getCellValue(PART1_MAPPING['試用期間中給与'].row, PART1_MAPPING['試用期間中給与'].col);

  // 福利厚生
  data.Part1_福利厚生.社会保険.雇用保険 = getCellValue(PART1_MAPPING['雇用保険'].row, PART1_MAPPING['雇用保険'].col);
  data.Part1_福利厚生.社会保険.労災保険 = getCellValue(PART1_MAPPING['労災保険'].row, PART1_MAPPING['労災保険'].col);
  data.Part1_福利厚生.社会保険.厚生年金 = getCellValue(PART1_MAPPING['厚生年金'].row, PART1_MAPPING['厚生年金'].col);
  data.Part1_福利厚生.社会保険.健康保険 = getCellValue(PART1_MAPPING['健康保険'].row, PART1_MAPPING['健康保険'].col);
  data.Part1_福利厚生.その他待遇 = getCellValue(PART1_MAPPING['その他待遇'].row, PART1_MAPPING['その他待遇'].col);

  // 作業内容
  data.Part1_作業内容.詳細 = getCellValue(PART1_MAPPING['作業内容詳細'].row, PART1_MAPPING['作業内容詳細'].col);

  // 製品・サービス
  data.Part1_製品サービス.製品1 = getCellValue(PART1_MAPPING['製品1'].row, PART1_MAPPING['製品1'].col);
  data.Part1_製品サービス.製品2 = getCellValue(PART1_MAPPING['製品2'].row, PART1_MAPPING['製品2'].col);
  data.Part1_製品サービス.製品3 = getCellValue(PART1_MAPPING['製品3'].row, PART1_MAPPING['製品3'].col);
  data.Part1_製品サービス.注意点 = getCellValue(PART1_MAPPING['作業上の注意点'].row, PART1_MAPPING['作業上の注意点'].col);

  // その他
  data.Part1_その他.平均年齢 = getCellValue(PART1_MAPPING['平均年齢'].row, PART1_MAPPING['平均年齢'].col);
  data.Part1_その他.男女比 = getCellValue(PART1_MAPPING['男女比'].row, PART1_MAPPING['男女比'].col);
  data.Part1_その他.必須資格 = getCellValue(PART1_MAPPING['必須資格'].row, PART1_MAPPING['必須資格'].col);
  data.Part1_その他.選考フロー = getCellValue(PART1_MAPPING['選考フロー'].row, PART1_MAPPING['選考フロー'].col);

  // Part② 会社紹介
  data.Part2_会社紹介.私たちについて = getCellValue(PART2_MAPPING['私たちについて'].row, PART2_MAPPING['私たちについて'].col);
  data.Part2_会社紹介.社長挨拶 = getCellValue(PART2_MAPPING['社長挨拶'].row, PART2_MAPPING['社長挨拶'].col);
  data.Part2_会社紹介.会社の魅力 = getCellValue(PART2_MAPPING['会社の魅力'].row, PART2_MAPPING['会社の魅力'].col);
  data.Part2_会社紹介.雰囲気 = getCellValue(PART2_MAPPING['雰囲気'].row, PART2_MAPPING['雰囲気'].col);

  // 社員の声
  for (let i = 1; i <= 4; i++) {
    const name = getCellValue(PART2_MAPPING[`社員${i}_氏名`].row, PART2_MAPPING[`社員${i}_氏名`].col);
    if (name) {
      data.Part2_社員の声.push({
        氏名: name,
        部署: getCellValue(PART2_MAPPING[`社員${i}_部署`].row, PART2_MAPPING[`社員${i}_部署`].col),
        年数: getCellValue(PART2_MAPPING[`社員${i}_年数`].row, PART2_MAPPING[`社員${i}_年数`].col),
        インタビュー: getCellValue(PART2_MAPPING[`社員${i}_インタビュー`].row, PART2_MAPPING[`社員${i}_インタビュー`].col)
      });
    }
  }

  // 最も打ち出したいポイント
  data.Part2_最も打ち出したいポイント = getCellValue(PART2_MAPPING['最も打ち出したいポイント'].row, PART2_MAPPING['最も打ち出したいポイント'].col);

  // 募集情報
  data.Part2_募集情報.募集背景 = getCellValue(PART2_MAPPING['募集背景'].row, PART2_MAPPING['募集背景'].col);
  data.Part2_募集情報.ペルソナ.性別 = getCellValue(PART2_MAPPING['ペルソナ_性別'].row, PART2_MAPPING['ペルソナ_性別'].col);
  data.Part2_募集情報.ペルソナ.年齢 = getCellValue(PART2_MAPPING['ペルソナ_年齢'].row, PART2_MAPPING['ペルソナ_年齢'].col);
  data.Part2_募集情報.ペルソナ.外国人 = getCellValue(PART2_MAPPING['ペルソナ_外国人'].row, PART2_MAPPING['ペルソナ_外国人'].col);
  data.Part2_募集情報.求める人材像 = getCellValue(PART2_MAPPING['求める人材像'].row, PART2_MAPPING['求める人材像'].col);

  // スカウトメール
  data.Part2_スカウトメール.年齢 = getCellValue(PART2_MAPPING['スカウト_年齢'].row, PART2_MAPPING['スカウト_年齢'].col);
  data.Part2_スカウトメール.エリア = getCellValue(PART2_MAPPING['スカウト_エリア'].row, PART2_MAPPING['スカウト_エリア'].col);
  data.Part2_スカウトメール.検索キーワード = getCellValue(PART2_MAPPING['スカウト_キーワード'].row, PART2_MAPPING['スカウト_キーワード'].col);
  data.Part2_スカウトメール.備考 = getCellValue(PART2_MAPPING['スカウト_備考'].row, PART2_MAPPING['スカウト_備考'].col);

  return data;
}


// ===== 企業シート一覧を取得 =====
function getCompanySheetListForComposition() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();

  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    // settingsSheet.js の isExcludedSheet() を使用
    if (!isExcludedSheet(name)) {
      // 企業名を取得（行5, C列）
      let companyName = '';
      try {
        companyName = sheet.getRange(6, 3).getValue() || '';
      } catch (e) {
        companyName = '';
      }

      // Part③から保存済みデータを取得
      let savedDraft = '';  // 構成案
      let savedPairsona = '';  // ペアソナ/エンゲージ
      let savedShooting = '';  // 撮影指示書
      try {
        const draftResult = loadPart3Data(name, '構成案');
        if (draftResult.success) savedDraft = draftResult.value;
        const pairsonaResult = loadPart3Data(name, 'ペアソナ/エンゲージ');
        if (pairsonaResult.success) savedPairsona = pairsonaResult.value;
        const shootingResult = loadPart3Data(name, '撮影指示書');
        if (shootingResult.success) savedShooting = shootingResult.value;
      } catch (e) {
        // ignore
      }

      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        isActive: name === activeSheetName,
        savedDraft: savedDraft,  // 構成案
        savedPairsona: savedPairsona,  // ペアソナ/エンゲージ
        savedShooting: savedShooting,  // 撮影指示書
        hasSavedData: !!savedDraft
      });
    }
  }

  return result;
}


// ===== ダイアログ表示 =====
function showCompositionPromptDialog() {
  // プロンプトシートからテンプレートを取得
  const promptData = getCompositionPromptFromSheet();

  if (!promptData.success) {
    SpreadsheetApp.getUi().alert('エラー', promptData.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // 企業シート一覧を取得
  const sheetList = getCompanySheetListForComposition();

  const html = HtmlService.createHtmlOutput(createCompositionDialogHTML(sheetList, promptData.template))
    .setWidth(900)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 構成案を作成');
}


// ===== ダイアログHTML生成 =====
function createCompositionDialogHTML(sheetList, template) {
  // シート一覧をJSON文字列に変換
  const sheetListJson = JSON.stringify(sheetList);

  // テンプレートをエスケープ
  const escapedTemplate = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* compositionDraftGenerator固有スタイル */
    .loading { display: none; color: #1a73e8; margin-left: 10px; }
    .template-pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-size: 11px; max-height: 150px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 12px; }
    .save-btn { background: #ff9800; color: white; }
    .save-btn:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .ai-output-section { margin-top: 16px; }
    .ai-output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .ai-output-textarea { width: 100%; height: 200px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; font-family: monospace; resize: vertical; }
    .ai-output-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <!-- 企業選択ドロップダウン -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- プロンプトテンプレート（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordionById('arrow', 'accordionContent')">
      <span class="accordion-title">構成案作成プロンプトを表示</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn btn-blue" onclick="event.stopPropagation();copyTemplate()">コピー</button>
        <span class="accordion-arrow" id="arrow">▶</span>
      </div>
    </div>
    <div class="accordion-content" id="accordionContent">
      <pre class="template-pre" id="templatePreview"></pre>
    </div>
  </div>

  <!-- プレビューセクション（生成したプロンプト） -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー（AIに貼り付けるプロンプト）</span>
      <button class="btn btn-green" id="copyBtn" onclick="copyOutput()" style="display:none;">コピー</button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">「プロンプトを生成」をクリックすると、ここに完成版プロンプトが表示されます</span>
    </div>
  </div>

  <!-- アクション -->
  <div class="actions">
    <button class="btn btn-primary" onclick="generatePrompt()">プロンプトを生成</button>
    <span class="loading" id="loading">処理中...</span>
  </div>

  <!-- AI出力保存セクション -->
  <div class="ai-output-section">
    <div class="ai-output-header">
      <span class="input-label" style="margin-bottom:0;">AIが出力した構成案を貼り付け</span>
      <button class="btn save-btn" onclick="saveDraft()">シートに保存</button>
    </div>
    <textarea class="ai-output-textarea" id="aiOutputArea" placeholder="AIが出力した構成案をここに貼り付けてください。&#10;&#10;保存すると、変換ダイアログで自動的に読み込まれます。"></textarea>
  </div>

  <div class="footer" style="margin-top:16px;">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetList = ${sheetListJson};
    const template = \`${escapedTemplate}\`;
    let selectedSheetName = '';
    let selectedSavedDraft = '';
    let generatedPrompt = '';

    // 初期化
    window.onload = function() {
      renderCompanyDropdown();
      document.getElementById('templatePreview').textContent = template;
    };

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function renderCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      // ソート: アクティブ最上段、残りは新しい順
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return -1; // 配列後方（新しい）を上に
      });

      sorted.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' selected' : '');

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        const savedBadge = item.savedDraft ? '<span class="badge-saved">保存済</span>' : '';
        const companyNote = item.companyName && item.companyName !== item.sheetName
          ? ' <span style="color:#666;font-size:12px;">(' + escapeHtml(item.companyName) + ')</span>' : '';

        div.innerHTML = \`
          <span class="check-icon">\${item.isActive ? '✓' : ''}</span>
          <span class="company-name">\${escapeHtml(item.sheetName)}\${companyNote}</span>
          \${activeBadge}
          \${savedBadge}
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);

        // アクティブがあれば自動選択
        if (item.isActive) {
          selectCompany(item);
        }
      });
    }

    function selectCompany(item) {
      const currentInput = document.getElementById('aiOutputArea').value.trim();

      // 保存済みデータがあり、現在の入力と異なる場合は確認
      if (item.savedDraft && currentInput && currentInput !== item.savedDraft) {
        if (!confirm('保存済みの構成案を読み込みますか？\\n（現在の入力は破棄されます）')) {
          updateSelection(item);
          return;
        }
      }

      updateSelection(item);

      // 保存済みデータを読み込む
      if (item.savedDraft) {
        document.getElementById('aiOutputArea').value = item.savedDraft;
        showStatus('保存済みの構成案を読み込みました', 'info');
      }
    }

    function updateSelection(item) {
      selectedSheetName = item.sheetName;
      selectedSavedDraft = item.savedDraft || '';

      // 表示を更新
      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const savedBadge = item.savedDraft ? '<span class="badge-saved" style="margin-left:8px;">保存済</span>' : '';
      display.innerHTML = \`
        <span class="selected-check">✓</span>
        <span class="selected-name">\${escapeHtml(item.sheetName)}</span>
        \${activeBadge}
        \${savedBadge}
      \`;

      // ドロップダウン内の選択状態を更新
      document.querySelectorAll('.company-select-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      const items = document.querySelectorAll('.company-select-item');
      items.forEach(el => {
        const name = el.querySelector('.company-name').textContent.split('(')[0].trim();
        if (name === item.sheetName) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });
    }

    function copyTemplate() {
      copyToClipboard(template);
    }

    function generatePrompt() {
      if (!selectedSheetName) {
        showStatus('シートを選択してください', 'error');
        return;
      }

      document.getElementById('loading').style.display = 'inline';
      document.getElementById('copyBtn').style.display = 'none';

      google.script.run
        .withSuccessHandler(function(result) {
          document.getElementById('loading').style.display = 'none';
          if (result.success) {
            generatedPrompt = template.replace('{{input}}', JSON.stringify(result.data, null, 2));
            document.getElementById('previewContent').innerHTML = '<pre style="margin:0;white-space:pre-wrap;word-break:break-all;max-height:150px;overflow-y:auto;">' + escapeHtml(generatedPrompt) + '</pre>';
            document.getElementById('copyBtn').style.display = 'inline-block';
            showStatus('プロンプトを生成しました。「コピー」してAIに貼り付けてください。', 'success');
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          document.getElementById('loading').style.display = 'none';
          showStatus('エラー: ' + error.message, 'error');
        })
        .getHearingDataForComposition(selectedSheetName);
    }

    function copyOutput() {
      if (generatedPrompt) {
        copyToClipboard(generatedPrompt);
      }
    }

    function saveDraft() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('aiOutputArea').value.trim();
      if (!input) {
        showStatus('構成案を入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('構成案をシートに保存しました', 'success');
            selectedSavedDraft = input;
            // バッジを更新
            const display = document.getElementById('companySelectDisplay');
            if (!display.innerHTML.includes('badge-saved')) {
              display.innerHTML = display.innerHTML.replace('</span>\\n      ', '</span>\\n        <span class="badge-saved" style="margin-left:8px;">保存済</span>\\n      ');
            }
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) {
                    showStatus('構成案を上書き保存しました', 'success');
                    selectedSavedDraft = input;
                  } else {
                    showStatus('保存エラー: ' + r.error, 'error');
                  }
                })
                .savePart3DataForce(selectedSheetName, '構成案', input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, '構成案', input, true);
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
`;
}


// ===== シートからデータ取得（ダイアログから呼び出し） =====
function getHearingDataForComposition(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return { success: false, error: 'シートが見つかりません: ' + sheetName };
    }

    const data = getHearingSheetData(sheet);

    // 企業名チェック
    if (!data.企業名) {
      return { success: false, error: 'シートに企業名が入力されていません（行5, C列）' };
    }

    return { success: true, data: data };

  } catch (error) {
    return { success: false, error: error.message };
  }
}


// ===== デバッグ用 =====
function showSheetDataDebug() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = getHearingSheetData(sheet);

  const ui = SpreadsheetApp.getUi();
  ui.alert('シートデータ', JSON.stringify(data, null, 2).substring(0, 5000), ui.ButtonSet.OK);
}


// ================================================================================
// ===== 変換機能 =====
// ================================================================================

// ===== 変換プロンプト取得 =====
// プロンプトシート構造: A列=名前, B列=説明, C列=入力欄ラベル, D列=プレースホルダー, E列=テンプレート
function getConvertPromptFromSheet(promptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('プロンプト');

  if (!sheet) {
    return {
      success: false,
      error: '「プロンプト」シートがありません。\n\n' +
             'プロンプトシートを作成し、「' + promptName + '」プロンプトを追加してください。'
    };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === promptName && row[4]) {
      return {
        success: true,
        name: row[0],
        description: row[1] || '',
        inputLabel: row[2] || '構成案を貼り付け',
        inputPlaceholder: row[3] || 'AIが出力した構成案をここに貼り付けてください',
        template: row[4]
      };
    }
  }

  return {
    success: false,
    error: 'プロンプトシートに「' + promptName + '」がありません。\n\n' +
           'プロンプトシートに以下の行を追加してください：\n' +
           '・A列: ' + promptName + '\n' +
           '・B列: 説明（任意）\n' +
           '・C列: 入力欄ラベル\n' +
           '・D列: プレースホルダー\n' +
           '・E列: プロンプトテンプレート（{{input}}を含む）'
  };
}


// ===== ペアソナ/エンゲージ変換ダイアログ =====
function showPairsonaConvertDialog() {
  showConvertDialog('ペアソナ/エンゲージ変換', 'ペアソナ/エンゲージ形式に変換',
    'AIが出力した構成案を、ペアソナ・エンゲージの入力フォームにそのままコピペできる形式に変換します。');
}

// ===== ワークス報告変換ダイアログ =====
function showWorksReportConvertDialog() {
  showConvertDialog('ワークス報告変換', 'ワークス報告用サマリーに変換',
    '構成案をLINEWORKSでの報告用サマリーに変換します。原稿チーム・動画チームへの共有に使用します。');
}

// ===== 撮影指示書変換ダイアログ =====
function showShootingInstructionConvertDialog() {
  const settings = getSettingsFromSheet();
  if (settings.error) {
    SpreadsheetApp.getUi().alert('エラー', settings.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  const satsueiTantou = settings['撮影担当'] || '撮影担当';
  showConvertDialog('撮影指示書変換', '撮影指示書に変換',
    '構成案から撮影担当者（' + satsueiTantou + '）向けの撮影指示書を作成します。');
}


// ===== 汎用変換ダイアログ =====
function showConvertDialog(promptName, title, description) {
  const promptData = getConvertPromptFromSheet(promptName);

  if (!promptData.success) {
    SpreadsheetApp.getUi().alert('エラー', promptData.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // 設定シートから担当者情報を取得
  const settings = getSettingsFromSheet();
  if (settings.error) {
    SpreadsheetApp.getUi().alert('エラー', settings.error, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // プレースホルダーを担当者情報で置換
  promptData.template = replacePlaceholders(promptData.template, settings);

  // 企業シート一覧を取得（保存済みデータ含む）
  const sheetList = getCompanySheetListForComposition();

  // 保存キーを決定（変換後の出力の保存先）
  let saveKey = null;  // デフォルトは保存なし
  if (promptName === 'ペアソナ/エンゲージ変換') {
    saveKey = 'ペアソナ/エンゲージ';
  } else if (promptName === '撮影指示書変換') {
    saveKey = '撮影指示書';
  }
  // ワークス報告変換は saveKey = null（保存なし）

  const html = HtmlService.createHtmlOutput(createConvertDialogHTML(promptData, title, description, sheetList, saveKey))
    .setWidth(900)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '📤 ' + title);
}


// ===== 変換ダイアログHTML生成 =====
function createConvertDialogHTML(promptData, title, description, sheetList, saveKey) {
  const template = promptData.template;
  const inputLabel = promptData.inputLabel || '構成案を貼り付け';
  const inputPlaceholder = promptData.inputPlaceholder || 'AIが出力した構成案をここに貼り付けてください';
  const escapedTemplate = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sheetListJson = JSON.stringify(sheetList || []);
  const saveKeyJson = saveKey ? JSON.stringify(saveKey) : 'null';
  const hasSaveKey = !!saveKey;

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* createConvertDialog固有スタイル */
    .status.info { display: block; background: #e3f2fd; color: #1565c0; }
    .template-pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-size: 11px; max-height: 120px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 12px; }
    .btn-orange { background: #ff9800; color: white; }
    .btn-orange:hover { background: #f57c00; }
    .badge-saved { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .badge-draft { background: #4caf50; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="copy-success" id="copySuccess">コピーしました</div>

  <h3 style="margin:0 0 8px 0;color:#1a73e8;">${title}</h3>
  <p class="description">${description}</p>

  <!-- 企業選択ドロップダウン -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- 変換プロンプト（アコーディオン） -->
  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordionById('arrow', 'accordionContent')">
      <span class="accordion-title">変換プロンプトを表示</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn btn-blue" onclick="event.stopPropagation();copyTemplate()">コピー</button>
        <span class="accordion-arrow" id="arrow">▶</span>
      </div>
    </div>
    <div class="accordion-content" id="accordionContent">
      <pre class="template-pre" id="templatePreview"></pre>
    </div>
  </div>

  <!-- 入力セクション（構成案） -->
  <div class="input-section">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <span class="input-label" style="margin-bottom:0;">${inputLabel}</span>
    </div>
    <textarea style="width:100%;height:100px;font-family:monospace;font-size:12px;resize:vertical;padding:10px;border:1px solid #ddd;border-radius:6px;" id="inputArea" placeholder="${inputPlaceholder}" oninput="updatePreview()"></textarea>
  </div>

  <!-- プレビューセクション -->
  <div class="preview-section">
    <div class="preview-header">
      <span class="preview-title">プレビュー（AIに貼り付けるプロンプト）</span>
      <button class="btn btn-green" id="copyBtn" onclick="copyOutput()" style="display:none;">コピー</button>
    </div>
    <div class="preview-content" id="previewContent">
      <span class="preview-placeholder">構成案を入力すると、ここにプロンプトが表示されます</span>
    </div>
  </div>

  <!-- AI出力保存セクション -->
  ${hasSaveKey ? `
  <div class="input-section" style="margin-top:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <span class="input-label" style="margin-bottom:0;">AIが出力した結果を貼り付け</span>
      <button class="btn btn-orange" onclick="saveAiOutput()">シートに保存</button>
    </div>
    <textarea style="width:100%;height:120px;font-family:monospace;font-size:12px;resize:vertical;padding:10px;border:1px solid #ddd;border-radius:6px;" id="aiOutputArea" placeholder="AIが出力した変換結果をここに貼り付けてください。"></textarea>
  </div>
  ` : ''}

  <div class="footer">
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  ${CI_UI_COMPONENTS}

  <script>
    const template = \`${escapedTemplate}\`;
    const sheetList = ${sheetListJson};
    const saveKey = ${saveKeyJson};
    let selectedSheetName = '';
    let selectedCompanyName = '';
    let selectedSavedData = '';
    let generatedPrompt = '';

    window.onload = function() {
      document.getElementById('templatePreview').textContent = template;
      renderCompanyDropdown();
    };

    // プレビュー更新（入力時・企業選択時に自動呼び出し）
    function updatePreview() {
      const input = document.getElementById('inputArea').value.trim();

      if (!input) {
        document.getElementById('previewContent').innerHTML = '<span class="preview-placeholder">構成案を入力すると、ここにプロンプトが表示されます</span>';
        document.getElementById('copyBtn').style.display = 'none';
        generatedPrompt = '';
        return;
      }

      // テンプレートに入力を埋め込み
      let prompt = template.replace('{{input}}', input);

      // 企業名プレースホルダーを置換
      if (selectedCompanyName) {
        prompt = prompt.replace(/\\{\\{企業名\\}\\}/g, selectedCompanyName);
      }

      generatedPrompt = prompt;
      document.getElementById('previewContent').innerHTML = '<pre style="margin:0;white-space:pre-wrap;word-break:break-all;max-height:150px;overflow-y:auto;">' + escapeHtml(generatedPrompt) + '</pre>';
      document.getElementById('copyBtn').style.display = 'inline-block';
    }

    function toggleCompanyDropdown() {
      const display = document.getElementById('companySelectDisplay');
      const dropdown = document.getElementById('companySelectDropdown');
      const isOpen = dropdown.classList.contains('show');

      if (isOpen) {
        dropdown.classList.remove('show');
        display.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        display.classList.add('active');
      }
    }

    function renderCompanyDropdown() {
      const dropdown = document.getElementById('companySelectDropdown');
      dropdown.innerHTML = '';

      if (!sheetList || sheetList.length === 0) {
        dropdown.innerHTML = '<div style="color:#666;padding:12px;">企業シートがありません</div>';
        return;
      }

      // ソート: アクティブ最上段、残りは新しい順
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return -1;
      });

      sorted.forEach((item) => {
        // 入力の読み込み元は savedDraft（構成案）
        const draftData = item.savedDraft || '';
        const div = document.createElement('div');
        div.className = 'company-select-item' + (item.isActive ? ' selected' : '');

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        const draftBadge = draftData ? '<span class="badge-draft">構成案あり</span>' : '';

        div.innerHTML = \`
          <span class="check-icon">\${item.isActive ? '✓' : ''}</span>
          <span class="company-name">\${escapeHtml(item.sheetName)}</span>
          \${activeBadge}
          \${draftBadge}
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);

        // アクティブがあれば自動選択
        if (item.isActive) {
          selectCompany(item);
        }
      });
    }

    function selectCompany(item) {
      const currentInput = document.getElementById('inputArea').value.trim();
      const draftData = item.savedDraft || '';

      // 構成案データがあれば読み込み確認
      if (draftData && currentInput && currentInput !== draftData) {
        if (!confirm('保存済みの構成案を読み込みますか？\\n（現在の入力は破棄されます）')) {
          // キャンセルの場合は選択だけ変更
          updateSelection(item);
          updatePreview();
          return;
        }
      }

      updateSelection(item);

      // 構成案データを読み込む
      if (draftData) {
        document.getElementById('inputArea').value = draftData;
        showStatus('保存済みの構成案を読み込みました', 'info');
      }

      // プレビューを更新
      updatePreview();
    }

    function updateSelection(item) {
      selectedSheetName = item.sheetName;
      selectedCompanyName = item.companyName || item.sheetName;
      selectedSavedData = item.savedDraft || '';

      // 表示を更新
      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const draftBadge = item.savedDraft ? '<span class="badge-draft" style="margin-left:8px;">構成案あり</span>' : '';
      display.innerHTML = \`
        <span class="selected-check">✓</span>
        <span class="selected-name">\${escapeHtml(item.sheetName)}</span>
        \${activeBadge}
        \${draftBadge}
      \`;

      // ドロップダウン内の選択状態を更新
      document.querySelectorAll('.company-select-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.check-icon').textContent = '';
      });
      const items = document.querySelectorAll('.company-select-item');
      items.forEach(el => {
        const name = el.querySelector('.company-name').textContent;
        if (name === item.sheetName) {
          el.classList.add('selected');
          el.querySelector('.check-icon').textContent = '✓';
        }
      });
    }

    function copyTemplate() {
      copyToClipboard(template);
    }

    function saveAiOutput() {
      if (!saveKey) {
        showStatus('この変換では保存機能は利用できません', 'error');
        return;
      }
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const aiOutput = document.getElementById('aiOutputArea').value.trim();
      if (!aiOutput) {
        showStatus('AI出力を入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('「' + saveKey + '」に保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('「' + saveKey + '」に上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, saveKey, aiOutput);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, saveKey, aiOutput, true);
    }

    function copyOutput() {
      if (generatedPrompt) {
        copyToClipboard(generatedPrompt);
      }
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
`;
}
