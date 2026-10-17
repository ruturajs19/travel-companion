import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p role="status" className="sr-only">
        Loading stories...
      </p>
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-80" />
      <Skeleton className="mt-6 h-10 w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
