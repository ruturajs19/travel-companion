import { PageSkeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactElement {
  return <PageSkeleton rows={5} className="max-w-3xl" />;
}
