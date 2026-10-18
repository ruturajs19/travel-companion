'use client';

import {
  ProfileFormState,
  updateProfileAction,
} from '@/app/(app)/profile/actions';
import { useActionState } from 'react';
import type { UserProfile } from '@travel-companion/contracts';
import { Input } from '../ui/input';
import { SubmitButton } from '../auth/submit-button';
import { Textarea } from '../ui/textarea';

const initialState: ProfileFormState = {};

export function ProfileForm({
  profile,
}: {
  profile: UserProfile;
}): React.ReactElement {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
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
      {state.success ? (
        <p
          role="status"
          className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          Profile updated.
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          readOnly
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed here.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Display name
        </label>
        <Input
          id="name"
          type="text"
          defaultValue={profile.name ?? ''}
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
        />
        {state.fieldErrors?.name ? (
          <p id="name-error" className="text-sm text-red-600">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="homeLocation" className="text-sm font-medium">
          Home location
        </label>
        <Input
          id="homeLocation"
          name="homeLocation"
          type="text"
          defaultValue={profile.homeLocation ?? ''}
          placeholder="e.g. Lisbon, Portugal"
          aria-invalid={Boolean(state.fieldErrors?.homeLocation)}
          aria-describedby={
            state.fieldErrors?.homeLocation ? 'homeLocation-error' : undefined
          }
        />
        {state.fieldErrors?.homeLocation ? (
          <p id="homeLocation-error" className="text-sm text-red-600">
            {state.fieldErrors.homeLocation}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="image" className="text-sm font-medium">
          Avatar URL
        </label>
        <Input
          id="image"
          name="image"
          type="url"
          defaultValue={profile.image ?? ''}
          placeholder="https://..."
          aria-invalid={Boolean(state.fieldErrors?.image)}
          aria-describedby={
            state.fieldErrors?.image ? 'image-error' : undefined
          }
        />
        {state.fieldErrors?.image ? (
          <p id="image-error" className="text-sm text-red-600">
            {state.fieldErrors.image}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          placeholder="Tell fellow travellers about yourself"
          maxLength={500}
          aria-invalid={Boolean(state.fieldErrors?.bio)}
          aria-describedby={state.fieldErrors?.bio ? 'bio-error' : undefined}
        />
        {state.fieldErrors?.bio ? (
          <p id="bio-error" className="text-sm text-red-600">
            {state.fieldErrors.bio}
          </p>
        ) : null}
      </div>
      <div>
        <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
      </div>
    </form>
  );
}
