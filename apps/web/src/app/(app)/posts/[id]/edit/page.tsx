import { listTrips } from '@/lib/trips';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getMyPost } from '@/lib/posts';
import { redirect } from 'next/navigation';
import { updatePostAction } from '../../actions';
import { DeletePostButton } from '@/components/posts/delete-post-button';
import { PostEditor } from '@/components/posts/post-editor';

export const metadata: Metadata = {
  title: 'Edit post',
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const [post, trips] = await Promise.all([getMyPost(id), listTrips()]);

  if (!post) redirect('/posts');

  const boundUpdate = updatePostAction.bind(null, post.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/posts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to blog
      </Link>
      <header className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Edit post</h1>
        <div className="flex items-center gap-2">
          {post.status === 'PUBLISHED' ? (
            <Link
              href={`/posts/${post.slug}`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View live
            </Link>
          ) : null}
          <DeletePostButton postId={post.id} />
        </div>
      </header>
      <PostEditor action={boundUpdate} post={post} trips={trips ?? []} />
    </div>
  );
}
