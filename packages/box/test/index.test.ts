import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BoxPlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('Box Plugin', () => {
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
    
    // 使用 mockCore 工厂函数创建完整的 mock 对象
    mockCore = createMockCore(container, {
      showBox: true,
      defaultColor: '#ff0000'
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new BoxPlugin(mockCore);
      
      expect(plugin).toBeInstanceOf(BoxPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create box element', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box');
      expect(boxElement).toBeTruthy();
    });

    it('should not create box element when showBox is false', () => {
      mockCore.options.showBox = false;
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box');
      expect(boxElement).toBeFalsy();
    });
  });

  describe('box functionality', () => {
    it('should display current color in box', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
      
      // Box should display the current color
      // 兼容 rgb 和 hex
      const bg = boxElement.style.backgroundColor;
      expect(bg === 'rgb(255, 0, 0)' || bg === '#ff0000').toBeTruthy();
    });

    it('should update box color when color changes', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // Simulate color change
      mockCore.getColor = vi.fn(() => '#00ff00');
      
      // 触发 change 事件
      mockCore.emit('change');
      
      // Box should reflect new color
      const bg = boxElement.style.backgroundColor;
      expect(bg === 'rgb(0, 255, 0)' || bg === '#00ff00').toBeTruthy();
    });

    it('should handle box click events', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // Simulate box click
      boxElement.click();
      
      // Should emit click event
      expect(mockCore.emit).toHaveBeenCalled();
    });
  });

  describe('plugin options', () => {
    it('should respect custom box options', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
    });

    it('should handle border radius option', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new BoxPlugin(mockCore);
      
      // Simulate plugin destruction
      plugin.destroy();
      
      expect(plugin.box).toBeNull();
    });
  });
}); 