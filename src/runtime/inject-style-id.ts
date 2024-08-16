import { hash } from 'ohash'
import { defineNuxtPlugin, useRoute } from '#imports'

export default defineNuxtPlugin({
  name: 'inject-style-id',
  setup(nuxt) {
    const route = useRoute()
    const routeHash = hash(route.matched)
    nuxt.ssrContext?.head.use({
      hooks: {
        'ssr:render'(ctx) {
          for (const tag of ctx.tags) {
            if (tag.tag === 'style') {
              tag.props.hash = routeHash
              break
            }
          }
        },
      },
    })
  },
})
