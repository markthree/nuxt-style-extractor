declare module '#build/nuxt-style-extractor-config-hash.js' {
  export const configHash: string
}

declare module '#build/nuxt-style-extractor-transform.js' {
  export interface Options {
    html: string
    css: string
    name: string
  }
  type OptimiseCss = (options: Options) => Promise<string> | string
  const optimiseCss: OptimiseCss
  export default optimiseCss
}

declare module '#style-extractor/nuxt-style-extractor-cache-control.js' {
  const cacheControl: string
  export default cacheControl
}

declare module '#style-extractor/remove-unused.js' {
  export interface Options {
    html: string
    css: string
    name: string
  }
  type OptimiseCss = (options: Options) => Promise<string> | string
  const removeUnusedCss: OptimiseCss
  export const removeUnusedCss
}

declare module '#style-extractor/minify.js' {
  const minify: (css: string) => string
  export const minify
}
