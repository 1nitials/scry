/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#6B6DE4',
        'custom-dark-blue': '#301892',
        'conversation-hover': '#63b8a5',
        'user-color': '#a0f1af'
      },
      fontFamily: {
        pirata: ['var(--font-pirata)'],
        prata: ['var(--font-prata)'],
        neuton: ['var(--font-neuton)'],
      },
    },
  },
  plugins: [],
}
