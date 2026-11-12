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
        ameixa: { DEFAULT: "hsl(var(--ameixa))", suave: "hsl(var(--ameixa-suave))" },
        algodao: "hsl(var(--algodao))",
        uva: { DEFAULT: "hsl(var(--uva))", claro: "hsl(var(--uva-claro))" },
        rosa: { DEFAULT: "hsl(var(--rosa))", vivo: "hsl(var(--rosa-vivo))" },
        gema: {
          DEFAULT: "hsl(var(--gema))",
          foreground: "hsl(var(--gema-foreground))",
        },
        papel: "hsl(var(--papel))",
        whatsapp: {
          DEFAULT: "hsl(var(--whatsapp))",
          escuro: "hsl(var(--whatsapp-escuro))",
          foreground: "hsl(var(--whatsapp-foreground))",
        },
        "convite-papel": {
          DEFAULT: "hsl(var(--convite-papel))",
          claro: "hsl(var(--convite-papel-claro))",
        },
        scrim: {
          DEFAULT: "hsl(var(--scrim))",
          foreground: "hsl(var(--scrim-foreground))",
        },
        qr: "hsl(var(--qr-fundo))",
        bar: "hsl(var(--bar))",
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success-soft))",
          border: "hsl(var(--success-border))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning-soft))",
          border: "hsl(var(--warning-border))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          soft: "hsl(var(--info-soft))",
          border: "hsl(var(--info-border))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          soft: "hsl(var(--danger-soft))",
          border: "hsl(var(--danger-border))",
        },
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
        card: "var(--sombra-card)",
        modal: "var(--sombra-modal)",
        palco: "var(--sombra-palco)",
        suave: "var(--sombra-suave)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
