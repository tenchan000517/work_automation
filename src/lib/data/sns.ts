import type { Product, FlowStep } from "./index";

export const sns: Product = {
  id: "sns",
  name: "SNS広告",
  taskCount: 5,
  description: "戦略、素材制作、配信、効果測定",
  tasks: [
    {
      no: "22",
      category: "広告戦略",
      name: "ターゲット設計",
      assignee: "河合",
      nextAssignee: "河合, 清水樹",  // 次: No.23 動画・画像制作
      tools: "スプレッドシート",
      deliverable: "設計書",
      checkpoint: "ペルソナ",
      hasManual: true,
      issues: "ヒアリングシートの作成・テンプレート化",
      flowSteps: [
        { label: "ヒアリング内容からペルソナを整理" },
        { label: "ターゲット属性・行動特性を設定" },
        { label: "配信プラットフォーム選定" },
        { label: "設計書を作成・共有" },
      ],
    },
    {
      no: "23",
      category: "広告素材制作",
      name: "動画・画像制作",
      assignee: "河合, 清水樹",
      nextAssignee: "河合",  // 次: No.24 配信設定
      tools: "Powerdirector・Canva",
      deliverable: "広告素材",
      checkpoint: "規約遵守",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "広告コンセプト・訴求軸を確認" },
        { label: "動画素材をPowerdirectorで編集" },
        { label: "画像素材をCanvaで作成" },
        { label: "広告規約チェック" },
        { label: "素材を共有・承認" },
      ],
    },
    {
      no: "24",
      category: "広告配信",
      name: "配信設定",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.25 数値分析・改善
      tools: "広告管理画面",
      deliverable: "配信中広告",
      checkpoint: "設定ミス",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "広告管理画面でキャンペーン作成" },
        { label: "ターゲティング設定" },
        { label: "予算・入札設定" },
        { label: "設定ミスのダブルチェック" },
        { label: "配信開始・共有" },
      ],
    },
    {
      no: "25",
      category: "効果測定",
      name: "数値分析・改善",
      assignee: "河合",
      nextAssignee: "河合",  // 次: No.26 月次FB打合せ
      tools: "Canva",
      deliverable: "レポート",
      checkpoint: "指標理解",
      hasManual: true,
      issues: "FB資料テンプレート　高頻度で出す",
      flowSteps: [
        { label: "広告管理画面から数値データ取得" },
        { label: "KPI達成状況を分析" },
        { label: "改善施策を検討" },
        { label: "Canvaでレポート作成" },
        { label: "上司承認・共有" },
      ],
    },
    {
      no: "26",
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
        { label: "月間実績データを整理" },
        { label: "FB資料を作成・上司承認" },
        { label: "企業担当者に前日確認" },
        { label: "FB打合せ実施" },
        { label: "報告・ネクスト日程確定" },
      ],
    },
  ],
  issues: [
    "ヒアリングシートの作成・テンプレート化",
    "FB資料テンプレート　高頻度で出す",
  ],
};
