'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function TypewriterName({ name, className }: { name: string; className: string }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    setVisible(0);
  }, [name]);
  const characters = Array.from(name);

  useEffect(() => {
    if (reducedMotion) return;
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisible(count);
      if (count >= characters.length) window.clearInterval(timer);
    }, 120);
    return () => window.clearInterval(timer);
  }, [name, reducedMotion, characters.length]);

  return (
    <h1 className={className} aria-label={name}>
      <span aria-hidden="true" className="relative inline-block max-w-full">
        <span className="invisible break-words">{name}{reducedMotion ? '' : '_'}</span>
        <span className="absolute inset-0 break-words">
          {reducedMotion ? name : characters.slice(0, visible).join('')}
          {!reducedMotion && <span className="motion-safe:animate-pulse">_</span>}
        </span>
      </span>
    </h1>
  );
}
