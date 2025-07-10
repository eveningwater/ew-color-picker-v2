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
  extend,
  warn,
  off,
  setStyle,
  $,
  removeNode,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorHsvaToRgba, colorRgbaToHex } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface PanelOptions {
  hue?: boolean;
  alpha?: boolean;
  hueDirection?: 'horizontal' | 'vertical';
  alphaDirection?: 'horizontal' | 'vertical';
}

export default class ewColorPickerPanelPlugin {
  static pluginName = "ewColorPickerPanel";
  static applyOrder = ApplyOrder.Post;

  options: PanelOptions & Omit<ewColorPickerOptions, "el"> = {} as any;

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
  panelWidth: number;
  panelHeight: number;

  // 方向标志
  isHueHorizontal: boolean = false;
  isAlphaHorizontal: boolean = false;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
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
      warn('[ewColorPicker] Panel container not found');
      return;
    }
    // 只移除自己负责的 DOM
    const oldPanel = $('.ew-color-picker-panel', panelContainer);
    if (oldPanel) removeNode(oldPanel);

    // 动态计算面板宽度
    let panelWidth = 285;
    if (this.isAlphaHorizontal && this.isHueHorizontal) {
      panelWidth = 300;
    }
    if((this.isAlphaHorizontal && !this.isHueHorizontal) || (!this.isAlphaHorizontal && this.isHueHorizontal)){
      panelWidth = 285 + 12;
    }
    this.panel = document.createElement('div');
    this.panel.className = 'ew-color-picker-panel';
    this.panel.style.width = panelWidth + 'px';
    this.panel.style.height = '180px';

    this.panelWidth = panelWidth;
    this.panelHeight = 180;
    
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

    // 设置初始色相底色
    this.updateHueBg();
    // 设置初始光标位置
    this.updateCursorPosition(100, 100);
  }

  bindEvents() {
    if (!this.panel) {
      warn('[ewColorPicker panel plugin] No panel container elementfound, skipping event binding');
      return;
    }
    // 面板点击事件
    on(this.panel, 'click', (event) => this.handlePanelClick(event as MouseEvent));
    on(this.panel, 'mousedown', () => this.handlePanelMouseDown());
  }

  handlePanelClick(event: MouseEvent) {
    if (!this.panel || !this.cursor) return;

    const rect = getRect(this.panel);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算饱和度和明度
    const saturation = Math.max(0, Math.min(100, (x / this.panelWidth) * 100));
    const value = Math.max(0, Math.min(100, (1 - y / this.panelHeight) * 100));

    // 更新光标位置和颜色
    this.updateCursorPosition(saturation, value);
    this.updateColor(saturation, value);
  }

  handlePanelMouseDown() {
    if (!this.panel) return;

    const handleMouseMove = (e: MouseEvent) => {
      this.handlePanelClick(e);
    };

    const handleMouseUp = () => {
      off(document, 'mousemove', handleMouseMove as EventListener);
      off(document, 'mouseup', handleMouseUp as EventListener);
    };

    on(document, 'mousemove', handleMouseMove as EventListener);
    on(document, 'mouseup', handleMouseUp as EventListener);
  }

  updateCursorPosition(saturation: number, value: number) {
    if (!this.cursor || !this.panel) return;

    // 计算相对面板的坐标
    const left = Math.max(0, Math.min((saturation / 100) * this.panelWidth, this.panelWidth));
    const top = Math.max(0, Math.min((1 - value / 100) * this.panelHeight, this.panelHeight));

    setStyle(this.cursor, {
      left: `${left + 4}px`,
      top: `${top + 4}px`
    });
  }

  updateColor(saturation: number, value: number) {
    const { alpha } = this.options;
    const defaultColor = alpha ? 'rgba(255,0,0,1)' : '#ff0000';
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
    this.ewColorPicker.trigger('change', newColor);
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
      setStyle(this.panel, {
        background: hueColor
      });
    }
  }

  destroy() {
    // 清理事件监听器
    if (this.panel) {
      off(this.panel, 'click', this.handlePanelClick as EventListener);
      off(this.panel, 'mousedown', this.handlePanelMouseDown as EventListener);
    }
  }
}

declare module "@ew-color-picker/panel" {
  interface CustomOptions {
    ewColorPickerPanel: PanelOptions;
  }
} 