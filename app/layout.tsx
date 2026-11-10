import type { Metadata } from 'next';
import './globals.css';
import { DemoStoreProvider } from '@/lib/store';
import { AppShell } from '@/components/shell/AppShell';
import BrandBar from '@/components/brand/BrandBar';

export const metadata: Metadata = {
  title: 'NEXORA — Resilience Intelligence Infrastructure',
  description: 'Pre-disaster facility resilience intelligence platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/techmines-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/techmines-icon.png" />
      </head>
      <body className="antialiased min-h-screen bg-black text-white">
        <BrandBar project="Nexora — Resilience Intelligence" />

        <DemoStoreProvider>
          <AppShell>{children}</AppShell>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
