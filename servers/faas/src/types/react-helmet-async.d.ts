declare module 'react-helmet-async' {
  import * as React from 'react';

  export interface HelmetProps {
    htmlAttributes?: object;
    bodyAttributes?: object;
    title?: string;
    defaultTitle?: string;
    titleTemplate?: string;
    base?: object;
    meta?: Array<object>;
    link?: Array<object>;
    script?: Array<object>;
    noscript?: Array<object>;
    style?: Array<object>;
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }

  export class Helmet extends React.Component<HelmetProps> {
    static renderStatic(): {
      base: { toComponent(): React.ReactElement; toString(): string };
      bodyAttributes: { toComponent(): React.ReactElement; toString(): string };
      htmlAttributes: { toComponent(): React.ReactElement; toString(): string };
      link: { toComponent(): React.ReactElement; toString(): string };
      meta: { toComponent(): React.ReactElement; toString(): string };
      noscript: { toComponent(): React.ReactElement; toString(): string };
      script: { toComponent(): React.ReactElement; toString(): string };
      style: { toComponent(): React.ReactElement; toString(): string };
      title: { toComponent(): React.ReactElement; toString(): string };
    };
  }

  export interface HelmetProviderProps {
    context?: object;
    children: React.ReactNode;
  }

  export class HelmetProvider extends React.Component<HelmetProviderProps> {}

  export default Helmet;
}
