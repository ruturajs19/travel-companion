import { AssistantChat } from '@/components/assistant/assistant-chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Your trips, drafts, and activity will appear here. Features are added in
        upcoming tasks.
      </p>
    </div>
  );
}
