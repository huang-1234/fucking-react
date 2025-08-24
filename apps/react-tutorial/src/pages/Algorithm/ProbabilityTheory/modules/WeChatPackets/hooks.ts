import ProbabilityTheory from "@fucking-algorithm/algorithm/ProbabilityTheory/base";
import { useRef, useState } from "react";


export function calcExperimentResults(totalAmount: number, peopleCount: number, targetIndex: number, experimentCount: number) {
  try {
    const results: number[] = [];

    // 运行多次实验
    for (let i = 0;i < experimentCount;i++) {
      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

      // 记录目标位置的金额
      if (targetIndex > 0 && targetIndex <= result.length) {
        results.push(result[targetIndex - 1]);
      }
    }
    // 如果实验结果为空，则返回空结果
    if (results.length === 0) {
      return {
        experimentResults: [],
        experimentStatistics: {
          min: 0,
          max: 0,
          avg: 0,
          median: 0,
          stdDev: 0
        }
      }
    }
    // 排序用于计算中位数
    const sorted = [...results].sort((a, b) => a - b);
    // 计算最小值
    const min = Math.min(...results);
    // 计算最大值
    const max = Math.max(...results);

    // 计算平均值
    const avg = results.reduce((sum, val) => sum + val, 0) / results.length;
    // 计算中位数
    const median = results.length % 2 === 0
      ? (sorted[results.length / 2 - 1] + sorted[results.length / 2]) / 2
      : sorted[Math.floor(results.length / 2)];

    // 计算标准差
    const variance = results.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);
    return {
      experimentResults: results,
      experimentStatistics: {
        min,
        max,
        avg,
        median,
        stdDev
      }
    }
  } catch (error) {
    console.error('运行实验失败:', error);
    return {
      experimentResults: [],
      experimentStatistics: {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        stdDev: 0
      }
    }
  }
}

export interface ExperimentStatistics {
  /** 平均值 */
  avg: number;
  /** 中位数 */
  median: number;
  /** 标准差 */
  stdDev: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
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