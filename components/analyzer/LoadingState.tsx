export default function LoadingState() {
  return (
    <div className="flex items-center gap-3 py-12 justify-center">
      <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      <span className="text-sm text-zinc-500 font-medium">
        Running analysis…
      </span>
    </div>
  );
}
