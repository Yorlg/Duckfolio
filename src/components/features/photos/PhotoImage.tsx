'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function PhotoImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const { t } = useTranslation();
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === src) {
    return (
      <span
        role="img"
        aria-label={alt}
        className="bg-muted/40 text-muted-foreground flex size-full min-h-32 flex-col items-center justify-center gap-2 p-4 text-sm"
      >
        <ImageOff className="size-5" aria-hidden="true" />
        {t('photos.loadError')}
      </span>
    );
  }

  // Media-library images have no stored dimensions; keep their intrinsic ratio.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn('block', className)}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailedSource(src)}
    />
  );
}
