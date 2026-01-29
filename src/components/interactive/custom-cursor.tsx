'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(true);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const speedFactorRef = useRef(0.2);

  // 根据设备像素比和屏幕尺寸自适应调整速度因子
  useEffect(() => {
    const updateSpeedFactor = () => {
      const dpr = window.devicePixelRatio || 1;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const diagonalSize = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);

      // 基准值：1920x1080 的对角线长度约为 2203
      const baseDiagonal = 2203;
      const sizeRatio = diagonalSize / baseDiagonal;

      // 综合考虑 DPR 和屏幕尺寸，计算最佳速度因子
      // DPR 越高（如 Retina 屏）需要更高的响应速度
      // 屏幕越大需要略微降低速度以保持平滑感
      speedFactorRef.current = Math.min(
        0.35,
        Math.max(0.15, 0.2 * (dpr / 1.5) * (1 / Math.sqrt(sizeRatio))),
      );
    };

    updateSpeedFactor();
    window.addEventListener('resize', updateSpeedFactor);

    return () => {
      window.removeEventListener('resize', updateSpeedFactor);
    };
  }, []);

  const animateCursor = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== null) {
        const currentX = cursorX.get();
        const currentY = cursorY.get();
        const deltaTime = time - previousTimeRef.current;

        // 计算距离
        const distanceX = mousePositionRef.current.x - currentX;
        const distanceY = mousePositionRef.current.y - currentY;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        // 根据距离动态调整速度：距离越远，追赶速度越快
        const dynamicSpeed =
          distance > 100
            ? speedFactorRef.current * 1.5
            : distance > 50
              ? speedFactorRef.current * 1.2
              : speedFactorRef.current;

        // 时间归一化，确保不同刷新率下行为一致
        const normalizedSpeed = Math.min(1, dynamicSpeed * (deltaTime / 16));

        cursorX.set(currentX + distanceX * normalizedSpeed);
        cursorY.set(currentY + distanceY * normalizedSpeed);
      }

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateCursor);
    },
    [cursorX, cursorY],
  );

  const handleMouseEvent = useCallback(
    (e: MouseEvent) => {
      mousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      if (e.type === 'mousedown') setClicked(true);
      if (e.type === 'mouseup') setClicked(false);

      const target = e.target as HTMLElement;
      if (e.type === 'mouseover') {
        setLinkHovered(
          !!target.closest(
            'a, button, [role=button], input, label, [data-hoverable]',
          ),
        );
      }

      if (e.type === 'mouseleave') setHidden(true);
      if (e.type === 'mouseenter') setHidden(false);

      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animateCursor);
      }
    },
    [animateCursor],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHidden(false);
    }, 1000);

    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);
    mousePositionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    window.addEventListener('mousemove', handleMouseEvent, { passive: true });
    window.addEventListener('mouseover', handleMouseEvent, { passive: true });
    window.addEventListener('mousedown', handleMouseEvent, { passive: true });
    window.addEventListener('mouseup', handleMouseEvent, { passive: true });
    window.addEventListener('mouseleave', handleMouseEvent);
    window.addEventListener('mouseenter', handleMouseEvent);

    document.body.classList.add('custom-cursor');

    return () => {
      clearTimeout(timeout);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('mousemove', handleMouseEvent);
      window.removeEventListener('mouseover', handleMouseEvent);
      window.removeEventListener('mousedown', handleMouseEvent);
      window.removeEventListener('mouseup', handleMouseEvent);
      window.removeEventListener('mouseleave', handleMouseEvent);
      window.removeEventListener('mouseenter', handleMouseEvent);
      document.body.classList.remove('custom-cursor');
    };
  }, [handleMouseEvent, cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          x: -4,
          y: -4,
        }}
        animate={{
          scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 25 },
          opacity: { duration: 0.2 },
        }}
      />
      <motion.div
        className="cursor-ring"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          x: -16,
          y: -16,
        }}
        animate={{
          scale: clicked ? 0.7 : linkHovered ? 1.3 : 1,
          opacity: hidden ? 0 : linkHovered ? 0.4 : 0.7,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 150, damping: 15 },
          opacity: { duration: 0.2 },
        }}
      />
    </>
  );
}
