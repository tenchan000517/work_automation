"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTask, Task } from "@/lib/data";

export default function ManualPage() {
  const params = useParams();
  const [task, setTask] = useState<Task | undefined>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const productId = params.id as string;
    const taskNo = params.taskNo as string;
    const foundTask = getTask(productId, taskNo);
    setTask(foundTask);
  }, [params]);

  const handleCopy = async () => {
    if (!task?.manualDraft) return;
    try {
      await navigator.clipboard.writeText(task.manualDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!task.manualDraft) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          マニュアルが見つかりません
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
                No.{task.no} {task.category}
              </p>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {task.name} - マニュアル
              </h1>
            </div>
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
          <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
            {task.manualDraft}
          </pre>
        </div>
      </main>
    </div>
  );
}
