import smoothCorners from '../index.js'

// THROWS 'string' is not assignable to type 'RegExp'
smoothCorners({ props: '--radius' })
// THROWS 'string' is not assignable to type 'boolean | undefined'
smoothCorners({ auto: 'yes' })
