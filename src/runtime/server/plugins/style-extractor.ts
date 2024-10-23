import { defineNitroPlugin, defineEventHandler, useStorage, getRouterParam, setHeader } from '#imports'
import optimiseCss from '#style-extractor/nuxt-style-extractor-transform.js'

export default defineNitroPlugin((nitroApp) => {
  const nameReg = /data-style-extractor-name="(.*?)"/
  const styleReg = /<style[^>]*>([\s\S]*?)<\/style>/
  const cacheStorage = useStorage<string>('cache:_css')
  const assetsStorage = useStorage<string>('assets:_css')

  nitroApp.router.get('/_css/:name', defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    let css = await cacheStorage.getItem(name!)
    setHeader(event, 'Content-Type', 'text/css')
    if (!css) {
      css = await assetsStorage.getItem(name!)
    }

    return css
  }))

  nitroApp.hooks.hook('render:response', async (res) => {
    const html: string = res.body
    const [_, name] = html.match(nameReg) || []
    if (!name) {
      return
    }
    const storage = import.meta.prerender ? assetsStorage : cacheStorage
    const item = await storage.getItem(name)

    if (item === null) {
      const [style, css] = html.match(styleReg) || ['']

      const newCss = await optimiseCss({
        html,
        css,
        name,
      })
      await storage.setItem(name, newCss || '')
      if (css) {
        res.body = html.replace(style, `<link href="/_css/${name}" rel="stylesheet" />`)
      }
      return
    }
    if (item) {
      res.body = html.replace(styleReg, `<link href="/_css/${name}" rel="stylesheet" />`)
    }
  })
})
