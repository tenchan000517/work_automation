import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data";
import { TaskCard } from "@/components/TaskCard";

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 inline-block"
          >
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {product.name}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-6 py-8">
        {/* サマリー */}
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">業務数</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {product.taskCount}
            </p>
          </div>
        </section>

        {/* 課題・改善ポイント */}
        {product.issues && product.issues.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              課題感・改善ポイント
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                {product.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-500 flex-shrink-0">!</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 業務一覧テーブル */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            業務サマリー
          </h2>

          {product.tasks.length > 0 ? (
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        No
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        フェーズ
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        業務
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        担当
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        使用ツール
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        成果物
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        チェックポイント
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {product.tasks.map((task, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30"
                      >
                        <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {task.no}
                        </td>
                        <td className="px-3 py-3 text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {task.category}
                        </td>
                        <td className="px-3 py-3 text-zinc-900 dark:text-zinc-100 font-medium whitespace-nowrap">
                          {task.name}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {task.assignee}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {task.tools}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {task.deliverable}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {task.checkpoint}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                業務詳細データは準備中です
              </p>
            </div>
          )}
        </section>

        {/* 業務詳細カード */}
        {product.tasks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              業務詳細
            </h2>
            <div className="space-y-4">
              {product.tasks.map((task, i) => {
                const nextTask = product.tasks[i + 1];
                return (
                  <TaskCard
                    key={i}
                    task={task}
                    productId={product.id}
                    nextTaskName={nextTask?.name}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
        <div className="max-w-8xl mx-auto px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          業務効率化・マニュアル作成プロジェクト
        </div>
      </footer>
    </div>
  );
}
