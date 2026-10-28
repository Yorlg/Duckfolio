"use client";

import Image from "next/image";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import type { Profile, SocialLink } from "@/types/platform-config";

export function ClassicProfile({
  profile,
  socialLinks,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
}) {
  return (
    <div
      className="site-page-enter my-auto grid h-full flex-1 grid-cols-1 items-center gap-8 pt-24 md:grid-cols-2 md:gap-16 md:pt-16"
    >
      <div
        className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md"
      >
        <div className="absolute inset-0 scale-95 -rotate-6 rounded-3xl bg-linear-to-br from-(--theme-primary) to-(--theme-secondary) opacity-80 blur-md dark:opacity-60" />
        <div className="absolute inset-0 overflow-hidden rounded-3xl border-2 border-[#121212]/10 bg-[#f8f8f8] dark:border-white/10 dark:bg-[#1a1a1a]">
          {profile.avatar && (
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          )}
        </div>
      </div>
      <div className="space-y-12 text-center md:text-left">
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-(--theme-primary) sm:text-4xl md:text-5xl dark:text-(--theme-secondary)">
            {profile.name}
          </h1>
          <p className="mx-auto max-w-lg text-base text-[#121212]/80 sm:text-lg md:mx-0 dark:text-white/80">
            {profile.bio}
          </p>
        </div>
        <ProfileSocialLinks links={socialLinks} centered />
      </div>
    </div>
  );
}
