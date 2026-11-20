# 지니어스 온라인 PC 클라이언트

운영 사이트 `https://genius.mulgyeol.kr` 를 띄우는 Windows 실행기(Electron).
작업 지침은 `AGENTS.md` · `docs/` 에 있다.

```
npm ci
npm test
npm start        # 개발 실행
npm run dist     # release/GeniusOnline-Setup.exe
```

새 판 올리기: `package.json` version 을 올리고 태그 `vX.Y.Z` 를 push 하면 Actions 가 GitHub Releases 에 올린다.
