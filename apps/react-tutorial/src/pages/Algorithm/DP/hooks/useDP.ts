import { useState, useEffect, useCallback } from 'react';
import type { DPState } from '../al';
import { houseRobber, longestIncreasingSubsequence, knapsack01 } from '../al';

/**
 * 动态规划可视化钩子函数
 * @param algorithm 算法类型
 * @param input 输入数据
 * @returns 动态规划状态和控制函数
 */
export function useDP<T extends any[]>(
  algorithm: 'houseRobber' | 'lis' | 'knapsack01',
  ...input: T
) {
  // 状态
  const [steps, setSteps] = useState<DPState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 计算DP步骤
  useEffect(() => {
    let result: DPState[] = [];

    switch (algorithm) {
      case 'houseRobber':
        result = houseRobber(input[0] as number[]);
        break;
      case 'lis':
        result = longestIncreasingSubsequence(input[0] as number[]);
        break;
      case 'knapsack01':
        // 特殊处理背包问题，因为它返回的不是标准的DPState[]
        const knapsackResult = knapsack01(
          input[0] as number[],
          input[1] as number[],
          input[2] as number
        );
        // 转换为标准DPState格式
        result = knapsackResult.steps.map((step) => ({
          dp: step.dp.flat(), // 将二维数组展平
          decision: step.decision,
          step: step.step,
          highlightIndices: step.highlightCells.map(cell => cell[0] * (input[2] as number + 1) + cell[1]),
          metadata: {
            originalDp: step.dp,
            item: step.item,
            weight: step.weight,
            value: step.value,
            highlightCells: step.highlightCells
          }
        }));
        break;
      default:
        console.error('未知算法类型:', algorithm);
    }

    setSteps(result);
    setCurrentStep(0);
  }, [algorithm, ...input]);

  // 播放控制
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  // 控制函数
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => setCurrentStep(0), []);
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);
  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  return {
    steps,
    currentStep,
    currentState: steps[currentStep],
    isPlaying,
    playbackSpeed,
    totalSteps: steps.length,
    // 控制函数
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    goToStep,
    setSpeed
  };
}