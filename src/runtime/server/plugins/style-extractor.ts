import { defineNitroPlugin, defineEventHandler, useStorage, getRouterParam, setHeader, readBody } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  const cacheStorage = useStorage<string>('cache:_css')
  const assetsStorage = useStorage<string>('assets:_css')

  nitroApp.router.add('/_css/:name', defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    let css = await cacheStorage.getItem(name!)
    setHeader(event, 'Content-Type', 'text/css')
    if (!css) {
      css = await assetsStorage.getItem(name!)
    }
    return css
  }))

  nitroApp.router.post('/_css', defineEventHandler(async (event) => {
    const body = await readBody<{ name: string, css: string }>(event)
    const { name, css } = body

    await Promise.all([
      cacheStorage.setItem(name, css),
      assetsStorage.setItem(name, css),
    ])
  }))
})
