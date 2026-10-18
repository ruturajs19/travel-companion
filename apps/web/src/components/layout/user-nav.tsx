'use client';

import { logoutAction } from '@/app/(auth)/actions';
import { CurrentUser } from '@/lib/current-user';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Map,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function getUserDisplayName(user: CurrentUser | null): string {
  if (!user) return 'Explorer';
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim();
  }
  const prefix = user.email.split('@')[0] ?? '';
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Explorer';
}

export function getUserInitials(user: CurrentUser | null): string {
  if (!user) return 'U';
  if (user.name && user.name.trim().length > 0) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first && last && parts.length >= 2) {
      const firstChar = first[0] ?? '';
      const lastChar = last[0] ?? '';
      return (firstChar + lastChar).toUpperCase();
    }
    if (first) {
      return first.slice(0, 2).toUpperCase();
    }
  }
  return user.email.charAt(0).toUpperCase() || 'U';
}

interface UserNavProps {
  user: CurrentUser;
  showName?: boolean;
  align?: 'left' | 'right';
}

export function UserNav({
  user,
  showName = true,
  align = 'right',
}: UserNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* ── Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex cursor-pointer items-center gap-2 rounded-full p-1 text-left transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:rounded-lg sm:px-2 sm:py-1.5"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`User menu for ${displayName}`}
      >
        {/* Avatar with optional image or initials */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Display Name instead of email */}
        {showName ? (
          <div className="hidden min-w-0 max-w-44 text-left sm:block">
            <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {displayName}
            </p>
          </div>
        ) : null}

        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute top-full mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-foreground p-1.5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-150 z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            backgroundColor: 'var(--color-card, #18181b)',
            opacity: 1,
          }}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 rounded-lg px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          </div>

          <div className="my-1.5 h-px bg-border/80" />

          {/* Quick Nav Links */}
          <div className="space-y-0.5">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserIcon className="h-4 w-4" aria-hidden="true" />
              <span>Profile & Settings</span>
            </Link>

            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/trips"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              <span>My Trips</span>
            </Link>
          </div>

          <div className="my-1.5 h-px bg-border/80" />

          {/* Sign Out Action inside Profile Dropdown */}
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
