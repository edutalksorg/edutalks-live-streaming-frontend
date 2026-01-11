/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // We're moving almost all complex colors to index.css @theme
                // but keeping primary here for quick utility if needed, 
                // though index.css variables will take precedence in v4.
                primary: {
                    DEFAULT: '#EE1D23',
                    hover: '#D1191F',
                    active: '#B91C1C',
                }
            },
            borderRadius: {
                'premium': '1.5rem',
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
