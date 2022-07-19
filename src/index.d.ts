
import { WrapperType,OptionType } from './type/type';
declare namespace ewColorPicker {
    export interface ewColorPickerInstance {
        readonly $Dom: Record<string,WrapperType>
        readonly config: Record<string,string | Function>
        readonly private: Record<string, string | Function>
        updateColor(color: string):void
    }
}