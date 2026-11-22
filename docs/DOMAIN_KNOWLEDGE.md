# DOMAIN_KNOWLEDGE.md — 도메인 지식

> **목적**: 이 서비스의 용어·비즈니스 규칙·불변식을 기록한다. 코드만 봐서는 알 수 없는
> "서비스가 왜 이렇게 동작해야 하는지"의 원천. AI는 도메인 개념이 등장하는 작업 전에
> 이 문서를 확인하고, 여기 정의된 용어·규칙과 다르게 구현하지 않는다.
>
> **갱신 시점**: 새 개념·규칙이 확정될 때마다 즉시. 규칙 변경은 `DECISION_LOG.md`에도 기록.

---

## 1. 용어집 (Glossary)

> 코드 네이밍은 반드시 이 표의 영문 표기를 따른다. 같은 개념 = 같은 이름.

| 용어 (한국어) | 코드 표기 | 정의 |
|---|---|---|
| 껍데기 | (이 저장소) | 운영 사이트 하나를 띄우는 Electron 창. 화면은 사이트가 그린다 |
| 실행기 | `/#/launcher` | 껍데기를 켜면 처음 보는 사이트 화면(접속 전 · 기다림 · 접속 후) |
| 실행기 주소 | `genius-online://pass#t=` · `LAUNCH_URL` | 사이트가 접속 표를 껍데기로 넘기는 주소. 꼴은 `pass#t=<base64url 43자>` 하나뿐 |
| 접속 표 | `ticket` | 웹 세션을 PC 로 옮기는 한 번짜리 표(60초) |
| verifier / challenge | `verifier` · `challengeOf` | (나) 길의 증명값. verifier 는 껍데기 메모리에만, 주소에는 `c=S256(verifier)` 만 |
| 다리 | `window.genius` · `BRIDGE_FNS` | preload 가 사이트에 내미는 함수 11개 |
| 통로 | `CH` | 다리 ↔ main 사이 ipc 이름(`genius:<이름>`) |
| 판 도중 닫기 막기 | `closeGuard` · `closeAsk` · `closeNow` | 서버 판 도중 창 닫기를 한 번 막고 사이트가 묻는다 |

## 2. 회원 등급·권한 체계

없음 — 계정 · 권한은 전부 사이트(Supabase)가 가진다. 껍데기는 사용자를 모른다.

## 3. 비즈니스 규칙 (Business Rules)

> 각 규칙은 번호를 부여하고, 구현·테스트에서 이 번호를 참조한다 (예: `BR-001`).

- **BR-001**: 다리 이름은 사이트 `deathmatch-web/src/lib/bridge.js` 의 `BRIDGE_FNS` 와 같아야 한다. 하나라도 다르면 사이트가 다리를 없는 것으로 보고 브라우저처럼 그린다(`tests/bridge.test.cjs`).
- **BR-002**: 표는 두 길로 온다. (가) 웹에서 시작 — `{ ticket, verifier: null }`. (나) 실행기에서 「웹사이트에서 로그인」 — openLogin 이 verifier 를 만들고 브라우저로 `/#/connect?c=` 를 연다, 돌아온 표와 함께 `{ ticket, verifier }`. 넘긴 verifier 는 바로 버린다.
- **BR-003**: 사이트가 `onPass` 를 걸기 전에 온 표는 쥐고 있다가 `passReady` 때 보낸다(켜자마자 온 실행기 주소 · 새로 고침).
- **BR-004**: 창 안 이동은 운영 사이트(같은 출처)와 껍데기 안 offline 한 장만. 바깥은 https `genius.mulgyeol.kr` · `github.com` 만 기본 브라우저로, 나머지는 버린다. 리디렉트 · 하위 프레임도 같다.
- **BR-005**: 웹 권한은 기본 거절. 허용은 `clipboard-sanitized-write`(방 코드 복사) 하나, 우리 사이트에서 온 요청일 때만.
- **BR-006**: UA 끝은 `GeniusOnline-PC/<판>` — 서버 `dm_device_of` 가 `pc:client` 로 가려낸다. Electron 이 넣는 한글 제품명 토막은 뺀다(HTTP 머리는 ASCII).

## 4. 불변식 (Invariants) — 절대 깨지면 안 되는 조건

- 페이지에 Node 가 없다(contextIsolation · sandbox · nodeIntegration 끔). preload 는 `electron` 밖 파일을 못 불러서 `CH` 를 한 번 더 적고, 시험이 같은지 본다.
- verifier 는 디스크 · 로그 · 주소에 남지 않는다.
- 운영 판에는 개발자 도구가 없다. fuses: RunAsNode · NODE_OPTIONS · inspect 끔, asar 무결성 · asar 만 · 쿠키 암호화 켬.

## 5. 상태와 흐름

```
켜기 → (하나만 켜지게 잠금 — 두 번째 실행은 주소만 첫 창에 넘기고 끝)
     → 사이트 /#/launcher 로드 ─ 실패 → offline.html(「다시 시도」 → 다시 로드)
     → 실행기 주소 도착 → ticketInLink 꼴 확인 → 사이트로 { ticket, verifier }
     → 사이트가 표를 바꿔 세션을 만든다 → 「게임 시작」 → 같은 창 홈
닫기 → closeGuard 켜짐? → closeAsk → (사이트 확인) → closeNow
```

## 6. 정책 메모

- 설치 파일 약 120MB(Electron 45 · 2026-11-20 Actions 실측 zip 121,626,850 bytes). 사이트 받기 화면 문구는 출시일 PR 에서 「약 120MB」로 맞춘다.
- 서명 없음(I-001) → SmartScreen 경고, 새 판 무결성은 Releases + latest.yml sha512 에만(I-003).

## 7. 인계 메모 (C2-b 를 만든 세션 → 다음 세션, 2026-11-22)

- **지금 상태**: `main` 62ea3b0 = C2-b + 보안 손질(Electron 45.4.1 · will-redirect · will-frame-navigate · 권한 기본 거절 · fuses 6 · Actions 권한 분리). 태그 · Release 는 아직 없다.
- **사이트 쪽 스위치**: wavely-web D-109 — `dm_config` 공개 값 `client.pc` 가 `true` 일 때만 사이트가 PC 클라이언트를 권한다(⑥ 고르기 · 설정 줄 · `/#/download` 받기 단추). 지금은 꺼져 있다. v1.0.0 Release 를 올린 **뒤에** 켠다 — 먼저 켜면 받기가 404 다.
- **출시일 PR(wavely-web)에 넣을 것**: `deathmatch-web/src/lib/news.js` 에 「PC 클라이언트가 나왔습니다」 · 시즌 1 끝 공지(2026-12-01 00:00 KST, dm_season 기준) · 받기 화면 「약 100MB」 → 「약 120MB」.
- **리눅스에서 굽기**: NSIS 는 wine 이 필요해 이 컨테이너에선 안 된다(wine 설치는 권한 분류기가 막았다). `--win dir` 은 되고, 설치 파일은 Actions(windows-latest)가 굽는다. 태그 `v*` push → release job 이 Releases 에 올린다.
- **연기 시험**: Xvfb + Playwright `_electron.launch({ executablePath: node_modules/electron/dist/electron, args: ['--no-sandbox', <저장소>, 'genius-online://pass#t=…'] })`. 판 도중 닫기 막기를 켠 채 `app.close()` 하면 정말로 막혀서 멈춘다 — 끝에 `genius.closeNow()` 로 닫는다.
- **알려진 것**: I-001 서명 없음 · I-002 (가) 길 로그인 CSRF(나중에 사이트가 「다른 계정으로 바꿀까요?」) · I-003 새 판 무결성.
