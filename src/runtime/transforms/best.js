import cssnano from 'cssnano'
import { PurgeCSS } from 'purgecss'
import purgehtml from 'purgecss-from-html'

let purgeCssCtx
async function removeUnusedCss(options) {
  const { html, css } = options
  if (!purgeCssCtx) {
    purgeCssCtx = new PurgeCSS()
  }
  const [result] = await purgeCssCtx.purge({
    content: [{ raw: html, extension: 'html' }],
    css: [{ raw: css }],
    extractors: [{
      extensions: ['html'],
      extractor: purgehtml,
    }],
  })
  return result.css || ''
}

let cssnanoCtx
async function minifyCss(options) {
  const { css, name } = options
  if (!cssnanoCtx) {
    cssnanoCtx = cssnano()
  }
  const result = await cssnanoCtx.process(css, {
    from: name,
    to: name,
  })
  return result.css
}

async function optimiseCss(options) {
  options.css = await removeUnusedCss(options)

  options.css = await minifyCss(options)

  return options.css
}

export default optimiseCss
