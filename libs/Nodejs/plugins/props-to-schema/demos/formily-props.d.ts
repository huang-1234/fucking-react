declare module 'formily-props' {
  interface PropConfig {
    type?: string;
    required?: boolean;
    default?: any;
    description?: string;
  }

  interface SchemaProperty {
    type: string;
    title: string;
    description?: string;
    default?: any;
    items?: {
      type: string;
    };
    properties?: Record<string, SchemaProperty>;
  }

  interface JsonSchema {
    type: string;
    properties: Record<string, SchemaProperty>;
    required?: string[];
  }

  interface FormilyProperty extends SchemaProperty {
    'x-decorator'?: string;
    'x-component'?: string;
    'x-component-props'?: Record<string, any>;
  }

  interface FormilySchema {
    type: string;
    properties: Record<string, FormilyProperty>;
    required?: string[];
  }

  interface ComponentSchema {
    props: Record<string, PropConfig>;
    jsonSchema: JsonSchema;
    formilySchema: FormilySchema;
  }

  const schemas: Record<string, ComponentSchema>;
  export default schemas;
}
