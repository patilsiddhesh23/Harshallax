/******** Tailwind config aligned to Figma tokens ********/
/** Add/adjust colors & fonts as we refine tokens */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FF1E1E',
          dark: '#0B0B0B',
          gray: '#1E1E1E',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.4)'
      }
    },
  },
  plugins: [],
}
