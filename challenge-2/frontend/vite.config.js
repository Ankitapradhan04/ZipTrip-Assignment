import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Two separate HTML entry points = two separate pages that each load
// their own JS bundle and mount their own React root. Navigating between
// them (via plain <a href="..."> tags) triggers a full browser page load,
// the way the brief asked for "multiple page instead of SPA" — there is
// no client-side router stitching these together into one document.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        todo: resolve(__dirname, 'todo.html'),
      },
    },
  },
});
