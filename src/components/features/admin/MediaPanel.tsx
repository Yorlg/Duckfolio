'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileIcon,
  ImageIcon,
  Loader2,
  Music,
  RefreshCw,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { MediaFileSummary } from '@/lib/admin/content';
import { readAdminResponse } from './admin-api';
import { useTranslation } from 'react-i18next';
import { adminMessageKeys } from '@/lib/admin/message-keys';

interface MediaPanelProps {
  adminToken: string;
}

export function MediaPanel({ adminToken }: MediaPanelProps) {
  const { t } = useTranslation('admin');
  const [files, setFiles] = useState<MediaFileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    if (!adminToken) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/media', {
        headers: { 'x-admin-token': adminToken },
      });
      const data = await readAdminResponse<{ files: MediaFileSummary[] }>(
        response,
        t("failedToLoadMediaList"),
      );

      setFiles(data.files || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToLoadMediaList"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [adminToken, t]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleUpload = async (fileList: FileList) => {
    if (!adminToken || fileList.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          body: formData,
          headers: { 'x-admin-token': adminToken },
          method: 'POST',
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(data.message ? t(adminMessageKeys[data.message] ?? data.message) : t('failedToUploadName', { name: file.name }));
        }
      }

      toast.success(t("filesUploadedSuccessfully"));
      void loadFiles();
    } catch (error) {
      toast.error(error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToUploadFiles"));
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (mediaPath: string) => {
    if (!adminToken) return;

    if (!window.confirm(t("confirmDeleteMedia", { path: mediaPath }))) {
      return;
    }

    setDeletingPath(mediaPath);

    try {
      const response = await fetch(
        `/api/admin/media?path=${encodeURIComponent(mediaPath)}`,
        {
          headers: { 'x-admin-token': adminToken },
          method: 'DELETE',
        },
      );
      const data = await readAdminResponse<{ message?: string }>(
        response,
        t("failedToDeleteMediaFile"),
      );

      setFiles((current) => current.filter((file) => file.path !== mediaPath));
      toast.success(data.message ? t(adminMessageKeys[data.message] ?? data.message) : t('mediaFileDeleted'));
    } catch (error) {
      toast.error(
        error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToDeleteMediaFile"),
      );
    } finally {
      setDeletingPath(null);
    }
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  };

  return (
    <section className="grid gap-5">
      <div className="flex items-center justify-between border-b border-[#121212]/10 pb-3 dark:border-white/10">
        <h2 className="text-lg font-medium">{t("mediaLibrary")}</h2>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            disabled={isLoading}
            type="button"
            variant="outline"
            onClick={loadFiles}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {t("refresh")}
          </Button>
          <Button
            className="gap-2"
            disabled={isUploading}
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {t("uploadFiles")}
          </Button>
          <input
            ref={fileInputRef}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => {
              if (event.target.files) {
                void handleUpload(event.target.files);
              }
            }}
          />
        </div>
      </div>

      {isLoading && files.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#121212]/40 dark:text-white/40">
          <Loader2 size={20} className="mr-2 animate-spin" />
          {t("loading")}
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#121212]/40 dark:text-white/40">
          {t("noMediaFiles")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.path}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#121212]/10 dark:border-white/10"
            >
              <div className="flex h-36 items-center justify-center bg-[#121212]/3 dark:bg-white/5">
                {file.type.startsWith('image/') ? (
                  <img
                    alt={file.name}
                    className="h-full w-full object-contain"
                    src={file.url}
                  />
                ) : (
                  <MediaTypeIcon type={file.type} />
                )}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-[#121212]/40 dark:text-white/40">
                  {formatFileSize(file.size)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-7 flex-1 text-xs"
                    type="button"
                    variant="outline"
                    onClick={() => copyUrl(file.url)}
                  >
                    {t("copyLink")}
                  </Button>
                  <Button
                    aria-label={t("delete")}
                    className="h-7 w-7 text-[#121212]/50 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:text-white/50 dark:hover:text-red-300"
                    disabled={deletingPath === file.path}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => handleDelete(file.path)}
                  >
                    {deletingPath === file.path ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MediaTypeIcon({ type }: { type: string }) {
  const className = 'size-10 text-[#121212]/20 dark:text-white/20';

  if (type.startsWith('video/')) return <Video className={className} />;
  if (type.startsWith('audio/')) return <Music className={className} />;
  if (type.startsWith('image/')) return <ImageIcon className={className} />;

  return <FileIcon className={className} />;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(i > 0 ? 1 : 0)} ${units[i] ?? 'B'}`;
}
