declare module 'prop-types' {
  export const string: any;
  export const bool: any;
  export const func: any;
  export const node: any;
  export const oneOf: (values: any[]) => any;
  export const oneOfType: (types: any[]) => any;
  export const arrayOf: (type: any) => any;
  export const objectOf: (type: any) => any;
  export const shape: (shape: Record<string, any>) => any;
  export const exact: (shape: Record<string, any>) => any;
  export const any: any;
  export const array: any;
  export const object: any;
  export const number: any;
  export const symbol: any;
  export const element: any;
  export const elementType: any;
  export const instanceOf: (expectedClass: any) => any;
}
