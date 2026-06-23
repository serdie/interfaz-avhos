import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { filesystemDevPlugin } from './src/services/fs-vite-plugin.js';
import { resolve } from 'node:path';

const projectRoot = resolve(__dirname, '..', '..');

export default defineConfig({
  plugins: [
    react(),
    filesystemDevPlugin(projectRoot),
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/target/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },
});
