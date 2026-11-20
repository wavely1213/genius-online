// 다리 이름 — preload · bridge-names · 사이트 BRIDGE_FNS 셋이 같아야 한다(사이트는 하나라도 빠지면 다리가 없는 것으로 본다).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { BRIDGE_FNS, CH } = require('../src/lib/bridge-names.cjs');
const SITE_FNS = require('./fixtures/site-bridge-fns.json');

/** preload 를 가짜 electron 으로 불러 실제로 내미는 다리를 본다. */
function loadPreload() {
  const exposed = {};
  const sent = [];
  const fake = {
    contextBridge: { exposeInMainWorld: (k, v) => { exposed[k] = v; } },
    ipcRenderer: { send: (...a) => sent.push(a), sendSync: (c) => (c === CH.version ? '1.0.0' : null), on() {}, removeListener() {} },
  };
  const orig = Module._load;
  Module._load = function load(req, ...rest) { return req === 'electron' ? fake : orig.call(this, req, ...rest); };
  try {
    const file = require.resolve('../src/preload.cjs');
    delete require.cache[file];
    return { mod: require(file), exposed, sent };
  } finally { Module._load = orig; }
}

test('사이트 BRIDGE_FNS 와 같은 이름', () => {
  assert.deepEqual([...BRIDGE_FNS].sort(), [...SITE_FNS].sort());
});

test('사이트 저장소가 옆에 있으면 원문과도 맞춘다', (t) => {
  const site = process.env.SITE_BRIDGE || path.join(__dirname, '..', '..', 'wavely-web', 'deathmatch-web', 'src', 'lib', 'bridge.js');
  if (!fs.existsSync(site)) return t.skip('사이트 원문 없음 — 고정 목록만 본다');
  const block = /BRIDGE_FNS = Object\.freeze\(\[([\s\S]*?)\]\)/.exec(fs.readFileSync(site, 'utf8'))[1];
  const names = [...block.matchAll(/'([A-Za-z]+)'/g)].map((m) => m[1]);
  assert.deepEqual(names.sort(), [...SITE_FNS].sort());
});

test('preload 가 내미는 다리 = 같은 이름 · 모두 함수 · 얼어 있음', () => {
  const { exposed, mod } = loadPreload();
  const g = exposed.genius;
  assert.deepEqual(Object.keys(g).sort(), [...BRIDGE_FNS].sort());
  assert.ok(Object.values(g).every((f) => typeof f === 'function'));
  assert.ok(Object.isFrozen(g));
  assert.deepEqual(mod.CH, CH, 'preload 안의 통로 사본이 bridge-names 와 다르다');
});

test('onPass 를 걸면 passReady 를 알린다 · setCloseGuard 는 참거짓만', () => {
  const { exposed, sent } = loadPreload();
  exposed.genius.onPass(() => {});
  exposed.genius.setCloseGuard('yes');
  assert.deepEqual(sent, [[CH.passReady], [CH.closeGuard, true]]);
  assert.equal(exposed.genius.version(), '1.0.0');
});

test('「다시 시도」 주소 = START', () => {
  const { START } = require('../src/lib/link.cjs');
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'src', 'offline.js'), 'utf8'), new RegExp(`'${START.replace(/[/.#]/g, '\\$&')}'`));
});
