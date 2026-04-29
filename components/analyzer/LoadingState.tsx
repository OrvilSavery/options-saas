export default function LoadingState() {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-5 py-8">
      <div className="flex items-center justify-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-sm font-medium text-zinc-600">Running structured analysis...</span>
      </div>
    </div>
  );
}