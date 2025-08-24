// import React from 'react';
// import { Tabs, Typography, Layout } from 'antd';
// import stylesLayout from '@/layouts/container.module.less';
// import DemoModuleLoader from './examples/UniversalModuleLoad';
// import DemoJSFetch from './examples/DemoJSFetch';
// const { Title, Paragraph } = Typography;
// const { Content } = Layout;

// const ModulesPage: React.FC = () => {
//   const items = [
//     {
//       key: 'universalModuleLoad',
//       label: '通用模块加载',
//       children: <DemoModuleLoader />
//     },
//     {
//       key: 'jsFetch',
//       label: 'JSFetch',
//       children: <DemoJSFetch />
//     },
//   ];

//   return (
//     <Layout className={stylesLayout.contentLayout}>
//       <Content>
//         <Typography>
//           <Title level={2}>模块加载</Title>
//           <Paragraph>
//             本页面展示了模块加载的实现，包括AMD、CJS、ESM、UMD、IIFE。
//           </Paragraph>
//         </Typography>

//         <Tabs
//           defaultActiveKey="universalModuleLoad"
//           items={items}
//           tabPosition="left"
//           style={{ marginTop: 20 }}
//         />
//       </Content>
//     </Layout>
//   );
// };

// export default React.memo(ModulesPage);
