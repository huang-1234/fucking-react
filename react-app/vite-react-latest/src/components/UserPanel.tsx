import React, { useState } from 'react';
import { Avatar, Dropdown, Space, Badge, Button } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

/**
 * 用户面板组件
 * 显示用户头像、通知和下拉菜单
 */
const UserPanel: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(5);

  // 模拟清除通知
  const clearNotifications = () => {
    setNotificationCount(0);
  };

  // 下拉菜单项
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '个人中心',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: '设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <div className="user-panel" style={{ display: 'flex', alignItems: 'center' }}>
      <Space size="large">
        {/* 通知图标 */}
        <Badge count={notificationCount} overflowCount={99} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '20px' }} />}
            onClick={clearNotifications}
          />
        </Badge>

        {/* 用户头像和下拉菜单 */}
        <Dropdown menu={{ items }} trigger={['click']}>
          <a onClick={e => e.preventDefault()} style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>用户名</span>
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </Space>
    </div>
  );
};

export default UserPanel;