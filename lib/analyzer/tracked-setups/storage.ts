import type { TrackedSetupSnapshot } from "@/types/trackedSetup";

const TRACKED_SETUP_STORAGE_KEY = "options-saas-tracked-setup-v1";

interface StoredTrackedSetupState {
  current: TrackedSetupSnapshot | null;
  previous: TrackedSetupSnapshot | null;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadTrackedSetupState(): StoredTrackedSetupState {
  if (!canUseStorage()) {
    return { current: null, previous: null };
  }

  try {
    const raw = window.localStorage.getItem(TRACKED_SETUP_STORAGE_KEY);
    if (!raw) return { current: null, previous: null };

    const parsed = JSON.parse(raw) as StoredTrackedSetupState;
    return {
      current: parsed?.current ?? null,
      previous: parsed?.previous ?? null,
    };
  } catch {
    return { current: null, previous: null };
  }
}

export function saveTrackedSetupSnapshot(
  snapshot: TrackedSetupSnapshot
): StoredTrackedSetupState {
  const currentState = loadTrackedSetupState();

  const nextState: StoredTrackedSetupState = {
    current: snapshot,
    previous:
      currentState.current &&
      currentState.current.trackedSetupKey === snapshot.trackedSetupKey
        ? currentState.current
        : currentState.previous,
  };

  if (canUseStorage()) {
    window.localStorage.setItem(
      TRACKED_SETUP_STORAGE_KEY,
      JSON.stringify(nextState)
    );
  }

  return nextState;
}

export function clearTrackedSetupState() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TRACKED_SETUP_STORAGE_KEY);
}
