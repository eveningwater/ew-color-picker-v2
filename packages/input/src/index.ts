import ewColorPicker from "@ew-color-picker/core";
import {
  on,
  setStyle,
  addClass,
  removeClass,
  hasClass,
  isFunction,
  insertNode,
  ApplyOrder,
  $,
  create,
  setAttr,
  warn,
  debounce,
  extend,
  off,
  removeElement,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorToRgba, isValidColor, colorHsvaToRgba, colorRgbaToHex } from "@ew-color-picker/utils";
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
  
  // 防抖处理输入事件
  private debouncedOnInputColor: (value: string) => void;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    // 初始化防抖函数
    this.debouncedOnInputColor = debounce(this.onInputColor.bind(this), 300);
    this.run();
  }

  handleOptions() {
    if (this.ewColorPicker && this.ewColorPicker.options) {
      this.options = extend(this.options, this.ewColorPicker.options);
    }
  }

  // 更新配置并重新渲染
  updateOptions(): void {
    this.handleOptions();
    if (this.options.hasInput) {
      this.render();
    } else {
      // 如果禁用了输入框，移除DOM
      if (this.input && this.input.parentNode) {
        removeElement(this.input);
        this.input = null;
      }
    }
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
      warn('[ewColorPicker] Panel container not found');
      return;
    }
    
    // 查找底部行容器
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (!bottomRow) {
      warn('[ewColorPicker] Bottom row container not found');
      return;
    }
    
    // 查找按钮组容器（清空和确认按钮的父元素）
    let btnGroup = $('.ew-color-picker-drop-btn-group', bottomRow);
    
    // 查找或创建 input 容器
    let inputContainer = $('.ew-color-picker-input-container', bottomRow);
    if (!inputContainer) {
      inputContainer = create('div');
      addClass(inputContainer, 'ew-color-picker-input-container');
      addClass(inputContainer, 'ew-color-picker-input-container-flex');
      
      // 如果存在按钮组，插入到按钮组之前
      if (btnGroup && btnGroup.parentNode) {
        btnGroup.parentNode.insertBefore(inputContainer, btnGroup);
      } else {
        // 如果没有按钮组，直接插入到 bottomRow
        insertNode(bottomRow, inputContainer);
      }
    }
    
    // 查找已存在的 input 元素，避免重复插入
    this.input = $('input.ew-color-picker-input', inputContainer) as HTMLInputElement;
    if (!this.input) {
      this.input = create<HTMLInputElement>('input');
      if (this.input) {
        addClass(this.input, 'ew-color-picker-input');
        setAttr(this.input, {
          type: 'text',
          name: 'ew-color-picker-input',
          placeholder: '请输入颜色值'
        });
        
        // 组装DOM结构
        insertNode(inputContainer, this.input);
      }
    }
    
    // 设置当前值
    let currentColor = this.ewColorPicker.getColor();
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const openChangeColorMode = !!this.ewColorPicker.options.openChangeColorMode;
    
    // 根据配置确定默认颜色格式
    let defaultColor: string;
    if (hasAlpha) {
      defaultColor = 'rgba(255,0,0,1)';
    } else if (openChangeColorMode) {
      // 如果开启了颜色模式切换，根据当前模式设置格式
      const currentMode = this.ewColorPicker.currentMode || 'HSV';
      if (currentMode === 'HSL') {
        defaultColor = 'hsl(0, 100%, 50%)';
      } else {
        defaultColor = '#ff0000';
      }
    } else {
      defaultColor = '#ff0000';
    }
    
    // 检查当前颜色是否有效
    if (!currentColor || currentColor.indexOf('NaN') !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    
    // 根据配置格式化颜色显示
    let displayColor = currentColor;
    if (hasAlpha && !displayColor.startsWith('rgba')) {
      // 如果开启了 alpha 但颜色不是 rgba 格式，转换为 rgba
      const hsva = colorRgbaToHsva(displayColor);
      displayColor = colorHsvaToRgba(hsva);
    } else if (!hasAlpha && displayColor.startsWith('rgba')) {
      // 如果没有开启 alpha 但颜色是 rgba 格式，转换为 hex
      displayColor = colorRgbaToHex(displayColor);
    }
    
    if (this.input) {
      this.input.value = displayColor;
    }
    
    // 如果禁用，添加禁用样式
    if (this.options.disabled) {
      this.setDisabled(true);
    }
  }

  bindEvents() {
    if (!this.input) return;

    // 失焦事件
    on(this.input, 'blur', (event: Event) => {
      this.debouncedOnInputColor((event.target as HTMLInputElement).value);
    });

    // 回车事件
    on(this.input, 'keydown', (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        this.debouncedOnInputColor((keyboardEvent.target as HTMLInputElement).value);
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
      warn(`[ewColorPicker warning]: Invalid color format: ${value}`);
      return;
    }

    // 转换颜色格式
    const rgbaColor = colorToRgba(value);
    
    // 更新HSV颜色
    this.ewColorPicker.hsvaColor = colorRgbaToHsva(rgbaColor);
    
    // 更新当前颜色并触发事件
    this.ewColorPicker.setColor(rgbaColor);
    
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
    // 根据配置格式化颜色显示
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const openChangeColorMode = !!this.ewColorPicker.options.openChangeColorMode;
    
    let displayColor = color;
    
    // 检查颜色是否有效
    if (!color || color.indexOf('NaN') !== -1) {
      // 如果颜色无效，使用默认颜色
      if (hasAlpha) {
        displayColor = 'rgba(255,0,0,1)';
      } else if (openChangeColorMode) {
        const currentMode = this.ewColorPicker.currentMode || 'HSV';
        if (currentMode === 'HSL') {
          displayColor = 'hsl(0, 100%, 50%)';
        } else {
          displayColor = '#ff0000';
        }
      } else {
        displayColor = '#ff0000';
      }
    } else {
      // 根据配置格式化颜色显示
      if (hasAlpha && !color.startsWith('rgba')) {
        // 如果开启了 alpha 但颜色不是 rgba 格式，转换为 rgba
        const hsva = colorRgbaToHsva(color);
        displayColor = colorHsvaToRgba(hsva);
      } else if (!hasAlpha && color.startsWith('rgba')) {
        // 如果没有开启 alpha 但颜色是 rgba 格式，转换为 hex
        displayColor = colorRgbaToHex(color);
      }
    }
    
    this.setValue(displayColor);
  }

  destroy() {
    if (this.input) {
      off(this.input, 'blur', this.debouncedOnInputColor as unknown as EventListener);
      off(this.input, 'keydown', this.debouncedOnInputColor as unknown as EventListener);
    }
    
    // 清理DOM引用
    this.input = null;
  }

  // 新增 install 方法，便于测试
  install(core: any) {
    this.ewColorPicker = core;
    this.handleOptions();
    
    // 注册事件监听器
    if (core.on && typeof core.on === 'function') {
      core.on('change', (color: string) => {
        // 当颜色改变时，更新输入框
        this.update(color);
      });
    }
    
    this.run?.();
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerInput: InputOptions;
  }
} 