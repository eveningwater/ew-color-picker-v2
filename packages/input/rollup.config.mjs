import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildType = [
  {
    format: 'umd',
    ext: '.js',
    env: 'development',
  },
  {
    format: 'umd',
    ext: '.min.js',
    env: 'production',
  },
  {
    format: 'es',
    ext: '.esm.js',
    env: 'development',
  },
];

function generateBuildConfigs() {
  const result = [];
  buildType.forEach((type) => {
    const isMin = type.ext.indexOf('min') > -1;
    const plugins = [];
    
    if (isMin) {
      plugins.push(uglify());
    }

    plugins.push(typescript({
      verbosity: -1,
      tsconfig: './tsconfig.json',
      check: false,
      declaration: false
    }));

    plugins.push(replace({
      __DEV__: !isMin,
      'process.env.NODE_ENV': isMin ? 'production' : 'development',
      preventAssignment: true,
    }));

    const config = {
      input: 'src/index.ts',
      output: {
        file: `dist/input${type.ext}`,
        name: 'Input',
        format: type.format,
        exports: 'default',
        banner: `/*!
 * @ew-color-picker/input
 * (c) 2024-${new Date().getFullYear()} eveningwater(854806732@qq.com)
 * Released under the MIT License.
 */`,
        globals: {
          '@ew-color-picker/core': 'Core',
          '@ew-color-picker/utils': 'Utils'
        }
      },
      plugins,
      external: ['@ew-color-picker/core', '@ew-color-picker/utils'],
    };

    Object.defineProperties(config, {
      packageName: { value: 'input' },
      ext: { value: type.ext },
    });

    result.push(config);
  });
  return result;
}

export default generateBuildConfigs(); 