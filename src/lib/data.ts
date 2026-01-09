// 新しいデータ構造から再エクスポート
// 各商材は src/lib/data/ 配下の個別ファイルで管理されています

export {
  products,
  getProduct,
  getTask,
  getAssigneeColor,
  getPriorityAssigneeColor,
  assigneeColors,
  type Task,
  type Product,
  type RelatedLink,
  type FlowStep,
  type FlowStepLink,
  type ImageItem,
  type ImageWithCaption,
} from "./data/index";
