import util from "./type";
import { supportsPassive } from "./env";
import { extend } from "./base";
import { eventType } from "./const";

export type SafeCSSStyleDeclaration = {
    [key: string]: string
} & CSSStyleDeclaration

export const create = (tag: string) => document.createElement(tag);
export const createByTemplate = (temp: string) => {
    const element = create("div");
    element.innerHTML = temp;
    return element.firstElementChild as HTMLElement;
};
export const hasClass = (el: HTMLElement, className: string) => {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}

export const addClass = (el: HTMLElement, className: string) => {
    if (hasClass(el, className)) {
        return
    }

    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}

export const removeClass = (el: HTMLElement, className: string) => {
    if (!hasClass(el, className)) {
        return
    }

    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g')
    el.className = el.className.replace(reg, ' ')
}

export const isDom = <T extends HTMLElement>(el: T) =>
    util.isShallowObject(HTMLElement)
        ? el instanceof HTMLElement
        : (el &&
            util.isShallowObject(el) &&
            el.nodeType === 1 &&
            util.isString(el.nodeName)) ||
        el instanceof HTMLCollection ||
        el instanceof NodeList;

export const setStyle = (el: HTMLElement, style: Partial<SafeCSSStyleDeclaration> = {}) => extend(el.style, style as SafeCSSStyleDeclaration);
export const removeStyle = (el: HTMLElement, props: string[] = []) => {
    for (const item of props) {
        el.style.removeProperty(item);
    }
};
export const camelCase = <T extends string>(name: T) => name.replace(/([\:\_\-]+(.))/g, (_, separator, letter, offset) => offset ? letter.toUpperCase() : letter).replace(/^moz([A-Z])/, "Moz$1");
export const getStyle = (el: HTMLElement, styleName: keyof CSSStyleDeclaration, pseudoElt?: string) => {
    if (!el || !styleName) return null;
    styleName = camelCase(styleName as string) as keyof CSSStyleDeclaration;
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        const computed = document.defaultView ? document.defaultView.getComputedStyle(el, pseudoElt) : window.getComputedStyle(el, pseudoElt);
        return el.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
        return el.style[styleName];
    }
}
// export const getStyle = (el: HTMLElement, prop: keyof CSSStyleDeclaration, pseudoElt?: string) => window.getComputedStyle(el, pseudoElt)[prop];
export const setAttr = <T extends string>(el: HTMLElement, values: Record<string, T>) => {
    if (!util.isShallowObject(values)) {
        return;
    }
    for (const [key, value] of Object.entries(values)) {
        el.setAttribute(key, `${value}`);
    }
}
export const getAttr = (el: HTMLElement, key: string) => el.getAttribute(key);
export const $ = (selector: string, el: HTMLElement | Document = document) => el.querySelector(selector);
export const $$ = (selector: string, el: HTMLElement | Document = document) => el.querySelectorAll(selector);
export const removeElement = (el: HTMLElement) => {
    if (el?.parentElement) {
        el?.parentElement?.removeChild(el);
    } else {
        el?.remove();
    }
}
export const insertNode = (el: HTMLElement, node: Node, oldNode: Node) => {
    if (oldNode && el?.contains(oldNode)) {
        el.replaceChild(node, oldNode);
    } else {
        el?.appendChild(node);
    }
}
export const checkContainer = (el: HTMLElement | string) => {
    if (isDom<HTMLElement>(el as HTMLElement)) {
        return el as HTMLElement;
    } else if (util.isString(el)) {
        const ele = $(el as string);
        if (ele) {
            return ele as HTMLElement;
        }
    }
    return document.body;
}

export function getClientSize(el: HTMLElement) {
    return {
        width: el.clientWidth,
        height: el.clientHeight,
    }
}

export const getRect = (el: HTMLElement) => el.getBoundingClientRect();

export const getOffset = (el: HTMLElement | null) => {
    let left = 0
    let top = 0

    while (el) {
        left -= el.offsetLeft
        top -= el.offsetTop
        el = el.offsetParent as HTMLElement
    }

    return {
        left,
        top,
    }
}

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
        : !!capture
    el.addEventListener(type, fn, useCapture)
}

export const off = (
    el: HTMLElement | Document | Window,
    type: string,
    fn: EventListenerOrEventListenerObject,
    capture?: EventListenerOptions
) => {
    el.removeEventListener(type, fn, {
        capture: !!capture,
    })
}

export const clickOutSide = (element: HTMLElement, isUnbind = true, callback: (r: DOMRect) => void) => {
    const mouseHandler = (event: Event) => {
        const rect = getRect(element);
        const target = event.target as HTMLElement;
        if (!target) return;
        const targetRect = getRect(target);
        if (targetRect.x >= rect.x && targetRect.y >= rect.y && targetRect.width <= rect.width && targetRect.height <= rect.height) return;
        if (util.isFunction(callback)) callback(targetRect);
        if (isUnbind) {
            // 延迟解除绑定
            setTimeout(() => {
                off(document, eventType[0], mouseHandler);
            }, 0);
        }
    }
    on(document, eventType[0], mouseHandler);
}

declare global {
    interface Window {
        // jQuery对象
        jQuery: any;
    }
}
export const isJQDom = <T>(dom: T) => !util.isUndefined(window.jQuery) && dom instanceof window.jQuery;