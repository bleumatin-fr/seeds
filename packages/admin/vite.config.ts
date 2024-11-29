import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_URL,
  plugins: [svgr(), react()],
  server: {
    port: 4002,
  },
});
