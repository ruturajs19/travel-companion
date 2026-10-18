import { logoutAction } from '@/app/(auth)/actions';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export function SignOutButton({
  className,
  variant = 'sidebar',
}: {
  className?: string;
  variant?: 'sidebar' | 'outline' | 'ghost' | 'icon';
}): React.ReactElement {
  return (
    <form action={logoutAction} className="inline-block">
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className={cn(
          'inline-flex cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          variant === 'sidebar' &&
            'w-full gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
          variant === 'outline' &&
            'gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground',
          variant === 'ghost' &&
            'gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          variant === 'icon' &&
            'h-8 w-8 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
          className,
        )}
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        {variant !== 'icon' && <span>Sign out</span>}
      </button>
    </form>
  );
}
