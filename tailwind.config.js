/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#EE1D23',
                    hover: '#D1191F',
                    active: '#B91C1C',
                    light: '#FEE2E2',
                    glow: 'rgba(238, 29, 35, 0.15)',
                },
                surface: {
                    DEFAULT: '#121212',
                    dark: '#050505',
                    light: '#1E1E1E',
                    border: '#262626',
                },
                neutral: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    400: '#9CA3AF',
                    500: '#737373',
                    600: '#4B5563',
                    900: '#111827',
                },
                accent: {
                    white: '#FFFFFF',
                    gray: '#A3A3A3',
                }
            },
            borderRadius: {
                'premium': '12px',
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 10px -1px rgba(0, 0, 0, 0.04)',
                'premium-hover': '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 5px 15px -3px rgba(0, 0, 0, 0.08)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
