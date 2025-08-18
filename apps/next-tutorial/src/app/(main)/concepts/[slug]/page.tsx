import { getTutorialContent } from '@/app/lib/mdx';
import { getAllTutorialSlugs } from '@/app/lib/tutorials';
import LiveDemo from '@/app/components/LiveDemo';
import { notFound } from 'next/navigation';

// 生成静态路径
export async function generateStaticParams() {
  const slugs = getAllTutorialSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function TutorialPage({ params }: { params: { slug: string } }) {
  try {
    const { content, frontmatter } = await getTutorialContent(params.slug);

    if (!content) {
      return notFound();
    }

    return (
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{frontmatter.description}</p>
        </header>
        <section className="prose dark:prose-invert max-w-none">
          {content}
        </section>
        {frontmatter.demoCode && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">交互式示例</h2>
            <LiveDemo code={frontmatter.demoCode} />
          </div>
        )}
      </article>
    );
  } catch (error) {
    console.error('Error rendering tutorial:', error);
    return notFound();
  }
}
