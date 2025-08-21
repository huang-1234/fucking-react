import React from 'react';
import { Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useField } from '@formily/react';
import { type ArrayField } from '@formily/core';

interface KeyValueListProps {
  keyTitle?: string;
  valueTitle?: string;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({
  keyTitle = '键',
  valueTitle = '值',
}) => {
  const field = useField<ArrayField>();

  // 获取当前对象值
  const objectValue = field.value || {};

  // 转换对象为键值对数组
  const keyValuePairs = Object.entries(objectValue);

  // 添加新的键值对
  const addKeyValuePair = () => {
    const newKey = `key${Object.keys(objectValue).length + 1}`;
    field.setValue({
      ...objectValue,
      [newKey]: '',
    });
  };

  // 更新键
  const updateKey = (oldKey: string, newKey: string, value: string) => {
    if (oldKey === newKey) return;

    const newObjectValue = { ...objectValue };
    delete newObjectValue[oldKey as keyof typeof newObjectValue];
    newObjectValue[newKey as keyof typeof newObjectValue] = value;

    field.setValue(newObjectValue);
  };

  // 更新值
  const updateValue = (key: string, value: string) => {
    field.setValue({
      ...objectValue,
      [key]: value,
    });
  };

  // 删除键值对
  const removeKeyValuePair = (key: string) => {
    const newObjectValue = { ...objectValue };
    delete newObjectValue[key as keyof typeof newObjectValue];
    field.setValue(newObjectValue);
  };

  return (
    <div className="key-value-list">
      <div className="key-value-header">
        <div className="key-title">{keyTitle}</div>
        <div className="value-title">{valueTitle}</div>
        <div className="action-title">操作</div>
      </div>

      {keyValuePairs.map(([key, value]) => (
        <div key={key} className="key-value-item">
          <Space className="key-value-content">
            <Input
              value={key}
              onChange={(e) => updateKey(key, e.target.value, value as string)}
              placeholder={keyTitle}
            />
            <Input
              value={value as string}
              onChange={(e) => updateValue(key, e.target.value)}
              placeholder={valueTitle}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeKeyValuePair(key)}
              danger
            />
          </Space>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={addKeyValuePair}
        block
        icon={<PlusOutlined />}
      >
        添加{keyTitle}
      </Button>
    </div>
  );
};