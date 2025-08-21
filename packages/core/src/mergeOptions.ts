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

export interface ewColorPickerConstructorOptions extends ewColorPickerOptions {
  el?: WrapperElement | string;
}

export interface PredefineColor {
  color: string;
  disabled?: boolean;
}

export interface ewColorPickerOptions {
  el?: WrapperElement;
  disabled?: boolean;
  predefineColor?: PredefineColor | string [];
  size?: string;
  defaultColor?: string;
  isClickOutside?: boolean;
  hueDirection?: string;
  alphaDirection?: string;
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
  disabled: false,
  predefineColor: [],
  size: "normal",
  defaultColor: "",
  isClickOutside: true,
  hueDirection: "vertical",
  alphaDirection: "vertical",
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
  container = document.body;
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
      const container = checkContainer(options as string);
      result = extend({}, defaultConfig, {
        container,
        ...pluginNameProp,
      });
    }
    // 处理对象配置的情况
    else if (isShallowObject(options)) {
      // 检查是否包含 container 属性
      if ('container' in (options as any)) {
        const { container, ...other } = options as ewColorPickerOptions;
        result = extend({}, defaultConfig, {
          container: checkContainer(container),
          ...other,
          ...pluginNameProp,
        });
      } else {
        // 如果没有 container 属性，说明第一个参数是容器，第二个参数是选项
        result = extend({}, defaultConfig, {
          container: document.body, // 这里会被后续的 pluginNameProp 覆盖
          ...(options as Record<string, any>),
          ...pluginNameProp,
        });
      }
    }
    // 处理空值或未定义的情况
    else {
      result = extend({}, defaultConfig, {
        container: document.body,
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
