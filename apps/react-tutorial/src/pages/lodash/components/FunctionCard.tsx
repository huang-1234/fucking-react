import React, { useState } from 'react';
import { Card, Button, Tooltip, Typography, Divider, Space } from 'antd';
import { CodeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Highlight from 'react-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { Check, CopyCheckIcon ,CopyIcon } from 'lucide-react';
import { WlIcon } from '@/components/Icon/lucide';
const { Text, Paragraph } = Typography;

interface FunctionCardProps {
  name: string;
  signature: string;
  description: string;
  code: string;
  result: any;
  showResult?: boolean;
  interactive?: boolean;
  onRun?: () => void;
}

const FunctionCard: React.FC<FunctionCardProps> = ({
  name,
  signature,
  description,
  code,
  result,
  showResult = true,
  interactive = false,
  onRun
}) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCode = () => {
    setShowCode(!showCode);
  };

  const formatResult = (res: any) => {
    if (res === undefined) return 'undefined';
    if (res === null) return 'null';
    if (typeof res === 'string') return `"${res}"`;
    if (typeof res === 'object') {
      try {
        return JSON.stringify(res, null, 2);
      } catch (e) {
        return String(res);
      }
    }
    return String(res);
  };

  return (
    <Card
      className="function-card"
      title={name}
      extra={
        <Space>
          <Tooltip title={showCode ? "隐藏代码" : "显示代码"}>
            <Button
              type="text"
              icon={<CodeOutlined />}
              onClick={toggleCode}
            />
          </Tooltip>
          <Tooltip title={copied ? "已复制" : "复制代码"}>
            <Button
              type="text"
              icon={copied ? <WlIcon Icon={Check} /> : <WlIcon Icon={CopyIcon} />}
              onClick={handleCopyCode}
            />
          </Tooltip>
          {interactive && onRun && (
            <Tooltip title="运行代码">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={onRun}
              />
            </Tooltip>
          )}
        </Space>
      }
    >
      <div className="function-signature">{signature}</div>
      <Paragraph className="function-description">{description}</Paragraph>

      {showCode && (
        <div className="code-block">
          <Highlight className="javascript">
            {code}
          </Highlight>
        </div>
      )}

      {showResult && (
        <div className="result-block">
          <div className="result-title">执行结果:</div>
          <div className="result-content">{formatResult(result)}</div>
        </div>
      )}
    </Card>
  );
};

export default FunctionCard;
