import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      colors: {
        // TECHMINES portfolio tokens (techmines.github.io)
        panel: { DEFAULT: '#0E0E0E', 2: '#171717' },
        stroke: '#4D4D4D',
        dim: '#A9A9A9',
        body: '#E2E2E2',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          500: '#A9A9A9',
          700: '#C2410C',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Dark-theme brand scale: low shades are deep red tints (surfaces), high shades are bright
        // reds (text) so legacy light-theme pairings like bg-brand-50 + text-brand-900 stay legible.
        brand: { 50: '#140000', 100: '#1F0303', 200: '#2E2E2E', 300: '#991B1B', 500: '#FF2626', 700: '#FF3B3B', 900: '#FF6B6B' },
        canvas: '#000000', ink: '#FFFFFF', line: '#2E2E2E',
        band: { high: '#FF2626', medium: '#A9A9A9', low: '#39FF14', unknown: '#777777' },
        conf: { strong: '#39FF14', fair: '#A9A9A9', weak: '#FF2626' },
        gap: { protected: '#FFFFFF', exposed: '#FF2626' },
      },
      fontFamily: {
        display: ['var(--font-chakra)', '"Chakra Petch"', '"Arial Narrow"', 'sans-serif'],
        sans: ['var(--font-plex)', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', '"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
