/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        gold: {
          light: '#FFEF9F',
          DEFAULT: '#FFD700',
          dark: '#B8860B',
        },
        gray: {
          light: '#f7f7f7',
          DEFAULT: '#a1a1aa',
          dark: '#27272a',
        },
        brand: {
          DEFAULT: '#000000',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      backgroundImage: {
        'graffiti-1': "url('/images/graffiti-1.jpg')",
        'graffiti-2': "url('/images/graffiti-2.jpg')",
        'graffiti-dark': "url('/images/graffiti-dark.jpg')",
        'default-bg': "url('/background.png')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};