'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';
export function SubmitButton({
  children,
  pendingLabel = 'Please wait...',
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}): React.ReactElement {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
