import { CurrentUser } from '@/lib/current-user';
import { UserNav } from '@/components/layout/user-nav';
import { Compass } from 'lucide-react';
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
            <UserNav user={user} showName={true} align="right" />
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
