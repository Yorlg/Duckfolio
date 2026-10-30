'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import type { Photo } from '@/types/photos';
import { PhotoImage } from './PhotoImage';

const controlClass =
  'flex size-11 items-center justify-center rounded-full bg-background/70 text-foreground/50 backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';

export function PhotoLightbox({
  photos,
  open,
  activeIndex,
  onIndexChange,
  onClose,
  onCloseAutoFocus,
}: {
  photos: Photo[];
  open: boolean;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onCloseAutoFocus: () => void;
}) {
  const { t } = useTranslation();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Retain the selected photo until Radix finishes the closing animation.
  const photo = photos[activeIndex];
  const move = (direction: number) => {
    if (open && photos.length > 1) {
      onIndexChange((activeIndex + direction + photos.length) % photos.length);
    }
  };

  return (
    <DialogPrimitive.Root
      open={open && Boolean(photo)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        {/* Match the exit duration so scroll lock lasts through the fade. */}
        <DialogPrimitive.Overlay className="ui-fade fixed inset-0 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="ui-fade bg-background/60 text-foreground fixed inset-0 z-50 flex items-center justify-center px-3 backdrop-blur-xl outline-none sm:px-6"
          data-no-swipe-navigation
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseAutoFocus();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              move(event.key === 'ArrowLeft' ? -1 : 1);
            }
          }}
          onTouchStart={(event) => {
            touchStart.current =
              event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
                : null;
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || event.touches.length > 0) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              move(dx < 0 ? 1 : -1);
            }
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {t('photos.heading')}
          </DialogPrimitive.Title>
          <span
            className="bg-background/70 text-foreground/50 absolute top-5 left-4 z-10 rounded-full px-2 py-1 text-xs tabular-nums backdrop-blur-sm sm:left-6"
            aria-hidden="true"
          >
            {activeIndex + 1} / {photos.length}
          </span>
          <DialogPrimitive.Close
            className={`${controlClass} absolute top-3 right-3 z-10 sm:top-4 sm:right-6`}
            aria-label={t('photos.close')}
            title={t('photos.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </DialogPrimitive.Close>
          {photo && (
            <PhotoImage
              src={photo.src}
              alt={
                photo.alt ||
                t('photos.photoNumber', { number: activeIndex + 1 })
              }
              eager
              // Auto dimensions retain the original size; max bounds only scale down.
              className="size-auto max-h-dvh max-w-full shrink-0 object-contain select-none"
            />
          )}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className={`${controlClass} absolute bottom-4 left-3 z-10 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
                onClick={() => move(-1)}
                aria-label={t('photos.previous')}
                title={t('photos.previous')}
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${controlClass} absolute right-3 bottom-4 z-10 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
                onClick={() => move(1)}
                aria-label={t('photos.next')}
                title={t('photos.next')}
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          )}
          <p
            className="text-foreground/70 pointer-events-none absolute inset-x-16 bottom-4 z-10 flex justify-center text-center text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">
              {t('photos.position', {
                current: activeIndex + 1,
                total: photos.length,
              })}{' '}
            </span>
            {photo?.alt && (
              <span className="bg-background/70 line-clamp-2 max-w-xl rounded-lg px-3 py-2 backdrop-blur-sm">
                {photo.alt}
              </span>
            )}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
