import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const pkg = require("./package.json");
const format_arg = process.env.format;
const formatList = format_arg ? format_arg.split(",") : ["cjs", "esm"];
const isNpmPkg = !formatList.includes("umd");

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
        name: "MySdk", // name属性是windows上的全局变量名，umd模式生效
        file: pkg.unpkg.replace(".js", ".min.js"), // 添加一个压缩包
        format: "umd",
        plugins: [terser()],
      },
      {
        name: "MySdk",
        file: pkg.unpkg,
        format: "umd",
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
  external: isNpmPkg ? [/@babel\/runtime/] : [],
  plugins: [
    json(),
    nodeResolve(),
    commonjs({
      include: /node_modules/,
      extensions: [".js", ".ts"],
    }),
    babel({
      babelHelpers: "runtime",
      extensions: [".js", ".ts"],
    }),
  ],
};
export default config;
