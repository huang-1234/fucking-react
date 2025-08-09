import React from 'react';
import { Card, Rate, Tag, Space } from 'antd';
import { CodeOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './SkillCard.module.less';

interface SkillCardProps {
  name: string;
  level: number;
  icon?: string;
  tags?: string[];
  description?: string;
}

/**
 * 技能卡片组件
 * 用于展示个人技能及熟练度
 */
const SkillCard: React.FC<SkillCardProps> = ({
  name,
  level,
  icon,
  tags = [],
  description
}) => {
  // 图标映射
  const getIcon = () => {
    switch (icon) {
      case 'react':
        return <i className="devicon-react-original colored"></i>;
      case 'typescript':
        return <i className="devicon-typescript-plain colored"></i>;
      case 'javascript':
        return <i className="devicon-javascript-plain colored"></i>;
      default:
        return <CodeOutlined />;
    }
  };

  return (
    <Card className={styles.skillCard} size="small">
      <div className={styles.skillHeader}>
        <div className={styles.skillIcon}>
          {getIcon()}
        </div>
        <div className={styles.skillInfo}>
          <div className={styles.skillName}>{name}</div>
          <Rate disabled defaultValue={level} count={5} />
        </div>
      </div>

      {description && (
        <div className={styles.skillDescription}>
          {description}
        </div>
      )}

      {tags.length > 0 && (
        <div className={styles.skillTags}>
          <Space size={[0, 8]} wrap>
            {tags.map(tag => (
              <Tag key={tag} color="blue" icon={<CheckOutlined />}>
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default SkillCard;