import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DemoStoreProvider } from '@/lib/store';
import { AppShell } from '@/components/shell/AppShell';
import BrandBar from '@/components/brand/BrandBar';

// Same brand typefaces, bundled so the Pages build does not depend on a font service.
const fontDisplay = localFont({ src: [
  { path: './fonts/chakra-500.ttf', weight: '500' },
  { path: './fonts/chakra-600.ttf', weight: '600' },
  { path: './fonts/chakra-700.ttf', weight: '700' },
], variable: '--font-chakra', display: 'swap' });
const fontBody = localFont({ src: [
  { path: './fonts/plex-400.ttf', weight: '400' },
  { path: './fonts/plex-500.ttf', weight: '500' },
  { path: './fonts/plex-600.ttf', weight: '600' },
], variable: '--font-plex', display: 'swap' });
const fontMono = localFont({ src: [
  { path: './fonts/jetbrains-400.ttf', weight: '400' },
  { path: './fonts/jetbrains-500.ttf', weight: '500' },
  { path: './fonts/jetbrains-700.ttf', weight: '700' },
], variable: '--font-jetbrains', display: 'swap' });
const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;

export const metadata: Metadata = {
  title: 'NEXORA — Resilience Intelligence Infrastructure',
  description: 'Explore illustrative factory disaster risks, likely losses, and actions that could reduce them.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${fontVariables}`}>
      <head>
        <link rel="icon" href="/Nexora/logo-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Nexora/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen text-white">
        <BrandBar project="Nexora — Resilience Intelligence" />

        <DemoStoreProvider>
          <AppShell>{children}</AppShell>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
