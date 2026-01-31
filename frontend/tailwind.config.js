/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['Geist Mono', 'monospace'],
        heading: ['Space Mono', 'monospace'],
        body: ['Geist', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'word-reveal': 'wordReveal 0.5s linear forwards',
        'float-3d': 'float3d 3s ease-in-out infinite alternate',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        wordReveal: {
          '0%': { opacity: '0', transform: 'translateY(10px) rotateX(-90deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        float3d: {
          '0%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '100%': { transform: 'translateY(-10px) rotateX(5deg) rotateY(5deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
