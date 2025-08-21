import { message } from 'antd';
import { simulateWebpackBuild } from '../utils/sandbox';

/**
 * Webpack构建结果类型定义
 */
export interface WebpackBuildResult {
  success: boolean;
  stats?: {
    time: number;
    assets: Array<{ name: string; size: number }>;
    errors: string[];
    warnings: string[];
  };
  error?: string;
}

/**
 * 执行Webpack构建
 * @param config Webpack配置对象
 * @returns 构建结果
 */
export const runWebpackBuild = async (config: any): Promise<WebpackBuildResult> => {
  try {
    // 在实际应用中，这里应该调用后端API或使用Web Worker
    // 这里使用模拟函数
    const result = await simulateWebpackBuild(config);
    return result as WebpackBuildResult;
  } catch (error) {
    console.error('Webpack构建失败', error);
    message.error('Webpack构建失败');
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * 获取Webpack构建统计数据
 * @param configPath 配置文件路径（可选）
 * @returns 统计数据
 */
export const getWebpackStats = async (configPath?: string): Promise<any> => {
  try {
    // 模拟API调用，获取stats.json数据
    // 在实际应用中，这里应该从后端获取数据
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
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
        });
      }, 1000);
    });
  } catch (error) {
    console.error('获取Webpack统计数据失败', error);
    message.error('获取Webpack统计数据失败');
    throw error;
  }
};

/**
 * 分析Webpack构建结果
 * @param stats 构建统计数据
 * @returns 分析结果
 */
export const analyzeWebpackBuild = (stats: any) => {
  if (!stats || !stats.assets) {
    return {
      totalSize: 0,
      assetsSummary: [],
      performance: 'unknown'
    };
  }

  // 计算总大小
  const totalSize = stats.assets.reduce((sum: number, asset: any) => sum + asset.size, 0);

  // 资产摘要
  const assetsSummary = stats.assets.map((asset: any) => ({
    name: asset.name,
    size: asset.size,
    percentage: (asset.size / totalSize) * 100
  }));

  // 性能评估
  let performance = 'excellent';
  if (totalSize > 5 * 1024 * 1024) {
    performance = 'poor';
  } else if (totalSize > 2 * 1024 * 1024) {
    performance = 'average';
  } else if (totalSize > 1 * 1024 * 1024) {
    performance = 'good';
  }

  return {
    totalSize,
    assetsSummary,
    performance,
    buildTime: stats.time || 0
  };
};
