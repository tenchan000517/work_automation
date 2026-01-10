/**
 * 初期セットアップGAS
 *
 * 【機能】
 * 1. プロンプトシートの作成・プロンプト追加
 * 2. 設定シートの作成・担当者設定
 *
 * 【使用方法】
 * 1. このコードをGASエディタにコピー
 * 2. onOpen()に addSetupMenu(ui); を追加
 * 3. メニューからセットアップを実行
 */


// ================================================================================
// ===== メニュー =====
// ================================================================================

/**
 * onOpenから呼び出す場合
 */
function addSetupMenu(ui) {
  ui.createMenu('0. 初期設定')
    .addItem('プロンプトシートを作成', 'setupPromptSheet')
    .addItem('設定シートを作成', 'showSettingsDialog')
    .addSeparator()
    .addItem('設定シートを編集', 'showSettingsDialog')
    .addToUi();
}

/**
 * 単独で実行する場合（直接実行用）
 */
function addSetupMenuStandalone() {
  const ui = SpreadsheetApp.getUi();
  addSetupMenu(ui);
}


// ================================================================================
// ===== プロンプトシート作成 =====
// ================================================================================

function setupPromptSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('プロンプト');

  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet('プロンプト');
  }

  // ヘッダー
  const headers = ['名前', '説明', '入力欄ラベル', 'プレースホルダー', 'テンプレート'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f3f3');

  // プロンプト定義
  const prompts = [
    getPromptPairsonaEngage(),
    getPromptWorksReport(),
    getPromptShootingInstruction(),
    getPromptCompositionDraft(),
    getPromptHearingExtract()
  ];

  // 既存データを確認して追加
  const existingData = sheet.getDataRange().getValues();
  const existingNames = existingData.slice(1).map(row => row[0]);

  let addedCount = 0;
  let skippedCount = 0;

  for (const prompt of prompts) {
    if (existingNames.includes(prompt.name)) {
      skippedCount++;
      continue;
    }

    const lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1, 1, 5).setValues([[
      prompt.name,
      prompt.description,
      prompt.inputLabel,
      prompt.placeholder,
      prompt.template
    ]]);
    addedCount++;
  }

  // 列幅調整
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 400);

  SpreadsheetApp.getUi().alert('完了',
    'プロンプトシートをセットアップしました。\n\n' +
    '追加: ' + addedCount + '件\n' +
    'スキップ（既存）: ' + skippedCount + '件',
    SpreadsheetApp.getUi().ButtonSet.OK);
}


// ===== プロンプト定義 =====

function getPromptPairsonaEngage() {
  return {
    name: 'ペアソナ/エンゲージ変換',
    description: '構成案をコピペ用形式に変換',
    inputLabel: '構成案を貼り付け',
    placeholder: 'AIが出力した構成案をここに貼り付けてください',
    template: `あなたは求人原稿の入稿作業をサポートするアシスタントです。

【タスク】
以下の構成案を、ペアソナ・エンゲージの入力フォームにそのままコピペできる形式に変換してください。

【出力ルール】
1. 各項目を「===【項目名】===」で区切る
2. 余計な説明は省き、入力する内容のみ記載
3. 箇条書きは「・」で統一
4. 空欄の項目も出力する（後で埋める用）

【出力形式】

===【求人タイトル】===
（30〜40文字のキャッチコピー。構成案の案1を使用）

===【職務内容】===
（会社紹介 + 業務内容Step形式 + 会社のポイント×3 を結合）

===【募集職種】===
===【雇用形態】===
===【試用期間】===
===【想定年収】===
===【月給】===
===【勤務地（都道府県）】===
===【勤務地（市区町村以降）】===
===【募集背景】===
===【必須スキル】===
===【歓迎スキル】===
===【求める人物像】===
===【待遇・福利厚生】===
===【勤務時間】===
===【休憩時間】===
===【残業】===
===【休日区分】===
===【年間休日】===
===【休日休暇の詳細】===

===【選考フロー】===
Step1.
Step2.
Step3.

===【掲載画像（6枚）】===
【画像1サムネイル】内容：／キャプション：
【画像2】内容：／キャプション：
【画像3】内容：／キャプション：
【画像4】内容：／キャプション：
【画像5】内容：／キャプション：
【画像6】内容：／キャプション：

===【ペアソナ追加画像（3枚）】===
【画像7】内容：／キャプション：
【画像8】内容：／キャプション：
【画像9】内容：／キャプション：

【構成案】
{{input}}`
  };
}

function getPromptWorksReport() {
  return {
    name: 'ワークス報告変換',
    description: '構成案を報告サマリーに変換',
    inputLabel: '構成案を貼り付け',
    placeholder: 'AIが出力した構成案をここに貼り付けてください',
    template: `あなたは社内報告文を作成するアシスタントです。

【タスク】
以下の構成案を、LINEWORKSで共有するための報告サマリーに変換してください。

【出力ルール】
1. 冒頭に報告の要点（1〜2行）
2. 原稿チーム向け・動画チーム向けの情報を分けて記載
3. 次のアクションを明記
4. 全体で400文字以内に収める

【出力形式】

━━━━━━━━━━━━━━━━━━━━
構成案完成のご報告
━━━━━━━━━━━━━━━━━━━━

{{@原稿チーム}} {{@動画担当}} cc:{{@CC}}

【企業名】様の構成案が完成しました。

■ 概要
・募集職種：
・ターゲット：
・差別化ポイント：

■ 原稿チーム向け（{{原稿チーム}}）
・求人タイトル案：
・訴求ポイント：

■ 動画チーム向け（{{動画担当}}）
・インタビュー対象：
・撮影シーン：

■ 要確認事項
（不足情報があれば記載）

■ 次のアクション
・原稿チーム → 原稿執筆開始
・動画チーム → 撮影指示書を別途共有

━━━━━━━━━━━━━━━━━━━━

【構成案】
{{input}}`
  };
}

function getPromptShootingInstruction() {
  return {
    name: '撮影指示書変換',
    description: '構成案を撮影指示書に変換',
    inputLabel: '構成案を貼り付け',
    placeholder: 'AIが出力した構成案をここに貼り付けてください',
    template: `あなたは撮影ディレクターのアシスタントです。

【タスク】
以下の構成案から、撮影担当者が現地で迷わないための撮影指示書を作成してください。

【出力ルール】
1. 撮影当日に必要な情報のみ抽出
2. 具体的かつ簡潔に記載
3. チェックリスト形式で撮影漏れを防ぐ
4. 不明な情報は「※要確認」と明記

【出力形式】

================================================================================
撮影指示書
================================================================================

■ 基本情報
企業名：
撮影日：※要確認
集合時間：※要確認
住所：
担当者名：
連絡先：※要確認

■ 撮影の目的
訴求ポイント：
ターゲット層：

■ インタビュー対象者
【対象者1】氏名/役職：／撮影場所：
【対象者2】氏名/役職：／撮影場所：

■ 撮影シーン（チェックリスト）
□
□
□
□
□

■ 施設・設備の撮影
□
□
□

■ 撮影時の注意点
・
・

■ 持ち物
□ カメラ（バッテリー確認）
□ 三脚
□ マイク
□ SDカード
□ 名刺

■ 撮影後
1. 共有ドライブにアップロード
2. ワークスで報告
3. 編集担当（{{編集担当}}）へ引継ぎ

================================================================================

【構成案】
{{input}}`
  };
}

function getPromptCompositionDraft() {
  return {
    name: '構成案生成',
    description: 'ヒアリングシートから構成案を自動生成',
    inputLabel: 'ヒアリングシート情報（JSON）',
    placeholder: 'GASで取得した情報を貼り付け',
    template: `あなたは求人原稿のプロフェッショナルライターです。

【タスク】
以下のヒアリングシート情報から、求人原稿の構成案を作成してください。

【重要な方針】
求人原稿は「選別」ではなく「理解促進」のためのものです。
- 否定・線引き表現は使わない
- 不安を煽らず、不安を言語化して安心に変える
- 条件よりも「納得感」を先に提供する

【出力形式】

## 企業基本情報
- 企業名：
- 代表者：
- 所在地：
- 事業内容：

## 求人タイトル案（3案）
1.
2.
3.

## 会社紹介文
（私たちについて、社長挨拶などを元に200文字程度）

## 具体的な業務内容（Step形式）
Step1.
Step2.
Step3.
Step4.

## 会社のポイント（3つ）
1.
2.
3.

## 求人概要
- 募集職種：
- 雇用形態：
- 給与：
- 勤務地：
- 勤務時間：
- 休日：

## 応募要件
【必須】
【歓迎】
【求める人物像】

## 待遇・福利厚生

## ターゲット層
- 性別：
- 年齢：
- 特徴：

## 差別化ポイント

## 掲載画像の方向性

## 動画制作用情報
- 訴求ポイント：
- インタビュー対象者：
- 撮影シーン：

## 要確認事項
（不足している情報）

【ヒアリングシート情報】
{{input}}`
  };
}

function getPromptHearingExtract() {
  return {
    name: 'ヒアリング情報抽出',
    description: '文字起こしからPart②の情報を抽出',
    inputLabel: '文字起こしを貼り付け',
    placeholder: 'NOTTAからダウンロードしたテキストを貼り付け',
    template: `あなたは求人原稿作成のためのヒアリング情報を整理するアシスタントです。

【タスク】
以下の打ち合わせ文字起こしから、求人原稿作成に必要な情報を抽出・整理してください。

【背景】
この情報は求人サイト（ペアソナ、エンゲージ）に掲載する原稿作成に使用します。
求職者に「この会社で働きたい」と思ってもらえる内容を意識して整理してください。

【各項目の説明】

■ 会社紹介
- 私たちについて：会社の事業内容、歴史、規模、強みを求職者向けに説明
- 社長挨拶：経営者の想い、会社の方向性、求職者へのメッセージ
- 会社の魅力：他社と比較した際の差別化ポイント、働くメリット
- 雰囲気：職場の人間関係、コミュニケーション、社風

■ 社員の声（最大4名）
- 実際に働いている社員の生の声を記録
- 入社理由、やりがい、職場の良いところなど

■ 最も打ち出したいポイント
- クライアントが一番アピールしたいこと
- 求人原稿の軸となるメッセージ

■ 募集情報
- 募集背景：なぜ今採用が必要なのか（事業拡大、欠員補充など）
- ペルソナ：どんな人材を求めているか
- 求める人材像：スキル、経験、人柄など

■ スカウトメール設定
- スカウト送信時の検索条件

【出力形式】
\`\`\`json
{
  "企業名": "",
  "会社紹介": {
    "私たちについて": "",
    "社長挨拶": "",
    "会社の魅力": "",
    "雰囲気": ""
  },
  "社員の声": [
    {
      "氏名": "",
      "部署": "",
      "年数": "",
      "インタビュー": ""
    }
  ],
  "最も打ち出したいポイント": "",
  "募集情報": {
    "募集背景": "",
    "ペルソナ": {
      "性別": "",
      "年齢": "",
      "外国人": ""
    },
    "求める人材像": ""
  },
  "スカウトメール": {
    "年齢": "",
    "エリア": "",
    "検索キーワード": "",
    "備考": ""
  }
}
\`\`\`

【注意事項】
- 文字起こしに情報がない項目は空文字で出力
- 社員の声は情報がある人数分のみ出力
- 話者の言葉をできるだけ活かす（過度に要約しない）
- フィラー（えーと、あの等）は除去
- ペルソナの性別は「男」「女」「どちらでも」のいずれか
- ペルソナの外国人は「可」「不可」のいずれか

【文字起こし】
{{input}}`
  };
}


// ================================================================================
// ===== 設定シート（担当者設定） =====
// ================================================================================

/**
 * 設定シートから担当者情報を取得
 * ※他のGASから呼び出される共通関数
 */
function getSettingsFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');

  if (!sheet) {
    return {
      error: '「設定」シートがありません。\n\n' +
             'メニュー「0. 初期設定」→「設定シートを作成」を実行してください。'
    };
  }

  const data = sheet.getDataRange().getValues();
  const settings = {};

  // 1行目はヘッダーとしてスキップ
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const value = String(data[i][1]).trim();
    if (key && value) {
      settings[key] = value;
    }
  }

  return settings;
}


/**
 * プレースホルダーを担当者情報で置換
 * ※他のGASから呼び出される共通関数
 */
function replacePlaceholders(text, settings) {
  if (!text) return text;
  if (!settings) {
    settings = getSettingsFromSheet();
    if (settings.error) return text;
  }

  let result = text;

  // 単一担当者のプレースホルダー
  const singleKeys = ['原稿担当1', '原稿担当2', '動画担当', '撮影担当', '編集担当', 'CC'];
  for (const key of singleKeys) {
    const value = settings[key] || '';
    result = result.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), value);
    result = result.replace(new RegExp('\\{\\{@' + key + '\\}\\}', 'g'), value ? '@' + value : '');
  }

  // 原稿チーム（複数担当者）
  const genkoTeam = [settings['原稿担当1'], settings['原稿担当2']].filter(v => v).join('・');
  const genkoTeamMention = [settings['原稿担当1'], settings['原稿担当2']].filter(v => v).map(v => '@' + v).join(' ');
  result = result.replace(/\{\{原稿チーム\}\}/g, genkoTeam);
  result = result.replace(/\{\{@原稿チーム\}\}/g, genkoTeamMention);

  return result;
}


/**
 * 設定シート作成ダイアログを表示
 */
function showSettingsDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');

  // 既存の設定を取得
  let existingSettings = {};
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const key = String(data[i][0]).trim();
      const value = String(data[i][1]).trim();
      if (key) {
        existingSettings[key] = value;
      }
    }
  }

  const html = HtmlService.createHtmlOutput(createSettingsDialogHTML(existingSettings))
    .setWidth(500)
    .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, '担当者設定');
}


function createSettingsDialogHTML(existingSettings) {
  const settings = existingSettings || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; }
    h3 { margin: 0 0 15px 0; color: #1a73e8; }
    .description { color: #666; margin-bottom: 20px; font-size: 13px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
    .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    .form-group .hint { font-size: 11px; color: #888; margin-top: 3px; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { background: #f1f3f4; color: #333; }
    .btn-secondary:hover { background: #e0e0e0; }
    .status { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
    .status.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .status.error { display: block; background: #ffebee; color: #c62828; }
  </style>
</head>
<body>
  <h3>担当者設定</h3>
  <p class="description">各業務の担当者を設定します。プロンプト内の {{担当者名}} が自動で置換されます。</p>

  <div class="form-group">
    <label>原稿担当1（メイン）</label>
    <input type="text" id="genko1" value="${settings['原稿担当1'] || ''}" placeholder="例：河合">
  </div>

  <div class="form-group">
    <label>原稿担当2（サブ）</label>
    <input type="text" id="genko2" value="${settings['原稿担当2'] || ''}" placeholder="例：中尾文香">
  </div>

  <div class="form-group">
    <label>動画担当</label>
    <input type="text" id="douga" value="${settings['動画担当'] || ''}" placeholder="例：川崎">
  </div>

  <div class="form-group">
    <label>撮影担当</label>
    <input type="text" id="satsuei" value="${settings['撮影担当'] || ''}" placeholder="例：川崎">
  </div>

  <div class="form-group">
    <label>編集担当</label>
    <input type="text" id="henshu" value="${settings['編集担当'] || ''}" placeholder="例：河合">
  </div>

  <div class="form-group">
    <label>CC（報告時の宛先）</label>
    <input type="text" id="cc" value="${settings['CC'] || ''}" placeholder="例：青柳">
  </div>

  <div>
    <button class="btn btn-primary" onclick="saveSettings()">保存</button>
    <button class="btn btn-secondary" onclick="google.script.host.close()">キャンセル</button>
  </div>

  <div class="status" id="status"></div>

  <script>
    function saveSettings() {
      const settings = {
        '原稿担当1': document.getElementById('genko1').value.trim(),
        '原稿担当2': document.getElementById('genko2').value.trim(),
        '動画担当': document.getElementById('douga').value.trim(),
        '撮影担当': document.getElementById('satsuei').value.trim(),
        '編集担当': document.getElementById('henshu').value.trim(),
        'CC': document.getElementById('cc').value.trim()
      };

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showStatus('保存しました。', 'success');
            setTimeout(function() {
              google.script.host.close();
            }, 1000);
          } else {
            showStatus('エラー: ' + result.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showStatus('エラー: ' + error.message, 'error');
        })
        .saveSettingsToSheet(settings);
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


/**
 * 設定をシートに保存
 */
function saveSettingsToSheet(settings) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('設定');

    // シートがなければ作成
    if (!sheet) {
      sheet = ss.insertSheet('設定');
      sheet.getRange('A1:C1').setValues([['キー', '値', '説明']]);
      sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#f3f3f3');
      sheet.setColumnWidth(1, 120);
      sheet.setColumnWidth(2, 100);
      sheet.setColumnWidth(3, 200);
    }

    // 説明文
    const descriptions = {
      '原稿担当1': '原稿執筆メイン担当',
      '原稿担当2': '原稿執筆サブ担当',
      '動画担当': '撮影・企画担当',
      '撮影担当': '現地撮影担当',
      '編集担当': '動画編集担当',
      'CC': 'CC宛先'
    };

    // 既存データをクリア（ヘッダー以外）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    }

    // 新しいデータを書き込み
    const keys = ['原稿担当1', '原稿担当2', '動画担当', '撮影担当', '編集担当', 'CC'];
    const data = keys.map(key => [key, settings[key] || '', descriptions[key] || '']);

    sheet.getRange(2, 1, data.length, 3).setValues(data);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
