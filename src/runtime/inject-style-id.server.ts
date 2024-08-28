import { hash } from 'ohash'
import { defineNuxtPlugin, useRoute } from '#imports'

export default defineNuxtPlugin({
  name: 'inject-style-id',
  setup(nuxt) {
    const route = useRoute()
    nuxt.ssrContext?.head.use({
      hooks: {
        'ssr:render'(ctx) {
          let style = ''
          ctx.tags = ctx.tags.filter((tag) => {
            if (tag.tag === 'style' && tag.innerHTML) {
              style += tag.innerHTML
              return false
            }
            return true
          })
          if (style) {
            const key = hash([route.matched, style]) + '.css'
            ctx.tags.push({
              tag: 'style',
              props: {
                'data-style-extractor-key': key,
              },
              innerHTML: style,
            })
          }
        },
      },
    })
  },
})
