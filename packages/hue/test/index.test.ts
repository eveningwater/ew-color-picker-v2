import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import HuePlugin from '../src/index';

describe('Hue Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    // 创建完整的 DOM 结构
    const panelContainer = create('div');
    panelContainer.className = 'panelContainer';
    container.appendChild(panelContainer);
    
    mockCore = {
      container,
      getMountPoint: vi.fn((name: string) => {
        if (name === 'panelContainer') return panelContainer;
        return container;
      }),
      options: {
        showHue: true,
        defaultColor: '#ff0000'
      },
      on: vi.fn(),
      emit: vi.fn(),
      getColor: vi.fn(() => '#ff0000'),
      setColor: vi.fn(),
      destroy: vi.fn()
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
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
      
      const hueElement = container.querySelector('.ew-color-picker-hue');
      expect(hueElement).toBeTruthy();
    });

    it('should not create hue element when showHue is false', () => {
      mockCore.options.showHue = false;
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-hue');
      expect(hueElement).toBeFalsy();
    });
  });

  describe('hue slider functionality', () => {
    it('should handle mouse events on hue slider', () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-hue') as HTMLElement;
      expect(hueElement).toBeTruthy();
      
      // Simulate mouse down event
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 50
      });
      
      hueElement.dispatchEvent(mouseEvent);
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update hue value on slider interaction', () => {
      const plugin = new HuePlugin(mockCore);
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.ew-color-picker-hue') as HTMLElement;
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 20
      };
      hueElement.getBoundingClientRect = vi.fn(() => mockRect);
      
      // Simulate mouse event at 50% position
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 10
      });
      
      hueElement.dispatchEvent(mouseEvent);
      
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
      const hueElement = container.querySelector('.ew-color-picker-hue');
      expect(hueElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom hue options', () => {
      const plugin = new HuePlugin(mockCore, {
        height: 30,
        className: 'custom-hue'
      });
      
      plugin.install(mockCore);
      
      const hueElement = container.querySelector('.custom-hue') as HTMLElement;
      expect(hueElement).toBeTruthy();
      expect(hueElement.style.height).toBe('30px');
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
      plugin.destroy?.(mockCore);
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });
}); 