import React, { useState } from 'react';
import { Card, Switch, Select, Divider, Typography, Tooltip, Button } from 'antd';
import {
  EyeOutlined,
  SafetyOutlined,
  TableOutlined,
  FunctionOutlined,
  LinkOutlined,
  VerticalAlignMiddleOutlined,
  DatabaseOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import type { MarkdownConfig } from '../types/markdown';
import styles from './ControlPanel.module.less';

const { Title, Text } = Typography;
const { Option } = Select;

interface ControlPanelProps {
  config: MarkdownConfig;
  onChange: (config: MarkdownConfig) => void;
  defaultExpanded?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [hovering, setHovering] = useState<boolean>(false);

  const handleConfigChange = <K extends keyof MarkdownConfig>(key: K, value: MarkdownConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className={`${styles.controlPanelWrapper} ${expanded ? styles.expanded : styles.collapsed}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* 收起/展开按钮 */}
      <div className={`${styles.toggleButton} ${hovering && !expanded ? styles.showToggle : ''}`}>
        <Tooltip title={expanded ? "收起设置面板" : "展开设置面板"} placement="left">
          <Button
            type="text"
            icon={expanded ? <RightOutlined /> : <SettingOutlined />}
            onClick={toggleExpanded}
            className={styles.iconButton}
          />
        </Tooltip>
      </div>

      {/* 控制面板内容 */}
      <div className={styles.controlPanelContent}>
        <Card className={styles.controlPanel} bordered={true}>
          <div className={styles.panelHeader}>
            <Title level={4}>MD控制面板</Title>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={toggleExpanded}
              className={styles.collapseButton}
            />
          </div>

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
                onChange={(value) => handleConfigChange('theme', value)}
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
                onChange={(value) => handleConfigChange('linkTarget', value)}
              >
                <Option value="_blank">新窗口</Option>
                <Option value="_self">当前窗口</Option>
              </Select>
            </div>
          </div>

          <Divider />
          <div className={styles.actionButton}>
            <Button type="primary" onClick={() => onChange({...config})}>
              应用设置
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(ControlPanel);