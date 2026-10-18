import { logoutAction } from '@/app/(auth)/actions';
import { CurrentUser } from '@/lib/current-user';
import { Compass, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface SiteHeaderProps {
  user?: CurrentUser | null;
}

export function SiteHeader({ user }: SiteHeaderProps): React.ReactElement {
  const navLinks = user
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/trips', label: 'My Trips' },
        { href: '/posts', label: 'My Blog' },
        { href: '/discover', label: 'Discover' },
      ]
    : [
        { href: '/discover', label: 'Discover' },
        { href: '/trips', label: 'Trips' },
        { href: '/posts', label: 'Blog' },
      ];

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-xs sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>TravelCompanion</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 sm:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 font-medium">
                <Compass className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                title={user.email}
              >
                {userInitial}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
