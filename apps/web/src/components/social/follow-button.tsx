import { toggleFollowAction } from '@/app/social-actions';
import { cn } from '@/lib/utils';
import { FollowStatus } from '@travel-companion/contracts';
import { UserCheck, UserPlus } from 'lucide-react';
import { useState, useTransition } from 'react';

export function FollowButton({
  userId,
  initial,
}: {
  userId: string;
  initial: FollowStatus;
}): React.ReactElement {
  const [status, setStatus] = useState<FollowStatus>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onClick(): void {
    if (isPending) return;
    setError(null);
    const previous = status;
    const optimistic: FollowStatus = {
      ...previous,
      following: !previous.following,
      followerCount: previous.followerCount + (previous.following ? -1 : 1),
    };
    setStatus(optimistic);
    startTransition(async () => {
      const result = await toggleFollowAction(userId);
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
        aria-pressed={status.following}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          status.following
            ? 'border-border bg-muted text-foreground'
            : 'border-primary bg-primary text-primary-foreground hover:opacity-90',
        )}
      >
        {status.following ? (
          <UserCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {status.following ? 'Following' : 'Follow'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
