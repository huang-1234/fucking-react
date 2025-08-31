import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Select, Space, Divider, Switch, message, InputNumber } from 'antd';
import { type Graph, dfsRecursive, dfsIterative, numIslands, findAllPaths } from '../al/dfs/dfs_ts';
import SearchVisualizerBase from '../components/SearchVisualizerBase';
import GraphVisualizer from '../components/GraphVisualizer';
import GridVisualizer from '../components/GridVisualizer';
import AlgorithmControls from '../components/AlgorithmControls';
import ExecutionHistory, { OperationType, type Operation } from '../components/ExecutionHistory';
import CodeDisplay from '../components/CodeDisplay';

const { Option } = Select;

enum DFSMode {
  GRAPH = 'graph',
  GRID = 'grid'
}

enum DFSAlgorithm {
  RECURSIVE = 'recursive',
  ITERATIVE = 'iterative',
  FIND_PATHS = 'find_paths',
  NUM_ISLANDS = 'num_islands'
}

export const DFSVisualizer: React.FC = () => {
  // 算法模式和类型
  const [mode, setMode] = useState<DFSMode>(DFSMode.GRAPH);
  const [algorithm, setAlgorithm] = useState<DFSAlgorithm>(DFSAlgorithm.RECURSIVE);

  // 图数据
  const [graph, setGraph] = useState<Graph>({
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
  });
  const [startNode, setStartNode] = useState<string>('A');
  const [endNode, setEndNode] = useState<string>('F');

  // 网格数据
  const [grid, setGrid] = useState<string[][]>([
    ['1', '1', '0', '0', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '1', '0', '0'],
    ['0', '0', '0', '1', '1']
  ]);
  const [gridRows, setGridRows] = useState<number>(4);
  const [gridCols, setGridCols] = useState<number>(5);

  // 算法执行状态
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [islandGrid, setIslandGrid] = useState<number[][]>([]);
  const [visitedCells, setVisitedCells] = useState<boolean[][]>([]);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);

  // 动画控制
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(500);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);

  // 执行历史
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  // 重置算法执行状态
  const resetAlgorithm = useCallback(() => {
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setStack([]);
    setPath([]);
    setOperations([]);
    setCurrentStep(0);
    setIsPlaying(false);

    if (mode === DFSMode.GRID) {
      setIslandGrid(Array(gridRows).fill(0).map(() => Array(gridCols).fill(0)));
      setVisitedCells(Array(gridRows).fill(false).map(() => Array(gridCols).fill(false)));
      setCurrentCell(null);
    }

    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }

    // 记录操作
    setOperations([{
      type: OperationType.START,
      timestamp: Date.now(),
      description: '算法重置'
    }]);
  }, [animationTimer, gridRows, gridCols, mode]);

  // 初始化网格
  useEffect(() => {
    if (mode === DFSMode.GRID) {
      setIslandGrid(Array(gridRows).fill(0).map(() => Array(gridCols).fill(0)));
      setVisitedCells(Array(gridRows).fill(false).map(() => Array(gridCols).fill(false)));
    }
  }, [gridRows, gridCols, mode]);

  // 执行图的DFS
  const executeGraphDFS = useCallback(() => {
    resetAlgorithm();

    const executionSteps: any[] = [];
    const visited = new Set<string>();
    const result: string[] = [];

    if (algorithm === DFSAlgorithm.RECURSIVE) {
      // 记录递归DFS的每一步
      dfsRecursive(graph, startNode, visited, result, (node, visitedSet, stack) => {
        executionSteps.push({
          currentNode: node,
          visited: new Set(visitedSet),
          stack: [...stack],
          path: [...result]
        });
      });
    } else if (algorithm === DFSAlgorithm.ITERATIVE) {
      // 记录迭代DFS的每一步
      dfsIterative(graph, startNode, (node, visitedSet, stack) => {
        executionSteps.push({
          currentNode: node,
          visited: new Set(visitedSet),
          stack: [...stack],
          path: [...result]
        });
        result.push(node);
      });
    } else if (algorithm === DFSAlgorithm.FIND_PATHS) {
      // 记录查找路径的每一步
      findAllPaths(graph, startNode, endNode, (currentPath, visitedSet) => {
        executionSteps.push({
          currentNode: currentPath[currentPath.length - 1],
          visited: new Set(visitedSet),
          stack: [],
          path: [...currentPath]
        });
      });
    }

    setExecutionHistory(executionSteps);
    setTotalSteps(executionSteps.length - 1);

    // 记录操作
    setOperations([{
      type: OperationType.START,
      timestamp: Date.now(),
      description: `开始执行 ${algorithm === DFSAlgorithm.RECURSIVE ? '递归DFS' :
        algorithm === DFSAlgorithm.ITERATIVE ? '迭代DFS' : '查找路径'}`
    }]);
  }, [algorithm, graph, startNode, endNode, resetAlgorithm]);

  // 执行网格的DFS
  const executeGridDFS = useCallback(() => {
    resetAlgorithm();

    const executionSteps: any[] = [];

    if (algorithm === DFSAlgorithm.NUM_ISLANDS) {
      // 记录岛屿数量问题的每一步
      const visited = Array(gridRows).fill(false).map(() => Array(gridCols).fill(false));
      const islandIds = Array(gridRows).fill(0).map(() => Array(gridCols).fill(0));

      numIslands(grid, (r, c, islandId, visitedGrid) => {
        const newVisited = visitedGrid.map(row => [...row]);
        const newIslandIds = [...islandIds];
        newIslandIds[r][c] = islandId;

        executionSteps.push({
          currentCell: [r, c],
          visited: newVisited,
          islandIds: newIslandIds.map(row => [...row])
        });
      });
    }

    setExecutionHistory(executionSteps);
    setTotalSteps(executionSteps.length - 1);

    // 记录操作
    setOperations([{
      type: OperationType.START,
      timestamp: Date.now(),
      description: '开始执行岛屿数量问题'
    }]);
  }, [algorithm, grid, gridRows, gridCols, resetAlgorithm]);

  // 执行算法
  const executeAlgorithm = useCallback(() => {
    if (mode === DFSMode.GRAPH) {
      executeGraphDFS();
    } else {
      executeGridDFS();
    }
  }, [mode, executeGraphDFS, executeGridDFS]);

  // 更新当前步骤的状态
  const updateStepState = useCallback((step: number) => {
    if (!executionHistory || step < 0 || step >= executionHistory.length) {
      return;
    }

    const currentState = executionHistory[step];

    if (mode === DFSMode.GRAPH) {
      setVisitedNodes(currentState.visited);
      setCurrentNode(currentState.currentNode);
      setStack(currentState.stack || []);
      setPath(currentState.path || []);

      // 记录操作
      setOperations(prev => [...prev, {
        type: OperationType.VISIT,
        node: currentState.currentNode,
        timestamp: Date.now(),
        description: `访问节点 ${currentState.currentNode}`
      }]);
    } else if (mode === DFSMode.GRID) {
      setVisitedCells(currentState.visited);
      setCurrentCell(currentState.currentCell);
      setIslandGrid(currentState.islandIds);

      // 记录操作
      setOperations(prev => [...prev, {
        type: OperationType.VISIT,
        node: `(${currentState.currentCell[0]}, ${currentState.currentCell[1]})`,
        timestamp: Date.now(),
        description: `访问单元格 (${currentState.currentCell[0]}, ${currentState.currentCell[1]})`
      }]);
    }

    setCurrentStep(step);
  }, [executionHistory, mode]);

  // 播放动画
  const playAnimation = useCallback(() => {
    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    const timer = setTimeout(() => {
      updateStepState(currentStep + 1);
    }, speed);

    setAnimationTimer(timer);
  }, [currentStep, totalSteps, speed, updateStepState]);

  // 当播放状态改变时，控制动画
  useEffect(() => {
    if (isPlaying) {
      playAnimation();
    } else if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
  }, [isPlaying, playAnimation, animationTimer]);

  // 当前步骤达到最后一步时，停止播放
  useEffect(() => {
    if (currentStep >= totalSteps && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, totalSteps, isPlaying]);

  // 处理播放按钮点击
  const handlePlay = () => {
    setIsPlaying(true);
  };

  // 处理暂停按钮点击
  const handlePause = () => {
    setIsPlaying(false);
  };

  // 处理重置按钮点击
  const handleReset = () => {
    resetAlgorithm();
    executeAlgorithm();
  };

  // 处理下一步按钮点击
  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      updateStepState(currentStep + 1);
    }
  };

  // 处理上一步按钮点击
  const handleStepBackward = () => {
    if (currentStep > 0) {
      updateStepState(currentStep - 1);
    }
  };

  // 处理速度改变
  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  // 处理步骤改变
  const handleStepChange = (value: number) => {
    updateStepState(value);
  };

  // 处理模式改变
  const handleModeChange = (value: DFSMode) => {
    setMode(value);
    resetAlgorithm();

    // 根据模式设置默认算法
    if (value === DFSMode.GRAPH) {
      setAlgorithm(DFSAlgorithm.RECURSIVE);
    } else {
      setAlgorithm(DFSAlgorithm.NUM_ISLANDS);
    }
  };

  // 处理算法改变
  const handleAlgorithmChange = (value: DFSAlgorithm) => {
    setAlgorithm(value);
    resetAlgorithm();
  };

  // 处理图形输入
  const handleGraphInput = (value: string) => {
    try {
      const parsedGraph = JSON.parse(value);
      setGraph(parsedGraph);
      resetAlgorithm();
    } catch (error) {
      message.error('图形输入格式不正确，请使用有效的JSON格式');
    }
  };

  // 处理网格输入
  const handleGridInput = (value: string) => {
    try {
      const parsedGrid = JSON.parse(value);
      if (Array.isArray(parsedGrid) && parsedGrid.every(row => Array.isArray(row))) {
        setGrid(parsedGrid);
        setGridRows(parsedGrid.length);
        setGridCols(parsedGrid[0].length);
        resetAlgorithm();
      } else {
        throw new Error('网格格式不正确');
      }
    } catch (error) {
      message.error('网格输入格式不正确，请使用有效的二维数组JSON格式');
    }
  };

  // 处理网格大小改变
  const handleGridSizeChange = (rows: number, cols: number) => {
    setGridRows(rows);
    setGridCols(cols);

    // 创建新的网格
    const newGrid = Array(rows).fill(0).map(() => Array(cols).fill('0'));
    setGrid(newGrid);
    resetAlgorithm();
  };

  // 处理单元格点击
  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === '1' ? '0' : '1';
    setGrid(newGrid);
    resetAlgorithm();
  };

  // 生成随机岛屿
  const generateRandomIslands = () => {
    const newGrid = Array(gridRows).fill(0).map(() =>
      Array(gridCols).fill(0).map(() =>
        Math.random() > 0.7 ? '1' : '0'
      )
    );
    setGrid(newGrid);
    resetAlgorithm();
  };

  // 渲染操作区域内容
  const renderOperationsContent = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form layout="vertical">
        <Form.Item label="算法模式">
          <Select value={mode} onChange={handleModeChange} style={{ width: '100%' }}>
            <Option value={DFSMode.GRAPH}>图遍历</Option>
            <Option value={DFSMode.GRID}>网格问题</Option>
          </Select>
        </Form.Item>

        <Form.Item label="算法类型">
          <Select value={algorithm} onChange={handleAlgorithmChange} style={{ width: '100%' }}>
            {mode === DFSMode.GRAPH ? (
              <>
                <Option value={DFSAlgorithm.RECURSIVE}>递归 DFS</Option>
                <Option value={DFSAlgorithm.ITERATIVE}>迭代 DFS</Option>
                <Option value={DFSAlgorithm.FIND_PATHS}>查找路径</Option>
              </>
            ) : (
              <Option value={DFSAlgorithm.NUM_ISLANDS}>岛屿数量</Option>
            )}
          </Select>
        </Form.Item>

        {mode === DFSMode.GRAPH && (
          <>
            <Form.Item label="图数据 (JSON 格式)">
              <Input.TextArea
                rows={4}
                value={JSON.stringify(graph, null, 2)}
                onChange={(e) => handleGraphInput(e.target.value)}
              />
            </Form.Item>

            <Space>
              <Form.Item label="起始节点">
                <Input
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  style={{ width: 100 }}
                />
              </Form.Item>

              {algorithm === DFSAlgorithm.FIND_PATHS && (
                <Form.Item label="目标节点">
                  <Input
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    style={{ width: 100 }}
                  />
                </Form.Item>
              )}
            </Space>
          </>
        )}

        {mode === DFSMode.GRID && (
          <>
            <Space>
              <Form.Item label="行数">
                <InputNumber
                  min={1}
                  max={10}
                  value={gridRows}
                  onChange={(value) => handleGridSizeChange(value || 4, gridCols)}
                />
              </Form.Item>

              <Form.Item label="列数">
                <InputNumber
                  min={1}
                  max={10}
                  value={gridCols}
                  onChange={(value) => handleGridSizeChange(gridRows, value || 5)}
                />
              </Form.Item>
            </Space>

            <Form.Item>
              <Button onClick={generateRandomIslands}>生成随机岛屿</Button>
            </Form.Item>

            <Form.Item label="单击单元格切换陆地/水域">
              <Switch
                checkedChildren="启用"
                unCheckedChildren="禁用"
                defaultChecked
              />
            </Form.Item>
          </>
        )}

        <Divider />

        <Form.Item>
          <Button type="primary" onClick={executeAlgorithm} block>
            运行算法
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <AlgorithmControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={totalSteps}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onSpeedChange={handleSpeedChange}
        onStepChange={handleStepChange}
      />

      <Divider />

      <ExecutionHistory operations={operations} limit={10} />
    </Space>
  );

  // 渲染可视化区域内容
  const renderVisualizationContent = () => {
    if (mode === DFSMode.GRAPH) {
      return (
        <GraphVisualizer
          graph={graph}
          visitedNodes={visitedNodes}
          currentNode={currentNode || undefined}
          path={path}
          stack={stack}
          height={400}
        />
      );
    } else {
      return (
        <GridVisualizer
          grid={grid}
          visited={visitedCells}
          currentCell={currentCell || undefined}
          islandIds={islandGrid}
          cellSize={50}
          onCellClick={handleCellClick}
          showCoordinates={true}
          legend={{
            '未访问': '#a29bfe',
            '当前单元格': '#ff7675',
            '已访问': '#74b9ff',
            '陆地': '#55efc4',
            '水域': '#0984e3'
          }}
        />
      );
    }
  };

  // 渲染代码区域内容
  const renderCodeContent = () => {
    const dfsRecursiveCode = `
function dfsRecursive(graph, node, visited = new Set(), result = []) {
  // 标记当前节点为已访问
  visited.add(node);
  result.push(node);

  // 访问所有未访问的邻居节点
  for (const neighbor of graph[node] || []) {
    if (!visited.has(neighbor)) {
      dfsRecursive(graph, neighbor, visited, result);
    }
  }

  return result;
}`;

    const dfsIterativeCode = `
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];

  while (stack.length > 0) {
    // 从栈顶取出节点
    const node = stack.pop();

    // 如果节点未访问过，则处理它
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);

      // 将所有未访问的邻居节点压入栈中（逆序，确保访问顺序与递归版本一致）
      const neighbors = graph[node] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return result;
}`;

    const findPathsCode = `
function findAllPaths(graph, start, end) {
  const visited = new Set();
  const paths = [];

  // DFS查找路径
  function dfs(node, path) {
    // 将当前节点加入路径和已访问集合
    visited.add(node);
    path.push(node);

    // 如果找到目标节点，则记录路径
    if (node === end) {
      paths.push([...path]);
    } else {
      // 否则继续搜索未访问的邻居节点
      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, path);
        }
      }
    }

    // 回溯：移除当前节点
    visited.delete(node);
    path.pop();
  }

  dfs(start, []);
  return paths;
}`;

    const numIslandsCode = `
function numIslands(grid) {
  if (grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1' && !visited[r][c]) {
        count++;
        dfsIsland(r, c);
      }
    }
  }

  return count;

  // 辅助函数，标记一个岛屿的所有陆地
  function dfsIsland(row, col) {
    // 检查边界和是否是陆地
    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      grid[row][col] === '0' ||
      visited[row][col]
    ) {
      return;
    }

    // 标记为已访问
    visited[row][col] = true;

    // 四个方向：上、右、下、左
    dfsIsland(row - 1, col);
    dfsIsland(row, col + 1);
    dfsIsland(row + 1, col);
    dfsIsland(row, col - 1);
  }
}`;

    let code = '';
    switch (algorithm) {
      case DFSAlgorithm.RECURSIVE:
        code = dfsRecursiveCode;
        break;
      case DFSAlgorithm.ITERATIVE:
        code = dfsIterativeCode;
        break;
      case DFSAlgorithm.FIND_PATHS:
        code = findPathsCode;
        break;
      case DFSAlgorithm.NUM_ISLANDS:
        code = numIslandsCode;
        break;
    }

    return (
      <CodeDisplay
        tsCode={code}
        title={`${algorithm === DFSAlgorithm.RECURSIVE ? '递归DFS' :
          algorithm === DFSAlgorithm.ITERATIVE ? '迭代DFS' :
          algorithm === DFSAlgorithm.FIND_PATHS ? '查找所有路径' :
          '岛屿数量问题'} 代码实现`}
      />
    );
  };

  // 渲染状态信息
  const renderStatusInfo = () => {
    if (mode === DFSMode.GRAPH) {
      return `已访问节点: ${visitedNodes.size} | 当前节点: ${currentNode || 'N/A'} | 路径长度: ${path.length}`;
    } else {
      const islandCount = new Set(islandGrid.flat().filter(id => id > 0)).size;
      return `岛屿数量: ${islandCount} | 已访问单元格: ${visitedCells.flat().filter(Boolean).length} | 当前单元格: ${currentCell ? `(${currentCell[0]}, ${currentCell[1]})` : 'N/A'}`;
    }
  };

  // 渲染额外内容
  const renderExtraContent = () => {
    return (
      <div>
        <h3>深度优先搜索 (DFS) 算法详解</h3>
        <p>
          深度优先搜索是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入地探索，
          直到无法继续前进时回溯到上一个分叉点，然后继续探索其他路径。
        </p>

        <h4>算法特点</h4>
        <ul>
          <li>使用栈（递归或显式）作为辅助数据结构</li>
          <li>空间复杂度为 O(h)，其中 h 是图的深度</li>
          <li>适用于连通性检测、路径存在性判断、拓扑排序等问题</li>
        </ul>

        <h4>应用场景</h4>
        <ul>
          <li>拓扑排序</li>
          <li>连通分量识别</li>
          <li>路径查找</li>
          <li>迷宫生成与求解</li>
          <li>岛屿计数问题</li>
        </ul>

        <h4>算法复杂度</h4>
        <p>
          时间复杂度: O(V + E)，其中 V 是顶点数，E 是边数<br />
          空间复杂度: O(V)，用于存储访问状态和递归栈
        </p>
      </div>
    );
  };

  return (
    <SearchVisualizerBase
      title="深度优先搜索 (DFS) 可视化"
      description="深度优先搜索是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入地探索，直到无法继续前进时回溯到上一个分叉点，然后继续探索其他路径。"
      operationsContent={renderOperationsContent()}
      visualizationContent={renderVisualizationContent()}
      statusInfo={renderStatusInfo()}
      codeContent={renderCodeContent()}
      extraContent={renderExtraContent()}
      showExtra={true}
    />
  );
};

export default React.memo(DFSVisualizer);
