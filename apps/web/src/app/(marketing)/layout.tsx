import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getCurrentUser } from '@/lib/current-user';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
