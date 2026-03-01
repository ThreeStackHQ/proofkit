import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          500: "#f97316",
          600: "#ea580c",
        }
      }
    }
  },
  plugins: [],
};

export default config;
