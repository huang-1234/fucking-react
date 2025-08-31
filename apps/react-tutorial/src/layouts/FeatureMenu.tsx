import React, { useState } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuItems } from './RouterMenu';

const FeatureMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rootPath = location.pathname.split('/')[1];

  const [currentMenuPath, setCurrentMenuPath] = useState(rootPath);

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
    setCurrentMenuPath(e.key);
    // console.log('FeatureMenu: click', e.key);
  };

  // console.log('FeatureMenu:outer',location.pathname, 'currentMenuPath', currentMenuPath, 'rootPath', rootPath);

  return (
    <Menu
      mode="inline"
      selectedKeys={[currentMenuPath]}
      selectable={location.pathname.includes(currentMenuPath)}
      items={menuItems?.map(item => {
        if (item.children) {
          return {
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children?.map(child => ({
              key: `${item.key}${child.key}`,
              icon: child.icon,
              label: child.label,
            })),
          }
        }
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
        }
      })}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default React.memo(FeatureMenu);