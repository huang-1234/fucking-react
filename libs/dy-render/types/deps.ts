export interface IDyDeps {
  name: string;
  js?: string;
  version?: string;
  runtimeTyp?: 'runtime' | 'dev' | 'peer';
  addedAt?: Date;
  repository?: string;
  customData?: Record<string, any>;
}