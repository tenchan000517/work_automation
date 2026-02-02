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
  summary?: string;       // 業務の簡潔な説明（カード表示用）
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
  hasOverallFlow?: boolean; // 外部mdファイルにoverallFlowがある場合true
  format?: string;
  detailedFlow?: string;
  hasDetailedFlow?: boolean; // 外部mdファイルにdetailedFlowがある場合true
  nottaManual?: string;     // NOTTAマニュアル
  relatedSheetUrl?: string; // 後方互換性のため残す（非推奨）
  relatedLinks?: RelatedLink[]; // 新しい複数URL対応フィールド
  // 業務フローステップ（UIで横並びボックス表示）
  flowSteps?: FlowStep[];
}

// 関連リンクの型定義
export interface RelatedLink {
  label: string; // 表示名（例：「ヒアリングシート」「Pairsona」）
  url: string;
  type: 'sheet' | 'drive' | 'site' | 'other'; // sheet=スプレッドシート, drive=Googleドライブ, site=外部サイト, other=その他
}

// キャプション付き画像の型
export interface ImageWithCaption {
  url: string;
  caption?: string;  // 画像の上に表示する短いタイトル
}

// 画像は文字列（URLのみ）またはキャプション付きオブジェクト
export type ImageItem = string | ImageWithCaption;

// 入力フィールドの設定（複数入力対応）
export interface InputFieldConfig {
  id: string;              // プレースホルダーID（例: "company" → {{company}}で参照）
  label: string;           // 表示ラベル（例: "企業名"）
  placeholder?: string;    // プレースホルダー（例: "株式会社○○"）
  defaultValue?: string;   // デフォルト値（例: 担当者名 "@河合"）
  type?: 'text' | 'textarea';  // 入力タイプ（デフォルト: text）
  rows?: number;           // textareaの場合の行数
}

// フローステップ内のリンク/ポップアップ
export interface FlowStepLink {
  label: string;           // "フォーマット"
  url?: string;            // リンクの場合のURL
  content?: string;        // ポップアップの場合のコンテンツ
  type: 'link' | 'popup';  // リンクか、ポップアップか
  images?: ImageItem[];    // ポップアップで表示する参考画像（キャプション付き可）
  // 入力フィールド付きテンプレート機能
  hasInputField?: boolean;     // trueの場合、入力フィールドを表示
  inputSectionTitle?: string;  // セクションタイトル（例：「ワークス投稿作成」）
  inputLabel?: string;         // ラベル（例：「ここに文字起こしを貼り付け」）（単一入力時の後方互換用）
  inputPlaceholder?: string;   // プレースホルダー（単一入力時の後方互換用）
  inputNote?: string;          // 注意書き
  template?: string;           // テンプレート（{{input}}や{{company}}等で参照）
  // 複数入力フィールド対応
  inputFields?: InputFieldConfig[];  // 複数入力フィールドの設定（これがあればinputLabel等は無視）
}

// フローステップの型定義
export interface FlowStep {
  label: string;           // "LINEWORKSで企業グループを作成"
  summary?: string;        // ステップの簡潔な説明（カード内に表示）
  links?: FlowStepLink[];  // このステップで使うリンク/ポップアップ（任意）
  // 詳細情報（インフォアイコンで表示）
  description?: string;    // このステップの詳細説明
  images?: ImageItem[];    // 説明用の画像（キャプション付き可）
  // 関連タスク（担当者を動的に表示）
  relatedTaskNo?: string;  // 関連タスクのNo（例: "3"）→ そのタスクのassigneeをラベルに表示
  excludeSelf?: boolean;   // trueの場合、現在の業務担当者を除いて表示
}

export interface Product {
  id: string;
  name: string;
  taskCount: number;
  description: string;
  tasks: Task[];
  issues: string[];
  hasOverallFlow?: boolean; // 商材レベルの全体フロー
  hasOverallManual?: boolean; // 商材レベルの全体マニュアル（一連の統合マニュアル）
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
