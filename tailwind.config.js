/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Firmeza basada en el logo
        primary: {
          100: '#E5F7FE',
          500: '#00AEEF', // Azul brillante principal del logo
          700: '#008BC7', // Azul hover/active
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F0F0F0', // Gris claro del logo
          300: '#DEE2E6',
          600: '#6C757D',
          900: '#222222', // Gris oscuro del logo
        },
        surface: '#FFFFFF',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(34, 34, 34, 0.04)',
        'md': '0 4px 12px rgba(34, 34, 34, 0.08)',
        'lg': '0 10px 30px rgba(34, 34, 34, 0.1)',
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
      },
    },
  },
  plugins: [],
}