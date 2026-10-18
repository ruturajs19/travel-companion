import { SignOutButton } from '@/components/auth/sign-out-button';
import { getCurrentUser } from '@/lib/current-user';
import {
  Bot,
  Compass,
  LayoutDashboard,
  Map,
  NotebookPen,
  Search,
  User,
} from 'lucide-react';
import Link from 'next/link';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trips', label: 'My Trips', icon: Map },
  { href: '/posts', label: 'My Blog', icon: NotebookPen },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/profile', label: 'Profile', icon: User },
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  const userInitial = user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* Mobile Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:hidden">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Travel Companion</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                title={user.email}
              >
                {userInitial}
              </div>
              <SignOutButton variant="outline" />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background/80 px-2 py-1.5 backdrop-blur-xs sm:hidden">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <link.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-4 sm:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
          <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Travel Companion</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                  title={user.email}
                >
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium text-foreground"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <SignOutButton variant="sidebar" />
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex w-full items-center justify-center rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Top Header */}
        <header className="hidden h-14 items-center justify-between border-b border-border/70 bg-background/60 px-6 backdrop-blur-xs sm:flex">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Travel Companion Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                    title={user.email}
                  >
                    {userInitial}
                  </div>
                  <span
                    className="max-w-48 truncate text-xs font-medium text-foreground"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                </div>
                <SignOutButton variant="outline" />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
