import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center"
    >
      <Compass className="h-10 w-10 text-primary" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't find the page you're looking for.
      </p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Back to home
      </Link>
    </main>
  );
}
