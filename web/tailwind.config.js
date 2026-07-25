/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#38A169', // Verde Hoja Logo
          600: '#2F855A', // Hover Verde Logo
          700: '#276749',
          800: '#22543D',
          900: '#1C4532',
          DEFAULT: '#38A169',
        },
        sidebar: {
          navy: '#0F172A',
        },
        canvas: '#F8FAFC',
        secondary: {
          50: '#E0F2FE',
          100: '#BAE6FD',
          200: '#7DD3FC',
          300: '#38BDF8',
          400: '#0284C7',
          500: '#0077C8', // Secondary Accent
          600: '#0369A1',
          700: '#075985',
          800: '#0C4A6E',
          900: '#0A3650',
          DEFAULT: '#0077C8',
        },
        accent: {
          warm: '#F59E0B',
          DEFAULT: '#F59E0B',
        },
        success: {
          100: '#DCFCE7',
          300: '#86EFAC',
          500: '#38A169',
          700: '#276749',
          900: '#1C4532',
        },
        error: {
          100: '#FEE2E2',
          300: '#FCA5A5',
          500: '#EF4444',
          700: '#B91C1C',
          900: '#7F1D1D',
        },
        warning: {
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#F59E0B',
          700: '#B45309',
          900: '#78350F',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
