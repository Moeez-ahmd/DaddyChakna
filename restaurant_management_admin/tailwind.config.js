export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            brand: {
                50: '#fef2f2',
                100: '#fee2e2',
                500: '#ef4444',
                600: '#dc2626',
                900: '#7f1d1d',
            },
            dark: {
                100: '#1e293b',
                200: '#0f172a',
                300: '#020617',
            }
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
