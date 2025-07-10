import {
  checkContainer,
  extend,
  isShallowObject,
} from "@ew-color-picker/utils";

// 定义类型接口，避免循环导入
export interface WrapperElement extends HTMLElement {
  isEwColorPickerContainer?: boolean;
}

export interface ewColorPickerConstructorOptions {
  el: WrapperElement | string;
  [key: string]: any;
}

export interface ewColorPickerOptions {
  el: WrapperElement;
  hasBox?: boolean;
  hue?: boolean;
  alpha?: boolean;
  disabled?: boolean;
  predefineColor?: any[];
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
    options?: ewColorPickerConstructorOptions,
    pluginNameProp?: ewColorPickerBindPluginOptions
  ): ewColorPickerOptions {
    let result: any;
    if (isShallowObject(options)) {
      const { el, ...other } = options as ewColorPickerOptions;
      result = extend(defaultConfig, {
        el: checkContainer(el),
        ...other,
        ...pluginNameProp,
      });
    } else {
      result = extend({
        ...defaultConfig,
        el: checkContainer(options as unknown as WrapperElement),
        ...pluginNameProp,
      });
    }
    // 自动补全 hue/alpha 插件 key
    if (result.hue && !result.ewColorPickerHue) {
      result.ewColorPickerHue = {};
    }
    if (result.alpha && !result.ewColorPickerAlpha) {
      result.ewColorPickerAlpha = {};
    }
    return result;
  }
  bindOptions(
    options: ewColorPickerConstructorOptions,
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
