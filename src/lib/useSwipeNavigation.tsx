'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PanInfo } from 'framer-motion';

type SectionType = 'profile' | 'links' | 'blog';

const routeMap: Record<SectionType, string> = {
  profile: '/',
  links: '/links',
  blog: '/posts',
};

const pathToSection: Record<string, SectionType> = {
  '/': 'profile',
  '/links': 'links',
  '/posts': 'blog',
};

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // 根据当前路径确定 section
  const activeSection = useMemo(() => {
    return pathToSection[pathname] || 'profile';
  }, [pathname]);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;

      const { offset, velocity } = info;

      const swipeThreshold = 100;
      const velocityThreshold = 0.5;

      const isLeftSwipe =
        offset.x < -swipeThreshold || velocity.x < -velocityThreshold;
      const isRightSwipe =
        offset.x > swipeThreshold || velocity.x > velocityThreshold;

      if (isLeftSwipe) {
        if (activeSection === 'profile') {
          router.push('/links');
        } else if (activeSection === 'links') {
          router.push('/posts');
        }
      } else if (isRightSwipe) {
        if (activeSection === 'blog') {
          router.push('/links');
        } else if (activeSection === 'links') {
          router.push('/');
        }
      }
    },
    [isMobile, activeSection, router],
  );

  const dragProps = useMemo(
    () => ({
      drag: isMobile ? ('x' as const) : false,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.2,
      onDragEnd: handleDragEnd,
    }),
    [isMobile, handleDragEnd],
  );

  return {
    activeSection,
    isMobile,
    dragProps,
  };
}
