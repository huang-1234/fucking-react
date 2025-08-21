import React from 'react';
import { connect, mapProps } from '@formily/react';
import MonacoEditor from '@monaco-editor/react';

interface MonacoInputProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: number;
  options?: any;
}

const InternalMonacoInput: React.FC<MonacoInputProps> = ({
  value = '{}',
  onChange,
  language = 'json',
  height = 200,
  options = {},
}) => {
  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value || '{}');
    }
  };

  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        ...options,
      }}
    />
  );
};

// 连接到Formily
export const MonacoInput = connect(
  InternalMonacoInput,
  mapProps((props) => {
    // 将字符串值转换为JSON对象
    let parsedValue = props.value;
    if (typeof props.value === 'object') {
      try {
        parsedValue = JSON.stringify(props.value, null, 2);
      } catch (e) {
        parsedValue = '{}';
      }
    }

    return {
      ...props,
      value: parsedValue,
      onChange: (value: string) => {
        try {
          // 尝试解析JSON
          const parsedValue = JSON.parse(value);
          props.onChange(parsedValue);
        } catch (e) {
          // 如果解析失败，保留原始字符串
          props.onChange(value);
        }
      },
    };
  })
);
