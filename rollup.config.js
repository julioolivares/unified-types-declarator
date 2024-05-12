const typescript = require('@rollup/plugin-typescript')

module.exports = [{
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),

  ],
  external: []
},
{
  input: 'src/ut-declarator.ts',
  output: [
    {
      file: 'dist/ut-declarator.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),
  ],
  external: []
}]
