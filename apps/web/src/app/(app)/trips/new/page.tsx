import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plan a trip',
};

export default function NewTripPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/trips"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to trips
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Plan a new trip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us the essentials and the AI will draft a day-by-day itinerary.
        </p>
      </header>
      <TripForm />
    </div>
  );
}
