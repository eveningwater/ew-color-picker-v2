import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from '@ew-color-picker/utils';
import HuePlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

describe('Hue Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = createMockCore(container, {
      showHue: true
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
      const plugin = new HuePlugin(mockCore);
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create hue slider element', () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-slider');
      expect(hueElement).toBeTruthy();
    });

    it('should not create hue element when showHue is false', () => {
      mockCore.options.showHue = false;
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-slider');
      expect(hueElement).toBeFalsy();
    });
  });

  describe('hue slider functionality', () => {
    it('should handle mouse events on hue slider', async () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const hueElement = container.querySelector('.ew-color-picker-slider') as HTMLElement;
      expect(hueElement).toBeTruthy();
      
      // 获取 hue bar 元素
      const hueBar = hueElement.querySelector('.ew-color-picker-slider-bar') as HTMLElement;
      expect(hueBar).toBeTruthy();
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 20,
        x: 0,
        y: 0,
        bottom: 20,
        right: 200,
        toJSON: () => mockRect
      } as DOMRect;
      hueBar.getBoundingClientRect = vi.fn(() => mockRect);
      
      // Simulate mouse down event
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 10
      });
      
      hueBar.dispatchEvent(mouseEvent);
      
      // Should call setColor
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should update hue value on slider interaction', async () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      // 等待事件绑定完成
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const hueElement = container.querySelector('.ew-color-picker-slider') as HTMLElement;
      const hueBar = hueElement.querySelector('.ew-color-picker-slider-bar') as HTMLElement;
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 20,
        x: 0,
        y: 0,
        bottom: 20,
        right: 200,
        toJSON: () => mockRect
      } as DOMRect;
      hueBar.getBoundingClientRect = vi.fn(() => mockRect);
      
      // Simulate mouse event at 50% position
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 10
      });
      
      hueBar.dispatchEvent(mouseEvent);
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });
  });

  describe('color updates', () => {
    it('should update hue slider when color changes', () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      // Simulate color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      expect(colorChangeHandler).toBeDefined();
      
      // Call the color change handler
      colorChangeHandler();
      
      // Should update the hue slider
      const hueElement = container.querySelector('.ew-color-picker-slider');
      expect(hueElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom hue options', () => {
      mockCore.options.hueDirection = 'horizontal';
      
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-slider') as HTMLElement;
      expect(hueElement).toBeTruthy();
      expect(hueElement.classList.contains('ew-color-picker-is-horizontal')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      // Mock destroy method
      const destroySpy = vi.fn();
      mockCore.destroy = destroySpy;
      
      // Simulate core destruction
      plugin.destroy();
      
      expect(plugin.hueBar).toBeNull();
      expect(plugin.hueThumb).toBeNull();
    });
  });
}); 