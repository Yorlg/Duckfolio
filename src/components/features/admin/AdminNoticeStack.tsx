'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { AdminNotice } from './AdminShared';

export function AdminNoticeStack({ notices }: { notices: ReactNode[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (activeIndex >= notices.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, notices.length]);

  if (!notices.length) {
    return null;
  }

  const orderedNotices = notices.map(
    (_, offset) => notices[(activeIndex + offset) % notices.length],
  );

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (notices.length < 2) {
      return;
    }

    if (info.offset.y < -24 || info.velocity.y < -300) {
      setActiveIndex((current) => (current + 1) % notices.length);
      return;
    }

    if (info.offset.y > 24 || info.velocity.y > 300) {
      setActiveIndex(
        (current) => (current - 1 + notices.length) % notices.length,
      );
    }
  };

  return (
    <div className="relative h-20 px-1 pt-1">
      {orderedNotices.map((notice, index) => (
        <motion.div
          initial={false}
          animate={{
            opacity: index === 0 ? 1 : 0.72 - index * 0.12,
            scale: 1 - index * 0.025,
            y: index * 9,
          }}
          className="absolute inset-x-1 origin-top cursor-grab active:cursor-grabbing"
          drag={index === 0 ? 'y' : false}
          dragConstraints={{ bottom: 42, top: -42 }}
          dragElastic={0.12}
          dragMomentum={false}
          key={`${activeIndex}-${index}`}
          style={{ zIndex: notices.length - index }}
          transition={{ duration: reducedMotion ? 0 : 0.15, ease: 'easeOut' }}
          whileDrag={{ zIndex: notices.length + 1 }}
          onDragEnd={index === 0 ? handleDragEnd : undefined}
        >
          <AdminNotice>{notice}</AdminNotice>
        </motion.div>
      ))}
    </div>
  );
}
