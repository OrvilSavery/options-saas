"use client";

import { useEffect, useMemo, useState } from "react";
import LegacyAnalysisCard from "@/components/history/LegacyAnalysisCard";
import SavedSetupCard from "@/components/history/SavedSetupCard";
import {
  type LegacyRun,
  type SavedSetupRecord,
  type SavedSetupWithContinuity,
  loadLegacyHistoryRuns,
} from "@/lib/history/readModels";
import { listSavedSetups, removeSavedSetup, removeSavedSetups } from "@/lib/history/store";

type HistoryGroup = {
  ticker: string;
  legacy: LegacyRun[];
  tracked: SavedSetupWithContinuity[];
};

type SelectableHistoryItem = {
  id: string;
  kind: "legacy" | "tracked";
  ticker: string;
};

function loadLocalTrackedSetups(): SavedSetupWithContinuity[] {
  const records = listSavedSetups() as unknown as SavedSetupRecord[];
  return records.map((record) => ({
    record,
    continuity: {
      summary: record.snapshot.rationale ?? "Saved for another look.",
      currentPosture: record.posture,
      priorPosture: record.posture,
      postureChanged: false,
      priceChangePct: null,
      downsideRoomChangePct: null,
    },
  }));
}

function getLatestGroupTimestamp(group: HistoryGroup) {
  return group.legacy[0]?.savedAt ?? group.tracked[0]?.record.savedAt ?? "";
}

function countHiddenRuns(group: HistoryGroup) {
  const primaryCount = group.legacy.length > 0 ? 1 : group.tracked.length > 0 ? 1 : 0;
  return Math.max(group.legacy.length + group.tracked.length - primaryCount, 0);
}

function buildPrimaryCard(group: HistoryGroup) {
  if (group.legacy.length > 0) {
    return {
      kind: "legacy" as const,
      item: group.legacy[0],
      remainingLegacy: group.legacy.slice(1),
      remainingTracked: group.tracked,
    };
  }

  if (group.tracked.length > 0) {
    return {
      kind: "tracked" as const,
      item: group.tracked[0],
      remainingLegacy: group.legacy,
      remainingTracked: group.tracked.slice(1),
    };
  }

  return {
    kind: null,
    item: null,
    remainingLegacy: group.legacy,
    remainingTracked: group.tracked,
  };
}

function normalizeDecision(value: string | null | undefined) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "valid" || normalized === "watchlist" || normalized === "pass") return normalized;
  return "unknown";
}

async function deleteLegacyRun(id: string) {
  const response = await fetch(`/api/analysis-runs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to delete saved review.");
  }
}

export default function HistoryPageClient() {
  const [legacyRuns, setLegacyRuns] = useState<LegacyRun[]>([]);
  const [trackedSetups, setTrackedSetups] = useState<SavedSetupWithContinuity[]>([]);
  const [expandedTickers, setExpandedTickers] = useState<Record<string, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectableHistoryItem>>({});
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"all" | "valid" | "watchlist" | "pass">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      const legacy = await loadLegacyHistoryRuns();
      const tracked = loadLocalTrackedSetups();
      if (cancelled) return;
      setLegacyRuns(legacy);
      setTrackedSetups(tracked);
      setIsLoading(false);
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = legacyRuns.length + trackedSetups.length;

  const groups = useMemo(() => {
    const map = new Map<string, HistoryGroup>();
    const tickerQuery = query.trim().toUpperCase();

    for (const item of legacyRuns) {
      const key = item.ticker.toUpperCase();
      if (tickerQuery && !key.includes(tickerQuery)) continue;
      if (verdictFilter !== "all" && normalizeDecision(item.decision) !== verdictFilter) continue;

      const existing = map.get(key) ?? { ticker: key, legacy: [], tracked: [] };
      existing.legacy.push(item);
      map.set(key, existing);
    }

    for (const item of trackedSetups) {
      const key = item.record.ticker.toUpperCase();
      if (tickerQuery && !key.includes(tickerQuery)) continue;
      if (verdictFilter !== "all" && item.continuity.currentPosture !== verdictFilter) continue;

      const existing = map.get(key) ?? { ticker: key, legacy: [], tracked: [] };
      existing.tracked.push(item);
      map.set(key, existing);
    }

    return [...map.values()].sort((a, b) => getLatestGroupTimestamp(b).localeCompare(getLatestGroupTimestamp(a)));
  }, [legacyRuns, trackedSetups, query, verdictFilter]);

  const allSelectableItems = useMemo<SelectableHistoryItem[]>(() => {
    return groups.flatMap((group) => [
      ...group.legacy.map((item) => ({ id: item.id, kind: "legacy" as const, ticker: group.ticker })),
      ...group.tracked.map((item) => ({ id: item.record.id, kind: "tracked" as const, ticker: group.ticker })),
    ]);
  }, [groups]);

  const selectedList = Object.values(selectedItems);
  const hasSelection = selectedList.length > 0;
  const hasSelectableItems = allSelectableItems.length > 0;
  const allMatchingSelected = hasSelectableItems && allSelectableItems.every((item) => Boolean(selectedItems[item.id]));
  const filtersActive = query.trim().length > 0 || verdictFilter !== "all";

  function clearFilters() {
    setQuery("");
    setVerdictFilter("all");
  }

  function toggleSelected(item: SelectableHistoryItem) {
    setSelectedItems((current) => {
      const next = { ...current };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }
      return next;
    });
  }

  function toggleSelectAllMatching() {
    setSelectedItems((current) => {
      if (allMatchingSelected) {
        const next = { ...current };
        for (const item of allSelectableItems) {
          delete next[item.id];
        }
        return next;
      }

      return allSelectableItems.reduce<Record<string, SelectableHistoryItem>>((next, item) => {
        next[item.id] = item;
        return next;
      }, { ...current });
    });
  }

  async function handleDeleteItem(item: SelectableHistoryItem) {
    const confirmed = window.confirm("Delete this saved review? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    setStatusMessage(null);
    try {
      if (item.kind === "legacy") {
        await deleteLegacyRun(item.id);
        setLegacyRuns((current) => current.filter((run) => run.id !== item.id));
      } else {
        removeSavedSetup(item.id);
        setTrackedSetups((current) => current.filter((setup) => setup.record.id !== item.id));
      }
      setSelectedItems((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setStatusMessage("Saved review deleted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Saved review could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    if (!hasSelection) return;
    const confirmed = window.confirm(`Delete ${selectedList.length} saved item${selectedList.length === 1 ? "" : "s"}? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      const legacyItems = selectedList.filter((item) => item.kind === "legacy");
      const trackedItems = selectedList.filter((item) => item.kind === "tracked");
      const trackedIds = trackedItems.map((item) => item.id);

      // Run API deletes independently — one failure doesn't block the others
      const legacyResults = await Promise.allSettled(
        legacyItems.map((item) => deleteLegacyRun(item.id).then(() => item.id))
      );

      const deletedLegacyIds = legacyResults
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value);

      const failedCount = legacyResults.filter((r) => r.status === "rejected").length;

      // Tracked setups are localStorage-only — always safe to delete
      if (trackedIds.length > 0) removeSavedSetups(trackedIds);

      if (deletedLegacyIds.length > 0) {
        setLegacyRuns((current) => current.filter((run) => !deletedLegacyIds.includes(run.id)));
      }
      if (trackedIds.length > 0) {
        setTrackedSetups((current) => current.filter((setup) => !trackedIds.includes(setup.record.id)));
      }

      const deletedIds = new Set([...deletedLegacyIds, ...trackedIds]);
      setSelectedItems((current) => {
        const next = { ...current };
        for (const id of deletedIds) delete next[id];
        return next;
      });

      const totalDeleted = deletedLegacyIds.length + trackedIds.length;
      if (failedCount > 0) {
        setStatusMessage(
          `Deleted ${totalDeleted} of ${selectedList.length}. ${failedCount} item${failedCount === 1 ? "" : "s"} could not be removed — try again.`
        );
      } else {
        setStatusMessage(`${totalDeleted} saved review${totalDeleted === 1 ? "" : "s"} deleted.`);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[740px] space-y-4 px-4 py-7 sm:px-6">
      <section className="flex items-end justify-between gap-4">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-950">History</h1>
        <p className="font-mono text-sm text-slate-400">{totalCount} saved</p>
      </section>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ticker..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-400 md:w-[180px]"
          />
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
            {(["all", "valid", "watchlist", "pass"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setVerdictFilter(filter)}
                className={[
                  "border-r border-slate-200 px-4 py-2 text-xs font-medium capitalize last:border-r-0 transition",
                  verdictFilter === filter ? "bg-slate-950 text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                ].join(" ")}
              >
                {filter === "all" ? "All" : filter === "watchlist" ? "Watchlist" : filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          {filtersActive ? (
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasSelectableItems ? (
            <button
              type="button"
              onClick={toggleSelectAllMatching}
              disabled={isDeleting}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 disabled:opacity-50"
            >
              {allMatchingSelected ? "Unselect all" : `Select all (${allSelectableItems.length})`}
            </button>
          ) : null}

          {hasSelection ? (
            <>
              <span className="font-mono text-xs text-slate-400">{selectedList.length} selected</span>
              <button
                type="button"
                onClick={() => setSelectedItems({})}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete selected"}
              </button>
            </>
          ) : null}
        </div>
      </section>

      {statusMessage ? <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">{statusMessage}</p> : null}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500 shadow-sm">Loading saved reviews…</div>
      ) : null}

      {!isLoading && groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          {filtersActive ? "No analyses match your filters." : "No saved analyses yet. Run your first one in the Analyzer."}
          {filtersActive ? (
            <button type="button" onClick={clearFilters} className="ml-2 font-semibold text-blue-600 hover:text-blue-700">Clear filters</button>
          ) : (
            <a href="/analyzer" className="ml-2 font-semibold text-blue-600 hover:text-blue-700">Go to Analyzer →</a>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        {groups.map((group) => {
          const expanded = expandedTickers[group.ticker] ?? false;
          const primary = buildPrimaryCard(group);
          const hiddenCount = countHiddenRuns(group);
          const runCount = group.legacy.length + group.tracked.length;

          return (
            <section key={group.ticker} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-mono text-base font-bold text-slate-950">{group.ticker}</h2>
                  <p className="text-xs text-slate-400">{runCount} saved run{runCount === 1 ? "" : "s"}</p>
                </div>
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpandedTickers((current) => ({ ...current, [group.ticker]: !expanded }))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    {expanded ? "Hide older ↑" : `Show older (${hiddenCount}) →`}
                  </button>
                ) : null}
              </div>

              {primary.kind === "legacy" && primary.item ? (
                <LegacyAnalysisCard
                  item={primary.item}
                  isLatest
                  isSelected={Boolean(selectedItems[primary.item.id])}
                  onToggleSelect={() => toggleSelected({ id: primary.item.id, kind: "legacy", ticker: group.ticker })}
                  onDelete={() => handleDeleteItem({ id: primary.item.id, kind: "legacy", ticker: group.ticker })}
                />
              ) : null}

              {primary.kind === "tracked" && primary.item ? (
                <SavedSetupCard
                  item={primary.item}
                  isPrimary
                  isSelected={Boolean(selectedItems[primary.item.record.id])}
                  onToggleSelect={() => toggleSelected({ id: primary.item.record.id, kind: "tracked", ticker: group.ticker })}
                  onDelete={() => handleDeleteItem({ id: primary.item.record.id, kind: "tracked", ticker: group.ticker })}
                />
              ) : null}

              {expanded ? (
                <div>
                  {primary.remainingLegacy.map((item) => (
                    <LegacyAnalysisCard
                      key={item.id}
                      item={item}
                      isSelected={Boolean(selectedItems[item.id])}
                      onToggleSelect={() => toggleSelected({ id: item.id, kind: "legacy", ticker: group.ticker })}
                      onDelete={() => handleDeleteItem({ id: item.id, kind: "legacy", ticker: group.ticker })}
                    />
                  ))}

                  {primary.remainingTracked.map((item) => (
                    <SavedSetupCard
                      key={item.record.id}
                      item={item}
                      isSelected={Boolean(selectedItems[item.record.id])}
                      onToggleSelect={() => toggleSelected({ id: item.record.id, kind: "tracked", ticker: group.ticker })}
                      onDelete={() => handleDeleteItem({ id: item.record.id, kind: "tracked", ticker: group.ticker })}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
