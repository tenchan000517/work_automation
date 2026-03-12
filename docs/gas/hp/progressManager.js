/**
 * HP制作 進捗管理機能
 *
 * 【機能】
 * 1. ヒアリングシートの2-3行目にステータス欄を追加（2行構成）
 * 2. 進捗一覧シートの作成・更新
 * 3. 進捗ログの記録（I〜N列）
 *
 * 【ステータス欄の構成（7項目）】
 * 2行目: ヘッダー（納期 / 現在タスク / タスク保持者 / 状態 / 期限 / 最終更新日 / 全体ステータス）
 * 3行目: 入力欄（日付 / ドロップダウン / ドロップダウン / ドロップダウン / 日付 / 自動 / ドロップダウン）
 *
 * 【設計思想】
 * - hearingSheetManager.jsの定数（HP_TASKS, HP_TASK_HOLDERS等）を参照
 * - ツナゲルほど複雑にしない（不変・シンプル）
 */

// ===== 定数 =====
const HP_PROGRESS_SHEET_NAME = '進捗一覧';

// phaseマッピング（タスク番号 → フェーズ）
const HP_PHASE_MAPPING = {
  0: '受注・立ち上げ',
  1: '受注・立ち上げ',
  2: '受注・立ち上げ',
  3: '制作準備',
  4: '制作準備',
  5: '制作',
  6: '制作',
  7: '制作',
  8: '確認・修正',
  9: '納品',
  10: '運用'
};

// ステータス欄の位置（固定: 2-3行目）
const HP_STATUS_HEADER_ROW = 2;
const HP_STATUS_VALUE_ROW = 3;

// ステータス欄の列位置（7項目: A〜G列）
const HP_STATUS_COLUMNS = {
  DUE_DATE: 1,      // A列: 納期
  TASK: 2,          // B列: 現在タスク
  HOLDER: 3,        // C列: タスク保持者
  STATE: 4,         // D列: 状態
  DEADLINE: 5,      // E列: 期限
  UPDATED_AT: 6,    // F列: 最終更新日
  OVERALL: 7        // G列: 全体ステータス
};

// ログエリアの列位置（I〜N列）
const HP_LOG_COLUMNS = {
  DATETIME: 9,      // I列: 日時
  TASK_CHANGE: 10,  // J列: タスク変更
  HOLDER_CHANGE: 11,// K列: 保持者変更
  STATE: 12,        // L列: 状態
  MEMO: 13,         // M列: メモ
  DURATION: 14      // N列: 工数
};
const HP_LOG_TITLE_ROW = 1;
const HP_LOG_HEADER_ROW = 2;
const HP_LOG_DATA_START_ROW = 3;

// ===== メニュー追加 =====
function hp_addProgressMenu(ui) {
  ui.createMenu('📊 進捗管理')
    .addItem('📋 進捗一覧シートを作成', 'hp_createProgressSheet')
    .addItem('🔄 進捗一覧を更新', 'hp_updateProgressSheet')
    .addSeparator()
    .addItem('📝 現在のシートにステータス欄を追加', 'hp_addStatusSectionToCurrentSheet')
    .addItem('📝 全シートにステータス欄を追加', 'hp_addStatusSectionToAllSheets')
    .addSeparator()
    .addItem('✏️ ステータス更新', 'hp_showStatusUpdateDialog')
    .addToUi();
}

// ===== 1. 進捗一覧シート作成 =====
function hp_createProgressSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 既存チェック
  let progressSheet = ss.getSheetByName(HP_PROGRESS_SHEET_NAME);
  if (progressSheet) {
    const response = ui.alert(
      '確認',
      '進捗一覧シートは既に存在します。再作成しますか？\n（既存データは削除されます）',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    ss.deleteSheet(progressSheet);
  }

  // 新規作成
  progressSheet = ss.insertSheet(HP_PROGRESS_SHEET_NAME, 0);

  // ヘッダー設定（9列）
  const headers = ['企業名', '納期（あと○日）', '現在タスク', 'タスク保持者', '状態', '期限', '最終更新日', '全体ステータス', '直近メモ'];
  progressSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダースタイル
  const headerRange = progressSheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1565C0');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 列幅調整
  progressSheet.setColumnWidth(1, 150); // 企業名
  progressSheet.setColumnWidth(2, 120); // 納期（あと○日）
  progressSheet.setColumnWidth(3, 150); // 現在タスク
  progressSheet.setColumnWidth(4, 100); // タスク保持者
  progressSheet.setColumnWidth(5, 100); // 状態
  progressSheet.setColumnWidth(6, 80);  // 期限
  progressSheet.setColumnWidth(7, 80);  // 最終更新日
  progressSheet.setColumnWidth(8, 100); // 全体ステータス
  progressSheet.setColumnWidth(9, 250); // 直近メモ

  // 行固定
  progressSheet.setFrozenRows(1);

  // 初回更新
  hp_updateProgressSheet();

  ui.alert('完了', '進捗一覧シートを作成しました。', ui.ButtonSet.OK);
}

// ===== 2. 進捗一覧更新 =====
function hp_updateProgressSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const progressSheet = ss.getSheetByName(HP_PROGRESS_SHEET_NAME);
  if (!progressSheet) {
    ui.alert('エラー', '進捗一覧シートがありません。先に作成してください。', ui.ButtonSet.OK);
    return;
  }

  // 除外シート名（HP_EXCLUDED_SHEETSを使用 + 進捗一覧）
  const excludeSheets = [
    HP_PROGRESS_SHEET_NAME,
    ...HP_EXCLUDED_SHEETS
  ];

  // 全シートからステータス情報を取得
  const allSheets = ss.getSheets();
  const progressData = [];

  for (const sheet of allSheets) {
    const sheetName = sheet.getName();

    // 除外シートをスキップ
    if (excludeSheets.includes(sheetName)) continue;
    if (sheetName.startsWith('_')) continue;

    // ステータス情報を取得（2-3行目から）
    const statusInfo = hp_getStatusFromSheet(sheet);
    if (statusInfo) {
      progressData.push([
        sheetName,
        statusInfo.dueDate || '-',
        statusInfo.task || '-',
        statusInfo.holder || '-',
        statusInfo.state || '-',
        statusInfo.deadline || '-',
        statusInfo.updatedAt || '-',
        statusInfo.overall || '-',
        statusInfo.latestMemo || '-'
      ]);
    }
  }

  // データがない場合
  if (progressData.length === 0) {
    ui.alert('情報', '企業シートが見つかりませんでした。', ui.ButtonSet.OK);
    return;
  }

  // 既存データをクリア（ヘッダー以外）
  const lastRow = progressSheet.getLastRow();
  if (lastRow > 1) {
    progressSheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  }

  // データを書き込み
  progressSheet.getRange(2, 1, progressData.length, 9).setValues(progressData);

  // 条件付き書式
  hp_applyConditionalFormatting(progressSheet, progressData.length);

  ui.alert('完了', `${progressData.length}件の企業情報を更新しました。`, ui.ButtonSet.OK);
}

// シートからステータス情報を取得（2-3行目から）
function hp_getStatusFromSheet(sheet) {
  try {
    // 2行目・3行目を取得
    const headerRow = sheet.getRange(HP_STATUS_HEADER_ROW, 1, 1, 8).getValues()[0];
    const valueRow = sheet.getRange(HP_STATUS_VALUE_ROW, 1, 1, 8).getValues()[0];

    // ステータス欄があるかチェック（2行目B列が「現在タスク」かどうか）
    if (String(headerRow[HP_STATUS_COLUMNS.TASK - 1]).includes('現在タスク')) {
      let dueDate = valueRow[HP_STATUS_COLUMNS.DUE_DATE - 1];
      let deadline = valueRow[HP_STATUS_COLUMNS.DEADLINE - 1];
      let updatedAt = valueRow[HP_STATUS_COLUMNS.UPDATED_AT - 1];

      // 納期フォーマット（あと○日表示）
      let dueDateDisplay = '-';
      if (dueDate instanceof Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const dateStr = Utilities.formatDate(dueDate, 'Asia/Tokyo', 'yyyy/MM/dd');
        if (diffDays < 0) {
          dueDateDisplay = dateStr + '（' + Math.abs(diffDays) + '日超過）';
        } else if (diffDays === 0) {
          dueDateDisplay = dateStr + '（本日）';
        } else {
          dueDateDisplay = dateStr + '（あと' + diffDays + '日）';
        }
      } else if (dueDate) {
        dueDateDisplay = String(dueDate);
      }

      // 日付フォーマット
      if (deadline instanceof Date) {
        deadline = Utilities.formatDate(deadline, 'Asia/Tokyo', 'M/d');
      }
      if (updatedAt instanceof Date) {
        updatedAt = Utilities.formatDate(updatedAt, 'Asia/Tokyo', 'M/d');
      }

      // 直近メモを取得（ログエリアから）
      const latestMemo = hp_getLatestMemoFromSheet(sheet);

      return {
        dueDate: dueDateDisplay,
        task: valueRow[HP_STATUS_COLUMNS.TASK - 1] || null,
        holder: valueRow[HP_STATUS_COLUMNS.HOLDER - 1] || null,
        state: valueRow[HP_STATUS_COLUMNS.STATE - 1] || null,
        deadline: deadline || null,
        updatedAt: updatedAt || null,
        overall: valueRow[HP_STATUS_COLUMNS.OVERALL - 1] || null,
        latestMemo: latestMemo || null
      };
    }

    // ステータス欄がない場合、企業シートとして認識
    const sheetName = sheet.getName();
    if (sheetName.includes('株式会社') || sheetName.includes('(株)') || sheetName.includes('有限会社')) {
      return {
        dueDate: '-',
        task: '未設定',
        holder: '未設定',
        state: '-',
        deadline: '-',
        updatedAt: '-',
        overall: '-',
        latestMemo: 'ステータス欄なし'
      };
    }

    return null;
  } catch (e) {
    console.log('Error getting status from sheet: ' + sheet.getName() + ' - ' + e.message);
    return null;
  }
}

// 直近メモを取得
function hp_getLatestMemoFromSheet(sheet) {
  try {
    const lastLogRow = hp_getLastLogRow(sheet);
    if (lastLogRow >= HP_LOG_DATA_START_ROW) {
      return sheet.getRange(lastLogRow, HP_LOG_COLUMNS.MEMO).getValue() || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 条件付き書式を適用
function hp_applyConditionalFormatting(sheet, dataCount) {
  if (dataCount === 0) return;

  // 既存のルールをクリア
  sheet.clearConditionalFormatRules();

  const rules = [];
  const range = sheet.getRange(2, 1, dataCount, 9);

  // タスク保持者が「先方」の場合、行全体を薄い黄色に
  const holderRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="先方"')
    .setBackground('#FFF9C4')
    .setRanges([range])
    .build();
  rules.push(holderRule);

  // 状態が「先方確認」の場合、薄い黄色に
  const waitingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="先方確認"')
    .setBackground('#FFF9C4')
    .setRanges([range])
    .build();
  rules.push(waitingRule);

  // 期限が過ぎている場合、薄い赤に
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($F2<>"", $F2<>"-", $F2<TODAY())')
    .setBackground('#FFCDD2')
    .setRanges([range])
    .build();
  rules.push(overdueRule);

  // 納期が近い場合（3日以内）、薄いオレンジに
  const dueSoonRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(ISNUMBER(SEARCH("あと", $B2)), VALUE(REGEXEXTRACT($B2, "あと(\\d+)日"))<=3)')
    .setBackground('#FFE0B2')
    .setRanges([range])
    .build();
  rules.push(dueSoonRule);

  // 納期超過の場合、薄い赤に
  const dueDateOverdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISNUMBER(SEARCH("超過", $B2))')
    .setBackground('#FFCDD2')
    .setRanges([range])
    .build();
  rules.push(dueDateOverdueRule);

  // 全体ステータスが「完了」の場合、薄い緑に
  const completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$H2="完了"')
    .setBackground('#C8E6C9')
    .setRanges([range])
    .build();
  rules.push(completedRule);

  sheet.setConditionalFormatRules(rules);
}

// ===== 3. ステータス欄追加 =====
function hp_addStatusSectionToCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  // 除外シートチェック
  if (hp_isExcludedSheet(sheet.getName()) || sheet.getName() === HP_PROGRESS_SHEET_NAME) {
    ui.alert('エラー', 'このシートにはステータス欄を追加できません。', ui.ButtonSet.OK);
    return;
  }

  // 既存チェック
  if (hp_hasStatusSection(sheet)) {
    ui.alert('情報', 'このシートには既にステータス欄があります。', ui.ButtonSet.OK);
    return;
  }

  hp_addStatusSection(sheet);
  ui.alert('完了', 'ステータス欄を追加しました。', ui.ButtonSet.OK);
}

function hp_addStatusSectionToAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '確認',
    '全ての企業シートにステータス欄を追加しますか？\n※既存データは1行下にずれます',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  const allSheets = ss.getSheets();
  let addedCount = 0;

  for (const sheet of allSheets) {
    const sheetName = sheet.getName();
    if (hp_isExcludedSheet(sheetName)) continue;
    if (sheetName === HP_PROGRESS_SHEET_NAME) continue;
    if (sheetName.startsWith('_')) continue;
    if (hp_hasStatusSection(sheet)) continue;

    hp_addStatusSection(sheet);
    addedCount++;
  }

  ui.alert('完了', `${addedCount}件のシートにステータス欄を追加しました。`, ui.ButtonSet.OK);
}

// ステータスセクションが存在するかチェック
function hp_hasStatusSection(sheet) {
  try {
    const cell = sheet.getRange(HP_STATUS_HEADER_ROW, HP_STATUS_COLUMNS.TASK).getValue();
    return String(cell).includes('現在タスク');
  } catch (e) {
    return false;
  }
}

// ステータスセクションを追加（2-3行目に挿入）
function hp_addStatusSection(sheet) {
  // 2行目に1行挿入（既存データが1行下にずれる）
  const row2Value = sheet.getRange(2, 1).getValue();

  if (!String(row2Value).includes('黄色') && !String(row2Value).includes('青色') && row2Value !== '') {
    sheet.insertRowBefore(2);
  }

  // 3行目の既存値を確認
  const row3Value = sheet.getRange(3, 1).getValue();
  if (String(row3Value).includes('Part①') || String(row3Value).includes('基本情報')) {
    sheet.insertRowBefore(3);
  }

  // メンバー一覧を取得
  const members = hp_getMembers();

  // === 2行目: ヘッダー（A〜G列） ===
  // A列: 納期ヘッダー
  sheet.getRange(HP_STATUS_HEADER_ROW, HP_STATUS_COLUMNS.DUE_DATE)
    .setValue('納期（あと○日）')
    .setBackground('#FFECB3')
    .setFontWeight('bold')
    .setFontColor('#000000');

  // B〜G列: その他のヘッダー
  const headers = ['現在タスク', 'タスク保持者', '状態', '期限', '最終更新日', '全体ステータス'];
  headers.forEach((header, i) => {
    sheet.getRange(HP_STATUS_HEADER_ROW, 2 + i)
      .setValue(header)
      .setBackground('#E3F2FD')
      .setFontWeight('bold')
      .setFontColor('#000000');
  });

  // === 3行目: 入力欄（A〜G列） ===
  const inputBg = '#FFFDE7';
  const taskList = HP_TASKS.map(t => t.no + '.' + t.name);
  const defaultTask = taskList[0];

  // A列: 納期（日付入力）
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.DUE_DATE)
    .setBackground('#FFF8E1')
    .setFontColor('#000000')
    .setNumberFormat('yyyy年M月d日');

  // B列: 現在タスク
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.TASK).setValue(defaultTask).setBackground(inputBg).setFontColor('#000000');
  const taskRule = SpreadsheetApp.newDataValidation().requireValueInList(taskList, true).build();
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.TASK).setDataValidation(taskRule);

  // C列: タスク保持者
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.HOLDER).setValue(members[0]).setBackground(inputBg).setFontColor('#000000');
  const holderRule = SpreadsheetApp.newDataValidation().requireValueInList(members, true).build();
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.HOLDER).setDataValidation(holderRule);

  // D列: 状態
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.STATE).setValue(HP_STATUS_STATES[0]).setBackground(inputBg).setFontColor('#000000');
  const stateRule = SpreadsheetApp.newDataValidation().requireValueInList(HP_STATUS_STATES, true).build();
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.STATE).setDataValidation(stateRule);

  // E列: 期限
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.DEADLINE).setBackground(inputBg).setFontColor('#000000').setNumberFormat('M/d');

  // F列: 最終更新日（自動）
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.UPDATED_AT).setBackground('#E0E0E0').setFontColor('#666666').setNumberFormat('M/d');

  // G列: 全体ステータス
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.OVERALL).setValue(HP_STATUS_OVERALL[0]).setBackground(inputBg).setFontColor('#000000');
  const overallRule = SpreadsheetApp.newDataValidation().requireValueInList(HP_STATUS_OVERALL, true).build();
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.OVERALL).setDataValidation(overallRule);

  // ログヘッダーを作成
  hp_ensureLogHeader(sheet);
}

// ===== 4. ステータス更新ダイアログ =====
function hp_showStatusUpdateDialog() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  // ステータス欄があるかチェック
  if (!hp_hasStatusSection(sheet)) {
    ui.alert('エラー', 'このシートにはステータス欄がありません。\n先に「ステータス欄を追加」を実行してください。', ui.ButtonSet.OK);
    return;
  }

  // 現在のステータスを取得
  const currentStatus = hp_getStatusFromSheet(sheet);

  const html = HtmlService.createHtmlOutput(hp_createStatusUpdateHtml(sheet.getName(), currentStatus))
    .setWidth(480)
    .setHeight(420);

  ui.showModalDialog(html, 'ステータス更新 - ' + sheet.getName());
}

function hp_createStatusUpdateHtml(sheetName, currentStatus) {
  const taskList = HP_TASKS.map(t => t.no + '.' + t.name);
  const members = hp_getMembers();

  const taskOptions = taskList.map(value => {
    return `<option value="${value}" ${currentStatus && currentStatus.task === value ? 'selected' : ''}>${value}</option>`;
  }).join('');

  const holderOptions = members.map(h =>
    `<option value="${h}" ${currentStatus && currentStatus.holder === h ? 'selected' : ''}>${h}</option>`
  ).join('');

  const stateOptions = HP_STATUS_STATES.map(s =>
    `<option value="${s}" ${currentStatus && currentStatus.state === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  const overallOptions = HP_STATUS_OVERALL.map(o =>
    `<option value="${o}" ${currentStatus && currentStatus.overall === o ? 'selected' : ''}>${o}</option>`
  ).join('');

  // 期限の初期値
  let deadlineValue = '';
  if (currentStatus && currentStatus.deadline && currentStatus.deadline !== '-') {
    const now = new Date();
    const year = now.getFullYear();
    const parts = String(currentStatus.deadline).split('/');
    if (parts.length === 2) {
      deadlineValue = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 16px; }
        .field { margin-bottom: 14px; }
        label { display: block; font-weight: bold; margin-bottom: 4px; color: #333; font-size: 13px; }
        select, input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .row { display: flex; gap: 12px; }
        .row .field { flex: 1; }
        .buttons { margin-top: 20px; text-align: right; }
        button { padding: 10px 20px; margin-left: 8px; border: none; border-radius: 4px; cursor: pointer; }
        .primary { background: #1565C0; color: white; }
        .secondary { background: #E0E0E0; color: #333; }
      </style>
    </head>
    <body>
      <div class="field">
        <label>現在タスク</label>
        <select id="task">${taskOptions}</select>
      </div>
      <div class="row">
        <div class="field">
          <label>タスク保持者</label>
          <select id="holder">${holderOptions}</select>
        </div>
        <div class="field">
          <label>状態</label>
          <select id="state">${stateOptions}</select>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>期限</label>
          <input type="date" id="deadline" value="${deadlineValue}">
        </div>
        <div class="field">
          <label>全体ステータス</label>
          <select id="overall">${overallOptions}</select>
        </div>
      </div>
      <div class="field">
        <label>メモ（任意）</label>
        <input type="text" id="memo" placeholder="更新内容を記録">
      </div>
      <div class="buttons">
        <button class="secondary" onclick="google.script.host.close()">キャンセル</button>
        <button class="primary" onclick="save()">更新</button>
      </div>
      <script>
        function save() {
          const data = {
            task: document.getElementById('task').value,
            holder: document.getElementById('holder').value,
            state: document.getElementById('state').value,
            deadline: document.getElementById('deadline').value,
            overall: document.getElementById('overall').value,
            memo: document.getElementById('memo').value
          };
          google.script.run
            .withSuccessHandler(() => google.script.host.close())
            .withFailureHandler(err => alert('エラー: ' + err))
            .hp_updateSheetStatus(data);
        }
      </script>
    </body>
    </html>
  `;
}

// シートのステータスを更新
function hp_updateSheetStatus(data) {
  const sheet = SpreadsheetApp.getActiveSheet();

  // 現在の値を取得（変更検出用）
  const oldTask = sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.TASK).getValue();
  const oldHolder = sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.HOLDER).getValue();

  // B列: 現在タスク
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.TASK).setValue(data.task);

  // C列: タスク保持者
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.HOLDER).setValue(data.holder);

  // D列: 状態
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.STATE).setValue(data.state);

  // E列: 期限
  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.DEADLINE).setValue(deadlineDate);
  }

  // F列: 最終更新日（自動）
  const now = new Date();
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.UPDATED_AT).setValue(now);

  // G列: 全体ステータス
  sheet.getRange(HP_STATUS_VALUE_ROW, HP_STATUS_COLUMNS.OVERALL).setValue(data.overall);

  // ログを追加
  hp_addUpdateLog(sheet, {
    datetime: now,
    oldTask: oldTask,
    newTask: data.task,
    oldHolder: oldHolder,
    newHolder: data.holder,
    state: data.state,
    memo: data.memo || ''
  });
}

// ログヘッダーを作成（なければ作成）
function hp_ensureLogHeader(sheet) {
  const titleCell = sheet.getRange(HP_LOG_TITLE_ROW, HP_LOG_COLUMNS.DATETIME).getValue();

  if (titleCell !== '更新ログ') {
    // タイトル行
    sheet.getRange(HP_LOG_TITLE_ROW, HP_LOG_COLUMNS.DATETIME, 1, 6)
      .setValues([['更新ログ', '', '', '', '', '']])
      .setBackground('#1565C0')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.getRange(HP_LOG_TITLE_ROW, HP_LOG_COLUMNS.DATETIME, 1, 6).merge();

    // ヘッダー行
    const headers = ['日時', 'タスク変更', '保持者変更', '状態', 'メモ', '工数'];
    sheet.getRange(HP_LOG_HEADER_ROW, HP_LOG_COLUMNS.DATETIME, 1, 6)
      .setValues([headers])
      .setBackground('#E3F2FD')
      .setFontWeight('bold');

    // 列幅調整
    sheet.setColumnWidth(HP_LOG_COLUMNS.DATETIME, 120);
    sheet.setColumnWidth(HP_LOG_COLUMNS.TASK_CHANGE, 80);
    sheet.setColumnWidth(HP_LOG_COLUMNS.HOLDER_CHANGE, 100);
    sheet.setColumnWidth(HP_LOG_COLUMNS.STATE, 80);
    sheet.setColumnWidth(HP_LOG_COLUMNS.MEMO, 200);
    sheet.setColumnWidth(HP_LOG_COLUMNS.DURATION, 80);
  }
}

// ログを追加
function hp_addUpdateLog(sheet, logData) {
  // ヘッダーを確認・作成
  hp_ensureLogHeader(sheet);

  // 最終ログ行を取得
  const lastRow = hp_getLastLogRow(sheet);

  // 工数計算（前回ログからの経過時間）
  let duration = '-';
  if (lastRow >= HP_LOG_DATA_START_ROW) {
    const prevDatetime = sheet.getRange(lastRow, HP_LOG_COLUMNS.DATETIME).getValue();
    if (prevDatetime instanceof Date) {
      duration = hp_calculateDuration(prevDatetime, logData.datetime);
    }
  }

  // タスク変更（番号だけ抽出）
  let taskChange = '-';
  if (logData.oldTask !== logData.newTask) {
    const oldNo = String(logData.oldTask).split('.')[0];
    const newNo = String(logData.newTask).split('.')[0];
    taskChange = oldNo + '→' + newNo;
  }

  // 保持者変更
  let holderChange = '-';
  if (logData.oldHolder !== logData.newHolder) {
    holderChange = logData.oldHolder + '→' + logData.newHolder;
  }

  // 新しいログ行を追加
  const newRow = lastRow + 1;
  const datetimeStr = Utilities.formatDate(logData.datetime, 'Asia/Tokyo', 'M/d HH:mm');

  sheet.getRange(newRow, HP_LOG_COLUMNS.DATETIME, 1, 6).setValues([[
    datetimeStr,
    taskChange,
    holderChange,
    logData.state,
    logData.memo,
    duration
  ]]);
}

// 最終ログ行を取得
function hp_getLastLogRow(sheet) {
  const maxRows = sheet.getMaxRows();
  if (maxRows < HP_LOG_DATA_START_ROW) {
    return HP_LOG_HEADER_ROW;
  }

  const logColumn = sheet.getRange(HP_LOG_DATA_START_ROW, HP_LOG_COLUMNS.DATETIME, maxRows - HP_LOG_DATA_START_ROW + 1, 1).getValues();

  for (let i = logColumn.length - 1; i >= 0; i--) {
    if (logColumn[i][0] !== '') {
      return HP_LOG_DATA_START_ROW + i;
    }
  }
  return HP_LOG_HEADER_ROW;
}

// 工数計算（経過時間を文字列で返す）
function hp_calculateDuration(fromDate, toDate) {
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    if (remainingHours > 0) {
      return diffDays + 'd' + remainingHours + 'h';
    }
    return diffDays + 'd';
  } else if (diffHours > 0) {
    return diffHours + 'h';
  } else {
    return diffMinutes + 'm';
  }
}

// タスク番号からフェーズを取得
function hp_getPhaseFromTask(taskValue) {
  if (!taskValue) return null;
  const taskNo = parseInt(String(taskValue).split('.')[0]);
  return HP_PHASE_MAPPING[taskNo] || null;
}
