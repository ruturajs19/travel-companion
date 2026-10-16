import { ProfileForm } from '@/components/profile/profile-form';
import { getProfile } from '@/lib/profile';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function ProfilePage(): Promise<React.ReactElement> {
  const profile = await getProfile();
  if (!profile) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how you appear to other travellers.
        </p>
      </header>
      <ProfileForm profile={profile} />
    </div>
  );
}
