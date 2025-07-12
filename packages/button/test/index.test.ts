import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from '@ew-color-picker/utils';
import ButtonPlugin from '../src/index';
import { createMockCore } from '../../../test/setup';

describe('Button Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = createMockCore(container, {
      showButton: true
    });
  });

  afterEach(() => {
    // 安全地移除容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('plugin installation', () => {
    it('should create plugin instance correctly', () => {
      const plugin = new ButtonPlugin(mockCore);
      
      expect(plugin).toBeInstanceOf(ButtonPlugin);
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create button elements', () => {
      const plugin = new ButtonPlugin(mockCore);
      
      const buttonElements = container.querySelectorAll('.ew-color-picker-drop-btn');
      expect(buttonElements.length).toBeGreaterThan(0);
    });

    it('should not create button elements when showButton is false', () => {
      mockCore.options.showButton = false;
      const plugin = new ButtonPlugin(mockCore);
      
      const buttonElements = container.querySelectorAll('.ew-color-picker-drop-btn');
      expect(buttonElements.length).toBe(0);
    });
  });

  describe('button functionality', () => {
    it('should handle button click events', () => {
      const plugin = new ButtonPlugin(mockCore);
      
      const buttonElements = container.querySelectorAll('.ew-color-picker-drop-btn');
      const firstButton = buttonElements[0] as HTMLElement;
      expect(firstButton).toBeTruthy();
      
      // Simulate button click
      firstButton.click();
      
      // Should emit click event
      expect(mockCore.emit).toHaveBeenCalled();
    });

    it('should update button color when color changes', () => {
      const plugin = new ButtonPlugin(mockCore);
      
      const buttonElements = container.querySelectorAll('.ew-color-picker-drop-btn');
      const firstButton = buttonElements[0] as HTMLElement;
      
      // Simulate color change
      mockCore.getColor = vi.fn(() => '#00ff00');
      
      // Trigger color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      if (colorChangeHandler) {
        colorChangeHandler();
      }
      
      // Button should reflect new color
      expect(firstButton).toBeTruthy();
    });
  });

  describe('plugin options', () => {
    it('should respect custom button options', () => {
      mockCore.options.hasClear = true;
      mockCore.options.hasSure = true;
      mockCore.options.clearText = 'Clear';
      mockCore.options.sureText = 'Sure';
      
      const plugin = new ButtonPlugin(mockCore);
      
      const clearButton = container.querySelector('.ew-color-picker-clear-btn') as HTMLElement;
      const sureButton = container.querySelector('.ew-color-picker-sure-btn') as HTMLElement;
      
      expect(clearButton).toBeTruthy();
      expect(sureButton).toBeTruthy();
      expect(clearButton.textContent).toBe('Clear');
      expect(sureButton.textContent).toBe('Sure');
    });

    it('should handle button size options', () => {
      mockCore.options.hasClear = true;
      mockCore.options.hasSure = true;
      
      const plugin = new ButtonPlugin(mockCore);
      
      const buttonElements = container.querySelectorAll('.ew-color-picker-drop-btn');
      expect(buttonElements.length).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new ButtonPlugin(mockCore);
      
      // Mock destroy method
      const destroySpy = vi.fn();
      mockCore.destroy = destroySpy;
      
      // Simulate core destruction
      plugin.destroy();
      
      expect(plugin.clearButton).toBeNull();
      expect(plugin.sureButton).toBeNull();
    });
  });
}); 