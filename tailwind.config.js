/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5A67D8', // Example premium color
                secondary: '#ECC94B',
                dark: '#1A202C',
            }
        },
    },
    plugins: [],
}
