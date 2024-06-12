import {
  WrapperElement,
  ewColorPickerConstructorOptions,
  ewColorPickerOptions,
} from ".";
import {
  checkContainer,
  extend,
  isShallowObject,
  warn,
} from "@ew-color-picker/utils";

export const defaultConfig: Omit<ewColorPickerOptions, "el"> = {
  hasBox: true,
  hue: true,
  alpha: false,
  disabled: false,
  predefineColor: [],
  size: "normal",
  defaultColor: "",
  isLog: true,
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
    if (isShallowObject(options)) {
      const { el, ...other } = options as ewColorPickerOptions;
      return extend(defaultConfig, {
        el: checkContainer(el),
        ...other,
        ...pluginNameProp,
      });
    } else {
      return extend({
        ...defaultConfig,
        el: checkContainer(options as WrapperElement),
        ...pluginNameProp,
      });
    }
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
