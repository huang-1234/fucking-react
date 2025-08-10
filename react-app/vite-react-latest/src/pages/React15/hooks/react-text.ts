// React 15 中的代码示例
const react15Code = `// React 15 中必须有一个根元素
render() {
  return (
    <div> {/* 必须的包装元素 */}
      <h1>标题</h1>
      <p>段落</p>
    </div>
  );
}`;

// React 16+ 中的代码示例
const react16Code = `// React 16+ 中可以使用 Fragment
render() {
  return (
    <React.Fragment>
      <h1>标题</h1>
      <p>段落</p>
    </React.Fragment>
  );
}

// 或使用简写语法
render() {
  return (
    <>
      <h1>标题</h1>
      <p>段落</p>
    </>
  );
}`;

// React 15 中的PropTypes代码示例
const react15PropTypesCode = `// React 15 中，PropTypes内置在React包中
import React, { Component, PropTypes } from 'react';

class Greeting extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  address: PropTypes.shape({
    street: PropTypes.string,
    city: PropTypes.string
  })
};

Greeting.defaultProps = {
  age: 18
};`;

// React 16+ 中的PropTypes代码示例
const react16PropTypesCode = `// React 16+ 中，PropTypes被移到单独的包中
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Greeting extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  address: PropTypes.shape({
    street: PropTypes.string,
    city: PropTypes.string
  })
};

Greeting.defaultProps = {
  age: 18
};`;

export {
  react15Code,
  react16Code,
  react15PropTypesCode,
  react16PropTypesCode
}
