import postcss from 'postcss'

import smoothCorners from '../index.js'

postcss([smoothCorners])
postcss([smoothCorners()])
postcss([
  smoothCorners({
    auto: true,
    autoMinSize: 8,
    props: /^--radius/,
    vars: { '--radius': '0.375rem' }
  })
])
