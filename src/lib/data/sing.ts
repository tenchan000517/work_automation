import type { Product, FlowStep } from "./index";

export const sing: Product = {
  id: "sing",
  name: "月刊Sing",
  taskCount: 4,
  description: "取材、原稿、誌面編集、校正",
  tasks: [
    {
      no: "36",
      category: "取材対応",
      name: "インタビュー実施",
      assignee: "川崎",
      nextAssignee: "河合, 中尾文香",  // 次: No.37 記事執筆
      tools: "AiNote",
      deliverable: "音源",
      checkpoint: "聞き漏れ",
      hasManual: true,
      issues: "取材マニュアル",
      flowSteps: [
        { label: "取材日程の調整・確定" },
        { label: "質問事項の事前準備" },
        { label: "インタビュー実施（AiNoteで録音）" },
        { label: "音源データを共有" },
      ],
    },
    {
      no: "37",
      category: "原稿制作",
      name: "記事執筆",
      assignee: "河合, 中尾文香",
      nextAssignee: "河合, 中尾文香",  // 次: No.38 レイアウト
      tools: "Canva",
      deliverable: "原稿",
      checkpoint: "文字数",
      hasManual: true,
      issues: "AI文章構成マニュアル",
      flowSteps: [
        { label: "音源から文字起こし" },
        { label: "AI/手動で記事構成を作成" },
        { label: "本文ライティング" },
        { label: "文字数・内容確認" },
      ],
    },
    {
      no: "38",
      category: "誌面編集",
      name: "レイアウト",
      assignee: "河合, 中尾文香",
      nextAssignee: "河合",  // 次: No.39 校閲
      tools: "Canva",
      deliverable: "誌面",
      checkpoint: "読みやすさ",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "Canvaでテンプレート選択" },
        { label: "テキスト・画像を配置" },
        { label: "読みやすさ・バランスを調整" },
        { label: "誌面データを共有" },
      ],
    },
    {
      no: "39",
      category: "校正",
      name: "校閲",
      assignee: "河合",
      nextAssignee: "",  // 最終業務
      tools: "PDF",
      deliverable: "修正版",
      checkpoint: "誤字脱字",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "PDF出力して印刷チェック" },
        { label: "誤字脱字・表現チェック" },
        { label: "取材先に確認依頼" },
        { label: "修正反映・最終版完成" },
      ],
    },
  ],
  issues: [
    "取材マニュアル",
    "AI文章構成マニュアル",
  ],
};
