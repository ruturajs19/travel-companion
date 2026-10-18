import type { GroundedAnswer } from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function askAssistantRequest(
  token: string,
  question: string,
): Promise<GroundedAnswer> {
  return apiFetch<GroundedAnswer>('/assistant/ask', {
    method: 'POST',
    body: { question },
    token,
    cache: 'no-store',
  });
}
