import { Button } from '@/components/ui/button';

interface RefreshErrorAlertProps {
  isRetrying: boolean;
  message: string;
  onRetry: () => void;
}

export function RefreshErrorAlert({
  isRetrying,
  message,
  onRetry,
}: RefreshErrorAlertProps) {
  return (
    <div
      className="mt-4 flex flex-col gap-3 rounded-xl border border-destructive/20 bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span className="text-muted-foreground">{message}</span>
      <Button
        disabled={isRetrying}
        onClick={onRetry}
        size="sm"
        variant="outline"
      >
        {isRetrying ? 'Retrying…' : 'Retry'}
      </Button>
    </div>
  );
}
