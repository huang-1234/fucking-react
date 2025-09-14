/**
 * 简单启动脚本
 * 使用Node.js直接运行编译后的JavaScript代码
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查dist目录是否存在
if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
  console.log('正在编译TypeScript代码...');

  // 编译TypeScript代码
  const tsc = spawn('npx', ['tsc', '-p', 'tsconfig.build.json'], {
    stdio: 'inherit',
    shell: true
  });

  tsc.on('close', (code) => {
    if (code !== 0) {
      console.error('编译失败，错误代码:', code);
      process.exit(1);
    }

    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('正在启动服务器...');

  // 运行编译后的JavaScript代码
  const server = spawn('node', ['dist/main.js'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('close', (code) => {
    console.log('服务器已关闭，退出代码:', code);
  });

  // 处理Ctrl+C
  process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    server.kill('SIGINT');
  });
}
