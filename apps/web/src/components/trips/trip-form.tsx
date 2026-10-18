'use client';

import {
  GenerateFormState,
  generateTripAction,
} from '@/app/(app)/trips/actions';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

const initialState: GenerateFormState = {};

const GENERATION_STEPS = [
  'Analyzing your destination & travel style...',
  'Scouting top sights, boutique stays & local dining...',
  'Structuring smart day-by-day routing with Gemini...',
  'Finalizing details, timings & photo previews...',
];

const SUGGESTED_INTERESTS = [
  'Top Sights',
  'Hotels & Stays',
  'Local Cuisine',
  'Cafes & Bistros',
  'Culture & History',
  'Nature & Parks',
];

interface TripFormProps {
  defaultDestination?: string;
  defaultDurationDays?: number;
  defaultInterests?: string;
}

export function TripForm({
  defaultDestination = '',
  defaultDurationDays = 3,
  defaultInterests = '',
}: TripFormProps = {}): React.ReactElement {
  const [state, formAction] = useActionState(generateTripAction, initialState);
  const [interests, setInterests] = useState(defaultInterests);

  const toggleInterest = (tag: string) => {
    const current = interests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = current.includes(tag)
      ? current.filter((s) => s !== tag)
      : [...current, tag];
    setInterests(next.join(', '));
  };

  const selectedTags = interests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-5"
      noValidate
    >
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">AI Concierge:</span> Tell
        us your destination and preferences. Our AI will automatically generate
        a complete day-by-day plan with recommended places to visit, hotels &
        lodging suggestions, and local restaurants & cafes.
      </div>

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
          defaultValue={defaultDestination}
          required
          aria-invalid={Boolean(state.fieldErrors?.destination)}
          aria-describedby={
            state.fieldErrors?.destination ? 'destination-error' : undefined
          }
          placeholder="e.g. Kyoto, Japan or Rome, Italy"
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
          defaultValue={defaultDurationDays}
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
          Interests & Highlights
          <span className="text-muted-foreground"> (comma separated)</span>
        </label>
        <Input
          id="interests"
          name="interests"
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g. iconic landmarks, boutique hotels, local food"
        />
        <div className="mt-1 flex flex-wrap gap-1.5">
          {SUGGESTED_INTERESTS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInterest(tag)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isSelected ? `✓ ${tag}` : `+ ${tag}`}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="budgetLevel" className="text-sm font-medium">
          Budget Tier
        </label>
        <select
          id="budgetLevel"
          name="budgetLevel"
          defaultValue=""
          className="h-10 w-full rounded-[var(--radius)] border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <option value="">No preference</option>
          <option value="LOW">Budget (hostels, street food, transit)</option>
          <option value="MEDIUM">
            Mid-range (boutique stays, casual bistros, highlights)
          </option>
          <option value="HIGH">
            Luxury (5-star hotels, fine dining, private tours)
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Specific preferences & requirements{' '}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="e.g., Central hotel suggestions, authentic sushi & ramen spots, walkable areas, travelling with a partner"
          maxLength={500}
        />
      </div>

      <TripGenerateButton />
    </form>
  );
}

function TripGenerateButton(): React.ReactElement {
  const { pending } = useFormStatus();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      setStepIndex((prev) =>
        prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 2500);
    return () => {
      clearInterval(timer);
      setStepIndex(0);
    };
  }, [pending]);

  return (
    <div className="flex flex-col gap-3">
      {pending ? (
        <div className="flex flex-col gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs font-medium text-primary">
            <span className="flex items-center gap-1.5 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Crafting Your Custom Itinerary
            </span>
            <span>
              Step {stepIndex + 1} of {GENERATION_STEPS.length}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{
                width: `${((stepIndex + 1) / GENERATION_STEPS.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300">
            {GENERATION_STEPS[stepIndex]}
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2 font-semibold shadow-xs"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI Itinerary...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Complete Itinerary
          </>
        )}
      </Button>
    </div>
  );
}
