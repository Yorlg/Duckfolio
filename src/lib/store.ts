import { create } from 'zustand';
import { ProfileConfig } from '@/types/platform-config';

interface ProfileState extends ProfileConfig {
  setInitialData: (data: ProfileConfig) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    avatar: '',
    name: '',
    bio: '',
  },
  socialLinks: [],
  websiteLinks: [],

  setInitialData: (data: ProfileConfig) => {
    set({
      profile: data.profile,
      socialLinks: data.socialLinks,
      websiteLinks: data.websiteLinks,
    });
  },
}));
