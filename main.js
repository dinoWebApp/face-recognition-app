const { app, BrowserWindow } = require("electron");
const path = require("path");

// ===================================================================
// ‼️ GPU 호환성 문제 해결 (최종 단계: 안전장치 해제)
// app.disableHardwareAcceleration()으로 모든 하드웨어 에러는 해결되었습니다.
// 이제 CPU로 실행될 때 성능 저하를 우려하여 멈추는 안전장치만 해제합니다.

// 모든 종류의 GPU 사용을 차단하는 가장 높은 수준의 설정입니다.
app.disableHardwareAcceleration();

// "성능이 크게 저하될 경우 실패하라"는 안전장치를 무시하는 옵션을 추가합니다.
app.commandLine.appendSwitch("no-fail-if-major-perf-caveat");
// ===================================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "renderer/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
