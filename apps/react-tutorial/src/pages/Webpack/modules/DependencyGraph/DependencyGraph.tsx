import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Slider, Switch, Empty, Spin, Button, Tooltip, Descriptions } from 'antd';
import { FullscreenOutlined, ZoomInOutlined, ZoomOutOutlined, RedoOutlined } from '@ant-design/icons';
import * as d3 from 'd3';
import './DependencyGraph.less';

const { Option } = Select;

interface Module {
  id: string;
  name: string;
  size: number;
  dependencies: string[];
}

interface ModuleNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  size: number;
  dependencies: string[];
  radius: number;
  x?: number;
  y?: number;
}

interface ModuleLink extends d3.SimulationLinkDatum<ModuleNode> {
  source: string | ModuleNode;
  target: string | ModuleNode;
}

interface DependencyGraphProps {
  statsData?: any;
  loading?: boolean;
}

// 模拟数据，实际应用中应从Webpack stats.json获取
const mockStatsData = {
  modules: [
    {
      id: 'src/index.js',
      name: 'src/index.js',
      size: 1024,
      dependencies: ['src/App.js', 'src/utils.js']
    },
    {
      id: 'src/App.js',
      name: 'src/App.js',
      size: 2048,
      dependencies: ['src/components/Header.js', 'src/styles/main.css']
    },
    {
      id: 'src/utils.js',
      name: 'src/utils.js',
      size: 512,
      dependencies: []
    },
    {
      id: 'src/components/Header.js',
      name: 'src/components/Header.js',
      size: 1536,
      dependencies: ['src/styles/header.css']
    },
    {
      id: 'src/styles/main.css',
      name: 'src/styles/main.css',
      size: 768,
      dependencies: []
    },
    {
      id: 'src/styles/header.css',
      name: 'src/styles/header.css',
      size: 384,
      dependencies: []
    }
  ]
};

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  statsData = mockStatsData,
  loading = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [layoutType, setLayoutType] = useState<string>('force');
  const [simulation, setSimulation] = useState<d3.Simulation<ModuleNode, ModuleLink> | null>(null);

  const renderGraph = () => {
    if (!svgRef.current || !statsData || !statsData.modules || loading) return;

    // 清除旧图
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);

    // 创建缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // 创建主容器
    const g = svg.append('g');

    // 准备数据
    const nodes: ModuleNode[] = statsData.modules.map((module: Module) => ({
      ...module,
      radius: Math.sqrt(module.size) / 10 + 5 // 根据模块大小计算半径
    }));

    const links: ModuleLink[] = [];
    statsData.modules.forEach((module: Module) => {
      module.dependencies.forEach(depId => {
        links.push({
          source: module.id,
          target: depId
        });
      });
    });

    // 创建力导向模拟
    const sim = d3.forceSimulation<ModuleNode>(nodes)
      .force('link', d3.forceLink<ModuleNode, ModuleLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as ModuleNode).radius + 5));

    setSimulation(sim);

    // 绘制连线
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // 创建节点组
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, ModuleNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // 绘制节点圆形
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => colorByType(d.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('click', (event, d) => {
        setSelectedModule(d);
        event.stopPropagation();
      });

    // 添加标签
    if (showLabels) {
      node.append('text')
        .attr('dy', d => d.radius + 12)
        .attr('text-anchor', 'middle')
        .text(d => getShortName(d.name))
        .attr('fill', '#333')
        .attr('font-size', '10px');
    }

    // 添加标题提示
    node.append('title')
      .text(d => d.name);

    // 更新模拟
    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as ModuleNode).x!)
        .attr('y1', d => (d.source as ModuleNode).y!)
        .attr('x2', d => (d.target as ModuleNode).x!)
        .attr('y2', d => (d.target as ModuleNode).y!);

      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // 拖拽函数
    function dragstarted(event: d3.D3DragEvent<SVGGElement, ModuleNode, ModuleNode>) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, ModuleNode, ModuleNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, ModuleNode, ModuleNode>) {
      if (!event.active) sim.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // 点击背景取消选择
    svg.on('click', () => {
      setSelectedModule(null);
    });
  };

  // 根据文件类型着色
  const colorByType = (filename: string): string => {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return '#f1c40f';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return '#3498db';
    if (filename.endsWith('.css') || filename.endsWith('.scss') || filename.endsWith('.less')) return '#e74c3c';
    if (filename.endsWith('.html')) return '#2ecc71';
    if (filename.endsWith('.json')) return '#9b59b6';
    if (filename.endsWith('.svg') || filename.endsWith('.png') || filename.endsWith('.jpg')) return '#1abc9c';
    return '#95a5a6';
  };

  // 获取短文件名
  const getShortName = (filename: string): string => {
    const parts = filename.split('/');
    return parts[parts.length - 1];
  };

  // 重新布局
  const resetLayout = () => {
    if (simulation) {
      simulation.alpha(1).restart();
    }
  };

  // 放大
  const zoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleBy(svg, 1.2);
      svg.transition().duration(200).call(zoom as any);
    }
  };

  // 缩小
  const zoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleBy(svg, 1 / 1.2);
      svg.transition().duration(200).call(zoom as any);
    }
  };

  // 全屏
  const toggleFullscreen = () => {
    if (svgRef.current) {
      if (!document.fullscreenElement) {
        svgRef.current.requestFullscreen().catch(err => {
          console.error(`全屏错误: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // 初始渲染和数据变化时重绘图表
  useEffect(() => {
    renderGraph();
  }, [statsData, showLabels, layoutType, loading]);

  return (
    <div className="dependency-graph">
      <h2>模块依赖关系图</h2>
      <Card>
        <div className="graph-container">
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin size="large" tip="加载依赖图..." />
            </div>
          ) : statsData && statsData.modules && statsData.modules.length > 0 ? (
            <svg ref={svgRef} width="100%" height="100%" />
          ) : (
            <Empty description="暂无依赖数据" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
          )}
        </div>

        <div className="graph-controls">
          <Tooltip title="重新布局">
            <Button icon={<RedoOutlined />} onClick={resetLayout} />
          </Tooltip>
          <Tooltip title="放大">
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          </Tooltip>
          <Tooltip title="缩小">
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
          </Tooltip>
          <Tooltip title="全屏">
            <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
          </Tooltip>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>显示标签:</span>
            <Switch checked={showLabels} onChange={setShowLabels} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
            <span style={{ marginRight: 8 }}>布局类型:</span>
            <Select value={layoutType} style={{ width: 120 }} onChange={setLayoutType}>
              <Option value="force">力导向</Option>
              <Option value="radial">放射状</Option>
              <Option value="tree">树形</Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16, flex: 1 }}>
            <span style={{ marginRight: 8 }}>缩放级别:</span>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={zoomLevel}
              onChange={setZoomLevel}
              style={{ width: 200 }}
            />
          </div>
        </div>
      </Card>

      {selectedModule ? (
        <Card title="模块详情" className="node-info">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="模块名称">{selectedModule.name}</Descriptions.Item>
            <Descriptions.Item label="大小">{(selectedModule.size / 1024).toFixed(2)} KB</Descriptions.Item>
            <Descriptions.Item label="依赖数量">{selectedModule.dependencies.length}</Descriptions.Item>
            {selectedModule.dependencies.length > 0 && (
              <Descriptions.Item label="依赖项">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {selectedModule.dependencies.map((dep, index) => (
                    <li key={index}>{dep}</li>
                  ))}
                </ul>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ) : null}
    </div>
  );
};

export default React.memo(DependencyGraph);
