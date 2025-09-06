import React, { useState } from 'react';
import { Tabs, Anchor, BackTop } from 'antd';
import ArrayFunctions from './categories/ArrayFunctions';
import CollectionFunctions from './categories/CollectionFunctions';
import FunctionFunctions from './categories/FunctionFunctions';
import LanguageFunctions from './categories/LanguageFunctions';
import MathFunctions from './categories/MathFunctions';
import NumberFunctions from './categories/NumberFunctions';
import ObjectFunctions from './categories/ObjectFunctions';
import StringFunctions from './categories/StringFunctions';
import UtilityFunctions from './categories/UtilityFunctions';
import useUrlState from '@ahooksjs/use-url-state';

const { TabPane } = Tabs;
const { Link } = Anchor;

const LodashDemo: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('array');

  // useRouter
  const [urlState, setUrlState] = useUrlState({
    category: 'array'
  });

  const handleCategoryChange = (category: string) => {
    setUrlState({ category: category });
    setActiveCategory(category);
  };

  const _renderFunctions = (key: string) => {
    switch (key) {
      case 'array':
        return <ArrayFunctions />;
      case 'collection':
        return <CollectionFunctions />;
      case 'function':
        return <FunctionFunctions />;
      case 'language':
        return <LanguageFunctions />;
      case 'math':
        return <MathFunctions />;
      case 'number':
        return <NumberFunctions />;
      case 'object':
        return <ObjectFunctions />;
      case 'string':
        return <StringFunctions />;
      case 'utility':
        return <UtilityFunctions />;
    }
  };

  return (
    <div className="lodash-demo">
      <BackTop />

      <div className="category-nav">
        <Tabs activeKey={urlState.category} onChange={handleCategoryChange}>
          <TabPane tab="数组" key="array" />
          <TabPane tab="集合" key="collection" />
          <TabPane tab="函数" key="function" />
          <TabPane tab="语言" key="language" />
          <TabPane tab="数学" key="math" />
          <TabPane tab="数字" key="number" />
          <TabPane tab="对象" key="object" />
          <TabPane tab="字符串" key="string" />
          <TabPane tab="实用函数" key="utility" />
        </Tabs>
      </div>

      <div className="demo-container">
        {_renderFunctions(urlState.category)}
      </div>
    </div>
  );
};

export default React.memo(LodashDemo);
