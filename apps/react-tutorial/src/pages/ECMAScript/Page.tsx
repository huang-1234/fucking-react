import React, { useState } from 'react';
import { Tabs, Typography, Layout } from 'antd';
import DeepCloneModule from './modules/DeepClone';
import ArrayFunctionsModule from './modules/ArrayFunctions';
import LexicalScopeModule from './modules/LexicalScope';
import ThisBindingModule from './modules/ThisBinding';
import PrototypeModule from './modules/Prototype';
import EventLoopModule from './modules/EventLoop';
import PromiseModule from './modules/Promise';
import AsyncAwaitModule from './modules/AsyncAwait';
import StringMethodsModule from './modules/StringMethods';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ECMAScriptPage: React.FC = () => {
  const items = [
    {
      key: 'deepClone',
      label: '深浅拷贝',
      children: <DeepCloneModule />
    },
    {
      key: 'arrayFunctions',
      label: '数组高阶函数',
      children: <ArrayFunctionsModule />
    },
    {
      key: 'stringMethods',
      label: '字符串方法',
      children: <StringMethodsModule />
    },
    {
      key: 'lexicalScope',
      label: '词法作用域',
      children: <LexicalScopeModule />
    },
    {
      key: 'thisBinding',
      label: 'this绑定机制',
      children: <ThisBindingModule />
    },
    {
      key: 'prototype',
      label: '原型继承',
      children: <PrototypeModule />
    },
    {
      key: 'eventLoop',
      label: '事件循环',
      children: <EventLoopModule />
    },
    {
      key: 'promise',
      label: 'Promise',
      children: <PromiseModule />
    },
    {
      key: 'asyncAwait',
      label: 'Async/Await',
      children: <AsyncAwaitModule />
    }
  ];

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        <Typography>
          <Title level={2}>ECMAScript 核心概念</Title>
          <Paragraph>
            本页面展示了ECMAScript的核心概念及其实现，包括深浅拷贝、数组高阶函数、词法作用域、this绑定机制、原型继承、事件循环机制、Promise实现等内容。
          </Paragraph>
        </Typography>

        <Tabs
          defaultActiveKey="deepClone"
          items={items}
          tabPosition="left"
          style={{ marginTop: 20 }}
        />
      </Content>
    </Layout>
  );
};

export default ECMAScriptPage;
