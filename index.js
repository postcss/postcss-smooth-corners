// Squircle with 1.715 bigger radius cuts the same area as round corner
const SQUIRCLE_SCALE = 1.715

function roundTo3Digits(number) {
  return Math.round(number * 1000) / 1000
}

function isSquircleFallback(node) {
  return node?.type === 'atrule' && node.params.includes('corner-shape')
}

function increaseForSquircle(decl, { AtRule }) {
  if (isSquircleFallback(decl.next())) return
  let value = decl.value.replace(
    /(\d*\.?\d+)(rem|em|px|%)/g,
    (_, number, unit) => {
      let size = parseFloat(number) * SQUIRCLE_SCALE
      // Round pixels to keep CSS clean, other units keep 3 digits
      if (unit === 'px') return `${Math.round(size)}px`
      return `${roundTo3Digits(size)}${unit}`
    }
  )
  if (value !== decl.value) {
    decl.after(
      new AtRule({
        name: 'supports',
        nodes: [decl.clone({ value })],
        params: '(corner-shape:squircle)'
      })
    )
  }
}

function isCircleOrTooSmall(value, minSize) {
  let lengths = [...value.matchAll(/(\d*\.?\d+)(rem|em|px|%)?/g)]
  if (
    lengths.some(([, number, unit]) => unit === '%' && Number(number) >= 50)
  ) {
    return true
  }
  return (
    lengths.length > 0 &&
    lengths.every(
      ([, number, unit]) =>
        unit !== '%' && Number(number) * (unit === 'px' ? 1 : 16) < minSize
    )
  )
}

let plugin = (opts = {}) => {
  return {
    Declaration(decl, helpers) {
      let parent = decl.parent
      if (isSquircleFallback(parent)) return
      if (decl.prop.startsWith('--')) {
        if (opts.props?.test(decl.prop) && !decl.value.includes('var(')) {
          increaseForSquircle(decl, helpers)
        }
      } else if (/^border(-[a-z]+)*-radius$/.test(decl.prop)) {
        let shape
        parent.each(node => {
          if (node.type === 'decl' && node.prop === 'corner-shape') {
            shape = node.value
          }
        })
        let hasVar = decl.value.includes('var(')
        if (!shape && decl.value === 'inherit') {
          decl.cloneBefore({ prop: 'corner-shape', value: 'inherit' })
        } else if (
          !shape &&
          opts.auto &&
          (hasVar || !isCircleOrTooSmall(decl.value, opts.autoMinSize ?? 5))
        ) {
          decl.cloneBefore({ prop: 'corner-shape', value: 'squircle' })
          shape = 'squircle'
        }
        if (shape === 'squircle' && !hasVar) {
          increaseForSquircle(decl, helpers)
        }
      }
    },
    postcssPlugin: 'postcss-smooth-corners'
  }
}
plugin.postcss = true

export default plugin
