import { PaginatedPosts, PostSummary } from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function getDiscoverFeed(params: {
  tag?: string;
  page?: string;
}): Promise<PaginatedPosts> {
  const search = new URLSearchParams();
  if (params.tag) {
    search.set('tag', params.tag);
  }
  if (params.page) {
    search.set('page', String(params.page));
  }
  const qs = search.toString();

  return apiFetch<PaginatedPosts>(`/discover${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
}

export function searchPosts(q: string): Promise<PostSummary[]> {
  return apiFetch<PostSummary[]>(
    `/discover/search?q=${encodeURIComponent(q)}`,
    {
      cache: 'no-store',
    },
  );
}
