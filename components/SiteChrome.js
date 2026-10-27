import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import OtherSites from './OtherSites';
import { ADDRESS } from '../lib/newsletter.mjs';

export default function SiteChrome({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold">Wat Shall I Eat</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/ideas" className="underline">Meal ideas</Link>
          <Link href="/newsletter" className="underline">Weekly meal ideas</Link>
          <DarkModeToggle />
        </nav>
      </header>
      <main className="container mx-auto px-4 pb-12">{children}</main>
      <p className="text-center text-sm px-4 pb-2">Telep IO LLC. {ADDRESS}.</p>
      <OtherSites />
    </div>
  );
}
