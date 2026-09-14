"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAppStore } from "@/store/useAppStore";

export default function SidebarToggle() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="lg:hidden p-2 mr-2 rounded-[var(--md-sys-shape-corner-full)] bg-transparent hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors focus:outline-none"
      aria-label="Toggle Navigation"
    >
      <Icon icon="ph:list" width="24" />
    </button>
  );
}
