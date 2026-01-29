'use client';

import { useEffect } from 'react';
import { Profile } from './Profile';
import { ProfileConfig } from '@/types/platform-config';
import { useProfileStore } from '@/lib/store';

export function HomePage(initialData: ProfileConfig) {
  const setInitialData = useProfileStore((state) => state.setInitialData);

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  const { profile, socialLinks } = useProfileStore();

  return <Profile profile={profile} socialLinks={socialLinks} />;
}
