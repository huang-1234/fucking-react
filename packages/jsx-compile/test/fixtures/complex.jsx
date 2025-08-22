function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>JSX Test App</h1>
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        {count > 5 && <p>Count is greater than 5!</p>}
        <CustomComponent
          name="Test"
          value={42}
          enabled={true}
          {...otherProps}
        />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} JSX Compiler</p>
      </footer>
    </div>
  );
}
