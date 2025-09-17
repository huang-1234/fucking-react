/**
 * 简单的开发服务器启动脚本
 * 使用Node.js的child_process直接运行ts-node
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查src/main.ts是否存在
const mainFilePath = path.join(process.cwd(), 'src', 'main.ts');
if (!fs.existsSync(mainFilePath)) {
  console.error(`错误: 找不到入口文件 ${mainFilePath}`);
  process.exit(1);
}

console.log('正在启动NestJS开发服务器...');

// 使用ts-node直接运行TypeScript文件
const tsNodeProcess = spawn('npx', ['ts-node', mainFilePath], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    TS_NODE_PROJECT: path.join(process.cwd(), 'tsconfig.json'),
    TS_NODE_TRANSPILE_ONLY: 'true', // 加快启动速度，仅转译不检查类型
    PORT: '3000',
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'your_openai_api_key_here',
    OPENAI_DEFAULT_MODEL: 'gpt-3.5-turbo',
    CORS_ORIGIN: '*'
  }
});

// 处理进程退出
tsNodeProcess.on('close', (code) => {
  console.log(`服务器进程已退出，退出代码: ${code}`);
});

// 处理Ctrl+C
process.on('SIGINT', () => {
  console.log('接收到中断信号，正在关闭服务器...');
  tsNodeProcess.kill('SIGINT');
});

console.log('服务器正在运行中...');
console.log('按Ctrl+C停止服务器');
