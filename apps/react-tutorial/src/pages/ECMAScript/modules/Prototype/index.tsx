import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Tabs, Space, Alert, Divider } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';
import { create } from 'domain';

const { Title, Paragraph, Text } = Typography;

// 原型基础代码
const prototypeBasicsCode = `// 构造函数
function Person(name) {
  this.name = name;
}

// 在原型上添加方法
Person.prototype.sayName = function() {
  return \`My name is \${this.name}\`;
};

// 创建实例
const alice = new Person('Alice');
console.log(alice.sayName()); // "My name is Alice"

// 原型链
console.log(alice.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true`;

// 构造函数继承代码
const constructorInheritanceCode = `// 父类构造函数
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}

// 父类方法
Animal.prototype.getName = function() {
  return this.name;
};

// 子类构造函数
function Dog(name, breed) {
  // 调用父类构造函数
  Animal.call(this, name);
  this.breed = breed;
}

// 创建实例
const dog1 = new Dog('Buddy', 'Golden Retriever');
console.log(dog1.name); // "Buddy"
console.log(dog1.colors); // ["black", "white"]
console.log(dog1.breed); // "Golden Retriever"

// 但是无法继承原型方法
// console.log(dog1.getName()); // TypeError: dog1.getName is not a function`;

// 原型链继承代码
const prototypeChainInheritanceCode = `// 父类构造函数
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}

// 父类方法
Animal.prototype.getName = function() {
  return this.name;
};

// 子类构造函数
function Dog(breed) {
  this.breed = breed;
}

// 设置原型链，继承Animal
Dog.prototype = new Animal('Generic Animal');

// 修复constructor指向
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.getBreed = function() {
  return this.breed;
};

// 创建实例
const dog1 = new Dog('Golden Retriever');
console.log(dog1.name); // "Generic Animal"
console.log(dog1.getName()); // "Generic Animal"
console.log(dog1.getBreed()); // "Golden Retriever"

// 问题：所有实例共享引用类型属性
const dog2 = new Dog('Labrador');
dog1.colors.push('brown');
console.log(dog2.colors); // ["black", "white", "brown"]`;

// 组合继承代码
const combinationInheritanceCode = `// 父类构造函数
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}

// 父类方法
Animal.prototype.getName = function() {
  return this.name;
};

// 子类构造函数
function Dog(name, breed) {
  // 第一次调用父类构造函数
  Animal.call(this, name);
  this.breed = breed;
}

// 设置原型链
Dog.prototype = new Animal(); // 第二次调用父类构造函数

// 修复constructor指向
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.getBreed = function() {
  return this.breed;
};

// 创建实例
const dog1 = new Dog('Buddy', 'Golden Retriever');
const dog2 = new Dog('Max', 'Labrador');

// 测试实例属性
dog1.colors.push('brown');
console.log(dog2.colors); // ["black", "white"] - 不受影响

// 测试方法调用
console.log(dog1.getName()); // "Buddy"
console.log(dog2.getName()); // "Max"`;

// 寄生组合继承代码
const parasiticalCombinationCode = `// 辅助函数：创建对象并链接到指定原型
function Object.create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

// 辅助函数：实现继承
function inheritPrototype(Child, Parent) {
  // 创建父类原型的副本
  const prototype = Object.create(Parent.prototype);
  // 增强对象
  prototype.constructor = Child;
  // 指定子类的原型
  Child.prototype = prototype;
}

// 父类构造函数
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}

// 父类方法
Animal.prototype.getName = function() {
  return this.name;
};

// 子类构造函数
function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// 建立继承关系
inheritPrototype(Dog, Animal);

// 添加子类方法
Dog.prototype.getBreed = function() {
  return this.breed;
};

// 创建实例
const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.getName()); // "Buddy"
console.log(dog.getBreed()); // "Golden Retriever"`;

// ES6 类继承代码
const es6ClassInheritanceCode = `// 父类
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['black', 'white'];
  }

  getName() {
    return this.name;
  }
}

// 子类
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }

  getBreed() {
    return this.breed;
  }

  // 覆盖父类方法
  getName() {
    return \`Dog name: \${super.getName()}\`;
  }
}

// 创建实例
const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.getName()); // "Dog name: Buddy"
console.log(dog.getBreed()); // "Golden Retriever"`;

// 原型链可视化数据
const prototypeChainData = [
  {
    id: 'instance',
    label: 'dog实例',
    properties: ['name: "Buddy"', 'breed: "Golden Retriever"'],
    methods: []
  },
  {
    id: 'dogPrototype',
    label: 'Dog.prototype',
    properties: ['constructor: Dog'],
    methods: ['getBreed()']
  },
  {
    id: 'animalPrototype',
    label: 'Animal.prototype',
    properties: ['constructor: Animal'],
    methods: ['getName()']
  },
  {
    id: 'objectPrototype',
    label: 'Object.prototype',
    properties: ['constructor: Object'],
    methods: ['toString()', 'valueOf()', 'hasOwnProperty()']
  },
  {
    id: 'null',
    label: 'null',
    properties: [],
    methods: []
  }
];

// 继承方式比较
const inheritanceComparison = [
  {
    name: '原型链继承',
    pros: ['简单易实现', '子类可以访问父类原型上的属性和方法'],
    cons: ['引用类型的属性会被所有实例共享', '创建子类实例时无法向父类构造函数传参']
  },
  {
    name: '构造函数继承',
    pros: ['可以向父类构造函数传参', '避免引用类型属性被共享'],
    cons: ['无法继承父类原型上的方法', '每个子类实例都会创建父类方法的副本']
  },
  {
    name: '组合继承',
    pros: ['结合了原型链和构造函数的优点', '可以继承父类原型方法并且不共享引用属性'],
    cons: ['父类构造函数会被调用两次', '存在一定的性能开销']
  },
  {
    name: '寄生组合继承',
    pros: ['只调用一次父类构造函数', '性能最佳', '原型链保持不变'],
    cons: ['实现较复杂']
  },
  {
    name: 'ES6 类继承',
    pros: ['语法简洁清晰', '底层仍是基于原型', '支持super关键字'],
    cons: ['旧浏览器可能需要转译']
  }
];

const PrototypeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('basics');
  const [testResults, setTestResults] = useState<any>(null);

  // 运行ES6类继承测试
  const runES6Test = () => {
    try {
      // 创建一个沙箱环境来执行代码
      const result = new Function(`
        // 父类
        class Animal {
          constructor(name) {
            this.name = name;
            this.colors = ['black', 'white'];
          }

          getName() {
            return this.name;
          }
        }

        // 子类
        class Dog extends Animal {
          constructor(name, breed) {
            super(name); // 调用父类构造函数
            this.breed = breed;
          }

          getBreed() {
            return this.breed;
          }

          // 覆盖父类方法
          getName() {
            return \`Dog name: \${super.getName()}\`;
          }
        }

        // 创建实例
        const dog = new Dog('Buddy', 'Golden Retriever');

        return {
          name: dog.getName(),
          breed: dog.getBreed(),
          prototypeChain: [
            'dog instanceof Dog: ' + (dog instanceof Dog),
            'dog instanceof Animal: ' + (dog instanceof Animal),
            'dog instanceof Object: ' + (dog instanceof Object)
          ],
          dogProps: Object.keys(dog),
          dogProto: Object.getOwnPropertyNames(Dog.prototype)
        };
      `)();

      setTestResults(result);
    } catch (error) {
      console.error('测试执行错误:', error);
      setTestResults({ error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  // 渲染原型链可视化
  const renderPrototypeChain = () => {
    return (
      <div style={{ marginTop: 20 }}>
        {prototypeChainData.map((node, index) => (
          <div key={node.id}>
            <Card
              title={node.label}
              size="small"
              style={{ marginBottom: 10 }}
            >
              {node.properties.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text strong>属性：</Text>
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    {node.properties.map((prop, i) => (
                      <li key={i}><Text code>{prop}</Text></li>
                    ))}
                  </ul>
                </div>
              )}
              {node.methods.length > 0 && (
                <div>
                  <Text strong>方法：</Text>
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    {node.methods.map((method, i) => (
                      <li key={i}><Text code>{method}</Text></li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
            {index < prototypeChainData.length - 1 && (
              <div style={{ textAlign: 'center', margin: '5px 0' }}>
                <Text>↑ __proto__ ↑</Text>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染继承方式比较表格
  const renderComparisonTable = () => {
    return (
      <div style={{ marginTop: 20 }}>
        {inheritanceComparison.map((item, index) => (
          <Card
            title={item.name}
            size="small"
            style={{ marginBottom: 16 }}
            key={index}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>优点：</Text>
                  <ul style={{ paddingLeft: 20 }}>
                    {item.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>缺点：</Text>
                  <ul style={{ paddingLeft: 20 }}>
                    {item.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Title level={3}>函数原型继承</Title>
      <Paragraph>
        JavaScript的继承是基于原型的，而不是基于类的。理解原型链和继承机制对于掌握JavaScript面向对象编程至关重要。
        本模块将介绍JavaScript中的原型概念及各种继承实现方式。
      </Paragraph>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'basics',
            label: '原型基础',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="原型基础概念">
                    <Paragraph>
                      在JavaScript中，每个函数都有一个<Text code>prototype</Text>属性，指向一个对象，这个对象就是该函数的原型对象。
                      当使用<Text code>new</Text>关键字创建函数的实例时，实例会自动获得一个<Text code>__proto__</Text>属性，指向构造函数的原型对象。
                    </Paragraph>
                    <Paragraph>
                      当访问一个对象的属性或方法时，如果对象本身没有这个属性或方法，JavaScript引擎会沿着<Text code>__proto__</Text>链向上查找，
                      这个查找链被称为<Text strong>原型链</Text>。
                    </Paragraph>
                    <CodeBlock code={prototypeBasicsCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="原型链可视化">
                    <Paragraph>
                      以下是一个Dog类继承自Animal类的原型链示意图：
                    </Paragraph>
                    {renderPrototypeChain()}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'inheritance',
            label: '继承实现方式',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24} lg={12}>
                  <Card title="构造函数继承">
                    <Paragraph>
                      构造函数继承通过在子类构造函数中调用父类构造函数实现继承。这种方式可以解决引用类型共享的问题，
                      但无法继承父类原型上的方法。
                    </Paragraph>
                    <CodeBlock code={constructorInheritanceCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="原型链继承">
                    <Paragraph>
                      原型链继承通过将子类的原型指向父类的实例来实现继承。这种方式可以继承父类原型上的方法，
                      但引用类型的属性会被所有实例共享。
                    </Paragraph>
                    <CodeBlock code={prototypeChainInheritanceCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="组合继承">
                    <Paragraph>
                      组合继承结合了构造函数继承和原型链继承的优点，是JavaScript中最常用的继承模式。
                      它的缺点是父类构造函数会被调用两次。
                    </Paragraph>
                    <CodeBlock code={combinationInheritanceCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="寄生组合继承">
                    <Paragraph>
                      寄生组合继承是组合继承的优化版本，通过创建父类原型的副本并修改其constructor属性，
                      避免了调用两次父类构造函数。
                    </Paragraph>
                    <CodeBlock code={parasiticalCombinationCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="ES6 类继承">
                    <Paragraph>
                      ES6引入了class关键字，使得JavaScript的类继承语法更加清晰和简洁。但本质上，它仍然是基于原型的继承。
                    </Paragraph>
                    <Row gutter={16}>
                      <Col span={16}>
                        <CodeBlock code={es6ClassInheritanceCode} language="javascript" />
                      </Col>
                      <Col span={8}>
                        <Card title="运行测试" size="small">
                          <Button type="primary" onClick={runES6Test}>
                            测试ES6类继承
                          </Button>

                          {testResults && !testResults.error && (
                            <div style={{ marginTop: 16 }}>
                              <Divider>测试结果</Divider>
                              <p><Text strong>dog.getName():</Text> {testResults.name}</p>
                              <p><Text strong>dog.getBreed():</Text> {testResults.breed}</p>

                              <Divider>原型链检查</Divider>
                              <ul>
                                {testResults.prototypeChain.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>

                              <Divider>实例属性</Divider>
                              <p>{testResults.dogProps.join(', ')}</p>

                              <Divider>原型方法</Divider>
                              <p>{testResults.dogProto.join(', ')}</p>
                            </div>
                          )}

                          {testResults && testResults.error && (
                            <Alert
                              message="测试执行错误"
                              description={testResults.error}
                              type="error"
                              showIcon
                              style={{ marginTop: 16 }}
                            />
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'comparison',
            label: '继承方式比较',
            children: (
              <Card title="各种继承方式的优缺点比较">
                {renderComparisonTable()}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default PrototypeModule;
