// declare module 'react-helmet-async' {
//   import * as React from 'react';

//   export interface HelmetTags {
//     baseTag: any[];
//     linkTags: any[];
//     metaTags: any[];
//     noscriptTags: any[];
//     scriptTags: any[];
//     styleTags: any[];
//   }

//   export interface HelmetProps {
//     base?: any;
//     bodyAttributes?: any;
//     defaultTitle?: string;
//     defer?: boolean;
//     encodeSpecialCharacters?: boolean;
//     htmlAttributes?: any;
//     link?: any[];
//     meta?: any[];
//     noscript?: any[];
//     onChangeClientState?: (newState: any, addedTags: HelmetTags, removedTags: HelmetTags) => void;
//     script?: any[];
//     style?: any[];
//     title?: string;
//     titleAttributes?: any;
//     titleTemplate?: string;
//     children?: React.ReactNode;
//   }

//   export class Helmet extends React.Component<HelmetProps> {
//     static renderStatic(): {
//       base: { toComponent(): React.ReactElement; toString(): string };
//       bodyAttributes: { toComponent(): React.ReactElement; toString(): string };
//       htmlAttributes: { toComponent(): React.ReactElement; toString(): string };
//       link: { toComponent(): React.ReactElement; toString(): string };
//       meta: { toComponent(): React.ReactElement; toString(): string };
//       noscript: { toComponent(): React.ReactElement; toString(): string };
//       script: { toComponent(): React.ReactElement; toString(): string };
//       style: { toComponent(): React.ReactElement; toString(): string };
//       title: { toComponent(): React.ReactElement; toString(): string };
//     };
//   }

//   export interface ProviderProps {
//     context?: object;
//     children: React.ReactNode;
//   }

//   export class HelmetProvider extends React.Component<ProviderProps> {}
// }