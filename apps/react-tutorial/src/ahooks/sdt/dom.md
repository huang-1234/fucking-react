基于 React hooks 和浏览器 DOM API，我可以为你提供一系列实用的自定义 DOM Hooks。这些 Hooks 能帮助你更高效地处理 DOM 操作、事件监听、元素状态管理等常见需求。下面我将它们分类介绍，并提供实现代码和使用示例。

# 🌟 与 DOM API 相关的 React Hooks 集合

下面是一个汇总表格，帮助你快速了解这些 Hooks 的功能：

| Hook 名称 | 分类 | 功能描述 |
| :--- | :--- | :--- |
| `useEventListener` | 事件处理 | 为元素添加事件监听器 |
| `useClickAway` | 事件处理 | 检测点击元素外部的事件 |
| `useKeyPress` | 事件处理 | 监听键盘按键事件 |
| `useElementSize` | 元素状态 | 获取元素的尺寸变化 |
| `useElementVisibility` | 元素状态 | 检测元素在视口内的可见性 |
| `useDocumentVisibility` | 元素状态 | 监听文档可见性变化 |
| `useDrag` | 拖拽交互 | 处理元素拖拽逻辑 |
| `useDrop` | 拖拽交互 | 处理拖拽放置逻辑 |
| `useFullscreen` | 视口与布局 | 控制元素进入/退出全屏模式 |
| `useMousePosition` | 视口与布局 | 跟踪鼠标在元素内/文档内的位置 |
| `useScrollPosition` | 视口与布局 | 获取元素的滚动位置 |
| `useClipboard` | 实用工具 | 操作剪贴板（复制/粘贴） |
| `useTitle` | 实用工具 | 动态设置页面标题 |
| `useFavicon` | 实用工具 | 动态修改网站图标 |

接下来，我们详细看看每一类的具体实现和应用。

## 1. 事件处理 Hooks

### `useEventListener` - 事件监听器
这个 Hook 简化了为 DOM 元素添加和移除事件监听器的过程。
```javascript
import { useRef, useEffect } from 'react';

const useEventListener = (eventType, handler, element = window, options) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current || element;
    if (!targetElement?.addEventListener) return;

    const listener = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventType, listener, options);

    return () => {
      targetElement.removeEventListener(eventType, listener, options);
    };
  }, [eventType, element, options]);
};

export default useEventListener;
```
**使用示例**：
```jsx
import React, { useState } from 'react';
import useEventListener from './useEventListener';

const ClickLogger = () => {
  const [clickCount, setClickCount] = useState(0);

  useEventListener('click', () => {
    setClickCount(prev => prev + 1);
  }, document);

  return <div>文档被点击了 {clickCount} 次</div>;
};
```

### `useClickAway` - 点击外部检测
检测点击是否发生在特定元素外部，常用于下拉菜单、模态框等场景。
```javascript
import { useEffect } from 'react';

const useClickAway = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useClickAway;
```
**使用示例**：
```jsx
import React, { useRef, useState } from 'react';
import useClickAway from './useClickAway';

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickAway(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        下拉菜单
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          border: '1px solid #ccc'
        }}>
          <div>菜单项 1</div>
          <div>菜单项 2</div>
          <div>菜单项 3</div>
        </div>
      )}
    </div>
  );
};
```

### `useKeyPress` - 键盘按键监听
监听特定键盘按键事件。
```javascript
import { useState, useEffect } from 'react';

const useKeyPress = (targetKey, element = window) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event) => {
      if (event.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    element.addEventListener('keydown', downHandler);
    element.addEventListener('keyup', upHandler);

    return () => {
      element.removeEventListener('keydown', downHandler);
      element.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, element]);

  return keyPressed;
};

export default useKeyPress;
```
**使用示例**：
```jsx
import React from 'react';
import useKeyPress from './useKeyPress';

const App = () => {
  const enterPressed = useKeyPress('Enter');

  return (
    <div>
      {enterPressed ? '回车键被按下' : '按回车键'}
    </div>
  );
};
```

## 2. 元素状态 Hooks

### `useElementSize` - 元素尺寸监测
监测 DOM 元素的尺寸变化。
```javascript
import { useState, useLayoutEffect } from 'react';

const useElementSize = (ref) => {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        });
      }
    };

    updateSize();

    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [ref]);

  return size;
};

export default useElementSize;
```
**使用示例**：
```jsx
import React, { useRef } from 'react';
import useElementSize from './useElementSize';

const ResizableBox = () => {
  const boxRef = useRef(null);
  const size = useElementSize(boxRef);

  return (
    <div ref={boxRef} style={{ padding: '20px', border: '1px solid #ccc' }}>
      这个元素的宽度: {size.width}px, 高度: {size.height}px
    </div>
  );
};
```

### `useElementVisibility` - 元素可见性监测
监测元素是否在视口内可见。
```javascript
import { useState, useEffect } from 'react';

const useElementVisibility = (ref, threshold = 0) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, threshold]);

  return isVisible;
};

export default useElementVisibility;
```
**使用示例**：
```jsx
import React, { useRef } from 'react';
import useElementVisibility from './useElementVisibility';

const LazyImage = ({ src, alt }) => {
  const imgRef = useRef(null);
  const isVisible = useElementVisibility(imgRef);

  return (
    <div ref={imgRef}>
      {isVisible ? (
        <img src={src} alt={alt} />
      ) : (
        <div>加载中...</div>
      )}
    </div>
  );
};
```

### `useDocumentVisibility` - 文档可见性监听
监听页面可见性状态（切换标签页、最小化窗口等）。
```javascript
import { useState, useEffect } from 'react';

const useDocumentVisibility = () => {
  const [visibilityState, setVisibilityState] = useState(document.visibilityState);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return visibilityState;
};

export default useDocumentVisibility;
```
**使用示例**：
```jsx
import React from 'react';
import useDocumentVisibility from './useDocumentVisibility';

const PageVisibility = () => {
  const visibility = useDocumentVisibility();

  return (
    <div>
      当前页面状态: {visibility}
      {visibility === 'hidden' && <p>页面不在活跃状态</p>}
    </div>
  );
};
```

## 3. 拖拽交互 Hooks

### `useDrag` - 元素拖拽
处理元素的拖拽逻辑。
```javascript
import { useRef, useState, useEffect } from 'react';

const useDrag = (onDragStart, onDragEnd) => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleDragStart = (e) => {
      setIsDragging(true);
      onDragStart && onDragStart(e);
    };

    const handleDragEnd = (e) => {
      setIsDragging(false);
      onDragEnd && onDragEnd(e);
    };

    node.addEventListener('dragstart', handleDragStart);
    node.addEventListener('dragend', handleDragEnd);

    return () => {
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('dragend', handleDragEnd);
    };
  }, [onDragStart, onDragEnd]);

  return [ref, isDragging];
};

export default useDrag;
```

### `useDrop` - 拖拽放置区域
创建拖拽放置区域。
```javascript
import { useRef, useState, useEffect } from 'react';

const useDrop = (onDrop) => {
  const [isOver, setIsOver] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragLeave = () => {
      setIsOver(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsOver(false);
      onDrop && onDrop(e);
    };

    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('dragleave', handleDragLeave);
    node.addEventListener('drop', handleDrop);

    return () => {
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('dragleave', handleDragLeave);
      node.removeEventListener('drop', handleDrop);
    };
  }, [onDrop]);

  return [ref, isOver];
};

export default useDrop;
```
**使用示例**（结合 useDrag 和 useDrop）：
```jsx
import React, { useState } from 'react';
import useDrag from './useDrag';
import useDrop from './useDrop';

const DragAndDropExample = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [droppedItems, setDroppedItems] = useState([]);

  const [dragRef, isDragging] = useDrag((e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  });

  const [dropRef, isOver] = useDrop((e) => {
    const id = e.dataTransfer.getData('text/plain');
    const item = items.find((_, index) => index === parseInt(id));
    if (item) {
      setDroppedItems(prev => [...prev, item]);
    }
  });

  return (
    <div>
      <div>
        <h3>可拖拽项目</h3>
        {items.map((item, index) => (
          <div
            key={index}
            ref={dragRef}
            data-id={index}
            draggable
            style={{
              padding: '10px',
              margin: '5px',
              backgroundColor: isDragging ? '#e6f7ff' : '#f0f0f0',
              border: '1px dashed #ccc',
              cursor: 'move'
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <div
        ref={dropRef}
        style={{
          padding: '20px',
          margin: '10px',
          backgroundColor: isOver ? '#f6ffed' : '#f0f0f0',
          border: '2px dashed #ccc',
          minHeight: '100px'
        }}
      >
        <h3>放置区域</h3>
        {droppedItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
};
```

## 4. 视口与布局 Hooks

### `useFullscreen` - 全屏控制
控制元素进入或退出全屏模式。
```javascript
import { useState, useCallback } from 'react';

const useFullscreen = (ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(() => {
    if (ref.current) {
      if (ref.current.requestFullscreen) {
        ref.current.requestFullscreen();
      } else if (ref.current.webkitRequestFullscreen) {
        ref.current.webkitRequestFullscreen();
      } else if (ref.current.msRequestFullscreen) {
        ref.current.msRequestFullscreen();
      }
    }
  }, [ref]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // 监听全屏变化事件
  useState(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
};

export default useFullscreen;
```
**使用示例**：
```jsx
import React, { useRef } from 'react';
import useFullscreen from './useFullscreen';

const FullscreenVideo = () => {
  const videoRef = useRef(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(videoRef);

  return (
    <div>
      <video
        ref={videoRef}
        src="/video.mp4"
        style={{ width: '100%' }}
        controls
      />
      <button onClick={toggleFullscreen}>
        {isFullscreen ? '退出全屏' : '进入全屏'}
      </button>
    </div>
  );
};
```

### `useMousePosition` - 鼠标位置跟踪
跟踪鼠标在元素内或文档内的位置。
```javascript
import { useState, useEffect } from 'react';

const useMousePosition = (ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref?.current || document;
    const updatePosition = (e) => {
      setPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    element.addEventListener('mousemove', updatePosition);

    return () => {
      element.removeEventListener('mousemove', updatePosition);
    };
  }, [ref]);

  return position;
};

export default useMousePosition;
```
**使用示例**：
```jsx
import React, { useRef } from 'react';
import useMousePosition from './useMousePosition';

const MouseTracker = () => {
  const containerRef = useRef(null);
  const { x, y } = useMousePosition(containerRef);

  return (
    <div ref={containerRef} style={{ height: '300px', border: '1px solid #ccc' }}>
      鼠标位置: X: {x}, Y: {y}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};
```

### `useScrollPosition` - 滚动位置监测
获取元素或文档的滚动位置。
```javascript
import { useState, useEffect } from 'react';

const useScrollPosition = (ref) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    const element = ref?.current || document;
    const updatePosition = () => {
      setScrollPosition({
        x: element.scrollLeft || window.pageXOffset,
        y: element.scrollTop || window.pageYOffset
      });
    };

    updatePosition();
    element.addEventListener('scroll', updatePosition);

    return () => {
      element.removeEventListener('scroll', updatePosition);
    };
  }, [ref]);

  return scrollPosition;
};

export default useScrollPosition;
```
**使用示例**：
```jsx
import React from 'react';
import useScrollPosition from './useScrollPosition';

const ScrollIndicator = () => {
  const { y } = useScrollPosition();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${(y / (document.body.scrollHeight - window.innerHeight)) * 100}%`,
      height: '5px',
      backgroundColor: 'blue'
    }} />
  );
};
```

## 5. 实用工具 Hooks

### `useClipboard` - 剪贴板操作
提供复制和读取剪贴板内容的功能。
```javascript
import { useState, useCallback } from 'react';

const useClipboard = () => {
  const [copiedText, setCopiedText] = useState('');

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }, []);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('读取剪贴板失败:', error);
      return '';
    }
  }, []);

  return {
    copiedText,
    copy,
    paste
  };
};

export default useClipboard;
```
**使用示例**：
```jsx
import React, { useState } from 'react';
import useClipboard from './useClipboard';

const CopyPasteExample = () => {
  const [inputValue, setInputValue] = useState('');
  const { copiedText, copy, paste } = useClipboard();

  const handlePaste = async () => {
    const pastedText = await paste();
    setInputValue(pastedText);
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={() => copy(inputValue)}>
        复制
      </button>
      <button onClick={handlePaste}>
        粘贴
      </button>
      {copiedText && <div>已复制: {copiedText}</div>}
    </div>
  );
};
```

### `useTitle` - 动态页面标题
动态设置页面标题。
```javascript
import { useEffect } from 'react';

const useTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export default useTitle;
```
**使用示例**：
```jsx
import React, { useState } from 'react';
import useTitle from './useTitle';

const PageWithDynamicTitle = () => {
  const [pageTitle, setPageTitle] = useState('默认标题');

  useTitle(pageTitle);

  return (
    <div>
      <input
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        placeholder="输入页面标题"
      />
    </div>
  );
};
```

### `useFavicon` - 动态网站图标
动态修改网站图标。
```javascript
import { useEffect } from 'react';

const useFavicon = (href) => {
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
};

export default useFavicon;
```
**使用示例**：
```jsx
import React, { useState } from 'react';
import useFavicon from './useFavicon';

const FaviconChanger = () => {
  const [favicon, setFavicon] = useState('/default.ico');

  useFavicon(favicon);

  return (
    <div>
      <button onClick={() => setFavicon('/favicon1.ico')}>
        图标 1
      </button>
      <button onClick={() => setFavicon('/favicon2.ico')}>
        图标 2
      </button>
    </div>
  );
};
```

## 🛠️ 自定义 Hooks 的最佳实践

1.  **命名规范**：自定义 Hook 名称应以 "use" 开头，以便识别其符合 Hook 规则。
2.  **单一职责**：每个 Hook 应专注于解决一个特定问题。
3.  **依赖处理**：正确处理依赖数组，避免不必要的重新渲染或效果执行。
4.  **清理工作**：妥善清理事件监听器、订阅和定时器等资源。
5.  **类型安全**：使用 TypeScript 可以增强类型安全性和开发体验。
6.  **性能优化**：使用 useCallback 和 useMemo 避免不必要的计算和重渲染。

这些 Hooks 覆盖了大多数常见的 DOM 操作场景，你可以根据具体需求选择使用或进行适当修改。它们都能帮助你减少重复代码，提高开发效率。

希望这些 Hooks 能为你开发 React 应用带来便利！

## cursor 总结

I'll implement the DOM-related hooks in the dom.ts file based on the documentation in dom.md.

[11 tools called]

I've successfully implemented all the DOM-related hooks in the dom.ts file according to the documentation in dom.md. The implementation includes:

1. Event handling hooks:
   - useEventListener
   - useClickAway
   - useKeyPress

2. Element state hooks:
   - useElementSize
   - useElementVisibility
   - useDocumentVisibility

3. Drag and drop hooks:
   - useDrag
   - useDrop

4. Viewport and layout hooks:
   - useFullscreen
   - useMousePosition
   - useScrollPosition

5. Utility hooks:
   - useClipboard
   - useTitle
   - useFavicon

All hooks are properly typed with TypeScript and include JSDoc comments for better documentation. I also fixed all linting errors to ensure the code is clean and ready to use.