import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import PredefinePlugin from '../src/index';

describe('Predefine Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showPredefine: true,
        defaultColor: '#ff0000',
        predefineColors: ['#ff0000', '#00ff00', '#0000ff']
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
      const plugin = new PredefinePlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create predefine element', () => {
      const plugin = new PredefinePlugin();
      plugin.install(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine');
      expect(predefineElement).toBeTruthy();
    });

    it('should not create predefine element when showPredefine is false', () => {
      mockCore.options.showPredefine = false;
      const plugin = new PredefinePlugin();
      plugin.install(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine');
      expect(predefineElement).toBeFalsy();
    });
  });

  describe('predefine functionality', () => {
    it('should create color swatches for predefined colors', () => {
      const plugin = new PredefinePlugin();
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      expect(swatches.length).toBe(3);
    });

    it('should handle color swatch click events', () => {
      const plugin = new PredefinePlugin();
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      const firstSwatch = swatches[0] as HTMLElement;
      
      // Simulate swatch click
      firstSwatch.click();
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
      expect(mockCore.setColor).toHaveBeenCalledWith('#ff0000');
    });

    it('should highlight selected color', () => {
      const plugin = new PredefinePlugin();
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      const firstSwatch = swatches[0] as HTMLElement;
      
      // Click first swatch
      firstSwatch.click();
      
      // Should have active class
      expect(firstSwatch.classList.contains('active')).toBe(true);
    });
  });

  describe('plugin options', () => {
    it('should respect custom predefine options', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
      const plugin = new PredefinePlugin({
        colors: customColors,
        className: 'custom-predefine'
      });
      
      plugin.install(mockCore);
      
      const predefineElement = container.querySelector('.custom-predefine');
      expect(predefineElement).toBeTruthy();
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      expect(swatches.length).toBe(4);
    });

    it('should handle empty color array', () => {
      const plugin = new PredefinePlugin({
        colors: []
      });
      
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      expect(swatches.length).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new PredefinePlugin();
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