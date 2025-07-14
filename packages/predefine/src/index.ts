import ewColorPicker from "@ew-color-picker/core";
import {
  on,
  addClass,
  removeClass,
  isFunction,
  warn,
  create,
  extend,
  $,
  setStyle,
  isString,
  isObject,
  debounce,
  off,
  insertNode,
  ApplyOrder,
  hasClass,
} from "@ew-color-picker/utils";
import { colorRgbaToHsva, colorToRgba, isValidColor, isAlphaColor } from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface PredefineColor {
  color: string;
  disabled?: boolean;
}

export interface PredefineOptions {
  predefineColor?: string[] | PredefineColor[];
  changeColor?: Function;
  showPredefine?: boolean;
}

export default class ewColorPickerPredefinePlugin {
  static pluginName = "ewColorPickerPredefine";
  options: PredefineOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  predefineItems: HTMLElement[] = [];
  container: HTMLElement | null = null;
  
  // 防抖处理颜色点击事件
  private debouncedOnPredefineColorClick: (event: Event, color: string) => void;
  // 面板切换事件处理器
  private toggleHandler: ((isOpen: boolean) => void) | null = null;
  // 标记是否已绑定事件
  private isEventBound: boolean = false;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    // 初始化防抖函数
    this.debouncedOnPredefineColorClick = debounce(this.onPredefineColorClick.bind(this), 100);
    this.run();
  }

  handleOptions() {
    if (this.ewColorPicker && this.ewColorPicker.options) {
      this.options = extend(this.options, this.ewColorPicker.options);
      
      // 处理嵌套的 ewColorPickerPredefine 配置
      if (this.ewColorPicker.options.ewColorPickerPredefine) {
        this.options = extend(this.options, this.ewColorPicker.options.ewColorPickerPredefine);
      }
    }
  }

  run() {
    // 检查是否显示预定义颜色
    if (this.options.ewColorPickerPredefine === false) {
      return;
    }
    
    if (this.options.predefineColor && this.options.predefineColor.length > 0) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint('panelContainer');
    if (!panelContainer) {
      warn('[ewColorPicker warning]: Panel container not found');
      return;
    }
    
    // 查找或创建预定义色块容器
    this.container = $('.ew-color-picker-predefine-container', panelContainer);
    if (!this.container) {
      this.container = create('div');
      addClass(this.container, 'ew-color-picker-predefine-container');
      // 立即插入到DOM中
      this.ensureContainerAtCorrectPosition(panelContainer);
    }
    
    
    // 清空旧内容
    if (this.container) {
      this.container.textContent = '';
      this.predefineItems = [];
      
      // 渲染预定义色块
      (this.options.predefineColor || []).forEach((colorData) => {
        const { color } = this.parseColorData(colorData);
        const item = create('div');
        addClass(item, 'ew-color-picker-predefine-color');
        const colorItem = create('div');
        addClass(colorItem, 'ew-color-picker-predefine-color-item');
        setStyle(colorItem, 'backgroundColor', color);
        insertNode(item, colorItem);
        insertNode(this.container!, item);
        this.predefineItems.push(item);
      });
    }

    // 绑定面板切换事件（避免重复绑定）
    this.bindToggleEvent(panelContainer);
  }

  // 解析颜色数据
  private parseColorData(colorData: string | PredefineColor) {
    const color = isString(colorData) ? colorData : colorData.color;
    const disabled = isObject(colorData) ? colorData.disabled : false;
    return { color, disabled };
  }

  // 绑定面板切换事件（避免重复绑定）
  private bindToggleEvent(panelContainer: HTMLElement) {
    // 如果已经绑定过事件，先解绑
    if (this.isEventBound && this.toggleHandler) {
      this.ewColorPicker.off('toggle', this.toggleHandler);
      this.isEventBound = false;
    }
    
    // 创建新的事件处理器
    this.toggleHandler = (isOpen: boolean) => {
      if (isOpen) {
        this.ensureContainerAtCorrectPosition(panelContainer);
      }
    };
    
    // 绑定事件
    this.ewColorPicker.on('toggle', this.toggleHandler);
    this.isEventBound = true;
  }

  // 确保容器在正确位置
  private ensureContainerAtCorrectPosition(panelContainer: HTMLElement) {
    if (!this.container) return;
    
    // 查找相关元素
    const horizontalSlider = $('.ew-color-picker-slider.ew-color-picker-is-horizontal', panelContainer);
    const modeContainer = $('.ew-color-picker-mode-container', panelContainer);
    const bottomRow = $('.ew-color-picker-bottom-row', panelContainer);
    

    // 确定目标位置
    let targetElement: HTMLElement | null = null;
    
    // 优先级1: 如果存在水平方向的slider，插入到slider之后
    if (horizontalSlider) {
      targetElement = horizontalSlider.nextSibling as HTMLElement;
    }
    // 优先级2: 如果存在mode-container，插入到mode-container之前
    else if (modeContainer) {
      targetElement = modeContainer;
    }
    // 优先级3: 如果存在bottom-row，插入到bottom-row之前
    else if (bottomRow) {
      targetElement = bottomRow;
    }
    // 优先级4: 默认插入到面板之后
    else {
      const panel = $('.ew-color-picker-panel', panelContainer);
      if (panel) {
        targetElement = panel.nextSibling as HTMLElement;
      }
    }
    
    // 调试信息已移除
    // 如果容器还没有被插入到DOM中
    if (!this.container.parentNode) {
      if (targetElement) {
        panelContainer.insertBefore(this.container, targetElement);
      } else {
        // 兜底方案：直接插入到面板容器底部
        insertNode(panelContainer, this.container);
      }
      return;
    }
    
    // 如果容器已经在DOM中，检查位置是否正确
    if (targetElement && this.container.parentNode === panelContainer) {
      // 检查当前容器是否在正确位置
      const currentIndex = Array.from(panelContainer.children).indexOf(this.container);
      const targetIndex = Array.from(panelContainer.children).indexOf(targetElement);
      
      // 如果容器在目标元素之前，说明位置正确
      if (currentIndex < targetIndex) {
        return;
      }
      
      // 如果位置不正确，移动容器
      panelContainer.insertBefore(this.container, targetElement);
    }
  }

  bindEvents() {
   
    this.predefineItems.forEach((item, index) => {
      const colorData = this.options.predefineColor![index];
      const { color, disabled } = this.parseColorData(colorData);

      if (disabled) {
        addClass(item, 'ew-color-picker-predefine-color-disabled');
        return;
      }

      // 点击事件
      on(item, 'click', (event: Event) => {
        this.debouncedOnPredefineColorClick(event, color);
      });

      // 失焦事件
      on(item, 'blur', (event: Event) => {
        removeClass(event.target as HTMLElement, 'ew-color-picker-predefine-color-active');
      });
    });
  }

  onPredefineColorClick(event: Event, color: string) {
    const clickTarget = event.target as HTMLElement;
    let target = clickTarget;

    // 如果点击的是子元素，找到父级的预定义颜色容器
    if (!hasClass(target, 'ew-color-picker-predefine-color')) {
      target = target.closest('.ew-color-picker-predefine-color') as HTMLElement || target;
    }
    
    // 检查是否被禁用
    if (hasClass(target, 'ew-color-picker-predefine-color-disabled')) {
      return; // 如果被禁用，直接返回，不执行任何操作
    }
    
    // 添加激活状态
    addClass(target, 'ew-color-picker-predefine-color-active');
    
    // 移除其他项的激活状态
    this.predefineItems.forEach(item => {
      if (item !== target) {
        removeClass(item, 'ew-color-picker-predefine-color-active');
      }
    });

    // 验证颜色格式
    if (!isValidColor(color)) {
      warn(`[ewColorPicker warning]: Invalid predefine color: ${color}`);
      return;
    }

    // 转换颜色格式
    const rgbaColor = colorToRgba(color);
    
    // 更新HSV颜色
    this.ewColorPicker.hsvaColor = colorRgbaToHsva(rgbaColor);
    
    // 更新当前颜色
    this.ewColorPicker.updateColor(rgbaColor);
    
    // 触发颜色改变回调
    if (isFunction(this.options.changeColor)) {
      this.options.changeColor?.(rgbaColor);
    }
  }

  updatePredefineColors(colors: string[] | PredefineColor[]) {
    this.options.predefineColor = colors;
    
    // 重新渲染
    this.predefineItems = [];
    this.render();
    this.bindEvents();
  }

  setDisabled(index: number, disabled: boolean) {
    if (this.predefineItems[index]) {
      if (disabled) {
        addClass(this.predefineItems[index], 'ew-color-picker-predefine-color-disabled');
      } else {
        removeClass(this.predefineItems[index], 'ew-color-picker-predefine-color-disabled');
      }
    }
  }

  destroy() {
    // 清理预定义色块的事件监听器
    this.predefineItems.forEach(item => {
      off(item, 'click', this.debouncedOnPredefineColorClick as unknown as EventListener);
      off(item, 'blur', () => {});
    });
    
    // 清理面板切换事件监听器
    if (this.isEventBound && this.toggleHandler) {
      this.ewColorPicker.off('toggle', this.toggleHandler);
      this.toggleHandler = null;
      this.isEventBound = false;
    }
    
    // 清理DOM引用
    this.predefineItems = [];
    this.container = null;
  }

  // 新增 install 方法，便于测试
  install(core: ewColorPicker) {
    this.ewColorPicker = core;
    this.handleOptions();
    
    // 注册事件监听器
    if (core.on && typeof core.on === 'function') {
      core.on('change', (color: string) => {
        // 当颜色改变时，可以更新预定义颜色的激活状态
        this.updateActivePredefineColor(color);
      });
    }
    
    this.run?.();
  }
  
  // 更新激活的预定义颜色
  private updateActivePredefineColor(color: string) {
    this.predefineItems.forEach((item, index) => {
      const colorData = this.options.predefineColor![index];
      const { color: itemColor } = this.parseColorData(colorData);
      
      if (itemColor === color) {
        addClass(item, 'ew-color-picker-predefine-color-active');
      } else {
        removeClass(item, 'ew-color-picker-predefine-color-active');
      }
    });
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerPredefine: PredefineOptions;
  }
} 