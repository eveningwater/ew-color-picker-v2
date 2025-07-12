import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from '@ew-color-picker/utils';
import ewColorPicker from '../src/index';

describe('ewColorPicker', () => {
  let container: HTMLElement;
  let core: ewColorPicker;

  beforeEach(() => {
    container = create('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (core) {
      core.destroy();
    }
    // 安全地移除容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should create core instance with default options', () => {
      core = new ewColorPicker({ el: container });
      
      expect(core).toBeInstanceOf(ewColorPicker);
      expect(core.wrapper).toBe(container);
      expect(core.options).toBeDefined();
    });

    it('should create core instance with custom options', () => {
      const options = {
        el: container,
        defaultColor: '#ff0000',
        showAlpha: true,
        showHue: true
      };
      
      core = new ewColorPicker(options);
      
      expect(core.options.defaultColor).toBe('#ff0000');
      expect(core.options.showAlpha).toBe(true);
      expect(core.options.showHue).toBe(true);
    });
  });

  describe('plugin management', () => {
    it('should register plugins', () => {
      core = new ewColorPicker({ el: container });
      
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
      
      core = new ewColorPicker({ el: container });
      core.use(mockPlugin);
      
      expect(mockPlugin.install).toHaveBeenCalled();
    });
  });

  describe('color management', () => {
    it('should set and get color', () => {
      core = new ewColorPicker({ el: container });
      
      core.setColor('#00ff00');
      const color = core.getColor();
      
      expect(color).toBe('#00ff00');
    });

    it('should emit color change events', () => {
      core = new ewColorPicker({ el: container });
      let eventEmitted = false;
      
      core.hooks.on('change', () => {
        eventEmitted = true;
      });
      
      core.setColor('#ff0000');
      
      expect(eventEmitted).toBe(true);
    });
  });

  describe('lifecycle methods', () => {
    it('should initialize properly', () => {
      core = new ewColorPicker({ el: container });
      
      expect(core).toBeDefined();
    });

    it('should destroy properly', () => {
      core = new ewColorPicker({ el: container });
      
      expect(() => core.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      core = new ewColorPicker({ el: container });
      core.destroy();
      
      expect(() => core.destroy()).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      core = new ewColorPicker({ el: container });
      let eventHandled = false;
      
      core.hooks.on('test-event', () => {
        eventHandled = true;
      });
      
      core.emit('test-event');
      
      expect(eventHandled).toBe(true);
    });

    it('should remove event listeners', () => {
      core = new ewColorPicker({ el: container });
      let eventHandled = false;
      
      const handler = () => {
        eventHandled = true;
      };
      
      core.hooks.on('test-event', handler);
      core.hooks.off('test-event', handler);
      core.emit('test-event');
      
      expect(eventHandled).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should get container element', () => {
      core = new ewColorPicker({ el: container });
      
      expect(core.getContainer()).toBe(container);
    });

    it('should get current options', () => {
      const options = { el: container, defaultColor: '#ff0000' };
      core = new ewColorPicker(options);
      
      expect(core.getOptions()).toEqual(expect.objectContaining(options));
    });

    it('should update options', () => {
      core = new ewColorPicker({ el: container });
      const newOptions = { showAlpha: true };
      
      core.updateOptions(newOptions);
      
      expect(core.options.showAlpha).toBe(true);
    });
  });
}); 