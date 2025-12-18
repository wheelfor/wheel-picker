import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/js/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: false,
  banner: {
    js: '// @ts-nocheck',
  },
  outDir: 'dist',
  // Force output to index.js
  outExtension: () => ({ js: '.js' }),
});
