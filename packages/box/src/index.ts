import ewColorPicker from "@ew-color-picker/core";
import {
  createByTemplate,
  extend,
  insertNode,
  removeElement,
  on,
  off,
  removeStyle,
  setStyle,
  addClass,
  removeClass,
  warn,
  create,
  $
} from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";
import { PartialBoxProps } from "./type";
import { getBoxChildren, processSizeConfig } from "./method";

export default class ewColorPickerBoxPlugin {
  static pluginName = "ewColorPickerBox";
  options: ewColorPickerBoxPluginOptions & Omit<ewColorPickerOptions, "el"> = {};
  box: HTMLElement | null;
  hasColor: boolean;
  _handlers: Array<() => void> = [];
  
  constructor(public ewColorPicker: ewColorPicker) {
    this.box = null;
    this.hasColor = false;
    this.handleOptions();
    this.run();
  }
  
  handleOptions() {
    this.options = extend(this.options, this.ewColorPicker.options);
  }
  
  run() {
    this.render();
  }
  
  updateChildren() {
    if (this.box) {
      const { defaultColor } = this.options;
      this.hasColor = !!defaultColor;
      this.box.replaceChildren(createByTemplate(getBoxChildren(this.hasColor, this.options)));
    }
  }
  
  destroy() {
    if (this.box) {
      this.unbindHandler();
      removeElement(this.box);
      this.box = null;
    }
  }
  
  update(keys: string[] = ["defaultColor", "size", "disabled", "readonly", "className", "style"]) {
    if (!this.box) {
      this.render();
    } else {
      if (keys.includes("defaultColor")) {
        const { defaultColor } = this.options;
        this.updateChildren();
        this.setBoxBgColor(defaultColor);
      }
      if (keys.includes("size")) {
        this.setBoxSize();
      }
      if (keys.includes("disabled") || keys.includes("readonly") || keys.includes("className") || keys.includes("style")) {
        this.setBoxState();
      }
    }
  }
  
  render() {
    const { defaultColor, className, style, showBox } = this.options;
    
    // 检查是否显示盒子
    if (showBox === false) {
      return;
    }
    
    // 直接使用主容器
    const rootElement = this.ewColorPicker.getMountPoint("root");
    if (!rootElement) {
      warn("[ewColorPicker] Root mount point not found");
      return;
    }
    
    // 查找或创建盒子容器
    this.box = $('.ew-color-picker-box', rootElement);
    if (!this.box) {
      this.box = create("div");
      addClass(this.box, "ew-color-picker-box");
      if (className) addClass(this.box, className);
      if (style) setStyle(this.box, style);
      insertNode(rootElement, this.box);
    }
    
    // 渲染内容
    this.updateChildren();
    this.setBoxSize();
    this.setBoxBgColor(defaultColor);
    this.setBoxState();
    this.bindHandler();
  }
  
  setBoxSize() {
    if (!this.box) return;
    
    const { size } = this.options;
    const sizeStyles = processSizeConfig(size);
    
    if (Object.keys(sizeStyles).length > 0) {
      setStyle(this.box, sizeStyles);
    } else {
      // 无尺寸配置，使用默认样式
      removeStyle(this.box, ["width", "height"]);
    }
  }
  
  setBoxBgColor(color?: string) {
    if (this.box) {
      if (color) {
        setStyle(this.box, {
          backgroundColor: color,
          transition: "background-color 0.3s"
        });
      } else {
        this.clearBoxBgColor();
      }
    }
  }
  
  clearBoxBgColor() {
    if (this.box) {
      removeStyle(this.box, ["background-color", "transition"]);
    }
  }
  
  setBoxState() {
    if (this.box) {
      const { disabled, readonly, className } = this.options;
      if (disabled) addClass(this.box, "is-disabled"); else removeClass(this.box, "is-disabled");
      if (readonly) addClass(this.box, "is-readonly"); else removeClass(this.box, "is-readonly");
      if (className) addClass(this.box, className);
    }
  }
  
  bindHandler() {
    if (!this.box) return;
    
    const { onClick, onMouseEnter, onMouseLeave, disabled, readonly, togglePickerAnimation, pickerAnimationTime } = this.options;
    
    // 绑定点击事件
    const clickHandler = (e: Event) => {
      if (disabled || readonly) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // 切换面板状态：如果面板隐藏则打开，如果面板显示则关闭
      if (this.ewColorPicker.pickerFlag) {
        this.ewColorPicker.hidePanel(togglePickerAnimation, pickerAnimationTime);
      } else {
        this.ewColorPicker.showPanel(togglePickerAnimation, pickerAnimationTime);
      }
      
      onClick?.(this);
    };
    on(this.box, "click", clickHandler);
    this._handlers.push(() => off(this.box!, "click", clickHandler));
    
    // 绑定鼠标事件
    this.bindMouseEvents(onMouseEnter, onMouseLeave);
  }
  
  bindMouseEvents(onMouseEnter?: (instance: ewColorPickerBoxPlugin) => void, onMouseLeave?: (instance: ewColorPickerBoxPlugin) => void) {
    if (!this.box) return;
    
    if (onMouseEnter) {
      const enterHandler = () => onMouseEnter(this);
      on(this.box, "mouseenter", enterHandler);
      this._handlers.push(() => off(this.box!, "mouseenter", enterHandler));
    }
    
    if (onMouseLeave) {
      const leaveHandler = () => onMouseLeave(this);
      on(this.box, "mouseleave", leaveHandler);
      this._handlers.push(() => off(this.box!, "mouseleave", leaveHandler));
    }
  }
  
  unbindHandler() {
    this._handlers.forEach((off) => off());
    this._handlers = [];
  }
}

export type ewColorPickerBoxPluginOptions = PartialBoxProps;

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerBoxPlugin: ewColorPickerBoxPluginOptions;
  }
}
