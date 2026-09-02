import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMBRA — Crypto Intelligence',
  description: 'AI-powered crypto market intelligence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
