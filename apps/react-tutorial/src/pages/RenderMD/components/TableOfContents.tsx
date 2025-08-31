import React, { useEffect, useState } from 'react';
import { Typography, Affix, Button, Tooltip, Card, Divider } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import type { Heading } from '../types/markdown';
import styles from './TableOfContents.module.less';

const { Title } = Typography;

interface TableOfContentsProps {
  headings: Heading[];
  scrollContainer?: HTMLElement | Window;
  affixed?: boolean;
  defaultExpanded?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  scrollContainer = window,
  affixed = true,
  defaultExpanded = false
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [hovering, setHovering] = useState<boolean>(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      // 获取所有标题元素
      const headingElements = headings
        .map(heading => document.getElementById(heading.id))
        .filter(Boolean) as HTMLElement[];

      if (!headingElements.length) return;

      // 找到当前视口中最靠上的标题
      const scrollY = window.scrollY;

      // 为了更好的用户体验，我们给每个标题一个偏移量，确保标题进入视口一定距离才激活
      const offset = 100;

      // 找到第一个在视口内的标题
      let currentHeading: HTMLElement | null = null;

      for (const heading of headingElements) {
        if (heading.offsetTop - offset > scrollY) {
          break;
        }
        currentHeading = heading;
      }

      if (currentHeading) {
        setActiveId(currentHeading.id);
      } else if (headingElements.length > 0 && scrollY <= headingElements[0].offsetTop) {
        // 如果滚动位置在第一个标题之前，激活第一个标题
        setActiveId(headingElements[0].id);
      }
    };

    // 初始化时执行一次
    handleScroll();

    // 添加滚动事件监听
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [headings, scrollContainer]);

  if (!headings.length) {
    return null;
  }

  const tocContent = (
    <div
      className={`${styles.tocWrapper} ${expanded ? styles.expanded : styles.collapsed}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* 收起/展开按钮 */}
      <div className={`${styles.toggleButton} ${hovering && !expanded ? styles.showToggle : ''}`}>
        <Tooltip title={expanded ? "收起目录" : "展开目录"} placement="right">
          <Button
            type="text"
            icon={expanded ? <MenuFoldOutlined /> : <UnorderedListOutlined />}
            onClick={toggleExpanded}
            className={styles.iconButton}
          />
        </Tooltip>
      </div>

      {/* 目录内容 */}
      <div className={styles.tocContainer}>
        <Card className={styles.tocPanel} bordered={false}>
          <div className={styles.tocHeader}>
            <Title level={4} className={styles.tocHeading}>文档目录</Title>
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={toggleExpanded}
              className={styles.collapseButton}
            />
          </div>

          <Divider orientation="left">目录导航</Divider>

          <ul className={styles.tocList}>
            {headings.map(heading => (
              <li
                key={heading.id}
                className={`${styles.tocItem} ${styles[`level${heading.level}`]}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={activeId === heading.id ? styles.active : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                      // 更新URL，但不刷新页面
                      window.history.pushState(null, '', `#${heading.id}`);
                      setActiveId(heading.id);
                    }
                  }}
                >
                  {heading.level === 1 ? <OrderedListOutlined style={{ marginRight: '8px' }} /> : null}
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );

  return affixed ? (
    <Affix offsetTop={20}>
      {tocContent}
    </Affix>
  ) : tocContent;
};

export default React.memo(TableOfContents);