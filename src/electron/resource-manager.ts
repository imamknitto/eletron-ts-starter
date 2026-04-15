import osUtils from 'os-utils'
import fs from 'fs'
import os from 'os'
import { BrowserWindow } from 'electron'
import { webContentsSend } from './utils.js'

const POLLING_INTERVAL = 500

export function pollResources(mainWindow: BrowserWindow) {
  setInterval(async () => {
    const cpuUsage = await getCPUUsage()
    const ramUsage = await getRamUsage()
    const storageData = getStorageData()

    webContentsSend('statistics', mainWindow.webContents, {
      cpuUsage,
      ramUsage,
      storageUsage: storageData.usage,
    })
  }, POLLING_INTERVAL)
}

export function getStaticData() {
  const storageTotal = getStorageData().total
  const cpuModel = os.cpus()[0].model
  const totalMemoryGB = Math.floor(os.totalmem() / 1024)

  return { storageTotal, cpuModel, totalMemoryGB }
}

function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    osUtils.cpuUsage(resolve)
  })
}

function getRamUsage() {
  return 1 - osUtils.freememPercentage()
}

function getStorageData() {
  // requires node 18
  const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/')
  const total = stats.bsize * stats.blocks
  const free = stats.bsize * stats.bfree

  return {
    total: Math.floor(total / 1_000_000_000),
    usage: 1 - free / total,
  }
}
