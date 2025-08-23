/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.html",
		"./src/**/*.js"
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
				serif: ["Playfair Display", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"]
			}
		}
	},
	plugins: []
};


