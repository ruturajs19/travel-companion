import { Button } from '@/components/ui/button';
import { listMyPosts } from '@/lib/posts';
import { NotebookPen, Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Blog',
};

export default async function PostsPage() {
  const posts = await listMyPosts();
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft and publish travel stories for other travellers.
          </p>
        </div>
        <Link href="/posts/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New post
          </Button>
        </Link>
      </header>
      {posts === null ? (
        <p
          role="alert"
          className="rounded-md border border-border p-6 text-sm text-muted-foreground"
        >
          We couldn&apos;t load your posts right now. Please refresh in a moment.
        </p>
      ) : posts.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center">
          <NotebookPen
            className="mx-auto mb-2 h-6 w-6 text-primary"
            aria-hidden="true"
          />
          <h2 className="font-semibold">No posts yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Share a trip you loved. Write it up, link your itinerary, and
            publish.
          </p>
          <Link href="/posts/new" className="mt-4 inline-block">
            <Button>Write your first post</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}/edit`}
                className="block rounded-[var(--radius)] border border-border p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{post.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                </div>
                {post.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.readingTimeMinutes} min read
                  {post.tags.length > 0 ? ` . ${post.tags.join(', ')}` : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
