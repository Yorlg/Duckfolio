'use client';

import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const isChinese = language === 'zh-CN';

  return (
    <motion.div
      className="fixed bottom-16 right-4 z-50"
      initial={{ y: 100, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
    >
      <Button
        aria-label={t('language.switch')}
        className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/40 hover:shadow-primary/20 dark:bg-black/80"
        size="icon"
        title={t('language.switch')}
        type="button"
        variant="outline"
        onClick={() => void i18n.changeLanguage(isChinese ? 'en' : 'zh-CN')}
      >
        <Languages aria-hidden="true" className="size-[1.2rem] text-primary" />
      </Button>
    </motion.div>
  );
}
