import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { getTutorialBySlug } from './tutorials';

// MDX 组件映射
const components = {
  // 可以在这里添加自定义组件
};

export async function getTutorialContent(slug: string) {
  // 获取教程元数据
  const tutorial = getTutorialBySlug(slug);

  if (!tutorial) {
    throw new Error(`Tutorial with slug "${slug}" not found`);
  }

  // 读取 MDX 文件内容
  const contentPath = path.join(process.cwd(), 'content', `${slug}.mdx`);

  try {
    const source = fs.readFileSync(contentPath, 'utf8');

    // 编译 MDX 内容
    const { content, frontmatter } = await compileMDX({
      source,
      components,
      options: {
        parseFrontmatter: true,
      },
    });

    return {
      content,
      frontmatter: {
        ...frontmatter,
        ...tutorial,
      },
    };
  } catch (error) {
    console.error(`Error reading tutorial content for ${slug}:`, error);

    // 如果文件不存在，返回一个占位内容
    return {
      content: null,
      frontmatter: tutorial,
    };
  }
}
