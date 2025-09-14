import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NebulaService } from './nebula.service';

export interface NebulaModuleOptions {
  graphdHost: string;
  graphdPort: number;
  username: string;
  password: string;
  spaceName: string; // 要使用的图空间名称
  poolSize?: number; // 连接池大小，可选
}

@Module({})
export class NebulaModule {
  static forRoot(options: NebulaModuleOptions): DynamicModule {
    const nebulaProvider: Provider = {
      provide: 'NEBULA_OPTIONS',
      useValue: options,
    };

    return {
      module: NebulaModule,
      providers: [nebulaProvider, NebulaService],
      exports: [NebulaService],
      global: true, // 注册为全局模块，方便在其他模块直接注入 NebulaService
    };
  }

  static forRootAsync(optionsFactory: {
    useFactory: (...args: any[]) => Promise<NebulaModuleOptions> | NebulaModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const nebulaProvider: Provider = {
      provide: 'NEBULA_OPTIONS',
      useFactory: optionsFactory.useFactory,
      inject: optionsFactory.inject || [],
    };

    return {
      module: NebulaModule,
      providers: [nebulaProvider, NebulaService],
      exports: [NebulaService],
      global: true,
    };
  }
}
