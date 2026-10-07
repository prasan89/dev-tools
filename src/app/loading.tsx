export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400" />
        <p className="text-sm text-gray-400 dark:text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
