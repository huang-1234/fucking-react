# AHooks 实现文档

本项目模仿 [ahooks](https://ahooks.js.org/zh-CN/hooks/use-request/index) 的所有 hook，使用 React hooks 语法全部实现一遍。

## 文件结构

- `base.ts` - 基础 hooks 实现
- `advance.ts` - 高阶 hooks 实现
- `readme.md` - 使用文档

## 基础 Hooks (base.ts)

### State Hooks

#### useToggle
用于在两个状态值间切换的 Hook。

```typescript
import { useToggle } from './base';

function Demo() {
  const [state, toggle] = useToggle();
  const [state2, toggle2] = useToggle('Hello', 'World');

  return (
    <div>
      <p>Boolean toggle: {state.toString()}</p>
      <button onClick={() => toggle()}>Toggle</button>
      <button onClick={() => toggle(true)}>Set True</button>
      
      <p>String toggle: {state2}</p>
      <button onClick={() => toggle2()}>Toggle String</button>
    </div>
  );
}
```

#### useBoolean
管理 boolean 状态的 Hook。

```typescript
import { useBoolean } from './base';

function Demo() {
  const [state, { toggle, set, setTrue, setFalse }] = useBoolean();

  return (
    <div>
      <p>State: {state.toString()}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={setTrue}>Set True</button>
      <button onClick={setFalse}>Set False</button>
      <button onClick={() => set(true)}>Set True</button>
    </div>
  );
}
```

#### useSetState
管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致。

```typescript
import { useSetState } from './base';

function Demo() {
  const [state, setState] = useSetState({
    hello: '',
    count: 0,
  });

  return (
    <div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button onClick={() => setState({ hello: 'world' })}>
        Set hello
      </button>
      <button onClick={() => setState({ count: state.count + 1 })}>
        Count + 1
      </button>
      <button onClick={() => setState(prev => ({ count: prev.count + 1 }))}>
        Count + 1 (function)
      </button>
    </div>
  );
}
```

#### useGetState
获取当前最新值的 Hook。

```typescript
import { useGetState } from './base';

function Demo() {
  const [count, setCount, getCount] = useGetState(0);

  const handleAlertClick = () => {
    setTimeout(() => {
      alert(`Count: ${getCount()}`);
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={handleAlertClick}>Alert count after 3s</button>
    </div>
  );
}
```

### Effect Hooks

#### useUpdateEffect
忽略首次执行，只在依赖更新时执行的 useEffect Hook。

```typescript
import { useUpdateEffect } from './base';

function Demo() {
  const [count, setCount] = useState(0);
  const [effectCount, setEffectCount] = useState(0);

  useUpdateEffect(() => {
    setEffectCount(c => c + 1);
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Effect Count: {effectCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Update count</button>
    </div>
  );
}
```

#### useMount
只在组件初始化时执行的 Hook。

```typescript
import { useMount } from './base';

function Demo() {
  useMount(() => {
    console.log('Component mounted');
  });

  return <div>Check console</div>;
}
```

#### useUnmount
在组件卸载时执行的 Hook。

```typescript
import { useUnmount } from './base';

function Demo() {
  useUnmount(() => {
    console.log('Component will unmount');
  });

  return <div>Component</div>;
}
```

### Dom Hooks

#### useEventListener
优雅的使用 addEventListener 的 Hook。

```typescript
import { useEventListener } from './base';

function Demo() {
  const ref = useRef<HTMLDivElement>(null);

  useEventListener('click', () => {
    console.log('Window clicked');
  }, window);

  useEventListener('click', () => {
    console.log('Div clicked');
  }, ref);

  return <div ref={ref}>Click me or window</div>;
}
```

#### useClickAway
监听目标元素外的点击事件。

```typescript
import { useClickAway } from './base';

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const [counter, setCounter] = useState(0);

  useClickAway(() => {
    setCounter(s => s + 1);
  }, ref);

  return (
    <div>
      <div ref={ref} style={{ width: 200, height: 200, background: 'red' }}>
        Box
      </div>
      <p>Counter: {counter}</p>
    </div>
  );
}
```

### Advanced State

#### usePrevious
保存上一次状态的 Hook。

```typescript
import { usePrevious } from './base';

function Demo() {
  const [count, setCount] = useState(0);
  const previous = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previous}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

#### useRafState
只在 requestAnimationFrame callback 时更新 state，一般用于性能优化。

```typescript
import { useRafState } from './base';

function Demo() {
  const [state, setState] = useRafState(0);

  const handleClick = () => {
    // 多次调用只会在下一帧更新一次
    setState(1);
    setState(2);
    setState(3);
  };

  return (
    <div>
      <p>State: {state}</p>
      <button onClick={handleClick}>Update multiple times</button>
    </div>
  );
}
```

#### useSafeState
用法与 React.useState 完全一样，但是在组件卸载后异步回调内的 setState 不再执行。

```typescript
import { useSafeState } from './base';

function Demo() {
  const [state, setState] = useSafeState(0);

  const handleAsync = () => {
    setTimeout(() => {
      setState(1); // 如果组件已卸载，这里不会执行
    }, 1000);
  };

  return (
    <div>
      <p>State: {state}</p>
      <button onClick={handleAsync}>Async update</button>
    </div>
  );
}
```

### Lifecycle

#### useCreation
强制子组件重新渲染的 Hook。

```typescript
import { useCreation } from './base';

function Demo() {
  const [count, setCount] = useState(0);
  
  const expensiveValue = useCreation(() => {
    console.log('Expensive calculation');
    return count * 2;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

#### useLatest
返回当前最新值的 Hook，可以避免闭包问题。

```typescript
import { useLatest } from './base';

function Demo() {
  const [count, setCount] = useState(0);
  const latestCountRef = useLatest(count);

  const handleClick = () => {
    setTimeout(() => {
      alert(`Latest count: ${latestCountRef.current}`);
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={handleClick}>Alert latest count after 3s</button>
    </div>
  );
}
```

### Utility Hooks

#### useCounter
管理计数器的 Hook。

```typescript
import { useCounter } from './base';

function Demo() {
  const [current, { inc, dec, set, reset }] = useCounter(100);

  return (
    <div>
      <p>Current: {current}</p>
      <button onClick={() => inc()}>+1</button>
      <button onClick={() => dec()}>-1</button>
      <button onClick={() => inc(10)}>+10</button>
      <button onClick={() => dec(10)}>-10</button>
      <button onClick={() => set(200)}>Set 200</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

#### useLocalStorageState
将状态存储在 localStorage 中的 Hook。

```typescript
import { useLocalStorageState } from './base';

function Demo() {
  const [message, setMessage] = useLocalStorageState('use-local-storage-state-demo1', 'Hello');

  return (
    <div>
      <input
        value={message || ''}
        placeholder="Please enter some words..."
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={() => setMessage('Hello')}>Reset</button>
    </div>
  );
}
```

## 高阶 Hooks (advance.ts)

### Async Hooks

#### useRequest
强大的异步数据管理的 Hook。

```typescript
import { useRequest } from './advance';

function getUsername(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`User${Date.now()}`);
    }, 1000);
  });
}

function Demo() {
  const { data, error, loading, run, refresh } = useRequest(getUsername);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <p>Username: {data}</p>
      <button onClick={run}>Reload</button>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Performance Hooks

#### useDebounce
用来处理防抖值的 Hook。

```typescript
import { useDebounce } from './advance';

function Demo() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Typed value"
      />
      <p>DebouncedValue: {debouncedValue}</p>
    </div>
  );
}
```

#### useDebounceFn
用来处理防抖函数的 Hook。

```typescript
import { useDebounceFn } from './advance';

function Demo() {
  const [value, setValue] = useState(0);
  const { run } = useDebounceFn(() => {
    setValue(value + 1);
  }, 500);

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={run}>Click fast!</button>
    </div>
  );
}
```

### Scene Hooks

#### useVirtualList
提供虚拟化列表能力的 Hook。

```typescript
import { useVirtualList } from './advance';

function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const originalList = Array.from(Array(99999).keys());
  
  const [list, wrapperStyle] = useVirtualList(originalList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 60,
    overscan: 10,
  });

  return (
    <div>
      <div ref={containerRef} style={{ height: '300px', overflow: 'auto' }}>
        <div ref={wrapperRef} style={wrapperStyle}>
          {list.map(({ data, index }) => (
            <div
              key={index}
              style={{
                height: 60,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #e8e8e8',
                marginBottom: 8,
              }}
            >
              Row: {data}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### usePagination
分页 Hook。

```typescript
import { usePagination } from './advance';

async function getUserList(params: { current: number; pageSize: number }) {
  return new Promise<{ list: any[]; total: number }>((resolve) => {
    setTimeout(() => {
      const { current, pageSize } = params;
      const list = Array.from(Array(pageSize).keys()).map(i => ({
        id: (current - 1) * pageSize + i,
        name: `User ${(current - 1) * pageSize + i}`,
      }));
      resolve({
        list,
        total: 55,
      });
    }, 1000);
  });
}

function Demo() {
  const {
    data,
    loading,
    current,
    pageSize,
    total,
    changeCurrent,
    changePageSize,
  } = usePagination(getUserList, {
    defaultPageSize: 5,
  });

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      
      <div>
        <button
          disabled={current <= 1}
          onClick={() => changeCurrent(current - 1)}
        >
          Previous
        </button>
        <span>
          {current} / {Math.ceil(total / pageSize)}
        </span>
        <button
          disabled={current >= Math.ceil(total / pageSize)}
          onClick={() => changeCurrent(current + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## 特性

- ✅ 完全使用 TypeScript 编写，提供完整的类型定义
- ✅ 支持 SSR
- ✅ 特殊场景的性能优化
- ✅ 丰富的基础 Hooks
- ✅ 包含大量提炼自业务的高级 Hooks
- ✅ 使用 React Hooks 规范，易于学习和使用

## 安装使用

```bash
# 直接导入使用
import { useToggle, useRequest } from './ahooks/sdt/base';
import { useRequest, useDebounce } from './ahooks/sdt/advance';
```

### Sensor Hooks

#### useSize
监听 DOM 节点尺寸变化的 Hook。

```typescript
import { useSize } from './base';

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '200px',
          background: 'red',
        }}
      >
        <p>Width: {size.width}px</p>
        <p>Height: {size.height}px</p>
      </div>
    </div>
  );
}
```

#### useHover
监听 DOM 元素是否有鼠标悬停。

```typescript
import { useHover } from './base';

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const isHovering = useHover(ref);

  return (
    <div ref={ref} style={{ background: isHovering ? 'blue' : 'red' }}>
      {isHovering ? 'Hovering' : 'Not hovering'}
    </div>
  );
}
```

#### useMouse
监听鼠标位置。

```typescript
import { useMouse } from './base';

function Demo() {
  const mouse = useMouse();

  return (
    <div>
      <p>Mouse position:</p>
      <p>x: {mouse.clientX}</p>
      <p>y: {mouse.clientY}</p>
    </div>
  );
}
```

#### useKeyPress
监听键盘按键。

```typescript
import { useKeyPress } from './base';

function Demo() {
  const [counter, setCounter] = useState(0);

  useKeyPress('uparrow', () => {
    setCounter(s => s + 1);
  });

  useKeyPress('downarrow', () => {
    setCounter(s => s - 1);
  });

  return (
    <div>
      <p>Try pressing up/down arrow keys</p>
      <p>Counter: {counter}</p>
    </div>
  );
}
```

### Timer Hooks

#### useTimeout
一个可以处理 setTimeout 计时器函数的 Hook。

```typescript
import { useTimeout } from './base';

function Demo() {
  const [state, setState] = useState(1);
  
  useTimeout(() => {
    setState(state + 1);
  }, 3000);

  return <div>{state}</div>;
}
```

#### useInterval
一个可以处理 setInterval 的 Hook。

```typescript
import { useInterval } from './base';

function Demo() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <div>Count: {count}</div>;
}
```

#### useCountDown
一个用于管理倒计时的 Hook。

```typescript
import { useCountDown } from './base';

function Demo() {
  const [timeLeft, { start, stop }] = useCountDown({
    onEnd: () => {
      console.log('Countdown ended');
    },
  });

  return (
    <div>
      <p>Time left: {timeLeft}s</p>
      <button onClick={() => start(Date.now() + 60000)}>
        Start 60s countdown
      </button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

## 高阶 Hooks 补充

### Form Hooks

#### useAntdTable
封装了常用的 Ant Design Form 与 Table 联动逻辑。

```typescript
import { useAntdTable } from './advance';

function Demo() {
  const [form] = Form.useForm();
  
  const { tableProps, search, reset } = useAntdTable(
    async ({ current, pageSize, name }) => {
      const result = await getUserList({ current, pageSize, name });
      return {
        list: result.data,
        total: result.total,
      };
    },
    {
      defaultPageSize: 5,
      form,
    }
  );

  return (
    <div>
      <Form form={form} onFinish={search}>
        <Form.Item name="name" label="Name">
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button onClick={reset}>Reset</Button>
        </Form.Item>
      </Form>
      
      <Table {...tableProps} rowKey="id" />
    </div>
  );
}
```

### Network Hooks

#### useWebSocket
WebSocket Hook。

```typescript
import { useWebSocket } from './advance';

function Demo() {
  const {
    readyState,
    sendMessage,
    latestMessage,
    disconnect,
    connect,
  } = useWebSocket('ws://localhost:8080', {
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Received:', message.data),
  });

  return (
    <div>
      <p>ReadyState: {readyState}</p>
      <p>Latest message: {latestMessage?.data}</p>
      <button onClick={() => sendMessage('Hello')}>Send Hello</button>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Advanced Scene Hooks

#### useDrop & useDrag
处理元素拖拽的 Hook。

```typescript
import { useDrop, useDrag } from './advance';

function DragItem({ data }: { data: any }) {
  const [dragProps, { isDragging }] = useDrag(data);

  return (
    <div
      {...dragProps}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: 16,
        margin: 8,
        background: 'lightblue',
        cursor: 'move',
      }}
    >
      Drag me: {data.name}
    </div>
  );
}

function DropZone() {
  const [droppedItems, setDroppedItems] = useState([]);
  
  const [dropProps, { isHovering }] = useDrop(
    (data) => {
      setDroppedItems(prev => [...prev, data]);
    }
  );

  return (
    <div
      {...dropProps}
      style={{
        minHeight: 200,
        padding: 16,
        border: '2px dashed #ccc',
        background: isHovering ? '#f0f0f0' : 'white',
      }}
    >
      Drop zone
      {droppedItems.map((item, index) => (
        <div key={index}>Dropped: {item.name}</div>
      ))}
    </div>
  );
}
```

#### useSelections
常见联动 Checkbox 逻辑封装。

```typescript
import { useSelections } from './advance';

function Demo() {
  const list = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  const {
    selected,
    allSelected,
    partiallySelected,
    toggleAll,
    toggle,
  } = useSelections(list);

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            ref={input => {
              if (input) input.indeterminate = partiallySelected;
            }}
            onChange={toggleAll}
          />
          Select All
        </label>
      </div>
      
      {list.map(item => (
        <div key={item.id}>
          <label>
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => toggle(item)}
            />
            {item.name}
          </label>
        </div>
      ))}
      
      <p>Selected: {selected.map(item => item.name).join(', ')}</p>
    </div>
  );
}
```

## 完整功能列表

### 基础 Hooks (base.ts)

**State Hooks:**
- `useToggle` - 状态切换
- `useBoolean` - 布尔状态管理
- `useSetState` - 对象状态管理
- `useGetState` - 获取最新状态值

**Effect Hooks:**
- `useUpdateEffect` - 忽略首次执行的 useEffect
- `useMount` - 组件挂载时执行
- `useUnmount` - 组件卸载时执行
- `useUnmountedRef` - 获取组件卸载状态

**Dom Hooks:**
- `useEventListener` - 事件监听
- `useClickAway` - 点击外部区域

**Advanced State:**
- `usePrevious` - 获取上一次的值
- `useRafState` - requestAnimationFrame 优化的状态
- `useSafeState` - 安全的状态更新

**Lifecycle:**
- `useCreation` - 强制重新创建
- `useLatest` - 获取最新值的引用

**Utility Hooks:**
- `useCounter` - 计数器
- `useLocalStorageState` - localStorage 状态
- `useSessionStorageState` - sessionStorage 状态
- `useCookieState` - Cookie 状态

**Sensor Hooks:**
- `useSize` - 元素尺寸监听
- `useHover` - 鼠标悬停状态
- `useMouse` - 鼠标位置
- `useScroll` - 滚动位置
- `useKeyPress` - 键盘按键
- `useFocusWithin` - 焦点区域检测

**Timer Hooks:**
- `useTimeout` - setTimeout 封装
- `useInterval` - setInterval 封装
- `useCountDown` - 倒计时

### 高阶 Hooks (advance.ts)

**Async Hooks:**
- `useRequest` - 异步数据管理

**Performance Hooks:**
- `useDebounce` - 防抖值
- `useThrottle` - 节流值
- `useDebounceFn` - 防抖函数
- `useThrottleFn` - 节流函数

**Scene Hooks:**
- `useVirtualList` - 虚拟列表
- `useInfiniteScroll` - 无限滚动
- `usePagination` - 分页

**Form Hooks:**
- `useAntdTable` - Ant Design 表格表单联动

**Network Hooks:**
- `useWebSocket` - WebSocket 连接

**Advanced Scene Hooks:**
- `useDrop` - 拖拽放置
- `useDrag` - 拖拽
- `useSelections` - 多选逻辑

## 注意事项

1. 所有 Hooks 都遵循 React Hooks 的使用规则
2. 在组件卸载时会自动清理副作用，避免内存泄漏
3. 提供了完整的 TypeScript 类型支持
4. 部分 Hooks 需要在浏览器环境中使用（如 localStorage 相关）
5. 网络相关 Hooks 需要相应的服务端支持
6. 拖拽相关 Hooks 需要现代浏览器支持
