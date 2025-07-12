import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import ButtonPlugin from '../src/index';

describe('Button Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showButton: true,
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
      const plugin = new ButtonPlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create button element', () => {
      const plugin = new ButtonPlugin();
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.ew-color-picker-button');
      expect(buttonElement).toBeTruthy();
    });

    it('should not create button element when showButton is false', () => {
      mockCore.options.showButton = false;
      const plugin = new ButtonPlugin();
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.ew-color-picker-button');
      expect(buttonElement).toBeFalsy();
    });
  });

  describe('button functionality', () => {
    it('should handle button click events', () => {
      const plugin = new ButtonPlugin();
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.ew-color-picker-button') as HTMLElement;
      expect(buttonElement).toBeTruthy();
      
      // Simulate button click
      buttonElement.click();
      
      // Should emit click event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update button color when color changes', () => {
      const plugin = new ButtonPlugin();
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.ew-color-picker-button') as HTMLElement;
      
      // Simulate color change
      mockCore.getColor = vi.fn(() => '#00ff00');
      
      // Trigger color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      colorChangeHandler();
      
      // Button should reflect new color
      expect(buttonElement.style.backgroundColor).toBe('rgb(0, 255, 0)');
    });
  });

  describe('plugin options', () => {
    it('should respect custom button options', () => {
      const plugin = new ButtonPlugin({
        text: 'Pick Color',
        className: 'custom-button'
      });
      
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.custom-button') as HTMLElement;
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.textContent).toBe('Pick Color');
    });

    it('should handle button size options', () => {
      const plugin = new ButtonPlugin({
        width: '100px',
        height: '40px'
      });
      
      plugin.install(mockCore);
      
      const buttonElement = container.querySelector('.ew-color-picker-button') as HTMLElement;
      expect(buttonElement.style.width).toBe('100px');
      expect(buttonElement.style.height).toBe('40px');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new ButtonPlugin();
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