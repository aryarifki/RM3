"use client";

import React, { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Icon } from "@iconify/react";
import { useAppStore } from "@/store/useAppStore";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const UNIVERSES = [
  "watchlist", "idx80", "lq45", "idx_high_dividend", "idx_bumn", 
  "idx_smc", "esg_kehati", "idxenergy", "idxtrans", "idxinfra", 
  "idxtechno", "idxpropert", "idxfinance", "idxhealth", "idxcyclic", 
  "idxnoncyc", "idxindust", "idxbasic", "bisnis-27"
];
const WINDOWS = [20, 30, 60, 90, 180];
const HORIZONS = [1, 3, 5, 10];

export default function Sidebar() {
  const { mutate } = useSWRConfig();
  
  const { 
    sidebarOpen, setSidebarOpen, activeTicker,
    universe, setUniverse, analysisDate, setAnalysisDate,
    windowDays, setWindowDays, horizon, setHorizon,
    minEvents, setMinEvents, minNetBuy, setMinNetBuy,
    localWatchlist, setLocalWatchlist
  } = useAppStore();

  const [universeOpen, setUniverseOpen] = useState(false);
  const [backfillStart, setBackfillStart] = useState("");
  const [backfillEnd, setBackfillEnd] = useState("");
  const [pipelineRunning, setPipelineRunning] = useState<string | null>(null);
  const [isRefreshingMaster, setIsRefreshingMaster] = useState(false);

  // Sync LocalStorage Watchlist ke Global Store Zustand
  useEffect(() => {
    try {
      const ls = localStorage.getItem("tradepulse_watchlist");
      if (ls) setLocalWatchlist(JSON.parse(ls));
    } catch (e) {}
  }, [setLocalWatchlist]);

  const { data: statusData, mutate: mutateStatus } = useSWR("/api/bandar/system-status", fetcher);
  const { data: datesData } = useSWR(activeTicker ? "/api/bandar/dates/" + activeTicker : null, fetcher);
  const availableDates: string[] = datesData?.dates || [];

  useEffect(() => {
    if (availableDates.length > 0 && !analysisDate) {
      const latest = availableDates[availableDates.length - 1];
      setAnalysisDate(latest);
      setBackfillEnd(latest);
      const d = new Date(latest);
      d.setDate(d.getDate() - 90);
      setBackfillStart(d.toISOString().split("T")[0]);
    }
  }, [availableDates, analysisDate, setAnalysisDate]);

  const handleCalendarChange = (selected: string) => {
    if (!selected || availableDates.length === 0) return;
    if (availableDates.includes(selected)) {
      setAnalysisDate(selected);
      return;
    }
    const priorDates = availableDates.filter((d) => d <= selected);
    if (priorDates.length > 0) {
      setAnalysisDate(priorDates[priorDates.length - 1]);
    } else {
      setAnalysisDate(availableDates[0]);
    }
  };

  const handleRefreshMaster = async () => {
    if (isRefreshingMaster) return;
    setIsRefreshingMaster(true);
    try {
      const res = await fetch("/api/bandar/universe/refresh", { method: "POST" });
      const json = await res.json();
      if (json.status === "success") {
        await mutate("/api/bandar/universe/all");
        await mutateStatus();
        alert(`Sukses: ${json.message}`);
      } else {
        alert(`Gagal: ${json.error || "Gagal refresh master tickers"}`);
      }
    } catch (e: any) {
      alert(`Error koneksi: ${e.message}`);
    } finally {
      setIsRefreshingMaster(false);
    }
  };

  const runPipeline = async (type: "today" | "missing" | "backfill") => {
    setPipelineRunning(type);
    try {
      const payload: any = { universe_mode: universe };
      if (universe === "watchlist" && localWatchlist.length > 0) {
          payload.tickers = localWatchlist;
      }
      let res;
      if (type === "today") {
        res = await fetch("/api/bandar/pipeline/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (type === "missing") {
        payload.start_date = analysisDate || statusData?.latest_date;
        payload.end_date = new Date().toISOString().split("T")[0];
        res = await fetch("/api/bandar/pipeline/backfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        payload.start_date = backfillStart;
        payload.end_date = backfillEnd;
        res = await fetch("/api/bandar/pipeline/backfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (res.ok) {
        alert("Pipeline selesai dijalankan.");
        mutate(() => true, undefined, { revalidate: true });
      } else {
        alert("Pipeline error: " + (json.detail || "Gagal"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setPipelineRunning(null);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <aside className={
        "fixed lg:sticky top-0 lg:top-[60px] z-[70] h-screen lg:h-[calc(100vh-60px)] w-72 bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)] overflow-y-auto " +
        "transition-transform duration-300 ease-in-out " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
      }>
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[var(--md-sys-color-primary)] mb-1">IDX Smart Flow</div>
              <h2 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Controls</h2>
            </div>
            <button 
              onClick={handleRefreshMaster} 
              disabled={isRefreshingMaster}
              title="Sinkronisasi Master Tickers"
              className="p-2 bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-medium)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              <Icon icon="ph:arrows-clockwise-duotone" width="18" className={isRefreshingMaster ? "animate-spin text-[var(--md-sys-color-primary)]" : ""} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Universe Filter</label>
            <div className="relative">
              <button
                onClick={() => setUniverseOpen(!universeOpen)}
                className="w-full flex items-center justify-between bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none hover:border-[var(--md-sys-color-primary)] transition-colors focus:border-[var(--md-sys-color-primary)]"
              >
                <span>{universe.toUpperCase()}</span>
                <Icon icon={universeOpen ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="text-[var(--md-sys-color-on-surface-variant)]" />
              </button>
              
              {universeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUniverseOpen(false)}></div>
                  <div className="absolute top-full left-0 w-full mt-1.5 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-medium)] shadow-lg z-50 max-h-60 overflow-y-auto">
                    {UNIVERSES.map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setUniverse(u);
                          setUniverseOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-[var(--md-sys-color-outline-variant)] last:border-0 transition-colors ${
                          universe === u ? "text-[var(--md-sys-color-on-primary-container)] bg-[var(--md-sys-color-primary-container)] font-medium" : "text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                        }`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2 flex flex-col gap-1 bg-[var(--md-sys-color-surface-container)] p-3 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--acc-green)]"></span>
                <b>{statusData?.active_tickers ?? "..."}</b> emiten aktif
              </span>
              <span className="text-[11px]">
                Data BEI terupdate: <b className="text-[var(--md-sys-color-on-surface)]">{statusData?.latest_date ?? "-"}</b>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Analysis Date</label>
            <input
              type="date"
              className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] [color-scheme:dark]"
              value={analysisDate}
              max={availableDates[availableDates.length - 1] || statusData?.latest_date || ""}
              onChange={(e) => handleCalendarChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Broker Window</label>
            <select className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]" value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))}>
              {WINDOWS.map((w) => <option key={w} value={w}>{w} days</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Validation Horizon</label>
            <select className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
              {HORIZONS.map((h) => <option key={h} value={h}>{h} days</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Min Events</label>
              <input type="number" min={3} max={30} className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]" value={minEvents} onChange={(e) => setMinEvents(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">Min Buy Rp B</label>
              <input type="number" min={0} step={0.5} className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-3 py-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]" value={minNetBuy} onChange={(e) => setMinNetBuy(Number(e.target.value))} />
            </div>
          </div>

          <hr className="border-[var(--md-sys-color-outline-variant)]" />

          {/* Pipeline & Backfill Actions (M3 Outlined/Filled Buttons Style) */}
          <div className="space-y-3">
            <button onClick={() => runPipeline("today")} disabled={pipelineRunning !== null} className="w-full bg-[var(--md-sys-color-primary-container)] hover:bg-[var(--md-sys-color-primary)] border-none rounded-[var(--md-sys-shape-corner-full)] px-4 py-2.5 text-sm font-semibold text-[var(--md-sys-color-on-primary-container)] hover:text-[var(--md-sys-color-on-primary)] transition-colors disabled:opacity-50 text-left flex items-center justify-between">
              <span>Run latest pipeline</span>
              {pipelineRunning === "today" && <Icon icon="ph:spinner-gap" className="animate-spin" />}
            </button>

            <button onClick={() => runPipeline("missing")} disabled={pipelineRunning !== null} className="w-full bg-[var(--md-sys-color-surface-container-highest)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-full)] px-4 py-2.5 text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition-colors disabled:opacity-50 text-left flex items-center justify-between">
              <span>Fetch missing dates</span>
              {pipelineRunning === "missing" && <Icon icon="ph:spinner-gap" className="animate-spin text-[var(--md-sys-color-primary)]" />}
            </button>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-2">Backfill Custom Range</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="date"
                  className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-2 py-1.5 text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] [color-scheme:dark]"
                  value={backfillStart}
                  onChange={(e) => setBackfillStart(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] px-2 py-1.5 text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] [color-scheme:dark]"
                  value={backfillEnd}
                  onChange={(e) => setBackfillEnd(e.target.value)}
                />
              </div>
              <button 
                onClick={() => runPipeline("backfill")}
                disabled={pipelineRunning !== null || !backfillStart || !backfillEnd}
                className="w-full bg-[var(--md-sys-color-surface-container-highest)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-full)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition-colors disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span>Backfill history</span>
                {pipelineRunning === "backfill" && <Icon icon="ph:spinner-gap" className="animate-spin text-[var(--md-sys-color-primary)]" />}
              </button>
            </div>
          </div>
          
        </div>
      </aside>
    </>
  );
}
