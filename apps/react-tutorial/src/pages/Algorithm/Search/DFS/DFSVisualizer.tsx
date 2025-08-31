import React, { useEffect, useCallback } from 'react';
import { Form, Input, Button, Select, Space, Divider, Switch, message, InputNumber } from 'antd';
import { type Graph, dfsRecursive, dfsIterative, numIslands, findAllPaths } from '../al/dfs/dfs_ts';
import SearchVisualizerBase from '../components/SearchVisualizerBase';
import GraphVisualizer from '../components/GraphVisualizer';
import GridVisualizer from '../components/GridVisualizer';
import AlgorithmControls from '../components/AlgorithmControls';
import ExecutionHistory from '../components/ExecutionHistory';
import CodeDisplay from '../components/CodeDisplay';
import { observer } from '@formily/reactive-react'
import { makeQueueDeque, DFSMode, DFSAlgorithm, OperationType, type Operation } from '../../model/search_dfs';
const { Option } = Select;

export const DFSVisualizer: React.FC = observer(() => {
  // 使用响应式对象管理状态
  const {
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
    cleanup
  } = makeQueueDeque({
    dfsRecursive,
    dfsIterative,
    numIslands,
    findAllPaths,
  });

  // 组件卸载时清理资源
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 初始化网格
  useEffect(() => {
    if (queueDeque.mode === DFSMode.GRID) {
      queueDeque.islandGrid = Array(queueDeque.gridRows).fill(0).map(() => Array(queueDeque.gridCols).fill(0));
      queueDeque.visitedCells = Array(queueDeque.gridRows).fill(false).map(() => Array(queueDeque.gridCols).fill(false));
    }
  }, [queueDeque.gridRows, queueDeque.gridCols, queueDeque.mode]);


  // 当播放状态或当前步骤改变时，控制动画
  useEffect(() => {
    // 只在播放状态为true时创建定时器
    if (queueDeque.isPlaying && queueDeque.isMounted) {
      playAnimation();
    }
    // 如果停止播放，清除定时器
    else if (!queueDeque.isPlaying && queueDeque.animationTimer) {
      clearTimeout(queueDeque.animationTimer);
      queueDeque.animationTimer = null;
    }

    // 清理函数
    return () => {
      if (queueDeque.animationTimer) {
        clearTimeout(queueDeque.animationTimer);
      }
    };
  }, [queueDeque.isPlaying, queueDeque.currentStep, playAnimation]);

  // 处理图形输入的包装函数
  const handleGraphInputWrapper = (value: string) => {
    const result = handleGraphInput(value);
    if (!result.success) {
      message.error(result.error);
    }
  };

  // 处理网格输入的包装函数
  const handleGridInputWrapper = (value: string) => {
    const result = handleGridInput(value);
    if (!result.success) {
      message.error(result.error);
    }
  };

  // 渲染操作区域内容
  const renderOperationsContent = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form layout="vertical">
        <Form.Item label="算法模式">
          <Select value={queueDeque.mode} onChange={handleModeChange} style={{ width: '100%' }}>
            <Option value={DFSMode.GRAPH}>图遍历</Option>
            <Option value={DFSMode.GRID}>网格问题</Option>
          </Select>
        </Form.Item>

        <Form.Item label="算法类型">
          <Select value={queueDeque.algorithm} onChange={handleAlgorithmChange} style={{ width: '100%' }}>
            {queueDeque.mode === DFSMode.GRAPH ? (
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

        {queueDeque.mode === DFSMode.GRAPH && (
          <>
            <Form.Item label="图数据 (JSON 格式)">
              <Input.TextArea
                rows={4}
                value={JSON.stringify(queueDeque.graph, null, 2)}
                onChange={(e) => handleGraphInputWrapper(e.target.value)}
              />
            </Form.Item>

            <Space>
              <Form.Item label="起始节点">
                <Input
                  value={queueDeque.startNode}
                  onChange={(e) => { queueDeque.startNode = e.target.value; }}
                  style={{ width: 100 }}
                />
              </Form.Item>

              {queueDeque.algorithm === DFSAlgorithm.FIND_PATHS && (
                <Form.Item label="目标节点">
                  <Input
                    value={queueDeque.endNode}
                    onChange={(e) => { queueDeque.endNode = e.target.value; }}
                    style={{ width: 100 }}
                  />
                </Form.Item>
              )}
            </Space>
          </>
        )}

        {queueDeque.mode === DFSMode.GRID && (
          <>
            <Space>
              <Form.Item label="行数">
                <InputNumber
                  min={1}
                  max={10}
                  value={queueDeque.gridRows}
                  onChange={(value) => handleGridSizeChange(value || 4, queueDeque.gridCols)}
                />
              </Form.Item>

              <Form.Item label="列数">
                <InputNumber
                  min={1}
                  max={10}
                  value={queueDeque.gridCols}
                  onChange={(value) => handleGridSizeChange(queueDeque.gridRows, value || 5)}
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
        isPlaying={queueDeque.isPlaying}
        currentStep={queueDeque.currentStep}
        totalSteps={queueDeque.totalSteps}
        speed={queueDeque.speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onSpeedChange={handleSpeedChange}
        onStepChange={handleStepChange}
      />

      <Divider />

      <ExecutionHistory operations={queueDeque.operations.slice(-10)} limit={10} />
    </Space>
  );

  // 渲染可视化区域内容
  const renderVisualizationContent = () => {
    if (queueDeque.mode === DFSMode.GRAPH) {
      return (
        <GraphVisualizer
          graph={queueDeque.graph}
          visitedNodes={queueDeque.visitedNodes}
          currentNode={queueDeque.currentNode || undefined}
          path={queueDeque.path}
          stack={queueDeque.stack}
          height={400}
        />
      );
    } else {
      return (
        <GridVisualizer
          grid={queueDeque.grid}
          visited={queueDeque.visitedCells}
          currentCell={queueDeque.currentCell || undefined}
          islandIds={queueDeque.islandGrid}
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
    switch (queueDeque.algorithm) {
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
        title={`${queueDeque.algorithm === DFSAlgorithm.RECURSIVE ? '递归DFS' :
          queueDeque.algorithm === DFSAlgorithm.ITERATIVE ? '迭代DFS' :
          queueDeque.algorithm === DFSAlgorithm.FIND_PATHS ? '查找所有路径' :
          '岛屿数量问题'} 代码实现`}
      />
    );
  };

  // 渲染状态信息
  const renderStatusInfo = () => {
    if (queueDeque.mode === DFSMode.GRAPH) {
      return `已访问节点: ${queueDeque.visitedNodes.size} | 当前节点: ${queueDeque.currentNode || 'N/A'} | 路径长度: ${queueDeque.path.length}`;
    } else {
      const islandCount = new Set(queueDeque.islandGrid.flat().filter(id => id > 0)).size;
      return `岛屿数量: ${islandCount} | 已访问单元格: ${queueDeque.visitedCells.flat().filter(Boolean).length} | 当前单元格: ${queueDeque.currentCell ? `(${queueDeque.currentCell[0]}, ${queueDeque.currentCell[1]})` : 'N/A'}`;
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
})

export default React.memo(DFSVisualizer);