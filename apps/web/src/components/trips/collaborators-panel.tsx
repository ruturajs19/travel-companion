'use client';

import {
  CollaboratorFormState,
  inviteCollaboratorAction,
  removeCollaboratorAction,
} from '@/app/(app)/trips/[id]/collaborator-actions';
import type { TripCollaborator } from '@travel-companion/contracts';
import { useActionState } from 'react';
import { Input } from '../ui/input';
import { SubmitButton } from '../auth/submit-button';
import { UserPlus, X } from 'lucide-react';

const initialState: CollaboratorFormState = {};

export function CollaboratorsPanel({
  tripId,
  collaborators,
}: {
  tripId: string;
  collaborators: TripCollaborator[];
}): React.ReactElement {
  const inviteAction = inviteCollaboratorAction.bind(null, tripId);

  const [state, formAction] = useActionState(inviteAction, initialState);
  return (
    <section
      aria-labelledby="collab-heading"
      className="rounded-[var(--radius)] border border-border p-6"
    >
      <h2 id="collab-heading" className="font-semibold">
        Collaborators
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Invite other travellers by email to co-edit this itinerary.
      </p>
      <form
        action={formAction}
        className="mt-4 flex flex-wrap items-end gap-2"
        noValidate
      >
        <div className="flex min-w-56 flex-1 flex-col gap-1">
          <label htmlFor="collab-email" className="text-sm font-medium">
            Invite by email
          </label>
          <Input
            id="collab-email"
            name="email"
            type="email"
            placeholder="friend@example.com"
            required
          />
        </div>
        <SubmitButton pendingLabel="Inviting...">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Invite
        </SubmitButton>
      </form>
      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="mt-2 text-sm text-primary">
          Collaborator added.
        </p>
      ) : null}

      {collaborators.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {collaborators.map((collab) => (
            <li
              key={collab.userId}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {collab.name ?? collab.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {collab.email} • {collab.role.toLowerCase()}
                </p>
              </div>
              <form action={removeCollaboratorAction}>
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="userId" value={collab.userId} />
                <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No collaborators yet.
        </p>
      )}
    </section>
  );
}
