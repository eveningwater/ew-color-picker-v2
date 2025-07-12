import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import BoxPlugin from '../src/index';

describe('Box Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showBox: true,
        defaultColor: '#ff0000'
      },
      on: vi.fn(),
      emit: vi.fn(),
      getColor: vi.fn(() => '#ff0000'),
      setColor: vi.fn()
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new BoxPlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create box element', () => {
      const plugin = new BoxPlugin();
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box');
      expect(boxElement).toBeTruthy();
    });

    it('should not create box element when showBox is false', () => {
      mockCore.options.showBox = false;
      const plugin = new BoxPlugin();
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box');
      expect(boxElement).toBeFalsy();
    });
  });

  describe('box functionality', () => {
    it('should display current color in box', () => {
      const plugin = new BoxPlugin();
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
      
      // Box should display the current color
      expect(boxElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should update box color when color changes', () => {
      const plugin = new BoxPlugin();
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // Simulate color change
      mockCore.getColor = vi.fn(() => '#00ff00');
      
      // Trigger color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      colorChangeHandler();
      
      // Box should reflect new color
      expect(boxElement.style.backgroundColor).toBe('rgb(0, 255, 0)');
    });

    it('should handle box click events', () => {
      const plugin = new BoxPlugin();
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      
      // Simulate box click
      boxElement.click();
      
      // Should emit click event
      expect(mockCore.emit).toHaveBeenCalled();
    });
  });

  describe('plugin options', () => {
    it('should respect custom box options', () => {
      const plugin = new BoxPlugin({
        width: '50px',
        height: '50px',
        className: 'custom-box'
      });
      
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.custom-box') as HTMLElement;
      expect(boxElement).toBeTruthy();
      expect(boxElement.style.width).toBe('50px');
      expect(boxElement.style.height).toBe('50px');
    });

    it('should handle border radius option', () => {
      const plugin = new BoxPlugin({
        borderRadius: '10px'
      });
      
      plugin.install(mockCore);
      
      const boxElement = container.querySelector('.ew-color-picker-box') as HTMLElement;
      expect(boxElement.style.borderRadius).toBe('10px');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new BoxPlugin();
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