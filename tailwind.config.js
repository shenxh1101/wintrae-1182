/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          50: "#F5F7F6",
          100: "#E5EAE8",
          200: "#C5D1CC",
          300: "#9CB4AB",
          400: "#6A8C81",
          500: "#4A6E63",
          600: "#3B5A51",
          700: "#2D4A3E",
          800: "#243C33",
          900: "#1E322B",
          950: "#111D19",
        },
        amber: {
          50: "#FBF6F1",
          100: "#F7EADC",
          200: "#EFD1B5",
          300: "#E8B383",
          400: "#E8A87C",
          500: "#D98E5A",
          600: "#C2723F",
          700: "#A25B34",
          800: "#83492F",
          900: "#6B3D2A",
          950: "#3A1F14",
        },
        paper: {
          50: "#FDFBF8",
          100: "#FAF6F0",
          200: "#F5F1EB",
          300: "#EFE9DE",
          400: "#E5DCCD",
          500: "#D8CDB8",
        },
        espresso: {
          50: "#F6F2EF",
          100: "#ECE6E0",
          200: "#D8CDC2",
          300: "#BDAE9C",
          400: "#9D8A74",
          500: "#7A6650",
          600: "#5D4B38",
          700: "#3E2723",
          800: "#2B1B17",
          900: "#1A1210",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        paper: "0 2px 8px rgba(62, 39, 35, 0.08), 0 1px 3px rgba(62, 39, 35, 0.04)",
        card: "0 4px 20px rgba(45, 74, 62, 0.10), 0 1px 4px rgba(45, 74, 62, 0.06)",
        lift: "0 10px 30px rgba(45, 74, 62, 0.15), 0 3px 10px rgba(45, 74, 62, 0.08)",
      },
      backgroundImage: {
        'paper-texture': "linear-gradient(135deg, #FDFBF8 0%, #FAF6F0 50%, #F5F1EB 100%)",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scan': 'scan 1.6s ease-in-out infinite',
        'checkmark': 'checkmark 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        checkmark: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
