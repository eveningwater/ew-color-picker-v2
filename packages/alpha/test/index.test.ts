import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from '@ew-color-picker/utils';
import AlphaPlugin from '../src/index';

describe('Alpha Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showAlpha: true,
        defaultColor: '#ff0000'
      },
      on: vi.fn(),
      emit: vi.fn(),
      getColor: vi.fn(() => '#ff0000'),
      setColor: vi.fn(),
      getMountPoint: vi.fn((name: string) => {
        if (name === 'panelContainer') {
          const panelContainer = container.querySelector('.ew-color-picker-panel-container') || create('div');
          panelContainer.className = 'ew-color-picker-panel-container';
          if (!container.querySelector('.ew-color-picker-panel-container')) {
            container.appendChild(panelContainer);
          }
          return panelContainer;
        }
        return container;
      })
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new AlphaPlugin(mockCore);
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create alpha slider element', () => {
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      const alphaElement = container.querySelector('.ew-color-picker-alpha');
      expect(alphaElement).toBeTruthy();
    });

    it('should not create alpha element when showAlpha is false', () => {
      mockCore.options.showAlpha = false;
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      const alphaElement = container.querySelector('.ew-color-picker-alpha');
      expect(alphaElement).toBeFalsy();
    });
  });

  describe('alpha slider functionality', () => {
    it('should handle mouse events on alpha slider', () => {
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      const alphaElement = container.querySelector('.ew-color-picker-alpha') as HTMLElement;
      expect(alphaElement).toBeTruthy();
      
      // Simulate mouse down event
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 50
      });
      
      alphaElement.dispatchEvent(mouseEvent);
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update alpha value on slider interaction', () => {
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      const alphaElement = container.querySelector('.ew-color-picker-alpha') as HTMLElement;
      
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
      alphaElement.getBoundingClientRect = vi.fn(() => mockRect);
      
      // Simulate mouse event at 50% position
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 10
      });
      
      alphaElement.dispatchEvent(mouseEvent);
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });
  });

  describe('color updates', () => {
    it('should update alpha slider when color changes', () => {
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      // Simulate color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      expect(colorChangeHandler).toBeDefined();
      
      // Call the color change handler
      colorChangeHandler();
      
      // Should update the alpha slider
      const alphaElement = container.querySelector('.ew-color-picker-alpha');
      expect(alphaElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom alpha options', () => {
      // Update mockCore options to include alpha options
      mockCore.options.alphaDirection = 'horizontal';
      const plugin = new AlphaPlugin(mockCore);
      
      plugin.install(mockCore);
      
      const alphaElement = container.querySelector('.ew-color-picker-alpha') as HTMLElement;
      expect(alphaElement).toBeTruthy();
      expect(alphaElement.classList.contains('ew-color-picker-is-horizontal')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new AlphaPlugin(mockCore);
      plugin.install(mockCore);
      
      // Mock destroy method
      const destroySpy = vi.fn();
      mockCore.destroy = destroySpy;
      
      // Simulate core destruction
      plugin.destroy?.();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });
}); 