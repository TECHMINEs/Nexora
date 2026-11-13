import type { Metadata } from 'next';
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { DemoStoreProvider } from '@/lib/store';
import { AppShell } from '@/components/shell/AppShell';
import BrandBar from '@/components/brand/BrandBar';

// Same three typefaces as techmines.github.io, self-hosted by next/font
const fontDisplay = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-chakra', display: 'swap' });
const fontBody = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex', display: 'swap' });
const fontMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-jetbrains', display: 'swap' });
const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;

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
    <html lang="en" className={`dark ${fontVariables}`}>
      <head>
        <link rel="icon" href="/logo-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
