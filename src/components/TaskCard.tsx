"use client";

import { useState } from "react";
import { Task, ImageItem, RelatedLink, getAssigneeColor, getPriorityAssigneeColor, InputFieldConfig } from "@/lib/data";
import { ContentModal } from "./ContentModal";
import { ArrowRight, ArrowDown, ChevronRight, ChevronDown } from "lucide-react";

interface TaskCardProps {
  task: Task;
  productId: string;
  nextTaskName?: string;  // 動的に渡される次の業務名
  allTasks?: Task[];      // 全タスク（relatedTaskNoから担当者を動的に取得するため）
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

// ContentModal用の埋め込みリンク型
interface EmbeddedLink {
  label: string;
  content?: string;
  url?: string;
  type: 'popup' | 'link';
}

export function TaskCard({ task, productId, nextTaskName, allTasks }: TaskCardProps) {
  // relatedTaskNoから担当者名を取得するヘルパー関数
  // excludeSelf=trueの場合、現在の業務担当者を除く
  const getRelatedAssignee = (taskNo: string | undefined, excludeSelf?: boolean): string | null => {
    if (!taskNo || !allTasks) return null;
    const relatedTask = allTasks.find(t => t.no === taskNo);
    if (!relatedTask?.assignee) return null;

    if (excludeSelf) {
      // 現在の業務担当者を除く
      const currentAssignees = task.assignee.split(/[,、]\s*/).map(n => n.trim());
      const relatedAssignees = relatedTask.assignee.split(/[,、]\s*/).map(n => n.trim());
      const filtered = relatedAssignees.filter(name => !currentAssignees.includes(name));
      return filtered.length > 0 ? filtered.join(', ') : null;
    }

    return relatedTask.assignee;
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalImages, setModalImages] = useState<ImageItem[] | undefined>(undefined);
  const [modalEmbeddedLinks, setModalEmbeddedLinks] = useState<EmbeddedLink[] | undefined>(undefined);
  const [modalHasInputField, setModalHasInputField] = useState(false);
  const [modalInputSectionTitle, setModalInputSectionTitle] = useState<string | undefined>(undefined);
  const [modalInputLabel, setModalInputLabel] = useState<string | undefined>(undefined);
  const [modalInputPlaceholder, setModalInputPlaceholder] = useState<string | undefined>(undefined);
  const [modalInputNote, setModalInputNote] = useState<string | undefined>(undefined);
  const [modalTemplate, setModalTemplate] = useState<string | undefined>(undefined);
  const [modalInputFields, setModalInputFields] = useState<InputFieldConfig[] | undefined>(undefined);

  // カード背景色を優先度の高い担当者の色から取得
  const cardColor = getPriorityAssigneeColor(task.assignee);

  const openModal = (
    title: string,
    content?: string,
    images?: ImageItem[],
    embeddedLinks?: EmbeddedLink[],
    hasInputField?: boolean,
    inputSectionTitle?: string,
    inputLabel?: string,
    inputPlaceholder?: string,
    inputNote?: string,
    template?: string,
    inputFields?: InputFieldConfig[]
  ) => {
    setModalTitle(title);
    setModalContent(content || "");
    setModalImages(images);
    setModalEmbeddedLinks(embeddedLinks);
    setModalHasInputField(hasInputField || false);
    setModalInputSectionTitle(inputSectionTitle);
    setModalInputLabel(inputLabel);
    setModalInputPlaceholder(inputPlaceholder);
    setModalInputNote(inputNote);
    setModalTemplate(template);
    setModalInputFields(inputFields);
    setModalOpen(true);
  };

  const hasAnyDetail =
    task.memo ||
    task.simulation ||
    task.manualDraft || task.hasManual ||
    task.overallFlow || task.hasOverallFlow ||
    task.format ||
    task.detailedFlow || task.hasDetailedFlow ||
    task.nottaManual ||
    task.relatedSheetUrl ||
    (task.relatedLinks && task.relatedLinks.length > 0);

  // フローステップのカテゴリを判定してCSSクラスを返す
  const getFlowStepClass = (label: string): string => {
    const lowerLabel = label.toLowerCase();

    // 共有・送信系（オレンジ）
    if (lowerLabel.includes('共有') || lowerLabel.includes('送信') || lowerLabel.includes('送付') || lowerLabel.includes('メンション') || lowerLabel.includes('報告') || lowerLabel.includes('提出') || lowerLabel.includes('リマインド')) {
      return 'flow-step-share';
    }
    // 確認・チェック系（緑）
    if (lowerLabel.includes('確認') || lowerLabel.includes('チェック') || lowerLabel.includes('取得') || lowerLabel.includes('抽出') || lowerLabel.includes('ダウンロード')) {
      return 'flow-step-check';
    }
    // 作成・入力系（青）
    if (lowerLabel.includes('作成') || lowerLabel.includes('記入') || lowerLabel.includes('入力') || lowerLabel.includes('ライティング') || lowerLabel.includes('編集') || lowerLabel.includes('追加') || lowerLabel.includes('準備') || lowerLabel.includes('書き出し') || lowerLabel.includes('格納')) {
      return 'flow-step-create';
    }
    // 打合せ・連絡・実施系（ピンク）
    if (lowerLabel.includes('打合せ') || lowerLabel.includes('連絡') || lowerLabel.includes('実施') || lowerLabel.includes('fb') || lowerLabel.includes('mtg') || lowerLabel.includes('調整') || lowerLabel.includes('面接')) {
      return 'flow-step-meeting';
    }
    // ツール操作系（紫）- ワークス、エンゲージ、Powerdirector等
    if (lowerLabel.includes('ワークス') || lowerLabel.includes('エンゲージ') || lowerLabel.includes('pairsona') || lowerLabel.includes('powerdirector') || lowerLabel.includes('ドライブ') || lowerLabel.includes('youtube') || lowerLabel.includes('notta') || lowerLabel.includes('スプレッドシート')) {
      return 'flow-step-tool';
    }
    // 撮影系（シアン）
    if (lowerLabel.includes('撮影')) {
      return 'flow-step-shoot';
    }
    // 承認・完了系（黄色）
    if (lowerLabel.includes('承認') || lowerLabel.includes('完了') || lowerLabel.includes('確定') || lowerLabel.includes('解決') || lowerLabel.includes('修正') || lowerLabel.includes('対応')) {
      return 'flow-step-approve';
    }
    // 提示・候補系（ライトブルー）
    if (lowerLabel.includes('提示') || lowerLabel.includes('候補')) {
      return 'flow-step-suggest';
    }
    // デフォルト（グレー）
    return 'flow-step-default';
  };

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
        {/* Header */}
        <div className={`${cardColor.cardBgClass} px-4 sm:px-5 pt-4 pb-3 mb-4`}>
          {/* モバイル: 縦並び / デスクトップ: グリッド */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* タスク名 */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                  No.{task.no}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {task.category}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                {task.name}
              </h3>
              {task.summary && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {task.summary}
                </p>
              )}
            </div>
            {/* 担当 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">担当:</span>
              <AssigneeBadges assignees={task.assignee} />
            </div>
            {/* 次の業務 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">次:</span>
              <ArrowDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {nextTaskName || task.nextTask || '-'}
              </span>
              <AssigneeBadges assignees={task.nextAssignee} />
            </div>
          </div>

          {/* デスクトップ: グリッド */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-6 gap-y-1">
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
            <div className="col-span-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {task.name}
              </h3>
              {task.summary && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {task.summary}
                </p>
              )}
            </div>
            <AssigneeBadges assignees={task.assignee} />
            <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
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
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
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

          {/* フローステップ */}
          {task.flowSteps && task.flowSteps.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-400 dark:border-zinc-600">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                フロー
              </p>
              {/* PC: 横並び折り返し / モバイル: 縦並び */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2 w-full">
                {task.flowSteps.map((step, index) => {
                  const hasStepDetail = step.description || (step.images && step.images.length > 0);
                  // step.linksをEmbeddedLink形式に変換
                  const embeddedLinks: EmbeddedLink[] | undefined = step.links?.map(link => ({
                    label: link.label,
                    content: link.content,
                    url: link.url,
                    type: link.type
                  }));
                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-1 w-full sm:w-auto">
                      {/* ステップボックス */}
                      <div className={`border rounded-lg px-2.5 py-2.5 w-full sm:w-40 min-h-[120px] flex flex-col ${getFlowStepClass(step.label)} relative`}>
                        {/* ステップ番号 */}
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-zinc-600 dark:bg-zinc-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                          {index + 1}
                        </span>
                        {/* インフォアイコン（詳細がある場合のみ表示） */}
                        {hasStepDetail && (
                          <button
                            onClick={() => openModal(step.label, step.description, step.images, embeddedLinks)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                            title="詳細を表示"
                          >
                            i
                          </button>
                        )}
                        {/* ラベル */}
                        <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-tight ml-1">
                          {step.label}
                          {step.relatedTaskNo && getRelatedAssignee(step.relatedTaskNo, step.excludeSelf) && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                              （{getRelatedAssignee(step.relatedTaskNo, step.excludeSelf)}）
                            </span>
                          )}
                        </p>
                        {/* summary（あれば表示） */}
                        {step.summary && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                            {step.summary}
                          </p>
                        )}
                        {/* ステップ内のリンク/ボタン */}
                        <div className="flex flex-wrap gap-1 mt-auto pt-2">
                          {step.links && step.links.length > 0 ? (
                            step.links.map((link, linkIndex) => (
                              link.type === 'link' && link.url ? (
                                <a
                                  key={linkIndex}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flow-step-link-btn inline-flex items-center justify-center w-full px-2 py-0.5 text-xs font-medium rounded transition-colors"
                                >
                                  {link.label}
                                </a>
                              ) : (
                                <button
                                  key={linkIndex}
                                  onClick={() => openModal(
                                    link.label,
                                    link.content,
                                    link.images,
                                    undefined,
                                    link.hasInputField,
                                    link.inputSectionTitle,
                                    link.inputLabel,
                                    link.inputPlaceholder,
                                    link.inputNote,
                                    link.template,
                                    link.inputFields
                                  )}
                                  className="flow-step-popup-btn inline-flex items-center justify-center w-full px-2 py-0.5 text-xs font-medium rounded transition-colors"
                                >
                                  {link.label}
                                </button>
                              )
                            ))
                          ) : null}
                        </div>
                      </div>
                      {/* 矢印（最後のステップ以外） */}
                      {index < task.flowSteps!.length - 1 && (
                        <>
                          <span className="hidden sm:flex w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-600 items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                          </span>
                          <span className="sm:hidden flex w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-600 items-center justify-center">
                            <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {hasAnyDetail && (
            <div className="mt-4 pt-3 border-t border-zinc-400 dark:border-zinc-600">
              <div className="flex flex-wrap gap-2">
                {/* マニュアル - 別タブで開く */}
                {(task.manualDraft || task.hasManual) && (
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
                {(task.detailedFlow || task.hasDetailedFlow) && (
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
                {(task.overallFlow || task.hasOverallFlow) && (
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

                {/* NOTTAマニュアル - 別タブで開く */}
                {task.nottaManual && (
                  <a
                    href="/manuals/common/notta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                  >
                    NOTTAマニュアル
                  </a>
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
        images={modalImages}
        embeddedLinks={modalEmbeddedLinks}
        hasInputField={modalHasInputField}
        inputSectionTitle={modalInputSectionTitle}
        inputLabel={modalInputLabel}
        inputPlaceholder={modalInputPlaceholder}
        inputNote={modalInputNote}
        template={modalTemplate}
        inputFields={modalInputFields}
      />
    </>
  );
}
