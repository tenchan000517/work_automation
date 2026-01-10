/**
 * Googleフォーム回答 → 内部用ヒアリングシート転記スクリプト
 *
 * 【使い方】
 * 1. フォーム回答が集約されるスプレッドシートにこのスクリプトを追加
 * 2. INTERNAL_SHEET_ID に内部用ヒアリングシートのIDを設定
 * 3. メニューから「転記」を実行
 */

// ========================================
// 設定
// ========================================

// 内部用ヒアリングシートのスプレッドシートID
// TODO: 実際のIDに置き換えてください
const INTERNAL_SHEET_ID = 'YOUR_INTERNAL_SHEET_ID_HERE';

// フォーム回答シートの列マッピング（0始まり）
// フォームの質問順に合わせて調整してください
const FORM_COLUMNS = {
  // タイムスタンプ
  timestamp: 0,

  // セクション1: 企業基本情報
  companyName: 1,
  representative: 2,
  establishedDate: 3,
  address: 4,
  phone: 5,
  hpUrl: 6,
  businessContent: 7,
  licenseNumber: 8,

  // セクション2: 募集職種・雇用条件
  jobTitle: 9,
  employmentType: 10,
  trialPeriodExists: 11,
  trialPeriodDuration: 12,
  trialPeriodConditions: 13,
  transferExists: 14,
  transferLocation: 15,

  // セクション3: 勤務時間
  workStartTime: 16,
  workEndTime: 17,
  actualWorkHours: 18,
  breakTime: 19,
  workPattern2: 20,
  workPattern3: 21,
  workTimeNote: 22,

  // セクション4: 残業
  overtimeExists: 23,
  overtimeStartTime: 24,
  dailyOvertimeHours: 25,
  monthlyOvertimeHours: 26,
  overtimeNote: 27,

  // セクション5: 休日・休暇
  holidayType: 28,
  monthlyHolidays: 29,
  annualHolidays: 30,
  companyCalendarExists: 31,
  longHolidays: 32,
  longHolidaysDetail: 33,
  holidayNote: 34,

  // セクション6: 給与
  salaryType: 35,
  salaryAmount: 36,
  expectedAnnualIncome: 37,
  bonusExists: 38,
  bonusFrequency: 39,
  bonusMonths: 40,
  fixedOvertimeExists: 41,
  fixedOvertimeHours: 42,
  fixedOvertimeAmount: 43,
  salaryIncrease: 44,

  // セクション7: 待遇・福利厚生
  employmentInsurance: 45,
  workersCompInsurance: 46,
  pensionInsurance: 47,
  healthInsurance: 48,
  otherBenefits: 49,

  // セクション8: 会社・職場について
  totalEmployees: 50,
  departmentSize: 51,
  averageAge: 52,
  genderRatio: 53,
  atmosphere: 54,
  companyStrength1: 55,
  companyStrength2: 56,
  companyStrength3: 57,
  aboutUs: 58,

  // セクション9: 募集について
  recruitmentBackground: 59,
  idealCandidate: 60,
  requiredQualifications: 61,
  preferredQualifications: 62,
  selectionProcess: 63,
  targetGender: 64,
  targetAge: 65,
  foreignersAccepted: 66,

  // セクション10: 作業・業務内容
  jobDescription: 67,
  product1: 68,
  product1Size: 69,
  product2: 70,
  product2Size: 71,
  product3: 72,
  product3Size: 73,
  workNotes: 74,

  // セクション11: 社員の声
  employee1Name: 75,
  employee1Dept: 76,
  employee1Years: 77,
  employee1Interview: 78,
  employee2Name: 79,
  employee2Dept: 80,
  employee2Years: 81,
  employee2Interview: 82,

  // セクション12: 求人掲載について
  mainAppealPoint: 83,
  desiredPhotos: 84,
  photoNotes: 85,
  contactName: 86,
  contactEmail: 87
};

// ========================================
// メニュー追加
// ========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ヒアリングシート転記')
    .addItem('選択行を内部シートに転記', 'transferSelectedRow')
    .addItem('最新の回答を転記', 'transferLatestResponse')
    .addItem('全ての未転記回答を転記', 'transferAllPending')
    .addSeparator()
    .addItem('列マッピング確認', 'showColumnMapping')
    .addToUi();
}

// ========================================
// 転記機能
// ========================================

/**
 * 選択されている行を内部シートに転記
 */
function transferSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const activeRange = sheet.getActiveRange();

  if (!activeRange) {
    showAlert('行を選択してから実行してください');
    return;
  }

  const rowNumber = activeRange.getRow();
  if (rowNumber === 1) {
    showAlert('ヘッダー行は転記できません');
    return;
  }

  const data = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const companyName = data[FORM_COLUMNS.companyName];

  if (!companyName) {
    showAlert('企業名が入力されていません');
    return;
  }

  try {
    transferToInternalSheet(data);
    markAsTransferred(sheet, rowNumber);
    showAlert(`「${companyName}」を内部シートに転記しました`);
  } catch (e) {
    showAlert('転記に失敗しました: ' + e.message);
  }
}

/**
 * 最新の回答を転記
 */
function transferLatestResponse() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    showAlert('転記するデータがありません');
    return;
  }

  const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  const companyName = data[FORM_COLUMNS.companyName];

  try {
    transferToInternalSheet(data);
    markAsTransferred(sheet, lastRow);
    showAlert(`「${companyName}」を内部シートに転記しました`);
  } catch (e) {
    showAlert('転記に失敗しました: ' + e.message);
  }
}

/**
 * 内部シートにデータを転記
 */
function transferToInternalSheet(formData) {
  // 内部シートを取得（IDが未設定の場合はアクティブなスプレッドシート内に作成）
  let targetSs;
  if (INTERNAL_SHEET_ID === 'YOUR_INTERNAL_SHEET_ID_HERE') {
    targetSs = SpreadsheetApp.getActiveSpreadsheet();
  } else {
    targetSs = SpreadsheetApp.openById(INTERNAL_SHEET_ID);
  }

  const companyName = formData[FORM_COLUMNS.companyName] || '未設定企業';
  const timestamp = formData[FORM_COLUMNS.timestamp];
  const sheetName = companyName + '_' + formatDateForSheet(timestamp);

  // 新しいシートを作成
  let newSheet;
  try {
    newSheet = targetSs.insertSheet(sheetName);
  } catch (e) {
    // 同名シートが存在する場合はタイムスタンプを追加
    newSheet = targetSs.insertSheet(sheetName + '_' + new Date().getTime());
  }

  // 内部シートの構造を作成
  createInternalSheetStructure(newSheet, formData);

  return newSheet.getName();
}

/**
 * 内部シートの構造を作成してデータを入力
 */
function createInternalSheetStructure(sheet, data) {
  const g = (col) => data[FORM_COLUMNS[col]] || '';

  // シートの幅を設定
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 200);

  let row = 1;

  // ========== Part① 基本情報 ==========
  sheet.getRange(row, 1).setValue('Part① 基本情報').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  sheet.getRange(row, 1, 1, 5).merge();
  row += 2;

  // 企業概要
  sheet.getRange(row, 1).setValue('▼企業概要').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const companyInfo = [
    ['', '企業名', g('companyName'), '設立日', g('establishedDate')],
    ['', '代表者', g('representative'), 'HP', g('hpUrl')],
    ['', '住所', g('address'), '', ''],
    ['', '連絡先', g('phone'), '', ''],
    ['', '事業内容', g('businessContent'), '', ''],
    ['', '許可番号', g('licenseNumber'), '', ''],
    ['', '転勤', g('transferExists'), '転勤先', g('transferLocation')]
  ];
  sheet.getRange(row, 1, companyInfo.length, 5).setValues(companyInfo);
  row += companyInfo.length + 1;

  // 求人区分・雇用形態
  sheet.getRange(row, 1).setValue('▼求人区分・雇用形態').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const employmentInfo = [
    ['', '雇用形態', g('employmentType'), '', ''],
    ['', '職種', g('jobTitle'), '', ''],
    ['', '試用期間', g('trialPeriodExists'), '期間', g('trialPeriodDuration')],
    ['', '試用期間条件', g('trialPeriodConditions'), '', '']
  ];
  sheet.getRange(row, 1, employmentInfo.length, 5).setValues(employmentInfo);
  row += employmentInfo.length + 1;

  // 勤務時間
  sheet.getRange(row, 1).setValue('▼勤務時間').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const workTimeInfo = [
    ['', '①', g('workStartTime'), '～', g('workEndTime')],
    ['', '②', g('workPattern2'), '', ''],
    ['', '③', g('workPattern3'), '', ''],
    ['', '実働', g('actualWorkHours'), '', ''],
    ['', '備考', g('workTimeNote'), '', '']
  ];
  sheet.getRange(row, 1, workTimeInfo.length, 5).setValues(workTimeInfo);
  row += workTimeInfo.length + 1;

  // 休憩時間
  sheet.getRange(row, 1).setValue('▼休憩時間').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  sheet.getRange(row, 1, 1, 5).setValues([['', '休憩', g('breakTime'), '', '']]);
  row += 2;

  // 残業
  sheet.getRange(row, 1).setValue('▼残業').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const overtimeInfo = [
    ['', '残業', g('overtimeExists'), '開始時間', g('overtimeStartTime')],
    ['', '日', g('dailyOvertimeHours'), '月', g('monthlyOvertimeHours')],
    ['', '備考', g('overtimeNote'), '', '']
  ];
  sheet.getRange(row, 1, overtimeInfo.length, 5).setValues(overtimeInfo);
  row += overtimeInfo.length + 1;

  // 休日
  sheet.getRange(row, 1).setValue('▼休日').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const holidayInfo = [
    ['', '休日区分', g('holidayType'), '', ''],
    ['', '月平均休日', g('monthlyHolidays'), '年間休日', g('annualHolidays')],
    ['', '会社カレンダー', g('companyCalendarExists'), '', ''],
    ['', '長期休暇', g('longHolidays'), '', ''],
    ['', '長期休暇詳細', g('longHolidaysDetail'), '', ''],
    ['', '備考', g('holidayNote'), '', '']
  ];
  sheet.getRange(row, 1, holidayInfo.length, 5).setValues(holidayInfo);
  row += holidayInfo.length + 1;

  // 給与
  sheet.getRange(row, 1).setValue('▼給与').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const salaryInfo = [
    ['', '給与形態', g('salaryType'), '給与額', g('salaryAmount')],
    ['', '想定年収', g('expectedAnnualIncome'), '', ''],
    ['', '賞与', g('bonusExists'), '回数', g('bonusFrequency')],
    ['', '賞与月数', g('bonusMonths'), '', ''],
    ['', 'みなし残業', g('fixedOvertimeExists'), '時間', g('fixedOvertimeHours')],
    ['', 'みなし金額', g('fixedOvertimeAmount'), '', ''],
    ['', '昇給', g('salaryIncrease'), '', '']
  ];
  sheet.getRange(row, 1, salaryInfo.length, 5).setValues(salaryInfo);
  row += salaryInfo.length + 1;

  // 待遇・福利厚生
  sheet.getRange(row, 1).setValue('▼待遇・福利厚生').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const benefitsInfo = [
    ['', '雇用保険', g('employmentInsurance'), '労災保険', g('workersCompInsurance')],
    ['', '厚生年金', g('pensionInsurance'), '健康保険', g('healthInsurance')],
    ['', 'その他', g('otherBenefits'), '', '']
  ];
  sheet.getRange(row, 1, benefitsInfo.length, 5).setValues(benefitsInfo);
  row += benefitsInfo.length + 1;

  // 会社情報
  sheet.getRange(row, 1).setValue('▼会社情報').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const companyStats = [
    ['', '従業員数', g('totalEmployees'), '配属人数', g('departmentSize')],
    ['', '平均年齢', g('averageAge'), '男女比', g('genderRatio')]
  ];
  sheet.getRange(row, 1, companyStats.length, 5).setValues(companyStats);
  row += companyStats.length + 1;

  // 募集ターゲット
  sheet.getRange(row, 1).setValue('▼募集ターゲット').setFontWeight('bold').setBackground('#e8f0fe');
  row++;

  const targetInfo = [
    ['', '性別', g('targetGender'), '年齢', g('targetAge')],
    ['', '外国人', g('foreignersAccepted'), '', ''],
    ['', '募集背景', g('recruitmentBackground'), '', ''],
    ['', '求める人材', g('idealCandidate'), '', ''],
    ['', '必須資格', g('requiredQualifications'), '', ''],
    ['', '歓迎資格', g('preferredQualifications'), '', ''],
    ['', '選考フロー', g('selectionProcess'), '', '']
  ];
  sheet.getRange(row, 1, targetInfo.length, 5).setValues(targetInfo);
  row += targetInfo.length + 2;

  // ========== Part② 詳細情報 ==========
  sheet.getRange(row, 1).setValue('Part② 詳細情報').setFontWeight('bold').setBackground('#34a853').setFontColor('white');
  sheet.getRange(row, 1, 1, 5).merge();
  row += 2;

  // 作業内容
  sheet.getRange(row, 1).setValue('▼作業内容').setFontWeight('bold').setBackground('#e6f4ea');
  row++;
  sheet.getRange(row, 1, 1, 5).setValues([['', '作業内容', g('jobDescription'), '', '']]);
  row += 2;

  // 製品・商品
  sheet.getRange(row, 1).setValue('▼製品・商品・部品').setFontWeight('bold').setBackground('#e6f4ea');
  row++;

  const productInfo = [
    ['', '①', g('product1'), '重さ・サイズ', g('product1Size')],
    ['', '②', g('product2'), '重さ・サイズ', g('product2Size')],
    ['', '③', g('product3'), '重さ・サイズ', g('product3Size')],
    ['', '注意点', g('workNotes'), '', '']
  ];
  sheet.getRange(row, 1, productInfo.length, 5).setValues(productInfo);
  row += productInfo.length + 1;

  // 私たちについて
  sheet.getRange(row, 1).setValue('▼私たちについて').setFontWeight('bold').setBackground('#e6f4ea');
  row++;
  sheet.getRange(row, 1, 1, 5).setValues([['', '', g('aboutUs'), '', '']]);
  row += 2;

  // 会社の魅力
  sheet.getRange(row, 1).setValue('▼会社の魅力').setFontWeight('bold').setBackground('#e6f4ea');
  row++;

  const strengthInfo = [
    ['', '魅力①', g('companyStrength1'), '', ''],
    ['', '魅力②', g('companyStrength2'), '', ''],
    ['', '魅力③', g('companyStrength3'), '', '']
  ];
  sheet.getRange(row, 1, strengthInfo.length, 5).setValues(strengthInfo);
  row += strengthInfo.length + 1;

  // 雰囲気
  sheet.getRange(row, 1).setValue('▼雰囲気').setFontWeight('bold').setBackground('#e6f4ea');
  row++;
  sheet.getRange(row, 1, 1, 5).setValues([['', '', g('atmosphere'), '', '']]);
  row += 2;

  // 社員の声
  sheet.getRange(row, 1).setValue('▼社員の声').setFontWeight('bold').setBackground('#e6f4ea');
  row++;

  if (g('employee1Name')) {
    const emp1 = [
      ['', '①氏名', g('employee1Name'), '部署', g('employee1Dept')],
      ['', '勤続', g('employee1Years'), '', ''],
      ['', 'インタビュー', g('employee1Interview'), '', '']
    ];
    sheet.getRange(row, 1, emp1.length, 5).setValues(emp1);
    row += emp1.length + 1;
  }

  if (g('employee2Name')) {
    const emp2 = [
      ['', '②氏名', g('employee2Name'), '部署', g('employee2Dept')],
      ['', '勤続', g('employee2Years'), '', ''],
      ['', 'インタビュー', g('employee2Interview'), '', '']
    ];
    sheet.getRange(row, 1, emp2.length, 5).setValues(emp2);
    row += emp2.length + 1;
  }

  // 求人写真
  sheet.getRange(row, 1).setValue('▼求人写真').setFontWeight('bold').setBackground('#e6f4ea');
  row++;

  const photoInfo = [
    ['', '希望写真', g('desiredPhotos'), '', ''],
    ['', '備考', g('photoNotes'), '', '']
  ];
  sheet.getRange(row, 1, photoInfo.length, 5).setValues(photoInfo);
  row += photoInfo.length + 1;

  // 最も打ち出したいポイント
  sheet.getRange(row, 1).setValue('▼最も打ち出したいポイント').setFontWeight('bold').setBackground('#e6f4ea');
  row++;
  sheet.getRange(row, 1, 1, 5).setValues([['', '', g('mainAppealPoint'), '', '']]);
  row += 2;

  // 担当者情報
  sheet.getRange(row, 1).setValue('▼ご担当者情報').setFontWeight('bold').setBackground('#fce8e6');
  row++;

  const contactInfo = [
    ['', '担当者名', g('contactName'), '', ''],
    ['', 'メール', g('contactEmail'), '', ''],
    ['', '回答日時', data[FORM_COLUMNS.timestamp], '', '']
  ];
  sheet.getRange(row, 1, contactInfo.length, 5).setValues(contactInfo);
}

/**
 * 転記済みマークを付ける（A列にチェック）
 */
function markAsTransferred(sheet, rowNumber) {
  // 最終列の次に「転記済み」列を追加する方式
  const lastCol = sheet.getLastColumn();
  const headerCell = sheet.getRange(1, lastCol + 1);

  if (headerCell.getValue() !== '転記済み') {
    headerCell.setValue('転記済み');
  }

  sheet.getRange(rowNumber, lastCol + 1).setValue('✓ ' + new Date().toLocaleString('ja-JP'));
}

// ========================================
// ユーティリティ
// ========================================

function formatDateForSheet(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyyMMdd');
}

function showAlert(message) {
  SpreadsheetApp.getUi().alert(message);
}

/**
 * 列マッピングを確認（デバッグ用）
 */
function showColumnMapping() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let output = '=== フォーム列マッピング ===\n\n';
  output += 'ヘッダー行の内容:\n';
  headers.forEach((h, i) => {
    if (h) output += `[${i}] ${h}\n`;
  });

  output += '\n\n=== 現在の設定 ===\n';
  for (const key in FORM_COLUMNS) {
    const colIndex = FORM_COLUMNS[key];
    const headerName = headers[colIndex] || '(空)';
    output += `${key}: [${colIndex}] → "${headerName}"\n`;
  }

  const html = HtmlService.createHtmlOutput(
    '<textarea style="width:100%;height:450px;font-family:monospace;font-size:12px">' +
    output.replace(/</g, '&lt;') +
    '</textarea>'
  ).setWidth(700).setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '列マッピング確認');
}
