// 주소 판단 — 실행기 주소(`genius-online://`) · 창 안에서 갈 수 있는 곳 · 바깥 브라우저로 열어도 되는 곳(C2_BRIEF 2절).
// 순수 함수만 둔다(Electron 없이 시험한다 · `tests/link.test.cjs`).

/** 운영 사이트 — 창은 이 사이트 하나만 띄운다. */
const SITE = 'https://genius.mulgyeol.kr';
/** 켜면 여는 자리 — 실행기 화면(사이트 `/#/launcher`). */
const START = `${SITE}/#/launcher`;
/** 실행기 주소 갈래 — 사이트 `src/lib/connect.js` 의 `LAUNCH_URL` 과 같아야 한다. */
const PROTOCOL = 'genius-online';
const LAUNCH_URL = `${PROTOCOL}://pass#t=`;

/** 받는 꼴은 `genius-online://pass#t=<base64url 43자>` 하나뿐 — 사이트 `ticketInLink` 와 같은 식. */
const LINK = /^genius-online:\/\/pass#t=([A-Za-z0-9_-]{43})$/;
const ticketInLink = (url) => (LINK.exec(String(url || '')) || [])[1] || '';

/** 켜질 때 받은 인자들 가운데 실행기 주소 하나(Windows 는 두 번째 실행의 argv 로 온다). */
const linkInArgv = (argv = []) => argv.find((a) => typeof a === 'string' && a.startsWith(`${PROTOCOL}://`)) || '';

/** 바깥 브라우저로 열어도 되는 곳 — https 이고 이 목록의 호스트일 때만. */
const OUTSIDE_HOSTS = Object.freeze(['genius.mulgyeol.kr', 'github.com']);

function parse(url) {
  try { return new URL(url); } catch { return null; }
}

/** 창 안에서 옮겨 가도 되는가 — 운영 사이트(같은 출처)만. */
function canNavigate(url) {
  const u = parse(url);
  return Boolean(u) && u.origin === SITE;
}

/** 바깥 브라우저로 넘겨도 되는가 — 창 안 이동이 막힌 주소 중 허용 목록만. */
function canOpenOutside(url) {
  const u = parse(url);
  return Boolean(u) && u.protocol === 'https:' && OUTSIDE_HOSTS.includes(u.hostname) && !u.username && !u.password;
}

/** 다리를 부른 쪽이 우리 사이트(또는 껍데기 안의 「잠시 연결이 안 됩니다」 한 장)인가. */
function trustedSender(url, offlineUrl = '') {
  return canNavigate(url) || (Boolean(offlineUrl) && url === offlineUrl);
}

/** UA 끝에 붙이는 표 — 사이트 `28_sessions.sql` dm_device_of 가 `pc:client` 로 가려낸다. */
const uaTail = (version) => `GeniusOnline-PC/${version}`;

/** 창의 UA — Electron 이 넣는 한글 제품명 토막(`지니어스온라인/1.0.0`)은 HTTP 머리에 못 싣는 글자라 빼고, 꼬리를 붙인다. */
function clientUA(base, version) {
  const ascii = String(base || '').split(' ').filter((t) => t && /^[\x21-\x7e]+$/.test(t));
  return [...ascii, uaTail(version)].join(' ');
}

module.exports = { SITE, START, PROTOCOL, LAUNCH_URL, OUTSIDE_HOSTS, ticketInLink, linkInArgv, canNavigate, canOpenOutside, trustedSender, uaTail, clientUA };
