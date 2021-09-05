# 配置项

## babel 学习相关

### 转换出来的代码有 require，所以浏览器不能直接运行

是的，浏览器未内置 require().

Babel 默认将导入和导出声明转换为 CommonJS(require/module.exports).

Babel 什么也没做，基本上就像 const babel = code => code 一样； 通过解析代码，然后再次生成相同的代码.

如果您想在浏览器中运行现代 JavaScript，单凭 Babel 是不够的，那么您还需要一个支持 CommonJS 模块语句的构建系统或捆绑程序:

Babelify + Browserify

Babel + WebPack

这两个工具将转换您的 require 调用，以便在浏览器中工作.

编译为 AMD 格式(transform-es2015-modules-amd)，并将 Require.js 包含在您的应用程序中.

### babel 如何配置

见`babel.config.json`

### 依赖项

```json
  "devDependencies": {
    "@babel/cli": "^7.14.8",
    "@babel/core": "^7.15.0",
    "@babel/plugin-transform-runtime": "^7.15.0",
    "@babel/preset-env": "^7.15.0",
    "@babel/runtime": "^7.15.3"
  },
  "dependencies": {
    "@babel/polyfill": "^7.12.1", // 如果配置项内useBuiltIns 为 'entry'，就需要在资源文件内手动写上 require("@babel/polyfill");
    // "@babel/plugin-transform-runtime"的corejs配置为3的时候需要这个，如果corejs是2，则需要"@babel/runtime-corejs2"
    // 详见官方文档https://www.babeljs.cn/docs/babel-plugin-transform-runtime#corejs
    "@babel/runtime-corejs3": "^7.15.3",
    "core-js": "^3.6.5" // preset-env 需要用这个去转换、实现新的内置函数、实例方法
  }
```

## rollup 配置相关

- 极其重要的配置项是`external: isNpmPkg ? [/@babel\/runtime/] : []`, 在`cjs`和`esm`的时候是不需要将`polyfill`完全打到文件中去的。而浏览器用的 script 文件则需要。
- 其他坑点看配置文件里的注释。

## ts 配置相关

生成声明文件不需要额外在 rollup 或者 babel 配置里面去做，直接在`tsconfig.json`中的`emit`区域中配置**只输出类型声明文件**，并指定输出目录。最后执行`tsc`命令就行。

```js
    /* Emit */
    "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    "outDir": "./types",
```
