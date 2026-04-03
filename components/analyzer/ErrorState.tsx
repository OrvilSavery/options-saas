interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 mt-6">
      <p className="text-sm text-red-700 font-medium">
        Something went wrong
      </p>
      <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
  );
}
