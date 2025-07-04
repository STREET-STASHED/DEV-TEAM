/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#FFD700',    // Gold
        secondary: '#000000',  // Black
        accent: '#D4AF37',     // Secondary gold tone
      },
      backgroundImage: {
        graffiti: "url('/images/graffiti-wall.jpg')", // Full-bleed graffiti background
        'hero-bg': "url('/images/hero-street.jpg')",
      },
    },
  },
  plugins: [],
};