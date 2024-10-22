# nuxt-style-extractor

Extracts the style of the page as an external css when rendered on the server
side

<br />

## README 🦉

[简体中文](./README_CN.md) | English

<br />

## Motivation

Faster rendering and more readable seo

<br />

## Features

<!-- Highlight some of the features your module provide here -->

- 🚠 &nbsp;Optimal Caching
- ⛰ &nbsp;Supports all rendering modes, spa, ssg, ssr and ssr with
  pre-rendering.
- 🌲 &nbsp;Intelligent minification extraction, removing unused styles from the
  page, merging duplicate styles

<br />

## Quick Setup

### Install the module

```bash
npm i nuxt-style-extractor
```

### Setup Module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-style-extractor"],
});
```

That's all. Everything's automatic.

### Configuration

Of course, you can also configure it.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  styleExtractor: {
    minify: true, // Whether to enable minification
    removeUnused: true, // Whether to remove unused styles
  },
});
```

#### Custom Transformer

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
