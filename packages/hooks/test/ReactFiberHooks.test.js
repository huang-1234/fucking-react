/**
 * Hooks链表测试
 */

const {
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  renderWithHooks,
  createFunctionComponentFiber,
  _internals
} = require('../index');

describe('Hooks链表测试', () => {
  let fiber;
  let TestComponent;

  beforeEach(() => {
    // 创建测试组件的Fiber节点
    TestComponent = jest.fn();
    fiber = createFunctionComponentFiber(TestComponent, {});
  });

  test('useState基本功能', () => {
    TestComponent.mockImplementation(() => {
      const [count, setCount] = useState(0);
      return { count, setCount };
    });

    // 首次渲染
    const result1 = renderWithHooks(fiber, TestComponent, {});

    expect(result1.count).toBe(0);
    expect(typeof result1.setCount).toBe('function');

    // 模拟状态更新
    result1.setCount(1);

    // 创建工作中的Fiber
    const workInProgressFiber = { ...fiber, alternate: fiber };
    fiber.alternate = workInProgressFiber;

    // 再次渲染
    const result2 = renderWithHooks(workInProgressFiber, TestComponent, {});

    expect(result2.count).toBe(1);
  });

  test('多个Hook的链表结构', () => {
    TestComponent.mockImplementation(() => {
      const [count, setCount] = useState(0);
      const [text, setText] = useState('hello');
      const doubleCount = useMemo(() => count * 2, [count]);

      return { count, setCount, text, setText, doubleCount };
    });

    // 渲染组件
    renderWithHooks(fiber, TestComponent, {});

    // 检查Hooks链表
    let hookNode = fiber.memoizedState;
    expect(hookNode).not.toBeNull();

    // 第一个Hook (useState - count)
    expect(hookNode.memoizedState).toBe(0);
    expect(hookNode.next).not.toBeNull();

    // 第二个Hook (useState - text)
    hookNode = hookNode.next;
    expect(hookNode.memoizedState).toBe('hello');
    expect(hookNode.next).not.toBeNull();

    // 第三个Hook (useMemo - doubleCount)
    hookNode = hookNode.next;
    expect(hookNode.memoizedState.value).toBe(0);
    expect(hookNode.next).toBeNull();
  });

  test('useReducer功能', () => {
    const reducer = (state, action) => {
      switch (action.type) {
        case 'increment':
          return state + 1;
        case 'decrement':
          return state - 1;
        default:
          return state;
      }
    };

    TestComponent.mockImplementation(() => {
      const [state, dispatch] = useReducer(reducer, 0);
      return { state, dispatch };
    });

    // 首次渲染
    const result1 = renderWithHooks(fiber, TestComponent, {});

    expect(result1.state).toBe(0);

    // 模拟dispatch
    result1.dispatch({ type: 'increment' });

    // 创建工作中的Fiber
    const workInProgressFiber = { ...fiber, alternate: fiber };
    fiber.alternate = workInProgressFiber;

    // 再次渲染
    const result2 = renderWithHooks(workInProgressFiber, TestComponent, {});

    expect(result2.state).toBe(1);
  });

  test('useEffect依赖检查', () => {
    const cleanup = jest.fn();
    const effect = jest.fn().mockReturnValue(cleanup);

    TestComponent.mockImplementation(({ dep }) => {
      useEffect(effect, [dep]);
      return {};
    });

    // 首次渲染，依赖为1
    renderWithHooks(fiber, TestComponent, { dep: 1 });

    // 模拟副作用执行
    const hookState = fiber.memoizedState.memoizedState;
    hookState.cleanup = hookState.create();

    // 依赖不变，不应该重新执行
    const workInProgressFiber1 = { ...fiber, alternate: fiber };
    fiber.alternate = workInProgressFiber1;

    renderWithHooks(workInProgressFiber1, TestComponent, { dep: 1 });

    // 依赖变化，应该重新执行
    const workInProgressFiber2 = { ...workInProgressFiber1, alternate: fiber };
    fiber.alternate = workInProgressFiber2;

    renderWithHooks(workInProgressFiber2, TestComponent, { dep: 2 });

    // 检查副作用执行情况
    expect(effect).toHaveBeenCalledTimes(2); // 首次渲染和依赖变化时
    expect(cleanup).toHaveBeenCalledTimes(1); // 依赖变化前清理
  });
});