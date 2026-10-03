'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { BarChart3, Loader2 } from 'lucide-react';
import type { AdminPostSummary } from './types';
import { useTranslation } from 'react-i18next';
import { getMonthlyPostCounts } from './utils';

export function DashboardPanel({
  adminToken,
  isLoading,
  posts,
}: {
  adminToken: string;
  isLoading: boolean;
  posts: AdminPostSummary[];
}) {
  const { t, i18n } = useTranslation('admin');
  const language: 'en' | 'zh-CN' = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const totalPosts = posts.length;
  const draftPosts = posts.filter((post) => post.draft).length;
  const publicPosts = totalPosts - draftPosts;
  const monthlyPosts = getMonthlyPostCounts(posts, language);
  const monthlyChartOption = createMonthlyChartOption(monthlyPosts, t);
  const statusChartOption = createStatusChartOption(publicPosts, draftPosts, t);
  const [analytics, setAnalytics] = useState<{ count: { pageviews: number; visitors: number }; pages: Array<{ requestPath: string; pageviews: number; visitors: number }> } | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminToken) return;
    const controller = new AbortController();
    fetch('/api/admin/analytics', {
      headers: { 'x-admin-token': adminToken },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 503 ? t('analyticsNotConfigured') : t('analyticsLoadFailed'));
        return response.json();
      })
      .then((result) => setAnalytics(result))
      .catch((error) => {
        if (!controller.signal.aborted) setAnalyticsError(error.message);
      });
    return () => controller.abort();
  }, [adminToken, t]);

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-1 border-b border-[#121212]/10 pb-4 dark:border-white/10">
        <h2 className="text-xl font-medium">{t("dashboard")}</h2>
        <p className="text-sm text-[#121212]/50 dark:text-white/50">
          {t("contentOverviewAndPublishingStatus")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#121212]/10 px-4 py-6 text-sm text-[#121212]/60 dark:border-white/10 dark:text-white/60">
          <Loader2 className="size-4 animate-spin" />
          {t("loadingOverviewData")}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetricCard label={t("totalPosts")} value={totalPosts} />
            <DashboardMetricCard label={t("publicPosts")} value={publicPosts} />
            <DashboardMetricCard label={t("draftPosts")} value={draftPosts} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-[#121212]/10 p-5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{t("publishingTrend")}</h3>
                  <p className="mt-1 text-sm text-[#121212]/50 dark:text-white/50">
                    {t("postCountOverTheLastSixMonths")}
                  </p>
                </div>
                <BarChart3 className="size-5 text-[#121212]/40 dark:text-white/40" />
              </div>
              <EChart className="mt-4 h-56" option={monthlyChartOption} />
            </div>

            <div className="rounded-lg border border-[#121212]/10 p-5 dark:border-white/10">
              <h3 className="font-medium">{t("postStatus")}</h3>
              <p className="mt-1 text-sm text-[#121212]/50 dark:text-white/50">
                {t("publicToDraftRatio")}
              </p>
              <EChart className="mt-4 h-48" option={statusChartOption} />
              <div className="mt-5 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#121212]/60 dark:text-white/60">{t("public")}</span>
                  <span>{t("countPosts", { count: publicPosts })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#121212]/60 dark:text-white/60">{t("draft")}</span>
                  <span>{t("countPosts", { count: draftPosts })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#121212]/10 p-5 dark:border-white/10">
            <h3 className="font-medium">{t('webAnalytics')}</h3>
            <p className="mt-1 text-sm text-[#121212]/50 dark:text-white/50">{t('analyticsLast30Days')}</p>
            {analyticsError ? (
              <p className="mt-4 text-sm text-red-600">{analyticsError}</p>
            ) : analytics ? (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DashboardMetricCard label={t('pageviews')} value={analytics.count.pageviews} />
                  <DashboardMetricCard label={t('visitors')} value={analytics.count.visitors} />
                </div>
                <h4 className="mt-6 font-medium">{t('topPages')}</h4>
                <div className="mt-2 divide-y divide-[#121212]/10 dark:divide-white/10">
                  {analytics.pages.map((page) => (
                    <div key={page.requestPath} className="flex justify-between gap-4 py-2 text-sm">
                      <span className="truncate">{page.requestPath}</span>
                      <span className="shrink-0">{page.pageviews} {t('pageviews')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#121212]/60 dark:text-white/60">{t('loadingAnalytics')}</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function DashboardMetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#121212]/10 p-5 dark:border-white/10">
      <p className="text-sm text-[#121212]/50 dark:text-white/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function EChart({
  className,
  option,
}: {
  className?: string;
  option: EChartsOption;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current, null, {
      renderer: 'svg',
    });

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div className={className} ref={chartRef} />;
}

function createMonthlyChartOption(
  monthlyPosts: Array<{ count: number; label: string }>,
  t: (source: string, params?: Record<string, string | number>) => string,
): EChartsOption {
  return {
    animationDuration: 700,
    color: ['#121212'],
    grid: {
      bottom: 24,
      left: 28,
      right: 12,
      top: 24,
    },
    tooltip: {
      borderWidth: 0,
      formatter: t("nameCountPosts", { name: '{b}', count: '{c}' }),
      trigger: 'axis',
    },
    xAxis: {
      axisLine: { lineStyle: { color: 'rgba(18,18,18,0.12)' } },
      axisTick: { show: false },
      data: monthlyPosts.map((item) => item.label),
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: 'rgba(18,18,18,0.45)' },
      minInterval: 1,
      splitLine: { lineStyle: { color: 'rgba(18,18,18,0.08)' } },
      type: 'value',
    },
    series: [
      {
        barMaxWidth: 42,
        data: monthlyPosts.map((item) => item.count),
        itemStyle: {
          borderRadius: [8, 8, 2, 2],
        },
        type: 'bar',
      },
    ],
  };
}

function createStatusChartOption(
  publicPosts: number,
  draftPosts: number,
  t: (source: string, params?: Record<string, string | number>) => string,
): EChartsOption {
  const total = publicPosts + draftPosts;

  return {
    animationDuration: 700,
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: t("postStatus"),
        type: 'pie',
        radius: ['30%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: total
          ? [
              { name: t("public"), value: publicPosts },
              { name: t("draft"), value: draftPosts },
            ]
          : [{ name: t("noPosts"), value: 1 }],
      },
    ],
    tooltip: {
      formatter: total
        ? t("nameCountPostsPercentage", {
            count: '{c}',
            name: '{b}',
            percentage: '{d}',
          })
        : t("noPosts"),
      trigger: 'item',
    },
  };
}
