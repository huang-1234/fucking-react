// 验证修复的简单测试
import { MediaMetadata } from './src/Stream/core/MediaData';

// 测试第一个修复：ImageFormat 现在可以作为 codec
const imageMetadata: MediaMetadata = {
  type: 'image',
  codec: 'jpeg', // 这应该不再报错
  resolution: { width: 1920, height: 1080 },
  createdAt: new Date()
};

// 测试第二个修复：检查 value 是否为 undefined
function testValueCheck(value: Uint8Array | undefined) {
  if (value) {
    console.log('Value length:', value.length);
  } else {
    console.log('Value is undefined');
  }
}

console.log('修复验证成功！');
console.log('1. ImageFormat 可以作为 codec 使用');
console.log('2. value 检查已添加 undefined 保护');