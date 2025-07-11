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
  extend,
  warn,
  create,
  $,
  off,
  setAttr,
} from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface ButtonOptions {
  hasClear?: boolean;
  hasSure?: boolean;
  clearText?: string;
  sureText?: string;
  clear?: Function;
  sure?: Function;
}

export default class ewColorPickerButtonPlugin {
  static pluginName = "ewColorPickerButton";
  static applyOrder = ApplyOrder.Post;
  options: ButtonOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  clearButton: HTMLButtonElement | null = null;
  sureButton: HTMLButtonElement | null = null;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
  }

  // 更新配置并重新渲染
  updateOptions(): void {
    this.handleOptions();
    this.render();
  }

  run() {
    this.render();
    this.bindEvents();
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      warn('[ewColorPicker warning]: Panel container not found');
      return;
    }
    
    // 查找底部行容器
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (!bottomRow) {
      warn('[ewColorPicker warning]: Bottom row container not found');
      return;
    }
    
    // 查找或创建按钮容器
    let btnGroup = $('.ew-color-picker-drop-btn-group', bottomRow);
    if (!btnGroup) {
      btnGroup = create('div');
      addClass(btnGroup, 'ew-color-picker-drop-btn-group');
      // 直接插入到 bottomRow
      insertNode(bottomRow, btnGroup);
    }
    
    // 清空旧内容
    btnGroup.innerHTML = '';
    
    // 渲染清空按钮
    if (this.options.hasClear) {
      this.clearButton = create<HTMLButtonElement>('button');
      addClass(this.clearButton, 'ew-color-picker-clear-btn ew-color-picker-drop-btn');
      this.setClearText(this.options.clearText || '清空');
      btnGroup.appendChild(this.clearButton);
    }
    
    // 渲染确定按钮
    if (this.options.hasSure) {
      this.sureButton = create<HTMLButtonElement>('button');
      addClass(this.sureButton, 'ew-color-picker-sure-btn ew-color-picker-drop-btn');
      this.setSureText(this.options.sureText || '确定');
      btnGroup.appendChild(this.sureButton);
    }
  }

  bindEvents() {
    // 清空按钮事件
    if (this.clearButton) {
      on(this.clearButton, 'click', () => {
        this.onClearColor();
      });
    }

    // 确定按钮事件
    if (this.sureButton) {
      on(this.sureButton, 'click', () => {
        this.onSureColor();
      });
    }
  }

  onClearColor() {
    // 清空颜色
    this.ewColorPicker.hsvaColor = { h: 0, s: 100, v: 100, a: 1 };
    this.ewColorPicker.updateColor('');
    
    // 触发清空回调
    if (isFunction(this.options.clear)) {
      this.options.clear?.(this.ewColorPicker);
    }
    
    // 触发事件
    this.ewColorPicker.trigger('clear');
  }

  onSureColor() {
    // 触发确定回调
    if (isFunction(this.options.sure)) {
      this.options.sure?.(this.ewColorPicker.currentColor, this.ewColorPicker);
    }
    
    // 触发事件
    this.ewColorPicker.trigger('sure', this.ewColorPicker.currentColor, this.ewColorPicker);
    
    // 隐藏面板
    this.ewColorPicker.hidePanel();
  }

  setClearText(text: string) {
    if (this.clearButton) {
      this.clearButton.textContent = text;
    }
  }

  setSureText(text: string) {
    if (this.sureButton) {
      this.sureButton.textContent = text;
    }
  }

  setDisabled(disabled: boolean) {
    if (this.clearButton) {
      setAttr(this.clearButton, { disabled: disabled.toString() });
    }
    if (this.sureButton) {
      setAttr(this.sureButton, { disabled: disabled.toString() });
    }
  }

  destroy() {
    if (this.clearButton) {
      off(this.clearButton, 'click', this.onClearColor.bind(this) as EventListener);
    }
    if (this.sureButton) {
      off(this.sureButton, 'click', this.onSureColor.bind(this) as EventListener);
    }
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerButton: ButtonOptions;
  }
} 