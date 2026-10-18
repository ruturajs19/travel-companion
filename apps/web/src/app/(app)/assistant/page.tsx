import { AssistantChat } from '@/components/assistant/assistant-chat';
import { getCurrentUser } from '@/lib/current-user';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'AI Assistant',
};

export default async function AssistantPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask travel questions. Answers draw on published comunity stories when
          relevant.
        </p>
      </header>
      <AssistantChat />
    </div>
  );
}
