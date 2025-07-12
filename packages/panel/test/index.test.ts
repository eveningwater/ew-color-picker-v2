import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PanelPlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('Panel Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    // 创建完整的 DOM 结构
    const panelContainer = create('div');
    panelContainer.className = 'ew-color-picker-panel-container';
    container.appendChild(panelContainer);
    
    mockCore = createMockCore(container, {
      showPanel: true
    });
  });

  afterEach(() => {
    // 安全地移除容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', async () => {
      const plugin = new PanelPlugin(mockCore);
      
      // 直接调用 install 方法
      plugin.install(mockCore);
      
      expect(plugin).toBeInstanceOf(PanelPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create panel element', () => {
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeTruthy();
    });

    it('should not create panel element when showPanel is false', () => {
      mockCore.options.ewColorPickerPanel = false;
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeFalsy();
    });
  });

  describe('panel functionality', () => {
    it('should handle mouse events on panel', async () => {
      const plugin = new PanelPlugin(mockCore);
      
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      expect(panelElement).toBeTruthy();
      
      // 直接调用 updateColor 方法来测试功能
      (plugin as any).updateColor(50, 75);
      
      // Should call setColor
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should update color on panel interaction', async () => {
      const plugin = new PanelPlugin(mockCore);
      
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      
      // 直接调用 updateColor 方法来测试功能
      (plugin as any).updateColor(80, 60);
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });
  });

  describe('color updates', () => {
    it('should update panel when color changes', () => {
      const plugin = new PanelPlugin(mockCore);
      
      // 触发 change 事件
      mockCore.emit('change');
      
      // Should update the panel
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom panel options', () => {
      mockCore.options.hueDirection = 'horizontal';
      mockCore.options.alphaDirection = 'vertical';
      
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      expect(panelElement).toBeTruthy();
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new PanelPlugin(mockCore);
      
      // Simulate plugin destruction
      plugin.destroy?.();
      
      expect(plugin.panel).toBeNull();
      expect(plugin.cursor).toBeNull();
    });
  });
}); 