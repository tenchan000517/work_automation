/**
 * 連絡用フォーマット GAS
 *
 * Next.js（tsunageru.ts）のpopupと同じテンプレートをGASダイアログから使用
 * 企業シート選択でURL等を自動入力できるメリットを活かす
 *
 * 【メニュー構造】
 * 📨 連絡用フォーマット（ナンバリングなし）
 *   ├── 日程確定報告
 *   ├── ─────────────
 *   ├── 撮影日程確認
 *   ├── 参加者リマインド
 *   ├── ─────────────
 *   ├── 撮影指示連絡
 *   └── 議事録共有
 *
 * ※企業情報入力・受注報告・日程調整メールは companyInfoManager.js に移行
 */

// ================================================================================
// ===== メニュー =====
// ================================================================================

function addContactFormatsMenu(ui) {
  ui.createMenu('📨 連絡用フォーマット')
    .addItem('📩 日程調整・フォーム記入メール', 'showScheduleEmailDialog')  // companyInfoManager.js で定義
    .addItem('📋 日程確定報告', 'showScheduleConfirmDialog')
    .addSeparator()
    .addItem('📷 撮影日程確認', 'showShootingDateRequestDialog')
    .addItem('🔔 参加者リマインド', 'showMeetingReminderDialog')
    .addSeparator()
    .addItem('🎬 撮影指示連絡', 'showShootingInstructionDialog')
    .addItem('📝 議事録共有', 'showMinutesShareDialog')
    .addToUi();
}


// ================================================================================
// ===== 共通ユーティリティ =====
// ================================================================================

/**
 * 企業シート一覧を取得（除外シートを除く）
 * ※関数名を変更：他ファイルの同名関数との競合を回避
 */
function getCompanySheetListForContacts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const companySheets = [];

  // 除外シート判定（インライン定義で依存関係問題を回避）
  const excludeExact = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
  const excludePartial = ['ヒアリングシート', '原本'];

  for (const sheet of sheets) {
    const name = sheet.getName();

    // 完全一致で除外
    if (excludeExact.includes(name)) continue;

    // 部分一致で除外
    let excluded = false;
    for (const partial of excludePartial) {
      if (name.includes(partial)) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    companySheets.push(name);
  }

  return companySheets;
}

/**
 * 現在のシートのURLを取得
 */
function getCurrentSheetUrl(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return '';

  const ssUrl = ss.getUrl();
  const sheetId = sheet.getSheetId();
  return ssUrl + '#gid=' + sheetId;
}

/**
 * シートのURLを取得（ヒアリングシートURL + 撮影素材フォルダURL）
 */
function getSheetUrls(sheetName) {
  const result = {
    hearingSheetUrl: '',
    folderUrl: ''
  };

  result.hearingSheetUrl = getCurrentSheetUrl(sheetName);

  // loadPart3Data を try-catch でラップ（settingsSheet.js への依存問題を回避）
  try {
    if (typeof loadPart3Data === 'function') {
      const part3Data = loadPart3Data(sheetName, '撮影素材フォルダURL');
      if (part3Data && part3Data.success && part3Data.value) {
        result.folderUrl = part3Data.value;
      }
    } else {
      // loadPart3Data が未定義の場合、直接シートから取得を試みる
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        // Part③ 撮影素材フォルダURL の位置（settingsSheet.js の PART3_MAPPING と同じ）
        const folderUrl = sheet.getRange(135, 3).getValue();
        if (folderUrl) {
          result.folderUrl = String(folderUrl);
        }
      }
    }
  } catch (e) {
    // エラー時は folderUrl を空のまま返す
    Logger.log('getSheetUrls error: ' + e.message);
  }

  return result;
}

/**
 * HTMLエスケープ
 */
function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


// ================================================================================
// ===== 共通ダイアログスタイル =====
// ================================================================================
// CI_DIALOG_STYLES は commonStyles.js で定義
// 各ダイアログで ${CI_DIALOG_STYLES} を使用

// 互換性のための固有スタイル（CI_DIALOG_STYLESに含まれていないもの）
const CONTACT_FORMATS_STYLES = `
<style>
  /* contactFormats固有スタイル */
  .copy-success { color: #2e7d32; font-size: 12px; margin-top: 8px; display: none; }
  .copy-success.show { display: block; }
</style>
`;


// ================================================================================
// ===== 1. 日程確定報告 =====
// Next.js: No.1 日程調整 → 投稿フォーマット
// ================================================================================

function showScheduleConfirmDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();
  const html = HtmlService.createHtmlOutput(createScheduleConfirmHTML(companySheets, members))
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '日程確定報告');
}

function createScheduleConfirmHTML(companySheets, members) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  let memberCheckboxes = '';
  const defaultMentions = ['河合'];
  const defaultCC = ['青柳'];
  for (const member of members) {
    const checked = defaultMentions.includes(member) ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="mention" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  let ccCheckboxes = '';
  for (const member of members) {
    const checked = defaultCC.includes(member) ? 'checked' : '';
    ccCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="cc" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}${CONTACT_FORMATS_STYLES}</head>
<body>
  <h3>日程確定報告</h3>
  <p class="subtitle">初回打ち合わせの日程確定をワークスで報告</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
    <div class="hint">選択すると企業名が自動入力されます</div>
  </div>

  <div class="form-group">
    <label>宛先</label>
    <div class="member-select">${memberCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>CC</label>
    <div class="member-select">${ccCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="company" placeholder="株式会社○○">
  </div>

  <div class="form-group">
    <label>日時</label>
    <input type="text" id="datetime" placeholder="○月○日（○）○○:○○〜">
  </div>

  <div class="form-group">
    <label>Meet URL</label>
    <input type="text" id="meetUrl" placeholder="https://meet.google.com/xxx-xxxx-xxx">
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (sheetName) {
        document.getElementById('company').value = sheetName;
      }
    }

    function generate() {
      const mentions = Array.from(document.querySelectorAll('input[name="mention"]:checked')).map(cb => '@' + cb.value);
      const ccs = Array.from(document.querySelectorAll('input[name="cc"]:checked')).map(cb => '@' + cb.value);
      const company = document.getElementById('company').value.trim();
      const datetime = document.getElementById('datetime').value.trim();
      const meetUrl = document.getElementById('meetUrl').value.trim();

      if (!company) {
        alert('企業名を入力してください');
        return;
      }

      let mentionStr = mentions.join(' ');
      if (ccs.length > 0) {
        mentionStr += ' cc:' + ccs.join(' ');
      }

      const template = mentionStr + \`
初回打ち合わせの日程が確定しました。

【企業名】\${company}
【日時】\${datetime || '（未入力）'}
【Meet URL】\${meetUrl || '（未入力）'}

カレンダー登録済みです。
確認したらリアクションお願いします。\`;

      document.getElementById('resultBox').textContent = template;
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(() => document.getElementById('copySuccess').classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 3. 撮影日程確認 =====
// Next.js: No.2 打ち合わせ前準備 → 撮影日程確認フォーマット
// ================================================================================

function showShootingDateRequestDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();
  const settings = getSettingsFromSheet();
  const defaultShooter = settings['撮影担当'] || '川崎';

  const html = HtmlService.createHtmlOutput(createShootingDateRequestHTML(companySheets, members, defaultShooter))
    .setWidth(650)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '撮影日程確認');
}

function createShootingDateRequestHTML(companySheets, members, defaultShooter) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  let memberCheckboxes = '';
  for (const member of members) {
    const checked = member === defaultShooter ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="mention" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}${CONTACT_FORMATS_STYLES}</head>
<body>
  <h3>撮影日程確認</h3>
  <p class="subtitle">撮影担当に候補日程を確認</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
    <div class="hint">選択するとURL等が自動入力されます</div>
  </div>

  <div class="form-group">
    <label>宛先（撮影担当）</label>
    <div class="member-select">${memberCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="company" placeholder="株式会社○○">
  </div>

  <div class="form-group">
    <label>初回打ち合わせ日</label>
    <input type="text" id="mtgDate" placeholder="○月○日（○）">
  </div>

  <div class="form-group">
    <label>ヒアリングシートURL</label>
    <input type="text" id="hearingSheetUrl" placeholder="https://docs.google.com/spreadsheets/d/...">
  </div>

  <div class="form-group">
    <label>撮影素材フォルダURL</label>
    <input type="text" id="folderUrl" placeholder="https://drive.google.com/...">
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (!sheetName) return;

      document.getElementById('company').value = sheetName;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.hearingSheetUrl) {
            document.getElementById('hearingSheetUrl').value = result.hearingSheetUrl;
          }
          if (result.folderUrl) {
            document.getElementById('folderUrl').value = result.folderUrl;
          }
        })
        .getSheetUrls(sheetName);
    }

    function generate() {
      const mentions = Array.from(document.querySelectorAll('input[name="mention"]:checked')).map(cb => '@' + cb.value);
      const company = document.getElementById('company').value.trim();
      const mtgDate = document.getElementById('mtgDate').value.trim();
      const hearingSheetUrl = document.getElementById('hearingSheetUrl').value.trim();
      const folderUrl = document.getElementById('folderUrl').value.trim();

      if (!company) {
        alert('企業名を入力してください');
        return;
      }

      const mentionStr = mentions.join(' ');

      const template = mentionStr + \`
\${company}様の撮影について相談です。

初回打ち合わせ：\${mtgDate || '（未入力）'}予定
打ち合わせで先方に撮影候補日を提示したいので、
打ち合わせ日以降で撮影可能な日程を5候補ほど教えてください。

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: \${hearingSheetUrl || '（未設定）'}
📁 撮影素材フォルダ: \${folderUrl || '（未設定）'}\`;

      document.getElementById('resultBox').textContent = template;
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(() => document.getElementById('copySuccess').classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 4. 参加者リマインド =====
// Next.js: No.2 打ち合わせ前準備 → リマインドフォーマット
// ================================================================================

function showMeetingReminderDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();

  const html = HtmlService.createHtmlOutput(createMeetingReminderHTML(companySheets, members))
    .setWidth(650)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, '参加者リマインド');
}

function createMeetingReminderHTML(companySheets, members) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  let memberCheckboxes = '';
  const defaultMentions = ['渡邉'];
  const defaultCC = ['青柳'];
  for (const member of members) {
    const checked = defaultMentions.includes(member) ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="mention" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  let ccCheckboxes = '';
  for (const member of members) {
    const checked = defaultCC.includes(member) ? 'checked' : '';
    ccCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="cc" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}${CONTACT_FORMATS_STYLES}</head>
<body>
  <h3>参加者リマインド</h3>
  <p class="subtitle">打ち合わせ参加者へのリマインド</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
  </div>

  <div class="form-group">
    <label>宛先</label>
    <div class="member-select">${memberCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>CC</label>
    <div class="member-select">${ccCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="company" placeholder="株式会社○○">
  </div>

  <div class="form-group">
    <label>日時</label>
    <input type="text" id="datetime" placeholder="○月○日（○）○○:○○〜">
  </div>

  <div class="form-group">
    <label>Meet URL</label>
    <input type="text" id="meetUrl" placeholder="https://meet.google.com/xxx-xxxx-xxx">
  </div>

  <div class="form-group">
    <label>ヒアリングシートURL</label>
    <input type="text" id="hearingSheetUrl" placeholder="https://docs.google.com/spreadsheets/d/...">
  </div>

  <div class="form-group">
    <label>撮影素材フォルダURL</label>
    <input type="text" id="folderUrl" placeholder="https://drive.google.com/...">
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (!sheetName) return;

      document.getElementById('company').value = sheetName;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.hearingSheetUrl) {
            document.getElementById('hearingSheetUrl').value = result.hearingSheetUrl;
          }
          if (result.folderUrl) {
            document.getElementById('folderUrl').value = result.folderUrl;
          }
        })
        .getSheetUrls(sheetName);
    }

    function generate() {
      const mentions = Array.from(document.querySelectorAll('input[name="mention"]:checked')).map(cb => '@' + cb.value);
      const ccs = Array.from(document.querySelectorAll('input[name="cc"]:checked')).map(cb => '@' + cb.value);
      const company = document.getElementById('company').value.trim();
      const datetime = document.getElementById('datetime').value.trim();
      const meetUrl = document.getElementById('meetUrl').value.trim();
      const hearingSheetUrl = document.getElementById('hearingSheetUrl').value.trim();
      const folderUrl = document.getElementById('folderUrl').value.trim();

      if (!company) {
        alert('企業名を入力してください');
        return;
      }

      let mentionStr = mentions.join(' ');
      if (ccs.length > 0) {
        mentionStr += ' cc:' + ccs.join(' ');
      }

      const template = mentionStr + \`
\${company}様の初回打ち合わせリマインドです。

【日時】\${datetime || '（未入力）'}
【Meet URL】\${meetUrl || '（未入力）'}

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: \${hearingSheetUrl || '（未設定）'}
📁 撮影素材フォルダ: \${folderUrl || '（未設定）'}\`;

      document.getElementById('resultBox').textContent = template;
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(() => document.getElementById('copySuccess').classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 5. 撮影指示連絡 =====
// Next.js: No.4 打ち合わせ後対応 → 撮影指示フォーマット
// ================================================================================

function showShootingInstructionDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();
  const settings = getSettingsFromSheet();
  const defaultShooter = settings['撮影担当'] || '川崎';
  const defaultCC = settings['CC'] || '青柳';

  const html = HtmlService.createHtmlOutput(
    createShootingInstructionHTML(companySheets, members, defaultShooter, defaultCC)
  )
    .setWidth(700)
    .setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, '撮影指示連絡');
}

function createShootingInstructionHTML(companySheets, members, defaultShooter, defaultCC) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  let memberCheckboxes = '';
  for (const member of members) {
    const checked = member === defaultShooter ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="mention" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  let ccCheckboxes = '';
  for (const member of members) {
    const checked = member === defaultCC ? 'checked' : '';
    ccCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="cc" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}${CONTACT_FORMATS_STYLES}</head>
<body>
  <h3>撮影指示連絡</h3>
  <p class="subtitle">撮影担当への詳細連絡</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
  </div>

  <div class="form-group">
    <label>宛先（撮影担当）</label>
    <div class="member-select">${memberCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>CC</label>
    <div class="member-select">${ccCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="company" placeholder="株式会社○○">
  </div>

  <div class="form-group">
    <label>撮影日</label>
    <input type="text" id="shootingDate" placeholder="○月○日（○）○○:○○〜">
  </div>

  <div class="form-group">
    <label>場所</label>
    <input type="text" id="location" placeholder="○○株式会社 本社">
  </div>

  <div class="form-group">
    <label>住所</label>
    <input type="text" id="address" placeholder="愛知県名古屋市○○区...">
  </div>

  <div class="form-group">
    <label>インタビュー対象</label>
    <input type="text" id="interviewTarget" placeholder="代表取締役 ○○様、営業部 ○○様">
  </div>

  <div class="form-group">
    <label>備考</label>
    <input type="text" id="notes" placeholder="駐車場あり、作業着撮影希望 等">
  </div>

  <div class="form-group">
    <label>ヒアリングシートURL</label>
    <input type="text" id="hearingSheetUrl" placeholder="https://docs.google.com/spreadsheets/d/...">
  </div>

  <div class="form-group">
    <label>撮影素材フォルダURL</label>
    <input type="text" id="folderUrl" placeholder="https://drive.google.com/...">
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (!sheetName) return;

      document.getElementById('company').value = sheetName;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.hearingSheetUrl) {
            document.getElementById('hearingSheetUrl').value = result.hearingSheetUrl;
          }
          if (result.folderUrl) {
            document.getElementById('folderUrl').value = result.folderUrl;
          }
        })
        .getSheetUrls(sheetName);
    }

    function generate() {
      const mentions = Array.from(document.querySelectorAll('input[name="mention"]:checked')).map(cb => '@' + cb.value);
      const ccs = Array.from(document.querySelectorAll('input[name="cc"]:checked')).map(cb => '@' + cb.value);
      const company = document.getElementById('company').value.trim();
      const shootingDate = document.getElementById('shootingDate').value.trim();
      const location = document.getElementById('location').value.trim();
      const address = document.getElementById('address').value.trim();
      const interviewTarget = document.getElementById('interviewTarget').value.trim();
      const notes = document.getElementById('notes').value.trim();
      const hearingSheetUrl = document.getElementById('hearingSheetUrl').value.trim();
      const folderUrl = document.getElementById('folderUrl').value.trim();

      if (!company) {
        alert('企業名を入力してください');
        return;
      }

      let mentionStr = mentions.join(' ');
      if (ccs.length > 0) {
        mentionStr += ' cc:' + ccs.join(' ');
      }

      const template = mentionStr + \`
\${company}様の撮影日程が確定しましたのでご連絡します。

【撮影日】\${shootingDate || '（未入力）'}
【場所】\${location || '（未入力）'}
【住所】\${address || '（未入力）'}
【インタビュー対象】\${interviewTarget || '（未入力）'}
【備考】\${notes || 'なし'}

━━━━━━━━━━━━━━━━━━━━
📁 撮影データの保存先
━━━━━━━━━━━━━━━━━━━━
撮影後、以下のフォルダに素材をアップロードしてください。
\${folderUrl || '（未設定）'}

確認したらリアクションお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: \${hearingSheetUrl || '（未設定）'}\`;

      document.getElementById('resultBox').textContent = template;
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(() => document.getElementById('copySuccess').classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 6. 議事録共有 =====
// Next.js: No.4 打ち合わせ後対応 → ワークス投稿フォーマット（議事録共有）
// ================================================================================

function showMinutesShareDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();
  const settings = getSettingsFromSheet();
  const defaultShooter = settings['撮影担当'] || '川崎';

  const html = HtmlService.createHtmlOutput(createMinutesShareHTML(companySheets, members, defaultShooter))
    .setWidth(700)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, '議事録共有');
}

function createMinutesShareHTML(companySheets, members, defaultShooter) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  let memberCheckboxes = '';
  for (const member of members) {
    const checked = member === defaultShooter ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="shooterMention" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${CI_DIALOG_STYLES}${CONTACT_FORMATS_STYLES}</head>
<body>
  <h3>議事録共有</h3>
  <p class="subtitle">初回打ち合わせの議事録をワークスで共有</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="company" placeholder="株式会社○○">
  </div>

  <div class="form-group">
    <label>撮影担当メンション</label>
    <div class="member-select">${memberCheckboxes}</div>
    <div class="hint">@ALLの後に個別メンションされます</div>
  </div>

  <div class="form-group">
    <label>議事録</label>
    <textarea id="minutes" style="min-height: 150px;" placeholder="AIが出力した議事録をここに貼り付け..."></textarea>
  </div>

  <div class="form-group">
    <label>ヒアリングシートURL</label>
    <input type="text" id="hearingSheetUrl" placeholder="https://docs.google.com/spreadsheets/d/...">
  </div>

  <div class="form-group">
    <label>撮影素材フォルダURL</label>
    <input type="text" id="folderUrl" placeholder="https://drive.google.com/...">
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (!sheetName) return;

      document.getElementById('company').value = sheetName;

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.hearingSheetUrl) {
            document.getElementById('hearingSheetUrl').value = result.hearingSheetUrl;
          }
          if (result.folderUrl) {
            document.getElementById('folderUrl').value = result.folderUrl;
          }
        })
        .getSheetUrls(sheetName);
    }

    function generate() {
      const shooterMentions = Array.from(document.querySelectorAll('input[name="shooterMention"]:checked')).map(cb => '@' + cb.value);
      const company = document.getElementById('company').value.trim();
      const minutes = document.getElementById('minutes').value.trim();
      const hearingSheetUrl = document.getElementById('hearingSheetUrl').value.trim();
      const folderUrl = document.getElementById('folderUrl').value.trim();

      if (!company) {
        alert('企業名を入力してください');
        return;
      }

      const shooterStr = shooterMentions.join(' ');

      const template = \`@ALL \${shooterStr}
\${company}様 初回打ち合わせの議事録を共有します。

\${minutes || '（議事録を入力してください）'}

ご確認お願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: \${hearingSheetUrl || '（未設定）'}
📁 撮影素材フォルダ: \${folderUrl || '（未設定）'}\`;

      document.getElementById('resultBox').textContent = template;
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(() => document.getElementById('copySuccess').classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>
`;
}


// ================================================================================
// ===== 7. 日程調整・フォーム記入メール =====
// 【No.1初回打ち合わせ日程調整】日程調整・フォーム記入メール
// ※ companyInfoManager.js の showScheduleEmailDialog() に移行済み
// ================================================================================

/*
function showScheduleRequestDialog() {
  const companySheets = getCompanySheetListForContacts();
  const members = getMemberList();
  const formUrl = getFormUrlFromSettings();

  const html = HtmlService.createHtmlOutput(createScheduleRequestHTML(companySheets, members, formUrl))
    .setWidth(750)
    .setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(html, '📅 日程調整・フォーム記入メール');
}
*/

/*
function createScheduleRequestHTML(companySheets, members, formUrl) {
  let sheetOptions = '<option value="">-- 企業シートを選択 --</option>';
  for (const sheet of companySheets) {
    sheetOptions += `<option value="${escapeHtmlAttr(sheet)}">${escapeHtml(sheet)}</option>`;
  }

  // 参加者チェックボックス
  let memberCheckboxes = '';
  const defaultParticipants = ['渡邉', '河合'];
  for (const member of members) {
    const checked = defaultParticipants.includes(member) ? 'checked' : '';
    memberCheckboxes += `<label class="checkbox-label">
      <input type="checkbox" name="participant" value="${escapeHtmlAttr(member)}" ${checked}>
      ${escapeHtml(member)}
    </label>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>${DIALOG_STYLES}
<style>
  .date-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
  .date-row input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
  .date-row .delete-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #ffebee;
    color: #c62828;
  }
  .btn-add-date { background: #e8f5e9; color: #2e7d32; margin-top: 5px; padding: 6px 12px; font-size: 13px; }
</style>
</head>
<body>
  <h3>日程調整・フォーム記入メール</h3>
  <p class="subtitle">初回打ち合わせの日程調整メールを作成</p>

  <div class="form-group">
    <label>企業シート選択</label>
    <select id="sheetSelect" onchange="onSheetSelect()">
      ${sheetOptions}
    </select>
  </div>

  <div class="form-group">
    <label>企業名</label>
    <input type="text" id="companyName" placeholder="○○株式会社">
  </div>

  <div class="form-group">
    <label>担当者様</label>
    <input type="text" id="contactName" placeholder="○○様">
  </div>

  <div class="form-group">
    <label>候補日程</label>
    <div id="dateList">
      <div class="date-row">
        <input type="text" placeholder="○月○日（○）○○:○○〜">
        <button class="delete-btn" onclick="removeDate(this)">×</button>
      </div>
      <div class="date-row">
        <input type="text" placeholder="○月○日（○）○○:○○〜">
        <button class="delete-btn" onclick="removeDate(this)">×</button>
      </div>
      <div class="date-row">
        <input type="text" placeholder="○月○日（○）○○:○○〜">
        <button class="delete-btn" onclick="removeDate(this)">×</button>
      </div>
    </div>
    <button class="btn btn-add-date" onclick="addDate()">＋ 候補日を追加</button>
  </div>

  <div class="form-group">
    <label>参加者（弊社）</label>
    <div class="member-select">${memberCheckboxes}</div>
  </div>

  <div class="form-group">
    <label>ヒアリングフォームURL</label>
    <input type="text" id="formUrl" value="${escapeHtmlAttr(formUrl)}" placeholder="https://forms.google.com/...">
    <div class="hint">設定シートから自動取得されます</div>
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generate()">生成</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">閉じる</button>
  </div>

  <div class="result-area" id="resultArea">
    <h4>生成結果</h4>
    <div class="result-box" id="resultBox"></div>
    <div style="margin-top: 10px;">
      <button class="btn btn-copy" onclick="copyResult()">📋 コピー</button>
      <span class="copy-success" id="copySuccess">✓ コピーしました</span>
    </div>
  </div>

  <script>
    function onSheetSelect() {
      const sheetName = document.getElementById('sheetSelect').value;
      if (sheetName) {
        document.getElementById('companyName').value = sheetName;
      }
    }

    function addDate() {
      const dateList = document.getElementById('dateList');
      const newRow = document.createElement('div');
      newRow.className = 'date-row';
      newRow.innerHTML = '<input type="text" placeholder="○月○日（○）○○:○○〜"><button class="delete-btn" onclick="removeDate(this)">×</button>';
      dateList.appendChild(newRow);
    }

    function removeDate(btn) {
      const dateList = document.getElementById('dateList');
      if (dateList.children.length > 1) {
        btn.parentElement.remove();
      }
    }

    function generate() {
      const companyName = document.getElementById('companyName').value.trim();
      const contactName = document.getElementById('contactName').value.trim();
      const formUrl = document.getElementById('formUrl').value.trim();

      if (!companyName) {
        alert('企業名を入力してください');
        return;
      }

      // 候補日程を取得
      const dateInputs = document.querySelectorAll('#dateList input');
      const dates = Array.from(dateInputs)
        .map(function(input) { return input.value.trim(); })
        .filter(function(date) { return date; });

      // 参加者を取得
      const participants = Array.from(document.querySelectorAll('input[name="participant"]:checked'))
        .map(function(cb) { return cb.value; });

      const dateLines = dates.map(function(d) { return '・' + d; }).join('\\n');
      const participantStr = participants.join('、');

      const template = '件名：【日程調整】初回お打ち合わせのご案内\\n\\n' +
        companyName + '\\n' +
        (contactName || '○○様') + '\\n\\n' +
        'お世話になっております。\\n株式会社Singの渡邉です。\\n\\n' +
        'この度は採用支援サービス「ツナゲル」をご契約いただき、\\n誠にありがとうございます。\\n\\n' +
        '早速ですが、初回お打ち合わせの日程調整をさせていただきたく\\nご連絡いたしました。\\n\\n' +
        '下記日程にてご都合いかがでしょうか。\\n\\n' +
        '━━━━━━━━━━━━━━━━━━━━\\n【候補日程】\\n' +
        (dateLines || '・○月○日（○）○○:○○〜') + '\\n' +
        '━━━━━━━━━━━━━━━━━━━━\\n\\n' +
        '【打ち合わせ方法】\\nGoogle Meetにて実施（約60分）\\n※URLは日程確定後にお送りいたします\\n\\n' +
        '【参加者（弊社）】\\n' + (participantStr || '渡邉、河合') + '\\n\\n' +
        '━━━━━━━━━━━━━━━━━━━━\\n\\n' +
        'また、打ち合わせをより充実したものにするため、\\n事前に下記ヒアリングシートへのご回答をお願いいたします。\\n\\n' +
        '▼ヒアリングシート（Googleフォーム）\\n' +
        (formUrl || 'https://forms.gle/gXE12JNfsN9JGiPJA') + '\\n\\n' +
        '【所要時間】約15〜20分程度\\n【ご回答期限】初回お打ち合わせ日の前日まで\\n\\n' +
        'ご不明な点がございましたら、\\nお気軽にお問い合わせください。\\n\\n何卒よろしくお願いいたします。';

      document.getElementById('resultBox').textContent = template.replace(/\\n/g, '\\n');
      document.getElementById('resultArea').classList.add('show');
    }

    function copyResult() {
      const text = document.getElementById('resultBox').textContent;
      navigator.clipboard.writeText(text).then(function() {
        document.getElementById('copySuccess').classList.add('show');
        setTimeout(function() { document.getElementById('copySuccess').classList.remove('show'); }, 2000);
      });
    }
  </script>
</body>
</html>
`;
}
*/
