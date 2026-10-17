import {
  GenerateFormState,
  generateTripAction,
} from '@/app/(app)/trips/actions';
import { useActionState } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SubmitButton } from '../auth/submit-button';

const initialState: GenerateFormState = {};

export function TripFrom(): React.ReactElement {
  const [state, formAction] = useActionState(generateTripAction, initialState);
  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-4"
      noValidate
    >
      {state.error ? (
        <p
          role="alert"
          className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600"
        >
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destination" className="text-sm font-medium">
          Destination
        </label>
        <Input
          id="destination"
          name="destination"
          type="text"
          required
          aria-invalid={Boolean(state.fieldErrors?.destination)}
          aria-describedby={
            state.fieldErrors?.destination ? 'destination-error' : undefined
          }
          placeholder="e.g. Kyoto, Japan"
        />
        {state.fieldErrors?.destination ? (
          <p id="destination-error" className="text-sm text-red-600">
            {state.fieldErrors.destination}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="durationDays" className="text-sm font-medium">
          Number of days
        </label>
        <Input
          id="durationDays"
          name="durationDays"
          type="number"
          min={1}
          max={30}
          defaultValue={5}
          required
          aria-invalid={Boolean(state.fieldErrors?.durationDays)}
          aria-describedby={
            state.fieldErrors?.durationDays ? 'durationDays-error' : undefined
          }
        />
        {state.fieldErrors?.durationDays ? (
          <p id="durationDays-error" className="text-sm text-red-600">
            {state.fieldErrors.durationDays}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="interests" className="text-sm font-medium">
          Interests
          <span className="text-muted-foreground">(comma separated)</span>
        </label>
        <Input
          id="interests"
          name="interests"
          type="text"
          placeholder="food, hiking, history"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="budgetLevel" className="text-sm font-medium">
          Budget
        </label>
        <select
          id="budgetLevel"
          name="budgetLevel"
          defaultValue=""
          className="h-10 w-full rounded-[var(--radius)] border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <option value="">No preference</option>
          <option value="LOW">Budget</option>
          <option value="MEDIUM">Mid-range</option>
          <option value="HIGH">Luxury</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Anything else ?{' '}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Travelling with kids, prefer walkable areas, love local food ..."
          maxLength={500}
        />
      </div>

      <SubmitButton pendingLabel="Generating your itinerary...">
        Generate Itinerary
      </SubmitButton>
    </form>
  );
}
