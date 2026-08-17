import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rda: {
          bg: "#0d1f17",
          panel: "#123527",
          panel2: "#0f2b1f",
          border: "#2f5b45",
          gold: "#e0b84b",
          gold2: "#c9a23e",
          teal: "#2fb6c4",
          text: "#eaf3ee",
          muted: "#9fc0ae",
          win: "#3fae5a",
          lose: "#c0453f",
          draw: "#d9a441",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
