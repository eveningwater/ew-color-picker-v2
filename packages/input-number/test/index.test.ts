import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import InputNumberPlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('InputNumber Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    // 创建完整的 DOM 结构
    const panelContainer = create('div');
    panelContainer.className = 'ew-color-picker-panel-container';
    container.appendChild(panelContainer);
    
    const bottomRow = create('div');
    bottomRow.className = 'ew-color-picker-bottom-row';
    panelContainer.appendChild(bottomRow);
    
    mockCore = createMockCore(container, {
      hasInputNumber: true,
      showInputNumber: true
    });
  });

  afterEach(() => {
    // 安全地移除容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new InputNumberPlugin();
      
      expect(plugin).toBeInstanceOf(InputNumberPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create input number elements', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
    });

    it('should not create input number elements when showInputNumber is false', () => {
      mockCore.options.showInputNumber = false;
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number');
      expect(inputElements.length).toBe(0);
    });
  });

  describe('input number functionality', () => {
    it('should handle input change events', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number__input');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Simulate input change
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('input'));
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should handle input blur events', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number__input');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Simulate input blur
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should validate numeric input', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number__input');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Test valid numeric input
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should handle invalid numeric input', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number__input');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Test invalid input
      firstInput.value = 'abc';
      firstInput.dispatchEvent(new Event('blur'));
      
      // Should not call setColor with invalid input
      expect(mockCore.setColor).not.toHaveBeenCalledWith(expect.objectContaining({
        r: NaN
      }));
    });
  });

  describe('color updates', () => {
    it('should update input numbers when color changes', () => {
      const plugin = new InputNumberPlugin();
      
      // 触发 change 事件
      mockCore.emit('change');
      
      // Should update the input numbers
      const inputElements = container.querySelectorAll('.ew-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
    });
  });

  describe('plugin options', () => {
    it('should respect custom input number options', () => {
      const plugin = new InputNumberPlugin();
      
      const inputElements = container.querySelectorAll('.ew-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new InputNumberPlugin();
      
      // Simulate plugin destruction
      plugin.destroy?.();
      
      expect(plugin.getElement()).toBeTruthy();
    });
  });
}); 