import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Image } from 'antd';
import FeatureMenu from '../layouts/FeatureMenu';
import UserPanel from '../components/UserPanel';
import HotRecommendations from '../components/HotRecommendations';
import SearchBar from '../components/SearchBar';
import logo from '@/assets/react.svg';
import React from 'react';
import styles from './MainLayout.module.less';
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(true);

  return (
    <Layout style={{  }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(16, 15, 15, 0.06)'
      }}>
        <div className="logo" style={{ width: 120, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Image preview={false} src={logo} alt="logo" style={{
            // position: 'absolute',
            // left: 16,
            // top: 16,
            width: 32, height: 32
          }} />
        </div>
        <SearchBar />
        <UserPanel />
      </Header>
      <Layout>
        <Sider
          width={160}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#fff' }}
        >
          <FeatureMenu />
        </Sider>
        <Content className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </Content>
        <Sider
          width={280} style={{ background: '#fff' }}
          collapsed={collapsedRight}
          onCollapse={setCollapsedRight}
        >
          <HotRecommendations collapsed={collapsedRight} onCollapse={setCollapsedRight} />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default React.memo(MainLayout);