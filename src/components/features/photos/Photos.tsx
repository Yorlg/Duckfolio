'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Grid2X2, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Photo } from '@/types/photos';
import { cn } from '@/lib/utils';
import { PhotoImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';

const PAGE_SIZE = 20;

export function Photos({ photos }: { photos: Photo[] }) {
  const { t } = useTranslation();
  const [cropped, setCropped] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const lastOpenedButton = useRef<HTMLButtonElement | null>(null);
  const loadMoreButton = useRef<HTMLButtonElement | null>(null);
  const availablePhotos = useMemo(
    () => photos.filter((photo) => photo.src),
    [photos],
  );
  const visiblePhotos = availablePhotos.slice(0, visibleCount);
  const hasMore = visibleCount < availablePhotos.length;
  const layoutLabel = t(cropped ? 'photos.showOriginal' : 'photos.showSquare');

  useEffect(() => {
    const target = loadMoreButton.current;
    if (!target || !hasMore || lightboxOpen || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        // Observe the new bottom only after the next batch has rendered.
        observer.disconnect();
        setVisibleCount((count) => count + PAGE_SIZE);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, lightboxOpen, visibleCount]);

  return (
    <section
      className="site-page-enter pt-28 pb-20 sm:pt-32 lg:pt-28"
      aria-label={t('photos.heading')}
    >
      <h1 className="sr-only">{t('photos.heading')}</h1>
      {visiblePhotos.length > 0 ? (
        <>
          <div className="mb-3 flex lg:fixed lg:top-24 lg:left-5 lg:mb-0">
            <button
              type="button"
              aria-label={layoutLabel}
              title={layoutLabel}
              aria-pressed={!cropped}
              className="text-muted-foreground/60 hover:text-foreground focus-visible:outline-foreground flex size-10 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => setCropped((current) => !current)}
            >
              {cropped ? (
                <Grid2X2 className="size-4" aria-hidden="true" />
              ) : (
                <LayoutGrid className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {visiblePhotos.map((photo, index) => (
              <button
                key={`${photo.id}-${index}`}
                type="button"
                aria-label={t('photos.openPhoto', {
                  name: photo.alt || index + 1,
                })}
                aria-haspopup="dialog"
                className={cn(
                  'group focus-visible:outline-foreground flex aspect-square min-w-0 cursor-zoom-in items-center justify-center overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4',
                  cropped && 'bg-muted/40',
                )}
                onClick={(event) => {
                  lastOpenedButton.current = event.currentTarget;
                  setActiveIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <PhotoImage
                  src={photo.src}
                  alt={
                    photo.alt || t('photos.photoNumber', { number: index + 1 })
                  }
                  eager={index < 4}
                  className={cn(
                    'size-full transition-opacity duration-200 group-hover:opacity-85',
                    cropped ? 'object-cover' : 'object-contain',
                  )}
                />
              </button>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                ref={loadMoreButton}
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-foreground px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                {t('photos.loadMore')}
              </button>
            </div>
          )}
          <PhotoLightbox
            photos={availablePhotos}
            open={lightboxOpen}
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
            onClose={() => setLightboxOpen(false)}
            onCloseAutoFocus={() =>
              lastOpenedButton.current?.focus({ preventScroll: true })
            }
          />
        </>
      ) : (
        <div className="text-muted-foreground flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Camera
            className="size-7 opacity-50"
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <p className="text-sm">{t('photos.empty')}</p>
        </div>
      )}
    </section>
  );
}
