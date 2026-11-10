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
          500: '#FF5F1F',
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
        brand: { 50: '#140000', 100: '#1F0303', 200: '#7F1D1D', 300: '#991B1B', 500: '#FF0000', 700: '#FF3B3B', 900: '#FF6B6B' },
        canvas: '#000000', ink: '#FFFFFF', line: 'rgba(255, 0, 0, 0.25)',
        band: { high: '#FF0000', medium: '#FF5F1F', low: '#39FF14', unknown: '#777777' },
        conf: { strong: '#39FF14', fair: '#FF5F1F', weak: '#FF0000' },
        gap: { protected: '#00FFFF', exposed: '#FF0000' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
