import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const pkg = require("./package.json");
const format_arg = process.env.format;
const formatList = format_arg ? format_arg.split(",") : ["cjs", "esm"];
const isNpmPkg = !formatList.includes("umd");

// 最小化版本文件头注释信息
const banner = `/*!
 * ${pkg.name} v${pkg.version} build-time: ${new Date().toLocaleString()}
 */
`;

const output = isNpmPkg
  ? formatList.map((format) => ({
      file: {
        cjs: pkg.main,
        esm: pkg.module,
        umd: pkg.unpkg,
      }[format],
      format,
    }))
  : [
      {
        exports: 'named',
        name: "XXX", // name属性是windows上的全局变量名，umd模式生效
        file: pkg.unpkg.replace(".js", ".min.js"), // 添加一个压缩包
        format: "umd",
        plugins: [terser()],
        banner
      },
      {
        exports: 'named',
        name: "XXX",
        file: pkg.unpkg,
        format: "umd",
        banner
      },
    ];

const config = {
  input: "src/index.ts",
  /*
  * [
        { file: 'lib/index.common.js', format: 'cjs' },
        { file: 'lib/index.esm.js', format: 'esm' }
    ]
  */
  output: output,
  // 只有script标签用到的资源需要把runtime解析进去
  external: isNpmPkg ? [/@babel\/runtime/] : [],
  plugins: [
    json(),
    resolve(),
    commonjs({
      include: /node_modules/,
      extensions: [".js", ".ts"],
    }),
    babel({
      babelHelpers: "runtime",
      include: ["src/**"],
      exclude: 'node_modules/**',
      extensions: [".js", ".ts"],
    }),
  ],
};
export default config;
