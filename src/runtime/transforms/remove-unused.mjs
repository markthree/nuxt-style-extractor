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

export default options => removeUnusedCss(options)
