import { Button } from '@/components/ui/button';
import { listTrips } from '@/lib/trips';
import { MapPin, Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Trips',
};

export default async function TripsPage(): Promise<React.ReactNode> {
  const trips = await listTrips();
  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Itineraries you've created with the AI planner
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
          We couldn't load your trips right now. Please refresh in a moment.
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
        <ul className="grid gap-3 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="block rounded-[var(--radius)] border border-border p-4 transition-colors hover:bg-muted"
              >
                <h2 className="font-semibold">{trip.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {trip.destination}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {trip.dayCount} {trip.dayCount === 1 ? 'day' : 'days'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
