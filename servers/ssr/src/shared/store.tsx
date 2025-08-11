/**
 * 状态管理
 * 使用React Context API实现简单的状态管理
 */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// 状态类型
export interface AppState {
  user: {
    isAuthenticated: boolean;
    name: string | null;
    role: string | null;
  };
  theme: 'light' | 'dark';
  locale: string;
  pageData: Record<string, any>;
  loading: boolean;
  error: Error | null;
}

// 初始状态
export const initialState: AppState = {
  user: {
    isAuthenticated: false,
    name: null,
    role: null
  },
  theme: 'light',
  locale: 'zh-CN',
  pageData: {},
  loading: false,
  error: null
};

// Action类型
export type ActionType =
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'SET_LOCALE'; payload: string }
  | { type: 'SET_PAGE_DATA'; payload: Record<string, any> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'RESET_STATE' };

// Reducer函数
export const reducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOCALE':
      return { ...state, locale: action.payload };
    case 'SET_PAGE_DATA':
      return { ...state, pageData: { ...state.pageData, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// 创建Context
export const AppStateContext = createContext<AppState | undefined>(undefined);
export const AppDispatchContext = createContext<Dispatch<ActionType> | undefined>(undefined);

// Provider组件
export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}> = ({ children, initialState: propsInitialState }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...propsInitialState
  });

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// 自定义Hook
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};

// 数据预取函数
export const fetchInitialState = async (url: string): Promise<Partial<AppState>> => {
  // 根据URL获取初始状态
  // 这里可以根据路由匹配调用不同的API

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 100));

  // 返回初始状态
  return {
    pageData: {
      [url]: {
        title: `页面 ${url}`,
        content: `这是页面 ${url} 的内容`
      }
    }
  };
};