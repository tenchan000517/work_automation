# マニュアル作成ガイドライン V2

作成日: 2026-01-11
目的: GASダイアログ開発の設計指針（最新版）

---

## 1. 設計思想

### 1.1 スプレッドシート中心の設計

**本体はスプレッドシート+GAS。Next.jsサイトは補助（閲覧用ビュー）。**

理由: 担当者が直接メンテナンスできる。コード変更不要。

### 1.2 GASの2つの機能

| 種類 | 説明 | 例 |
|------|------|-----|
| AIプロンプト生成 | データ+プロンプト → AIに貼り付け → AI出力を使う | 構成案作成、議事録整理 |
| フォーマット生成 | データ+テンプレート → そのまま使える定型文 | 受注連絡、日程確定報告 |

### 1.3 基本セット構成

どの商材も以下のシート構成を持つ：

```
スプレッドシート
├── プロンプト（AIプロンプト管理）
├── 設定（担当者名等の設定値）
├── 企業情報一覧（全企業の一覧管理）★重要
├── フォームの回答1（フォーム連携時）
├── ヒアリングシート（原本/テンプレート）
└── 各企業シート（案件ごとに作成）
```

### 1.4 企業情報一覧シート中心の設計

**企業情報は「企業情報一覧」シートで一元管理する。**

```
企業情報一覧シート
├── A列: 企業名
├── B列: 担当者名
├── C列: 役職・部署
├── D列: 電話
├── E列: メール
├── F列: 契約開始日
├── G列: 受注商材
├── H列: 契約期間
├── I列: 契約金額
├── J列: 備考
├── K列: メイン担当
└── L列: サブ担当
```

**企業ドロップダウンの取得:**
- 企業情報一覧シートから取得
- 新しいもの（下の行）が上に来るように逆順ソート

```javascript
function getCompanyListFromSheet() {
  const sheet = ss.getSheetByName('企業情報一覧');
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const companies = data.map((row, i) => ({
    rowIndex: i + 2,
    name: String(row[0]).trim()
  })).filter(c => c.name);
  return companies;
}

// ダイアログ表示時に逆順にする
const companies = result.companies.slice().reverse();
```

---

## 2. GASメニュー構成

### 2.1 メニュー体系

```
０.⚙️ 設定
├── 👥 メンバー編集
├── 📝 業務担当者編集
├── 📁 フォルダ設定編集
├── ─────────────
├── 📄 プロンプト編集
├── ─────────────
├── 📋 設定シートを作成
├── 📝 プロンプトシートを作成
└── 📊 企業情報一覧を作成

１.📋 キックオフ・企業情報入力
├── 📥 企業情報入力（Works貼り付け）
├── 📢 受注・キックオフ連絡
├── 📩 先方へ日程調整・フォーム記入依頼メール
├── ─────────────
├── 🏢 企業情報編集
├── ─────────────
└── 📊 企業情報一覧反映

２.📋 ヒアリングシート・撮影フォルダ
├── 🆕 新規ヒアリングシート作成（フォーム回答から）
├── 🆕 新規ヒアリングシート作成（手動）
├── ─────────────
├── 📂 新規フォルダ作成（企業シートから）
├── 🆕 新規フォルダ作成（手動）
├── ─────────────
├── 📥 フォーム回答を既存シートに転記
├── ─────────────
├── 📋 最近作成した企業フォルダ一覧
├── ─────────────
├── 🎨 テンプレート初期設定
└── ⚙️ 親フォルダを設定

４.📝 議事録作成・報告プロンプト
├── （プロンプトシートから動的生成）
├── ─────────────
├── 📋 文字起こしを整理（プロンプト生成）
├── 📥 AI出力を転記
├── ─────────────
├── 📄 プロンプトシートを作成
├── 🔄 サンプルプロンプトを追加
└── ❓ 使い方

５.📝 構成案作成
├── 📋 構成案を作成（プロンプト生成）
├── ─────────────
├── 📤 ペアソナ/エンゲージ形式に変換
├── 📤 ワークス報告用に変換
├── 📤 撮影指示書に変換
├── ─────────────
└── 🔧 シートデータ確認

📨 連絡用フォーマット（※ナンバリングなし）
├── 📋 日程確定報告
├── ─────────────
├── 📷 撮影日程確認
├── 🔔 参加者リマインド
├── ─────────────
├── 🎬 撮影指示連絡
└── 📝 議事録共有
```

### 2.2 メニュー設計ルール

| ルール | 説明 |
|--------|------|
| ナンバリング | 0〜5で業務フロー順。連絡用フォーマットはナンバリングなし |
| セパレーター | 機能グループの区切りに使用 |
| アイコン | 各メニュー項目に絵文字を付与 |
| 命名 | 「生成」より「作成」を使用 |

### 2.3 GASファイル構成

```
docs/gas/tsunageru/
├── commonStyles.js            # ★共通スタイル定義（CI_DIALOG_STYLES, CI_UI_COMPONENTS）
├── settingsSheet.js           # 0.設定シート管理
├── hearingSheetManager.js     # 2.ヒアリング+撮影フォルダ（onOpen含む）
├── companyInfoManager.js      # 1.キックオフ・企業情報入力
├── promptDialog.js            # 4.議事録作成・報告プロンプト
├── compositionDraftGenerator.js # 5.構成案作成
├── contactFormats.js          # 連絡用フォーマット
├── transcriptToHearingSheet.js  # 文字起こし転記（4に統合）
└── createShootingFolder.js    # 撮影フォルダ作成（2に統合）
```

**共通スタイルの使い方:**
```javascript
// commonStyles.js で定義
const CI_DIALOG_STYLES = `<style>...</style>`;
const CI_UI_COMPONENTS = `<script>...</script>`;

// 各GASファイルで参照（同じプロジェクト内なので直接使用可能）
return `
<!DOCTYPE html>
<html>
<head>
${CI_DIALOG_STYLES}
</head>
<body>
  ...
  ${CI_UI_COMPONENTS}
</body>
</html>
`;
```

---

## 3. ダイアログUI仕様（確定）

### 3.1 ダイアログサイズ

| 項目 | 値 | 備考 |
|------|-----|------|
| 横幅 | **700px** | 統一（固定） |
| 高さ | **750px** | 基本値（完全固定ではない） |

```javascript
const html = HtmlService.createHtmlOutput(createDialogHTML())
  .setWidth(700)
  .setHeight(750);
```

### 3.2 共通スタイル

```css
* { box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  margin: 0;
  padding: 16px;
  background: #f8f9fa;
}

/* ボタン */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-blue { background: #3b82f6; color: white; }
.btn-blue:hover { background: #2563eb; }
.btn-green { background: #22c55e; color: white; }
.btn-green:hover { background: #16a34a; }
.btn-gray { background: #e5e7eb; color: #374151; }
.btn-gray:hover { background: #d1d5db; }

/* コピー成功メッセージ（トースト） */
.copy-success {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1000;
}
.copy-success.show { opacity: 1; }

/* フッター（閉じるボタン） */
.footer {
  display: flex;
  justify-content: flex-end;
}
```

### 3.3 担当者選択コンポーネント（コンパクトドロップダウン）【確定】

**複数人選択が必要な担当者・宛先・CCの選択には、必ずこのUIを使用する。**

```
┌─────────────────────────────────────┐
│ 宛先: [河合, 中尾文香          ▼]  │ ← クリックで展開
│       ┌─────────────────────────┐  │
│       │ ☑ 河合                 │  │
│       │ ☑ 中尾文香             │  │
│       │ ☐ 川崎                 │  │
│       └─────────────────────────┘  │
│ CC:   [青柳                    ▼]  │
└─────────────────────────────────────┘
```

**HTML:**
```html
<div class="multi-select-wrapper">
  <div class="multi-select-display" id="mentionDisplay" onclick="toggleDropdown('mention')">
    <span class="placeholder">選択してください</span>
  </div>
  <div class="multi-select-dropdown" id="mentionDropdown"></div>
</div>
```

**JavaScript:**
```javascript
const members = [...]; // getMemberList()から取得
const defaultMentions = ['河合', '中尾文香'];

function initDropdowns() {
  createDropdown('mention', defaultMentions);
  createDropdown('cc', defaultCC);
}

function createDropdown(name, defaults) {
  const dropdown = document.getElementById(name + 'Dropdown');
  dropdown.innerHTML = '';
  for (const member of members) {
    const checked = defaults.includes(member) ? 'checked' : '';
    const item = document.createElement('div');
    item.className = 'multi-select-item';
    item.innerHTML = `
      <input type="checkbox" name="${name}" value="${member}" ${checked} onchange="updateDisplay('${name}')">
      <label>${member}</label>
    `;
    item.onclick = function(e) {
      if (e.target.tagName !== 'INPUT') {
        const cb = item.querySelector('input');
        cb.checked = !cb.checked;
        updateDisplay(name);
      }
    };
    dropdown.appendChild(item);
  }
  updateDisplay(name);
}

function toggleDropdown(name) {
  const dropdown = document.getElementById(name + 'Dropdown');
  const display = document.getElementById(name + 'Display');
  const isOpen = dropdown.classList.contains('show');

  // 他のドロップダウンを閉じる
  document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
  document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));

  if (!isOpen) {
    dropdown.classList.add('show');
    display.classList.add('active');
  }
}

function updateDisplay(name) {
  const display = document.getElementById(name + 'Display');
  const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(cb => cb.value);
  display.innerHTML = checked.length === 0
    ? '<span class="placeholder">選択してください</span>'
    : checked.join(', ');
}

// 外側クリックで閉じる
document.addEventListener('click', function(e) {
  if (!e.target.closest('.multi-select-wrapper')) {
    document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.multi-select-display').forEach(d => d.classList.remove('active'));
  }
});
```

**CSS:**
```css
.multi-select-wrapper { position: relative; }
.multi-select-display {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  min-height: 42px;
  position: relative;
}
.multi-select-display:hover { border-color: #4285f4; }
.multi-select-display.active {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,0.1);
}
.multi-select-display::after {
  content: '▼';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}
.multi-select-display.active::after {
  transform: translateY(-50%) rotate(180deg);
}
.multi-select-display .placeholder { color: #999; }

.multi-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  display: none;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}
.multi-select-dropdown.show { display: block; }

.multi-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.multi-select-item:hover { background: #f5f5f5; }
.multi-select-item input { margin: 0; cursor: pointer; }
.multi-select-item label { cursor: pointer; flex: 1; margin: 0; }
```

### 3.4 企業選択コンポーネント【確定】

企業名の選択にはカスタムドロップダウンを使用。アクティブシート表示・チェックボックス・ハイライト付き。

**UI（閉じた状態）:**
```
○ 一覧から選択  ○ 手入力         ← ラジオボタン

┌─────────────────────────────────────────┐
│ ✓ 株式会社テスト  [アクティブ]      ▼  │
└─────────────────────────────────────────┘
```

**UI（開いた状態）:**
```
┌─────────────────────────────────────────┐
│ ✓ 株式会社テスト  [アクティブ]      ▲  │
├─────────────────────────────────────────┤
│ ✓ 株式会社テスト  [アクティブ]          │ ← 選択中（ハイライト+チェック）
│   株式会社新規                          │ ← 新しい順（下の行が上）
│   株式会社サンプル                      │
│   株式会社ABC                           │ ← 古い順（上の行が下）
└─────────────────────────────────────────┘
```

**ソート順:**
1. アクティブシート → 最上段
2. 残りは逆順（スプレッドシートの下の行 = 新しいものが上）

**アクティブ判定:**
- 現在開いているシート名と企業名が一致 → [アクティブ]バッジ表示
- システムシート（プロンプト、設定、フォーム回答等）を開いている → アクティブなし

**HTML:**
```html
<div class="form-group">
  <label>企業名</label>
  <div class="input-mode-toggle">
    <label><input type="radio" name="inputMode" value="select" checked onchange="toggleInputMode()"> 一覧から選択</label>
    <label><input type="radio" name="inputMode" value="manual" onchange="toggleInputMode()"> 手入力</label>
  </div>
  <div class="company-input-area">
    <div class="company-select-wrapper" id="companySelectWrapper">
      <div class="company-select-display" id="companySelectDisplay" onclick="toggleCompanyDropdown()">
        <span class="placeholder">企業を選択してください</span>
      </div>
      <div class="company-select-dropdown" id="companySelectDropdown"></div>
    </div>
    <input type="text" id="companyManual" placeholder="株式会社○○" style="display:none;" oninput="updatePreview()">
  </div>
  <div class="hint">企業情報一覧から取得（アクティブ優先・新しい順）</div>
</div>
```

**CSS:**
```css
/* 企業選択ドロップダウン */
.company-select-wrapper { position: relative; }
.company-select-display {
  width: 100%;
  padding: 10px 30px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.company-select-display:hover { border-color: #3b82f6; }
.company-select-display.active { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.company-select-display::after {
  content: '▼';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}
.company-select-display.active::after { transform: translateY(-50%) rotate(180deg); }
.company-select-display .placeholder { color: #999; }
.company-select-display .selected-check { color: #22c55e; font-size: 16px; }
.company-select-display .selected-name { flex: 1; }

.company-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  display: none;
  max-height: 220px;
  overflow-y: auto;
  margin-top: 2px;
}
.company-select-dropdown.show { display: block; }

.company-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}
.company-select-item:last-child { border-bottom: none; }
.company-select-item:hover { background: #f5f5f5; }
.company-select-item.selected { background: #e3f2fd; }
.company-select-item .check-icon { width: 20px; color: #22c55e; font-size: 16px; }
.company-select-item .company-name { flex: 1; }
.badge-active { background: #4caf50; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
```

**JavaScript:**
```javascript
const companies = [...]; // getCompanyListFromSheet()から取得、ソート済み
const activeCompanyName = '...'; // アクティブシート名（システムシートならnull）
let selectedCompany = null;

function initCompanyDropdown() {
  const dropdown = document.getElementById('companySelectDropdown');
  dropdown.innerHTML = '';

  companies.forEach((company) => {
    const item = document.createElement('div');
    item.className = 'company-select-item';
    item.dataset.name = company.name;

    const checkIcon = document.createElement('span');
    checkIcon.className = 'check-icon';
    checkIcon.textContent = '';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'company-name';
    nameSpan.textContent = company.name;

    item.appendChild(checkIcon);
    item.appendChild(nameSpan);

    if (company.isActive) {
      const badge = document.createElement('span');
      badge.className = 'badge-active';
      badge.textContent = 'アクティブ';
      item.appendChild(badge);
    }

    item.onclick = function() { selectCompany(company.name); };
    dropdown.appendChild(item);
  });

  // アクティブ企業があれば自動選択
  if (activeCompanyName) {
    selectCompany(activeCompanyName);
  }
}

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

function selectCompany(companyName) {
  selectedCompany = companyName;

  // 表示を更新
  const display = document.getElementById('companySelectDisplay');
  const activeCompany = companies.find(c => c.name === companyName);
  const activeBadge = activeCompany?.isActive ? '<span class="badge-active" style="margin-left:8px;">アクティブ</span>' : '';
  display.innerHTML = '<span class="selected-check">✓</span><span class="selected-name">' + escapeHtml(companyName) + '</span>' + activeBadge;

  // リスト内のハイライトとチェック更新
  document.querySelectorAll('.company-select-item').forEach(item => {
    const isSelected = item.dataset.name === companyName;
    item.classList.toggle('selected', isSelected);
    item.querySelector('.check-icon').textContent = isSelected ? '✓' : '';
  });

  // ドロップダウンを閉じる
  document.getElementById('companySelectDropdown').classList.remove('show');
  document.getElementById('companySelectDisplay').classList.remove('active');

  updatePreview();
}
```

**サーバー側（ソート処理）:**
```javascript
function showOrderReportDialog() {
  const companyResult = getCompanyListFromSheet();
  let companies = companyResult.success ? companyResult.companies : [];

  // アクティブシート情報を取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheetName = ss.getActiveSheet().getName();

  // システムシート判定
  const systemSheets = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
  const isSystemSheet = systemSheets.some(s => activeSheetName === s || activeSheetName.includes('ヒアリングシート') || activeSheetName.includes('原本'));

  const activeCompanyName = isSystemSheet ? null : activeSheetName;

  // ソート（アクティブ最上段、残りは逆順）
  const sortedCompanies = companies.slice().sort((a, b) => {
    if (a.name === activeCompanyName) return -1;
    if (b.name === activeCompanyName) return 1;
    return b.rowIndex - a.rowIndex; // 逆順
  });

  const html = HtmlService.createHtmlOutput(createOrderReportHTML(members, sortedCompanies, activeCompanyName))
    .setWidth(700)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, 'ダイアログタイトル');
}
```

### 3.5 テンプレート表示（アコーディオン）【確定】

ダイアログ上部にテンプレートをアコーディオンで表示。白背景+枠線のカード形式。

**UI:**
```
┌──────────────────────────────────────────────────┐
│ ▶ テンプレートを表示              [コピー]      │ ← コピーボタンはタイトル行右端
├──────────────────────────────────────────────────┤
│ （展開時）                                        │
│ @{{宛先}} cc:@{{CC}}                             │
│ 新規受注です。                                    │
│ {{企業名}}様、ツナゲル12ヶ月契約。               │
└──────────────────────────────────────────────────┘
```

**CSS:**
```css
.accordion {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
}
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}
.accordion-header:hover { background: #f5f5f5; border-radius: 8px; }
.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}
.accordion-arrow { transition: transform 0.2s; }
.accordion-arrow.open { transform: rotate(90deg); }
.accordion-content {
  display: none;
  padding: 0 16px 16px;
  border-top: 1px solid #eee;
}
.accordion-content.open { display: block; }
.template-text {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 12px;
}
```

**HTML:**
```html
<div class="accordion">
  <div class="accordion-header" onclick="toggleAccordion()">
    <div class="accordion-title">
      <span class="accordion-arrow" id="arrow">▶</span>
      <span>テンプレートを表示</span>
    </div>
    <button class="btn btn-blue" onclick="event.stopPropagation(); copyTemplate()">コピー</button>
  </div>
  <div class="accordion-content" id="accordionContent">
    <div class="template-text" id="templateText">@{{宛先}} cc:@{{CC}}
新規受注です。
{{企業名}}様、ツナゲル12ヶ月契約。</div>
  </div>
</div>
```

**JavaScript:**
```javascript
function toggleAccordion() {
  const content = document.getElementById('accordionContent');
  const arrow = document.getElementById('arrow');
  content.classList.toggle('open');
  arrow.classList.toggle('open');
}

function copyTemplate() {
  const text = document.getElementById('templateText').textContent;
  copyToClipboard(text);
}
```

### 3.6 プレビューセクション【確定】

カード形式で結果を表示。コピーボタンはプレビュー生成後に表示。

**UI:**
```
┌──────────────────────────────────────────────────┐
│ プレビュー                        [コピー]       │ ← 生成後に表示
├──────────────────────────────────────────────────┤
│ @河合 @中尾文香 cc:@青柳                         │
│ 新規受注です。                                    │
│ 株式会社テスト様、ツナゲル12ヶ月契約。           │
└──────────────────────────────────────────────────┘
```

**CSS:**
```css
.preview-section {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.preview-title { font-weight: 500; color: #333; }
.preview-content {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  white-space: pre-wrap;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  color: #333;
}
.preview-placeholder { color: #999; font-style: italic; }
```

**HTML:**
```html
<div class="preview-section">
  <div class="preview-header">
    <span class="preview-title">プレビュー</span>
    <button class="btn btn-green" onclick="copyResult()" id="copyResultBtn" style="display:none;">コピー</button>
  </div>
  <div class="preview-content" id="previewContent">
    <span class="preview-placeholder">企業名を選択するとプレビューが表示されます</span>
  </div>
</div>
```

### 3.7 コピーボタンの表示/非表示【確定】

コピーボタンはプレビュー生成後に表示。`display` で制御。

```javascript
function updatePreview() {
  const preview = document.getElementById('previewContent');
  const copyBtn = document.getElementById('copyResultBtn');

  if (!company) {
    preview.innerHTML = '<span class="preview-placeholder">企業名を選択するとプレビューが表示されます</span>';
    copyBtn.style.display = 'none';  // 非表示
    return;
  }

  // プレビュー生成
  preview.textContent = result;
  copyBtn.style.display = 'block';  // 表示
}
```

### 3.8 共通コピー関数

```javascript
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess();
  }).catch(err => {
    // フォールバック
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess();
  });
}

function showCopySuccess() {
  const msg = document.getElementById('copySuccess');
  msg.classList.add('show');
  setTimeout(() => {
    msg.classList.remove('show');
  }, 2000);
}
```

### 3.9 貼り付けUIコンポーネント【確定】

テキストを貼り付ける入力エリア。ラベル・プレースホルダーは静的/動的どちらにも対応。

**2種類の用途:**

| 種類 | 用途 | 保存ボタン | 例 |
|------|------|----------|-----|
| 入力用（永続化あり） | 貼り付け → シートに保存 | あり | 文字起こし転記、構成案 |
| 出力用（読み取り専用） | 生成結果を表示 | なし | プロンプト出力 |

**UI（入力用・永続化あり）:**
```
┌─────────────────────────────────────────────────┐
│ {{inputLabel}}                  [💾 シートに保存] │
├─────────────────────────────────────────────────┤
│                                                   │
│ placeholder="{{inputPlaceholder}}"               │
│ （テキストエリア 150px）                          │
│                                                   │
├─────────────────────────────────────────────────┤
│ ※ 説明テキスト ｜ 保存すると次回自動読み込み      │
└─────────────────────────────────────────────────┘
```

**UI（出力用・読み取り専用）:**
```
┌─────────────────────────────────────────────────┐
│ 📤 出力（AIに貼り付け）                          │
├─────────────────────────────────────────────────┤
│                                                   │
│ （テキストエリア 200px / readonly / 灰色背景）    │
│                                                   │
└─────────────────────────────────────────────────┘
```

**パラメータ:**

| パラメータ | 取得元 | デフォルト値 |
|-----------|--------|-------------|
| `inputLabel` | プロンプトシート or 静的 | 「入力」 |
| `inputPlaceholder` | プロンプトシート or 静的 | 「ここにテキストを貼り付け...」 |

**HTML（入力用）:**
```html
<div class="section">
  <div class="section-title">
    ${inputLabel}
    <button class="btn-save" onclick="saveToSheet()">💾 シートに保存</button>
  </div>
  <textarea
    class="input-area"
    id="inputArea"
    placeholder="${inputPlaceholder}"
  ></textarea>
  <div class="note">※ 保存すると次回自動読み込み</div>
</div>
```

**HTML（出力用）:**
```html
<div class="section">
  <div class="section-title">📤 出力（AIに貼り付け）</div>
  <textarea
    class="output-area"
    id="outputArea"
    readonly
    placeholder="生成ボタンをクリックすると、ここに結果が表示されます"
  ></textarea>
</div>
```

**CSS:**
```css
.section { margin-bottom: 15px; }
.section-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

textarea {
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
}
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-area { height: 150px; }
.output-area { height: 200px; background: #f8f9fa; }

.note {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}

.btn-save {
  padding: 4px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btn-save:hover { background: #e0e0e0; }
```

**動的ラベル取得例（プロンプトシートから）:**
```javascript
// プロンプトシートから取得
const promptData = getPromptFromSheet(promptName);
const inputLabel = promptData.inputLabel || '入力';
const inputPlaceholder = promptData.inputPlaceholder || 'ここにテキストを貼り付け...';

// HTMLに埋め込み
const html = `
  <div class="section-title">${escapeHtml(inputLabel)}</div>
  <textarea placeholder="${escapeHtml(inputPlaceholder)}"></textarea>
`;
```

---

## 4. テンプレートと企業シートの関係

### 4.1 フロー概要

```
設定シート（P-Q列）           ヒアリングシート               企業シート
Part③構成を定義               （テンプレート）              （株式会社○○など）
      │                              │                            │
      │   テンプレート初期設定       │                            │
      └──────────────────────────────▶│                            │
                                      │                            │
                                      │   新規作成（フォーム回答から）
                                      └────────────────────────────▶│
                                      │   新規作成（手動）          │
                                      └────────────────────────────▶│
```

### 4.2 各操作の役割

| 操作 | 実行タイミング | 影響範囲 |
|------|---------------|---------|
| **テンプレート初期設定** | 設定シートのPart③構成を変更した後 | 「ヒアリングシート」テンプレートのみ |
| **新規作成（フォーム回答から）** | 新しい企業を追加する時 | 新規作成される企業シート |
| **新規作成（手動）** | 新しい企業を追加する時 | 新規作成される企業シート |

### 4.3 重要な注意点

**テンプレート更新後の影響:**
- テンプレートを更新しても**既存の企業シートは更新されない**
- 新規作成した企業シートのみ新しい構成になる
- 既存の企業シートを更新したい場合は手動追加 or 作り直し

**Part③構成を変更した場合の手順:**
1. 設定シートのP-Q列を編集（またはDEFAULT_PART3_CONFIGを変更）
2. **必ず「🎨 テンプレート初期設定」を再実行**
3. その後の新規作成で新しい構成が反映される

### 4.4 トラブルシューティング

**Q: Part③に項目を追加したのに、企業シートに反映されない**

A: 以下を確認してください：
1. 設定シートのP-Q列に項目が追加されているか → `debugPart3Config()` で確認
2. テンプレート初期設定を再実行したか
3. テンプレート（ヒアリングシート）のPart③に項目があるか
4. 企業シートは「新規作成」で作ったか（既存シートは更新されない）

---

## 5. 入力データの永続化

### 5.1 設計思想

ダイアログで入力したデータは一時的ではなく、スプレッドシートに保存して再利用する。

**フロー:**
1. 貼り付け → 対象シートのセルに保存
2. 次回開く → セルから読み込み → フィールドに自動入力
3. 後続フローでも同じデータを参照可能

**上書き時の挙動:**
- 既にデータがある状態で新規入力 → 「上書きしますか？」アラート
- OK → 上書き保存

### 5.2 除外シート

以下のシートは企業データ保存先として選択不可：

- プロンプト
- 設定
- フォームの回答1
- ヒアリングシート（原本/テンプレート）
- 企業情報一覧

```javascript
const excludeExact = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
const excludePartial = ['ヒアリングシート', '原本'];
```

### 5.3 Part③構造（企業シート）

企業シートのPart③（処理データ）セクションにGASが自動保存するデータを格納。

```
Part③ 処理データ（システム管理）
├─ 行135: 撮影素材フォルダURL
├─ 行136: メインフォルダURL
├─ 行137-141: 文字起こし原文（5行分）
├─ 行142-149: 議事録（8行分）
├─ 行150-157: 構成案（原稿用）（8行分）
└─ 行158-165: 構成案（動画用）（8行分）
```

### 5.4 保存キーマッピング（設定シート）

プロンプト名とPart③保存キーの対応は設定シートのM-N列で管理。

```
設定シート
├── A-B列: メンバー一覧
├── D-F列: 業務担当者
├── H-I列: フォルダ設定
├── K列: 企業情報項目
└── M-N列: 保存キーマッピング ★
    ├── M列: プロンプト名
    └── N列: 保存キー（Part③のキー）
```

**デフォルト値（settingsSheet.js）:**
```javascript
const DEFAULT_SAVE_KEY_MAPPING = [
  { promptName: '議事録作成', saveKey: '文字起こし原文' },
  { promptName: 'ワークス投稿', saveKey: '議事録' },
];
```

### 5.5 保存機能付きプロンプトダイアログの追加手順

新しいプロンプトに保存機能を追加する手順：

**Step 1: Part③にセルを追加（hearingSheetManager.js）**

`setupTemplate()`関数内のPart③セクションにセルを追加：
```javascript
// Part③ 処理データ
row = createSectionHeader(sheet, row, 'Part③ 処理データ（システム管理）');
row = createDataStorageRow(sheet, row, '撮影素材フォルダURL');
row = createDataStorageRow(sheet, row, 'メインフォルダURL');
row = createDataStorageRowLarge(sheet, row, '文字起こし原文', 5);
row = createDataStorageRowLarge(sheet, row, '議事録', 8);  // ★追加
row = createDataStorageRowLarge(sheet, row, '構成案（原稿用）', 8);
row = createDataStorageRowLarge(sheet, row, '構成案（動画用）', 8);
```

**Step 2: PART3_MAPPINGにキーを追加（settingsSheet.js）**

```javascript
const PART3_MAPPING = {
  '撮影素材フォルダURL': { row: 135, col: 3 },
  'メインフォルダURL': { row: 136, col: 3 },
  '文字起こし原文': { row: 137, col: 3 },    // 5行分: 137-141
  '議事録': { row: 142, col: 3 },             // 8行分: 142-149 ★追加
  '構成案_原稿用': { row: 150, col: 3 },      // 8行分: 150-157
  '構成案_動画用': { row: 158, col: 3 },      // 8行分: 158-165
};
```

**注意**: 行を追加すると後続の行番号がずれるため、全て更新すること。

**Step 3: 設定シートにマッピングを追加**

設定シートのM-N列に追加（または `DEFAULT_SAVE_KEY_MAPPING` に追加）：

| M列（プロンプト名） | N列（保存キー） |
|-------------------|----------------|
| 議事録作成 | 文字起こし原文 |
| ワークス投稿 | 議事録 |
| （新規追加）... | （Part③キー）... |

**Step 4: 動作確認**

1. プロンプトシートに該当プロンプトがあることを確認
2. メニューからダイアログを開く
3. 企業選択UI・保存ボタンが表示されることを確認
4. 保存 → 企業シートPart③に保存されることを確認
5. 再度開く → 保存済みデータが読み込まれることを確認

### 5.6 保存キー取得関数（settingsSheet.js）

```javascript
// プロンプト名から保存キーを取得
getSaveKeyForPrompt(promptName)    // → 保存キー or null

// 全マッピングを取得
getAllSaveKeyMappings()            // → [{ promptName, saveKey }, ...]
```

**使用例（promptDialog.js）:**
```javascript
function showPromptDialog(prompt) {
  const saveKey = getSaveKeyForPrompt(prompt.name);

  if (saveKey) {
    // 保存機能付きダイアログを表示
    const sheetList = getCompanySheetListForPrompt(saveKey);
    const html = getPromptDialogWithSaveHtml(prompt, saveKey, sheetList);
    // ...
  } else {
    // 通常ダイアログを表示
    const html = getPromptDialogHtml(prompt);
    // ...
  }
}
```

---

## 6. 連絡用フォーマットの位置づけ

### 6.1 概念

連絡用フォーマットは**業務フローとは独立したユーティリティ機能**として位置づける。

- ナンバリングなし（「📨 連絡用フォーマット」）
- 業務番号に紐付かない
- いつでも使える汎用フォーマット

### 6.2 含まれる機能

| 機能 | 説明 |
|------|------|
| 日程確定報告 | 初回打ち合わせの日程確定を報告 |
| 撮影日程確認 | 撮影担当への日程確認連絡 |
| 参加者リマインド | 打ち合わせ前日のリマインド |
| 撮影指示連絡 | 撮影担当への指示連絡 |
| 議事録共有 | 議事録のワークス共有 |

### 6.3 フォーマット設計パターン

```
┌─────────────────────────────────────────────┐
│ 📝 〇〇への連絡用テンプレート               │
├─────────────────────────────────────────────┤
│ 宛先: [河合, 中尾文香      ▼]               │
│ CC:   [青柳               ▼]               │
│ 企業名: [-- 企業を選択 -- ▼]               │
├─────────────────────────────────────────────┤
│ [生成]                                      │
├─────────────────────────────────────────────┤
│ @河合 @中尾文香 cc:@青柳                    │
│ 株式会社テスト 様の...                      │
├─────────────────────────────────────────────┤
│ [📋 コピー]                                 │
└─────────────────────────────────────────────┘
```

---

## 7. GASファイル間の関数呼び出し

### 7.1 共通関数の呼び出し

GASでは全ファイルがグローバルスコープを共有するため、別ファイルの関数を直接呼び出せる。

```javascript
// settingsSheet.js で定義
function getMemberList() { ... }
function getSettingsFromSheet() { ... }

// companyInfoManager.js で使用
function showOrderReportDialog() {
  const members = getMemberList(); // 直接呼び出し
  ...
}
```

### 7.2 関数名の競合回避

同じ機能を持つ関数は、ファイル固有のサフィックスを付ける：

```javascript
// companyInfoManager.js
function getCompanySheetListForCompanyInfo() { ... }

// contactFormats.js
function getCompanySheetListForContacts() { ... }
```

---

## 8. 実装チェックリスト

### 8.1 新規ダイアログ作成時

- [ ] `CI_DIALOG_STYLES` を使用
- [ ] 担当者選択はコンパクトドロップダウン
- [ ] 企業選択は「一覧から選択/手入力」切り替え
- [ ] 企業リストは新しい順（逆順ソート）
- [ ] 結果表示エリアにコピーボタン
- [ ] コピー成功メッセージ表示

### 8.2 メニュー追加時

- [ ] 適切なナンバリング（0〜5 or なし）
- [ ] アイコン付与
- [ ] セパレーターで機能グループ分け
- [ ] `addXxxMenu(ui)` 関数で定義
- [ ] `onOpen()` から呼び出し

### 8.3 データ保存時

- [ ] 企業情報は企業情報一覧シートに保存
- [ ] 除外シートを選択肢から除外
- [ ] 上書き確認アラート実装

---

## 9. 参考実装

| 機能 | ファイル | 関数 |
|------|----------|------|
| コンパクトドロップダウン | companyInfoManager.js | `createOrderReportHTML()` |
| 企業情報一覧操作 | companyInfoManager.js | `getCompanyListFromSheet()` |
| メンバーリスト取得 | settingsSheet.js | `getMemberList()` |
| 設定値取得 | settingsSheet.js | `getSettingsFromSheet()` |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-12 | セクション4「テンプレートと企業シートの関係」を追加。フロー図・注意点・トラブルシューティングを記載 |
| 2026-01-11 | GASファイル構成更新: commonStyles.js追加、共通スタイルの使い方を記載 |
| 2026-01-11 | UI確定: 貼り付けUIコンポーネント（入力用・出力用、動的ラベル対応） |
| 2026-01-11 | UI確定: 企業選択コンポーネント（アクティブバッジ・チェック・ハイライト・ソート） |
| 2026-01-11 | UI確定: ダイアログサイズ700x750、テンプレート表示、プレビューUI、コピーボタン制御 |
| 2026-01-11 | V2 初版作成 |
