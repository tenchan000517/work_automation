/**
 * アニメPV制作 - フォルダ作成・管理（Google Drive）v2.2
 *
 * フォルダ構造:
 * 📁 アニメPV制作/
 * └── 📁 [企業名]/
 *     ├── 📁 01_人物参考/
 *     ├── 📁 02_場所設備/
 *     ├── 📁 03_制服装備/
 *     ├── 📁 04_その他素材/
 *     └── 📁 05_生成物/
 *         ├── 📁 とりあえず/
 *         ├── 📁 キャラクターシート/
 *         ├── 📁 開始フレーム_シーン/
 *         ├── 📁 開始フレーム_エフェクト/
 *         ├── 📁 動画_シーン/
 *         ├── 📁 動画_エフェクト/
 *         ├── 📁 完パケ/
 *         └── 📁 音声/
 */

// ===== フォルダ構造定義 =====
const PV_FOLDER_STRUCTURE = {
  materials: [
    '01_人物参考',
    '02_場所設備',
    '03_制服装備',
    '04_その他素材'
  ],
  outputs: {
    parent: '05_生成物',
    children: [
      'とりあえず',
      'キャラクターシート',
      '開始フレーム_シーン',
      '開始フレーム_エフェクト',
      '動画_シーン',
      '動画_エフェクト',
      '完パケ',
      '音声'
    ]
  }
};

// ================================================================================
// ===== フォルダ作成 =====
// ================================================================================

/**
 * 企業フォルダを作成（メニューから呼び出し）
 */
function pv_createCompanyFolder() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  // 企業シートかどうか確認
  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  // 親フォルダIDを取得
  const parentFolderId = pv_getParentFolderId();
  if (!parentFolderId) {
    ui.alert(
      'エラー',
      '親フォルダが設定されていません。\n「⚙️設定 > 📁親フォルダを設定」で設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // 企業名を取得
  const basicInfo = pv_getBasicInfoForDialog(sheetName);
  const companyName = basicInfo.companyName || sheetName;

  // 確認ダイアログ
  const result = ui.alert(
    'フォルダ作成確認',
    `「${companyName}」のフォルダを作成します。\n\n` +
    '以下のフォルダが作成されます：\n' +
    '├── 01_人物参考\n' +
    '├── 02_場所設備\n' +
    '├── 03_制服装備\n' +
    '├── 04_その他素材\n' +
    '└── 05_生成物\n' +
    '    ├── とりあえず\n' +
    '    ├── キャラクターシート\n' +
    '    ├── 開始フレーム_シーン\n' +
    '    ├── 開始フレーム_エフェクト\n' +
    '    ├── 動画_シーン\n' +
    '    ├── 動画_エフェクト\n' +
    '    ├── 完パケ\n' +
    '    └── 音声\n\n' +
    '続行しますか？',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) return;

  try {
    // フォルダを作成
    const folderUrls = pv_createCompanyFolderStructure(parentFolderId, companyName);

    // シートにURLを保存
    pv_saveFolderUrlsToSheet(sheet, folderUrls);

    ui.alert(
      '作成完了',
      `✅ 「${companyName}」フォルダを作成しました。\n\n` +
      `フォルダURL:\n${folderUrls.main}`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert('エラー', `フォルダ作成に失敗しました：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * フォルダ構造を作成
 */
function pv_createCompanyFolderStructure(parentFolderId, companyName) {
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const urls = {};

  // メインフォルダ（企業名）を作成
  const mainFolder = parentFolder.createFolder(companyName);
  urls.main = mainFolder.getUrl();

  // 素材フォルダを作成
  urls.materials = {};
  for (const folderName of PV_FOLDER_STRUCTURE.materials) {
    const folder = mainFolder.createFolder(folderName);
    urls.materials[folderName] = folder.getUrl();
  }

  // 生成物フォルダを作成
  const outputFolder = mainFolder.createFolder(PV_FOLDER_STRUCTURE.outputs.parent);
  urls.outputs = {
    main: outputFolder.getUrl(),
    children: {}
  };

  for (const childName of PV_FOLDER_STRUCTURE.outputs.children) {
    const folder = outputFolder.createFolder(childName);
    urls.outputs.children[childName] = folder.getUrl();
  }

  return urls;
}

/**
 * フォルダURLをシートに保存
 */
function pv_saveFolderUrlsToSheet(sheet, folderUrls) {
  pv_setCellValueByLabel(sheet, '企業フォルダURL', folderUrls.main);

  // 素材フォルダの一覧
  const materialsInfo = Object.entries(folderUrls.materials)
    .map(([name, url]) => `${name}: ${url}`)
    .join('\n');
  pv_setCellValueByLabel(sheet, '素材フォルダURL', materialsInfo);
}

// ================================================================================
// ===== 最近作成したフォルダ一覧 =====
// ================================================================================

/**
 * 最近作成した企業フォルダ一覧を表示
 */
function pv_showRecentFolders() {
  const ui = SpreadsheetApp.getUi();

  const parentFolderId = pv_getParentFolderId();
  if (!parentFolderId) {
    ui.alert(
      'エラー',
      '親フォルダが設定されていません。\n「⚙️設定 > 📁親フォルダを設定」で設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  try {
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const subFolders = parentFolder.getFolders();

    const folderList = [];
    while (subFolders.hasNext()) {
      const folder = subFolders.next();
      folderList.push({
        name: folder.getName(),
        url: folder.getUrl(),
        created: folder.getDateCreated()
      });
    }

    // 作成日時で降順ソート
    folderList.sort((a, b) => b.created - a.created);

    // 最新10件を表示
    const recentFolders = folderList.slice(0, 10);

    if (recentFolders.length === 0) {
      ui.alert('情報', 'フォルダがまだ作成されていません。', ui.ButtonSet.OK);
      return;
    }

    // ダイアログを表示
    const htmlContent = pv_createRecentFoldersDialogHtml(recentFolders);
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(500)
      .setHeight(400);
    ui.showModalDialog(htmlOutput, '📁 最近作成した企業フォルダ');

  } catch (error) {
    ui.alert('エラー', `フォルダ一覧の取得に失敗しました：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 最近のフォルダ一覧ダイアログを作成
 */
function pv_createRecentFoldersDialogHtml(folders) {
  let folderListHtml = '';
  for (const folder of folders) {
    const dateStr = Utilities.formatDate(folder.created, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
    folderListHtml += `
      <div class="folder-item">
        <div class="folder-name">📁 ${pv_escapeHtml(folder.name)}</div>
        <div class="folder-date">${dateStr}</div>
        <a href="${folder.url}" target="_blank" class="folder-link">開く →</a>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .folder-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 8px;
          background: #fff;
        }
        .folder-name {
          flex: 1;
          font-weight: 500;
          color: #333;
        }
        .folder-date {
          color: #666;
          font-size: 12px;
          margin-right: 16px;
        }
        .folder-link {
          color: #7c3aed;
          text-decoration: none;
          font-size: 13px;
        }
        .folder-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <p class="description">最近作成した企業フォルダ（最新10件）</p>
      ${folderListHtml}
      <div class="footer">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>
    </body>
    </html>
  `;
}

// ================================================================================
// ===== フォルダを開く =====
// ================================================================================

/**
 * 現在のシートの企業フォルダを開く
 */
function pv_openCompanyFolder() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (pv_isExcludedSheet(sheetName)) {
    ui.alert('エラー', '企業シートを選択してから実行してください。', ui.ButtonSet.OK);
    return;
  }

  const folderUrl = pv_getCellValueByLabel(sheet, '企業フォルダURL');

  if (!folderUrl) {
    ui.alert(
      '情報',
      'この企業のフォルダがまだ作成されていません。\n「📁フォルダ > 企業フォルダを作成」で作成してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // URLを表示（ユーザーに開いてもらう）
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      ${PV_DIALOG_STYLES}
      <style>
        .url-display {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 8px;
          word-break: break-all;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <h3>📁 企業フォルダ</h3>
      <div class="url-display">
        <a href="${pv_escapeHtml(folderUrl)}" target="_blank">${pv_escapeHtml(folderUrl)}</a>
      </div>
      <div class="footer">
        <a href="${pv_escapeHtml(folderUrl)}" target="_blank" class="btn btn-primary">📂 フォルダを開く</a>
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(500)
    .setHeight(250);
  ui.showModalDialog(htmlOutput, '📁 企業フォルダを開く');
}
