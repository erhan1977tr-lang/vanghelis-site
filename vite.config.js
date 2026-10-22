import { defineConfig } from 'vite';

// Build-ul produce un script clasic (IIFE), astfel încât dist/index.html
// să poată fi deschis și direct din fișier, fără server.
const classicScript = () => ({
  name: 'classic-script',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml: (html) => html.replace(/<script type="module" crossorigin/g, '<script defer').replace(/ crossorigin/g, ''),
});

export default defineConfig({
  base: './',
  plugins: [classicScript()],
  build: {
    assetsInlineLimit: 0,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
});
