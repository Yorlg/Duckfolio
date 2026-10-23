'use strict';

const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const test = require('node:test');

// Exercise the patched package loaded by an existing dependency, not a test copy.
const nextRequire = createRequire(require.resolve('eslint-config-next'));
const pluginRequire = createRequire(nextRequire.resolve('@next/eslint-plugin-next'));
const globRequire = createRequire(pluginRequire.resolve('fast-glob'));
const matchRequire = createRequire(globRequire.resolve('micromatch'));
const braces = matchRequire('braces');

const nested = (open, close, depth) => open.repeat(depth) + 'x,y' + close.repeat(depth);

for (const operation of ['parse', 'compile', 'expand', 'stringify']) {
  test(`${operation} rejects deeply nested and unclosed input without stack exhaustion`, () => {
    for (const [open, close] of [['{', '}'], ['(', ')']]) {
      assert.throws(() => braces[operation](nested(open, close, 4900)), SyntaxError);
      assert.throws(() => braces[operation](open.repeat(4900) + 'x'), SyntaxError);
    }
    assert.throws(() => braces[operation]('{('.repeat(2000) + 'x' + ')}'.repeat(2000)), SyntaxError);
  });
}

for (const operation of ['compile', 'expand', 'stringify']) {
  test(`${operation} validates externally supplied AST depth and child cycles`, () => {
    let ast = { type: 'text', value: 'x' };
    for (let i = 0; i < 12000; i++) ast = { type: 'root', nodes: [ast] };
    assert.throws(() => braces[operation](ast), SyntaxError);

    const cycle = { type: 'root', nodes: [] };
    cycle.nodes.push(cycle);
    assert.throws(() => braces[operation](cycle), SyntaxError);
  });
}

test('preserves ordinary expansions, escaping, and range limits', () => {
  assert.deepEqual(braces.expand('a/{1..3}/{x,y}'), [
    'a/1/x', 'a/1/y', 'a/2/x', 'a/2/y', 'a/3/x', 'a/3/y',
  ]);
  assert.equal(braces.compile('src/{app,lib}/**/*.ts'), 'src/(app|lib)/**/*.ts');
  assert.equal(braces.stringify('a/\\{b,c\\}/d'), 'a/{b,c}/d');
  assert.throws(() => braces.expand('{1..1001}'), RangeError);
});

test('enforces the parser boundary while allowing shared acyclic AST nodes', () => {
  const input = nested('{', '}', 127);
  assert.equal(braces.stringify(input), input);
  assert.equal(braces.compile(input), '{'.repeat(126) + '(x|y)' + '}'.repeat(126));
  assert.throws(() => braces.parse(nested('{', '}', 128)), SyntaxError);

  const leaf = { type: 'text', value: 'a' };
  assert.equal(braces.stringify({ type: 'root', nodes: [leaf, leaf] }), 'aa');
  assert.equal(braces.compile({ type: 'root', nodes: [leaf, leaf] }), 'aa');
});
