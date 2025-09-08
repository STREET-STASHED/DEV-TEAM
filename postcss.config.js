module.exports = {
  plugins: {
    // Tailwind must run first
    '@tailwindcss/postcss': {},
    // Then other PostCSS plugins
    'postcss-nesting': {},
    autoprefixer: {},
  },
};
