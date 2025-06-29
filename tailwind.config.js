/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#F5F5F5',
        background: '#FFFFFF'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'lato': ['Lato', 'sans-serif']
      },
      width: {
        'mobile': '390px'
      },
      maxWidth: {
        'mobile': '390px'
      }
    },
  },
  plugins: [],
};