import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Github, Globe, FileSpreadsheet, FolderOpen, Link as LinkIcon } from "lucide-react";
import { clientWorklogs, getClientWorklog, getStatusColor, getStatusLabel } from "@/lib/worklogs";

// 静的パラメータ生成
export function generateStaticParams() {
  return clientWorklogs.map((client) => ({
    id: client.id,
  }));
}

// リンクタイプに応じたアイコン
function getLinkIcon(type: string) {
  switch (type) {
    case 'sheet':
      return <FileSpreadsheet className="w-4 h-4" />;
    case 'drive':
      return <FolderOpen className="w-4 h-4" />;
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'deploy':
      return <Globe className="w-4 h-4" />;
    default:
      return <LinkIcon className="w-4 h-4" />;
  }
}

export default async function ClientWorklogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientWorklog(id);

  if (!client) {
    notFound();
  }

  const statusColor = getStatusColor(client.status);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              ホーム
            </Link>
            <span>/</span>
            <Link href="/worklogs" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              ワークログ
            </Link>
            <span>/</span>
            <span>{client.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {client.name}
            </h1>
            <span
              className={`text-sm px-2 py-0.5 rounded ${statusColor.bg} ${statusColor.text}`}
            >
              {getStatusLabel(client.status)}
            </span>
          </div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {client.product}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 基本情報 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            基本情報
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700">
            {client.github && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">GitHub</span>
                </div>
                <a
                  href={client.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {client.github.replace('https://github.com/', '')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            {client.deployUrl && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">デプロイURL</span>
                </div>
                <a
                  href={client.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {client.deployUrl.replace('https://', '')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            {!client.github && !client.deployUrl && (
              <div className="p-4 text-zinc-500 dark:text-zinc-400 text-sm">
                基本情報がまだ登録されていません
              </div>
            )}
          </div>
        </section>

        {/* 関連リンク */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            関連リンク
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {client.links.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {client.links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">{getLinkIcon(link.type)}</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{link.label}</span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      開く
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-zinc-500 dark:text-zinc-400 text-sm">
                関連リンクがまだ登録されていません
              </div>
            )}
          </div>
        </section>

        {/* メモ */}
        {client.memo && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              メモ
            </h2>
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {client.memo}
              </p>
            </div>
          </section>
        )}

        {/* 作業履歴 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            作業履歴
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {client.logs.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {client.logs.map((log, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start gap-4">
                      <span className="text-sm text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {log.date}
                      </span>
                      <div>
                        <p className="text-zinc-700 dark:text-zinc-300">{log.content}</p>
                        {log.commit && (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                            {log.commit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-zinc-500 dark:text-zinc-400 text-sm">
                作業履歴がまだありません
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/worklogs" className="hover:text-zinc-700 dark:hover:text-zinc-200">
            ← ワークログ一覧に戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}
