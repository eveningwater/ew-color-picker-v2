import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import PanelPlugin from '../src/index';

describe('Panel Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    container.className = 'panelContainer';
    document.body.appendChild(container);
    
    // 创建完整的 DOM 结构
    const panelContainer = create('div');
    panelContainer.className = 'panelContainer';
    container.appendChild(panelContainer);
    
    const bottomRow = create('div');
    bottomRow.className = 'ew-color-picker-bottom-row';
    panelContainer.appendChild(bottomRow);
    
    mockCore = {
      container,
      getMountPoint: vi.fn((name: string) => {
        if (name === 'panelContainer') return panelContainer;
        return container;
      }),
      options: {
        showPanel: true,
        defaultColor: '#ff0000'
      },
      on: vi.fn(),
      emit: vi.fn(),
      getColor: vi.fn(() => '#ff0000'),
      setColor: vi.fn(),
      destroy: vi.fn(),
      trigger: vi.fn()
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new PanelPlugin(mockCore);
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create panel element', () => {
      const plugin = new PanelPlugin(mockCore);
      plugin.install(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeTruthy();
    });

    it('should not create panel element when showPanel is false', () => {
      mockCore.options.showPanel = false;
      const plugin = new PanelPlugin(mockCore);
      plugin.install(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeFalsy();
    });
  });

  describe('panel functionality', () => {
    it('should handle mouse events on panel', () => {
      const plugin = new PanelPlugin(mockCore);
      plugin.install(mockCore);
      
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
      plugin.install(mockCore);
      
      const panelElement = container.querySelector('.ew-color-picker-panel') as HTMLElement;
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 200
      };
      panelElement.getBoundingClientRect = vi.fn(() => mockRect);
      
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
      plugin.install(mockCore);
      
      // Simulate color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      expect(colorChangeHandler).toBeDefined();
      
      // Call the color change handler
      colorChangeHandler();
      
      // Should update the panel
      const panelElement = container.querySelector('.ew-color-picker-panel');
      expect(panelElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom panel options', () => {
      const plugin = new PanelPlugin(mockCore, {
        width: 300,
        height: 300,
        className: 'custom-panel'
      });
      
      plugin.install(mockCore);
      
      const panelElement = container.querySelector('.custom-panel') as HTMLElement;
      expect(panelElement).toBeTruthy();
      expect(panelElement.style.width).toBe('300px');
      expect(panelElement.style.height).toBe('300px');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new PanelPlugin(mockCore);
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