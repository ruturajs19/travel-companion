'use client';

import {
  addActivityAction,
  addDayAction,
  deleteActivityAction,
  deleteDayAction,
  refineDayAction,
  reorderActivitiesAction,
  reorderDaysAction,
  updateActivityAction,
} from '@/app/(app)/trips/[id]/itinerary-actions';
import type { TimeSlot, Trip } from '@travel-companion/contracts';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Plus,
  Sparkle,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const timeSlotLabels: Record<TimeSlot, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

function movedOrder(
  ids: string[],
  index: number,
  delta: number,
): string[] | null {
  const target = index + delta;
  if (target < 0 || target >= ids.length) return null;

  const item = ids[index];
  if (item === undefined) return null;
  const next = ids.filter((_, i) => i !== index);
  next.splice(target, 0, item);
  return next;
}

export default function ItineraryEditor({
  trip,
}: {
  trip: Trip;
}): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [refiningDayId, setRefiningDayId] = useState<string | null>(null);

  const dayIds = trip.days.map((d) => d.id);

  function run(action: () => Promise<{ error?: string }>): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      setError(result.error ?? null);
    });
  }
  return (
    <div aria-busy={isPending} className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 "
        >
          {error}
        </p>
      ) : null}
      <ol className="flex flex-col gap-6">
        {trip.days.map((day, dayIndex) => {
          const activityIds = day.activities.map((a) => a.id);
          return (
            <li
              key={day.id}
              className="rounded-[var(--radius)] border border-border p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-semibold">Day {day.dayNumber}</p>
                <div className="flex items-center gap-1">
                  <IconButton
                    label={`Move day ${day.dayNumber} up`}
                    disabled={dayIndex === 0 || isPending}
                    onClick={() => {
                      const next = movedOrder(dayIds, dayIndex, -1);
                      if (next) {
                        run(() => reorderDaysAction(trip.id, next));
                      }
                    }}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Move day ${day.dayNumber} down`}
                    disabled={dayIndex === trip.days.length - 1 || isPending}
                    onClick={() => {
                      const next = movedOrder(dayIds, dayIndex, 1);
                      if (next) {
                        run(() => reorderDaysAction(trip.id, next));
                      }
                    }}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Refine day ${day.dayNumber} with AI`}
                    disabled={isPending}
                    onClick={() => {
                      setRefiningDayId((current) =>
                        current === day.id ? null : day.id,
                      );
                    }}
                  >
                    <Sparkle className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Delete day ${day.dayNumber}`}
                    disabled={isPending}
                    destructive
                    onClick={() => {
                      run(() => deleteDayAction(trip.id, day.id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
              {day.summary ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  {day.summary}
                </p>
              ) : null}
              {refiningDayId === day.id ? (
                <RefineDayForm
                  disabled={isPending}
                  onCancel={() => setRefiningDayId(null)}
                  onSubmit={(instruction) =>
                    run(async () => {
                      const result = await refineDayAction(
                        trip.id,
                        day.id,
                        instruction,
                      );
                      if (!result.error) {
                        setRefiningDayId(null);
                      }
                      return result;
                    })
                  }
                />
              ) : null}
              <ul className="flex flex-col gap-2">
                {day.activities.map((activity, actIndex) =>
                  editingActivityId === activity.id ? (
                    <li key={activity.id}>
                      <ActivityEditForm
                        defaultTitle={activity.title}
                        defaultTimeSlot={activity.timeSlot}
                        defaultLocation={activity.locationName}
                        onSubmit={(formData) =>
                          run(async () => {
                            const result = await updateActivityAction(
                              trip.id,
                              activity.id,
                              formData,
                            );
                            if (!result.error) {
                              setEditingActivityId(null);
                            }
                            return result;
                          })
                        }
                        onCancel={() => setEditingActivityId(null)}
                      />
                    </li>
                  ) : (
                    <li
                      key={activity.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex w-20 shrink-0 items-center gap-1 text-xs font-medium text-primary">
                          {activity.timeSlot ? (
                            <>
                              <Clock
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              {timeSlotLabels[activity.timeSlot]}
                            </>
                          ) : null}
                        </span>
                        <div>
                          <p className="text-sm text-medium">
                            {activity.title}
                          </p>
                          {activity.locationName ? (
                            <p className="text-xs text-muted-foreground">
                              {activity.locationName}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton
                          label={`Move "${activity.title}" up`}
                          disabled={actIndex === 0 || isPending}
                          onClick={() => {
                            const next = movedOrder(activityIds, actIndex, -1);
                            if (next) {
                              run(() =>
                                reorderActivitiesAction(trip.id, day.id, next),
                              );
                            }
                          }}
                        >
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Move "${activity.title}" down`}
                          disabled={
                            actIndex === day.activities.length - 1 || isPending
                          }
                          onClick={() => {
                            const next = movedOrder(activityIds, actIndex, 1);
                            if (next) {
                              run(() =>
                                reorderActivitiesAction(trip.id, day.id, next),
                              );
                            }
                          }}
                        >
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Edit "${activity.title}"`}
                          disabled={isPending}
                          onClick={() => {
                            setEditingActivityId(activity.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Delete "${activity.title}"`}
                          disabled={isPending}
                          destructive
                          onClick={() => {
                            run(() =>
                              deleteActivityAction(trip.id, activity.id),
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </li>
                  ),
                )}
              </ul>
              <AddActivityForm
                onSubmit={(formData) =>
                  run(() => addActivityAction(trip.id, day.id, formData))
                }
              />
            </li>
          );
        })}
      </ol>
      <div>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => addDayAction(trip.id))}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a Day
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 ${destructive ? 'text-red-600 hover:bg-red-500/10' : ''}`}
    >
      {children}
    </button>
  );
}

const timeSlots: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING'];

function AddActivityForm({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => void;
}): React.ReactElement {
  return (
    <form
      action={(formData) => onSubmit(formData)}
      className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3"
    >
      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <label htmlFor="new-activity-title" className="text-xs font-medium">
          Add activity
        </label>
        <Input
          id="new-activity-title"
          name="title"
          required
          placeholder="e.g. Visit the castle"
          className="h-9"
        />
      </div>
      <select
        name="timeSlot"
        aria-label="Time of day"
        defaultValue=""
        className="h-9 rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
      >
        <option value="">Any time</option>
        {timeSlots.map((slot) => (
          <option key={slot} value={slot}>
            {timeSlotLabels[slot]}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Add
      </Button>
    </form>
  );
}

function RefineDayForm({
  onSubmit,
  onCancel,
  disabled,
}: {
  onSubmit: (instruction: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <form
      action={(formData) => onSubmit(String(formData.get('instruction') ?? ''))}
      className="mb-3 flex flex-col gap-2 rounded-md border border-primary/40 bg-accent/40 p-3"
    >
      <label
        htmlFor="refine-instruction"
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        Refine this day with AI
      </label>
      <Input
        id="refine-instruction"
        name="instruction"
        required
        placeholder="e.g. make it less packed and add a museum"
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={disabled}>
          Refine
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ActivityEditForm({
  defaultTitle,
  defaultTimeSlot,
  defaultLocation,
  onSubmit,
  onCancel,
}: {
  defaultTitle: string;
  defaultTimeSlot: TimeSlot | null;
  defaultLocation: string | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}): React.ReactElement {
  return (
    <form
      action={(formData) => onSubmit(formData)}
      className="flex flex-col gap-2 rounded-md border border-primary/40 bg-accent/40 p-3"
    >
      <Input
        name="title"
        required
        aria-label="Activity title"
        defaultValue={defaultTitle}
      />
      <div className="flex flex-wrap gap-2">
        <select
          name="timeSlot"
          aria-label="Time of day"
          defaultValue={defaultTimeSlot ?? ''}
          className="h-9 rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
        >
          <option value="">Any time</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {timeSlotLabels[slot]}
            </option>
          ))}
        </select>
        <Input
          name="locationName"
          placeholder="Location (optional)"
          className="h-9 flex-1"
          defaultValue={defaultLocation ?? ''}
          aria-label="Location"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
