// (나) 실행기를 먼저 켠 길의 증명값 — verifier 는 메모리에만, challenge = S256(verifier) 만 주소에 싣는다(PKCE 꼴).
// 사이트 `src/lib/pass.js` 의 `randomToken` · `challengeOf` 와 같은 식(32바이트 base64url · sha256 base64url).
const crypto = require('node:crypto');

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const newVerifier = () => b64url(crypto.randomBytes(32));
const challengeOf = (verifier) => b64url(crypto.createHash('sha256').update(verifier).digest());

module.exports = { newVerifier, challengeOf };
