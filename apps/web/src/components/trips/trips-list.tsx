'use client';

import { TripSummary } from '@travel-companion/contracts';
import { TripCardPhoto } from './place-photo';
import { ArrowRight, Calendar, Compass, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

type FilterDuration = 'all' | 'short' | 'long';

export function TripsList({
  trips,
}: {
  trips: TripSummary[];
}): React.ReactElement {
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState<FilterDuration>('all');

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      const matchSearch =
        trip.destination.toLowerCase().includes(search.toLowerCase()) ||
        trip.title.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (durationFilter === 'short') {
        return trip.dayCount <= 3;
      }
      if (durationFilter === 'long') {
        return trip.dayCount >= 4;
      }
      return true;
    });
  }, [trips, search, durationFilter]);

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by destination or title..."
            className="h-10 w-full rounded-[var(--radius)] border border-border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDurationFilter('all')}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              durationFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All ({trips.length})
          </button>
          <button
            type="button"
            onClick={() => setDurationFilter('short')}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              durationFilter === 'short'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            1–3 Days
          </button>
          <button
            type="button"
            onClick={() => setDurationFilter('long')}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              durationFilter === 'long'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            4+ Days
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <Compass className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">
            No matching itineraries
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No trips found matching &quot;{search}&quot;. Try a different destination or clear your filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setDurationFilter('all');
            }}
            className="mt-3 cursor-pointer text-xs font-semibold text-primary hover:underline"
          >
            Reset search filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md cursor-pointer"
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
                  <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    {trip.dayCount <= 3 ? '⚡ Short Trip' : '🗺️ Grand Tour'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {trip.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        {trip.dayCount} {trip.dayCount === 1 ? 'day' : 'days'} plan
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                    <span className="text-muted-foreground">Interactive Itinerary</span>
                    <span className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
                      View details
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
