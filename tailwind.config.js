/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        assistant: ['Assistant', 'sans-serif'],
        climate: ['Climate Crisis', 'sans-serif'],
      },
    },
  },
}
