interface AnalyzerStatusBannerProps {
  variant: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
}

function bannerClasses(variant: AnalyzerStatusBannerProps["variant"]) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

export default function AnalyzerStatusBanner({
  variant,
  title,
  message,
}: AnalyzerStatusBannerProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${bannerClasses(variant)}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}