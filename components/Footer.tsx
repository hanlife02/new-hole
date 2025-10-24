'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white transition-colors duration-300 dark:border-white/10 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
              Ethan Club
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We are very honored that you have joined Ethan Club
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://hanlife02.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/hanlife02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  Github
                </a>
              </li>
              <li>
                <a
                  href="https://status.ethan02.com/status/all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  Monitor
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
              Contact
            </h3>
            <a
              href="mailto:ethan@hanlife02.com"
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              <Mail className="h-4 w-4" />
              ethan@hanlife02.com
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-black/10 pt-8 dark:border-white/10">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 Ethan Hole. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
