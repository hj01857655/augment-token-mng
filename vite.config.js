import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  // Build optimizations
  build: {
    // Enable minification with esbuild (faster and no extra dependencies)
    minify: 'esbuild',
    // esbuild minify options
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          tauri: ['@tauri-apps/api'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (disable in production)
    sourcemap: false,
  },

  // CSS optimizations
  css: {
    devSourcemap: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['vue', '@tauri-apps/api'],
  },
}));
