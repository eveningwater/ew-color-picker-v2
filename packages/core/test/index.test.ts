import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from '../../utils/src/dom';
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
      expect(core.wrapper).toBeDefined(); // wrapper 是创建的主容器
      expect(core.wrapper.classList.contains('ew-color-picker')).toBe(true);
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
      
      // 先监听事件，再设置颜色
      core.on('change', () => {
        eventEmitted = true;
      });
      
      // 测试事件系统是否正常工作 - 使用 emit 方法
      core.emit('change', 'test');
      expect(eventEmitted).toBe(true);
      
      // 重置
      eventEmitted = false;
      
      // 设置颜色，应该触发 change 事件
      core.setColor('#ff0000');
      
      // 直接检查事件是否被触发
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
      
      core.on('change', () => {
        eventHandled = true;
      });
      
      core.emit('change');
      
      expect(eventHandled).toBe(true);
    });

    it('should remove event listeners', () => {
      core = new ewColorPicker({ el: container });
      let eventHandled = false;
      
      const handler = () => {
        eventHandled = true;
      };
      
      core.on('change', handler);
      core.off('change', handler);
      core.emit('change');
      
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

  describe('defaultColor handling', () => {
    it('should not set currentColor when defaultColor is not provided', () => {
      core = new ewColorPicker({ el: container });
      
      // 没有设置 defaultColor 时，currentColor 应该为空
      expect(core.currentColor).toBe('');
    });

    it('should set currentColor when defaultColor is provided', () => {
      core = new ewColorPicker({ 
        el: container, 
        defaultColor: '#00ff00' 
      });
      
      // 设置了 defaultColor 时，currentColor 应该等于 defaultColor
      expect(core.currentColor).toBe('#00ff00');
    });

    it('should use defaultColor in showPanel when currentColor is empty', () => {
      core = new ewColorPicker({ 
        el: container, 
        defaultColor: '#0000ff' 
      });
      
      // 清空 currentColor
      core.currentColor = '';
      
      // 调用 showPanel，应该使用 defaultColor
      core.showPanel();
      
      expect(core.currentColor).toBe('#0000ff');
    });

    it('should use fallback red color in showPanel when both currentColor and defaultColor are empty', () => {
      core = new ewColorPicker({ el: container });
      
      // 确保 currentColor 为空
      core.currentColor = '';
      
      // 调用 showPanel，应该使用默认红色
      core.showPanel();
      
      expect(core.currentColor).toBe('#ff0000');
    });
  });
}); 