import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data";
import { getFlow } from "@/lib/manuals";
import { ManualMarkdownRenderer, CopyAllButton } from "@/components/ManualMarkdownRenderer";

export function generateStaticParams() {
  return products
    .filter((p) => p.hasOverallFlow)
    .map((product) => ({
      id: product.id,
    }));
}

export default async function ProductOverallFlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;

  // 商材情報を取得
  const product = getProduct(productId);
  if (!product || !product.hasOverallFlow) {
    notFound();
  }

  // mdファイルを取得
  const flow = getFlow(productId, "overall-flow");
  const content = flow?.content;

  if (!content) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          全体フローが見つかりません
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {product.name}
              </p>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                業務全体フロー
              </h1>
              <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                Markdown
              </span>
            </div>
            <CopyAllButton content={content} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
          <ManualMarkdownRenderer content={content} />
        </div>
      </main>
    </div>
  );
}
