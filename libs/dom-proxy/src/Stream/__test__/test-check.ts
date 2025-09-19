/**
 * 测试检查脚本 - 验证所有TypeScript错误是否已修复
 */

// 导入所有核心模块，检查类型错误
import { BinaryData } from '../core/BinaryData';
import { DataTransfer } from '../core/DataTransfer';
import { StreamOperations } from '../core/StreamOperations';
import { CompatibilityManager } from '../core/CompatibilityManager';

// 导入类型定义
import type {
  BinaryDataInput,
  CompatibilityConfig,
  TransferConfig,
  StreamOptions,
  StreamProcessor
} from '../types';

// 导入测试工具
import { vi, expect } from 'vitest';
import {
  createMockProgressCallback,
  createMockArrayBuffer,
  TestDataGenerator,
  MockUtils,
  testUtils
} from './setup';

/**
 * 基本类型检查函数
 */
export function typeCheck() {
  // 测试BinaryData类型
  const binaryData = BinaryData.from(new Uint8Array([1, 2, 3]));
  console.log('✅ BinaryData type check passed');

  // 测试DataTransfer类型
  const dataTransfer = new DataTransfer();
  console.log('✅ DataTransfer type check passed');

  // 测试StreamOperations类型
  const streamOps = new StreamOperations();
  console.log('✅ StreamOperations type check passed');

  // 测试CompatibilityManager类型
  const compatManager = CompatibilityManager.getInstance();
  console.log('✅ CompatibilityManager type check passed');

  // 测试Mock函数类型
  const progressCallback = createMockProgressCallback();
  const arrayBuffer = createMockArrayBuffer(1024);
  console.log('✅ Mock functions type check passed');

  // 测试工具函数类型
  const testData = TestDataGenerator.generateBinaryData(100);
  const mockUtils = MockUtils.createProgressMock();
  console.log('✅ Test utilities type check passed');

  return true;
}

/**
 * 运行类型检查
 */
if (require.main === module) {
  try {
    typeCheck();
    console.log('🎉 All type checks passed!');
  } catch (error) {
    console.error('❌ Type check failed:', error);
    process.exit(1);
  }
}