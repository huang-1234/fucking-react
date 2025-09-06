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
        {activeCategory === 'array' && <ArrayFunctions />}
        {activeCategory === 'collection' && <CollectionFunctions />}
        {activeCategory === 'function' && <FunctionFunctions />}
        {activeCategory === 'language' && <LanguageFunctions />}
        {activeCategory === 'math' && <MathFunctions />}
        {activeCategory === 'number' && <NumberFunctions />}
        {activeCategory === 'object' && <ObjectFunctions />}
        {activeCategory === 'string' && <StringFunctions />}
        {activeCategory === 'utility' && <UtilityFunctions />}
      </div>
    </div>
  );
};

export default React.memo(LodashDemo);
