import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/current-user';
import { Bot, Compass, NotebookPen, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Bot,
    title: 'Plan with AI',
    description:
      'Describe your trip in plain language and get a structured, day-by-day itinerary you can refine.',
  },
  {
    icon: Users,
    title: 'Travel together',
    description:
      'Invite friends to co-edit itineraries, and remix trips shared by other travellers.',
  },
  {
    icon: NotebookPen,
    title: 'Share your journey',
    description:
      'Turn completed trips into rich blog posts with photos and embedded itineraries.',
  },
];

export default async function HomePage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  const rawName = user?.email?.split('@')[0] ?? 'Explorer';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        {user ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back, {displayName}!
          </span>
        ) : null}

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Plan smarter trips with AI and fellow travellers
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          TravelCompanion helps you build itineraries with an AI assistant,
          collaborate on group trips, and share what you learn with a community
          of explorers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 font-semibold">
                  <Compass className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/trips/new">
                <Button variant="outline" size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Plan a new trip
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg">Start planning</Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="lg">
                  Explore trips
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
      <section className="pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-[var(--radius)] border border-border p-6 text-left"
            >
              <feature.icon
                className="mb-3 h-6 w-6 text-primary"
                aria-hidden="true"
              />
              <h3 className="mb-1 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
