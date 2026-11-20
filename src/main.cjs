// 지니어스 온라인 PC 클라이언트 — 운영 사이트 하나를 띄우는 얇은 껍데기(C2 · C2_BRIEF 2절).
//
// 화면은 사이트가 그린다(실행기도 `/#/launcher`). 껍데기가 하는 일은 넷뿐이다:
//   창(테두리 없음 · Windows 세 단추) · 실행기 주소(`genius-online://pass#t=`)로 들어온 접속 표를 사이트에 넘기기 ·
//   (나) 실행기를 먼저 켠 길의 verifier 쥐기 · 실행기 자신의 새 판 받기.
// 보안: contextIsolation · sandbox · nodeIntegration 끔 · 창 안 이동은 운영 사이트만 · 운영 판은 개발자 도구 끔.

const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const L = require('./lib/link.cjs');
const { CH } = require('./lib/bridge-names.cjs');
const { newVerifier, challengeOf } = require('./lib/verifier.cjs');
const { startUpdates } = require('./updates.cjs');

const OFFLINE = path.join(__dirname, 'offline.html');
const OFFLINE_URL = pathToFileURL(OFFLINE).href;

let win = null;
let verifier = null;        // (나) 길 — 메모리에만. 교환에 넘긴 뒤 바로 버린다.
let held = [];              // 사이트가 듣기 전에 들어온 표
let listening = false;      // 사이트가 onPass 를 걸었는가
let closeGuard = false;     // 판 도중 — 닫기를 한 번 막는다
let closing = false;        // 확인 뒤 정말 닫는 중

// 하나만 켜지게 — 두 번째 실행은 주소만 건네고 끝난다(Windows 는 실행기 주소가 두 번째 실행의 argv 로 온다).
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    takeLink(L.linkInArgv(argv));
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(start);
  app.on('window-all-closed', () => app.quit());
}

/** 실행기 주소로 붙는다 — 개발 실행(electron .)은 실행 파일 뒤에 앱 경로를 붙여야 같은 앱이 열린다. */
function registerProtocol() {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(L.PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient(L.PROTOCOL);
  }
}

/** 실행기 주소 하나 — 꼴이 맞을 때만 표를 사이트에 넘긴다(다르면 버린다). */
function takeLink(url) {
  const ticket = L.ticketInLink(url);
  if (!ticket) return;
  const pass = { ticket, verifier };
  verifier = null;
  if (listening && win) win.webContents.send(CH.pass, pass);
  else held.push(pass);
}

function start() {
  registerProtocol();
  session.defaultSession.setUserAgent(L.clientUA(session.defaultSession.getUserAgent(), app.getVersion()));

  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 640,
    title: '지니어스 온라인',
    backgroundColor: '#0e0f12',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0a0b0e', symbolColor: '#ffffff', height: 36 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });
  win.once('ready-to-show', () => win.show());
  guardNavigation(win.webContents);
  wireBridge();

  // 사이트에 못 닿으면 껍데기 안의 한 장(「잠시 연결이 안 됩니다」 · 다시 시도)으로.
  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMain) => {
    if (isMain && code !== -3 && url !== OFFLINE_URL) win.loadFile(OFFLINE);
  });
  // F11 = 전체 화면.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { e.preventDefault(); win.setFullScreen(!win.isFullScreen()); }
  });
  // 판 도중이면 닫기를 한 번 막고 사이트에 묻게 한다(⑤). 확인하면 closeNow 로 다시 닫는다.
  win.on('close', (e) => {
    if (closeGuard && !closing) { e.preventDefault(); win.webContents.send(CH.closeAsk); }
  });

  win.loadURL(L.START);
  takeLink(L.linkInArgv(process.argv));
  if (app.isPackaged) startUpdates((u) => win && win.webContents.send(CH.update, u));
}

/** 창 안 이동은 운영 사이트만 — 허용 목록의 https 는 바깥 브라우저로, 나머지는 버린다. 새 창은 안 연다. */
function guardNavigation(wc) {
  const outside = (url) => { if (L.canOpenOutside(url)) shell.openExternal(url); };
  wc.on('will-navigate', (e, url) => {
    if (url === OFFLINE_URL || L.canNavigate(url)) return;
    e.preventDefault();
    outside(url);
  });
  wc.setWindowOpenHandler(({ url }) => { outside(url); return { action: 'deny' }; });
}

/** 다리 — 우리 사이트(또는 껍데기 안 한 장)에서 온 부름만 받는다. */
function wireBridge() {
  const ok = (e) => L.trustedSender(e.senderFrame?.url || '', OFFLINE_URL);
  const on = (ch, fn) => ipcMain.on(ch, (e, v) => { if (ok(e)) fn(e, v); });

  ipcMain.on(CH.version, (e) => { e.returnValue = ok(e) ? app.getVersion() : ''; });
  on(CH.openLogin, () => {
    verifier = newVerifier();
    shell.openExternal(`${L.SITE}/#/connect?c=${challengeOf(verifier)}`);
  });
  on(CH.cancelLogin, () => { verifier = null; });
  on(CH.passReady, () => {
    listening = true;
    const out = held;
    held = [];
    out.forEach((p) => win.webContents.send(CH.pass, p));
  });
  on(CH.minimize, () => win.minimize());
  on(CH.toggleMaximize, () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
  on(CH.toggleFullscreen, () => win.setFullScreen(!win.isFullScreen()));
  on(CH.closeGuard, (_e, v) => { closeGuard = Boolean(v); });
  on(CH.closeNow, () => { closing = true; win.close(); });
  // 다시 그려지면(새로 고침 · 다른 주소) 다시 걸 때까지 표를 쥐고 있는다.
  win.webContents.on('did-start-navigation', (_e, _url, inPlace, isMain) => { if (isMain && !inPlace) listening = false; });
}
