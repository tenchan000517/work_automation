// 担当者の色設定（グローバル）
// cardBgClass: globals.cssで定義したカスタムクラス名
export const assigneeColors: Record<string, { bg: string; text: string; border: string; cardBgClass: string }> = {
  "青柳": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", cardBgClass: "card-bg-blue" },
  "河合": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300", cardBgClass: "card-bg-pink" },
  "中尾文香": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", cardBgClass: "card-bg-yellow" },
  "中尾": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", cardBgClass: "card-bg-yellow" },
  "清水": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", cardBgClass: "card-bg-green" },
  "川崎": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300", cardBgClass: "card-bg-cyan" },
  "下脇田": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", cardBgClass: "card-bg-purple" },
  "紺谷": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", cardBgClass: "card-bg-orange" },
  "渡邉": { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-400", cardBgClass: "card-bg-gray" },
};

// 担当者の優先順位（数字が小さいほど優先）
// 制作担当を優先し、営業担当（渡邉）は最も低い優先度
const assigneePriority: Record<string, number> = {
  "河合": 1,
  "川崎": 2,
  "中尾文香": 3,
  "中尾": 3,
  "下脇田": 4,
  "紺谷": 5,
  "清水": 6,
  "青柳": 7,
  "渡邉": 99,  // 営業担当は最も低い優先度
};

// 担当者の色を取得するヘルパー関数
export function getAssigneeColor(name: string): { bg: string; text: string; border: string; cardBgClass: string } {
  // 完全一致を優先
  if (assigneeColors[name]) {
    return assigneeColors[name];
  }
  // 部分一致で検索
  for (const key of Object.keys(assigneeColors)) {
    if (name.includes(key) || key.includes(name)) {
      return assigneeColors[key];
    }
  }
  // デフォルト色
  return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", cardBgClass: "card-bg-default" };
}

// 複数担当者から優先度の高い担当者の色を取得
export function getPriorityAssigneeColor(assignees: string): { bg: string; text: string; border: string; cardBgClass: string } {
  const names = assignees.split(/[,、]\s*/).map(n => n.trim()).filter(n => n);

  if (names.length === 0) {
    return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", cardBgClass: "card-bg-default" };
  }

  if (names.length === 1) {
    return getAssigneeColor(names[0]);
  }

  // 優先度で並び替えて最も優先度の高い担当者を取得
  let highestPriorityName = names[0];
  let highestPriority = assigneePriority[highestPriorityName] ?? 50;

  for (const name of names) {
    // 部分一致で優先度を検索
    let priority = 50;
    for (const key of Object.keys(assigneePriority)) {
      if (name === key || name.includes(key) || key.includes(name)) {
        priority = assigneePriority[key];
        break;
      }
    }

    if (priority < highestPriority) {
      highestPriority = priority;
      highestPriorityName = name;
    }
  }

  return getAssigneeColor(highestPriorityName);
}

// 型定義
export interface Task {
  no: string;
  category: string;
  name: string;
  assignee: string;
  nextTask?: string;      // 次の業務名
  nextAssignee: string;   // 次の担当
  tools: string;
  deliverable: string;
  checkpoint: string;
  hasManual: boolean;
  issues: string;
  // トリガー（次の業務を開始する条件）
  trigger?: string;
  // 詳細情報
  memo?: string;
  simulation?: string;
  manualDraft?: string;
  overallFlow?: string;
  format?: string;
  detailedFlow?: string;
  relatedSheetUrl?: string; // 後方互換性のため残す（非推奨）
  relatedLinks?: RelatedLink[]; // 新しい複数URL対応フィールド
}

// 関連リンクの型定義
export interface RelatedLink {
  label: string; // 表示名（例：「ヒアリングシート」「Pairsona」）
  url: string;
  type: 'sheet' | 'drive' | 'site' | 'other'; // sheet=スプレッドシート, drive=Googleドライブ, site=外部サイト, other=その他
}

export interface Product {
  id: string;
  name: string;
  taskCount: number;
  description: string;
  tasks: Task[];
  issues: string[];
}

// 各商材データのインポート
import { tsunageru } from "./tsunageru";
import { batsugun } from "./batsugun";
import { hp } from "./hp";
import { lp } from "./lp";
import { sns } from "./sns";
import { pv } from "./pv";
import { pamph } from "./pamph";
import { logo } from "./logo";
import { sing } from "./sing";

// 全商材の配列
export const products: Product[] = [
  tsunageru,
  batsugun,
  hp,
  lp,
  sns,
  pv,
  pamph,
  logo,
  sing,
];

// ヘルパー関数
export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getTask(productId: string, taskNo: string): Task | undefined {
  const product = getProduct(productId);
  if (!product) return undefined;
  return product.tasks.find((t) => t.no === taskNo);
}
