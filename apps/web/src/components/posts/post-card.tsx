import Link from 'next/link';
import { PostSummary } from '@travel-companion/contracts';
import { Clock } from 'lucide-react';

export function PostCard({ post }: { post: PostSummary }): React.ReactElement {
  return (
    <li className="overflow-hidden rounded-[var(--radius)] border border-border transition-colors hover:bg-muted">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-video w-full object-cover"
          />
        ) : null}

        <div className="p-4">
          <h3 className="font-semibold">{post.title}</h3>
          {post.excerpt ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            {post.authorName ? <span>{post.authorName}</span> : null}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readingTimeMinutes} min
            </span>
          </div>
          {post.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
