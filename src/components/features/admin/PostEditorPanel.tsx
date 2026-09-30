'use client';

import { Loader2, Plus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PostFormState } from './types';
import { Field } from './AdminShared';
import { DateTimePicker } from './DateTimePicker';
import { PlateMarkdownEditor } from './PlateMarkdownEditor';
import { useTranslation } from 'react-i18next';
import { slugify } from './utils';

interface PostEditorPanelProps {
  editorKey: number;
  editingSlug: string | null;
  isPublishing: boolean;
  post: PostFormState;
  onCancel: () => void;
  onNewPost: () => void;
  onPostChange: (patch: Partial<PostFormState>) => void;
  onPublish: () => void;
}

export function PostEditorPanel({
  editorKey,
  editingSlug,
  isPublishing,
  onCancel,
  onNewPost,
  onPostChange,
  onPublish,
  post,
}: PostEditorPanelProps) {
  const { t } = useTranslation('admin');

  return (
    <section className="grid gap-5">
      {editingSlug && (
        <div className="flex flex-col gap-3 rounded-lg border border-[#121212]/10 px-4 py-3 text-sm text-[#121212]/70 dark:border-white/10 dark:text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("editingPostsSlugMd", { slug: editingSlug })}</span>
          <Button
            className="gap-2"
            type="button"
            variant="outline"
            onClick={onNewPost}
          >
            <Plus className="size-4" />
            {t("newPost")}
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("title")}>
          <input
            className="admin-input"
            value={post.title}
            onChange={(event) => {
              const title = event.target.value;
              const previousAutoSlug = slugify(post.title);
              const shouldSyncSlug =
                !editingSlug && (!post.slug || post.slug === previousAutoSlug);

              onPostChange({
                ...(shouldSyncSlug ? { slug: slugify(title) } : {}),
                title,
              });
            }}
          />
        </Field>
        <Field label={t("postPath")}>
          <input
            className="admin-input"
            value={post.slug}
            onChange={(event) =>
              onPostChange({ slug: slugify(event.target.value) })
            }
          />
        </Field>
        <Field label={t("publishDate")}>
          <DateTimePicker
            value={post.date}
            onChange={(date) => onPostChange({ date })}
          />
        </Field>
        <Field label={t("tags")}>
          <input
            className="admin-input"
            placeholder="Design, Life"
            value={post.tags}
            onChange={(event) => onPostChange({ tags: event.target.value })}
          />
        </Field>
      </div>

      <Field label={t("summary")}>
        <textarea
          className="admin-input min-h-24 resize-y"
          value={post.description}
          onChange={(event) => onPostChange({ description: event.target.value })}
        />
      </Field>

      <PlateMarkdownEditor
        key={editorKey}
        markdown={post.content}
        onMarkdownChange={(content) => onPostChange({ content })}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <label className="flex items-center gap-2 text-sm text-[#121212]/70 dark:text-white/70">
            <input
              checked={post.draft}
              className="size-4 accent-[#121212] dark:accent-white"
              type="checkbox"
              onChange={(event) => onPostChange({ draft: event.target.checked })}
            />
            {t("saveAsDraft")}
          </label>
          <p className="text-xs text-[#121212]/45 dark:text-white/45">
            {t("draftVisibilityHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            className="gap-2"
            disabled={isPublishing}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="size-4" />
            {t("cancel")}
          </Button>
          <Button
            className="gap-2"
            disabled={isPublishing}
            type="button"
            variant="outline"
            onClick={onPublish}
          >
            {isPublishing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {editingSlug ? t("updatePost") : t("publishPost")}
          </Button>
        </div>
      </div>
    </section>
  );
}
