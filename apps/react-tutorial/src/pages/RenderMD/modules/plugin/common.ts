import { SyntaxHighlighter } from "../extensions/SyntaxHighlighter";
import { MathRenderer } from "../extensions/MathRenderer";
import { DiagramRenderer } from "../extensions/DiagramRenderer";
import { FootnotePlugin, TableOfContentsPlugin, TablePlugin, TaskListPlugin } from "./BuiltinPlugins";
import type { MarkdownPlugin } from "./PluginTypes";

export enum InnerPluginId {
  table = 'table',
  taskList = 'taskList',
  tableOfContents = 'tableOfContents',
  footnote = 'footnote',
  syntaxHighlighter = 'syntaxHighlighter',
  mathRenderer = 'mathRenderer',
  diagramRenderer = 'diagramRenderer'
}

const syntaxHighlighterPlugin = new SyntaxHighlighter().createPlugin();
const mathRendererPlugin = new MathRenderer().createPlugin();
const diagramRendererPlugin = new DiagramRenderer().createPlugin();

export const builtinPlugins: Record<InnerPluginId, MarkdownPlugin> = {
  table: TablePlugin,
  taskList: TaskListPlugin,
  tableOfContents: TableOfContentsPlugin,
  footnote: FootnotePlugin,
  syntaxHighlighter: syntaxHighlighterPlugin,
  mathRenderer: mathRendererPlugin,
  diagramRenderer: diagramRendererPlugin
}