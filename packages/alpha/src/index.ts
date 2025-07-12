import { on, setStyle, addClass, removeClass, hasClass, isFunction, insertNode, ApplyOrder, extend, warn, create, $, off, getRect, throttle, removeElement } from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorHsvaToRgba } from "@ew-color-picker/utils";
import ewColorPicker,{ ewColorPickerOptions } from "@ew-color-picker/core";

export interface AlphaOptions {
  direction?: 'horizontal' | 'vertical';
}

export default class ewColorPickerAlphaPlugin {
  static pluginName = "ewColorPickerAlpha";
  static applyOrder = ApplyOrder.Post;
  options: AlphaOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  alphaBar: HTMLElement | null = null;
  alphaThumb: HTMLElement | null = null;
  isHorizontal: boolean = false;
  
  // 节流处理鼠标移动事件
  private throttledUpdateAlpha: (alpha: number) => void;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    // 初始化节流函数
    this.throttledUpdateAlpha = throttle(this.updateAlpha.bind(this), 16); // 60fps
    
    // 注册事件监听器
    if (this.ewColorPicker.on && typeof this.ewColorPicker.on === 'function') {
      this.ewColorPicker.on('change', (color: string) => {
        // 当颜色改变时，更新 alpha 滑块位置
        const hsva = colorRgbaToHsva(color);
        this.updateAlphaThumbPosition(hsva.a);
      });
    }
    
    this.run();
  }

  handleOptions() {
    if (this.ewColorPicker && this.ewColorPicker.options) {
      this.options = extend({}, this.options, this.ewColorPicker.options);
      this.isHorizontal = this.options.alphaDirection === 'horizontal';
    }
  }

  run() {
    // 检查是否显示 alpha 滑块
    if (this.options.showAlpha === false) {
      return;
    }
    
    this.render();
    setTimeout(() => {
      this.bindEvents();
    }, 10);
  }

  render() {
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      warn('[ewColorPicker] Panel container not found, please check the ewColorPicker instance!');
      return;
    }
    // 移除旧的 alpha 条
    const oldAlpha = $('.ew-color-picker-slider.ew-alpha', panelContainer);
    if (oldAlpha) removeElement(oldAlpha);
    // 创建 alpha 条
    const alphaSlider = create('div');
    addClass(alphaSlider, 'ew-color-picker-slider ew-alpha ' + (this.isHorizontal ? 'ew-color-picker-is-horizontal' : 'ew-color-picker-is-vertical'));
    this.alphaBar = create('div');
    addClass(this.alphaBar, 'ew-color-picker-alpha-slider-bar');
    // 背景层
    const alphaWrapper = create('div');
    addClass(alphaWrapper, 'ew-color-picker-alpha-slider-wrapper');
    insertNode(this.alphaBar, alphaWrapper);
    const alphaBg = create('div');
    addClass(alphaBg, 'ew-color-picker-alpha-slider-bg');
    insertNode(this.alphaBar, alphaBg);
    this.alphaThumb = create('div');
    addClass(this.alphaThumb, 'ew-color-picker-alpha-slider-thumb');
    insertNode(this.alphaBar, this.alphaThumb);
    insertNode(alphaSlider, this.alphaBar);

    // 插入到 bottom-row 之前
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (bottomRow && bottomRow.parentNode) {
      bottomRow.parentNode.insertBefore(alphaSlider, bottomRow);
    } else {
      insertNode(panelContainer, alphaSlider);
    }

    // 设置初始 thumb 位置
    const currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva = colorRgbaToHsva(currentColor);
    this.updateAlphaThumbPosition(hsva.a);
  }

  bindEvents() {
    if (!this.alphaBar) return;
    on(this.alphaBar, 'click', (event: Event) => {
      this.handleAlphaSliderClick(event as MouseEvent);
    });
    on(this.alphaBar, 'mousedown', (event: Event) => {
      this.handleAlphaSliderMouseDown(event as MouseEvent);
    });
  }

  handleAlphaSliderClick(event: MouseEvent) {
    if (!this.alphaBar) return;
    const rect = getRect(this.alphaBar);
    const isHorizontal = this.isHorizontal;
    let alpha: number;
    if (isHorizontal) {
      const x = event.clientX - rect.left;
      alpha = Math.max(0, Math.min(1, 1 - (x / rect.width)));
    } else {
      const y = event.clientY - rect.top;
      alpha = Math.max(0, Math.min(1, (1 - y / rect.height)));
    }
    this.updateAlpha(alpha);
  }

  handleAlphaSliderMouseDown(event: MouseEvent) {
    if (!this.alphaBar) return;
    const slider = this.alphaBar;
    const isHorizontal = this.isHorizontal;
    const moveHandler = (e: MouseEvent) => {
      const rect = getRect(slider);
      let alpha: number;
      if (isHorizontal) {
        const x = e.clientX - rect.left;
        alpha = Math.max(0, Math.min(1, 1 - (x / rect.width)));
      } else {
        const y = e.clientY - rect.top;
        alpha = Math.max(0, Math.min(1, (1 - y / rect.height)));
      }
      this.throttledUpdateAlpha(alpha);
    };
    const upHandler = () => {
      off(document, 'mousemove', moveHandler as EventListener);
      off(document, 'mouseup', upHandler);
    };
    on(document, 'mousemove', moveHandler as EventListener);
    on(document, 'mouseup', upHandler as EventListener);
  } 

  updateAlpha(alpha: number) {
    // 只更新 alpha，保持 h/s/v 不变
    let currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva = colorRgbaToHsva(currentColor);
    hsva.a = alpha;
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    this.updateAlphaThumbPosition(alpha);
  }

  updateAlphaThumbPosition(alpha: number) {
    if (!this.alphaThumb || !this.alphaBar) return;
    const isHorizontal = this.isHorizontal;
    const rect = getRect(this.alphaBar);
    if (isHorizontal) {
      const x = Math.max(0, Math.min(rect.width, (1 - alpha) * rect.width));
      setStyle(this.alphaThumb, 'left', `${x}px`);
      setStyle(this.alphaThumb, 'top', `0px`);
    } else {
      const y = Math.max(0, Math.min(rect.height, (1 - alpha) * rect.height));
              setStyle(this.alphaThumb, 'top', `${y}px`);
        setStyle(this.alphaThumb, 'left', `0px`);
    }
  }

  destroy() {
    // 清理事件监听器
    if (this.alphaBar) {
      off(this.alphaBar, 'click', this.handleAlphaSliderClick.bind(this) as EventListener);
      off(this.alphaBar, 'mousedown', this.handleAlphaSliderMouseDown.bind(this) as EventListener);
    }
    
    // 清理DOM引用
    this.alphaBar = null;
    this.alphaThumb = null;
  }

  // 新增 install 方法，便于测试
  install(core: any) {
    this.ewColorPicker = core;
    this.handleOptions();
    
    // 注册事件监听器
    if (core.on && typeof core.on === 'function') {
      core.on('change', (color: string) => {
        // 当颜色改变时，更新 alpha 滑块位置
        const hsva = colorRgbaToHsva(color);
        this.updateAlphaThumbPosition(hsva.a);
      });
    }
    
    this.run?.();
  }
} 