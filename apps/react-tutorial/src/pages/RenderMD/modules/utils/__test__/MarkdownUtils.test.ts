import { describe, it, expect } from 'vitest';
import MarkdownUtils from '../MarkdownUtils';

describe('MarkdownUtils', () => {
  describe('escapeMarkdown', () => {
    it('should escape Markdown special characters', () => {
      const text = '# Heading with *emphasis* and [link](url)';
      const escaped = MarkdownUtils.escapeMarkdown(text);

      expect(escaped).toBe('\\# Heading with \\*emphasis\\* and \\[link\\]\\(url\\)');
    });

    it('should escape HTML characters', () => {
      const text = '<div>HTML content</div>';
      const escaped = MarkdownUtils.escapeMarkdown(text);

      expect(escaped).toBe('&lt;div&gt;HTML content&lt;/div&gt;');
    });
  });

  describe('parseLink', () => {
    it('should parse a simple link', () => {
      const text = '[link text](https://example.com)';
      const result = MarkdownUtils.parseLink(text);

      expect(result).toEqual(['link text', 'https://example.com', undefined]);
    });

    it('should parse a link with a title', () => {
      const text = '[link text](https://example.com "Link Title")';
      const result = MarkdownUtils.parseLink(text);

      expect(result).toEqual(['link text', 'https://example.com', 'Link Title']);
    });

    it('should return null for invalid links', () => {
      const text = 'not a link';
      const result = MarkdownUtils.parseLink(text);

      expect(result).toBeNull();
    });
  });

  describe('parseImage', () => {
    it('should parse a simple image', () => {
      const text = '![alt text](https://example.com/image.jpg)';
      const result = MarkdownUtils.parseImage(text);

      expect(result).toEqual(['alt text', 'https://example.com/image.jpg', undefined]);
    });

    it('should parse an image with a title', () => {
      const text = '![alt text](https://example.com/image.jpg "Image Title")';
      const result = MarkdownUtils.parseImage(text);

      expect(result).toEqual(['alt text', 'https://example.com/image.jpg', 'Image Title']);
    });

    it('should return null for invalid images', () => {
      const text = 'not an image';
      const result = MarkdownUtils.parseImage(text);

      expect(result).toBeNull();
    });
  });

  describe('parseHeadingLevel', () => {
    it('should parse heading levels correctly', () => {
      expect(MarkdownUtils.parseHeadingLevel('# Heading 1')).toBe(1);
      expect(MarkdownUtils.parseHeadingLevel('## Heading 2')).toBe(2);
      expect(MarkdownUtils.parseHeadingLevel('### Heading 3')).toBe(3);
      expect(MarkdownUtils.parseHeadingLevel('#### Heading 4')).toBe(4);
      expect(MarkdownUtils.parseHeadingLevel('##### Heading 5')).toBe(5);
      expect(MarkdownUtils.parseHeadingLevel('###### Heading 6')).toBe(6);
    });

    it('should return 0 for invalid headings', () => {
      expect(MarkdownUtils.parseHeadingLevel('Heading')).toBe(0);
      expect(MarkdownUtils.parseHeadingLevel('####### Too many hashes')).toBe(0);
      expect(MarkdownUtils.parseHeadingLevel('#No space')).toBe(0);
    });
  });

  describe('parseListIndentLevel', () => {
    it('should parse list indent levels correctly', () => {
      expect(MarkdownUtils.parseListIndentLevel('- Item')).toBe(0);
      expect(MarkdownUtils.parseListIndentLevel('  - Item')).toBe(1);
      expect(MarkdownUtils.parseListIndentLevel('    - Item')).toBe(2);
      expect(MarkdownUtils.parseListIndentLevel('      - Item')).toBe(3);
    });
  });

  describe('isEmptyLine', () => {
    it('should identify empty lines', () => {
      expect(MarkdownUtils.isEmptyLine('')).toBe(true);
      expect(MarkdownUtils.isEmptyLine('  ')).toBe(true);
      expect(MarkdownUtils.isEmptyLine('\t')).toBe(true);
    });

    it('should identify non-empty lines', () => {
      expect(MarkdownUtils.isEmptyLine('text')).toBe(false);
      expect(MarkdownUtils.isEmptyLine('  text')).toBe(false);
    });
  });

  describe('isHeading', () => {
    it('should identify headings', () => {
      expect(MarkdownUtils.isHeading('# Heading 1')).toBe(true);
      expect(MarkdownUtils.isHeading('## Heading 2')).toBe(true);
      expect(MarkdownUtils.isHeading('###### Heading 6')).toBe(true);
    });

    it('should reject invalid headings', () => {
      expect(MarkdownUtils.isHeading('Heading')).toBe(false);
      expect(MarkdownUtils.isHeading('#No space')).toBe(false);
      expect(MarkdownUtils.isHeading('####### Too many hashes')).toBe(false);
    });
  });

  describe('isListItem', () => {
    it('should identify unordered list items', () => {
      expect(MarkdownUtils.isListItem('- Item')).toBe(true);
      expect(MarkdownUtils.isListItem('+ Item')).toBe(true);
      expect(MarkdownUtils.isListItem('* Item')).toBe(true);
      expect(MarkdownUtils.isListItem('  - Item')).toBe(true);
    });

    it('should identify ordered list items', () => {
      expect(MarkdownUtils.isListItem('1. Item')).toBe(true);
      expect(MarkdownUtils.isListItem('  1. Item')).toBe(true);
    });

    it('should reject invalid list items', () => {
      expect(MarkdownUtils.isListItem('Item')).toBe(false);
      expect(MarkdownUtils.isListItem('-Item')).toBe(false);
      expect(MarkdownUtils.isListItem('1.Item')).toBe(false);
    });
  });

  describe('isCodeFence', () => {
    it('should identify code fences', () => {
      expect(MarkdownUtils.isCodeFence('```')).toBe(true);
      expect(MarkdownUtils.isCodeFence('```javascript')).toBe(true);
    });

    it('should reject invalid code fences', () => {
      expect(MarkdownUtils.isCodeFence('``')).toBe(false);
      expect(MarkdownUtils.isCodeFence('`')).toBe(false);
      expect(MarkdownUtils.isCodeFence(' ```')).toBe(false);
    });
  });

  describe('isBlockquote', () => {
    it('should identify blockquotes', () => {
      expect(MarkdownUtils.isBlockquote('> Quote')).toBe(true);
      expect(MarkdownUtils.isBlockquote('  > Quote')).toBe(true);
    });

    it('should reject invalid blockquotes', () => {
      expect(MarkdownUtils.isBlockquote('Quote')).toBe(false);
      expect(MarkdownUtils.isBlockquote('>Quote')).toBe(false);
    });
  });

  describe('isHorizontalRule', () => {
    it('should identify horizontal rules', () => {
      expect(MarkdownUtils.isHorizontalRule('---')).toBe(true);
      expect(MarkdownUtils.isHorizontalRule('***')).toBe(true);
      expect(MarkdownUtils.isHorizontalRule('___')).toBe(true);
      expect(MarkdownUtils.isHorizontalRule('----')).toBe(true);
    });

    it('should reject invalid horizontal rules', () => {
      expect(MarkdownUtils.isHorizontalRule('--')).toBe(false);
      expect(MarkdownUtils.isHorizontalRule('- - -')).toBe(false);
      expect(MarkdownUtils.isHorizontalRule('text')).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions', () => {
      expect(MarkdownUtils.getFileExtension('file.txt')).toBe('txt');
      expect(MarkdownUtils.getFileExtension('path/to/file.jpg')).toBe('jpg');
      expect(MarkdownUtils.getFileExtension('https://example.com/file.png')).toBe('png');
    });

    it('should return an empty string for files without extensions', () => {
      expect(MarkdownUtils.getFileExtension('file')).toBe('');
      expect(MarkdownUtils.getFileExtension('path/to/file')).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate IDs from text', () => {
      expect(MarkdownUtils.generateId('Heading 1')).toBe('heading-1');
      expect(MarkdownUtils.generateId('Special Characters: !@#$%^&*()')).toBe('special-characters');
      expect(MarkdownUtils.generateId('Multiple   Spaces')).toBe('multiple-spaces');
    });
  });

  describe('extractPlainText', () => {
    it('should extract plain text from Markdown', () => {
      const markdown = '# Heading\n\nThis is a **bold** and *italic* text with `code`.\n\n```\nCode block\n```\n\n> Blockquote\n\n- List item';
      const plainText = MarkdownUtils.extractPlainText(markdown);

      expect(plainText).toBe('Heading This is a bold and italic text with code. Blockquote List item');
    });
  });

  describe('estimateReadingTime', () => {
    it('should estimate reading time based on word count', () => {
      const markdown = 'This is a test. '.repeat(100); // 500 words
      const readingTime = MarkdownUtils.estimateReadingTime(markdown);

      expect(readingTime).toBe(3); // 500 words / 200 words per minute = 2.5 minutes, rounded up to 3
    });

    it('should use custom words per minute if provided', () => {
      const markdown = 'This is a test. '.repeat(100); // 500 words
      const readingTime = MarkdownUtils.estimateReadingTime(markdown, 100);

      expect(readingTime).toBe(5); // 500 words / 100 words per minute = 5 minutes
    });
  });

  describe('extractLinks', () => {
    it('should extract all links from Markdown', () => {
      const markdown = 'This is a [link](https://example.com) and another [link with title](https://example.org "Title")';
      const links = MarkdownUtils.extractLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0]).toEqual({
        text: 'link',
        url: 'https://example.com'
      });
      expect(links[1]).toEqual({
        text: 'link with title',
        url: 'https://example.org',
        title: 'Title'
      });
    });

    it('should return an empty array if no links are found', () => {
      const markdown = 'This is text without links';
      const links = MarkdownUtils.extractLinks(markdown);

      expect(links).toHaveLength(0);
    });
  });

  describe('extractImages', () => {
    it('should extract all images from Markdown', () => {
      const markdown = 'This is an ![image](https://example.com/image.jpg) and another ![image with title](https://example.org/image.png "Title")';
      const images = MarkdownUtils.extractImages(markdown);

      expect(images).toHaveLength(2);
      expect(images[0]).toEqual({
        alt: 'image',
        src: 'https://example.com/image.jpg'
      });
      expect(images[1]).toEqual({
        alt: 'image with title',
        src: 'https://example.org/image.png',
        title: 'Title'
      });
    });

    it('should return an empty array if no images are found', () => {
      const markdown = 'This is text without images';
      const images = MarkdownUtils.extractImages(markdown);

      expect(images).toHaveLength(0);
    });
  });

  describe('extractHeadings', () => {
    it('should extract all headings from Markdown', () => {
      const markdown = '# Heading 1\n\nText\n\n## Heading 2\n\nText\n\n### Heading 3';
      const headings = MarkdownUtils.extractHeadings(markdown);

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        level: 1,
        text: 'Heading 1',
        id: 'heading-1'
      });
      expect(headings[1]).toEqual({
        level: 2,
        text: 'Heading 2',
        id: 'heading-2'
      });
      expect(headings[2]).toEqual({
        level: 3,
        text: 'Heading 3',
        id: 'heading-3'
      });
    });

    it('should return an empty array if no headings are found', () => {
      const markdown = 'This is text without headings';
      const headings = MarkdownUtils.extractHeadings(markdown);

      expect(headings).toHaveLength(0);
    });
  });
});
