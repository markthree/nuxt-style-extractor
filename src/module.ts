import { join } from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { hash } from 'ohash'
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
export interface ModuleOptions {
  /**
   * @default true
   */
  minify: boolean
  /**
   * @default true
   */
  removeUnused: boolean

  /**
   * @default automatically use built-in modules via other configurations by default
   * @description Optimise css module path
   * @example
   * ```
   * // style-extractor.mjs
   * export default options => {
   *    return options.css + 'body { background: red }'
   * }
   *
   * // nuxt.config.ts
   * export default defineNuxtConfig({
   *  styleExtractor: {
   *    transformFile: 'style-extractor.mjs'
   *  }
   * })
   * ```
   */
  transformFile: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-style-extractor',
    configKey: 'styleExtractor',
  },
  defaults: {
    minify: true,
    removeUnused: true,
    transformFile: '',
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugin.server'))

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
      filename: 'nuxt-style-extractor-config-hash.mjs',
      getContents() {
        return `export const configHash = "${hash(_options)}"`
      },
    })

    addTemplate({
      filename: 'nuxt-style-extractor-transform.mjs',
      getContents() {
        if (_options.transformFile !== '') {
          return fs.readFile(_options.transformFile, 'utf-8')
        }
        return fs.readFile(getDefaultTransformFile(), 'utf-8')
      },
    })

    addTypeTemplate({
      filename: 'nuxt-style-extractor.d.ts',
      getContents() {
        return fs.readFile(resolver.resolve('./runtime/nuxt-style-extractor.d.ts'), 'utf-8')
      },
    })

    function getDefaultTransformFile() {
      if (_options.minify && _options.removeUnused) {
        return resolver.resolve('./runtime/transforms/best.mjs')
      }

      if (_options.minify) {
        return resolver.resolve('./runtime/transforms/minify.mjs')
      }

      if (_options.removeUnused) {
        return resolver.resolve('./runtime/transforms/remove-unused.mjs')
      }

      return resolver.resolve('./runtime/transforms/plain.mjs')
    }
  },
})
