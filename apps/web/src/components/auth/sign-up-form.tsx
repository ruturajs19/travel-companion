'use client';

import { Input } from '@/components/ui/input';
import { useActionState } from 'react';
import { AuthFormState, registerAction } from '@/app/(auth)/actions';
import { SubmitButton } from './submit-button';

const initialState: AuthFormState = {};

export function SignUpForm(): React.ReactElement {
  const [state, formAction] = useActionState(registerAction, initialState);

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input id="name" type="text" name="name" autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? 'email-error' : undefined
          }
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className="text-sm text-red-600">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? 'password-error' : 'password-hint'
          }
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className="text-sm text-red-600">
            {state.fieldErrors.password}
          </p>
        ) : (
          <p id="password-hint" className="text-sm text-muted-foreground">
            At least 8 characters.
          </p>
        )}
      </div>
      <SubmitButton pendingLabel="Creating account...">
        Create account
      </SubmitButton>
    </form>
  );
}
