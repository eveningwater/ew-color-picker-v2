import { isNull, ApplyOrder, warn, isUndefined, isFunction } from '@ew-color-picker/utils';
import ewColorPickerMergeOptions, { ewColorPickerMergeOptionsData } from './mergeOptions';
export interface ewColorPickerPluginCtor {
    pluginName: string;
    applyOrder?: ApplyOrder;
    new(instance: ewColorPicker): any
}

export interface ewColorPickerPlugin {
    ctor: ewColorPickerPluginCtor;
    name: string;
    applyOrder?: ApplyOrder.Post | ApplyOrder.Pre;
}


export interface SizeType {
    width: string | number;
    height: string | number;
}
export type WrapperElement = string | HTMLElement;
export type ewColorPickerOptions = {
    el: WrapperElement;
    alpha?: boolean;
    hue?: boolean;
    size?: string | Partial<SizeType>;
    predefineColor?: string[];
    disabled?: boolean;
    defaultColor?: string;
    togglePickerAnimation?: string;
    sure?: Function;
    clear?: Function;
    isLog?: boolean;
    togglePicker?: Function;
    hasBox?: boolean;
    boxNoColorIcon?: string;
    boxHasColorIcon?: string;
};

export type ewColorPickerConstructorOptions = WrapperElement | ewColorPickerOptions;

export interface ewColorPickerPluginItem {
    [name: string]: ewColorPicker
}
export default class ewColorPicker {
    static plugins: ewColorPickerPlugin[];
    plugins: ewColorPickerPluginItem;
    options: ewColorPickerMergeOptionsData;
    static pluginsMap: Record<string, boolean> = {};
    wrapper: WrapperElement | undefined;
    static use(ctor: ewColorPickerPluginCtor) {
        const name = ctor.pluginName
        const installed = ewColorPicker.plugins.some(
            plugin => ctor === plugin.ctor
        )
        if (installed) return ewColorPicker
        if ((isUndefined(name) || isNull(name) && __DEV__)) {
            warn(
                `Plugin Class must specify plugin's name in static property by 'pluginName' field.`
            )
            return ewColorPicker
        }
        ewColorPicker.pluginsMap[name] = true
        ewColorPicker.plugins.push({
            name,
            applyOrder: ctor.applyOrder,
            ctor
        })
        return ewColorPicker
    }
    constructor(options: ewColorPickerConstructorOptions) {
        this.options = new ewColorPickerMergeOptions().merge(options);
        this.init();
    }
    private init() {
        this.wrapper = this.options.el;
        this.applyPlugins();
    }
    private applyPlugins() {
        const options = this.options
        ewColorPicker.plugins
            .sort((a, b) => {
                const applyOrderMap = {
                    [ApplyOrder.Pre]: -1,
                    [ApplyOrder.Post]: 1
                }
                const aOrder = a.applyOrder ? applyOrderMap[a.applyOrder] : 0
                const bOrder = b.applyOrder ? applyOrderMap[b.applyOrder] : 0
                return aOrder - bOrder;
            })
            .forEach(item => {
                const ctor = item.ctor;
                const name = item.name;
                if (options[name] && isFunction(ctor)) {
                    this.plugins[name] = new ctor(this)
                }
            })
    }
}