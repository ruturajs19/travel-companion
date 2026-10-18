import { Button } from '@/components/ui/button';
import { BlogCardPhoto, TripCardPhoto } from '@/components/trips/place-photo';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getCurrentUser } from '@/lib/current-user';
import { listMyPosts } from '@/lib/posts';
import { listTrips } from '@/lib/trips';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  Compass,
  MapPin,
  PenTool,
  Plane,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const TRENDING_DESTINATIONS = [
  {
    destination: 'Rome, Italy',
    days: 3,
    image:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    highlights: 'Colosseum, Vatican, Trevi & Trastevere dining',
    interests: 'Colosseum, Vatican, Trevi Fountain, Local Cuisine, History',
  },
  {
    destination: 'Kyoto, Japan',
    days: 4,
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    highlights: 'Fushimi Inari, Bamboo Forest & Golden Pavilion',
    interests: 'Temples, Nature, Japanese Cuisine, Tea Houses, Culture',
  },
  {
    destination: 'Paris, France',
    days: 3,
    image:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
    highlights: 'Eiffel Tower, Louvre Museum & Seine Cruise',
    interests: 'Eiffel Tower, Art Museums, Cafes & Bistros, Architecture',
  },
  {
    destination: 'Amalfi Coast, Italy',
    days: 5,
    image:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    highlights: 'Positano cliffs, Capri boat trip & coastal paths',
    interests: 'Coastal Views, Island Tour, Italian Cuisine, Relaxation',
  },
];

import { redirect } from 'next/navigation';

export default async function DashboardPage(): Promise<React.ReactElement> {
  const [user, trips, posts] = await Promise.all([
    getCurrentUser(),
    listTrips(),
    listMyPosts(),
  ]);

  if (!user) {
    redirect('/sign-in');
  }

  const tripsList = trips ?? [];
  const postsList = posts ?? [];

  const rawName = user?.email.split('@')[0] ?? 'Explorer';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const totalDays = tripsList.reduce(
    (acc, trip) => acc + (trip.dayCount || 0),
    0,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-12">
      {/* 1. Welcome & Inspiration Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-br from-card via-card to-primary/10 p-6 shadow-sm sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Travel Companion
            </span>
            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 py-1 pl-3 pr-1.5 shadow-2xs backdrop-blur-xs">
                <span className="max-w-44 truncate text-xs text-muted-foreground" title={user.email}>
                  {user.email}
                </span>
                <SignOutButton variant="outline" />
              </div>
            ) : null}
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Where will your curiosity lead next? Generate rich day-by-day
              itineraries with AI, record your travel journals, or get inspired
              by fellow explorers.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href="/trips/new">
              <Button size="lg" className="gap-2 font-semibold shadow-xs">
                <Sparkles className="h-4 w-4" />
                Plan Trip with AI
              </Button>
            </Link>
            <Link href="/posts/new">
              <Button variant="outline" size="lg" className="gap-2">
                <PenTool className="h-4 w-4" />
                Write Story
              </Button>
            </Link>
            <Link href="/assistant">
              <Button variant="outline" size="lg" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Concierge
              </Button>
            </Link>
            <Link href="/discover">
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Compass className="h-4 w-4" />
                Explore Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Trips Planned
            </span>
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {tripsList.length}
          </p>
          <span className="text-xs text-muted-foreground">
            Custom AI itineraries
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Days of Adventure
            </span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight">{totalDays}</p>
          <span className="text-xs text-muted-foreground">
            Scheduled trip days
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Stories & Posts
            </span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {postsList.length}
          </p>
          <span className="text-xs text-muted-foreground">
            Travel stories shared
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              AI Concierge
            </span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
            Active
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          <span className="text-xs text-muted-foreground">
            Ready to generate
          </span>
        </div>
      </section>

      {/* 3. Recent Trips Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Trips</h2>
            <p className="text-xs text-muted-foreground">
              Review and customize your day-by-day itineraries
            </p>
          </div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>View all ({tripsList.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {tripsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plane className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-semibold">No trips planned yet</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Enter any city or country in the world and let Gemini craft your
              ideal itinerary with sights, hotels, and dining.
            </p>
            <Link href="/trips/new" className="mt-4">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Plan your first trip
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripsList.slice(0, 3).map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border/80 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <TripCardPhoto
                    destination={trip.destination}
                    title={trip.title}
                  />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {trip.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {trip.dayCount} {trip.dayCount === 1 ? 'day' : 'days'}{' '}
                      itinerary
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                    <span>View Itinerary</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Destinations (1-Click Itinerary Starters) */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Popular Destinations
          </h2>
          <p className="text-xs text-muted-foreground">
            Tap any destination to instantly launch a customized AI trip plan
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRENDING_DESTINATIONS.map((item) => (
            <div
              key={item.destination}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border/80 hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.destination}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  {item.days} Days
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.destination}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.highlights}
                  </p>
                </div>
                <Link
                  href={`/trips/new?destination=${encodeURIComponent(
                    item.destination,
                  )}&durationDays=${item.days}&interests=${encodeURIComponent(
                    item.interests,
                  )}`}
                  className="mt-3 inline-block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs font-medium group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary"
                  >
                    <Sparkles className="h-3 w-3" />
                    Plan {item.destination.split(',')[0]}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Stories / Drafts Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Your Travel Stories
            </h2>
            <p className="text-xs text-muted-foreground">
              Stories and blog articles you&apos;ve penned
            </p>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>View all ({postsList.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {postsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
            <BookOpen className="h-5 w-5 text-muted-foreground/60" />
            <p className="mt-2 text-xs text-muted-foreground">
              Turn your itineraries into engaging blog posts for other
              travellers to discover.
            </p>
            <Link href="/posts/new" className="mt-3">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <PenTool className="h-3.5 w-3.5" />
                Write your first story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {postsList.slice(0, 2).map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}/edit`}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-border/80 hover:bg-muted/30"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <BlogCardPhoto
                    title={post.title}
                    coverImage={post.coverImage}
                    tags={post.tags}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          post.status === 'PUBLISHED'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {post.excerpt ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                  <span className="mt-2 text-[11px] text-muted-foreground">
                    {post.readingTimeMinutes} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
