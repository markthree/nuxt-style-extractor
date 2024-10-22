import { join } from 'node:path'
import fs, { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { addPlugin, addServerPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

function emptyDir(dir: string) {
  if (!existsSync(dir)) {
    return
  }
  if (typeof fs.rm !== 'undefined') {
    return fs.rm(dir, { recursive: true })
  }
  return fs.rmdir(dir, { recursive: true })
}

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-style-extractor',
    configKey: 'Extracts the style of the page as an external css when rendered on the server side | 提取服务端渲染时页面的 style 为外部 css',
  },
  defaults: {
    minify: true,
    removeUnused: true,
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/inject-style-id.server'))

    addServerPlugin(resolver.resolve('./runtime/server/plugins/style-extractor'))

    const cacheDir = join(nuxt.options.buildDir, 'cache/_css/')

    if (!nuxt.options.dev) {
      await emptyDir(cacheDir)
    }

    nuxt.options.nitro ??= {}
    nuxt.options.nitro.serverAssets ??= []
    nuxt.options.nitro.serverAssets.push({
      baseName: '_css',
      dir: cacheDir,
    })
    const isGenerate = nuxt.options.dev === false && nuxt.options.nitro.static
    if (isGenerate) {
      nuxt.options.nitro.publicAssets ??= []
      nuxt.options.nitro.publicAssets.push({
        baseURL: '/_css',
        dir: cacheDir,
        maxAge: 0,
      })
    }

    addTemplate({
      filename: 'nuxt-style-extractor-options.mjs',

      getContents() {
        return `export default ${JSON.stringify(_options)}`
      },
    })

    addTypeTemplate({
      filename: 'nuxt-style-extractor-options.d.ts',
      getContents() {
        return readFile(resolver.resolve('./nuxt-style-extractor-options.d.ts'), 'utf-8')
      },
    })
  },
})
