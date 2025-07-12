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

// 创建通用的 mockCore 工厂函数
export function createMockCore(container: HTMLElement, options: any = {}) {
  return {
    container,
    options: {
      showBox: true,
      showPanel: true,
      showConsole: true,
      showHue: true,
      showInput: true,
      showInputNumber: true,
      showPredefine: true,
      showColorMode: true,
      defaultColor: '#ff0000',
      ...options
    },
    on: vi.fn(),
    emit: vi.fn(),
    getColor: vi.fn(() => '#ff0000'),
    setColor: vi.fn(),
    getMountPoint: vi.fn((name: string) => {
      if (name === 'root') {
        return container;
      }
      if (name === 'panelContainer') {
        return container;
      }
      if (name === 'bottomRow') {
        return container;
      }
      return null;
    }),
    destroy: vi.fn(),
    trigger: vi.fn()
  };
} 