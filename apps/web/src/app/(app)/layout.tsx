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
import { redirect } from 'next/navigation';

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
  if (!user) {
    redirect('/sign-in');
  }
  return (
    <div className="flex min-h-dvh">
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
        <div className="mt-auto border-t border-border pt-6">
          <p
            className="truncate px-3 pb-2 text-xs text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <main id="main-content" className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
