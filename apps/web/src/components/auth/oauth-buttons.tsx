import { Code, Search } from 'lucide-react';

function oauthUrl(provider: 'github' | 'google'): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  return `${base}/auth/${provider}`;
}

export function OAuthButtons(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={oauthUrl('github')}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] border border-border text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Code className="h-4 w-4" />
        Continue with Github
      </a>
      <a
        href={oauthUrl('google')}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] border border-border text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Search className="h-4 w-4" />
        Continue with Google
      </a>
    </div>
  );
}
