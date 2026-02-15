/**
 * HP制作 素材フォルダ管理 GAS
 *
 * 【機能】
 * 1. 素材フォルダ作成（JSON入力） - 必要素材リストJSONからGoogleドライブにフォルダ構造を作成
 * 2. 撮影指示書.txt 自動生成
 *
 * 【フォルダ構成】
 * HP・LPフォルダ/
 * └─ 会社正式名称/
 *     ├─ 撮影素材/
 *     │   ├─ TOP/
 *     │   ├─ About/
 *     │   └─ Recruit/
 *     ├─ 本番素材/
 *     └─ 撮影指示書.txt
 *
 * 【依存】
 * - createFolder.js: hp_getCompanySheetListForFolder(), hp_createDriveFolder()
 * - commonStyles.js: CI_DIALOG_STYLES, CI_UI_COMPONENTS
 *
 * 【使用方法】
 * createFolder.jsのメニューから呼び出し
 */

// ===== 素材フォルダ作成ダイアログ =====
function hp_showAssetFolderDialog() {
  const sheetList = hp_getCompanySheetListForFolder();

  const html = HtmlService.createHtmlOutput(hp_createAssetFolderDialogHtml(sheetList))
    .setWidth(800)
    .setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, '📂 素材フォルダ作成');
}

/**
 * 素材フォルダ作成ダイアログHTML
 */
function hp_createAssetFolderDialogHtml(sheetList) {
  const sheetListJson = JSON.stringify(sheetList);

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

    /* JSON入力 */
    .json-input {
      width: 100%;
      height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
    }
    .json-input:focus {
      outline: none;
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
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
      max-height: 120px;
      overflow-y: auto;
    }
    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 12px;
      background: white;
    }
    .preview-table th, .preview-table td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      text-align: left;
    }
    .preview-table th {
      background: #f5f5f5;
    }
    .preview-table-container {
      max-height: 150px;
      overflow-y: auto;
    }

    /* ステップ */
    .step-indicator {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .step {
      flex: 1;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 6px;
      text-align: center;
      font-size: 12px;
    }
    .step.active {
      background: #1565C0;
      color: white;
    }
    .step.done {
      background: #4CAF50;
      color: white;
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
    .info-box {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #1565C0;
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
  <h3>📂 素材フォルダ作成</h3>

  <!-- ステップ表示 -->
  <div class="step-indicator">
    <div class="step active" id="step1">1. 企業選択</div>
    <div class="step" id="step2">2. JSON入力</div>
    <div class="step" id="step3">3. プレビュー</div>
    <div class="step" id="step4">4. 作成</div>
  </div>

  <!-- 説明 -->
  <div class="info-box">
    <h4>📋 機能説明</h4>
    <p style="margin:0;">HANDOFFの「必要素材リスト」JSONを入力すると、Googleドライブに撮影素材フォルダと本番素材フォルダを作成し、撮影指示書.txtを自動生成します。</p>
  </div>

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

  <!-- JSON入力 -->
  <div class="input-section">
    <span class="input-label">必要素材リストJSON（HANDOFFからコピペ）</span>
    <textarea
      class="json-input"
      id="assetJsonInput"
      placeholder='{
  "company": "企業名",
  "generatedAt": "2025-01-01",
  "totalAssets": 12,
  "assets": [
    {
      "id": 1,
      "fileName": "hero.jpg",
      "destPath": "public/images/",
      "page": "TOP",
      "usage": "ヒーロー背景",
      "shootingNote": "会社外観 or 作業風景",
      "size": "1920x1080推奨"
    }
  ]
}'
      oninput="parseAndPreview()"
    ></textarea>
  </div>

  <!-- プレビュー -->
  <div class="preview-section" id="previewSection" style="display:none;">
    <h4>📂 作成されるフォルダ構成</h4>
    <div class="preview-tree" id="previewTree"></div>

    <h4 style="margin-top:16px;">📋 撮影指示書プレビュー（上位5件）</h4>
    <div class="preview-table-container">
      <table class="preview-table" id="previewTable">
        <thead>
          <tr>
            <th>#</th>
            <th>ページ</th>
            <th>ファイル名</th>
            <th>用途</th>
            <th>撮影メモ</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

  <!-- フッター -->
  <div class="footer">
    <button class="btn btn-primary" id="createBtn" disabled>
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
    let selectedSheet = null;
    let parsedData = null;

    window.onload = function() {
      renderCompanyDropdown();

      // アクティブがあれば自動選択
      const activeItem = sheetList.find(item => item.isActive);
      if (activeItem) {
        selectCompany(activeItem);
      }

      // ボタンにイベントリスナーを追加
      document.getElementById('createBtn').addEventListener('click', function() {
        alert('ボタンがクリックされました！');
        createAssetFolders();
      });
    };

    function updateStep(step) {
      ['step1', 'step2', 'step3', 'step4'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.className = 'step';
        if (i + 1 < step) el.className = 'step done';
        else if (i + 1 === step) el.className = 'step active';
      });
    }

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
        document.getElementById('status').style.display = 'none';
      } else {
        const folderBadge = '<span class="badge-no-folder" style="margin-left:8px;">企業フォルダなし</span>';
        display.innerHTML = \`<span>\${escapeHtml(displayName)}\${activeBadge}\${folderBadge}</span>\`;
        showStatus('⚠️ この企業には企業フォルダがありません。先に「1.📋 HP制作」→「📂 企業フォルダ作成」を実行してください。', 'warning');
      }

      updateStep(2);
      checkInputs();
    }

    // ドロップダウン外クリックで閉じる
    document.addEventListener('click', function(e) {
      const wrapper = document.querySelector('.company-select-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('companySelectDropdown').classList.remove('show');
        document.getElementById('companySelectDisplay').classList.remove('active');
      }
    });

    // ===== JSON解析 =====
    function parseAndPreview() {
      const jsonInput = document.getElementById('assetJsonInput').value.trim();
      const previewSection = document.getElementById('previewSection');

      if (!jsonInput) {
        previewSection.style.display = 'none';
        parsedData = null;
        checkInputs();
        return;
      }

      try {
        const data = JSON.parse(jsonInput);
        if (!data.assets || !Array.isArray(data.assets)) {
          throw new Error('assets配列がありません');
        }

        parsedData = data;
        previewSection.style.display = 'block';

        // ページ一覧を抽出
        const pages = [...new Set(data.assets.map(a => a.page || 'その他'))];

        // フォルダ構成プレビュー
        const companyName = selectedSheet ? (selectedSheet.officialName || selectedSheet.companyName || '企業名') : '企業名';
        let tree = companyName + '/\\n';
        tree += '├─ 撮影素材/\\n';
        pages.forEach((page, i) => {
          const prefix = i === pages.length - 1 ? '│   └─' : '│   ├─';
          tree += prefix + ' ' + page + '/\\n';
        });
        tree += '├─ 本番素材/\\n';
        tree += '└─ 撮影指示書.txt\\n';
        document.getElementById('previewTree').textContent = tree;

        // 撮影指示書プレビュー
        const tbody = document.getElementById('previewTable').querySelector('tbody');
        tbody.innerHTML = '';
        data.assets.slice(0, 5).forEach(asset => {
          const row = document.createElement('tr');
          row.innerHTML = '<td>' + asset.id + '</td>' +
            '<td>' + escapeHtml(asset.page || '-') + '</td>' +
            '<td>' + escapeHtml(asset.fileName) + '</td>' +
            '<td>' + escapeHtml(asset.usage || '-') + '</td>' +
            '<td>' + escapeHtml(asset.shootingNote || '-') + '</td>';
          tbody.appendChild(row);
        });

        if (data.assets.length > 5) {
          const row = document.createElement('tr');
          row.innerHTML = '<td colspan="5" style="text-align:center;color:#666;">... 他 ' + (data.assets.length - 5) + ' 件</td>';
          tbody.appendChild(row);
        }

        updateStep(3);
        showStatus('✅ JSONパース成功（' + data.assets.length + '件の素材、' + pages.length + 'ページ）', 'success');
      } catch (e) {
        previewSection.style.display = 'none';
        parsedData = null;
        showStatus('❌ JSONパースエラー: ' + e.message, 'error');
      }

      checkInputs();
    }

    function checkInputs() {
      const hasCompany = selectedSheet && selectedSheet.hasCompanyFolder;
      const hasData = !!parsedData;

      document.getElementById('createBtn').disabled = !(hasCompany && hasData);
    }

    // ===== フォルダ作成 =====
    function createAssetFolders() {
      console.log('createAssetFolders called');
      console.log('selectedSheet:', selectedSheet);
      console.log('parsedData:', parsedData);

      if (!selectedSheet || !selectedSheet.hasCompanyFolder) {
        showStatus('企業フォルダがありません', 'error');
        console.log('ERROR: No company folder');
        return;
      }

      if (!parsedData) {
        showStatus('必要素材リストJSONを入力してください', 'error');
        console.log('ERROR: No parsed data');
        return;
      }

      console.log('Calling GAS function...');
      showStatus('⏳ フォルダ作成中...', 'info');
      document.getElementById('loading').style.display = 'inline';
      document.getElementById('createBtn').disabled = true;

      google.script.run
        .withSuccessHandler(handleResult)
        .withFailureHandler(handleError)
        .hp_executeCreateAssetFolders(selectedSheet.sheetName, selectedSheet.companyFolderId, parsedData);
    }

    function handleResult(result) {
      document.getElementById('loading').style.display = 'none';

      if (result.success) {
        updateStep(4);
        showStatus('✅ フォルダを作成しました', 'success');
        // 成功ダイアログを表示
        google.script.run.hp_showAssetFolderSuccessDialog(result);
      } else {
        showStatus('❌ ' + result.error, 'error');
        document.getElementById('createBtn').disabled = false;
      }
    }

    function handleError(error) {
      console.log('handleError called:', error);
      document.getElementById('loading').style.display = 'none';
      showStatus('❌ エラー: ' + (error.message || JSON.stringify(error)), 'error');
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

// ===== 素材フォルダ作成実行 =====
/**
 * Googleドライブに素材フォルダ構造を作成
 * @param {string} sheetName - シート名
 * @param {string} companyFolderId - 企業フォルダID
 * @param {Object} assetData - 必要素材リストJSON
 */
function hp_executeCreateAssetFolders(sheetName, companyFolderId, assetData) {
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

    // 1. 撮影素材フォルダを作成（フラット構成）
    const shootingFolder = hp_createDriveFolder('撮影素材', companyFolderId);
    const shootingFolderId = shootingFolder.id;
    const shootingFolderUrl = 'https://drive.google.com/drive/folders/' + shootingFolderId;

    // 2. 本番素材フォルダを作成
    const productionFolder = hp_createDriveFolder('本番素材', companyFolderId);
    const productionFolderUrl = 'https://drive.google.com/drive/folders/' + productionFolder.id;

    // 3. 撮影指示書スプレッドシートを作成
    const guideSpreadsheet = hp_createShootingGuideSpreadsheet(
      companyFolderId,
      companyFolderName,
      assetData,
      shootingFolderUrl,
      productionFolderUrl
    );
    const guideFileUrl = guideSpreadsheet.getUrl();
    const guideFileId = guideSpreadsheet.getId();

    // 4. ヒアリングシートPart④に素材フォルダURLを保存
    hp_savePart4DataForce(sheetName, '撮影素材フォルダURL', shootingFolderUrl);
    hp_savePart4DataForce(sheetName, '本番素材フォルダURL', productionFolderUrl);
    hp_savePart4DataForce(sheetName, '撮影指示書URL', guideFileUrl);

    return {
      success: true,
      companyFolderName: companyFolderName,
      companyFolderUrl: companyFolderUrl,
      shootingFolderUrl: shootingFolderUrl,
      productionFolderUrl: productionFolderUrl,
      guideFileUrl: guideFileUrl,
      totalAssets: assetData.assets.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 撮影指示書スプレッドシートを作成
 * @param {string} parentFolderId - 企業フォルダID
 * @param {string} companyName - 企業名
 * @param {Object} assetData - 必要素材リストJSON
 * @param {string} shootingFolderUrl - 撮影素材フォルダURL
 * @param {string} productionFolderUrl - 本番素材フォルダURL
 * @returns {Spreadsheet} 作成したスプレッドシート
 */
function hp_createShootingGuideSpreadsheet(parentFolderId, companyName, assetData, shootingFolderUrl, productionFolderUrl) {
  const date = new Date().toLocaleDateString('ja-JP');
  const totalAssets = assetData.assets.length;

  // 1. スプレッドシートを作成
  const ssName = '📷 撮影指示書（' + companyName + '）';
  const ss = SpreadsheetApp.create(ssName);

  // 2. スプレッドシートを企業フォルダに移動
  const ssFile = DriveApp.getFileById(ss.getId());
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  parentFolder.addFile(ssFile);
  DriveApp.getRootFolder().removeFile(ssFile);

  // 3. ガイドシートを作成
  const guideSheet = ss.getActiveSheet();
  guideSheet.setName('ガイド');
  hp_setupGuideSheet(guideSheet, companyName, totalAssets, shootingFolderUrl, productionFolderUrl, date);

  // 4. 素材リストシートを作成
  const listSheet = ss.insertSheet('素材リスト');
  hp_setupAssetListSheet(listSheet, assetData);

  return ss;
}

/**
 * ガイドシートを設定
 */
function hp_setupGuideSheet(sheet, companyName, totalAssets, shootingFolderUrl, productionFolderUrl, date) {
  // 列幅設定
  sheet.setColumnWidth(1, 600);

  // ヘッダー
  sheet.getRange('A1').setValue('📷 撮影指示書').setFontSize(18).setFontWeight('bold');
  sheet.getRange('A2').setValue(companyName + ' | 作成日: ' + date + ' | 素材数: ' + totalAssets + '枚').setFontColor('#666666');

  // フロー
  const flowData = [
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ['📋 撮影〜納品フロー'],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['STEP 1: 撮影'],
    ['  → 「素材リスト」シートを確認'],
    ['  → 撮影したら「📷撮影」列にチェック ☑'],
    [''],
    ['STEP 2: 撮影素材フォルダに保存'],
    ['  → 撮影した元ファイルを自由に保存（整理方法は任意）'],
    ['  → 「📁保存」列にチェック ☑'],
    [''],
    ['STEP 3: 本番素材フォルダにリネーム保存'],
    ['  → 指定のファイル名（hero_top.jpg等）で保存'],
    ['  → 「✅本番」列にチェック ☑'],
    [''],
    ['STEP 4: 完了報告'],
    ['  → 担当者に連絡'],
    ['  → 素材チェック実行で自動確認されます'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ['📂 フォルダ構成'],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    [companyName + '/'],
    ['├─ 撮影素材/     ← 撮影した元ファイルを自由に保存'],
    ['└─ 本番素材/     ← 指定のファイル名で最終版を保存'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ['🔗 フォルダリンク'],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['📷 撮影素材フォルダ:'],
    [shootingFolderUrl],
    [''],
    ['✅ 本番素材フォルダ:'],
    [productionFolderUrl],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ['⚠️ 撮影時の注意'],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['・横長画像は 16:9 または 4:3 推奨'],
    ['・人物写真は明るい自然光で撮影'],
    ['・ブレ・ピンボケに注意'],
    ['・高解像度（最低でも 1920px 幅）で撮影'],
  ];

  sheet.getRange(3, 1, flowData.length, 1).setValues(flowData);

  // URLをハイパーリンクに（行番号は動的に計算）
  const urlRow1 = 3 + flowData.findIndex(row => row[0] === shootingFolderUrl);
  const urlRow2 = 3 + flowData.findIndex(row => row[0] === productionFolderUrl);
  if (urlRow1 > 2) {
    sheet.getRange('A' + urlRow1).setFormula('=HYPERLINK("' + shootingFolderUrl + '", "' + shootingFolderUrl + '")');
  }
  if (urlRow2 > 2) {
    sheet.getRange('A' + urlRow2).setFormula('=HYPERLINK("' + productionFolderUrl + '", "' + productionFolderUrl + '")');
  }

  // 背景色設定
  sheet.getRange('A1:A2').setBackground('#E8F5E9');
}

/**
 * 素材リストシートを設定
 */
function hp_setupAssetListSheet(sheet, assetData) {
  // ヘッダー行
  const headers = ['#', 'ページ', 'ファイル名', '用途', '撮影メモ', 'サイズ', '📷撮影', '📁保存', '✅本番', '素材URL'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダースタイル
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1565C0');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // データ行
  const dataRows = assetData.assets.map((asset, index) => [
    index + 1,
    asset.page || '',
    asset.fileName || '',
    asset.usage || '',
    asset.shootingNote || '',
    asset.size || '',
    false,  // 📷撮影 チェックボックス
    false,  // 📁保存 チェックボックス
    false,  // ✅本番 チェックボックス
    ''      // 素材URL（自動入力用）
  ]);

  if (dataRows.length > 0) {
    sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);

    // チェックボックス列を設定（G, H, I列）
    const checkboxRange1 = sheet.getRange(2, 7, dataRows.length, 1);
    const checkboxRange2 = sheet.getRange(2, 8, dataRows.length, 1);
    const checkboxRange3 = sheet.getRange(2, 9, dataRows.length, 1);
    checkboxRange1.insertCheckboxes();
    checkboxRange2.insertCheckboxes();
    checkboxRange3.insertCheckboxes();

    // 交互背景色
    for (let i = 0; i < dataRows.length; i++) {
      if (i % 2 === 1) {
        sheet.getRange(i + 2, 1, 1, headers.length).setBackground('#F5F5F5');
      }
    }
  }

  // 列幅設定
  sheet.setColumnWidth(1, 40);   // #
  sheet.setColumnWidth(2, 100);  // ページ
  sheet.setColumnWidth(3, 180);  // ファイル名
  sheet.setColumnWidth(4, 200);  // 用途
  sheet.setColumnWidth(5, 250);  // 撮影メモ
  sheet.setColumnWidth(6, 120);  // サイズ
  sheet.setColumnWidth(7, 70);   // 📷撮影
  sheet.setColumnWidth(8, 70);   // 📁保存
  sheet.setColumnWidth(9, 70);   // ✅本番
  sheet.setColumnWidth(10, 300); // 素材URL

  // フィルタを設定
  sheet.getRange(1, 1, dataRows.length + 1, headers.length).createFilter();

  // 行固定
  sheet.setFrozenRows(1);
}

// ===== 成功ダイアログ =====
function hp_showAssetFolderSuccessDialog(result) {
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
        .url-item {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          word-break: break-all;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .url-item a {
          color: #1565C0;
          text-decoration: none;
        }
        .url-item a:hover {
          text-decoration: underline;
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
      <div class="success-header">
        <h2>✅ 素材フォルダを作成しました</h2>
      </div>

      <div class="folder-info">
        <h3>📁 ${hp_escapeHtmlForFolder(result.companyFolderName)}</h3>

        <div class="url-item">
          <span>📷 撮影素材フォルダ</span>
          <a href="${hp_escapeHtmlForFolder(result.shootingFolderUrl)}" target="_blank">開く →</a>
        </div>

        <div class="url-item">
          <span>✅ 本番素材フォルダ</span>
          <a href="${hp_escapeHtmlForFolder(result.productionFolderUrl)}" target="_blank">開く →</a>
        </div>

        <div class="url-item">
          <span>📋 撮影指示書（スプレッドシート）</span>
          <a href="${hp_escapeHtmlForFolder(result.guideFileUrl)}" target="_blank">開く →</a>
        </div>

        <p style="margin:12px 0 0 0;font-size:13px;color:#666;">
          素材数: ${result.totalAssets}枚
        </p>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-gray" onclick="google.script.host.close()">閉じる</button>
      </div>

      <div class="toast" id="toast">コピーしました</div>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '素材フォルダ作成完了');
}
