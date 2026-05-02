import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PetsInvasion – Tinder for Pets',
  description: 'Connect with other pet lovers by swiping on adorable pets!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
