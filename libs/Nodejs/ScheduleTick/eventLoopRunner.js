/**
 * Node.js 事件循环演示运行器
 *
 * 此脚本用于运行各个演示文件并提供说明
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 演示文件列表
const demos = [
  {
    file: 'eventLoopDemo.js',
    title: '事件循环基础演示',
    description: '展示事件循环的六个阶段及其执行顺序'
  },
  {
    file: 'timerVsImmediate.js',
    title: 'setTimeout vs setImmediate',
    description: '比较setTimeout和setImmediate在不同情况下的执行顺序'
  },
  {
    file: 'microtasksDemo.js',
    title: '微任务演示',
    description: '展示微任务(nextTick和Promise)的执行时机和优先级'
  },
  {
    file: 'ioAndPollDemo.js',
    title: 'I/O操作与Poll阶段',
    description: '演示Poll阶段如何处理I/O操作和回调'
  },
  {
    file: 'closeCallbacksDemo.js',
    title: 'Close Callbacks阶段',
    description: '演示关闭事件回调的执行时机'
  }
];

// 显示菜单
function showMenu() {
  console.log('\n===== Node.js 事件循环演示 =====');
  console.log('请选择要运行的演示:');

  demos.forEach((demo, index) => {
    console.log(`${index + 1}. ${demo.title} - ${demo.description}`);
  });

  console.log('0. 退出');

  rl.question('\n请输入选项编号: ', (answer) => {
    const choice = parseInt(answer);

    if (choice === 0) {
      rl.close();
      return;
    }

    if (choice > 0 && choice <= demos.length) {
      runDemo(demos[choice - 1]);
    } else {
      console.log('无效的选项，请重新选择');
      showMenu();
    }
  });
}

// 运行演示
function runDemo(demo) {
  console.log(`\n运行: ${demo.title}`);
  console.log(`说明: ${demo.description}`);
  console.log('\n===== 输出结果 =====');

  try {
    const demoPath = path.join(__dirname, demo.file);

    // 显示文件内容
    console.log('\n文件内容:');
    const content = fs.readFileSync(demoPath, 'utf8');
    console.log('----------------------------------------');
    console.log(content);
    console.log('----------------------------------------');

    // 运行演示
    console.log('\n运行结果:');
    execSync(`node "${demoPath}"`, { stdio: 'inherit' });

    // 运行完成后返回菜单
    rl.question('\n按回车键返回菜单...', () => {
      showMenu();
    });
  } catch (err) {
    console.error(`运行出错: ${err.message}`);
    rl.question('\n按回车键返回菜单...', () => {
      showMenu();
    });
  }
}

// 启动程序
console.log('Node.js 事件循环学习工具');
console.log('版本: 1.0.0');
console.log('此工具将帮助您理解Node.js的事件循环机制');
showMenu();
