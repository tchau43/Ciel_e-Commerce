import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@services": path.resolve(__dirname, "./src/repositories"),
      "@ts-types": path.resolve(__dirname, "./src/ts-types"),
      "@repositories": path.resolve(__dirname, "./src/repositories"),
      "@locales": path.resolve(__dirname, "./public/locales"),
    },
  },
  plugins: [react(), tailwindcss()],
});
