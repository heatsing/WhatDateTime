import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F2933",
        mist: "#F6F7F8",
        sage: "#E9EEF3",
        fern: "#1769AA",
        lime: "#E7F0F8",
        peach: "#F2F4F6",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(31, 41, 51, 0.07)",
        card: "0 1px 2px rgba(31, 41, 51, 0.05)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
