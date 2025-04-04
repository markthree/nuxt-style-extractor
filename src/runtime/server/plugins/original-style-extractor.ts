import { hash } from 'ohash'
import { defineNitroPlugin, defineEventHandler, useStorage, getRouterParam, setHeader } from '#imports'
import cacheControl from '#style-extractor/nuxt-style-extractor-cache-control.js'

export default defineNitroPlugin((nitroApp) => {
  const styleReg = /<style[^>]*>([\s\S]*?)<\/style>/
  const globalStyleReg = /<style[^>]*>([\s\S]*?)<\/style>/g
  const cacheStorage = useStorage<string>('cache:_css')
  const assetsStorage = useStorage<string>('assets:_css')

  nitroApp.router.get('/_css/:name', defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    let css = await cacheStorage.getItem(name!)
    setHeader(event, 'Content-Type', 'text/css')
    if (!css) {
      css = await assetsStorage.getItem(name!)
    }

    if (!import.meta.dev && cacheControl !== '') {
      setHeader(event, 'Cache-Control', cacheControl)
    }

    return css
  }))

  nitroApp.hooks.hook('render:response', async (res) => {
    const html: string = res.body
    const styles = html.match(globalStyleReg) || []
    if (styles.length === 0) {
      return
    }
    const storage = import.meta.prerender ? assetsStorage : cacheStorage
    const promises = styles.map(async (style) => {
      const name = `${hash(style)}.css`
      const link = `<link href="/_css/${name}" rel="stylesheet" />`
      const [_, css] = style.match(styleReg) || ['', '']
      await storage.setItem(name, css)
      return {
        link,
        style,
      }
    })

    const codes = await Promise.all(promises)

    for (const { link, style } of codes) {
      res.body = res.body.replace(style, link)
    }
  })
})
