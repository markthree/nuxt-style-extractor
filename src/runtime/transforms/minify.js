import { minify } from 'csso'

export default (options) => {
  const { css } = options

  return minify(css || '', {
    sourceMap: false,
  }).css
}
