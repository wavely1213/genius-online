// 실행기 주소 꼴 · UA 꼬리 — 사이트 `src/lib/connect.js` 와 같은 꼴만 받는다.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/lib/link.cjs');

const T43 = 'A'.repeat(21) + '_-' + 'z9'.repeat(10);

test('실행기 주소 — 사이트 LAUNCH_URL 과 같다', () => {
  assert.equal(L.LAUNCH_URL, 'genius-online://pass#t=');
  assert.equal(L.START, 'https://genius.mulgyeol.kr/#/launcher');
});

test('표는 base64url 43자 하나만', () => {
  assert.equal(T43.length, 43);
  assert.equal(L.ticketInLink(`genius-online://pass#t=${T43}`), T43);
  for (const bad of [
    '', null, undefined, 'genius-online://pass#t=', `genius-online://pass#t=${T43}x`, `genius-online://pass#t=${T43.slice(1)}`,
    `genius-online://pass/#t=${T43}`, `genius-online://other#t=${T43}`, `https://genius.mulgyeol.kr/#t=${T43}`,
    `genius-online://pass#t=${T43.slice(0, 42)}=`, `genius-online://pass#t=${T43}\n`, ` genius-online://pass#t=${T43}`,
  ]) assert.equal(L.ticketInLink(bad), '', String(bad));
});

test('두 번째 실행의 argv 에서 실행기 주소를 고른다', () => {
  const link = `genius-online://pass#t=${T43}`;
  assert.equal(L.linkInArgv(['C:\\app.exe', '--flag', link]), link);
  assert.equal(L.linkInArgv(['C:\\app.exe', '--flag']), '');
  assert.equal(L.linkInArgv(), '');
});

test('UA 꼬리 — 서버가 pc:client 로 가려낸다', () => {
  assert.equal(L.uaTail('1.2.3'), 'GeniusOnline-PC/1.2.3');
});

test('창 UA — 한글 제품명 토막을 빼고 꼬리를 붙인다(실제 Electron 33 UA)', () => {
  const base = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) 지니어스온라인/1.0.0 Chrome/130.0.6723.191 Electron/33.4.11 Safari/537.36';
  const ua = L.clientUA(base, '1.0.0');
  assert.equal(ua, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.191 Electron/33.4.11 Safari/537.36 GeniusOnline-PC/1.0.0');
  assert.match(ua, /^[\x20-\x7e]+$/);
});
