import { isNull, ApplyOrder } from '@ew-color-picker/utils';
export interface ewColorPickerPlugin {
    pluginName: string;
    applyOrder?: ApplyOrder
    new(instance: ewColorPicker): any
}
export class ewColorPicker {
    static plugins: ewColorPickerPlugin[];
    static use(ctor: ewColorPickerPlugin) {
        const name = ctor.pluginName
        const installed = ewColorPicker.plugins.some(
            plugin => ctor === plugin.ctor
        )
        if (installed) return ewColorPicker
        if (util.isUndefined(name) || util.isNull(name)) {
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