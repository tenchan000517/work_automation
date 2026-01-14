import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data";
import { TaskCard } from "@/components/TaskCard";
import { ProductPageLayout } from "@/components/ProductPageLayout";
import { Accordion } from "@/components/Accordion";

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
    <ProductPageLayout product={product}>
        <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 業務詳細カード */}
        {product.tasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              業務詳細
            </h2>
            <div className="space-y-4">
              {product.tasks.map((task, i) => {
                const nextTask = product.tasks[i + 1];
                return (
                  <div key={i} id={`task-${task.no}`} className="scroll-mt-32">
                    <TaskCard
                      task={task}
                      productId={product.id}
                      nextTaskName={nextTask?.name}
                      allTasks={product.tasks}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 業務数・課題・サマリー（アコーディオン） */}
        <section className="mt-8 space-y-4">
          {/* 業務数 */}
          <Accordion title="業務数">
            <div className="p-4">
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {product.taskCount}
              </p>
            </div>
          </Accordion>

          {/* 課題感・改善ポイント一覧 */}
          {(() => {
            const tasksWithIssues = product.tasks.filter(task => task.issues && task.issues.trim());
            if (tasksWithIssues.length === 0) return null;

            return (
              <Accordion title="課題感・改善ポイント一覧">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 space-y-4">
                  {tasksWithIssues.map((task, taskIndex) => (
                    <div key={taskIndex}>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        No.{task.no} {task.name}
                      </p>
                      <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200 ml-4">
                        {task.issues.split('\n').filter(line => line.trim()).map((issue, issueIndex) => (
                          <li key={issueIndex} className="flex items-start gap-2">
                            <span className="text-yellow-500 flex-shrink-0">•</span>
                            <span>{issue.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Accordion>
            );
          })()}

          {/* 業務サマリー */}
          {product.tasks.length > 0 && (
            <Accordion title="業務サマリー">
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
            </Accordion>
          )}
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
          <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            業務効率化・マニュアル作成プロジェクト
          </div>
        </footer>
        </div>
      </ProductPageLayout>
  );
}
