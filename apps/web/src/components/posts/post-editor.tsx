'use client';

import { PostFormState } from '@/app/(app)/posts/actions';
import { Post, TripSummary } from '@travel-companion/contracts';
import { useFormStatus } from 'react-dom';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useActionState } from 'react';

const initialState: PostFormState = {};

export function PostEditor({
  action,
  post,
  trips,
  defaultTripId,
  defaultTitle,
}: {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  post?: Post;
  trips: TripSummary[];
  defaultTripId?: string;
  defaultTitle?: string;
}): React.ReactElement {
  const [state, formAction] = useActionState(action, initialState);

  const markdownError =
    state.fieldErrors?.markdown ??
    state.fieldErrors?.['contentJson.markdown'] ??
    state.fieldErrors?.contentJson;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600"
        >
          {state.error}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title ?? defaultTitle ?? ''}
          required
          placeholder="e.g. Three days in Kyoto"
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state?.fieldErrors?.title ? (
          <p className="text-sm text-red-600">{state.fieldErrors.title}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="markdown" className="text-sm font-medium">
          Content
          <span className="text-muted-foreground">(Markdown supported)</span>
        </label>
        <Textarea
          id="markdown"
          name="markdown"
          rows={16}
          defaultValue={post?.contentJson.markdown ?? ''}
          placeholder={'# My trip\n\nWrite your story here...'}
          className="font-mono"
          aria-invalid={Boolean(markdownError)}
        />
        {markdownError ? (
          <p className="text-sm text-red-600">{markdownError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-sm font-medium">
          Tags <span className="text-muted-foreground">(comma separated)</span>
        </label>
        <Input
          id="tags"
          name="tags"
          defaultValue={post?.tags.join(', ') ?? ''}
          placeholder="japan, food, culture"
          aria-invalid={Boolean(state.fieldErrors?.tags)}
        />
        {state?.fieldErrors?.tags ? (
          <p className="text-sm text-red-600">{state.fieldErrors.tags}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="coverImage" className="text-sm font-medium">
          Cover Image URL
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="coverImage"
          name="coverImage"
          type="url"
          defaultValue={post?.coverImage ?? ''}
          placeholder="https://..."
          aria-invalid={Boolean(state.fieldErrors?.coverImage)}
        />
        {state?.fieldErrors?.coverImage ? (
          <p className="text-sm text-red-600">{state.fieldErrors.coverImage}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="linkedTripId" className="text-sm font-medium">
          Link a trip <span className="text-muted-foreground">(optional)</span>
        </label>
        <select
          id="linkedTripId"
          name="linkedTripId"
          defaultValue={post?.linkedTripId ?? defaultTripId ?? ''}
          className="h-10 w-full rounded-[var(--radius)] border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-invalid={Boolean(state.fieldErrors?.linkedTripId)}
        >
          <option value="">No linked trip</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.title} · {trip.destination}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.linkedTripId ? (
          <p className="text-sm text-red-600">
            {state.fieldErrors.linkedTripId}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <IntentButton intent="draft" variant="outline">
          Save draft
        </IntentButton>
        <IntentButton intent="publish">Publish</IntentButton>
      </div>
    </form>
  );
}

function IntentButton({
  intent,
  children,
  variant,
}: {
  intent: 'draft' | 'publish';
  children: React.ReactNode;
  variant?: 'outline' | 'primary';
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant ?? 'primary'}
      disabled={pending}
    >
      {children}
    </Button>
  );
}
