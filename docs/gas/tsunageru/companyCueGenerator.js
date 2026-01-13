/**
 * 企業カンペ作成 GAS
 *
 * 撮影当日にタブレットで表示するQ&Aシートを作成
 * - 02_企業カンペフォルダにスプレッドシートとして保存
 * - 3シート構成: 社員インタビュー、社長インタビュー、インタビュイー
 */

// ================================================================================
// ===== 定数 =====
// ================================================================================

// 色定義
const CUE_COLORS = {
  HEADER_YELLOW: '#ffe598',
  EMPLOYEE_ORANGE: '#f7caac',
  PRESIDENT_GREEN: '#c5e0b3',
  INTERVIEWEE_BLUE: '#b4c6e7',
  SCENE_PURPLE: '#d9d2e9'
};

// 社員インタビュー質問（質問 + 追加質問）
const EMPLOYEE_INTERVIEW_QUESTIONS = [
  { num: '①', question: '働く上で、「これだけは譲れない」と思っていることは何ですか？', extra: 'それが揺らいだことは？もし失ったら辞める理由になる？' },
  { num: '②', question: 'この会社に惹かれた一番の理由は何でしたか？', extra: '当時、何に不安を感じていた？決め手になった一言・出来事は？' },
  { num: '③', question: '実際に働いてみて、思っていたより大変だったことは何ですか？', extra: '正直、想定外だった点は？ここを知らずに入ると危険な点は？' },
  { num: '④', question: '「もう無理かも」と思った瞬間があれば、それでも続けた理由は何ですか？', extra: '誰か／何かが支えた？辞めなかった決定打は？' },
  { num: '⑤', question: 'ここで働いてから、一番変わった自分の考え方・姿勢は何ですか？', extra: '入社前の自分に声をかけるなら？今だから言えることは？' },
  { num: '⑥', question: 'この職場で活躍している人に共通する特徴を、行動レベルで3つ挙げてください。', extra: '例：× 主体性がある → ○ 困ったら指示を待たずに○○する' },
  { num: '⑦', question: '正直、この環境が合わなかった人にはどんな共通点がありましたか？', extra: '入社後、どこでズレが出た？どんな人が早く苦しくなる？' },
  { num: '⑧', question: 'この職場をモノや場面に例えると、何が一番近いですか？', extra: 'なぜその例え？楽な場所？厳しい？' },
  { num: '⑨', question: 'これから応募しようとしている人に、あえて厳しいことを一言で言うとしたら？', extra: '' },
  { num: '⑩', question: 'それでも「こういう人となら一緒に働きたい」と思うのは、どんな人ですか？', extra: '' }
];

// 社長インタビュー質問（質問 + 追加質問）
const PRESIDENT_INTERVIEW_QUESTIONS = [
  { num: '①', question: '社長ご自身が、「この会社のここは結構好きだな」と思っている点はどこですか？', extra: '日常のどんな場面でそう感じる？それがあるから続けられている部分は？' },
  { num: '②', question: '他社と比べて、「うちはここが違うな」と感じている点は何ですか？', extra: '昔からですか？後からつくったもの？社員はそこをどう受け取っていると思う？' },
  { num: '③', question: '長く続いている社員がいる理由は、社長から見て何だと思いますか？', extra: 'お金・仕事・人、どれが一番近い？辞めずに残る人の共通点は？' },
  { num: '④', question: '正直、「ここはもっと知られていい」と思う部分はどこですか？', extra: '求人ではあまり伝えられていない点は？初めて来た人が驚くポイントは？' },
  { num: '⑤', question: '社長が「この仕事やっててよかったな」と感じるのはどんな瞬間ですか？', extra: '最近あった具体的な出来事は？昔と比べて変わったところは？' },
  { num: '⑥', question: 'この会社ならではの働き方・空気感を、一言で表すとしたら何が近いですか？', extra: 'それを好む人はどんなタイプ？逆に、合わない人はどんな人？' },
  { num: '⑦', question: 'これから応募する人に、「ここは安心してほしい」と伝えたいことは何ですか？', extra: '' },
  { num: '⑧', question: '働きやすさの中でも、社長として「ここだけは大事にしている」ことは何ですか？', extra: '' },
  { num: '⑨', question: 'この会社の良さを一番活かせるのは、どんな人だと思いますか？', extra: '' },
  { num: '⑩', question: '最後に、「こういう人なら、きっと楽しく働ける」と思う人へ一言メッセージをお願いします。', extra: '' }
];


// ================================================================================
// ===== 撮影指示書パース =====
// ================================================================================

/**
 * 撮影指示書からインタビュー対象者を抽出
 */
function parseInterviewees(instruction) {
  const interviewees = [];
  if (!instruction) return interviewees;

  const sectionMatch = instruction.match(/■\s*インタビュー対象者[\s\S]*?(?=■|$)/);
  if (!sectionMatch) return interviewees;

  const section = sectionMatch[0];
  const pattern = /【対象者\d+】([^【\n]+)/g;
  let match;

  while ((match = pattern.exec(section)) !== null) {
    const line = match[1].trim();
    const parts = line.split('／');
    let name = '', role = '', location = '';

    for (const part of parts) {
      if (part.includes('氏名') || part.includes('役職')) {
        const colonIdx = part.indexOf('：');
        if (colonIdx >= 0) {
          const value = part.substring(colonIdx + 1).trim();
          if (part.includes('氏名')) name = value;
          else role = value;
        }
      } else if (part.includes('撮影場所')) {
        const colonIdx = part.indexOf('：');
        if (colonIdx >= 0) location = part.substring(colonIdx + 1).trim();
      }
    }

    if (!name && !role) {
      const simpleMatch = line.match(/氏名[\/／]役職[：:]\s*(.+?)(?:／|$)/);
      if (simpleMatch) name = simpleMatch[1].trim();
    }

    if (name || role || location) {
      interviewees.push({ name, role, location });
    }
  }

  return interviewees;
}

/**
 * 撮影指示書から撮影シーンを抽出
 */
function parseShootingScenes(instruction) {
  const scenes = [];
  if (!instruction) return scenes;

  const sectionMatch = instruction.match(/■\s*撮影シーン[（(]チェックリスト[)）][\s\S]*?(?=■|$)/);
  if (!sectionMatch) return scenes;

  const section = sectionMatch[0];
  const lines = section.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('□')) {
      const scene = trimmed.substring(1).trim();
      if (scene) scenes.push(scene);
    }
  }

  return scenes;
}


// ================================================================================
// ===== 企業カンペ作成（3シート構成） =====
// ================================================================================

/**
 * 企業カンペスプレッドシートを作成
 */
function createCompanyCueSheet(companyName, folderId, options) {
  options = options || {};
  const employeeCount = options.employeeCount || 2;
  const shootingInstruction = options.shootingInstruction || '';

  try {
    const ss = SpreadsheetApp.create(companyName + '_企業カンペ');

    const interviewees = parseInterviewees(shootingInstruction);
    const scenes = parseShootingScenes(shootingInstruction);

    // シート1: 社員インタビュー
    const employeeSheet = ss.getActiveSheet();
    employeeSheet.setName('社員インタビュー');
    createEmployeeInterviewSheet(employeeSheet, employeeCount);

    // シート2: 社長インタビュー
    const presidentSheet = ss.insertSheet('社長インタビュー');
    createPresidentInterviewSheet(presidentSheet);

    // シート3: インタビュイー（全部入り）
    const intervieweeSheet = ss.insertSheet('インタビュイー');
    createIntervieweeSheet(intervieweeSheet, interviewees, scenes, employeeCount);

    // フォルダに移動
    const file = DriveApp.getFileById(ss.getId());
    const folder = DriveApp.getFolderById(folderId);
    file.moveTo(folder);

    return {
      success: true,
      spreadsheetUrl: ss.getUrl(),
      spreadsheetId: ss.getId()
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * 社員インタビューシート（質問 | 回答 | 追加質問 | 追加回答）
 * ※1人分のみ作成（複数人分必要な場合はシートをコピーして使用）
 */
function createEmployeeInterviewSheet(sheet, employeeCount) {
  sheet.setColumnWidth(1, 50);   // No.
  sheet.setColumnWidth(2, 350);  // 質問
  sheet.setColumnWidth(3, 500);  // 回答（27pt用）
  sheet.setColumnWidth(4, 280);  // 追加質問
  sheet.setColumnWidth(5, 500);  // 追加回答（27pt用）

  let row = 1;

  // ヘッダー
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('社員インタビュー');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.EMPLOYEE_ORANGE)
    .setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(row, 35);
  row++;

  // サブヘッダー
  sheet.getRange(row, 1).setValue('No.');
  sheet.getRange(row, 2).setValue('質問');
  sheet.getRange(row, 3).setValue('回答（現地で入力）');
  sheet.getRange(row, 4).setValue('追加質問');
  sheet.getRange(row, 5).setValue('追加回答');
  sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.EMPLOYEE_ORANGE)
    .setFontSize(11).setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  // 質問行
  for (const q of EMPLOYEE_INTERVIEW_QUESTIONS) {
    sheet.getRange(row, 1).setValue(q.num).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(16);
    sheet.getRange(row, 2).setValue(q.question).setWrap(true).setVerticalAlignment('middle').setFontSize(14);
    sheet.getRange(row, 3).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(row, 4).setValue(q.extra).setWrap(true).setVerticalAlignment('middle').setFontSize(12);
    sheet.getRange(row, 5).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.setRowHeight(row, 200);
    row++;
  }
}


/**
 * 社長インタビューシート（質問 | 回答 | 追加質問 | 追加回答）
 */
function createPresidentInterviewSheet(sheet) {
  sheet.setColumnWidth(1, 50);   // No.
  sheet.setColumnWidth(2, 350);  // 質問
  sheet.setColumnWidth(3, 500);  // 回答（27pt用）
  sheet.setColumnWidth(4, 280);  // 追加質問
  sheet.setColumnWidth(5, 500);  // 追加回答（27pt用）

  let row = 1;

  // ヘッダー
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('社長インタビュー');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.PRESIDENT_GREEN)
    .setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(row, 35);
  row++;

  // サブヘッダー
  sheet.getRange(row, 1).setValue('No.');
  sheet.getRange(row, 2).setValue('質問');
  sheet.getRange(row, 3).setValue('回答（現地で入力）');
  sheet.getRange(row, 4).setValue('追加質問');
  sheet.getRange(row, 5).setValue('追加回答');
  sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.PRESIDENT_GREEN)
    .setFontSize(11).setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  // 質問行
  for (const q of PRESIDENT_INTERVIEW_QUESTIONS) {
    sheet.getRange(row, 1).setValue(q.num).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(16);
    sheet.getRange(row, 2).setValue(q.question).setWrap(true).setVerticalAlignment('middle').setFontSize(14);
    sheet.getRange(row, 3).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(row, 4).setValue(q.extra).setWrap(true).setVerticalAlignment('middle').setFontSize(12);
    sheet.getRange(row, 5).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.setRowHeight(row, 200);
    row++;
  }
}


/**
 * インタビュイーシート（撮影概要 + 対象者 + シーン + 社員質問 + 社長質問）
 */
function createIntervieweeSheet(sheet, interviewees, scenes, employeeCount) {
  // 5列構成に統一（社員/社長シートと同じ列幅）
  sheet.setColumnWidth(1, 50);   // No.
  sheet.setColumnWidth(2, 350);  // 質問
  sheet.setColumnWidth(3, 500);  // 回答（27pt用）
  sheet.setColumnWidth(4, 280);  // 追加質問
  sheet.setColumnWidth(5, 500);  // 追加回答（27pt用）

  let row = 1;

  // ===== 撮影概要 =====
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('■ 撮影概要');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.HEADER_YELLOW)
    .setFontSize(14).setFontWeight('bold');
  sheet.setRowHeight(row, 30);
  row++;

  // 概要ヘッダー
  sheet.getRange(row, 1).setValue('項目');
  sheet.getRange(row, 2).setValue('撮影内容');
  sheet.getRange(row, 3).setValue('撮影本数');
  sheet.getRange(row, 4, 1, 2).merge();
  sheet.getRange(row, 4).setValue('撮影工数(分)');
  sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.HEADER_YELLOW)
    .setFontSize(10).setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  // 社員インタビュー行
  sheet.getRange(row, 1).setValue('1⃣').setHorizontalAlignment('center');
  sheet.getRange(row, 2).setValue('社員インタビュー');
  sheet.getRange(row, 3).setValue(employeeCount + '本').setHorizontalAlignment('center');
  sheet.getRange(row, 4, 1, 2).merge();
  sheet.getRange(row, 4).setValue('15').setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  // 社長インタビュー行
  sheet.getRange(row, 1).setValue('2⃣').setHorizontalAlignment('center');
  sheet.getRange(row, 2).setValue('社長インタビュー');
  sheet.getRange(row, 3).setValue('1本').setHorizontalAlignment('center');
  sheet.getRange(row, 4, 1, 2).merge();
  sheet.getRange(row, 4).setValue('10').setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  // 必要備品
  sheet.getRange(row, 1).setValue('必要備品').setHorizontalAlignment('center');
  sheet.getRange(row, 2, 1, 4).merge();
  sheet.getRange(row, 2).setValue('').setBackground('#ffffff');
  sheet.setRowHeight(row, 25);
  row += 2;

  // ===== インタビュー対象者 =====
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('■ インタビュー対象者');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.INTERVIEWEE_BLUE)
    .setFontSize(14).setFontWeight('bold');
  sheet.setRowHeight(row, 30);
  row++;

  sheet.getRange(row, 1).setValue('No.');
  sheet.getRange(row, 2).setValue('氏名');
  sheet.getRange(row, 3).setValue('役職');
  sheet.getRange(row, 4, 1, 2).merge();
  sheet.getRange(row, 4).setValue('撮影場所');
  sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.INTERVIEWEE_BLUE)
    .setFontSize(10).setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  const targetCount = interviewees.length > 0 ? interviewees.length : 3;
  for (let i = 0; i < targetCount; i++) {
    const interviewee = interviewees[i] || { name: '', role: '', location: '' };
    sheet.getRange(row, 1).setValue('対象者' + (i + 1)).setHorizontalAlignment('center');
    sheet.getRange(row, 2).setValue(interviewee.name);
    sheet.getRange(row, 3).setValue(interviewee.role);
    sheet.getRange(row, 4, 1, 2).merge();
    sheet.getRange(row, 4).setValue(interviewee.location);
    sheet.setRowHeight(row, 25);
    row++;
  }
  row += 2;

  // ===== 撮影シーン =====
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('■ 撮影シーン（チェックリスト）');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.SCENE_PURPLE)
    .setFontSize(14).setFontWeight('bold');
  sheet.setRowHeight(row, 30);
  row++;

  const sceneCount = scenes.length > 0 ? scenes.length : 5;
  for (let i = 0; i < sceneCount; i++) {
    const scene = scenes[i] || '';
    sheet.getRange(row, 1).insertCheckboxes();  // チェックボックス
    sheet.getRange(row, 2, 1, 4).merge();
    sheet.getRange(row, 2).setValue(scene);
    sheet.setRowHeight(row, 25);
    row++;
  }
  row += 2;

  // ===== 社員インタビュー（質問 | 回答 | 追加質問 | 追加回答） =====
  for (let empNum = 1; empNum <= employeeCount; empNum++) {
    sheet.getRange(row, 1, 1, 5).merge();
    sheet.getRange(row, 1).setValue('■ 社員インタビュー ' + getCircledNumber(empNum));
    sheet.getRange(row, 1).setBackground(CUE_COLORS.EMPLOYEE_ORANGE)
      .setFontSize(14).setFontWeight('bold');
    sheet.setRowHeight(row, 30);
    row++;

    sheet.getRange(row, 1).setValue('No.');
    sheet.getRange(row, 2).setValue('質問');
    sheet.getRange(row, 3).setValue('回答');
    sheet.getRange(row, 4).setValue('追加質問');
    sheet.getRange(row, 5).setValue('追加回答');
    sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.EMPLOYEE_ORANGE)
      .setFontSize(11).setHorizontalAlignment('center');
    sheet.setRowHeight(row, 25);
    row++;

    for (const q of EMPLOYEE_INTERVIEW_QUESTIONS) {
      sheet.getRange(row, 1).setValue(q.num).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(16);
      sheet.getRange(row, 2).setValue(q.question).setWrap(true).setVerticalAlignment('middle').setFontSize(14);
      sheet.getRange(row, 3).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
      sheet.getRange(row, 4).setValue(q.extra).setWrap(true).setVerticalAlignment('middle').setFontSize(12);
      sheet.getRange(row, 5).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
      sheet.setRowHeight(row, 200);
      row++;
    }
    row += 2;
  }

  // ===== 社長インタビュー（質問 | 回答 | 追加質問 | 追加回答） =====
  sheet.getRange(row, 1, 1, 5).merge();
  sheet.getRange(row, 1).setValue('■ 社長インタビュー');
  sheet.getRange(row, 1).setBackground(CUE_COLORS.PRESIDENT_GREEN)
    .setFontSize(14).setFontWeight('bold');
  sheet.setRowHeight(row, 30);
  row++;

  sheet.getRange(row, 1).setValue('No.');
  sheet.getRange(row, 2).setValue('質問');
  sheet.getRange(row, 3).setValue('回答');
  sheet.getRange(row, 4).setValue('追加質問');
  sheet.getRange(row, 5).setValue('追加回答');
  sheet.getRange(row, 1, 1, 5).setBackground(CUE_COLORS.PRESIDENT_GREEN)
    .setFontSize(11).setHorizontalAlignment('center');
  sheet.setRowHeight(row, 25);
  row++;

  for (const q of PRESIDENT_INTERVIEW_QUESTIONS) {
    sheet.getRange(row, 1).setValue(q.num).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(16);
    sheet.getRange(row, 2).setValue(q.question).setWrap(true).setVerticalAlignment('middle').setFontSize(14);
    sheet.getRange(row, 3).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(row, 4).setValue(q.extra).setWrap(true).setVerticalAlignment('middle').setFontSize(12);
    sheet.getRange(row, 5).setValue('').setBackground('#ffffff').setFontSize(27).setVerticalAlignment('middle').setWrap(true);
    sheet.setRowHeight(row, 200);
    row++;
  }
}


/**
 * 丸数字を取得
 */
function getCircledNumber(num) {
  const circled = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  return circled[num] || num + '';
}


// ================================================================================
// ===== 外部呼び出し用 =====
// ================================================================================

/**
 * 02_企業カンペフォルダを探して企業カンペを作成
 * @param {string} companyName - 企業名
 * @param {string} mainFolderUrl - メインフォルダURL
 * @param {string} sheetName - ヒアリングシート名（Part③保存用）
 * @param {string} shootingInstruction - 撮影指示書テキスト
 * @param {Object} options - オプション
 * @param {boolean} options.checkOnly - trueの場合、既存チェックのみ（作成しない）
 * @param {boolean} options.forceReplace - trueの場合、既存を削除して新規作成
 */
function createCompanyCueInFolder(companyName, mainFolderUrl, sheetName, shootingInstruction, options) {
  options = options || {};

  try {
    const match = mainFolderUrl.match(/[-\w]{25,}/);
    if (!match) {
      return { success: false, error: 'フォルダURLが無効です' };
    }
    const mainFolderId = match[0];

    const mainFolder = DriveApp.getFolderById(mainFolderId);
    const subFolders = mainFolder.getFolders();
    let cueFolderId = null;
    let cueFolder = null;

    while (subFolders.hasNext()) {
      const folder = subFolders.next();
      if (folder.getName().includes('企業カンペ')) {
        cueFolderId = folder.getId();
        cueFolder = folder;
        break;
      }
    }

    if (!cueFolderId) {
      const newFolder = mainFolder.createFolder('02_企業カンペ');
      cueFolderId = newFolder.getId();
      cueFolder = newFolder;
    }

    // 既存ファイルをチェック
    const existingFile = findExistingCueFile(cueFolder, companyName);

    // チェックのみの場合
    if (options.checkOnly) {
      if (existingFile) {
        return {
          success: true,
          exists: true,
          existingUrl: existingFile.getUrl(),
          existingName: existingFile.getName()
        };
      } else {
        return { success: true, exists: false };
      }
    }

    // 既存がある場合
    if (existingFile) {
      if (options.forceReplace) {
        // 削除して新規作成
        existingFile.setTrashed(true);
      } else {
        // 既存があることを通知（確認を促す）
        return {
          success: false,
          exists: true,
          existingUrl: existingFile.getUrl(),
          existingName: existingFile.getName(),
          error: '既に企業カンペが存在します'
        };
      }
    }

    // 新規作成
    const result = createCompanyCueSheet(companyName, cueFolderId, {
      employeeCount: 2,
      shootingInstruction: shootingInstruction || ''
    });

    if (result.success && sheetName) {
      savePart3DataForce(sheetName, '企業カンペURL', result.spreadsheetUrl);
    }

    return result;

  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * フォルダ内の既存企業カンペファイルを検索
 */
function findExistingCueFile(folder, companyName) {
  const files = folder.getFiles();
  const searchName = companyName + '_企業カンペ';

  while (files.hasNext()) {
    const file = files.next();
    if (file.getName() === searchName) {
      return file;
    }
  }
  return null;
}
