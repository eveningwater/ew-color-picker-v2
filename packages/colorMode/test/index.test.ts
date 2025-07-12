import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import ColorModePlugin from '../src/index';

describe('ColorMode Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showColorMode: true,
        defaultColor: '#ff0000',
        colorMode: 'hex'
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
      const plugin = new ColorModePlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create color mode element', () => {
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const colorModeElement = container.querySelector('.ew-color-picker-color-mode');
      expect(colorModeElement).toBeTruthy();
    });

    it('should not create color mode element when showColorMode is false', () => {
      mockCore.options.showColorMode = false;
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const colorModeElement = container.querySelector('.ew-color-picker-color-mode');
      expect(colorModeElement).toBeFalsy();
    });
  });

  describe('color mode functionality', () => {
    it('should create mode buttons for different color formats', () => {
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      expect(modeButtons.length).toBeGreaterThan(0);
    });

    it('should handle mode button click events', () => {
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      const rgbButton = Array.from(modeButtons).find(btn => 
        btn.textContent?.includes('RGB')
      ) as HTMLElement;
      
      // Simulate mode button click
      rgbButton.click();
      
      // Should emit mode change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should highlight active mode', () => {
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      const hexButton = Array.from(modeButtons).find(btn => 
        btn.textContent?.includes('HEX')
      ) as HTMLElement;
      
      // HEX should be active by default
      expect(hexButton.classList.contains('active')).toBe(true);
    });

    it('should switch active mode on button click', () => {
      const plugin = new ColorModePlugin();
      plugin.install(mockCore);
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      const hexButton = Array.from(modeButtons).find(btn => 
        btn.textContent?.includes('HEX')
      ) as HTMLElement;
      const rgbButton = Array.from(modeButtons).find(btn => 
        btn.textContent?.includes('RGB')
      ) as HTMLElement;
      
      // Click RGB button
      rgbButton.click();
      
      // RGB should be active, HEX should not
      expect(rgbButton.classList.contains('active')).toBe(true);
      expect(hexButton.classList.contains('active')).toBe(false);
    });
  });

  describe('plugin options', () => {
    it('should respect custom color mode options', () => {
      const plugin = new ColorModePlugin({
        modes: ['hex', 'rgb'],
        defaultMode: 'rgb',
        className: 'custom-color-mode'
      });
      
      plugin.install(mockCore);
      
      const colorModeElement = container.querySelector('.custom-color-mode');
      expect(colorModeElement).toBeTruthy();
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      expect(modeButtons.length).toBe(2);
    });

    it('should handle single mode option', () => {
      const plugin = new ColorModePlugin({
        modes: ['hex']
      });
      
      plugin.install(mockCore);
      
      const modeButtons = container.querySelectorAll('.ew-color-picker-mode-button');
      expect(modeButtons.length).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new ColorModePlugin();
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