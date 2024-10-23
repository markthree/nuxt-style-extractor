import { hash } from 'ohash'
import { defineNuxtPlugin } from '#imports'
import { configHash } from '#build/nuxt-style-extractor-config-hash.js'

declare module '#app' {
  interface NuxtApp {

  }
}
export default defineNuxtPlugin({
  name: 'style-extractor',
  enforce: 'post',
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
            ctx.tags.push({
              tag: 'style',
              props: {
                'data-style-extractor-name': name,
              },
              innerHTML: style,
            })
          },
        },
      })
    })
  },
})
