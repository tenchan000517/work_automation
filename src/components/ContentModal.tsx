"use client";

import { useState, useEffect, useCallback } from "react";

// ポップアップ内に表示するリンク/ボタン
interface EmbeddedLink {
  label: string;
  content?: string;  // コピー可能なコンテンツ
  url?: string;      // 外部リンクURL
  type: 'popup' | 'link';
}

// キャプション付き画像
interface ImageWithCaption {
  url: string;
  caption?: string;
}

// 画像は文字列またはキャプション付きオブジェクト
type ImageItem = string | ImageWithCaption;

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content?: string;  // テキストコンテンツ（オプショナルに変更）
  images?: ImageItem[]; // 画像URLの配列（キャプション付き可）
  embeddedLinks?: EmbeddedLink[];  // 埋め込みリンク/ボタン
  // 入力フィールド付きテンプレート機能
  hasInputField?: boolean;
  inputSectionTitle?: string;  // セクションタイトル（例：「ワークス投稿作成」）
  inputLabel?: string;         // ラベル（例：「ここに文字起こしを貼り付け」）
  inputPlaceholder?: string;   // プレースホルダー
  inputNote?: string;          // 注意書き
  template?: string;           // テンプレート（{{input}}の部分に入力内容が挿入される）
}

export function ContentModal({ isOpen, onClose, title, content, images, embeddedLinks, hasInputField, inputSectionTitle, inputLabel, inputPlaceholder, inputNote, template }: ContentModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [embeddedPopup, setEmbeddedPopup] = useState<{ label: string; content: string } | null>(null);
  const [embeddedCopied, setEmbeddedCopied] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [templateCopied, setTemplateCopied] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [accordionCopied, setAccordionCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (embeddedPopup) {
        setEmbeddedPopup(null);
        setEmbeddedCopied(false);
      } else if (selectedImage) {
        setSelectedImage(null);
      } else {
        onClose();
      }
    }
  }, [onClose, selectedImage, embeddedPopup]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // モーダルが閉じられたら状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setEmbeddedPopup(null);
      setEmbeddedCopied(false);
      setInputValue("");
      setTemplateCopied(false);
      setAccordionOpen(false);
      setAccordionCopied(false);
    }
  }, [isOpen]);

  // テンプレートに入力値を挿入した結果を取得
  const getFilledTemplate = () => {
    if (!template || !inputValue.trim()) return "";
    return template.replace("{{input}}", inputValue.trim());
  };

  // テンプレート結果をコピー
  const handleTemplateCopy = async () => {
    const filled = getFilledTemplate();
    if (!filled) return;
    try {
      await navigator.clipboard.writeText(filled);
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // アコーディオン内のテンプレートをコピー（{{input}}を空にして）
  const handleAccordionCopy = async () => {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.replace("{{input}}", ""));
      setAccordionCopied(true);
      setTimeout(() => setAccordionCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // 埋め込みポップアップのコピー機能
  const handleEmbeddedCopy = async () => {
    if (!embeddedPopup?.content) return;
    try {
      await navigator.clipboard.writeText(embeddedPopup.content);
      setEmbeddedCopied(true);
      setTimeout(() => setEmbeddedCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  const hasContent = content && content.trim().length > 0;
  const hasImages = images && images.length > 0;
  const hasEmbeddedLinks = embeddedLinks && embeddedLinks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {hasContent && (
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  copied
                    ? "copy-btn-success"
                    : "copy-btn-default"
                }`}
              >
                {copied ? "コピー完了" : "コピー"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - 2カラムレイアウト（画像がある場合） */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={hasImages ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
            {/* 左カラム：テキストコンテンツ */}
            <div>
              {hasContent && (
                <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
                  {content}
                </pre>
              )}
            </div>

            {/* 右カラム：画像セクション */}
            {hasImages && (
              <div>
                <div className="space-y-4">
                  {images.map((image, index) => {
                    // 文字列かオブジェクトかを判定
                    const imageUrl = typeof image === 'string' ? image : image.url;
                    const caption = typeof image === 'string' ? undefined : image.caption;

                    return (
                      <div
                        key={index}
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(imageUrl)}
                      >
                        {/* キャプション（画像の上） */}
                        {caption && (
                          <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {caption}
                            </span>
                          </div>
                        )}
                        <div className="relative bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-600">
                          <img
                            src={imageUrl}
                            alt={caption || `参考画像 ${index + 1}`}
                            className="w-full h-auto object-contain"
                          />
                          {/* ホバー時のオーバーレイ */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded transition-opacity">
                              クリックで拡大
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 埋め込みリンク（リンク系のみ表示、フォーマット系popupは非表示） */}
          {hasEmbeddedLinks && embeddedLinks.some(link => link.type === 'link' && link.url) && (
            <div className={(hasContent || hasImages) ? "mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700" : ""}>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                関連ツール
              </h3>
              <div className="flex flex-wrap gap-2">
                {embeddedLinks.filter(link => link.type === 'link' && link.url).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    🔗 {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 入力フィールド付きテンプレート機能 */}
          {hasInputField && template && (
            <div className={(hasContent || hasImages || hasEmbeddedLinks) ? "mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700" : ""}>

              {/* アコーディオン：テンプレート全文表示 */}
              <div className="mb-4 border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                {/* アコーディオンヘッダー */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  onClick={() => setAccordionOpen(!accordionOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-zinc-500 transition-transform ${accordionOpen ? "rotate-90" : ""}`}>
                      ▶
                    </span>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {inputSectionTitle || "テンプレート"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccordionCopy();
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      accordionCopied ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {accordionCopied ? "コピー完了!" : "コピー"}
                  </button>
                </div>
                {/* アコーディオンコンテンツ */}
                {accordionOpen && (
                  <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-300 dark:border-zinc-600">
                    <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                      {template.replace("{{input}}", "")}
                    </pre>
                  </div>
                )}
              </div>

              {/* 注意書き */}
              {inputNote && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  ※ {inputNote}
                </p>
              )}

              {/* 入力フィールド */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                  {inputLabel || "ここに貼り付け"}
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder || "テキストをここに貼り付けてください..."}
                  className="w-full h-40 px-3 py-2 text-sm font-mono border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              {/* プレビュー（入力があるときのみ表示） */}
              {inputValue.trim() && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      プレビュー
                    </label>
                    <button
                      onClick={handleTemplateCopy}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        templateCopied
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {templateCopied ? "コピー完了!" : "コピー"}
                    </button>
                  </div>
                  <pre className="w-full p-3 text-sm font-mono border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {getFilledTemplate()}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* コンテンツがない場合 */}
          {!hasContent && !hasImages && !hasEmbeddedLinks && !hasInputField && (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              詳細情報はありません
            </p>
          )}
        </div>
      </div>

      {/* 埋め込みポップアップ（フォーマット等のコピー用） */}
      {embeddedPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={() => { setEmbeddedPopup(null); setEmbeddedCopied(false); }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {embeddedPopup.label}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEmbeddedCopy}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    embeddedCopied
                      ? "copy-btn-success"
                      : "copy-btn-default"
                  }`}
                >
                  {embeddedCopied ? "コピー完了" : "コピー"}
                </button>
                <button
                  onClick={() => { setEmbeddedPopup(null); setEmbeddedCopied(false); }}
                  className="p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
                {embeddedPopup.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 画像拡大表示 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-zinc-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="拡大画像"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
