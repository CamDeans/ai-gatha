interface ErrorProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ title = 'Error', message, retry }: ErrorProps) {
  return (
    <div className="rounded-lg border border-destructive p-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
} 