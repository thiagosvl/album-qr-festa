import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import pacote from "./package.json";

/** Versão exibida no app: número do pacote + commit do deploy (Vercel) para conferir o que está no ar. */
const COMMIT_CURTO = (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7);
const VERSAO_APP = `v${pacote.version}+${COMMIT_CURTO}`;

export default defineConfig({
  base: "/",
  server: {
    host: "::",
    port: 5173,
  },
  define: {
    __VERSAO_APP__: JSON.stringify(VERSAO_APP),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
