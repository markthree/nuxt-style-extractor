import { hash } from 'ohash'
import { defineNuxtPlugin, useRoute } from '#imports'

export default defineNuxtPlugin({
  name: 'inject-style-id',
  setup(nuxt) {
    const route = useRoute()
    nuxt.ssrContext?.head.use({
      hooks: {
        'ssr:render'(ctx) {
          const styles: string[] = []
          for (const tag of ctx.tags) {
            if (tag.tag === 'style' && tag.innerHTML) {
              styles.push(tag.innerHTML)
            }
          }

          if (styles.length === 0) {
            return
          }

          const key = hash([route.matched, styles])
          const lastIndex = ctx.tags.length - 1
          const lastTag = ctx.tags[lastIndex]
          if (lastTag.tag === 'htmlAttrs') {
            lastTag.props['data-style-extractor-key'] = `${key}.css`
            return
          }

          for (const tag of ctx.tags) {
            if (tag.tag === 'htmlAttrs') {
              lastTag.props['data-style-extractor-key'] = `${key}.css`
              return
            }
          }
        },
      },
    })
  },
})
