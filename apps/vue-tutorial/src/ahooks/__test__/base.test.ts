import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import {
  useToggle,
  useBoolean,
  useCounter,
  useLocalStorageState,
  useSessionStorageState,
  useUpdateEffect,
  useMount,
  useUnmount,
  useTimeout,
  useInterval,
  useEventListener,
  useClickAway,
  useKeyPress,
  useCopyToClipboard,
  useTitle,
  useFavicon,
  useFullscreen,
  useNetwork,
  useBattery
} from '../base';

// 创建一个测试组件
const createTestComponent = (setup: () => any) => ({
  setup,
  template: '<div></div>'
});

describe('useToggle', () => {
  it('should toggle between default values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, toggle] = useToggle(false);

      return {
        state,
        toggle
      };
    }));

    expect(wrapper.vm.state).toBe(false);

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe(true);

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe(false);
  });

  it('should toggle between custom values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, toggle] = useToggle('hello', 'world');

      return {
        state,
        toggle
      };
    }));

    expect(wrapper.vm.state).toBe('hello');

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe('world');

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe('hello');
  });

  it('should set specific value', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, toggle] = useToggle(false, true);

      return {
        state,
        toggle
      };
    }));

    expect(wrapper.vm.state).toBe(false);

    await wrapper.vm.toggle(true);
    expect(wrapper.vm.state).toBe(true);

    await wrapper.vm.toggle(false);
    expect(wrapper.vm.state).toBe(false);
  });
});

describe('useBoolean', () => {
  it('should initialize with default value', () => {
    const wrapper = mount(createTestComponent(() => {
      const { state, toggle, setTrue, setFalse } = useBoolean();

      return {
        state,
        toggle,
        setTrue,
        setFalse
      };
    }));

    expect(wrapper.vm.state).toBe(false);
  });

  it('should initialize with custom value', () => {
    const wrapper = mount(createTestComponent(() => {
      const { state, toggle, setTrue, setFalse } = useBoolean(true);

      return {
        state,
        toggle,
        setTrue,
        setFalse
      };
    }));

    expect(wrapper.vm.state).toBe(true);
  });

  it('should toggle value', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { state, toggle, setTrue, setFalse } = useBoolean(false);

      return {
        state,
        toggle,
        setTrue,
        setFalse
      };
    }));

    expect(wrapper.vm.state).toBe(false);

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe(true);

    await wrapper.vm.toggle();
    expect(wrapper.vm.state).toBe(false);
  });

  it('should set to true', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { state, toggle, setTrue, setFalse } = useBoolean(false);

      return {
        state,
        toggle,
        setTrue,
        setFalse
      };
    }));

    expect(wrapper.vm.state).toBe(false);

    await wrapper.vm.setTrue();
    expect(wrapper.vm.state).toBe(true);
  });

  it('should set to false', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { state, toggle, setTrue, setFalse } = useBoolean(true);

      return {
        state,
        toggle,
        setTrue,
        setFalse
      };
    }));

    expect(wrapper.vm.state).toBe(true);

    await wrapper.vm.setFalse();
    expect(wrapper.vm.state).toBe(false);
  });
});

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter();

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(0);
  });

  it('should initialize with custom value', () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(10);

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(10);
  });

  it('should increment counter', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(0);

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(0);

    await wrapper.vm.inc();
    expect(wrapper.vm.current).toBe(1);

    await wrapper.vm.inc(5);
    expect(wrapper.vm.current).toBe(6);
  });

  it('should decrement counter', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(10);

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(10);

    await wrapper.vm.dec();
    expect(wrapper.vm.current).toBe(9);

    await wrapper.vm.dec(5);
    expect(wrapper.vm.current).toBe(4);
  });

  it('should set counter to specific value', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(0);

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(0);

    await wrapper.vm.set(100);
    expect(wrapper.vm.current).toBe(100);
  });

  it('should respect min and max options', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(5, { min: 0, max: 10 });

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(5);

    await wrapper.vm.inc(10);
    expect(wrapper.vm.current).toBe(10); // Max value

    await wrapper.vm.dec(20);
    expect(wrapper.vm.current).toBe(0); // Min value

    await wrapper.vm.set(15);
    expect(wrapper.vm.current).toBe(10); // Max value

    await wrapper.vm.set(-5);
    expect(wrapper.vm.current).toBe(0); // Min value
  });

  it('should reset counter to initial value', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { current, inc, dec, set, reset } = useCounter(5);

      return {
        current,
        inc,
        dec,
        set,
        reset
      };
    }));

    expect(wrapper.vm.current).toBe(5);

    await wrapper.vm.inc(10);
    expect(wrapper.vm.current).toBe(15);

    await wrapper.vm.reset();
    expect(wrapper.vm.current).toBe(5);
  });
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

describe('useLocalStorageState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    mockLocalStorage.clear();
  });

  it('should initialize with default value', () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, setState] = useLocalStorageState('test-key', 'default-value');

      return {
        state,
        setState
      };
    }));

    expect(wrapper.vm.state).toBe('default-value');
  });

  it('should update value in localStorage', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, setState] = useLocalStorageState('test-key', 'default-value');

      return {
        state,
        setState
      };
    }));

    expect(wrapper.vm.state).toBe('default-value');

    await wrapper.vm.setState('new-value');
    expect(wrapper.vm.state).toBe('new-value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should update value with function', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, setState] = useLocalStorageState<number>('test-key', 0);

      return {
        state,
        setState
      };
    }));

    expect(wrapper.vm.state).toBe(0);

    await wrapper.vm.setState(prev => prev + 1);
    expect(wrapper.vm.state).toBe(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(1));
  });
});

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

describe('useSessionStorageState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
    mockSessionStorage.clear();
  });

  it('should initialize with default value', () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, setState] = useSessionStorageState('test-key', 'default-value');

      return {
        state,
        setState
      };
    }));

    expect(wrapper.vm.state).toBe('default-value');
  });

  it('should update value in sessionStorage', async () => {
    const wrapper = mount(createTestComponent(() => {
      const [state, setState] = useSessionStorageState('test-key', 'default-value');

      return {
        state,
        setState
      };
    }));

    expect(wrapper.vm.state).toBe('default-value');

    await wrapper.vm.setState('new-value');
    expect(wrapper.vm.state).toBe('new-value');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });
});

describe('useUpdateEffect', () => {
  it('should not run on mount', () => {
    const fn = vi.fn();

    mount(createTestComponent(() => {
      useUpdateEffect(fn);
      return {};
    }));

    expect(fn).not.toHaveBeenCalled();
  });

  it('should run on update', async () => {
    const fn = vi.fn();
    const dep = ref(0);

    const wrapper = mount(createTestComponent(() => {
      useUpdateEffect(fn, [dep.value]);

      return {
        dep
      };
    }));

    expect(fn).not.toHaveBeenCalled();

    dep.value = 1;
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(1);

    dep.value = 2;
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('useMount', () => {
  it('should run on mount', () => {
    const fn = vi.fn();

    mount(createTestComponent(() => {
      useMount(fn);
      return {};
    }));

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useUnmount', () => {
  it('should run on unmount', () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      useUnmount(fn);
      return {};
    }));

    expect(fn).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call function after delay', () => {
    const fn = vi.fn();

    mount(createTestComponent(() => {
      const { clear, set } = useTimeout(fn, 1000);

      return {
        clear,
        set
      };
    }));

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should clear timeout', () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const { clear, set } = useTimeout(fn, 1000);

      return {
        clear,
        set
      };
    }));

    expect(fn).not.toHaveBeenCalled();

    wrapper.vm.clear();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should reset timeout', () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const { clear, set } = useTimeout(fn, 1000);

      return {
        clear,
        set
      };
    }));

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    wrapper.vm.set();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call function periodically', () => {
    const fn = vi.fn();

    mount(createTestComponent(() => {
      const { clear, set } = useInterval(fn, 1000);

      return {
        clear,
        set
      };
    }));

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should clear interval', () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const { clear, set } = useInterval(fn, 1000);

      return {
        clear,
        set
      };
    }));

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    wrapper.vm.clear();
    vi.advanceTimersByTime(2000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should support immediate option', () => {
    const fn = vi.fn();

    mount(createTestComponent(() => {
      const { clear, set } = useInterval(fn, 1000, { immediate: true });

      return {
        clear,
        set
      };
    }));

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// More tests can be added for other hooks as needed
