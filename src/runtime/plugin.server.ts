import { hash } from 'ohash'
import { defineNuxtPlugin } from '#imports'
import optimiseCss from '#build/nuxt-style-extractor-transform.js'
import { configHash } from '#build/nuxt-style-extractor-config-hash.js'

export default defineNuxtPlugin({
  name: 'style-extractor',
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

            const name = hash([html, style, configHash]) + '.css'

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
