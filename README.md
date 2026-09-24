# PostCSS Smooth Corners

<img align="right" width="135" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="https://postcss.org/logo-leftp.svg">

[PostCSS] plugin to use smooth squircle corners without making them look
smaller. See [demo](https://postcss.github.io/postcss-smooth-corners/).

With the same `border-radius`, [`corner-shape: squircle`] cuts a much smaller
area than a round corner, so the element looks sharper than the design.
The plugin increases the radius by 1.715 (rounding pixels to integers)
only in browsers with `corner-shape` support. Other browsers will keep
the round corners with the original radius.

```css
/* Input CSS */
.card {
  corner-shape: squircle;
  border-radius: 1rem;
}
```

```css
/* Output CSS */
.card {
  corner-shape: squircle;
  border-radius: 1rem;
  @supports (corner-shape: squircle) {
    border-radius: 1.715rem;
  }
}
```

[`corner-shape: squircle`]: https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape
[PostCSS]: https://github.com/postcss/postcss

---

<img src="https://cdn.evilmartians.com/badges/logo-no-label.svg" alt="" width="22" height="16" /> Postcss Smooth Corners is built by <b><a href="https://evilmartians.com/">Evil Martians</a></b>, an American design and engineering consultancy for <b>developer tools, AI, and cybersecurity startups</b>.

---

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-smooth-corners
```

**Step 2:** Check your project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according
to [official docs](https://github.com/postcss/postcss#usage)
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
+ import smoothCorners from 'postcss-smooth-corners'

  export default {
    plugins: [
+     smoothCorners(),
      autoprefixer
    ]
  }
```

The output CSS uses CSS Nesting. If you need to support old browsers,
put `postcss-nesting` after this plugin.

## Options

### `auto`

Add `corner-shape: squircle` to every `border-radius`, except circles
(`50%` or more) and small radius.

```js
smoothCorners({ auto: true })
```

```css
/* Input CSS */
.card {
  border-radius: 1rem;
}
.avatar {
  border-radius: 50%;
}
```

```css
/* Output CSS */
.card {
  corner-shape: squircle;
  border-radius: 1rem;
  @supports (corner-shape: squircle) {
    border-radius: 1.715rem;
  }
}
.avatar {
  border-radius: 50%;
}
```

Set `corner-shape: round` to keep round corners for a specific rule.

### `autoMinSize`

In `auto` mode, radius smaller than this value (in pixels) will keep
round corners.
Default is `5`.

```js
smoothCorners({ auto: true, autoMinSize: 8 })
```

### `props`

Regexp for custom properties with radius values. The plugin can’t increase
radius inside `var()`, so you can increase the values of your design tokens
instead.

```js
smoothCorners({ props: /^--radius-/ })
```

```css
/* Input CSS */
:root {
  --radius-m: 8px;
}
```

```css
/* Output CSS */
:root {
  --radius-m: 8px;
  @supports (corner-shape: squircle) {
    --radius-m: 14px;
  }
}
```

## Inheritance

The plugin adds `corner-shape: inherit` to `border-radius: inherit` to copy
the corner shape together with the radius from the parent.
