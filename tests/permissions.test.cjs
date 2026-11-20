// 웹 권한 — 기본 거절, 우리 사이트의 클립보드 쓰기만.
const test = require('node:test');
const assert = require('node:assert/strict');
const { ALLOWED, permissionAllowed } = require('../src/lib/permissions.cjs');

test('허용 목록은 클립보드 쓰기 하나', () => {
  assert.deepEqual([...ALLOWED], ['clipboard-sanitized-write']);
});

test('우리 사이트의 클립보드 쓰기만 허락', () => {
  assert.ok(permissionAllowed('clipboard-sanitized-write', 'https://genius.mulgyeol.kr/#/room'));
  assert.ok(!permissionAllowed('clipboard-sanitized-write', 'https://evil.example.com/'));
  assert.ok(!permissionAllowed('clipboard-sanitized-write', ''));
});

test('나머지는 우리 사이트여도 거절', () => {
  for (const p of ['media', 'geolocation', 'notifications', 'fullscreen', 'clipboard-read', 'openExternal', 'pointerLock', 'hid', 'serial', 'usb', 'midi', 'display-capture', 'storage-access', 'unknown']) {
    assert.ok(!permissionAllowed(p, 'https://genius.mulgyeol.kr/'), p);
  }
});
