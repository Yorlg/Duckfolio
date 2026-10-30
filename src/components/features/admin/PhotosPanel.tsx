'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Images,
  Loader2,
  Save,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PhotoImage } from '@/components/features/photos/PhotoImage';
import type { AdminPhoto } from '@/types/photos';
import type { MediaFileSummary } from '@/lib/admin/content';
import { adminMessageKeys } from '@/lib/admin/message-keys';
import { readAdminResponse } from './admin-api';

export function PhotosPanel({ adminToken }: { adminToken: string }) {
  const { t } = useTranslation('admin');
  const [photos, onPhotosChange] = useState<AdminPhoto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importedPaths, setImportedPaths] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<MediaFileSummary[]>([]);
  const busy =
    isLoading ||
    Boolean(loadError) ||
    isSaving ||
    importing ||
    uploadProgress !== null;

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');
    fetch('/api/admin/photos', {
      headers: { 'x-admin-token': adminToken },
      signal: controller.signal,
    })
      .then((response) =>
        readAdminResponse<{ photos: AdminPhoto[] }>(
          response,
          'failedToLoadPhotos',
        ),
      )
      .then((data) => {
        if (!controller.signal.aborted) onPhotosChange(data.photos);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setLoadError(
            error instanceof Error ? error.message : 'failedToLoadPhotos',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [adminToken, reloadCount]);

  const showError = (error: unknown, fallback: string) => {
    toast.error(
      error instanceof Error
        ? t(adminMessageKeys[error.message] ?? error.message)
        : t(fallback),
    );
  };

  const onSave = async () => {
    if (busy) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/photos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          photos: photos.map(({ id, alt, hidden }) => ({ id, alt, hidden })),
        }),
      });
      const data = await readAdminResponse<{ result: { mode: string } }>(
        response,
        t('failedToSavePhotos'),
      );
      toast.success(
        t(data.result.mode === 'github' ? 'photosSavedGitHub' : 'photosSaved'),
      );
    } catch (error) {
      showError(error, 'failedToSavePhotos');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadPhotos = async (files: FileList) => {
    if (!adminToken || busy || files.length === 0) return;
    const selected = Array.from(files);
    const timestamp = new Date().toISOString();
    let uploaded = 0;

    setUploadProgress({ current: 0, total: selected.length });
    try {
      for (const [index, file] of selected.entries()) {
        setUploadProgress({ current: index + 1, total: selected.length });
        if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) {
          toast.error(t('photoUnsupportedType', { name: file.name }));
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          toast.error(t('photoTooLarge', { name: file.name }));
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('timestamp', timestamp);
          const response = await fetch('/api/admin/photos', {
            method: 'POST',
            headers: { 'x-admin-token': adminToken },
            body: formData,
          });
          const data = await readAdminResponse<{ photo: AdminPhoto }>(
            response,
            t('failedToUploadName', { name: file.name }),
          );
          // Commit each success to the draft so a later failure cannot discard it.
          onPhotosChange((current) => [data.photo, ...current]);
          uploaded++;
        } catch (error) {
          showError(error, 'failedToUploadFiles');
        }
      }
      if (uploaded > 0) toast.success(t('photosUploaded', { count: uploaded }));
    } finally {
      setUploadProgress(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLoadingLibrary(true);
    try {
      const response = await fetch('/api/admin/media', {
        headers: { 'x-admin-token': adminToken },
      });
      const data = await readAdminResponse<{ files: MediaFileSummary[] }>(
        response,
        t('failedToLoadMediaList'),
      );
      setLibraryFiles(
        (data.files || []).filter((file) =>
          /^image\/(jpeg|png|webp|avif|gif)$/.test(file.type),
        ),
      );
    } catch (error) {
      showError(error, 'failedToLoadMediaList');
    } finally {
      setLoadingLibrary(false);
    }
  };

  const movePhoto = (index: number, direction: number) => {
    onPhotosChange((current) => {
      const next = [...current];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const importPhoto = async (file: MediaFileSummary) => {
    if (busy) return;
    setImporting(true);
    try {
      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ mediaPath: file.path }),
      });
      const data = await readAdminResponse<{ photo: AdminPhoto }>(
        response,
        t('photoOperationFailed'),
      );
      onPhotosChange((current) => [data.photo, ...current]);
      setImportedPaths((current) => [...current, file.path]);
      toast.success(t('photosUploaded', { count: 1 }));
    } catch (error) {
      showError(error, 'photoOperationFailed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="grid gap-5">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <h2 className="text-lg font-medium">
          {t('photoManagement')}{' '}
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            {photos.length}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/photos" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              {t('viewPhotoGallery')}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onSave}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t('savePhotos')}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm/6">{t('photoSaveHint')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {uploadProgress ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploadProgress
            ? t('uploadingPhotos', uploadProgress)
            : t('uploadPhotos')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={openLibrary}
        >
          <Images className="size-4" />
          {t('chooseFromMediaLibrary')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void uploadPhotos(event.target.files);
          }}
        />
      </div>

      {isLoading ? (
        <div
          className="text-muted-foreground flex justify-center gap-2 py-16 text-sm"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" />
          {t('loading')}
        </div>
      ) : loadError ? (
        <div className="grid justify-items-center gap-3 py-12" role="alert">
          <p className="text-destructive text-sm">
            {t(adminMessageKeys[loadError] ?? loadError)}
          </p>
          <Button
            variant="outline"
            onClick={() => setReloadCount((count) => count + 1)}
          >
            {t('retryLoadPhotos')}
          </Button>
        </div>
      ) : photos.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <Images className="size-7 opacity-50" aria-hidden="true" />
          <p className="text-sm">{t('noGalleryPhotos')}</p>
        </div>
      ) : (
        <ol className="grid gap-3">
          {photos.map((photo, index) => (
            <li
              key={`${photo.id}-${photo.src}`}
              className="border-border flex flex-col gap-4 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              <div className="bg-muted/40 h-36 w-full shrink-0 overflow-hidden rounded sm:size-28">
                <PhotoImage
                  src={photo.src}
                  alt={photo.alt || t('photoDescription')}
                  className="size-full object-contain"
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-2">
                <label className="text-muted-foreground grid gap-2 text-sm">
                  {t('photoDescription')}
                  <input
                    className="admin-input"
                    value={photo.alt}
                    placeholder={t('photoDescriptionPlaceholder')}
                    disabled={busy}
                    onChange={(event) => {
                      const alt = event.target.value;
                      onPhotosChange((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, alt } : item,
                        ),
                      );
                    }}
                  />
                </label>
                <p
                  className="text-muted-foreground/70 truncate text-xs"
                  title={photo.src}
                >
                  {photo.src}
                </p>
                {photo.hidden && (
                  <p className="text-muted-foreground text-xs">
                    {t('photoHidden')}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                  {index + 1}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy || index === 0}
                  onClick={() => movePhoto(index, -1)}
                  aria-label={t('movePhotoEarlier')}
                  title={t('movePhotoEarlier')}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy || index === photos.length - 1}
                  onClick={() => movePhoto(index, 1)}
                  aria-label={t('movePhotoLater')}
                  title={t('movePhotoLater')}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy}
                  className="text-muted-foreground"
                  onClick={() =>
                    onPhotosChange((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, hidden: !item.hidden } : item,
                      ),
                    )
                  }
                  aria-label={t(photo.hidden ? 'showPhoto' : 'hidePhoto')}
                  title={t(photo.hidden ? 'showPhoto' : 'hidePhoto')}
                >
                  {photo.hidden ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('chooseFromMediaLibrary')}</DialogTitle>
            <DialogDescription>
              {t('selectPhotosFromLibrary')}
            </DialogDescription>
          </DialogHeader>
          {loadingLibrary ? (
            <div className="flex justify-center py-16" role="status">
              <Loader2 className="size-5 animate-spin" />
              <span className="sr-only">{t('loading')}</span>
            </div>
          ) : libraryFiles.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {t('noMediaFiles')}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {libraryFiles.map((file) => {
                const selected = importedPaths.includes(file.path);
                return (
                  <button
                    key={file.path}
                    type="button"
                    disabled={selected || busy}
                    aria-label={t('addPhotoToGallery', { name: file.name })}
                    aria-pressed={selected}
                    className="border-border bg-muted/40 focus-visible:outline-foreground relative aspect-square overflow-hidden rounded border focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                    onClick={() => void importPhoto(file)}
                  >
                    <PhotoImage
                      src={file.url}
                      alt={file.name}
                      className="size-full object-cover"
                    />
                    {selected && (
                      <span className="bg-background text-foreground absolute top-2 right-2 rounded-full p-1">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
