import ewColorPicker from "@ew-color-picker/core";
import {
  getELByClass,
  on,
  setCss,
  addClass,
  removeClass,
  hasClass,
  isFunction,
  insertNode,
  ApplyOrder,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorToRgba, isValidColor } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface InputOptions {
  hasInput?: boolean;
  disabled?: boolean;
  changeColor?: Function;
}

export default class ewColorPickerInputPlugin {
  static pluginName = "ewColorPickerInput";
  static applyOrder = ApplyOrder.Post;
  options: InputOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  input: HTMLInputElement | null = null;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = Object.assign({}, this.options, this.ewColorPicker.options);
  }

  run() {
    // options 已经通过 mergeOptions 完成了合并，直接使用即可
    if (this.options.hasInput) {
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
    
    // 查找底部行容器
    const bottomRow = panelContainer.querySelector('.ew-color-picker-bottom-row') as HTMLElement;
    if (!bottomRow) {
      console.warn('[ewColorPicker] Bottom row container not found');
      return;
    }
    
    // 查找已存在的 input 元素，避免重复插入
    this.input = bottomRow.querySelector('input.ew-color-input') as HTMLInputElement;
    if (!this.input) {
      this.input = document.createElement('input');
      this.input.className = 'ew-color-input';
      this.input.type = 'text';
      this.input.placeholder = '请输入颜色值';
      // 直接插入到 bottomRow
      insertNode(bottomRow, this.input);
    }
    
    // 设置当前值
    let currentColor = this.ewColorPicker.getColor();
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const defaultColor = hasAlpha ? 'rgba(255,0,0,1)' : '#ff0000';
    if (!currentColor || currentColor.indexOf('NaN') !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    this.input.value = currentColor;
    
    // 如果禁用，添加禁用样式
    if (this.options.disabled) {
      this.setDisabled(true);
    }
  }

  bindEvents() {
    if (!this.input) return;

    // 失焦事件
    on(this.input, 'blur', (event: Event) => {
      this.onInputColor((event.target as HTMLInputElement).value);
    });

    // 回车事件
    on(this.input, 'keydown', (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        this.onInputColor((keyboardEvent.target as HTMLInputElement).value);
      }
    });

    // 监听颜色变化事件，自动更新输入框
    this.ewColorPicker.on('change', (color: string) => {
      this.update(color);
    });
  }

  onInputColor(value: string) {
    if (!value.trim()) return;

    // 验证颜色格式
    if (!isValidColor(value)) {
      console.warn(`[ewColorPicker warning]: Invalid color format: ${value}`);
      return;
    }

    // 转换颜色格式
    const rgbaColor = colorToRgba(value);
    
    // 更新HSV颜色
    this.ewColorPicker.hsvaColor = colorRgbaToHsva(rgbaColor);
    
    // 更新当前颜色
    this.ewColorPicker.updateColor(rgbaColor);
    
    // 触发颜色改变回调
    if (isFunction(this.options.changeColor)) {
      this.options.changeColor?.(rgbaColor);
    }
  }

  setValue(value: string) {
    if (this.input) {
      this.input.value = value;
    }
  }

  getValue(): string {
    return this.input ? this.input.value : '';
  }

  setDisabled(disabled: boolean) {
    if (!this.input) return;

    if (disabled) {
      this.input.disabled = true;
      if (!hasClass(this.input, 'ew-input-disabled')) {
        addClass(this.input, 'ew-input-disabled');
      }
    } else {
      this.input.disabled = false;
      if (hasClass(this.input, 'ew-input-disabled')) {
        removeClass(this.input, 'ew-input-disabled');
      }
    }
  }

  update(color: string) {
    this.setValue(color);
  }

  destroy() {
    if (this.input) {
      this.input.removeEventListener('blur', this.onInputColor.bind(this) as unknown as EventListener);
      this.input.removeEventListener('keydown', this.onInputColor.bind(this) as unknown as EventListener);
    }
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerInput: InputOptions;
  }
} 