type QueryElement = HTMLElement | Document;
type EventElement = QueryElement | Element | Window;
type WrapperType = string | HTMLElement;
export interface UtilType {
  insertNode: (el: HTMLElement, node: Node, oldNode: Node) => void;
  removeStyle: (el: HTMLElement, props: string[]) => void;
  removeElement: (el: HTMLElement) => void;
  checkContainer: (el?: WrapperType) => HTMLElement;
  $$: (selector: string, el?: QueryElement) => NodeList;
  $: (selector: string, el?: QueryElement) => HTMLElement | null;
  getStyle: (
    el: HTMLElement | Element,
    prop: string
  ) => CSSStyleDeclaration[keyof CSSStyleDeclaration];
  deepCloneObjByRecursion: <T>(obj: object | T[]) => {} | undefined;
  deepCloneObjByJSON: <T extends {}>(obj: T) => T;
  ewToArray: <T extends {}>(v: T) => any[] | T;
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

declare const util: UtilType;

export default util;

export {};
