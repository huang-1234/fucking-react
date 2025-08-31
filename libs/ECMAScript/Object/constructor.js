function myNew(constructor, ...args) {
  // 1. 创建一个新的空对象
  const source = {};

  // 2. 将新对象的原型指向构造函数的prototype
  Object.setPrototypeOf(source, constructor.prototype);
  // 等同于：obj.__proto__ = constructor.prototype

  // 3. 调用构造函数，将this绑定到新对象
  const result = constructor.apply(source, args);

  // 4. 如果构造函数返回的是对象或函数，则返回该结果，否则返回新创建的对象
  // 注意：像前文提到的，typeof检测类型时，对于null会返回object，所以要排除result是null这种情况
  return (typeof result === 'object' && result !== null) || typeof result === 'function'
    ? result
    : source;
}
function deepClone(source, wm = new WeakMap()) {
  // 处理null和基本数据类型
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // 处理循环引用
  if (wm.has(source)) {
    return wm.get(source);
  }

  let target;

  // 处理日期对象
  if (source instanceof Date) {
    target = new Date();
    target.setTime(source.getTime());
    wm.set(source, target);
    return target;
  }

  // 处理正则对象
  if (source instanceof RegExp) {
    target = new RegExp(source.source, source.flags);
    wm.set(source, target);
    return target;
  }

  // 处理数组和对象
  target = Array.isArray(source) ? [] : {};
  wm.set(source, target);

  // 递归拷贝属性
  Reflect.ownKeys(source).forEach(key => {
    target[key] = deepClone(source[key], wm);
  });

  return target;
}
function deepCopyTest() {
  // 测试用例
  const obj = {
    a: 1,
    b: 'hello',
    c: [1, 2, 3],
    d: { x: 10, y: 20 },
    e: new Date(),
    f: /abc/g,
  };
  obj.self = obj; // 循环引用

  const clonedObj = deepClone(obj);
  console.log(clonedObj);
  console.log(clonedObj !== obj); // true
  console.log(clonedObj.c !== obj.c); // true
  console.log(clonedObj.d !== obj.d); // true
  console.log(clonedObj.self === clonedObj); // true，正确处理循环引用
}

function newTest(classHasReturn) {
  // 测试示例
  function Person(name, age) {
    this.name = name;
    this.age = age;
  }

  Person.prototype.sayHello = function () {
    console.log(`Hello, I'm ${this.name}, ${this.age} years old`);
  };

  // 使用自定义的myNew
  const person1 = myNew(Person, 'Alice', 25);
  console.log(person1.name); // 'Alice'
  console.log(person1.age);  // 25
  person1.sayHello();        // 正常调用原型上的方法
  console.log(person1 instanceof Person); // true，验证原型链关系

  // 测试构造函数有返回值的情况
  function Car(brand) {
    this.brand = brand;
    return { model: 'SUV' }; // 返回一个对象
  }
  function ClassCar(brand) {
    this.brand = brand;
  }
  if (classHasReturn) {
    const car = myNew(Car, 'Toyota');
    console.log(car.brand); // undefined，因为构造函数返回了新对象
    console.log(car.model); // 'SUV'
  } else {
    const car = new ClassCar('Toyota');
    console.log('car:before', car.brand);
    car.brand = 'Tesla';
    console.log('car:after', car.brand);
  }

}
function instanceofTest() {
  function myInstanceof(obj, constructor) {
    // 处理基本类型和null/undefined的情况
    if (obj === null || typeof obj !== 'object') {
      return false;
    }

    // 获取对象的原型
    let proto = Object.getPrototypeOf(obj);

    // 遍历原型链
    while (proto !== null) {
      // 如果找到匹配的原型，返回true
      if (proto === constructor.prototype) {
        return true;
      }
      // 继续向上查找原型链
      proto = Object.getPrototypeOf(proto);
    }

    // 遍历完原型链都没找到匹配，返回false
    return false;
  }

  // 测试示例
  function Person() { }
  const person = new Person();

  console.log(myInstanceof(person, Person)); // true
  console.log(myInstanceof(person, Object)); // true
  console.log(myInstanceof([], Array)); // true
  console.log(myInstanceof([], Object)); // true
  console.log(myInstanceof(123, Number)); // false（基本类型）
  console.log(myInstanceof(new Number(123), Number)); // true（包装对象）
}
(function (key) {
  let k = key;
  if (typeof process === 'object' && process.argv.length > 2) {
    k = process.argv[2];
  } else if (typeof window !== 'undefined') {
    k = window.location.href;
  } else {
    k = 'new';
  }
  console.log('first', k);
  switch (k) {
    case 'new':
      newTest();
    case 'instanceof':
      instanceofTest();
    case 'deepCopy':
      deepCopyTest();
    default:
      break;
  }
})();

