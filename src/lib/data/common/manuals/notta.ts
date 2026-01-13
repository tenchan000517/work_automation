// NOTTAの使い方マニュアル

/**
 * NOTTA起動マニュアル（Web会議の文字起こし）
 */
export const NOTTA_START_MANUAL = `━━━━━━━━━━━━━━━━━━━━
■ Step 1：NOTTAにログイン
━━━━━━━━━━━━━━━━━━━━

1. NOTTAのWebサイト（https://app.notta.ai/）にアクセス
2. ログイン
3. ホーム画面で「Web会議の文字起こし」をクリック

━━━━━━━━━━━━━━━━━━━━
■ Step 2：Web会議URLを取得
━━━━━━━━━━━━━━━━━━━━

1. Googleカレンダーを開く
2. 該当の予定をクリック
3. 「Google Meetに参加する」の横にあるコピーアイコンをクリック
   → URLがクリップボードにコピーされる

━━━━━━━━━━━━━━━━━━━━
■ Step 3：NOTTAにURL入力
━━━━━━━━━━━━━━━━━━━━

1. NOTTAの「Web会議を自動文字起こしする」ダイアログが開く
2. 言語設定を確認（1カ国語 / 日本語）
3. 「Web会議の招待URL」欄にURLを貼り付け
   → 「ビデオ通話のリンク: https://meet.google.com/...」と表示されればOK
4. 「文字起こしする」ボタンをクリック

━━━━━━━━━━━━━━━━━━━━
■ Step 4：Google Meetで承認
━━━━━━━━━━━━━━━━━━━━

1. Google Meetに入室
2. 画面右上に「1人のゲストの参加を許可」が表示される
3. クリックすると「参加承認の待機中」が表示
4. 「Notta Bot」の「承認」をクリック
   → Notta Botが会議に参加`;

/**
 * NOTTA起動画像
 */
export const NOTTA_START_IMAGES = [
  { url: "/images/notta-step1-home.png", caption: "STEP 1: NOTTAホームで「Web会議」をクリック" },
  { url: "/images/notta-step2-dialog.png", caption: "STEP 2: 「今すぐ文字起こし」を選択" },
  { url: "/images/notta-step3-calendar-copy.png", caption: "STEP 3: カレンダーからMeet URLをコピー" },
  { url: "/images/notta-step4-url-paste.png", caption: "STEP 4: NOTTAにURLを貼り付け" },
  { url: "/images/notta-step8-approve.png", caption: "STEP 5: MeetでNotta Botの参加を承認" },
  { url: "/images/notta-step5-bot-joined.png", caption: "STEP 6: Notta Bot参加後のMeet画面" }
];

/**
 * NOTTA終了・ダウンロードマニュアル
 */
export const NOTTA_END_MANUAL = `━━━━━━━━━━━━━━━━━━━━
■ 終了手順
━━━━━━━━━━━━━━━━━━━━

終了時はMeetを終了すれば自動的にNOTTAも停止します。

1. Google Meetの赤いボタンをクリック
2. 「通話を終了して全員を退出させる」を選択
3. NOTTAは自動的に録音停止

━━━━━━━━━━━━━━━━━━━━
■ AI文字起こし改善を待つ
━━━━━━━━━━━━━━━━━━━━

1. 録音終了後「AIが文字起こしを改善しています...（約1分）」と表示
2. 完了を待つ

━━━━━━━━━━━━━━━━━━━━
■ データのダウンロード
━━━━━━━━━━━━━━━━━━━━

mp3とテキスト両方ダウンロードしておくと安心です。

1. NOTTAの録音詳細ページを開く
2. 画面上部のダウンロードアイコンをクリック
3. 「MP3」と「テキスト」を選択してダウンロード

━━━━━━━━━━━━━━━━━━━━
■ トラブル対応
━━━━━━━━━━━━━━━━━━━━

・録音が途中で止まっていた場合 → ヒアリングシートのメモで補完
・文字起こしが不正確な部分 → 手動で修正`;

/**
 * NOTTA終了画像
 */
export const NOTTA_END_IMAGES = [
  { url: "/images/notta-step11-end-meeting.png", caption: "STEP 1: ミーティング終了" },
  { url: "/images/notta-step12-ai-processing.png", caption: "STEP 2: AI文字起こし処理中" },
  { url: "/images/notta-step13-download.png", caption: "STEP 3: テキストでダウンロード" }
];

/**
 * 画面レイアウトの推奨
 */
export const NOTTA_LAYOUT_TIP = `━━━━━━━━━━━━━━━━━━━━
■ 画面レイアウト（推奨）
━━━━━━━━━━━━━━━━━━━━

画面は狭くなりますが3分割しておくと見やすいです（推奨・任意）
ヒアリングシート・Google Meet・NOTTAを並べて配置

※デュアルディスプレイの場合：
  カメラのある場所の下にMeet画面を配置し、
  なるべくカメラ目線になるようにしてください。`;

/**
 * レイアウト画像
 */
export const NOTTA_LAYOUT_IMAGE = { url: "/images/notta-step10-3split.jpg", caption: "【参考】3分割レイアウト例" };

/**
 * NOTTA準備確認（打ち合わせ前）
 */
export const NOTTA_PREP_CHECK = `━━━━━━━━━━━━━━━━━━━━
■ 確認すること
━━━━━━━━━━━━━━━━━━━━

・NOTTAにログインできるか
・「Web会議の文字起こし」の操作方法
・録音開始・停止の方法

━━━━━━━━━━━━━━━━━━━━
■ リハーサル（任意）
━━━━━━━━━━━━━━━━━━━━

初めての方は、テスト用のMeetを立ち上げて
NOTTAの録音開始〜停止を試しておくと安心です。`;

/**
 * NOTTA準備確認画像
 */
export const NOTTA_PREP_IMAGES = [
  { url: "/images/notta-home.png", caption: "NOTTA ホーム画面" },
  { url: "/images/notta-webmeeting.png", caption: "Web会議の文字起こし設定" }
];
