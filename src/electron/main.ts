import { app, BrowserWindow } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'
import { getStaticData, pollResources } from './resource-manager.js'

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:4006')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'))
  }

  pollResources(mainWindow)

  ipcHandle('getStaticData', () => {
    return getStaticData()
  })
})
