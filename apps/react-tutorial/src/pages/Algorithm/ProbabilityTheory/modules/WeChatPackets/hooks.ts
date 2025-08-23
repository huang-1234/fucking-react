import { useRef, useState } from "react";

export interface ExperimentStatistics {
  avg: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
}
export interface UseExperimentOptions {
  initExperimentCount?: number;
  initTargetIndex?: number;
  initExperimentResults?: number[];
  initExperimentStatistics?: ExperimentStatistics;
}
export function useExperiment(options?: UseExperimentOptions) {
  const { initExperimentCount = 100, initTargetIndex = 7, initExperimentResults = [], initExperimentStatistics = { min: 0, max: 0, avg: 0, median: 0, stdDev: 0 } } = options || {};
  // 实验参数
  const [experimentCount, setExperimentCount] = useState<number>(initExperimentCount);
  const [targetIndex, setTargetIndex] = useState<number>(initTargetIndex);
  const [experimentResults, setExperimentResults] = useState<number[]>(initExperimentResults);
  const [experimentStatistics, setExperimentStatistics] = useState<ExperimentStatistics>(initExperimentStatistics);

  return {
    experimentCount,
    targetIndex,
    experimentResults,
    experimentStatistics,
    setExperimentCount,
    setTargetIndex,
    setExperimentResults,
    setExperimentStatistics,
  }
}

export interface UsePacketsOptions {
  initTotalAmount?: number;
  initPeopleCount?: number;
}
export function usePackets(options?: UsePacketsOptions) {
  const { initTotalAmount = 100, initPeopleCount = 10 } = options || {};
  const [totalAmount, setTotalAmount] = useState<number>(initTotalAmount);
  const [peopleCount, setPeopleCount] = useState<number>(initPeopleCount);
  const [packets, setPackets] = useState<number[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  return {
    totalAmount,
    peopleCount,
    packets,
    highlightIndex,
    setTotalAmount,
    setPeopleCount,
    setPackets,
    setHighlightIndex,
  }
}

// use experimentChart
export function useExperimentChart() {
  // 图表引用
  const distributionChartRef = useRef<HTMLDivElement>(null);
  const experimentChartRef = useRef<HTMLDivElement>(null);

  // 分布图表实例
  const [distributionChart, setDistributionChart] = useState<echarts.ECharts | null>(null);
  const [experimentChart, setExperimentChart] = useState<echarts.ECharts | null>(null);

  return {
    distributionChart,
    experimentChart,
    setDistributionChart,
    setExperimentChart,
    distributionChartRef,
    experimentChartRef,
  }
}