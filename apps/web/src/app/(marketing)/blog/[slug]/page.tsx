import { Markdown } from '@/components/posts/markdown';
import { FollowButton } from '@/components/social/follow-button';
import { LikeButton } from '@/components/social/like-button';
import { RemixButton } from '@/components/social/remix-button';
import { getCurrentUser } from '@/lib/current-user';
import { getPublishedPost } from '@/lib/posts';
import { getComments, getFollowState, getLikeState } from '@/lib/social';
import { getTrip } from '@/lib/trips';
import { TimeSlot } from '@travel-companion/contracts';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = await params;
  const post = await getPublishedPost(slug.slug);
  return { title: post?.title ?? 'Post' };
}

const timeSlotLabels: Record<TimeSlot, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-muted-foreground">
          This story may have been unpublished or removed.
        </p>
        <Link
          href="/discover"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Browse other stories
        </Link>
      </div>
    );
  }
  const [linkedTrip, currentUser, likeState, comments] = await Promise.all([
    post.linkedTripId ? getTrip(post.linkedTripId) : Promise.resolve(null),
    getCurrentUser(),
    getLikeState(post.id),
    getComments(post.id),
  ]);

  const isAuthor = currentUser?.id === post.authorId;
  const followState =
    currentUser && !isAuthor ? await getFollowState(post.authorId) : null;
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/discover"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Discover
      </Link>
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="mb-6 aspect-video w-full rounded-[var(--radius)] object-cover"
        />
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {post.authorName ? <span>By {post.authorName}</span> : null}
        {published ? <span>· {published}</span> : null}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readingTimeMinutes} min read
        </span>
      </div>

      {post.tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <LikeButton postId={post.id} initial={likeState} />
        {followState ? (
          <FollowButton userId={post.authorId} initial={followState} />
        ) : null}
      </div>
      <div className="mt-8">
        <Markdown content={post.contentJson.markdown} />
      </div>
      {linkedTrip ? (
        <section
          aria-labelledby="itinerary-heading"
          className="mt-10 border-t border-border pt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="itinerary-heading"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              Itinerary: {linkedTrip.destination}
              {currentUser ? <RemixButton tripId={linkedTrip.id} /> : null}
            </h2>
          </div>
          <ol className="mt-4 flex flex-col gap-4">
            {linkedTrip.days.map((day) => (
              <li
                key={day.id}
                className="rounded-[var(--radius)] border border-border p-4"
              >
                <h3 className="font-semibold">Day {day.dayNumber}</h3>
                {day.summary ? (
                  <p className="text-muted-foreground text-sm">{day.summary}</p>
                ) : null}
                <ul className="mt-2 flex flex-col gap-1.5">
                  {day.activities.map((activity) => (
                    <li key={activity.id} className="flex gap-2 text-sm">
                      {activity.timeSlot ? (
                        <span className="w-20 shrink-0 text-xs font-medium text-primary">
                          {timeSlotLabels[activity.timeSlot]}
                        </span>
                      ) : null}
                      <span>{activity.title}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <CommentsSection
        postId={post.id}
        initialComments={comments}
        canComment={currentUser !== null}
      />
    </article>
  );
}
