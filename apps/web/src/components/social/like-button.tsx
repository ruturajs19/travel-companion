'use client';

import { toggleLikeAction } from '@/app/social-actions';
import { cn } from '@/lib/utils';
import { LikeStatus } from '@travel-companion/contracts';
import { Heart } from 'lucide-react';
import { useState, useTransition } from 'react';

export function LikeButton({
  postId,
  initial,
}: {
  postId: string;
  initial: LikeStatus;
}): React.ReactElement {
  const [status, setStatus] = useState<LikeStatus>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (isPending) return;
    setError(null);
    const previous = status;
    const optimistic: LikeStatus = {
      liked: !previous.liked,
      count: previous.count + (previous.liked ? -1 : 1),
    };
    setStatus(optimistic);

    startTransition(async () => {
      const result = await toggleLikeAction(postId);
      if (result.status) {
        setStatus(result.status);
      } else {
        setError(result.error ?? 'Something went wrong.');
        setStatus(previous);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={status.liked}
        aria-label={status.liked ? 'Unlike this post' : 'Like this post'}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          status.liked
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:bg-muted',
        )}
      >
        <Heart
          className={cn('h-4 w-4', status.liked && 'fill-current')}
          aria-hidden="true"
        />
        <span className="tabular-nums">{status.count}</span>
        <span>{status.count === 1 ? 'like' : 'likes'}</span>
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
