import Beastcss from 'beastcss'
import { defineNitroPlugin, defineEventHandler, useStorage, getRouterParam, setHeader } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  const cacheStorage = useStorage<string>('cache:_css')
  const assetsStorage = useStorage<string>('assets:_css')
  const beastcss = new Beastcss({
    minifyCss: true,
    merge: true,
  })

  const keyReg = /data-style-extractor-key="(.*?)"/
  const styleReg = /<style[^>]*>([\s\S]*?)<\/style>/
  nitroApp.router.add('/_css/:name', defineEventHandler(async (event) => {
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
    const [_, key] = html.match(keyReg) || []
    if (!key) {
      return
    }
    const storage = import.meta.prerender ? assetsStorage : cacheStorage
    const item = await storage.getItem(key)
    if (item === null) {
      const newHtml = await beastcss.process(html).catch(() => html)
      const [style, css] = newHtml.match(styleReg) || ['']

      await storage.setItem(key, css || '')
      res.body = newHtml.replace(style, `<link href="/_css/${key}" rel="stylesheet" />`)
      return
    }
    res.body = html.replace(styleReg, `<link href="/_css/${key}" rel="stylesheet" />`)
  })
})
