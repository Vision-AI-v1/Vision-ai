const {
    contextBridge,
    ipcRenderer,
  } = require("electron");
  
  contextBridge.exposeInMainWorld(
    "visionBrowser",
    {
      navigate: (url) =>
        ipcRenderer.invoke(
          "browser:navigate",
          url
        ),
  
      back: () =>
        ipcRenderer.invoke(
          "browser:back"
        ),
  
      forward: () =>
        ipcRenderer.invoke(
          "browser:forward"
        ),
  
      reload: () =>
        ipcRenderer.invoke(
          "browser:reload"
        ),
  
      getPageContent: () =>
        ipcRenderer.invoke(
          "browser:get-page-content"
        ),
  
      onBrowserState: (callback) => {
        const listener = (_, state) => {
          callback(state);
        };
  
        ipcRenderer.on(
          "browser-state",
          listener
        );
  
        return () => {
          ipcRenderer.removeListener(
            "browser-state",
            listener
          );
        };
      },
    }
  );