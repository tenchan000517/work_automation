import { notFound } from "next/navigation";
import { getCommonManual } from "@/lib/manuals";
import { ManualMarkdownRenderer, CopyAllButton } from "@/components/ManualMarkdownRenderer";

export default async function CommonManualPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  // 共通マニュアルを取得
  const manual = getCommonManual(name);

  if (!manual) {
    notFound();
  }

  // ファイル名からタイトルを生成（拡張子を除去）
  const title = manual.fileName.replace(/\.md$/, "");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                共通マニュアル
              </p>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
              <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                Markdown
              </span>
            </div>
            <CopyAllButton content={manual.content} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
          <ManualMarkdownRenderer content={manual.content} />
        </div>
      </main>
    </div>
  );
}
