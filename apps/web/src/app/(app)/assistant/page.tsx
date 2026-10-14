import { AssistantChat } from '@/components/assistant/assistant-chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Assistant',
};

export default function AssistantPage(): React.ReactElement {
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
