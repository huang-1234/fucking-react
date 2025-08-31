import { describe, it, expect, vi, beforeEach } from 'vitest';
import CoreParser from '../index';
import MarkdownParser from '../Parser';
import Tokenizer from '../Tokenizer';
import ASTBuilder from '../ASTBuilder';
import { ASTNodeType } from '../../../common/md';

// Mock the dependencies
vi.mock('../Parser');
vi.mock('../Tokenizer');
vi.mock('../ASTBuilder');

describe('CoreParser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with the required dependencies', () => {
    const coreParser = new CoreParser();

    expect(coreParser).toBeDefined();
    expect(MarkdownParser).toHaveBeenCalledTimes(1);
    expect(Tokenizer).toHaveBeenCalledTimes(1);
    expect(ASTBuilder).toHaveBeenCalledTimes(1);
  });

  it('should use the parser to parse markdown content', () => {
    // Setup mock implementation
    const mockAst = {
      type: ASTNodeType.DOCUMENT,
      children: [{
        type: ASTNodeType.HEADING,
        content: 'Test Heading',
        level: 1
      }]
    };

    const mockParse = vi.fn().mockReturnValue(mockAst);
    (MarkdownParser as unknown as jest.Mock).mockImplementation(() => ({
      parse: mockParse
    }));

    const coreParser = new CoreParser();
    const result = coreParser.parse('# Test Heading');

    expect(mockParse).toHaveBeenCalledWith('# Test Heading');
    expect(result).toBe(mockAst);
  });

  it('should handle empty input', () => {
    // Setup mock implementation
    const mockAst = {
      type: ASTNodeType.DOCUMENT,
      children: []
    };

    const mockParse = vi.fn().mockReturnValue(mockAst);
    (MarkdownParser as unknown as jest.Mock).mockImplementation(() => ({
      parse: mockParse
    }));

    const coreParser = new CoreParser();
    const result = coreParser.parse('');

    expect(mockParse).toHaveBeenCalledWith('');
    expect(result).toBe(mockAst);
  });

  // Alternative parsing method test (commented out as it's not used in the current implementation)
  /*
  it('should use tokenizer and ASTBuilder for alternative parsing method', () => {
    // Setup mock implementation
    const mockTokens = [{ type: 'heading', value: 'Test', raw: '# Test', depth: 1 }];
    const mockAst = {
      type: ASTNodeType.DOCUMENT,
      children: [{
        type: ASTNodeType.HEADING,
        content: 'Test',
        level: 1
      }]
    };

    const mockTokenize = vi.fn().mockReturnValue(mockTokens);
    const mockBuildAST = vi.fn().mockReturnValue(mockAst);

    (Tokenizer as unknown as jest.Mock).mockImplementation(() => ({
      tokenize: mockTokenize
    }));

    (ASTBuilder as unknown as jest.Mock).mockImplementation(() => ({
      buildAST: mockBuildAST
    }));

    // Modify CoreParser to use the alternative method
    const coreParser = new CoreParser();
    coreParser.parse = function(content) {
      const tokens = this.tokenizer.tokenize(content);
      return this.astBuilder.buildAST(tokens);
    };

    const result = coreParser.parse('# Test');

    expect(mockTokenize).toHaveBeenCalledWith('# Test');
    expect(mockBuildAST).toHaveBeenCalledWith(mockTokens);
    expect(result).toBe(mockAst);
  });
  */
});
