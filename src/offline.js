// 「다시 시도」 — 실행기 화면으로 다시 간다(껍데기 `src/lib/link.cjs` 의 START 와 같다 · 시험이 본다).
const START = 'https://genius.mulgyeol.kr/#/launcher';
document.getElementById('retry').addEventListener('click', () => { window.location.href = START; });
