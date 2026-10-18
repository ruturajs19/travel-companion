import { PageSkeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactElement {
  return <PageSkeleton rows={3} className="max-w-3xl" />;
}
