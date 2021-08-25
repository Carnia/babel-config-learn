# babel 学习相关

## 转换出来的代码有 require，所以浏览器不能直接运行

是的，浏览器未内置 require().

Babel 默认将导入和导出声明转换为 CommonJS(require/module.exports).

Babel 什么也没做，基本上就像 const babel = code => code 一样； 通过解析代码，然后再次生成相同的代码.

如果您想在浏览器中运行现代 JavaScript，单凭 Babel 是不够的，那么您还需要一个支持 CommonJS 模块语句的构建系统或捆绑程序:

Babelify + Browserify

Babel + WebPack

这两个工具将转换您的 require 调用，以便在浏览器中工作.

编译为 AMD 格式(transform-es2015-modules-amd)，并将 Require.js 包含在您的应用程序中.

## babel 如何配置

见`babel.config.json`

## 依赖项

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
    "@babel/runtime-corejs3": "^7.15.3", // "@babel/plugin-transform-runtime"的corejs配置为3的时候需要这个，如果corejs是2，则需要"@babel/runtime-corejs2"
    "core-js": "^3.6.5" // preset-env 需要用这个去转换、实现新的内置函数、实例方法
  }
```
