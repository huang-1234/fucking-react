"use strict"; // 启用严格模式

// 辅助函数：检查类是否通过 new 调用
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// 辅助函数：定义属性（用于方法）
function _defineProperties(target, props) {
  for (var i = 0;i < props.length;i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false; // 方法默认不可枚举
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

// 辅助函数：创建类（添加原型方法和静态方法）
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps); // 添加原型方法
  if (staticProps) _defineProperties(Constructor, staticProps); // 添加静态方法
  return Constructor;
}

// 辅助函数：实现继承
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  // 核心：设置子类原型对象，使其继承自父类原型对象 (Child.prototype.__proto__ = Parent.prototype)
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  });
  // 设置静态方法继承 (Child.__proto__ = Parent)
  if (superClass) _setPrototypeOf(subClass, superClass);
}

// 辅助函数：设置对象的原型
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

// 辅助函数：创建 super 函数
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    // Super 是父类构造函数 (Parent)
    var Super = _getPrototypeOf(Derived);
    var result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      // 通常走这个分支，相当于 Parent.call(this, ...arguments)
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

// 辅助函数：处理构造函数返回值
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

// 辅助函数：确保 this 已初始化
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

// 辅助函数：获取对象的原型
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

// 辅助函数：检查是否支持 Reflect.construct
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () { }));
    return true;
  } catch (e) {
    return false;
  }
}

// 辅助函数：类型判断
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }
  return _typeof(obj);
}

// 定义 Parent 类
var Parent = /*#__PURE__*/ (function () {
  function Parent() {
    _classCallCheck(this, Parent); // 检查必须通过 new 调用
    this.name = 'Parent';
  }
  _createClass(Parent,
    [
      {
        key: "sayName", // 添加原型方法 sayName
        value: function sayName() {
          console.log("Parent inner sayName: ".concat(this.name));
        }
      }
    ],
    [
      {
        key: "staticFunc1", // 添加静态方法 staticFunc1
        value: function staticFunc1() {
          console.log("Parent static staticFunc1: ".concat(this.name));
        }
      }
    ]);
  return Parent;
})();

// 定义 Child 类，继承自 Parent
var Child = /*#__PURE__*/ (function (_Parent) {
  _inherits(Child, _Parent); // 设置继承关系

  var _super = _createSuper(Child); // 创建 super 函数

  function Child() {
    _classCallCheck(this, Child);

    // 关键：调用 super() 相当于 Parent.call(this)
    var _this = _super.call(this);
    _this.name = 'Child';
    return _this;
  }

  // 为 Child 添加静态方法 staticFunc2
  _createClass(Child, null, [{
    key: "staticFunc2",
    value: function staticFunc2() {
      console.log("Child static staticFunc2: ".concat(this.name));
    }
  }]);

  return Child;
})(Parent);