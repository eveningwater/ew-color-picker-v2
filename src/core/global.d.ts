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

interface ewColorPickerStaticMethod<T = {}, U> {
  util: Partial<T>;
  createColorPicker: (v?: ColorPickerOptions) => InstanceType<U>;
  destroy: (v?: InstanceType<U> | InstanceType<U>[]) => void;
}
