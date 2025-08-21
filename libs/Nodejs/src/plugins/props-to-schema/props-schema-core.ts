import * as path from 'path';
import { parse, ComponentDoc } from 'react-docgen-typescript';
import { ISchema } from '@formily/json-schema';

// 定义组件 Props 的 Schema 结构
export type ComponentPropsSchema = {
  [componentPath: string]: ISchema; // 组件路径到 Formily Schema 的映射
};

// 解析组件 Props 并生成 Formily Schema
export const generateFormilySchema = (
  componentPath: string,
  options?: {
    include?: string[];
    exclude?: string[]
  }
): ISchema | null => {
  try {
    // 使用 react-docgen-typescript 解析组件
    const componentDocs: ComponentDoc[] = parse(componentPath, {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      ...options,
    });

    if (!componentDocs.length) return null;

    const props = componentDocs[0].props;
    const properties: ISchema['properties'] = {};

    // 遍历 Props 生成 JSON Schema 结构
    Object.entries(props).forEach(([propName, propDef]) => {
      properties[propName] = {
        title: propDef.description || propName,
        type: mapTsTypeToJsonType(propDef.type.name),
        default: propDef.defaultValue?.value,
        enum: propDef.type.name === 'enum'
          ? propDef.type.value.map((v: any) => v.value)
          : undefined,
        'x-component': mapTypeToFormilyComponent(propDef.type.name),
        'x-decorator': 'FormItem',
      };
    });

    return {
      type: 'object',
      properties,
    };
  } catch (e) {
    console.error(`[props-schema] 解析失败: ${componentPath}`, e);
    return null;
  }
};

// 映射 TypeScript 类型到 JSON Schema 类型
const mapTsTypeToJsonType = (tsType: string): string => {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    enum: 'string',
    any: 'object',
    object: 'object',
    array: 'array',
  };
  return typeMap[tsType.toLowerCase()] || 'string';
};

// 映射类型到 Formily 组件
const mapTypeToFormilyComponent = (type: string): string => {
  const componentMap: Record<string, string> = {
    string: 'Input',
    number: 'NumberPicker',
    boolean: 'Switch',
    enum: 'Select',
    array: 'ArrayItems',
    object: 'ObjectField',
  };
  return componentMap[type.toLowerCase()] || 'Input';
};