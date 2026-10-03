"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { TypewriterName } from "./TypewriterName";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import type {
  Profile as ProfileType,
  SocialLink,
} from "@/types/platform-config";

interface ProfileProps {
  profile: ProfileType;
  socialLinks: SocialLink[];
}

export function Profile({ profile, socialLinks }: ProfileProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="flex flex-1 flex-col justify-center px-3 pb-24 pt-32 sm:px-4 sm:pb-32 sm:pt-36">
      <motion.div
        initial={{ y: reducedMotion ? 0 : 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="grid w-full max-w-2xl items-center gap-10 sm:grid-cols-[minmax(0,1fr)_160px] sm:gap-16"
      >
        <div className="min-w-0">
          <TypewriterName
            name={profile.name}
            className="break-words text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
          />
          {profile.bio && (
            <p className="mt-5 max-w-sm text-base leading-8 text-muted-foreground">
              {profile.bio}
            </p>
          )}
          <div className="mt-6">
            <ProfileSocialLinks links={socialLinks} />
          </div>
        </div>
        {profile.avatar && (
          <div className="relative order-first size-24 overflow-hidden rounded-full bg-muted sm:order-last sm:size-40">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              sizes="(max-width: 639px) 96px, 160px"
              className="object-cover"
              priority
            />
          </div>
        )}
      </motion.div>
    </section>
  );
}
