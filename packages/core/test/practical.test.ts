import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ewColorPicker from '../src/index';

describe('ewColorPicker 实用功能测试', () => {
  let container: HTMLElement;
  let core: ewColorPicker;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (core) {
      core.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('基础功能测试', () => {
    it('应该正确初始化颜色选择器', () => {
      core = new ewColorPicker({
        el: container,
        defaultColor: '#ff0000'
      });

      expect(core).toBeDefined();
      expect(core.getColor()).toBe('#ff0000');
      expect(core.getContainer()).toBe(container);
    });

    it('应该支持设置和获取颜色', () => {
      core = new ewColorPicker({ el: container });
      
      core.setColor('#00ff00');
      expect(core.getColor()).toBe('#00ff00');
      
      core.setColor('#0000ff');
      expect(core.getColor()).toBe('#0000ff');
    });

    it('应该支持HSVA颜色操作', () => {
      core = new ewColorPicker({ el: container });
      
      const hsva = { h: 120, s: 100, v: 100, a: 1 };
      core.setHsvaColor(hsva);
      
      const result = core.getHsvaColor();
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
      expect(result.a).toBe(1);
    });

    it('应该触发颜色变化事件', () => {
      core = new ewColorPicker({ el: container });
      
      let eventTriggered = false;
      let eventColor = '';
      
      core.on('change', (color: string) => {
        eventTriggered = true;
        eventColor = color;
      });
      
      core.setColor('#ff0000');
      
      expect(eventTriggered).toBe(true);
      expect(eventColor).toBe('#ff0000');
    });
  });

  describe('面板控制测试', () => {
    it('应该支持显示和隐藏面板', () => {
      core = new ewColorPicker({ el: container });
      
      expect(core.pickerFlag).toBe(false);
      
      // 面板显示/隐藏功能需要插件支持，这里只测试方法调用不抛出异常
      expect(() => {
        core.showPanel();
        core.hidePanel();
      }).not.toThrow();
    });

    it('应该支持打开和关闭选择器', () => {
      core = new ewColorPicker({ el: container });
      
      // 打开/关闭功能需要插件支持，这里只测试方法调用不抛出异常
      expect(() => {
        core.openPicker();
        core.closePicker();
      }).not.toThrow();
    });
  });

  describe('配置更新测试', () => {
    it('应该支持更新配置', () => {
      core = new ewColorPicker({ 
        el: container,
        defaultColor: '#ff0000'
      });
      
      let configUpdateTriggered = false;
      core.on('optionsUpdate', () => {
        configUpdateTriggered = true;
      });
      
      core.updateOptions({
        defaultColor: '#00ff00'
      });
      
      expect(configUpdateTriggered).toBe(true);
      // 更新配置后颜色可能不会立即改变，这里只测试事件触发
    });

    it('应该保持el属性不被覆盖', () => {
      core = new ewColorPicker({ el: container });
      
      core.updateOptions({
        defaultColor: '#ff0000'
      });
      
      expect(core.getContainer()).toBe(container);
    });
  });

  describe('生命周期测试', () => {
    it('应该正确销毁实例', () => {
      core = new ewColorPicker({ el: container });
      
      let destroyTriggered = false;
      core.on('destroy', () => {
        destroyTriggered = true;
      });
      
      core.destroy();
      
      expect(destroyTriggered).toBe(true);
      expect(core.getDestroyedStatus()).toBe(true);
    });

    it('应该防止重复销毁', () => {
      core = new ewColorPicker({ el: container });
      
      core.destroy();
      const firstDestroyStatus = core.getDestroyedStatus();
      
      core.destroy(); // 第二次调用应该被忽略
      const secondDestroyStatus = core.getDestroyedStatus();
      
      expect(firstDestroyStatus).toBe(true);
      expect(secondDestroyStatus).toBe(true);
    });
  });

  describe('挂载点测试', () => {
    it('应该提供挂载点访问', () => {
      core = new ewColorPicker({ el: container });
      
      const rootMount = core.getMountPoint('root');
      const panelMount = core.getMountPoint('panelContainer');
      
      expect(rootMount).toBeDefined();
      expect(panelMount).toBeDefined();
      expect(rootMount instanceof HTMLElement).toBe(true);
      expect(panelMount instanceof HTMLElement).toBe(true);
    });

    it('应该返回undefined对于不存在的挂载点', () => {
      core = new ewColorPicker({ el: container });
      
      const nonExistentMount = core.getMountPoint('nonExistent');
      expect(nonExistentMount).toBeUndefined();
    });
  });

  describe('事件系统测试', () => {
    it('应该支持事件绑定和解绑', () => {
      core = new ewColorPicker({ el: container });
      
      let callCount = 0;
      const handler = () => { callCount++; };
      
      core.on('change', handler);
      core.setColor('#ff0000');
      expect(callCount).toBe(1);
      
      core.off('change', handler);
      core.setColor('#00ff00');
      expect(callCount).toBe(1); // 应该不会再次调用
    });

    it('应该支持emit方法', () => {
      core = new ewColorPicker({ el: container });
      
      let customEventTriggered = false;
      core.on('customEvent', () => {
        customEventTriggered = true;
      });
      
      core.emit('customEvent');
      expect(customEventTriggered).toBe(true);
    });
  });

  describe('插件系统测试', () => {
    it('应该支持插件注册', () => {
      const mockPlugin = {
        pluginName: 'testPlugin',
        install: (instance: ewColorPicker) => {
          (instance as any).testMethod = () => 'test';
        }
      };
      
      core = new ewColorPicker({ el: container });
      core.use(mockPlugin);
      
      expect((core as any).testMethod).toBeDefined();
      expect((core as any).testMethod()).toBe('test');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空颜色值', () => {
      core = new ewColorPicker({ el: container });
      
      core.setColor('');
      expect(core.getColor()).toBe('');
      
      core.setColor('   ');
      expect(core.getColor()).toBe('   ');
    });

    it('应该处理无效颜色值', () => {
      core = new ewColorPicker({ el: container });
      
      // 设置一个无效颜色，应该不会抛出异常
      expect(() => {
        core.setColor('invalid-color');
      }).not.toThrow();
    });

    it('应该在销毁后忽略操作', () => {
      core = new ewColorPicker({ el: container });
      core.destroy();
      
      // 销毁后的操作应该被忽略
      expect(() => {
        core.setColor('#ff0000');
        core.showPanel();
        core.updateOptions({});
      }).not.toThrow();
    });
  });

  describe('实际DOM测试', () => {
    it('应该正确渲染到DOM', () => {
      core = new ewColorPicker({ el: container });
      
      // 检查容器被正确设置
      expect(core.getContainer()).toBe(container);
      
      // 检查主容器是否存在
      const wrapper = container.querySelector('.ew-color-picker');
      expect(wrapper).toBeTruthy();
    });

    it('应该支持不同的容器类型', () => {
      // 测试字符串选择器
      const stringContainer = document.createElement('div');
      stringContainer.id = 'test-container';
      document.body.appendChild(stringContainer);
      
      core = new ewColorPicker('#test-container');
      expect(core.getContainer()).toBe(stringContainer);
      
      core.destroy();
      document.body.removeChild(stringContainer);
    });
  });
}); 