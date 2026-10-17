import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p role="status" className="sr-only">
        Loading stories...
      </p>
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="mt-6 h-9 w-3/4" />
      <Skeleton className="mt-3 h-4 w-48" />
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
