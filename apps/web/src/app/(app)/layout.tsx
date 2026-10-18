import { AppShell } from '@/components/layout/app-shell';
import { getCurrentUser } from '@/lib/current-user';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
