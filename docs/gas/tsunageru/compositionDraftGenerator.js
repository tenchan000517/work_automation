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
const PART1_MAPPING = {
  '企業名': { row: 5, col: 3 },
  '代表者名': { row: 6, col: 3 },
  'HP_URL': { row: 7, col: 3 },
  '住所': { row: 8, col: 3 },
  '電話番号': { row: 9, col: 3 },
  'メールアドレス': { row: 10, col: 3 },
  '許可番号': { row: 11, col: 3 },
  '設立日': { row: 12, col: 3 },
  '担当者名': { row: 13, col: 3 },
  '事業内容': { row: 14, col: 3 },
  '転勤_有無': { row: 15, col: 3 },
  '転勤_転勤先': { row: 15, col: 5 },

  // 雇用形態・職種
  '雇用形態': { row: 18, col: 3 },
  '試用期間_有無': { row: 19, col: 3 },
  '試用期間_期間': { row: 19, col: 5 },
  '試用期間_条件変更': { row: 20, col: 3 },
  '職種': { row: 21, col: 3 },

  // 勤務条件
  '勤務時間1': { row: 24, col: 3 },
  '勤務時間2': { row: 25, col: 3 },
  '勤務時間3': { row: 26, col: 3 },
  '実働時間': { row: 24, col: 7 },
  '勤務時間_備考': { row: 27, col: 3 },
  '休憩時間': { row: 30, col: 3 },

  // 残業
  '残業_有無': { row: 36, col: 3 },
  '残業_月平均': { row: 37, col: 6 },
  '残業_備考': { row: 38, col: 3 },

  // 休日
  '休日区分': { row: 41, col: 3 },
  '年間休日': { row: 42, col: 6 },
  '長期休暇_有無': { row: 44, col: 3 },
  '長期休暇_詳細': { row: 44, col: 5 },

  // 給与
  '給与形態': { row: 48, col: 3 },
  '給与額': { row: 49, col: 3 },
  '想定年収': { row: 50, col: 3 },
  '賞与_有無': { row: 51, col: 3 },
  '賞与_詳細': { row: 51, col: 5 },
  'みなし残業_時間': { row: 52, col: 3 },
  'みなし残業_金額': { row: 52, col: 5 },
  '試用期間中給与': { row: 53, col: 3 },

  // 福利厚生
  '雇用保険': { row: 56, col: 4 },
  '労災保険': { row: 56, col: 6 },
  '厚生年金': { row: 57, col: 4 },
  '健康保険': { row: 57, col: 6 },
  'その他待遇': { row: 58, col: 3 },

  // 作業内容
  '作業内容詳細': { row: 63, col: 3 },

  // 製品・サービス
  '製品1': { row: 70, col: 3 },
  '製品2': { row: 71, col: 3 },
  '製品3': { row: 72, col: 3 },
  '作業上の注意点': { row: 73, col: 3 },

  // その他
  '平均年齢': { row: 77, col: 4 },
  '男女比': { row: 77, col: 6 },
  '必須資格': { row: 78, col: 3 },
  '選考フロー': { row: 79, col: 3 },
};

// Part② ヒアリング情報（打ち合わせ時記入部分）
const PART2_MAPPING = {
  // 会社紹介セクション
  '私たちについて': { row: 83, col: 3 },
  '社長挨拶': { row: 86, col: 3 },
  '会社の魅力': { row: 89, col: 3 },
  '雰囲気': { row: 92, col: 3 },

  // 社員の声セクション
  '社員1_氏名': { row: 98, col: 3 },
  '社員1_部署': { row: 98, col: 4 },
  '社員1_年数': { row: 98, col: 5 },
  '社員1_インタビュー': { row: 98, col: 6 },
  '社員2_氏名': { row: 99, col: 3 },
  '社員2_部署': { row: 99, col: 4 },
  '社員2_年数': { row: 99, col: 5 },
  '社員2_インタビュー': { row: 99, col: 6 },
  '社員3_氏名': { row: 100, col: 3 },
  '社員3_部署': { row: 100, col: 4 },
  '社員3_年数': { row: 100, col: 5 },
  '社員3_インタビュー': { row: 100, col: 6 },
  '社員4_氏名': { row: 101, col: 3 },
  '社員4_部署': { row: 101, col: 4 },
  '社員4_年数': { row: 101, col: 5 },
  '社員4_インタビュー': { row: 101, col: 6 },

  // 最も打ち出したいポイント
  '最も打ち出したいポイント': { row: 111, col: 1 },

  // 募集情報セクション
  '募集背景': { row: 117, col: 3 },
  'ペルソナ_性別': { row: 119, col: 3 },
  'ペルソナ_年齢': { row: 119, col: 5 },
  'ペルソナ_外国人': { row: 119, col: 7 },
  '求める人材像': { row: 120, col: 3 },

  // スカウトメール設定
  'スカウト_年齢': { row: 129, col: 3 },
  'スカウト_エリア': { row: 130, col: 3 },
  'スカウト_キーワード': { row: 131, col: 3 },
  'スカウト_備考': { row: 132, col: 3 },
};


// ================================================================================
// ===== 設定シート機能 =====
// ================================================================================
// getSettingsFromSheet(), replacePlaceholders() は settingsSheet.js で定義
// このファイルでは settingsSheet.js の関数を使用


// ===== メニュー追加 =====
function addCompositionMenu(ui) {
  ui.createMenu('５.📝 構成案作成')
    .addItem('📋 構成案を作成（プロンプト生成）', 'showCompositionPromptDialog')
    .addSeparator()
    .addItem('📤 ペアソナ/エンゲージ形式に変換', 'showPairsonaConvertDialog')
    .addItem('📤 ワークス報告用に変換', 'showWorksReportConvertDialog')
    .addItem('📤 撮影指示書に変換', 'showShootingInstructionConvertDialog')
    .addSeparator()
    .addItem('🔧 シートデータ確認', 'showSheetDataDebug')
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
        companyName = sheet.getRange(5, 3).getValue() || '';
      } catch (e) {
        companyName = '';
      }

      // Part③から保存済み構成案を取得
      let savedDraftGenko = '';
      let savedDraftDouga = '';
      try {
        const genkoResult = loadPart3Data(name, '構成案_原稿用');
        if (genkoResult.success) savedDraftGenko = genkoResult.value;
        const dougaResult = loadPart3Data(name, '構成案_動画用');
        if (dougaResult.success) savedDraftDouga = dougaResult.value;
      } catch (e) {
        // ignore
      }

      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        isActive: name === activeSheetName,
        savedDraftGenko: savedDraftGenko,
        savedDraftDouga: savedDraftDouga,
        hasSavedData: !!savedDraftGenko || !!savedDraftDouga
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
    h3 { margin: 0 0 15px 0; color: #1a73e8; }
    .sheet-list { max-height: 150px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .sheet-item { padding: 8px; margin: 4px 0; border-radius: 4px; cursor: pointer; display: flex; align-items: center; }
    .sheet-item:hover { background: #f0f0f0; }
    .sheet-item.selected { background: #e3f2fd; border: 1px solid #1a73e8; }
    .sheet-item input[type="radio"] { margin-right: 10px; }
    .company-name { color: #666; font-size: 12px; margin-left: 10px; }
    .output-area { width: 100%; height: 250px; font-family: monospace; font-size: 12px; resize: vertical; }
    .btn-success { background: #4caf50; color: white; }
    .btn-success:hover { background: #388e3c; }
    .loading { display: none; color: #1a73e8; margin-left: 10px; }
    .accordion-header { background: #f5f5f5; padding: 10px 15px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    .accordion-header:hover { background: #e0e0e0; }
    .accordion-content.show { display: block; }
    pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-size: 11px; max-height: 200px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">📄 対象企業を選択</div>
    <div class="sheet-list" id="sheetList"></div>
  </div>

  <div class="info-box" id="companyInfo">
    <strong>🏢 選択中：</strong><span id="selectedCompany">（シートを選択してください）</span>
  </div>

  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <span>📝 構成案作成プロンプト（クリックで展開）</span>
      <span id="accordionIcon">▶</span>
    </div>
    <div class="accordion-content" id="accordionContent">
      <button class="btn btn-secondary" onclick="copyTemplate()">📋 テンプレートのみコピー</button>
      <pre id="templatePreview"></pre>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📤 出力</div>
    <textarea class="output-area" id="outputArea" readonly placeholder="「プロンプトを生成」ボタンをクリックすると、ここに完成版プロンプトが表示されます"></textarea>
  </div>

  <div>
    <button class="btn btn-primary" onclick="generatePrompt()">🚀 プロンプトを生成</button>
    <button class="btn btn-success" onclick="copyOutput()" id="copyBtn" disabled>📋 完成版をコピー</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <span class="loading" id="loading">⏳ 処理中...</span>
  </div>

  <div class="status" id="status"></div>

  <script>
    const sheetList = ${sheetListJson};
    const template = \`${escapedTemplate}\`;
    let selectedSheetName = '';

    // 初期化
    window.onload = function() {
      renderSheetList();
      document.getElementById('templatePreview').textContent = template;
    };

    function renderSheetList() {
      const container = document.getElementById('sheetList');
      container.innerHTML = '';

      // アクティブシートを先頭に
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return 0;
      });

      sorted.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sheet-item' + (item.isActive ? ' selected' : '');
        div.innerHTML = \`
          <input type="radio" name="sheet" value="\${item.sheetName}" \${item.isActive ? 'checked' : ''}>
          <span>\${item.sheetName}</span>
          \${item.isActive ? '<span class="active-badge">アクティブ</span>' : ''}
          \${item.companyName ? '<span class="company-name">（' + item.companyName + '）</span>' : ''}
        \`;
        div.onclick = function() {
          selectSheet(item.sheetName, item.companyName || item.sheetName);
          document.querySelectorAll('.sheet-item').forEach(el => el.classList.remove('selected'));
          div.classList.add('selected');
          div.querySelector('input').checked = true;
        };
        container.appendChild(div);

        if (item.isActive) {
          selectedSheetName = item.sheetName;
          document.getElementById('selectedCompany').textContent = item.companyName || item.sheetName;
        }
      });
    }

    function selectSheet(sheetName, companyName) {
      selectedSheetName = sheetName;
      document.getElementById('selectedCompany').textContent = companyName;
    }

    function toggleAccordion() {
      const content = document.getElementById('accordionContent');
      const icon = document.getElementById('accordionIcon');
      content.classList.toggle('show');
      icon.textContent = content.classList.contains('show') ? '▼' : '▶';
    }

    function copyTemplate() {
      navigator.clipboard.writeText(template).then(() => {
        showStatus('テンプレートをコピーしました', 'success');
      });
    }

    function generatePrompt() {
      if (!selectedSheetName) {
        showStatus('シートを選択してください', 'error');
        return;
      }

      document.getElementById('loading').style.display = 'inline';
      document.getElementById('copyBtn').disabled = true;

      google.script.run
        .withSuccessHandler(function(result) {
          document.getElementById('loading').style.display = 'none';
          if (result.success) {
            const fullPrompt = template.replace('{{input}}', JSON.stringify(result.data, null, 2));
            document.getElementById('outputArea').value = fullPrompt;
            document.getElementById('copyBtn').disabled = false;
            showStatus('プロンプトを生成しました。「完成版をコピー」してAIに貼り付けてください。', 'success');
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
      const output = document.getElementById('outputArea').value;
      navigator.clipboard.writeText(output).then(() => {
        showStatus('✅ コピー完了！AIに貼り付けて実行してください。', 'success');
      });
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

  // 保存キーを決定（原稿用か動画用か）
  let saveKey = '構成案_原稿用';  // デフォルト
  if (promptName === '撮影指示書変換') {
    saveKey = '構成案_動画用';
  }

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
  const saveKeyJson = JSON.stringify(saveKey || '構成案_原稿用');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${CI_DIALOG_STYLES}
  <style>
    /* createConvertDialog固有スタイル */
    h3 { margin: 0 0 10px 0; color: #1a73e8; }
    .input-area { width: 100%; height: 180px; font-family: monospace; font-size: 12px; resize: vertical; margin-bottom: 10px; }
    .output-area { width: 100%; height: 200px; font-family: monospace; font-size: 12px; resize: vertical; background: #f9f9f9; }
    .btn-success { background: #4caf50; color: white; }
    .btn-success:hover { background: #388e3c; }
    .btn-save { background: #ff9800; color: white; padding: 8px 16px; font-size: 13px; }
    .btn-save:hover { background: #f57c00; }
    .status.info { display: block; background: #e3f2fd; color: #1565c0; }
    .accordion-header { background: #f5f5f5; padding: 10px 15px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
    .accordion-header:hover { background: #e0e0e0; }
    .accordion-content.show { display: block; }
    pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-size: 11px; max-height: 150px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px; }
    /* シート選択UI */
    .sheet-select-box { background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #ddd; }
    .sheet-select-title { font-weight: bold; margin-bottom: 8px; color: #333; font-size: 13px; }
    .sheet-list { max-height: 100px; overflow-y: auto; }
    .sheet-option { display: flex; align-items: center; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-bottom: 3px; font-size: 13px; }
    .sheet-option:hover { background: #e3f2fd; }
    .sheet-option.selected { background: #bbdefb; }
    .sheet-option.has-data { border-left: 3px solid #ff9800; }
    .sheet-option input[type="radio"] { margin-right: 8px; }
    .badge { font-size: 10px; padding: 2px 6px; border-radius: 8px; margin-left: 6px; }
    .badge-saved { background: #ff9800; color: white; }
  </style>
</head>
<body>
  <h3>${title}</h3>
  <p class="description">${description}</p>

  <!-- シート選択UI -->
  <div class="sheet-select-box">
    <div class="sheet-select-title">📄 対象企業（保存先）を選択</div>
    <div id="sheetList" class="sheet-list"></div>
  </div>

  <div class="accordion">
    <div class="accordion-header" onclick="toggleAccordion()">
      <span>📝 変換プロンプトを確認（クリックで展開）</span>
      <span id="accordionIcon">▶</span>
    </div>
    <div class="accordion-content" id="accordionContent">
      <pre id="templatePreview"></pre>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      📥 ${inputLabel}
      <button class="btn-save" onclick="saveDraft()">💾 シートに保存</button>
    </div>
    <textarea class="input-area" id="inputArea" placeholder="${inputPlaceholder}"></textarea>
    <button class="btn btn-primary" onclick="generateConvertPrompt()">🔄 変換プロンプトを生成</button>
  </div>

  <div class="section">
    <div class="section-title">📤 出力（AIに貼り付けるプロンプト）</div>
    <textarea class="output-area" id="outputArea" readonly placeholder="「変換プロンプトを生成」をクリックすると、ここに完成版プロンプトが表示されます"></textarea>
  </div>

  <div>
    <button class="btn btn-success" onclick="copyOutput()" id="copyBtn" disabled>📋 完成版をコピー</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="status" id="status"></div>

  <script>
    const template = \`${escapedTemplate}\`;
    const sheetList = ${sheetListJson};
    const saveKey = ${saveKeyJson};
    let selectedSheetName = '';

    window.onload = function() {
      document.getElementById('templatePreview').textContent = template;
      renderSheetList();
    };

    function renderSheetList() {
      const container = document.getElementById('sheetList');

      if (!sheetList || sheetList.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:8px;">企業シートがありません</div>';
        return;
      }

      // アクティブシートを先頭に
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return 0;
      });

      let html = '';
      sorted.forEach((item, index) => {
        const isFirst = index === 0;
        if (isFirst) selectedSheetName = item.sheetName;

        const selectedClass = isFirst ? 'selected' : '';
        const hasDataClass = item.hasSavedData ? 'has-data' : '';
        const activeBadge = item.isActive ? '<span class="badge badge-active">アクティブ</span>' : '';
        const savedBadge = item.hasSavedData ? '<span class="badge badge-saved">保存済</span>' : '';
        const savedData = saveKey === '構成案_動画用' ? item.savedDraftDouga : item.savedDraftGenko;

        html += \`
          <div class="sheet-option \${selectedClass} \${hasDataClass}" onclick="selectSheet('\${escapeHtml(item.sheetName)}', '\${escapeHtml(savedData || '')}', this)">
            <input type="radio" name="targetSheet" value="\${escapeHtml(item.sheetName)}" \${isFirst ? 'checked' : ''}>
            <label>\${escapeHtml(item.sheetName)}\${activeBadge}\${savedBadge}</label>
          </div>
        \`;
      });

      container.innerHTML = html;

      // 最初のシートの保存済みデータを読み込む
      const firstSheet = sorted[0];
      const savedData = saveKey === '構成案_動画用' ? firstSheet.savedDraftDouga : firstSheet.savedDraftGenko;
      if (savedData) {
        document.getElementById('inputArea').value = savedData;
        showStatus('保存済みの構成案を読み込みました', 'info');
      }
    }

    function selectSheet(sheetName, savedData, element) {
      document.querySelectorAll('.sheet-option').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.sheet-option input[type="radio"]').forEach(el => el.checked = false);

      element.classList.add('selected');
      element.querySelector('input[type="radio"]').checked = true;
      selectedSheetName = sheetName;

      // 保存済みデータがあれば読み込む
      const currentInput = document.getElementById('inputArea').value.trim();
      if (savedData) {
        if (currentInput && currentInput !== savedData) {
          if (confirm('保存済みの構成案を読み込みますか？\\n（現在の入力は破棄されます）')) {
            document.getElementById('inputArea').value = savedData;
            showStatus('保存済みの構成案を読み込みました', 'info');
          }
        } else {
          document.getElementById('inputArea').value = savedData;
          showStatus('保存済みの構成案を読み込みました', 'info');
        }
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toggleAccordion() {
      const content = document.getElementById('accordionContent');
      const icon = document.getElementById('accordionIcon');
      content.classList.toggle('show');
      icon.textContent = content.classList.contains('show') ? '▼' : '▶';
    }

    function saveDraft() {
      if (!selectedSheetName) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }
      const input = document.getElementById('inputArea').value.trim();
      if (!input) {
        showStatus('構成案を入力してください', 'error');
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('💾 構成案を企業シートに保存しました', 'success');
          } else if (result.needConfirm) {
            if (confirm('既存のデータを上書きしますか？')) {
              google.script.run
                .withSuccessHandler(function(r) {
                  if (r.success) showStatus('💾 構成案を上書き保存しました', 'success');
                  else showStatus('保存エラー: ' + r.error, 'error');
                })
                .savePart3DataForce(selectedSheetName, saveKey, input);
            }
          } else {
            showStatus('保存エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('保存エラー: ' + error.message, 'error');
        })
        .savePart3Data(selectedSheetName, saveKey, input, true);
    }

    function generateConvertPrompt() {
      const input = document.getElementById('inputArea').value.trim();

      if (!input) {
        showStatus('構成案を入力してください', 'error');
        return;
      }

      const fullPrompt = template.replace('{{input}}', input);
      document.getElementById('outputArea').value = fullPrompt;
      document.getElementById('copyBtn').disabled = false;
      showStatus('変換プロンプトを生成しました。「完成版をコピー」してAIに貼り付けてください。', 'success');
    }

    function copyOutput() {
      const output = document.getElementById('outputArea').value;
      navigator.clipboard.writeText(output).then(() => {
        showStatus('✅ コピー完了！AIに貼り付けて実行してください。', 'success');
      });
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
