# PROJECT_CONTEXT.md — 프로젝트 맥락

> **목적**: AI가 프로젝트의 배경·목표·기술 환경을 빠르게 파악하는 문서.
> 새 세션 시작 시, 또는 "왜 이렇게 되어 있지?"라는 의문이 들 때 읽는다.
> **갱신 시점**: 프로젝트 방향·스택·구조가 바뀔 때마다 즉시.

---

## 1. 프로젝트 개요

- **이름**: 지니어스 온라인 PC 클라이언트 (`genius-online`)
- **한 줄 설명**: 운영 사이트를 띄우는 Windows 실행기 — 브라우저 없이 바로 게임
- **개발 형태**: 1인 개발 + AI 협업
- **현재 단계**: 첫 판(1.0.0) 개발 — C2-b

## 2. 목표와 대상

- **해결하려는 문제**: 브라우저 탭 대신 전용 창에서 게임하고 싶은 PC 이용자
- **대상 사용자**: 지니어스 온라인의 Windows PC 이용자
- **핵심 기능 (우선순위순)**:
  1. 사이트 하나를 안전하게(이동 허용 목록 · sandbox) 띄운다
  2. 웹 로그인 → 접속 표(`genius-online://pass#t=`)로 실행기에 넘긴다
  3. 실행기 자신의 새 판을 GitHub Releases 에서 받는다
- **명시적으로 하지 않을 것 (Non-goals)**: 실행기 안에 화면 그리기(사이트가 그린다) · 로그인 칸 · 맥/리눅스 판 · 코드 서명(아직)

## 3. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 언어 | JavaScript (CommonJS) | sandbox preload 때문에 cjs |
| 프론트엔드 | 없음 — 운영 사이트를 띄운다 | `offline.html` 한 장만 |
| 백엔드 | 없음 (사이트 · Supabase 가 한다) | |
| 데이터베이스 | 없음 | |
| 인증 | 사이트 접속 표 + PKCE(verifier 는 메모리에만) | |
| 배포/호스팅 | GitHub Releases (Actions, 태그 `v*`) | electron-builder NSIS |
| 기타 | electron-updater | 새 판 받기 |

> 스택 변경은 반드시 `DECISION_LOG.md`에 이유와 함께 기록한다.

## 4. 저장소 구조 (최상위)

```
src/main.cjs          창 · 이동 막기 · 실행기 주소 · 다리 받기 · 닫기 막기
src/preload.cjs       다리 window.genius (sandbox — electron 밖 파일 못 부름)
src/updates.cjs       electron-updater
src/offline.*         「잠시 연결이 안 됩니다」 한 장
src/lib/              순수 함수(link · bridge-names · verifier) — 시험 대상
tests/                node --test
build/icon.png        사이트 favicon.svg 를 512px 로 그린 것
.github/workflows/    PR = 시험+굽기 · 태그 v* = 올리기
```

상세 모듈 구조와 의존 방향은 `ARCHITECTURE.md` 참고.

## 5. 실행 환경

- **로컬 개발 환경 준비**: `npm ci` → `npm test` → `npm start`
- **필요한 환경변수**: 없음. Actions 는 `GITHUB_TOKEN`(자동)만 쓴다
- **실행 명령어**: `AGENTS.md` 5번 항목과 동일하게 유지
- **배포 방법**: `package.json` version 올림 → 태그 `vX.Y.Z` push → Actions 가 Releases 에 `GeniusOnline-Setup.exe` · `latest.yml` 를 올린다

## 6. 외부 서비스·연동

| 서비스 | 용도 | 키 관리 위치 |
|---|---|---|
| genius.mulgyeol.kr | 창이 띄우는 유일한 사이트 | 없음 |
| GitHub Releases | 설치 파일 · 새 판 | Actions `GITHUB_TOKEN` |

## 7. 참고 링크

- 기획 문서: 사이트 저장소 `deathmatch-web/docs/C2_BRIEF.md`
- 디자인: 사이트 `/#/launcher` (피그마 16쪽)
- 운영 대시보드: GitHub Actions · Releases
