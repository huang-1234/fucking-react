import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    ssr: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        client: resolve(__dirname, 'src/client/entry-client.tsx'),
        server: resolve(__dirname, 'src/entry-server.tsx')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  ssr: {
    noExternal: ['react-router-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    // Add middleware to handle SSR during development
    middlewareMode: true
  }
});