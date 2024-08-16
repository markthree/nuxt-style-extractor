import Beastcss from 'beastcss'
import { murmurHash } from 'ohash'
import * as cheerio from 'cheerio'
import { defineNitroPlugin, defineEventHandler, useStorage, getRouterParam, setHeader } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  const cacheStorage = useStorage<string>('cache:_css')
  const assetsStorage = useStorage<string>('assets:_css')
  const beastcss = new Beastcss({
    minifyCss: true,
    merge: true,
  })

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
    const $ = cheerio.load(html)
    const styles = $('style')
    if (styles.length === 0) {
      return
    }
    const hash = murmurHash(styles.toString())
    const id = hash + '.css'
    const storage = import.meta.prerender ? assetsStorage : cacheStorage
    const item = await storage.getItem(id)
    if (item === null) {
      const newHtml = await beastcss.process(html).catch(() => html)
      const $$ = cheerio.load(newHtml)
      const css = $$('style').html()
      await storage.setItem(id, css || '')
      $$(`style`).replaceWith(`<link href="/_css/${id}" rel="stylesheet" />`)
      res.body = $$.html()
      return
    }

    $('style').remove()
    $('head').append(`<link href="/_css/${id}" rel="stylesheet" />`)
    res.body = $.html()
  })
})
