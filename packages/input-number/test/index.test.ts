import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import InputNumberPlugin from '../src/index';

describe('InputNumber Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showInputNumber: true,
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
      const plugin = new InputNumberPlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create input number elements', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
    });

    it('should not create input number elements when showInputNumber is false', () => {
      mockCore.options.showInputNumber = false;
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      expect(inputElements.length).toBe(0);
    });
  });

  describe('input number functionality', () => {
    it('should handle input change events', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Simulate input change
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('input'));
      
      // Should emit color change event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should handle input blur events', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Simulate input blur
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should validate numeric input', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Test valid numeric input
      firstInput.value = '255';
      firstInput.dispatchEvent(new Event('blur'));
      
      expect(mockCore.setColor).toHaveBeenCalled();
    });

    it('should handle invalid numeric input', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      const firstInput = inputElements[0] as HTMLInputElement;
      
      // Test invalid input
      firstInput.value = 'abc';
      firstInput.dispatchEvent(new Event('blur'));
      
      // Should not call setColor with invalid input
      expect(mockCore.setColor).not.toHaveBeenCalledWith(expect.objectContaining({
        r: NaN
      }));
    });
  });

  describe('color updates', () => {
    it('should update input numbers when color changes', () => {
      const plugin = new InputNumberPlugin();
      plugin.install(mockCore);
      
      // Simulate color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      expect(colorChangeHandler).toBeDefined();
      
      // Call the color change handler
      colorChangeHandler();
      
      // Should update the input numbers
      const inputElements = container.querySelectorAll('.ew-color-picker-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
    });
  });

  describe('plugin options', () => {
    it('should respect custom input number options', () => {
      const plugin = new InputNumberPlugin({
        min: 0,
        max: 255,
        step: 1,
        className: 'custom-input-number'
      });
      
      plugin.install(mockCore);
      
      const inputElements = container.querySelectorAll('.custom-input-number');
      expect(inputElements.length).toBeGreaterThan(0);
      
      const firstInput = inputElements[0] as HTMLInputElement;
      expect(firstInput.min).toBe('0');
      expect(firstInput.max).toBe('255');
      expect(firstInput.step).toBe('1');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new InputNumberPlugin();
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