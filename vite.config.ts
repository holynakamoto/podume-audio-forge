
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Include pdfjs-dist in dependency pre-bundling
    include: ['pdfjs-dist'],
  },
  worker: {
    // Configure worker handling for PDF.js
    format: 'es',
    plugins: () => [react()]
  },
  assetsInclude: ['**/*.wasm', '**/*.mjs'],
}));
