import { isShallowObject, isString, tryErrorHandler } from "./type";
import { supportsPassive } from "./env";
import { extend } from "./base";
import { warn } from "./assert";

export type SafeCSSStyleDeclaration = {
  [key: string]: string;
} & CSSStyleDeclaration;

export const create = <T extends HTMLElement>(tag: string) => document.createElement(tag) as T;
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
  // 支持多个类名，用空格分隔
  const classNames = className.trim().split(/\s+/);
  
  for (const cls of classNames) {
    if (cls && !hasClass(el, cls)) {
      let newClass = el.className.split(" ").filter(Boolean);
      newClass.push(cls);
      el.className = newClass.join(" ");
    }
  }
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
  style: Partial<SafeCSSStyleDeclaration> | string | Array<{ prop: string; value: string }> = {},
  value?: string | number
) => {
  if (typeof style === 'string' && value !== undefined) {
    // 兼容 setCss 的用法：setStyle(element, 'left', '10px')
    const property = style;
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    el.style[property as any] = finalValue;
  } else if (Array.isArray(style)) {
    // 兼容 setSomeCss 的用法：setStyle(element, [{ prop: 'left', value: '10px' }, { prop: 'top', value: '20px' }])
    style.forEach(({ prop, value }) => {
      el.style[prop as any] = value;
    });
  } else {
    // 原有的用法：setStyle(element, { left: '10px', top: '20px' })
    extend(el.style, style as SafeCSSStyleDeclaration);
  }
};
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
  let result = null;
  tryErrorHandler(() => {
    const computed = document.defaultView
      ? document.defaultView.getComputedStyle(el, pseudoElt)
      : window.getComputedStyle(el, pseudoElt);
    result = el.style[styleName] || computed ? computed[styleName] : null;
  });
  return result || el.style[styleName];
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
  if (isString(el)) {
    const element = $(el);
    if (!element) {
      warn(`[ewColorPicker warning]: Cannot find element with selector: ${el}`);
      return document.body;
    }
    return element as HTMLElement;
  }
  return el;
};

export const removeNode = (el: HTMLElement) => {
  if (el?.parentElement) {
    el?.parentElement?.removeChild(el);
  } else {
    el?.remove();
  }
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

// 这些函数已经在base.ts中定义，这里只是重新导出
export { isString, isFunction, isUndefined, isNull, isDeepArray, isDeepObject, isPromise, removeAllSpace, throwError } from './base';
