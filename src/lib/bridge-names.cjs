// 다리 `window.genius` 의 이름 — 사이트 `deathmatch-web/src/lib/bridge.js` 의 `BRIDGE_FNS` 와 **같아야 한다**.
// 이름이 하나라도 빠지면 사이트가 다리로 안 본다(브라우저처럼 그린다). 바꿀 때는 두 저장소를 함께 바꾼다.
const BRIDGE_FNS = Object.freeze([
  'version', 'openLogin', 'cancelLogin', 'onPass',
  'minimize', 'toggleMaximize', 'toggleFullscreen',
  'setCloseGuard', 'onCloseAsk', 'closeNow', 'onUpdate',
]);

/** 껍데기 ↔ 사이트 사이 통로 이름(ipc) — 한 곳. */
const CH = Object.freeze({
  version: 'genius:version',
  openLogin: 'genius:openLogin',
  cancelLogin: 'genius:cancelLogin',
  pass: 'genius:pass',
  passReady: 'genius:passReady',
  minimize: 'genius:minimize',
  toggleMaximize: 'genius:toggleMaximize',
  toggleFullscreen: 'genius:toggleFullscreen',
  closeGuard: 'genius:closeGuard',
  closeAsk: 'genius:closeAsk',
  closeNow: 'genius:closeNow',
  update: 'genius:update',
});

module.exports = { BRIDGE_FNS, CH };
