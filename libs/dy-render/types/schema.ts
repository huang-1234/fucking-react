import { IDyDeps } from "./deps";
import { IStyleBasic } from "./style";


export interface DyMaterial {
  __name: string;
  __bundleUrl: string;
  __exportNames: string[];
  __version: string;
  __deps: IDyDeps[];
}
export type IBasicType = string | number | boolean | null | undefined

export type IArrayType = "array";
export type IObjectType = "object";
export type IUnionType = "union";
export type IIntersectionType = "intersection";
export type IEnumType = "enum";
export type IRefType = "ref";
export type IType = IBasicType | IArrayType | IObjectType | IUnionType | IIntersectionType | IEnumType | IRefType;

export type DyMaterialPropsSchema = {
  type: IType;
  value: DyMaterialPropsSchema;
} | {
  type: IArrayType;
  value: DyMaterialPropsSchema[];
} | {
  type: IObjectType;
  value: DyMaterialPropsSchema;
} | {
  type: IUnionType;
  value: DyMaterialPropsSchema[];
} | {
  type: IIntersectionType;
  value: DyMaterialPropsSchema[];
} | {
  type: IEnumType;
  value: DyMaterialPropsSchema[];
} | {
  type: IRefType;
  value: DyMaterialPropsSchema;
} | IBasicType | IArrayType | IObjectType | IUnionType | IIntersectionType | IEnumType | IRefType;

export interface DyMaterialProps {
  /** 组件名称 */
  __name: string;
  /** 组件封面 */
  __cover?: string;
  /** 组件标题 */
  __title?: string;
  /** 组件描述 */
  __description?: string;
  /** 组件名称中文 */
  __nameChn?: string;
  /** 组件属性 */
  __props?: DyMaterialPropsSchema;
  __style?: IStyleBasic;
  [key: string]: any;
}
/**
 * @type namespace::componentName
 * @example "dycomponents::view"
 */
type DySchemaType = `${string}::${string}`;

export interface DySchema<P extends DyMaterialProps = DyMaterialProps> {
  /** 物料id */
  __id?: string;
  /** 物料类型 */
  __type?: DySchemaType;
  /** 物料名称 */
  __name: string;
  /** 物料是否是容器 */
  __isContainer?: boolean;
  /** 物料属性 */
  __props?: P;
  /** 物料子组件 */
  __children?: DySchema<P>[];
}
