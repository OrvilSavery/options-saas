import type { TrackedSetupSnapshot } from "@/lib/tracked-setups/buildTrackedSetupSnapshot";

const STORAGE_KEY = "strikecheck.trackedSetups.v1";

export function getTrackedSetupSnapshots(): TrackedSetupSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTrackedSetupSnapshot);
  } catch {
    return [];
  }
}

export function saveTrackedSetupSnapshot(snapshot: TrackedSetupSnapshot): TrackedSetupSnapshot[] {
  if (typeof window === "undefined") return [];

  const current = getTrackedSetupSnapshots();

  const nextSnapshot: TrackedSetupSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  const withoutExisting = current.filter((item) => item.id !== nextSnapshot.id);
  const next = [nextSnapshot, ...withoutExisting].slice(0, 25);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Local storage can fail in private mode or when quota is exceeded.
    // Keep this non-throwing so the analyzer result page does not break.
  }

  return next;
}

export function removeTrackedSetupSnapshot(id: string): TrackedSetupSnapshot[] {
  if (typeof window === "undefined") return [];

  const next = getTrackedSetupSnapshots().filter((item) => item.id !== id);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Non-blocking local persistence failure.
  }

  return next;
}

export function clearTrackedSetupSnapshots(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-blocking local persistence failure.
  }
}

function isTrackedSetupSnapshot(value: unknown): value is TrackedSetupSnapshot {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.ticker === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    typeof record.price === "number" &&
    typeof record.decision === "string" &&
    typeof record.eventRisk === "string" &&
    record.source === "analyzer"
  );
}