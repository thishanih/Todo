import { Spinner } from '@/components/ui/spinner';

export function SuspenseFallback() {
  return (
    <div
      aria-label="Loading page"
      className="grid min-h-screen place-items-center text-sm text-muted-foreground"
      role="status"
    >
      <div className="flex items-center gap-3 flex-col">
        <Spinner aria-hidden="true" className="size-[80px] text-primary" />
        <span className="text-center text-lg">Loading page...</span>
      </div>
    </div>
  );
}
