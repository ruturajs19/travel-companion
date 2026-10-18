import { RemixButton } from '@/components/social/remix-button';
import { CollaboratorsPanel } from '@/components/trips/collaborators-panel';
import { DeleteTripButton } from '@/components/trips/delete-trip-button';
import ItineraryEditor from '@/components/trips/itinerary-editor';
import { getCurrentUser } from '@/lib/current-user';
import { getTrip, listCollaborators } from '@/lib/trips';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trip',
};

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const [trip, currentUser] = await Promise.all([
    getTrip(id),
    getCurrentUser(),
  ]);

  if (!trip) {
    return (
      <div>
        <Link
          href="/trips"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to trips
        </Link>
        <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center">
          <h1 className="text-2xl font-semibold">Trip not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted, or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === trip.ownerId;
  const collaborators = isOwner ? await listCollaborators(trip.id) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/trips"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to trips
      </Link>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{trip.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {trip.destination}
          </p>
        </div>
        {isOwner ? (
          <DeleteTripButton tripId={trip.id} />
        ) : (
          <RemixButton tripId={trip.id} />
        )}
      </header>
      <ItineraryEditor trip={trip} />
      {isOwner ? (
        <div className="mt-8">
          <CollaboratorsPanel tripId={trip.id} collaborators={collaborators} />
        </div>
      ) : null}
    </div>
  );
}
