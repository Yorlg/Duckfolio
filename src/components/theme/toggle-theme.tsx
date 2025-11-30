'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/packages/ui/button';

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = (event: React.MouseEvent) => {
        const isAppearanceTransition =
            typeof window !== 'undefined' &&
            typeof document !== 'undefined' &&
            typeof document?.startViewTransition === 'function' &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!isAppearanceTransition) {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            return;
        }

        const isDark = resolvedTheme === 'dark';
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        try {
            const transition = document.startViewTransition(async () => {
                setTheme(isDark ? 'light' : 'dark');

                await new Promise((resolve) => setTimeout(resolve, 100));
            });

            transition.ready
                .then(() => {
                    const clipPath = [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ];
                    document.documentElement.animate(
                        {
                            clipPath: isDark ? [...clipPath].reverse() : clipPath,
                        },
                        {
                            duration: 400,
                            easing: 'ease-out',
                            fill: 'forwards',
                            pseudoElement: isDark
                                ? '::view-transition-old(root)'
                                : '::view-transition-new(root)',
                        }
                    );
                })
                .catch((err) => {
                    console.error('Theme transition error:', err);
                });
        } catch (e) {
            console.error('Failed to start view transition:', e);
            setTheme(isDark ? 'light' : 'dark');
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
            <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {resolvedTheme === 'dark' ? (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] text-primary" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </motion.div>
    );
}