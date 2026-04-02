/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        stack_sans_notch: ["var(--font-stack_sans_notch)"],
        sora: ["var(--font-sora)"],
      },
      colors: {
        accent: "var(--color-accent)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
      },
      backgroundImage: {
        hero: "url(/components/assets/hero-bg.png)",
        // hero: "url(/components/assets/hero_2.png)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
