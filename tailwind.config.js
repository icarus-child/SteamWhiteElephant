//@type {import('tailwindcss').Config}

module.exports = {
  content: ["./views/**/*.{go,js,templ,html}"],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      background: "var(--color-background)",
      backgroundtwo: "var(--color-background-two)",
      tertiary: "var(--color-tertiary)",
      tertiarytransparent: "var(--color-tertiary-transparent)",
      text: "var(--color-text)",
      link: "var(--color-link)",
    },
    //fontFamily: {
    //  display: ["Kelsi"],
    //},
    extend: {},
  },
  plugins: [],
};
