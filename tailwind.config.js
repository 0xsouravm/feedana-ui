/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)', /* white-10 */
        input: 'var(--color-input)', /* gray-900 */
        ring: 'var(--color-ring)', /* green-400 */
        background: 'var(--color-background)', /* near-black */
        foreground: 'var(--color-foreground)', /* white */
        primary: {
          DEFAULT: 'var(--color-primary)', /* black */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* gray-900 */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-500 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* gray-800 */
          foreground: 'var(--color-muted-foreground)', /* gray-400 */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* green-400 */
          foreground: 'var(--color-accent-foreground)', /* black */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* gray-900 */
          foreground: 'var(--color-popover-foreground)', /* white */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* gray-800 */
          foreground: 'var(--color-card-foreground)', /* white */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* green-400 */
          foreground: 'var(--color-success-foreground)', /* black */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-400 */
          foreground: 'var(--color-warning-foreground)', /* black */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-500 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
        surface: {
          DEFAULT: 'var(--color-surface)', /* gray-800 */
          foreground: 'var(--color-surface-foreground)', /* white */
        },
        'text-primary': 'var(--color-text-primary)', /* white */
        'text-secondary': 'var(--color-text-secondary)', /* gray-500 */
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 136, 0.2)',
        'neomorph': 'var(--neomorph-inset)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'stealth-reveal': 'stealth-reveal 0.8s ease-out forwards',
        'quantum-rotate': 'quantum-rotate 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
          },
          '50%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'stealth-reveal': {
          '0%': { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
          '100%': { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
        'quantum-rotate': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '100%': { transform: 'scale(1.2) rotate(45deg)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('tailwindcss-animate'),
  ],
}