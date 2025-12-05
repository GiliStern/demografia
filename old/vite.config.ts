import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  server: { port: 5173, open: false },
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'index.html', dest: '.' },
        { src: 'style.css', dest: '.' },
        { src: 'hebrew_vampire_survivors_package', dest: '.' },
        { src: 'assets', dest: '.' },
      ],
    }),
  ],
});
