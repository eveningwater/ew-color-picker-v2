

import {
  isNull,
  ApplyOrder,
  warn,
  isUndefined,
  isFunction,
  EventEmitter,
  open,
  close,
  getAnimationType,
  create,
  setAttr,
  setStyle,
  removeElement,
  insertNode,
  on,
  off,
  tryErrorHandler,
  extend,
  calculatePanelPosition,
  getRect,
  addClass,
  colorRgbaToHsva,
  colorHsvaToRgba,
  colorRgbaToHex,
  colorToRgba,
} from "@ew-color-picker/utils";
import ewColorPickerMergeOptions, {
  ewColorPickerMergeOptionsData,
  ewColorPickerMountedElement,
  ewColorPickerOptions,
  ewColorPickerConstructorOptions,
  WrapperElement,
  defaultConfig,
} from "./mergeOptions";

// 插件构造函数接口
export interface ewColorPickerPluginCtor {
  pluginName: string;
  applyOrder?: ApplyOrder;
  new (instance: ewColorPicker): ewColorPickerPlugin;
}

// 插件接口
export interface ewColorPickerPlugin {
  destroy?: () => void;
  [key: string]: any;
}

// 插件注册项接口
export interface ewColorPickerPluginItem {
  ctor: ewColorPickerPluginCtor;
  name: string;
  applyOrder?: ApplyOrder.Post | ApplyOrder.Pre;
}

// 插件实例集合
export interface ewColorPickerPluginInstances {
  [name: string]: ewColorPickerPlugin;
}

// 尺寸类型
export interface SizeType {
  width: string | number;
  height: string | number;
}

// 颜色类型定义
export interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// 重新导出类型
export { ewColorPickerOptions, ewColorPickerConstructorOptions, WrapperElement };

// 插件挂载点顺序枚举
export enum PluginMountOrder {
  CONSOLE = 0,       // 控制台日志 - 最优先（用于调试）
  BOX = 1,           // 颜色盒子 - 最外层容器
  PANEL = 2,         // 颜色面板 - 核心选择区域
  HUE = 3,           // 色相滑块 - 颜色选择组件
  ALPHA = 4,         // 透明度滑块 - 颜色选择组件
  INPUT = 5,         // 输入框 - 颜色值输入
  BUTTON = 6,        // 按钮 - 确定/清除按钮
  PREDEFINE = 7,     // 预定义颜色 - 预设颜色列表
  COLOR_MODE = 8,     // 颜色模式切换 - 最后（在按钮区域）
}

// 默认插件配置
const DEFAULT_PLUGINS = {
  ewColorPickerConsole: true,
  ewColorPickerBox: true,
  ewColorPickerPanel: true,
  ewColorPickerInput: true,
  ewColorPickerButton: true,
  ewColorPickerPredefine: true,
  ewColorPickerColorMode: true, // 保持插件名不变，便于兼容
  ewColorPickerHue: true,
  ewColorPickerAlpha: true,
} as const;

// 挂载点名称映射
const MOUNT_ORDER_MAP: Record<string, number> = {
  'ewColorPickerConsole': PluginMountOrder.CONSOLE,
  'ewColorPickerBox': PluginMountOrder.BOX,
  'ewColorPickerPanel': PluginMountOrder.PANEL,
  'ewColorPickerHue': PluginMountOrder.HUE,
  'ewColorPickerAlpha': PluginMountOrder.ALPHA,
  'ewColorPickerInput': PluginMountOrder.INPUT,
  'ewColorPickerButton': PluginMountOrder.BUTTON,
  'ewColorPickerPredefine': PluginMountOrder.PREDEFINE,
  'ewColorPickerColorMode': PluginMountOrder.COLOR_MODE,
};

// 应用顺序映射
const APPLY_ORDER_MAP = {
  [ApplyOrder.Pre]: -1,
  [ApplyOrder.Post]: 1,
} as const;

// 事件类型
const EVENT_TYPES = ["destroy", "change", "sure", "clear", "toggle", "optionsUpdate", "modeChange"];

// 默认动画时间
const DEFAULT_ANIMATION_TIME = 200;

export default class ewColorPicker extends EventEmitter {
  // 静态属性
  static plugins: ewColorPickerPluginItem[] = [];
  static pluginsMap: Record<string, boolean> = {};

  // 实例属性
  plugins: ewColorPickerPluginInstances;
  options: ewColorPickerMergeOptionsData;
  wrapper: ewColorPickerMountedElement;
  hooks: EventEmitter;
  
  // 核心属性
  hsvaColor: HsvaColor;
  currentColor: string;
  panelWidth: number;
  panelHeight: number;
  panelLeft: number;
  panelTop: number;
  isHueHorizontal: boolean;
  isAlphaHorizontal: boolean;
  colorMode: readonly string[];
  currentMode: string;
  modeCount: number;
  pickerFlag: boolean;
  _color_picker_uid: string;
  
  // 插件挂载点管理
  private mountPoints: Map<string, HTMLElement> = new Map();
  
  // 事件处理状态
  private isDestroyed: boolean = false;

  // 插件注册方法
  static use(ctor: ewColorPickerPluginCtor): typeof ewColorPicker {
    const { pluginName } = ctor;
    
    // 检查插件是否已安装
    if (ewColorPicker.plugins.some(plugin => ctor === plugin.ctor)) {
      return ewColorPicker;
    }
    
    // 验证插件名称
    if (isUndefined(pluginName) || isNull(pluginName)) {
      warn('[ewColorPicker warning]: Plugin Class must specify plugin\'s name in static property by \'pluginName\' field.');
      return ewColorPicker;
    }
    
    // 注册插件
    ewColorPicker.pluginsMap[pluginName] = true;
    ewColorPicker.plugins.push({
      name: pluginName,
      applyOrder: ctor.applyOrder,
      ctor,
    });
    
    return ewColorPicker;
  }

  constructor(options?: ewColorPickerConstructorOptions | string | HTMLElement, secondOptions?: Record<string, any>) {
    super(EVENT_TYPES);
    
    // 处理 new EWColorPicker(container, options) 的调用方式
    let finalOptions: ewColorPickerConstructorOptions | string;
    if (options instanceof HTMLElement) {
      if (secondOptions) {
        // 第一个参数是容器，第二个参数是选项
        finalOptions = {
          el: options,
          ...secondOptions
        };
      } else {
        // 只有一个参数，且是 HTMLElement，将其作为容器
        finalOptions = {
          el: options
        };
      }
    } else {
      // 第一个参数是选项或字符串选择器
      finalOptions = options as ewColorPickerConstructorOptions | string;
    }
    
    // 初始化配置
    this.options = new ewColorPickerMergeOptions().bindOptions(finalOptions, DEFAULT_PLUGINS);
    
    // 不设置默认颜色，让用户决定是否传递 defaultColor
    // 只有在打开面板时才需要默认颜色
    
    // 初始化实例
    this.init();
  }

  private init(): void {
    tryErrorHandler(() => {
      // 确保 el 属性存在
      if (!this.options.el) {
        console.warn('ewColorPicker: el is not defined, using document.body');
        this.options.el = document.body;
      }
      
      this.plugins = {};
      this.hooks = new EventEmitter([""]);
      this._color_picker_uid = this.generateUID();
      
      this.initCoreProperties();
      this.createMountPoints();
      this.applyPlugins();
    });
  }

  private initCoreProperties(): void {
    this.hsvaColor = { h: 0, s: 100, v: 100, a: 1 };
    
    // 如果没有设置默认颜色，则不设置 currentColor
    if (this.options.defaultColor) {
      let defaultColor = this.options.defaultColor;
      
      // 如果开启了 alpha 配置，需要转换为 rgba 格式
      if (this.options.alpha) {
        // 如果默认颜色是 hex 格式，先转换为 rgba 格式
        if (defaultColor.startsWith('#')) {
          defaultColor = colorToRgba(defaultColor);
        }
      } else {
        // 如果没有开启 alpha，确保是 hex 格式
        if (defaultColor.startsWith('rgba')) {
          defaultColor = colorRgbaToHex(defaultColor);
        }
      }
      
      this.currentColor = defaultColor;
    } else {
      // 没有默认颜色时，设置为空字符串
      this.currentColor = '';
    }
    this.panelWidth = 0;
    this.panelHeight = 0;
    this.panelLeft = 0;
    this.panelTop = 0;
    this.isHueHorizontal = this.options.hueDirection === 'horizontal';
    this.isAlphaHorizontal = this.options.alphaDirection === 'horizontal';
    this.colorMode = ['HSV', 'HSL'] as const;
    this.currentMode = 'HSV';
    this.modeCount = 0;
    this.pickerFlag = false;
  }

  private createMountPoints(): void {
    // 创建主容器
    const rootElement = create('div');
    setAttr(rootElement, {
      class: 'ew-color-picker',
      'data-uid': this._color_picker_uid
    });
    insertNode(this.options.el, rootElement);

    // 设置 wrapper 为创建的主容器
    this.wrapper = rootElement;
    this.wrapper.isEwColorPickerContainer = true;

    // 创建面板容器（默认隐藏）
    const panelContainer = create('div');
    setAttr(panelContainer, { class: 'ew-color-picker-panel-container' });
    addClass(panelContainer, 'ew-color-picker-panel-container-hidden');
    insertNode(rootElement, panelContainer);

    // 设置挂载点
    this.mountPoints.set('root', rootElement);
    this.mountPoints.set('panelContainer', panelContainer);
  }

  // 获取插件挂载点
  public getMountPoint(pluginName: string): HTMLElement | undefined {
    if (this.isDestroyed) return undefined;
    return this.mountPoints.get(pluginName);
  }

  // 显示面板
  public showPanel(animationType?: string, duration?: number): void {
    if (this.isDestroyed) return;
    
    const panelContainer = this.mountPoints.get('panelContainer');
    if (!panelContainer) return;

    // 如果当前没有颜色，且没有设置默认颜色，则设置默认的红色
    if (!this.currentColor) {
      let defaultColor = this.options.defaultColor || '#ff0000';
      
      // 如果开启了 alpha 配置，转换为 rgba 格式
      if (this.options.alpha) {
        defaultColor = colorToRgba(defaultColor);
      }
      
      this.currentColor = defaultColor;
      this.hsvaColor = colorRgbaToHsva(defaultColor);
    }

    const type = animationType || getAnimationType(this);
    const time = duration || this.options.pickerAnimationTime || DEFAULT_ANIMATION_TIME;
    
    // 自动定位逻辑已移到 panel 插件中
    
    open(type, panelContainer, time).then(() => {
      this.pickerFlag = true;
      this.trigger('toggle', true);
      
      // 优化：合并嵌套的 setTimeout
      setTimeout(() => {
        this.plugins.ewColorPickerPanel.handleAutoPosition();
        on(document, 'mousedown', this._onDocumentClick, { capture: true });
      }, 0);
    }).catch(error => {
      warn(`[ewColorPicker error]: Failed to show panel: ${error}`);
    });
  }

  // 隐藏面板
  public hidePanel(animationType?: string, duration?: number): void {
    if (this.isDestroyed) return;
    
    const panelContainer = this.mountPoints.get('panelContainer');
    if (!panelContainer) return;

    const type = animationType || getAnimationType(this);
    const time = duration || this.options.pickerAnimationTime || DEFAULT_ANIMATION_TIME;
    
    close(type, panelContainer, time).then(() => {
      if (this.isDestroyed) return;
      
      // 重置自动定位样式
      if (this.options.autoPanelPosition && this.options.hasBox) {
        setStyle(panelContainer, {
          position: 'absolute',
          left: '0',
          top: '100%',
          visibility: 'visible'
        });
      }
      
      this.pickerFlag = false;
      this.trigger('toggle', false);
      off(document, 'mousedown', this._onDocumentClick, { capture: true });
    }).catch(error => {
      warn(`[ewColorPicker error]: Failed to hide panel: ${error}`);
    });
  }

  // 点击外部关闭面板
  private _onDocumentClick = (e: Event): void => {
    if (this.isDestroyed || !this.options.isClickOutside) return;
    
    const panelContainer = this.mountPoints.get('panelContainer');
    const rootElement = this.mountPoints.get('root');
    
    // 检查点击目标
    const target = e.target as Node;
    
    // 如果点击的是面板内部，不关闭
    if (panelContainer && panelContainer.contains(target)) return;
    
    // 如果点击的是颜色盒子，不关闭（避免与盒子切换逻辑冲突）
    const colorBox = rootElement?.querySelector('.ew-color-picker-box');
    if (colorBox && colorBox.contains(target)) return;
    
    // 点击面板和盒子之外的区域，关闭面板
    // 使用配置中的动画类型和动画时间
    const { togglePickerAnimation, pickerAnimationTime } = this.options;
    this.hidePanel(togglePickerAnimation, pickerAnimationTime);
  };

  private generateUID(): string {
    return `ew-color-picker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private applyPlugins(): void {
    // 按优先级排序插件
    const sortedPlugins = [...ewColorPicker.plugins].sort((a, b) => {
      // 首先按应用顺序排序
      const aOrder = a.applyOrder ? APPLY_ORDER_MAP[a.applyOrder] : 0;
      const bOrder = b.applyOrder ? APPLY_ORDER_MAP[b.applyOrder] : 0;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // 然后按挂载点顺序排序
      const aMountOrder = MOUNT_ORDER_MAP[a.name] || 999;
      const bMountOrder = MOUNT_ORDER_MAP[b.name] || 999;
      
      return aMountOrder - bMountOrder;
    });

    // 检测插件依赖和注入状态
    this.checkPluginDependencies();

    // 实例化插件
    sortedPlugins.forEach(({ ctor, name }) => {
      tryErrorHandler(() => {
        if (this.options[name] && isFunction(ctor)) {
          this.plugins[name] = new ctor(this);
        }
      });
    });
  }

  // 检测插件依赖和注入状态
  private checkPluginDependencies(): void {
    // 插件依赖关系配置
    const pluginDependencies: Record<string, string[]> = {
      // hue 插件依赖
      hue: ['ewColorPickerHue'],
      // alpha 插件依赖
      alpha: ['ewColorPickerAlpha'],
      // panel 插件依赖
      panel: ['ewColorPickerPanel'],
      // input 插件依赖
      input: ['ewColorPickerInput'],
      // input-number 插件依赖
      inputNumber: ['ewColorPickerInputNumber'],
      // button 插件依赖
      button: ['ewColorPickerButton'],
      // predefine 插件依赖
      predefine: ['ewColorPickerPredefine'],
      // color-mode 插件依赖
      colorMode: ['ewColorPickerColorMode'],
      // box 插件依赖
      box: ['ewColorPickerBox'],
      // console 插件依赖
      console: ['ewColorPickerConsole'],
    };

    // 检查每个配置项对应的插件是否已注入
    Object.entries(pluginDependencies).forEach(([configKey, requiredPlugins]) => {
      // 检查配置是否开启
      if (this.options[configKey]) {
        requiredPlugins.forEach(pluginName => {
          // 检查插件是否已注册
          if (!ewColorPicker.pluginsMap[pluginName]) {
            warn(`[ewColorPicker warning]: Plugin '${pluginName}' is required but not injected. Please use ewColorPicker.use(${pluginName}) to register the plugin.`);
          }
        });
      }
    });

    // 检查特定功能的插件依赖
    this.checkSpecificFeatureDependencies();
  }

  // 检查特定功能的插件依赖
  private checkSpecificFeatureDependencies(): void {
    // 检查 hue 方向配置
    if (this.options.hueDirection && !ewColorPicker.pluginsMap['ewColorPickerHue']) {
      warn('[ewColorPicker warning]: hueDirection is configured but ewColorPickerHue plugin is not injected. Please use ewColorPicker.use(HuePlugin) to register the plugin.');
    }

    // 检查 alpha 方向配置
    if (this.options.alphaDirection && !ewColorPicker.pluginsMap['ewColorPickerAlpha']) {
      warn('[ewColorPicker warning]: alphaDirection is configured but ewColorPickerAlpha plugin is not injected. Please use ewColorPicker.use(AlphaPlugin) to register the plugin.');
    }

    // 检查预定义颜色配置
    if (this.options.predefineColor && this.options.predefineColor.length > 0 && !ewColorPicker.pluginsMap['ewColorPickerPredefine']) {
      warn('[ewColorPicker warning]: predefineColor is configured but ewColorPickerPredefine plugin is not injected. Please use ewColorPicker.use(PredefinePlugin) to register the plugin.');
    }

    // 检查输入框配置
    if (this.options.hasInput && !ewColorPicker.pluginsMap['ewColorPickerInput']) {
      warn('[ewColorPicker warning]: hasInput is enabled but ewColorPickerInput plugin is not injected. Please use ewColorPicker.use(InputPlugin) to register the plugin.');
    }

    // 检查按钮配置
    if ((this.options.hasClear || this.options.hasSure) && !ewColorPicker.pluginsMap['ewColorPickerButton']) {
      warn('[ewColorPicker warning]: hasClear or hasSure is enabled but ewColorPickerButton plugin is not injected. Please use ewColorPicker.use(ButtonPlugin) to register the plugin.');
    }

    // 检查颜色模式切换配置
    if (this.options.openChangeColorMode && !ewColorPicker.pluginsMap['ewColorPickerColorMode']) {
      warn('[ewColorPicker warning]: openChangeColorMode is enabled but ewColorPickerColorMode plugin is not injected. 请使用 ewColorPicker.use(ColorModePlugin) 注册 color-mode 插件。');
    }

    // 检查颜色模式切换配置下的 input-number 插件依赖
    if (this.options.openChangeColorMode && !ewColorPicker.pluginsMap['ewColorPickerInputNumber']) {
      warn('[ewColorPicker warning]: openChangeColorMode is enabled but ewColorPickerInputNumber plugin is not injected. color-mode 插件依赖 InputNumber 插件。请使用 ewColorPicker.use(InputNumberPlugin) 注册。');
    }

    // 检查盒子配置
    if (this.options.hasBox && !ewColorPicker.pluginsMap['ewColorPickerBox']) {
      warn('[ewColorPicker warning]: hasBox is enabled but ewColorPickerBox plugin is not injected. Please use ewColorPicker.use(BoxPlugin) to register the plugin.');
    }

    // 检查面板配置
    if (this.options.hasPanel && !ewColorPicker.pluginsMap['ewColorPickerPanel']) {
      warn('[ewColorPicker warning]: hasPanel is enabled but ewColorPickerPanel plugin is not injected. Please use ewColorPicker.use(PanelPlugin) to register the plugin.');
    }
  }

  // 更新现有插件的配置
  private updateExistingPlugins(): void {
    if (this.plugins) {
    Object.values(this.plugins).forEach((plugin) => {
      tryErrorHandler(() => {
        if (plugin?.updateOptions && isFunction(plugin.updateOptions)) {
          plugin.updateOptions();
        }
      });
    });
    }
  }

  // 公共方法
  public updateColor(color: string): void {
    if (this.isDestroyed) return;
    
    this.currentColor = color;
    this.hooks.trigger('change', color);
  }

  // 更新配置并重新渲染
  public updateOptions(newOptions: Record<string, any>): void {
    if (this.isDestroyed) return;
    
    // 保存原有的 el 属性
    const originalEl = this.options.el;
    
    // 合并新配置
    this.options = extend({}, this.options, newOptions) as ewColorPickerMergeOptionsData;
    
    // 确保 el 属性不被覆盖
    this.options.el = originalEl;
    
    // 重新应用插件
    this.reapplyPlugins();
    
    // 触发配置更新事件
    this.trigger('optionsUpdate', this.options);
  }

  // 重新应用插件
  private reapplyPlugins(): void {
    // 更新现有插件的配置
    this.updateExistingPlugins();
  }

  public openPicker(): void {
    this.showPanel();
  }

  public closePicker(): void {
    this.hidePanel();
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // 解绑外部点击事件
    off(document, 'mousedown', this._onDocumentClick, { capture: true });
    
    // 销毁所有插件
    if (this.plugins) {
    Object.values(this.plugins).forEach((plugin) => {
      tryErrorHandler(() => {
        if (plugin?.destroy && isFunction(plugin.destroy)) {
          plugin.destroy();
        }
      });
    });
    }
    
    // 清理所有挂载点
    this.mountPoints.forEach(el => {
      tryErrorHandler(() => {
        removeElement(el);
      });
    });
    this.mountPoints.clear();
    
    // 清理主容器
    tryErrorHandler(() => {
      removeElement(this.wrapper);
    });
    
    // 清理插件引用
    this.plugins = {};
    
    // 触发销毁事件
    this.trigger('destroy');
  }

  public setColor(color: string): void {
    // 更新当前颜色
    this.currentColor = color;
    
    // 更新 HSVA 颜色值
    if (color) {
      this.hsvaColor = colorRgbaToHsva(color);
    }
    
    // 触发颜色变化事件
    this.trigger('change', color);
  }

  public getColor(): string {
    return this.currentColor;
  }

  public getHsvaColor(): HsvaColor {
    return { ...this.hsvaColor };
  }

  public setHsvaColor(hsva: HsvaColor): void {
    this.hsvaColor = { ...hsva };
  }
  
  // 检查实例是否已销毁
  public getDestroyedStatus(): boolean {
    return this.isDestroyed;
  }

  // 添加测试用例期望的方法
  public use(plugin: any): ewColorPicker {
    if (plugin && typeof plugin.install === 'function') {
      plugin.install(this);
    }
    return this;
  }

  public emit(event: string, ...args: any[]): void {
    this.trigger(event, ...args);
  }

  public on(type: string, fn: Function, context?: Object): this {
    super.on(type, fn, context);
    return this;
  }

  public off(type?: string, fn?: Function): this | undefined {
    super.off(type, fn);
    return this;
  }

  public getContainer(): HTMLElement {
    return this.options.el;
  }

  public getOptions(): ewColorPickerMergeOptionsData {
    return this.options;
  }
}
