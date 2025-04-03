import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { rollup } from "rollup";
import chalk from "chalk";
import zlib from "zlib";
import { rimraf } from "rimraf";
import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";
import replace from "@rollup/plugin-replace";
import { execaCommandSync } from "execa";
import ora from "ora";
import { createRequire } from "module";
import scss from "rollup-plugin-scss";

const require = createRequire(import.meta.url);
const __dirname = import.meta.dirname;

const spinner = ora({
  prefixText: `${chalk.green("\n[building tasks]")}`,
});

function getPackagesName() {
  let ret;
  let all = fs.readdirSync(resolve("packages"));
  // drop hidden file whose name is startWidth '.'
  // drop packages which would not be published(eg: examples and docs)
  ret = all
    .filter((name) => {
      const isHiddenFile = /^\./g.test(name);
      return !isHiddenFile;
    })
    .filter((name) => {
      const isPrivatePackages = require(resolve(
        `packages/${name}/package.json`
      )).private;
      return !isPrivatePackages;
    });

  if (ret.indexOf("style") === -1) {
    ret.push("style");
  }
  return ret;
}

function cleanPackagesOldDist(packagesName) {
  packagesName.forEach((name) => {
    const distPath = resolve(`packages/${name}/dist`);
    const typePath = resolve(`packages/${name}/dist/types`);

    if (fs.existsSync(distPath)) {
      rimraf.sync(distPath);
    }

    fs.mkdirSync(distPath);
    fs.mkdirSync(typePath);
  });
}

function resolve(p) {
  return path.resolve(__dirname, "../", p);
}

function PascalCase(str) {
  const re = /-(\w)/g;
  const newStr = str.replace(re, function (_, group1) {
    return group1.toUpperCase();
  });
  return newStr.charAt(0).toUpperCase() + newStr.slice(1);
}

const generateBanner = (name) => {
  const getPackageJSONName = require(resolve(
    `packages/${name}/package.json`
  )).name;
  let ret =
    "/*!\n" +
    " * " +
    getPackageJSONName +
    "\n" +
    " * (c) 2024-" +
    new Date().getFullYear() +
    " eveningwater\n" +
    " * Released under the MIT License.\n" +
    " */";
  return ret;
};

const buildType = [
  {
    format: "umd",
    ext: ".js",
    env: "development",
  },
  {
    format: "umd",
    ext: ".min.js",
    env: "production",
  },
  {
    format: "es",
    ext: ".esm.js",
    env: "development",
  },
];

function generateBuildConfigs(packagesName) {
  const result = [];
  packagesName.forEach((name) => {
    buildType.forEach((type) => {
      let config = {
        input: resolve(`packages/${name}/src/index.ts`),
        output: {
          file: resolve(`packages/${name}/dist/${name}${type.ext}`),
          name: PascalCase(name),
          format: type.format,
          banner: generateBanner(name),
        },
        plugins: generateBuildPluginsConfigs(
          type.ext.indexOf("min") > -1,
          name
        ),
      };
      if (name === "style") {
        config.input = resolve(`packages/${name}/src/index.scss`);
        config.output = {
          file: resolve(`packages/style/dist/style.min.css`),
        };
        config.plugins = [
          scss({
            failOnError: true,
            outputStyle: "compressed",
            sourceMap: false,
          }),
        ];
      }
      // rename
      const globalNameList = ["core", "ewColorPicker"];
      if (globalNameList.indexOf(name) > -1 && config.output.format !== "es") {
        config.output.name = "ewColorPicker";
        /** Disable warning for default imports */
        config.output.exports = "named";
        // it seems the umd bundle can not satisfies our demand
        config.output.footer =
          'if(typeof window !== "undefined" && window.ewColorPicker) { \n' +
          "  window.ewColorPicker = window.ewColorPicker.default;\n}";
      }
      // rollup will valiate config properties of config own and output a warning.
      // put packageName in prototype to ignore warning.
      Object.defineProperties(config, {
        packageName: {
          value: name,
        },
        ext: {
          value: type.ext,
        },
      });
      result.push(config);
    });
  });
  return result;
}
function generateBuildPluginsConfigs(isMin) {
  const plugins = [];
  const vars = {
    __DEV__: `process.env.NODE_ENV !== 'production'`,
  };
  const tsConfig = {
    verbosity: -1,
    tsconfig: path.resolve(__dirname, "../tsconfig.json"),
  };

  if (isMin) {
    plugins.push(uglify());
  }

  plugins.push(typescript(tsConfig));
  // build-specific env
  vars["process.env.NODE_ENV"] = isMin ? "production" : "development";
  vars.__DEV__ = !isMin;
  vars.preventAssignment = true;
  plugins.push(replace(vars));

  return plugins;
}

function build(builds) {
  let built = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(builds[built], built + 1, () => {
      builds[built - 1] = null;
      built++;
      if (built < total) {
        next();
      }
    });
  };
  next();
}

function buildEntry(config, curIndex, next) {
  const isProd = /min\.js$/.test(config.output.file);

  spinner.start(`${config.packageName}${config.ext} is buiding now. \n`);

  rollup(config)
    .then((bundle) => {
      bundle.write(config.output).then(({ output }) => {
        const code = output[0].code;

        spinner.succeed(
          `${config.packageName}${config.ext} building has ended.`
        );

        function report(extra) {
          console.log(
            chalk.magenta(path.relative(process.cwd(), config.output.file)) +
              " " +
              getSize(code) +
              (extra || "")
          );
          next();
        }
        if (isProd) {
          zlib.gzip(code, (err, zipped) => {
            if (err) return reject(err);
            let words = `(gzipped: ${chalk.magenta(getSize(zipped))})`;
            report(words);
          });
        } else {
          report();
        }

        // since we need bundle code for three types
        // just generate .d.ts only once
        if (curIndex % 3 === 0) {
          copyDTSFiles(config.packageName);
        }
      });
    })
    .catch((e) => {
      spinner.fail("buiding is failed");
      console.log(e);
    });
}

function copyDTSFiles(packageName) {
  console.log(
    chalk.cyan("> start copying .d.ts file to dist dir of packages own.")
  );
  const sourceDir = resolve(
    `packages/${packageName}/dist/packages/${packageName}/src/*`
  );
  const targetDir = resolve(`packages/${packageName}/dist/types/`);
  execaCommandSync(`mv ${sourceDir} ${targetDir}`, { shell: true });
  console.log(chalk.cyan("> copy job is done."));
  rimraf.sync(resolve(`packages/${packageName}/dist/packages`));
  rimraf.sync(resolve(`packages/${packageName}/dist/node_modules`));
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + "kb";
}

const getAnswersFromInquirer = async (packagesName) => {
  const question = {
    type: "checkbox",
    name: "packages",
    scroll: false,
    message: "Select build repo(Support Multiple selection)",
    choices: packagesName.map((name) => ({
      value: name,
      name,
    })),
  };
  let { packages } = await inquirer.prompt(question);
  // make no choice
  if (!packages.length) {
    console.log(
      chalk.yellow(`
      It seems that you did't make a choice.

      Please try it again.
    `)
    );
    return;
  }

  // chose 'all' option
  if (packages.some((p) => p === "all")) {
    packages = getPackagesName();
  }
  const { yes } = await inquirer.prompt([
    {
      name: "yes",
      message: `Confirm build ${packages.join(" and ")} packages?`,
      type: "list",
      choices: ["Y", "N"],
    },
  ]);

  if (yes === "N") {
    console.log(chalk.yellow("[release] cancelled."));
    return;
  }

  return packages;
};
const buildBootstrap = async () => {
  const packagesName = getPackagesName();
  // provide 'all' option
  packagesName.unshift("all");

  const answers = await getAnswersFromInquirer(packagesName);

  if (!answers) return;

  cleanPackagesOldDist(answers);

  const buildConfigs = generateBuildConfigs(answers);

  build(buildConfigs);
};
buildBootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
