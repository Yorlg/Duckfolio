'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type SectionType = 'profile' | 'links' | 'blog' | 'projects' | 'photos';

const pathToSection: Record<string, SectionType> = {
  '/': 'profile',
  '/links': 'links',
  '/posts': 'blog',
  '/projects': 'projects',
  '/photos': 'photos',
};

/** 检查元素或其祖先是否可水平滚动 */
function isInHorizontalScrollable(el: Element | null): boolean {
  let node = el as HTMLElement | null;
  while (node && node !== document.body) {
    const { overflowX } = getComputedStyle(node);
    if (
      (overflowX === 'auto' || overflowX === 'scroll') &&
      node.scrollWidth > node.clientWidth
    ) {
      return true;
    }
    if (node.tagName === 'PRE' || node.tagName === 'CODE') {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // 触摸状态
  const touchRef = useRef<{
    startX: number;
    startY: number;
    startTarget: Element | null;
  } | null>(null);

  const activeSection = useMemo(() => {
    return pathToSection[pathname] || 'profile';
  }, [pathname]);

  const isBlogPost = useMemo(() => {
    return /^\/posts\/.+/.test(pathname);
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigate = useCallback(
    (direction: 'left' | 'right') => {
      const section = pathToSection[pathname] || 'profile';
      if (direction === 'left') {
        if (section === 'profile') router.push('/links');
        else if (section === 'links') router.push('/posts');
        else if (section === 'blog') router.push('/projects');
        else if (section === 'projects') router.push('/photos');
      } else {
        if (section === 'photos') router.push('/projects');
        else if (section === 'projects') router.push('/posts');
        else if (section === 'blog') router.push('/links');
        else if (section === 'links') router.push('/');
      }
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!isMobile || isBlogPost || !pathToSection[pathname]) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (e.touches.length !== 1 || target?.closest('[data-no-swipe-navigation]')) {
        touchRef.current = null;
        return;
      }
      const touch = e.touches[0];
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTarget: document.elementFromPoint(touch.clientX, touch.clientY),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const state = touchRef.current;
      if (!state) return;
      touchRef.current = null;

      // 如果起始于可水平滚动的元素，不触发
      if (isInHorizontalScrollable(state.startTarget)) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // 水平位移必须大于垂直位移（确保是横向滑动意图）
      if (absX < absY) return;

      // 水平距离需超过屏幕宽度的 40%
      const threshold = window.innerWidth * 0.4;
      if (absX < threshold) return;

      if (deltaX < 0) {
        navigate('left');
      } else {
        navigate('right');
      }
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isBlogPost, navigate, pathname]);

  return {
    activeSection,
    isMobile,
  };
}
