import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/panel.js',
      format: 'umd',
      name: 'Panel',
      exports: 'default',
      globals: {
        '@ew-color-picker/core': 'Core',
        '@ew-color-picker/utils': 'Utils'
      }
    },
    {
      file: 'dist/panel.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    typescript({ 
      tsconfig: './tsconfig.json',
      check: false,
      verbosity: -1,
      declaration: false
    })
  ],
  external: ['@ew-color-picker/core', '@ew-color-picker/utils']
}; 