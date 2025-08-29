export interface StepCbParamsBase {
  /**
   * 当前状态的行索引、必须存在
   */
  i: number;
  /**
   * 当前状态的列索引、可以为null
   */
  j: number | null;
  /**
   * 当前状态的值
   */
  value: number;
  /**
   * 当前状态的决策描述
   */
  decision: string;
}
// example: minPathSum
export interface StepCbPathSum extends StepCbParamsBase {
  fromTop: number | null;
  fromLeft: number | null;
}
// example: lengthOfLIS
export interface StepCbLIS extends StepCbParamsBase {
  prevValue: number | null;
}
/**
 * 步骤回调函数类型定义
 */
export type StepCallbackPathSum = (params: StepCbPathSum) => void;
export type StepCallbackLIS = (params: StepCbLIS) => void;