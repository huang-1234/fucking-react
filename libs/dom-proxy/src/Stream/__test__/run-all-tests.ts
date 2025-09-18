/**
 * 运行所有Stream模块测试
 */

import { TestRunner } from './run-tests';

async function main() {
  try {
    console.log('🚀 开始运行Stream模块测试...');

    // 创建测试运行器并执行所有测试
    const runner = new TestRunner({
      mode: 'all',
      coverage: true,
      verbose: true,
      openReport: true
    });

    await runner.run();

    console.log('✅ 测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch(console.error);
