import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10212B",
        mist: "#F3F7F4",
        sage: "#DCE9E1",
        fern: "#166534",
        lime: "#DFF35B",
        peach: "#FFE5D4",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 33, 43, 0.08)",
        card: "0 1px 2px rgba(16, 33, 43, 0.05), 0 10px 30px rgba(16, 33, 43, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
