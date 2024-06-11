import { WrapperElement, ewColorPickerConstructorOptions, ewColorPickerOptions } from ".";
import { checkContainer, extend, isShallowObject } from '@ew-color-picker/utils';

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
export interface CustomOptions { }
export class CustomOptions { };
export interface ewColorPickerMergeOptionsData extends Partial<ewColorPickerOptions>, CustomOptions {
    [key: string]: any
}
export default class ewColorPickerMergeOptions extends CustomOptions implements ewColorPickerMergeOptionsData {
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
}