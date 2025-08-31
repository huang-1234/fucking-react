import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CustomRenderer from '../CustomRenderer';
import { ASTNodeType } from '../../../common/md';

describe('CustomRenderer', () => {
  describe('render', () => {
    it('should render an empty document', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: []
      };

      const result = renderer.render(ast);
      expect(result).toEqual([]);
    });

    it('should render headings correctly', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.HEADING,
            content: 'Heading 1',
            level: 1
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element with h1 tag
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');
      // Check if it contains an h1 element
      const h1Element = (result as React.ReactElement).props.children;
      expect(React.isValidElement(h1Element)).toBe(true);
      expect((h1Element as React.ReactElement).type).toBe('h1');
      expect((h1Element as React.ReactElement).props.children).toBe('Heading 1');
    });

    it('should render paragraphs correctly', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            content: 'This is a paragraph.'
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element with p tag
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');
      // Check if it contains a p element
      const pElement = (result as React.ReactElement).props.children;
      expect(React.isValidElement(pElement)).toBe(true);
      expect((pElement as React.ReactElement).type).toBe('p');
      expect((pElement as React.ReactElement).props.children).toBe('This is a paragraph.');
    });

    it('should render code blocks correctly', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.CODE_BLOCK,
            content: 'const x = 10;',
            attrs: { lang: 'javascript' }
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');
      // Check if it contains pre and code elements
      const preElement = (result as React.ReactElement).props.children;
      expect(React.isValidElement(preElement)).toBe(true);
      expect((preElement as React.ReactElement).type).toBe('pre');

      const codeElement = (preElement as React.ReactElement).props.children;
      expect(React.isValidElement(codeElement)).toBe(true);
      expect((codeElement as React.ReactElement).type).toBe('code');
      expect((codeElement as React.ReactElement).props.className).toBe('language-javascript');
      expect((codeElement as React.ReactElement).props.children).toBe('const x = 10;');
    });

    it('should render blockquotes correctly', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.BLOCKQUOTE,
            children: [
              {
                type: ASTNodeType.PARAGRAPH,
                content: 'This is a quote.'
              }
            ]
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element with blockquote tag
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');

      const blockquoteElement = (result as React.ReactElement).props.children;
      expect(React.isValidElement(blockquoteElement)).toBe(true);
      expect((blockquoteElement as React.ReactElement).type).toBe('blockquote');

      const pElement = (blockquoteElement as React.ReactElement).props.children;
      expect(React.isValidElement(pElement)).toBe(true);
      expect((pElement as React.ReactElement).type).toBe('p');
      expect((pElement as React.ReactElement).props.children).toBe('This is a quote.');
    });

    it('should render lists correctly', () => {
      const renderer = new CustomRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.LIST,
            children: [
              {
                type: ASTNodeType.LIST_ITEM,
                content: 'Item 1'
              },
              {
                type: ASTNodeType.LIST_ITEM,
                content: 'Item 2'
              }
            ]
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element with ul tag
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');

      const ulElement = (result as React.ReactElement).props.children;
      expect(React.isValidElement(ulElement)).toBe(true);
      expect((ulElement as React.ReactElement).type).toBe('ul');

      const liElements = (ulElement as React.ReactElement).props.children;
      expect(Array.isArray(liElements)).toBe(true);
      expect(liElements.length).toBe(2);
      expect(liElements[0].type).toBe('li');
      expect(liElements[0].props.children).toBe('Item 1');
      expect(liElements[1].type).toBe('li');
      expect(liElements[1].props.children).toBe('Item 2');
    });

    it('should use custom components when provided', () => {
      const CustomHeading = ({ children, ...props }: any) => (
        <h1 className="custom-heading" {...props}>{children}</h1>
      );

      const renderer = new CustomRenderer({
        components: {
          h1: CustomHeading
        }
      });

      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.HEADING,
            content: 'Custom Heading',
            level: 1
          }
        ]
      };

      const result = renderer.render(ast);
      // Validate that it's a React element
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe('div');

      const headingElement = (result as React.ReactElement).props.children;
      expect(React.isValidElement(headingElement)).toBe(true);
      expect((headingElement as React.ReactElement).type).toBe(CustomHeading);
      expect((headingElement as React.ReactElement).props.children).toBe('Custom Heading');
    });

    it('should sanitize URLs', () => {
      const renderer = new CustomRenderer({ sanitize: true });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.LINK,
                content: 'Malicious',
                attrs: { href: 'javascript:alert("XSS")' }
              }
            ]
          }
        ]
      };

      const result = renderer.render(ast);
      // Get the link element
      const pElement = (result as React.ReactElement).props.children;
      const linkElement = (pElement as React.ReactElement).props.children;

      // Check that the href has been sanitized
      expect(linkElement.props.href).toBe('#');
    });

    it('should handle custom link targets', () => {
      const renderer = new CustomRenderer({ linkTarget: '_self' });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.LINK,
                content: 'Example',
                attrs: { href: 'https://example.com' }
              }
            ]
          }
        ]
      };

      const result = renderer.render(ast);
      // Get the link element
      const pElement = (result as React.ReactElement).props.children;
      const linkElement = (pElement as React.ReactElement).props.children;

      // Check that the target is set correctly
      expect(linkElement.props.target).toBe('_self');
    });
  });
});
