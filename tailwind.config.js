/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        text: '#ffffff',
        background: '#060b1e',
        primary: '#efdea9',
        secondary: '#09122f',
        accent: '#d7af2d'
      }
    }
  },
  plugins: []
}
