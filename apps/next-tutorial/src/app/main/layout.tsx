import { Geist } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "../../styles/globals.css";

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata = {
  title: 'Next.js 教学网站',
  description: '学习 Next.js 的最佳实践和核心概念',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geistSans.variable} font-sans`}>
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Next.js 教程</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">首页</a></li>
              <li><a href="/concepts/routing" className="hover:text-blue-600 dark:hover:text-blue-400">核心概念</a></li>
              <li><a href="/playground" className="hover:text-blue-600 dark:hover:text-blue-400">代码沙盒</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Next.js 教学网站</p>
        </div>
      </footer>
      <SpeedInsights />
    </div>
  );
}
