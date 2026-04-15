type Statistics = {
  cpuUsage: number
  ramUsage: number
  storageUsage: number
}

type StaticData = {
  storageTotal: number
  cpuModel: string
  totalMemoryGB: number
}

type EventPayloadMapping = {
  statistics: Statistics
  getStaticData: StaticData
}

interface Window {
  electron: {
    subscribeStatistics: (callback: (statistics: Statistics) => void) => void
    getStaticData: () => Promise<StaticData>
  }
}
