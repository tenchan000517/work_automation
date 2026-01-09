import type { Product, FlowStep } from "./index";

export const pamph: Product = {
  id: "pamph",
  name: "パンフ",
  taskCount: 3,
  description: "構成、デザイン、校正",
  tasks: [
    {
      no: "30",
      category: "構成設計",
      name: "ページ構成",
      assignee: "河合",
      nextAssignee: "河合, 中尾文香",  // 次: No.31 誌面デザイン
      tools: "スプレッドシート",
      deliverable: "構成案",
      checkpoint: "情報過多",
      hasManual: true,
      issues: "ヒアリングシート・基本構成のテンプレート",
      flowSteps: [
        { label: "ヒアリング内容から掲載情報を整理" },
        { label: "ページ数・構成案を作成" },
        { label: "情報量のバランスを確認" },
        { label: "構成案を共有・承認" },
      ],
    },
    {
      no: "31",
      category: "デザイン制作",
      name: "誌面デザイン",
      assignee: "河合, 中尾文香",
      nextAssignee: "河合",  // 次: No.32 誤字脱字チェック
      tools: "Canva",
      deliverable: "デザイン",
      checkpoint: "トンマナ",
      hasManual: true,
      issues: "テンプレート",
      flowSteps: [
        { label: "Canvaでテンプレート選択・調整" },
        { label: "テキスト・画像を配置" },
        { label: "トンマナ（トーン&マナー）を確認" },
        { label: "デザインを共有・修正" },
      ],
    },
    {
      no: "32",
      category: "校正",
      name: "誤字脱字チェック",
      assignee: "河合",
      nextAssignee: "",  // 最終業務
      tools: "PDF",
      deliverable: "修正稿",
      checkpoint: "表記統一",
      hasManual: true,
      issues: "チェックシート作成",
      flowSteps: [
        { label: "PDF出力して印刷チェック" },
        { label: "誤字脱字・表記統一を確認" },
        { label: "修正箇所をマーク・指示" },
        { label: "修正反映・最終確認" },
      ],
    },
  ],
  issues: [
    "ヒアリングシート・基本構成のテンプレート",
    "テンプレート",
    "チェックシート作成",
  ],
};
