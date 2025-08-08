import React, { useState } from 'react';
import { Input, AutoComplete, Space, Tag } from 'antd';
import { SearchOutlined, HistoryOutlined, FireOutlined } from '@ant-design/icons';

const { Option } = AutoComplete;

/**
 * 搜索栏组件
 * 提供搜索功能和自动完成建议
 */
const SearchBar: React.FC = () => {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<{ value: string; category: string }[]>([]);

  // 热门搜索关键词
  const hotSearches = [
    'React Hooks',
    'React 19',
    'useFormState',
    'React Compiler',
    'Suspense SSR'
  ];

  // 搜索历史
  const searchHistory = [
    'React 15 PropTypes',
    'Error Boundaries',
    'useTransition'
  ];

  // 处理搜索输入变化
  const handleSearch = (searchText: string) => {
    setValue(searchText);

    // 根据输入生成建议选项
    if (!searchText) {
      // 如果搜索框为空，显示热门搜索和历史记录
      const historyOptions = searchHistory.map(item => ({
        value: item,
        category: 'history'
      }));

      const hotOptions = hotSearches.map(item => ({
        value: item,
        category: 'hot'
      }));

      setOptions([...historyOptions, ...hotOptions]);
    } else {
      // 根据输入过滤选项
      const filtered = [
        ...searchHistory.filter(item => item.toLowerCase().includes(searchText.toLowerCase())).map(item => ({
          value: item,
          category: 'history'
        })),
        ...hotSearches.filter(item => item.toLowerCase().includes(searchText.toLowerCase())).map(item => ({
          value: item,
          category: 'hot'
        }))
      ];

      setOptions(filtered);
    }
  };

  // 处理选择建议
  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue);
    // 这里可以添加搜索跳转逻辑
    console.log('搜索:', selectedValue);
  };

  // 处理搜索提交
  const handleSubmit = () => {
    if (value) {
      console.log('提交搜索:', value);
      // 这里可以添加搜索跳转逻辑
    }
  };

  // 渲染自动完成选项
  const renderOption = (item: { value: string; category: string }) => {
    const icon = item.category === 'history' ? <HistoryOutlined /> : <FireOutlined style={{ color: '#ff4d4f' }} />;
    const label = item.category === 'history' ? '历史' : '热门';
    const color = item.category === 'history' ? 'default' : 'red';

    return (
      <Option key={item.value} value={item.value}>
        <Space>
          {icon}
          <span>{item.value}</span>
          <Tag color={color} style={{ marginLeft: 'auto' }}>{label}</Tag>
        </Space>
      </Option>
    );
  };

  return (
    <div className="search-bar" style={{ width: 300 }}>
      <AutoComplete
        value={value}
        options={options}
        style={{ width: '100%' }}
        onSearch={handleSearch}
        onSelect={handleSelect}
        placeholder="搜索API、教程、示例..."
        notFoundContent="没有找到相关内容"
      >
        <Input
          suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={handleSubmit} />}
          onPressEnter={handleSubmit}
        />
      </AutoComplete>
    </div>
  );
};

export default SearchBar;