import { askAssistantAction } from '@/app/(app)/assistant/actions';
import { GroundedAnswer } from '@travel-companion/contracts';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface Turn {
  question: string;
  answer?: GroundedAnswer;
  error?: string;
}

const suggestions = [
  'What are the best things to do in Kyoto?',
  'Suggest a 3-day itinerary for Lisbon',
  'Where should I eat in Rome on a budget?',
];

export function AssistantChat(): React.ReactElement {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [value, setValue] = useState('');
  const [isPending, startTransition] = useTransition();

  function ask(question: string): void {
    const q = question.trim();
    if (!q || isPending) return;
    setValue('');
    setTurns((prev) => [...prev, { question: q }]);
    startTransition(async () => {
      const result = await askAssistantAction(q);
      setTurns((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last) {
          last.answer = result.answer;
          last.error = result.error;
        }
        return next;
      });
    });
  }
  return (
    <div className="flex flex-col gap-4">
      {turns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-6">
          <p className="text-sm text-muted-foreground">
            Ask about destinations, itineraries, or tips. Answers are grounded
            in comunity stories when relevant.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => ask(s)}
                  disabled={isPending}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ol className="flex flex-col gap-4" aria-live="polite">
          {turns.map((turn, index) => (
            <li key={index} className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <User
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-medium">{turn.question}</p>
              </div>
              <div className="flex flex-start gap-2">
                <Bot
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  {turn.error ? (
                    <p role="alert" className="text-sm text-red-600">
                      {turn.error}
                    </p>
                  ) : turn.answer ? (
                    <>
                      <p className="text-sm">{turn.answer.answer}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {turn.answer.grounded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            Grounded in community stories
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            General knowledge
                          </span>
                        )}
                      </div>
                      {turn.answer.sources.length > 0 ? (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Sources
                          </p>
                          <ul className="mt-1 flex flex-col gap-1">
                            {turn.answer.sources.map((source, i) => (
                              <li key={i} className="text-xs">
                                <Link
                                  href={`/blog/${source.sourceId}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {source.snippet.slice(0, 80)}...
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(value);
        }}
        className="flex gap-2"
      >
        <Input
          aria-label="Ask a travel question"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask a travel question..."
          disabled={isPending}
        />
        <Button
          type="submit"
          disabled={isPending || !value.trim()}
          aria-busy={isPending}
        >
          <Send className="h-4 w-4" />
          Ask
        </Button>
      </form>
    </div>
  );
}
