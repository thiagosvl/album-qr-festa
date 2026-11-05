import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Bricolage Grotesque Variable", "Inter", "sans-serif"],
        festive: ["Bricolage Grotesque Variable", "Inter", "sans-serif"],
      },
      colors: {
        ameixa: { DEFAULT: "#1c0f2e", suave: "#4b3a63" },
        algodao: "#ffe4f0",
        uva: { DEFAULT: "#7c3aed", claro: "#ede4ff" },
        rosa: { DEFAULT: "#e6007e", vivo: "#ff4f9a" },
        gema: "#ffd23f",
        papel: "#fdfbff",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        card: "28px",
        modal: "28px",
        button: "999px",
        photo: "18px",
        "3xl": "1.5rem",
        "2xl": "1.125rem",
        xl: "var(--radius-xl, 1.5rem)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 12px 30px -14px rgba(28, 15, 46, 0.22)",
        modal: "0 30px 70px -24px rgba(28, 15, 46, 0.45)",
        palco: "0 40px 80px -30px rgba(28, 15, 46, 0.45)",
        suave: "0 12px 30px -12px rgba(28, 15, 46, 0.25)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
