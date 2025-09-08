import * as path from 'path';
import Mocha from 'mocha';
import * as fs from 'fs';
import { glob } from 'glob';

export function run(): Promise<void> {
  // 创建测试套件
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((resolve, reject) => {
    // 使用Promise API而不是回调API
    glob('**/**.test.js', { cwd: testsRoot })
      .then((files) => {
        // 添加文件到测试套件
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // 运行测试
          mocha.run((failures: number) => {
            if (failures > 0) {
              reject(new Error(`${failures} 个测试失败`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          reject(err);
        }
      })
      .catch(reject);
  });
}