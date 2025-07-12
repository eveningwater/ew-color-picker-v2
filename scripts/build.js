// scripts/build.js
import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';
import scss from 'rollup-plugin-scss';
import fs from 'fs';
import path from 'path';

const packagesDir = path.resolve(__dirname, '../packages');
const buildType = [
  { format: 'umd', ext: '.js', minify: false },
  { format: 'umd', ext: '.min.js', minify: true },
  { format: 'es', ext: '.esm.js', minify: false }
];

// external 依赖和全局变量配置（可根据实际包名补充/调整）
const externalMap = {
  core: ['@ew-color-picker/utils'],
  alpha: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  hue: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  panel: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  input: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  inputNumber: ['@ew-color-picker/utils'],
  button: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  predefine: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  colorMode: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  ewColorPicker: [],
  box: ['@ew-color-picker/core', '@ew-color-picker/utils'],
  console: [],
  icon: [],
  utils: [],
};
const globalsMap = {
  core: { '@ew-color-picker/utils': 'Utils' },
  alpha: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  hue: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  panel: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  input: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  inputNumber: { '@ew-color-picker/utils': 'Utils' },
  button: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  predefine: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  colorMode: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  ewColorPicker: {},
  box: { '@ew-color-picker/core': 'Core', '@ew-color-picker/utils': 'Utils' },
  console: {},
  icon: {},
  utils: {},
};

function getBanner(pkg) {
  return `/*!
 * @ew-color-picker/${pkg}
 * (c) 2024-${new Date().getFullYear()} eveningwater(854806732@qq.com)
 * Released under the MIT License.
 */`;
}

async function buildJsTsPackage(pkg) {
  const pkgDir = path.join(packagesDir, pkg);
  const input = path.join(pkgDir, 'src/index.ts');
  if (!fs.existsSync(input)) return;

  for (const type of buildType) {
    const isMin = type.minify;
    const plugins = [
      typescript({ tsconfig: path.join(pkgDir, 'tsconfig.json'), check: false, verbosity: -1 }),
      replace({
        __DEV__: !isMin,
        'process.env.NODE_ENV': isMin ? 'production' : 'development',
        preventAssignment: true,
      }),
    ];
    if (isMin) plugins.push(uglify());

    const bundle = await rollup({
      input,
      plugins,
      external: externalMap[pkg] || [],
    });

    await bundle.write({
      file: path.join(pkgDir, 'dist', `${pkg}${type.ext}`),
      format: type.format,
      name: pkg.charAt(0).toUpperCase() + pkg.slice(1),
      banner: getBanner(pkg),
      globals: globalsMap[pkg] || {},
      exports: 'default',
    });
    await bundle.close();
  }
}

async function buildStylePackage(pkg) {
  const pkgDir = path.join(packagesDir, pkg);
  const scssDir = path.join(pkgDir, 'src');
  if (!fs.existsSync(scssDir)) return;
  const scssFiles = fs.readdirSync(scssDir).filter(f => f.endsWith('.scss'));
  if (scssFiles.length === 0) return;

  const buildType = [
    { ext: '.css', minify: false },
    { ext: '.min.css', minify: true }
  ];

  for (const file of scssFiles) {
    for (const type of buildType) {
      const isMin = type.minify;
      const input = path.join(scssDir, file);
      const outName = file.replace(/\.scss$/, type.ext);
      const bundle = await rollup({
        input,
        plugins: [
          scss({
            failOnError: true,
            outputStyle: isMin ? 'compressed' : 'expanded',
            sourceMap: false,
            fileName: outName,
          }),
        ],
        onwarn(warning, warn) {
          if (warning.code === 'EMPTY_BUNDLE') return;
          warn(warning);
        },
      });
      await bundle.write({
        file: path.join(pkgDir, 'dist', outName),
        banner: getBanner(pkg + (file !== 'index.scss' ? ' ' + file.replace('.scss', '') : '')),
      });
      await bundle.close();
    }
  }
}

async function buildAll() {
  const packages = fs.readdirSync(packagesDir).filter(f =>
    fs.statSync(path.join(packagesDir, f)).isDirectory()
  );
  for (const pkg of packages) {
    // style 包特殊处理
    if (pkg === 'style') {
      console.log(`Building style package...`);
      await buildStylePackage(pkg);
      continue;
    }
    // 只构建含 src/index.ts 的包
    if (fs.existsSync(path.join(packagesDir, pkg, 'src/index.ts'))) {
      console.log(`Building ${pkg}...`);
      await buildJsTsPackage(pkg);
    }
  }
  console.log('All packages built!');
}

buildAll();
