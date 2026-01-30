/**
 * HP制作 ページフォルダ追加 GAS
 *
 * 【機能】
 * - 既存の企業フォルダ内にページフォルダを追加
 * - 必要ページをチェックボックスで選択
 * - カスタムフォルダを追加可能（複数）
 * - 選択ページをヒアリングシートのPart④に保存
 *
 * 【フォルダ構成】
 * HP・LPフォルダ/
 * └─ 会社正式名称/        ← 企業フォルダ（事前に作成済み）
 *     ├─ TOP/             ← ここでページフォルダを追加
 *     ├─ About/
 *     ├─ Service/
 *     └─ (カスタム追加)
 *
 * 【設計思想】
 * - 企業フォルダは先に作成（ページ構成決定前）
 * - ページ構成が決まったら、このメニューでフォルダを追加
 * - commonStyles.jsを使用してUI統一
 */

// ===== 定数 =====

// 標準ページリスト（チェックボックスで表示）
const HP_PAGE_OPTIONS = [
  { id: 'top', name: 'TOP', description: 'トップページ', default: true },
  { id: 'about', name: 'About', description: '会社概要・私たちについて', default: true },
  { id: 'service', name: 'Service', description: 'サービス・事業内容', default: true },
  { id: 'recruit', name: 'Recruit', description: '採用情報', default: false },
  { id: 'contact', name: 'Contact', description: 'お問い合わせ', default: false },
  { id: 'news', name: 'News', description: 'お知らせ・ニュース', default: false },
  { id: 'blog', name: 'Blog', description: 'ブログ・コラム', default: false },
  { id: 'gallery', name: 'Gallery', description: 'ギャラリー・実績', default: false },
  { id: 'faq', name: 'FAQ', description: 'よくある質問', default: false },
  { id: 'company', name: 'Company', description: '会社情報', default: false }
];

// ===== メニュー追加 =====
function hp_addFolderMenu(ui) {
  ui.createMenu('3.📁 ページフォルダ')
    .addItem('📂 ページフォルダ追加', 'hp_showCreateFolderDialog')
    .addSeparator()
    .addItem('📋 最近追加したフォルダ一覧', 'hp_showRecentFolders')
    .addToUi();
}

// ===== メイン: ページフォルダ追加ダイアログ =====
function hp_showCreateFolderDialog() {
  const ui = SpreadsheetApp.getUi();

  // 企業シート一覧を取得（企業フォルダURL付き）
  const sheetList = hp_getCompanySheetListForFolder();

  const html = HtmlService.createHtmlOutput(hp_createFolderDialogHtml(sheetList))
    .setWidth(700)
    .setHeight(750);
  ui.showModalDialog(html, '📂 ページフォルダ追加');
}

/**
 * 企業シート一覧を取得（ページフォルダ追加用）
 * ※企業フォルダURLがあるかどうかも確認
 */
function hp_getCompanySheetListForFolder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (!hp_isExcludedSheet(name)) {
      // 企業名（略称）- 5行目2列目
      let companyName = '';
      try {
        companyName = sheet.getRange(5, 2).getValue() || '';
      } catch (e) {
        companyName = '';
      }

      // 会社正式名称 - 10行目2列目
      let officialName = '';
      try {
        officialName = sheet.getRange(10, 2).getValue() || '';
      } catch (e) {
        officialName = '';
      }

      // Part④の企業フォルダURLを確認
      let companyFolderUrl = '';
      let companyFolderId = '';
      const lastRow = sheet.getLastRow();
      for (let row = 1; row <= lastRow; row++) {
        if (sheet.getRange(row, 1).getValue() === '企業フォルダURL') {
          companyFolderUrl = sheet.getRange(row, 2).getValue() || '';
          // URLからフォルダIDを抽出
          const match = companyFolderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
          if (match) {
            companyFolderId = match[1];
          }
          break;
        }
      }

      result.push({
        sheetName: name,
        companyName: String(companyName).trim(),
        officialName: String(officialName).trim(),
        isActive: name === activeSheetName,
        hasCompanyFolder: !!companyFolderUrl,
        companyFolderUrl: companyFolderUrl,
        companyFolderId: companyFolderId
      });
    }
  }

  return result;
}

/**
 * ページフォルダ追加ダイアログHTML
 */
function hp_createFolderDialogHtml(sheetList) {
  const sheetListJson = JSON.stringify(sheetList);
  const pageOptionsJson = JSON.stringify(HP_PAGE_OPTIONS);

  return `
<!DOCTYPE html>
<html>
<head>
  ${CI_DIALOG_STYLES}
  <style>
    h3 { margin: 0 0 15px 0; color: #1565C0; }

    /* 企業選択ドロップダウン */
    .company-select-wrapper { position: relative; margin-bottom: 20px; }
    .company-select-display {
      width: 100%;
      padding: 12px 36px 12px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    .company-select-display:hover { border-color: #1565C0; }
    .company-select-display.active { border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1); }
    .company-select-display::after {
      content: '▼';
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: #666;
    }
    .company-select-display .placeholder { color: #999; }
    .company-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
      display: none;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
    }
    .company-select-dropdown.show { display: block; }
    .company-item {
      padding: 12px 14px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
    }
    .company-item:last-child { border-bottom: none; }
    .company-item:hover { background: #f5f5f5; }
    .company-item.selected { background: #e3f2fd; }
    .company-item.has-folder { border-left: 3px solid #4CAF50; }
    .company-item.no-folder { border-left: 3px solid #ff9800; opacity: 0.7; }

    /* ページ選択 */
    .page-section {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .page-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
    }
    .page-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .page-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .page-item:hover { border-color: #1565C0; background: #E3F2FD; }
    .page-item.checked { border-color: #1565C0; background: #E3F2FD; }
    .page-item input { margin-right: 10px; }
    .page-name { font-weight: bold; color: #333; }
    .page-desc { font-size: 11px; color: #666; margin-left: 8px; }

    /* カスタムフォルダ追加 */
    .custom-section {
      background: #FFF3E0;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .custom-section h4 {
      margin: 0 0 12px 0;
      color: #E65100;
      font-size: 14px;
    }
    .custom-list {
      margin-bottom: 12px;
    }
    .custom-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .custom-item input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
    }
    .custom-item button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-remove {
      background: #FFCDD2;
      color: #C62828;
    }
    .btn-add {
      background: #1565C0;
      color: white;
    }

    /* プレビュー */
    .preview-section {
      background: #E8F5E9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .preview-section h4 {
      margin: 0 0 12px 0;
      color: #2E7D32;
      font-size: 14px;
    }
    .preview-tree {
      font-family: monospace;
      font-size: 13px;
      background: white;
      padding: 12px;
      border-radius: 4px;
      max-height: 150px;
      overflow-y: auto;
    }

    .footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .loading { display: none; margin-left: 10px; color: #1565C0; }
    .badge-folder { background: #4CAF50; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .badge-no-folder { background: #ff9800; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
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
    .warning-box {
      background: #FFF3E0;
      border: 1px solid #FF9800;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      color: #E65100;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h3>📂 ページフォルダ追加</h3>
  <p style="color: #666; margin: 0 0 15px 0; font-size: 13px;">
    既存の企業フォルダ内にページフォルダ（TOP, About等）を追加します。
  </p>

  <!-- 企業選択 -->
  <div class="input-section">
    <span class="input-label">対象企業を選択</span>
    <div class="company-select-wrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業シートを選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
  </div>

  <!-- ページ選択 -->
  <div class="page-section">
    <h4>📄 作成するフォルダを選択</h4>
    <div class="page-grid" id="pageGrid"></div>
  </div>

  <!-- カスタムフォルダ追加 -->
  <div class="custom-section">
    <h4>➕ カスタムフォルダを追加</h4>
    <div class="custom-list" id="customList"></div>
    <button class="btn-add" onclick="addCustomFolder()">＋ フォルダを追加</button>
  </div>

  <!-- プレビュー -->
  <div class="preview-section">
    <h4>📂 フォルダ構成プレビュー</h4>
    <div class="preview-tree" id="previewTree">（企業を選択してください）</div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-primary" id="createBtn" onclick="createFolder()" disabled>
      📁 フォルダを作成
    </button>
    <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
    <span class="loading" id="loading">⏳ 処理中...</span>
  </div>

  <div class="status" id="status"></div>
  <div class="toast" id="toast">コピーしました</div>

  ${CI_UI_COMPONENTS}

  <script>
    const sheetList = ${sheetListJson};
    const pageOptions = ${pageOptionsJson};
    let selectedSheet = null;
    let customFolders = [];

    window.onload = function() {
      renderPageGrid();
      renderCompanyDropdown();
      updatePreview();

      // アクティブがあれば自動選択
      const activeItem = sheetList.find(item => item.isActive);
      if (activeItem) {
        selectCompany(activeItem);
      }
    };

    // ===== 企業選択 =====
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

      // アクティブ最上段、残りはそのまま
      const sorted = [...sheetList].sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return 0;
      });

      sorted.forEach(item => {
        const div = document.createElement('div');
        let classes = 'company-item';
        if (item.hasCompanyFolder) {
          classes += ' has-folder';
        } else {
          classes += ' no-folder';
        }
        if (selectedSheet && selectedSheet.sheetName === item.sheetName) classes += ' selected';
        div.className = classes;

        const activeBadge = item.isActive ? '<span class="badge-active">アクティブ</span>' : '';
        const folderBadge = item.hasCompanyFolder
          ? '<span class="badge-folder">企業フォルダあり</span>'
          : '<span class="badge-no-folder">企業フォルダなし</span>';

        const displayName = item.officialName || item.companyName || item.sheetName;

        div.innerHTML = \`
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:bold;">\${escapeHtml(displayName)}</span>
            \${activeBadge}
            \${folderBadge}
          </div>
          <div style="font-size:12px;color:#666;margin-top:4px;">
            シート名: \${escapeHtml(item.sheetName)}
          </div>
        \`;

        div.onclick = function(e) {
          e.stopPropagation();
          selectCompany(item);
          toggleCompanyDropdown();
        };

        dropdown.appendChild(div);
      });
    }

    function selectCompany(item) {
      selectedSheet = item;

      const display = document.getElementById('companySelectDisplay');
      const activeBadge = item.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
      const displayName = item.officialName || item.companyName || item.sheetName;

      if (item.hasCompanyFolder) {
        const folderBadge = '<span class="badge-folder" style="margin-left:8px;">企業フォルダあり</span>';
        display.innerHTML = \`<span>\${escapeHtml(displayName)}\${activeBadge}\${folderBadge}</span>\`;
        document.getElementById('createBtn').disabled = false;
        document.getElementById('status').style.display = 'none';
      } else {
        const folderBadge = '<span class="badge-no-folder" style="margin-left:8px;">企業フォルダなし</span>';
        display.innerHTML = \`<span>\${escapeHtml(displayName)}\${activeBadge}\${folderBadge}</span>\`;
        document.getElementById('createBtn').disabled = true;
        showStatus('⚠️ この企業には企業フォルダがありません。先に「1.📋 HP制作」→「📂 企業フォルダ作成」を実行してください。', 'warning');
      }

      updatePreview();
    }

    // ドロップダウン外クリックで閉じる
    document.addEventListener('click', function(e) {
      const wrapper = document.querySelector('.company-select-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('companySelectDropdown').classList.remove('show');
        document.getElementById('companySelectDisplay').classList.remove('active');
      }
    });

    // ===== ページ選択 =====
    function renderPageGrid() {
      const grid = document.getElementById('pageGrid');
      grid.innerHTML = '';

      pageOptions.forEach(page => {
        const div = document.createElement('div');
        div.className = 'page-item' + (page.default ? ' checked' : '');
        div.innerHTML = \`
          <input type="checkbox" id="page_\${page.id}" \${page.default ? 'checked' : ''} onchange="togglePage('\${page.id}')">
          <span class="page-name">\${escapeHtml(page.name)}</span>
          <span class="page-desc">\${escapeHtml(page.description)}</span>
        \`;
        div.onclick = function(e) {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = div.querySelector('input');
            checkbox.checked = !checkbox.checked;
            togglePage(page.id);
          }
        };
        grid.appendChild(div);
      });
    }

    function togglePage(pageId) {
      const checkbox = document.getElementById('page_' + pageId);
      const item = checkbox.closest('.page-item');
      if (checkbox.checked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
      updatePreview();
    }

    // ===== カスタムフォルダ =====
    function addCustomFolder() {
      customFolders.push('');
      renderCustomList();
      updatePreview();
    }

    function removeCustomFolder(index) {
      customFolders.splice(index, 1);
      renderCustomList();
      updatePreview();
    }

    function updateCustomFolder(index, value) {
      customFolders[index] = value;
      updatePreview();
    }

    function renderCustomList() {
      const list = document.getElementById('customList');
      list.innerHTML = '';

      customFolders.forEach((folder, index) => {
        const div = document.createElement('div');
        div.className = 'custom-item';
        div.innerHTML = \`
          <input type="text" value="\${escapeHtml(folder)}"
                 placeholder="フォルダ名を入力"
                 oninput="updateCustomFolder(\${index}, this.value)">
          <button class="btn-remove" onclick="removeCustomFolder(\${index})">×</button>
        \`;
        list.appendChild(div);
      });
    }

    // ===== プレビュー =====
    function updatePreview() {
      const preview = document.getElementById('previewTree');

      if (!selectedSheet) {
        preview.textContent = '（企業を選択してください）';
        return;
      }

      if (!selectedSheet.hasCompanyFolder) {
        preview.textContent = '（企業フォルダが必要です）';
        return;
      }

      const displayName = selectedSheet.officialName || selectedSheet.companyName || selectedSheet.sheetName;
      const folders = getSelectedFolders();

      if (folders.length === 0) {
        preview.textContent = displayName + '/\\n  └─ （追加するフォルダを選択してください）';
        return;
      }

      let tree = displayName + '/\\n';
      folders.forEach((folder, index) => {
        const prefix = index === folders.length - 1 ? '└─' : '├─';
        tree += '  ' + prefix + ' ' + folder + '/\\n';
      });

      preview.textContent = tree;
    }

    function getSelectedFolders() {
      const folders = [];

      // 選択されたページ
      pageOptions.forEach(page => {
        const checkbox = document.getElementById('page_' + page.id);
        if (checkbox && checkbox.checked) {
          folders.push(page.name);
        }
      });

      // カスタムフォルダ
      customFolders.forEach(folder => {
        if (folder.trim()) {
          folders.push(folder.trim());
        }
      });

      return folders;
    }

    // ===== フォルダ作成 =====
    function createFolder() {
      if (!selectedSheet) {
        showStatus('企業シートを選択してください', 'error');
        return;
      }

      if (!selectedSheet.hasCompanyFolder) {
        showStatus('企業フォルダがありません。先に企業フォルダを作成してください。', 'error');
        return;
      }

      const folders = getSelectedFolders();
      if (folders.length === 0) {
        showStatus('追加するフォルダを1つ以上選択してください', 'error');
        return;
      }

      document.getElementById('loading').style.display = 'inline';
      document.getElementById('createBtn').disabled = true;

      google.script.run
        .withSuccessHandler(handleResult)
        .withFailureHandler(handleError)
        .hp_executeAddPageFolders(selectedSheet.sheetName, selectedSheet.companyFolderId, folders);
    }

    function handleResult(result) {
      document.getElementById('loading').style.display = 'none';

      if (result.success) {
        showStatus('✅ フォルダを作成し、ヒアリングシートに保存しました', 'success');
        // 成功ダイアログを表示
        google.script.run.hp_showFolderSuccessDialog(result);
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
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>
  `;
}

// ===== ページフォルダ追加実行 =====
/**
 * 既存の企業フォルダ内にページフォルダを追加
 * @param {string} sheetName - シート名
 * @param {string} companyFolderId - 企業フォルダID
 * @param {string[]} folderNames - 追加するページフォルダ名の配列
 */
function hp_executeAddPageFolders(sheetName, companyFolderId, folderNames) {
  if (!companyFolderId) {
    return { success: false, error: '企業フォルダIDが指定されていません' };
  }

  try {
    // 企業フォルダの存在確認
    let companyFolder;
    try {
      companyFolder = Drive.Files.get(companyFolderId, { supportsAllDrives: true });
    } catch (e) {
      throw new Error('企業フォルダにアクセスできません。フォルダが削除されているか、権限がない可能性があります。');
    }

    const companyFolderName = companyFolder.title || companyFolder.name;
    const companyFolderUrl = 'https://drive.google.com/drive/folders/' + companyFolderId;

    // 既存のサブフォルダを取得
    const existingQuery = "'" + companyFolderId + "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const existingFolders = Drive.Files.list({
      q: existingQuery,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    const existingNames = (existingFolders.items || existingFolders.files || []).map(f => f.title || f.name);

    // ページフォルダを追加
    const addedFolders = [];
    const skippedFolders = [];

    for (const name of folderNames) {
      if (existingNames.includes(name)) {
        // 既に存在する場合はスキップ
        skippedFolders.push(name);
      } else {
        const subfolder = hp_createDriveFolder(name, companyFolderId);
        addedFolders.push({
          name: name,
          url: 'https://drive.google.com/drive/folders/' + subfolder.id
        });
      }
    }

    // ヒアリングシートのPart④に選択ページを保存（構成案プロンプトで使用）
    hp_savePart4DataForce(sheetName, '選択ページ', folderNames.join(','));

    // 作成履歴に追加
    hp_addFolderHistory(companyFolderName, companyFolderUrl, addedFolders);

    return {
      success: true,
      companyFolderName: companyFolderName,
      companyFolderUrl: companyFolderUrl,
      sheetName: sheetName,
      addedFolders: addedFolders,
      skippedFolders: skippedFolders
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== フォルダ作成ヘルパー =====
function hp_createDriveFolder(folderName, parentId) {
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

// ===== 成功ダイアログ =====
function hp_showFolderSuccessDialog(result) {
  // 追加したフォルダのHTML
  let addedHtml = '';
  if (result.addedFolders && result.addedFolders.length > 0) {
    addedHtml = '<strong>追加したフォルダ:</strong>';
    for (const sf of result.addedFolders) {
      addedHtml += '<div class="subfolder-item added"><span>✅ ' + hp_escapeHtmlForFolder(sf.name) + '</span></div>';
    }
  }

  // スキップしたフォルダのHTML
  let skippedHtml = '';
  if (result.skippedFolders && result.skippedFolders.length > 0) {
    skippedHtml = '<strong style="margin-top:10px;display:block;">既に存在（スキップ）:</strong>';
    for (const name of result.skippedFolders) {
      skippedHtml += '<div class="subfolder-item skipped"><span>⚠️ ' + hp_escapeHtmlForFolder(name) + '</span></div>';
    }
  }

  const html = `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        .success-header {
          background: #E8F5E9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .success-header h2 {
          color: #2E7D32;
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
        .subfolder-item span { color: #666; }
        .subfolder-item.added span { color: #2E7D32; }
        .subfolder-item.skipped span { color: #FF9800; }
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
      <div class="success-header">
        <h2>✅ ページフォルダを追加しました</h2>
      </div>

      <div class="folder-info">
        <h3>📁 ${hp_escapeHtmlForFolder(result.companyFolderName)}</h3>
        <div class="url-box" id="mainUrl">${hp_escapeHtmlForFolder(result.companyFolderUrl)}</div>
        <div class="btn-group">
          <button class="btn btn-primary" onclick="window.open('${hp_escapeHtmlForFolder(result.companyFolderUrl)}', '_blank')">
            🔗 企業フォルダを開く
          </button>
          <button class="btn btn-green" onclick="copyUrl()">
            📋 URLをコピー
          </button>
        </div>

        <div class="subfolders">
          ${addedHtml}
          ${skippedHtml}
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">コピーしました</div>

      <script>
        function copyUrl() {
          navigator.clipboard.writeText('${hp_escapeHtmlForFolder(result.companyFolderUrl)}').then(function() {
            const toast = document.getElementById('toast');
            toast.style.display = 'block';
            setTimeout(function() { toast.style.display = 'none'; }, 2000);
          });
        }
      </script>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'ページフォルダ追加完了');
}


// ===== 作成履歴機能 =====
function hp_addFolderHistory(companyName, mainUrl, subfolders) {
  const props = PropertiesService.getScriptProperties();
  let history = JSON.parse(props.getProperty('HP_FOLDER_HISTORY') || '[]');

  history.unshift({
    companyName: companyName,
    url: mainUrl,
    subfolders: subfolders,
    createdAt: new Date().toLocaleString('ja-JP')
  });

  // 最新20件のみ保持
  history = history.slice(0, 20);

  props.setProperty('HP_FOLDER_HISTORY', JSON.stringify(history));
}

function hp_showRecentFolders() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const history = JSON.parse(props.getProperty('HP_FOLDER_HISTORY') || '[]');

  if (history.length === 0) {
    ui.alert('📋 追加履歴', 'フォルダ追加履歴がありません。', ui.ButtonSet.OK);
    return;
  }

  // 履歴HTMLを構築
  let historyHtml = '';
  for (const item of history) {
    historyHtml += '<div class="folder-item" onclick="openFolder(\'' + hp_escapeHtmlForFolder(item.url) + '\')">';
    historyHtml += '<div class="company-name">' + hp_escapeHtmlForFolder(item.companyName) + '</div>';
    historyHtml += '<div class="date">' + hp_escapeHtmlForFolder(item.createdAt) + '</div>';
    historyHtml += '</div>';
  }

  const html = `
    <html>
    <head>
      ${CI_DIALOG_STYLES}
      <style>
        h3 { margin: 0 0 15px 0; color: #1565C0; }
        .folder-list {
          max-height: 350px;
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
        .folder-item:hover { background: #E3F2FD; }
        .folder-item:last-child { border-bottom: none; }
        .company-name { font-weight: bold; color: #333; }
        .date { color: #666; font-size: 11px; margin-top: 4px; }
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
        }
      </style>
    </head>
    <body>
      <h3>📋 最近追加したフォルダ</h3>

      <div class="folder-list">
        ${historyHtml}
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">開きました</div>

      <script>
        function openFolder(url) {
          window.open(url, '_blank');
          const toast = document.getElementById('toast');
          toast.style.display = 'block';
          setTimeout(function() { toast.style.display = 'none'; }, 2000);
        }
      </script>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(450);

  ui.showModalDialog(htmlOutput, 'フォルダ追加履歴');
}

// ===== ユーティリティ =====
function hp_escapeHtmlForFolder(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
