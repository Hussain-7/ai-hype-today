"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <h2 className="text-2xl font-bold text-red-600">Critical Error</h2>
            <p className="text-gray-600">
              A critical error occurred. The application needs to reload.
            </p>
            {error.message && (
              <p className="text-sm text-gray-500">Error: {error.message}</p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
