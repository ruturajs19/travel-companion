import { cn } from '@/lib/utils';

export function Skeleton({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
    />
  );
}

export function PageSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}): React.ReactElement {
  return (
    <div aria-hidden="true" className={cn('mx-auto max-w-4xl', className)}>
      <p role="status" className="sr-only">
        Loading...
      </p>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
