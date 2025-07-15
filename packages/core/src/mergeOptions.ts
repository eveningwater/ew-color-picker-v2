import {
  checkContainer,
  extend,
  isShallowObject,
  isString,
} from "@ew-color-picker/utils";

// 定义类型接口，避免循环导入
export interface WrapperElement extends HTMLElement {
  isEwColorPickerContainer?: boolean;
}

export interface ewColorPickerConstructorOptions {
  el: WrapperElement | string;
  [key: string]: any;
}

export interface PredefineColor {
  color: string;
  disabled?: boolean;
}

export interface ewColorPickerOptions {
  el: WrapperElement;
  hasBox?: boolean;
  hue?: boolean;
  alpha?: boolean;
  disabled?: boolean;
  predefineColor?: PredefineColor | string [];
  size?: string;
  defaultColor?: string;
  isLog?: boolean;
  hasClear?: boolean;
  hasSure?: boolean;
  hasInput?: boolean;
  boxDisabled?: boolean;
  isClickOutside?: boolean;
  openChangeColorMode?: boolean;
  boxBgColor?: boolean;
  hueDirection?: string;
  alphaDirection?: string;
  lang?: string;
  userDefineText?: boolean;
  clearText?: string;
  sureText?: string;
  togglePickerAnimation?: string;
  pickerAnimationTime?: number;
  autoPanelPosition?: boolean;
  panelPlacement?: 'top-start' | 'top' | 'top-end' | 'left-start' | 'left' | 'left-end' | 'right-start' | 'right' | 'right-end' | 'bottom-start' | 'bottom' | 'bottom-end';
  sure?: Function;
  clear?: Function;
  togglePicker?: Function;
  changeColor?: Function;
  [key: string]: any;
}

export const defaultConfig: Omit<ewColorPickerOptions, "el"> = {
  hasBox: true,
  hue: true,
  alpha: false,
  disabled: false,
  predefineColor: [],
  size: "normal",
  defaultColor: "",
  isLog: true,
  hasClear: true,
  hasSure: true,
  hasInput: true,
  boxDisabled: false,
  isClickOutside: true,
  openChangeColorMode: false,
  boxBgColor: false,
  hueDirection: "vertical",
  alphaDirection: "vertical",
  lang: "zh",
  userDefineText: false,
  clearText: "清空",
  sureText: "确定",
  togglePickerAnimation: "default",
  pickerAnimationTime: 200,
  autoPanelPosition: false,
  panelPlacement: "bottom",
  sure: () => {},
  clear: () => {},
  togglePicker: () => {},
  changeColor: () => {},
};

export interface ewColorPickerCustomOptions {}
export class CustomOptions {}
export interface ewColorPickerMountedElement extends HTMLElement {
  isEwColorPickerContainer?: boolean;
}
export interface ewColorPickerMergeOptionsData
  extends Omit<ewColorPickerOptions, "el">,
    ewColorPickerCustomOptions {
  el: ewColorPickerMountedElement;
  [key: string]: any;
}

export interface ewColorPickerBindPluginOptions {
  [k: string]: any;
}
export default class ewColorPickerMergeOptions
  extends CustomOptions
  implements ewColorPickerMergeOptionsData
{
  [
    k: string
  ]: ewColorPickerMergeOptionsData[keyof ewColorPickerMergeOptionsData];
  el = document.body;
  constructor() {
    super();
  }
  merge(
    options?: ewColorPickerConstructorOptions | string,
    pluginNameProp?: ewColorPickerBindPluginOptions
  ): ewColorPickerOptions {
    let result: any;
    
    // 处理字符串选择器的情况
    if (isString(options)) {
      const el = checkContainer(options as string);
      result = extend({}, defaultConfig, {
        el,
        ...pluginNameProp,
      });
    }
    // 处理对象配置的情况
    else if (isShallowObject(options)) {
      // 检查是否包含 el 属性
      if ('el' in (options as any)) {
      const { el, ...other } = options as ewColorPickerOptions;
        console.log('[ewColorPicker merge] options with el:', options, 'el:', el);
        result = extend({}, defaultConfig, {
        el: checkContainer(el),
        ...other,
        ...pluginNameProp,
      });
      } else {
        // 如果没有 el 属性，说明第一个参数是容器，第二个参数是选项
        console.log('[ewColorPicker merge] options without el:', options);
        result = extend({}, defaultConfig, {
          el: document.body, // 这里会被后续的 pluginNameProp 覆盖
          ...(options as Record<string, any>),
          ...pluginNameProp,
        });
      }
    }
    // 处理空值或未定义的情况
    else {
      result = extend({}, defaultConfig, {
        el: document.body,
        ...pluginNameProp,
      });
    }
    return result;
  }
  bindOptions(
    options?: ewColorPickerConstructorOptions | string,
    pluginNameProp: ewColorPickerBindPluginOptions = {}
  ) {
    const mergeOptions = this.merge(options, pluginNameProp);
    for (const k in mergeOptions) {
      const value = mergeOptions[k as keyof ewColorPickerOptions];
      this[k] = value;
    }
    return this;
  }
}
