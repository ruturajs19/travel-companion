import 'server-only';
import type { HealthResponse } from '@travel-companion/contracts';

export type { HealthResponse };

const DEFAULT_BASE_URL = 'http://localhost:3001/api/v1';

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiUnreachableError extends Error {
  constructor(message = 'The server is unreachable') {
    super(message);
    this.name = 'ApiUnreachableError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

function resolveBaseUrl(): string {
  return (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BASE_URL
  );
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const base = resolveBaseUrl().replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${base}/${cleanPath}`;
  const timeoutMs = 60_000;

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiUnreachableError();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson =
    response.headers.get('content-type')?.includes('application/json') ?? false;
  const payload: unknown = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorBody = isJson ? (payload as ApiErrorBody) : undefined;
    const message = errorBody
      ? Array.isArray(errorBody.message)
        ? errorBody.message.join(', ')
        : errorBody.message
      : `Request failed with status ${response.status}`;

    throw new ApiError(response.status, errorBody, message);
  }

  return payload as T;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health', { cache: 'no-store' });
}
