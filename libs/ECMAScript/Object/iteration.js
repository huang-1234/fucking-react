if (!Object.prototype[Symbol.iterator]) {
  Object.defineProperty(Object.prototype, Symbol.iterator, {
    value: function* () {
      for (const key in this) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          yield this[key];
        }
      }
    },
    writable: true,
    configurable: true
  });
}
if (!Array.prototype[Symbol.iterator]) {
  Object.defineProperty(Array.prototype, Symbol.iterator, {
    value: function* () {
      for (let i = 0;i < this.length;i++) {
        yield this[i];
      }
    },
    writable: true,
    configurable: true
  });
}
(function (key) {
  class Parent {
    constructor() {
      this.name = 'Parent';
    }
    sayName() {
      console.log(`Parent inner sayName: ${this.name}`);
    }
    static staticFunc1() {
      console.log(`Parent static staticFunc1: ${this.name}`);
    }
  }

  class Child extends Parent {
    constructor() {
      super();
      this.name = 'Child';
    }
    static staticFunc2() {
      console.log(`Child static staticFunc2: ${this.name}`);
    }
  }
  const shouldOverride = false;
  if (shouldOverride) {
    // this funtion will overwrite the inner sayName
    Parent.prototype.sayName = function () {
      console.log(`Parent prototype sayName: ${this.name}`);
    }
    // this funtion will overwrite the inner sayName
    Child.prototype.sayName = function () {
      console.log(`Child prototype sayName: ${this.name}`);
    }
    // Parent.staticFunc1 = function () {
    //   console.log(`Parent static staticFunc1: ${this.name}`);
    // }
    // Child.staticFunc2 = function () {
    //   console.log(`Child static staticFunc2: ${this.name}`);
    // }
  }
  switch (key) {
    case 'iteration':
      /**
       * @desc 迭代对象
       * @error TypeError: {(intermediate value)(intermediate value)} is not iterable
       */
      const [a, b] = {
        a: 10,
        b: 20
      }
      console.log(a, b);
      break;
    case 'prototype':
      const p = new Parent();
      const c = new Child();
      // p.sayName();
      // c.sayName();
      p.staticFunc1();
      c.staticFunc2();
      break;

    case '__proto__':
      const child = new Parent();
      console.log(child.__proto__ === Parent.prototype);
      console.log(Parent.prototype.__proto__ === Object.prototype);
      console.log(Parent.prototype.__proto__ === Parent.__proto__);
      console.log(Object.prototype.__proto__ === null);
      console.log(Parent.__proto__ === Object.prototype);
      console.log(Object.prototype.__proto__ === null);
      break;
    case 'object_prorotype':
      console.log(Object.prototype);
      break;
    default:
      break;
  }
})('object_prorotype')