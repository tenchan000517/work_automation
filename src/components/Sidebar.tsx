"use client";

import { useState } from "react";
import { Product, getAssigneeColor } from "@/lib/data";
import { SidebarSection } from "./SidebarSection";
import { ContentModal } from "./ContentModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  product: Product;
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ product, isOpen, onToggle, isMobile = false }: SidebarProps) {
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [formatContent, setFormatContent] = useState("");
  const [formatTitle, setFormatTitle] = useState("");

  // マニュアルがあるタスク
  const tasksWithManual = product.tasks.filter((task) => task.hasManual);

  // フォーマットがあるタスク
  const tasksWithFormat = product.tasks.filter((task) => task.format);

  const handleFormatClick = (taskName: string, format: string) => {
    setFormatTitle(`${taskName} - フォーマット`);
    setFormatContent(format);
    setFormatModalOpen(true);
  };

  const scrollToTask = (taskNo: string) => {
    const element = document.getElementById(`task-${taskNo}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // モバイルではスクロール後にメニューを閉じる
      if (isMobile) {
        onToggle();
      }
    }
  };

  return (
    <>
      {/* モバイル: 背景オーバーレイ */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* サイドバー本体 - 左右スライド式（fixed） */}
      <aside
        className={`
          border-r border-zinc-200 dark:border-zinc-700
          h-[calc(100vh-5rem)] fixed top-20 left-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isMobile ? "w-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm" : "w-64 bg-white dark:bg-zinc-800"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">メニュー</span>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label="メニューを閉じる"
          >
            <ChevronLeft className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* 全体フロー - ボタン形式 */}
        {product.hasOverallFlow && (
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <a
              href={`/products/${product.id}/overall-flow`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              全体フローを見る
            </a>
          </div>
        )}

        {/* タスク一覧 */}
        <SidebarSection title="タスク一覧" defaultOpen={true}>
          <nav className="space-y-1">
            {product.tasks.map((task) => {
              const color = getAssigneeColor(task.assignee.split(/[,、]/)[0].trim());
              return (
                <button
                  key={task.no}
                  onClick={() => scrollToTask(task.no)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                  <span className="text-zinc-600 dark:text-zinc-400">{task.no}.</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate">{task.name}</span>
                </button>
              );
            })}
          </nav>
        </SidebarSection>

        {/* マニュアル一覧 */}
        <SidebarSection title={`マニュアル一覧（${tasksWithManual.length}）`}>
          <nav className="space-y-1">
            {tasksWithManual.map((task) => (
              <a
                key={task.no}
                href={`/products/${product.id}/tasks/${task.no}/manual`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors truncate"
              >
                {task.no}. {task.name}
              </a>
            ))}
          </nav>
        </SidebarSection>

        {/* フォーマット一覧 */}
        <SidebarSection title={`フォーマット一覧（${tasksWithFormat.length}）`}>
          <nav className="space-y-1">
            {tasksWithFormat.map((task) => (
              <button
                key={task.no}
                onClick={() => handleFormatClick(task.name, task.format!)}
                className="w-full text-left px-2 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors truncate"
              >
                {task.no}. {task.name}
              </button>
            ))}
          </nav>
        </SidebarSection>
      </aside>

      {/* 開くボタン - サイドバーが閉じている時に表示 */}
      <button
        onClick={onToggle}
        className={`
          fixed left-0 top-20 z-50 p-1
          bg-white dark:bg-zinc-800 border border-l-0 border-zinc-200 dark:border-zinc-700
          rounded-r-md shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700
          transition-all duration-300 ease-in-out
          ${isOpen ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"}
        `}
        aria-label="メニューを開く"
      >
        <ChevronRight className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* フォーマットモーダル */}
      <ContentModal
        isOpen={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        title={formatTitle}
        content={formatContent}
      />
    </>
  );
}
