import scss from 'rollup-plugin-scss';

const buildType = [
  {
    ext: '.css',
    env: 'development',
  },
  {
    ext: '.min.css',
    env: 'production',
  },
];

function generateBuildConfigs() {
  const result = [];
  buildType.forEach((type) => {
    const isMin = type.ext.indexOf('min') > -1;
    
    const config = {
      input: 'src/index.scss',
      output: {
        file: `dist/index${type.ext}`,
        banner: `/*!
 * @ew-color-picker/style
 * (c) 2024-${new Date().getFullYear()} eveningwater(854806732@qq.com)
 * Released under the MIT License.
 */`,
      },
      plugins: [
        scss({
          failOnError: true,
          outputStyle: isMin ? 'compressed' : 'expanded',
          sourceMap: false,
          // 直接输出到文件
          fileName: `index${type.ext}`,
        }),
      ],
      // 减少 rollup 警告
      onwarn(warning, warn) {
        // 忽略空 chunk 警告
        if (warning.code === 'EMPTY_BUNDLE') return;
        warn(warning);
      },
    };

    Object.defineProperties(config, {
      packageName: { value: 'style' },
      ext: { value: type.ext },
    });

    result.push(config);
  });
  return result;
}

export default generateBuildConfigs(); 