// formily-props
declare module 'virtual:formily-props' {
  interface ComponentSchema {
    props: Record<string, any>;
    jsonSchema: any;
    formilySchema: any;
    filePath?: string;
  }

  interface FormilySchemas {
    schemas: Record<string, ComponentSchema>;
    timestamp: string;
    count: number;
  }

  const formilySchemas: FormilySchemas;
  export default formilySchemas;
}

declare module 'formily-props' {
  interface ComponentSchema {
    props: Record<string, any>;
    jsonSchema: any;
    formilySchema: any;
    filePath?: string;
  }

  interface FormilySchemas {
    schemas: Record<string, ComponentSchema>;
    timestamp: string;
    count: number;
  }

  const formilySchemas: FormilySchemas;
  export default formilySchemas;
}