// 다리 `window.genius` — 사이트가 부르는 것은 이것뿐이다(contextIsolation · sandbox).
//
// sandbox 안의 preload 는 `electron` 밖의 파일을 못 불러온다 — 그래서 이름 · 통로를 여기 다시 적고,
// `src/lib/bridge-names.cjs` 와 같은지 시험이 본다(`tests/bridge.test.cjs`). 사이트 `src/lib/bridge.js` 와도 같아야 한다.
const { contextBridge, ipcRenderer } = require('electron');

const CH = {
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
};

/** 껍데기가 알려 오는 것을 듣는다 — 해제 함수를 돌려준다. 값만 넘기고 이벤트(ipc 손잡이)는 안 넘긴다. */
const listen = (channel) => (cb) => {
  const fn = (_event, value) => cb(value);
  ipcRenderer.on(channel, fn);
  return () => ipcRenderer.removeListener(channel, fn);
};

const bridge = {
  version: () => ipcRenderer.sendSync(CH.version),
  openLogin: () => ipcRenderer.send(CH.openLogin),
  cancelLogin: () => ipcRenderer.send(CH.cancelLogin),
  // 표를 듣기 시작했다고 알려야 껍데기가 쥐고 있던 표(켜자마자 들어온 것)를 보낸다.
  onPass: (cb) => { const off = listen(CH.pass)(cb); ipcRenderer.send(CH.passReady); return off; },
  minimize: () => ipcRenderer.send(CH.minimize),
  toggleMaximize: () => ipcRenderer.send(CH.toggleMaximize),
  toggleFullscreen: () => ipcRenderer.send(CH.toggleFullscreen),
  setCloseGuard: (on) => ipcRenderer.send(CH.closeGuard, Boolean(on)),
  onCloseAsk: listen(CH.closeAsk),
  closeNow: () => ipcRenderer.send(CH.closeNow),
  onUpdate: listen(CH.update),
};

contextBridge.exposeInMainWorld('genius', Object.freeze(bridge));
module.exports = { CH, bridge };
