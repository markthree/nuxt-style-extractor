import { hash } from 'ohash'
import cssnano from 'cssnano'
import { PurgeCSS } from 'purgecss'
import purgehtml from 'purgecss-from-html'
import { defineNuxtPlugin } from '#imports'
import extractorOptions from '#build/nuxt-style-extractor-options.mjs'

interface Options {
  html: string
  css: string
  name: string
}

let purgeCssCtx: PurgeCSS
async function removeUnusedCss(options: Options) {
  const { html, css } = options
  if (!purgeCssCtx) {
    purgeCssCtx = new PurgeCSS()
  }
  const [result] = await purgeCssCtx.purge({
    content: [{ raw: html, extension: 'html' }],
    css: [{ raw: css }],
    extractors: [{
      extensions: ['html'],
      extractor: purgehtml,
    }],
  })
  return result.css || ''
}

let cssnanoCtx: ReturnType<typeof cssnano>
async function minifyCss(options: Options) {
  const { css, name } = options
  if (!cssnanoCtx) {
    cssnanoCtx = cssnano()
  }

  const result = await cssnanoCtx.process(css, {
    from: name,
    map: false,
  })

  return result.css || ''
}

async function optimiseCss(options: Options) {
  if (extractorOptions.removeUnused) {
    options.css = await removeUnusedCss(options)
  }

  if (extractorOptions.minify) {
    options.css = await minifyCss(options)
  }

  return options.css
}

export default defineNuxtPlugin({
  name: 'inject-style-id',
  setup(nuxt) {
    nuxt.hook('app:rendered', async (nuxtCtx) => {
      const html = nuxtCtx.renderResult?.html || ''
      nuxtCtx.ssrContext?.head.use({
        hooks: {
          async 'ssr:render'(ctx) {
            let style = ''
            ctx.tags = ctx.tags.filter((tag) => {
              if (tag.tag === 'style' && tag.innerHTML) {
                style += tag.innerHTML
                return false
              }
              return true
            })

            if (!style) {
              return
            }

            const name = hash([html, style]) + '.css'

            const oldCss = await $fetch(`/_css/${name}`)

            if (oldCss === '') {
              return
            }

            if (oldCss) {
              ctx.tags.push({
                tag: 'link',
                props: {
                  rel: 'stylesheet',
                  href: `/_css/${name}`,
                },
              })
              return
            }

            const css = await optimiseCss({
              html,
              css: style,
              name,
            })

            await $fetch('/_css', {
              body: {
                name,
                css,
              },
              method: 'POST',
            })

            if (css === '') {
              return
            }

            ctx.tags.push({
              tag: 'link',
              props: {
                rel: 'stylesheet',
                href: `/_css/${name}`,
              },
            })
          },
        },
      })
    })
  },
})
