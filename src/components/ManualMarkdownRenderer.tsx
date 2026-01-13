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
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
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
          // リンクを新しいタブで開く
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
                className="text-blue-600 dark:text-blue-400 hover:underline"
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
