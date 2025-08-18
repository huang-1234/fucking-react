import { Compiler, Compilation, sources } from 'webpack';
import { generateFormilySchema, ComponentPropsSchema } from './props-schema-core';
import path from 'path';

export class WebpackPropsToFormily {
  apply(compiler: Compiler) {
    const pluginName = 'WebpackPropsToFormily';
    const outputFile = 'formily-props.json';

    compiler.hooks.thisCompilation.tap(pluginName, (compilation: Compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async () => {
          const schemas: ComponentPropsSchema = {};

          // 遍历所有依赖的 TSX/JSX 文件
          for (const [name, entry] of compilation.entrypoints) {
            entry.getFiles().forEach(file => {
              if (!/\.(tsx|jsx)$/.test(file)) return;
              const fullPath = path.resolve(compilation.options.context || '', file);
              const schema = generateFormilySchema(fullPath);
              if (schema) {
                schemas[file] = schema;
              }
            });
          }

          // 生成 JSON 文件
          const source = new sources.RawSource(JSON.stringify(schemas));
          compilation.emitAsset(outputFile, source);
        }
      );
    });
  }
}