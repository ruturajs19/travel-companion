import { Trash2 } from 'lucide-react';

export function DeleteTripButton({
  tripId,
}: {
  tripId: string;
}): React.ReactElement {
  return (
    <form>
      <input type="hidden" name="id" value={tripId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-500"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
    </form>
  );
}
