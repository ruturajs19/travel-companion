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
    <div className="relative mx-auto max-w-6xl px-4 overflow-hidden">
      {/* Ambient Aurora Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[420px] w-[650px] rounded-full bg-linear-to-tr from-primary/25 via-emerald-400/15 to-teal-500/10 blur-3xl"
        aria-hidden="true"
      />

      <section className="relative z-10 flex flex-col items-center gap-6 py-20 text-center sm:py-24">
        {user ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back, {displayName}!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Generation AI Travel Companion
          </span>
        )}

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
          Plan smarter trips with{' '}
          <span className="bg-linear-to-r from-primary to-teal-500 bg-clip-text text-transparent">
            AI & fellow explorers
          </span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          TravelCompanion drafts custom day-by-day itineraries with sights,
          stays, and dining using Gemini, empowers group collaboration, and lets
          you share travel stories with a vibrant global community.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 font-semibold shadow-sm">
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
                <Button size="lg" className="font-semibold shadow-sm">
                  Start planning for free
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="lg" className="gap-2">
                  <Compass className="h-4 w-4" />
                  Explore trips
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="relative z-10 pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group flex flex-col rounded-xl border border-border bg-card/60 p-6 text-left backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-1.5 font-semibold text-foreground transition-colors group-hover:text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
