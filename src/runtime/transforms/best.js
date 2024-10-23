import { minify } from '#style-extractor/minify.js'
import { removeUnusedCss } from '#style-extractor/remove-unused.js'

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
