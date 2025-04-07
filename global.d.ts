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

type ColorPickerOptions = WrapperType | OptionType;
interface HsbType {
  a?: number;
  h: number;
  s: number;
  b: number;
}

interface HSVAColor {
  h: number;
  s: number;
  v: number;
  a: number;
}
interface HSLAColor {
  h: number;
  s: number;
  l: number;
  a: number;
}
