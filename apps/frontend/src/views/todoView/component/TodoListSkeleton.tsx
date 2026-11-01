import { Skeleton } from '@/components/ui/skeleton';

export function TodoListSkeleton() {
  return (
    <div aria-label="Loading todos" className="space-y-3" role="status">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="flex gap-4 rounded-2xl border border-border bg-card p-5"
          key={index}
        >
          <Skeleton className="mt-1 size-4 shrink-0 rounded-sm" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
