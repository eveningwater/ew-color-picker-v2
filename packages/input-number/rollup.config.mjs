import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/input-number.js',
      format: 'umd',
      name: 'InputNumber',
      exports: 'default',
      globals: {
        '@ew-color-picker/core': 'Core',
        '@ew-color-picker/utils': 'Utils'
      }
    },
    {
      file: 'dist/input-number.esm.js',
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