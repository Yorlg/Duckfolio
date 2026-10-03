"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { TypewriterName } from "./TypewriterName";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import type { Profile, SocialLink } from "@/types/platform-config";

export function ClassicProfile({
  profile,
  socialLinks,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ y: reducedMotion ? 0 : 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-auto grid h-full flex-1 grid-cols-1 items-center gap-8 pt-24 md:grid-cols-2 md:gap-16 md:pt-16"
    >
      <motion.div
        className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md"
        initial={{ scale: reducedMotion ? 1 : 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
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
      </motion.div>
      <div className="space-y-12 text-center md:text-left">
        <motion.div
          className="space-y-4 md:space-y-6"
          initial={{ y: reducedMotion ? 0 : 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          <TypewriterName
            name={profile.name}
            className="text-3xl font-bold tracking-tight text-(--theme-primary) sm:text-4xl md:text-5xl dark:text-(--theme-secondary)"
          />
          <p className="mx-auto max-w-lg text-base text-[#121212]/80 sm:text-lg md:mx-0 dark:text-white/80">
            {profile.bio}
          </p>
        </motion.div>
        <ProfileSocialLinks links={socialLinks} centered />
      </div>
    </motion.div>
  );
}
