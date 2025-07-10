import { getELByClass, on, setCss, addClass, removeClass, hasClass, isFunction, insertNode, ApplyOrder, extend, warn, create, $, off } from "@ew-color-picker/utils";
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

  constructor(public ewColorPicker: ewColorPicker) {
    this.ewColorPicker = ewColorPicker;
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
    this.isHorizontal = this.options.alphaDirection === 'horizontal';
  }

  run() {
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
    const oldAlpha = panelContainer.querySelector('.ew-color-picker-slider.ew-alpha');
    if (oldAlpha) panelContainer.removeChild(oldAlpha);
    // 创建 alpha 条
    const alphaSlider = create('div');
    alphaSlider.className = 'ew-color-picker-slider ew-alpha ' + (this.isHorizontal ? 'ew-color-picker-is-horizontal' : 'ew-color-picker-is-vertical');
    this.alphaBar = create('div');
    this.alphaBar.className = 'ew-color-picker-alpha-slider-bar';
    // 背景层
    const alphaWrapper = create('div');
    alphaWrapper.className = 'ew-color-picker-alpha-slider-wrapper';
    this.alphaBar.appendChild(alphaWrapper);
    const alphaBg = create('div');
    alphaBg.className = 'ew-color-picker-alpha-slider-bg';
    this.alphaBar.appendChild(alphaBg);
    this.alphaThumb = create('div');
    this.alphaThumb.className = 'ew-color-picker-alpha-slider-thumb';
    this.alphaBar.appendChild(this.alphaThumb);
    alphaSlider.appendChild(this.alphaBar);

    // 插入到 bottom-row 之前
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (bottomRow && bottomRow.parentNode) {
      bottomRow.parentNode.insertBefore(alphaSlider, bottomRow);
    } else {
      panelContainer.appendChild(alphaSlider);
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
    const rect = this.alphaBar.getBoundingClientRect();
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
      const rect = slider.getBoundingClientRect();
      let alpha: number;
      if (isHorizontal) {
        const x = e.clientX - rect.left;
        alpha = Math.max(0, Math.min(1, 1 - (x / rect.width)));
      } else {
        const y = e.clientY - rect.top;
        alpha = Math.max(0, Math.min(1, (1 - y / rect.height)));
      }
      this.updateAlpha(alpha);
    };
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
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
    const rect = this.alphaBar.getBoundingClientRect();
    if (isHorizontal) {
      const x = Math.max(0, Math.min(rect.width, (1 - alpha) * rect.width));
      setCss(this.alphaThumb, 'left', `${x}px`);
      setCss(this.alphaThumb, 'top', `0px`);
    } else {
      const y = Math.max(0, Math.min(rect.height, (1 - alpha) * rect.height));
      setCss(this.alphaThumb, 'top', `${y}px`);
      setCss(this.alphaThumb, 'left', `0px`);
    }
  }
} 