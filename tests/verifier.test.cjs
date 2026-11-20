// PKCE — verifier 43자 · challenge = base64url(sha256(verifier)) (사이트 `src/lib/pass.js` challengeOf 와 같은 식).
const test = require('node:test');
const assert = require('node:assert/strict');
const { newVerifier, challengeOf } = require('../src/lib/verifier.cjs');

test('verifier — base64url 43자 · 매번 다르다', () => {
  const a = newVerifier();
  assert.match(a, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(a, newVerifier());
});

test('challenge — base64url(sha256) · 잘 알려진 값(sha256 "abc")', () => {
  assert.equal(challengeOf('abc'), 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
});
