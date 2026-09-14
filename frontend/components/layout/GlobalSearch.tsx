"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Icon } from "@iconify/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const { data } = useSWR("/api/bandar/universe/all", fetcher, { revalidateOnFocus: false });
  const allTickers = data?.tickers || [];

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toUpperCase();
    return allTickers.filter((t: string) => t.includes(q)).slice(0, 8);
  }, [query, allTickers]);

  const handleSelect = (t: string) => {
    setQuery("");
    setIsFocused(false);
    router.push(`/${t}`);
  };

  return (
    <div className="relative z-50">
      <div 
        className={`flex items-center bg-[var(--md-sys-color-surface-container-highest)] border transition-all duration-300 rounded-[var(--md-sys-shape-corner-full)] px-3 py-1.5 ${
          isFocused ? "border-[var(--md-sys-color-primary)] w-48 sm:w-64" : "border-[var(--md-sys-color-outline-variant)] w-32 sm:w-48 hover:border-[var(--md-sys-color-outline)]"
        }`}
      >
        <Icon icon="ph:magnifying-glass-duotone" className={`${isFocused ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'} mr-2 flex-shrink-0`} width="16" />
        <input
          type="text"
          className="bg-transparent border-none outline-none text-xs text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] font-medium uppercase w-full"
          placeholder="CARI SAHAM..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>
      
      {isFocused && query && (
        <div className="absolute top-full right-0 mt-2 w-48 sm:w-64 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-extra-large)] overflow-hidden shadow-lg">
          {results.length > 0 ? (
            results.map((t: string) => (
              <button 
                key={t} 
                onClick={() => handleSelect(t)} 
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-primary)] transition-colors border-b border-[var(--md-sys-color-outline-variant)] last:border-0"
              >
                <span>{t}</span>
                <Icon icon="ph:arrow-up-right-bold" className="text-[var(--md-sys-color-on-surface-variant)]" width="14" />
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-[var(--md-sys-color-on-surface-variant)]">Tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}
