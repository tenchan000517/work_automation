import Link from "next/link";
import { ExternalLink, Github, Globe, FileText } from "lucide-react";
import { clientWorklogs, getStatusColor, getStatusLabel } from "@/lib/worklogs";

export default function WorklogsPage() {
  // 商材ごとにグループ化
  const groupedByProduct = clientWorklogs.reduce((acc, client) => {
    if (!acc[client.product]) {
      acc[client.product] = [];
    }
    acc[client.product].push(client);
    return acc;
  }, {} as Record<string, typeof clientWorklogs>);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              ホーム
            </Link>
            <span>/</span>
            <span>ワークログ</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ワークログ
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            クライアント別の作業履歴・関連リンク
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* サマリー */}
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">クライアント数</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {clientWorklogs.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">進行中</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {clientWorklogs.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">完了</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {clientWorklogs.filter((c) => c.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 商材別クライアント一覧 */}
        {Object.entries(groupedByProduct).map(([product, clients]) => (
          <section key={product} className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {product}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {clients.map((client) => {
                const statusColor = getStatusColor(client.status);
                const latestLog = client.logs[0];
                return (
                  <Link
                    key={client.id}
                    href={`/worklogs/${client.id}`}
                    className="block bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-5 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {client.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${statusColor.bg} ${statusColor.text}`}
                      >
                        {getStatusLabel(client.status)}
                      </span>
                    </div>

                    {/* リンクアイコン */}
                    <div className="flex items-center gap-3 mb-3">
                      {client.github && (
                        <span className="text-zinc-400" title="GitHub">
                          <Github className="w-4 h-4" />
                        </span>
                      )}
                      {client.deployUrl && (
                        <span className="text-zinc-400" title="デプロイ">
                          <Globe className="w-4 h-4" />
                        </span>
                      )}
                      {client.links.length > 0 && (
                        <span className="text-zinc-400" title="関連リンク">
                          <FileText className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {/* 最新の作業履歴 */}
                    {latestLog && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="text-zinc-400">{latestLog.date}</span>
                        <span className="mx-2">-</span>
                        <span className="line-clamp-1">{latestLog.content}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
            ← ホームに戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}
