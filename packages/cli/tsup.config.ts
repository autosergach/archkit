import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'node20',
  platform: 'node',
  noExternal: ['archkit-core'],
  splitting: false,
});
