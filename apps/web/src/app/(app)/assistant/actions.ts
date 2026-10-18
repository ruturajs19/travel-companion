'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import { askAssistantRequest } from '@/lib/assistant-api';
import { executeWithAuth } from '@/lib/session';
import { GroundedAnswer } from '@travel-companion/contracts';

export interface AssistantResult {
  answer?: GroundedAnswer;
  error?: string;
}

export async function askAssistantAction(
  question: string,
): Promise<AssistantResult> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { error: 'Please enter a question.' };
  }
  try {
    const answer = await executeWithAuth((token) =>
      askAssistantRequest(token, trimmed),
    );
    return { answer };
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return {
        error: 'The server is waking up. Please try again in sometime.',
      };
    }
    if (error instanceof ApiError) {
      if (error.status === 401)
        return {
          error: 'Your session has expired. Please sign in again.',
        };
      if (error.status === 429)
        return {
          error: 'AI request limit reached. Please try again later.',
        };
      if (error.status === 503)
        return {
          error: 'The AI service is temporarily unavailable.',
        };
      if (error.status === 502)
        return {
          error: 'The AI response could not be understood. Please try again.',
        };
    }
    return { error: 'Something went wrong. Please try again.' };
  }
}
