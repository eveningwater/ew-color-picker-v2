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
    it('should install plugin correctly', () => {
      const plugin = new PanelPlugin(mockCore);
      
      expect(plugin).toBeInstanceOf(PanelPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create panel element', () => {
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeTruthy();
    });

    it('should not create panel element when showPanel is false', () => {
      mockCore.options.showPanel = false;
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeFalsy();
    });
  });

  describe('panel functionality', () => {
    it('should handle mouse events on panel', () => {
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      expect(panelElement).toBeTruthy();
      
      // Simulate mouse down event
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 50
      });
      
      panelElement.dispatchEvent(mouseEvent);
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update color on panel interaction', () => {
      const plugin = new PanelPlugin(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        bottom: 200,
        right: 200,
        toJSON: () => mockRect
      };
      panelElement.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);
      
      // Simulate mouse event
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100
      });
      
      panelElement.dispatchEvent(mouseEvent);
      
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