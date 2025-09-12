import { IDyDeps } from "./deps";


export interface DySchema {
  name: string;
  bundleUrl: string;
  exportNames: string[];
  version: string;
  deps: IDyDeps[];
}

export interface DySchemaRendererProps {
  name: string;
  children: DySchema[];
}


export interface DySchemaRendererState {
  schema: DySchema;
  children: React.ReactNode;
  onLoad: (schema: DySchema) => void;
  onError: (error: Error) => void;
}