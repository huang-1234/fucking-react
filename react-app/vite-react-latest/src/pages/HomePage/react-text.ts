export const reactText = `// 一个简单的React组件示例
function Welcome(props) {
  return <h1>你好, {props.name}</h1>;
}

// 使用箭头函数
const Button = ({ onClick, children }) => (
  <button onClick={onClick} className="custom-button">
    {children}
  </button>
);

// Hooks示例
function Counter() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    document.title = \`点击了 \${count} 次\`;
  }, [count]);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}`