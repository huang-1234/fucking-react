import React, { useCallback } from 'react';
import { Card, Switch, Select, Divider, Typography, Tooltip, Button, message } from 'antd';
import {
  EyeOutlined,
  SafetyOutlined,
  TableOutlined,
  FunctionOutlined,
  LinkOutlined,
  VerticalAlignMiddleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { MarkdownConfig } from '../types/markdown';
import styles from './ControlPanel.module.less';

const { Title, Text } = Typography;
const { Option } = Select;

interface ControlPanelProps {
  config: MarkdownConfig;
  onChange: (config: MarkdownConfig) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange }) => {
  // 使用useCallback优化配置更改处理函数
  const handleConfigChange = useCallback(<K extends keyof MarkdownConfig>(key: K, value: MarkdownConfig[K]) => {
    // 创建新的配置对象
    const newConfig = {
      ...config,
      [key]: value
    };

    // 调用onChange回调
    onChange(newConfig);

    // 显示反馈提示
    message.success(`已${value ? '启用' : '禁用'} ${getSettingName(key)}`);
  }, [config, onChange]);

  // 获取设置项的中文名称
  const getSettingName = (key: keyof MarkdownConfig): string => {
    const nameMap: Record<keyof MarkdownConfig, string> = {
      theme: '主题',
      enableCache: '缓存',
      enableVirtualScroll: '虚拟滚动',
      enableToc: '目录导航',
      enableMath: '数学公式',
      enableGfm: 'GFM扩展',
      enableSanitize: '安全过滤',
      linkTarget: '链接目标'
    };
    return nameMap[key] || String(key);
  };

  // 应用所有设置
  const handleApplySettings = useCallback(() => {
    onChange({...config});
    message.success('已应用所有设置');
  }, [config, onChange]);

  return (
    <Card className={styles.controlPanel} bordered={true}>
      <Title level={4}>MD控制面板</Title>

      <Divider orientation="left">外观设置</Divider>
      <div className={styles.controlSection}>
        <div className={styles.controlItem}>
          <Tooltip title="切换浅色/深色/护眼主题">
            <div className={styles.controlLabel}>
              <EyeOutlined className={styles.controlIcon} />
              <Text>主题</Text>
            </div>
          </Tooltip>
          <Select
            value={config.theme}
            style={{ width: 120 }}
            onChange={(value) => {
              handleConfigChange('theme', value);
              message.success(`已切换至${value === 'light' ? '浅色' : value === 'dark' ? '深色' : '护眼'}主题`);
            }}
          >
            <Option value="light">浅色</Option>
            <Option value="dark">深色</Option>
            <Option value="sepia">护眼</Option>
          </Select>
        </div>
      </div>

      <Divider orientation="left">功能开关</Divider>
      <div className={styles.controlSection}>
        <div className={styles.controlItem}>
          <Tooltip title="启用缓存以提高性能">
            <div className={styles.controlLabel}>
              <DatabaseOutlined className={styles.controlIcon} />
              <Text>启用缓存</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableCache}
            onChange={(checked) => handleConfigChange('enableCache', checked)}
            onClick={(checked, event) => {
              // 阻止事件冒泡，确保事件不会被父元素捕获
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="启用虚拟滚动以处理大型文档">
            <div className={styles.controlLabel}>
              <VerticalAlignMiddleOutlined className={styles.controlIcon} />
              <Text>虚拟滚动</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableVirtualScroll}
            onChange={(checked) => handleConfigChange('enableVirtualScroll', checked)}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="显示文档目录">
            <div className={styles.controlLabel}>
              <TableOutlined className={styles.controlIcon} />
              <Text>目录导航</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableToc}
            onChange={(checked) => handleConfigChange('enableToc', checked)}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="启用数学公式渲染">
            <div className={styles.controlLabel}>
              <FunctionOutlined className={styles.controlIcon} />
              <Text>数学公式</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableMath}
            onChange={(checked) => handleConfigChange('enableMath', checked)}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="启用GitHub风格Markdown扩展">
            <div className={styles.controlLabel}>
              <TableOutlined className={styles.controlIcon} />
              <Text>GFM扩展</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableGfm}
            onChange={(checked) => handleConfigChange('enableGfm', checked)}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="启用XSS防护">
            <div className={styles.controlLabel}>
              <SafetyOutlined className={styles.controlIcon} />
              <Text>安全过滤</Text>
            </div>
          </Tooltip>
          <Switch
            checked={config.enableSanitize}
            onChange={(checked) => handleConfigChange('enableSanitize', checked)}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
          />
        </div>

        <div className={styles.controlItem}>
          <Tooltip title="设置链接打开方式">
            <div className={styles.controlLabel}>
              <LinkOutlined className={styles.controlIcon} />
              <Text>链接目标</Text>
            </div>
          </Tooltip>
          <Select
            value={config.linkTarget}
            style={{ width: 120 }}
            onChange={(value) => {
              handleConfigChange('linkTarget', value);
              message.success(`已设置链接在${value === '_blank' ? '新窗口' : '当前窗口'}打开`);
            }}
          >
            <Option value="_blank">新窗口</Option>
            <Option value="_self">当前窗口</Option>
          </Select>
        </div>
      </div>

      <Divider />
      <div className={styles.actionButton}>
        <Button type="primary" onClick={handleApplySettings}>
          应用设置
        </Button>
      </div>
    </Card>
  );
};

// 使用React.memo优化渲染性能
export default React.memo(ControlPanel);