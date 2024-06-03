declare const __DEV__: boolean;
interface SizeType {
  width: string | number;
  height: string | number;
}
type WrapperType = string | HTMLElement;
type OptionType = {
  el: WrapperType;
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
interface HsbType {
  a?: number;
  h: number;
  s: number;
  b: number;
}
