import cssnano from 'cssnano'

let cssnanoCtx
export default async (options) => {
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
