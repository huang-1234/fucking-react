// 使用枚举定义AST节点类型和解析状态
export enum ASTNodeType {
  TEXT = 'text',
  DOCUMENT = 'document',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  BLOCKQUOTE = 'blockquote',
  LIST = 'list',
  LIST_ITEM = 'list_item',
  CODE_BLOCK = 'code_block',
  INLINE_CODE = 'code_inline',
  EMPH = 'em', // 强调
  STRONG = 'strong', // 加粗
  LINK = 'link',
  IMAGE = 'image',
  NEWLINE = 'newline',
  HORIZONTAL_RULE = 'horizontal_rule',
  THEMATIC_BREAK = 'thematic_break',
  BLOCK_QUOTE = 'block_quote',
  TABLE = 'table',
  TABLE_ROW = 'table_row',
  TABLE_CELL = 'table_cell',
  TABLE_HEADER = 'table_header',
  TABLE_FOOTER = 'table_footer',
  TABLE_BODY = 'table_body',
  TABLE_CAPTION = 'table_caption',
  TABLE_THEAD = 'table_thead',
  TABLE_TBODY = 'table_tbody',
  TABLE_TFOOT = 'table_tfoot',
  TABLE_COLGROUP = 'table_colgroup',
  TABLE_COL = 'table_col',
  TABLE_ROWGROUP = 'table_rowgroup',
  TABLE_ROWHEADER = 'table_rowheader',
  TABLE_ROWFOOTER = 'table_rowfooter',
  TABLE_ROWHEADERCELL = 'table_rowheadercell',
  TABLE_ROWFOOTERCELL = 'table_rowfootercell',
  TABLE_CELLHEADER = 'table_cellheader',
  TABLE_CELLFOOTER = 'table_cellfooter',
  TABLE_CELLHEADERCELL = 'table_cellheadercell',
  TABLE_CELLFOOTERCELL = 'table_cellfootercell',
  CUSTOM_BLOCK = 'custom_block', // 用于插件扩展的自定义节点
  CUSTOM_INLINE = 'custom_inline' // 用于行内自定义元素
}

// 枚举解析器的状态（常用于状态机或状态模式）
export enum ParserState {
  NORMAL = 'normal',
  IN_CODE_BLOCK = 'in_code_block',
  IN_LIST = 'in_list',
  IN_BLOCKQUOTE = 'in_blockquote',
  // ... 其他状态
}

// 定义AST节点接口
export interface ASTNode {
  type: ASTNodeType;
  children?: ASTNode[];
  content?: string;
  attrs?: { [key: string]: any }; // 修改为any类型，以支持布尔值和数字
  level?: number; // 用于标题级别(h1-h6)、列表层级等
  parent?: ASTNode; // 添加父节点引用
}