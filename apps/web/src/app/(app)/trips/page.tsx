import { Button } from '@/components/ui/button';
import { TripCardPhoto } from '@/components/trips/place-photo';
import { getCurrentUser } from '@/lib/current-user';
import { listTrips } from '@/lib/trips';
import { MapPin, Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Trips',
};

export default async function TripsPage(): Promise<React.ReactNode> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const trips = await listTrips();
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Itineraries you&apos;ve created with the AI planner
          </p>
        </div>
        <Link href="/trips/new">
          <Button>
            <Plus className="h-4 w-4" />
            New trip
          </Button>
        </Link>
      </header>
      {trips === null ? (
        <p
          role="alert"
          className="rounded-md border border-border p-6 text-sm text-muted-foreground"
        >
          We couldn&apos;t load your trips right now. Please refresh in a moment.
        </p>
      ) : trips.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center">
          <h2 className="font-semibold">No trips yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Describe where you want to go and let the AI draft a day-by-day
            itinerary you can refine.
          </p>
          <Link href="/trips/new" className="mt-4 inline-block">
            <Button>Plan your first trip</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card transition-all hover:border-border/80 hover:shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden bg-muted">
                  <TripCardPhoto
                    destination={trip.destination}
                    title={trip.title}
                  />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {trip.title}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {trip.dayCount} {trip.dayCount === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
