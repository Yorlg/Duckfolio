'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  name: string;
}

export function Footer({ name }: FooterProps) {
  const { t } = useTranslation();
  return (
    <motion.footer
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="relative z-10 py-6 mt-auto text-center text-[#121212]/60 dark:text-white/60 text-sm"
    >
      <p className="mb-2">
        © {new Date().getFullYear()} {name}. {t('footer.copyright')}
      </p>
      <div className="flex justify-center space-x-4">
        <a
          href="https://github.com/Yorlg"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--theme-primary)  dark:hover:text-(--theme-secondary) transition-colors"
        >
          Yorlg
        </a>
        <span>•</span>
        <a
          href="https://github.com/Yorlg/Duckfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--theme-primary)  dark:hover:text-(--theme-secondary) transition-colors"
        >
          Duckfolio
        </a>
      </div>
    </motion.footer>
  );
}
