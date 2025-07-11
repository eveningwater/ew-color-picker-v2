import { on, setStyle, addClass, removeClass, hasClass, isFunction, insertNode, ApplyOrder, warn, create, extend, off, $ } from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorHsvaToRgba } from "@ew-color-picker/utils";
import ewColorPicker, { ewColorPickerOptions } from "@ew-color-picker/core";

export interface HueOptions {
  direction?: 'horizontal' | 'vertical';
}

export default class ewColorPickerHuePlugin {
  static pluginName = "ewColorPickerHue";
  static applyOrder = ApplyOrder.Post;
  options: HueOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  hueBar: HTMLElement | null = null;
  hueThumb: HTMLElement | null = null;
  isHorizontal: boolean = false;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
    this.isHorizontal = this.options.hueDirection === 'horizontal';
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
      warn('[ewColorPicker] Panel container not found');
      return;
    }
    // 移除旧的 hue 条
    const oldHue = $('.ew-color-picker-slider.ew-color-picker-is-vertical, .ew-color-picker-slider.ew-color-picker-is-horizontal', panelContainer);
    if (oldHue) panelContainer.removeChild(oldHue);
    // 创建 hue 条
    const hueSlider = create('div');
    addClass(hueSlider, 'ew-color-picker-slider ' + (this.isHorizontal ? 'ew-color-picker-is-horizontal' : 'ew-color-picker-is-vertical'));
    this.hueBar = create('div');
    addClass(this.hueBar, 'ew-color-picker-slider-bar');
    this.hueThumb = create('div');
    addClass(this.hueThumb, 'ew-color-picker-slider-thumb');
    this.hueBar.appendChild(this.hueThumb);
    hueSlider.appendChild(this.hueBar);
    // 插入到 bottom-row 之前
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    if (bottomRow && bottomRow.parentNode) {
      bottomRow.parentNode.insertBefore(hueSlider, bottomRow);
    } else {
      panelContainer.appendChild(hueSlider);
    }
    // 设置初始 thumb 位置
    const currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva = colorRgbaToHsva(currentColor);
    this.updateHueThumbPosition(hsva.h);
  }

  bindEvents() {
    if (!this.hueBar) return;
    on(this.hueBar, 'click', this.handleHueSliderClick.bind(this) as EventListener);
    on(this.hueBar, 'mousedown', this.handleHueSliderMouseDown.bind(this) as EventListener);
  }

  handleHueSliderClick(event: MouseEvent) {
    if (!this.hueBar) return;
    const rect = this.hueBar.getBoundingClientRect();
    const isHorizontal = this.isHorizontal;
    let hue: number;
    if (isHorizontal) {
      const x = event.clientX - rect.left;
      hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    } else {
      const y = event.clientY - rect.top;
      hue = Math.max(0, Math.min(360, (1 - y / rect.height) * 360));
    }
    this.updateHue(hue);
  }

  handleHueSliderMouseDown(event: MouseEvent) {
    if (!this.hueBar) return;
    const slider = this.hueBar;
    const isHorizontal = this.isHorizontal;
    const moveHandler = (e: MouseEvent) => {
      const rect = slider.getBoundingClientRect();
      let hue: number;
      if (isHorizontal) {
        const x = e.clientX - rect.left;
        hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
      } else {
        const y = e.clientY - rect.top;
        hue = Math.max(0, Math.min(360, (1 - y / rect.height) * 360));
      }
      this.updateHue(hue);
    };
    const upHandler = () => {
      off(document, 'mousemove', moveHandler as EventListener);
      off(document, 'mouseup', upHandler as EventListener);
    };
    on(document, 'mousemove', moveHandler as EventListener);
    on(document, 'mouseup', upHandler as EventListener);
  }

  updateHue(hue: number) {
    // 只更新 hue，保持 s/v/a 不变
    let currentColor = this.ewColorPicker.getColor() || '#ff0000';
    const hsva = colorRgbaToHsva(currentColor);
    hsva.h = hue;
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    this.updateHueThumbPosition(hue);

    // 调用 panel 插件的 updateHueBg 方法
    const panelPlugin = this.ewColorPicker.plugins?.ewColorPickerPanel;
    if (panelPlugin && typeof panelPlugin.updateHueBg === 'function') {
      panelPlugin.updateHueBg();
    }
  }

  updateHueThumbPosition(hue: number) {
    if (!this.hueThumb || !this.hueBar) return;
    const isHorizontal = this.isHorizontal;
    const rect = this.hueBar.getBoundingClientRect();
    if (isHorizontal) {
      const x = Math.max(0, Math.min(rect.width, (hue / 360) * rect.width));
      setStyle(this.hueThumb, 'left', `${x}px`);
      setStyle(this.hueThumb, 'top', `0px`);
    } else {
      const y = Math.max(0, Math.min(rect.height, (1 - hue / 360) * rect.height));
              setStyle(this.hueThumb, 'top', `${y}px`);
        setStyle(this.hueThumb, 'left', `0px`);
    }
  }
} 