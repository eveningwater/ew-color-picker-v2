import ewColorPicker from "@ew-color-picker/core";
import {
  on,
  addClass,
  removeClass,
  isFunction,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorToRgba, isValidColor, isAlphaColor } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface PredefineColor {
  color: string;
  disabled?: boolean;
}

export interface PredefineOptions {
  predefineColor?: string[] | PredefineColor[];
  changeColor?: Function;
}

export default class ewColorPickerPredefinePlugin {
  static pluginName = "ewColorPickerPredefine";
  options: PredefineOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  predefineItems: HTMLElement[] = [];
  container: HTMLElement | null = null;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = Object.assign({}, this.options, this.ewColorPicker.options);
  }

  run() {
    if (this.options.predefineColor && this.options.predefineColor.length > 0) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      console.warn('[ewColorPicker] Panel container not found');
      return;
    }
    
    // 查找或创建预定义色块容器
    this.container = panelContainer.querySelector('.ew-pre-define-color-container') as HTMLElement;
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'ew-pre-define-color-container';
      // 直接插入到面板容器底部
      panelContainer.appendChild(this.container);
    }
    
    // 清空旧内容
    if (this.container) {
      this.container.innerHTML = '';
      this.predefineItems = [];
      
      // 渲染预定义色块
      (this.options.predefineColor || []).forEach((colorData, index) => {
        const color = typeof colorData === 'string' ? colorData : colorData.color;
        const disabled = typeof colorData === 'object' ? colorData.disabled : false;
        const item = document.createElement('div');
        item.className = 'ew-pre-define-color' + (disabled ? ' ew-pre-define-color-disabled' : '') + (isAlphaColor(color) ? ' ew-has-alpha' : '');
        item.tabIndex = index;
        const colorItem = document.createElement('div');
        colorItem.className = 'ew-pre-define-color-item';
        colorItem.style.backgroundColor = color;
        item.appendChild(colorItem);
        this.container!.appendChild(item);
        this.predefineItems.push(item);
      });
    }
  }

  bindEvents() {
    this.predefineItems.forEach((item, index) => {
      const colorData = this.options.predefineColor![index];
      const color = typeof colorData === 'string' ? colorData : (colorData as PredefineColor).color;
      const disabled = typeof colorData === 'object' ? (colorData as PredefineColor).disabled : false;

      if (disabled) {
        addClass(item, 'ew-pre-define-color-disabled');
        return;
      }

      // 点击事件
      on(item, 'click', (event: Event) => {
        this.onPredefineColorClick(event, color);
      });

      // 失焦事件
      on(item, 'blur', (event: Event) => {
        removeClass(event.target as HTMLElement, 'ew-pre-define-color-active');
      });
    });
  }

  onPredefineColorClick(event: Event, color: string) {
    const target = event.target as HTMLElement;
    
    // 添加激活状态
    addClass(target, 'ew-pre-define-color-active');
    
    // 移除其他项的激活状态
    this.predefineItems.forEach(item => {
      if (item !== target) {
        removeClass(item, 'ew-pre-define-color-active');
      }
    });

    // 验证颜色格式
    if (!isValidColor(color)) {
      console.warn(`[ewColorPicker warning]: Invalid predefine color: ${color}`);
      return;
    }

    // 转换颜色格式
    const rgbaColor = colorToRgba(color);
    
    // 更新HSV颜色
    this.ewColorPicker.hsvaColor = colorRgbaToHsva(rgbaColor);
    
    // 更新当前颜色
    this.ewColorPicker.updateColor(rgbaColor);
    
    // 触发颜色改变回调
    if (isFunction(this.options.changeColor)) {
      this.options.changeColor?.(rgbaColor);
    }
  }

  updatePredefineColors(colors: string[] | PredefineColor[]) {
    this.options.predefineColor = colors as any;
    
    // 重新渲染
    this.predefineItems = [];
    this.render();
    this.bindEvents();
  }

  setDisabled(index: number, disabled: boolean) {
    if (this.predefineItems[index]) {
      if (disabled) {
        addClass(this.predefineItems[index], 'ew-pre-define-color-disabled');
      } else {
        removeClass(this.predefineItems[index], 'ew-pre-define-color-disabled');
      }
    }
  }

  destroy() {
    this.predefineItems.forEach(item => {
      item.removeEventListener('click', this.onPredefineColorClick.bind(this) as unknown as EventListener);
      item.removeEventListener('blur', () => {});
    });
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerPredefine: PredefineOptions;
  }
} 