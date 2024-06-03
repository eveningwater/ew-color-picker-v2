export interface SizeType {
  width: string | number;
  height: string | number;
}
export type QueryElement = HTMLElement | Document;
export type EventElement = QueryElement | Element | Window;
export type WrapperType = string | HTMLElement;
export type OptionType = {
  el: WrapperType;
  alpha?: boolean;
  hue?: boolean;
  size?: string | Partial<SizeType>;
  predefineColor?: string[];
  disabled?: boolean;
  defaultColor?: string;
  openPickerAni?: string;
  sure?: Function;
  clear?: Function;
  isLog?: boolean;
  togglePicker?: Function;
};
export interface HsbType {
  a?: number;
  h: number;
  s: number;
  b: number;
}

export interface UtilType {
  $$: (selector: string, el: QueryElement) => NodeList;
  $: (selector: string, el: QueryElement) => HTMLElement | null;
  getStyle: (el: HTMLElement | Element, prop: string) => CSSStyleDeclaration;
  deepCloneObjByRecursion: <T>(obj: object | T[]) => {} | undefined;
  deepCloneObjByJSON: <T extends {}>(obj: T) => T;
  ewObjToArray: <T extends {}>(v: T) => any[] | T;
  isDom: (el: HTMLElement | Element) => boolean;
  getAttr: (el: HTMLElement, key: string) => string | null;
  setSingleAttr: (el: HTMLElement, key: string, value: string) => void;
  setAttr: <T extends string>(
    el: HTMLElement,
    values: Record<string, T>
  ) => void;
  setStyle: (
    el: HTMLElement,
    style: CSSStyleDeclaration
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
    useCapture: boolean
  ) => void;
  off: (
    element: EventElement,
    type: string,
    handler: EventListenerOrEventListenerObject,
    useCapture: boolean
  ) => void;
  ewWarn: (v: string) => void;
  ewError: (v: string) => void;
  ewLog: (v: string) => void;
}
