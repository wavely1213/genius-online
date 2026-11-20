// 웹 권한 — 기본은 모두 거절. 사이트가 실제로 쓰는 것만 우리 사이트에서 온 요청일 때 허락한다.
// 사이트 코드에서 확인한 것(2026-11-20): `navigator.clipboard.writeText`(방 초대 InviteSheet — 방 코드 복사) 하나.
//   vibrate · share 는 권한이 필요 없고, 전체 화면은 F11 · 다리(toggleFullscreen)로 껍데기가 직접 한다.
const { canNavigate } = require('./link.cjs');

const ALLOWED = Object.freeze(['clipboard-sanitized-write']);

/** 이 권한을 이 주소에 줘도 되는가. */
const permissionAllowed = (permission, url) => ALLOWED.includes(permission) && canNavigate(url);

module.exports = { ALLOWED, permissionAllowed };
