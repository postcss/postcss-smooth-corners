import { equal } from 'node:assert/strict'
import { test } from 'node:test'
import postcss from 'postcss'

import plugin from '../index.js'

function run(input, output, opts = {}) {
  let result = postcss([plugin(opts)]).process(input, { from: undefined })
  equal(result.css, output)
  equal(result.warnings().length, 0)
}

test('increases radius for squircle', () => {
  run(
    'a { corner-shape: squircle; border-radius: 10px; }',
    'a { corner-shape: squircle; border-radius: 10px; ' +
      '@supports (corner-shape:squircle) { border-radius: 17px } }'
  )
})

test('supports different units and multiple values', () => {
  run(
    'a { corner-shape: squircle; border-radius: 1rem .5em 2% 3px / 4px; }',
    'a { corner-shape: squircle; border-radius: 1rem .5em 2% 3px / 4px; ' +
      '@supports (corner-shape:squircle) ' +
      '{ border-radius: 1.715rem 0.858em 3.43% 5px / 7px } }'
  )
})

test('supports long border radius properties', () => {
  run(
    'a { border-top-left-radius: 1rem; corner-shape: squircle; }',
    'a { border-top-left-radius: 1rem; ' +
      '@supports (corner-shape:squircle) { border-top-left-radius: 1.715rem; } ' +
      'corner-shape: squircle; }'
  )
})

test('ignores other corner shapes', () => {
  run(
    'a { corner-shape: bevel; border-radius: 10px; }',
    'a { corner-shape: bevel; border-radius: 10px; }'
  )
})

test('ignores radius without corner shape', () => {
  run('a { border-radius: 10px; }', 'a { border-radius: 10px; }')
})

test('ignores radius without lengths', () => {
  run(
    'a { corner-shape: squircle; border-radius: 0; }',
    'a { corner-shape: squircle; border-radius: 0; }'
  )
})

test('ignores radius with variables', () => {
  run(
    'a { corner-shape: squircle; border-radius: var(--r); }',
    'a { corner-shape: squircle; border-radius: var(--r); }'
  )
})

test('ignores other properties', () => {
  run(
    'a { corner-shape: squircle; padding: 10px; }',
    'a { corner-shape: squircle; padding: 10px; }'
  )
})

test('is idempotent', () => {
  let input = 'a { corner-shape: squircle; border-radius: 10px; }'
  let once = postcss([plugin]).process(input, { from: undefined }).css
  run(once, once)
})

test('inherits corner shape with radius', () => {
  run(
    'a { border-radius: inherit; }',
    'a { corner-shape: inherit; border-radius: inherit; }'
  )
})

test('adds squircle in auto mode', () => {
  run(
    'a { border-radius: 10px; }',
    'a { corner-shape: squircle; border-radius: 10px; ' +
      '@supports (corner-shape:squircle) { border-radius: 17px } }',
    { auto: true }
  )
})

test('adds squircle for variables in auto mode', () => {
  run(
    'a { border-radius: var(--r); }',
    'a { corner-shape: squircle; border-radius: var(--r); }',
    { auto: true }
  )
})

test('ignores circles in auto mode', () => {
  run('a { border-radius: 50%; }', 'a { border-radius: 50%; }', { auto: true })
})

test('ignores small radius in auto mode', () => {
  run(
    'a { border-radius: 4px; } b { border-radius: 0.2rem; } i { border-radius: 0; }',
    'a { border-radius: 4px; } b { border-radius: 0.2rem; } i { border-radius: 0; }',
    { auto: true }
  )
})

test('supports custom minimum size in auto mode', () => {
  run('a { border-radius: 8px; }', 'a { border-radius: 8px; }', {
    auto: true,
    autoMinSize: 10
  })
})

test('respects explicit corner shape in auto mode', () => {
  run(
    'a { corner-shape: round; border-radius: 10px; }',
    'a { corner-shape: round; border-radius: 10px; }',
    { auto: true }
  )
})

test('increases custom properties', () => {
  run(
    ':root { --radius-m: 8px; --gap: 8px; --radius-l: var(--radius-m); }',
    ':root { --radius-m: 8px; ' +
      '@supports (corner-shape:squircle) { --radius-m: 14px; } ' +
      '--gap: 8px; --radius-l: var(--radius-m); }',
    { props: /^--radius/ }
  )
})

test('ignores custom properties without option', () => {
  run(':root { --radius: 8px; }', ':root { --radius: 8px; }')
})

test('does not add spaces to minified CSS', () => {
  run(
    'a{corner-shape:squircle;border-radius:10px}',
    'a{corner-shape:squircle;border-radius:10px;' +
      '@supports (corner-shape:squircle){border-radius:17px}}'
  )
})
