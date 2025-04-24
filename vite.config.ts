import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { version } from "./package.json";
import { analyzer } from 'vite-bundle-analyzer';

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// Define SQL handler plugin to support importing SQL files
const sqlRawPlugin = () => {
  return {
    name: 'vite-plugin-sql-raw',
    transform(code, id) {
      if (id.endsWith('.sql')) {
        // Return the SQL content as a JavaScript string
        const stringified = JSON.stringify(code)
        return {
          code: `export default ${stringified};`,
          map: null
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    include: [
      'framer-motion', 
      'lucide-react',
      'react-router-dom',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'tailwind-merge',
      'clsx'
    ],
  },
  plugins: [
    react(),
    tempo(),
    analyzer({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: process.env.ANALYZE === 'true',
    }),
    sqlRawPlugin(),
  ],
  css: {
    devSourcemap: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      overlay: false, // Reduces UI updates during development
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'ui-libraries': [
            '@radix-ui/react-slot', 
            'class-variance-authority', 
            'tailwind-merge', 
            'clsx'
          ],
        }
      }
    }
  },
  define: {
    APP_VERSION: JSON.stringify(version),
  },
});
