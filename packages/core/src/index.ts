import { isNull, ApplyOrder, warn, isUndefined } from '@ew-color-picker/utils';
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
export class ewColorPicker {
    static plugins: ewColorPickerPlugin[];
    static pluginsMap: Record<string, boolean> = {};
    static use(ctor: ewColorPickerPluginCtor) {
        const name = ctor.pluginName
        const installed = ewColorPicker.plugins.some(
            plugin => ctor === plugin.ctor
        )
        if (installed) return ewColorPicker
        if (isUndefined(name) || isNull(name)) {
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
    constructor() {

    }
}