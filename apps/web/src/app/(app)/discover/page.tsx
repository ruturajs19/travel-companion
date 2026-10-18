import { PostCard } from '@/components/posts/post-card';
import { getDiscoverFeed, searchPosts } from '@/lib/discovery-api';
import { PostSummary } from '@travel-companion/contracts';
import { Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

const POPULAR_TAGS = [
  { label: '🏖️ Beaches', tag: 'beaches' },
  { label: '🍜 Local Food', tag: 'food' },
  { label: '🏛️ Culture & History', tag: 'culture' },
  { label: '🏔️ Hiking & Mountains', tag: 'nature' },
  { label: '🎒 Solo Adventures', tag: 'solo' },
  { label: '☕ Hidden Cafes', tag: 'cafes' },
  { label: '🏨 Stays & Hotels', tag: 'hotels' },
];

export const metadata: Metadata = {
  title: 'Discover',
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const tag = params.tag?.trim() || undefined;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  let items: PostSummary[] = [];
  let totalPages = 1;
  let failed = false;

  try {
    if (query) {
      items = await searchPosts(query);
    } else {
      const feed = await getDiscoverFeed({ tag, page });
      items = feed.items;
      totalPages = feed.totalPages;
    }
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore travel stories and itineraries shared by the global community.
        </p>
      </header>

      <form
        action="/discover"
        method="GET"
        role="search"
        className="mb-3 flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search"
            name="q"
            placeholder="Search by meaning, e.g. 'temples and food in Japan' or 'coastal road trip'"
            defaultValue={query}
            aria-label="Search posts"
            className="h-10 w-full rounded-[var(--radius)] border border-border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 cursor-pointer items-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Popular Topic Chips */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Quick filters:
        </span>
        <Link
          href="/discover"
          className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            !tag && !query
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </Link>
        {POPULAR_TAGS.map((item) => {
          const isActive = tag?.toLowerCase() === item.tag.toLowerCase();
          return (
            <Link
              key={item.tag}
              href={`/discover?tag=${encodeURIComponent(item.tag)}`}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {query || tag ? (
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            {query ? (
              <>
                Showing results for{' '}
                <span className="font-semibold text-foreground">
                  &quot;{query}&quot;
                </span>
              </>
            ) : (
              <>
                Filtered by tag{' '}
                <span className="font-semibold text-primary">#{tag}</span>
              </>
            )}
            {' '}({items.length} {items.length === 1 ? 'story' : 'stories'})
          </p>
          <Link
            href="/discover"
            className="font-medium text-primary hover:underline"
          >
            Clear filters
          </Link>
        </div>
      ) : null}

      {failed ? (
        <p
          role="alert"
          className="rounded-md border border-border p-6 text-sm text-muted-foreground"
        >
          We couldn&apos;t load stories right now. Please try again in a moment.
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center">
          <h2 className="font-semibold">No stories found</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {query
              ? 'Try a different search, or browse the latest stories.'
              : 'Be the first to publish a travel story for the community.'}
          </p>
          {query ? (
            <Link
              href="/discover"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Browse all stories
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </ul>
          {!query && totalPages > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-3"
            >
              {page > 1 ? (
                <Link
                  href={`/discover?${new URLSearchParams({
                    ...(tag ? { tag } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Previous
                </Link>
              ) : null}
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/discover?${new URLSearchParams({
                    ...(tag ? { tag } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
