// ワークログのデータ構造

export interface WorkLogEntry {
  date: string;       // YYYY-MM-DD
  content: string;    // 作業内容
  commit?: string;    // コミットメッセージ（任意）
}

export interface RelatedLink {
  label: string;
  url: string;
  type: 'sheet' | 'drive' | 'github' | 'deploy' | 'other';
}

export interface ClientWorkLog {
  id: string;                   // URLスラッグ
  name: string;                 // クライアント名
  product: string;              // 商材（HP制作、LP制作など）
  status: 'active' | 'completed' | 'paused';  // ステータス
  github?: string;              // GitHubリポジトリURL
  deployUrl?: string;           // デプロイURL
  links: RelatedLink[];         // 関連リンク
  logs: WorkLogEntry[];         // 作業履歴
  memo?: string;                // メモ
}

// クライアントワークログデータ
export const clientWorklogs: ClientWorkLog[] = [
  {
    id: "takeuchimold",
    name: "竹内金型",
    product: "HP制作",
    status: "active",
    github: "https://github.com/elfyakira/takeuchimold",
    deployUrl: "https://takeuchimold.vercel.app",
    links: [
      // { label: "ヒアリングシート", url: "", type: "sheet" },
      // { label: "素材フォルダ", url: "", type: "drive" },
    ],
    logs: [
      { date: "2025-02-16", content: "HANDOFF更新、デプロイ" },
    ],
  },
  {
    id: "tokiwa",
    name: "トキワ工業",
    product: "HP制作",
    status: "active",
    github: "https://github.com/elfyakira/tokiwa",
    deployUrl: "https://tokiwa-omega.vercel.app",
    links: [],
    logs: [
      { date: "2025-02-16", content: "デプロイ" },
    ],
  },
  {
    id: "shindo",
    name: "信藤建設",
    product: "HP制作",
    status: "active",
    github: "https://github.com/elfyakira/shindo",
    deployUrl: undefined,
    links: [],
    logs: [
      { date: "2025-02-16", content: "カンプ差分修正（事業内容・会社概要・採用・トップページ）" },
    ],
  },
  {
    id: "tomolink",
    name: "TOMOLINK",
    product: "HP制作",
    status: "active",
    github: "https://github.com/elfyakira/TOMOLINK",
    deployUrl: undefined,
    links: [],
    logs: [
      { date: "2025-02-16", content: "カンプ差分修正（各ページデザイン調整・ヘッダー更新）" },
    ],
  },
];

// ヘルパー関数
export function getClientWorklog(id: string): ClientWorkLog | undefined {
  return clientWorklogs.find((c) => c.id === id);
}

export function getClientsByProduct(product: string): ClientWorkLog[] {
  return clientWorklogs.filter((c) => c.product === product);
}

export function getStatusColor(status: ClientWorkLog['status']): { bg: string; text: string } {
  switch (status) {
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'completed':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'paused':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
  }
}

export function getStatusLabel(status: ClientWorkLog['status']): string {
  switch (status) {
    case 'active':
      return '進行中';
    case 'completed':
      return '完了';
    case 'paused':
      return '一時停止';
  }
}
