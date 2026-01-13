import { notFound } from "next/navigation";
import { getTask } from "@/lib/data";
import { getManualByTaskNo } from "@/lib/manuals";
import { ManualMarkdownRenderer, CopyAllButton } from "@/components/ManualMarkdownRenderer";

export default async function ManualPage({
  params,
}: {
  params: Promise<{ id: string; taskNo: string }>;
}) {
  const { id: productId, taskNo } = await params;

  // タスク情報を取得
  const task = getTask(productId, taskNo);
  if (!task) {
    notFound();
  }

  // mdファイルを取得（なければmanualDraftにフォールバック）
  const manual = getManualByTaskNo(productId, taskNo);
  const content = manual?.content || task.manualDraft;

  if (!content) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          マニュアルが見つかりません
        </p>
      </div>
    );
  }

  const isMarkdown = !!manual?.content;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                No.{task.no} {task.category}
              </p>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {task.name} - マニュアル
              </h1>
              {isMarkdown && (
                <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                  Markdown
                </span>
              )}
            </div>
            <CopyAllButton content={content} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
          {isMarkdown ? (
            <ManualMarkdownRenderer content={content} />
          ) : (
            <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
