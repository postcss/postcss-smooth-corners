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

function isCircle(value) {
  return [...value.matchAll(/(\d*\.?\d+)%/g)].some(
    ([, number]) => Number(number) >= 50
  )
}

function isTooSmall(value, minSize) {
  let lengths = [...value.matchAll(/(\d*\.?\d+)(rem|em|px|%)?/g)]
  return (
    lengths.length > 0 &&
    lengths.every(
      ([, number, unit]) =>
        unit !== '%' && Number(number) * (unit === 'px' ? 1 : 16) < minSize
    )
  )
}

function toPixels(value) {
  let match = value.trim().match(/^(\d*\.?\d+)(rem|em|px)?$/)
  if (!match) return undefined
  let number = Number(match[1])
  if (!match[2] || match[2] === 'px') return number
  return number * 16
}

function resolveVars(value, vars) {
  return value.replace(
    /var\(\s*(--[\w-]+)\s*\)/g,
    (full, name) => vars[name] ?? full
  )
}

function getRadiusPixels(value) {
  let sizes = []
  for (let part of value.split(/[\s/]+/).filter(Boolean)) {
    let size = toPixels(part)
    if (size === undefined) return undefined
    sizes.push(size)
  }
  return Math.max(...sizes)
}

function isPill(radius, sizes, vars) {
  let known = false
  for (let size of sizes) {
    if (size.includes('var(') && size.trim() === radius.trim()) return true
    let radiusPx = getRadiusPixels(resolveVars(radius, vars))
    let sizePx = toPixels(resolveVars(size, vars))
    if (radiusPx === undefined || sizePx === undefined) continue
    known = true
    if (2 * radiusPx * SQUIRCLE_SCALE > sizePx) return true
  }
  return known ? false : undefined
}

const SIZE_PROPS = new Set(['block-size', 'height', 'inline-size', 'width'])

let plugin = (opts = {}) => {
  return {
    Declaration(decl, helpers) {
      let parent = decl.parent
      if (isSquircleFallback(parent)) return
      if (decl.prop.startsWith('--')) {
        let isRadius = opts.props && decl.prop.search(opts.props) !== -1
        if (isRadius && !decl.value.includes('var(')) {
          increaseForSquircle(decl, helpers)
        }
      } else if (/^border(-[a-z]+)*-radius$/.test(decl.prop)) {
        let shape
        let sizes = []
        parent.each(node => {
          if (node.type === 'decl') {
            if (node.prop === 'corner-shape') shape = node.value
            if (SIZE_PROPS.has(node.prop)) sizes.push(node.value)
          }
        })
        let hasVar = decl.value.includes('var(')
        if (!shape && decl.value === 'inherit') {
          decl.cloneBefore({ prop: 'corner-shape', value: 'inherit' })
        } else if (!shape && opts.auto && isCircle(decl.value)) {
          // Explicit round to override squircle from other rules
          decl.cloneBefore({ prop: 'corner-shape', value: 'round' })
        } else if (
          !shape &&
          opts.auto &&
          isPill(decl.value, sizes, opts.vars ?? {})
        ) {
          decl.cloneBefore({ prop: 'corner-shape', value: 'round' })
        } else if (
          !shape &&
          opts.auto &&
          (hasVar || !isTooSmall(decl.value, opts.autoMinSize ?? 5))
        ) {
          decl.cloneBefore({ prop: 'corner-shape', value: 'squircle' })
          shape = 'squircle'
          if (
            hasVar &&
            sizes.some(size => !size.includes('var(') && toPixels(size)) &&
            isPill(decl.value, sizes, opts.vars ?? {}) === undefined
          ) {
            decl.warn(
              helpers.result,
              'Can’t detect pill shape, because radius uses unknown ' +
                'variable. Set corner-shape explicitly or add variable ' +
                'value to the vars option.'
            )
          }
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
