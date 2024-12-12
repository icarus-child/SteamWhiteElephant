//@type {import('tailwindcss').Config}

module.exports = {
  content: ["./views/**/*.{go,js,templ,html}"],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      background: "var(--color-background)",
      background: "var(--color-background-two)",
      tertiary: "var(--color-tertiary)",
      text: "var(--color-text)",
    },
    //fontFamily: {
    //  display: ["Kelsi"],
    //},
    extend: {},
  },
  plugins: [],
};
