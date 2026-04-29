interface AnalyzerErrorStateProps {
  message: string;
  onRetry: () => void;
}

function classifyMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("ticker") || lower.includes("symbol")) {
    return {
      title: message.includes("Ticker is required") ? "Enter a ticker to run the review." : `"${message}"`,
      body: "Check the symbol and try again.",
      action: "Try again",
    };
  }
  if (lower.includes("could not be built") || (lower.includes("option") && lower.includes("chain"))) {
    return {
      title: "Setup not found in the options chain.",
      body: "The expiration date may not match available options data. Adjust the expiration date and try again.",
      action: "Try again",
    };
  }
  if (lower.includes("requires") && (lower.includes("expiration") || lower.includes("strike"))) {
    return {
      title: "Review setup is incomplete.",
      body: "Fill in the expiration date, strategy type, short strike, and long strike before running.",
      action: "Try again",
    };
  }
  if (lower.includes("options") || lower.includes("provider") || lower.includes("fetch")) {
    return {
      title: "Unable to fetch options data right now.",
      body: "This is usually temporary. Try again in a moment.",
      action: "Retry",
    };
  }
  return {
    title: "Something went wrong.",
    body: message || "If this keeps happening, try a different ticker.",
    action: "Try again",
  };
}

export default function AnalyzerErrorState({ message, onRetry }: AnalyzerErrorStateProps) {
  const copy = classifyMessage(message);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
        >
          {copy.action}
        </button>
      </div>
    </section>
  );
}
