const typescript = require('@rollup/plugin-typescript')

module.exports = [{
  input: 'src/index.ts', // Tu archivo de entrada
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm', // Formato ESM
      name: "TypesGenerator",
      sourcemap: true
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs', // Formato CommonJS
      name: "TypesGenerator",
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),

  ],
  external: []
},
{
  input: 'src/ut-generator.ts',
  output: [
    {
      file: 'dist/ut-generator.js',
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
