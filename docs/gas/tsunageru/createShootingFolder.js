/**
 * 撮影データフォルダ自動作成 GAS
 *
 * 【機能】
 * - 企業名を入力すると撮影データ用のフォルダ構成を自動作成
 * - フォルダURLをコピー可能なダイアログを表示
 * - 共有ドライブ対応
 *
 * 【フォルダ構成】
 * [企業名]_撮影データ/
 * ├─ 01_撮影素材
 * ├─ 02_編集データ
 * └─ 03_完成動画
 *
 * 【使い方】
 * 1. このスクリプトをGoogle Apps Scriptにコピー
 * 2. Google Apps Script エディタで「サービス」→「Drive API」を追加
 * 3. PARENT_FOLDER_IDを実際の親フォルダIDに変更
 * 4. スプレッドシートを開くとメニューに「📁 撮影フォルダ」が追加される
 *
 * 【共有ドライブを使う場合】
 * Drive API (Advanced Service) を有効にする必要があります：
 * 1. Apps Script エディタ左メニューの「サービス」をクリック
 * 2. 「Drive API」を選択して「追加」
 */

// ===== 設定 =====
// 撮影データを格納する親フォルダのID（Google DriveのURLから取得）
// 例: https://drive.google.com/drive/folders/XXXXXXXXX の XXXXXXXXX 部分
const PARENT_FOLDER_ID = 'YOUR_PARENT_FOLDER_ID_HERE';

// サブフォルダの構成
const SUBFOLDERS = [
  '01_撮影素材',
  '02_編集データ',
  '03_完成動画'
];

// ===== メニュー設定 =====
/**
 * 既存のonOpenに統合する場合（hearingSheetManager.jsから呼び出し）
 */
function addShootingFolderMenu(ui) {
  ui.createMenu('２.📁 撮影フォルダ')
    .addItem('🆕 新規フォルダ作成', 'createShootingFolder')
    .addItem('📂 企業シートから作成', 'createShootingFolderFromSheet')
    .addSeparator()
    .addItem('📋 最近作成したフォルダ一覧', 'showRecentFolders')
    .addSeparator()
    .addItem('⚙️ 親フォルダを設定', 'setParentFolder')
    .addToUi();
}

/**
 * 単独でメニューを追加する場合（デバッグ用）
 */
function addShootingFolderMenuStandalone() {
  const ui = SpreadsheetApp.getUi();
  addShootingFolderMenu(ui);
}

// ===== メイン機能: 撮影フォルダ作成 =====
function createShootingFolder() {
  const ui = SpreadsheetApp.getUi();

  // 親フォルダIDの確認
  const parentFolderId = getParentFolderId();
  if (!parentFolderId || parentFolderId === 'YOUR_PARENT_FOLDER_ID_HERE') {
    ui.alert(
      '⚠️ 親フォルダ未設定',
      '先に「⚙️ 親フォルダを設定」から親フォルダを設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // 企業名入力
  const response = ui.prompt(
    '📁 撮影データフォルダ作成',
    '企業名を入力してください（例：株式会社〇〇）：',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const companyName = response.getResponseText().trim();
  if (!companyName) {
    ui.alert('エラー', '企業名を入力してください。', ui.ButtonSet.OK);
    return;
  }

  try {
    // フォルダ作成
    const result = createFolderStructure(companyName, parentFolderId);

    // 成功ダイアログ（URLコピー機能付き）
    showSuccessDialog(companyName, result);

    // 作成履歴に追加
    addToHistory(companyName, result.mainFolderUrl, result.subfolders[0].url);

  } catch (error) {
    ui.alert('❌ エラー', 'フォルダ作成に失敗しました：\n' + error.message, ui.ButtonSet.OK);
  }
}

// ===== フォルダ構成を作成 =====
function createFolderStructure(companyName, parentFolderId) {
  // メインフォルダ名
  const mainFolderName = companyName + '_撮影データ';

  // 親フォルダ情報を取得（共有ドライブ対応）
  let parentInfo;
  try {
    parentInfo = Drive.Files.get(parentFolderId, { supportsAllDrives: true });
  } catch (e) {
    throw new Error('親フォルダにアクセスできません。フォルダIDと権限を確認してください。');
  }

  // 同名フォルダが存在するかチェック
  const query = "'" + parentFolderId + "' in parents and name = '" + mainFolderName + "' and trashed = false";
  const existingFiles = Drive.Files.list({
    q: query,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  // v2は items、v3は files
  const fileList = existingFiles.items || existingFiles.files || [];
  if (fileList.length > 0) {
    throw new Error('「' + mainFolderName + '」は既に存在します。');
  }

  // メインフォルダ作成（v2/v3両対応）
  const mainFolder = createFolder(mainFolderName, parentFolderId);

  // サブフォルダ作成（設定シートから取得）
  const subfolderUrls = [];
  const subfolders = getSubfoldersFromSettings();
  subfolders.forEach(function(name) {
    const subfolder = createFolder(name, mainFolder.id);
    subfolderUrls.push({
      name: name,
      url: 'https://drive.google.com/drive/folders/' + subfolder.id
    });
  });

  return {
    mainFolderName: mainFolderName,
    mainFolderUrl: 'https://drive.google.com/drive/folders/' + mainFolder.id,
    mainFolderId: mainFolder.id,
    subfolders: subfolderUrls
  };
}

// ===== フォルダ作成ヘルパー（v2/v3両対応） =====
function createFolder(folderName, parentId) {
  // Drive API v3 形式
  if (Drive.Files.create) {
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };
    return Drive.Files.create(metadata, null, {
      supportsAllDrives: true
    });
  }
  // Drive API v2 形式（フォールバック）
  else {
    const metadata = {
      title: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [{ id: parentId }]
    };
    return Drive.Files.insert(metadata, null, {
      supportsAllDrives: true
    });
  }
}

// ===== 成功ダイアログ（URLコピー機能付き） =====
function showSuccessDialog(companyName, result) {
  // 設定シートからメンバー一覧と担当者情報を取得
  const members = getMemberList();
  const settings = getSettingsFromSheet();
  const defaultTantou = settings['撮影担当'] || '';
  const defaultCC = settings['CC'] || '';

  // メンバー一覧をJSON化
  const membersJson = JSON.stringify(members);

  const html = `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        /* showSuccessDialog固有スタイル */
        .success-header {
          background: #e8f5e9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .success-header h2 {
          color: #2e7d32;
          margin: 0;
          font-size: 16px;
        }
        .folder-info {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px solid #e0e0e0;
        }
        .folder-info h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #333;
        }
        .url-box {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          word-break: break-all;
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn-copy {
          background: #43a047;
          color: white;
        }
        .btn-copy:hover {
          background: #388e3c;
        }
        .subfolders {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }
        .subfolder-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .subfolder-item span {
          color: #666;
        }
        .toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #323232;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          display: none;
          font-size: 13px;
        }
        .works-template {
          background: #fff3e0;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
          border: 1px solid #ffcc80;
        }
        .works-template h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #e65100;
        }
        .works-template pre {
          margin: 0;
          font-size: 12px;
          white-space: pre-wrap;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="success-header">
        <h2>✅ フォルダを作成しました</h2>
      </div>

      <div class="folder-info">
        <h3>📁 ${escapeHtml(result.mainFolderName)}</h3>
        <div class="url-box" id="mainUrl">${escapeHtml(result.mainFolderUrl)}</div>
        <div class="btn-group">
          <button class="btn-primary" onclick="openUrl('${escapeHtml(result.mainFolderUrl)}')">
            🔗 フォルダを開く
          </button>
          <button class="btn-copy" onclick="copyUrl('${escapeHtml(result.mainFolderUrl)}')">
            📋 URLをコピー
          </button>
        </div>

        <div class="subfolders">
          <strong>サブフォルダ:</strong>
          ${result.subfolders.map(sf => `
            <div class="subfolder-item">
              <span>📂 ${escapeHtml(sf.name)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="works-template">
        <h4>📝 撮影担当者への連絡用テンプレート</h4>
        <div style="margin-bottom: 10px; display: flex; gap: 20px; flex-wrap: wrap;">
          <div>
            <label style="font-size: 13px; color: #666;">撮影担当:</label>
            <select id="tantouSelect" onchange="updateWorksTemplate()" style="margin-left: 8px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
              <option value="">-- 選択 --</option>
            </select>
          </div>
          <div>
            <label style="font-size: 13px; color: #666;">CC:</label>
            <select id="ccSelect" onchange="updateWorksTemplate()" style="margin-left: 8px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
              <option value="">-- なし --</option>
            </select>
          </div>
        </div>
        <pre id="worksTemplate" style="color: #999;">（担当者を選択するとテンプレートが生成されます）</pre>
        <div style="margin-top: 10px;">
          <button class="btn-copy" onclick="copyWorksTemplate()" id="copyWorksBtn" disabled>📋 テンプレートをコピー</button>
        </div>

        <!-- プレーンテンプレート（アコーディオン） -->
        <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
          <div onclick="togglePlainTemplate()" style="cursor: pointer; font-size: 12px; color: #666;">
            <span id="plainTemplateIcon">▶</span> プレーンテンプレートを表示
          </div>
          <div id="plainTemplateSection" style="display: none; margin-top: 8px;">
            <pre style="font-size: 11px; background: #f9f9f9; padding: 8px; border-radius: 4px; white-space: pre-wrap;">@{{撮影担当}}
{{企業名}} 様の撮影データ共有フォルダを作成しました。

📁 撮影素材アップロード先:
{{撮影素材URL}}

撮影後、上記フォルダに素材をアップロードお願いします。

CC: @{{CC}}</pre>
            <button style="font-size: 11px; padding: 4px 8px; margin-top: 5px; background: #f1f3f4; border: none; border-radius: 4px; cursor: pointer;" onclick="copyPlainTemplate()">📋 プレーンをコピー</button>
          </div>
        </div>
      </div>

      <div class="works-template" style="background: #e3f2fd; border-color: #90caf9;">
        <h4 style="color: #1565c0;">📁 管理用（メインフォルダURL）</h4>
        <pre id="adminTemplate">${escapeHtml(companyName)} 様
撮影データフォルダ: ${result.mainFolderUrl}</pre>
        <div style="margin-top: 10px;">
          <button class="btn-copy" onclick="copyAdminTemplate()">📋 コピー</button>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">コピーしました</div>

      <script>
        // 設定値
        const members = ${membersJson};
        const defaultTantou = '${escapeHtml(defaultTantou)}';
        const defaultCC = '${escapeHtml(defaultCC)}';
        const companyName = '${escapeHtml(companyName)}';
        const shootingUrl = '${escapeHtml(result.subfolders[0].url)}';

        // 初期化
        window.onload = function() {
          // 撮影担当ドロップダウン
          const tantouSelect = document.getElementById('tantouSelect');
          members.forEach(function(name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === defaultTantou) {
              option.selected = true;
            }
            tantouSelect.appendChild(option);
          });

          // CCドロップダウン
          const ccSelect = document.getElementById('ccSelect');
          members.forEach(function(name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === defaultCC) {
              option.selected = true;
            }
            ccSelect.appendChild(option);
          });

          // デフォルト担当者がいれば自動でテンプレート生成
          if (defaultTantou) {
            updateWorksTemplate();
          }
        };

        function updateWorksTemplate() {
          const tantou = document.getElementById('tantouSelect').value;
          const cc = document.getElementById('ccSelect').value;
          const pre = document.getElementById('worksTemplate');
          const btn = document.getElementById('copyWorksBtn');

          if (!tantou) {
            pre.textContent = '（担当者を選択するとテンプレートが生成されます）';
            pre.style.color = '#999';
            btn.disabled = true;
            return;
          }

          let template = '@' + tantou + '\\n' +
            companyName + ' 様の撮影データ共有フォルダを作成しました。\\n\\n' +
            '📁 撮影素材アップロード先:\\n' +
            shootingUrl + '\\n\\n' +
            '撮影後、上記フォルダに素材をアップロードお願いします。';

          // CCがあれば追加
          if (cc) {
            template += '\\n\\nCC: @' + cc;
          }

          pre.textContent = template;
          pre.style.color = '#333';
          btn.disabled = false;
        }

        function openUrl(url) {
          window.open(url, '_blank');
        }

        function copyUrl(url) {
          navigator.clipboard.writeText(url).then(function() {
            showToast();
          });
        }

        function copyWorksTemplate() {
          const template = document.getElementById('worksTemplate').textContent;
          if (template && !template.includes('担当者を選択すると')) {
            navigator.clipboard.writeText(template).then(function() {
              showToast();
            });
          }
        }

        function copyAdminTemplate() {
          const template = document.getElementById('adminTemplate').textContent;
          navigator.clipboard.writeText(template).then(function() {
            showToast();
          });
        }

        function togglePlainTemplate() {
          const section = document.getElementById('plainTemplateSection');
          const icon = document.getElementById('plainTemplateIcon');
          if (section.style.display === 'none') {
            section.style.display = 'block';
            icon.textContent = '▼';
          } else {
            section.style.display = 'none';
            icon.textContent = '▶';
          }
        }

        function copyPlainTemplate() {
          const plainTemplate = '@{{撮影担当}}\\n' +
            '{{企業名}} 様の撮影データ共有フォルダを作成しました。\\n\\n' +
            '📁 撮影素材アップロード先:\\n' +
            '{{撮影素材URL}}\\n\\n' +
            '撮影後、上記フォルダに素材をアップロードお願いします。\\n\\n' +
            'CC: @{{CC}}';
          navigator.clipboard.writeText(plainTemplate).then(function() {
            showToast();
          });
        }

        function showToast() {
          const toast = document.getElementById('toast');
          toast.style.display = 'block';
          setTimeout(function() {
            toast.style.display = 'none';
          }, 2000);
        }
      </script>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(680);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '撮影フォルダ作成完了');
}

// ===== 親フォルダ設定 =====
function setParentFolder() {
  const ui = SpreadsheetApp.getUi();

  const currentId = getParentFolderId();
  let currentInfo = '';
  if (currentId && currentId !== 'YOUR_PARENT_FOLDER_ID_HERE') {
    try {
      const folder = Drive.Files.get(currentId, { supportsAllDrives: true });
      currentInfo = '\n\n現在の設定: ' + folder.title;
    } catch (e) {
      currentInfo = '\n\n現在の設定: (無効なフォルダID)';
    }
  }

  const response = ui.prompt(
    '⚙️ 親フォルダ設定',
    '撮影データを格納する親フォルダのIDを入力してください。\n\n' +
    '※ Google DriveのフォルダURLから取得できます\n' +
    '例: https://drive.google.com/drive/folders/XXXXXXXXX\n' +
    '    → XXXXXXXXX の部分がフォルダID\n\n' +
    '※ 共有ドライブにも対応しています' +
    currentInfo,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  let folderId = response.getResponseText().trim();
  if (!folderId) {
    ui.alert('エラー', 'フォルダIDを入力してください。', ui.ButtonSet.OK);
    return;
  }

  // URLが入力された場合、IDを抽出
  const urlMatch = folderId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    folderId = urlMatch[1];
  }

  // フォルダの存在確認（共有ドライブ対応）
  try {
    const folder = Drive.Files.get(folderId, { supportsAllDrives: true });
    // プロパティに保存
    PropertiesService.getScriptProperties().setProperty('PARENT_FOLDER_ID', folderId);
    ui.alert('✅ 設定完了', '親フォルダを設定しました:\n' + folder.title, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ エラー', 'フォルダが見つかりません。\n\n' +
      '確認事項:\n' +
      '・フォルダIDが正しいか\n' +
      '・フォルダへのアクセス権限があるか\n' +
      '・Drive APIが有効になっているか\n\n' +
      'Drive APIの有効化:\n' +
      'Apps Scriptエディタ → サービス → Drive API を追加',
      ui.ButtonSet.OK);
  }
}

// ===== 親フォルダID取得 =====
function getParentFolderId() {
  // プロパティから取得、なければ定数を使用
  const savedId = PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID');
  return savedId || PARENT_FOLDER_ID;
}

// ===== 作成履歴機能 =====
function addToHistory(companyName, url, shootingFolderUrl) {
  const props = PropertiesService.getScriptProperties();
  let history = JSON.parse(props.getProperty('FOLDER_HISTORY') || '[]');

  history.unshift({
    companyName: companyName,
    url: url,
    shootingFolderUrl: shootingFolderUrl,  // 01_撮影素材のURL
    createdAt: new Date().toLocaleString('ja-JP')
  });

  // 最新20件のみ保持
  history = history.slice(0, 20);

  props.setProperty('FOLDER_HISTORY', JSON.stringify(history));
}

function showRecentFolders() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const history = JSON.parse(props.getProperty('FOLDER_HISTORY') || '[]');

  if (history.length === 0) {
    ui.alert('📋 作成履歴', '作成履歴がありません。', ui.ButtonSet.OK);
    return;
  }

  // 設定シートからメンバー一覧と担当者情報を取得
  const members = getMemberList();
  const settings = getSettingsFromSheet();
  const defaultTantou = settings['撮影担当'] || '';
  const defaultCC = settings['CC'] || '';

  // 履歴データとメンバー一覧をJSONとしてHTMLに埋め込む
  const historyJson = JSON.stringify(history);
  const membersJson = JSON.stringify(members);

  const html = `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        /* showRecentFolders固有スタイル */
        .folder-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
        }
        .folder-item {
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .folder-item:hover {
          background: #e3f2fd;
        }
        .folder-item.selected {
          background: #bbdefb;
        }
        .folder-item:last-child {
          border-bottom: none;
        }
        .company-name {
          font-weight: bold;
          color: #333;
        }
        .date {
          color: #666;
          font-size: 11px;
          margin-top: 4px;
        }
        .template-section {
          margin-top: 20px;
          padding: 15px;
          background: #fff3e0;
          border-radius: 8px;
          border: 1px solid #ffcc80;
          display: none;
        }
        .template-section.show {
          display: block;
        }
        .template-section h4 {
          margin: 0 0 10px 0;
          color: #e65100;
          font-size: 13px;
        }
        .template-content {
          background: white;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: pre-wrap;
          border: 1px solid #e0e0e0;
          max-height: 150px;
          overflow-y: auto;
        }
        button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          margin-top: 10px;
          margin-right: 8px;
        }
        .btn-copy {
          background: #43a047;
          color: white;
        }
        .btn-open {
          background: #1976d2;
          color: white;
        }
        .btn-delete {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin: 0;
          line-height: 1;
        }
        .btn-delete:hover {
          background: #ffcdd2;
        }
        .toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #323232;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          display: none;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <h3>📋 最近作成したフォルダ</h3>
      <p class="hint">クリックして選択 → テンプレートをコピー</p>

      <div class="folder-list" id="folderList">
        ${history.map((item, index) => `
          <div class="folder-item" id="item-${index}" onclick="selectFolder(${index})">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <div class="company-name">${escapeHtml(item.companyName)}</div>
                <div class="date">${escapeHtml(item.createdAt)}</div>
              </div>
              <button class="btn-delete" onclick="event.stopPropagation(); confirmDelete(${index}, '${escapeHtml(item.companyName).replace(/'/g, "\\'")}')">×</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="template-section" id="templateSection">
        <h4>📁 撮影素材フォルダURL</h4>
        <div class="template-content" id="urlContent" style="max-height: 40px; margin-bottom: 10px;"></div>
        <button class="btn-copy" onclick="copyUrl()">📋 URLをコピー</button>
        <button class="btn-open" onclick="openFolder()">🔗 フォルダを開く</button>

        <h4 style="margin-top: 15px;">📝 撮影担当者への連絡用テンプレート</h4>
        <div style="margin-bottom: 10px; display: flex; gap: 15px; flex-wrap: wrap;">
          <div>
            <label style="font-size: 12px; color: #666;">撮影担当:</label>
            <select id="tantouSelect" onchange="updateTemplate()" style="margin-left: 8px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
              <option value="">-- 選択 --</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">CC:</label>
            <select id="ccSelect" onchange="updateTemplate()" style="margin-left: 8px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
              <option value="">-- なし --</option>
            </select>
          </div>
        </div>
        <div class="template-content" id="templateContent" style="color: #999;">（担当者を選択してください）</div>
        <button class="btn-copy" onclick="copyTemplate()" id="copyTemplateBtn" disabled>📋 テンプレートをコピー</button>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">コピーしました</div>

      <script>
        const history = ${historyJson};
        const members = ${membersJson};
        const defaultTantou = '${escapeHtml(defaultTantou)}';
        const defaultCC = '${escapeHtml(defaultCC)}';
        let selectedIndex = -1;

        // 初期化: ドロップダウンにメンバーを追加
        window.onload = function() {
          // 撮影担当ドロップダウン
          const tantouSelect = document.getElementById('tantouSelect');
          members.forEach(function(name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === defaultTantou) {
              option.selected = true;
            }
            tantouSelect.appendChild(option);
          });

          // CCドロップダウン
          const ccSelect = document.getElementById('ccSelect');
          members.forEach(function(name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === defaultCC) {
              option.selected = true;
            }
            ccSelect.appendChild(option);
          });
        };

        function selectFolder(index) {
          // 選択状態を更新
          document.querySelectorAll('.folder-item').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
          });
          selectedIndex = index;

          // URLを表示
          const item = history[index];
          const shootingUrl = item.shootingFolderUrl || item.url;
          document.getElementById('urlContent').textContent = shootingUrl;

          // テンプレートセクションを表示
          document.getElementById('templateSection').classList.add('show');

          // デフォルト担当者がいれば自動でテンプレート生成
          if (defaultTantou) {
            updateTemplate();
          } else {
            document.getElementById('templateContent').textContent = '（担当者を選択してください）';
            document.getElementById('templateContent').style.color = '#999';
            document.getElementById('copyTemplateBtn').disabled = true;
          }
        }

        function updateTemplate() {
          if (selectedIndex < 0) return;

          const tantou = document.getElementById('tantouSelect').value;
          const cc = document.getElementById('ccSelect').value;
          const content = document.getElementById('templateContent');
          const btn = document.getElementById('copyTemplateBtn');

          if (!tantou) {
            content.textContent = '（担当者を選択してください）';
            content.style.color = '#999';
            btn.disabled = true;
            return;
          }

          const item = history[selectedIndex];
          const shootingUrl = item.shootingFolderUrl || item.url;

          let template = '@' + tantou + '\\n' +
            item.companyName + ' 様の撮影データ共有フォルダを作成しました。\\n\\n' +
            '📁 撮影素材アップロード先:\\n' +
            shootingUrl + '\\n\\n' +
            '撮影後、上記フォルダに素材をアップロードお願いします。';

          // CCがあれば追加
          if (cc) {
            template += '\\n\\nCC: @' + cc;
          }

          content.textContent = template;
          content.style.color = '#333';
          btn.disabled = false;
        }

        function copyUrl() {
          const url = document.getElementById('urlContent').textContent;
          navigator.clipboard.writeText(url).then(function() {
            showToast();
          });
        }

        function copyTemplate() {
          const template = document.getElementById('templateContent').textContent;
          if (template && !template.includes('担当者を選択')) {
            navigator.clipboard.writeText(template).then(function() {
              showToast();
            });
          }
        }

        function openFolder() {
          if (selectedIndex >= 0) {
            window.open(history[selectedIndex].url, '_blank');
          }
        }

        function showToast() {
          const toast = document.getElementById('toast');
          toast.style.display = 'block';
          setTimeout(function() {
            toast.style.display = 'none';
          }, 2000);
        }

        function confirmDelete(index, companyName) {
          if (confirm('「' + companyName + '」を履歴から削除しますか？\\n\\n※ Googleドライブ上のフォルダは削除されません')) {
            google.script.run
              .withSuccessHandler(function() {
                // UIから削除
                document.getElementById('item-' + index).remove();
                // 履歴配列からも削除
                history.splice(index, 1);
                // テンプレートセクションを非表示
                document.getElementById('templateSection').classList.remove('show');
                selectedIndex = -1;
                // 履歴が空になったら閉じる
                if (history.length === 0) {
                  alert('履歴がすべて削除されました');
                  google.script.host.close();
                }
              })
              .withFailureHandler(function(err) {
                alert('削除に失敗しました: ' + err.message);
              })
              .deleteHistoryItem(index);
          }
        }
      </script>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(550);

  ui.showModalDialog(htmlOutput, '作成履歴');
}

// ===== 履歴削除 =====
function deleteHistoryItem(index) {
  const props = PropertiesService.getScriptProperties();
  let history = JSON.parse(props.getProperty('FOLDER_HISTORY') || '[]');

  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    props.setProperty('FOLDER_HISTORY', JSON.stringify(history));
  }
}

// ===== ユーティリティ =====
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// ================================================================================
// ===== 企業シートから作成（改善機能） =====
// ================================================================================

/**
 * 企業シート選択ダイアログを表示してフォルダを作成
 * - 企業シートの企業名を使用（手入力不要）
 * - 作成したフォルダURLを企業シートのPart③に保存
 */
function createShootingFolderFromSheet() {
  const ui = SpreadsheetApp.getUi();

  // 親フォルダIDの確認
  const parentFolderId = getParentFolderId();
  if (!parentFolderId || parentFolderId === 'YOUR_PARENT_FOLDER_ID_HERE') {
    ui.alert(
      '⚠️ 親フォルダ未設定',
      '先に「⚙️ 親フォルダを設定」から親フォルダを設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }

  // 企業シート一覧を取得
  const sheetList = getCompanySheetListForFolder();

  if (sheetList.length === 0) {
    ui.alert('⚠️ 企業シートがありません', '先にヒアリングシートを作成してください。', ui.ButtonSet.OK);
    return;
  }

  const html = HtmlService.createHtmlOutput(createSheetSelectDialogHTML(sheetList))
    .setWidth(550)
    .setHeight(500);
  ui.showModalDialog(html, '📂 企業シートから撮影フォルダ作成');
}

/**
 * 企業シート一覧を取得（フォルダ作成用）
 */
function getCompanySheetListForFolder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    // settingsSheet.js の isExcludedSheet() を使用
    if (!isExcludedSheet(name)) {
      let companyName = '';
      try {
        companyName = sheet.getRange(5, 3).getValue() || '';
      } catch (e) {
        companyName = '';
      }

      // Part③のフォルダURLを確認（既に作成済みか）
      let hasFolder = false;
      try {
        const folderUrl = sheet.getRange(135, 3).getValue();  // 撮影素材フォルダURL
        hasFolder = !!folderUrl;
      } catch (e) {
        hasFolder = false;
      }

      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        isActive: name === activeSheetName,
        hasFolder: hasFolder
      });
    }
  }

  return result;
}

/**
 * 企業シート選択ダイアログHTML
 */
function createSheetSelectDialogHTML(sheetList) {
  const sheetListJson = JSON.stringify(sheetList);

  return `
<!DOCTYPE html>
<html>
<head>
  ${CI_DIALOG_STYLES}
  <style>
    /* createSheetSelectDialog固有スタイル */
    h3 { margin: 0 0 15px 0; color: #1a73e8; }
    .sheet-list { max-height: 280px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 6px; }
    .sheet-item {
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sheet-item:last-child { border-bottom: none; }
    .sheet-item:hover { background: #f5f5f5; }
    .sheet-item.selected { background: #e3f2fd; }
    .sheet-item.has-folder { background: #fff8e1; }
    .sheet-item.has-folder.selected { background: #ffecb3; }
    .sheet-info { flex: 1; }
    .sheet-name { font-weight: bold; color: #333; }
    .company-name { color: #666; font-size: 12px; margin-top: 2px; }
    .badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .badge-folder { background: #ff9800; color: white; }
    button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 10px; }
    .loading { display: none; margin-left: 10px; color: #1a73e8; }
  </style>
</head>
<body>
  <h3>📂 企業シートから撮影フォルダ作成</h3>

  <div class="info-box">
    <strong>使い方：</strong><br>
    企業シートを選択すると、その企業名でフォルダを作成し、<br>
    URLをPart③（処理データ）に自動保存します。
  </div>

  <div class="sheet-list" id="sheetList"></div>

  <div style="margin-top: 15px;">
    <button class="btn-primary" id="createBtn" onclick="createFolder()" disabled>
      📁 フォルダを作成
    </button>
    <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
    <span class="loading" id="loading">⏳ 処理中...</span>
  </div>

  <div class="status" id="status"></div>

  <script>
    const sheetList = ${sheetListJson};
    let selectedSheet = null;

    window.onload = function() {
      renderSheetList();
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

      sorted.forEach((item) => {
        const div = document.createElement('div');
        let classes = 'sheet-item';
        if (item.hasFolder) classes += ' has-folder';
        if (item.isActive && !selectedSheet) {
          classes += ' selected';
          selectedSheet = item;
          document.getElementById('createBtn').disabled = false;
        }
        div.className = classes;

        let badges = '';
        if (item.isActive) badges += '<span class="badge badge-active">アクティブ</span>';
        if (item.hasFolder) badges += '<span class="badge badge-folder">作成済み</span>';

        div.innerHTML = \`
          <div class="sheet-info">
            <div class="sheet-name">\${escapeHtml(item.sheetName)}\${badges}</div>
            <div class="company-name">\${item.companyName ? '🏢 ' + escapeHtml(item.companyName) : '（企業名なし）'}</div>
          </div>
        \`;

        div.onclick = function() {
          document.querySelectorAll('.sheet-item').forEach(el => el.classList.remove('selected'));
          div.classList.add('selected');
          selectedSheet = item;
          document.getElementById('createBtn').disabled = false;

          // 作成済みの場合は警告
          if (item.hasFolder) {
            showStatus('⚠️ この企業シートには既にフォルダが作成されています。再作成すると上書きされます。', 'warning');
          } else {
            document.getElementById('status').style.display = 'none';
          }
        };

        container.appendChild(div);
      });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function createFolder() {
      if (!selectedSheet) {
        showStatus('シートを選択してください', 'error');
        return;
      }

      if (!selectedSheet.companyName) {
        showStatus('選択したシートに企業名が設定されていません（行5, C列）', 'error');
        return;
      }

      document.getElementById('loading').style.display = 'inline';
      document.getElementById('createBtn').disabled = true;

      google.script.run
        .withSuccessHandler(handleResult)
        .withFailureHandler(handleError)
        .executeCreateFolderFromSheet(selectedSheet.sheetName, selectedSheet.companyName);
    }

    function handleResult(result) {
      document.getElementById('loading').style.display = 'none';

      if (result.success) {
        showStatus('✅ フォルダを作成し、企業シートに保存しました', 'success');
        // 成功ダイアログを表示
        google.script.run.showSuccessDialogFromResult(result);
      } else {
        showStatus('❌ ' + result.error, 'error');
        document.getElementById('createBtn').disabled = false;
      }
    }

    function handleError(error) {
      document.getElementById('loading').style.display = 'none';
      showStatus('❌ エラー: ' + error.message, 'error');
      document.getElementById('createBtn').disabled = false;
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.innerHTML = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
`;
}

/**
 * 企業シートからフォルダを作成（ダイアログから呼び出し）
 */
function executeCreateFolderFromSheet(sheetName, companyName) {
  const parentFolderId = getParentFolderId();

  try {
    // フォルダ作成
    const result = createFolderStructure(companyName, parentFolderId);

    // 企業シートのPart③にURL保存
    savePart3DataForce(sheetName, '撮影素材フォルダURL', result.subfolders[0].url);
    savePart3DataForce(sheetName, 'メインフォルダURL', result.mainFolderUrl);

    // 作成履歴に追加
    addToHistory(companyName, result.mainFolderUrl, result.subfolders[0].url);

    return {
      success: true,
      companyName: companyName,
      sheetName: sheetName,
      mainFolderName: result.mainFolderName,
      mainFolderUrl: result.mainFolderUrl,
      mainFolderId: result.mainFolderId,
      subfolders: result.subfolders,
      savedToSheet: true
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 結果から成功ダイアログを表示
 */
function showSuccessDialogFromResult(result) {
  if (!result.success) return;

  showSuccessDialog(result.companyName, {
    mainFolderName: result.mainFolderName,
    mainFolderUrl: result.mainFolderUrl,
    mainFolderId: result.mainFolderId,
    subfolders: result.subfolders
  });
}
