import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

// =========== Event Handling Hooks ===========

/**
 * Hook for adding event listeners to DOM elements
 * @param eventType - The event type to listen for
 * @param handler - The event handler function
 * @param element - The target element (defaults to window)
 * @param options - Event listener options
 */
export const useEventListener = (
  eventType: string,
  handler: (event: Event) => void,
  element: Window | Document | HTMLElement | null = window,
  options?: AddEventListenerOptions
) => {
  const savedHandler = useRef<(event: Event) => void>(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element;
    if (!targetElement?.addEventListener) return;

    const listener = (event: Event) => savedHandler.current(event);

    targetElement.addEventListener(eventType, listener, options);

    return () => {
      targetElement.removeEventListener(eventType, listener, options);
    };
  }, [eventType, element, options]);
};

/**
 * Hook for detecting clicks outside a specific element
 * @param ref - Reference to the element
 * @param handler - Callback function when click outside is detected
 */
export const useClickAway = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
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

/**
 * Hook for monitoring keyboard key presses
 * @param targetKey - The key to monitor
 * @param element - The target element (defaults to window)
 * @returns Boolean indicating if the key is currently pressed
 */
export const useKeyPress = (targetKey: string, element: Window | Document | HTMLElement = window) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    element.addEventListener('keydown', downHandler as EventListener);
    element.addEventListener('keyup', upHandler as EventListener);

    return () => {
      element.removeEventListener('keydown', downHandler as EventListener);
      element.removeEventListener('keyup', upHandler as EventListener);
    };
  }, [targetKey, element]);

  return keyPressed;
};

// =========== Element State Hooks ===========

/**
 * Hook for monitoring an element's size
 * @param ref - Reference to the element
 * @returns Object containing the element's width and height
 */
export const useElementSize = (ref: React.RefObject<HTMLElement | null>) => {
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

/**
 * Hook for detecting if an element is visible in the viewport
 * @param ref - Reference to the element
 * @param threshold - Intersection threshold (0-1)
 * @returns Boolean indicating if the element is visible
 */
export const useElementVisibility = (
  ref: React.RefObject<HTMLElement | null>,
  threshold: number = 0
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const options: IntersectionObserverInit = {
      threshold
    };
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

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

/**
 * Hook for monitoring document visibility state
 * @returns Current visibility state ('visible' or 'hidden')
 */
export const useDocumentVisibility = () => {
  const [visibilityState, setVisibilityState] = useState(
    typeof document !== 'undefined' ? document.visibilityState : 'visible'
  );

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

// =========== Drag and Drop Hooks ===========

/**
 * Hook for handling drag operations on an element
 * @param onDragStart - Callback function when drag starts
 * @param onDragEnd - Callback function when drag ends
 * @returns [ref, isDragging] - Element ref and dragging state
 */
export const useDrag = (
  onDragStart?: (e: DragEvent) => void,
  onDragEnd?: (e: DragEvent) => void
): [React.RefObject<HTMLElement | null>, boolean] => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleDragStart = (e: DragEvent) => {
      setIsDragging(true);
      onDragStart && onDragStart(e);
    };

    const handleDragEnd = (e: DragEvent) => {
      setIsDragging(false);
      onDragEnd && onDragEnd(e);
    };

    node.addEventListener('dragstart', handleDragStart as EventListener);
    node.addEventListener('dragend', handleDragEnd as EventListener);

    return () => {
      node.removeEventListener('dragstart', handleDragStart as EventListener);
      node.removeEventListener('dragend', handleDragEnd as EventListener);
    };
  }, [onDragStart, onDragEnd]);

  return [ref, isDragging];
};

/**
 * Hook for handling drop operations on an element
 * @param onDrop - Callback function when a drop occurs
 * @returns [ref, isOver] - Element ref and hover state
 */
export const useDrop = (onDrop?: (e: DragEvent) => void): [React.RefObject<HTMLElement | null>, boolean] => {
  const [isOver, setIsOver] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragLeave = () => {
      setIsOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      onDrop && onDrop(e);
    };

    node.addEventListener('dragover', handleDragOver as EventListener);
    node.addEventListener('dragleave', handleDragLeave as EventListener);
    node.addEventListener('drop', handleDrop as EventListener);

    return () => {
      node.removeEventListener('dragover', handleDragOver as EventListener);
      node.removeEventListener('dragleave', handleDragLeave as EventListener);
      node.removeEventListener('drop', handleDrop as EventListener);
    };
  }, [onDrop]);

  return [ref, isOver];
};

// =========== Viewport and Layout Hooks ===========

/**
 * Hook for controlling fullscreen mode
 * @param ref - Reference to the element
 * @returns Object with fullscreen state and control methods
 */
export const useFullscreen = (ref: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(() => {
    if (ref.current) {
      if (ref.current.requestFullscreen) {
        ref.current.requestFullscreen();
      } else if ((ref.current as any).webkitRequestFullscreen) {
        (ref.current as any).webkitRequestFullscreen();
      } else if ((ref.current as any).msRequestFullscreen) {
        (ref.current as any).msRequestFullscreen();
      }
    }
  }, [ref]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
};

/**
 * Hook for tracking mouse position
 * @param ref - Optional reference to an element (tracks mouse within element)
 * @returns Object containing x and y coordinates
 */
export const useMousePosition = (ref?: React.RefObject<HTMLElement>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref?.current || document;
    const updatePosition = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    element.addEventListener('mousemove', updatePosition as EventListener);

    return () => {
      element.removeEventListener('mousemove', updatePosition as EventListener);
    };
  }, [ref]);

  return position;
};

/**
 * Hook for tracking scroll position
 * @param ref - Optional reference to an element (tracks scroll within element)
 * @returns Object containing x and y scroll positions
 */
export const useScrollPosition = (ref?: React.RefObject<HTMLElement>) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    const element = ref?.current || window;
    const isWindow = element === window;

    const updatePosition = () => {
      setScrollPosition({
        x: isWindow ? window.pageXOffset : (element as HTMLElement).scrollLeft,
        y: isWindow ? window.pageYOffset : (element as HTMLElement).scrollTop
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

// =========== Utility Hooks ===========

/**
 * Hook for clipboard operations
 * @returns Object with clipboard methods and state
 */
export const useClipboard = () => {
  const [copiedText, setCopiedText] = useState('');

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, []);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('Paste failed:', error);
      return '';
    }
  }, []);

  return {
    copiedText,
    copy,
    paste
  };
};

/**
 * Hook for dynamically setting the page title
 * @param title - The title to set
 */
export const useTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

/**
 * Hook for dynamically changing the favicon
 * @param href - URL of the favicon
 */
export const useFavicon = (href: string) => {
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    const linkElement = link as HTMLLinkElement;
    linkElement.type = 'image/x-icon';
    linkElement.rel = 'shortcut icon';
    linkElement.href = href;
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [href]);
};
