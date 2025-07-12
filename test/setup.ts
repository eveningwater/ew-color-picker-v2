// 测试环境设置
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// 模拟 __DEV__ 变量
declare global {
  var __DEV__: boolean;
}

// 设置开发环境
globalThis.__DEV__ = true;

// 清理 DOM
afterEach(() => {
  // 确保 document.body 存在
  if (typeof document !== 'undefined' && document.body) {
    document.body.innerHTML = '';
  }
});

// 模拟 console 方法以避免测试输出
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.log = originalConsole.log;
}); 