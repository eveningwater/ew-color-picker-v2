import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/core.js',
      format: 'umd',
      name: 'Core',
      globals: {
        '@ew-color-picker/utils': 'Utils'
      }
    },
    {
      file: 'dist/core.esm.js',
      format: 'es'
    }
  ],
  plugins: [typescript({ 
    tsconfig: './tsconfig.json',
    check: false,
    verbosity: -1
  })],
  external: ['@ew-color-picker/utils']
}; 