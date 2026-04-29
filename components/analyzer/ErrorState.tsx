interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm font-semibold text-red-700">Analysis failed</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}