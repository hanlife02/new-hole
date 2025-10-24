'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import homeCopy from '@/content/home.json';
import pagesCopy from '@/content/pages.json';
import { useLanguage, type Language } from '@/components/LanguageProvider';

interface Stats {
  holes: number;
  comments: number;
}

type HomeCopy = (typeof homeCopy)[Language];

export default function Home() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const copy = homeCopy[language];
  const pageCommon = pagesCopy[language].common;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('获取统计信息失败:', error);
      }
    };

    fetchStats();
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-sm text-black dark:text-white">{pageCommon.loading}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f6fb] text-black transition-colors duration-500 dark:bg-black dark:text-white">
      <Navigation />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <Hero stats={stats} copy={copy} />
        <QuickLinks section={copy.quickAccess} />
      </main>

      <Footer />
    </div>
  );
}

function Hero({
  stats,
  copy,
}: {
  stats: Stats | null;
  copy: HomeCopy;
}) {
  const { hero, stats: statsCopy, badge } = copy;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white px-6 py-14 shadow-sm dark:border-white/10 dark:bg-[#0f0f12] md:px-12 md:py-16">
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <p className="inline-flex items-center rounded-full border border-black/10 px-4 py-1 text-xs font-medium tracking-[0.3em] text-gray-600 dark:border-white/10 dark:text-gray-400">
              {badge}
            </p>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-white">
              {hero.title}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {hero.subtitle}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-6 text-left sm:max-w-md sm:grid-cols-2">
            <StatItem label={statsCopy.holes} value={stats?.holes} />
            <StatItem label={statsCopy.comments} value={stats?.comments} />
          </dl>
        </div>

        <div className="flex flex-1 justify-center lg:justify-end">
          <div className="relative h-64 w-64 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
            <div className="absolute inset-0 rounded-full bg-white/70 blur-3xl dark:bg-white/10" />
            <Image
              src="/Ethan-Club-o.PNG"
              alt={hero.imageAlt}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="relative rounded-full object-contain shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <dt className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-black dark:text-white">
        {value ?? '...'}
      </dd>
    </div>
  );
}

function QuickLinks({ section }: { section: HomeCopy['quickAccess'] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm uppercase tracking-[0.3em]">{section.badge}</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {section.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/90 px-6 py-7 transition-all duration-300 hover:-translate-y-1 hover:border-black/25 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-black transition-colors duration-300 group-hover:text-black/80 dark:text-white dark:group-hover:text-white/80">
                {item.label}
              </span>
              <span className="text-lg text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black dark:text-gray-500 dark:group-hover:text-white">
                →
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
