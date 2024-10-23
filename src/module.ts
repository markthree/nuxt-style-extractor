import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, isAbsolute } from 'node:path'
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
   * // style-extractor.js
   * export default options => {
   *    return options.css + 'body { background: red }'
   * }
   *
   * // nuxt.config.ts
   * export default defineNuxtConfig({
   *  styleExtractor: {
   *    transformFile: 'style-extractor.js'
   *  }
   * })
   * ```
   */
  transformFile: string

  /**
   * @default 'nuxt-style-extractor'
   * @description If you want to invalidate all caches, then change the baseHash
   */
  baseHash: string

  /**
   * @default 'public, max-age=31536000, immutable'
   * @description Set cache header, valid only when ssr is in production
   */
  cacheControl: string | null
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
    baseHash: 'nuxt-style-extractor',
    cacheControl: 'public, max-age=31536000, immutable',
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

    const transformFile = getTransformFile()

    addTemplate({
      filename: 'nuxt-style-extractor-config-hash.js',
      async getContents() {
        const modeText = await fs.readFile(transformFile, 'utf-8')
        return `export const configHash = "${hash([_options, modeText])}"`
      },
    })

    addTemplate({
      filename: 'nuxt-style-extractor-transform.js',
      getContents() {
        return fs.readFile(transformFile, 'utf-8')
      },
    })

    addTypeTemplate({
      filename: 'nuxt-style-extractor.d.ts',
      getContents() {
        return fs.readFile(resolver.resolve('./runtime/nuxt-style-extractor.d.ts'), 'utf-8')
      },
    })

    if (_options.cacheControl && !nuxt.options.dev) {
      nuxt.options.routeRules ??= {}
      nuxt.options.routeRules['/_css/*'] = {
        headers: {
          'Cache-Control': _options.cacheControl,
        },
      }
    }

    function getTransformFile() {
      if (_options.transformFile !== '') {
        return isAbsolute(_options.transformFile) ? _options.transformFile : join(nuxt.options.rootDir, _options.transformFile)
      }

      if (_options.minify && _options.removeUnused) {
        return resolver.resolve('./runtime/transforms/best.js')
      }

      if (_options.minify) {
        return resolver.resolve('./runtime/transforms/minify.js')
      }

      if (_options.removeUnused) {
        return resolver.resolve('./runtime/transforms/remove-unused.js')
      }

      return resolver.resolve('./runtime/transforms/plain.js')
    }
  },
})
