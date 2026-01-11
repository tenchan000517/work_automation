# ファイル内容レポート

作成日時: 2026-01-10

## 読んだファイル一覧

1. HANDOFF.md
2. tsunageru.ts (行1〜2500)
3. contactFormats.js
4. settingsSheet.js
5. hearingSheetManager.js
6. transcriptToHearingSheet.js
7. compositionDraftGenerator.js
8. createShootingFolder.js
9. promptDialog.js
10. sheetStructureChecker.js

---

## 1. tsunageru.ts

### ファイルの場所
`/mnt/c/work-manual/src/lib/data/tsunageru.ts`

### 構造
- TypeScriptファイル
- `tasks`という配列をエクスポート
- 各taskは`no`, `category`, `name`, `assignee`, `tools`, `deliverable`, `checkpoint`, `hasManual`, `issues`, `simulation`, `manualDraft`, `flowSteps`などのプロパティを持つ

### popupの定義場所と内容

#### No.0 受注・ワークス立ち上げ
```
flowSteps内の「ワークスで受注報告」に popup あり
inputFields:
  - { id: "mention", label: "宛先", placeholder: "@河合 @中尾文香 cc:@青柳", defaultValue: "@河合 @中尾文香 cc:@青柳" }
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
template:
  {{mention}}
  新規受注です。{{company}}様、ツナゲル12ヶ月契約となります。
  担当、よろしくお願いします。
```

#### No.1 初回打ち合わせ日程調整
```
flowSteps内の「ワークスで日程確定報告」に popup あり
inputFields:
  - { id: "mention", label: "宛先", placeholder: "@河合 cc:@青柳", defaultValue: "@河合 cc:@青柳" }
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
  - { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" }
  - { id: "meetUrl", label: "Meet URL", placeholder: "https://meet.google.com/xxx-xxxx-xxx" }
template:
  {{mention}}
  初回打ち合わせの日程が確定しました。

  【企業名】{{company}}
  【日時】{{datetime}}
  【Meet URL】{{meetUrl}}

  よろしくお願いします。
```

#### No.2 初回打ち合わせ準備（flowSteps内に2つのpopup）

**撮影日程確認フォーマット:**
```
inputFields:
  - { id: "mention", label: "宛先（撮影担当）", placeholder: "@川崎", defaultValue: "@川崎" }
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
  - { id: "mtgDate", label: "初回打ち合わせ日", placeholder: "○月○日（○）" }
  - { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." }
  - { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." }
template:
  {{mention}}
  {{company}}様の撮影について相談です。

  初回打ち合わせ：{{mtgDate}}予定
  打ち合わせで先方に撮影候補日を提示したいので、
  打ち合わせ日以降で撮影可能な日程を5候補ほど教えてください。

  よろしくお願いします。

  ━━━━━━━━━━━━━━━━━━━━
  📎 関連リンク
  ━━━━━━━━━━━━━━━━━━━━
  📋 ヒアリングシート: {{hearingSheetUrl}}
  📁 撮影素材フォルダ: {{folderUrl}}
```

**リマインドフォーマット（参加者へリマインド）:**
```
inputFields:
  - { id: "mention", label: "宛先", placeholder: "@渡邉 cc:@青柳", defaultValue: "@渡邉 cc:@青柳" }
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
  - { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" }
  - { id: "meetUrl", label: "Meet URL", placeholder: "https://meet.google.com/xxx-xxxx-xxx" }
  - { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." }
  - { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." }
template:
  {{mention}}
  {{company}}様の初回打ち合わせリマインドです。

  【日時】{{datetime}}
  【Meet URL】{{meetUrl}}

  よろしくお願いします。

  ━━━━━━━━━━━━━━━━━━━━
  📎 関連リンク
  ━━━━━━━━━━━━━━━━━━━━
  📋 ヒアリングシート: {{hearingSheetUrl}}
  📁 撮影素材フォルダ: {{folderUrl}}
```

#### No.4 打ち合わせ後対応（flowSteps内に2つのpopup）

**撮影指示フォーマット:**
```
inputFields:
  - { id: "mention", label: "宛先（撮影担当）", placeholder: "@川崎", defaultValue: "@川崎" }
  - { id: "cc", label: "CC", placeholder: "@青柳", defaultValue: "@青柳" }
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
  - { id: "shootingDate", label: "撮影日", placeholder: "○月○日（○）○○:○○〜" }
  - { id: "location", label: "場所", placeholder: "○○株式会社 本社" }
  - { id: "address", label: "住所", placeholder: "愛知県名古屋市○○区..." }
  - { id: "interviewTarget", label: "インタビュー対象", placeholder: "代表取締役 ○○様、営業部 ○○様" }
  - { id: "notes", label: "備考", placeholder: "駐車場あり、作業着撮影希望 等" }
  - { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." }
  - { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." }
template:
  {{mention}} cc:{{cc}}
  {{company}}様の撮影日程が確定しましたのでご連絡します。

  【撮影日】{{shootingDate}}
  【場所】{{location}}
  【住所】{{address}}
  【インタビュー対象】{{interviewTarget}}
  【備考】{{notes}}

  ━━━━━━━━━━━━━━━━━━━━
  📁 撮影データの保存先
  ━━━━━━━━━━━━━━━━━━━━
  撮影後、以下のフォルダに素材をアップロードしてください。
  {{folderUrl}}

  確認したらリアクションお願いします。

  ━━━━━━━━━━━━━━━━━━━━
  📎 関連リンク
  ━━━━━━━━━━━━━━━━━━━━
  📋 ヒアリングシート: {{hearingSheetUrl}}
  📁 撮影素材フォルダ: {{folderUrl}}
```

**ワークス投稿フォーマット（議事録共有）:**
```
inputFields:
  - { id: "company", label: "企業名", placeholder: "株式会社○○" }
  - { id: "shootingMention", label: "撮影担当メンション", placeholder: "@川崎", defaultValue: "@川崎" }
  - { id: "minutes", label: "議事録", placeholder: "AIが出力した議事録をここに貼り付け...", type: "textarea", rows: 10 }
  - { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." }
  - { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." }
template:
  @ALL {{shootingMention}}
  {{company}}様 初回打ち合わせの議事録を共有します。

  {{minutes}}

  ご確認お願いします。

  ━━━━━━━━━━━━━━━━━━━━
  📎 関連リンク
  ━━━━━━━━━━━━━━━━━━━━
  📋 ヒアリングシート: {{hearingSheetUrl}}
  📁 撮影素材フォルダ: {{folderUrl}}
```

### tasksの構造（読んだ範囲）

| no | name | assignee |
|----|------|----------|
| 0 | 受注・ワークス立ち上げ | 渡邉 |
| 1 | 初回打ち合わせ日程調整 | 渡邉 |
| 2 | 初回打ち合わせ準備 | 河合 |
| 3 | オンライン初回打ち合わせ | 渡邉, 河合 |
| 4 | 打ち合わせ後対応 | 河合 |
| 5 | ヒアリング内容整理 | 河合 |
| 6 | 企画・質問設計 | 川崎 |
| 7 | 撮影 | 川崎 |
| 8 | 編集 | 河合 |

---

## 2. contactFormats.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/contactFormats.js`

### 定義されている定数

```javascript
const CONTACT_FORMATS = [
  {
    id: 'orderReport',
    name: '受注報告（ワークス投稿）',
    description: '新規受注をワークスで報告',
    taskNo: '0'
  },
  {
    id: 'scheduleConfirm',
    name: '日程確定報告',
    description: '初回打ち合わせの日程確定を報告',
    taskNo: '1'
  },
  {
    id: 'shootingDateCheck',
    name: '撮影日程確認',
    description: '撮影担当者に撮影可能日を確認',
    taskNo: '2'
  },
  {
    id: 'participantRemind',
    name: '参加者リマインド',
    description: '打ち合わせ参加者へのリマインド',
    taskNo: '2'
  },
  {
    id: 'shootingInstruction',
    name: '撮影指示連絡',
    description: '撮影担当者への撮影詳細連絡',
    taskNo: '4'
  },
  {
    id: 'minutesShare',
    name: '議事録共有',
    description: '初回打ち合わせの議事録をワークスで共有',
    taskNo: '4'
  }
];
```

### 定義されている関数

- `addContactFormatsMenu(ui)` - メニュー追加
- `showContactFormatDialog(formatId)` - ダイアログ表示
- `getCompanySheetListForContact()` - 企業シート一覧取得
- `getSheetDataForContact(sheetName)` - シートからデータ取得
- `getSheetUrls(sheetName)` - Part③からURL取得
- `createContactFormatDialogHTML(formatConfig, sheetList)` - HTML生成

### getSheetDataForContact関数の内容
```javascript
function getSheetDataForContact(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { success: false, error: 'シートが見つかりません' };
  }

  // Part①から基本情報を取得
  const companyName = sheet.getRange(5, 3).getValue() || '';

  // Part③からURLを取得
  const urls = getSheetUrls(sheetName);

  return {
    success: true,
    companyName: String(companyName).trim(),
    hearingSheetUrl: urls.hearingSheetUrl || '',
    folderUrl: urls.folderUrl || ''
  };
}
```

### 各フォーマットのテンプレート（contactFormats.js内で定義）

**受注報告:**
```
{{mention}}
新規受注です。{{company}}様、ツナゲル12ヶ月契約となります。
担当、よろしくお願いします。
```

**日程確定報告:**
```
{{mention}}
初回打ち合わせの日程が確定しました。

【企業名】{{company}}
【日時】{{datetime}}
【Meet URL】{{meetUrl}}

よろしくお願いします。
```

**撮影日程確認:**
```
{{mention}}
{{company}}様の撮影について相談です。

初回打ち合わせ：{{mtgDate}}予定
打ち合わせで先方に撮影候補日を提示したいので、
打ち合わせ日以降で撮影可能な日程を5候補ほど教えてください。

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}
```

**参加者リマインド:**
```
{{mention}}
{{company}}様の初回打ち合わせリマインドです。

【日時】{{datetime}}
【Meet URL】{{meetUrl}}

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}
```

**撮影指示連絡:**
```
{{mention}} cc:{{cc}}
{{company}}様の撮影日程が確定しましたのでご連絡します。

【撮影日】{{shootingDate}}
【場所】{{location}}
【住所】{{address}}
【インタビュー対象】{{interviewTarget}}
【備考】{{notes}}

━━━━━━━━━━━━━━━━━━━━
📁 撮影データの保存先
━━━━━━━━━━━━━━━━━━━━
撮影後、以下のフォルダに素材をアップロードしてください。
{{folderUrl}}

確認したらリアクションお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}
```

**議事録共有:**
```
@ALL {{shootingMention}}
{{company}}様 初回打ち合わせの議事録を共有します。

{{minutes}}

ご確認お願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}
```

### inputFieldsの定義（contactFormats.js内）

**受注報告:**
- mention (宛先) defaultValue: "@河合 @中尾文香 cc:@青柳"
- company (企業名)

**日程確定報告:**
- mention (宛先) defaultValue: "@河合 cc:@青柳"
- company (企業名)
- datetime (日時)
- meetUrl (Meet URL)

**撮影日程確認:**
- mention (宛先) defaultValue: "@川崎"
- company (企業名)
- mtgDate (初回打ち合わせ日)
- hearingSheetUrl (ヒアリングシートURL)
- folderUrl (撮影素材フォルダURL)

**参加者リマインド:**
- mention (宛先) defaultValue: "@渡邉 cc:@青柳"
- company (企業名)
- datetime (日時)
- meetUrl (Meet URL)
- hearingSheetUrl (ヒアリングシートURL)
- folderUrl (撮影素材フォルダURL)

**撮影指示連絡:**
- mention (宛先) defaultValue: "@川崎"
- cc (CC) defaultValue: "@青柳"
- company (企業名)
- shootingDate (撮影日)
- location (場所)
- address (住所)
- interviewTarget (インタビュー対象)
- notes (備考)
- hearingSheetUrl (ヒアリングシートURL)
- folderUrl (撮影素材フォルダURL)

**議事録共有:**
- company (企業名)
- shootingMention (撮影担当メンション) defaultValue: "@川崎"
- minutes (議事録) type: textarea
- hearingSheetUrl (ヒアリングシートURL)
- folderUrl (撮影素材フォルダURL)

---

## 3. settingsSheet.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/settingsSheet.js`

### 定義されている定数

```javascript
const EXCLUDED_SHEETS = [
  '設定',
  'プロンプト',
  'フォームの回答',
  'フォームの回答 1',
  'フォームの回答1',
  '原本',
  'template',
  'テンプレート'
];
```

```javascript
const PART3_MAPPING = {
  'ヒアリングシートURL': { row: 134, col: 3 },
  '撮影素材フォルダURL': { row: 135, col: 3 },
  'メインフォルダURL': { row: 136, col: 3 },
  '文字起こし原文': { row: 137, col: 3 },
  '構成案_原稿用': { row: 138, col: 3 },
  '構成案_動画用': { row: 139, col: 3 },
};
```

### 定義されている関数

- `addSettingsMenu(ui)` - メニュー追加
- `showSettingsSheet()` - 設定シート表示
- `createSettingsSheet()` - 設定シート作成
- `getSettingsFromSheet()` - 設定シートから値取得
- `getMemberList()` - メンバー一覧取得
- `replacePlaceholders(template, settings)` - プレースホルダー置換
- `isExcludedSheet(sheetName)` - 除外シート判定
- `loadPart3Data(sheetName, key)` - Part③データ読み込み
- `savePart3Data(sheetName, key, value, checkExisting)` - Part③データ保存
- `savePart3DataForce(sheetName, key, value)` - Part③データ強制保存
- `getSubfoldersFromSettings()` - サブフォルダ設定取得

### getSettingsFromSheet関数の内容
```javascript
function getSettingsFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');

  if (!sheet) {
    return { error: '設定シートがありません' };
  }

  const settings = {};
  const data = sheet.getDataRange().getValues();

  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key) {
      settings[key] = value || '';
    }
  }

  return settings;
}
```

### getMemberList関数の内容
```javascript
function getMemberList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const members = [];

  let inMemberSection = false;
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0] || '').trim();
    const value = String(data[i][1] || '').trim();

    if (key === 'メンバー一覧' || key === 'メンバー') {
      inMemberSection = true;
      continue;
    }

    if (inMemberSection) {
      if (key === '' && value === '') {
        break;  // 空行で終了
      }
      if (key) {
        members.push(key);
      }
    }
  }

  return members;
}
```

---

## 4. hearingSheetManager.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/hearingSheetManager.js`

### 定義されている定数

```javascript
const FORM_TO_SHEET_MAPPING = {
  '企業名・屋号': { row: 5, col: 3 },
  '代表者名': { row: 6, col: 3 },
  'HP URL': { row: 7, col: 3 },
  '住所': { row: 8, col: 3 },
  '電話番号': { row: 9, col: 3 },
  'メールアドレス': { row: 10, col: 3 },
  '許可番号': { row: 11, col: 3 },
  '設立日': { row: 12, col: 3 },
  '担当者名': { row: 13, col: 3 },
  '事業内容': { row: 14, col: 3 },
  // ... 以下省略（約80項目）
};
```

### 定義されている関数

- `onOpen()` - メニュー追加
- `createNewHearingSheet()` - 新規ヒアリングシート作成
- `copyFromFormResponse()` - フォーム回答からコピー
- `showTemplateSheet()` - 原本シート表示
- `setupTemplate()` - テンプレート構造設定

---

## 5. transcriptToHearingSheet.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/transcriptToHearingSheet.js`

### 定義されている定数

```javascript
const TRANSCRIPT_TO_SHEET_MAPPING = {
  '私たちについて': { row: 83, col: 3 },
  '社長挨拶': { row: 86, col: 3 },
  '会社の魅力': { row: 89, col: 3 },
  '雰囲気': { row: 92, col: 3 },
  '社員1_氏名': { row: 98, col: 3 },
  '社員1_部署': { row: 98, col: 4 },
  '社員1_年数': { row: 98, col: 5 },
  '社員1_インタビュー': { row: 98, col: 6 },
  '社員2_氏名': { row: 99, col: 3 },
  '社員2_部署': { row: 99, col: 4 },
  '社員2_年数': { row: 99, col: 5 },
  '社員2_インタビュー': { row: 99, col: 6 },
  '社員3_氏名': { row: 100, col: 3 },
  '社員3_部署': { row: 100, col: 4 },
  '社員3_年数': { row: 100, col: 5 },
  '社員3_インタビュー': { row: 100, col: 6 },
  '社員4_氏名': { row: 101, col: 3 },
  '社員4_部署': { row: 101, col: 4 },
  '社員4_年数': { row: 101, col: 5 },
  '社員4_インタビュー': { row: 101, col: 6 },
  '最も打ち出したいポイント': { row: 111, col: 1 },
  '募集背景': { row: 117, col: 3 },
  'ペルソナ_性別': { row: 119, col: 3 },
  'ペルソナ_年齢': { row: 119, col: 5 },
  'ペルソナ_外国人': { row: 119, col: 7 },
  '求める人材像': { row: 120, col: 3 },
  'スカウト_年齢': { row: 129, col: 3 },
  'スカウト_エリア': { row: 130, col: 3 },
  'スカウト_キーワード': { row: 131, col: 3 },
  'スカウト_備考': { row: 132, col: 3 },
};
```

### 定義されている関数

- `addTranscriptMenu()` - メニュー追加
- `showTranscriptPromptDialog()` - 文字起こしプロンプトダイアログ表示
- `getTranscriptPromptFromSheet()` - プロンプトシートからテンプレート取得
- `getCompanySheetListWithNamesAndData()` - 企業シート一覧取得（保存済みデータ含む）
- `showTransferFromAIDialog()` - AI出力転記ダイアログ表示
- `compareWithSelectedSheet(jsonData, targetSheetName)` - シートと比較
- `flattenJsonData(data)` - JSONをフラット化
- `executeTranscriptTransfer(selectedItems, targetSheetName)` - 転記実行
- `checkCompanyNameMatch(name1, name2)` - 企業名一致チェック

---

## 6. compositionDraftGenerator.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/compositionDraftGenerator.js`

### 定義されている定数

```javascript
const PART1_MAPPING = {
  '企業名': { row: 5, col: 3 },
  '代表者名': { row: 6, col: 3 },
  'HP_URL': { row: 7, col: 3 },
  '住所': { row: 8, col: 3 },
  '電話番号': { row: 9, col: 3 },
  // ... 約70項目
};

const PART2_MAPPING = {
  '私たちについて': { row: 83, col: 3 },
  '社長挨拶': { row: 86, col: 3 },
  '会社の魅力': { row: 89, col: 3 },
  '雰囲気': { row: 92, col: 3 },
  // ... 約25項目
};
```

### 定義されている関数

- `addCompositionMenu(ui)` - メニュー追加
- `showCompositionPromptDialog()` - 構成案プロンプトダイアログ表示
- `getCompositionPromptFromSheet()` - プロンプトシートからテンプレート取得
- `getHearingSheetData(sheet)` - ヒアリングシートからデータ取得
- `getCompanySheetListForComposition()` - 企業シート一覧取得
- `getHearingDataForComposition(sheetName)` - ダイアログから呼び出し用
- `showPairsonaConvertDialog()` - ペアソナ変換ダイアログ
- `showWorksReportConvertDialog()` - ワークス報告変換ダイアログ
- `showShootingInstructionConvertDialog()` - 撮影指示書変換ダイアログ
- `showConvertDialog(promptName, title, description)` - 汎用変換ダイアログ
- `getConvertPromptFromSheet(promptName)` - 変換プロンプト取得

---

## 7. createShootingFolder.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/createShootingFolder.js`

### 定義されている定数

```javascript
const PARENT_FOLDER_ID = 'YOUR_PARENT_FOLDER_ID_HERE';

const SUBFOLDERS = [
  '01_撮影素材',
  '02_編集データ',
  '03_完成動画'
];
```

### 定義されている関数

- `addShootingFolderMenu(ui)` - メニュー追加
- `createShootingFolder()` - 撮影フォルダ作成（手入力）
- `createFolderStructure(companyName, parentFolderId)` - フォルダ構成作成
- `createFolder(folderName, parentId)` - フォルダ作成ヘルパー
- `showSuccessDialog(companyName, result)` - 成功ダイアログ表示
- `setParentFolder()` - 親フォルダ設定
- `getParentFolderId()` - 親フォルダID取得
- `addToHistory(companyName, url, shootingFolderUrl)` - 履歴追加
- `showRecentFolders()` - 最近のフォルダ一覧表示
- `deleteHistoryItem(index)` - 履歴削除
- `createShootingFolderFromSheet()` - 企業シートからフォルダ作成
- `getCompanySheetListForFolder()` - 企業シート一覧取得（フォルダ作成用）
- `executeCreateFolderFromSheet(sheetName, companyName)` - フォルダ作成実行
- `showSuccessDialogFromResult(result)` - 結果から成功ダイアログ表示

---

## 8. promptDialog.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/promptDialog.js`

### 定義されている関数

- `createPromptMenu(ui)` - プロンプトメニュー作成
- `getPromptList()` - プロンプト一覧取得
- `getPromptByIndex(index)` - インデックスでプロンプト取得
- `openPromptDialogByIndex(index)` - ダイアログを開く
- `showPromptDialog(prompt)` - プロンプトダイアログ表示
- `getPromptDialogHtml(prompt)` - ダイアログHTML生成
- `createPromptSheet()` - プロンプトシート作成
- `addSamplePrompts()` - サンプルプロンプト追加
- `showPromptUsage()` - 使い方表示

### プロンプトシートの構造
- A列: プロンプト名（メニューに表示）
- B列: 説明（ダイアログのサブタイトル）
- C列: 入力欄のラベル
- D列: 入力欄のプレースホルダー
- E列: テンプレート（{{input}}が入力値に置換される）

---

## 9. sheetStructureChecker.js

### ファイルの場所
`/mnt/c/work-manual/docs/gas/tsunageru/sheetStructureChecker.js`

### 定義されている関数

- `onOpen()` - メニュー追加
- `checkFormResponseStructure()` - フォーム回答シート構造確認
- `checkHearingSheetStructure()` - ヒアリングシート構造確認
- `generateMappingDefinition()` - マッピング定義生成
- `checkPart2Structure()` - Part②詳細構造確認
- `checkTranscriptTransferResult()` - 転記テスト結果確認
- `addStructureCheckMenuToExisting(ui)` - 既存メニューに追加
- `showOutputDialog(content, title)` - 出力ダイアログ表示

---

## ヒアリングシートのセル位置まとめ

### Part① 基本情報（フォーム入力部分）
| 項目 | 行 | 列 |
|------|----|----|
| 企業名 | 5 | C(3) |
| 代表者名 | 6 | C(3) |
| HP URL | 7 | C(3) |
| 住所 | 8 | C(3) |
| 電話番号 | 9 | C(3) |
| メールアドレス | 10 | C(3) |
| 許可番号 | 11 | C(3) |
| 設立日 | 12 | C(3) |
| 担当者名 | 13 | C(3) |
| 事業内容 | 14 | C(3) |

### Part② ヒアリング情報
| 項目 | 行 | 列 |
|------|----|----|
| 私たちについて | 83 | C(3) |
| 社長挨拶 | 86 | C(3) |
| 会社の魅力 | 89 | C(3) |
| 雰囲気 | 92 | C(3) |
| 社員1_氏名 | 98 | C(3) |
| 社員1_部署 | 98 | D(4) |
| 社員1_年数 | 98 | E(5) |
| 社員1_インタビュー | 98 | F(6) |
| 募集背景 | 117 | C(3) |
| ペルソナ_性別 | 119 | C(3) |
| ペルソナ_年齢 | 119 | E(5) |
| 求める人材像 | 120 | C(3) |

### Part③ 処理データ
| 項目 | 行 | 列 |
|------|----|----|
| ヒアリングシートURL | 134 | C(3) |
| 撮影素材フォルダURL | 135 | C(3) |
| メインフォルダURL | 136 | C(3) |
| 文字起こし原文 | 137 | C(3) |
| 構成案_原稿用 | 138 | C(3) |
| 構成案_動画用 | 139 | C(3) |

---

## tsunageru.tsのpopupとcontactFormats.jsの比較

### 受注報告
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| mention defaultValue | @河合 @中尾文香 cc:@青柳 | @河合 @中尾文香 cc:@青柳 |
| template | 一致 | 一致 |

### 日程確定報告
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| mention defaultValue | @河合 cc:@青柳 | @河合 cc:@青柳 |
| template | 一致 | 一致 |

### 撮影日程確認
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| mention defaultValue | @川崎 | @川崎 |
| inputFields | 5項目 | 5項目 |
| template | 一致 | 一致 |

### 参加者リマインド
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| mention defaultValue | @渡邉 cc:@青柳 | @渡邉 cc:@青柳 |
| inputFields | 6項目 | 6項目 |
| template | 一致 | 一致 |

### 撮影指示連絡
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| mention defaultValue | @川崎 | @川崎 |
| cc defaultValue | @青柳 | @青柳 |
| inputFields | 10項目 | 10項目 |
| template | 一致 | 一致 |

### 議事録共有
| 項目 | tsunageru.ts | contactFormats.js |
|------|--------------|-------------------|
| shootingMention defaultValue | @川崎 | @川崎 |
| inputFields | 5項目 | 5項目 |
| template | 一致 | 一致 |

---

## contactFormats.jsの自動入力の現状

### getSheetDataForContact関数で取得している項目
- companyName (行5, C列)
- hearingSheetUrl (Part③から)
- folderUrl (Part③から)

### 取得していない項目
- 住所 (行8, C列)
- 電話番号 (行9, C列)
- 担当者名 (行13, C列)
- 撮影日程（Part②の情報）
- 撮影場所（Part②の情報）
- インタビュー対象（Part②の情報）

---

## GASメニューの構成

```
1. １.📊 ヒアリングシート管理 (hearingSheetManager.js)
2. ２.📁 撮影フォルダ (createShootingFolder.js)
3. ３.📝 議事録作成・報告プロンプト (promptDialog.js)
4. ４.📝 文字起こし整理・転記 (transcriptToHearingSheet.js)
5. ５.📝 構成案生成 (compositionDraftGenerator.js)
6. ６.📨 連絡フォーマット (contactFormats.js)
7. 🔧 構造確認 (sheetStructureChecker.js)
```
