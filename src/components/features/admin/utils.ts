import type { ProfileConfig } from '@/types/platform-config';
import type { AdminPostSummary, PostFormState } from './types';

export const emptyConfig: ProfileConfig = {
  profile: {
    avatar: '/avatar.png',
    bio: '',
    name: '',
  },
  projectSections: [],
  socialLinks: [],
  websiteLinks: [],
};

export function createId(prefix: string) {
  return prefix + '-' + Date.now().toString(36);
}

export function toDatetimeLocal(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function createEmptyPostForm(): PostFormState {
  return {
    content: '',
    date: toDatetimeLocal(),
    description: '',
    draft: false,
    slug: '',
    tags: '',
    title: '',
  };
}

export function parseDateTime(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTimeLabel(
  value: string,
  t: (source: string, params?: Record<string, string | number>) => string,
  language: 'zh-CN' | 'en',
) {
  const date = parseDateTime(value);

  if (!date) {
    return t("invalidDate");
  }

  return date.toLocaleDateString(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatPostDate(
  value: string,
  language: 'zh-CN' | 'en',
  t: (source: string, params?: Record<string, string | number>) => string,
) {
  const date = parseDateTime(value);

  if (!date) {
    return t("unknownDate");
  }

  return date.toLocaleDateString(language);
}

export function getMonthlyPostCounts(
  posts: AdminPostSummary[],
  language: 'zh-CN' | 'en',
) {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const count = posts.filter((post) => {
      const postDate = parseDateTime(post.date);

      return (
        postDate &&
        postDate.getFullYear() === year &&
        postDate.getMonth() === month
      );
    }).length;

    return {
      count,
      label: date.toLocaleDateString(language, { month: 'short' }),
    };
  });
}
