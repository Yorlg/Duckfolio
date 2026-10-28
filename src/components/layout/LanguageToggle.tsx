'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const isChinese = language === 'zh-CN';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`${t('language.select')} · ${isChinese ? '中文' : 'EN'}`}
          className="h-11 min-w-11 rounded-lg px-2 text-[15px] font-semibold text-[#121212]/65 transition-colors duration-150 hover:text-[#121212] dark:text-white/65 dark:hover:text-white"
          title={t('language.select')}
          type="button"
          variant="ghost"
        >
          {isChinese ? '中文' : 'EN'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={4}
        collisionPadding={12}
        className="min-w-16 rounded-md border-[#121212]/10 bg-background p-0.5 shadow-sm dark:border-white/10"
      >
        <DropdownMenuItem
          className="h-8 cursor-pointer justify-center rounded-sm px-3 py-0 text-sm font-medium text-[#121212]/65 focus:bg-[#121212]/[0.035] dark:text-white/65 dark:focus:bg-white/5"
          lang={isChinese ? 'en' : 'zh-CN'}
          onSelect={() => void i18n.changeLanguage(isChinese ? 'en' : 'zh-CN')}
        >
          {isChinese ? 'EN' : '中文'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
