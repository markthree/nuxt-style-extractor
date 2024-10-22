declare module '#build/nuxt-style-extractor-config-hash.mjs' {
  export const configHash: string
}

declare module '#build/nuxt-style-extractor-transform.mjs' {
  export interface Options {
    html: string
    css: string
    name: string
  }
  type OptimiseCss = (options: Options) => Promise<string> | string
  const optimiseCss: OptimiseCss
  export default optimiseCss
}
