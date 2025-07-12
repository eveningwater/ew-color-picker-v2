import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import ConsolePlugin from '../src/index';

describe('Console Plugin', () => {
  let container: HTMLElement;
  let mockCore: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
    
    mockCore = {
      container,
      options: {
        showConsole: true,
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
      const plugin = new ConsolePlugin();
      
      expect(() => plugin.install(mockCore)).not.toThrow();
      expect(mockCore.on).toHaveBeenCalled();
    });

    it('should create console element', () => {
      const plugin = new ConsolePlugin();
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console');
      expect(consoleElement).toBeTruthy();
    });

    it('should not create console element when showConsole is false', () => {
      mockCore.options.showConsole = false;
      const plugin = new ConsolePlugin();
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console');
      expect(consoleElement).toBeFalsy();
    });
  });

  describe('console functionality', () => {
    it('should display color information', () => {
      const plugin = new ConsolePlugin();
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console') as HTMLElement;
      expect(consoleElement).toBeTruthy();
      
      // Console should display color information
      expect(consoleElement.textContent).toContain('#ff0000');
    });

    it('should update console when color changes', () => {
      const plugin = new ConsolePlugin();
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console') as HTMLElement;
      
      // Simulate color change
      mockCore.getColor = vi.fn(() => '#00ff00');
      
      // Trigger color change event
      const colorChangeHandler = mockCore.on.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];
      
      colorChangeHandler();
      
      // Console should reflect new color
      expect(consoleElement.textContent).toContain('#00ff00');
    });

    it('should display multiple color formats', () => {
      const plugin = new ConsolePlugin();
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console') as HTMLElement;
      
      // Console should display hex, rgb, and other formats
      expect(consoleElement.textContent).toContain('#ff0000');
      expect(consoleElement.textContent).toContain('rgb(255, 0, 0)');
    });
  });

  describe('plugin options', () => {
    it('should respect custom console options', () => {
      const plugin = new ConsolePlugin({
        formats: ['hex', 'rgb'],
        className: 'custom-console'
      });
      
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.custom-console') as HTMLElement;
      expect(consoleElement).toBeTruthy();
    });

    it('should handle specific color formats', () => {
      const plugin = new ConsolePlugin({
        formats: ['hex']
      });
      
      plugin.install(mockCore);
      
      const consoleElement = container.querySelector('.ew-color-picker-console') as HTMLElement;
      expect(consoleElement.textContent).toContain('#ff0000');
      expect(consoleElement.textContent).not.toContain('rgb(255, 0, 0)');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const plugin = new ConsolePlugin();
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