# GAS最適化レポート

**作成日**: 2026-01-14
**目的**: 後続セッションが設計思想に沿った最適化を安全に実施するためのガイド

---

## 設計原則（MUST遵守）

### 1. スプレッドシート中心の設計
- **理由**: 担当者が直接メンテナンス可能（コード変更不要）
- **実践**: 設定値はコードにハードコードせず、設定シートから取得

### 2. 設定シートから取得すべき値
| 種類 | 取得関数 | 定義場所 |
|-----|---------|---------|
| メンバー一覧 | `getMemberList()` / `getMemberListWithNotes()` | settingsSheet.js |
| 業務担当者 | `getAllTaskAssignees()` | settingsSheet.js |
| タスク一覧 | `getTasks()` | progressManager.js |
| フォルダ設定 | `getFolderSettingsFromSheet()` | settingsSheet.js |
| 除外シート判定 | `isExcludedSheet(sheetName)` | settingsSheet.js |
| サブフォルダ | `getSubfoldersFromSettings()` | settingsSheet.js |

### 3. プロンプトシートから取得すべき値
| 種類 | 取得関数 | 定義場所 |
|-----|---------|---------|
| プロンプト本文 | `getPromptFromSheet(promptName)` | settingsSheet.js |
| カテゴリ別プロンプト | `getPromptsByCategory(category)` | settingsSheet.js |

### 4. commonStyles.js共通スタイル
- **ダイアログ基本スタイル**: `CI_DIALOG_STYLES`
- **UIコンポーネント**: `CI_UI_COMPONENTS`（escapeHtml含む）
- **企業選択ドロップダウン**: `createCompanySelectHtml()`

### 5. 表現ルール
- 「GAS」という表現は使わない → 「ヒアリングシートのメニュー」と記載

---

## 高優先度の問題（Phase 1）

### 1-1. settingsSheet.js: スタイル重複

**問題**: 4つのダイアログで独自スタイルを定義（commonStyles.jsと重複）

**対象箇所**:
- `createMemberEditHTML()` 764-856行
- `createTaskAssigneeEditHTML()` 914-966行
- `createFolderSettingsEditHTML()` 1212-1267行
- `createPromptEditHTML()` 1446-1511行

**現状コード（764-780行）**:
```javascript
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
  .member-list { max-height: 300px; overflow-y: auto; }
  .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
  .btn-primary { background: #1a73e8; color: white; }
  .btn-secondary { background: #f1f3f4; color: #333; }
  .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
  .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
  .status.error { display: block; background: #ffebee; color: #c62828; }
</style>
```

**改善方法**:
```javascript
<head>
  ${CI_DIALOG_STYLES}
  <style>
    /* ダイアログ固有のスタイルのみ */
    .member-list { max-height: 300px; overflow-y: auto; }
    .member-row { display: flex; gap: 10px; margin-bottom: 8px; align-items: center; }
  </style>
</head>
<body>
  <!-- content -->
  ${CI_UI_COMPONENTS}
</body>
```

**注意**: CI_DIALOG_STYLESとCI_UI_COMPONENTSはcommonStyles.jsで定義済み

---

### 1-2. settingsSheet.js: getInputKeyForPrompt()未実装

**問題**: 設定シートを参照せず、DEFAULT_SAVE_KEY_MAPPINGを直接参照

**対象箇所**: 570-574行

**現状コード**:
```javascript
function getInputKeyForPrompt(promptName) {
  // 現在はDEFAULT_SAVE_KEY_MAPPINGから取得（設定シート拡張時に変更）
  const mapping = DEFAULT_SAVE_KEY_MAPPING.find(m => m.promptName === promptName);
  return mapping && mapping.inputKey ? mapping.inputKey : null;
}
```

**改善方法**:
```javascript
function getInputKeyForPrompt(promptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    // フォールバック: デフォルト値を使用
    const mapping = DEFAULT_SAVE_KEY_MAPPING.find(m => m.promptName === promptName);
    return mapping && mapping.inputKey ? mapping.inputKey : null;
  }

  // 設定シートのM〜O列から取得
  const data = sheet.getRange('M2:O').getValues();
  for (const row of data) {
    const name = String(row[0] || '').trim();
    const inputKey = String(row[2] || '').trim();
    if (name === promptName && inputKey) {
      return inputKey;
    }
  }

  return null;
}
```

---

### 1-3. hearingSheetManager.js: ステータス関連ハードコード

**問題**: TASK_HOLDERS, STATUS_STATES, STATUS_OVERALLがハードコード

**対象箇所**: 1068-1075行付近

**現状コード**:
```javascript
sheet.getRange(valueRow, 3).setValue(TASK_HOLDERS[0]).setBackground(inputBg);
const holderRule = SpreadsheetApp.newDataValidation()
  .requireValueInList(TASK_HOLDERS, true).build();
```

**改善方法**:
progressManager.jsの関数を使用:
```javascript
// progressManager.jsから取得
const taskHolders = getTaskHolders();  // ['渡邉', '河合', '川崎', '中尾文香', '紺谷', '下脇田', '先方']
const statusStates = getStatusStates(); // ['対応中', '先方確認', '次の担当へ']
const statusOverall = getStatusOverall(); // ['制作中', '運用中', '完了']

sheet.getRange(valueRow, 3).setValue(taskHolders[0]).setBackground(inputBg);
const holderRule = SpreadsheetApp.newDataValidation()
  .requireValueInList(taskHolders, true).build();
```

**前提**: progressManager.jsに以下の関数を追加（または設定シートから取得に変更）:
```javascript
function getStatusStates() {
  // 将来: 設定シートから取得
  return ['対応中', '先方確認', '次の担当へ'];
}

function getStatusOverall() {
  // 将来: 設定シートから取得
  return ['制作中', '運用中', '完了'];
}
```

---

### 1-4. companyInfoManager.js: メンバー名ハードコード

**問題**: defaultMentions, defaultCC, defaultParticipantsがハードコード

**対象箇所**:
- 617-618行: `defaultMentions = ['河合', '中尾文香']`, `defaultCC = ['青柳']`
- 1565行: `defaultParticipants = ['渡邉', '河合']`

**現状コード（617-618行）**:
```javascript
const defaultMentions = ['河合', '中尾文香'];
const defaultCC = ['青柳'];
```

**改善方法**:
```javascript
// 設定シートから取得
const settings = getSettingsFromSheet();
const defaultMentions = settings['受注連絡メンション']
  ? settings['受注連絡メンション'].split(',').map(s => s.trim())
  : [];
const defaultCC = settings['受注連絡CC']
  ? settings['受注連絡CC'].split(',').map(s => s.trim())
  : [];
```

**設定シート拡張**: H列に以下を追加
| キー | 値 | 備考 |
|-----|-----|-----|
| 受注連絡メンション | 河合,中尾文香 | カンマ区切り |
| 受注連絡CC | 青柳 | カンマ区切り |
| 日程調整参加者 | 渡邉,河合 | カンマ区切り |

---

### 1-5. contactFormats.js: 除外シート名重複

**問題**: isExcludedSheet()が存在するのに、独自の除外リストを定義

**対象箇所**: 54-55行

**現状コード**:
```javascript
const excludeExact = ['プロンプト', '設定', 'フォームの回答 1', 'フォームの回答1', '企業情報一覧', 'ヒアリングシート'];
const excludePartial = ['ヒアリングシート', '原本'];
```

**改善方法**:
```javascript
// settingsSheet.jsのisExcludedSheet()を使用
const sheets = ss.getSheets().filter(s => !isExcludedSheet(s.getName()));
```

**注意**: isExcludedSheet()がcontactFormats.jsから参照可能か確認

---

### 1-6. contactFormats.js: メンバー名ハードコード

**問題**: 複数箇所でメンバー名がハードコード

**対象箇所**:
| 行番号 | 変数名 | 現在の値 |
|-------|-------|---------|
| 227 | defaultMentions | ['河合'] |
| 228 | defaultCC | ['青柳'] |
| 451 | defaultShooter | '川崎' |
| 692 | defaultMentions | ['河合', '川崎'] |
| 693 | defaultCC | ['青柳'] |
| 936 | defaultMentions | ['河合'] |
| 1218 | defaultMentions | ['河合'] |
| 1467 | defaultParticipants | ['渡邉', '河合'] |

**改善方法**:
```javascript
// 各ダイアログで設定シートから取得
const settings = getSettingsFromSheet();
const defaultMentions = settings['連絡メンション']
  ? settings['連絡メンション'].split(',').map(s => s.trim())
  : [];
const defaultCC = settings['連絡CC']
  ? settings['連絡CC'].split(',').map(s => s.trim())
  : [];
const defaultShooter = settings['撮影担当'] || '';
```

---

### 1-7. createShootingFolder.js: サブフォルダ名重複

**問題**: SUBFOLDERS定数とgetSubfoldersFromSettings()が重複

**対象箇所**: 33-37行

**現状コード**:
```javascript
const SUBFOLDERS = [
  '01_撮影素材',
  '02_編集データ',
  '03_完成動画'
];
```

**改善方法**:
```javascript
// 定数を削除し、関数のみ使用
// 33-37行を削除

// 使用箇所（141行付近）
const subfolders = getSubfoldersFromSettings();
```

---

### 1-8. createShootingFolder.js: 親フォルダID定数

**問題**: PARENT_FOLDER_ID定数が残っている

**対象箇所**: 30行

**現状コード**:
```javascript
const PARENT_FOLDER_ID = 'YOUR_PARENT_FOLDER_ID_HERE';
```

**改善方法**:
```javascript
// 定数を削除
// 30行を削除

// 使用箇所ではgetParentFolderId()を使用（既存関数）
const parentFolderId = getParentFolderId();
if (!parentFolderId) {
  showErrorDialog('親フォルダが設定されていません');
  return;
}
```

---

## 中優先度の問題（Phase 2）

### 2-1. progressManager.js: getAllMembers()未定義

**対象箇所**: 61-69行

**問題**: `getAllMembers()`を呼び出しているが、settingsSheet.jsには`getMemberListWithNotes()`が存在

**改善方法**:
```javascript
function getTaskHolders() {
  const members = getMemberListWithNotes();  // 修正: getAllMembers → getMemberListWithNotes
  const holders = members.map(m => m.name);
  if (!holders.includes('先方')) {
    holders.push('先方');
  }
  return holders;
}
```

---

### 2-2. progressManager.js: 除外シート名重複

**対象箇所**: 184-193行, 345-346行, 373行

**改善方法**: settingsSheet.jsの`isExcludedSheet()`を使用

---

### 2-3. hearingSheetManager.js: スタイル重複

**対象箇所**: 518-584行（response-selectスタイル）

**改善方法**: commonStyles.jsのcompany-selectスタイルを流用

---

### 2-4. compositionDraftGenerator.js: プロンプト取得重複

**対象箇所**: 167-168行, 827-865行

**問題**: `getCompositionPromptFromSheet()`と`getConvertPromptFromSheet()`が同様の処理

**改善方法**: 共通関数`getPromptFromSheet(promptName)`を作成

---

## 低優先度の問題（Phase 3）

| ファイル | 箇所 | 内容 |
|---------|-----|------|
| settingsSheet.js | 810-1609行 | escapeHtml()重複（CI_UI_COMPONENTS使用で解消）|
| progressManager.js | 520-530行 | ステータスダイアログスタイル |
| promptDialog.js | 173-189, 287-295行 | スタイル・escapeHtml重複 |
| compositionDraftGenerator.js | 498-507行 | インラインスタイル |
| companyCueGenerator.js | 23-47行 | インタビュー質問定数（将来検討）|

---

## 問題なしファイル

| ファイル | 評価 |
|---------|------|
| commonStyles.js | 共通スタイルのマスターとして適切 |
| transcriptToHearingSheet.js | CI_DIALOG_STYLESを使用、ハードコードなし |

---

## 改善作業の依存関係

```
Phase 1（並行可能）
├── 1-1. settingsSheet.js スタイル統一
├── 1-2. settingsSheet.js getInputKeyForPrompt修正
├── 1-3. hearingSheetManager.js ステータス関連
│     └── 依存: progressManager.jsにgetStatusStates/getStatusOverall追加
├── 1-4. companyInfoManager.js メンバー名
│     └── 依存: 設定シートに項目追加
├── 1-5. contactFormats.js 除外シート
├── 1-6. contactFormats.js メンバー名
│     └── 依存: 設定シートに項目追加
├── 1-7. createShootingFolder.js サブフォルダ
└── 1-8. createShootingFolder.js 親フォルダID

Phase 2（Phase 1完了後）
├── 2-1. progressManager.js getAllMembers修正
├── 2-2. progressManager.js 除外シート統一
├── 2-3. hearingSheetManager.js スタイル統一
└── 2-4. compositionDraftGenerator.js プロンプト取得共通化

Phase 3（Phase 2完了後）
└── 各ファイルのescapeHtml・インラインスタイル統一
```

---

## 設定シート拡張案

Phase 1で必要な設定シートの追加項目:

| 列 | キー | 値（例） | 用途 |
|----|-----|---------|-----|
| H | 受注連絡メンション | 河合,中尾文香 | companyInfoManager.js |
| H | 受注連絡CC | 青柳 | companyInfoManager.js |
| H | 日程調整参加者 | 渡邉,河合 | companyInfoManager.js |
| H | 連絡メンション | 河合 | contactFormats.js |
| H | 連絡CC | 青柳 | contactFormats.js |
| H | 撮影担当 | 川崎 | contactFormats.js, createShootingFolder.js |

---

## 作業時の注意事項

1. **既存機能の確認**: 変更前に該当機能を実行し、動作確認
2. **段階的な変更**: 1ファイルずつ変更→テスト→次のファイル
3. **フォールバック維持**: 設定シートが存在しない場合のデフォルト値を残す
4. **GASデプロイ**: 変更後は新しいデプロイが必要
5. **スプレッドシート側**: 設定シート拡張は手動で行う

---

## 完了チェックリスト

### Phase 1
- [ ] 1-1. settingsSheet.js スタイル統一
- [ ] 1-2. settingsSheet.js getInputKeyForPrompt修正
- [ ] 1-3. hearingSheetManager.js ステータス関連
- [x] 1-4. companyInfoManager.js メンバー名
- [x] 1-5. contactFormats.js 除外シート
- [x] 1-6. contactFormats.js メンバー名
- [x] 1-7. createShootingFolder.js サブフォルダ
- [x] 1-8. createShootingFolder.js 親フォルダID

### Phase 2
- [ ] 2-1. progressManager.js getAllMembers修正
- [ ] 2-2. progressManager.js 除外シート統一
- [ ] 2-3. hearingSheetManager.js スタイル統一
- [ ] 2-4. compositionDraftGenerator.js プロンプト取得共通化

### Phase 3
- [ ] escapeHtml統一
- [ ] インラインスタイル統一
