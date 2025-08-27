import React from 'react'
import { useMonitorPerformance } from './Performance/MonitorPerformance'
import type { PerformanceMonitor } from 'perfor-monitor'

interface MonitorContext {
  monitor?: PerformanceMonitor
}

const MonitorContext = React.createContext<MonitorContext>({
  monitor: undefined as unknown as PerformanceMonitor
})

export default MonitorContext

export const MonitorProvider = ({ children }: { children: React.ReactNode }) => {
  const { performanceMonitor } = useMonitorPerformance()
  return <MonitorContext.Provider value={{ monitor: performanceMonitor }}>{children}</MonitorContext.Provider>
}