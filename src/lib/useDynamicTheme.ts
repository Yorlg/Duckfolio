'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/types/platform-config';
import { extractAvatarTheme, validAvatarTheme } from './avatar-theme';

export function useDynamicTheme(profile: Profile) {
  const hasTheme = validAvatarTheme(profile.theme, profile.avatar);
  const [ready, setReady] = useState(hasTheme || !profile.avatar);

  useEffect(() => {
    let cancelled = false;
    if (hasTheme || !profile.avatar) {
      setReady(true);
      return;
    }
    setReady(false);
    extractAvatarTheme(profile.avatar)
      .then(theme => {
        if (cancelled) return;
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
      })
      .catch(() => {
        // An unavailable/CORS-blocked avatar must not leave the site stuck loading.
      })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [profile.avatar, hasTheme]);

  return ready;
}
