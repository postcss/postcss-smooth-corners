import type { PluginCreator } from 'postcss'

export interface SmoothCornersOptions {
  /**
   * Add `corner-shape: squircle` to every `border-radius`, except circles
   * and very small radius.
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
}

declare let plugin: PluginCreator<SmoothCornersOptions>

export default plugin
