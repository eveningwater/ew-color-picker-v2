import util from ".";
import { extend } from "./base";

export type safeCSSStyleDeclaration = {
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

export const setStyle = (el: HTMLElement, style: Partial<safeCSSStyleDeclaration> = {}) => extend(el.style, style as safeCSSStyleDeclaration);
export const removeStyle = (el: HTMLElement, props: string[] = []) => {
    for (const item of props) {
        el.style.removeProperty(item);
    }
};
export const getStyle = (el: HTMLElement, prop: keyof CSSStyleDeclaration, pseudoElt?: string) => window.getComputedStyle(el, pseudoElt)[prop];
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