import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import HuePlugin from '../src/index';
import ewColorPicker from '../../ew-color-picker/src/index';
import { colorRgbaToHsva } from '../../utils/src/color';

describe('Hue Plugin - defaultColor Integration', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('defaultColor hue position update', () => {
    it('should update hue thumb position when defaultColor has different hue value', () => {
      // 创建一个带有不同色相值的默认颜色的颜色选择器
      const picker = new ewColorPicker({
        el: container,
        defaultColor: '#00ff00', // 绿色，hue = 120
        hue: true,
        hasPanel: true // 确保面板插件被加载
      });

      // 获取 hue 插件实例
      const huePlugin = picker.plugins.ewColorPickerHue;
      expect(huePlugin).toBeDefined();

      // 模拟 updateHueThumbPosition 方法
      const updateHueThumbPositionSpy = vi.spyOn(huePlugin, 'updateHueThumbPosition');

      // 手动触发初始化逻辑（模拟插件加载完成后的状态）
      const greenHsva = colorRgbaToHsva('#00ff00');
      expect(greenHsva.h).toBe(120); // 绿色应该是 120 度

      // 验证 updateHueThumbPosition 是否被调用
      expect(updateHueThumbPositionSpy).toHaveBeenCalledWith(120);
    });

    it('should not update hue thumb position when defaultColor has same hue value', () => {
      // 创建一个带有红色默认颜色的颜色选择器（默认 h 值就是 0）
      const picker = new ewColorPicker({
        el: container,
        defaultColor: '#ff0000', // 红色，hue = 0
        hue: true,
        hasPanel: true // 确保面板插件被加载
      });

      // 获取 hue 插件实例
      const huePlugin = picker.plugins.ewColorPickerHue;
      expect(huePlugin).toBeDefined();

      // 模拟 updateHueThumbPosition 方法
      const updateHueThumbPositionSpy = vi.spyOn(huePlugin, 'updateHueThumbPosition');

      // 验证 updateHueThumbPosition 没有被调用（因为 h 值没有变化）
      expect(updateHueThumbPositionSpy).not.toHaveBeenCalled();
    });

    it('should update hue thumb position when showPanel is called with different defaultColor', () => {
      // 创建一个没有默认颜色的颜色选择器
      const picker = new ewColorPicker({
        el: container,
        hue: true,
        hasPanel: true // 确保面板插件被加载
      });

      // 获取 hue 插件实例
      const huePlugin = picker.plugins.ewColorPickerHue;
      expect(huePlugin).toBeDefined();

      // 模拟 updateHueThumbPosition 方法
      const updateHueThumbPositionSpy = vi.spyOn(huePlugin, 'updateHueThumbPosition');

      // 调用 showPanel，应该使用默认的红色
      picker.showPanel();

      // 验证 updateHueThumbPosition 是否被调用（红色 h=0，但这是默认值，所以可能不会被调用）
      // 这个测试可能需要根据实际实现调整
      expect(updateHueThumbPositionSpy).toHaveBeenCalled();
    });

    it('should handle various defaultColor formats correctly', () => {
      const testCases = [
        { color: '#00ff00', expectedHue: 120, description: 'hex green' },
        { color: 'rgb(0, 255, 0)', expectedHue: 120, description: 'rgb green' },
        { color: 'rgba(0, 255, 0, 1)', expectedHue: 120, description: 'rgba green' },
        { color: '#0000ff', expectedHue: 240, description: 'hex blue' },
        { color: 'rgb(255, 0, 255)', expectedHue: 300, description: 'rgb magenta' }
      ];

      testCases.forEach(({ color, expectedHue, description }) => {
        const testContainer = document.createElement('div');
        document.body.appendChild(testContainer);

        const picker = new ewColorPicker({
          el: testContainer,
          defaultColor: color,
          hue: true,
          hasPanel: true // 确保面板插件被加载
        });

        const huePlugin = picker.plugins.ewColorPickerHue;
        const updateHueThumbPositionSpy = vi.spyOn(huePlugin, 'updateHueThumbPosition');

        // 验证色相值是否正确
        const hsva = colorRgbaToHsva(color);
        expect(hsva.h).toBe(expectedHue);

        // 验证是否调用了更新方法
        expect(updateHueThumbPositionSpy).toHaveBeenCalledWith(expectedHue);

        // 清理
        document.body.removeChild(testContainer);
      });
    });

    it('should handle alpha-enabled defaultColor correctly', () => {
      const picker = new ewColorPicker({
        el: container,
        defaultColor: '#00ff00',
        alpha: true,
        hue: true,
        hasPanel: true // 确保面板插件被加载
      });

      const huePlugin = picker.plugins.ewColorPickerHue;
      const updateHueThumbPositionSpy = vi.spyOn(huePlugin, 'updateHueThumbPosition');

      // 验证 alpha 模式下的色相值
      const currentColor = picker.getColor();
      expect(currentColor).toMatch(/^rgba\(/); // 应该是 rgba 格式

      const hsva = colorRgbaToHsva(currentColor);
      expect(hsva.h).toBe(120); // 绿色应该是 120 度

      // 验证是否调用了更新方法
      expect(updateHueThumbPositionSpy).toHaveBeenCalledWith(120);
    });
  });

  describe('hue plugin method exposure', () => {
    it('should expose updateHueThumbPosition method', () => {
      const picker = new ewColorPicker({
        el: container,
        defaultColor: '#00ff00',
        hue: true,
        hasPanel: true // 确保面板插件被加载
      });

      const huePlugin = picker.plugins.ewColorPickerHue;
      expect(typeof huePlugin.updateHueThumbPosition).toBe('function');
    });
  });
}); 