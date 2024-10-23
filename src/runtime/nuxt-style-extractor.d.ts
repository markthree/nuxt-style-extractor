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

declare module '#style-extractor/nuxt-style-extractor-transform.js' {
  export interface Options {
    html: string
    css: string
    name: string
  }
  type OptimiseCss = (options: Options) => Promise<string> | string
  const optimiseCss: OptimiseCss
  export default optimiseCss
}
