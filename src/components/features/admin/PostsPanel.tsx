'use client';

import { Eye, EyeOff, ExternalLink, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminNotice } from './AdminShared';
import type { AdminPostSummary } from './types';
import { useTranslation } from 'react-i18next';
import { formatPostDate } from './utils';

export function PostsPanel({
  isLoading,
  mutatingSlug,
  onDeletePost,
  onEditPost,
  onNewPost,
  onRefresh,
  onToggleVisibility,
  posts,
}: {
  isLoading: boolean;
  mutatingSlug: string | null;
  onDeletePost: (slug: string) => void | Promise<void>;
  onEditPost: (slug: string) => void | Promise<void>;
  onNewPost: () => void;
  onRefresh: () => void | Promise<void>;
  onToggleVisibility: (post: AdminPostSummary) => void | Promise<void>;
  posts: AdminPostSummary[];
}) {
  const { t, i18n } = useTranslation('admin');
  const language: 'en' | 'zh-CN' = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 border-b border-[#121212]/10 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium">{t("postList")}</h2>
          <p className="mt-1 text-sm text-[#121212]/50 dark:text-white/50">
            {t("postDirectoryDescription")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2"
            type="button"
            variant="outline"
            onClick={() => void onRefresh()}
          >
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            {t("refresh")}
          </Button>
          <Button className="gap-2" type="button" onClick={onNewPost}>
            <Plus className="size-4" />
            {t("newPost")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#121212]/10 px-4 py-6 text-sm text-[#121212]/60 dark:border-white/10 dark:text-white/60">
          <Loader2 className="size-4 animate-spin" />
          {t("loadingPostList")}
        </div>
      ) : posts.length ? (
        <div className="grid gap-3">
          {posts.map((post) => {
            const isMutating = mutatingSlug === post.slug;

            return (
              <article
                key={post.path}
                className="grid gap-4 rounded-lg border border-[#121212]/10 p-4 dark:border-white/10 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-medium">
                      {post.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        post.draft
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                      }`}
                    >
                      {post.draft ? t("draft") : t("public")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#121212]/50 dark:text-white/50">
                    {post.path}
                  </p>
                  {post.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-[#121212]/70 dark:text-white/70">
                      {post.description}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[#121212]/5 px-2 py-0.5 text-xs text-[#121212]/60 dark:bg-white/10 dark:text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <time className="text-sm text-[#121212]/50 dark:text-white/50">
                    {formatPostDate(post.date, language, t)}
                  </time>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      aria-label={t("editPost")}
                      className="size-9 p-0"
                      disabled={isMutating}
                      title={t("editPost")}
                      type="button"
                      variant="outline"
                      onClick={() => void onEditPost(post.slug)}
                    >
                      {isMutating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Pencil className="size-4" />
                      )}
                    </Button>
                    <Button
                      aria-label={post.draft ? t("makePublic") : t("makeDraft")}
                      className="size-9 p-0"
                      disabled={isMutating}
                      title={post.draft ? t("makePublic") : t("makeDraft")}
                      type="button"
                      variant="outline"
                      onClick={() => void onToggleVisibility(post)}
                    >
                      {post.draft ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </Button>
                    {!post.draft && (
                      <Button
                        asChild
                        aria-label={t("viewPost")}
                        className="size-9 p-0"
                        title={t("viewPost")}
                        type="button"
                        variant="outline"
                      >
                        <a
                          href={`/posts/${post.slug}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      aria-label={t("deletePost")}
                      className="size-9 p-0 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                      disabled={isMutating}
                      title={t("deletePost")}
                      type="button"
                      variant="outline"
                      onClick={() => void onDeletePost(post.slug)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <AdminNotice>
          {t("noPostsInTargetBranch")}
        </AdminNotice>
      )}
    </section>
  );
}
