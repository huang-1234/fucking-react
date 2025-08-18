// 教程类型定义
export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  demoCode?: string;
}

// 前端内容类型
export interface FrontMatter {
  title: string;
  description: string;
  [key: string]: any;
}

// 用户进度类型
export interface LessonProgress {
  [lessonId: string]: {
    completed: boolean;
    lastAttempt: Date;
  }
}

// 路由可视化类型
export interface Route {
  path: string;
  component: string;
  children?: Route[];
}

// 代码示例类型
export interface CodeTemplate {
  name: string;
  code: string;
  description?: string;
}
