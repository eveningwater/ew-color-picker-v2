import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create } from '@ew-color-picker/utils';
import { EWColorPickerCore } from '../src/index';

describe('EWColorPickerCore', () => {
  let container: HTMLElement;
  let core: EWColorPickerCore;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (core) {
      core.destroy();
    }
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should create core instance with default options', () => {
      core = new EWColorPickerCore(container);
      
      expect(core).toBeInstanceOf(EWColorPickerCore);
      expect(core.container).toBe(container);
      expect(core.options).toBeDefined();
    });

    it('should create core instance with custom options', () => {
      const options = {
        defaultColor: '#ff0000',
        showAlpha: true,
        showHue: true
      };
      
      core = new EWColorPickerCore(container, options);
      
      expect(core.options.defaultColor).toBe('#ff0000');
      expect(core.options.showAlpha).toBe(true);
      expect(core.options.showHue).toBe(true);
    });
  });

  describe('plugin management', () => {
    it('should register plugins', () => {
      core = new EWColorPickerCore(container);
      
      const mockPlugin = {
        name: 'test-plugin',
        install: vi.fn()
      };
      
      core.use(mockPlugin);
      
      expect(mockPlugin.install).toHaveBeenCalledWith(core);
    });

    it('should apply plugins during initialization', () => {
      const mockPlugin = {
        name: 'test-plugin',
        install: vi.fn()
      };
      
      core = new EWColorPickerCore(container);
      core.use(mockPlugin);
      core.init();
      
      expect(mockPlugin.install).toHaveBeenCalled();
    });
  });

  describe('color management', () => {
    it('should set and get color', () => {
      core = new EWColorPickerCore(container);
      
      core.setColor('#00ff00');
      const color = core.getColor();
      
      expect(color).toBe('#00ff00');
    });

    it('should emit color change events', () => {
      core = new EWColorPickerCore(container);
      let eventEmitted = false;
      
      core.on('change', () => {
        eventEmitted = true;
      });
      
      core.setColor('#ff0000');
      
      expect(eventEmitted).toBe(true);
    });
  });

  describe('lifecycle methods', () => {
    it('should initialize properly', () => {
      core = new EWColorPickerCore(container);
      
      expect(() => core.init()).not.toThrow();
    });

    it('should destroy properly', () => {
      core = new EWColorPickerCore(container);
      core.init();
      
      expect(() => core.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      core = new EWColorPickerCore(container);
      core.init();
      core.destroy();
      
      expect(() => core.destroy()).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      core = new EWColorPickerCore(container);
      let eventHandled = false;
      
      core.on('test-event', () => {
        eventHandled = true;
      });
      
      core.emit('test-event');
      
      expect(eventHandled).toBe(true);
    });

    it('should remove event listeners', () => {
      core = new EWColorPickerCore(container);
      let eventHandled = false;
      
      const handler = () => {
        eventHandled = true;
      };
      
      core.on('test-event', handler);
      core.off('test-event', handler);
      core.emit('test-event');
      
      expect(eventHandled).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should get container element', () => {
      core = new EWColorPickerCore(container);
      
      expect(core.getContainer()).toBe(container);
    });

    it('should get current options', () => {
      const options = { defaultColor: '#ff0000' };
      core = new EWColorPickerCore(container, options);
      
      expect(core.getOptions()).toEqual(expect.objectContaining(options));
    });

    it('should update options', () => {
      core = new EWColorPickerCore(container);
      const newOptions = { showAlpha: true };
      
      core.updateOptions(newOptions);
      
      expect(core.options.showAlpha).toBe(true);
    });
  });
}); 