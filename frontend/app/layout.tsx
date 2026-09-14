import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import RefreshButton from "@/components/layout/RefreshButton";
import Sidebar from "@/components/layout/Sidebar";
import SidebarToggle from "@/components/layout/SidebarToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestOwl Terminal",
  description: "Dashboard Bandarmologi IDX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] antialiased`}>
        {/* GLOBAL TOP NAVIGATION (M3 Top App Bar Style) */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <SidebarToggle />
            <div className="relative w-5 h-5">
              <Image src="/logo.png" alt="InvestOwl" fill sizes="20px" className="object-contain" priority />
            </div>
            {/* Teks logo tetap dipertahankan dengan warna brand, tetapi tanpa kesan terminal */}
            <span className="text-sm font-bold uppercase tracking-wider text-orange-400">InvestOwl</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hidden sm:block">Dashboard Bandarmologi</span>
             <RefreshButton />
          </div>
        </nav>
        
        {/* KONTEN UTAMA DENGAN SIDEBAR GLOBAL */}
        <div className="flex pb-20 min-h-screen">
            <Sidebar />
            
            {/* Area Halaman */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>

        {/* GLOBAL BOTTOM NAVIGATION */}
        <BottomNav />
      </body>
    </html>
  );
}
