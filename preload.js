const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 필요 시 API 노출 가능
});
