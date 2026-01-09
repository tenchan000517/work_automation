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
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📁 撮影フォルダ')
    .addItem('🆕 新規フォルダ作成', 'createShootingFolder')
    .addSeparator()
    .addItem('📋 最近作成したフォルダ一覧', 'showRecentFolders')
    .addSeparator()
    .addItem('⚙️ 親フォルダを設定', 'setParentFolder')
    .addToUi();
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

  // サブフォルダ作成
  const subfolderUrls = [];
  SUBFOLDERS.forEach(function(name) {
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
  const html = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          padding: 20px;
          background: #f8f9fa;
        }
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
        .btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #1976d2;
          color: white;
        }
        .btn-primary:hover {
          background: #1565c0;
        }
        .btn-copy {
          background: #43a047;
          color: white;
        }
        .btn-copy:hover {
          background: #388e3c;
        }
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }
        .btn-secondary:hover {
          background: #d0d0d0;
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
        <pre id="worksTemplate">@（撮影担当者名）
${escapeHtml(companyName)} 様の撮影データ共有フォルダを作成しました。

📁 撮影素材アップロード先:
${result.subfolders[0].url}

撮影後、上記フォルダに素材をアップロードお願いします。</pre>
        <div style="margin-top: 10px;">
          <button class="btn-copy" onclick="copyWorksTemplate()">📋 テンプレートをコピー</button>
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
          navigator.clipboard.writeText(template).then(function() {
            showToast();
          });
        }

        function copyAdminTemplate() {
          const template = document.getElementById('adminTemplate').textContent;
          navigator.clipboard.writeText(template).then(function() {
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

  // 履歴データをJSONとしてHTMLに埋め込む
  const historyJson = JSON.stringify(history);

  const html = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          padding: 20px;
          background: #f8f9fa;
        }
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
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
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
        .hint {
          color: #666;
          font-size: 12px;
          margin-bottom: 10px;
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
        <div class="template-content" id="templateContent"></div>
        <button class="btn-copy" onclick="copyTemplate()">📋 テンプレートをコピー</button>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn-secondary" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">コピーしました</div>

      <script>
        const history = ${historyJson};
        let selectedIndex = -1;

        function selectFolder(index) {
          // 選択状態を更新
          document.querySelectorAll('.folder-item').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
          });
          selectedIndex = index;

          // URLとテンプレートを生成
          const item = history[index];
          const shootingUrl = item.shootingFolderUrl || item.url;

          // URLを表示
          document.getElementById('urlContent').textContent = shootingUrl;

          // テンプレートを生成
          const template = '@（撮影担当者名）\\n' +
            item.companyName + ' 様の撮影データ共有フォルダを作成しました。\\n\\n' +
            '📁 撮影素材アップロード先:\\n' +
            shootingUrl + '\\n\\n' +
            '撮影後、上記フォルダに素材をアップロードお願いします。';

          document.getElementById('templateContent').textContent = template;
          document.getElementById('templateSection').classList.add('show');
        }

        function copyUrl() {
          const url = document.getElementById('urlContent').textContent;
          navigator.clipboard.writeText(url).then(function() {
            showToast();
          });
        }

        function copyTemplate() {
          const template = document.getElementById('templateContent').textContent;
          navigator.clipboard.writeText(template).then(function() {
            showToast();
          });
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
