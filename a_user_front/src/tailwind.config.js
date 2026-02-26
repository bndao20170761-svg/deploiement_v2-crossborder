/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  plugins: [require("tailwindcss-animate")],

  theme: {
    extend: {},
  },
  plugins: [],
};
