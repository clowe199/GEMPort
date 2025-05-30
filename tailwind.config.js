// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                     // Scans your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}",       // Scans all .js, .ts, .jsx, .tsx files in your src folder and its subfolders
  ],
  theme: {
    extend: {
      colors: {
        'matrix-green': '#00FF00',
      },
      fontFamily: {
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}