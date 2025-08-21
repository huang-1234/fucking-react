declare module 'virtual:formily-props' {
  interface ComponentSchema {
    props: Record<string, any>;
    jsonSchema: Record<string, any>;
    formilySchema: Record<string, any>;
  }

  interface FormilySchemas {
    schemas: Record<string, ComponentSchema>;
    timestamp: number;
    count: number;
  }

  const formilySchemas: FormilySchemas;
  export default formilySchemas;
}