import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
const version = require('./package.json');
const rollupTypescript = require('rollup-plugin-typescript');
const banner =
  '/*!\n' +
  ` * ew-color-picker-util.js v${version.version}\n` +
  ` * (c) 2019-${new Date().getFullYear()} eveningwater \n` +
  ' * Released under the MIT License.\n' +
  ' */';
export default {
  input: 'index.ts',
  output: [
    {
      file: './dist/ew-color-picker-util.min.js',
      format: 'umd',
      name: 'ewColorPicker',
      plugins: [terser()],
      banner
    },
    {
      file: './dist/ew-color-picker-util.esm.min.js',
      format: 'es',
      name: 'ewColorPicker',
      plugins: [terser()],
      banner
    }
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    }),
    rollupTypescript()
  ]
};
