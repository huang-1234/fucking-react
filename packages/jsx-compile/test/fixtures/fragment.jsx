<>
  <h1>Fragment Test</h1>
  <p>This is a JSX fragment test</p>
  <ul>
    {items.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
</>
