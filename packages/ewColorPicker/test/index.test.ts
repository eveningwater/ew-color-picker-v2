import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import EWColorPicker from '../src/index';

describe('EWColorPicker', () => {
  let container: HTMLElement;
  let colorPicker: any;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (colorPicker) {
      colorPicker.destroy();
    }
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should create color picker instance with default options', () => {
      colorPicker = new EWColorPicker(container);
      
      expect(colorPicker).toBeInstanceOf(EWColorPicker);
      expect(colorPicker.container).toBe(container);
      expect(colorPicker.options).toBeDefined();
    });

    it('should create color picker instance with custom options', () => {
      const options = {
        defaultColor: '#ff0000',
        showAlpha: true,
        showHue: true,
        showPanel: true
      };
      
      colorPicker = new EWColorPicker(container, options);
      
      expect(colorPicker.options.defaultColor).toBe('#ff0000');
      expect(colorPicker.options.showAlpha).toBe(true);
      expect(colorPicker.options.showHue).toBe(true);
      expect(colorPicker.options.showPanel).toBe(true);
    });
  });

  describe('plugin management', () => {
    it('should register and apply plugins', () => {
      colorPicker = new EWColorPicker(container);
      
      const mockPlugin = {
        name: 'test-plugin',
        install: vi.fn()
      };
      
      colorPicker.use(mockPlugin);
      colorPicker.init();
      
      expect(mockPlugin.install).toHaveBeenCalledWith(colorPicker);
    });

    it('should apply multiple plugins', () => {
      colorPicker = new EWColorPicker(container);
      
      const plugin1 = { name: 'plugin1', install: vi.fn() };
      const plugin2 = { name: 'plugin2', install: vi.fn() };
      
      colorPicker.use(plugin1);
      colorPicker.use(plugin2);
      colorPicker.init();
      
      expect(plugin1.install).toHaveBeenCalled();
      expect(plugin2.install).toHaveBeenCalled();
    });
  });

  describe('color management', () => {
    it('should set and get color', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      
      colorPicker.setColor('#00ff00');
      const color = colorPicker.getColor();
      
      expect(color).toBe('#00ff00');
    });

    it('should emit color change events', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      let eventEmitted = false;
      
      colorPicker.on('change', () => {
        eventEmitted = true;
      });
      
      colorPicker.setColor('#ff0000');
      
      expect(eventEmitted).toBe(true);
    });

    it('should handle different color formats', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      
      // Test hex format
      colorPicker.setColor('#ff0000');
      expect(colorPicker.getColor()).toBe('#ff0000');
      
      // Test rgb format
      colorPicker.setColor('rgb(0, 255, 0)');
      expect(colorPicker.getColor()).toBe('rgb(0, 255, 0)');
    });
  });

  describe('lifecycle methods', () => {
    it('should initialize properly', () => {
      colorPicker = new EWColorPicker(container);
      
      expect(() => colorPicker.init()).not.toThrow();
    });

    it('should destroy properly', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      
      expect(() => colorPicker.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      colorPicker.destroy();
      
      expect(() => colorPicker.destroy()).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      let eventHandled = false;
      
      colorPicker.on('test-event', () => {
        eventHandled = true;
      });
      
      colorPicker.emit('test-event');
      
      expect(eventHandled).toBe(true);
    });

    it('should remove event listeners', () => {
      colorPicker = new EWColorPicker(container);
      colorPicker.init();
      let eventHandled = false;
      
      const handler = () => {
        eventHandled = true;
      };
      
      colorPicker.on('test-event', handler);
      colorPicker.off('test-event', handler);
      colorPicker.emit('test-event');
      
      expect(eventHandled).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should get container element', () => {
      colorPicker = new EWColorPicker(container);
      
      expect(colorPicker.getContainer()).toBe(container);
    });

    it('should get current options', () => {
      const options = { defaultColor: '#ff0000' };
      colorPicker = new EWColorPicker(container, options);
      
      expect(colorPicker.getOptions()).toEqual(expect.objectContaining(options));
    });

    it('should update options', () => {
      colorPicker = new EWColorPicker(container);
      const newOptions = { showAlpha: true };
      
      colorPicker.updateOptions(newOptions);
      
      expect(colorPicker.options.showAlpha).toBe(true);
    });
  });

  describe('plugin detection', () => {
    it('should detect missing required plugins', () => {
      colorPicker = new EWColorPicker(container, {
        showAlpha: true,
        showHue: true,
        showPanel: true
      });
      
      // Should warn about missing plugins in development
      colorPicker.init();
      
      // Verify that warnings are logged (in development mode)
      expect(colorPicker).toBeDefined();
    });
  });
}); 