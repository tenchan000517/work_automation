import type { Product, FlowStep } from "./index";

export const lp: Product = {
  id: "lp",
  name: "LP制作",
  taskCount: 5,
  description: "構成、原稿、デザイン、実装",
  tasks: [
    {
      no: "17",
      category: "構成設計",
      name: "テンプレート選定",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.18 ライティング
      tools: "ペライチ",
      deliverable: "構成案",
      checkpoint: "訴求軸",
      hasManual: true,
      issues: "",
      memo: "部分的な企画の情報集積場所",
      flowSteps: [
        { label: "ヒアリング内容から訴求軸を整理" },
        { label: "ペライチで適切なテンプレートを選定" },
        { label: "構成案を作成" },
        { label: "構成案を共有・確認" },
      ],
    },
    {
      no: "18",
      category: "原稿制作",
      name: "ライティング",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.19 デザイン
      tools: "ペライチ",
      deliverable: "原稿",
      checkpoint: "誇張表現",
      hasManual: true,
      issues: "ヒアリングシート次第",
      flowSteps: [
        { label: "ヒアリングシートから必要情報を抽出" },
        { label: "キャッチコピー・見出しを作成" },
        { label: "本文ライティング" },
        { label: "誇張表現チェック・修正" },
        { label: "原稿を共有・確認" },
      ],
    },
    {
      no: "19",
      category: "デザイン制作",
      name: "デザイン",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.20 LP実装
      tools: "ペライチ",
      deliverable: "デザイン",
      checkpoint: "導線設計",
      hasManual: true,
      issues: "LPは広告からの着地点だけという認識",
      flowSteps: [
        { label: "ペライチでデザイン作成開始" },
        { label: "画像・素材を配置" },
        { label: "CTA（ボタン・フォーム）の導線設計" },
        { label: "デザイン確認・修正" },
      ],
    },
    {
      no: "20",
      category: "ネットアップ",
      name: "LP実装",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.21 月次FB打合せ
      tools: "ペライチ",
      deliverable: "LP",
      checkpoint: "表示速度",
      hasManual: true,
      issues: "月次の数値感に期待感起こさせない方がいい　SEO関連情報はFBに入れない",
      flowSteps: [
        { label: "ペライチで公開設定" },
        { label: "表示速度・レスポンシブ確認" },
        { label: "フォーム動作テスト" },
        { label: "公開・URLを共有" },
      ],
    },
    {
      no: "21",
      category: "月次FB",
      name: "月次FB打合せ",
      assignee: "河合",
      nextAssignee: "",  // 最終業務
      tools: "資料テンプレ",
      deliverable: "FB資料",
      checkpoint: "指標理解",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "月間数値データ収集（CV数・CVR等）" },
        { label: "FB資料を作成・上司承認" },
        { label: "企業担当者に前日確認" },
        { label: "FB打合せ実施" },
        { label: "報告・ネクスト日程確定" },
      ],
    },
  ],
  issues: [
    "ヒアリングシート次第",
    "LPは広告からの着地点だけという認識",
    "月次の数値感に期待感起こさせない方がいい　SEO関連情報はFBに入れない",
  ],
};
