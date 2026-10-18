import { Button } from '@/components/ui/button';
import { Bot, NotebookPen, Users } from 'lucide-react';
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

export default function HomePage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Plan smarter trips with AI and fellow travellers
        </h1>
        <p className="text-muted-foreground">
          TravelCompanion helps you build itineraries with an AI assistant,
          collaborate on group trips, and share what you learn with a community
          of explorers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up">
            <Button size="lg">Start planning</Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" size="lg">
              Explore trips
            </Button>
          </Link>
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
