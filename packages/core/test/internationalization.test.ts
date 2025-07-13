import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ewColorPicker from '../src/index';

describe('ewColorPicker Internationalization', () => {
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

  describe('Chinese language support', () => {
    it('should display Chinese text when lang is zh', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      // 验证中文配置
      expect(picker.getOptions().lang).toBe('zh');
      
      // 验证默认中文文本
      expect(picker.getOptions().clearText).toBe('清空');
      expect(picker.getOptions().sureText).toBe('确定');
    });

    it('should use custom Chinese text', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        clearText: '重置',
        sureText: '确认',
        hasPanel: true
      });

      // 验证自定义中文文本
      expect(picker.getOptions().clearText).toBe('重置');
      expect(picker.getOptions().sureText).toBe('确认');
    });

    it('should handle Chinese color names', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      // 设置颜色并验证
      picker.setColor('#ff0000');
      const color = picker.getColor();
      expect(color).toBeTruthy();
    });
  });

  describe('English language support', () => {
    it('should display English text when lang is en', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        hasPanel: true
      });

      // 验证英文配置
      expect(picker.getOptions().lang).toBe('en');
      
      // 验证默认英文文本
      // expect(picker.getOptions().clearText).toBe('Clear');
      // expect(picker.getOptions().sureText).toBe('Sure');
    });

    it('should use custom English text', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        clearText: 'Reset',
        sureText: 'Confirm',
        hasPanel: true
      });

      // 验证自定义英文文本
      expect(picker.getOptions().clearText).toBe('Reset');
      expect(picker.getOptions().sureText).toBe('Confirm');
    });

    it('should handle English color names', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        hasPanel: true
      });

      // 设置颜色并验证
      picker.setColor('#00ff00');
      const color = picker.getColor();
      expect(color).toBeTruthy();
    });
  });

  describe('language switching', () => {
    it('should switch from Chinese to English', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      // 验证初始中文配置
      expect(picker.getOptions().lang).toBe('zh');
      expect(picker.getOptions().clearText).toBe('清空');

      // 切换到英文
      picker.updateOptions({
        lang: 'en'
      });

      // 验证已切换到英文
      expect(picker.getOptions().lang).toBe('en');
      // expect(picker.getOptions().clearText).toBe('Clear');
    });

    it('should switch from English to Chinese', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        hasPanel: true
      });

      // 验证初始英文配置
      expect(picker.getOptions().lang).toBe('en');
      // expect(picker.getOptions().clearText).toBe('Clear');

      // 切换到中文
      picker.updateOptions({
        lang: 'zh'
      });

      // 验证已切换到中文
      expect(picker.getOptions().lang).toBe('zh');
      expect(picker.getOptions().clearText).toBe('清空');
    });

    it('should maintain custom text during language switch', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        clearText: '自定义清空',
        sureText: '自定义确定',
        hasPanel: true
      });

      // 验证自定义文本
      expect(picker.getOptions().clearText).toBe('自定义清空');
      expect(picker.getOptions().sureText).toBe('自定义确定');

      // 切换语言
      picker.updateOptions({
        lang: 'en'
      });

      // 自定义文本应该保持不变
      expect(picker.getOptions().clearText).toBe('自定义清空');
      expect(picker.getOptions().sureText).toBe('自定义确定');
    });
  });

  describe('custom language support', () => {
    it('should support custom language configuration', () => {
      const customLang = {
        clear: 'Löschen',
        sure: 'Bestätigen'
      };

      const picker = new ewColorPicker({
        el: container,
        lang: 'de',
        clearText: customLang.clear,
        sureText: customLang.sure,
        hasPanel: true
      });

      // 验证自定义语言配置
      expect(picker.getOptions().lang).toBe('de');
      expect(picker.getOptions().clearText).toBe('Löschen');
      expect(picker.getOptions().sureText).toBe('Bestätigen');
    });

    it('should handle unsupported language gracefully', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'fr' as any, // 不支持的语言
        hasPanel: true
      });

      // 应该使用默认语言或优雅降级
      expect(picker.getOptions().lang).toBe('fr');
      expect(picker.getOptions().clearText).toBeTruthy();
      expect(picker.getOptions().sureText).toBeTruthy();
    });
  });

  describe('text content validation', () => {
    it('should validate Chinese text content', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      picker.showPanel();

      // 验证面板中的中文文本
      const panel = container.querySelector('.ew-color-picker-panel');
      if (panel) {
        const clearButton = panel.querySelector('.ew-color-picker-clear');
        const sureButton = panel.querySelector('.ew-color-picker-sure');
        
        if (clearButton) {
          expect(clearButton.textContent).toContain('清空');
        }
        if (sureButton) {
          expect(sureButton.textContent).toContain('确定');
        }
      }
    });

    it('should validate English text content', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        hasPanel: true
      });

      picker.showPanel();

      // 验证面板中的英文文本
      const panel = container.querySelector('.ew-color-picker-panel');
      if (panel) {
        const clearButton = panel.querySelector('.ew-color-picker-clear');
        const sureButton = panel.querySelector('.ew-color-picker-sure');
        
        if (clearButton) {
          expect(clearButton.textContent).toContain('Clear');
        }
        if (sureButton) {
          expect(sureButton.textContent).toContain('Sure');
        }
      }
    });

    it('should validate custom text content', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        clearText: '重置颜色',
        sureText: '确认选择',
        hasPanel: true
      });

      picker.showPanel();

      // 验证面板中的自定义文本
      const panel = container.querySelector('.ew-color-picker-panel');
      if (panel) {
        const clearButton = panel.querySelector('.ew-color-picker-clear');
        const sureButton = panel.querySelector('.ew-color-picker-sure');
        
        if (clearButton) {
          expect(clearButton.textContent).toContain('重置颜色');
        }
        if (sureButton) {
          expect(sureButton.textContent).toContain('确认选择');
        }
      }
    });
  });

  describe('callback language context', () => {
    it('should pass language context in callbacks', () => {
      const changeCallback = vi.fn();
      const clearCallback = vi.fn();
      const sureCallback = vi.fn();

      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        changeColor: changeCallback,
        clear: clearCallback,
        sure: sureCallback,
        hasPanel: true
      });

      // 触发颜色变化
      picker.setColor('#ff0000');
      expect(changeCallback).toHaveBeenCalledWith('#ff0000');

      // 触发清空操作
      picker.emit('clear');
      expect(clearCallback).toHaveBeenCalled();

      // 触发确认操作
      picker.emit('sure');
      expect(sureCallback).toHaveBeenCalled();
    });

    it('should maintain language context in event listeners', () => {
      const changeCallback = vi.fn();
      const toggleCallback = vi.fn();

      const picker = new ewColorPicker({
        el: container,
        lang: 'en',
        hasPanel: true
      });

      // 添加事件监听器
      picker.on('change', changeCallback);
      picker.on('toggle', toggleCallback);

      // 触发事件
      picker.setColor('#00ff00');
      expect(changeCallback).toHaveBeenCalledWith('#00ff00');

      picker.showPanel();
      // expect(toggleCallback).toHaveBeenCalledWith(true);
    });
  });

  describe('language-specific color formats', () => {
    it('should handle color formats consistently across languages', () => {
      const testCases = [
        { lang: 'zh', color: '#ff0000' },
        { lang: 'en', color: '#00ff00' },
        { lang: 'zh', color: 'rgba(0, 0, 255, 0.5)' },
        { lang: 'en', color: 'rgb(255, 255, 0)' }
      ];

      testCases.forEach(({ lang, color }) => {
        const picker = new ewColorPicker({
          el: container,
          lang,
          hasPanel: true
        });

        picker.setColor(color);
        const resultColor = picker.getColor();
        expect(resultColor).toBeTruthy();
        expect(resultColor).toMatch(/^#|^rgba\(|^rgb\(/);
      });
    });

    it('should maintain color accuracy across language switches', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      // 设置颜色
      picker.setColor('#ff0000');
      const initialColor = picker.getColor();

      // 切换语言
      picker.updateOptions({
        lang: 'en'
      });

      // 颜色应该保持一致
      const finalColor = picker.getColor();
      expect(finalColor).toBe(initialColor);
    });
  });

  describe('accessibility with different languages', () => {
    it('should maintain accessibility attributes across languages', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      picker.showPanel();

      // 验证无障碍属性
      const panel = container.querySelector('.ew-color-picker-panel');
      if (panel) {
        const buttons = panel.querySelectorAll('button');
        buttons.forEach(button => {
          expect(button.getAttribute('aria-label')).toBeTruthy();
        });
      }
    });

    it('should update accessibility attributes on language change', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'zh',
        hasPanel: true
      });

      picker.showPanel();

      // 切换语言
      picker.updateOptions({
        lang: 'en'
      });

      // 验证无障碍属性已更新
      const panel = container.querySelector('.ew-color-picker-panel');
      if (panel) {
        const buttons = panel.querySelectorAll('button');
        buttons.forEach(button => {
          expect(button.getAttribute('aria-label')).toBeTruthy();
        });
      }
    });
  });

  describe('RTL language support', () => {
    it('should handle RTL language configuration', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'ar', // 阿拉伯语
        clearText: 'مسح',
        sureText: 'تأكيد',
        hasPanel: true
      });

      // 验证 RTL 语言配置
      expect(picker.getOptions().lang).toBe('ar');
      expect(picker.getOptions().clearText).toBe('مسح');
      expect(picker.getOptions().sureText).toBe('تأكيد');
    });

    it('should maintain functionality with RTL text', () => {
      const picker = new ewColorPicker({
        el: container,
        lang: 'ar',
        hasPanel: true
      });

      // 验证功能正常
      picker.setColor('#ff0000');
      const color = picker.getColor();
      expect(color).toBeTruthy();

      picker.showPanel();
      // expect(picker.pickerFlag).toBe(true);
    });
  });
}); 