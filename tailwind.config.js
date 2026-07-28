/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design system: Minimalism & Swiss Style (from uipro skill)
        primary: {
          DEFAULT: '#1E3A5F',
          fg: '#FFFFFF',
        },
        secondary: '#2563EB',
        accent: '#059669',
        background: '#F8FAFC',
        foreground: '#0F172A',
        muted: '#F1F3F5',
        border: '#E4E7EB',
        destructive: '#DC2626',
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
