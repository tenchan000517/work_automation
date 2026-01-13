"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/data";
import { Sidebar } from "./Sidebar";
import { ClipboardList, ChevronLeft, Menu, X } from "lucide-react";

interface ProductPageLayoutProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductPageLayout({ product, children }: ProductPageLayoutProps) {
  // モバイルではデフォルトで閉じる、デスクトップでは開く
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // デスクトップなら開く、モバイルなら閉じる
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-50">
        <div className="px-4 sm:pl-10 sm:pr-8 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* モバイル: ハンバーガーメニュー */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              aria-label={sidebarOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 w-6 h-6 text-zinc-600 dark:text-zinc-400 transition-all duration-300 ${
                    sidebarOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`absolute inset-0 w-6 h-6 text-zinc-600 dark:text-zinc-400 transition-all duration-300 ${
                    sidebarOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  }`}
                />
              </div>
            </button>
            <Link
              href="/"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
              title="トップに戻る"
            >
              <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ClipboardList className="w-7 h-7 sm:w-9 sm:h-9 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {product.name}
              </h1>
            </div>
            <span className="hidden md:block text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {product.description}
            </span>
          </div>
        </div>
      </header>

      <div className="min-h-[calc(100vh-5rem)]">
        <Sidebar
          product={product}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
        {/* モバイルではオーバーレイ、デスクトップではマージン */}
        <main className={`transition-all duration-300 ${sidebarOpen && !isMobile ? "lg:ml-64" : "ml-0"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
