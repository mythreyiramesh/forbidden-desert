import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://<user>.github.io/forbidden-desert/
export default defineConfig({
  base: '/forbidden-desert/',
  plugins: [react()],
  test: { globals: true, environment: 'node' },
});
