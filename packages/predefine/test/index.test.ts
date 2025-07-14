import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PredefinePlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('Predefine Plugin', () => {
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
        showPredefine: true,
        ewColorPickerPredefine: {
            predefineColor: ['#ff0000', '#00ff00', '#0000ff'],
            showPredefine: true
        }
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
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      expect(plugin).toBeInstanceOf(PredefinePlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create predefine element', () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      plugin.render(); // 确保插入DOM
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeTruthy();
    });

    it('should not create predefine element when showPredefine is false', () => {
      mockCore.options.ewColorPickerPredefine = false;
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeFalsy();
    });
  });

  describe('predefine functionality', () => {
    it('should create color swatches for predefined colors', () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      plugin.handleOptions(); // 确保 options 结构正确
      plugin.render(); // 确保插入DOM
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(3);
    });

    it('should handle color swatch click events', async () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      plugin.handleOptions(); // 确保 options 结构正确
      plugin.render(); // 确保插入DOM
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 100));
      const firstSwatch = container.querySelector('.ew-color-picker-predefine-color-item') as HTMLElement;
      expect(firstSwatch).toBeTruthy();
      // 直接调用 onPredefineColorClick 方法来测试功能
      (plugin as any).onPredefineColorClick({ target: firstSwatch }, '#ff0000');
      // Should call setColor
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should highlight selected color', async () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      plugin.handleOptions(); // 确保 options 结构正确
      plugin.render(); // 确保插入DOM
      
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 100));
      const firstPredefineColor = plugin.predefineItems[0] as HTMLElement;
      expect(firstPredefineColor).toBeTruthy();

      // 确保事件已绑定，predefineItems 数组已填充
      plugin.bindEvents();
      
      // 直接调用非防抖的方法，避免防抖延迟
      (plugin as any).onPredefineColorClick({ target: firstPredefineColor }, '#ff0000');
      
      console.log('firstPredefineColor', firstPredefineColor);
      // 直接检查元素的 className 属性
      expect(firstPredefineColor.className).toContain('ew-color-picker-predefine-color-active');
    });
  });

  describe('plugin options', () => {
    it('should respect custom predefine options', () => {
      mockCore.options.ewColorPickerPredefine = {
        predefineColor: ['#ff0000', '#00ff00'],
        showPredefine: true
      };
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      plugin.handleOptions(); // 确保 options 结构正确
      plugin.render(); // 确保插入DOM
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeTruthy();
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(2);
    });

    it('should handle empty color array', () => {
      mockCore.options.ewColorPickerPredefine = {
        predefineColor: [],
        showPredefine: true
      };
      
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      // Simulate plugin destruction
      plugin.destroy?.();
      
      expect(plugin.predefineItems).toEqual([]);
      expect(plugin.container).toBeNull();
    });
  });
}); 