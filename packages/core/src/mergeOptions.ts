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
export interface ewColorPickerMergeOptionsData
  extends Partial<ewColorPickerOptions>,
    ewColorPickerCustomOptions {
  [key: string]: any;
}
export default class ewColorPickerMergeOptions
  extends CustomOptions
  implements ewColorPickerMergeOptionsData
{
  [
    k: string
  ]: ewColorPickerMergeOptionsData[keyof ewColorPickerMergeOptionsData];
  constructor() {
    super();
  }
  merge(options?: ewColorPickerConstructorOptions): ewColorPickerOptions {
    if (isShallowObject(options)) {
      const { el, ...other } = options as ewColorPickerOptions;
      return extend(defaultConfig, {
        el: checkContainer(el),
        ...other,
      });
    } else {
      return extend({
        ...defaultConfig,
        el: checkContainer(options as WrapperElement),
      });
    }
  }
  bindOptions(options: ewColorPickerConstructorOptions) {
    if (!isShallowObject(options)) {
      return this;
    }
    const mergeOptions = this.merge(options);
    for (const k in mergeOptions) {
      const value = mergeOptions[k as keyof ewColorPickerOptions];
      this[k] = value;
    }
    return this;
  }
}
