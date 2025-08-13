/**
 * 集群模式实现
 * 使用Node.js的cluster模块创建多进程应用，充分利用多核CPU
 */
import cluster from 'cluster';
import os from 'os';
import config from './config';
import { createServer } from './index';

// 日志前缀
const logPrefix = (id: string) => `[Worker ${id}]`;

/**
 * 启动集群
 */
export function startCluster() {
  const numCPUs = config.workers;

  if (cluster.isPrimary) {
    console.log(`主进程 ${process.pid} 正在运行`);
    console.log(`启动 ${numCPUs} 个工作进程...`);

    // 记录工作进程
    const workers: { [key: number]: cluster.Worker } = {};

    // 创建工作进程
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      workers[worker.process.pid!] = worker;
    }

    // 监听工作进程退出事件
    cluster.on('exit', (worker, code, signal) => {
      const pid = worker.process.pid!;
      console.log(`${logPrefix(pid.toString())} 工作进程退出，退出码: ${code}, 信号: ${signal}`);
      console.log('重启新的工作进程...');

      // 删除旧的工作进程记录
      delete workers[pid];

      // 创建新的工作进程
      const newWorker = cluster.fork();
      workers[newWorker.process.pid!] = newWorker;
    });

    // 监听主进程退出事件
    process.on('SIGTERM', () => {
      console.log('主进程接收到 SIGTERM 信号，优雅关闭中...');

      // 依次关闭所有工作进程
      for (const pid in workers) {
        workers[pid].send('shutdown');
      }

      // 等待所有工作进程关闭后退出
      setTimeout(() => {
        console.log('强制关闭所有工作进程');
        process.exit(0);
      }, 5000);
    });

  } else {
    // 工作进程
    const pid = process.pid;
    console.log(`${logPrefix(pid.toString())} 工作进程启动`);

    // 创建服务器
    const server = createServer();
    const PORT = config.port;

    // 启动服务器
    server.listen(PORT, () => {
      console.log(`${logPrefix(pid.toString())} 服务器运行在 http://${config.host}:${PORT}`);
    });

    // 监听关闭信号
    process.on('message', (msg) => {
      if (msg === 'shutdown') {
        console.log(`${logPrefix(pid.toString())} 收到关闭信号，优雅关闭中...`);
        server.close(() => {
          console.log(`${logPrefix(pid.toString())} 服务器已关闭`);
          process.exit(0);
        });

        // 超时强制关闭
        setTimeout(() => {
          console.log(`${logPrefix(pid.toString())} 强制关闭`);
          process.exit(1);
        }, 3000);
      }
    });
  }
}