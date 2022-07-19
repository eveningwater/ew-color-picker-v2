export interface ErrorType {
    PICKER_OBJECT_CONFIG_ERROR:string;
    PICKER_CONFIG_ERROR:string;
    DOM_OBJECT_ERROR:string;
    DOM_ERROR:string;
    CONFIG_SIZE_ERROR:string;
    DOM_NOT_ERROR:string;
    PREDEFINE_COLOR_ERROR:string;
    CONSTRUCTOR_ERROR:string;
    DEFAULT_COLOR_ERROR:string
}
export interface SizeType {
  width: string | number;
  height: string | number;
}
export type WrapperType = string | HTMLElement | Element;
export type OptionType = {
  el: WrapperType;
  alpha?: boolean;
  hue?: boolean;
  size?:string | Partial<SizeType>;
  predefineColor?: string[];
  disabled?: boolean;
  defaultColor?: string;
  openPickerAni?: string;
  sure?: Function;
  clear?: Function;
  isLog?: boolean;
  togglePicker?: Function;
};
export type UtilType = Record<string,Function>
export interface InstanceType {
  prototype:Record<string,unknown>
}
export interface HsbType {
  a?:number;
  h:number;
  s:number;
  b:number;
}