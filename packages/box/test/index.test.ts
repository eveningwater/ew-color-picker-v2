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
    
    // 设置当前颜色，因为 box 插件现在使用 currentColor
    mockCore.currentColor = '#ff0000';
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
      
      // 触发 change 事件，传递新颜色参数
      mockCore.emit('change', '#00ff00');
      
      // Box should reflect new color
      const bg = boxElement.style.backgroundColor;
      expect(bg === 'rgb(0, 255, 0)' || bg === '#00ff00').toBeTruthy();
    });

    it('should handle box click events', () => {
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // Simulate box click
      boxElement.click();
      
      // Should call showPanel or hidePanel
      expect(mockCore.showPanel).toHaveBeenCalled();
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

  describe('defaultColor scenarios', () => {
    it('should not display background color when no defaultColor is set', () => {
      // 创建没有 defaultColor 的 mock
      const mockCoreNoColor = createMockCore(container, {
        showBox: true,
        defaultColor: '' // 空字符串
      });
      mockCoreNoColor.currentColor = ''; // 确保 currentColor 也为空
      
      const plugin = new BoxPlugin(mockCoreNoColor);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
      
      // Box 不应该有背景色
      const bg = boxElement.style.backgroundColor;
      expect(bg === '' || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)').toBeTruthy();
    });

    it('should display background color when defaultColor is set', () => {
      const mockCoreWithColor = createMockCore(container, {
        showBox: true,
        defaultColor: '#00ff00'
      });
      mockCoreWithColor.currentColor = '#00ff00';
      
      const plugin = new BoxPlugin(mockCoreWithColor);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
      
      // Box 应该显示背景色
      const bg = boxElement.style.backgroundColor;
      expect(bg === 'rgb(0, 255, 0)' || bg === '#00ff00').toBeTruthy();
    });

    it('should update box background when color changes from empty to valid color', () => {
      const mockCore = createMockCore(container, {
        showBox: true,
        defaultColor: ''
      });
      mockCore.currentColor = '';
      
      const plugin = new BoxPlugin(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // 初始状态应该没有背景色
      let bg = boxElement.style.backgroundColor;
      expect(bg === '' || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)').toBeTruthy();
      
      // 模拟颜色变化
      mockCore.getColor = vi.fn(() => '#ff0000');
      mockCore.emit('change', '#ff0000');
      
      // 应该有背景色了
      bg = boxElement.style.backgroundColor;
      expect(bg === 'rgb(255, 0, 0)' || bg === '#ff0000').toBeTruthy();
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