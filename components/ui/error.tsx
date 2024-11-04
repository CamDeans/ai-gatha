interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-destructive">{message}</span>
        {retry && (
          <button
            onClick={retry}
            className="text-sm text-destructive underline hover:text-destructive/80"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
} 