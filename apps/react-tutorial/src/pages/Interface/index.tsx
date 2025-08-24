import React from 'react'
import { Typography } from 'antd'
import stylesLayout from '@/layouts/container.module.less';

const InterfacePage: React.FC = () => {
  return (
    <div className={stylesLayout.contentLayout}>
      <Typography.Title level={1}>Interface</Typography.Title>
      <Typography.Paragraph>
        Interface is a powerful tool in TypeScript that allows you to define the shape of an object.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Interface is a powerful tool in TypeScript that allows you to define the shape of an object.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Interface is a powerful tool in TypeScript that allows you to define the shape of an object.
      </Typography.Paragraph>
    </div>
  )
}

export default React.memo(InterfacePage)