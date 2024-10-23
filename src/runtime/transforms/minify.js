import { minify } from '#style-extractor/minify.js'

export default async (options) => {
  const { css } = options
  return minify(css, {
    comments: false,
  }).css
}
