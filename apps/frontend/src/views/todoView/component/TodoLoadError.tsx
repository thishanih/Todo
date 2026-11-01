import { Button } from '@/components/ui/button';

interface TodoLoadErrorProps {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function TodoLoadError({
  error,
  isRetrying,
  onRetry,
}: TodoLoadErrorProps) {
  return (
    <div
      className="rounded-2xl border border-destructive/20 bg-card px-6 py-10 text-center"
      role="alert"
    >
      <p className="font-medium">Your todos couldn’t be loaded.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      <Button
        className="mt-5"
        disabled={isRetrying}
        onClick={onRetry}
        variant="outline"
      >
        {isRetrying ? 'Retrying…' : 'Try again'}
      </Button>
    </div>
  );
}
