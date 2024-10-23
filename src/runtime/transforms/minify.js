import { minify } from 'csso/dist/csso.esm'

export default async (options) => {
  const { css } = options
  return minify(css, {
    comments: false,
  }).css
}
