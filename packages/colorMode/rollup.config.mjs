import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/colorMode.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/colorMode.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      clean: true
    })
  ]
}; 