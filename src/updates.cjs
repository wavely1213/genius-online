// 실행기 자신의 새 판 받기 — GitHub Releases(electron-updater · C2_BRIEF 2절).
// 받는 동안 진행률만 사이트에 알린다(`onUpdate` → { percent }). 다 받으면 다음에 닫을 때 깔린다.

const { autoUpdater } = require('electron-updater');

/** @param report ({ percent }) => void */
function startUpdates(report) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('download-progress', (p) => report({ percent: p.percent }));
  autoUpdater.on('update-downloaded', () => report({ percent: 100 }));
  // 새 판 확인이 실패해도(오프라인 · 깃허브 장애) 실행기는 그대로 돈다.
  autoUpdater.on('error', () => {});
  autoUpdater.checkForUpdates().catch(() => {});
}

module.exports = { startUpdates };
