/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#5B7EE5',
          'dark-blue': '#4A6BD4',
          purple: '#8B7BE5',
        },
        neutral: {
          white: '#FFFFFF',
          'light-gray': '#F5F5F5',
          gray: '#E5E5E5',
          'dark-gray': '#666666',
          charcoal: '#333333',
        },
        accent: {
          pink: '#FFB3D9',
          'light-blue': '#B3D9FF',
          coral: '#FFB3B3',
        },
      },
      fontFamily: {
        primary: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(91, 126, 229, 0.15)',
        'glass-lg': '0 16px 48px rgba(91, 126, 229, 0.2)',
      },
    },
  },
  plugins: [],
}