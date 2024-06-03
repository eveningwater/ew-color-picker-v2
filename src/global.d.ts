declare const __DEV__: boolean;
interface SizeType {
  width: string | number;
  height: string | number;
}
type QueryElement = HTMLElement | Document;
type EventElement = QueryElement | Element | Window;
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

interface UtilType {
  checkContainer: (el?: WrapperType) => HTMLElement;
  $$: (selector: string, el?: QueryElement) => NodeList;
  $: (selector: string, el?: QueryElement) => HTMLElement | null;
  getStyle: (
    el: HTMLElement | Element,
    prop: string
  ) => CSSStyleDeclaration[keyof CSSStyleDeclaration];
  deepCloneObjByRecursion: <T>(obj: object | T[]) => {} | undefined;
  deepCloneObjByJSON: <T extends {}>(obj: T) => T;
  ewObjToArray: <T extends {}>(v: T) => any[] | T;
  isDom: <T extends HTMLElement>(el?: T) => boolean;
  getAttr: (el: HTMLElement, key: string) => string | null;
  setSingleAttr: (el: HTMLElement, key: string, value: string) => void;
  setAttr: <T extends string>(
    el: HTMLElement,
    values: Record<string, T>
  ) => void;
  setStyle: (
    el: HTMLElement,
    style: Partial<CSSStyleDeclaration>
  ) => CSSStyleDeclaration;
  removeClass: (el: HTMLElement | Element, className: string) => void;
  addClass: (el: HTMLElement | Element, className: string) => void;
  createByTemplate: (temp: string) => HTMLElement;
  create: (tag: string) => HTMLElement;
  ewAssign: <T extends {}, U>(target: T, source: U) => T & U;
  isShallowObject: <T>(value: T) => boolean;
  isNull: <T>(value: T) => boolean;
  isNumber: <T>(v: T) => boolean;
  isString: <T>(v: T) => boolean;
  isFunction: <T>(v: T) => boolean;
  isUndefined: <T>(v: T) => boolean;
  isDeepObject: <T>(v: T) => boolean;
  isDeepArray: <T>(v: T) => boolean;
  isDeepRegExp: <T>(v: T) => boolean;
  on: (
    element: EventElement,
    type: string,
    handler: EventListenerOrEventListenerObject,
    useCapture?: boolean
  ) => void;
  off: (
    element: EventElement,
    type: string,
    handler: EventListenerOrEventListenerObject,
    useCapture?: boolean
  ) => void;
  ewWarn: (...v: string[]) => void;
  ewError: (...v: string[]) => void;
  ewLog: (...v: string[]) => void;
}
