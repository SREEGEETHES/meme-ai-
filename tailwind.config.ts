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
        cream: "#F5F0E6",
        meme: {
          red: "#E63946",
          black: "#0A0A0A",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #0A0A0A",
      },
    },
  },
  plugins: [],
};

export default config;
