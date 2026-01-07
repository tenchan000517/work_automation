"use client";

import { useState } from "react";
import { Task, RelatedLink, getAssigneeColor, getPriorityAssigneeColor } from "@/lib/data";
import { ContentModal } from "./ContentModal";

interface TaskCardProps {
  task: Task;
  productId: string;
  nextTaskName?: string;  // 動的に渡される次の業務名
}

// 担当者を個別のバッジに分割して表示するコンポーネント
function AssigneeBadges({ assignees }: { assignees: string }) {
  // カンマやスペースで分割
  const names = assignees.split(/[,、]\s*/).map(n => n.trim()).filter(n => n);

  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name, index) => {
        const color = getAssigneeColor(name);
        return (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}

export function TaskCard({ task, productId, nextTaskName }: TaskCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  // カード背景色を優先度の高い担当者の色から取得
  const cardColor = getPriorityAssigneeColor(task.assignee);

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const hasAnyDetail =
    task.memo ||
    task.simulation ||
    task.manualDraft ||
    task.overallFlow ||
    task.format ||
    task.detailedFlow ||
    task.relatedSheetUrl ||
    (task.relatedLinks && task.relatedLinks.length > 0);

  // リンクタイプに応じたスタイルを返す
  const getLinkStyle = (type: RelatedLink['type']) => {
    switch (type) {
      case 'sheet':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'drive':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50';
      case 'site':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50';
    }
  };

  return (
    <>
      <div
        className={`rounded-lg border-2 ${cardColor.border} bg-white dark:bg-zinc-800 overflow-hidden`}
      >
        {/* Header - 2行構成（グリッドで位置揃え） */}
        <div className={`${cardColor.cardBgClass} px-5 pt-4 pb-3 mb-4`}>
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-6 gap-y-1">
            {/* 上段: ラベル行 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                No.{task.no}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {task.category}
              </span>
            </div>
            <div></div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">担当</span>
            <div></div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">次の業務</span>
            <div></div>
            {/* 下段: 値行 */}
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 col-span-2">
              {task.name}
            </h3>
            <AssigneeBadges assignees={task.assignee} />
            <span className="text-zinc-400 dark:text-zinc-500 text-lg">⇒</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {nextTaskName || task.nextTask || '-'}
              </span>
              <AssigneeBadges assignees={task.nextAssignee} />
            </div>
            <div></div>
          </div>
        </div>

        {/* 本体部分（白背景） */}
        <div className="px-5 pb-5">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                使用ツール
              </p>
              <p className="text-zinc-900 dark:text-zinc-100">{task.tools}</p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                成果物
              </p>
              <p className="text-zinc-900 dark:text-zinc-100">
                {task.deliverable}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                チェックポイント
              </p>
              <p className="text-zinc-900 dark:text-zinc-100">{task.checkpoint}</p>
            </div>
            {task.trigger && (
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                  トリガー
                </p>
                <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-line">{task.trigger}</p>
              </div>
            )}
          </div>

          {/* Issues */}
          {task.issues && (
            <div className="mt-4 pt-3 border-t border-zinc-400 dark:border-zinc-600">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                備考・課題感
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 whitespace-pre-line">
                {task.issues}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {hasAnyDetail && (
            <div className="mt-4 pt-3 border-t border-zinc-400 dark:border-zinc-600">
              <div className="flex flex-wrap gap-2">
                {/* マニュアル - 別タブで開く */}
                {task.manualDraft && (
                  <a
                    href={`/products/${productId}/tasks/${task.no}/manual`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    マニュアル
                  </a>
                )}

                {/* 詳細フロー - 別タブで開く */}
                {task.detailedFlow && (
                  <a
                    href={`/products/${productId}/tasks/${task.no}/flow`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    詳細フロー
                  </a>
                )}

                {/* 全体フロー - 別タブで開く */}
                {task.overallFlow && (
                  <a
                    href={`/products/${productId}/tasks/${task.no}/overall-flow`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    全体フロー
                  </a>
                )}

                {/* シミュレーション - ポップアップ */}
                {task.simulation && (
                  <button
                    onClick={() => openModal("シミュレーション", task.simulation!)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    シミュレーション
                  </button>
                )}

                {/* フォーマット - ポップアップ */}
                {task.format && (
                  <button
                    onClick={() => openModal("フォーマット", task.format!)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    フォーマット
                  </button>
                )}

                {/* メモ - ポップアップ */}
                {task.memo && (
                  <button
                    onClick={() => openModal("メモ", task.memo!)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    メモ
                  </button>
                )}

                {/* 関連リンク - 複数URL対応 */}
                {task.relatedLinks && task.relatedLinks.length > 0 ? (
                  task.relatedLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${getLinkStyle(link.type)}`}
                    >
                      {link.label}
                    </a>
                  ))
                ) : (
                  /* 後方互換: relatedSheetUrlのみの場合 */
                  task.relatedSheetUrl && (
                    <a
                      href={task.relatedSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      関連シート
                    </a>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
      />
    </>
  );
}
