import { minify } from 'csso/dist/csso.esm'
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

async function minifyCss(options) {
  const { css } = options
  return minify(css, {
    comments: false,
  }).css
}

async function optimiseCss(options) {
  options.css = await removeUnusedCss(options)

  options.css = await minifyCss(options)

  return options.css
}

export default optimiseCss
