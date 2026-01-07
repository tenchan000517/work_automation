import Link from "next/link";

// 商材データ
const products = [
  { id: "tsunageru", name: "ツナゲル", taskCount: 10, description: "採用求人原稿作成、インタビュー動画、応募対応、FB" },
  { id: "batsugun", name: "バツグン", taskCount: 5, description: "運用設計、ショート動画、数値分析" },
  { id: "hp", name: "HP制作", taskCount: 8, description: "構成設計、デザイン、実装、更新" },
  { id: "lp", name: "LP制作", taskCount: 5, description: "構成、原稿、デザイン、実装" },
  { id: "sns", name: "SNS広告", taskCount: 5, description: "戦略、素材制作、配信、効果測定" },
  { id: "pv", name: "PV制作", taskCount: 5, description: "構成、撮影、編集、納品" },
  { id: "pamph", name: "パンフ", taskCount: 3, description: "構成、デザイン、校正" },
  { id: "logo", name: "ロゴ", taskCount: 3, description: "コンセプト、作成、データ整理" },
  { id: "sing", name: "月刊Sing", taskCount: 4, description: "取材、原稿、誌面編集、校正" },
];

export default function Home() {
  const totalTasks = products.reduce((sum, p) => sum + p.taskCount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            業務効率化・マニュアル作成プロジェクト
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            制作陣の業務効率化とマニュアル整備
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* サマリー */}
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">商材数</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">総業務数</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalTasks}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 商材一覧 */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            商材別業務一覧
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-5 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </h3>
                  <span className="text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                    {product.taskCount}業務
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {product.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 進捗状況 */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            現在の進捗状況
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">完了済み</h3>
              </div>
              <ul className="mt-2 ml-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>業務棚卸し・一覧化（48業務を商材別に整理）</li>
                <li>ツナゲル &gt; 採用求人原稿作成の効率化（GASスクリプト・プロンプト作成済み）</li>
              </ul>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">作業中</h3>
              </div>
              <ul className="mt-2 ml-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>ツナゲル &gt; 採用求人原稿作成（ヒアリングシート改善、AIプロンプト実運用テスト）</li>
                <li>Next.js一覧サイト作成</li>
              </ul>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full"></span>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">未着手</h3>
              </div>
              <ul className="mt-2 ml-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>他商材の業務効率化</li>
                <li>全48業務のマニュアル改善</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          業務効率化・マニュアル作成プロジェクト
        </div>
      </footer>
    </div>
  );
}
