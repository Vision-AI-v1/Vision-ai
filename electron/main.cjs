const {
    app,
    BrowserWindow,
    WebContentsView,
    ipcMain,
    session,
  } = require("electron");
  
  const path = require("path");
  
  let mainWindow;
  let browserView;
  
  const isDev = !app.isPackaged;
  
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1100,
      minHeight: 700,
  
      backgroundColor: "#0b0b0b",
  
      webPreferences: {
        preload: path.join(
          __dirname,
          "preload.cjs"
        ),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
  
    if (isDev) {
      mainWindow.loadURL(
        "http://localhost:3000/browser"
      );
    } else {
      mainWindow.loadFile(
        path.join(
          __dirname,
          "../out/browser/index.html"
        )
      );
    }
  
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
  
  function createBrowserView() {
    browserView = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
  
    mainWindow.contentView.addChildView(
      browserView
    );
  
    resizeBrowser();
  
    browserView.webContents.loadURL(
      "https://www.google.com"
    );
  
    browserView.webContents.on(
      "did-navigate",
      () => {
        sendBrowserState();
      }
    );
  
    browserView.webContents.on(
      "did-navigate-in-page",
      () => {
        sendBrowserState();
      }
    );
  
    browserView.webContents.on(
      "page-title-updated",
      () => {
        sendBrowserState();
      }
    );
  }
  
  function resizeBrowser() {
    if (!browserView || !mainWindow) return;
  
    const bounds = mainWindow.getContentBounds();
  
    browserView.setBounds({
      x: 0,
      y: 112,
      width: bounds.width,
      height: bounds.height - 112,
    });
  }
  
  async function sendBrowserState() {
    if (!browserView || !mainWindow) return;
  
    const url =
      browserView.webContents.getURL();
  
    const title =
      browserView.webContents.getTitle();
  
    mainWindow.webContents.send(
      "browser-state",
      {
        url,
        title,
      }
    );
  }
  
  ipcMain.handle(
    "browser:navigate",
    async (_, url) => {
      if (!browserView) return;
  
      let target = url.trim();
  
      if (!target) return;
  
      if (
        !target.startsWith("http://") &&
        !target.startsWith("https://")
      ) {
        target =
          "https://www.google.com/search?q=" +
          encodeURIComponent(target);
      }
  
      await browserView.webContents.loadURL(
        target
      );
    }
  );
  
  ipcMain.handle(
    "browser:back",
    async () => {
      if (
        browserView &&
        browserView.webContents.canGoBack()
      ) {
        browserView.webContents.goBack();
      }
    }
  );
  
  ipcMain.handle(
    "browser:forward",
    async () => {
      if (
        browserView &&
        browserView.webContents.canGoForward()
      ) {
        browserView.webContents.goForward();
      }
    }
  );
  
  ipcMain.handle(
    "browser:reload",
    async () => {
      if (browserView) {
        browserView.webContents.reload();
      }
    }
  );
  
  ipcMain.handle(
    "browser:get-page-content",
    async () => {
      if (!browserView) return null;
  
      const result =
        await browserView.webContents.executeJavaScript(
          `
          ({
            title: document.title,
            url: location.href,
            text: document.body
              ? document.body.innerText
              : ""
          })
          `
        );
  
      return result;
    }
  );
  
  app.whenReady().then(() => {
    createWindow();
    createBrowserView();
  
    mainWindow.on(
      "resize",
      resizeBrowser
    );
  
    session.defaultSession.setPermissionRequestHandler(
      (_, permission, callback) => {
        const allowed = [
          "media",
          "geolocation",
          "notifications",
        ];
  
        callback(
          allowed.includes(permission)
        );
      }
    );
  });
  
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });