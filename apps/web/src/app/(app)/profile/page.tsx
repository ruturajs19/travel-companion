import { ProfileForm } from '@/components/profile/profile-form';
import { getProfile } from '@/lib/profile';
import { Compass, Globe, Mail, MapPin, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function ProfilePage(): Promise<React.ReactElement> {
  const profile = await getProfile();
  if (!profile) redirect('/sign-in');

  const userInitial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  const displayName = profile.name || profile.email.split('@')[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Travel Cover Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="relative h-44 w-full bg-linear-to-r from-teal-800 via-emerald-700 to-cyan-800 sm:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Scenic mountain landscape banner"
            className="h-full w-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Travel Explorer</span>
          </div>
        </div>

        {/* Identity & Overlapping Avatar */}
        <div className="relative px-6 pb-6 pt-12 sm:px-8">
          <div className="absolute -top-12 left-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card text-3xl font-extrabold text-primary shadow-lg sm:left-8">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                {profile.homeLocation ? (
                  <span className="flex items-center gap-1 text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.homeLocation}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    Global Explorer
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                Verified Traveler
              </span>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </div>

      {/* Edit Profile Form Card */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <header className="mb-6 border-b border-border/60 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Profile Settings
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Update your public persona, display name, bio, and hometown.
          </p>
        </header>
        <ProfileForm profile={profile} />
      </section>
    </div>
  );
}
