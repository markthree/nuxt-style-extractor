# nuxt-style-extractor

提取服务端渲染时页面的 style 为外部 css

<br />

## README 🦉

[简体中文](./README_CN.md) | English

<br />

## Motivation

更快的渲染和更可读的 seo

<br />

## Features

- 🚠 &nbsp;最佳的缓存
- ⛰ &nbsp;支持 ssg, ssr 和带预渲染的 ssr
- 🌲 &nbsp;智能精简提取，移除页面中未使用的样式，合并重复的样式

<br />

## Quick Setup

### 下载模块

```bash
npm i nuxt-style-extractor
```

### 安装模块

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-style-extractor"],
});
```

仅此而已，一切都是自动的。

### 配置

当然你也可以进行配置

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  styleExtractor: {
    minify: true, // 是否开启压缩
    removeUnused: true, // 是否移除未使用
  },
});
```

#### 保持原有状态

如果你不需要任何优化，同时想保持原有的样式顺序，可以设置为 `original` 为 `true`

```ts
export default defineNuxtConfig({
  styleExtractor: {
    original: true, // 仅提取 css 不做任何优化处理
  },
});
```

#### 自定义转换器

```ts
// style-extractor.js
export default (options) => {
  return options.css + "body { background: red }";
};

// nuxt.config.ts
export default defineNuxtConfig({
  styleExtractor: {
    transformFile: "style-extractor.js",
  },
});
```
