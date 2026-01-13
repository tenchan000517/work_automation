"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { Sidebar } from "./Sidebar";

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
      // 初回のみ: デスクトップなら開く
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
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
  );
}
