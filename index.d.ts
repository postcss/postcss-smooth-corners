import type { PluginCreator } from 'postcss'

export interface SmoothCornersOptions {
  /**
   * Add `corner-shape: squircle` to every `border-radius`, except circles,
   * pills and very small radius.
   */
  auto?: boolean

  /**
   * Minimum radius in pixels for `auto` mode. Smaller radius will keep
   * round corners. Default is `5`.
   */
  autoMinSize?: number

  /**
   * Regexp for custom properties with radius values, which should be
   * increased too. For instance, `/^--radius/`.
   */
  props?: RegExp

  /**
   * Known values of custom properties from other files. In `auto` mode
   * they are used to detect pills, like `{ '--radius': '0.375rem' }`.
   */
  vars?: Record<string, string>
}

declare let plugin: PluginCreator<SmoothCornersOptions>

export default plugin
