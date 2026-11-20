// 이동 허용 목록 — 창 안은 운영 사이트만, 바깥 브라우저는 https 허용 호스트만, 다리는 우리 쪽에서 부른 것만.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/lib/link.cjs');

test('창 안 이동 — 운영 사이트(같은 출처)만', () => {
  for (const ok of ['https://genius.mulgyeol.kr/', 'https://genius.mulgyeol.kr/#/launcher', 'https://genius.mulgyeol.kr/assets/x.js?v=1']) assert.ok(L.canNavigate(ok), ok);
  for (const no of [
    'http://genius.mulgyeol.kr/', 'https://genius.mulgyeol.kr.evil.com/', 'https://evil.com/?https://genius.mulgyeol.kr',
    'https://user@genius.mulgyeol.kr.evil.com/', 'https://genius.mulgyeol.kr:8443/', 'https://mulgyeol.kr/', 'https://kauth.kakao.com/',
    'file:///C:/x.html', 'javascript:alert(1)', 'genius-online://pass#t=x', '', 'not a url',
  ]) assert.ok(!L.canNavigate(no), no);
});

test('바깥 브라우저 — https · 허용 호스트 · 자격 없음', () => {
  assert.deepEqual([...L.OUTSIDE_HOSTS], ['genius.mulgyeol.kr', 'github.com']);
  for (const ok of ['https://genius.mulgyeol.kr/#/connect?c=abc', 'https://github.com/wavely1213/genius-online/releases']) assert.ok(L.canOpenOutside(ok), ok);
  for (const no of [
    'http://github.com/', 'https://github.com.evil.com/', 'https://a:b@github.com/', 'https://evil.com/',
    'file:///C:/Windows/System32/calc.exe', 'ms-settings:', 'smb://host/share', 'javascript:alert(1)', '',
  ]) assert.ok(!L.canOpenOutside(no), no);
});

test('다리를 부른 쪽 — 우리 사이트 또는 껍데기 안 한 장만', () => {
  const off = 'file:///C:/app/resources/app.asar/src/offline.html';
  assert.ok(L.trustedSender('https://genius.mulgyeol.kr/#/launcher', off));
  assert.ok(L.trustedSender(off, off));
  assert.ok(!L.trustedSender('file:///C:/other.html', off));
  assert.ok(!L.trustedSender('https://evil.com/', off));
  assert.ok(!L.trustedSender('', ''));
});
