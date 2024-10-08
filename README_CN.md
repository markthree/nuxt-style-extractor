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
- ⛰ &nbsp;支持所有渲染模式, spa, ssg, ssr 和带预渲染的 ssr
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
