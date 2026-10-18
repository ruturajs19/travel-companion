import { getCurrentUser } from '@/lib/current-user';
import { listTrips } from '@/lib/trips';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createPostAction } from '../actions';
import { PostEditor } from '@/components/posts/post-editor';

export const metadata: Metadata = {
  title: 'New post',
};

export default async function NewPostPage({
  searchParams,
}: {
  searchParams?: Promise<{ linkedTripId?: string; tripId?: string }>;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTripId = resolvedParams?.linkedTripId || resolvedParams?.tripId;
  const trips = (await listTrips()) ?? [];
  const selectedTrip = initialTripId
    ? trips.find((t) => t.id === initialTripId)
    : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/posts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to blog
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New post</h1>
      </header>
      <PostEditor
        action={createPostAction}
        trips={trips}
        defaultTripId={initialTripId}
        defaultTitle={
          selectedTrip ? `Exploring ${selectedTrip.destination}` : undefined
        }
      />
    </div>
  );
}
