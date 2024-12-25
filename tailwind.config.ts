import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        backgroundtwo: "var(--color-background-two)",
        tertiary: "var(--color-tertiary)",
        tertiarytransparent: "var(--color-tertiary-transparent)",
        text: "var(--color-text)",
        link: "var(--color-link)",
        yours: "var(--color-yours)",
        yourstransparent: "var(--color-yours-transparent)",
        gifted: "var(--color-gifted)",
        giftedtransparent: "var(--color-gifted-transparent)",
      },
    },
  },
  plugins: [],
} satisfies Config;
