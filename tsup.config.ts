import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: false,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  target: 'node16',
  outDir: 'dist',
  external: ['axios', 'lodash-es', 'express', 'swagger-parser'],
  shims: true,
  treeshake: true,
  bundle: true
});