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
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorToRgba, isValidColor } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";
import { upArrowIcon, downArrowIcon } from "@ew-color-picker/icon";
import InputNumber from "@ew-color-picker/input-number";

// 颜色模式类型 - 只支持三种模式
export type ColorMode = 'hex' | 'rgb' | 'hsl';

export interface ColorModeOptions {
  openChangeColorMode?: boolean;
  defaultMode?: ColorMode;
  changeMode?: Function;
  alpha?: boolean; // 是否支持 alpha 通道
}

export default class ewColorPickerColorModePlugin {
  static pluginName = "ewColorPickerColorMode";
  static applyOrder = ApplyOrder.Post;
  options: ColorModeOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  
  // 当前颜色模式
  currentMode: ColorMode = 'hex';
  
  // 颜色模式切换容器
  modeContainer: HTMLElement | null = null;
  
  // 模式显示文本
  modeText: HTMLElement | null = null;
  
  // 上箭头按钮
  upButton: HTMLButtonElement | null = null;
  
  // 下箭头按钮
  downButton: HTMLButtonElement | null = null;
  
  // 防抖处理模式切换事件
  private debouncedOnModeChange: (mode: ColorMode) => void;

  constructor(public ewColorPicker: ewColorPicker) {
    console.log('colorMode plugin loaded', this);
    this.handleOptions();
    // 初始化防抖函数
    this.debouncedOnModeChange = debounce(this.onModeChange.bind(this), 100);
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
    this.currentMode = this.options.defaultMode || 'hex';
  }

  // 更新配置并重新渲染
  updateOptions(): void {
    this.handleOptions();
    if (this.options.openChangeColorMode) {
      this.render();
    } else {
      // 如果禁用了颜色模式转换，移除DOM
      this.destroy();
    }
  }

  run() {
    if (this.options.openChangeColorMode) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    // 查找面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      warn('[ewColorPicker] Panel container not found');
      return;
    }
    
    // 查找已存在的颜色模式容器，避免重复插入
    this.modeContainer = $('.ew-color-picker-mode-container', panelContainer);
    if (!this.modeContainer) {
      this.createModeContainer(panelContainer);
    }
    
    // 更新模式显示
    this.updateModeDisplay();
  }



  createModeContainer(panelContainer: HTMLElement) {
    this.modeContainer = create('div');
    addClass(this.modeContainer, 'ew-color-picker-mode-container');
    setStyle(this.modeContainer, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '8px',
      marginBottom: '12px',
      padding: '8px',
      border: '1px solid #e5e6eb',
      borderRadius: '6px',
      backgroundColor: '#fafafa'
    });

    // 创建上箭头按钮
    this.upButton = create<HTMLButtonElement>('button');
    addClass(this.upButton, 'ew-color-picker-mode-up-btn');
    setAttr(this.upButton, {
      type: 'button',
      title: '上一个模式'
    });
    setStyle(this.upButton, {
      width: '24px',
      height: '24px',
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'all 0.2s'
    });
    this.upButton.innerHTML = upArrowIcon('', 16);

    // 创建模式文本显示
    this.modeText = create('div');
    addClass(this.modeText, 'ew-color-picker-mode-text');
    setStyle(this.modeText, {
      minWidth: '60px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#333',
      userSelect: 'none',
      padding: '0 8px'
    });

    // 创建下箭头按钮
    this.downButton = create<HTMLButtonElement>('button');
    addClass(this.downButton, 'ew-color-picker-mode-down-btn');
    setAttr(this.downButton, {
      type: 'button',
      title: '下一个模式'
    });
    setStyle(this.downButton, {
      width: '24px',
      height: '24px',
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'all 0.2s'
    });
    this.downButton.innerHTML = downArrowIcon('', 16);

    // 组装容器
    this.modeContainer.appendChild(this.upButton);
    this.modeContainer.appendChild(this.modeText);
    this.modeContainer.appendChild(this.downButton);

    // 查找底部行容器，将模式容器插入到其之前
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (bottomRow) {
      // 如果底部行存在，插入到其之前
      panelContainer.insertBefore(this.modeContainer, bottomRow);
    } else {
      // 如果底部行不存在，直接插入到面板容器底部
      panelContainer.appendChild(this.modeContainer);
    }
  }

  updateModeDisplay() {
    if (this.modeText) {
      this.modeText.textContent = this.getModeDisplayName(this.currentMode);
    }
  }

  bindEvents() {
    if (!this.upButton || !this.downButton) return;

    // 上箭头按钮事件
    on(this.upButton, 'click', () => {
      this.switchToPreviousMode();
    });

    // 下箭头按钮事件
    on(this.downButton, 'click', () => {
      this.switchToNextMode();
    });

    // 添加悬停效果
    if (this.upButton) {
      on(this.upButton, 'mouseenter', () => {
        setStyle(this.upButton!, {
          borderColor: '#4096ef',
          backgroundColor: '#f0f8ff'
        });
      });

      on(this.upButton, 'mouseleave', () => {
        setStyle(this.upButton!, {
          borderColor: '#ddd',
          backgroundColor: '#fff'
        });
      });
    }

    if (this.downButton) {
      on(this.downButton, 'mouseenter', () => {
        setStyle(this.downButton!, {
          borderColor: '#4096ef',
          backgroundColor: '#f0f8ff'
        });
      });

      on(this.downButton, 'mouseleave', () => {
        setStyle(this.downButton!, {
          borderColor: '#ddd',
          backgroundColor: '#fff'
        });
      });
    }

    // 监听颜色变化事件，更新显示（只在非 hex 模式下）
    this.ewColorPicker.on('change', (color: string) => {
      if (this.currentMode !== 'hex') {
        this.updateInputValues(color);
      }
    });
  }

  switchToPreviousMode() {
    const modes: ColorMode[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = modes.indexOf(this.currentMode);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : modes.length - 1;
    this.debouncedOnModeChange(modes[previousIndex]);
  }

  switchToNextMode() {
    const modes: ColorMode[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = currentIndex < modes.length - 1 ? currentIndex + 1 : 0;
    this.debouncedOnModeChange(modes[nextIndex]);
  }

  onModeChange(mode: ColorMode) {
    this.currentMode = mode;
    
    // 更新模式显示
    this.updateModeDisplay();
    
    // 更新输入框
    this.updateInputStructure();
    
    // 更新当前颜色的显示（只在非 hex 模式下）
    if (mode !== 'hex') {
      const currentColor = this.ewColorPicker.getColor();
      if (currentColor) {
        this.updateInputValues(currentColor);
      }
    }
    
    // 触发模式改变回调
    if (isFunction(this.options.changeMode)) {
      this.options.changeMode?.(mode, this.ewColorPicker);
    }
    
    // 触发事件
    this.ewColorPicker.trigger('modeChange', mode);
  }

  updateInputStructure() {
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) return;

    // 查找 input 容器
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (!bottomRow) return;
    
    const inputContainer = $('.ew-color-picker-input-container', bottomRow);
    if (!inputContainer) return;

    // 根据模式创建新的输入框
    if (this.currentMode === 'hex') {
      // hex 模式下，恢复默认的 input 插件
      this.restoreDefaultInput();
    } else {
      // rgb 或 hsl 模式下，清空容器并创建多输入框
      inputContainer.innerHTML = '';
      this.createInputsForMode(inputContainer);
    }
  }

  createInputsForMode(container: HTMLElement) {
    const hasAlpha = this.options.alpha || false;
    // 清空容器
    container.innerHTML = '';
    // 计算模式和标签
    let labels: string[] = [];
    let modeText = '';
    if (this.currentMode === 'rgb') {
      labels = hasAlpha ? ['R', 'G', 'B', 'A'] : ['R', 'G', 'B'];
      modeText = hasAlpha ? 'RGBA' : 'RGB';
    } else if (this.currentMode === 'hsl') {
      labels = hasAlpha ? ['H', 'S', 'L', 'A'] : ['H', 'S', 'L'];
      modeText = hasAlpha ? 'HSLA' : 'HSL';
    }
    // 包裹区
    const group = create('div');
    addClass(group, 'ew-color-picker-inputs-group');
    setStyle(group, {
      display: 'flex',
      flexDirection: 'row',
      gap: '4px',
      alignItems: 'flex-end',
      marginBottom: '0',
      width: '100%'
    });
    // 每个输入框及其label
    labels.forEach((label, idx) => {
      const col = create('div');
      setStyle(col, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '1',
        minWidth: '0'
      });
      // label
      const lab = create('div');
      addClass(lab, 'ew-color-picker-input-label');
      setStyle(lab, {
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
        marginBottom: '2px',
        letterSpacing: '1px',
        fontWeight: 'bold',
        height: '18px',
        lineHeight: '18px',
        userSelect: 'none'
      });
      lab.textContent = label;
      col.appendChild(lab);
      // input
      let input: HTMLElement;
      if (this.currentMode === 'rgb') {
        // 使用自定义InputNumber组件
        input = new InputNumber({
          value: 0,
          min: idx === 3 ? 0 : 0,
          max: idx === 3 ? 1 : 255,
          step: idx === 3 ? 0.1 : 1,
          precision: idx === 3 ? 1 : 0,
          placeholder: label,
          size: 'small',
          onChange: () => {
            this.updateColorFromRgbInputs();
          }
        }).getElement();
        input.classList.add(`ew-color-picker-rgb-${label.toLowerCase()}-input`, 'ew-color-picker-input');
      } else if (this.currentMode === 'hsl') {
        input = idx === 0 || idx === 3
          ? new InputNumber({
              value: 0,
              min: idx === 0 ? 0 : 0,
              max: idx === 0 ? 360 : 1,
              step: idx === 0 ? 1 : 0.1,
              precision: idx === 0 ? 0 : 1,
              placeholder: label,
              size: 'small',
              onChange: () => {
                this.updateColorFromHslInputs();
              }
            }).getElement()
          : create<HTMLInputElement>('input');
        if (!(input instanceof HTMLInputElement)) {
          input.classList.add(`ew-color-picker-hsl-${label.toLowerCase()}-input`, 'ew-color-picker-input');
        } else {
          setAttr(input, {
            type: 'text',
            placeholder: label,
            class: `ew-color-picker-hsl-${label.toLowerCase()}-input ew-color-picker-input`
          });
        }
      } else {
        input = create<HTMLInputElement>('input');
        setAttr(input, { type: 'text', placeholder: 'Unknown' });
      }
      col.appendChild(input);
      group.appendChild(col);
    });
    container.appendChild(group);
  }

  updateInputValues(color: string) {
    if (!color) return;

    const rgbaString = colorToRgba(color);
    if (!rgbaString) return;

    // 解析 RGBA 字符串为对象
    const rgba = this.parseRgbaString(rgbaString);
    if (!rgba) return;

    if (this.currentMode === 'rgb') {
      const rInputWrap = $('.ew-color-picker-rgb-r-input') as HTMLElement;
      const gInputWrap = $('.ew-color-picker-rgb-g-input') as HTMLElement;
      const bInputWrap = $('.ew-color-picker-rgb-b-input') as HTMLElement;
      const aInputWrap = $('.ew-color-picker-rgb-alpha-input') as HTMLElement;
      const rInput = rInputWrap?.querySelector('input') as HTMLInputElement;
      const gInput = gInputWrap?.querySelector('input') as HTMLInputElement;
      const bInput = bInputWrap?.querySelector('input') as HTMLInputElement;
      const aInput = aInputWrap?.querySelector('input') as HTMLInputElement;

      if (rInput) rInput.value = Math.round(rgba.r).toString();
      if (gInput) gInput.value = Math.round(rgba.g).toString();
      if (bInput) bInput.value = Math.round(rgba.b).toString();
      if (aInput) aInput.value = rgba.a.toFixed(1);
    } else if (this.currentMode === 'hsl') {
      const hsl = this.rgbToHsl(rgba.r, rgba.g, rgba.b);
      const hInputWrap = $('.ew-color-picker-hsl-h-input') as HTMLElement;
      const sInput = $('.ew-color-picker-hsl-s-input') as HTMLInputElement;
      const lInput = $('.ew-color-picker-hsl-l-input') as HTMLInputElement;
      const aInputWrap = $('.ew-color-picker-hsl-alpha-input') as HTMLElement;
      const hInput = hInputWrap?.querySelector('input') as HTMLInputElement;
      const aInput = aInputWrap?.querySelector('input') as HTMLInputElement;

      if (hInput) hInput.value = Math.round(hsl.h).toString();
      if (sInput) sInput.value = Math.round(hsl.s).toString() + '%';
      if (lInput) lInput.value = Math.round(hsl.l).toString() + '%';
      if (aInput) aInput.value = rgba.a.toFixed(1);
    }
  }

  parseRgbaString(rgbaString: string): { r: number; g: number; b: number; a: number } | null {
    try {
      const rgbaArr = rgbaString
        .slice(rgbaString.indexOf("(") + 1, rgbaString.lastIndexOf(")"))
        .split(",");
      
      if (rgbaArr.length < 3) return null;
      
      return {
        r: parseInt(rgbaArr[0]),
        g: parseInt(rgbaArr[1]),
        b: parseInt(rgbaArr[2]),
        a: rgbaArr.length < 4 ? 1 : parseFloat(rgbaArr[3])
      };
    } catch (error) {
      return null;
    }
  }

  updateColorFromRgbInputs() {
    const rInputWrap = $('.ew-color-picker-rgb-r-input') as HTMLElement;
    const gInputWrap = $('.ew-color-picker-rgb-g-input') as HTMLElement;
    const bInputWrap = $('.ew-color-picker-rgb-b-input') as HTMLElement;
    const aInputWrap = $('.ew-color-picker-rgb-alpha-input') as HTMLElement;
    const rInput = rInputWrap?.querySelector('input') as HTMLInputElement;
    const gInput = gInputWrap?.querySelector('input') as HTMLInputElement;
    const bInput = bInputWrap?.querySelector('input') as HTMLInputElement;
    const aInput = aInputWrap?.querySelector('input') as HTMLInputElement;

    if (!rInput || !gInput || !bInput) return;

    const r = parseInt(rInput.value) || 0;
    const g = parseInt(gInput.value) || 0;
    const b = parseInt(bInput.value) || 0;
    const a = aInput ? parseFloat(aInput.value) || 1 : 1;

    const color = `rgba(${r}, ${g}, ${b}, ${a})`;
    this.ewColorPicker.setColor(color);
  }

  updateColorFromHslInputs() {
    const hInputWrap = $('.ew-color-picker-hsl-h-input') as HTMLElement;
    const sInput = $('.ew-color-picker-hsl-s-input') as HTMLInputElement;
    const lInput = $('.ew-color-picker-hsl-l-input') as HTMLInputElement;
    const aInputWrap = $('.ew-color-picker-hsl-alpha-input') as HTMLElement;
    const hInput = hInputWrap?.querySelector('input') as HTMLInputElement;
    const aInput = aInputWrap?.querySelector('input') as HTMLInputElement;

    if (!hInput || !sInput || !lInput) return;

    const h = parseInt(hInput.value) || 0;
    // 解析带 % 后缀的 S 和 L 值
    const s = parseInt(sInput.value.replace('%', '')) || 0;
    const l = parseInt(lInput.value.replace('%', '')) || 0;
    const a = aInput ? parseFloat(aInput.value) || 1 : 1;

    const color = `hsla(${h}, ${s}%, ${l}%, ${a})`;
    this.ewColorPicker.setColor(color);
  }

  rgbaToHex(rgba: { r: number; g: number; b: number; a: number }): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  }

  rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100
    };
  }

  getModeDisplayName(mode: ColorMode): string {
    const names = {
      hex: 'HEX',
      rgb: 'RGB',
      hsl: 'HSL'
    };
    return names[mode] || mode.toUpperCase();
  }

  getCurrentMode(): ColorMode {
    return this.currentMode;
  }

  setMode(mode: ColorMode) {
    this.debouncedOnModeChange(mode);
  }

  // 恢复默认的 input 插件
  restoreDefaultInput() {
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) return;

    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (!bottomRow) return;
    
    const inputContainer = $('.ew-color-picker-input-container', bottomRow);
    if (!inputContainer) return;

    // 清空容器，移除所有 rgba/hsl 模式相关的 DOM
    inputContainer.innerHTML = '';

    // 恢复 input 容器的默认样式
    setStyle(inputContainer, {
      flex: '1',
      minWidth: '200px'
    });

    // 创建默认的 input 元素
    const input = create<HTMLInputElement>('input');
    addClass(input, 'ew-color-picker-input');
    setAttr(input, {
      type: 'text',
      name: 'ew-color-picker-input',
      placeholder: '请输入颜色值'
    });
    setStyle(input, {
      width: '100%',
      padding: '4px 8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '12px',
      textAlign: 'center'
    });

    // 插入到容器中
    inputContainer.appendChild(input);

    // 设置当前颜色值，如果没有则使用默认颜色
    let currentColor = this.ewColorPicker.getColor();
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const defaultColor = hasAlpha ? 'rgba(255,0,0,1)' : '#ff0000';
    
    if (!currentColor || currentColor.indexOf('NaN') !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    
    input.value = currentColor;

    // 绑定默认 input 插件的事件
    this.bindDefaultInputEvents(input);
  }

  // 绑定默认 input 插件的事件
  bindDefaultInputEvents(input: HTMLInputElement) {
    // 失焦事件
    on(input, 'blur', (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      if (isValidColor(value)) {
        this.ewColorPicker.setColor(value);
      }
    });

    // 回车事件
    on(input, 'keydown', (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        const value = (keyboardEvent.target as HTMLInputElement).value;
        if (isValidColor(value)) {
          this.ewColorPicker.setColor(value);
        }
      }
    });

    // 监听颜色变化事件，自动更新输入框
    this.ewColorPicker.on('change', (color: string) => {
      input.value = color;
    });
  }

  // 重新绑定默认 input 插件的事件
  rebindDefaultInputEvents() {
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) return;

    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (!bottomRow) return;
    
    const inputContainer = $('.ew-color-picker-input-container', bottomRow);
    if (!inputContainer) return;

    // 查找 hex 输入框
    const hexInput = $('.ew-color-picker-hex-input') as HTMLInputElement;
    if (!hexInput) return;

    // 绑定失焦事件
    on(hexInput, 'blur', (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      if (isValidColor(value)) {
        this.ewColorPicker.setColor(value);
      }
    });

    // 绑定回车事件
    on(hexInput, 'keydown', (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        const value = (keyboardEvent.target as HTMLInputElement).value;
        if (isValidColor(value)) {
          this.ewColorPicker.setColor(value);
        }
      }
    });
  }

  destroy() {
    // 移除事件监听
    if (this.upButton) {
      off(this.upButton, 'click', () => {});
      off(this.upButton, 'mouseenter', () => {});
      off(this.upButton, 'mouseleave', () => {});
    }
    if (this.downButton) {
      off(this.downButton, 'click', () => {});
      off(this.downButton, 'mouseenter', () => {});
      off(this.downButton, 'mouseleave', () => {});
    }

    // 移除DOM元素
    if (this.modeContainer && this.modeContainer.parentNode) {
      this.modeContainer.parentNode.removeChild(this.modeContainer);
    }

    // 清理引用
    this.modeContainer = null;
    this.modeText = null;
    this.upButton = null;
    this.downButton = null;
  }
}

// 扩展主包选项类型
declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerColorMode: ColorModeOptions;
  }
} 