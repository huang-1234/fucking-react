import { batch, observable } from '@formily/reactive'
import { type Graph } from '../Search/al/dfs/dfs_ts';
import { isObjectLike } from 'lodash-es';
export enum DFSMode {
  GRAPH = 'graph',
  GRID = 'grid'
}

import { message  } from 'antd';

export enum DFSAlgorithm {
  RECURSIVE = 'recursive',
  ITERATIVE = 'iterative',
  FIND_PATHS = 'find_paths',
  NUM_ISLANDS = 'num_islands'
}

export enum OperationType {
  VISIT = 'visit',
  EXPLORE = 'explore',
  BACKTRACK = 'backtrack',
  ENQUEUE = 'enqueue',
  DEQUEUE = 'dequeue',
  SOLUTION_FOUND = 'solution_found',
  SOLUTION_REJECTED = 'solution_rejected',
  START = 'start',
  END = 'end',
  CUSTOM = 'custom'
}

import { dfsRecursive, dfsIterative, numIslands, findAllPaths } from '../Search/al/dfs/dfs_ts';
export interface Operation<T = unknown> {
  type: OperationType | string;
  node?: string;
  timestamp: number;
  description: string;
  data?: T;
}

export function makeQueueDeque(algorithmFunctions?: {
  dfsRecursive: typeof dfsRecursive;
  dfsIterative: typeof dfsIterative;
  numIslands: typeof numIslands;
  findAllPaths: typeof findAllPaths;
}) {
  const queueDeque = observable({
    // 算法模式和类型
    mode: DFSMode.GRAPH,
    algorithm: DFSAlgorithm.RECURSIVE,

    // 图数据
    graph: {
      'A': ['B', 'C'],
      'B': ['A', 'D', 'E'],
      'C': ['A', 'F'],
      'D': ['B'],
      'E': ['B', 'F'],
      'F': ['C', 'E']
    } as Graph,
    startNode: 'A',
    endNode: 'F',

    // 网格数据
    grid: [
      ['1', '1', '0', '0', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '1', '1']
    ] as string[][],
    gridRows: 4,
    gridCols: 5,

    // 算法执行状态
    visitedNodes: new Set<string>(),
    currentNode: null as string | null,
    stack: [] as string[],
    path: [] as string[],
    operations: [] as Operation[],
    islandGrid: [] as number[][],
    visitedCells: [] as boolean[][],
    currentCell: null as [number, number] | null,

    // 动画控制
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 500,
    animationTimer: null as NodeJS.Timeout | null,

    // 执行历史
    executionHistory: [] as any[],

    // 组件挂载状态
    isMounted: true
  })

  // 重置算法执行状态
  function resetAlgorithm() {
    queueDeque.visitedNodes = new Set();
    queueDeque.currentNode = null;
    queueDeque.stack = [];
    queueDeque.path = [];
    queueDeque.operations = [];
    queueDeque.currentStep = 0;
    queueDeque.isPlaying = false;

    if (queueDeque.mode === DFSMode.GRID) {
      queueDeque.islandGrid = Array(queueDeque.gridRows).fill(0).map(() => Array(queueDeque.gridCols).fill(0));
      queueDeque.visitedCells = Array(queueDeque.gridRows).fill(false).map(() => Array(queueDeque.gridCols).fill(false));
      queueDeque.currentCell = null;
    }

    if (queueDeque.animationTimer) {
      clearTimeout(queueDeque.animationTimer);
      queueDeque.animationTimer = null;
    }

    // 记录操作
    queueDeque.operations = [{
      type: OperationType.START,
      timestamp: Date.now(),
      description: '算法重置'
    }];
  }

  // 处理模式改变
  const handleModeChange = (value: DFSMode) => {
    queueDeque.mode = value;
    resetAlgorithm();

    // 根据模式设置默认算法
    if (value === DFSMode.GRAPH) {
      queueDeque.algorithm = DFSAlgorithm.RECURSIVE;
    } else {
      queueDeque.algorithm = DFSAlgorithm.NUM_ISLANDS;
    }
  };

  // 处理算法改变
  const handleAlgorithmChange = (value: DFSAlgorithm) => {
    queueDeque.algorithm = value;
    resetAlgorithm();
  };

  // 处理图形输入
  const handleGraphInput = (value: string) => {
    try {
      const parsedGraph = JSON.parse(value);
      queueDeque.graph = parsedGraph;
      resetAlgorithm();
      return { success: true };
    } catch (error) {
      return { success: false, error: '图形输入格式不正确，请使用有效的JSON格式' };
    }
  };

  // 处理网格输入
  const handleGridInput = (value: string) => {
    try {
      const parsedGrid = JSON.parse(value);
      if (Array.isArray(parsedGrid) && parsedGrid.every(row => Array.isArray(row))) {
        queueDeque.grid = parsedGrid;
        queueDeque.gridRows = parsedGrid.length;
        queueDeque.gridCols = parsedGrid[0].length;
        resetAlgorithm();
        return { success: true };
      } else {
        throw new Error('网格格式不正确');
      }
    } catch (error) {
      return { success: false, error: '网格输入格式不正确，请使用有效的二维数组JSON格式' };
    }
  };

  // 处理网格大小改变
  const handleGridSizeChange = (rows: number, cols: number) => {
    queueDeque.gridRows = rows;
    queueDeque.gridCols = cols;

    // 创建新的网格
    const newGrid = Array(rows).fill(0).map(() => Array(cols).fill('0'));
    queueDeque.grid = newGrid;
    resetAlgorithm();
  };

  // 处理单元格点击
  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...queueDeque.grid];
    newGrid[row][col] = newGrid[row][col] === '1' ? '0' : '1';
    queueDeque.grid = newGrid;
    resetAlgorithm();
  };

  // 生成随机岛屿
  const generateRandomIslands = () => {
    const newGrid = Array(queueDeque.gridRows).fill(0).map(() =>
      Array(queueDeque.gridCols).fill(0).map(() =>
        Math.random() > 0.7 ? '1' : '0'
      )
    );
    queueDeque.grid = newGrid;
    resetAlgorithm();
  };

  // 处理速度改变
  const handleSpeedChange = (value: number) => {
    queueDeque.speed = value;
  };

  // 更新当前步骤的状态
  const updateStepState = (step: number) => {
    if (!queueDeque.executionHistory || step < 0 || step >= queueDeque.executionHistory.length) {
      return;
    }

    const currentState = queueDeque.executionHistory[step];

    if (queueDeque.mode === DFSMode.GRAPH) {
      queueDeque.visitedNodes = currentState.visited;
      queueDeque.currentNode = currentState.currentNode;
      queueDeque.stack = currentState.stack || [];
      queueDeque.path = currentState.path || [];

      // 仅在步骤变化时添加一次操作记录
      if (step !== queueDeque.currentStep) {
        const newOps = [...queueDeque.operations];
        if (newOps.length > 50) newOps.shift();

        queueDeque.operations = [...newOps, {
          type: OperationType.VISIT,
          node: currentState.currentNode,
          timestamp: Date.now(),
          description: `访问节点 ${currentState.currentNode}`
        }];
      }
    } else if (queueDeque.mode === DFSMode.GRID) {
      queueDeque.visitedCells = currentState.visited;
      queueDeque.currentCell = currentState.currentCell;
      queueDeque.islandGrid = currentState.islandIds;

      // 仅在步骤变化时添加一次操作记录
      if (step !== queueDeque.currentStep) {
        const newOps = [...queueDeque.operations];
        if (newOps.length > 50) newOps.shift();

        queueDeque.operations = [...newOps, {
          type: OperationType.VISIT,
          node: `(${currentState.currentCell[0]}, ${currentState.currentCell[1]})`,
          timestamp: Date.now(),
          description: `访问单元格 (${currentState.currentCell[0]}, ${currentState.currentCell[1]})`
        }];
      }
    }

    queueDeque.currentStep = step;
  };

  // 处理步骤改变
  const handleStepChange = (value: number | null) => {
    if(value === null) return;
    updateStepState(value);
  };

  // 播放动画
  const playAnimation = () => {
    // 清除之前的定时器，避免多个定时器同时运行
    if (queueDeque.animationTimer) {
      clearTimeout(queueDeque.animationTimer);
    }

    // 创建新的定时器
    const timer = setTimeout(() => {
      if (queueDeque.isMounted) {
        // 如果已经到达最后一步，停止播放
        if (queueDeque.currentStep >= queueDeque.totalSteps) {
          queueDeque.isPlaying = false;
        } else {
          // 否则更新到下一步
          updateStepState(queueDeque.currentStep + 1);
        }
      }
    }, queueDeque.speed);

    // 记录当前定时器
    queueDeque.animationTimer = timer;
  };

  // 处理播放按钮点击
  const handlePlay = () => {
    // 如果没有执行步骤，先运行算法
    if (queueDeque.executionHistory.length === 0 || queueDeque.totalSteps === 0) {
      executeAlgorithm();
      // 短暂延迟后开始播放，确保算法执行完毕
      console.log('queue:handlePlay', queueDeque.isPlaying, queueDeque.isMounted)
      setTimeout(() => {
        if (queueDeque.isMounted) {
          queueDeque.isPlaying = true;
        }
      }, 100);
    } else if (queueDeque.currentStep >= queueDeque.totalSteps) {
      // 如果已经到达最后一步，重置到第一步并开始播放
      updateStepState(0);
      queueDeque.isPlaying = true;
    } else {
      // 正常播放
      queueDeque.isPlaying = true;
    }
  };

  // 处理暂停按钮点击
  const handlePause = () => {
    queueDeque.isPlaying = false;
  };

  // 处理重置按钮点击
  const handleReset = () => {
    resetAlgorithm();
    executeAlgorithm();
  };

  // 处理下一步按钮点击
  const handleStepForward = () => {
    // 如果没有执行步骤，先运行算法
    if (queueDeque.executionHistory.length === 0 || queueDeque.totalSteps === 0) {
      executeAlgorithm();
      // 短暂延迟后前进一步，确保算法执行完毕
      setTimeout(() => {
        updateStepState(0);
      }, 100);
    } else if (queueDeque.currentStep < queueDeque.totalSteps) {
      updateStepState(queueDeque.currentStep + 1);
    }
  };

  // 处理上一步按钮点击
  const handleStepBackward = () => {
    if (queueDeque.currentStep > 0) {
      updateStepState(queueDeque.currentStep - 1);
    }
  };

  // 执行算法
  const executeAlgorithm = () => {
    batch(() => {
      if (queueDeque.mode === DFSMode.GRAPH) {
        executeGraphDFS();
      } else {
        executeGridDFS();
      }
    })
  };

  // 执行图的DFS
  const executeGraphDFS = () => {
    if (!isObjectLike(algorithmFunctions) && typeof isObjectLike !== 'object') {
      console.log('Algorithm functions not provided');
      return;
    }
    console.log('algorithmFunctions', algorithmFunctions)

    const { dfsRecursive, dfsIterative, findAllPaths } = algorithmFunctions || {};

    resetAlgorithm();

    const executionSteps: {
      currentNode: string;
      visited: Set<string>;
      stack: string[];
      path: string[];
    }[] = [];
    const visited = new Set<string>();
    const result: string[] = [];

    // 限制执行步骤数量，避免性能问题
    const MAX_STEPS = 1000;

    if (queueDeque.algorithm === DFSAlgorithm.RECURSIVE) {
      // 记录递归DFS的每一步
      dfsRecursive?.(queueDeque.graph, queueDeque.startNode, visited, result, (node: string, visitedSet: Set<string>, stack: string[]) => {
        if (executionSteps.length < MAX_STEPS) {
          executionSteps.push({
            currentNode: node,
            visited: new Set(visitedSet),
            stack: [...stack],
            path: [...result]
          });
        }
      });
    } else if (queueDeque.algorithm === DFSAlgorithm.ITERATIVE) {
      // 记录迭代DFS的每一步
      dfsIterative?.(queueDeque.graph, queueDeque.startNode, (node: string, visitedSet: Set<string>, stack: string[]) => {
        if (executionSteps.length < MAX_STEPS) {
          executionSteps.push({
            currentNode: node,
            visited: new Set(visitedSet),
            stack: [...stack],
            path: [...result]
          });
          result.push(node);
        }
      });
    } else if (queueDeque.algorithm === DFSAlgorithm.FIND_PATHS) {
      // 记录查找路径的每一步
      findAllPaths?.(queueDeque.graph, queueDeque.startNode, queueDeque.endNode, (currentPath: string[], visitedSet: Set<string>) => {
        if (executionSteps.length < MAX_STEPS) {
          executionSteps.push({
            currentNode: currentPath[currentPath.length - 1],
            visited: new Set(visitedSet),
            stack: [],
            path: [...currentPath]
          });
        }
      });
    }

    // 如果步骤太多，提示用户
    if (executionSteps.length >= MAX_STEPS) {
      message.warning(`算法执行步骤过多，仅显示前 ${MAX_STEPS} 步`);
    }

    queueDeque.executionHistory = executionSteps;
    queueDeque.totalSteps = executionSteps.length - 1;

    console.log('executionSteps', queueDeque.totalSteps)

    // 记录操作
    queueDeque.operations = [{
      type: OperationType.START,
      timestamp: Date.now(),
      description: `开始执行 ${queueDeque.algorithm === DFSAlgorithm.RECURSIVE ? '递归DFS' :
        queueDeque.algorithm === DFSAlgorithm.ITERATIVE ? '迭代DFS' : '查找路径'}`
    }];
  };

  // 执行网格的DFS
  const executeGridDFS = () => {
    if (!algorithmFunctions) {
      console.log('Algorithm functions not provided');
      return;
    }

    const { numIslands } = algorithmFunctions;

    resetAlgorithm();

    const executionSteps: any[] = [];

    // 限制执行步骤数量，避免性能问题
    const MAX_STEPS = 1000;

    if (queueDeque.algorithm === DFSAlgorithm.NUM_ISLANDS) {
      // 记录岛屿数量问题的每一步
      const visited = Array(queueDeque.gridRows).fill(false).map(() => Array(queueDeque.gridCols).fill(false));
      const islandIds = Array(queueDeque.gridRows).fill(0).map(() => Array(queueDeque.gridCols).fill(0));

      numIslands(queueDeque.grid, (r: number, c: number, islandId: number, visitedGrid: boolean[][]) => {
        if (executionSteps.length < MAX_STEPS) {
          const newVisited = visitedGrid.map(row => [...row]);
          const newIslandIds = [...islandIds];
          newIslandIds[r][c] = islandId;

          executionSteps.push({
            currentCell: [r, c],
            visited: newVisited,
            islandIds: newIslandIds.map(row => [...row])
          });
        }
      });
    }

    // 如果步骤太多，提示用户
    if (executionSteps.length >= MAX_STEPS) {
      message.warning(`算法执行步骤过多，仅显示前 ${MAX_STEPS} 步`);
    }

    queueDeque.executionHistory = executionSteps;
    queueDeque.totalSteps = executionSteps.length - 1;

    // 记录操作
    queueDeque.operations = [{
      type: OperationType.START,
      timestamp: Date.now(),
      description: '开始执行岛屿数量问题'
    }];
  };

  // 组件卸载时的清理
  const cleanup = () => {
    queueDeque.isMounted = false;
    if (queueDeque.animationTimer) {
      clearTimeout(queueDeque.animationTimer);
      queueDeque.animationTimer = null;
    }
  };

  return {
    queueDeque,
    resetAlgorithm,
    handleModeChange,
    handleAlgorithmChange,
    handleGraphInput,
    handleGridInput,
    handleGridSizeChange,
    handleCellClick,
    generateRandomIslands,
    handleSpeedChange,
    updateStepState,
    handleStepChange,
    playAnimation,
    handlePlay,
    handlePause,
    handleReset,
    handleStepForward,
    handleStepBackward,
    executeAlgorithm,
    executeGraphDFS,
    executeGridDFS,
    cleanup
  }
}