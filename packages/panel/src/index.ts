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
    // 只移除自己负责的 DOM
    const oldPanel = panelContainer.querySelector('.ew-color-picker-panel');
    if (oldPanel) panelContainer.removeChild(oldPanel);

    // 创建面板
    this.panel = document.createElement('div');
    this.panel.className = 'ew-color-picker-panel';
    this.panel.style.width = this.options.width ? this.options.width + 5 + 'px' : '285px';
    this.panel.style.height = this.options.height ? this.options.height + 'px' : '180px';
    panelContainer.appendChild(this.panel);

    // 渲染白色和黑色渐变层
    this.whitePanel = document.createElement('div');
    this.whitePanel.className = 'ew-color-picker-white-panel';
    this.panel.appendChild(this.whitePanel);
    
    this.blackPanel = document.createElement('div');
    this.blackPanel.className = 'ew-color-picker-black-panel';
    this.panel.appendChild(this.blackPanel);
    
    // 渲染光标
    this.cursor = document.createElement('div');
    this.cursor.className = 'ew-color-picker-panel-cursor';
    this.panel.appendChild(this.cursor);

    // 创建底部行容器（只插入一次）
    let bottomRow = panelContainer.querySelector('.ew-color-picker-bottom-row');
    if (!bottomRow) {
      bottomRow = document.createElement('div');
      bottomRow.className = 'ew-color-picker-bottom-row';
      panelContainer.appendChild(bottomRow);
    }

    // 初始化面板尺寸
    this.panelWidth = parseInt(getComputedStyle(this.panel).width) || 280;
    this.panelHeight = parseInt(getComputedStyle(this.panel).height) || 180;

    // 设置初始色相底色
    this.updateHueBg();
    // 设置初始光标位置
    this.updateCursorPosition(100, 100);
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

  updateCursorPosition(saturation: number, value: number) {
    if (!this.cursor || !this.panel) return;

    // 计算相对面板的坐标
    const left = Math.max(0, Math.min((saturation / 100) * this.panelWidth, this.panelWidth));
    const top = Math.max(0, Math.min((1 - value / 100) * this.panelHeight, this.panelHeight));

    // 按原版加4px偏移
    setSomeCss(this.cursor, [
      { prop: 'left', value: `${left + 4}px` },
      { prop: 'top', value: `${top + 4}px` }
    ]);
    console.log('[Panel Plugin] 光标位置更新:', { left, top, saturation, value });
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

  destroy() {
    // 清理事件监听器
    if (this.panel) {
      this.panel.removeEventListener('click', this.handlePanelClick.bind(this));
      this.panel.removeEventListener('mousedown', this.handlePanelMouseDown.bind(this));
    }
  }
}

declare module "@ew-color-picker/panel" {
  interface CustomOptions {
    ewColorPickerPanel: PanelOptions;
  }
} 