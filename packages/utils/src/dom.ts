import { isShallowObject, isString, isFunction, isUndefined } from "./type";
import { supportsPassive } from "./env";
import { extend } from "./base";
import { eventType } from "./const";
import { warn } from "./assert";

export type SafeCSSStyleDeclaration = {
  [key: string]: string;
} & CSSStyleDeclaration;

export const create = (tag: string) => document.createElement(tag);
export const createByTemplate = (temp: string) =>
  document
    .createRange()
    .createContextualFragment(
      temp
    );
export const hasClass = (el: HTMLElement, className: string) => {
  let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
  return reg.test(el.className);
};

export const addClass = (el: HTMLElement, className: string) => {
  if (hasClass(el, className)) {
    return;
  }

  let newClass = el.className.split(" ");
  newClass.push(className);
  el.className = newClass.join(" ");
};

export const removeClass = (el: HTMLElement, className: string) => {
  if (!hasClass(el, className)) {
    return;
  }

  let reg = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
  el.className = el.className.replace(reg, " ");
};

export const isDom = <T extends HTMLElement>(el: T) =>
  isShallowObject(HTMLElement)
    ? el instanceof HTMLElement
    : (el &&
      isShallowObject(el) &&
      el.nodeType === 1 &&
      isString(el.nodeName)) ||
    el instanceof HTMLCollection ||
    el instanceof NodeList;

export const setStyle = (
  el: HTMLElement,
  style: Partial<SafeCSSStyleDeclaration> = {}
) => extend(el.style, style as SafeCSSStyleDeclaration);
export const removeStyle = (el: HTMLElement, props: string[] = []) => {
  for (const item of props) {
    el.style.removeProperty(item);
  }
};
export const camelCase = <T extends string>(name: T) =>
  name
    .replace(/([\:\_\-]+(.))/g, (_, separator, letter, offset) =>
      offset ? letter.toUpperCase() : letter
    )
    .replace(/^moz([A-Z])/, "Moz$1");
export const getStyle = (
  el: HTMLElement,
  styleName: keyof CSSStyleDeclaration,
  pseudoElt?: string
) => {
  if (!el || !styleName) return null;
  styleName = camelCase(styleName as string) as keyof CSSStyleDeclaration;
  if (styleName === "float") {
    styleName = "cssFloat";
  }
  try {
    const computed = document.defaultView
      ? document.defaultView.getComputedStyle(el, pseudoElt)
      : window.getComputedStyle(el, pseudoElt);
    return el.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return el.style[styleName];
  }
};
// export const getStyle = (el: HTMLElement, prop: keyof CSSStyleDeclaration, pseudoElt?: string) => window.getComputedStyle(el, pseudoElt)[prop];
export const setAttr = <T>(el: HTMLElement, values: Record<string, T>) => {
  if (!isShallowObject(values)) {
    return;
  }
  for (const [key, value] of Object.entries(values)) {
    el.setAttribute(key, `${value}`);
  }
};
export const getAttr = (el: HTMLElement, key: string) => el.getAttribute(key);
export const $ = <T extends HTMLElement>(selector: string, el: HTMLElement | Document = document) =>
  el.querySelector<T>(selector);
export const $$ = <T extends HTMLElement>(selector: string, el: HTMLElement | Document = document) =>
  el.querySelectorAll<T>(selector);
export const removeElement = (el: HTMLElement) => {
  if (el?.parentElement) {
    el?.parentElement?.removeChild(el);
  } else {
    el?.remove();
  }
};
export const insertNode = (el: HTMLElement, node: Node, oldNode?: Node | null) => {
  if (oldNode && el?.contains(oldNode)) {
    el.replaceChild(node, oldNode);
  } else {
    el?.appendChild(node);
  }
};
export const checkContainer = (el: string | HTMLElement): HTMLElement => {
  if (typeof el === 'string') {
    const element = document.querySelector(el);
    if (!element) {
      warn(`[ewColorPicker warning]: Cannot find element with selector: ${el}`);
      return document.body;
    }
    return element as HTMLElement;
  }
  return el;
};

export function getClientSize(el: HTMLElement) {
  return {
    width: el.clientWidth,
    height: el.clientHeight,
  };
}

export const getRect = (el: HTMLElement) => el.getBoundingClientRect();

export const getOffset = (el: HTMLElement | null) => {
  let left = 0;
  let top = 0;

  while (el) {
    left -= el.offsetLeft;
    top -= el.offsetTop;
    el = el.offsetParent as HTMLElement;
  }

  return {
    left,
    top,
  };
};

export const on = (
  el: HTMLElement | Document | Window,
  type: string,
  fn: EventListenerOrEventListenerObject,
  capture?: AddEventListenerOptions
) => {
  const useCapture = supportsPassive
    ? {
      passive: false,
      capture: !!capture,
    }
    : !!capture;
  el.addEventListener(type, fn, useCapture);
};

export const off = (
  el: HTMLElement | Document | Window,
  type: string,
  fn: EventListenerOrEventListenerObject,
  capture?: EventListenerOptions
) => {
  el.removeEventListener(type, fn, {
    capture: !!capture,
  });
};

export const clickOutSide = (
  element: HTMLElement,
  isUnbind = true,
  callback: (r: DOMRect) => void
) => {
  const mouseHandler = (event: Event) => {
    const rect = getRect(element);
    const target = event.target as HTMLElement;
    if (!target) return;
    const targetRect = getRect(target);
    if (
      targetRect.x >= rect.x &&
      targetRect.y >= rect.y &&
      targetRect.width <= rect.width &&
      targetRect.height <= rect.height
    )
      return;
    if (isFunction(callback)) callback(targetRect);
    if (isUnbind) {
      // 延迟解除绑定
      setTimeout(() => {
        off(document, eventType[0], mouseHandler);
      }, 0);
    }
  };
  on(document, eventType[0], mouseHandler);
};

declare global {
  interface Window {
    // jQuery对象
    jQuery: any;
  }
}
export const isJQDom = <T>(dom: T) =>
  !isUndefined(window.jQuery) && dom instanceof window.jQuery;

export function getELByClass(element: HTMLElement, className: string, all?: boolean): HTMLElement | HTMLElement[] | null {
  if (all) {
    return Array.from(element.getElementsByClassName(className)) as HTMLElement[];
  }
  return element.querySelector(`.${className}`) as HTMLElement;
}

export function setCss(element: HTMLElement, property: string, value: string | number): void {
  element.style[property as any] = typeof value === 'number' ? `${value}px` : value;
}

export function setSomeCss(element: HTMLElement, styles: Array<{ prop: string; value: string }>): void {
  styles.forEach(({ prop, value }) => {
    element.style[prop as any] = value;
  });
}

export function getCss(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

export function classnames(classObject: Record<string, boolean>): string {
  return Object.keys(classObject)
    .filter(key => classObject[key])
    .join(' ');
}



export function removeClickOutSide(context: any): void {
  if (context._clickOutsideHandler) {
    document.removeEventListener('click', context._clickOutsideHandler);
    context._clickOutsideHandler = null;
  }
}

export function ewObjToArray(obj: any): any[] {
  if (Array.isArray(obj)) {
    return obj;
  }
  if (obj && typeof obj === 'object') {
    return Array.from(obj);
  }
  return [];
}

// 这些函数已经在base.ts中定义，这里只是重新导出
export { isString, isFunction, isUndefined, isNull, isDeepArray, isDeepObject, isPromise, ewAssign, removeAllSpace, ewError } from './base';
