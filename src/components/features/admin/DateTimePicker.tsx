'use client';

import { enUS, zhCN } from 'date-fns/locale';
import { CalendarIcon, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateTimeLabel, parseDateTime, toDatetimeLocal } from './utils';
import { useTranslation } from 'react-i18next';

export function DateTimePicker({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const { t, i18n } = useTranslation('admin');
  const language: 'en' | 'zh-CN' = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const selectedDate = parseDateTime(value) ?? new Date();
  const timeValue =
    value?.slice(11, 16) || toDatetimeLocal(selectedDate).slice(11, 16);

  const updateDate = (date?: Date) => {
    if (!date) {
      return;
    }

    const [hours = '0', minutes = '0'] = timeValue.split(':');
    const next = new Date(date);
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(toDatetimeLocal(next));
  };

  const updateTime = (time: string) => {
    const [hours = '0', minutes = '0'] = time.split(':');
    const next = new Date(selectedDate);
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(toDatetimeLocal(next));
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="h-10 justify-start rounded-lg border-[#121212]/10 bg-white px-3 text-left font-normal text-[#121212] hover:bg-[#121212]/5 dark:border-white/10 dark:bg-[#111] dark:text-white dark:hover:bg-white/10"
            type="button"
            variant="outline"
          >
            <CalendarIcon className="size-4 text-[#121212]/50 dark:text-white/50" />
            {formatDateTimeLabel(value, t, language)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            locale={language === 'en' ? enUS : zhCN}
            mode="single"
            selected={selectedDate}
            onSelect={updateDate}
          />
        </PopoverContent>
      </Popover>
      <div className="relative">
        <Clock3 className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-[#121212]/40 dark:text-white/40" />
        <input
          className="admin-input h-10 pl-9"
          type="time"
          value={timeValue}
          onChange={(event) => updateTime(event.target.value)}
        />
      </div>
    </div>
  );
}
