import ewColorPicker from "@ew-color-picker/core";
import {
  getELByClass,
  on,
  setCss,
  setSomeCss,
  getRect,
  ewObjToArray,
  isFunction,
  ApplyOrder,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorHsvaToRgba, colorRgbaToHex } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface PanelOptions {
  width?: number;
  height?: number;
  hue?: boolean;
  alpha?: boolean;
  hueDirection?: 'horizontal' | 'vertical';
  alphaDirection?: 'horizontal' | 'vertical';
}

export default class ewColorPickerPanelPlugin {
  static pluginName = "ewColorPickerPanel";
  static applyOrder = ApplyOrder.Post;

  options: PanelOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  ewColorPicker: any;

  // DOM 元素
  panel: HTMLElement | null = null;
  cursor: HTMLElement | null = null;
  whitePanel: HTMLElement | null = null;
  blackPanel: HTMLElement | null = null;
  hueBar: HTMLElement | null = null;
  hueThumb: HTMLElement | null = null;
  alphaBar: HTMLElement | null = null;
  alphaThumb: HTMLElement | null = null;
  hueBg: HTMLElement | null = null;

  // 面板尺寸
  panelWidth: number = 280;
  panelHeight: number = 180;

  // 方向标志
  isHueHorizontal: boolean = false;
  isAlphaHorizontal: boolean = false;

  constructor(ewColorPicker: any) {
    this.ewColorPicker = ewColorPicker;
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = Object.assign({}, this.options, this.ewColorPicker.options);
    this.isHueHorizontal = this.options.hueDirection === 'horizontal';
    this.isAlphaHorizontal = this.options.alphaDirection === 'horizontal';
  }

  run() {
    this.render();
    // 延迟绑定事件，确保DOM完全渲染
    setTimeout(() => {
      this.bindEvents();
    }, 10);
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      console.warn('[ewColorPicker] Panel container not found');
      return;
    }
    
    // 移除旧的 ew-color-picker-panel、色相条、透明度条（只移除自己负责的部分）
    const oldPanel = panelContainer.querySelector('.ew-color-picker-panel');
    if (oldPanel) panelContainer.removeChild(oldPanel);
    const oldHue = panelContainer.querySelector('.ew-color-slider.ew-is-vertical, .ew-color-slider.ew-is-horizontal');
    if (oldHue) panelContainer.removeChild(oldHue);
    const oldAlpha = panelContainer.querySelector('.ew-color-slider.ew-alpha');
    if (oldAlpha) panelContainer.removeChild(oldAlpha);
    const oldBottomRow = panelContainer.querySelector('.ew-color-picker-bottom-row');
    if (oldBottomRow) panelContainer.removeChild(oldBottomRow);

    // 创建面板
    this.panel = document.createElement('div');
    this.panel.className = 'ew-color-picker-panel';
    this.panel.style.width = this.options.width ? this.options.width + 5 + 'px' : '285px';
    this.panel.style.height = this.options.height ? this.options.height + 'px' : '180px';
    panelContainer.appendChild(this.panel);

    // 渲染白色和黑色渐变层
    this.whitePanel = document.createElement('div');
    this.whitePanel.className = 'ew-color-white-panel';
    this.panel.appendChild(this.whitePanel);
    
    this.blackPanel = document.createElement('div');
    this.blackPanel.className = 'ew-color-black-panel';
    this.panel.appendChild(this.blackPanel);
    
    // 渲染光标
    this.cursor = document.createElement('div');
    this.cursor.className = 'ew-color-cursor';
    this.panel.appendChild(this.cursor);

    // 色相滑块
    if (this.options.hue !== false) {
      const hueSlider = document.createElement('div');
      hueSlider.className = 'ew-color-slider ' + (this.isHueHorizontal ? 'ew-is-horizontal' : 'ew-is-vertical');
      this.hueBar = document.createElement('div');
      this.hueBar.className = 'ew-color-slider-bar';
      this.hueThumb = document.createElement('div');
      this.hueThumb.className = 'ew-color-slider-thumb';
      this.hueBar.appendChild(this.hueThumb);
      hueSlider.appendChild(this.hueBar);
      panelContainer.appendChild(hueSlider);
    }
    
    // 透明度滑块
    if (this.options.alpha !== false) {
      const alphaSlider = document.createElement('div');
      alphaSlider.className = 'ew-color-slider ' + (this.isAlphaHorizontal ? 'ew-is-horizontal' : 'ew-is-vertical');
      this.alphaBar = document.createElement('div');
      this.alphaBar.className = 'ew-alpha-slider-bar';
      // 背景层
      const alphaWrapper = document.createElement('div');
      alphaWrapper.className = 'ew-alpha-slider-wrapper';
      this.alphaBar.appendChild(alphaWrapper);
      const alphaBg = document.createElement('div');
      alphaBg.className = 'ew-alpha-slider-bg';
      this.alphaBar.appendChild(alphaBg);
      this.alphaThumb = document.createElement('div');
      this.alphaThumb.className = 'ew-alpha-slider-thumb';
      this.alphaBar.appendChild(this.alphaThumb);
      alphaSlider.appendChild(this.alphaBar);
      panelContainer.appendChild(alphaSlider);
    }

    // 创建底部行容器，用于放置输入框和按钮
    const bottomRow = document.createElement('div');
    bottomRow.className = 'ew-color-picker-bottom-row';
    panelContainer.appendChild(bottomRow);

    // 初始化面板尺寸
    this.panelWidth = parseInt(getComputedStyle(this.panel).width) || 280;
    this.panelHeight = parseInt(getComputedStyle(this.panel).height) || 180;

    // 设置初始色相底色
    this.updateHueBg();
    // 设置初始光标位置 - 修复：使用正确的初始位置
    this.updateCursorPosition(100, 100);
    // 设置初始透明度thumb位置
    const currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva2 = colorRgbaToHsva(currentColor);
    this.updateAlphaThumbPosition(hsva2.a);
    // 设置初始色相thumb位置
    this.updateHueThumbPosition(hsva2.h);
  }

  bindEvents() {
    if (!this.panel) {
      console.log('[Panel Plugin] No panel found, skipping event binding');
      return;
    }

    console.log('[Panel Plugin] Binding events...');

    // 面板点击事件
    this.panel.addEventListener('click', this.handlePanelClick.bind(this));
    this.panel.addEventListener('mousedown', this.handlePanelMouseDown.bind(this));
    console.log('[Panel Plugin] Panel events bound');

    // 色相滑块事件
    if (this.hueBar) {
      this.hueBar.addEventListener('click', this.handleHueSliderClick.bind(this));
      this.hueBar.addEventListener('mousedown', this.handleHueSliderMouseDown.bind(this));
      console.log('[Panel Plugin] Hue slider events bound');
    } else {
      console.log('[Panel Plugin] No hue bar found for event binding');
    }

    // 透明度滑块事件
    if (this.alphaBar) {
      this.alphaBar.addEventListener('click', this.handleAlphaSliderClick.bind(this));
      this.alphaBar.addEventListener('mousedown', this.handleAlphaSliderMouseDown.bind(this));
      console.log('[Panel Plugin] Alpha slider events bound');
    } else {
      console.log('[Panel Plugin] No alpha bar found for event binding');
    }
  }

  handlePanelClick(event: MouseEvent) {
    if (!this.panel || !this.cursor) return;

    const rect = this.panel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算饱和度和明度
    const saturation = Math.max(0, Math.min(100, (x / this.panelWidth) * 100));
    const value = Math.max(0, Math.min(100, (1 - y / this.panelHeight) * 100));

    console.log('[Panel Plugin] Panel click - saturation:', saturation, 'value:', value);
    
    // 更新光标位置和颜色
    this.updateCursorPosition(saturation, value);
    this.updateColor(saturation, value);
  }

  handlePanelMouseDown(event: MouseEvent) {
    if (!this.panel) return;

    const handleMouseMove = (e: MouseEvent) => {
      this.handlePanelClick(e);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  handleHueSliderClick(event: MouseEvent) {
    console.log('[Panel Plugin] Hue slider clicked');
    if (!this.hueBar) return;

    const rect = this.hueBar.getBoundingClientRect();
    const isVertical = this.hueBar.parentElement?.classList.contains('ew-is-vertical');
    
    let hue: number;
    if (isVertical) {
      const y = event.clientY - rect.top;
      hue = Math.max(0, Math.min(360, (1 - y / rect.height) * 360));
    } else {
      const x = event.clientX - rect.left;
      hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    }

    console.log('[Panel Plugin] Hue slider click - hue:', hue);
    this.updateHue(hue);
  }

  handleHueSliderMouseDown(event: MouseEvent) {
    if (!this.hueBar) return;
    const slider = this.hueBar;
    const moveHandler = (e: MouseEvent) => {
      const rect = slider.getBoundingClientRect();
      const isVertical = slider.parentElement?.classList.contains('ew-is-vertical');
      let hue: number;
      if (isVertical) {
        const y = e.clientY - rect.top;
        hue = Math.max(0, Math.min(360, (1 - y / rect.height) * 360));
      } else {
        const x = e.clientX - rect.left;
        hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
      }
      this.updateHue(hue);
    };
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  handleAlphaSliderClick(event: MouseEvent) {
    console.log('[Panel Plugin] Alpha slider clicked');
    if (!this.alphaBar) return;

    const rect = this.alphaBar.getBoundingClientRect();
    const isVertical = this.alphaBar.parentElement?.classList.contains('ew-is-vertical');
    
    let alpha: number;
    if (isVertical) {
      const y = event.clientY - rect.top;
      alpha = Math.max(0, Math.min(1, (1 - y / rect.height)));
    } else {
      const x = event.clientX - rect.left;
      alpha = Math.max(0, Math.min(1, x / rect.width));
    }

    console.log('[Panel Plugin] Alpha slider click - alpha:', alpha);
    this.updateAlpha(alpha);
    this.updateAlphaThumbPosition(alpha);
  }

  handleAlphaSliderMouseDown(event: MouseEvent) {
    console.log('[Panel Plugin] Alpha slider mousedown');
    if (!this.alphaBar) return;
    const slider = this.alphaBar;
    const moveHandler = (e: MouseEvent) => {
      const rect = slider.getBoundingClientRect();
      const isVertical = slider.parentElement?.classList.contains('ew-is-vertical');
      let alpha: number;
      if (isVertical) {
        const y = e.clientY - rect.top;
        alpha = Math.max(0, Math.min(1, (1 - y / rect.height)));
      } else {
        const x = e.clientX - rect.left;
        alpha = Math.max(0, Math.min(1, x / rect.width));
      }
      this.updateAlpha(alpha);
      this.updateAlphaThumbPosition(alpha);
    };
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  updateCursorPosition(saturation: number, value: number) {
    if (!this.cursor) return;

    // 修复：确保光标位置在面板内部
    const x = Math.max(0, Math.min(this.panelWidth, (saturation / 100) * this.panelWidth));
    const y = Math.max(0, Math.min(this.panelHeight, (1 - value / 100) * this.panelHeight));

    setSomeCss(this.cursor, [
      { prop: 'left', value: `${x}px` },
      { prop: 'top', value: `${y}px` }
    ]);
    
    console.log('[Panel Plugin] 光标位置更新:', { x, y, saturation, value });
  }

  updateColor(saturation: number, value: number) {
    // 兜底：根据是否有透明度柱选择默认色
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const defaultColor = hasAlpha ? 'rgba(255,0,0,1)' : '#ff0000';
    let currentColor = this.ewColorPicker.getColor();
    if (!currentColor || currentColor.indexOf('NaN') !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    const hsva = colorRgbaToHsva(currentColor);
    hsva.s = saturation;
    hsva.v = value;
    
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    // 触发change事件
    if (isFunction(this.ewColorPicker.options.changeColor)) {
      this.ewColorPicker.options.changeColor(newColor);
    }
  }

  updateHue(hue: number) {
    // 兜底：根据是否有透明度柱选择默认色
    const hasAlpha = !!this.ewColorPicker.options.alpha;
    const defaultColor = hasAlpha ? 'rgba(255,0,0,1)' : '#ff0000';
    let currentColor = this.ewColorPicker.getColor();
    if (!currentColor || currentColor.indexOf('NaN') !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    const hsva = colorRgbaToHsva(currentColor);
    hsva.h = hue;
    
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    // 立即更新面板背景色
    this.updateHueBg();
    // 触发change事件
    if (isFunction(this.ewColorPicker.options.changeColor)) {
      this.ewColorPicker.options.changeColor(newColor);
    }
    // 同步更新thumb位置
    this.updateHueThumbPosition(hue);
  }

  updateHueBg() {
    if (this.panel) {
      let hsva;
      const currentColor = this.ewColorPicker.getColor();
      if (!currentColor || currentColor.indexOf('NaN') !== -1) {
        // 默认红色
        hsva = { h: 0, s: 100, v: 100, a: 1 };
      } else {
        const temp = colorRgbaToHsva(currentColor);
        hsva = { h: temp.h, s: 100, v: 100, a: 1 };
      }
      const hueColor = colorHsvaToRgba(hsva);
      this.panel.style.background = hueColor;
    }
  }

  updateHueThumbPosition(hue: number) {
    if (!this.hueThumb || !this.hueBar) return;

    const isVertical = this.hueBar.parentElement?.classList.contains('ew-is-vertical');
    const rect = this.hueBar.getBoundingClientRect();
    
    if (!isVertical) {
      const x = Math.max(0, Math.min(rect.width, (hue / 360) * rect.width));
      setSomeCss(this.hueThumb, [{ prop: 'left', value: `${x}px` }]);
    } else {
      const y = Math.max(0, Math.min(rect.height, (1 - hue / 360) * rect.height));
      setSomeCss(this.hueThumb, [{ prop: 'top', value: `${y}px` }]);
    }
  }

  updateAlpha(alpha: number) {
    // 更新透明度值
    const currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva = colorRgbaToHsva(currentColor);
    hsva.a = alpha;
    
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    
    // 触发change事件
    if (isFunction(this.ewColorPicker.options.changeColor)) {
      this.ewColorPicker.options.changeColor(newColor);
    }
    // 新增：同步更新thumb位置
    this.updateAlphaThumbPosition(alpha);
  }

  updateAlphaThumbPosition(alpha: number) {
    if (!this.alphaThumb || !this.alphaBar) return;

    const isVertical = this.alphaBar.parentElement?.classList.contains('ew-is-vertical');
    const rect = this.alphaBar.getBoundingClientRect();
    
    if (!isVertical) {
      const x = Math.max(0, Math.min(rect.width, (1 - alpha) * rect.width));
      setSomeCss(this.alphaThumb, [{ prop: 'left', value: `${x}px` }]);
    } else {
      const y = Math.max(0, Math.min(rect.height, (1 - alpha) * rect.height));
      setSomeCss(this.alphaThumb, [{ prop: 'top', value: `${y}px` }]);
    }
    
    console.log('[Panel Plugin] 透明度thumb位置更新:', { alpha, isVertical, x: !isVertical ? (1 - alpha) * rect.width : undefined, y: isVertical ? (1 - alpha) * rect.height : undefined });
  }

  destroy() {
    // 清理事件监听器
    if (this.panel) {
      this.panel.removeEventListener('click', this.handlePanelClick.bind(this));
      this.panel.removeEventListener('mousedown', this.handlePanelMouseDown.bind(this));
    }

    if (this.hueBar) {
      this.hueBar.removeEventListener('click', this.handleHueSliderClick.bind(this));
      this.hueBar.removeEventListener('mousedown', this.handleHueSliderMouseDown.bind(this));
    }

    if (this.alphaBar) {
      this.alphaBar.removeEventListener('click', this.handleAlphaSliderClick.bind(this));
      this.alphaBar.removeEventListener('mousedown', this.handleAlphaSliderMouseDown.bind(this));
    }
  }
}

declare module "@ew-color-picker/panel" {
  interface CustomOptions {
    ewColorPickerPanel: PanelOptions;
  }
} 