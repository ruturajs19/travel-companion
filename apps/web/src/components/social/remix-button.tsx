'use client';

import { remixTripAction } from '@/app/social-actions';
import { Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function RemixButton({
  tripId,
}: {
  tripId: string;
}): React.ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onClick(): void {
    if (isPending) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await remixTripAction(tripId);
      if (result.tripId) {
        router.push(`/trips/${result.tripId}`);
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-busy={isPending}
        aria-describedby="remix-error"
        className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Remixing...' : 'Remix this itinerary'}
        Remix
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
