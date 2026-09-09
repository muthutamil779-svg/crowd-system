/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kitchen: {
          50: '#f4fbf7',
          100: '#e6f7ef',
          200: '#c5eedb',
          300: '#94dfbe',
          400: '#5dc69b',
          500: '#34ab7e',
          600: '#258b65',
          700: '#1f6f52',
          800: '#1c5843',
          900: '#184938',
          950: '#0c2920',
        },
        warm: {
          50: '#fdfbf7',
          100: '#faf5eb',
          200: '#f4e9d3',
          300: '#ecd6b2',
          400: '#e1bd8a',
          500: '#d5a164',
          600: '#c3874c',
          700: '#a36b3e',
          800: '#835537',
          900: '#6c4630',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 2.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
