import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import PredefinePlugin from '../src/index';

describe('Predefine Plugin', () => {
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
        showPredefine: true,
        defaultColor: '#ff0000',
        predefineColors: ['#ff0000', '#00ff00', '#0000ff']
      },
      on: vi.fn(),
      emit: vi.fn(),
      getColor: vi.fn(() => '#ff0000'),
      setColor: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('plugin installation', () => {
    it('should install plugin correctly', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create predefine element', () => {
      const plugin = new PredefinePlugin(mockCore);
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
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      expect(swatches.length).toBe(3);
    });

    it('should handle color swatch click events', () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      const firstSwatch = container.querySelector('.ew-color-picker-predefine-swatch') as HTMLElement;
      expect(firstSwatch).toBeTruthy();
      
      // Simulate swatch click
      firstSwatch.click();
      
      // Should emit color change event
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should highlight selected color', () => {
      const plugin = new PredefinePlugin(mockCore);
      plugin.install(mockCore);
      
      const firstSwatch = container.querySelector('.ew-color-picker-predefine-swatch') as HTMLElement;
      expect(firstSwatch).toBeTruthy();
      
      // Click first swatch
      firstSwatch.click();
      
      // Should have active class
      expect(firstSwatch.classList.contains('active')).toBe(true);
    });
  });

  describe('plugin options', () => {
    it('should respect custom predefine options', () => {
      const plugin = new PredefinePlugin(mockCore, {
        className: 'custom-predefine',
        colors: ['#ff0000', '#00ff00']
      });
      
      plugin.install(mockCore);
      
      const predefineElement = container.querySelector('.custom-predefine');
      expect(predefineElement).toBeTruthy();
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-swatch');
      expect(swatches.length).toBe(2);
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
      const plugin = new PredefinePlugin(mockCore);
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