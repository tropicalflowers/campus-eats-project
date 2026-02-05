// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This covers your main app.jsx file and other component files in the same directory
    "./*.{js,jsx}", 
    // This covers components if they are inside a 'src' folder (standard for React)
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}