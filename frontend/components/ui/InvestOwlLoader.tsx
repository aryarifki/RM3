"use client";

import Image from "next/image";

interface LoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function InvestOwlLoader({
  title = "INITIALIZING SYSTEM",
  subtitle = "Loading InvestOwl Engine...",
  fullScreen = false,
}: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none text-[var(--md-sys-color-primary)] font-sans ${
        fullScreen
          ? "fixed inset-0 z-50 bg-[var(--md-sys-color-surface)]"
          : "min-h-[calc(100vh-16rem)] w-full"
      }`}
    >
      <div className="relative w-28 h-28 mb-5 animate-pulse drop-shadow-md">
        <Image 
          src="/logo.png" 
          alt="InvestOwl Logo" 
          fill 
          sizes="112px"
          className="object-contain" 
          priority 
        />
      </div>

      <div className="text-sm font-bold tracking-widest uppercase animate-pulse">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2 font-medium tracking-wide">
          {subtitle}
        </div>
      )}
    </div>
  );
}
