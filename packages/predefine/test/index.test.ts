import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PredefinePlugin from '../src/index';
import { createMockCore } from '../../../test/mockCore';

function create(tag: string) {
  return document.createElement(tag);
}

describe('Predefine Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    // 创建完整的 DOM 结构
    const panelContainer = create('div');
    panelContainer.className = 'ew-color-picker-panel-container';
    container.appendChild(panelContainer);
    
    const bottomRow = create('div');
    bottomRow.className = 'ew-color-picker-bottom-row';
    panelContainer.appendChild(bottomRow);
    
    mockCore = createMockCore(container, {
      showPredefine: true,
      predefineColors: ['#ff0000', '#00ff00', '#0000ff']
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
      const plugin = new PredefinePlugin(mockCore);
      
      expect(plugin).toBeInstanceOf(PredefinePlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create predefine element', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeTruthy();
    });

    it('should not create predefine element when showPredefine is false', () => {
      mockCore.options.showPredefine = false;
      const plugin = new PredefinePlugin(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeFalsy();
    });
  });

  describe('predefine functionality', () => {
    it('should create color swatches for predefined colors', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(3);
    });

    it('should handle color swatch click events', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      const firstSwatch = container.querySelector('.ew-color-picker-predefine-color-item') as HTMLElement;
      expect(firstSwatch).toBeTruthy();
      
      // Simulate swatch click
      firstSwatch.click();
      
      // Should emit color change event
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should highlight selected color', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      const firstSwatch = container.querySelector('.ew-color-picker-predefine-color-item') as HTMLElement;
      expect(firstSwatch).toBeTruthy();
      
      // Click first swatch
      firstSwatch.click();
      
      // Should have active class
      expect(firstSwatch.classList.contains('ew-color-picker-predefine-color-active')).toBe(true);
    });
  });

  describe('plugin options', () => {
    it('should respect custom predefine options', () => {
      mockCore.options.predefineColor = ['#ff0000', '#00ff00'];
      
      const plugin = new PredefinePlugin(mockCore);
      
      const predefineElement = container.querySelector('.ew-color-picker-predefine-container');
      expect(predefineElement).toBeTruthy();
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(2);
    });

    it('should handle empty color array', () => {
      mockCore.options.predefineColor = [];
      
      const plugin = new PredefinePlugin(mockCore);
      
      const swatches = container.querySelectorAll('.ew-color-picker-predefine-color-item');
      expect(swatches.length).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new PredefinePlugin(mockCore);
      
      // Simulate plugin destruction
      plugin.destroy?.();
      
      expect(plugin.predefineItems).toEqual([]);
      expect(plugin.container).toBeNull();
    });
  });
}); 