import type { Product, FlowStep } from "./index";

export const logo: Product = {
  id: "logo",
  name: "ロゴ",
  taskCount: 3,
  description: "コンセプト、作成、データ整理",
  tasks: [
    {
      no: "33",
      category: "コンセプト設計",
      name: "ヒアリング整理",
      assignee: "河合",
      nextAssignee: "河合, 中尾文香",  // 次: No.34 デザイン案作成
      tools: "スプレッドシート",
      deliverable: "コンセプト",
      checkpoint: "理念反映",
      hasManual: true,
      issues: "ヒアリングシート・パターンオーダー\nロゴ下に文字　ロゴ横に文字",
      flowSteps: [
        { label: "ヒアリング内容から理念・コンセプトを抽出" },
        { label: "キーワード・イメージカラーを整理" },
        { label: "ロゴパターン（横・縦）の要件を確認" },
        { label: "コンセプトを共有・確認" },
      ],
    },
    {
      no: "34",
      category: "ロゴ作成",
      name: "デザイン案作成",
      assignee: "河合, 中尾文香",
      nextAssignee: "河合",  // 次: No.35 データ書き出し
      tools: "Canva",
      deliverable: "ロゴ案",
      checkpoint: "汎用性",
      hasManual: true,
      issues: "AI",
      flowSteps: [
        { label: "コンセプトを基に複数パターン作成" },
        { label: "Canva/AIツールでデザイン展開" },
        { label: "汎用性（縮小・モノクロ）を確認" },
        { label: "デザイン案を提示・フィードバック" },
      ],
    },
    {
      no: "35",
      category: "データ整理",
      name: "データ書き出し",
      assignee: "河合",
      nextAssignee: "",  // 最終業務
      tools: "Canva",
      deliverable: "ロゴデータ",
      checkpoint: "形式",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "決定デザインをCanvaで調整" },
        { label: "各形式で書き出し（PNG/SVG/PDF等）" },
        { label: "ファイル名・フォルダ整理" },
        { label: "データを共有・納品" },
      ],
    },
  ],
  issues: [
    "ヒアリングシート・パターンオーダー",
    "ロゴ下に文字　ロゴ横に文字",
    "AI",
  ],
};
