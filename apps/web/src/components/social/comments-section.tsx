import { addCommentAction } from '@/app/social-actions';
import { Comment } from '@travel-companion/contracts';
import { MessageCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CommentsSection({
  postId,
  initialComments,
  canComment,
}: {
  postId: string;
  initialComments: Comment[];
  canComment: boolean;
}): React.ReactElement {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState('');

  function submit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const body = value.trim();
    if (!body || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await addCommentAction(postId, body);
      if (result.comment) {
        setComments((prev) => [...prev, result.comment as Comment]);
        setValue('');
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-10 border-t border-border pt-8"
    >
      <h2
        id="comments-heading"
        className="flex items-center gap-2 text-xl font-semibold"
      >
        <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        Comments ({comments.length})
      </h2>
      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-[var(--radius)] border border-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">
                  {comment.authorName ?? 'Traveller'}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {canComment ? (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-2">
          <label htmlFor="comment-body" className="font-medium text-sm">
            Comment
          </label>
          <Textarea
            id="comment-body"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            placeholder="Share your thoughts..."
            rows={4}
            maxLength={2000}
          />
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <div>
            <Button
              type="submit"
              disabled={isPending || !value.trim()}
              aria-busy={isPending}
            >
              {isPending ? 'Posting...' : 'Post comment'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          <a href="/sign-in" className="text-primary hover:underline">
            Sign in
          </a>{' '}
          to join the conversation.
        </p>
      )}
    </section>
  );
}
