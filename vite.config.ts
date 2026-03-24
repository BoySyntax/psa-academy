import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Cloudflare tunnel support
    allowedHosts: [
      'printing-interviews-foster-seemed.trycloudflare.com',
      'psa-academy.workers.dev',
      'psa-academy.pages.dev',
      'localhost'
    ],
    hmr: {
      overlay: false,
    },
    // CORS settings for Cloudflare tunnel
    cors: true,
  },
  
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Build optimizations
  build: {
    // Enable source maps for debugging
    sourcemap: mode === "development",
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Split UI components
          ui: ['@/components/ui'],
          // Split heavy libraries
          heavy: ['framer-motion', '@tanstack/react-query'],
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
  },
  
  // Environment variables
  define: {
    __DEV__: mode === "development",
    __PROD__: mode === "production",
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  
  // CSS configuration
  css: {
    devSourcemap: mode === "development",
  },
}));