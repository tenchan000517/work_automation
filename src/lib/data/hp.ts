import type { Product } from "./index";
import { FB_REPORT_TEMPLATE } from "./common";

export const hp: Product = {
  id: "hp",
  name: "HP制作",
  taskCount: 8,
  description: "構成設計、デザイン、実装、更新",
  tasks: [
    {
      no: "0",
      category: "構成設計",
      name: "テンプレート選定",
      assignee: "河合",
      nextAssignee: "川崎",  // 次: No.18 素材撮影
      tools: "SANKOU",
      deliverable: "構成案",
      checkpoint: "導線",
      hasManual: true,
      issues: "ヒアリングシートの改善・ヒアリング精度向上・ヒアリング時に文章が載ってくる\n初回打ち合わせマニュアル",
      relatedLinks: [
        { label: "SANKOU", url: "https://sankoudesign.com/", type: "site" },
      ],
      simulation: `大輝ワークス立ち上げ　企業基本情報の共有フォーマット
受注者が初回打ち合わせ日程共有
ZOOM初回打ち合わせ企業：担当・渡邉・河合
HP制作ヒアリング：ヒアリングシートを基にヒアリングの実施
撮影日程の調整：川崎
議事録のワークスグループ共有
河合撮影データの共有フォルダ作成`,
      flowSteps: [
        { label: "ワークス立ち上げ・企業基本情報の共有フォーマット" },
        { label: "受注者が初回打ち合わせ日程共有" },
        { label: "ZOOM初回打ち合わせ：ヒアリングシートを基にヒアリングの実施" },
        { label: "撮影日程の調整" },
        { label: "議事録のワークスグループ共有" },
        { label: "撮影データの共有フォルダ作成" },
      ],
    },
    {
      no: "1",
      category: "素材撮影",
      name: "素材撮影",
      assignee: "川崎",
      nextAssignee: "河合",  // 次: No.14 デザイン作成
      tools: "カメラ",
      deliverable: "写真・動画素材",
      checkpoint: "画角・音声",
      hasManual: true,
      issues: "撮影マニュアル\nデータ共有マニュアル(ドライブの使い方＋テンプレ)",
      memo: `撮影マニュアル作り込み必要(撮り方・データ確認方法・データチェック)
データ共有マニュアルの作成(テンプレ)`,
      simulation: `撮影
撮影データチェック
撮影者が撮影データの納品：共有ドライブの指定フォルダ内に指定のファイル名で格納
河合がローカルフォルダにデータダウンロード`,
      flowSteps: [
        { label: "撮影" },
        { label: "撮影データチェック" },
        { label: "撮影データの納品：共有ドライブの指定フォルダ内に指定のファイル名で格納" },
        { label: "河合がローカルフォルダにデータダウンロード" },
      ],
    },
    {
      no: "2",
      category: "デザイン",
      name: "デザイン作成",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.15 コーディング
      tools: "Canva",
      deliverable: "デザイン",
      checkpoint: "UI",
      hasManual: true,
      issues: "Canvaフォルダ制作マニュアル　HP制作テンプレ・HP制作マニュアル・HP制作チェックリスト・データ格納先ドライブフォルダマニュアル",
      simulation: `Canvaに企業名フォルダを作成しページごとにファイル作成する
HP制作テンプレートを基に画像、文章をはめ込む
作成したHPデザインをチェックリストを用いてチェックする
各セクションごとにデータをダウンロードし指定したグーグルドライブにセクションごとのファイル名で格納する
格納が完了したら、企業グループで報告する`,
      flowSteps: [
        { label: "Canvaに企業名フォルダを作成しページごとにファイル作成する" },
        { label: "HP制作テンプレートを基に画像、文章をはめ込む" },
        { label: "作成したHPデザインをチェックリストを用いてチェックする" },
        { label: "各セクションごとにデータをダウンロードし指定したグーグルドライブにセクションごとのファイル名で格納する" },
        { label: "格納が完了したら、企業グループで報告する" },
      ],
    },
    {
      no: "3",
      category: "実装",
      name: "コーディング",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.21 企業担当へ確認依頼
      tools: "VSコード・Claude",
      deliverable: "Webサイト",
      checkpoint: "表示崩れ",
      hasManual: true,
      issues: "ノウハウの体系的な共有・ブログ更新の時にどうしたら楽になるか",
    },
    {
      no: "4",
      category: "作成原稿の確認",
      name: "企業担当へ確認依頼",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.22 キックオフMTG
      tools: "メール",
      deliverable: "HPリンク",
      checkpoint: "チェックリストと相違ないか",
      hasManual: true,
      issues: "メールテンプレ",
      simulation: `先方へHPデザインの確認
修正箇所の有無の確認
修正箇所の修正対応
キックオフの日程調整`,
      flowSteps: [
        { label: "先方へHPデザインの確認" },
        { label: "修正箇所の有無の確認" },
        { label: "修正箇所の修正対応" },
        { label: "キックオフの日程調整" },
      ],
    },
    {
      no: "5",
      category: "キックオフMTG",
      name: "今後の担当者の共有とスケジュール共有",
      assignee: "河合",
      nextAssignee: "-",  // 次: No.23 HPの内容更新（担当なし）
      tools: "メール",
      deliverable: "打合せ議事録",
      checkpoint: "ネクスト内容の認識合わせ",
      hasManual: true,
      issues: "納品打合せマニュアル",
      memo: "打合せマニュアル・議事録テンプレ",
      simulation: "今後の運用担当者と次回FB日程の調整",
      flowSteps: [
        { label: "今後の運用担当者と次回FB日程の調整" },
      ],
    },
    {
      no: "6",
      category: "HPの内容更新",
      name: "HPのブログ機能の更新及びSEO最適化",
      assignee: "-",
      nextAssignee: "河合",  // 次: No.16 月次FB打合せ
      tools: "-",
      deliverable: "-",
      checkpoint: "-",
      hasManual: true,
      issues: "HP運用マニュアル",
      memo: "HP運用マニュアル",
      simulation: "HP運用マニュアルを基に運用プラン毎の運用を実施",
      flowSteps: [
        { label: "HP運用マニュアルを基に運用プラン毎の運用を実施" },
      ],
    },
    {
      no: "7",
      category: "月次FB",
      name: "月次FB打合せ",
      assignee: "河合",
      nextAssignee: "",  // 最終業務
      tools: "資料テンプレ",
      deliverable: "FB資料",
      checkpoint: "指標理解",
      hasManual: true,
      issues: "FBマニュアル・FB資料テンプレ",
      memo: "FBマニュアル・FB資料テンプレ・議事録テンプレ",
      simulation: `FBマニュアルをもとにFBの実施
次回打合せ日程の決定
議事録のテンプレートを企業グループに共有`,
      flowSteps: [
        { label: "FBマニュアルをもとにFBの実施" },
        { label: "次回打合せ日程の決定" },
        { label: "議事録のテンプレートを企業グループに共有" },
      ],
      format: FB_REPORT_TEMPLATE,
    },
  ],
  issues: [
    "ヒアリングシートの改善・ヒアリング精度向上・ヒアリング時に文章が載ってくる",
    "初回打ち合わせマニュアル",
    "撮影マニュアル",
    "データ共有マニュアル(ドライブの使い方＋テンプレ)",
    "Canvaフォルダ制作マニュアル　HP制作テンプレ・HP制作マニュアル・HP制作チェックリスト・データ格納先ドライブフォルダマニュアル",
    "ノウハウの体系的な共有・ブログ更新の時にどうしたら楽になるか",
    "メールテンプレ",
    "納品打合せマニュアル",
    "HP運用マニュアル",
    "FBマニュアル・FB資料テンプレ",
  ],
};
