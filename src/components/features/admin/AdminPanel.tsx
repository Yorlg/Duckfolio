'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  BarChart3,
  ChevronDown,
  Globe2,
  Home,
  ImageIcon,
  List,
  Lock,
  LogIn,
  LogOut,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProfileConfig } from '@/types/platform-config';
import { AdminNoticeStack } from './AdminNoticeStack';
import { NavButton } from './AdminShared';
import {
  readAdminResponse,
  uploadPendingMediaAndRewriteContent,
} from './admin-api';
import { ConfigPanel } from './ConfigPanel';
import { DashboardPanel } from './DashboardPanel';
import { MediaPanel } from './MediaPanel';
import { PostEditorPanel } from './PostEditorPanel';
import { PostsPanel } from './PostsPanel';
import type {
  AdminPostSummary,
  AdminStatus,
  ApiPostResponse,
  ApiPostsResponse,
  ApiStatusResponse,
  Tab,
} from './types';
import {
  createEmptyPostForm,
  emptyConfig,
  parseDateTime,
  toDatetimeLocal,
} from './utils';
import { useTranslation } from 'react-i18next';
import { adminMessageKeys } from '@/lib/admin/message-keys';

const PUBLISH_LIST_REFRESH_DELAY_MS = 1600;
type MessageType = 'success' | 'error' | 'warning' | 'info';

export function AdminPanel() {
  const { t } = useTranslation('admin');
  const [tab, setTab] = useState<Tab>('home');
  const [adminToken, setAdminToken] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [config, setConfig] = useState<ProfileConfig>(emptyConfig);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [posts, setPosts] = useState<AdminPostSummary[]>([]);
  const [post, setPost] = useState(createEmptyPostForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [mutatingPostSlug, setMutatingPostSlug] = useState<string | null>(null);
  const skipNextPostsAutoLoadRef = useRef(false);
  const pendingPublishedPostRef = useRef<AdminPostSummary | null>(null);

  const notify = useCallback((content: string, type: MessageType = 'info') => {
    if (!content) {
      return;
    }

    toast[type](content);
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    setIsVerifying(true);

    try {
      const response = await fetch('/api/admin/verify', {
        headers: { 'x-admin-token': token },
        method: 'POST',
      });

      if (response.ok) {
        setAdminToken(token);
        window.localStorage.setItem('duckfolio-admin-token', token);
        setUnlocked(true);
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    if (!loginInput.trim()) {
      notify(t("enterAdminPassword"), 'warning');
      return;
    }

    const ok = await verifyToken(loginInput.trim());

    if (!ok) {
      notify(t("incorrectAdminPassword"), 'error');
    }
  }, [loginInput, notify, t, verifyToken]);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem('duckfolio-admin-token');
    setAdminToken('');
    setLoginInput('');
    setUnlocked(false);
  }, []);

  useEffect(() => {
    const storedToken = window.localStorage.getItem('duckfolio-admin-token');

    if (storedToken) {
      void verifyToken(storedToken).then((ok) => {
        if (!ok) {
          window.localStorage.removeItem('duckfolio-admin-token');
        }
      });
    }

    fetch('/api/admin/status')
      .then((response) =>
        readAdminResponse<ApiStatusResponse>(response, t("failedToLoadAdminStatus")),
      )
      .then((data) => {
        setStatus(data.status);
        setConfig(data.config);
      })
      .catch((error) => {
        notify(
          error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToLoadAdminStatus"),
          'error',
        );
      });
  }, [notify, t, verifyToken]);

  const targetText = useMemo(() => {
    if (!status) {
      return t("loadingPublishingTarget");
    }

    if (status.mode === 'github') {
      return `${status.repo} / ${status.branch}`;
    }

    return t("localConfigurationEditingMode");
  }, [status, t]);

  const notices = useMemo<ReactNode[]>(() => {
    const nextNotices: ReactNode[] = [];

    if (!status?.hasAdminPassword) {
      nextNotices.push(
        t("missingAdminPasswordNotice"),
      );
    }

    if (!status?.hasGitHubConfig) {
      nextNotices.push(
        t("missingGitHubConfigNotice"),
      );
    }

    return nextNotices;
  }, [status?.hasAdminPassword, status?.hasGitHubConfig, t]);

  const updatePost = (patch: Partial<typeof post>) => {
    setPost((current) => ({
      ...current,
      ...patch,
    }));
  };

  const resetPostForm = useCallback(() => {
    setPost(createEmptyPostForm());
    setEditingSlug(null);
    setEditorKey((current) => current + 1);
    setTab('post');
  }, []);

  const clearPostForm = useCallback(() => {
    setPost(createEmptyPostForm());
    setEditingSlug(null);
    setEditorKey((current) => current + 1);
  }, []);

  const cancelPostEditing = useCallback(() => {
    clearPostForm();
    setTab('posts');
  }, [clearPostForm]);

  const loadPosts = useCallback(
    async (options?: { keepMessage?: boolean; silentError?: boolean }) => {
      if (!adminToken) {
        setPosts([]);
        return;
      }

      setIsLoadingPosts(true);

      try {
        const response = await fetch('/api/admin/posts', {
          headers: {
            'x-admin-token': adminToken,
          },
        });
        const data = await readAdminResponse<ApiPostsResponse>(
          response,
          t("failedToLoadThePostList"),
        );

        const nextPosts = data.posts || [];
        const pendingPost = pendingPublishedPostRef.current;
        const hasPendingPost =
          pendingPost &&
          nextPosts.some((item) => item.slug === pendingPost.slug);

        if (hasPendingPost) {
          pendingPublishedPostRef.current = null;
        }

        setPosts(
          pendingPost && !hasPendingPost
            ? [
                pendingPost,
                ...nextPosts.filter((item) => item.slug !== pendingPost.slug),
              ]
            : nextPosts,
        );
      } catch (error) {
        if (!options?.silentError) {
          notify(
            error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToLoadThePostList"),
            'error',
          );
        }
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [adminToken, notify, t],
  );

  const editPost = async (slug: string) => {
    if (!adminToken) {
      notify(t("adminPasswordRequired"), 'warning');
      return;
    }

    setMutatingPostSlug(slug);

    try {
      const response = await fetch(
        `/api/admin/posts?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            'x-admin-token': adminToken,
          },
        },
      );
      const data = await readAdminResponse<ApiPostResponse>(
        response,
        t("failedToLoadThePost"),
      );

      const detail = data.post;
      const date = parseDateTime(detail.date) ?? new Date();

      setPost({
        content: detail.content,
        date: toDatetimeLocal(date),
        description: detail.description,
        draft: detail.draft,
        slug: detail.slug,
        tags: detail.tags.join(', '),
        title: detail.title,
      });
      setEditingSlug(detail.slug);
      setEditorKey((current) => current + 1);
      setTab('post');
    } catch (error) {
      notify(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToLoadThePost"),
        'error',
      );
    } finally {
      setMutatingPostSlug(null);
    }
  };

  const togglePostVisibility = async (targetPost: AdminPostSummary) => {
    if (!adminToken) {
      notify(t("adminPasswordRequired"), 'warning');
      return;
    }

    const nextDraft = !targetPost.draft;
    setMutatingPostSlug(targetPost.slug);

    try {
      const response = await fetch('/api/admin/posts', {
        body: JSON.stringify({
          draft: nextDraft,
          operation: 'visibility',
          slug: targetPost.slug,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        method: 'PATCH',
      });
      const data = await readAdminResponse<{ message?: string }>(
        response,
        t("failedToUpdatePostStatus"),
      );

      setPosts((current) =>
        current.map((item) =>
          item.slug === targetPost.slug ? { ...item, draft: nextDraft } : item,
        ),
      );

      if (editingSlug === targetPost.slug) {
        updatePost({ draft: nextDraft });
      }

      notify(data.message ? t(adminMessageKeys[data.message] ?? data.message) : t('postStatusUpdated'), 'success');
    } catch (error) {
      notify(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToUpdatePostStatus"),
        'error',
      );
    } finally {
      setMutatingPostSlug(null);
    }
  };

  const deletePost = async (slug: string) => {
    if (!adminToken) {
      notify(t("adminPasswordRequired"), 'warning');
      return;
    }

    if (
      !window.confirm(
        t("confirmDeletePost", { slug }),
      )
    ) {
      return;
    }

    setMutatingPostSlug(slug);

    try {
      const response = await fetch(
        `/api/admin/posts?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            'x-admin-token': adminToken,
          },
          method: 'DELETE',
        },
      );
      const data = await readAdminResponse<{ message?: string }>(
        response,
        t("failedToDeleteThePost"),
      );

      setPosts((current) => current.filter((item) => item.slug !== slug));
      if (pendingPublishedPostRef.current?.slug === slug) {
        pendingPublishedPostRef.current = null;
      }

      if (editingSlug === slug) {
        clearPostForm();
      }

      notify(data.message ? t(adminMessageKeys[data.message] ?? data.message) : t('postDeleted'), 'success');
    } catch (error) {
      notify(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToDeleteThePost"),
        'error',
      );
    } finally {
      setMutatingPostSlug(null);
    }
  };

  useEffect(() => {
    if (tab === 'home' || tab === 'posts') {
      if (skipNextPostsAutoLoadRef.current) {
        skipNextPostsAutoLoadRef.current = false;
        return;
      }

      void loadPosts();
    }
  }, [loadPosts, tab]);

  const publishPost = async () => {
    setIsPublishing(true);

    try {
      const finalContent = await uploadPendingMediaAndRewriteContent(
        post.content,
        adminToken,
      );
      const publishedDate = new Date(post.date || Date.now()).toISOString();
      const postTags = post.tags
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch('/api/admin/posts', {
        body: JSON.stringify({
          content: finalContent,
          date: publishedDate,
          description: post.description,
          draft: post.draft,
          originalSlug: editingSlug,
          slug: post.slug,
          tags: postTags,
          title: post.title,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        method: 'POST',
      });
      const data = await readAdminResponse<{
        message?: string;
        result?: {
          mode?: string;
          path?: string;
          repo?: string;
        };
        slug?: string;
        cleanupError?: string;
      }>(response, t("failedToPublishThePost"));

      const targetMessage = data.result
        ? data.result.mode === 'github'
          ? t("pushedToRepoPath", {
              path: data.result.path ?? '',
              repo: data.result.repo ?? '',
            })
          : t("writtenToPath", { path: data.result.path ?? '' })
        : t("postSaved");

      const publishedMessage = data.cleanupError
        ? t('postSavedOldPathCleanupFailed', {
            reason: t(adminMessageKeys[data.cleanupError] ?? data.cleanupError),
          })
        : data.message
          ? t(adminMessageKeys[data.message] ?? data.message)
          : '';
      const successMessage = publishedMessage
        ? publishedMessage + ' ' + targetMessage
        : targetMessage;
      const publishedSlug = data.slug || post.slug;
      const publishedPost: AdminPostSummary = {
        date: publishedDate,
        description: post.description,
        draft: post.draft,
        path: data.result?.path || `posts/${publishedSlug}.md`,
        slug: publishedSlug,
        tags: postTags,
        title: post.title,
      };

      clearPostForm();
      pendingPublishedPostRef.current = publishedPost;
      setPosts((current) => [
        publishedPost,
        ...current.filter((item) => item.slug !== publishedSlug),
      ]);
      skipNextPostsAutoLoadRef.current = true;
      setTab('posts');
      notify(successMessage, 'success');
      window.setTimeout(() => {
        void loadPosts({ keepMessage: true, silentError: true });
      }, PUBLISH_LIST_REFRESH_DELAY_MS);
    } catch (error) {
      notify(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToPublishThePost"),
        'error',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const saveConfig = async () => {
    setIsSavingConfig(true);

    try {
      const response = await fetch('/api/admin/config', {
        body: JSON.stringify(config),
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        method: 'POST',
      });
      const data = await readAdminResponse<{
        result?: {
          mode?: string;
          path?: string;
          repo?: string;
        };
      }>(response, t("failedToSaveConfiguration"));

      notify(
        data.result
          ? data.result.mode === 'github'
            ? t("configurationPushedToRepoPath", {
                path: data.result.path ?? '',
                repo: data.result.repo ?? '',
              })
            : t("configurationWrittenToPath", { path: data.result.path ?? '' })
          : t("configurationSaved"),
        'success',
      );
    } catch (error) {
      notify(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToSaveConfiguration"),
        'error',
      );
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#121212] dark:bg-black dark:text-white">
        <Toaster closeButton richColors position="top-center" />
        <div className="mx-auto w-full max-w-sm px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#121212]/5 dark:bg-white/10">
              <Lock
                size={28}
                className="text-[#121212]/40 dark:text-white/40"
              />
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider text-[#121212]/40 dark:text-white/40">
                Duckfolio Admin
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{t("administratorVerification")}</h1>
            </div>
            <div className="flex w-full flex-col gap-3">
              <input
                className="w-full rounded-lg border border-[#121212]/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[#121212]/30 placeholder:text-[#121212]/30 dark:border-white/10 dark:focus:border-white/30 dark:placeholder:text-white/30"
                placeholder={t("enterAdministratorPassphrase")}
                type="password"
                value={loginInput}
                onChange={(event) => setLoginInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleLogin();
                  }
                }}
              />
              <Button
                className="w-full rounded-lg bg-[#121212] py-3 text-sm text-white transition-colors hover:bg-[#121212]/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
                disabled={isVerifying}
                type="button"
                onClick={handleLogin}
              >
                {isVerifying ? (
                  t("verifying")
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogIn size={16} />
                    {t("enterAdminPanel")}
                  </span>
                )}
              </Button>
              <Button
                asChild
                className="w-full rounded-lg text-sm"
                variant="ghost"
              >
                <Link href="/">
                  <Home size={16} />
                  {t("backToHome")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#121212] dark:bg-black dark:text-white">
      <Toaster closeButton richColors position="top-center" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="flex flex-col gap-4 border-b border-[#121212]/10 pb-6 dark:border-white/10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-[#121212]/40 dark:text-white/40">
              Duckfolio Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{t("contentManagement")}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex min-w-0 flex-1 items-center gap-2 rounded border border-[#121212]/10 px-3 py-2 text-sm text-[#121212]/60 dark:border-white/10 dark:text-white/60">
              <Globe2 size={16} className="shrink-0" />
              <span className="truncate">{targetText}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="inline-flex items-center gap-2 rounded border border-[#121212]/10 px-3 py-2 text-sm text-[#121212]/60 hover:text-[#121212] dark:border-white/10 dark:text-white/60 dark:hover:text-white"
                  variant="ghost"
                >
                  {t("actions")}
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home size={16} />
                    {t("backToHome")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut size={16} />
                  {t("logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <AdminNoticeStack notices={notices} />

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="grid min-w-0 grid-cols-2 gap-2 md:w-[220px] md:shrink-0 md:grid-cols-1 md:self-start">
            <NavButton
              active={tab === 'home'}
              icon={<BarChart3 size={18} />}
              label={t("dashboard")}
              onClick={() => setTab('home')}
            />
            <NavButton
              active={tab === 'posts'}
              icon={<List size={18} />}
              label={t("postList")}
              onClick={() => setTab('posts')}
            />
            <NavButton
              active={tab === 'media'}
              icon={<ImageIcon size={18} />}
              label={t("mediaLibrary")}
              onClick={() => setTab('media')}
            />
            <NavButton
              active={tab === 'config'}
              icon={<Settings2 size={18} />}
              label={t("siteConfiguration")}
              onClick={() => setTab('config')}
            />
          </aside>

          <div className="min-w-0 flex-1">
          {tab === 'home' ? (
            <DashboardPanel isLoading={isLoadingPosts} posts={posts} />
          ) : tab === 'post' ? (
            <PostEditorPanel
              editorKey={editorKey}
              editingSlug={editingSlug}
              isPublishing={isPublishing}
              post={post}
              onCancel={cancelPostEditing}
              onNewPost={resetPostForm}
              onPostChange={updatePost}
              onPublish={publishPost}
            />
          ) : tab === 'posts' ? (
            <PostsPanel
              isLoading={isLoadingPosts}
              mutatingSlug={mutatingPostSlug}
              posts={posts}
              onDeletePost={deletePost}
              onEditPost={editPost}
              onNewPost={resetPostForm}
              onRefresh={loadPosts}
              onToggleVisibility={togglePostVisibility}
            />
          ) : tab === 'media' ? (
            <MediaPanel adminToken={adminToken} />
          ) : (
            <ConfigPanel
              adminToken={adminToken}
              config={config}
              isSaving={isSavingConfig}
              onConfigChange={setConfig}
              onSave={saveConfig}
            />
          )}
          </div>
        </div>
      </div>
    </main>
  );
}
