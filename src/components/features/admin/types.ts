import type { ProfileConfig } from '@/types/platform-config';

export type Tab = 'home' | 'post' | 'posts' | 'media' | 'photos' | 'config';

export interface AdminStatus {
  branch: string;
  hasAdminPassword: boolean;
  hasGitHubConfig: boolean;
  mode: 'github' | 'local';
  repo?: string;
}

export interface ApiStatusResponse {
  config: ProfileConfig;
  status: AdminStatus;
}

export interface AdminPostSummary {
  date: string;
  description: string;
  draft: boolean;
  path: string;
  slug: string;
  tags: string[];
  title: string;
}

export interface AdminPostDetail extends AdminPostSummary {
  content: string;
}

export interface ApiPostsResponse {
  posts: AdminPostSummary[];
}

export interface ApiPostResponse {
  post: AdminPostDetail;
}

export interface PostFormState {
  content: string;
  date: string;
  description: string;
  draft: boolean;
  slug: string;
  tags: string;
  title: string;
}
