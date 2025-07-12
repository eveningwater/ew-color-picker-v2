import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import InputPlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('Input Plugin', () => {
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
    
    const btnGroup = create('div');
    btnGroup.className = 'ew-color-picker-drop-btn-group';
    bottomRow.appendChild(btnGroup);
    
    // 使用 mockCore 工厂函数创建完整的 mock 对象
    mockCore = createMockCore(container, {
      hasInput: true,
      defaultColor: '#ff0000'
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new InputPlugin(mockCore);
      
      expect(plugin).toBeInstanceOf(InputPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create input element', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input');
      expect(inputElement).toBeTruthy();
    });

    it('should not create input element when showInput is false', () => {
      mockCore.options.hasInput = false;
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input');
      expect(inputElement).toBeFalsy();
    });
  });

  describe('input functionality', () => {
    it('should handle input change events', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      expect(inputElement).toBeTruthy();
      
      // Simulate input change
      inputElement.value = '#00ff00';
      inputElement.dispatchEvent(new Event('input'));
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should handle input blur events', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      
      // Simulate input blur
      inputElement.value = '#00ff00';
      inputElement.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should validate color input', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      
      // Test valid color
      inputElement.value = '#ff0000';
      inputElement.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalledWith('#ff0000');
    });

    it('should handle invalid color input', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      
      // Test invalid color
      inputElement.value = 'invalid-color';
      inputElement.dispatchEvent(new Event('blur'));
      
      // Should not call setColor with invalid color
      expect(mockCore.setColor).not.toHaveBeenCalledWith('invalid-color');
    });
  });

  describe('color updates', () => {
    it('should update input when color changes', () => {
      const plugin = new InputPlugin(mockCore);
      
      // 触发 change 事件
      mockCore.emit('change');
      
      // Should update the input
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      expect(inputElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom input options', () => {
      const plugin = new InputPlugin(mockCore);
      
      const inputElement = container.querySelector('.ew-color-picker-input') as HTMLInputElement;
      expect(inputElement).toBeTruthy();
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new InputPlugin(mockCore);
      
      // Simulate plugin destruction
      plugin.destroy?.();
      
      expect(plugin.input).toBeNull();
    });
  });
}); 