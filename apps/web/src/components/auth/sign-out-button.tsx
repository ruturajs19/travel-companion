import { logoutAction } from '@/app/(auth)/actions';
import { LogOut } from 'lucide-react';

export function SignOutButton(): React.ReactElement {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}
