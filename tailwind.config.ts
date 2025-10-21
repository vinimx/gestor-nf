import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background-color)",
        foreground: "var(--cor-texto)",
        primary: "var(--cor-primaria)",
        secondary: "var(--cor-secundaria)",
        border: "var(--cor-borda)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-roboto)", "monospace"],
      },
      boxShadow: {
        soft: "var(--sombra-suave)",
        highlight: "var(--sombra-destaque)",
      },
    },
  },
  plugins: [],
};

export default config;




