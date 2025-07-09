import ewColorPicker from "@ew-color-picker/core";
import {
  getELByClass,
  on,
  isFunction,
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
  options: ButtonOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  clearButton: HTMLElement | null = null;
  sureButton: HTMLElement | null = null;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = Object.assign({}, this.options, this.ewColorPicker.options);
  }

  run() {
    this.render();
    this.bindEvents();
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      console.warn('[ewColorPicker] Panel container not found');
      return;
    }
    // 查找或创建底部一行容器
    let bottomRow = panelContainer.querySelector('.ew-color-picker-bottom-row') as HTMLElement;
    if (!bottomRow) {
      bottomRow = document.createElement('div');
      bottomRow.className = 'ew-color-picker-bottom-row';
      panelContainer.appendChild(bottomRow);
    }
    // 查找或创建按钮容器
    let btnGroup = bottomRow.querySelector('.ew-color-drop-btn-group') as HTMLElement;
    if (!btnGroup) {
      btnGroup = document.createElement('div');
      btnGroup.className = 'ew-color-drop-btn-group';
      // 直接插入到 bottomRow
      bottomRow.appendChild(btnGroup);
    }
    // 清空旧内容
    btnGroup.innerHTML = '';
    // 渲染清空按钮
    if (this.options.hasClear) {
      this.clearButton = document.createElement('button');
      this.clearButton.className = 'ew-color-clear ew-color-drop-btn';
      this.clearButton.textContent = this.options.clearText || '清空';
      btnGroup.appendChild(this.clearButton);
    }
    // 渲染确定按钮
    if (this.options.hasSure) {
      this.sureButton = document.createElement('button');
      this.sureButton.className = 'ew-color-sure ew-color-drop-btn';
      this.sureButton.textContent = this.options.sureText || '确定';
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
      this.options.clear?.();
    }
    
    // 触发事件
    this.ewColorPicker.trigger('clear');
  }

  onSureColor() {
    // 触发确定回调
    if (isFunction(this.options.sure)) {
      this.options.sure?.(this.ewColorPicker.currentColor);
    }
    
    // 触发事件
    this.ewColorPicker.trigger('sure', this.ewColorPicker.currentColor);
    
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
      this.clearButton.setAttribute('disabled', disabled.toString());
    }
    if (this.sureButton) {
      this.sureButton.setAttribute('disabled', disabled.toString());
    }
  }

  destroy() {
    if (this.clearButton) {
      this.clearButton.removeEventListener('click', this.onClearColor.bind(this) as EventListener);
    }
    if (this.sureButton) {
      this.sureButton.removeEventListener('click', this.onSureColor.bind(this) as EventListener);
    }
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerButton: ButtonOptions;
  }
} 