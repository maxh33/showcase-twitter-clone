/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1DA1F2',
        'twitter-black': '#14171A',
        'twitter-dark-gray': '#657786',
      },
    },
  },
  plugins: [],
}