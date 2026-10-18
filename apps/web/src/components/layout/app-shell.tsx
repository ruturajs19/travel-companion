'use client';

import { CurrentUser } from '@/lib/current-user';
import {
  getUserDisplayName,
  getUserInitials,
  UserNav,
} from '@/components/layout/user-nav';
import {
  Bot,
  Compass,
  LayoutDashboard,
  Map,
  Menu,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trips', label: 'My Trips', icon: Map },
  { href: '/posts', label: 'My Blog', icon: NotebookPen },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tc_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keyboard shortcut (Ctrl+B or Cmd+B) to toggle sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tc_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const displayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* ── Mobile Top Header ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Travel Companion</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <UserNav user={user} showName={false} align="right" />
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

      {/* ── Mobile Slide-Out Drawer ── */}
      {mobileOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex sm:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-10 flex w-72 max-w-[80vw] flex-col border-r border-border bg-card p-4 shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 font-semibold"
              >
                <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Travel Companion</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border pt-4">
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20"
                    title={displayName}
                  >
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-semibold text-foreground"
                      title={displayName}
                    >
                      {displayName}
                    </p>
                    <p
                      className="truncate text-[10px] text-muted-foreground"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Desktop Collapsible Sidebar (Fixed) ── */}
      <aside
        className={`sticky top-0 z-20 hidden h-dvh shrink-0 self-start flex-col border-r border-border bg-background p-3 transition-[width] duration-200 ease-in-out sm:flex overflow-y-auto ${
          collapsed ? 'w-18' : 'w-60'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="mb-6 flex items-center justify-between px-1">
          {collapsed ? (
            <Link
              href="/"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              title="Travel Companion - Home"
            >
              <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
            </Link>
          ) : (
            <div className="flex w-full items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Compass className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Travel Companion</span>
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`group flex items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed
                    ? 'mx-auto h-10 w-10 justify-center p-0'
                    : 'gap-3 px-3 py-2'
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-primary' : ''
                  }`}
                  aria-hidden="true"
                />
                {!collapsed ? (
                  <span className="truncate">{link.label}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="mt-auto border-t border-border pt-3">
          {user ? (
            <Link
              href="/profile"
              title={collapsed ? displayName : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted ${
                collapsed ? 'justify-center p-1.5' : ''
              }`}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20"
                title={displayName}
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground"
                    title={displayName}
                  >
                    {displayName}
                  </p>
                  <p
                    className="truncate text-[10px] text-muted-foreground"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              ) : null}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              title={collapsed ? 'Sign in' : undefined}
              className={`flex items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors ${
                collapsed ? 'h-9 w-9 p-0 mx-auto' : 'w-full py-2'
              }`}
            >
              {!collapsed ? 'Sign in' : <User className="h-4 w-4" />}
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Top Header Bar (Fixed / Sticky) */}
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-border/70 bg-background/80 px-6 backdrop-blur-md sm:flex">
          <div className="flex items-center gap-3">
            {collapsed ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            ) : null}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Travel Companion Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <UserNav user={user} showName={true} align="right" />
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
