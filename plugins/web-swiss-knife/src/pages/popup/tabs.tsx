import { ItemType, MenuItemType } from "antd/es/menu/interface"

import { SecurityScanOutlined, DatabaseOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';

export enum TabKey {
  security = 'security',
  cache = 'cache',
  performance = 'performance',
  settings = 'settings'
}

export const tabItems = [
  { key: TabKey.security, label: '安全检测' },
  { key: TabKey.cache, label: '缓存可视化' },
  { key: TabKey.performance, label: '性能监控' },
  { key: TabKey.settings, label: '设置' }
]

export const menuItems: ItemType<MenuItemType>[] = [
  {
    key: 'security',
    icon: <SecurityScanOutlined />,
    label: '安全检测'
  },
  {
    key: 'cache',
    icon: <DatabaseOutlined />,
    label: '缓存可视化'
  },
  {
    key: 'performance',
    icon: <DashboardOutlined />,
    label: '性能监控'
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置'
  }
]