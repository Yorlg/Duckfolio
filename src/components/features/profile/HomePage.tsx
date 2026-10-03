"use client";

import { useEffect } from "react";
import { Profile } from "./Profile";
import { ClassicProfile } from "./ClassicProfile";
import { ProfileConfig } from "@/types/platform-config";
import { useProfileStore } from "@/lib/store";

export function HomePage(initialData: ProfileConfig) {
  const setInitialData = useProfileStore((state) => state.setInitialData);

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  const ProfileLayout =
    initialData.profile.style === "minimal" ? Profile : ClassicProfile;
  return (
    <ProfileLayout
      profile={initialData.profile}
      socialLinks={initialData.socialLinks}
    />
  );
}
