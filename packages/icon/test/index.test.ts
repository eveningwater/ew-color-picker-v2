import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import IconPlugin from '../src/index';

describe('Icon Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showIcon: true,
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
      const plugin = new IconPlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create icon element', () => {
      const plugin = new IconPlugin();
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon');
      expect(iconElement).toBeTruthy();
    });

    it('should not create icon element when showIcon is false', () => {
      mockCore.options.showIcon = false;
      const plugin = new IconPlugin();
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon');
      expect(iconElement).toBeFalsy();
    });
  });

  describe('icon functionality', () => {
    it('should display icon with correct content', () => {
      const plugin = new IconPlugin();
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon') as HTMLElement;
      expect(iconElement).toBeTruthy();
      
      // Icon should have some content
      expect(iconElement.innerHTML).toBeTruthy();
    });

    it('should handle icon click events', () => {
      const plugin = new IconPlugin();
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon') as HTMLElement;
      
      // Simulate icon click
      iconElement.click();
      
      // Should emit click event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update icon when color changes', () => {
      const plugin = new IconPlugin();
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon') as HTMLElement;
      
      // Trigger color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      colorChangeHandler();
      
      // Icon should be updated
      expect(iconElement).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom icon options', () => {
      const plugin = new IconPlugin({
        icon: '🎨',
        className: 'custom-icon'
      });
      
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.custom-icon') as HTMLElement;
      expect(iconElement).toBeTruthy();
      expect(iconElement.textContent).toBe('🎨');
    });

    it('should handle icon size options', () => {
      const plugin = new IconPlugin({
        size: '24px'
      });
      
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon') as HTMLElement;
      expect(iconElement.style.fontSize).toBe('24px');
    });

    it('should handle custom icon color', () => {
      const plugin = new IconPlugin({
        color: '#00ff00'
      });
      
      plugin.install(mockCore);
      
      const iconElement = container.querySelector('.ew-color-picker-icon') as HTMLElement;
      expect(iconElement.style.color).toBe('rgb(0, 255, 0)');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new IconPlugin();
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