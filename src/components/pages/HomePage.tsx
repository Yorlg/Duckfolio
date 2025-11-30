'use client';

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Navigation } from "@/components/layout/Navigation";
import { Profile } from "@/components/layout/Profile";
import { Links } from "@/components/links/Links";
import { Footer } from "@/components/layout/Footer";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { ProfileConfig } from "@/types/platform-config";
import { useProfileStore } from "@/lib/store";

export function HomePage(initialData: ProfileConfig) {
  const { activeSection, setActiveSection, dragProps } =
    useSwipeNavigation('profile');

  const setInitialData = useProfileStore((state) => state.setInitialData);
  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  const { profile, socialLinks, websiteLinks } = useProfileStore();

  return (
    <div
      className="relative min-h-screen w-full text-[#121212] dark:text-[#f0f0f0] overflow-hidden flex flex-col"
    >
      <Navigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <motion.main
        className="relative z-10 flex-1 px-4 sm:px-6 md:px-8 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto flex flex-col"
        {...dragProps}
      >
        <AnimatePresence mode="wait">
          {activeSection === 'profile' ? (
            <Profile
              profile={profile}
              socialLinks={socialLinks}
              key="profile"
            />
          ) : (
            <Links websiteLinks={websiteLinks} key="links" />
          )}
        </AnimatePresence>
      </motion.main>

      <Footer name={profile.name} />
    </div>
  );
}