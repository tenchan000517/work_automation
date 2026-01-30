/**
 * HP制作ヒアリングフォーム セットアップ・管理
 *
 * 【使い方】
 * 1. このスクリプトを既存GoogleフォームのApps Scriptに貼り付け
 * 2. メニューから「⚙️ セットアップ > 質問項目をセットアップ」を実行
 * 3. HANDOFFの設計に基づいた質問項目が追加される
 *
 * 【機能】
 * - 既存フォームへの質問項目セットアップ
 * - フォーム情報のエクスポート（ID、URL、各質問のID等）
 * - 条件分岐の設定（サーバー管理の希望に応じた質問表示）
 *
 * 【ページ構成】
 * ページ1: 担当者情報 + 企業情報
 * ページ2: HPについてのご要望
 * ページ3: サーバー・ドメインについて（分岐の起点）
 * ページ4: サーバー情報（共通）
 * ページ5a: サーバー情報（詳細）→ A/B/D向け
 * ページ5b: サーバー情報（自社管理）→ C向け
 * ページ6: メール関連 → A/D向け
 * 完了ページ
 *
 * 【条件分岐】
 * A. Singに移管 → 共通 → 詳細 → メール関連 → 完了
 * B. メール残す → 共通 → 詳細 → 完了
 * C. 自社管理   → 共通 → C用 → 完了
 * D. 検討中     → 共通 → 詳細 → メール関連 → 完了
 */

// ===========================================
// メニュー追加（フォーム編集画面用）
// ===========================================

function onOpen() {
  FormApp.getUi()
    .createMenu('⚙️ セットアップ')
    .addItem('📝 質問項目をセットアップ', 'setupFormQuestions')
    .addItem('🗑️ 全質問をクリア', 'clearAllQuestions')
    .addSeparator()
    .addItem('📋 フォーム情報をログ出力', 'logFormInfo')
    .addItem('🔗 フォームURLを表示', 'showFormUrl')
    .addToUi();
}

// ===========================================
// 設定
// ===========================================

const HP_FORM_CONFIG = {
  title: 'HP制作ヒアリングシート',
  description: `HP制作にあたり、事前にいくつかの項目をお伺いします。
ご記入いただいた内容をもとに、打ち合わせを進めさせていただきます。

所要時間: 約10〜15分`,
};

// ===========================================
// フォームセットアップメイン
// ===========================================

/**
 * 既存フォームに質問項目をセットアップ
 */
function setupFormQuestions() {
  const ui = FormApp.getUi();

  // 確認ダイアログ
  const response = ui.alert(
    '質問項目セットアップ',
    'このフォームに質問項目を追加しますか？\n\n※既存の質問がある場合は先にクリアすることをお勧めします',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    // 既存フォームを取得
    const form = FormApp.getActiveForm();

    // タイトル・説明を設定
    form.setTitle(HP_FORM_CONFIG.title);
    form.setDescription(HP_FORM_CONFIG.description);
    form.setCollectEmail(false);
    form.setAllowResponseEdits(false);
    form.setLimitOneResponsePerUser(false);

    // ページ1: 担当者情報 + 企業情報
    createPage1_BasicInfo(form);

    // ページ2: HPについてのご要望
    const page2 = form.addPageBreakItem()
      .setTitle('HPについてのご要望');
    createPage2_Requirements(form);

    // ページ3: サーバー・ドメインについて（分岐の起点）
    const page3 = form.addPageBreakItem()
      .setTitle('サーバー・ドメインについて');
    const serverChoiceItem = createPage3_ServerChoice(form);

    // ページ4: サーバー情報（共通）
    const page4_common = form.addPageBreakItem()
      .setTitle('サーバー情報の確認');
    createPage4_ServerCommon(form);

    // ページ5a: サーバー情報（詳細）- A/B/D向け
    const page5a_detail = form.addPageBreakItem()
      .setTitle('サーバー情報の確認（詳細）')
      .setHelpText('サーバー移管に必要な情報の把握状況を確認させてください。');
    createPage5a_ServerDetail(form);

    // ページ5b: サーバー情報（自社管理）- C向け
    const page5b_self = form.addPageBreakItem()
      .setTitle('納品方法の確認')
      .setHelpText('納品方法の確認のため、いくつかお伺いします。');
    createPage5b_ServerSelf(form);

    // ページ6: メール関連 - A/D向け
    const page6_mail = form.addPageBreakItem()
      .setTitle('メールについて')
      .setHelpText('メールの移行に関する情報を確認させてください。');
    createPage6_Mail(form);

    // 完了ページ
    const pageEnd = form.addPageBreakItem()
      .setTitle('ご回答ありがとうございました')
      .setHelpText('以上で質問は終了です。\n\n入力内容を確認のうえ「送信」ボタンを押してください。');

    // ===========================================
    // 条件分岐の設定
    // ===========================================

    // サーバー管理の希望の選択肢を設定（分岐付き）
    // A → 共通 → 詳細 → メール → 完了
    // B → 共通 → 詳細 → 完了（メールスキップ）
    // C → 共通 → C用 → 完了
    // D → 共通 → 詳細 → メール → 完了
    serverChoiceItem.setChoices([
      serverChoiceItem.createChoice('A. Singに移管する（ドメイン・サーバーをSingで管理）', page4_common),
      serverChoiceItem.createChoice('B. メール契約だけ現行のまま残す（サーバーは移管、メールは今のまま）', page4_common),
      serverChoiceItem.createChoice('C. 自社で管理する（納品物をお渡しし、御社でアップロード）', page4_common),
      serverChoiceItem.createChoice('D. 検討中（打ち合わせで相談したい）', page4_common)
    ]);

    // 共通ページからの遷移: 詳細ページへ（A/B/D）
    // ※Googleフォームの制約で、共通ページからの分岐は難しいため、
    // 全員が詳細ページを通過し、不要な質問は任意とする
    page4_common.setGoToPage(page5a_detail);

    // 詳細ページからの遷移: メールページへ
    page5a_detail.setGoToPage(page6_mail);

    // C用ページからの遷移: 完了へ
    page5b_self.setGoToPage(pageEnd);

    // メールページからの遷移: 完了へ
    page6_mail.setGoToPage(pageEnd);

    // 結果表示
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();

    ui.alert(
      '✅ セットアップ完了',
      `質問項目を追加しました。\n\n` +
      `【回答用URL】\n${formUrl}\n\n` +
      `【編集用URL】\n${editUrl}\n\n` +
      `フォームID: ${form.getId()}\n\n` +
      `※条件分岐はGoogleフォームの制約により完全には実装できません。\n` +
      `全質問を表示し、不要な質問は任意としています。`,
      ui.ButtonSet.OK
    );

    // フォーム情報をログ出力
    logFormInfo();

  } catch (error) {
    ui.alert('エラー', `セットアップ中にエラーが発生しました:\n${error.message}`, ui.ButtonSet.OK);
    console.error(error);
  }
}

/**
 * 全質問をクリア
 */
function clearAllQuestions() {
  const ui = FormApp.getUi();

  const response = ui.alert(
    '全質問クリア',
    '⚠️ このフォームの全ての質問を削除しますか？\n\nこの操作は取り消せません。',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const form = FormApp.getActiveForm();
    const items = form.getItems();

    // 逆順で削除（インデックスがずれないように）
    for (let i = items.length - 1; i >= 0; i--) {
      form.deleteItem(i);
    }

    ui.alert('完了', `${items.length}件の質問を削除しました。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('エラー', `クリア中にエラーが発生しました:\n${error.message}`, ui.ButtonSet.OK);
  }
}

// ===========================================
// ページ1: 担当者情報 + 企業情報
// ===========================================

function createPage1_BasicInfo(form) {
  // ----------------------------------------
  // 担当者情報
  // ----------------------------------------
  form.addSectionHeaderItem()
    .setTitle('ご担当者様について')
    .setHelpText('ご連絡先をご入力ください。');

  form.addTextItem()
    .setTitle('企業名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('担当者名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('役職')
    .setRequired(false);

  form.addTextItem()
    .setTitle('電話番号（担当者様）')
    .setHelpText('ご連絡可能な電話番号をご入力ください。')
    .setRequired(true);

  form.addTextItem()
    .setTitle('メールアドレス（担当者様）')
    .setHelpText('ご連絡可能なメールアドレスをご入力ください。')
    .setRequired(true);

  // ----------------------------------------
  // 企業情報（HP掲載用）
  // ----------------------------------------
  form.addSectionHeaderItem()
    .setTitle('会社情報（HPに掲載します）')
    .setHelpText('HPに掲載する企業情報をご入力ください。\n任意項目は打ち合わせ時に確認することも可能です。');

  form.addTextItem()
    .setTitle('会社正式名称')
    .setHelpText('HPに掲載する正式な会社名をご入力ください。\n例: 株式会社〇〇、〇〇株式会社')
    .setRequired(true);

  form.addTextItem()
    .setTitle('郵便番号')
    .setHelpText('例: 123-4567')
    .setRequired(true);

  form.addTextItem()
    .setTitle('住所')
    .setHelpText('HPに掲載する住所をご入力ください。')
    .setRequired(true);

  form.addTextItem()
    .setTitle('代表電話番号')
    .setHelpText('HPに掲載する電話番号をご入力ください。')
    .setRequired(true);

  form.addTextItem()
    .setTitle('お問い合わせメールアドレス')
    .setHelpText('HPのお問い合わせフォームからの送信先となるメールアドレスをご入力ください。\n例: info@example.co.jp')
    .setRequired(true);

  form.addTextItem()
    .setTitle('代表者名')
    .setHelpText('会社概要に掲載する代表者名（任意）')
    .setRequired(false);

  form.addTextItem()
    .setTitle('設立年')
    .setHelpText('例: 1990年、平成2年')
    .setRequired(false);

  form.addTextItem()
    .setTitle('資本金')
    .setHelpText('例: 1,000万円')
    .setRequired(false);

  form.addTextItem()
    .setTitle('従業員数')
    .setHelpText('例: 50名、約100名')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('事業内容')
    .setHelpText('会社概要に掲載する事業内容を簡潔にご入力ください（任意）')
    .setRequired(false);

  form.addTextItem()
    .setTitle('営業時間・定休日')
    .setHelpText('例: 9:00〜18:00 / 土日祝休み')
    .setRequired(false);
}

// ===========================================
// ページ2: HPについてのご要望
// ===========================================

function createPage2_Requirements(form) {
  // HPの主な目的
  form.addCheckboxItem()
    .setTitle('HPの主な目的')
    .setHelpText('該当するものをすべてお選びください。')
    .setChoiceValues([
      '問い合わせ・見積依頼の増加',
      '採用強化',
      'ブランディング・信頼性向上',
      '情報発信（お知らせ・ブログ）',
      'EC・オンライン販売',
      'その他'
    ])
    .setRequired(true);

  form.addTextItem()
    .setTitle('HPの目的「その他」の詳細')
    .setHelpText('上記で「その他」を選択された場合はご記入ください。')
    .setRequired(false);

  // メインターゲット
  form.addCheckboxItem()
    .setTitle('メインターゲット')
    .setHelpText('HPを見てほしい主な対象者をお選びください（複数選択可）。')
    .setChoiceValues([
      '法人顧客',
      '個人顧客',
      '既存顧客',
      '転職希望者（中途）',
      '大学新卒',
      '高校新卒',
      'その他'
    ])
    .setRequired(true);

  form.addTextItem()
    .setTitle('メインターゲット「その他」の詳細')
    .setHelpText('上記で「その他」を選択された場合はご記入ください。')
    .setRequired(false);

  // 競合・意識している会社
  form.addParagraphTextItem()
    .setTitle('競合・意識している会社')
    .setHelpText('同業他社や「このHPのようにしたい」と思う会社があれば教えてください。')
    .setRequired(false);

  // 自社の強み
  form.addCheckboxItem()
    .setTitle('自社の強み・アピールポイント')
    .setHelpText('お客様や取引先から評価されている点、他社と比べて自信のある点をお選びください。\nHPでアピールするコンテンツの参考にさせていただきます。')
    .setChoiceValues([
      '技術力・品質',
      '価格・コストパフォーマンス',
      '対応スピード',
      '実績・歴史',
      '人材・社風',
      '立地・アクセス',
      'その他'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('自社の強み・アピールポイントの詳細')
    .setHelpText('具体的な強みやエピソードがあれば教えてください。')
    .setRequired(false);

  // 参考にしたいHP
  form.addParagraphTextItem()
    .setTitle('参考にしたいHP')
    .setHelpText('「このサイトの雰囲気が好き」「このレイアウトが見やすい」など、\n参考にしたいサイトがあればURLを教えてください。\n\n同業他社でなくても構いません。\n良いと思うポイントも添えていただけると、より的確なご提案ができます。')
    .setRequired(false);

  // 現在のHP
  form.addTextItem()
    .setTitle('現在のHP URL')
    .setHelpText('リニューアルの場合は現在のHPのURLを入力してください。')
    .setRequired(false);

  form.addCheckboxItem()
    .setTitle('現在のHPで気になっている点')
    .setHelpText('該当するものをお選びください（複数選択可）。')
    .setChoiceValues([
      'デザインが古い',
      'スマホ対応していない',
      '情報が更新できていない',
      '問い合わせが少ない',
      '検索で上位に出ない',
      'その他'
    ])
    .setRequired(false);

  form.addTextItem()
    .setTitle('現在のHPで気になっている点「その他」の詳細')
    .setHelpText('上記で「その他」を選択された場合はご記入ください。')
    .setRequired(false);

  // 期待すること
  form.addParagraphTextItem()
    .setTitle('HP新規作成・リニューアルに期待すること')
    .setHelpText('HPに期待することや実現したいことを自由にお書きください。')
    .setRequired(false);

  // 必要なページ
  form.addCheckboxItem()
    .setTitle('必要なページ')
    .setHelpText('HPに掲載したいページをお選びください（複数選択可）。')
    .setChoiceValues([
      'トップページ',
      '会社概要・企業情報',
      'サービス・事業内容',
      '製品紹介',
      '採用情報',
      'お問い合わせ',
      'お知らせ・ニュース',
      'ブログ・コラム',
      'アクセス・店舗情報',
      'よくある質問（FAQ）',
      'その他'
    ])
    .setRequired(false);

  form.addTextItem()
    .setTitle('必要なページ「その他」の詳細')
    .setHelpText('上記で「その他」を選択された場合はご記入ください。')
    .setRequired(false);

  // 既存素材
  form.addCheckboxItem()
    .setTitle('既存素材の有無')
    .setHelpText('HPに使用できる素材をお持ちかどうかをお選びください。\n素材がない場合は撮影のご提案も可能です。')
    .setChoiceValues([
      'ロゴデータ',
      '会社・製品の写真',
      '動画素材',
      'パンフレット・カタログ',
      '素材はほぼない（撮影希望）'
    ])
    .setRequired(false);

  // SNS
  form.addParagraphTextItem()
    .setTitle('SNSアカウント')
    .setHelpText('連携・掲載したいSNSがあればURLを教えてください（Instagram、Facebook、X等）。')
    .setRequired(false);

  // 希望公開時期
  form.addMultipleChoiceItem()
    .setTitle('希望公開時期')
    .setChoiceValues([
      '1ヶ月以内',
      '3ヶ月以内',
      '半年以内',
      '特に決まっていない'
    ])
    .setRequired(false);
}

// ===========================================
// ページ3: サーバー・ドメインについて（分岐の起点）
// ===========================================

function createPage3_ServerChoice(form) {
  form.addSectionHeaderItem()
    .setTitle('サーバー・ドメインについて')
    .setHelpText(
      '【重要】このセクションは「把握状況の確認」です\n\n' +
      'ログイン情報やパスワードなどの入力は不要です。\n' +
      '「把握している」「把握していない」「わからない」のいずれかをお選びください。\n\n' +
      '把握していない項目があっても問題ありません。\n' +
      '打ち合わせ時に一緒に確認・整理していきます。'
    );

  // サーバー管理の希望（分岐の起点）
  const serverChoiceItem = form.addMultipleChoiceItem()
    .setTitle('サーバー管理の希望')
    .setHelpText(
      'HP公開後のサーバー管理について、ご希望をお選びください。\n\n' +
      'どの選択肢が最適かわからない場合は「D. 検討中」をお選びください。\n' +
      '打ち合わせ時にメリット・デメリットをご説明します。'
    )
    .setRequired(true);

  // 選択肢はメイン関数で設定（ページ参照が必要なため）
  return serverChoiceItem;
}

// ===========================================
// ページ4: サーバー情報（共通）
// ===========================================

function createPage4_ServerCommon(form) {
  form.addTextItem()
    .setTitle('現在のドメイン')
    .setHelpText(
      '現在お使いのHP、または取得済みのドメインを入力してください。\n' +
      '例: example.co.jp、example.com\n' +
      '「https://」は不要です。'
    )
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('プロバイダ（サーバー会社）')
    .setHelpText(
      'ドメインやサーバーを契約している会社です。\n' +
      '不明な場合は「不明・わからない」をお選びください。'
    )
    .setChoiceValues([
      'さくらインターネット',
      'Xserver（エックスサーバー）',
      'お名前.com',
      'ロリポップ',
      'AWS',
      'その他',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('同じドメインでメールを使用していますか？')
    .setHelpText(
      '例: info@example.co.jp のように、HPと同じドメインのメールアドレスを\n' +
      '業務で使用しているかどうかをお答えください。\n\n' +
      '※メール使用中の場合、サーバー移管時に注意が必要です'
    )
    .setChoiceValues([
      '使用している',
      '使用していない',
      '不明・わからない'
    ])
    .setRequired(false);
}

// ===========================================
// ページ5a: サーバー情報（詳細）- A/B/D向け
// ===========================================

function createPage5a_ServerDetail(form) {
  form.addMultipleChoiceItem()
    .setTitle('プロバイダ管理画面のログイン情報')
    .setHelpText(
      'さくら、Xserver、お名前.comなどの管理画面にログインできる状態かどうかをお答えください。\n\n' +
      '※ここでIDやパスワードを入力する必要はありません'
    )
    .setChoiceValues([
      '把握している（ログインできる）',
      '把握していない（ログインできない・情報がない）',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('ドメイン管理画面のログイン情報')
    .setHelpText(
      'ドメインの設定変更ができる管理画面にログインできる状態かどうかをお答えください。\n' +
      'プロバイダ管理画面と同じ場合もあります。\n\n' +
      '※ここでIDやパスワードを入力する必要はありません'
    )
    .setChoiceValues([
      '把握している（ログインできる）',
      '把握していない（ログインできない・情報がない）',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('AuthCode（認証コード）の取得方法')
    .setHelpText(
      'AuthCode（オースコード）は、ドメインを別の会社に移管する際に必要なコードです。\n' +
      '取得方法を知っているかどうかをお答えください。\n\n' +
      '※わからなくても問題ありません。打ち合わせ時にご説明します。'
    )
    .setChoiceValues([
      '把握している',
      '把握していない',
      'わからない（AuthCode自体を知らない）'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('DNS設定の確認方法')
    .setHelpText(
      'DNS設定とは、ドメインとサーバーを紐づける設定です。\n' +
      '現在の設定を確認できる状態かどうかをお答えください。\n\n' +
      '※わからなくても問題ありません。'
    )
    .setChoiceValues([
      '把握している（確認できる）',
      '把握していない',
      'わからない（DNS自体を知らない）'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('現在のサーバー管理者')
    .setHelpText('現在、サーバーやドメインの管理を誰が行っているかをお答えください。')
    .setChoiceValues([
      '自社（社内担当者が管理）',
      '外部委託（制作会社・IT業者等）',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('外部委託先への連絡')
    .setHelpText('外部に委託している場合、その委託先に連絡が取れる状態かどうかをお答えください。')
    .setChoiceValues([
      '連絡可能（連絡先を把握している）',
      '連絡先不明（連絡が取れない可能性がある）',
      '該当なし（外部委託していない）'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('サブドメインの使用')
    .setHelpText(
      'サブドメインとは「shop.example.co.jp」「recruit.example.co.jp」のように、\n' +
      'メインドメインの前に文字列がついたドメインです。\n\n' +
      '別サービスや別サイトで使用している場合はお知らせください。'
    )
    .setChoiceValues([
      '使用している',
      '使用していない',
      '不明・わからない'
    ])
    .setRequired(false);
}

// ===========================================
// ページ5b: サーバー情報（自社管理）- C向け
// ===========================================

function createPage5b_ServerSelf(form) {
  form.addSectionHeaderItem()
    .setTitle('納品についての確認')
    .setHelpText('自社でサーバー管理される場合の納品方法を確認させてください。');

  form.addMultipleChoiceItem()
    .setTitle('FTPサーバー情報')
    .setHelpText(
      'FTPとは、サーバーにファイルをアップロードするための接続方法です。\n' +
      'FTP接続に必要な情報（ホスト名、ユーザー名、パスワード）を把握しているかどうかをお答えください。\n\n' +
      '※ここで接続情報を入力する必要はありません'
    )
    .setChoiceValues([
      '把握している',
      '把握していない',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('現在のHPアップロード方法')
    .setHelpText('現在のHPをどのような方法で更新・アップロードしているかをお答えください。')
    .setChoiceValues([
      'FTP（FileZilla等のソフトを使用）',
      'CMS（WordPress等の管理画面から更新）',
      '外部に依頼している',
      '不明・わからない'
    ])
    .setRequired(false);
}

// ===========================================
// ページ6: メール関連 - A/D向け
// ===========================================

function createPage6_Mail(form) {
  form.addSectionHeaderItem()
    .setTitle('メール移行について')
    .setHelpText('メールの移行に関する情報を確認させてください。\n\n※「メールを使用していない」「B. メール契約だけ残す」を選択された方は回答不要です。');

  form.addMultipleChoiceItem()
    .setTitle('メールアカウント数')
    .setHelpText(
      '同じドメインで使用しているメールアドレスの数をお答えください。\n' +
      '例: info@、sales@、tanaka@ で3アカウント'
    )
    .setChoiceValues([
      '1〜5アカウント',
      '6〜10アカウント',
      '11アカウント以上',
      '不明・わからない'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('過去メールの保持希望')
    .setHelpText(
      'サーバー移管時に、過去の送受信メールを新しい環境に移行するかどうかをお答えください。\n\n' +
      '※移行には追加作業が必要になる場合があります'
    )
    .setChoiceValues([
      '保持したい（過去メールも移行希望）',
      '不要（新しいメールだけでOK）',
      '不明・わからない（相談したい）'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('メールサーバーのログイン情報')
    .setHelpText(
      'メールソフト（Outlook等）の設定に使用するサーバー情報を把握しているかどうかをお答えください。\n' +
      '（受信サーバー、送信サーバー、ポート番号など）\n\n' +
      '※ここでIDやパスワードを入力する必要はありません'
    )
    .setChoiceValues([
      '把握している',
      '把握していない',
      '不明・わからない'
    ])
    .setRequired(false);
}

// ===========================================
// フォーム情報エクスポート
// ===========================================

/**
 * フォーム情報をログに出力
 */
function logFormInfo() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();

  console.log('========================================');
  console.log('フォーム基本情報');
  console.log('========================================');
  console.log(`フォームID: ${form.getId()}`);
  console.log(`タイトル: ${form.getTitle()}`);
  console.log(`回答用URL: ${form.getPublishedUrl()}`);
  console.log(`編集用URL: ${form.getEditUrl()}`);
  console.log(`質問数: ${items.length}`);
  console.log('');
  console.log('========================================');
  console.log('質問項目一覧');
  console.log('========================================');

  items.forEach((item, index) => {
    const itemType = item.getType().toString();
    let choices = [];
    let required = false;

    // 選択肢を持つアイテムタイプの処理
    if (itemType === 'MULTIPLE_CHOICE') {
      const mcItem = item.asMultipleChoiceItem();
      choices = mcItem.getChoices().map(c => c.getValue());
      required = mcItem.isRequired();
    } else if (itemType === 'CHECKBOX') {
      const cbItem = item.asCheckboxItem();
      choices = cbItem.getChoices().map(c => c.getValue());
      required = cbItem.isRequired();
    } else if (itemType === 'TEXT') {
      required = item.asTextItem().isRequired();
    } else if (itemType === 'PARAGRAPH_TEXT') {
      required = item.asParagraphTextItem().isRequired();
    }

    console.log(`[${index + 1}] ${item.getTitle()}`);
    console.log(`    ID: ${item.getId()}`);
    console.log(`    タイプ: ${itemType}`);
    console.log(`    必須: ${required ? '○' : '-'}`);
    if (item.getHelpText()) {
      console.log(`    説明: ${item.getHelpText().substring(0, 50)}...`);
    }
    if (choices.length > 0) {
      console.log(`    選択肢: ${choices.join(' / ')}`);
    }
    console.log('');
  });

  console.log('========================================');
  console.log('JSON形式（カスタムフォーム用）');
  console.log('========================================');
  console.log(JSON.stringify(getFormStructureAsJson(), null, 2));
}

/**
 * フォームURLを表示
 */
function showFormUrl() {
  const ui = FormApp.getUi();
  const form = FormApp.getActiveForm();

  ui.alert(
    'フォームURL',
    `【回答用URL】\n${form.getPublishedUrl()}\n\n` +
    `【編集用URL】\n${form.getEditUrl()}\n\n` +
    `【フォームID】\n${form.getId()}`,
    ui.ButtonSet.OK
  );
}

// ===========================================
// ユーティリティ関数
// ===========================================

/**
 * フォーム情報をJSON形式で取得（カスタムフォーム用）
 * @returns {Object} フォーム構造情報
 */
function getFormStructureAsJson() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();

  const structure = {
    formId: form.getId(),
    title: form.getTitle(),
    description: form.getDescription(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    items: []
  };

  items.forEach(item => {
    const itemInfo = {
      id: item.getId(),
      type: item.getType().toString(),
      title: item.getTitle(),
      helpText: item.getHelpText(),
      required: false,
      choices: []
    };

    // タイプ別処理
    switch (item.getType()) {
      case FormApp.ItemType.MULTIPLE_CHOICE:
        const mcItem = item.asMultipleChoiceItem();
        itemInfo.required = mcItem.isRequired();
        itemInfo.choices = mcItem.getChoices().map(c => ({
          value: c.getValue(),
          isOther: c.isOther ? c.isOther() : false
        }));
        break;

      case FormApp.ItemType.CHECKBOX:
        const cbItem = item.asCheckboxItem();
        itemInfo.required = cbItem.isRequired();
        itemInfo.choices = cbItem.getChoices().map(c => ({
          value: c.getValue(),
          isOther: c.isOther ? c.isOther() : false
        }));
        break;

      case FormApp.ItemType.TEXT:
        itemInfo.required = item.asTextItem().isRequired();
        break;

      case FormApp.ItemType.PARAGRAPH_TEXT:
        itemInfo.required = item.asParagraphTextItem().isRequired();
        break;

      case FormApp.ItemType.PAGE_BREAK:
        itemInfo.pageBreak = true;
        break;

      case FormApp.ItemType.SECTION_HEADER:
        itemInfo.sectionHeader = true;
        break;
    }

    structure.items.push(itemInfo);
  });

  return structure;
}
