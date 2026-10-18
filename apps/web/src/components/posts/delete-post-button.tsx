import { deletePostAction } from '@/app/(app)/posts/actions';
import { Trash2 } from 'lucide-react';

export function DeletePostButton({
  postId,
}: {
  postId: string;
}): React.ReactElement {
  return (
    <form action={deletePostAction}>
      <input type="hidden" name="id" value={postId} />
      <button
        type="submit"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
    </form>
  );
}
