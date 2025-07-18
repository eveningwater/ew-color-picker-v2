import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';

const __DEV__ = process.env.NODE_ENV !== 'production';

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
      check: false
    }));

    plugins.push(replace({
      __DEV__: !isMin,
      'process.env.NODE_ENV': isMin ? 'production' : 'development',
      preventAssignment: true,
    }));

    const config = {
      input: 'src/index.ts',
      output: {
        file: `dist/utils${type.ext}`,
        name: 'Utils',
        format: type.format,
        banner: `/*!
 * @ew-color-picker/utils
 * (c) 2024-${new Date().getFullYear()} eveningwater(854806732@qq.com)
 * Released under the MIT License.
 */`,
      },
      plugins,
      external: [],
    };

    Object.defineProperties(config, {
      packageName: { value: 'utils' },
      ext: { value: type.ext },
    });

    result.push(config);
  });
  return result;
}

export default generateBuildConfigs(); 