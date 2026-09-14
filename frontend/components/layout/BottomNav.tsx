"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = !isHome && !pathname.includes("/foreign") && !pathname.includes("/konglo") && !pathname.includes("/signal") && !pathname.includes("/logs");
  const isForeign = pathname.includes("/foreign");
  const isKonglo = pathname.includes("/konglo");
  const isSignal = pathname.includes("/signal");
  const isLogs = pathname.includes("/logs");

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)] z-50">
      <div className="flex justify-around items-center h-[72px] max-w-xl mx-auto px-2">
         
         {/* Home */}
         <Link href="/" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--md-sys-shape-corner-full)] transition-colors ${isHome ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)]'}`}>
              <Icon icon={isHome ? "ph:house-fill" : "ph:house-duotone"} width="24" />
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${isHome ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>Home</span>
         </Link>

         {/* Dashboard */}
         <Link href="/BBCA" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--md-sys-shape-corner-full)] transition-colors ${isDashboard ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)]'}`}>
              <Icon icon={isDashboard ? "ph:chart-line-up-fill" : "ph:chart-line-up-duotone"} width="24" />
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${isDashboard ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>Dashboard</span>
         </Link>
         
         {/* Foreign */}
         <Link href="/foreign" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--md-sys-shape-corner-full)] transition-colors ${isForeign ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)]'}`}>
              <Icon icon={isForeign ? "ph:globe-stand-fill" : "ph:globe-stand-duotone"} width="24" />
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${isForeign ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>Foreign</span>
         </Link>
         
         {/* Konglo */}
         <Link href="/konglo" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--md-sys-shape-corner-full)] transition-colors ${isKonglo ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)]'}`}>
              <Icon icon={isKonglo ? "ph:buildings-fill" : "ph:buildings-duotone"} width="24" />
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${isKonglo ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>Konglo</span>
         </Link>
         
         {/* Signal */}
         <Link href="/signal" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--md-sys-shape-corner-full)] transition-colors ${isSignal ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)]'}`}>
              <Icon icon={isSignal ? "ph:lightning-fill" : "ph:lightning-duotone"} width="24" />
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${isSignal ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>Signal</span>
         </Link>
         
      </div>
    </nav>
  );
}
