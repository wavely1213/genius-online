// 창 지키기 — 이동(바로 · 리디렉트 · 하위 프레임) · 새 창 · 웹 권한. 판단은 `src/lib/` 순수 함수가 한다.
const { shell } = require('electron');
const L = require('./lib/link.cjs');
const { permissionAllowed } = require('./lib/permissions.cjs');

/** 창 안 이동은 운영 사이트(와 껍데기 안 한 장)만 — 허용 목록의 https 는 바깥 브라우저로, 나머지는 버린다. */
function guardNavigation(wc, offlineUrl) {
  const inside = (url) => url === offlineUrl || L.canNavigate(url);
  const outside = (url) => { if (L.canOpenOutside(url)) shell.openExternal(url); };
  const block = (e, url) => { if (!inside(url)) { e.preventDefault(); outside(url); } };

  wc.on('will-navigate', (e) => block(e, e.url));
  // 서버 리디렉트(3xx)는 will-navigate 를 안 거친다.
  wc.on('will-redirect', (e) => { if (!inside(e.url)) e.preventDefault(); });
  // 하위 프레임 이동 — 운영 사이트 밖이면 막는다(바깥 브라우저로도 안 연다).
  wc.on('will-frame-navigate', (e) => { if (!e.isMainFrame && !L.canNavigate(e.url)) e.preventDefault(); });
  wc.setWindowOpenHandler(({ url }) => { outside(url); return { action: 'deny' }; });
}

/** 웹 권한 — 기본 거절, 허용 목록만. 요청(물어보기)과 확인(조용히 묻기) 둘 다. */
function guardPermissions(ses) {
  ses.setPermissionRequestHandler((wc, permission, done, details) => done(permissionAllowed(permission, details.requestingUrl || wc.getURL())));
  ses.setPermissionCheckHandler((_wc, permission, origin, details) => permissionAllowed(permission, details.requestingUrl || origin));
}

module.exports = { guardNavigation, guardPermissions };
