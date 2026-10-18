export default function DiscoverLoading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-2 h-8 w-40 rounded bg-muted" />
      <div className="mb-6 h-4 w-64 rounded bg-muted" />
      <div className="mb-6 h-10 w-full rounded-[var(--radius)] bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4"
          >
            <div className="aspect-video w-full rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
