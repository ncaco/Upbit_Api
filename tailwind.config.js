/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        upbit: {
          blue: '#093687',
          red: '#d24f45',
          green: '#28a745'
        }
      }
    },
  },
  plugins: [],
} 