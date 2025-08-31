# Hooks to Reactive

基于 @formily/reactive 的响应式状态管理可以提高状态管理的清晰度和性能，特别是在处理复杂状态和跨组件共享状态时。下面是一个 Demo 示例、注意事项、重构方案以及渐进式重构的指导。

# 一、@formily/reactive React 状态管理 Demo

以下是一个简单的计数器应用，展示了如何使用 `@formily/reactive` 管理状态：

```jsx
import React from 'react';
import { observable } from '@formily/reactive';
import { observer } from '@formily/reactive-react';

// 创建响应式状态
const appState = observable({
  count: 0,
  increment() {
    this.count++;
  },
  decrement() {
    this.count--;
  }
});

// 使用 observer 包裹组件，使其响应状态变化
const Counter = observer(() => {
  return (
    <div>
      <h1>Count: {appState.count}</h1>
      <button onClick={appState.increment}>+</button>
      <button onClick={appState.decrement}>-</button>
    </div>
  );
});

export default Counter;
```

## 更复杂的示例（带表单）
```tsx
import React from 'react';
import { observable } from '@formily/reactive';
import { observer } from '@formily/reactive-react';

const userState = observable({
  user: {
    name: '',
    email: '',
  },
  errors: {},
  setField(name, value) {
    this.user[name] = value;
    this.validateField(name, value);
  },
  validateField(name, value) {
    // 简单验证逻辑
    if (name === 'email' && !value.includes('@')) {
      this.errors.email = 'Invalid email';
    } else {
      this.errors.email = null;
    }
  },
  submit() {
    alert(`Submitting: ${JSON.stringify(this.user)}`);
  }
});

const UserForm = observer(() => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); userState.submit(); }}>
      <input
        type="text"
        value={userState.user.name}
        onChange={(e) => userState.setField('name', e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={userState.user.email}
        onChange={(e) => userState.setField('email', e.target.value)}
        placeholder="Email"
      />
      {userState.errors.email && <div style={{ color: 'red' }}>{userState.errors.email}</div>}
      <button type="submit">Submit</button>
    </form>
  );
});

export default UserForm;
```

# 二、使用注意事项

1.  **始终用 `observer` 包裹组件**：只有被 `observer` 包裹的组件才会对响应式状态的变化做出反应。忘记包裹会导致状态更新后组件不重新渲染 。
2.  **谨慎使用深层响应式**：`@formily/reactive` 默认对对象进行**深层响应式代理**。对于大型对象，这可能带来性能开销。考虑使用 `observable.shallow` 创建浅层响应式对象 。
3.  **避免在渲染函数中创建新的 observable**：在渲染函数内创建新的 observable 会导致每次渲染都生成新的响应式对象，引起不必要的性能损耗和潜在错误。应将 observable 定义在组件外部或使用 `useMemo`。
4.  **理解响应式劫持**：`@formily/reactive` 通过 Proxy 对对象的 `get` 和 `set` 操作进行劫持来实现响应式 。直接对字段重新赋值（如 `obj.field = newValue`）才能触发响应，修改嵌套对象内部的属性（如 `obj.field.subField = value`）也需要确保父对象已是响应式。
5.  **批量更新**：多个连续的状态修改可以使用 `batch` 包裹以减少不必要的渲染 。
```ts
import { batch } from '@formily/reactive';
batch(() => {
  state.a = 1;
  state.b = 2;
  // 只会触发一次重新渲染
});
```
6.  **异步操作**：在异步操作（如 `setTimeout`、`fetch`）中修改状态同样能触发响应，无需特殊处理。
7.  **调试**：浏览器开发工具中可查看 `Proxy` 对象，可能不如普通对象直观。可以考虑使用官方提供的调试工具或方法。

# 三、重构方案：从 React Hooks 到 @formily/reactive

## 重构前（使用 useState）
```tsx
// 重构前：使用 useState 和 useEffect
import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateName = (name) => {
    setUser(prevUser => ({ ...prevUser, name }));
  };

  const updateEmail = (email) => {
    setUser(prevUser => ({ ...prevUser, email }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input value={user.name} onChange={(e) => updateName(e.target.value)} />
      <input value={user.email} onChange={(e) => updateEmail(e.target.value)} />
      <img src={user.avatar} alt="Avatar" />
    </div>
  );
}
```

## 重构后（使用 @formily/reactive）
```tsx
// 重构后：使用 @formily/reactive
import React from 'react';
import { observable } from '@formily/reactive';
import { observer } from '@formily/reactive-react';

// 将状态逻辑提取到响应式对象中
const userState = observable({
  user: { name: '', email: '', avatar: '' },
  loading: false,
  error: null,
  async fetchUser() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      // 直接赋值，触发响应
      this.user = userData;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  updateName(name) {
    this.user.name = name;
  },
  updateEmail(email) {
    this.user.email = email;
  }
});

// 首次获取用户数据
userState.fetchUser();

// 组件变得非常简洁
const UserProfile = observer(() => {
  if (userState.loading) return <div>Loading...</div>;
  if (userState.error) return <div>Error: {userState.error}</div>;

  return (
    <div>
      <input
        value={userState.user.name}
        onChange={(e) => userState.updateName(e.target.value)}
      />
      <input
        value={userState.user.email}
        onChange={(e) => userState.updateEmail(e.target.value)}
      />
      <img src={userState.user.avatar} alt="Avatar" />
    </div>
  );
});

export default UserProfile;
```

## 重构步骤
1.  **识别状态**：确定组件中哪些状态需要被提取到响应式对象中（通常是多个 `useState` 或 `useReducer` 管理的状态）。
2.  **创建响应式对象**：使用 `observable` 创建响应式状态对象，将原有的状态和操作状态的方法都定义在内。
3.  **替换状态操作**：将原有的 `setState` 调用替换为直接对响应式对象属性的赋值。
4.  **处理副作用**：将 `useEffect` 中的逻辑移至响应式对象的方法中，或保留必要的 `useEffect` 但内部调用响应式对象的方法。
5.  **包裹组件**：使用 `observer` 包裹组件，使其能够响应响应式状态的变化。
6.  **测试**：逐步测试重构后的组件，确保行为与重构前一致。

# 四、渐进式重构策略

一次只重构一个页面或一个模块的状态管理，逐步推进。

1.  **选择起点**：从状态逻辑相对简单、独立的页面或模块开始重构。避免一开始就处理极其复杂的状态依赖。
2.  **模块化状态**：为每个主要模块或页面创建独立的响应式状态对象（例如 `userState`, `productState`, `orderState`）。这有助于保持状态组织的清晰度和模块化 。
3.  **混合使用**：在过渡期，允许一个应用中同时存在 `@formily/reactive` 状态和传统的 `useState`/`useReducer` 状态。未被重构的组件继续使用原有的状态管理方式。
4.  **状态传递**：如果重构的模块需要与未重构的父组件或子组件共享状态，可以将响应式对象的特定属性或方法通过 props 传递。未重构的组件仍然可以读取这些值或调用方法，但它们不会对响应式对象其他部分的变化做出反应（除非父组件重新渲染）。
5.  **使用 Context 提供状态**：对于需要在组件树深层共享的响应式状态，可以结合 React Context 。
```tsx
// 创建 Context
const UserStateContext = React.createContext();

// 在应用顶层提供状态
function App() {
  return (
    <UserStateContext.Provider value={userState}>
      <UserProfile />
      {/* 其他组件 */}
    </UserStateContext.Provider>
  );
}

// 在子组件中消费状态（即使未被 observer 包裹，也能通过 Context 取到值，但不会响应更新）
const SomeChild = () => {
  const userState = useContext(UserStateContext);
  // ... 但此组件不会因 userState 变化而重新渲染，除非它被 observer 包裹
};
```
6.  **优先重构只读消费的组件**：如果一个组件主要是**读取**和显示状态，而不是修改它，优先将其重构为 `observer` 组件。这通常风险较小。
7.  **后重构复杂逻辑**：对于包含复杂副作用或异步操作的逻辑，可以稍后进行重构，先确保基础状态响应正常工作。
8.  **工具函数辅助**：如果原有代码大量使用了 `useCallback`、`useMemo`，评估其必要性。`@formily/reactive` 的响应式机制可能会减少对它们的依赖，但并非完全不需要。必要时保留。

通过以上方案，你可以系统地将基于 React Hooks 的状态管理逐步迁移至 `@formily/reactive`，享受其带来的响应式编程体验和潜在的性能 benefits，同时控制重构风险和成本。记住**逐步推进，充分测试**。

## 五、参考文档
- [@formily/reactive](https://github.com/alibaba/formily/tree/main/packages/reactive)
- [@formily/reactive-react](https://github.com/alibaba/formily/tree/main/packages/reactive-react)

### 重构原则

1. 简单的hooks逻辑使用单独的hooks实现，不要使用 `@formily/reactive` 和 `observer` 包裹组件
2. 复杂的状态管理，使用 `@formily/reactive` 和 `observer` 包裹组件