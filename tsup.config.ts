import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  target: 'node16',
  outDir: 'dist',
  external: ['axios', 'lodash-es', 'express', 'swagger-parser'],
  shims: true
});