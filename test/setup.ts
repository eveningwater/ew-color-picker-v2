// 测试环境设置
import { beforeAll, afterEach, afterAll } from 'vitest';

// 模拟 __DEV__ 变量
declare global {
  var __DEV__: boolean;
}

// 设置开发环境
globalThis.__DEV__ = true;

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = '';
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