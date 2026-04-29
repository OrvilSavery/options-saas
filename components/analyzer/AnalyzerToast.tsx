interface AnalyzerToastProps {
  message: string | null;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export default function AnalyzerToast({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: AnalyzerToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-200 bg-zinc-950 px-4 py-3 text-sm text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p>{message}</p>
        <div className="flex items-center gap-2">
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              {actionLabel}
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
