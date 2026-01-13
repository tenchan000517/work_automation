"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ManualMarkdownRendererProps {
  content: string;
}

export function ManualMarkdownRenderer({ content }: ManualMarkdownRendererProps) {
  return (
    <div className="prose max-w-none break-words overflow-x-hidden w-full min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 見出し
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4 break-words" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4 break-words border-b-2 border-zinc-200 dark:border-zinc-700 pb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3 break-words" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2 break-words" {...props}>
              {children}
            </h4>
          ),
          // 段落
          p: ({ children, ...props }) => (
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed my-4 break-words" {...props}>
              {children}
            </p>
          ),
          // リスト
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside space-y-2 my-4 ml-6 pl-0" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside space-y-2 my-4 ml-6 pl-0" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-zinc-700 dark:text-zinc-300 pl-2 break-words" {...props}>
              {children}
            </li>
          ),
          // 引用
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-zinc-700 dark:text-zinc-300 italic break-words"
              {...props}
            >
              {children}
            </blockquote>
          ),
          // テーブル
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 w-full">
              <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-600" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-left font-bold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-zinc-300 dark:border-zinc-600 px-4 py-2" {...props}>
              {children}
            </td>
          ),
          // コード
          code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) =>
            inline ? (
              <code
                className="bg-zinc-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono break-all max-w-full font-semibold"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className="block text-zinc-100" {...props}>
                {children}
              </code>
            ),
          pre: ({ children, ...props }) => (
            <pre className="my-4 rounded-lg overflow-hidden overflow-x-auto max-w-full bg-zinc-900 p-4" {...props}>
              {children}
            </pre>
          ),
          // カスタムボタン対応
          button: ({ className, children, ...props }) => {
            const dataContent = (props as Record<string, unknown>)["data-content"] as string | undefined;
            if (className?.includes("btn-copy") && dataContent) {
              return (
                <CopyButton content={dataContent}>
                  {children}
                </CopyButton>
              );
            }
            return <button className={className} {...props}>{children}</button>;
          },
          // リンク
          a: ({ href, children, className, ...props }) => {
            const isExternal = href?.startsWith("http");
            if (className?.includes("btn-link")) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors no-underline"
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                {...props}
              >
                {children}
              </a>
            );
          },
          // 画像のスタイリング
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-full"
              {...props}
            />
          ),
          // 動画のスタイリング
          video: ({ ...props }) => (
            <video
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-full"
              {...props}
            />
          ),
          // iframeのスタイリング（YouTube等）
          iframe: ({ ...props }) => (
            <iframe
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-full"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// コピーボタンコンポーネント
function CopyButton({ content, children }: { content: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
      }`}
      onClick={handleCopy}
    >
      {copied ? "Copied!" : children}
    </button>
  );
}

// Copy Allボタンコンポーネント
export function CopyAllButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
      }`}
    >
      {copied ? "Copied!" : "Copy All"}
    </button>
  );
}
