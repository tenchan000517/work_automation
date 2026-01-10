/**
 * 商材別データ分割出力（URL抽出機能付き v2）
 *
 * 変更点：
 * - テキスト内のURLを自動抽出
 * - ラベル付きで関連URLセクションを出力
 * - H列（使用ツール）、M列（備考）、N列（メモ）等からもURL抽出
 *
 * 実行方法: GASエディタで exportByCategory を実行
 */

/**
 * テキストからURLを抽出する
 * @param {string} text - 検索対象のテキスト
 * @returns {Array<{label: string, url: string, type: string}>} - 抽出されたURL配列
 */
function extractUrls(text) {
  if (!text) return [];

  const str = String(text);
  const results = [];

  // URLの正規表現パターン
  const urlPattern = /https?:\/\/[^\s\u3000\n\r）」』】\]>]+/g;

  // 行ごとに処理（ラベル：URL形式を検出）
  const lines = str.split(/[\n\r]/);

  lines.forEach(function(line) {
    // パターン1: 「ラベル：URL」または「ラベル: URL」
    const labelUrlMatch = line.match(/^(.+?)[：:]\s*(https?:\/\/[^\s\u3000）」』】\]>]+)/);
    if (labelUrlMatch) {
      const label = labelUrlMatch[1].trim();
      const url = labelUrlMatch[2].trim();
      results.push({
        label: label,
        url: url,
        type: detectUrlType(url)
      });
      return;
    }

    // パターン2: 「ラベル（URL）」
    const labelParenMatch = line.match(/(.+?)[（\(](https?:\/\/[^\s\u3000）\)]+)[）\)]/);
    if (labelParenMatch) {
      const label = labelParenMatch[1].trim();
      const url = labelParenMatch[2].trim();
      results.push({
        label: label,
        url: url,
        type: detectUrlType(url)
      });
      return;
    }
  });

  // パターン3: 単独のURL（ラベルなし）
  const allUrls = str.match(urlPattern) || [];
  allUrls.forEach(function(url) {
    // 既に抽出済みのURLはスキップ
    const alreadyExtracted = results.some(function(r) {
      return r.url === url;
    });
    if (!alreadyExtracted) {
      results.push({
        label: generateLabelFromUrl(url),
        url: url,
        type: detectUrlType(url)
      });
    }
  });

  return results;
}

/**
 * URLからタイプを判定
 */
function detectUrlType(url) {
  if (url.includes('docs.google.com/spreadsheets')) return 'sheet';
  if (url.includes('drive.google.com')) return 'drive';
  if (url.includes('docs.google.com/document')) return 'drive';
  if (url.includes('docs.google.com/presentation')) return 'drive';
  return 'site';
}

/**
 * URLからラベルを自動生成
 */
function generateLabelFromUrl(url) {
  try {
    const hostname = url.match(/https?:\/\/([^\/]+)/)[1];

    // よく使うサービスのラベル
    if (hostname.includes('pairsona')) return 'Pairsona';
    if (hostname.includes('en-gage.net')) return 'エンゲージ';
    if (hostname.includes('chatgpt.com')) return 'ChatGPT';
    if (hostname.includes('docs.google.com')) {
      if (url.includes('/spreadsheets/')) return 'スプレッドシート';
      if (url.includes('/document/')) return 'Googleドキュメント';
      if (url.includes('/presentation/')) return 'Googleスライド';
      return 'Googleドキュメント';
    }
    if (hostname.includes('drive.google.com')) return 'Googleドライブ';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('canva.com')) return 'Canva';

    // その他はホスト名をラベルに
    return hostname.replace('www.', '');
  } catch (e) {
    return '関連リンク';
  }
}

/**
 * 複数フィールドからURLを収集
 */
function collectUrlsFromRow(row) {
  const urlFields = [
    { index: 7, name: '使用ツール' },      // H列
    { index: 12, name: '備考・課題感' },   // M列
    { index: 13, name: 'メモ' },           // N列
    { index: 16, name: 'マニュアルたたき' }, // Q列
    { index: 17, name: '全体フロー' },     // R列
    { index: 18, name: 'フォーマット' },   // S列
    { index: 19, name: '詳細フロー' },     // T列
  ];

  const allUrls = [];
  const seenUrls = new Set();

  // 各フィールドからURL抽出
  urlFields.forEach(function(field) {
    const extracted = extractUrls(row[field.index]);
    extracted.forEach(function(item) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        item.source = field.name;
        allUrls.push(item);
      }
    });
  });

  // U列（関連シート）は単独URLとして追加
  if (row[20]) {
    const sheetUrl = String(row[20]).trim();
    if (sheetUrl.startsWith('http') && !seenUrls.has(sheetUrl)) {
      allUrls.push({
        label: '関連シート',
        url: sheetUrl,
        type: detectUrlType(sheetUrl),
        source: '関連シート列'
      });
    }
  }

  return allUrls;
}

function exportByCategory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // 商材別にデータを分類
  const categories = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const category = row[1]; // 商材名（B列）

    if (!category) continue;

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ rowNum: i + 1, data: row, headers: headers });
  }

  // 各商材のドキュメントを生成
  const outputs = {};

  for (const cat in categories) {
    outputs[cat] = generateCategoryDoc(cat, categories[cat]);
  }

  // 選択ダイアログを表示
  showCategorySelector(outputs);
}

function generateCategoryDoc(categoryName, rows) {
  let doc = "";
  doc += "# " + categoryName + " 業務一覧\n";
  doc += "出力日時: " + new Date().toLocaleString('ja-JP') + "\n";
  doc += "業務数: " + rows.length + "\n";
  doc += "=".repeat(80) + "\n\n";

  // 業務サマリー
  doc += "## 業務サマリー\n\n";
  doc += "| No | 大項目 | 具体 | 担当 | マニュアル |\n";
  doc += "|-----|--------|------|------|------------|\n";

  rows.forEach(function(item) {
    const r = item.data;
    doc += "| " + (r[0] || "-") + " | " + (r[3] || "-") + " | " + (r[4] || "-") + " | " + (r[5] || "-") + " | " + (r[11] || "-") + " |\n";
  });
  doc += "\n";

  // 課題感一覧
  doc += "## 課題感・改善ポイント\n\n";
  rows.forEach(function(item) {
    const r = item.data;
    const issue = r[12]; // 備考・課題感
    if (issue && String(issue).trim()) {
      doc += "### " + (r[3] || "") + " > " + (r[4] || "") + "\n";
      doc += String(issue) + "\n\n";
    }
  });

  // 各業務の詳細
  doc += "=".repeat(80) + "\n";
  doc += "## 業務詳細\n";
  doc += "=".repeat(80) + "\n\n";

  rows.forEach(function(item) {
    const r = item.data;
    const h = item.headers;

    doc += "-".repeat(80) + "\n";
    doc += "### [" + (r[0] || item.rowNum) + "] " + (r[3] || "") + " > " + (r[4] || "") + "\n";
    doc += "-".repeat(80) + "\n\n";

    // 基本情報
    doc += "#### 基本情報\n";
    doc += "- **担当工程**: " + (r[5] || "-") + "\n";
    doc += "- **ネクスト担当者**: " + (r[6] || "-") + "\n";
    doc += "- **使用ツール**: " + (r[7] || "-") + "\n";
    doc += "- **成果物**: " + (r[8] || "-") + "\n";
    doc += "- **チェックポイント**: " + (r[9] || "-") + "\n";
    doc += "- **工数目安**: " + (r[10] || "-") + "\n";
    doc += "- **マニュアル有無**: " + (r[11] || "-") + "\n";
    doc += "\n";

    // 備考・課題感
    if (r[12]) {
      doc += "#### 備考・課題感\n";
      doc += String(r[12]) + "\n\n";
    }

    // メモ
    if (r[13]) {
      doc += "#### メモ\n";
      doc += String(r[13]) + "\n\n";
    }

    // 目的
    if (r[14]) {
      doc += "#### 目的\n";
      doc += String(r[14]) + "\n\n";
    }

    // シミュレーション
    if (r[15]) {
      doc += "#### シミュレーション\n";
      doc += String(r[15]) + "\n\n";
    }

    // マニュアルたたき
    if (r[16]) {
      doc += "#### マニュアルたたき\n";
      doc += "```\n" + String(r[16]) + "\n```\n\n";
    }

    // 全体フロー
    if (r[17]) {
      doc += "#### 全体フロー\n";
      doc += "```\n" + String(r[17]) + "\n```\n\n";
    }

    // フォーマット
    if (r[18]) {
      doc += "#### フォーマット\n";
      doc += "```\n" + String(r[18]) + "\n```\n\n";
    }

    // 詳細フロー
    if (r[19]) {
      doc += "#### 詳細フロー\n";
      doc += "```\n" + String(r[19]) + "\n```\n\n";
    }

    // ========================================
    // 関連URL（新機能：複数フィールドから抽出）
    // ========================================
    const collectedUrls = collectUrlsFromRow(r);

    if (collectedUrls.length > 0) {
      doc += "#### 関連URL\n";
      collectedUrls.forEach(function(item) {
        doc += "- " + item.label + " | " + item.url + " | " + item.type + "\n";
      });
      doc += "\n";
    }

    doc += "\n";
  });

  return doc;
}

function showCategorySelector(outputs) {
  const categories = Object.keys(outputs);

  let optionsHtml = '';
  categories.forEach(function(cat, idx) {
    const charCount = outputs[cat].length;
    optionsHtml += '<div class="cat-item" onclick="selectCategory(\'' + cat + '\')">';
    optionsHtml += '<span class="cat-name">' + cat + '</span>';
    optionsHtml += '<span class="cat-info">' + charCount.toLocaleString() + '文字</span>';
    optionsHtml += '</div>';
  });

  const html = HtmlService.createHtmlOutput(`
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          padding: 20px;
          background: #1e1e1e;
          color: #d4d4d4;
          margin: 0;
        }
        h3 { margin-top: 0; color: #fff; }
        .cat-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .cat-item {
          background: #2d2d2d;
          border: 2px solid #444;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-item:hover {
          border-color: #0e639c;
          background: #333;
        }
        .cat-item.selected {
          border-color: #0e639c;
          background: #0e639c33;
        }
        .cat-name {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .cat-info {
          font-size: 12px;
          color: #888;
        }
        .btn-group {
          margin: 20px 0;
        }
        button {
          padding: 12px 24px;
          margin-right: 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .copy { background: #0e639c; color: #fff; }
        .download { background: #3c8039; color: #fff; }
        .download-all { background: #6a4c93; color: #fff; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg {
          color: #89d185;
          padding: 8px 12px;
          background: #2d4a2d;
          border-radius: 4px;
          display: none;
          margin: 10px 0;
        }
        textarea {
          width: 100%;
          height: 300px;
          background: #2d2d2d;
          color: #d4d4d4;
          border: 1px solid #555;
          border-radius: 4px;
          padding: 10px;
          font-family: monospace;
          font-size: 11px;
          display: none;
        }
        textarea.show { display: block; }
      </style>
    </head>
    <body>
      <h3>商材を選択してください</h3>
      <div class="cat-list">
        ${optionsHtml}
      </div>

      <div class="btn-group">
        <button class="copy" id="copyBtn" onclick="copySelected()" disabled>📋 コピー</button>
        <button class="download" id="dlBtn" onclick="downloadSelected()" disabled>💾 ダウンロード</button>
        <button class="download-all" onclick="downloadAll()">📦 全商材を一括ダウンロード</button>
      </div>

      <div class="msg" id="msg"></div>
      <textarea id="preview"></textarea>

      <script>
        const outputs = ${JSON.stringify(outputs)};
        let selectedCat = null;

        function selectCategory(cat) {
          selectedCat = cat;

          // UIを更新
          document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('selected'));
          event.currentTarget.classList.add('selected');

          // ボタンを有効化
          document.getElementById('copyBtn').disabled = false;
          document.getElementById('dlBtn').disabled = false;

          // プレビュー表示
          const preview = document.getElementById('preview');
          preview.classList.add('show');
          preview.value = outputs[cat];
        }

        function copySelected() {
          if (!selectedCat) return;
          navigator.clipboard.writeText(outputs[selectedCat]).then(() => {
            showMsg('✓ ' + selectedCat + ' をコピーしました');
          });
        }

        function downloadSelected() {
          if (!selectedCat) return;
          downloadFile(selectedCat, outputs[selectedCat]);
          showMsg('✓ ' + selectedCat + ' をダウンロードしました');
        }

        function downloadAll() {
          for (const cat in outputs) {
            downloadFile(cat, outputs[cat]);
          }
          showMsg('✓ 全' + Object.keys(outputs).length + '商材をダウンロードしました');
        }

        function downloadFile(name, content) {
          const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '業務一覧_' + name + '.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        function showMsg(text) {
          const msg = document.getElementById('msg');
          msg.textContent = text;
          msg.style.display = 'block';
          setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
      </script>
    </body>
    </html>
  `).setWidth(700).setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, '商材別データ出力（URL抽出機能付き v2）');
}
